import { eq } from "drizzle-orm";
import { db } from "@/db";
import { fields, institutions, levels, units } from "@/db/schema";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const [institutionRows, fieldRows, levelRows, unitRows] = await Promise.all([
      db.select().from(institutions).where(eq(institutions.active, true)),
      db.select().from(fields).where(eq(fields.active, true)),
      db.select().from(levels).where(eq(levels.active, true)),
      db.select().from(units).where(eq(units.active, true)),
    ]);
    return jsonOk({ institutions: institutionRows, fields: fieldRows, levels: levelRows, units: unitRows });
  } catch (error) {
    return handleApiError(error);
  }
}
