import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
  numeric,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "lecturer", "superadmin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended"]);
export const noteStatusEnum = pgEnum("note_status", [
  "pending",
  "approved",
  "rejected",
  "removed",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "under_review",
  "dismissed",
  "resolved",
]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["free", "premium"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "expired",
]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull().default("student"),
    status: userStatusEnum("status").notNull().default("active"),
    institution: varchar("institution", { length: 200 }),
    bio: text("bio"),
    fieldOfStudy: varchar("field_of_study", { length: 150 }),
    emailVerified: boolean("email_verified").notNull().default(false),
    verificationToken: varchar("verification_token", { length: 128 }),
    resetToken: varchar("reset_token", { length: 128 }),
    resetTokenExpiry: timestamp("reset_token_expiry"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    token: varchar("token", { length: 128 }).notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("sessions_token_idx").on(table.token)],
);

export const institutions = pgTable(
  "institutions",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("institutions_name_idx").on(table.name)],
);

export const fields = pgTable(
  "fields",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("fields_name_idx").on(table.name)],
);

export const levels = pgTable(
  "levels",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("levels_name_idx").on(table.name)],
);

export const units = pgTable(
  "units",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    fieldId: integer("field_id").references(() => fields.id, { onDelete: "set null" }),
    levelId: integer("level_id").references(() => levels.id, { onDelete: "set null" }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("units_field_level_idx").on(table.fieldId, table.levelId)],
);

export const notes = pgTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 250 }).notNull(),
    description: text("description").notNull().default(""),
    institutionId: integer("institution_id").references(() => institutions.id, {
      onDelete: "set null",
    }),
    fieldId: integer("field_id").references(() => fields.id, { onDelete: "set null" }),
    levelId: integer("level_id").references(() => levels.id, { onDelete: "set null" }),
    unitId: integer("unit_id").references(() => units.id, { onDelete: "set null" }),
    semester: varchar("semester", { length: 50 }),
    academicYear: varchar("academic_year", { length: 20 }),
    resourceType: varchar("resource_type", { length: 50 }).notNull().default("Notes"),
    isPremium: boolean("is_premium").notNull().default(false),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    filePath: varchar("file_path", { length: 500 }).notNull(),
    fileSize: integer("file_size").notNull().default(0),
    fileMime: varchar("file_mime", { length: 120 }).notNull().default("application/pdf"),
    status: noteStatusEnum("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    uploaderId: integer("uploader_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reviewedBy: integer("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at"),
    downloadsCount: integer("downloads_count").notNull().default(0),
    viewsCount: integer("views_count").notNull().default(0),
    ratingSum: integer("rating_sum").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("notes_status_idx").on(table.status),
    index("notes_uploader_idx").on(table.uploaderId),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    noteId: integer("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("reviews_note_user_idx").on(table.noteId, table.userId)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: serial("id").primaryKey(),
    noteId: integer("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("bookmarks_note_user_idx").on(table.noteId, table.userId)],
);

export const recentlyViewed = pgTable(
  "recently_viewed",
  {
    id: serial("id").primaryKey(),
    noteId: integer("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at").notNull().defaultNow(),
  },
  (table) => [index("recently_viewed_user_idx").on(table.userId)],
);

export const privateNotes = pgTable(
  "private_notes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 250 }).notNull(),
    content: text("content").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("private_notes_user_idx").on(table.userId)],
);

export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    noteId: integer("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    reporterId: integer("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: varchar("reason", { length: 100 }).notNull(),
    details: text("details"),
    status: reportStatusEnum("status").notNull().default("open"),
    resolutionNote: text("resolution_note"),
    resolvedBy: integer("resolved_by").references(() => users.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("reports_status_idx").on(table.status)],
);

export const downloads = pgTable(
  "downloads",
  {
    id: serial("id").primaryKey(),
    noteId: integer("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isPremium: boolean("is_premium").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("downloads_user_created_idx").on(table.userId, table.createdAt)],
);

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  plan: subscriptionPlanEnum("plan").notNull().default("free"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 150 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 150 }),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 150 }).notNull(),
    targetType: varchar("target_type", { length: 100 }),
    targetId: integer("target_id"),
    details: jsonb("details"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("audit_logs_created_idx").on(table.createdAt)],
);

export const paymentEvents = pgTable("payment_events", {
  id: serial("id").primaryKey(),
  stripeEventId: varchar("stripe_event_id", { length: 150 }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  type: varchar("type", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("success"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
