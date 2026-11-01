import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SuperAdminSectionLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/superadmin/dashboard");
  if (user.role !== "superadmin") {
    redirect(user.role === "lecturer" ? "/lecturer/dashboard" : "/student/dashboard");
  }
  return <>{children}</>;
}
