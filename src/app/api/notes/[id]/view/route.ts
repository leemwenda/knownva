import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { notes, recentlyViewed } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const noteId = Number(idParam);

    const noteRows = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
    if (!noteRows[0]) return jsonError("Resource not found", 404);

    await db
      .update(notes)
      .set({ viewsCount: sql`${notes.viewsCount} + 1` })
      .where(eq(notes.id, noteId));

    const user = await getCurrentUser();
    if (user) {
      await db.insert(recentlyViewed).values({ noteId, userId: user.id });
    }

    return jsonOk({ recorded: true });
  } catch (error) {
    return handleApiError(error);
  }
}
