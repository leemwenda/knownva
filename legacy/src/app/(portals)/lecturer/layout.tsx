import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LecturerSectionLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/lecturer/dashboard");
  if (user.role === "student") redirect("/student/dashboard");
  return <>{children}</>;
}
