import { useId } from "react";

type MarkTone = "gradient" | "badge" | "light" | "mono";

/**
 * KnowVa brand mark.
 *
 * The glyph is a single continuous idea drawn three ways at once:
 *  - a "K" for KnowVa,
 *  - an open book seen from the spine (the stem + two fanning pages),
 *  - a verification check (the lower diagonal) for the moderation guarantee.
 *
 * Drawn as SVG so it stays crisp at 16px in a favicon and at 96px in a hero.
 */
export function BrandMark({
  size = 32,
  tone = "gradient",
  className,
  rounded = 9,
}: {
  size?: number;
  tone?: MarkTone;
  className?: string;
  rounded?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `kv-mark-${uid}`;
  const shineId = `kv-shine-${uid}`;

  const stroke = tone === "gradient" || tone === "badge" ? "#ffffff" : "currentColor";
  const strokeWidth = 3.1;

  const paths = (
    <g
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 7.6v16.8" />
      <path d="M9 16l8-8.2" />
      <path d="M9 16l4.6 5.4L23 11.3" />
    </g>
  );

  if (tone === "mono" || tone === "light") {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label="KnowVa mark"
      >
        {paths}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="KnowVa"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tone === "badge" ? "#0f1b2d" : "#2dd4bf"} />
          <stop offset="52%" stopColor={tone === "badge" ? "#115e59" : "#14b8a6"} />
          <stop offset="100%" stopColor={tone === "badge" ? "#4c1d95" : "#7c3aed"} />
        </linearGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="32" height="32" rx={rounded} fill={`url(#${gradientId})`} />
      <rect x="0" y="0" width="32" height="32" rx={rounded} fill={`url(#${shineId})`} />
      <rect
        x="0.6"
        y="0.6"
        width="30.8"
        height="30.8"
        rx={rounded - 0.6}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.18"
      />
      {paths}
    </svg>
  );
}

export function BrandWordmark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const text =
    size === "lg" ? "text-3xl sm:text-4xl" : size === "sm" ? "text-[15px]" : "text-lg";
  return (
    <span
      className={`${text} font-semibold tracking-[-0.02em] text-[var(--foreground)] ${className || ""}`}
    >
      Know
      <span className="bg-gradient-to-r from-teal-500 via-teal-400 to-violet-500 bg-clip-text text-transparent">
        Va
      </span>
    </span>
  );
}

export function BrandLockup({
  markSize = 32,
  size = "md",
  tone = "gradient",
  tagline = false,
  className,
}: {
  markSize?: number;
  size?: "sm" | "md" | "lg";
  tone?: MarkTone;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className || ""}`}>
      <BrandMark size={markSize} tone={tone} />
      <span className="flex flex-col leading-none">
        <BrandWordmark size={size} />
        {tagline ? (
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--foreground)]/45">
            Verified academic resources
          </span>
        ) : null}
      </span>
    </span>
  );
}
