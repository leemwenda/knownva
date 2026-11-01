import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { notes, reviews, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireRole(["lecturer", "superadmin"]);

    const conditions = [eq(notes.uploaderId, user.id), ne(notes.uploaderId, -1)];

    const rows = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        noteId: notes.id,
        noteTitle: notes.title,
        reviewerName: users.name,
      })
      .from(reviews)
      .innerJoin(notes, eq(reviews.noteId, notes.id))
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(reviews.createdAt))
      .limit(200);

    return jsonOk({ items: rows });
  } catch (error) {
    return handleApiError(error);
  }
}
