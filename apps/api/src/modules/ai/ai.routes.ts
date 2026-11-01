import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
import { aiService } from "./ai.service.js";
import { extractText } from "./extract-text.js";
import { authenticate } from "../../middleware/authenticate.js";
import { HttpError } from "../../lib/http-error.js";
import { z } from "zod";

const upload = multer({ dest: "storage/ai_docs/" });
const chatSchema = z.object({ message: z.string().min(1) });

export const aiRouter = Router();
aiRouter.use(authenticate);

aiRouter.get("/documents", async (req, res, next) => {
  try { res.json({ ok: true, items: await aiService.getDocuments(req.user!.id) }); } catch (err) { next(err); }
});

aiRouter.post("/documents", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw HttpError.badRequest("File required");
    let text = "";
    try { text = await extractText(req.file.path, req.file.originalname); } catch (e: any) { throw HttpError.badRequest("Could not read file: " + e.message); }
    if (text.trim().length < 50) throw HttpError.badRequest("No readable text found. Scanned or image-only files are not supported yet.");
    const doc = await aiService.uploadDocument(req.user!.id, req.file, text);
    res.status(201).json({ ok: true, document: doc });
  } catch (err) { next(err); }
});

aiRouter.get("/quizzes", async (req, res, next) => {
  try {
    const docId = req.query.documentId ? Number(req.query.documentId) : undefined;
    res.json({ ok: true, items: await aiService.getQuizzes(req.user!.id, docId) });
  } catch (err) { next(err); }
});

aiRouter.get("/documents/:id/messages", async (req, res, next) => {
  try { 
    const id = Number(req.params.id);
    const items = await (await import("../../config/prisma.js")).prisma.aIChatMessage.findMany({ where: { documentId: id, userId: req.user!.id }, orderBy: { createdAt: 'asc' } });
    res.json({ ok: true, items }); 
  } catch (err) { next(err); }
});

aiRouter.post("/documents/:id/chat", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { message } = chatSchema.parse(req.body);
    const reply = await aiService.chat(id, req.user!.id, message);
    res.json({ ok: true, message: reply });
  } catch (err) { next(err); }
});

aiRouter.post("/documents/:id/generate-pack", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await aiService.generateStudyPack(id, req.user!.id);
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
});
