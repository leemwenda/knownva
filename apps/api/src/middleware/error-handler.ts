import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";
import { isProd } from "../config/env.js";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ ok: false, error: "Route not found" });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ ok: false, error: err.message, code: err.code });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      ok: false,
      error: err.issues[0]?.message ?? "Validation failed",
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ ok: false, error: "Resource already exists" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ ok: false, error: "Resource not found" });
      return;
    }
  }

  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");
  res.status(500).json({
    ok: false,
    error: isProd ? "Something went wrong. Please try again." : String(err),
  });
}
