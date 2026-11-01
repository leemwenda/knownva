import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { academicRepo } from "./academic.repo.js";
import { HttpError } from "../../lib/http-error.js";
import { logAudit } from "../../middleware/audit.js";

const createSchema = z.object({ name: z.string().trim().min(1).max(200) });
const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  active: z.boolean().optional(),
});
const createUnitSchema = z.object({
  name: z.string().trim().min(1).max(200),
  fieldId: z.number().int().positive().optional(),
  levelId: z.number().int().positive().optional(),
});
const updateUnitSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  fieldId: z.number().int().positive().nullable().optional(),
  levelId: z.number().int().positive().nullable().optional(),
  active: z.boolean().optional(),
});

type EntityType = "institutions" | "fields" | "levels" | "units";

export const academicService = {
  getStructurePublic() {
    return academicRepo.getAllActive();
  },

  async getStructureAdmin() {
    return academicRepo.getAll();
  },

  async create(type: EntityType, body: unknown, actorId: number) {
    if (type === "institutions") {
      const { name } = createSchema.parse(body);
      const row = await academicRepo.createInstitution(name);
      await logAudit({ actorId, action: `academic.${type}.created`, targetType: type, targetId: row.id, details: { name } });
      return row;
    }
    if (type === "fields") {
      const { name } = createSchema.parse(body);
      const row = await academicRepo.createField(name);
      await logAudit({ actorId, action: `academic.${type}.created`, targetType: type, targetId: row.id, details: { name } });
      return row;
    }
    if (type === "levels") {
      const { name } = createSchema.parse(body);
      const row = await academicRepo.createLevel(name);
      await logAudit({ actorId, action: `academic.${type}.created`, targetType: type, targetId: row.id, details: { name } });
      return row;
    }
    const parsed = createUnitSchema.parse(body);
    const row = await academicRepo.createUnit(parsed);
    await logAudit({ actorId, action: `academic.units.created`, targetType: "units", targetId: row.id, details: parsed });
    return row;
  },

  async update(type: EntityType, id: number, body: unknown, actorId: number) {
    if (type === "units") {
      const data = updateUnitSchema.parse(body);
      const row = await academicRepo.updateUnit(id, data);
      await logAudit({ actorId, action: "academic.units.updated", targetType: "units", targetId: id, details: data });
      return row;
    }
    const data = updateSchema.parse(body);
    const row =
      type === "institutions" ? await academicRepo.updateInstitution(id, data) :
      type === "fields"       ? await academicRepo.updateField(id, data) :
                                await academicRepo.updateLevel(id, data);
    await logAudit({ actorId, action: `academic.${type}.updated`, targetType: type, targetId: id, details: data });
    return row;
  },

  async remove(type: EntityType, id: number, actorId: number) {
    if (type === "institutions") await academicRepo.deleteInstitution(id);
    else if (type === "fields") await academicRepo.deleteField(id);
    else if (type === "levels") await academicRepo.deleteLevel(id);
    else await academicRepo.deleteUnit(id);
    await logAudit({ actorId, action: `academic.${type}.deleted`, targetType: type, targetId: id });
    return { deleted: true };
  },
};
