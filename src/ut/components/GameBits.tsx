import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 border-ink bg-gradient-to-b from-white to-cream-deep dark:border-cream dark:from-ink-soft dark:to-ink-night ${className}`}
    >
      {children}
    </div>
  );
}

export function Hud({ items }: { items: { label: string; value: ReactNode; accent?: string }[] }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl border-2 border-ink px-3 py-2 text-ink dark:border-cream ${
            item.accent ?? "bg-white dark:bg-ink-soft dark:text-cream"
          }`}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider opacity-65">
            {item.label}
          </p>
          <p className="font-display text-xl font-bold tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function Overlay({
  children,
  tone = "dark",
}: {
  children: ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 p-6 text-center backdrop-blur-sm ${
        tone === "dark" ? "bg-ink/80 text-cream" : "bg-cream/90 text-ink"
      }`}
    >
      {children}
    </motion.div>
  );
}

export function GameButton({
  onClick,
  className = "",
  children,
  label,
}: {
  onClick: () => void;
  className?: string;
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`select-none transition-transform active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}
