import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pill({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "secondary" | "success";
  className?: string;
}) {
  const tones = {
    muted: "border-border bg-muted text-muted-foreground",
    primary: "border-primary/40 bg-primary/10 text-primary",
    secondary: "border-secondary/40 bg-secondary/10 text-secondary",
    success: "border-success/40 bg-success/10 text-success",
  } as const;
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center rounded-full border px-2.5 py-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow text-primary">{eyebrow}</p>}
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description && <p className="mt-2 text-[0.975rem] text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="aurora relative overflow-hidden border-b border-border">
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="eyebrow inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-[3.1rem] sm:leading-[1.05]">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}

export function CardShell({
  to,
  params,
  href,
  children,
  className,
}: {
  to?: string;
  params?: Record<string, string>;
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const base = cn(
    "hover-lift focus-ring group relative block h-full overflow-hidden rounded-2xl border border-border bg-card p-5 text-left",
    className,
  );
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={base}>
        {children}
      </a>
    );
  return (
    <Link to={to ?? "/"} params={params as never} className={base}>
      {children}
    </Link>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <p className="font-display text-base font-semibold text-foreground">{title}</p>
      {hint && <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-surface" />
      ))}
    </div>
  );
}
