import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { downloads, notes } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const rows = await db
      .select({
        downloadedAt: downloads.createdAt,
        note: notes,
      })
      .from(downloads)
      .innerJoin(notes, eq(downloads.noteId, notes.id))
      .where(eq(downloads.userId, user.id))
      .orderBy(desc(downloads.createdAt))
      .limit(100);

    return jsonOk({ items: rows });
  } catch (error) {
    return handleApiError(error);
  }
}
