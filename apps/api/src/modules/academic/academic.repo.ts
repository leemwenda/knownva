import { prisma } from "../../config/prisma.js";

function clean<T extends Record<string, unknown>>(o: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o)) if (o[k] !== undefined) out[k] = o[k];
  return out;
}

export const academicRepo = {
  // READ (public)
  async getAllActive() {
    const [institutions, fields, levels, units] = await Promise.all([
      prisma.institution.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
      prisma.field.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
      prisma.level.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
      prisma.unit.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    ]);
    return { institutions, fields, levels, units };
  },

  // READ (admin — includes inactive)
  async getAll() {
    const [institutions, fields, levels, units] = await Promise.all([
      prisma.institution.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.field.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.level.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.unit.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
    return { institutions, fields, levels, units };
  },

  // CREATE
  createInstitution(name: string) {
    return prisma.institution.create({ data: { name, active: true } });
  },
  createField(name: string) {
    return prisma.field.create({ data: { name, active: true } });
  },
  createLevel(name: string) {
    return prisma.level.create({ data: { name, active: true } });
  },
  createUnit(data: { name: string; fieldId?: number | undefined; levelId?: number | undefined }) {
    return prisma.unit.create({
      data: {
        name: data.name,
        fieldId: data.fieldId ?? null,
        levelId: data.levelId ?? null,
        active: true,
      },
    });
  },

  // UPDATE
  updateInstitution(id: number, data: { name?: string | undefined; active?: boolean | undefined }) {
    return prisma.institution.update({ where: { id }, data: clean(data) });
  },
  updateField(id: number, data: { name?: string | undefined; active?: boolean | undefined }) {
    return prisma.field.update({ where: { id }, data: clean(data) });
  },
  updateLevel(id: number, data: { name?: string | undefined; active?: boolean | undefined }) {
    return prisma.level.update({ where: { id }, data: clean(data) });
  },
  updateUnit(id: number, data: { name?: string | undefined; fieldId?: number | null | undefined; levelId?: number | null | undefined; active?: boolean | undefined }) {
    return prisma.unit.update({ where: { id }, data: clean(data) });
  },

  // DELETE
  deleteInstitution(id: number) {
    return prisma.institution.delete({ where: { id } });
  },
  deleteField(id: number) {
    return prisma.field.delete({ where: { id } });
  },
  deleteLevel(id: number) {
    return prisma.level.delete({ where: { id } });
  },
  deleteUnit(id: number) {
    return prisma.unit.delete({ where: { id } });
  },

  // Type guards for dynamic operations
  findInstitution(id: number) { return prisma.institution.findUnique({ where: { id } }); },
  findField(id: number) { return prisma.field.findUnique({ where: { id } }); },
  findLevel(id: number) { return prisma.level.findUnique({ where: { id } }); },
  findUnit(id: number) { return prisma.unit.findUnique({ where: { id } }); },
};
