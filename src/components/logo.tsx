import Link from "next/link";
import { BrandLockup, BrandMark } from "@/components/brand-mark";

export { BrandMark, BrandLockup };

export function Logo({
  className,
  size = "md",
  tagline = false,
  href = "/",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
  href?: string | null;
}) {
  const lockup = <BrandLockup markSize={size === "lg" ? 40 : size === "sm" ? 26 : 32} size={size} tagline={tagline} />;

  if (!href) return <span className={className}>{lockup}</span>;

  return (
    <Link href={href} className={`kv-focus inline-flex rounded-lg ${className || ""}`} aria-label="KnowVa home">
      {lockup}
    </Link>
  );
}
