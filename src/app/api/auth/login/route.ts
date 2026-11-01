import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, createSession, attachSessionCookie, sanitizeUser } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);
    }
    const { email, password } = parsed.data;

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user) {
      return jsonError("Invalid email or password", 401);
    }
    if (user.status === "suspended") {
      return jsonError("This account has been suspended. Contact support for help.", 403);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return jsonError("Invalid email or password", 401);
    }

    const { token, expiresAt } = await createSession(user.id);
    await logAudit(user.id, "user.login", "user", user.id);

    const res = jsonOk({ user: sanitizeUser(user) });
    attachSessionCookie(res, token, expiresAt);
    return res;
  } catch (error) {
    return handleApiError(error);
  }
}
