import { NextRequest } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { privateNotes } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(250),
  content: z.string().max(20000).default(""),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const rows = await db
      .select()
      .from(privateNotes)
      .where(eq(privateNotes.userId, user.id))
      .orderBy(desc(privateNotes.updatedAt));

    return jsonOk({ items: rows });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);
    }

    const [created] = await db
      .insert(privateNotes)
      .values({ userId: user.id, title: parsed.data.title, content: parsed.data.content })
      .returning();

    return jsonOk({ note: created }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
