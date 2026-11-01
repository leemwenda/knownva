import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/require-role.js";

const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  action: z.string().trim().max(100).optional(),
  actorId: z.coerce.number().int().positive().optional(),
  targetType: z.string().trim().max(100).optional(),
});

export const adminRouter = Router();

adminRouter.get("/dashboard", authenticate, requireRole("superadmin"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const d1 = new Date(now.getTime() - 24 * 3600 * 1000);
      const d7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      const d30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

      const [usersTotal, usersByRole, notesTotal, notesPending, notesApproved,
             d24, d7c, d30c, recentAudit] = await Promise.all([
        prisma.user.count(),
        prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
        prisma.note.count(),
        prisma.note.count({ where: { status: "pending" } }),
        prisma.note.count({ where: { status: "approved" } }),
        prisma.download.count({ where: { createdAt: { gte: d1 } } }),
        prisma.download.count({ where: { createdAt: { gte: d7 } } }),
        prisma.download.count({ where: { createdAt: { gte: d30 } } }),
        prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      ]);

      res.json({
        ok: true,
        users: { total: usersTotal, byRole: usersByRole },
        notes: { total: notesTotal, pending: notesPending, approved: notesApproved },
        downloads: { last24h: d24, last7d: d7c, last30d: d30c },
        recentAudit,
      });
    } catch (err) { next(err); }
  }
);

adminRouter.get("/audit", authenticate, requireRole("superadmin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = auditQuerySchema.parse(req.query);
      const where: Record<string, unknown> = {};
      if (q.action) where.action = q.action;
      if (q.actorId) where.actorId = q.actorId;
      if (q.targetType) where.targetType = q.targetType;

      const skip = (q.page - 1) * q.pageSize;
      const [items, total] = await Promise.all([
        prisma.auditLog.findMany({ where: where as never, orderBy: { createdAt: "desc" }, skip, take: q.pageSize }),
        prisma.auditLog.count({ where: where as never }),
      ]);
      res.json({ ok: true, items, total, page: q.page, pageSize: q.pageSize,
        totalPages: Math.max(1, Math.ceil(total / q.pageSize)) });
    } catch (err) { next(err); }
  }
);

adminRouter.get("/subscriptions", authenticate, requireRole("superadmin"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await prisma.subscription.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      res.json({ ok: true, items });
    } catch (err) { next(err); }
  }
);
