import { NextRequest } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { privateNotes } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

const schema = z.object({
  title: z.string().trim().min(1).max(250).optional(),
  content: z.string().max(20000).optional(),
});

async function assertOwnership(id: number, userId: number) {
  const rows = await db
    .select()
    .from(privateNotes)
    .where(and(eq(privateNotes.id, id), eq(privateNotes.userId, userId)))
    .limit(1);
  return rows[0] || null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const existing = await assertOwnership(id, user.id);
    if (!existing) return jsonError("Note not found", 404);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);
    }

    const [updated] = await db
      .update(privateNotes)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(privateNotes.id, id))
      .returning();

    return jsonOk({ note: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const existing = await assertOwnership(id, user.id);
    if (!existing) return jsonError("Note not found", 404);

    await db.delete(privateNotes).where(eq(privateNotes.id, id));
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
