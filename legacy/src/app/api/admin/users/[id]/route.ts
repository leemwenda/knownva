import { NextRequest } from "next/server";
import { z } from "zod";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole, sanitizeUser, HttpError } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  role: z.enum(["student", "lecturer", "superadmin"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["superadmin"]);
    const { id: idParam } = await params;
    const id = Number(idParam);

    const targetRows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const target = targetRows[0];
    if (!target) return jsonError("User not found", 404);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid input", 422);
    }

    const wouldDemote = parsed.data.role && parsed.data.role !== "superadmin" && target.role === "superadmin";
    const wouldSuspend = parsed.data.status === "suspended" && target.role === "superadmin";

    if ((wouldDemote || wouldSuspend) && target.id !== admin.id) {
      // still fine, only protect the LAST active superadmin below
    }

    if ((wouldDemote || wouldSuspend)) {
      const activeSuperadmins = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(and(eq(users.role, "superadmin"), eq(users.status, "active"), ne(users.id, target.id)));
      const remaining = activeSuperadmins[0]?.count ?? 0;
      if (remaining < 1) {
        throw new HttpError(409, "At least one active superadmin must remain");
      }
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.role) updates.role = parsed.data.role;
    if (parsed.data.status) updates.status = parsed.data.status;

    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();

    await logAudit(admin.id, "user.updated", "user", id, parsed.data);

    return jsonOk({ user: sanitizeUser(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
