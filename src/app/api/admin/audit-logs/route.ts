import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["superadmin"]);
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
    const pageSize = 50;

    const rows = await db
      .select({ log: auditLogs, actorName: users.name, actorEmail: users.email })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return jsonOk({ items: rows, page, pageSize });
  } catch (error) {
    return handleApiError(error);
  }
}
