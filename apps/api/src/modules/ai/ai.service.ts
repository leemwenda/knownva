import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const aiService = {
  async generateAnswer(documentText: string, userMessage: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulating a real LLM reading the context
    if (!documentText || documentText.length < 10) {
      return "I couldn't read enough text from this document. It might be a scanned image or empty.";
    }

    const query = userMessage.toLowerCase();
    
    if (query.includes("summary") || query.includes("summarize")) {
      return `Based on the document "${documentText.substring(0, 50).trim()}...", here is a summary: The text primarily discusses key academic concepts, outlining definitions and frameworks. It is approximately ${documentText.length} characters long and covers the core material you need to study.`;
    }

    if (query.includes("exam") || query.includes("question")) {
      return "Here is a practice question based on your document: What are the main differences between the concepts outlined in the first paragraph?";
    }

    return `I've analyzed your document. Regarding your question: "${userMessage}", the text emphasizes that this topic is foundational. It appears to be discussed in detail within the provided material.`;
  },

  async getDocuments(userId: number) {
    return prisma.aIDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, fileName: true, createdAt: true }
    });
  },

  async uploadDocument(userId: number, file: Express.Multer.File) {
    let text = "";
    try {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdf(dataBuffer);
      text = pdfData.text;
    } catch (err) {
      console.error("PDF parse error:", err);
    }

    return prisma.aIDocument.create({
      data: {
        userId,
        fileName: file.originalname,
        textContent: text,
      },
    });
  },

  async getChatHistory(documentId: number, userId: number) {
    const doc = await prisma.aIDocument.findFirst({ where: { id: documentId, userId } });
    if (!doc) throw HttpError.notFound("Document not found");
    return prisma.aIChatMessage.findMany({ where: { documentId }, orderBy: { createdAt: "asc" } });
  },

  async chat(documentId: number, userId: number, message: string) {
    const doc = await prisma.aIDocument.findFirst({ where: { id: documentId, userId } });
    if (!doc) throw HttpError.notFound("Document not found");

    await prisma.aIChatMessage.create({ data: { documentId, userId, role: "user", content: message } });
    const aiResponse = await this.generateAnswer(doc.textContent, message);
    return prisma.aIChatMessage.create({ data: { documentId, userId, role: "assistant", content: aiResponse } });
  },
};
