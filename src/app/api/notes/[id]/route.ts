import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { fields, institutions, levels, notes, units, users } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { deleteNoteFile } from "@/lib/storage";
import { logAudit } from "@/lib/audit";
import { sendMail, moderationEmail } from "@/lib/mailer";

async function getNoteOr404(id: number) {
  const rows = await db
    .select({
      note: notes,
      uploaderName: users.name,
      uploaderBio: users.bio,
      uploaderInstitution: users.institution,
      institutionName: institutions.name,
      fieldName: fields.name,
      levelName: levels.name,
      unitName: units.name,
    })
    .from(notes)
    .leftJoin(users, eq(notes.uploaderId, users.id))
    .leftJoin(institutions, eq(notes.institutionId, institutions.id))
    .leftJoin(fields, eq(notes.fieldId, fields.id))
    .leftJoin(levels, eq(notes.levelId, levels.id))
    .leftJoin(units, eq(notes.unitId, units.id))
    .where(eq(notes.id, id))
    .limit(1);
  return rows[0] || null;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const row = await getNoteOr404(id);
    if (!row) return jsonError("Resource not found", 404);

    const user = await getCurrentUser();
    const isOwner = user?.id === row.note.uploaderId;
    const isAdmin = user?.role === "superadmin";

    if (row.note.status !== "approved" && !isOwner && !isAdmin) {
      return jsonError("Resource not found", 404);
    }

    return jsonOk({
      note: {
        ...row.note,
        uploaderName: row.uploaderName,
        uploaderBio: row.uploaderBio,
        uploaderInstitution: row.uploaderInstitution,
        institutionName: row.institutionName,
        fieldName: row.fieldName,
        levelName: row.levelName,
        unitName: row.unitName,
        averageRating:
          row.note.ratingCount > 0 ? Number((row.note.ratingSum / row.note.ratingCount).toFixed(1)) : 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const existingRows = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
    const existing = existingRows[0];
    if (!existing) return jsonError("Resource not found", 404);

    const body = await request.json();
    const isOwner = existing.uploaderId === user.id;
    const isAdmin = user.role === "superadmin";

    if (body.status) {
      if (!isAdmin) throw new HttpError(403, "Only administrators can moderate resources");
      if (!["approved", "rejected", "removed", "pending"].includes(body.status)) {
        return jsonError("Invalid status", 422);
      }
      if (body.status === "rejected" && !body.rejectionReason) {
        return jsonError("A rejection reason is required", 422);
      }
      const [updated] = await db
        .update(notes)
        .set({
          status: body.status,
          rejectionReason: body.status === "rejected" ? body.rejectionReason : null,
          reviewedBy: user.id,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(notes.id, id))
        .returning();
      await logAudit(user.id, `note.${body.status}`, "note", id, { reason: body.rejectionReason });

      // Notify the uploader about the moderation outcome (logged when SMTP is off).
      const uploaderRows = await db.select().from(users).where(eq(users.id, existing.uploaderId)).limit(1);
      const uploader = uploaderRows[0];
      if (uploader && (body.status === "approved" || body.status === "rejected")) {
        const mail = moderationEmail(uploader.name, existing.title, body.status === "approved", body.rejectionReason);
        await sendMail({ to: uploader.email, subject: mail.subject, html: mail.html });
      }

      return jsonOk({ note: updated });
    }

    if (!isOwner && !isAdmin) {
      throw new HttpError(403, "You do not have permission to edit this resource");
    }

    const allowedFields = [
      "title",
      "description",
      "institutionId",
      "fieldId",
      "levelId",
      "unitId",
      "semester",
      "academicYear",
      "resourceType",
      "isPremium",
    ] as const;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of allowedFields) {
      if (key in body) updates[key] = body[key];
    }

    // Editing metadata sends a lecturer's own resource back to pending review.
    if (isOwner && !isAdmin && existing.status === "approved") {
      updates.status = "pending";
      updates.reviewedBy = null;
      updates.reviewedAt = null;
    }

    const [updated] = await db.update(notes).set(updates).where(eq(notes.id, id)).returning();
    await logAudit(user.id, "note.updated", "note", id, {});
    return jsonOk({ note: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const existingRows = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
    const existing = existingRows[0];
    if (!existing) return jsonError("Resource not found", 404);

    const isOwner = existing.uploaderId === user.id;
    const isAdmin = user.role === "superadmin";
    if (!isOwner && !isAdmin) {
      throw new HttpError(403, "You do not have permission to delete this resource");
    }

    if (isAdmin && !isOwner) {
      await db
        .update(notes)
        .set({ status: "removed", reviewedBy: user.id, reviewedAt: new Date(), updatedAt: new Date() })
        .where(eq(notes.id, id));
      await logAudit(user.id, "note.removed", "note", id, {});
      return jsonOk({ removed: true });
    }

    await deleteNoteFile(existing.filePath);
    await db.delete(notes).where(eq(notes.id, id));
    await logAudit(user.id, "note.deleted", "note", id, {});
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
