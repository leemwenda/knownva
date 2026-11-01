import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { verifyAccessToken } from "../lib/jwt.js";
import { ACCESS_COOKIE } from "../lib/cookies.js";

export interface AuthenticatedUser {
  id: number;
  role: "student" | "lecturer" | "superadmin";
  email: string;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

async function resolveUser(token: string | undefined): Promise<AuthenticatedUser | null> {
  if (!token) return null;
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, email: true, name: true, status: true },
  });
  if (!user || user.status === "suspended") return null;
  return { id: user.id, role: user.role, email: user.email, name: user.name };
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[ACCESS_COOKIE] as string | undefined;
    const user = await resolveUser(token);
    if (!user) throw HttpError.unauthorized();
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.[ACCESS_COOKIE] as string | undefined;
    const user = await resolveUser(token);
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}
