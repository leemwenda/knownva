import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from "@knownva/shared";
import { authService } from "./auth.service.js";
import { HttpError } from "../../lib/http-error.js";
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from "../../lib/cookies.js";

function ctxOf(req: Request) {
  return {
    ip: req.ip,
    userAgent: req.get("user-agent") ?? undefined,
  };
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register(input, ctxOf(req));
      res.status(201).json({ ok: true, user: result.user });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input, ctxOf(req));
      setAuthCookies(res, result.accessToken, result.refreshToken, {
        accessMaxAgeMs: result.accessMaxAgeMs,
        refreshMaxAgeMs: result.refreshMaxAgeMs,
      });
      res.json({ ok: true, user: result.user });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
      const result = await authService.refresh(raw, ctxOf(req));
      setAuthCookies(res, result.accessToken, result.refreshToken, {
        accessMaxAgeMs: result.accessMaxAgeMs,
        refreshMaxAgeMs: result.refreshMaxAgeMs,
      });
      res.json({ ok: true, user: result.user });
    } catch (err) {
      clearAuthCookies(res);
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
      await authService.logout(raw);
      clearAuthCookies(res);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw HttpError.unauthorized();
      const user = await authService.me(req.user.id);
      res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(token);
      res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      await authService.resendVerification(email);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(email);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(token, password);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw HttpError.unauthorized();
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
