import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const STORAGE_DIR = path.resolve(process.cwd(), process.env.STORAGE_DIR || "./storage");
const NOTES_DIR = path.join(STORAGE_DIR, "notes");

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 30MB

async function ensureDir() {
  await mkdir(NOTES_DIR, { recursive: true });
}

export async function saveNoteFile(file: File): Promise<{
  storedName: string;
  relativePath: string;
  size: number;
}> {
  await ensureDir();
  const ext = path.extname(file.name) || "";
  const storedName = `${nanoid(24)}${ext}`;
  const relativePath = path.join("notes", storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(NOTES_DIR, storedName), buffer);
  return { storedName, relativePath, size: buffer.byteLength };
}

export async function readNoteFile(relativePath: string): Promise<Buffer> {
  const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  return readFile(path.join(STORAGE_DIR, safePath));
}

export async function deleteNoteFile(relativePath: string): Promise<void> {
  const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  try {
    await unlink(path.join(STORAGE_DIR, safePath));
  } catch {
    // ignore missing file
  }
}
