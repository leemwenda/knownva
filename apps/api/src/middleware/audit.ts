import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { logger } from "../lib/logger.js";

export interface AuditInput {
  actorId: number | null;
  action: string;
  targetType?: string;
  targetId?: number;
  details?: Record<string, unknown>;
}

export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        details: (input.details ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    logger.error({ err, input }, "Failed to write audit log");
  }
}
