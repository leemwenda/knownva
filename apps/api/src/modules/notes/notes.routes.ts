import { Router } from "express";
import multer from "multer";
import { notesController } from "./notes.controller.js";
import { authenticate, optionalAuthenticate } from "../../middleware/authenticate.js";
import { MAX_FILE_SIZE_BYTES } from "./notes.storage.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

export const notesRouter = Router();

// Public / optional auth
notesRouter.get("/", optionalAuthenticate, notesController.list);
notesRouter.get("/:id", optionalAuthenticate, notesController.detail);
notesRouter.get("/:id/reviews", notesController.reviews);

// Authenticated
notesRouter.post("/:id/view", optionalAuthenticate, notesController.trackView);
notesRouter.post("/:id/review", authenticate, notesController.submitReview);
notesRouter.get("/:id/download", authenticate, notesController.download);

// Lecturers + superadmin only (checked inside service)
notesRouter.post("/", authenticate, upload.single("file"), notesController.upload);
notesRouter.patch("/:id", authenticate, notesController.update);
