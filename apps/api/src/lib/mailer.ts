import nodemailer, { type Transporter } from "nodemailer";
import { env, isProd } from "../config/env.js";
import { logger } from "./logger.js";

let transporter: Transporter | null = null;

function smtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface MailResult {
  delivered: boolean;
  reason?: "not_configured" | "send_failed";
}

export async function sendMail(input: MailInput): Promise<MailResult> {
  if (!smtpConfigured()) {
    if (!isProd) {
      logger.warn(
        { to: input.to, subject: input.subject, html: input.html },
        "SMTP not configured — email logged, not delivered",
      );
    } else {
      logger.warn(
        { to: input.to, subject: input.subject },
        "SMTP not configured in production — email NOT delivered",
      );
    }
    return { delivered: false, reason: "not_configured" };
  }

  const attempt = async (): Promise<void> => {
    await getTransporter().sendMail({
      from: env.SMTP_FROM,
      replyTo: env.SMTP_REPLY_TO || undefined,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  };

  try {
    await attempt();
    return { delivered: true };
  } catch (err) {
    logger.warn({ err, to: input.to }, "First email send failed, retrying once");
    try {
      await attempt();
      return { delivered: true };
    } catch (err2) {
      logger.error({ err: err2, to: input.to }, "Email delivery failed after retry");
      return { delivered: false, reason: "send_failed" };
    }
  }
}
