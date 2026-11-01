import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendMail({ to, subject, html }: MailOptions): Promise<{ delivered: boolean }> {
  if (!isSmtpConfigured()) {
    // eslint-disable-next-line no-console
    console.log(
      `\n[KnowVa Mailer] SMTP not configured — logging email instead of sending.\nTo: ${to}\nSubject: ${subject}\n${html}\n`,
    );
    return { delivered: false };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return { delivered: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[KnowVa Mailer] Failed to send email, logging instead:", error);
    console.log(`To: ${to}\nSubject: ${subject}\n${html}`);
    return { delivered: false };
  }
}

export function verificationEmail(name: string, link: string) {
  return {
    subject: "Verify your KnowVa account",
    html: `<p>Hi ${name},</p><p>Welcome to KnowVa. Please verify your email by clicking the link below:</p><p><a href="${link}">${link}</a></p><p>This link expires once used.</p>`,
  };
}

export function passwordResetEmail(name: string, link: string) {
  return {
    subject: "Reset your KnowVa password",
    html: `<p>Hi ${name},</p><p>We received a request to reset your KnowVa password. Click the link below to choose a new password:</p><p><a href="${link}">${link}</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
  };
}

export function moderationEmail(name: string, title: string, approved: boolean, reason?: string) {
  return {
    subject: approved ? `Your resource "${title}" was approved` : `Your resource "${title}" needs changes`,
    html: approved
      ? `<p>Hi ${name},</p><p>Great news — your resource "${title}" has been approved and is now live on KnowVa.</p>`
      : `<p>Hi ${name},</p><p>Your resource "${title}" was not approved.</p><p><strong>Reason:</strong> ${reason || "Not specified"}</p>`,
  };
}
