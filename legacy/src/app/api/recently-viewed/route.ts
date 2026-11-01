import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { fields, institutions, levels, notes, recentlyViewed, units } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const rows = await db
      .select({
        noteId: notes.id,
        lastViewedAt: sql<string>`max(${recentlyViewed.viewedAt})`,
        note: notes,
        institutionName: institutions.name,
        fieldName: fields.name,
        levelName: levels.name,
        unitName: units.name,
      })
      .from(recentlyViewed)
      .innerJoin(notes, eq(recentlyViewed.noteId, notes.id))
      .leftJoin(institutions, eq(notes.institutionId, institutions.id))
      .leftJoin(fields, eq(notes.fieldId, fields.id))
      .leftJoin(levels, eq(notes.levelId, levels.id))
      .leftJoin(units, eq(notes.unitId, units.id))
      .where(eq(recentlyViewed.userId, user.id))
      .groupBy(
        notes.id,
        institutions.name,
        fields.name,
        levels.name,
        units.name,
      )
      .orderBy(desc(sql`max(${recentlyViewed.viewedAt})`))
      .limit(30);

    return jsonOk({ items: rows });
  } catch (error) {
    return handleApiError(error);
  }
}
