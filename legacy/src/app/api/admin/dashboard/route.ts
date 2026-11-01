import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, notes, reports, subscriptions, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    await requireRole(["superadmin"]);

    const [userCounts, noteCounts, reportCounts, activeSubs, recentLogs] = await Promise.all([
      db.select({ role: users.role, count: sql<number>`count(*)::int` }).from(users).groupBy(users.role),
      db.select({ status: notes.status, count: sql<number>`count(*)::int` }).from(notes).groupBy(notes.status),
      db
        .select({ status: reports.status, count: sql<number>`count(*)::int` })
        .from(reports)
        .groupBy(reports.status),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(subscriptions)
        .where(eq(subscriptions.plan, "premium")),
      db
        .select({ log: auditLogs, actorName: users.name })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.actorId, users.id))
        .orderBy(desc(auditLogs.createdAt))
        .limit(10),
    ]);

    const roleCounts = { student: 0, lecturer: 0, superadmin: 0 };
    for (const row of userCounts) roleCounts[row.role as keyof typeof roleCounts] = row.count;

    const statusCounts = { pending: 0, approved: 0, rejected: 0, removed: 0 };
    for (const row of noteCounts) statusCounts[row.status as keyof typeof statusCounts] = row.count;

    const reportStatusCounts = { open: 0, under_review: 0, dismissed: 0, resolved: 0 };
    for (const row of reportCounts) reportStatusCounts[row.status as keyof typeof reportStatusCounts] = row.count;

    return jsonOk({
      totalUsers: roleCounts.student + roleCounts.lecturer + roleCounts.superadmin,
      roleCounts,
      resourceCounts: statusCounts,
      totalResources: statusCounts.pending + statusCounts.approved + statusCounts.rejected + statusCounts.removed,
      reportCounts: reportStatusCounts,
      activeSubscriptions: activeSubs[0]?.count ?? 0,
      recentActivity: recentLogs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
