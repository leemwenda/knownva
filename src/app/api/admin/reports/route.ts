import { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, reports, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["superadmin"]);
    const status = request.nextUrl.searchParams.get("status");

    const conditions = [];
    if (status) conditions.push(eq(reports.status, status as (typeof reports.status.enumValues)[number]));

    let query = db
      .select({
        report: reports,
        noteTitle: notes.title,
        noteStatus: notes.status,
        reporterName: users.name,
        reporterEmail: users.email,
      })
      .from(reports)
      .leftJoin(notes, eq(reports.noteId, notes.id))
      .leftJoin(users, eq(reports.reporterId, users.id))
      .$dynamic();

    if (conditions.length) query = query.where(and(...conditions));

    const rows = await query.orderBy(desc(reports.createdAt));
    return jsonOk({ items: rows });
  } catch (error) {
    return handleApiError(error);
  }
}
