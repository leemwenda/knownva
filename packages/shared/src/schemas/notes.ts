import { z } from "zod";

export const noteListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  institutionId: z.coerce.number().int().positive().optional(),
  fieldId: z.coerce.number().int().positive().optional(),
  levelId: z.coerce.number().int().positive().optional(),
  unitId: z.coerce.number().int().positive().optional(),
  resourceType: z.string().trim().max(50).optional(),
  isPremium: z.enum(["true", "false"]).optional(),
  status: z.string().optional(),
  uploaderId: z.coerce.number().int().positive().optional(),
  mine: z.enum(["true", "false"]).optional(),
  sort: z.enum(["newest", "oldest", "popular", "rating"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});

export const noteUploadMetaSchema = z.object({
  title: z.string().trim().min(3).max(250),
  description: z.string().trim().max(5000).default(""),
  institutionId: z.coerce.number().int().positive().optional(),
  fieldId: z.coerce.number().int().positive().optional(),
  levelId: z.coerce.number().int().positive().optional(),
  unitId: z.coerce.number().int().positive().optional(),
  semester: z.string().trim().max(50).optional(),
  academicYear: z.string().trim().max(20).optional(),
  resourceType: z.string().trim().max(50).default("Notes"),
  isPremium: z.enum(["true", "false"]).default("false"),
  confirmedOwnership: z.literal("true", { message: "You must confirm ownership" }),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const privateNoteSchema = z.object({
  title: z.string().trim().min(1).max(250),
  content: z.string().max(100_000).default(""),
});
