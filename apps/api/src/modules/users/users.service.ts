import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { usersRepo, SAFE_USER_SELECT } from "./users.repo.js";
import { HttpError } from "../../lib/http-error.js";
import { logAudit } from "../../middleware/audit.js";

const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  institution: z.string().trim().max(200).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  fieldOfStudy: z.string().trim().max(200).nullable().optional(),
});

const roleSchema = z.enum(["student", "lecturer", "superadmin"]);
const statusSchema = z.enum(["active", "suspended"]);

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(200).optional(),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
});

const adminUpdateSchema = z.object({
  role: roleSchema.optional(),
  status: statusSchema.optional(),
});

interface AuthUser { id: number; role: "student" | "lecturer" | "superadmin" }

function clean<T extends Record<string, unknown>>(o: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o)) if (o[k] !== undefined) out[k] = o[k];
  return out;
}

export const usersService = {
  async getMe(currentUser?: AuthUser) {
    if (!currentUser) throw HttpError.unauthorized();
    const user = await usersRepo.findByIdSafe(currentUser.id);
    if (!user) throw HttpError.notFound("User not found");
    return user;
  },

  async updateMe(body: unknown, currentUser?: AuthUser) {
    if (!currentUser) throw HttpError.unauthorized();
    const data = updateMeSchema.parse(body);
    if (Object.keys(data).length === 0) throw HttpError.badRequest("No fields to update");
    return usersRepo.updateSafe(currentUser.id, clean(data) as never);
  },

  async list(rawQuery: unknown) {
    const q = listQuerySchema.parse(rawQuery);
    const where: Record<string, unknown> = {};
    if (q.role) where.role = q.role;
    if (q.status) where.status = q.status;
    if (q.q) where.OR = [
      { name: { contains: q.q } },
      { email: { contains: q.q } },
    ];
    const skip = (q.page - 1) * q.pageSize;
    const [items, total] = await Promise.all([
      usersRepo.list({ where: where as never, skip, take: q.pageSize }),
      usersRepo.count(where as never),
    ]);
    return { items, total, page: q.page, pageSize: q.pageSize, totalPages: Math.max(1, Math.ceil(total / q.pageSize)) };
  },

  async adminUpdate(id: number, body: unknown, actorId: number) {
    const data = adminUpdateSchema.parse(body);
    if (Object.keys(data).length === 0) throw HttpError.badRequest("No fields to update");

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) throw HttpError.notFound("User not found");

      if (user.role === "superadmin" && user.status === "active") {
        const losingSuperadmin =
          (data.role !== undefined && data.role !== "superadmin") ||
          (data.status !== undefined && data.status !== "active");
        if (losingSuperadmin) {
          const activeSupers = await tx.user.count({
            where: { role: "superadmin", status: "active" },
          });
          if (activeSupers <= 1) {
            throw HttpError.badRequest("Cannot modify the last active superadmin");
          }
        }
      }

      const updated = await tx.user.update({
        where: { id },
        data: clean(data) as never,
        select: SAFE_USER_SELECT,
      });

      await logAudit({
        actorId,
        action: "user.updated",
        targetType: "user",
        targetId: id,
        details: data,
      });

      return updated;
    });
  },
};
