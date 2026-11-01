import type { ReactNode } from "react";
import { getCurrentUser, sanitizeUser } from "@/lib/auth";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav user={user ? JSON.parse(JSON.stringify(sanitizeUser(user))) : null} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
