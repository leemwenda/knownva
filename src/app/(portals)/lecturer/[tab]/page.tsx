import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser, sanitizeUser } from "@/lib/auth";
import { PageHeader, SkeletonBlock } from "@/components/ui";
import { ExploreBrowser } from "@/components/explore-browser";
import {
  BookmarksPanel,
  LecturerDashboardPanel,
  LecturerReviewsPanel,
  ManageResourcesPanel,
  PremiumPanel,
  PrivateNotesPanel,
  ProfilePanel,
  SettingsPanel,
  UploadPanel,
} from "@/components/portal/panels";

export const dynamic = "force-dynamic";

export default async function LecturerTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const publicUser = JSON.parse(JSON.stringify(sanitizeUser(user)));

  const meta: Record<string, { title: string; description: string }> = {
    dashboard: { title: "Lecturer dashboard", description: "Your publications, reach and moderation status." },
    resources: { title: "My resources", description: "Manage metadata, status and availability of everything you publish." },
    upload: { title: "Upload a resource", description: "Submit academic material for administrative review." },
    reviews: { title: "Reviews", description: "Student feedback across your published resources." },
    explore: { title: "Explore notes", description: "Browse the wider KnowVa library." },
    bookmarks: { title: "Bookmarks", description: "Resources you saved." },
    "private-notes": { title: "My notes", description: "Private preparation notes — never published." },
    premium: { title: "Premium", description: "Your plan and download allowance." },
    profile: { title: "Profile", description: "Your public lecturer profile." },
    settings: { title: "Settings", description: "Security and interface preferences." },
  };

  const current = meta[tab];
  if (!current) notFound();

  let content: React.ReactNode = null;
  switch (tab) {
    case "dashboard":
      content = <LecturerDashboardPanel />;
      break;
    case "resources":
      content = <ManageResourcesPanel />;
      break;
    case "upload":
      content = <UploadPanel />;
      break;
    case "reviews":
      content = <LecturerReviewsPanel />;
      break;
    case "explore":
      content = (
        <Suspense fallback={<SkeletonBlock className="h-40" />}>
          <ExploreBrowser basePath="/lecturer/explore" />
        </Suspense>
      );
      break;
    case "bookmarks":
      content = <BookmarksPanel />;
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
