import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-navy-950 via-[var(--background)] to-[var(--background)]">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_30%_0%,rgba(45,212,191,0.16),transparent_55%),radial-gradient(circle_at_75%_10%,rgba(139,92,246,0.16),transparent_55%)]" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo tagline />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-[var(--foreground)]/70 hover:text-teal-500">
            Log in
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-10 sm:px-6">
        <Suspense fallback={<div className="w-full" />}>{children}</Suspense>
      </main>
      <footer className="py-6 text-center text-xs text-[var(--foreground)]/50">
        <Link href="/" className="hover:text-teal-500">
          Back to KnowVa home
        </Link>
      </footer>
    </div>
  );
}
