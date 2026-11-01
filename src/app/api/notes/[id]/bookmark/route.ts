import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks, notes } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const noteId = Number(idParam);
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const noteRows = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
    if (!noteRows[0]) return jsonError("Resource not found", 404);

    const existing = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.noteId, noteId), eq(bookmarks.userId, user.id)))
      .limit(1);

    if (existing[0]) {
      return jsonOk({ bookmarked: true, alreadyExisted: true });
    }

    await db.insert(bookmarks).values({ noteId, userId: user.id });
    return jsonOk({ bookmarked: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const noteId = Number(idParam);
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    await db.delete(bookmarks).where(and(eq(bookmarks.noteId, noteId), eq(bookmarks.userId, user.id)));
    return jsonOk({ bookmarked: false });
  } catch (error) {
    return handleApiError(error);
  }
}
