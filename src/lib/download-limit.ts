import { sql } from "drizzle-orm";
import { db } from "@/db";
import { downloads, subscriptions } from "@/db/schema";

export const FREE_MONTHLY_PREMIUM_LIMIT = Number(process.env.FREE_MONTHLY_PREMIUM_DOWNLOADS) || 3;

// Administrators can tune the limit at runtime without a redeploy. The value is
// kept in-process and defaults back to the environment variable after a restart.
let runtimeFreeLimit: number | null = null;

export function getFreeLimit() {
  return runtimeFreeLimit ?? FREE_MONTHLY_PREMIUM_LIMIT;
}

export function setFreeLimit(value: number) {
  runtimeFreeLimit = value;
}

export interface DownloadDecision {
  allowed: boolean;
  isPremiumPlan: boolean;
  used: number;
  limit: number;
  remaining: number;
}

/**
 * Atomically checks and records a download attempt for a (possibly premium) note.
 * Uses a Postgres advisory transaction lock keyed on the user id so concurrent
 * requests from the same user are serialized and cannot exceed the monthly
 * free-tier allowance for premium notes.
 */
export async function recordDownloadAttempt(
  userId: number,
  noteId: number,
  noteIsPremium: boolean,
): Promise<DownloadDecision> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${userId})`);

    const subRows = await tx
      .select()
      .from(subscriptions)
      .where(sql`${subscriptions.userId} = ${userId}`)
      .limit(1);

    const sub = subRows[0];
    const isPremiumPlan = Boolean(
      sub && sub.plan === "premium" && sub.status === "active" &&
        (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date()),
    );

    if (!noteIsPremium || isPremiumPlan) {
      await tx.insert(downloads).values({ userId, noteId, isPremium: noteIsPremium });
      const limit = getFreeLimit();
      return {
        allowed: true,
        isPremiumPlan,
        used: 0,
        limit,
        remaining: isPremiumPlan ? Infinity : limit,
      };
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const countRows = await tx.execute<{ count: number }>(
      sql`select count(*)::int as count from ${downloads}
          where ${downloads.userId} = ${userId}
            and ${downloads.isPremium} = true
            and ${downloads.createdAt} >= ${startOfMonth}`,
    );
    const used = Number(countRows.rows[0]?.count ?? 0);

    const limit = getFreeLimit();
    if (used >= limit) {
      return {
        allowed: false,
        isPremiumPlan,
        used,
        limit,
        remaining: 0,
      };
    }

    await tx.insert(downloads).values({ userId, noteId, isPremium: true });

    return {
      allowed: true,
      isPremiumPlan,
      used: used + 1,
      limit,
      remaining: Math.max(0, limit - (used + 1)),
    };
  });
}

export async function getMonthlyUsage(userId: number) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const countRows = await db.execute<{ count: number }>(
    sql`select count(*)::int as count from ${downloads}
        where ${downloads.userId} = ${userId}
          and ${downloads.isPremium} = true
          and ${downloads.createdAt} >= ${startOfMonth}`,
  );
  const used = Number(countRows.rows[0]?.count ?? 0);
  const limit = getFreeLimit();
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}
