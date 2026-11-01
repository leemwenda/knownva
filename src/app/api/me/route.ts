import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser, HttpError, sanitizeUser } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  bio: z.string().max(1500).optional().nullable(),
  institution: z.string().max(200).optional().nullable(),
  fieldOfStudy: z.string().max(150).optional().nullable(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) updates[key] = value;
    }

    const [updated] = await db.update(users).set(updates).where(eq(users.id, user.id)).returning();
    await logAudit(user.id, "user.profile_updated", "user", user.id, {});
    return jsonOk({ user: sanitizeUser(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) throw new HttpError(401, "Authentication required");
    return jsonOk({ user: sanitizeUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
