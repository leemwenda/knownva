import { prisma } from "../../config/prisma.js";

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
  createUnit(data: { name: string; fieldId?: number; levelId?: number }) {
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
  updateInstitution(id: number, data: { name?: string; active?: boolean }) {
    return prisma.institution.update({ where: { id }, data });
  },
  updateField(id: number, data: { name?: string; active?: boolean }) {
    return prisma.field.update({ where: { id }, data });
  },
  updateLevel(id: number, data: { name?: string; active?: boolean }) {
    return prisma.level.update({ where: { id }, data });
  },
  updateUnit(id: number, data: { name?: string; fieldId?: number | null; levelId?: number | null; active?: boolean }) {
    return prisma.unit.update({ where: { id }, data });
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
