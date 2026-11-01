import { Router } from "express";
import { academicController } from "./academic.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/require-role.js";

export const academicRouter = Router();

// Public: read active structure (used by filters, dropdowns)
academicRouter.get("/structure", academicController.getPublicStructure);

// Admin: read all (incl. inactive)
academicRouter.get("/admin", authenticate, requireRole("superadmin"), academicController.getAdminStructure);

// Admin: write
academicRouter.post("/:type", authenticate, requireRole("superadmin"), academicController.create);
academicRouter.patch("/:type/:id", authenticate, requireRole("superadmin"), academicController.update);
academicRouter.delete("/:type/:id", authenticate, requireRole("superadmin"), academicController.remove);
