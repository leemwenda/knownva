import { NextRequest } from "next/server";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { fields, institutions, levels, notes, units, users } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { saveNoteFile, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

const noteSelection = {
  id: notes.id,
  title: notes.title,
  description: notes.description,
  semester: notes.semester,
  academicYear: notes.academicYear,
  resourceType: notes.resourceType,
  isPremium: notes.isPremium,
  fileName: notes.fileName,
  fileSize: notes.fileSize,
  fileMime: notes.fileMime,
  status: notes.status,
  rejectionReason: notes.rejectionReason,
  downloadsCount: notes.downloadsCount,
  viewsCount: notes.viewsCount,
  ratingSum: notes.ratingSum,
  ratingCount: notes.ratingCount,
  createdAt: notes.createdAt,
  updatedAt: notes.updatedAt,
  uploaderId: notes.uploaderId,
  uploaderName: users.name,
  institutionId: notes.institutionId,
  institutionName: institutions.name,
  fieldId: notes.fieldId,
  fieldName: fields.name,
  levelId: notes.levelId,
  levelName: levels.name,
  unitId: notes.unitId,
  unitName: units.name,
};

function baseQuery() {
  return db
    .select(noteSelection)
    .from(notes)
    .leftJoin(users, eq(notes.uploaderId, users.id))
    .leftJoin(institutions, eq(notes.institutionId, institutions.id))
    .leftJoin(fields, eq(notes.fieldId, fields.id))
    .leftJoin(levels, eq(notes.levelId, levels.id))
    .leftJoin(units, eq(notes.unitId, units.id));
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const q = url.searchParams.get("q")?.trim();
    const institutionId = url.searchParams.get("institutionId");
    const fieldId = url.searchParams.get("fieldId");
    const levelId = url.searchParams.get("levelId");
    const unitId = url.searchParams.get("unitId");
    const resourceType = url.searchParams.get("resourceType");
    const isPremium = url.searchParams.get("isPremium");
    const status = url.searchParams.get("status");
    const uploaderIdParam = url.searchParams.get("uploaderId");
    const mine = url.searchParams.get("mine") === "true";
    const sort = url.searchParams.get("sort") || "newest";
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(48, Math.max(1, Number(url.searchParams.get("pageSize")) || 12));

    const user = await getCurrentUser();

    const conditions = [];

    if (mine || uploaderIdParam) {
      if (mine) {
        if (!user) throw new HttpError(401, "Authentication required");
        conditions.push(eq(notes.uploaderId, user.id));
        if (status) conditions.push(eq(notes.status, status as (typeof notes.status.enumValues)[number]));
      } else if (uploaderIdParam) {
        conditions.push(eq(notes.uploaderId, Number(uploaderIdParam)));
        conditions.push(eq(notes.status, "approved"));
      }
    } else if (status === "all" && user && user.role === "superadmin") {
      // Administrators may list every status; no status filter is applied.
    } else if (status && user && (user.role === "superadmin" || user.role === "lecturer")) {
      conditions.push(eq(notes.status, status as (typeof notes.status.enumValues)[number]));
    } else {
      conditions.push(eq(notes.status, "approved"));
    }

    if (q) {
      conditions.push(
        or(ilike(notes.title, `%${q}%`), ilike(notes.description, `%${q}%`)) as ReturnType<typeof or>,
      );
    }
    if (institutionId) conditions.push(eq(notes.institutionId, Number(institutionId)));
    if (fieldId) conditions.push(eq(notes.fieldId, Number(fieldId)));
    if (levelId) conditions.push(eq(notes.levelId, Number(levelId)));
    if (unitId) conditions.push(eq(notes.unitId, Number(unitId)));
    if (resourceType) conditions.push(eq(notes.resourceType, resourceType));
    if (isPremium === "true") conditions.push(eq(notes.isPremium, true));
    if (isPremium === "false") conditions.push(eq(notes.isPremium, false));

    let query = baseQuery().$dynamic();
    if (conditions.length) {
      query = query.where(and(...conditions));
    }

    if (sort === "popular") {
      query = query.orderBy(desc(notes.downloadsCount), desc(notes.createdAt));
    } else if (sort === "rating") {
      query = query.orderBy(desc(notes.ratingSum), desc(notes.createdAt));
    } else if (sort === "oldest") {
      query = query.orderBy(asc(notes.createdAt));
    } else {
      query = query.orderBy(desc(notes.createdAt));
    }

    const offset = (page - 1) * pageSize;
    const results = await query.limit(pageSize).offset(offset);

    let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(notes).$dynamic();
    if (conditions.length) {
      countQuery = countQuery.where(and(...conditions));
    }
    const countRows = await countQuery;
    const total = countRows[0]?.count ?? 0;

    const items = results.map((row) => ({
      ...row,
      averageRating: row.ratingCount > 0 ? Number((row.ratingSum / row.ratingCount).toFixed(1)) : 0,
    }));

    return jsonOk({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentication required");
    if (user.role !== "lecturer" && user.role !== "superadmin") {
      throw new HttpError(403, "Only lecturers can upload academic resources");
    }

    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const institutionId = formData.get("institutionId");
    const fieldId = formData.get("fieldId");
    const levelId = formData.get("levelId");
    const unitId = formData.get("unitId");
    const semester = formData.get("semester");
    const academicYear = formData.get("academicYear");
    const resourceType = String(formData.get("resourceType") || "Notes");
    const isPremium = formData.get("isPremium") === "true";
    const confirmedOwnership = formData.get("confirmedOwnership") === "true";
    const file = formData.get("file");

    if (!title || title.length < 3) {
      return jsonError("Title must be at least 3 characters", 422);
    }
    if (!confirmedOwnership) {
      return jsonError("You must confirm you own or have permission to share this file", 422);
    }
    if (!(file instanceof File) || file.size === 0) {
      return jsonError("A file is required", 422);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return jsonError("File exceeds the 30MB upload limit", 422);
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return jsonError("Unsupported file type. Please upload a PDF, Word, or PowerPoint document.", 422);
    }

    const saved = await saveNoteFile(file);

    const [created] = await db
      .insert(notes)
      .values({
        title,
        description,
        institutionId: institutionId ? Number(institutionId) : null,
        fieldId: fieldId ? Number(fieldId) : null,
        levelId: levelId ? Number(levelId) : null,
        unitId: unitId ? Number(unitId) : null,
        semester: semester ? String(semester) : null,
        academicYear: academicYear ? String(academicYear) : null,
        resourceType,
        isPremium,
        fileName: file.name,
        filePath: saved.relativePath,
        fileSize: saved.size,
        fileMime: file.type,
        status: "pending",
        uploaderId: user.id,
      })
      .returning();

    await logAudit(user.id, "note.uploaded", "note", created.id, { title });

    return jsonOk({ note: created }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
