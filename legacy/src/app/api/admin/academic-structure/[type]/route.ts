import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { fields, institutions, levels, units } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const TABLES = { institutions, fields, levels, units } as const;
type StructureType = keyof typeof TABLES;

const SINGULAR: Record<StructureType, string> = {
  institutions: "institution",
  fields: "field of study",
  levels: "academic level",
  units: "unit",
};

function isValidType(type: string): type is StructureType {
  return type in TABLES;
}

const baseSchema = z.object({ name: z.string().trim().min(2).max(200) });
const unitSchema = baseSchema.extend({
  fieldId: z.number().int().optional().nullable(),
  levelId: z.number().int().optional().nullable(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  try {
    const admin = await requireRole(["superadmin"]);
    const { type } = await params;
    if (!isValidType(type)) return jsonError("Unknown academic structure type", 400);

    const body = await request.json();

    if (type === "units") {
      const parsed = unitSchema.safeParse(body);
      if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);
      const duplicateUnit = await db
        .select({ id: units.id })
        .from(units)
        .where(eq(units.name, parsed.data.name))
        .limit(1);
      if (duplicateUnit[0]) {
        return jsonError(`A unit with the name "${parsed.data.name}" already exists`, 409);
      }
      const [created] = await db
        .insert(units)
        .values({ name: parsed.data.name, fieldId: parsed.data.fieldId, levelId: parsed.data.levelId })
        .returning();
      await logAudit(admin.id, "academic_structure.created", "unit", created.id, { name: created.name });
      return jsonOk({ item: created }, 201);
    }

    const parsed = baseSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const table = TABLES[type];
    const duplicate = await db
      .select({ id: table.id })
      .from(table)
      .where(eq(table.name, parsed.data.name))
      .limit(1);
    if (duplicate[0]) {
      return jsonError(`A ${SINGULAR[type]} with the name "${parsed.data.name}" already exists`, 409);
    }

    const [created] = await db.insert(table).values({ name: parsed.data.name }).returning();
    await logAudit(admin.id, "academic_structure.created", type, created.id, { name: created.name });
    return jsonOk({ item: created }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
