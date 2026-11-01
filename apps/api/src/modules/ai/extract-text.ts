import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

export async function extractText(filePath: string, originalName: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase();
  const buf = fs.readFileSync(filePath);
  if (ext === ".pdf") {
    const { PDFParse } = require("pdf-parse");
    const parser = new PDFParse({ data: buf });
    try { return (await parser.getText()).text; } finally { await parser.destroy(); }
  }
  if (ext === ".docx") {
    const mammoth = require("mammoth");
    return (await mammoth.extractRawText({ buffer: buf })).value;
  }
  if ([".txt", ".md", ".csv"].includes(ext)) return buf.toString("utf8");
  throw new Error(`Unsupported file type "${ext || "unknown"}". Use PDF, DOCX or TXT.`);
}
