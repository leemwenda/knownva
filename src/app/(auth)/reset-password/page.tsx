"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";
import { api } from "@/lib/client-api";
import { useToast } from "@/components/toast";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const router = useRouter();
  const { show } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      show("Password updated. Sign in with your new password.", "success");
      router.push("/login");
    } catch (err) {
      setError((err as Error).message || "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">Choose a new password</h1>
      {!token ? (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-500">
          This reset link is missing its token. Please request a new link.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-500">{error}</p>
          )}
          <Button type="submit" className="w-full" loading={busy}>
            {busy ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-[var(--foreground)]/60">
        <Link href="/forgot-password" className="font-medium text-teal-500 hover:underline">
          Request a new reset link
        </Link>
      </p>
    </Card>
  );
}
