"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useToast } from "@/components/toast";
import { api } from "@/lib/client-api";

export function PricingCta({
  plan,
  isCurrent,
  signedIn,
}: {
  plan: "free" | "premium";
  isCurrent: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [busy, setBusy] = useState(false);

  async function upgrade() {
    if (!signedIn) {
      router.push("/register?next=/pricing");
      return;
    }
    setBusy(true);
    try {
      const res = await api.post<{ ok: true; url: string; mode: string; warning?: string }>(
        "/api/billing/checkout",
      );
      if (res.warning) show(res.warning, "info");
      if (res.url) window.location.href = res.url;
    } catch (err) {
      show((err as Error).message || "Could not start checkout", "error");
    } finally {
      setBusy(false);
    }
  }

  if (plan === "free") {
    return (
      <Button variant="secondary" className="w-full" onClick={() => router.push(signedIn ? "/student/explore" : "/register")}>
        {signedIn ? "Start exploring" : "Create a free account"}
      </Button>
    );
  }

  if (isCurrent) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        Current plan
      </Button>
    );
  }

  return (
    <Button className="w-full" loading={busy} onClick={upgrade}>
      {busy ? "Redirecting…" : "Upgrade to Premium"}
    </Button>
  );
}
