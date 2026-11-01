import { NextRequest } from "next/server";
import { z } from "zod";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);
    }
    const { token, password } = parsed.data;

    const rows = await db
      .select()
      .from(users)
      .where(and(eq(users.resetToken, token), gt(users.resetTokenExpiry, new Date())))
      .limit(1);
    const user = rows[0];

    if (!user) {
      return jsonError("This reset link is invalid or has expired", 400);
    }

    const passwordHash = await hashPassword(password);
    await db
      .update(users)
      .set({ passwordHash, resetToken: null, resetTokenExpiry: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    await logAudit(user.id, "user.password_reset", "user", user.id);

    return jsonOk({ reset: true });
  } catch (error) {
    return handleApiError(error);
  }
}
