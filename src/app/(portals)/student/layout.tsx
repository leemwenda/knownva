import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudentSectionLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/student/dashboard");
  // Lecturers and admins have their own portals; students must not open them.
  if (user.role === "lecturer") redirect("/lecturer/dashboard");
  if (user.role === "superadmin") redirect("/superadmin/dashboard");
  return <>{children}</>;
}
