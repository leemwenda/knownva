import { NextRequest } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole, sanitizeUser } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["superadmin"]);

    const url = request.nextUrl;
    const q = url.searchParams.get("q")?.trim();
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");

    const conditions = [];
    if (q) conditions.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)));
    if (role) conditions.push(eq(users.role, role as (typeof users.role.enumValues)[number]));
    if (status) conditions.push(eq(users.status, status as (typeof users.status.enumValues)[number]));

    let query = db.select().from(users).$dynamic();
    if (conditions.length) query = query.where(and(...conditions));
    const rows = await query.orderBy(desc(users.createdAt)).limit(200);

    return jsonOk({ items: rows.map(sanitizeUser) });
  } catch (error) {
    return handleApiError(error);
  }
}
