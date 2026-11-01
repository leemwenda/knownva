import { NextRequest } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { hashPassword, createSession, attachSessionCookie, sanitizeUser } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { sendMail, verificationEmail } from "@/lib/mailer";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "lecturer"]).default("student"),
  institution: z.string().trim().max(200).optional(),
  fieldOfStudy: z.string().trim().max(150).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);
    }
    const { name, email, password, role, institution, fieldOfStudy } = parsed.data;

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return jsonError("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = nanoid(40);

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role,
        institution,
        fieldOfStudy,
        emailVerified: false,
        verificationToken,
      })
      .returning();

    await db.insert(subscriptions).values({ userId: created.id, plan: "free", status: "active" });

    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const link = `${origin}/verify-email?token=${verificationToken}`;
    const mail = verificationEmail(name, link);
    await sendMail({ to: email, subject: mail.subject, html: mail.html });

    await logAudit(created.id, "user.registered", "user", created.id, { role });

    const { token, expiresAt } = await createSession(created.id);
    const res = jsonOk({ user: sanitizeUser(created) }, 201);
    attachSessionCookie(res, token, expiresAt);
    return res;
  } catch (error) {
    return handleApiError(error);
  }
}
