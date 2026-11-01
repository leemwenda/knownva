import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";

/**
 * MySQL-safe replacement for the legacy `pg_advisory_xact_lock(userId)`.
 * Uses SELECT ... FOR UPDATE on the user row inside a transaction to
 * serialize concurrent downloads for the same user.
 *
 * Preserves the exact business rule from the original implementation:
 *   - premium notes cost 1 download from the monthly free allowance
 *   - free notes are always allowed (recorded for analytics but not counted)
 *   - active premium subscribers are always allowed
 *   - free-tier allowance is read from FREE_MONTHLY_PREMIUM_DOWNLOADS
 */

const FREE_LIMIT = env.FREE_MONTHLY_PREMIUM_DOWNLOADS;

export interface DownloadDecision {
  allowed: boolean;
  isPremiumPlan: boolean;
  used: number;
  limit: number;
  remaining: number;
}

export async function recordDownloadAttempt(
  userId: number,
  noteId: number,
  noteIsPremium: boolean,
): Promise<DownloadDecision> {
  return prisma.$transaction(
    async (tx) => {
      // Serialize concurrent download attempts for this user
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

      const sub = await tx.subscription.findUnique({ where: { userId } });
      const isPremiumPlan = Boolean(
        sub &&
          sub.plan === "premium" &&
          sub.status === "active" &&
          (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date()),
      );

      // Free notes, or premium user: always allowed
      if (!noteIsPremium || isPremiumPlan) {
        await tx.download.create({ data: { userId, noteId, isPremium: noteIsPremium } });
        return {
          allowed: true,
          isPremiumPlan,
          used: 0,
          limit: FREE_LIMIT,
          remaining: isPremiumPlan ? Number.POSITIVE_INFINITY : FREE_LIMIT,
        };
      }

      // Free user + premium note: check monthly allowance
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const used = await tx.download.count({
        where: {
          userId,
          isPremium: true,
          createdAt: { gte: startOfMonth },
        },
      });

      if (used >= FREE_LIMIT) {
        return {
          allowed: false,
          isPremiumPlan,
          used,
          limit: FREE_LIMIT,
          remaining: 0,
        };
      }

      await tx.download.create({ data: { userId, noteId, isPremium: true } });
      return {
        allowed: true,
        isPremiumPlan,
        used: used + 1,
        limit: FREE_LIMIT,
        remaining: Math.max(0, FREE_LIMIT - (used + 1)),
      };
    },
    { timeout: 10_000 },
  );
}

export async function getMonthlyUsage(userId: number) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await prisma.download.count({
    where: { userId, isPremium: true, createdAt: { gte: startOfMonth } },
  });

  return {
    used,
    limit: FREE_LIMIT,
    remaining: Math.max(0, FREE_LIMIT - used),
  };
}
