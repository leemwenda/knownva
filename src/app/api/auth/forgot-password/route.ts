import { NextRequest } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { sendMail, passwordResetEmail } from "@/lib/mailer";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Enter a valid email address", 422);
    }
    const { email } = parsed.data;

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];

    // Always respond with success to avoid leaking account existence.
    if (user) {
      const resetToken = nanoid(40);
      const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);
      await db
        .update(users)
        .set({ resetToken, resetTokenExpiry, updatedAt: new Date() })
        .where(eq(users.id, user.id));

      const origin = request.headers.get("origin") || request.nextUrl.origin;
      const link = `${origin}/reset-password?token=${resetToken}`;
      const mail = passwordResetEmail(user.name, link);
      await sendMail({ to: email, subject: mail.subject, html: mail.html });
    }

    return jsonOk({ message: "If an account exists for that email, a reset link has been sent." });
  } catch (error) {
    return handleApiError(error);
  }
}
