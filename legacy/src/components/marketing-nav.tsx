"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui";
import { api } from "@/lib/client-api";
import type { PublicUser } from "@/lib/types";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingNav({ user }: { user: PublicUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await api.post("/api/auth/logout");
    router.push("/");
    router.refresh();
  }

  const dashboardHref = user ? `/${user.role === "superadmin" ? "superadmin" : user.role}/dashboard` : "/login";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--background)]/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition hover:text-teal-500 ${
                pathname === link.href ? "text-teal-500" : "text-[var(--foreground)]/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => router.push(dashboardHref)}>
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="kv-focus text-sm font-medium text-[var(--foreground)]/80 hover:text-teal-500">
                Log in
              </Link>
              <Button size="sm" onClick={() => router.push("/register")}>
                Get started
              </Button>
            </>
          )}
        </div>
        <button
          className="kv-focus flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </nav>
      {open && (
        <div className="space-y-1 border-t border-[var(--border-subtle)] px-4 py-4 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)]/80 hover:bg-[var(--surface-muted)]"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-2">
            <ThemeToggle />
            {user ? (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => router.push(dashboardHref)}>
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => router.push("/login")}>
                  Log in
                </Button>
                <Button size="sm" onClick={() => router.push("/register")}>
                  Get started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
