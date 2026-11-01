import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { notesService } from "./notes.service.js";
import { readNoteFile } from "./notes.storage.js";
import { HttpError } from "../../lib/http-error.js";

const idParam = z.coerce.number().int().positive();

function parseId(raw: string | undefined): number {
  const parsed = idParam.safeParse(raw ?? "");
  if (!parsed.success) throw HttpError.badRequest("Invalid note id");
  return parsed.data;
}

export const notesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await notesService.list(req.query, req.user);
      res.json({ ok: true, ...data });
    } catch (err) { next(err); }
  },

  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      const data = await notesService.detail(id, req.user);
      res.json({ ok: true, note: data });
    } catch (err) { next(err); }
  },

  async trackView(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      const data = await notesService.trackView(id, req.user);
      res.json({ ok: true, ...data });
    } catch (err) { next(err); }
  },

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as Request & { file?: { buffer: Buffer; originalname: string; mimetype: string; size: number } }).file;
      const note = await notesService.upload(req.body, file, req.user);
      res.status(201).json({ ok: true, note });
    } catch (err) { next(err); }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      const { note, decision } = await notesService.download(id, req.user);
      const buffer = await readNoteFile(note.filePath);

      res.setHeader("Content-Type", note.fileMime);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(note.fileName)}"`);
      res.setHeader("Content-Length", String(buffer.byteLength));
      res.setHeader("X-Download-Remaining",
        Number.isFinite(decision.remaining) ? String(decision.remaining) : "unlimited");
      res.send(buffer);
    } catch (err) { next(err); }
  },

  async reviews(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      const items = await notesService.reviews(id);
      res.json({ ok: true, items });
    } catch (err) { next(err); }
  },

  async submitReview(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      const result = await notesService.submitReview(id, req.body, req.user);
      res.json({ ok: true, ...result });
    } catch (err) { next(err); }
  },
};
