import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { academicRouter } from "./modules/academic/academic.routes.js";
import { notesRouter } from "./modules/notes/notes.routes.js";
import { moderationRouter } from "./modules/moderation/moderation.routes.js";
import { bookmarksRouter } from "./modules/bookmarks/bookmarks.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { privateNotesRouter } from "./modules/private-notes/private-notes.routes.js";
import { recentlyViewedRouter } from "./modules/recently-viewed/recently-viewed.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";

export const v1Router = Router();

v1Router.use("/health", healthRouter);
v1Router.use("/auth", authRouter);
v1Router.use("/academic", academicRouter);
v1Router.use("/notes", notesRouter);
v1Router.use("/moderation", moderationRouter);
v1Router.use("/bookmarks", bookmarksRouter);
v1Router.use("/users", usersRouter);
v1Router.use("/private-notes", privateNotesRouter);
v1Router.use("/recently-viewed", recentlyViewedRouter);
v1Router.use("/admin", adminRouter);
