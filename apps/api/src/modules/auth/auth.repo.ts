import { prisma } from "../../config/prisma.js";
import type { Role, UserStatus } from "@knownva/shared";

export const authRepo = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  findUserByVerificationToken(token: string) {
    return prisma.user.findFirst({ where: { verificationToken: token } });
  },

  findUserByResetToken(token: string) {
    return prisma.user.findFirst({ where: { resetToken: token } });
  },

  createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    institution?: string;
    fieldOfStudy?: string;
    role?: Role;
    status?: UserStatus;
    emailVerified?: boolean;
    verificationToken?: string | null;
  }) {
    return prisma.user.create({ data });
  },

  updateUser(id: number, data: Record<string, unknown>) {
    return prisma.user.update({ where: { id }, data });
  },

  createRefreshToken(data: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revokeRefreshToken(id: number) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllRefreshTokensForUser(userId: number) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
