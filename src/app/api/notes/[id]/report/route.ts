import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, reports } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  reason: z.string().min(2).max(100),
  details: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const noteId = Number(idParam);
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");

    const noteRows = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
    if (!noteRows[0]) return jsonError("Resource not found", 404);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid report", 422);
    }

    const [created] = await db
      .insert(reports)
      .values({ noteId, reporterId: user.id, reason: parsed.data.reason, details: parsed.data.details })
      .returning();

    await logAudit(user.id, "report.submitted", "note", noteId, { reportId: created.id });

    return jsonOk({ report: created }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
