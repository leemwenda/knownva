import { Router } from "express";
import { usersController } from "./users.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/require-role.js";

export const usersRouter = Router();

usersRouter.get("/me", authenticate, usersController.getMe);
usersRouter.patch("/me", authenticate, usersController.updateMe);

usersRouter.get("/", authenticate, requireRole("superadmin"), usersController.list);
usersRouter.patch("/:id", authenticate, requireRole("superadmin"), usersController.adminUpdate);
