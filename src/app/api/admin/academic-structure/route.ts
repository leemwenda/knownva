import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { fields, institutions, levels, notes, units } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    await requireRole(["superadmin"]);

    const [institutionRows, fieldRows, levelRows, unitRows, counts] = await Promise.all([
      db.select().from(institutions).orderBy(institutions.name),
      db.select().from(fields).orderBy(fields.name),
      db.select().from(levels).orderBy(levels.name),
      db
        .select({
          id: units.id,
          name: units.name,
          active: units.active,
          fieldId: units.fieldId,
          levelId: units.levelId,
        })
        .from(units)
        .orderBy(units.name),
      db
        .select({
          institutionId: notes.institutionId,
          fieldId: notes.fieldId,
          levelId: notes.levelId,
          unitId: notes.unitId,
          count: sql<number>`count(*)::int`,
        })
        .from(notes)
        .groupBy(notes.institutionId, notes.fieldId, notes.levelId, notes.unitId),
    ]);

    const referenceCounts = {
      institutions: {} as Record<number, number>,
      fields: {} as Record<number, number>,
      levels: {} as Record<number, number>,
      units: {} as Record<number, number>,
    };
    for (const row of counts) {
      if (row.institutionId) {
        referenceCounts.institutions[row.institutionId] = (referenceCounts.institutions[row.institutionId] ?? 0) + row.count;
      }
      if (row.fieldId) {
        referenceCounts.fields[row.fieldId] = (referenceCounts.fields[row.fieldId] ?? 0) + row.count;
      }
      if (row.levelId) {
        referenceCounts.levels[row.levelId] = (referenceCounts.levels[row.levelId] ?? 0) + row.count;
      }
      if (row.unitId) {
        referenceCounts.units[row.unitId] = (referenceCounts.units[row.unitId] ?? 0) + row.count;
      }
    }

    void eq;

    return jsonOk({
      institutions: institutionRows.map((r) => ({ ...r, refCount: referenceCounts.institutions[r.id] ?? 0 })),
      fields: fieldRows.map((r) => ({ ...r, refCount: referenceCounts.fields[r.id] ?? 0 })),
      levels: levelRows.map((r) => ({ ...r, refCount: referenceCounts.levels[r.id] ?? 0 })),
      units: unitRows.map((r) => ({ ...r, refCount: referenceCounts.units[r.id] ?? 0 })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
