"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";
import { api } from "@/lib/client-api";
import { useToast } from "@/components/toast";

export default function ForgotPasswordPage() {
  const { show } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
      show("Reset link created", "success");
    } catch (err) {
      show((err as Error).message || "Could not process request", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">Reset your password</h1>
      <p className="mt-1 text-sm text-[var(--foreground)]/60">
        Enter the email you registered with and we&apos;ll send you a secure reset link.
      </p>

      {sent ? (
        <div className="mt-6 rounded-xl border border-teal-500/30 bg-teal-500/5 p-4 text-sm text-[var(--foreground)]/80">
          If an account exists for <strong>{email}</strong>, a reset link has been sent. Without SMTP configured,
          the link is printed in the server log instead.
          <Link href="/login" className="mt-3 block font-medium text-teal-500 hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" loading={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[var(--foreground)]/60">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-teal-500 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
