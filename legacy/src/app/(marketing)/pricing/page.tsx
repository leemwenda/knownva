import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { Badge, Card } from "@/components/ui";
import { PricingCta } from "@/components/pricing-cta";

export const dynamic = "force-dynamic";

const PRICE_KES = 300;

export default async function PricingPage() {
  const user = await getCurrentUser();
  let plan: "free" | "premium" = "free";
  if (user) {
    const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).limit(1);
    const sub = rows[0];
    if (sub && sub.plan === "premium" && sub.status === "active") plan = "premium";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge tone="teal" className="mx-auto">Pricing</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Study more, pay fairly
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--foreground)]/60">
          Every account includes unlimited access to free resources. Premium removes the monthly cap on premium
          notes and supports continued moderation on the platform.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Free</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">For everyone, forever</p>
          <p className="mt-5 text-3xl font-semibold text-[var(--foreground)]">
            KSh 0<span className="text-sm font-normal text-[var(--foreground)]/50">/month</span>
          </p>
          <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[var(--foreground)]/70">
            <li>• Unlimited free academic resources</li>
            <li>• 3 premium note downloads per calendar month</li>
            <li>• Bookmarks and recently viewed history</li>
            <li>• Private personal study notes</li>
            <li>• Ability to review and report resources</li>
          </ul>
          <div className="mt-6">
            <PricingCta plan="free" isCurrent={plan === "free"} signedIn={Boolean(user)} />
          </div>
        </Card>

        <Card className="relative flex flex-col border-teal-500/40">
          <span className="absolute right-5 top-5">
            <Badge tone="violet">Most popular</Badge>
          </span>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Premium</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">For heavy revision seasons</p>
          <p className="mt-5 text-3xl font-semibold text-[var(--foreground)]">
            KSh {PRICE_KES}<span className="text-sm font-normal text-[var(--foreground)]/50">/month</span>
          </p>
          <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[var(--foreground)]/70">
            <li>• Unlimited premium note downloads</li>
            <li>• Everything in Free</li>
            <li>• Priority review of your own reports</li>
            <li>• Cancel any time from your premium page</li>
          </ul>
          <div className="mt-6">
            <PricingCta plan="premium" isCurrent={plan === "premium"} signedIn={Boolean(user)} />
          </div>
        </Card>
      </div>

      <div className="mt-10 grid gap-4 text-sm text-[var(--foreground)]/60 md:grid-cols-3">
        <Card>
          <h3 className="font-semibold text-[var(--foreground)]">Download limit details</h3>
          <p className="mt-2">
            The 3-per-month limit applies only to premium resources and resets on the 1st of each month. The limit
            is enforced on the server, so it cannot be bypassed by using a direct download link.
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold text-[var(--foreground)]">Payments</h3>
          <p className="mt-2">
            Checkout runs through Stripe. Subscription state is confirmed by Stripe&apos;s signed webhook on our
            servers — the site never marks a payment as successful based on your browser alone.
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold text-[var(--foreground)]">Questions</h3>
          <p className="mt-2">
            Need an institutional plan for your department?{" "}
            <Link href="/contact" className="text-teal-500 hover:underline">Tell us about your institution</Link> and we
            will help you set up lecturer contributors.
          </p>
        </Card>
      </div>
    </div>
  );
}
