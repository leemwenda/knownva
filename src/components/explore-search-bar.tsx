"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ExploreSearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/explore${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur">
      <svg className="ml-2 h-5 w-5 shrink-0 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search notes, units, or topics…"
        className="kv-focus w-full bg-transparent py-2 text-sm text-white placeholder:text-white/50"
      />
      <button
        type="submit"
        className="kv-focus shrink-0 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-400"
      >
        Search
      </button>
    </form>
  );
}
