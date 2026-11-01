import bcrypt from "bcryptjs";
import { env, isTest } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";
import { logger } from "../../lib/logger.js";
import { randomToken, sha256Hex } from "../../lib/tokens.js";
import { signAccessToken } from "../../lib/jwt.js";
import { authRepo } from "./auth.repo.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./auth.mailer.js";
import type { RegisterInput, LoginInput } from "@knownva/shared";

export interface AuthContext {
  ip?: string | undefined;
  userAgent?: string | undefined;
}

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

function sanitizeUser<
  T extends {
    passwordHash: string;
    verificationToken: string | null;
    resetToken: string | null;
    resetTokenExpiry: Date | null;
  },
>(user: T) {
  const {
    passwordHash: _p,
    verificationToken: _v,
    resetToken: _r,
    resetTokenExpiry: _e,
    ...rest
  } = user;
  return rest;
}

export const authService = {
  async register(input: RegisterInput, _ctx: AuthContext) {
    const existing = await authRepo.findUserByEmail(input.email);
    if (existing) throw HttpError.conflict("An account with this email already exists");

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
    const verificationToken = randomToken(24);

    const user = await authRepo.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
      ...(input.institution !== undefined && { institution: input.institution }),
      ...(input.fieldOfStudy !== undefined && { fieldOfStudy: input.fieldOfStudy }),
      role: "student",
      status: "active",
      emailVerified: false,
      verificationToken,
    });

    await sendVerificationEmail(user.email, user.name, verificationToken);
    return { user: sanitizeUser(user) };
  },

  async login(input: LoginInput, ctx: AuthContext) {
    const user = await authRepo.findUserByEmail(input.email);
    if (!user) throw HttpError.unauthorized("Invalid email or password");
    if (user.status === "suspended") throw HttpError.forbidden("Account is suspended");

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw HttpError.unauthorized("Invalid email or password");

    if (!isTest && bcrypt.getRounds(user.passwordHash) < env.BCRYPT_ROUNDS) {
      try {
        const newHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
        await authRepo.updateUser(user.id, { passwordHash: newHash });
        logger.info({ userId: user.id }, "Password rehashed to current cost");
      } catch (err) {
        logger.warn({ err, userId: user.id }, "Password rehash failed — continuing with old hash");
      }
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshRaw = randomToken(48);
    const tokenHash = sha256Hex(refreshRaw);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

    await authRepo.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: ctx.userAgent ?? null,
      ipAddress: ctx.ip ?? null,
    });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken: refreshRaw,
      accessMaxAgeMs: ACCESS_TTL_MS,
      refreshMaxAgeMs: REFRESH_TTL_MS,
    };
  },

  async refresh(refreshToken: string | undefined, ctx: AuthContext) {
    if (!refreshToken) throw HttpError.unauthorized("Missing refresh token");
    const tokenHash = sha256Hex(refreshToken);
    const row = await authRepo.findRefreshTokenByHash(tokenHash);
    if (!row) throw HttpError.unauthorized("Invalid refresh token");

    if (row.revokedAt) {
      await authRepo.revokeAllRefreshTokensForUser(row.userId);
      logger.warn({ userId: row.userId }, "Revoked refresh token reuse detected");
      throw HttpError.unauthorized("Session expired — please sign in again");
    }
    if (row.expiresAt.getTime() < Date.now()) {
      await authRepo.revokeRefreshToken(row.id);
      throw HttpError.unauthorized("Session expired — please sign in again");
    }

    const user = await authRepo.findUserById(row.userId);
    if (!user || user.status === "suspended") {
      await authRepo.revokeRefreshToken(row.id);
      throw HttpError.unauthorized("Session no longer valid");
    }

    await authRepo.revokeRefreshToken(row.id);
    const newRaw = randomToken(48);
    const newHash = sha256Hex(newRaw);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

    await authRepo.createRefreshToken({
      userId: user.id,
      tokenHash: newHash,
      expiresAt,
      userAgent: ctx.userAgent ?? null,
      ipAddress: ctx.ip ?? null,
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken: newRaw,
      accessMaxAgeMs: ACCESS_TTL_MS,
      refreshMaxAgeMs: REFRESH_TTL_MS,
    };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    const tokenHash = sha256Hex(refreshToken);
    const row = await authRepo.findRefreshTokenByHash(tokenHash);
    if (row && !row.revokedAt) await authRepo.revokeRefreshToken(row.id);
  },

  async me(userId: number) {
    const user = await authRepo.findUserById(userId);
    if (!user) throw HttpError.unauthorized();
    return sanitizeUser(user);
  },

  async verifyEmail(token: string) {
    const user = await authRepo.findUserByVerificationToken(token);
    if (!user) throw HttpError.badRequest("Invalid or expired verification token");
    if (user.emailVerified) return { alreadyVerified: true };
    await authRepo.updateUser(user.id, {
      emailVerified: true,
      verificationToken: null,
    });
    return { verified: true };
  },

  async resendVerification(email: string) {
    const user = await authRepo.findUserByEmail(email);
    if (!user || user.emailVerified) return { sent: true };
    const token = randomToken(24);
    await authRepo.updateUser(user.id, { verificationToken: token });
    await sendVerificationEmail(user.email, user.name, token);
    return { sent: true };
  },

  async forgotPassword(email: string) {
    const user = await authRepo.findUserByEmail(email);
    if (!user) return { sent: true };
    const token = randomToken(24);
    await authRepo.updateUser(user.id, {
      resetToken: token,
      resetTokenExpiry: new Date(Date.now() + RESET_TTL_MS),
    });
    await sendPasswordResetEmail(user.email, user.name, token);
    return { sent: true };
  },

  async resetPassword(token: string, password: string) {
    const user = await authRepo.findUserByResetToken(token);
    if (!user) throw HttpError.badRequest("Invalid reset token");
    if (!user.resetTokenExpiry || user.resetTokenExpiry.getTime() < Date.now()) {
      throw HttpError.badRequest("Reset token has expired");
    }
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    await authRepo.updateUser(user.id, {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });
    await authRepo.revokeAllRefreshTokensForUser(user.id);
    return { reset: true };
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await authRepo.findUserById(userId);
    if (!user) throw HttpError.unauthorized();
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw HttpError.badRequest("Current password is incorrect");
    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await authRepo.updateUser(user.id, { passwordHash });
    return { changed: true };
  },
};

export type AuthService = typeof authService;
