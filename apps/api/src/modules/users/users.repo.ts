import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const SAFE_USER_SELECT = {
  id: true, name: true, email: true, role: true, status: true,
  institution: true, bio: true, fieldOfStudy: true, emailVerified: true,
  createdAt: true, updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof SAFE_USER_SELECT }>;

export const usersRepo = {
  findByIdSafe(id: number) {
    return prisma.user.findUnique({ where: { id }, select: SAFE_USER_SELECT });
  },
  list(args: { where: Prisma.UserWhereInput; skip: number; take: number }) {
    return prisma.user.findMany({
      ...args,
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: "desc" },
    });
  },
  count(where: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  },
  updateSafe(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, select: SAFE_USER_SELECT });
  },
};
