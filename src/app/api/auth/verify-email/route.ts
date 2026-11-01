import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const schema = z.object({ token: z.string().min(10) });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("A valid verification token is required", 422);
    }
    const { token } = parsed.data;

    const rows = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
    const user = rows[0];

    if (!user) {
      return jsonError("This verification link is invalid or has expired", 400);
    }

    // Idempotent on purpose: the verification token is intentionally kept (rather
    // than cleared) so that duplicate client calls — e.g. React effects firing
    // twice, or a user refreshing the confirmation page — do not incorrectly
    // report a valid link as invalid the second time it is submitted.
    if (!user.emailVerified) {
      await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, user.id));
      await logAudit(user.id, "user.email_verified", "user", user.id);
    }

    return jsonOk({ verified: true });
  } catch (error) {
    return handleApiError(error);
  }
}
