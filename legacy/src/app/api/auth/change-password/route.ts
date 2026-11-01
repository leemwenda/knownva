import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser, hashPassword, verifyPassword } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);
    }

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return jsonError("Your current password is incorrect", 401);

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));
    await logAudit(user.id, "user.password_changed", "user", user.id);

    return jsonOk({ changed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
