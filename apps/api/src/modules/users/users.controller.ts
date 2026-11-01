import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { usersService } from "./users.service.js";
import { HttpError } from "../../lib/http-error.js";

const idParam = z.coerce.number().int().positive();

function parseId(raw: string | undefined): number {
  const parsed = idParam.safeParse(raw ?? "");
  if (!parsed.success) throw HttpError.badRequest("Invalid user id");
  return parsed.data;
}

export const usersController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try { res.json({ ok: true, user: await usersService.getMe(req.user) }); }
    catch (err) { next(err); }
  },
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try { res.json({ ok: true, user: await usersService.updateMe(req.body, req.user) }); }
    catch (err) { next(err); }
  },
  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json({ ok: true, ...(await usersService.list(req.query)) }); }
    catch (err) { next(err); }
  },
  async adminUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw HttpError.unauthorized();
      const id = parseId(req.params.id);
      res.json({ ok: true, user: await usersService.adminUpdate(id, req.body, req.user.id) });
    } catch (err) { next(err); }
  },
};
