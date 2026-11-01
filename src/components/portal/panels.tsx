"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  History,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, Label, Select, SkeletonBlock, StatCard, Textarea } from "@/components/ui";
import { useToast } from "@/components/toast";
import { api } from "@/lib/client-api";
import type { AcademicStructure, NoteRecord, PublicUser, SubscriptionRecord } from "@/lib/types";

/* ------------------------------------------------------------------ helpers */

interface SimpleNote {
  id: number;
  title: string;
  description?: string;
  resourceType?: string;
  isPremium?: boolean;
  status?: string;
  fileName?: string;
  downloadsCount?: number;
  ratingSum?: number;
  ratingCount?: number;
  rejectionReason?: string | null;
  fileSize?: number;
  createdAt?: string;
  institutionName?: string | null;
  unitName?: string | null;
  levelName?: string | null;
  fieldName?: string | null;
  uploaderName?: string | null;
}

function formatBytes(bytes = 0) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function StatusBadge({ status }: { status?: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge tone="green">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </Badge>
      );
    case "pending":
      return (
        <Badge tone="amber">
          <Clock className="h-3 w-3" /> Pending review
        </Badge>
      );
    case "rejected":
      return (
        <Badge tone="red">
          <XCircle className="h-3 w-3" /> Rejected
        </Badge>
      );
    case "removed":
      return <Badge tone="red">Removed</Badge>;
    default:
      return <Badge tone="neutral">{status || "Unknown"}</Badge>;
  }
}

export function useDownload() {
  const router = useRouter();
  const { show } = useToast();
  const [busyId, setBusyId] = useState<number | null>(null);

  const download = useCallback(
    async (id: number, fileName?: string) => {
      setBusyId(id);
      try {
        const res = await fetch(`/api/notes/${id}/download`, { credentials: "include" });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          show(data?.error || "Download failed", "error");
          if (res.status === 402) router.push("/student/premium");
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || "knowva-resource";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        show("Download started", "success");
      } catch {
        show("Network error during download", "error");
      } finally {
        setBusyId(null);
      }
    },
    [router, show],
  );

  return { download, busyId };
}

