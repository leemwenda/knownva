import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export async function logAudit(
  actorId: number | null,
  action: string,
  targetType?: string,
  targetId?: number,
  details?: Record<string, unknown>,
) {
  try {
    await db.insert(auditLogs).values({
      actorId: actorId ?? null,
      action,
      targetType: targetType ?? null,
      targetId: targetId ?? null,
      details: details ?? null,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log", error);
  }
}
