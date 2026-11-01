import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { sendMail, verificationEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    let token = user.verificationToken;
    if (!token) {
      token = nanoid(40);
      await db.update(users).set({ verificationToken: token }).where(eq(users.id, user.id));
    }

    if (user.emailVerified) {
      return jsonOk({ alreadyVerified: true });
    }

    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const link = `${origin}/verify-email?token=${token}`;
    const mail = verificationEmail(user.name, link);
    const result = await sendMail({ to: user.email, subject: mail.subject, html: mail.html });

    return jsonOk({ sent: result.delivered, logged: !result.delivered });
  } catch (error) {
    return handleApiError(error);
  }
}
