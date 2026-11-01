import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getFreeLimit, setFreeLimit } from "@/lib/download-limit";

const schema = z.object({
  freeMonthlyPremiumDownloads: z.number().int().min(0).max(50).optional(),
});

function currentSettings() {
  return {
    appName: process.env.APP_NAME || "KnowVa",
    freeMonthlyPremiumDownloads: getFreeLimit(),
    emailConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID),
    stripeWebhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    environment: process.env.NODE_ENV || "development",
  };
}

// Only non-secret, safe-to-display configuration is exposed here.
export async function GET() {
  try {
    await requireRole(["superadmin"]);
    return jsonOk({ settings: currentSettings() });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireRole(["superadmin"]);
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);

    if (parsed.data.freeMonthlyPremiumDownloads !== undefined) {
      setFreeLimit(parsed.data.freeMonthlyPremiumDownloads);
      await logAudit(admin.id, "settings.updated", "platform", undefined, {
        freeMonthlyPremiumDownloads: parsed.data.freeMonthlyPremiumDownloads,
      });
    }

    return jsonOk({ settings: currentSettings() });
  } catch (error) {
    return handleApiError(error);
  }
}
