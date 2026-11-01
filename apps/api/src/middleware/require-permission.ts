import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";
import { hasPermission, type Permission } from "../lib/permissions.js";

export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(HttpError.unauthorized());
    if (!hasPermission(req.user.role, permission)) {
      return next(HttpError.forbidden("Insufficient permissions"));
    }
    next();
  };
}
