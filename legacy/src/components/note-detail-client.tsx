"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, Select, Spinner, Textarea } from "@/components/ui";
import { useToast } from "@/components/toast";
import { api } from "@/lib/client-api";
import type { NoteRecord } from "@/lib/types";

interface ReviewRow {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string | null;
}

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function NoteDetailClient({
  note,
  related,
  currentUserId,
}: {
  note: NoteRecord;
  related: NoteRecord[];
  currentUserId: number | null;
}) {
  const router = useRouter();
  const { show } = useToast();

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [bookmarked, setBookmarked] = useState<boolean | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("Copyright infringement");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ ok: true; reviews: ReviewRow[] }>(`/api/notes/${note.id}/review`)
      .then((res) => setReviews(res.reviews))
      .catch(() => {});
    api
      .get<{ ok: true; items: { note: { id: number } }[] }>(`/api/bookmarks`)
      .then((res) => setBookmarked(res.items.some((b) => b.note.id === note.id)))
      .catch(() => setBookmarked(false));
    // Best-effort view recording
    if (currentUserId) {
      api.post(`/api/notes/${note.id}/view`).catch(() => {});
    }
  }, [note.id, currentUserId]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/notes/${note.id}/download`, { credentials: "include" });
      if (res.status === 401) {
        router.push(`/login?next=/explore/${note.id}`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = data?.error || "Download failed";
        show(message, "error");
        if (res.status === 402) router.push("/student/premium");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = note.fileName || "knowva-resource.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      const remaining = res.headers.get("X-Download-Remaining");
      if (remaining && remaining !== "unlimited") {
        show(`Download started — ${remaining} premium download(s) left this month.`, "success");
      } else {
        show("Download started.", "success");
      }
    } catch {
      show("Network error while downloading. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  }

  async function toggleBookmark() {
    if (!currentUserId) {
      router.push(`/login?next=/explore/${note.id}`);
      return;
    }
    try {
      if (bookmarked) {
        await api.delete(`/api/notes/${note.id}/bookmark`);
        setBookmarked(false);
        show("Removed from bookmarks", "info");
      } else {
        await api.post(`/api/notes/${note.id}/bookmark`);
        setBookmarked(true);
        show("Saved to bookmarks", "success");
      }
    } catch (err) {
      show((err as Error).message || "Could not update bookmark", "error");
    }
  }

  async function submitReport() {
    if (!currentUserId) {
      router.push(`/login?next=/explore/${note.id}`);
      return;
    }
    setReportBusy(true);
    try {
      await api.post(`/api/notes/${note.id}/report`, { reason: reportReason, details: reportDetails });
      show("Report submitted. Our moderation team will review it.", "success");
      setShowReport(false);
      setReportDetails("");
    } catch (err) {
      show((err as Error).message || "Could not submit report", "error");
    } finally {
      setReportBusy(false);
    }
  }

  async function submitReview() {
    if (!currentUserId) {
      router.push(`/login?next=/explore/${note.id}`);
      return;
    }
    if (rating < 1) {
      show("Select a star rating first", "error");
      return;
    }
    setReviewBusy(true);
    try {
      await api.post(`/api/notes/${note.id}/review`, { rating, comment: reviewComment });
      show("Thanks — your review was saved", "success");
      const res = await api.get<{ ok: true; reviews: ReviewRow[] }>(`/api/notes/${note.id}/review`);
      setReviews(res.reviews);
      setReviewComment("");
    } catch (err) {
      show((err as Error).message || "Could not save review", "error");
    } finally {
      setReviewBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="teal">{note.resourceType}</Badge>
            {note.isPremium ? <Badge tone="violet">Premium</Badge> : <Badge tone="green">Free</Badge>}
            {note.status !== "approved" && <Badge tone="amber">Not published — {note.status}</Badge>}
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {note.title}
          </h1>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--foreground)]/70">
            {note.description || "No description provided."}
          </p>

          {note.rejectionReason && note.status === "rejected" && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500">
              <strong>Rejection reason:</strong> {note.rejectionReason}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              { label: "Institution", value: note.institutionName },
              { label: "Field", value: note.fieldName },
              { label: "Level", value: note.levelName },
              { label: "Unit", value: note.unitName },
              { label: "Semester", value: note.semester },
              { label: "Academic year", value: note.academicYear },
              { label: "Downloads", value: String(note.downloadsCount) },
              { label: "Views", value: String(note.viewsCount) },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div key={item.label} className="rounded-xl bg-[var(--surface-muted)] p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--foreground)]/50">{item.label}</p>
                  <p className="mt-1 font-medium text-[var(--foreground)]">{item.value}</p>
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Reviews {note.ratingCount > 0 && <span className="text-teal-500">★ {note.averageRating}</span>}
          </h2>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 && (
              <p className="text-sm text-[var(--foreground)]/60">No reviews yet — be the first to share feedback.</p>
            )}
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-[var(--border-subtle)] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--foreground)]">{r.userName || "KnowVa user"}</p>
                  <p className="text-xs text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                </div>
                {r.comment && <p className="mt-2 text-sm text-[var(--foreground)]/70">{r.comment}</p>}
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Leave a review</h3>
            <div className="mt-3 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  className={`kv-focus text-2xl transition ${star <= rating ? "text-amber-400" : "text-[var(--foreground)]/25"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <Textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="What made this resource useful? (optional)"
              className="mt-3"
            />
            <Button className="mt-3" onClick={submitReview} loading={reviewBusy}>
              Submit review
            </Button>
            <p className="mt-2 text-xs text-[var(--foreground)]/50">You can update your single review any time.</p>
          </div>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <p className="text-xs uppercase tracking-wide text-[var(--foreground)]/50">File</p>
          <p className="mt-2 truncate text-sm font-medium text-[var(--foreground)]">{note.fileName}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/60">
            {formatBytes(note.fileSize)} · {note.fileMime}
          </p>
          <div className="mt-4 space-y-2">
            <Button className="w-full" onClick={handleDownload} loading={downloading}>
              {downloading ? "Preparing…" : "Download resource"}
            </Button>
            <Button variant="secondary" className="w-full" onClick={toggleBookmark} loading={bookmarked === null}>
              {bookmarked ? "★ Bookmarked" : "☆ Add to bookmarks"}
            </Button>
            <Button variant="ghost" className="w-full text-[var(--foreground)]/60" onClick={() => setShowReport((v) => !v)}>
              Report copyright / content issue
            </Button>
          </div>
          {!currentUserId && (
            <p className="mt-3 text-xs text-[var(--foreground)]/60">
              <Link href="/login" className="text-teal-500 hover:underline">
                Sign in
              </Link>{" "}
              to download, bookmark and review.
            </p>
          )}
        </Card>

        {showReport && (
          <Card className="border-amber-500/30">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Report this resource</h3>
            <Select className="mt-3" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
              <option>Copyright infringement</option>
              <option>Inappropriate content</option>
              <option>Wrong or misleading material</option>
              <option>Duplicate upload</option>
            </Select>
            <Textarea
              className="mt-3"
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Explain the issue so moderators can investigate…"
            />
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={submitReport} loading={reportBusy}>
                Submit report
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowReport(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <Card>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Uploader</h3>
          <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{note.uploaderName || "KnowVa contributor"}</p>
          {note.uploaderInstitution && (
            <p className="text-xs text-[var(--foreground)]/60">{note.uploaderInstitution}</p>
          )}
          {note.uploaderBio && <p className="mt-2 text-xs text-[var(--foreground)]/60">{note.uploaderBio}</p>}
        </Card>

        {related.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Related resources</h3>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/explore/${r.id}`}
                    className="block rounded-xl border border-[var(--border-subtle)] p-3 text-sm text-[var(--foreground)]/80 transition hover:border-teal-500/40 hover:text-teal-500"
                  >
                    {r.title}
                    <span className="mt-1 block text-xs text-[var(--foreground)]/50">
                      {r.unitName || r.resourceType}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </aside>
    </div>
  );
}
