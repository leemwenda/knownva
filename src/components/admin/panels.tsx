"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Eye,
  FileWarning,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, Label, Select, SkeletonBlock, StatCard, Textarea } from "@/components/ui";
import { StatusBadge } from "@/components/portal/panels";
import { useToast } from "@/components/toast";
import { api } from "@/lib/client-api";

interface AdminNote {
  id: number;
  title: string;
  description: string;
  status: string;
  isPremium: boolean;
  resourceType: string;
  fileName: string;
  fileSize: number;
  downloadsCount: number;
  viewsCount: number;
  createdAt: string;
  rejectionReason?: string | null;
  uploaderName?: string | null;
  institutionName?: string | null;
  fieldName?: string | null;
  levelName?: string | null;
  unitName?: string | null;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatBytes(bytes = 0) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ---------------------------------------------------------------- overview */

export function AdminOverviewPanel() {
  const [data, setData] = useState<{
    totalUsers: number;
    roleCounts: { student: number; lecturer: number; superadmin: number };
    resourceCounts: { pending: number; approved: number; rejected: number; removed: number };
    totalResources: number;
    reportCounts: { open: number; under_review: number; dismissed: number; resolved: number };
    activeSubscriptions: number;
    recentActivity: { log: { id: number; action: string; createdAt: string; targetType: string | null }; actorName: string | null }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ ok: true } & Record<string, never>>("/api/admin/dashboard")
      .then((res) => setData(res as unknown as typeof data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} className="h-28" />
        ))}
      </div>
    );
  }
  if (!data) return <EmptyState title="Could not load platform statistics" description="Please refresh to try again." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={data.totalUsers} hint={`${data.roleCounts.student} students · ${data.roleCounts.lecturer} lecturers`} icon={<UsersIcon className="h-4 w-4" />} />
        <StatCard label="Resources" value={data.totalResources} hint={`${data.resourceCounts.approved} approved`} icon={<Eye className="h-4 w-4" />} />
        <StatCard label="Pending approvals" value={data.resourceCounts.pending} hint="Awaiting moderation" icon={<FileWarning className="h-4 w-4" />} />
        <StatCard label="Open reports" value={data.reportCounts.open + data.reportCounts.under_review} hint="Copyright & content" icon={<ShieldAlert className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Moderation queues</h2>
          <div className="mt-4 space-y-2 text-sm">
            {[
              { label: "Pending review", value: data.resourceCounts.pending, href: "approvals" },
              { label: "Rejected", value: data.resourceCounts.rejected, href: "resources?status=rejected" },
              { label: "Removed by admin", value: data.resourceCounts.removed, href: "resources?status=removed" },
              { label: "Active subscriptions", value: data.activeSubscriptions, href: "subscriptions" },
            ].map((row) => (
              <Link key={row.label} href={row.href} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-[var(--surface-muted)]">
                <span className="text-[var(--foreground)]/65">{row.label}</span>
                <span className="font-semibold text-[var(--foreground)]">{row.value}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent administrative activity</h2>
            <Link href="audit-logs" className="text-xs font-medium text-teal-500 hover:underline">
              Full audit log
            </Link>
          </div>
          {data.recentActivity.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--foreground)]/60">No recorded actions yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--border-subtle)]">
              {data.recentActivity.slice(0, 7).map((row) => (
                <li key={row.log.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="truncate text-[var(--foreground)]/75">{row.log.action}</span>
                  <span className="shrink-0 text-xs text-[var(--foreground)]/45">
                    {row.actorName || "system"} · {formatDate(row.log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- approvals */

export function ApprovalsPanel() {
  const { show } = useToast();
  const [items, setItems] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<{ id: number; reason: string } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ ok: true; items: AdminNote[] }>("/api/notes?status=pending&pageSize=48")
      .then((res) => setItems(res.items))
      .catch(() => show("Could not load the approval queue", "error"))
      .finally(() => setLoading(false));
  }, [show]);

  useEffect(load, [load]);

  async function decide(id: number, status: "approved" | "rejected", rejectionReason?: string) {
    setBusyId(id);
    try {
      await api.patch(`/api/notes/${id}`, { status, rejectionReason });
      setItems((prev) => prev.filter((n) => n.id !== id));
      show(status === "approved" ? "Resource approved and published" : "Resource rejected — uploader notified", "success");
    } catch (err) {
      show((err as Error).message || "Moderation action failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className="space-y-3">{[1, 2].map((i) => <SkeletonBlock key={i} className="h-40" />)}</div>;

  if (!items.length) {
    return <EmptyState icon={<Check className="h-7 w-7" />} title="Approval queue is clear" description="New lecturer uploads will appear here for review." />;
  }

  return (
    <div className="space-y-4">
      {items.map((note) => (
        <Card key={note.id}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">{note.title}</h3>
                <Badge tone="teal">{note.resourceType}</Badge>
                {note.isPremium ? <Badge tone="violet">Premium</Badge> : <Badge tone="green">Free</Badge>}
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--foreground)]/65">{note.description || "No description provided."}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--foreground)]/55">
                <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1">By {note.uploaderName || "unknown"}</span>
                {note.institutionName && <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1">{note.institutionName}</span>}
                {note.levelName && <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1">{note.levelName}</span>}
                {note.unitName && <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1">{note.unitName}</span>}
                <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1">Uploaded {formatDate(note.createdAt)}</span>
                <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1">
                  {note.fileName} · {formatBytes(note.fileSize)}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <a href={`/api/notes/${note.id}/download`} target="_blank" rel="noreferrer" className="kv-focus rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--foreground)]/70 hover:border-teal-500/40 hover:text-teal-500">
                <ExternalLink className="mr-1 inline h-3.5 w-3.5" /> Secure preview
              </a>
              <Button size="sm" onClick={() => decide(note.id, "approved")} loading={busyId === note.id}>
                <Check className="h-4 w-4" /> Approve
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setRejecting({ id: note.id, reason: "" })}>
                <X className="h-4 w-4" /> Reject
              </Button>
            </div>
          </div>

          {rejecting?.id === note.id && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <Label htmlFor="reject-reason">Reason for rejection (shown to the lecturer)</Label>
              <Textarea
                id="reject-reason"
                rows={2}
                value={rejecting.reason}
                onChange={(e) => setRejecting({ ...rejecting, reason: e.target.value })}
                placeholder="e.g. Copyrighted textbook pages — please upload your own summary."
              />
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  loading={busyId === note.id}
                  onClick={() => {
                    if (!rejecting.reason.trim()) {
                      show("A rejection reason is required", "error");
                      return;
                    }
                    void decide(note.id, "rejected", rejecting.reason.trim()).then(() => setRejecting(null));
                  }}
                >
                  Confirm rejection
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRejecting(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ all resources */

export function AllResourcesPanel({ initialStatus = "all" }: { initialStatus?: string }) {
  const { show } = useToast();
  const [items, setItems] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(initialStatus);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ status, pageSize: "48" });
    if (query.trim()) params.set("q", query.trim());
    api
      .get<{ ok: true; items: AdminNote[] }>(`/api/notes?${params.toString()}`)
      .then((res) => setItems(res.items))
      .catch(() => show("Could not load resources", "error"))
      .finally(() => setLoading(false));
  }, [status, query, show]);

  useEffect(() => {
    const timer = setTimeout(load, 350);
    return () => clearTimeout(timer);
  }, [load]);

  async function act(id: number, patch: Record<string, unknown>, message: string) {
    setBusyId(id);
    try {
      await api.patch(`/api/notes/${id}`, patch);
      show(message, "success");
      load();
    } catch (err) {
      show((err as Error).message || "Action failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40" />
          <Input className="pl-9" placeholder="Search all resources…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
            <option value="all">All statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="removed">Removed</option>
          </Select>
          <Button size="sm" variant="secondary" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-20" />)}</div>
      ) : !items.length ? (
        <EmptyState title="No resources found" description="Try another status filter or search term." />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-[var(--border-subtle)]">
            {items.map((note) => (
              <div key={note.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/explore/${note.id}`} className="truncate text-sm font-medium text-[var(--foreground)] hover:text-teal-500">
                      {note.title}
                    </Link>
                    <StatusBadge status={note.status} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--foreground)]/50">
                    {note.uploaderName || "unknown"} · {note.institutionName || "no institution"} · {note.downloadsCount} downloads · {formatDate(note.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {note.status !== "approved" && (
                    <Button size="sm" variant="ghost" loading={busyId === note.id} onClick={() => act(note.id, { status: "approved" }, "Resource approved")}>
                      Approve
                    </Button>
                  )}
                  {note.status !== "removed" && (
                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10" loading={busyId === note.id} onClick={() => act(note.id, { status: "removed" }, "Resource taken down")}>
                      Takedown
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- reports */

interface AdminReport {
  report: {
    id: number;
    reason: string;
    details: string | null;
    status: string;
    createdAt: string;
    resolutionNote: string | null;
    noteId: number;
  };
  noteTitle: string | null;
  noteStatus: string | null;
  reporterName: string | null;
  reporterEmail: string | null;
}

export function ReportsPanel() {
  const { show } = useToast();
  const [items, setItems] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ ok: true; items: AdminReport[] }>(`/api/admin/reports?status=${filter}`)
      .then((res) => setItems(res.items))
      .catch(() => show("Could not load reports", "error"))
      .finally(() => setLoading(false));
  }, [filter, show]);

  useEffect(load, [load]);

  async function resolve(id: number, status: "under_review" | "dismissed" | "resolved", removeResource = false) {
    setBusyId(id);
    try {
      await api.patch(`/api/admin/reports/${id}`, { status, resolutionNote: noteDrafts[id] || undefined, removeResource });
      show("Report updated", "success");
      load();
    } catch (err) {
      show((err as Error).message || "Could not update report", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-48">
          <option value="open">Open</option>
          <option value="under_review">Under review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </Select>
        <Button size="sm" variant="secondary" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <SkeletonBlock key={i} className="h-32" />)}</div>
      ) : !items.length ? (
        <EmptyState icon={<FileWarning className="h-7 w-7" />} title="No reports in this state" description="Copyright and content reports submitted by users appear here." />
      ) : (
        items.map(({ report, noteTitle, noteStatus, reporterName, reporterEmail }) => (
          <Card key={report.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">{noteTitle || "Deleted resource"}</h3>
                <Badge tone="red">{report.reason}</Badge>
                <StatusBadge status={noteStatus || undefined} />
              </div>
              <span className="text-xs text-[var(--foreground)]/50">Reported {formatDate(report.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--foreground)]/70">{report.details || "No additional details provided."}</p>
            <p className="mt-1.5 text-xs text-[var(--foreground)]/50">
              Reporter: {reporterName || "unknown"} ({reporterEmail || "hidden"})
            </p>
            {report.resolutionNote && (
              <p className="mt-2 rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--foreground)]/70">
                Resolution: {report.resolutionNote}
              </p>
            )}
            <div className="mt-4 space-y-3">
              <Textarea
                rows={2}
                placeholder="Moderator note (recorded with the decision)…"
                value={noteDrafts[report.id] || ""}
                onChange={(e) => setNoteDrafts({ ...noteDrafts, [report.id]: e.target.value })}
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" loading={busyId === report.id} onClick={() => resolve(report.id, "under_review")}>
                  Mark under review
                </Button>
                <Button size="sm" variant="ghost" loading={busyId === report.id} onClick={() => resolve(report.id, "dismissed")}>
                  Dismiss
                </Button>
                <Button size="sm" loading={busyId === report.id} onClick={() => resolve(report.id, "resolved")}>
                  Resolve (keep resource)
                </Button>
                <Button size="sm" variant="danger" loading={busyId === report.id} onClick={() => resolve(report.id, "resolved", true)}>
                  <Trash2 className="h-4 w-4" /> Resolve and take down
                </Button>
                <Link href={`/explore/${report.noteId}`} className="kv-focus rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--foreground)]/70 hover:text-teal-500">
                  Inspect resource
                </Link>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- users */

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  institution: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export function UsersPanel() {
  const { show } = useToast();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    api
      .get<{ ok: true; items: AdminUser[] }>(`/api/admin/users?${params.toString()}`)
      .then((res) => setItems(res.items))
      .catch(() => show("Could not load users", "error"))
      .finally(() => setLoading(false));
  }, [query, role, status, show]);

  useEffect(() => {
    const timer = setTimeout(load, 350);
    return () => clearTimeout(timer);
  }, [load]);

  async function patchUser(id: number, patch: Record<string, unknown>, message: string) {
    setBusyId(id);
    try {
      await api.patch(`/api/admin/users/${id}`, patch);
      show(message, "success");
      load();
    } catch (err) {
      show((err as Error).message || "Update failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative lg:max-w-xs lg:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40" />
          <Input className="pl-9" placeholder="Search name or email…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-36">
            <option value="">All roles</option>
            <option value="student">Students</option>
            <option value="lecturer">Lecturers</option>
            <option value="superadmin">Admins</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-16" />)}</div>
      ) : !items.length ? (
        <EmptyState icon={<UsersIcon className="h-7 w-7" />} title="No users match" description="Adjust the filters or search term." />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-[var(--border-subtle)]">
            {items.map((user) => (
              <div key={user.id} className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">{user.name}</p>
                    <Badge tone={user.role === "superadmin" ? "amber" : user.role === "lecturer" ? "violet" : "teal"}>
                      {user.role}
                    </Badge>
                    {user.status === "suspended" && <Badge tone="red">suspended</Badge>}
                    {!user.emailVerified && <Badge tone="neutral">unverified</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--foreground)]/55">
                    {user.email} {user.institution ? `· ${user.institution}` : ""} · joined {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Select
                    value={user.role}
                    onChange={(e) => patchUser(user.id, { role: e.target.value }, "Role updated")}
                    className="w-36 !py-1.5 text-xs"
                    disabled={busyId === user.id}
                  >
                    <option value="student">student</option>
                    <option value="lecturer">lecturer</option>
                    <option value="superadmin">superadmin</option>
                  </Select>
                  {user.status === "active" ? (
                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10" onClick={() => patchUser(user.id, { status: "suspended" }, "Account suspended")}>
                      Suspend
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => patchUser(user.id, { status: "active" }, "Account reactivated")}>
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <p className="text-xs text-[var(--foreground)]/50">
        Role and status changes are recorded in the audit log. The last active superadmin cannot be demoted or
        suspended, so the platform is never left without an administrator.
      </p>
    </div>
  );
}

/* ------------------------------------------------------ academic structure */

type StructureKey = "institutions" | "fields" | "levels" | "units";

interface StructureRow {
  id: number;
  name: string;
  active: boolean;
  refCount?: number;
  fieldId?: number | null;
  levelId?: number | null;
}

export function StructurePanel() {
  const { show } = useToast();
  const [tab, setTab] = useState<StructureKey>("institutions");
  const [data, setData] = useState<Record<StructureKey, StructureRow[]>>({ institutions: [], fields: [], levels: [], units: [] });
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ ok: true } & Record<StructureKey, StructureRow[]>>("/api/admin/academic-structure")
      .then((res) => setData(res))
      .catch(() => show("Could not load academic structure", "error"))
      .finally(() => setLoading(false));
  }, [show]);

  useEffect(load, [load]);

  async function create() {
    if (newName.trim().length < 2) return show("Enter a name of at least 2 characters", "error");
    setBusy(true);
    try {
      await api.post(`/api/admin/academic-structure/${tab}`, { name: newName.trim() });
      setNewName("");
      show("Entry created", "success");
      load();
    } catch (err) {
      show((err as Error).message || "Could not create entry", "error");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(row: StructureRow) {
    try {
      await api.patch(`/api/admin/academic-structure/${tab}/${row.id}`, { active: !row.active });
      show(row.active ? "Entry deactivated" : "Entry activated", "success");
      load();
    } catch (err) {
      show((err as Error).message || "Update failed", "error");
    }
  }

  async function remove(row: StructureRow) {
    try {
      const res = await api.delete<{ ok: true; deactivated?: boolean }>(`/api/admin/academic-structure/${tab}/${row.id}`);
      show(res.deactivated ? "Referenced by resources — deactivated instead of deleting" : "Entry deleted", "success");
      load();
    } catch (err) {
      show((err as Error).message || "Delete failed", "error");
    }
  }

  const labels: Record<StructureKey, string> = {
    institutions: "Institutions",
    fields: "Fields of study",
    levels: "Academic levels",
    units: "Units / subjects",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(labels) as StructureKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`kv-focus rounded-xl px-3.5 py-2 text-sm font-medium transition ${
              tab === key
                ? "bg-teal-500 text-white"
                : "border border-[var(--border-subtle)] text-[var(--foreground)]/65 hover:bg-[var(--surface-muted)]"
            }`}
          >
            {labels[key]} <span className="opacity-60">({data[key].length})</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="new-entry">Add a new {labels[tab].toLowerCase().replace(/s$/, "")}</Label>
            <Input id="new-entry" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Type the exact name" />
          </div>
          <Button onClick={create} loading={busy}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </Card>

      {loading ? (
        <SkeletonBlock className="h-40" />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-[var(--border-subtle)]">
            {data[tab].length === 0 && <p className="px-4 py-6 text-sm text-[var(--foreground)]/60">Nothing here yet.</p>}
            {data[tab].map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{row.name}</p>
                  <p className="text-xs text-[var(--foreground)]/50">
                    {row.refCount ? `${row.refCount} resource${row.refCount === 1 ? "" : "s"} linked` : "No linked resources"}
                    {!row.active && " · inactive"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(row)}>
                    {row.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10" onClick={() => remove(row)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <p className="text-xs text-[var(--foreground)]/50">
        Entries referenced by existing resources cannot be destroyed — they are deactivated instead, which keeps the
        library history intact while hiding them from new uploads.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ subscriptions */

export function SubscriptionsPanel() {
  const [data, setData] = useState<{
    items: { subscription: { plan: string; status: string; currentPeriodEnd: string | null; stripeCustomerId: string | null }; userName: string | null; userEmail: string | null }[];
    summary: { plan: string; status: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<NonNullable<typeof data>>("/api/admin/subscriptions")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonBlock className="h-40" />;
  if (!data) return <EmptyState title="Could not load subscriptions" />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.summary.map((row) => (
          <StatCard key={`${row.plan}-${row.status}`} label={`${row.plan} · ${row.status}`} value={row.count} />
        ))}
        {data.summary.length === 0 && <p className="text-sm text-[var(--foreground)]/60">No subscription records.</p>}
      </div>

      <Card padded={false}>
        <div className="divide-y divide-[var(--border-subtle)]">
          {data.items.map((row, index) => (
            <div key={index} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">{row.userName || "unknown"}</p>
                <p className="truncate text-xs text-[var(--foreground)]/55">{row.userEmail}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--foreground)]/60">
                <Badge tone={row.subscription.plan === "premium" ? "violet" : "neutral"}>{row.subscription.plan}</Badge>
                <Badge tone={row.subscription.status === "active" ? "green" : "amber"}>{row.subscription.status}</Badge>
                <span>
                  {row.subscription.currentPeriodEnd ? `renews ${formatDate(row.subscription.currentPeriodEnd)}` : "no renewal date"}
                </span>
                {row.subscription.stripeCustomerId && <Badge tone="teal">Stripe</Badge>}
              </div>
            </div>
          ))}
          {data.items.length === 0 && <p className="px-4 py-6 text-sm text-[var(--foreground)]/60">No subscription data yet.</p>}
        </div>
      </Card>

      <Card className="border-amber-500/30">
        <p className="flex items-start gap-2 text-sm text-[var(--foreground)]/75">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          Subscription state is only written by verified Stripe webhooks (or the development fake checkout, which is
          disabled in production). There is no manual “mark as paid” action by design.
        </p>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------- audit logs */

export function AuditLogsPanel() {
  const [items, setItems] = useState<{ log: { id: number; action: string; targetType: string | null; targetId: number | null; createdAt: string; details: Record<string, unknown> | null }; actorName: string | null; actorEmail: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ ok: true; items: typeof items }>(`/api/admin/audit-logs?page=${page}`)
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-4">
      {loading ? (
        <SkeletonBlock className="h-60" />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[var(--border-subtle)] text-xs uppercase tracking-wide text-[var(--foreground)]/50">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {items.map((row) => (
                  <tr key={row.log.id} className="hover:bg-[var(--surface-muted)]/60">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--foreground)]/60">
                      {new Date(row.log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)]/75">{row.actorName || "system"}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-xs text-teal-500">{row.log.action}</code>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--foreground)]/60">
                      {row.log.targetType ? `${row.log.targetType} #${row.log.targetId}` : "—"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-[var(--foreground)]/55">
                      {row.log.details ? JSON.stringify(row.log.details) : "—"}
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-sm text-[var(--foreground)]/60">
                      No audit entries recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <div className="flex items-center justify-between">
        <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Newer
        </Button>
        <span className="text-xs text-[var(--foreground)]/50">Page {page}</span>
        <Button size="sm" variant="secondary" disabled={items.length < 50} onClick={() => setPage((p) => p + 1)}>
          Older
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ admin settings */

export function AdminSettingsPanel() {
  const [settings, setSettings] = useState<{
    appName: string;
    freeMonthlyPremiumDownloads: number;
    emailConfigured: boolean;
    stripeConfigured: boolean;
    stripeWebhookSecretConfigured: boolean;
    environment: string;
  } | null>(null);
  const [downloads, setDownloads] = useState(3);
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    api
      .get<{ ok: true; settings: NonNullable<typeof settings> }>("/api/admin/settings")
      .then((res) => {
        setSettings(res.settings);
        setDownloads(res.settings.freeMonthlyPremiumDownloads);
      })
      .catch(() => {});
  }, []);

  async function saveLimit() {
    setSaving(true);
    try {
      await api.patch("/api/admin/settings", { freeMonthlyPremiumDownloads: downloads });
      show("Free-tier download limit updated", "success");
    } catch (err) {
      show((err as Error).message || "Could not save setting", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <SkeletonBlock className="h-40" />;

  const checks = [
    { label: "Email (SMTP) delivery", ok: settings.emailConfigured, note: settings.emailConfigured ? "Configured" : "Not configured — links are printed to the server log" },
    { label: "Stripe checkout", ok: settings.stripeConfigured, note: settings.stripeConfigured ? "Publishable keys present — still verify with test mode" : "Not configured — dev fake checkout only (blocked in production)" },
    { label: "Stripe webhook secret", ok: settings.stripeWebhookSecretConfigured, note: settings.stripeWebhookSecretConfigured ? "Configured" : "Missing — subscription updates will not be received" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="text-base font-semibold text-[var(--foreground)]">Platform rules</h2>
        <div className="mt-4">
          <Label htmlFor="limit">Free-tier premium downloads per month</Label>
          <div className="flex gap-2">
            <Input id="limit" type="number" min={0} max={50} value={downloads} onChange={(e) => setDownloads(Number(e.target.value))} className="w-32" />
            <Button size="sm" onClick={saveLimit} loading={saving}>
              Save
            </Button>
          </div>
          <p className="mt-2 text-xs text-[var(--foreground)]/55">
            Applied immediately to free accounts. Premium subscribers are unlimited. The counter resets on the 1st of
            each month and is enforced inside a database transaction.
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-[var(--foreground)]">Integration health</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {checks.map((check) => (
            <li key={check.label} className="flex items-start gap-2.5">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${check.ok ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"}`}>
                {check.ok ? "✓" : "!"}
              </span>
              <span>
                <span className="block font-medium text-[var(--foreground)]">{check.label}</span>
                <span className="block text-xs text-[var(--foreground)]/55">{check.note}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--foreground)]/60">
          Environment: <code>{settings.environment}</code> · App: <code>{settings.appName}</code>
        </p>
      </Card>
    </div>
  );
}


