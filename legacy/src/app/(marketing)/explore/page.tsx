import { Suspense } from "react";
import { PageHeader } from "@/components/ui";
import { ExploreBrowser } from "@/components/explore-browser";

export const dynamic = "force-dynamic";

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Explore academic resources"
        description="Search approved notes, past papers and guides across every institution on KnowVa."
      />
      <Suspense fallback={<p className="text-sm text-[var(--foreground)]/60">Loading…</p>}>
        <ExploreBrowser />
      </Suspense>
    </div>
  );
}
