import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { authenticate } from "../../middleware/authenticate.js";
import { HttpError } from "../../lib/http-error.js";

const idParam = z.coerce.number().int().positive();

export const bookmarksRouter = Router();

bookmarksRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const items = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        note: {
          include: {
            uploader: { select: { id: true, name: true } },
            institution: { select: { id: true, name: true } },
            field: { select: { id: true, name: true } },
            level: { select: { id: true, name: true } },
            unit: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json({ ok: true, items });
  } catch (err) { next(err); }
});

bookmarksRouter.post("/:noteId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const parsed = idParam.safeParse(req.params.noteId ?? "");
    if (!parsed.success) throw HttpError.badRequest("Invalid note id");
    const noteId = parsed.data;

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw HttpError.notFound("Note not found");

    const existing = await prisma.bookmark.findUnique({
      where: { noteId_userId: { noteId, userId: req.user.id } },
    });
    if (existing) {
      res.json({ ok: true, bookmarked: true });
      return;
    }
    await prisma.bookmark.create({ data: { noteId, userId: req.user.id } });
    res.status(201).json({ ok: true, bookmarked: true });
  } catch (err) { next(err); }
});

bookmarksRouter.delete("/:noteId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const parsed = idParam.safeParse(req.params.noteId ?? "");
    if (!parsed.success) throw HttpError.badRequest("Invalid note id");
    const noteId = parsed.data;

    await prisma.bookmark.deleteMany({
      where: { noteId, userId: req.user.id },
    });
    res.json({ ok: true, bookmarked: false });
  } catch (err) { next(err); }
});
