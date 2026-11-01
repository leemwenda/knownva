import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Please sign in to upgrade to premium");

    const stripe = getStripeClient();
    const origin = request.headers.get("origin") || request.nextUrl.origin;

    if (stripe && isStripeConfigured()) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: process.env.STRIPE_PRICE_ID as string, quantity: 1 }],
        customer_email: user.email,
        success_url: `${origin}/student/premium?checkout=success`,
        cancel_url: `${origin}/student/premium?checkout=cancelled`,
        metadata: { userId: String(user.id) },
        subscription_data: { metadata: { userId: String(user.id) } },
      });
      return jsonOk({ url: session.url, mode: "stripe" });
    }

    // Fake instant checkout for local development only. Never allowed in production
    // so that a misconfigured deployment cannot silently grant free premium access.
    if (process.env.NODE_ENV === "production") {
      return jsonError(
        "Payments are not configured on this server. Please contact support.",
        503,
      );
    }

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).limit(1);
    if (existing[0]) {
      await db
        .update(subscriptions)
        .set({ plan: "premium", status: "active", currentPeriodEnd: periodEnd, updatedAt: new Date() })
        .where(eq(subscriptions.userId, user.id));
    } else {
      await db
        .insert(subscriptions)
        .values({ userId: user.id, plan: "premium", status: "active", currentPeriodEnd: periodEnd });
    }

    await logAudit(user.id, "subscription.fake_checkout", "user", user.id, { periodEnd });

    return jsonOk({
      url: `${origin}/student/premium?checkout=success`,
      mode: "dev-fake",
      warning: "Development-only instant checkout used because Stripe keys are not configured.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
