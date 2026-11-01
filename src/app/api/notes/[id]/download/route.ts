import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { jsonError, handleApiError } from "@/lib/api";
import { readNoteFile } from "@/lib/storage";
import { recordDownloadAttempt } from "@/lib/download-limit";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Please sign in to download resources");

    const rows = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
    const note = rows[0];
    if (!note) return jsonError("Resource not found", 404);

    const isOwner = note.uploaderId === user.id;
    const isAdmin = user.role === "superadmin";
    if (note.status !== "approved" && !isOwner && !isAdmin) {
      return jsonError("This resource is not available for download", 404);
    }

    const decision = await recordDownloadAttempt(user.id, note.id, note.isPremium);
    if (!decision.allowed) {
      return jsonError(
        `You have reached your free monthly limit of ${decision.limit} premium downloads. Upgrade to KnowVa Premium for unlimited access.`,
        402,
      );
    }

    await db
      .update(notes)
      .set({ downloadsCount: note.downloadsCount + 1 })
      .where(eq(notes.id, id));

    const buffer = await readNoteFile(note.filePath);
    const body = new Uint8Array(buffer);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": note.fileMime,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(note.fileName)}"`,
        "Content-Length": String(buffer.byteLength),
        "X-Download-Remaining": decision.isPremiumPlan ? "unlimited" : String(decision.remaining),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
