import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks, fields, institutions, levels, notes, units } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const rows = await db
      .select({
        bookmarkId: bookmarks.id,
        bookmarkedAt: bookmarks.createdAt,
        note: notes,
        institutionName: institutions.name,
        fieldName: fields.name,
        levelName: levels.name,
        unitName: units.name,
      })
      .from(bookmarks)
      .innerJoin(notes, eq(bookmarks.noteId, notes.id))
      .leftJoin(institutions, eq(notes.institutionId, institutions.id))
      .leftJoin(fields, eq(notes.fieldId, fields.id))
      .leftJoin(levels, eq(notes.levelId, levels.id))
      .leftJoin(units, eq(notes.unitId, units.id))
      .where(eq(bookmarks.userId, user.id))
      .orderBy(desc(bookmarks.createdAt));

    return jsonOk({ items: rows });
  } catch (error) {
    return handleApiError(error);
  }
}
