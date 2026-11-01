"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";
import { useToast } from "@/components/toast";
import { api, ApiRequestError } from "@/lib/client-api";
import type { PublicUser } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { show } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ ok: true; user: PublicUser }>("/api/auth/login", { email, password });
      const next = params.get("next");
      const roleHome =
        res.user.role === "superadmin" ? "/superadmin/dashboard" : res.user.role === "lecturer" ? "/lecturer/dashboard" : "/student/dashboard";
      router.push(next && next.startsWith("/") ? next : roleHome);
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Could not sign you in";
      setError(message);
      show(message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">Welcome back</h1>
      <p className="mt-1 text-sm text-[var(--foreground)]/60">Sign in to continue to KnowVa.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.ac.ke"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-teal-500 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full" loading={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--foreground)]/60">
        New to KnowVa?{" "}
        <Link href="/register" className="font-medium text-teal-500 hover:underline">
          Create an account
        </Link>
      </p>
      <details className="mt-4 rounded-xl bg-[var(--surface-muted)] p-3 text-xs text-[var(--foreground)]/60">
        <summary className="cursor-pointer font-medium">Demo accounts (seeded)</summary>
        <ul className="mt-2 space-y-1">
          <li>student@knowva.app / Student@123</li>
          <li>lecturer@knowva.app / Lecturer@123</li>
          <li>admin@knowva.app / Admin@12345</li>
        </ul>
      </details>
    </Card>
  );
}