function NoteRow({
  note,
  meta,
  actions,
}: {
  note: SimpleNote;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/explore/${note.id}`}
            className="truncate text-sm font-semibold text-[var(--foreground)] hover:text-teal-500"
          >
            {note.title}
          </Link>
          {note.isPremium ? <Badge tone="violet">Premium</Badge> : <Badge tone="green">Free</Badge>}
          {note.resourceType && <Badge tone="teal">{note.resourceType}</Badge>}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--foreground)]/55">
          {meta}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}

/* --------------------------------------------------------------- bookmarks */

export function BookmarksPanel() {
  const { show } = useToast();
  const { download, busyId } = useDownload();
  const [items, setItems] = useState<SimpleNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get<{ ok: true; items: { note: SimpleNote }[] }>("/api/bookmarks")
      .then((res) => setItems(res.items.map((r) => r.note)))
      .catch(() => show("Could not load bookmarks", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(id: number) {
    await api.delete(`/api/notes/${id}/bookmark`);
    setItems((prev) => prev.filter((n) => n.id !== id));
    show("Bookmark removed", "info");
  }

  const filtered = useMemo(
    () => items.filter((n) => n.title.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-20" />)}</div>;

  if (!items.length) {
    return (
      <EmptyState
        icon={<Bookmark className="h-7 w-7" />}
        title="No bookmarks yet"
        description="Save resources from the explore page to build a personal reading list."
        action={
          <Link href="../explore">
            <Button size="sm">Browse resources</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Input placeholder="Search your bookmarks…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="space-y-3">
        {filtered.map((note) => (
          <NoteRow
            key={note.id}
            note={note}
            meta={
              <>
                <span>{note.downloadsCount ?? 0} downloads</span>
                {note.ratingCount ? <span>★ {(note.ratingSum! / note.ratingCount).toFixed(1)}</span> : null}
              </>
            }
            actions={
              <>
                <Button size="sm" variant="secondary" onClick={() => download(note.id, note.fileName)} loading={busyId === note.id}>
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(note.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            }
          />
        ))}
        {!filtered.length && <p className="text-sm text-[var(--foreground)]/60">No bookmarks match that search.</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- recently viewed */

export function RecentViewsPanel() {
  const { download, busyId } = useDownload();
  const [items, setItems] = useState<{ note: SimpleNote; viewedAt?: string; lastViewedAt?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ ok: true; items: { note: SimpleNote; lastViewedAt: string }[] }>("/api/recently-viewed")
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonBlock className="h-24" />;

  if (!items.length) {
    return (
      <EmptyState
        icon={<History className="h-7 w-7" />}
        title="Nothing viewed yet"
        description="Resources you open will appear here so you can pick up where you left off."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((row) => (
        <NoteRow
          key={row.note.id}
          note={row.note}
          meta={<span>Viewed {formatDate(row.lastViewedAt)}</span>}
          actions={
            <Button size="sm" variant="secondary" onClick={() => download(row.note.id, row.note.fileName)} loading={busyId === row.note.id}>
              <Download className="h-4 w-4" /> Download
            </Button>
          }
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- my library */

export function MyLibraryPanel() {
  const { download, busyId } = useDownload();
  const [items, setItems] = useState<{ note: SimpleNote; downloadedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ ok: true; items: { note: SimpleNote; downloadedAt: string }[] }>("/api/me/downloads")
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonBlock className="h-24" />;

  if (!items.length) {
    return (
      <EmptyState
        icon={<FileText className="h-7 w-7" />}
        title="Your library is empty"
        description="Resources you download are collected here for quick re-access."
      />
    );
  }

  const unique = items.filter(
    (row, index, arr) => arr.findIndex((r) => r.note.id === row.note.id) === index,
  );

  return (
    <div className="space-y-3">
      {unique.map((row) => (
        <NoteRow
          key={row.note.id}
          note={row.note}
          meta={
            <>
              <span>Downloaded {formatDate(row.downloadedAt)}</span>
              <span>{formatBytes(row.note.fileSize)}</span>
            </>
          }
          actions={
            <Button size="sm" variant="secondary" onClick={() => download(row.note.id, row.note.fileName)} loading={busyId === row.note.id}>
              <Download className="h-4 w-4" /> Re-download
            </Button>
          }
        />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------- private notes */

interface PrivateNote {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function PrivateNotesPanel() {
  const { show } = useToast();
  const [items, setItems] = useState<PrivateNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<PrivateNote | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api
      .get<{ ok: true; items: PrivateNote[] }>("/api/private-notes")
      .then((res) => setItems(res.items))
      .catch(() => show("Could not load your notes", "error"))
      .finally(() => setLoading(false));
  }, [show]);

  useEffect(load, [load]);

  function startNew() {
    setEditing({ id: 0, title: "", content: "", createdAt: "", updatedAt: "" });
    setTitle("");
    setContent("");
  }

  function startEdit(note: PrivateNote) {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
  }

  async function save() {
    if (!title.trim()) {
      show("Give your note a title first", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing && editing.id) {
        const res = await api.patch<{ ok: true; note: PrivateNote }>(`/api/private-notes/${editing.id}`, {
          title,
          content,
        });
        setItems((prev) => prev.map((n) => (n.id === res.note.id ? res.note : n)));
      } else {
        const res = await api.post<{ ok: true; note: PrivateNote }>("/api/private-notes", { title, content });
        setItems((prev) => [res.note, ...prev]);
      }
      setEditing(null);
      show("Note saved", "success");
    } catch (err) {
      show((err as Error).message || "Could not save note", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    try {
      await api.delete(`/api/private-notes/${id}`);
      setItems((prev) => prev.filter((n) => n.id !== id));
      show("Note deleted", "info");
    } catch (err) {
      show((err as Error).message || "Could not delete note", "error");
    }
  }

  const filtered = useMemo(
    () =>
      items.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input placeholder="Search your study notes…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
        <Button size="sm" onClick={startNew}>
          <Plus className="h-4 w-4" /> New note
        </Button>
      </div>

      {editing && (
        <Card>
          <Label htmlFor="note-title">Title</Label>
          <Input id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Binary tree traversal cheat-sheet" />
          <Label htmlFor="note-content" className="mt-4">
            Content
          </Label>
          <Textarea
            id="note-content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write anything — only you can see these notes."
          />
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={save} loading={saving}>
              Save note
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <SkeletonBlock className="h-24" />
      ) : !items.length ? (
        <EmptyState
          icon={<Pencil className="h-7 w-7" />}
          title="No private notes yet"
          description="Private notes stay tied to your account and are never published or shared."
          action={<Button size="sm" onClick={startNew}>Create your first note</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((note) => (
            <Card key={note.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">{note.title}</h3>
                <div className="flex gap-1">
                  <button className="kv-focus rounded-lg p-1.5 text-[var(--foreground)]/50 hover:bg-[var(--surface-muted)] hover:text-teal-500" onClick={() => startEdit(note)} aria-label="Edit note">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="kv-focus rounded-lg p-1.5 text-[var(--foreground)]/50 hover:bg-red-500/10 hover:text-red-500" onClick={() => remove(note.id)} aria-label="Delete note">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-line text-sm text-[var(--foreground)]/70">
                {note.content || "No content yet."}
              </p>
              <p className="mt-3 text-xs text-[var(--foreground)]/45">Updated {formatDate(note.updatedAt)}</p>
            </Card>
          ))}
          {!filtered.length && <p className="text-sm text-[var(--foreground)]/60">No notes match that search.</p>}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- premium */

export function PremiumPanel({ user }: { user: PublicUser }) {
  const { show } = useToast();
  const [summary, setSummary] = useState<{ subscription: SubscriptionRecord | null; usage: { used: number; limit: number; remaining: number } } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ ok: true; subscription: SubscriptionRecord | null; usage: { used: number; limit: number; remaining: number } }>(
        "/api/student/dashboard",
      )
      .then((res) => setSummary({ subscription: res.subscription, usage: res.usage }))
      .catch(() => {});
  }, []);

  const isPremium = summary?.subscription?.plan === "premium" && summary?.subscription?.status === "active";

  async function upgrade() {
    setBusy(true);
    try {
      const res = await api.post<{ ok: true; url: string; warning?: string }>("/api/billing/checkout");
      if (res.warning) show(res.warning, "info");
      if (res.url) window.location.href = res.url;
    } catch (err) {
      show((err as Error).message || "Could not start checkout", "error");
    } finally {
      setBusy(false);
    }
  }

  const usage = summary?.usage;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {isPremium ? "KnowVa Premium is active" : "Free plan"}
            </h2>
            <p className="mt-1 text-sm text-[var(--foreground)]/60">
              {isPremium
                ? "Unlimited premium downloads while your subscription is active."
                : "You can download up to 3 premium resources each calendar month."}
            </p>
          </div>
          <Badge tone={isPremium ? "violet" : "neutral"}>{isPremium ? "Premium" : "Free"}</Badge>
        </div>

        {usage && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--foreground)]/60">Premium downloads this month</span>
              <span className="font-medium text-[var(--foreground)]">
                {isPremium ? `${usage.used} (unlimited)` : `${usage.used} / ${usage.limit}`}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-violet-500 transition-all"
                style={{ width: isPremium ? "100%" : `${Math.min(100, (usage.used / Math.max(1, usage.limit)) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--foreground)]/50">
              {isPremium
                ? "Resets on the 1st of each month."
                : `${usage.remaining} premium download${usage.remaining === 1 ? "" : "s"} left this month.`}
            </p>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-[var(--border-subtle)] p-4 text-xs text-[var(--foreground)]/60">
          The monthly limit is verified on the server inside a database transaction, so opening a download URL
          directly or sending parallel requests cannot bypass it.
        </div>
      </Card>

      <Card className="kv-glass">
        <h3 className="text-base font-semibold text-[var(--foreground)]">Upgrade</h3>
        <p className="mt-1 text-3xl font-semibold text-[var(--foreground)]">
          KSh 300<span className="text-sm font-normal text-[var(--foreground)]/50">/month</span>
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]/70">
          <li>• Unlimited premium resources</li>
          <li>• Support for moderated, verified content</li>
          <li>• Cancel any time</li>
        </ul>
        {isPremium ? (
          <Button className="mt-6 w-full" variant="secondary" disabled>
            Already subscribed
          </Button>
        ) : (
          <Button className="mt-6 w-full" onClick={upgrade} loading={busy}>
            {busy ? "Redirecting…" : "Upgrade with Stripe"}
          </Button>
        )}
        <p className="mt-3 text-center text-xs text-[var(--foreground)]/50">Signed in as {user.email}</p>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------- profile/settings */

export function ProfilePanel({ user }: { user: PublicUser }) {
  const { show } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    name: user.name,
    institution: user.institution || "",
    fieldOfStudy: user.fieldOfStudy || "",
    bio: user.bio || "",
  });
  const [busy, setBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch("/api/me", form);
      show("Profile updated", "success");
      router.refresh();
    } catch (err) {
      show((err as Error).message || "Could not save profile", "error");
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    try {
      const res = await api.post<{ ok: true; sent: boolean }>("/api/auth/resend-verification");
      setEmailSent(true);
      show(res.sent ? "Verification email sent" : "No SMTP configured — link written to server log", "info");
    } catch {
      show("Could not send verification email", "error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      <Card>
        <h2 className="text-base font-semibold text-[var(--foreground)]">Your profile</h2>
        <form onSubmit={save} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-name">Full name</Label>
              <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="p-email">Email</Label>
              <Input id="p-email" value={user.email} disabled />
            </div>
            <div>
              <Label htmlFor="p-inst">Institution</Label>
              <Input id="p-inst" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="p-field">Field of study</Label>
              <Input id="p-field" value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="p-bio">Short biography {user.role === "lecturer" ? "(shown on your published resources)" : ""}</Label>
            <Textarea id="p-bio" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <Button type="submit" loading={busy}>
            Save changes
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Account status</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--foreground)]/60">Role</dt>
              <dd className="capitalize text-[var(--foreground)]">{user.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--foreground)]/60">Member since</dt>
              <dd className="text-[var(--foreground)]">{formatDate(user.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[var(--foreground)]/60">Email verified</dt>
              <dd>{user.emailVerified ? <Badge tone="green">Yes</Badge> : <Badge tone="amber">No</Badge>}</dd>
            </div>
          </dl>
          {!user.emailVerified && (
            <Button size="sm" variant="secondary" className="mt-4 w-full" onClick={resendVerification}>
              {emailSent ? "Link re-sent" : "Send verification email"}
            </Button>
          )}
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Privacy</h3>
          <p className="mt-2 text-xs text-[var(--foreground)]/60">
            Your email is never shown on resources. Lecturers control which profile text appears publicly via the
            biography field above.
          </p>
        </Card>
      </div>
    </div>
  );
}

