import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/require-role.js";
import { logAudit } from "../../middleware/audit.js";
import { HttpError } from "../../lib/http-error.js";

const idParam = z.coerce.number().int().positive();
const decisionSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve") }),
  z.object({ decision: z.literal("reject"), reason: z.string().trim().min(3).max(1000) }),
  z.object({ decision: z.literal("remove"), reason: z.string().trim().min(3).max(1000) }),
]);

async function decide(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const parsed = idParam.safeParse(req.params.id ?? "");
    if (!parsed.success) throw HttpError.badRequest("Invalid note id");
    const noteId = parsed.data;

    const { decision, reason } = decisionSchema.parse(req.body);

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw HttpError.notFound("Note not found");

    // Enforce "no self-approval" — preserves legacy business rule
    if (note.uploaderId === req.user.id && decision === "approve") {
      throw HttpError.forbidden("You cannot approve your own resource");
    }

    const newStatus =
      decision === "approve" ? "approved" :
      decision === "reject"  ? "rejected" :
                                "removed";

    const updated = await prisma.note.update({
      where: { id: noteId },
      data: {
        status: newStatus,
        rejectionReason: decision === "approve" ? null : (reason ?? null),
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
    });

    await logAudit({
      actorId: req.user.id,
      action: `moderation.${decision}`,
      targetType: "note",
      targetId: noteId,
      details: reason ? { reason } : {},
    });

    res.json({ ok: true, note: updated });
  } catch (err) { next(err); }
}

async function listPending(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.note.findMany({
      where: { status: "pending" },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        institution: { select: { id: true, name: true } },
        field: { select: { id: true, name: true } },
        level: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    res.json({ ok: true, items });
  } catch (err) { next(err); }
}

export const moderationRouter = Router();
moderationRouter.get("/pending", authenticate, requireRole("superadmin"), listPending);
moderationRouter.post("/:id/decide", authenticate, requireRole("superadmin"), decide);
