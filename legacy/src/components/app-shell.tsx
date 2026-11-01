"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  History,
  StickyNote,
  Crown,
  UserCircle,
  Settings,
  UploadCloud,
  Files,
  ShieldCheck,
  Users,
  Flag,
  Network,
  Receipt,
  ScrollText,
  LogOut,
  Menu,
  X,
  BookOpen,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge, Button } from "@/components/ui";
import { api } from "@/lib/client-api";
import type { PublicUser } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}



export const STUDENT_NAV: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/explore", label: "Explore notes", icon: Search },
  { href: "/student/my-notes", label: "My library", icon: BookOpen },
  { href: "/student/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/student/recently-viewed", label: "Recently viewed", icon: History },
  { href: "/student/private-notes", label: "Study notes", icon: StickyNote },
  { href: "/student/premium", label: "Premium", icon: Crown },
  { href: "/student/profile", label: "Profile", icon: UserCircle },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

export const LECTURER_NAV: NavItem[] = [
  { href: "/lecturer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lecturer/resources", label: "My resources", icon: Files },
  { href: "/lecturer/upload", label: "Upload resource", icon: UploadCloud },
  { href: "/lecturer/reviews", label: "Reviews", icon: Star },
  { href: "/lecturer/explore", label: "Explore notes", icon: Search },
  { href: "/lecturer/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/lecturer/private-notes", label: "Study notes", icon: StickyNote },
  { href: "/lecturer/profile", label: "Profile", icon: UserCircle },
  { href: "/lecturer/settings", label: "Settings", icon: Settings },
];

export const SUPERADMIN_NAV: NavItem[] = [
  { href: "/superadmin/dashboard", label: "Overview", icon: ShieldCheck },
  { href: "/superadmin/approvals", label: "Approvals", icon: Files },
  { href: "/superadmin/resources", label: "All resources", icon: BookOpen },
  { href: "/superadmin/reports", label: "Reports", icon: Flag },
  { href: "/superadmin/users", label: "Users", icon: Users },
  { href: "/superadmin/academic-structure", label: "Academic structure", icon: Network },
  { href: "/superadmin/subscriptions", label: "Subscriptions", icon: Receipt },
  { href: "/superadmin/audit-logs", label: "Audit logs", icon: ScrollText },
  { href: "/superadmin/settings", label: "Settings", icon: Settings },
];

const ROLE_META: Record<PublicUser["role"], { label: string; tone: "teal" | "violet" | "amber"; home: string }> = {
  student: { label: "Student portal", tone: "teal", home: "/student/dashboard" },
  lecturer: { label: "Lecturer portal", tone: "violet", home: "/lecturer/dashboard" },
  superadmin: { label: "Super admin", tone: "amber", home: "/superadmin/dashboard" },
};

export function AppShell({
  user,
  navItems,
  children,
}: {
  user: PublicUser;
  navItems: NavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleMeta = ROLE_META[user.role];

  async function logout() {
    await api.post("/api/auth/logout").catch(() => {});
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-4">
        {collapsed ? (
          <Link href={roleMeta.home} className="kv-focus rounded-lg" aria-label="KnowVa home">
            <BrandMark size={30} />
          </Link>
        ) : (
          <Logo size="sm" />
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="kv-focus hidden h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground)]/50 hover:bg-[var(--surface-muted)] lg:flex"
          aria-label="Collapse sidebar"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      <nav className="kv-shell-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`kv-focus group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-teal-500/15 to-violet-500/10 text-teal-500"
                  : "text-[var(--foreground)]/65 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-teal-500" : "text-[var(--foreground)]/40"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border-subtle)] p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-[var(--surface-muted)] p-3">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">{user.name}</p>
            <p className="truncate text-xs text-[var(--foreground)]/50">{user.email}</p>
            <Badge tone={roleMeta.tone} className="mt-2">
              {roleMeta.label}
            </Badge>
          </div>
        )}
        <button
          onClick={logout}
          className="kv-focus flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--foreground)]/65 transition hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex">
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 border-r border-[var(--border-subtle)] bg-[var(--surface)] transition-all lg:block ${
            collapsed ? "w-[72px]" : "w-64"
          }`}
        >
          {sidebar}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="kv-glass absolute inset-y-0 left-0 w-72 border-r border-[var(--border-subtle)] bg-[var(--surface)]">
              {sidebar}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--background)]/85 px-4 backdrop-blur-lg sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="kv-focus flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[var(--foreground)]">{roleMeta.label}</p>
                <p className="text-xs text-[var(--foreground)]/50">
                  {user.institution || "Welcome back"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => router.push(roleMeta.home === "/student/dashboard" ? "/student/explore" : "/explore")}>
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search notes</span>
              </Button>
              {user.role !== "student" && (
                <Button variant="outline" size="sm" onClick={() => router.push("/explore")}>
                  Public site
                </Button>
              )}
              <ThemeToggle />
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
