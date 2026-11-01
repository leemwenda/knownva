import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    await requireRole(["superadmin"]);

    const rows = await db
      .select({ subscription: subscriptions, userName: users.name, userEmail: users.email })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .orderBy(desc(subscriptions.updatedAt))
      .limit(300);

    const summary = await db
      .select({ plan: subscriptions.plan, status: subscriptions.status, count: sql<number>`count(*)::int` })
      .from(subscriptions)
      .groupBy(subscriptions.plan, subscriptions.status);

    return jsonOk({ items: rows, summary });
  } catch (error) {
    return handleApiError(error);
  }
}
