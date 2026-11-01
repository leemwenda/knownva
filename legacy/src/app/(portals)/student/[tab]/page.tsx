import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser, sanitizeUser } from "@/lib/auth";
import { PageHeader, SkeletonBlock } from "@/components/ui";
import { ExploreBrowser } from "@/components/explore-browser";
import {
  BookmarksPanel,
  MyLibraryPanel,
  PremiumPanel,
  PrivateNotesPanel,
  ProfilePanel,
  RecentViewsPanel,
  SettingsPanel,
  StudentDashboardPanel,
} from "@/components/portal/panels";

export const dynamic = "force-dynamic";

export default async function StudentTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const publicUser = JSON.parse(JSON.stringify(sanitizeUser(user)));

  const meta: Record<string, { title: string; description: string }> = {
    dashboard: { title: "Student dashboard", description: "Your study activity, allowance and saved resources." },
    explore: { title: "Explore notes", description: "Search approved resources across every institution on KnowVa." },
    "my-notes": { title: "My library", description: "Everything you have downloaded, ready to open again." },
    bookmarks: { title: "Bookmarks", description: "Resources you saved to read later." },
    "recently-viewed": { title: "Recently viewed", description: "Resources you opened recently." },
    "private-notes": { title: "My study notes", description: "Private notes stored on your account — never published." },
    premium: { title: "Premium", description: "Your plan, usage and upgrade options." },
    profile: { title: "Profile", description: "How you appear across KnowVa." },
    settings: { title: "Settings", description: "Security and interface preferences." },
  };

  const current = meta[tab];
  if (!current) notFound();

  let content: React.ReactNode = null;
  switch (tab) {
    case "dashboard":
      content = <StudentDashboardPanel user={publicUser} />;
      break;
    case "explore":
      content = (
        <Suspense fallback={<SkeletonBlock className="h-40" />}>
          <ExploreBrowser basePath="/student/explore" />
        </Suspense>
      );
      break;
    case "my-notes":
      content = <MyLibraryPanel />;
      break;
    case "bookmarks":
      content = <BookmarksPanel />;
      break;
    case "recently-viewed":
      content = <RecentViewsPanel />;
      break;
    case "private-notes":
      content = <PrivateNotesPanel />;
      break;
    case "premium":
      content = <PremiumPanel user={publicUser} />;
      break;
    case "profile":
      content = <ProfilePanel user={publicUser} />;
      break;
    case "settings":
      content = <SettingsPanel user={publicUser} />;
      break;
    default:
      notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={current.title} description={current.description} />
      {content}
    </div>
  );
}
