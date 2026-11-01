import { z } from "zod";
import { Role, UserStatus, ReportStatus } from "../enums.js";

export const adminUserListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  role: z.enum([Role.student, Role.lecturer, Role.superadmin]).optional(),
  status: z.enum([UserStatus.active, UserStatus.suspended]).optional(),
});

export const adminUserPatchSchema = z.object({
  role: z.enum([Role.student, Role.lecturer, Role.superadmin]).optional(),
  status: z.enum([UserStatus.active, UserStatus.suspended]).optional(),
});

export const adminReportPatchSchema = z.object({
  status: z.enum([ReportStatus.open, ReportStatus.under_review, ReportStatus.dismissed, ReportStatus.resolved]),
  resolutionNote: z.string().max(2000).optional(),
});

export const moderationDecisionSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve") }),
  z.object({ decision: z.literal("reject"), reason: z.string().trim().min(3).max(1000) }),
  z.object({ decision: z.literal("remove"), reason: z.string().trim().min(3).max(1000) }),
]);
