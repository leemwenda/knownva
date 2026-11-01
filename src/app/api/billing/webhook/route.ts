import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "@/db";
import { paymentEvents, subscriptions } from "@/db/schema";
import { getStripeClient } from "@/lib/stripe";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return Response.json({ ok: false, error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing stripe-signature header");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return Response.json(
      { ok: false, error: `Invalid webhook signature: ${(error as Error).message}` },
      { status: 400 },
    );
  }

  // Idempotency: ignore events we have already processed.
  const existing = await db
    .select()
    .from(paymentEvents)
    .where(eq(paymentEvents.stripeEventId, event.id))
    .limit(1);
  if (existing[0]) {
    return Response.json({ ok: true, deduped: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = Number(session.metadata?.userId);
        if (userId) {
          const periodEnd = new Date();
          periodEnd.setDate(periodEnd.getDate() + 30);
          const existingSub = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId))
            .limit(1);
          if (existingSub[0]) {
            await db
              .update(subscriptions)
              .set({
                plan: "premium",
                status: "active",
                stripeCustomerId: String(session.customer || ""),
                stripeSubscriptionId: String(session.subscription || ""),
                currentPeriodEnd: periodEnd,
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.userId, userId));
          } else {
            await db.insert(subscriptions).values({
              userId,
              plan: "premium",
              status: "active",
              stripeCustomerId: String(session.customer || ""),
              stripeSubscriptionId: String(session.subscription || ""),
              currentPeriodEnd: periodEnd,
            });
          }
          await logAudit(null, "subscription.activated", "user", userId, { eventId: event.id });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = Number(sub.metadata?.userId);
        if (userId) {
          await db
            .update(subscriptions)
            .set({ plan: "free", status: "canceled", updatedAt: new Date() })
            .where(eq(subscriptions.userId, userId));
          await logAudit(null, "subscription.canceled", "user", userId, { eventId: event.id });
        }
        break;
      }
      default:
        break;
    }

    await db.insert(paymentEvents).values({
      stripeEventId: event.id,
      type: event.type,
      status: "processed",
    });

    return Response.json({ ok: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Stripe webhook processing failed", error);
    return Response.json({ ok: false, error: "Webhook processing failed" }, { status: 500 });
  }
}
