import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, reports } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  status: z.enum(["under_review", "dismissed", "resolved"]),
  resolutionNote: z.string().max(2000).optional(),
  removeResource: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["superadmin"]);
    const { id: idParam } = await params;
    const id = Number(idParam);

    const rows = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
    const report = rows[0];
    if (!report) return jsonError("Report not found", 404);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);
    }

    const [updated] = await db
      .update(reports)
      .set({
        status: parsed.data.status,
        resolutionNote: parsed.data.resolutionNote,
        resolvedBy: admin.id,
        resolvedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();

    if (parsed.data.removeResource) {
      await db
        .update(notes)
        .set({ status: "removed", reviewedBy: admin.id, reviewedAt: new Date(), updatedAt: new Date() })
        .where(eq(notes.id, report.noteId));
    }

    await logAudit(admin.id, "report.resolved", "report", id, {
      status: parsed.data.status,
      removedResource: Boolean(parsed.data.removeResource),
    });

    return jsonOk({ report: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
