"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Label, Select } from "@/components/ui";
import { useToast } from "@/components/toast";
import { api, ApiRequestError } from "@/lib/client-api";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { show } = useToast();

  const [role, setRole] = useState<"student" | "lecturer">(
    params.get("role") === "lecturer" ? "lecturer" : "student",
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    institution: "",
    fieldOfStudy: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        institution: form.institution || undefined,
        fieldOfStudy: form.fieldOfStudy || undefined,
      });
      show("Account created. Check your email to verify your account.", "success");
      const next = params.get("next");
      router.push(next && next.startsWith("/") ? next : role === "lecturer" ? "/lecturer/dashboard" : "/student/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Could not create your account";
      setError(message);
      show(message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">Create your KnowVa account</h1>
      <p className="mt-1 text-sm text-[var(--foreground)]/60">
        {role === "lecturer"
          ? "Lecturer accounts can publish resources, which go live after admin review."
          : "Students can search, bookmark and download academic resources."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {(["student", "lecturer"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRole(option)}
            className={`kv-focus rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition ${
              role === option
                ? "border-teal-500 bg-teal-500/10 text-teal-500"
                : "border-[var(--border-subtle)] text-[var(--foreground)]/60 hover:border-teal-500/40"
            }`}
          >
            I am a {option}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Wanjiru" />
        </div>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@university.ac.ke" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="institution">Institution (optional)</Label>
            <Input id="institution" value={form.institution} onChange={(e) => set("institution", e.target.value)} placeholder="University of Nairobi" />
          </div>
          <div>
            <Label htmlFor="field">Field of study (optional)</Label>
            {role === "student" ? (
              <Input id="field" value={form.fieldOfStudy} onChange={(e) => set("fieldOfStudy", e.target.value)} placeholder="Computer Science" />
            ) : (
              <Select id="field" value={form.fieldOfStudy} onChange={(e) => set("fieldOfStudy", e.target.value)}>
                <option value="">Select a field</option>
                <option>Computer Science</option>
                <option>Business Administration</option>
                <option>Engineering</option>
                <option>Medicine</option>
                <option>Law</option>
                <option>Education</option>
              </Select>
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-500">{error}</p>
        )}

        <label className="flex items-start gap-2 text-xs text-[var(--foreground)]/60">
          <input type="checkbox" required className="mt-0.5 accent-teal-500" />
          I confirm the material I upload will be mine or properly licensed, and I accept KnowVa&apos;s community rules.
        </label>

        <Button type="submit" className="w-full" loading={busy}>
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--foreground)]/60">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-teal-500 hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-[var(--foreground)]/40">
        Administrator accounts cannot be created through public registration.
      </p>
    </Card>
  );
}
