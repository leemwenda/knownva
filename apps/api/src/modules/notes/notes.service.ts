import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { notesRepo } from "./notes.repo.js";
import { recordDownloadAttempt } from "./notes.quota.js";
import { HttpError } from "../../lib/http-error.js";
import { logAudit } from "../../middleware/audit.js";
import { noteListQuerySchema, noteUploadMetaSchema, reviewSchema } from "@knownva/shared";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, saveNoteFile } from "./notes.storage.js";

interface AuthUser { id: number; role: "student" | "lecturer" | "superadmin" }
function reqUser(u?: AuthUser): AuthUser { if (!u) throw HttpError.unauthorized(); return u; }

export const notesService = {
  async list(rawQuery: unknown, currentUser?: AuthUser) {
    const q = noteListQuerySchema.parse(rawQuery);
    const where: Prisma.NoteWhereInput = {};
    const isPriv = currentUser?.role === "superadmin" || currentUser?.role === "lecturer";

    if (q.mine === "true") {
      if (!currentUser) throw HttpError.unauthorized();
      where.uploaderId = currentUser.id;
      if (q.status && q.status !== "all") where.status = q.status as never;
    } else if (q.uploaderId) {
      where.uploaderId = q.uploaderId;
      where.status = "approved";
    } else if (q.status === "all" && currentUser?.role === "superadmin") {
      // no filter
    } else if (q.status && isPriv) {
      where.status = q.status as never;
    } else {
      where.status = "approved";
    }

    if (q.institutionId) where.institutionId = q.institutionId;
    if (q.fieldId) where.fieldId = q.fieldId;
    if (q.levelId) where.levelId = q.levelId;
    if (q.unitId) where.unitId = q.unitId;
    if (q.resourceType) where.resourceType = q.resourceType;
    if (q.isPremium === "true") where.isPremium = true;
    if (q.isPremium === "false") where.isPremium = false;
    if (q.q) where.OR = [{ title: { contains: q.q } }, { description: { contains: q.q } }];

    const orderBy: Prisma.NoteOrderByWithRelationInput = q.sort === "popular" ? { downloadsCount: "desc" } : q.sort === "rating" ? { ratingSum: "desc" } : q.sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };
    const skip = (q.page - 1) * q.pageSize;
    const [items, total] = await Promise.all([notesRepo.list({ where, orderBy, skip, take: q.pageSize }), notesRepo.count(where)]);

    return { items: items.map(r => ({ ...r, averageRating: r.ratingCount > 0 ? Number((r.ratingSum / r.ratingCount).toFixed(1)) : 0 })), total, page: q.page, pageSize: q.pageSize, totalPages: Math.max(1, Math.ceil(total / q.pageSize)) };
  },

  async detail(id: number, currentUser?: AuthUser) {
    const note = await notesRepo.findByIdWithRelations(id);
    if (!note) throw HttpError.notFound("Resource not found");
    const isOwner = currentUser?.id === note.uploaderId;
    const isAdmin = currentUser?.role === "superadmin";
    if (note.status !== "approved" && !isOwner && !isAdmin) throw HttpError.notFound("Resource not found");
    return { ...note, averageRating: note.ratingCount > 0 ? Number((note.ratingSum / note.ratingCount).toFixed(1)) : 0 };
  },

  async upload(body: unknown, file: any, currentUser?: AuthUser) {
    const user = reqUser(currentUser);
    if (user.role !== "lecturer" && user.role !== "superadmin") throw HttpError.forbidden("Only lecturers can upload");
    
    const meta = noteUploadMetaSchema.parse(body);
    if (!file || file.size === 0) throw HttpError.unprocessable("A file is required");
    if (file.size > MAX_FILE_SIZE_BYTES) throw HttpError.unprocessable("File too large");
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) throw HttpError.unprocessable("Unsupported file type");

    const saved = await saveNoteFile(file);
    const isDraft = meta.status === "draft";

    const note = await notesRepo.create({
      title: meta.title, description: meta.description,
      institutionId: meta.institutionId ?? null, fieldId: meta.fieldId ?? null, levelId: meta.levelId ?? null, unitId: meta.unitId ?? null,
      semester: meta.semester ?? null, academicYear: meta.academicYear ?? null,
      resourceType: meta.resourceType, isPremium: meta.isPremium === "true",
      fileName: file.originalname, filePath: saved.relativePath, fileSize: saved.size, fileMime: file.mimetype,
      status: isDraft ? "draft" : "pending",
      uploaderId: user.id,
    });

    await logAudit({ actorId: user.id, action: isDraft ? "note.draft_saved" : "note.uploaded", targetType: "note", targetId: note.id });
    return note;
  },

  async update(id: number, body: unknown, currentUser?: AuthUser) {
    const user = reqUser(currentUser);
    const note = await notesRepo.findById(id);
    if (!note) throw HttpError.notFound("Resource not found");
    if (note.uploaderId !== user.id) throw HttpError.forbidden("You do not own this resource");
    if (note.status !== "draft" && note.status !== "rejected") throw HttpError.badRequest("Only drafts and rejected resources can be edited");

    const meta = noteUploadMetaSchema.partial().parse(body);
    const submitForReview = body.status === "pending";

    const updated = await notesRepo.update(id, {
      title: meta.title, description: meta.description,
      resourceType: meta.resourceType,
      isPremium: meta.isPremium === "true" ? true : meta.isPremium === "false" ? false : undefined,
      status: submitForReview ? "pending" : undefined,
      rejectionReason: submitForReview ? null : undefined, // Clear rejection if resubmitted
    });

    await logAudit({ actorId: user.id, action: submitForReview ? "note.resubmitted" : "note.updated", targetType: "note", targetId: id });
    return updated;
  },

  async download(id: number, currentUser?: AuthUser) {
    const user = reqUser(currentUser);
    const note = await notesRepo.findById(id);
    if (!note) throw HttpError.notFound("Resource not found");
    if (note.status !== "approved" && note.uploaderId !== user.id && user.role !== "superadmin") throw HttpError.notFound("Resource not found");

    const decision = await recordDownloadAttempt(user.id, note.id, note.isPremium);
    if (!decision.allowed) throw new HttpError(402, `Reached free limit. Upgrade to Premium.`);
    
    await notesRepo.incrementDownloads(id);
    return { note, decision };
  },

  async reviews(id: number) {
    return prisma.review.findMany({ where: { noteId: id }, include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  },

  async submitReview(id: number, body: unknown, currentUser?: AuthUser) {
    const user = reqUser(currentUser);
    const { rating, comment } = reviewSchema.parse(body);
    const existing = await prisma.review.findUnique({ where: { noteId_userId: { noteId: id, userId: user.id } } });

    await prisma.$transaction(async (tx) => {
      if (existing) {
        const diff = rating - existing.rating;
        await tx.review.update({ where: { id: existing.id }, data: { rating, comment: comment ?? "" } });
        if (diff !== 0) await tx.note.update({ where: { id }, data: { ratingSum: { increment: diff } } });
      } else {
        await tx.review.create({ data: { noteId: id, userId: user.id, rating, comment: comment ?? "" } });
        await tx.note.update({ where: { id }, data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 } } });
      }
    });
    return { submitted: true };
  },
};
