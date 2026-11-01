"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Card, EmptyState, Select, SkeletonBlock } from "@/components/ui";
import { api } from "@/lib/client-api";
import type { AcademicStructure, NoteRecord } from "@/lib/types";

interface NotesResponse {
  ok: true;
  items: NoteRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function ExploreBrowser({ basePath = "/explore" }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [structure, setStructure] = useState<AcademicStructure | null>(null);
  const [data, setData] = useState<NotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const q = searchParams.get("q") || "";
  const fieldId = searchParams.get("fieldId") || "";
  const levelId = searchParams.get("levelId") || "";
  const institutionId = searchParams.get("institutionId") || "";
  const resourceType = searchParams.get("resourceType") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.delete("page");
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, basePath],
  );

  useEffect(() => {
    api.get<{ ok: true } & AcademicStructure>("/api/meta/structure").then(setStructure).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (fieldId) params.set("fieldId", fieldId);
    if (levelId) params.set("levelId", levelId);
    if (institutionId) params.set("institutionId", institutionId);
    if (resourceType) params.set("resourceType", resourceType);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("pageSize", "12");

    api
      .get<NotesResponse>(`/api/notes?${params.toString()}`)
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load resources"))
      .finally(() => setLoading(false));
  }, [q, fieldId, levelId, institutionId, resourceType, sort, page]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Filters</h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--foreground)]/60">Field of study</label>
              <Select value={fieldId} onChange={(e) => updateParam("fieldId", e.target.value)}>
                <option value="">All fields</option>
                {structure?.fields.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--foreground)]/60">Academic level</label>
              <Select value={levelId} onChange={(e) => updateParam("levelId", e.target.value)}>
                <option value="">All levels</option>
                {structure?.levels.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--foreground)]/60">Institution</label>
              <Select value={institutionId} onChange={(e) => updateParam("institutionId", e.target.value)}>
                <option value="">All institutions</option>
                {structure?.institutions.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--foreground)]/60">Resource type</label>
              <Select value={resourceType} onChange={(e) => updateParam("resourceType", e.target.value)}>
                <option value="">All types</option>
                <option value="Notes">Notes</option>
                <option value="Past Paper">Past Paper</option>
                <option value="Assignment">Assignment</option>
                <option value="Revision Guide">Revision Guide</option>
                <option value="Slides">Slides</option>
              </Select>
            </div>
          </div>
        </Card>
      </aside>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--foreground)]/60">
            {loading ? "Searching…" : `${data?.total ?? 0} resource${data?.total === 1 ? "" : "s"} found`}
          </p>
          <Select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className="w-44">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="popular">Most downloaded</option>
            <option value="rating">Top rated</option>
          </Select>
        </div>

        {error && (
          <Card className="mb-4 border-red-500/30 text-sm text-red-500">{error}</Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-48" />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: data.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParam("page", String(i + 1))}
                    className={`kv-focus h-9 w-9 rounded-lg text-sm font-medium transition ${
                      page === i + 1
                        ? "bg-teal-500 text-white"
                        : "border border-[var(--border-subtle)] text-[var(--foreground)]/70 hover:bg-[var(--surface-muted)]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No resources match your filters"
            description="Try removing a filter or searching with a different keyword."
          />
        )}
      </div>
    </div>
  );
}

export function NoteCard({ note }: { note: NoteRecord }) {
  return (
    <Link
      href={`/explore/${note.id}`}
      className="group flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge tone="teal">{note.resourceType}</Badge>
        {note.isPremium ? <Badge tone="violet">Premium</Badge> : <Badge tone="green">Free</Badge>}
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-[var(--foreground)] group-hover:text-teal-500">
        {note.title}
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-xs text-[var(--foreground)]/60">{note.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-[var(--foreground)]/50">
        {note.institutionName && <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5">{note.institutionName}</span>}
        {note.unitName && <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5">{note.unitName}</span>}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--foreground)]/50">
        <span>By {note.uploaderName || "KnowVa contributor"}</span>
        <span>{note.ratingCount > 0 ? `★ ${note.averageRating}` : "No ratings"}</span>
      </div>
    </Link>
  );
}
