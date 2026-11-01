import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, sanitizeUser } from "@/lib/auth";
import { AppShell, LECTURER_NAV, STUDENT_NAV, SUPERADMIN_NAV } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function PortalsLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const navItems =
    user.role === "superadmin" ? SUPERADMIN_NAV : user.role === "lecturer" ? LECTURER_NAV : STUDENT_NAV;

  // The shell is a client component, so pass serializable data only.
  const publicUser = JSON.parse(JSON.stringify(sanitizeUser(user)));

  return (
    <AppShell user={publicUser} navItems={navItems}>
      {children}
    </AppShell>
  );
}
