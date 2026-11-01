export const Role = { student: "student", lecturer: "lecturer", superadmin: "superadmin" } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = { active: "active", suspended: "suspended" } as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const NoteStatus = {
  pending: "pending", approved: "approved", rejected: "rejected", removed: "removed",
} as const;
export type NoteStatus = (typeof NoteStatus)[keyof typeof NoteStatus];

export const ReportStatus = {
  open: "open", under_review: "under_review", dismissed: "dismissed", resolved: "resolved",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const SubscriptionPlan = { free: "free", premium: "premium" } as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const SubscriptionStatus = {
  active: "active", canceled: "canceled", expired: "expired",
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
