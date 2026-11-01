import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { institutions, notes, users } from "@/db/schema";
import { Button, Badge, Card } from "@/components/ui";
import { BrandMark } from "@/components/brand-mark";
import { ExploreSearchBar } from "@/components/explore-search-bar";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [recent, popular, totals, institutionCount] = await Promise.all([
    db.select().from(notes).where(eq(notes.status, "approved")).orderBy(desc(notes.createdAt)).limit(4),
    db
      .select()
      .from(notes)
      .where(eq(notes.status, "approved"))
      .orderBy(desc(notes.downloadsCount))
      .limit(4),
    db.select({ count: sql<number>`count(*)::int` }).from(notes).where(eq(notes.status, "approved")),
    db.select({ count: sql<number>`count(*)::int` }).from(institutions),
  ]);
  const lecturerCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, "lecturer"));

  return {
    recent,
    popular,
    totalResources: totals[0]?.count ?? 0,
    totalInstitutions: institutionCount[0]?.count ?? 0,
    totalLecturers: lecturerCount[0]?.count ?? 0,
  };
}

function ResourceMiniCard({ note }: { note: typeof notes.$inferSelect }) {
  return (
    <Link
      href={`/explore/${note.id}`}
      className="group block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge tone="teal">{note.resourceType}</Badge>
        {note.isPremium ? <Badge tone="violet">Premium</Badge> : <Badge tone="green">Free</Badge>}
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-[var(--foreground)] group-hover:text-teal-500">
        {note.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-xs text-[var(--foreground)]/60">{note.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-[var(--foreground)]/50">
        <span>{note.downloadsCount} downloads</span>
        <span>{note.ratingCount > 0 ? `★ ${(note.ratingSum / note.ratingCount).toFixed(1)}` : "No ratings yet"}</span>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const { recent, popular, totalResources, totalInstitutions, totalLecturers } = await getHomeData();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-[var(--background)] py-20 text-white dark:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.18),transparent_45%)]" />
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="relative mx-auto mb-8 inline-flex items-center justify-center">
            <span className="absolute h-28 w-28 rounded-full bg-teal-400/25 blur-3xl" aria-hidden />
            <BrandMark size={72} rounded={20} className="relative shadow-2xl shadow-teal-500/25" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-2xl font-semibold tracking-[-0.02em] text-white">
              Know<span className="bg-gradient-to-r from-teal-300 to-violet-400 bg-clip-text text-transparent">Va</span>
            </p>
            <Badge tone="teal" className="mx-auto">Discover · Study · Share — verified academic resources</Badge>
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find trusted notes. <span className="bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">Publish with confidence.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
            KnowVa connects students, lecturers and institutions around verified academic material — searchable,
            moderated, and organized by institution, field, level, and unit.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <ExploreSearchBar />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Join as a student</Button>
            </Link>
            <Link href="/register?role=lecturer">
              <Button size="lg" variant="secondary" className="!bg-white/10 !text-white hover:!bg-white/20">
                Publish as a lecturer
              </Button>
            </Link>
          </div>
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-4 border-t border-white/10 pt-8 text-left">
            <div>
              <p className="text-3xl font-semibold">{totalResources}</p>
              <p className="text-xs text-white/60">Approved resources</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{totalInstitutions}</p>
              <p className="text-xs text-white/60">Institutions represented</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{totalLecturers}</p>
              <p className="text-xs text-white/60">Contributing lecturers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">One platform, three purpose-built experiences</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-[var(--foreground)]/60">
            Students, lecturers and administrators do very different jobs, so each gets its own navigation and
            workspace — on one shared design system, one database and one security model.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              role: "Student portal",
              tone: "from-teal-500/15 to-teal-400/5 border-teal-500/30",
              items: ["Personal dashboard with download allowance", "Search, bookmarks and recently viewed", "Private study notes", "Reviews and premium upgrades"],
            },
            {
              role: "Lecturer portal",
              tone: "from-violet-500/15 to-violet-400/5 border-violet-500/30",
              items: ["Structured uploads with academic metadata", "Approval status and rejection feedback", "Download and rating analytics", "Public biography and attribution"],
            },
            {
              role: "Super admin",
              tone: "from-amber-500/15 to-amber-400/5 border-amber-500/30",
              items: ["Approval queue and takedowns", "Copyright report moderation", "Users, roles and academic structure", "Subscriptions and audit logs"],
            },
          ].map((portal) => (
            <div key={portal.role} className={`rounded-2xl border bg-gradient-to-b p-5 ${portal.tone}`}>
              <div className="flex items-center gap-2.5">
                <BrandMark size={26} rounded={8} />
                <h3 className="text-sm font-semibold text-[var(--foreground)]">{portal.role}</h3>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-[var(--foreground)]/70">
                {portal.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border-subtle)] bg-[var(--surface)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Popular resources</h2>
            <Link href="/explore?sort=popular" className="text-sm font-medium text-teal-500 hover:underline">
              View all →
            </Link>
          </div>
          {popular.length === 0 ? (
            <Card className="text-center text-sm text-[var(--foreground)]/60">
              No resources have been published yet — check back soon.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((note) => (
                <ResourceMiniCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[var(--surface)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Recently added</h2>
            <Link href="/explore?sort=newest" className="text-sm font-medium text-teal-500 hover:underline">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <Card className="text-center text-sm text-[var(--foreground)]/60">Nothing published yet.</Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((note) => (
                <ResourceMiniCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl font-semibold text-[var(--foreground)]">How KnowVa works</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "Lecturers publish",
              body: "Lecturers upload notes, past papers and guides tagged by institution, field, level and unit.",
            },
            {
              title: "Admins verify",
              body: "Every upload is reviewed by an administrator before it becomes visible, keeping the library trustworthy.",
            },
            {
              title: "Students discover",
              body: "Students search, filter, bookmark and download approved resources — with a fair free tier and premium access.",
            },
          ].map((step, i) => (
            <Card key={step.title}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-sm font-semibold text-teal-500">
                {i + 1}
              </div>
              <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">{step.title}</h3>
              <p className="mt-2 text-sm text-[var(--foreground)]/60">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[var(--surface)] py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <Card>
            <Badge tone="teal">For students</Badge>
            <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">Study smarter, not harder</h3>
            <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]/70">
              <li>• Search and filter by institution, field, level and unit</li>
              <li>• Save bookmarks and revisit recently viewed notes</li>
              <li>• Keep private personal study notes tied to your account</li>
              <li>• 3 free premium downloads every month, more with Premium</li>
            </ul>
          </Card>
          <Card>
            <Badge tone="violet">For lecturers</Badge>
            <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">Publish with credibility</h3>
            <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]/70">
              <li>• Upload PDFs and documents with full academic metadata</li>
              <li>• Track downloads, ratings and moderation status</li>
              <li>• Transparent approval workflow — know exactly why something was rejected</li>
              <li>• Build a public catalogue of your contributions</li>
            </ul>
          </Card>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl font-semibold text-[var(--foreground)]">Frequently asked questions</h2>
        <div className="mt-8 space-y-4">
          {[
            {
              q: "Is KnowVa free to use?",
              a: "Yes. Every student gets a free account with 3 premium-note downloads per month. Free resources are unlimited.",
            },
            {
              q: "How are uploads moderated?",
              a: "Every lecturer upload is held as pending until an administrator reviews and approves it, so students only see vetted material.",
            },
            {
              q: "Can I report a resource?",
              a: "Yes — every resource page has a report button for copyright or content concerns, reviewed by an administrator.",
            },
            {
              q: "How do I become a lecturer contributor?",
              a: "Register with a lecturer account. Your uploads will go through the same moderation queue as everyone else.",
            },
          ].map((item) => (
            <Card key={item.q}>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">{item.q}</h3>
              <p className="mt-2 text-sm text-[var(--foreground)]/60">{item.a}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
