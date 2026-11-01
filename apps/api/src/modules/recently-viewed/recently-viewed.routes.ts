import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { authenticate } from "../../middleware/authenticate.js";
import { HttpError } from "../../lib/http-error.js";

const idParam = z.coerce.number().int().positive();

export const recentlyViewedRouter = Router();

recentlyViewedRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const rows = await prisma.recentlyViewed.findMany({
      where: { userId: req.user.id },
      orderBy: { viewedAt: "desc" },
      take: 100,
      include: { note: { include: { uploader: { select: { id: true, name: true } } } } },
    });
    const seen = new Set<number>();
    const items = rows.filter((r) => {
      if (seen.has(r.noteId)) return false;
      seen.add(r.noteId);
      return true;
    }).slice(0, 20);
    res.json({ ok: true, items });
  } catch (err) { next(err); }
});

recentlyViewedRouter.post("/:noteId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const parsed = idParam.safeParse(req.params.noteId ?? "");
    if (!parsed.success) throw HttpError.badRequest("Invalid note id");
    const noteId = parsed.data;

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.status !== "approved") throw HttpError.notFound("Note not found");

    await prisma.recentlyViewed.create({ data: { userId: req.user.id, noteId } });
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

recentlyViewedRouter.delete("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    await prisma.recentlyViewed.deleteMany({ where: { userId: req.user.id } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
