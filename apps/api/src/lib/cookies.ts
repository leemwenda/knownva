import type { Response } from "express";
import { env, isProd } from "../config/env.js";

export const ACCESS_COOKIE = "knownva_at";
export const REFRESH_COOKIE = "knownva_rt";

function cookieBase() {
  return {
    httpOnly: true,
    secure: isProd || env.COOKIE_SECURE,
    sameSite: "lax" as const,
    domain: env.COOKIE_DOMAIN === "localhost" ? undefined : env.COOKIE_DOMAIN,
    path: "/",
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  opts: { accessMaxAgeMs: number; refreshMaxAgeMs: number },
) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieBase(), maxAge: opts.accessMaxAgeMs });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieBase(), maxAge: opts.refreshMaxAgeMs });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, cookieBase());
  res.clearCookie(REFRESH_COOKIE, cookieBase());
}
