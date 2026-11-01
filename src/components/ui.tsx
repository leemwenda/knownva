import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-teal-500",
  secondary:
    "bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border-subtle)] hover:bg-[var(--surface)]",
  outline: "border border-teal-500/50 text-teal-500 hover:bg-teal-500/10",
  ghost: "text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        "kv-focus inline-flex items-center justify-center font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "teal" | "violet" | "amber" | "red" | "green";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[var(--surface-muted)] text-[var(--foreground)]/70 border-[var(--border-subtle)]",
    teal: "bg-teal-500/10 text-teal-500 border-teal-500/30",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    red: "bg-red-500/10 text-red-500 border-red-500/30",
    green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={cn("mb-1.5 block text-sm font-medium text-[var(--foreground)]/80", props.className)}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "kv-focus w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/40",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "kv-focus w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/40",
        props.className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "kv-focus w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-sm text-[var(--foreground)]",
        props.className,
      )}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin text-current", className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-subtle)] px-6 py-14 text-center">
      {icon && <div className="mb-4 text-teal-500">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-[var(--foreground)]/60">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-[var(--surface-muted)]", className)} />;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[var(--foreground)]/60">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/50">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
        {hint && <p className="mt-1 text-xs text-[var(--foreground)]/50">{hint}</p>}
      </div>
      {icon && (
        <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-500">{icon}</div>
      )}
    </Card>
  );
}
