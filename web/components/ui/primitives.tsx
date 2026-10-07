import { FlaskConical, Lock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { DEMO_DISCLOSURE } from "@/lib/config/disclosure";
import { cn } from "@/lib/utils/cn";

export function Container({ children, className, size = "default" }: { children: ReactNode; className?: string; size?: "default" | "narrow" | "wide" }) {
  const max = size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-[1320px]" : "max-w-[1200px]";
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", max, className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs font-semibold uppercase tracking-[0.14em] text-accent-700", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
  as: H = "h2",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <H className={cn(H === "h1" ? "text-display-lg" : "text-display-md", "font-semibold")}>{title}</H>
      {lead && <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-3">{lead}</p>}
    </div>
  );
}

export function Card({ children, className, interactive = false }: { children: ReactNode; className?: string; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface shadow-xs",
        interactive &&
          "transition-[box-shadow,border-color,transform] duration-300 ease-(--ease-soft) hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

type BadgeTone = "neutral" | "accent" | "pro" | "danger" | "outline";
const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  accent: "bg-accent-50 text-accent-700",
  pro: "bg-pro-50 text-pro-700",
  danger: "bg-danger-50 text-danger-600",
  outline: "border border-line text-ink-3",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}>
      {children}
    </span>
  );
}

export function ProBadge({ className }: { className?: string }) {
  return (
    <Badge tone="pro" className={className}>
      <Sparkles aria-hidden className="size-3" /> Pro
    </Badge>
  );
}

/** Mandatory label on anything computed from demo records. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-dashed border-pro-500/60 bg-pro-50 px-2.5 py-0.5 text-xs font-medium text-pro-700",
        className,
      )}
      title={DEMO_DISCLOSURE.short}
    >
      <FlaskConical aria-hidden className="size-3" /> {DEMO_DISCLOSURE.badge}
      <span className="sr-only"> — {DEMO_DISCLOSURE.short}</span>
    </span>
  );
}

export function DemoNotice({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={cn("flex gap-3 rounded-md border border-dashed border-pro-500/50 bg-pro-50/70 p-3.5 text-sm text-pro-700", className)} role="note">
      <FlaskConical aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p>
        {children ?? DEMO_DISCLOSURE.long}
      </p>
    </div>
  );
}

export function EmptyState({ icon, title, children, action, className }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-surface/60 px-6 py-12 text-center", className)}>
      {icon && <div className="mb-4 grid size-11 place-items-center rounded-full bg-surface-2 text-ink-3">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <div className="mt-2 max-w-md text-sm leading-relaxed text-ink-3">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return <Lock aria-hidden className={cn("size-4", className)} />;
}

export function StatTile({ label, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-line bg-surface p-4 sm:p-5", className)}>
      <p className="text-sm text-ink-3">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-[2.1rem]">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  );
}
