import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { authenticate } from "../../middleware/authenticate.js";
import { z } from "zod";

const planSchema = z.object({ title: z.string(), date: z.string(), type: z.string() });
const flashcardSchema = z.object({ front: z.string(), back: z.string(), deckName: z.string() });

export const studentRouter = Router();
studentRouter.use(authenticate);

// Study Planner
studentRouter.get("/planner", async (req, res, next) => {
  try { res.json({ ok: true, items: await prisma.studyPlan.findMany({ where: { userId: req.user!.id }, orderBy: { date: 'asc' } }) }); } catch (err) { next(err); }
});
studentRouter.post("/planner", async (req, res, next) => {
  try { const data = planSchema.parse(req.body); const item = await prisma.studyPlan.create({ data: { ...data, date: new Date(data.date), userId: req.user!.id } }); res.status(201).json({ ok: true, item }); } catch (err) { next(err); }
});

// Flashcards
studentRouter.get("/flashcards", async (req, res, next) => {
  try { res.json({ ok: true, items: await prisma.flashcard.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' } }) }); } catch (err) { next(err); }
});
studentRouter.post("/flashcards", async (req, res, next) => {
  try { const data = flashcardSchema.parse(req.body); const item = await prisma.flashcard.create({ data: { ...data, userId: req.user!.id } }); res.status(201).json({ ok: true, item }); } catch (err) { next(err); }
});
studentRouter.delete("/flashcards/:id", async (req, res, next) => {
  try { await prisma.flashcard.deleteMany({ where: { id: Number(req.params.id), userId: req.user!.id } }); res.json({ ok: true }); } catch (err) { next(err); }
});
