import { NextRequest } from "next/server";
import { z } from "zod";
import { Column, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { fields, institutions, levels, notes, units } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const TABLES = { institutions, fields, levels, units } as const;
type StructureType = keyof typeof TABLES;

const NOTE_COLUMNS: Record<StructureType, Column> = {
  institutions: notes.institutionId,
  fields: notes.fieldId,
  levels: notes.levelId,
  units: notes.unitId,
};

function isValidType(type: string): type is StructureType {
  return type in TABLES;
}

const patchSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  active: z.boolean().optional(),
  fieldId: z.number().int().optional().nullable(),
  levelId: z.number().int().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const admin = await requireRole(["superadmin"]);
    const { type, id: idParam } = await params;
    if (!isValidType(type)) return jsonError("Unknown academic structure type", 400);
    const id = Number(idParam);

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const table = TABLES[type];
    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.active !== undefined) updates.active = parsed.data.active;
    if (type === "units") {
      if (parsed.data.fieldId !== undefined) updates.fieldId = parsed.data.fieldId;
      if (parsed.data.levelId !== undefined) updates.levelId = parsed.data.levelId;
    }

    const [updated] = await db.update(table).set(updates).where(eq(table.id, id)).returning();
    if (!updated) return jsonError("Record not found", 404);

    await logAudit(admin.id, "academic_structure.updated", type, id, updates);
    return jsonOk({ item: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const admin = await requireRole(["superadmin"]);
    const { type, id: idParam } = await params;
    if (!isValidType(type)) return jsonError("Unknown academic structure type", 400);
    const id = Number(idParam);

    const column = NOTE_COLUMNS[type];
    const referenced = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notes)
      .where(eq(column, id));

    if ((referenced[0]?.count ?? 0) > 0) {
      const table = TABLES[type];
      await db.update(table).set({ active: false }).where(eq(table.id, id));
      await logAudit(admin.id, "academic_structure.deactivated", type, id, {});
      return jsonOk({ deactivated: true, reason: "Referenced by existing resources" });
    }

    const table = TABLES[type];
    await db.delete(table).where(eq(table.id, id));
    await logAudit(admin.id, "academic_structure.deleted", type, id, {});
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
