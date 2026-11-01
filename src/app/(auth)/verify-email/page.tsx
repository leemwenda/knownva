"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Spinner } from "@/components/ui";
import { api } from "@/lib/client-api";

type State = "verifying" | "verified" | "invalid" | "missing";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>(token ? "verifying" : "missing");
  const [message, setMessage] = useState<string | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (!token || ranOnce.current) return;
    ranOnce.current = true;
    let cancelled = false;

    async function run() {
      // Two attempts make the flow resilient to React StrictMode double-invocation
      // and to email clients that fetch the link before the user does.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          await api.post("/api/auth/verify-email", { token });
          if (!cancelled) setState("verified");
          return;
        } catch (err) {
          if (attempt === 1) {
            if (!cancelled) {
              setState("invalid");
              setMessage((err as Error).message || "This link could not be verified");
            }
          }
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Card className="w-full text-center">
      {state === "verifying" && (
        <>
          <Spinner className="mx-auto h-8 w-8 text-teal-500" />
          <h1 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Verifying your email…</h1>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">This only takes a moment.</p>
        </>
      )}

      {state === "verified" && (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-2xl text-emerald-500">
            ✓
          </div>
          <h1 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Email verified</h1>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            Your account is active. You can now search, bookmark and download resources.
          </p>
          <Link href="/student/dashboard" className="mt-6 block">
            <Button className="w-full">Go to my dashboard</Button>
          </Link>
        </>
      )}

      {state === "invalid" && (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-2xl text-amber-500">
            !
          </div>
          <h1 className="mt-4 text-lg font-semibold text-[var(--foreground)]">We could not verify that link</h1>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            {message || "The link may be malformed."} If you already verified your account you can simply sign in.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/login">
              <Button className="w-full">Go to sign in</Button>
            </Link>
            <Link href="/forgot-password">
              <Button variant="secondary" className="w-full">
                Trouble signing in? Reset password
              </Button>
            </Link>
          </div>
        </>
      )}

      {state === "missing" && (
        <>
          <h1 className="text-lg font-semibold text-[var(--foreground)]">Verification link required</h1>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            Open the verification link from your email. Already signed in? You can send a new link from your
            dashboard.
          </p>
          <Link href="/login" className="mt-6 block">
            <Button className="w-full">Go to sign in</Button>
          </Link>
        </>
      )}
    </Card>
  );
}
