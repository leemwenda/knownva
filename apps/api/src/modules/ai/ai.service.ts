import OpenAI from "openai";
import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../lib/http-error.js";

// ── 1. Setup the Providers Chain ──
const providers = [
  {
    name: "Groq",
    client: new OpenAI({ apiKey: process.env.GROQ_API_KEY || "missing", baseURL: "https://api.groq.com/openai/v1" }),
    model: "openai/gpt-oss-120b"
  },
  {
    name: "Cerebras",
    client: new OpenAI({ apiKey: process.env.CEREBRAS_API_KEY || "missing", baseURL: "https://api.cerebras.ai/v1" }),
    model: "openai/gpt-oss-120b"
  },
  {
    name: "Gemini",
    client: new OpenAI({ apiKey: process.env.GEMINI_API_KEY || "missing", baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" }),
    model: "openai/gpt-oss-120b"
  }
].filter(p => p.client.apiKey !== "missing"); // Only keep ones with keys

// ── 2. The Core Function (with Fallback) ──
async function askAI(systemPrompt: string, userPrompt: string, expectJson = true) {
  if (providers.length === 0) {
    throw HttpError.badRequest("No AI API keys configured in .env");
  }

  for (const provider of providers) {
    try {
      console.log(`[AI] Trying ${provider.name}...`);
      const response = await provider.client.chat.completions.create({
        model: provider.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response");
      
      console.log(`[AI] Success with ${provider.name}`);
      if (!expectJson) return String(content).trim();
      const text = String(content);
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start === -1 || end <= start) throw new Error("No JSON in model output: " + text.slice(0, 200));
      return JSON.parse(text.slice(start, end + 1));
    } catch (err: any) {
      console.warn(`[AI] ${provider.name} failed: ${err.message}. Trying next provider...`);
      // If it's the last provider, throw the error
      if (provider === providers[providers.length - 1]) {
        throw new HttpError(500, `All AI providers failed: ${err.message}`);
      }
    }
  }
}

export const aiService = {
  async getDocuments(userId: number) {
    return prisma.aIDocument.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  async uploadDocument(userId: number, file: Express.Multer.File, text: string) {
    return prisma.aIDocument.create({
      data: { userId, fileName: file.originalname, textContent: text },
    });
  },

  async chat(documentId: number, userId: number, message: string) {
    const doc = await prisma.aIDocument.findFirst({ where: { id: documentId, userId } });
    if (!doc) throw HttpError.notFound("Document not found");

    await prisma.aIChatMessage.create({ data: { documentId, userId, role: "user", content: message } });

    const systemPrompt = `You are a helpful academic tutor. Answer the user's question using ONLY this text: "${doc.textContent.substring(0, 10000)}". If the answer isn't in the text, say so.`;
    
    const answer = await askAI(systemPrompt, message, false);

    return prisma.aIChatMessage.create({ data: { documentId, userId, role: "assistant", content: answer } });
  },

  async getQuizzes(userId: number, documentId?: number) {
    return prisma.quizQuestion.findMany({ where: { userId, ...(documentId ? { documentId } : {}) }, orderBy: { id: "asc" } });
  },

  async generateStudyPack(documentId: number, userId: number) {
    const doc = await prisma.aIDocument.findFirst({ where: { id: documentId, userId } });
    if (!doc) throw HttpError.notFound("Document not found");

    const systemPrompt = `You are an expert academic content creator. Return a JSON object with this EXACT structure:
    {
      "summary": "Point-form study notes: short headings, each followed by bullet points starting with - ",
      "flashcards": [{ "front": "A clear question or term", "back": "A detailed explanation of 3 to 5 sentences with a short example" }],
      "quiz": [{ "question": "Question?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "Why it's correct" }],
      "studyPlan": [{ "day": 1, "focus": "Topic to study", "task": "Read chapter 1" }]
    }`;
    
    const userPrompt = `Generate a study pack based on this text: ${doc.textContent.substring(0, 12000)}`;
    
    const pack = await askAI(systemPrompt, userPrompt);

    // Save the generated data to the database so they appear in the dashboards
    let savedQuiz = 0;
    if (Array.isArray(pack.quiz)) {
      for (const q of pack.quiz.slice(0, 10)) {
        if (!q?.question || !Array.isArray(q.options)) continue;
        await prisma.quizQuestion.create({
          data: { userId, documentId, question: String(q.question), options: q.options, correctIndex: Number(q.correctIndex) || 0, explanation: String(q.explanation || "") }
        });
        savedQuiz++;
      }
    }

    let savedFlashcards = 0;
    if (pack.flashcards && Array.isArray(pack.flashcards)) {
      for (const fc of pack.flashcards.slice(0, 10)) {
        await prisma.flashcard.create({
          data: { userId, front: fc.front, back: fc.back, deckName: doc.fileName.split('.')[0] }
        });
        savedFlashcards++;
      }
    }

    return { 
      summary: pack.summary, 
      quizzesGenerated: savedQuiz, 
      flashcardsGenerated: savedFlashcards,
      studyPlanGenerated: pack.studyPlan?.length || 0
    };
  }
};
