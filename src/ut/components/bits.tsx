import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function SectionTitle({
  kicker,
  title,
  subtitle,
  align = "left",
}: {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}>
      {kicker && (
        <span className="mb-3 inline-block rounded-full border-2 border-ink bg-zing-yellow px-3 py-1 font-display text-xs font-bold uppercase tracking-widest dark:border-cream">
          {kicker}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base opacity-75 sm:text-lg">{subtitle}</p>}
    </div>
  );
}

export function StatPill({
  label,
  value,
  accent = "bg-zing-lime",
  icon,
}: {
  label: string;
  value: ReactNode;
  accent?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={`rounded-2xl border-2 border-ink p-4 dark:border-cream ${accent}`}>
      <div className="flex items-center gap-2 font-display text-2xl font-bold text-ink sm:text-3xl">
        {icon}
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink/70">{label}</div>
    </div>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
  icon,
}: {
  tone?: "info" | "warn" | "danger" | "success";
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const tones = {
    info: "bg-white dark:bg-ink-soft",
    warn: "bg-zing-yellow text-ink",
    danger: "bg-zing-pink text-white",
    success: "bg-zing-lime text-ink",
  } as const;
  return (
    <div className={`rounded-2xl border-2 border-ink p-4 dark:border-cream ${tones[tone]}`}>
      <div className="flex gap-3">
        {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
        <div className="text-sm">
          {title && <p className="mb-1 font-display font-bold">{title}</p>}
          <div className="opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink/40 p-10 text-center dark:border-cream/40">
      {icon && <div className="mb-3 text-4xl opacity-80">{icon}</div>}
      <p className="font-display text-lg font-bold">{title}</p>
      {body && <p className="mt-2 max-w-md text-sm opacity-70">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div>
      <div className="relative h-8 overflow-hidden rounded-full border-2 border-ink bg-white dark:border-cream dark:bg-ink-soft">
        <motion.div
          className="h-full bg-gradient-to-r from-zing-orange via-zing-yellow to-zing-lime"
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold">
          {Math.round(percent)}%
        </span>
      </div>
      {label && <p className="mt-2 text-center text-sm opacity-70">{label}</p>}
    </div>
  );
}

/** A tooltip that is only ever a bonus — the label is always readable without it. */
export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-[16rem] -translate-x-1/2 translate-y-1 rounded-xl border-2 border-ink bg-zing-yellow px-3 py-2 text-xs font-semibold text-ink opacity-0 shadow-pop-sm transition-all duration-150 group-hover/tt:translate-y-0 group-hover/tt:opacity-100 group-focus-within/tt:translate-y-0 group-focus-within/tt:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-ink py-3 text-cream dark:border-cream">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-sm font-bold uppercase tracking-widest">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            {item}
            <span className="text-zing-orange">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
