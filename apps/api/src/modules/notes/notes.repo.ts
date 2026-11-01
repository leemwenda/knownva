import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

const noteWithRelations = {
  id: true,
  title: true,
  description: true,
  semester: true,
  academicYear: true,
  resourceType: true,
  isPremium: true,
  fileName: true,
  fileSize: true,
  fileMime: true,
  status: true,
  rejectionReason: true,
  downloadsCount: true,
  viewsCount: true,
  ratingSum: true,
  ratingCount: true,
  createdAt: true,
  updatedAt: true,
  uploaderId: true,
  uploader: { select: { id: true, name: true } },
  institutionId: true,
  institution: { select: { id: true, name: true } },
  fieldId: true,
  field: { select: { id: true, name: true } },
  levelId: true,
  level: { select: { id: true, name: true } },
  unitId: true,
  unit: { select: { id: true, name: true } },
} satisfies Prisma.NoteSelect;

export type NoteRow = Prisma.NoteGetPayload<{ select: typeof noteWithRelations }>;

export const notesRepo = {
  findById(id: number) {
    return prisma.note.findUnique({ where: { id } });
  },
  findByIdWithRelations(id: number) {
    return prisma.note.findUnique({ where: { id }, select: noteWithRelations });
  },
  list(args: {
    where: Prisma.NoteWhereInput;
    orderBy: Prisma.NoteOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    return prisma.note.findMany({ ...args, select: noteWithRelations });
  },
  count(where: Prisma.NoteWhereInput) {
    return prisma.note.count({ where });
  },
  create(data: Prisma.NoteUncheckedCreateInput) {
    return prisma.note.create({ data });
  },
  update(id: number, data: Prisma.NoteUpdateInput) {
    return prisma.note.update({ where: { id }, data });
  },
  incrementViews(id: number) {
    return prisma.note.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });
  },
  incrementDownloads(id: number) {
    return prisma.note.update({
      where: { id },
      data: { downloadsCount: { increment: 1 } },
    });
  },
};
