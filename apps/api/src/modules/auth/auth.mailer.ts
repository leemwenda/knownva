import { env } from "../../config/env.js";
import { sendMail, type MailResult } from "../../lib/mailer.js";

function link(path: string) {
  return `${env.APP_URL.replace(/\/$/, "")}${path}`;
}

function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return s.replace(/[&<>"']/g, (c) => map[c] as string);
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
): Promise<MailResult> {
  const url = link(`/verify-email?token=${encodeURIComponent(token)}`);
  return sendMail({
    to,
    subject: "Verify your KnowVa account",
    html: `<p>Hi ${escapeHtml(name)},</p>
           <p>Welcome to KnowVa. Please verify your email:</p>
           <p><a href="${url}">${url}</a></p>
           <p>If you did not create this account, you can ignore this email.</p>`,
    text: `Verify your KnowVa account: ${url}`,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
): Promise<MailResult> {
  const url = link(`/reset-password?token=${encodeURIComponent(token)}`);
  return sendMail({
    to,
    subject: "Reset your KnowVa password",
    html: `<p>Hi ${escapeHtml(name)},</p>
           <p>We received a request to reset your KnowVa password.</p>
           <p><a href="${url}">${url}</a></p>
           <p>If you did not request this, you can safely ignore this email.</p>`,
    text: `Reset your KnowVa password: ${url}`,
  });
}
