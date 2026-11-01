import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { academicRouter } from "./modules/academic/academic.routes.js";
import { notesRouter } from "./modules/notes/notes.routes.js";
import { moderationRouter } from "./modules/moderation/moderation.routes.js";
import { bookmarksRouter } from "./modules/bookmarks/bookmarks.routes.js";

export const v1Router = Router();

v1Router.use("/health", healthRouter);
v1Router.use("/auth", authRouter);
v1Router.use("/academic", academicRouter);
v1Router.use("/notes", notesRouter);
v1Router.use("/moderation", moderationRouter);
v1Router.use("/bookmarks", bookmarksRouter);
