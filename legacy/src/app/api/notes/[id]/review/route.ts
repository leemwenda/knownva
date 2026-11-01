import { NextRequest } from "next/server";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { notes, reviews, users } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const noteId = Number(idParam);
    const rows = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userId: reviews.userId,
        userName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.noteId, noteId))
      .orderBy(reviews.createdAt);
    return jsonOk({ reviews: rows });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const noteId = Number(idParam);
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const noteRows = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
    const note = noteRows[0];
    if (!note) return jsonError("Resource not found", 404);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid review", 422);
    }
    const { rating, comment } = parsed.data;

    const existing = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.noteId, noteId), eq(reviews.userId, user.id)))
      .limit(1);

    await db.transaction(async (tx) => {
      if (existing[0]) {
        const diff = rating - existing[0].rating;
        await tx
          .update(reviews)
          .set({ rating, comment })
          .where(eq(reviews.id, existing[0].id));
        await tx
          .update(notes)
          .set({ ratingSum: sql`${notes.ratingSum} + ${diff}` })
          .where(eq(notes.id, noteId));
      } else {
        await tx.insert(reviews).values({ noteId, userId: user.id, rating, comment });
        await tx
          .update(notes)
          .set({ ratingSum: sql`${notes.ratingSum} + ${rating}`, ratingCount: sql`${notes.ratingCount} + 1` })
          .where(eq(notes.id, noteId));
      }
    });

    return jsonOk({ submitted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
