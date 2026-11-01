import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { authenticate } from "../../middleware/authenticate.js";
import { HttpError } from "../../lib/http-error.js";

const idParam = z.coerce.number().int().positive();
const createSchema = z.object({
  title: z.string().trim().max(200).optional(),
  content: z.string().trim().min(1).max(20000),
});
const updateSchema = z.object({
  title: z.string().trim().max(200).optional(),
  content: z.string().trim().min(1).max(20000).optional(),
});

function clean<T extends Record<string, unknown>>(o: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o)) if (o[k] !== undefined) out[k] = o[k];
  return out;
}

export const privateNotesRouter = Router();

privateNotesRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const items = await prisma.privateNote.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    res.json({ ok: true, items });
  } catch (err) { next(err); }
});

privateNotesRouter.post("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const data = createSchema.parse(req.body);
    const note = await prisma.privateNote.create({
      data: { ...clean(data), userId: req.user.id } as never,
    });
    res.status(201).json({ ok: true, note });
  } catch (err) { next(err); }
});

privateNotesRouter.patch("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const parsed = idParam.safeParse(req.params.id ?? "");
    if (!parsed.success) throw HttpError.badRequest("Invalid id");
    const id = parsed.data;
    const data = updateSchema.parse(req.body);
    if (Object.keys(data).length === 0) throw HttpError.badRequest("No fields to update");

    const existing = await prisma.privateNote.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) throw HttpError.notFound("Not found");

    const note = await prisma.privateNote.update({ where: { id }, data: clean(data) as never });
    res.json({ ok: true, note });
  } catch (err) { next(err); }
});

privateNotesRouter.delete("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const parsed = idParam.safeParse(req.params.id ?? "");
    if (!parsed.success) throw HttpError.badRequest("Invalid id");
    const id = parsed.data;

    const existing = await prisma.privateNote.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) throw HttpError.notFound("Not found");

    await prisma.privateNote.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
