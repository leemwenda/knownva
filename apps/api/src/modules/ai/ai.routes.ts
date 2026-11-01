import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { aiService } from "./ai.service.js";
import { authenticate } from "../../middleware/authenticate.js";
import { HttpError } from "../../lib/http-error.js";
import { z } from "zod";

const upload = multer({ dest: "storage/ai_docs/" });
const chatSchema = z.object({ message: z.string().min(1) });

export const aiRouter = Router();

aiRouter.use(authenticate);

aiRouter.get("/documents", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ ok: true, items: await aiService.getDocuments(req.user!.id) }); } catch (err) { next(err); }
});

aiRouter.post("/documents", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw HttpError.badRequest("File required");
    const doc = await aiService.uploadDocument(req.user!.id, req.file);
    res.status(201).json({ ok: true, document: doc });
  } catch (err) { next(err); }
});

aiRouter.get("/documents/:id/messages", async (req: Request, res: Response, next: NextFunction) => {
  try { 
    const id = Number(req.params.id);
    res.json({ ok: true, items: await aiService.getChatHistory(id, req.user!.id) }); 
  } catch (err) { next(err); }
});

aiRouter.post("/documents/:id/chat", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { message } = chatSchema.parse(req.body);
    const reply = await aiService.chat(id, req.user!.id, message);
    res.json({ ok: true, message: reply });
  } catch (err) { next(err); }
});