export function SettingsPanel({ user }: { user: PublicUser }) {
  const { show } = useToast();
  const router = useRouter();
  const [prefs, setPrefs] = useState({ compactTables: false, autoDownload: false });
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [busy, setBusy] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.next.length < 8) {
      show("New password must be at least 8 characters", "error");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/auth/change-password", { currentPassword: passwords.current, newPassword: passwords.next });
      show("Password changed", "success");
      setPasswords({ current: "", next: "" });
      router.refresh();
    } catch (err) {
      show((err as Error).message || "Could not change password", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="text-base font-semibold text-[var(--foreground)]">Change password</h2>
        <p className="mt-1 text-xs text-[var(--foreground)]/60">
          Prefer email recovery? Use <Link href="/forgot-password" className="text-teal-500">forgot password</Link>.
        </p>
        <form onSubmit={changePassword} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="cur">Current password</Label>
            <Input id="cur" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
          </div>
          <Button type="submit" loading={busy}>
            Update password
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <Card>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Interface preferences</h2>
          <div className="mt-4 space-y-3 text-sm">
            {(
              [
                { key: "compactTables", label: "Compact tables and lists" },
                { key: "autoDownload", label: "Open files automatically after download" },
              ] as const
            ).map((pref) => (
              <label key={pref.key} className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-3 py-2.5">
                <span className="text-[var(--foreground)]/75">{pref.label}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-teal-500"
                  checked={prefs[pref.key]}
                  onChange={(e) => {
                    const value = e.target.checked;
                    setPrefs((p) => ({ ...p, [pref.key]: value }));
                    try {
                      localStorage.setItem(`knowva-pref-${pref.key}`, String(value));
                      show("Preference saved", "success");
                    } catch {
                      show("Could not save preference", "error");
                    }
                  }}
                />
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Danger zone</h2>
          <p className="mt-2 text-xs text-[var(--foreground)]/60">
            Deleting your KnowVa account removes your private notes, bookmarks and reviews. Uploads you published
            stay attributed to a deactivated author. Contact an administrator to request account deletion.
          </p>
          <p className="mt-3 text-xs text-[var(--foreground)]/50">Signed in as {user.email}</p>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ student dashboard */

interface StudentDashboardData {
  ok: true;
  subscription: SubscriptionRecord | null;
  usage: { used: number; limit: number; remaining: number };
  counts: { bookmarks: number; privateNotes: number };
  recentViews: { note: SimpleNote; viewedAt: string }[];
  recentBookmarks: { note: SimpleNote; createdAt: string }[];
  recommended: { note: SimpleNote; uploaderName: string | null }[];
}

export function StudentDashboardPanel({ user }: { user: PublicUser }) {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    api
      .get<StudentDashboardData>("/api/student/dashboard")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isPremium = data?.subscription?.plan === "premium";

  return (
    <div className="space-y-6">
      <Card className="kv-glass border-teal-500/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--foreground)]/60">Welcome back,</p>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">{user.name.split(" ")[0]}</h1>
            <p className="mt-1 text-sm text-[var(--foreground)]/60">
              {isPremium
                ? "Premium is active — unlimited downloads this month."
                : `You have ${data?.usage.remaining ?? "—"} premium download${(data?.usage.remaining ?? 0) === 1 ? "" : "s"} left this month.`}
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/student/explore?q=${encodeURIComponent(query)}`);
            }}
            className="flex w-full gap-2 sm:max-w-sm"
          >
            <Input placeholder="Search notes, units, topics…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Premium downloads left" value={loading ? "—" : isPremium ? "∞" : data!.usage.remaining} hint={`Limit ${data?.usage.limit ?? 3} / month on free`} icon={<Download className="h-4 w-4" />} />
        <StatCard label="Bookmarks" value={loading ? "—" : data!.counts.bookmarks} icon={<Bookmark className="h-4 w-4" />} />
        <StatCard label="Study notes" value={loading ? "—" : data!.counts.privateNotes} icon={<Pencil className="h-4 w-4" />} />
        <StatCard label="Plan" value={isPremium ? "Premium" : "Free"} hint={isPremium ? "Unlimited access" : "Upgrade for unlimited"} icon={<Star className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Recently viewed</h2>
            <Link href="recently-viewed" className="text-xs font-medium text-teal-500 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <SkeletonBlock className="h-20" />
          ) : data!.recentViews.length === 0 ? (
            <p className="text-sm text-[var(--foreground)]/60">Nothing viewed yet.</p>
          ) : (
            <ul className="space-y-2">
              {data!.recentViews.map((row) => (
                <li key={row.note.id}>
                  <Link href={`/explore/${row.note.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-[var(--surface-muted)]">
                    <FileText className="h-4 w-4 shrink-0 text-teal-500" />
                    <span className="min-w-0 flex-1 truncate text-sm text-[var(--foreground)]">{row.note.title}</span>
                    <span className="shrink-0 text-xs text-[var(--foreground)]/50">{formatDate(row.viewedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Saved for later</h2>
            <Link href="bookmarks" className="text-xs font-medium text-teal-500 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <SkeletonBlock className="h-20" />
          ) : data!.recentBookmarks.length === 0 ? (
            <p className="text-sm text-[var(--foreground)]/60">No bookmarks yet.</p>
          ) : (
            <ul className="space-y-2">
              {data!.recentBookmarks.map((row) => (
                <li key={row.note.id}>
                  <Link href={`/explore/${row.note.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-[var(--surface-muted)]">
                    <Bookmark className="h-4 w-4 shrink-0 text-teal-500" />
                    <span className="min-w-0 flex-1 truncate text-sm text-[var(--foreground)]">{row.note.title}</span>
                    {row.note.isPremium && <Badge tone="violet">Premium</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Recommended for you</h2>
          <Link href="explore" className="text-xs font-medium text-teal-500 hover:underline">
            Explore everything
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data!.recommended.map(({ note, uploaderName }) => (
              <Link key={note.id} href={`/explore/${note.id}`} className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 transition hover:border-teal-500/40">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="teal">{note.resourceType}</Badge>
                  {note.isPremium ? <Badge tone="violet">Premium</Badge> : <Badge tone="green">Free</Badge>}
                </div>
                <p className="mt-2.5 line-clamp-2 text-sm font-semibold text-[var(--foreground)] group-hover:text-teal-500">{note.title}</p>
                <p className="mt-2 text-xs text-[var(--foreground)]/55">
                  {uploaderName ? `By ${uploaderName}` : "KnowVa contributor"} · {note.downloadsCount ?? 0} downloads
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------- lecturer dashboard */

interface LecturerDashboardData {
  ok: true;
  counts: { pending: number; approved: number; rejected: number; removed: number };
  totalResources: number;
  totalDownloads: number;
  totalViews: number;
  averageRating: number;
  recentDecisions: { id: number; title: string; status: string; rejectionReason: string | null; reviewedAt: string }[];
}

export function LecturerDashboardPanel() {
  const [data, setData] = useState<LecturerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<LecturerDashboardData>("/api/lecturer/dashboard")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <SkeletonBlock key={i} className="h-28" />)}</div>;
  if (!data) return <EmptyState title="Could not load your dashboard" description="Please refresh to try again." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total uploads" value={data.totalResources} icon={<UploadCloud className="h-4 w-4" />} />
        <StatCard label="Published" value={data.counts.approved} hint={`${data.counts.pending} awaiting review`} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Downloads" value={data.totalDownloads} hint={`${data.totalViews} views`} icon={<Download className="h-4 w-4" />} />
        <StatCard label="Average rating" value={data.averageRating || "—"} hint="Across your resources" icon={<Star className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Moderation pipeline</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "Pending review", value: data.counts.pending, tone: "bg-amber-500" },
              { label: "Approved", value: data.counts.approved, tone: "bg-emerald-500" },
              { label: "Rejected", value: data.counts.rejected, tone: "bg-red-500" },
              { label: "Removed", value: data.counts.removed, tone: "bg-slate-500" },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/65">{row.label}</span>
                  <span className="font-medium text-[var(--foreground)]">{row.value}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div className={`h-full ${row.tone}`} style={{ width: `${Math.min(100, (row.value / Math.max(1, data.totalResources)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent moderation decisions</h2>
          {data.recentDecisions.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--foreground)]/60">No decisions recorded yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.recentDecisions.map((d) => (
                <li key={d.id} className="rounded-xl border border-[var(--border-subtle)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/explore/${d.id}`} className="truncate text-sm font-medium text-[var(--foreground)] hover:text-teal-500">
                      {d.title}
                    </Link>
                    <StatusBadge status={d.status} />
                  </div>
                  {d.rejectionReason && <p className="mt-1.5 text-xs text-red-500">{d.rejectionReason}</p>}
                  <p className="mt-1 text-xs text-[var(--foreground)]/45">{formatDate(d.reviewedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ upload form */

export function UploadPanel() {
  const { show } = useToast();
  const router = useRouter();
  const [structure, setStructure] = useState<AcademicStructure | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    institutionId: "",
    fieldId: "",
    levelId: "",
    unitId: "",
    semester: "Semester 1",
    academicYear: "",
    resourceType: "Notes",
    isPremium: false,
    confirmedOwnership: false,
  });

  useEffect(() => {
    api.get<{ ok: true } & AcademicStructure>("/api/meta/structure").then(setStructure).catch(() => {});
  }, []);

  const filteredUnits = useMemo(() => {
    if (!structure) return [];
    return structure.units.filter(
      (u) => (!form.fieldId || u.fieldId === Number(form.fieldId)) && (!form.levelId || u.levelId === Number(form.levelId)),
    );
  }, [structure, form.fieldId, form.levelId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return show("Choose a document to upload", "error");
    if (!form.confirmedOwnership) return show("Please confirm you have the right to share this file", "error");

    const fd = new FormData();
    fd.append("file", file);
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null) fd.append(key, typeof value === "boolean" ? String(value) : value);
    });

    setBusy(true);
    setProgress(15);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgress(70);
      await api.post("/api/notes", fd);
      setProgress(100);
      setDone(true);
      show("Uploaded — waiting for admin approval", "success");
    } catch (err) {
      show((err as Error).message || "Upload failed", "error");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Card className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Submission received</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--foreground)]/60">
          Your resource is now <strong>pending</strong>. An administrator must approve it before students can find
          it in search results or download it.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => router.push("resources")}>Go to my resources</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setDone(false);
              setFile(null);
              setForm({ ...form, title: "", description: "" });
            }}
          >
            Upload another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <h2 className="text-base font-semibold text-[var(--foreground)]">Resource details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="u-title">Title *</Label>
            <Input id="u-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Data Structures — Unit 2 Revision Notes" />
          </div>
          <div>
            <Label htmlFor="u-desc">Description</Label>
            <Textarea id="u-desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this cover? Which topics are included?" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="u-inst">Institution *</Label>
              <Select id="u-inst" required value={form.institutionId} onChange={(e) => setForm({ ...form, institutionId: e.target.value })}>
                <option value="">Select institution</option>
                {structure?.institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="u-type">Resource type *</Label>
              <Select id="u-type" value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value })}>
                {["Notes", "Past Paper", "Assignment", "Revision Guide", "Slides"].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="u-field">Field of study *</Label>
              <Select id="u-field" required value={form.fieldId} onChange={(e) => setForm({ ...form, fieldId: e.target.value, unitId: "" })}>
                <option value="">Select field</option>
                {structure?.fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="u-level">Academic level *</Label>
              <Select id="u-level" required value={form.levelId} onChange={(e) => setForm({ ...form, levelId: e.target.value, unitId: "" })}>
                <option value="">Select level</option>
                {structure?.levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="u-unit">Unit / subject</Label>
              <Select id="u-unit" value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })}>
                <option value="">Select unit</option>
                {filteredUnits.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="u-sem">Semester</Label>
              <Select id="u-sem" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                {["Semester 1", "Semester 2", "Full year"].map((s) => <option key={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="u-year">Academic year</Label>
              <Input id="u-year" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} placeholder="2024/2025" />
            </div>
            <div>
              <Label htmlFor="u-access">Access level</Label>
              <Select id="u-access" value={form.isPremium ? "premium" : "free"} onChange={(e) => setForm({ ...form, isPremium: e.target.value === "premium" })}>
                <option value="free">Free for all students</option>
                <option value="premium">Premium resource</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Document</h3>
          <label
            htmlFor="u-file"
            className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-teal-500/40 bg-teal-500/5 px-4 py-8 text-center transition hover:bg-teal-500/10"
          >
            <UploadCloud className="h-6 w-6 text-teal-500" />
            <span className="mt-2 text-sm font-medium text-[var(--foreground)]">
              {file ? file.name : "Choose a file"}
            </span>
            <span className="mt-1 text-xs text-[var(--foreground)]/55">
              {file ? formatBytes(file.size) : "PDF, DOC, DOCX, PPT, PPTX · up to 30MB"}
            </span>
            <input
              id="u-file"
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {busy && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <label className="mt-4 flex items-start gap-2 text-xs text-[var(--foreground)]/70">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-teal-500"
              checked={form.confirmedOwnership}
              onChange={(e) => setForm({ ...form, confirmedOwnership: e.target.checked })}
            />
            I own this material or have permission to share it, and it contains no third-party copyright work.
          </label>
          <Button type="submit" className="mt-4 w-full" loading={busy}>
            {busy ? "Uploading…" : "Submit for review"}
          </Button>
          <p className="mt-2 text-center text-xs text-[var(--foreground)]/50">
            Files are validated on the server by type, size and content — not just the extension.
          </p>
        </Card>
      </div>
    </form>
  );
}

/* --------------------------------------------------- lecturer resources mgmt */

export function ManageResourcesPanel() {
  const { show } = useToast();
  const [items, setItems] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<NoteRecord | null>(null);
  const [form, setForm] = useState({ title: "", description: "", isPremium: false, resourceType: "Notes" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ mine: "true", pageSize: "48" });
    if (status) params.set("status", status);
    api
      .get<{ ok: true; items: NoteRecord[] }>(`/api/notes?${params.toString()}`)
      .then((res) => setItems(res.items))
      .catch(() => show("Could not load your resources", "error"))
      .finally(() => setLoading(false));
  }, [status, show]);

  useEffect(load, [load]);

  function startEdit(note: NoteRecord) {
    setEditing(note);
    setForm({ title: note.title, description: note.description, isPremium: note.isPremium, resourceType: note.resourceType });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await api.patch(`/api/notes/${editing.id}`, form);
      show("Resource updated", "success");
      setEditing(null);
      load();
    } catch (err) {
      show((err as Error).message || "Could not update resource", "error");
    } finally {
      setSaving(false);
    }
  }

  async function withdraw(note: NoteRecord) {
    try {
      await api.delete(`/api/notes/${note.id}`);
      show("Resource withdrawn", "info");
      setItems((prev) => prev.filter((n) => n.id !== note.id));
    } catch (err) {
      show((err as Error).message || "Could not withdraw resource", "error");
    }
  }

  const filtered = items.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input placeholder="Search your resources…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
        <div className="flex items-center gap-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="removed">Removed</option>
          </Select>
          <Link href="upload">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New
            </Button>
          </Link>
        </div>
      </div>

      {editing && (
        <Card>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Edit metadata</h3>
          <p className="mt-1 text-xs text-amber-500">
            Editing an approved resource sends it back to the moderation queue.
          </p>
          <div className="mt-3 space-y-3">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex flex-wrap items-center gap-4">
              <Select value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value })} className="w-44">
                {["Notes", "Past Paper", "Assignment", "Revision Guide", "Slides"].map((t) => <option key={t}>{t}</option>)}
              </Select>
              <label className="flex items-center gap-2 text-sm text-[var(--foreground)]/70">
                <input type="checkbox" className="h-4 w-4 accent-teal-500" checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} />
                Premium resource
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit} loading={saving}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-24" />)}</div>
      ) : !items.length ? (
        <EmptyState
          icon={<UploadCloud className="h-7 w-7" />}
          title="You have not uploaded anything yet"
          description="Share your first resource and it will appear here with its moderation status."
          action={
            <Link href="upload">
              <Button size="sm">Upload a resource</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => (
            <Card key={note.id} padded={false} className="p-0">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/explore/${note.id}`} className="text-sm font-semibold text-[var(--foreground)] hover:text-teal-500">
                      {note.title}
                    </Link>
                    {note.isPremium ? <Badge tone="violet">Premium</Badge> : <Badge tone="green">Free</Badge>}
                    <StatusBadge status={note.status} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-[var(--foreground)]/55">
                    <span>{formatBytes(note.fileSize)}</span>
                    <span>{note.downloadsCount} downloads</span>
                    <span>{note.viewsCount} views</span>
                    <span>Uploaded {formatDate(note.createdAt)}</span>
                  </div>
                  {note.rejectionReason && (
                    <p className="mt-2 rounded-lg bg-red-500/5 px-2.5 py-1.5 text-xs text-red-500">
                      Rejected: {note.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(note)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10" onClick={() => withdraw(note)}>
                    <Trash2 className="h-4 w-4" /> Withdraw
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------ lecturer reviews */

export function LecturerReviewsPanel() {
  const [items, setItems] = useState<{ id: number; rating: number; comment: string | null; createdAt: string; noteId: number; noteTitle: string; reviewerName: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ ok: true; items: typeof items }>("/api/lecturer/reviews")
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonBlock className="h-24" />;

  if (!items.length) {
    return <EmptyState icon={<Star className="h-7 w-7" />} title="No reviews yet" description="Student feedback on your resources will appear here." />;
  }

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <Card key={r.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={`/explore/${r.noteId}`} className="text-sm font-semibold text-[var(--foreground)] hover:text-teal-500">
              {r.noteTitle}
            </Link>
            <span className="text-sm text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
          </div>
          {r.comment && <p className="mt-2 text-sm text-[var(--foreground)]/70">{r.comment}</p>}
          <p className="mt-2 text-xs text-[var(--foreground)]/50">
            {r.reviewerName || "KnowVa student"} · {formatDate(r.createdAt)}
          </p>
        </Card>
      ))}
    </div>
  );
}
