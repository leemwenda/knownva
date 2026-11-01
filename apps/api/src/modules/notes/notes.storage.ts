import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";

const STORAGE_ROOT = path.resolve(process.cwd(), env.STORAGE_DIR);
const NOTES_DIR = path.join(STORAGE_ROOT, "notes");

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const MAX_UPLOAD_MB = Number(env.STORAGE_MAX_UPLOAD_MB) || 30;
export const MAX_FILE_SIZE_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export async function saveNoteFile(input: {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}): Promise<{ relativePath: string; size: number }> {
  await mkdir(NOTES_DIR, { recursive: true });
  const ext = path.extname(input.originalname) || ".bin";
  const storedName = crypto.randomBytes(12).toString("hex") + ext;
  const relativePath = path.join("notes", storedName);
  await writeFile(path.join(STORAGE_ROOT, relativePath), input.buffer);
  return { relativePath, size: input.buffer.length };
}

export async function readNoteFile(relativePath: string): Promise<Buffer> {
  // Defence-in-depth: prevent path traversal
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const fullPath = path.join(STORAGE_ROOT, normalized);
  if (!fullPath.startsWith(STORAGE_ROOT + path.sep)) {
    throw HttpError.forbidden("Invalid file path");
  }
  try {
    return await readFile(fullPath);
  } catch {
    throw HttpError.notFound("File not found on disk");
  }
}
