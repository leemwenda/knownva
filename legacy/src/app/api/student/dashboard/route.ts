import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bookmarks,
  notes,
  privateNotes,
  recentlyViewed,
  subscriptions,
  users,
} from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { getMonthlyUsage } from "@/lib/download-limit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const [subRows, bookmarkCountRows, privateNoteCountRows, usage] = await Promise.all([
      db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).limit(1),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(bookmarks)
        .where(eq(bookmarks.userId, user.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(privateNotes)
        .where(eq(privateNotes.userId, user.id)),
      getMonthlyUsage(user.id),
    ]);

    const recentViews = await db
      .select({ note: notes, viewedAt: recentlyViewed.viewedAt })
      .from(recentlyViewed)
      .innerJoin(notes, eq(recentlyViewed.noteId, notes.id))
      .where(eq(recentlyViewed.userId, user.id))
      .orderBy(desc(recentlyViewed.viewedAt))
      .limit(5);

    const recentBookmarks = await db
      .select({ note: notes, createdAt: bookmarks.createdAt })
      .from(bookmarks)
      .innerJoin(notes, eq(bookmarks.noteId, notes.id))
      .where(eq(bookmarks.userId, user.id))
      .orderBy(desc(bookmarks.createdAt))
      .limit(5);

    const recommendationConditions = [eq(notes.status, "approved")];
    if (user.fieldOfStudy) {
      // best-effort personalization; falls back to latest approved notes
    }
    const recommended = await db
      .select({ note: notes, uploaderName: users.name })
      .from(notes)
      .leftJoin(users, eq(notes.uploaderId, users.id))
      .where(and(...recommendationConditions))
      .orderBy(desc(notes.downloadsCount), desc(notes.createdAt))
      .limit(6);

    return jsonOk({
      subscription: subRows[0] || null,
      usage,
      counts: {
        bookmarks: bookmarkCountRows[0]?.count ?? 0,
        privateNotes: privateNoteCountRows[0]?.count ?? 0,
      },
      recentViews,
      recentBookmarks,
      recommended,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
