import type { NextFunction, Request, Response } from "express";
import type { Role } from "@knownva/shared";
import { HttpError } from "../lib/http-error.js";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(HttpError.unauthorized());
    if (!roles.includes(req.user.role)) return next(HttpError.forbidden());
    next();
  };
}
