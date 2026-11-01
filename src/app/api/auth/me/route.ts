import { getCurrentUser, sanitizeUser } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonOk({ user: null });
    }
    const subRows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .limit(1);
    return jsonOk({ user: sanitizeUser(user), subscription: subRows[0] || null });
  } catch (error) {
    return handleApiError(error);
  }
}
