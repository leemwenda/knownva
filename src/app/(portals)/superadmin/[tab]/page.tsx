import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser, sanitizeUser } from "@/lib/auth";
import { PageHeader, SkeletonBlock } from "@/components/ui";
import { ExploreBrowser } from "@/components/explore-browser";
import { PrivateNotesPanel, ProfilePanel, SettingsPanel } from "@/components/portal/panels";
import {
  AdminOverviewPanel,
  AdminSettingsPanel,
  AllResourcesPanel,
  ApprovalsPanel,
  AuditLogsPanel,
  ReportsPanel,
  StructurePanel,
  SubscriptionsPanel,
  UsersPanel,
} from "@/components/admin/panels";

export const dynamic = "force-dynamic";

const META: Record<string, { title: string; description: string }> = {
  dashboard: { title: "Platform overview", description: "Real counts from the KnowVa database — users, library, queues." },
  approvals: { title: "Approval queue", description: "Review lecturer uploads. Approving publishes a resource; rejection requires a reason." },
  resources: { title: "All resources", description: "Inspect, restore or take down anything in the library." },
  reports: { title: "Copyright & content reports", description: "Investigate reports filed by students and lecturers." },
  users: { title: "Users", description: "Search accounts, manage roles and suspend or reactivate access." },
  "academic-structure": { title: "Academic structure", description: "Maintain institutions, fields, levels and units used across the library." },
  subscriptions: { title: "Subscriptions", description: "Plan and payment state as verified by the backend." },
  "audit-logs": { title: "Audit logs", description: "Security-sensitive administrative actions with actor and timestamp." },
  settings: { title: "Admin settings", description: "Platform rules and integration health. Secrets are never displayed." },
  explore: { title: "Explore notes", description: "Browse the public library as an administrator." },
  "private-notes": { title: "My notes", description: "Private notes for your admin work." },
  profile: { title: "Profile", description: "Your account details." },
  settingsAccount: { title: "Account", description: "Security preferences." },
};

export default async function SuperAdminTabPage({
  params,
  searchParams,
}: {
  params: Promise<{ tab: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { tab } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user || user.role !== "superadmin") notFound();
  const publicUser = JSON.parse(JSON.stringify(sanitizeUser(user)));

  const current = META[tab];
  if (!current) notFound();

  let content: React.ReactNode = null;
  switch (tab) {
    case "dashboard":
      content = <AdminOverviewPanel />;
      break;
    case "approvals":
      content = <ApprovalsPanel />;
      break;
    case "resources":
      content = <AllResourcesPanel initialStatus={sp.status || "all"} />;
      break;
    case "reports":
      content = <ReportsPanel />;
      break;
    case "users":
      content = <UsersPanel />;
      break;
    case "academic-structure":
      content = <StructurePanel />;
      break;
    case "subscriptions":
      content = <SubscriptionsPanel />;
      break;
    case "audit-logs":
      content = <AuditLogsPanel />;
      break;
    case "settings":
      content = <AdminSettingsPanel />;
      break;
    case "explore":
      content = (
        <Suspense fallback={<SkeletonBlock className="h-40" />}>
          <ExploreBrowser basePath="/superadmin/explore" />
        </Suspense>
      );
      break;
    case "private-notes":
      content = <PrivateNotesPanel />;
      break;
    case "profile":
      content = <ProfilePanel user={publicUser} />;
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

