import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";

const STORAGE_ROOT = path.resolve(process.cwd(), env.STORAGE_DIR);
const PRIVATE_DIR = path.join(STORAGE_ROOT, "private_notes");

export const PRIVATE_ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
]);

export const PRIVATE_MAX_SIZE = 25 * 1024 * 1024;

export async function savePrivateFile(input: {
  buffer: Buffer; originalname: string; mimetype: string;
}): Promise<{ relativePath: string; size: number }> {
  await mkdir(PRIVATE_DIR, { recursive: true });
  const ext = path.extname(input.originalname) || ".bin";
  const storedName = crypto.randomBytes(12).toString("hex") + ext;
  const relativePath = path.join("private_notes", storedName);
  await writeFile(path.join(STORAGE_ROOT, relativePath), input.buffer);
  return { relativePath, size: input.buffer.length };
}

export async function readPrivateFile(relativePath: string): Promise<Buffer> {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const fullPath = path.join(STORAGE_ROOT, normalized);
  if (!fullPath.startsWith(STORAGE_ROOT + path.sep)) throw HttpError.forbidden("Invalid path");
  try { return await readFile(fullPath); }
  catch { throw HttpError.notFound("File not found"); }
}
