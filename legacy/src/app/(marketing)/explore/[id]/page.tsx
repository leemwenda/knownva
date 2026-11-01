import { notFound } from "next/navigation";
import { and, desc, eq, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { fields, institutions, levels, notes, units, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { NoteDetailClient } from "@/components/note-detail-client";

export const dynamic = "force-dynamic";

async function getNote(id: number) {
  const rows = await db
    .select({
      note: notes,
      uploaderName: users.name,
      uploaderBio: users.bio,
      uploaderInstitution: users.institution,
      institutionName: institutions.name,
      fieldName: fields.name,
      levelName: levels.name,
      unitName: units.name,
    })
    .from(notes)
    .leftJoin(users, eq(notes.uploaderId, users.id))
    .leftJoin(institutions, eq(notes.institutionId, institutions.id))
    .leftJoin(fields, eq(notes.fieldId, fields.id))
    .leftJoin(levels, eq(notes.levelId, levels.id))
    .leftJoin(units, eq(notes.unitId, units.id))
    .where(eq(notes.id, id))
    .limit(1);
  return rows[0] || null;
}

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const row = await getNote(id);
  const user = await getCurrentUser();
  const isOwnerOrAdmin = user && (user.id === row?.note.uploaderId || user.role === "superadmin");

  if (!row || (row.note.status !== "approved" && !isOwnerOrAdmin)) {
    notFound();
  }

  const relatedConditions = [eq(notes.status, "approved"), ne(notes.id, id)];
  const matchConditions = [];
  if (row.note.unitId) matchConditions.push(eq(notes.unitId, row.note.unitId));
  if (row.note.fieldId) matchConditions.push(eq(notes.fieldId, row.note.fieldId));

  const related = matchConditions.length
    ? await db
        .select()
        .from(notes)
        .where(and(...relatedConditions, or(...matchConditions)))
        .orderBy(desc(notes.downloadsCount))
        .limit(4)
    : [];

  const note = {
    ...row.note,
    uploaderName: row.uploaderName,
    uploaderBio: row.uploaderBio,
    uploaderInstitution: row.uploaderInstitution,
    institutionName: row.institutionName,
    fieldName: row.fieldName,
    levelName: row.levelName,
    unitName: row.unitName,
    averageRating: row.note.ratingCount > 0 ? Number((row.note.ratingSum / row.note.ratingCount).toFixed(1)) : 0,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <NoteDetailClient
        note={JSON.parse(JSON.stringify(note))}
        related={JSON.parse(JSON.stringify(related))}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
}
