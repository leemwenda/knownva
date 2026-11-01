import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { academicService } from "./academic.service.js";
import { HttpError } from "../../lib/http-error.js";

const entityTypeSchema = z.enum(["institutions", "fields", "levels", "units"]);
const idParamSchema = z.coerce.number().int().positive();

function parseType(raw: string): "institutions" | "fields" | "levels" | "units" {
  const parsed = entityTypeSchema.safeParse(raw);
  if (!parsed.success) throw HttpError.badRequest("Unknown academic entity type");
  return parsed.data;
}

function parseId(raw: string): number {
  const parsed = idParamSchema.safeParse(raw);
  if (!parsed.success) throw HttpError.badRequest("Invalid id");
  return parsed.data;
}

export const academicController = {
  async getPublicStructure(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await academicService.getStructurePublic();
      res.json({ ok: true, ...data });
    } catch (err) { next(err); }
  },

  async getAdminStructure(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await academicService.getStructureAdmin();
      res.json({ ok: true, ...data });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw HttpError.unauthorized();
      const type = parseType(req.params.type ?? "");
      const row = await academicService.create(type, req.body, req.user.id);
      res.status(201).json({ ok: true, item: row });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw HttpError.unauthorized();
      const type = parseType(req.params.type ?? "");
      const id = parseId(req.params.id ?? "");
      const row = await academicService.update(type, id, req.body, req.user.id);
      res.json({ ok: true, item: row });
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw HttpError.unauthorized();
      const type = parseType(req.params.type ?? "");
      const id = parseId(req.params.id ?? "");
      await academicService.remove(type, id, req.user.id);
      res.json({ ok: true });
    } catch (err) { next(err); }
  },
};
