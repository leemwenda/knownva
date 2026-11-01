import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");
    if (user.role !== "lecturer" && user.role !== "superadmin") {
      throw new HttpError(403, "Only lecturers can view this dashboard");
    }

    const statusCounts = await db
      .select({ status: notes.status, count: sql<number>`count(*)::int` })
      .from(notes)
      .where(eq(notes.uploaderId, user.id))
      .groupBy(notes.status);

    const totals = await db
      .select({
        downloads: sql<number>`coalesce(sum(${notes.downloadsCount}), 0)::int`,
        views: sql<number>`coalesce(sum(${notes.viewsCount}), 0)::int`,
        ratingSum: sql<number>`coalesce(sum(${notes.ratingSum}), 0)::int`,
        ratingCount: sql<number>`coalesce(sum(${notes.ratingCount}), 0)::int`,
      })
      .from(notes)
      .where(eq(notes.uploaderId, user.id));

    const recentDecisions = await db
      .select()
      .from(notes)
      .where(and(eq(notes.uploaderId, user.id), sql`${notes.reviewedAt} is not null`))
      .orderBy(desc(notes.reviewedAt))
      .limit(5);

    const counts = { pending: 0, approved: 0, rejected: 0, removed: 0 };
    for (const row of statusCounts) {
      counts[row.status as keyof typeof counts] = row.count;
    }

    const totalRow = totals[0] || { downloads: 0, views: 0, ratingSum: 0, ratingCount: 0 };

    return jsonOk({
      counts,
      totalResources: counts.pending + counts.approved + counts.rejected + counts.removed,
      totalDownloads: totalRow.downloads,
      totalViews: totalRow.views,
      averageRating:
        totalRow.ratingCount > 0 ? Number((totalRow.ratingSum / totalRow.ratingCount).toFixed(1)) : 0,
      recentDecisions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
