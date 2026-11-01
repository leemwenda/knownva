import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { authenticate } from "../../middleware/authenticate.js";
import { HttpError } from "../../lib/http-error.js";
import {
  PRIVATE_ALLOWED_TYPES,
  PRIVATE_MAX_SIZE,
  savePrivateFile,
  readPrivateFile,
} from "./private-notes.storage.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: PRIVATE_MAX_SIZE } });
const idParam = z.coerce.number().int().positive();

function parseId(raw?: string): number {
  const parsed = idParam.safeParse(raw ?? "");
  if (!parsed.success) throw HttpError.badRequest("Invalid id");
  return parsed.data;
}

function safeNote(note: any) {
  const { filePath, ...rest } = note;
  return { ...rest, hasFile: !!filePath };
}

export const privateNotesRouter = Router();

// LIST
privateNotesRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const items = await prisma.privateNote.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    res.json({ ok: true, items: items.map(safeNote) });
  } catch (err) { next(err); }
});

// CREATE — supports JSON (text only) or multipart (with file)
privateNotesRouter.post("/", authenticate, upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const body = req.body as any;
    const file = (req as Request & { file?: Express.Multer.File }).file;

    const title = String(body.title || "").slice(0, 200);
    const content = String(body.content || "").slice(0, 20000);
    const hasContent = content.trim().length > 0;
    const hasFile = file && file.size > 0;

    if (!hasContent && !hasFile) throw HttpError.unprocessable("Add text content or attach a file");

    let fileData: any = {};
    if (hasFile && file) {
      if (!PRIVATE_ALLOWED_TYPES.has(file.mimetype)) {
        throw HttpError.unprocessable("Unsupported file type. Use PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, WEBP, or TXT.");
      }
      if (file.size > PRIVATE_MAX_SIZE) {
        throw HttpError.unprocessable(`File exceeds ${PRIVATE_MAX_SIZE / 1024 / 1024}MB`);
      }
      const saved = await savePrivateFile(file);
      fileData = {
        fileName: file.originalname,
        filePath: saved.relativePath,
        fileMime: file.mimetype,
        fileSize: saved.size,
      };
    }

    const note = await prisma.privateNote.create({
      data: { userId: req.user.id, title, content, ...fileData },
    });
    res.status(201).json({ ok: true, note: safeNote(note) });
  } catch (err) { next(err); }
});

// UPDATE
privateNotesRouter.patch("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const id = parseId(req.params.id);
    const existing = await prisma.privateNote.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) throw HttpError.notFound("Not found");

    const schema = z.object({
      title: z.string().trim().max(200).optional(),
      content: z.string().trim().max(20000).optional(),
    });
    const data = schema.parse(req.body);
    if (Object.keys(data).length === 0) throw HttpError.badRequest("No fields to update");

    const clean: any = {};
    if (data.title !== undefined) clean.title = data.title;
    if (data.content !== undefined) clean.content = data.content;

    const note = await prisma.privateNote.update({ where: { id }, data: clean });
    res.json({ ok: true, note: safeNote(note) });
  } catch (err) { next(err); }
});

// DELETE
privateNotesRouter.delete("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const id = parseId(req.params.id);
    const existing = await prisma.privateNote.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) throw HttpError.notFound("Not found");
    await prisma.privateNote.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// DOWNLOAD
privateNotesRouter.get("/:id/download", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const id = parseId(req.params.id);
    const note = await prisma.privateNote.findUnique({ where: { id } });
    if (!note || note.userId !== req.user.id) throw HttpError.notFound("Not found");
    if (!note.filePath || !note.fileName || !note.fileMime) throw HttpError.notFound("No file attached");

    const buffer = await readNoteFileBuffer(note.filePath);
    res.setHeader("Content-Type", note.fileMime);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(note.fileName)}"`);
    res.setHeader("Content-Length", String(buffer.byteLength));
    res.send(buffer);
  } catch (err) { next(err); }
});

async function readNoteFileBuffer(filePath: string): Promise<Buffer> {
  return readPrivateFile(filePath);
}
