import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { sfx } from "../lib/sound";
import { Btn } from "./Btn";
import { copyToClipboard, downloadText } from "../lib/download";
import { useUI } from "../lib/ui";

export interface ReportRow {
  label: string;
  value: ReactNode;
  /** Highlight the row as the "headline" result. */
  emphasis?: boolean;
}

export function ResultPanel({
  title,
  subtitle,
  rows,
  footer,
  tone = "lime",
}: {
  title: string;
  subtitle?: string;
  rows: ReportRow[];
  footer?: ReactNode;
  tone?: "lime" | "yellow" | "purple" | "pink";
}) {
  const tones = {
    lime: "bg-zing-lime",
    yellow: "bg-zing-yellow",
    purple: "bg-zing-purple text-white",
    pink: "bg-zing-pink text-white",
  } as const;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="overflow-hidden rounded-3xl border-2 border-ink shadow-pop-lg dark:border-cream"
    >
      <div className={`border-b-2 border-ink p-5 dark:border-cream ${tones[tone]}`}>
        <p className="font-display text-xl font-bold">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm opacity-80">{subtitle}</p>}
      </div>
      <dl className="divide-y-2 divide-ink/10 bg-white dark:divide-cream/10 dark:bg-ink-soft">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex flex-wrap items-baseline justify-between gap-2 px-5 py-3 ${
              row.emphasis ? "font-bold" : ""
            }`}
          >
            <dt className="text-sm uppercase tracking-wide opacity-60">{row.label}</dt>
            <dd className={`font-display ${row.emphasis ? "text-xl" : "text-base"}`}>{row.value}</dd>
          </div>
        ))}
      </dl>
      {footer && (
        <div className="border-t-2 border-ink bg-cream-deep p-5 dark:border-cream dark:bg-ink">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

export function ExportButtons({
  text,
  filename,
  label = "Download report",
}: {
  text: string;
  filename: string;
  label?: string;
}) {
  const { pushToast } = useUI();
  return (
    <div className="flex flex-wrap gap-3">
      <Btn
        variant="purple"
        sound="ding"
        onClick={() => {
          downloadText(text, filename);
          pushToast({
            title: "Report downloaded",
            body: "It is now your responsibility.",
            tone: "info",
            icon: "🗄️",
          });
        }}
      >
        {label}
      </Btn>
      <Btn
        variant="ghost"
        sound="pop"
        onClick={async () => {
          const ok = await copyToClipboard(text);
          if (ok) sfx("success");
          pushToast({
            title: ok ? "Copied" : "Copy failed",
            body: ok ? "Your clipboard is now heavier." : "Your browser said no. Rude.",
            tone: ok ? "success" : "danger",
            icon: ok ? "📋" : "😵",
          });
        }}
      >
        Copy to clipboard
      </Btn>
    </div>
  );
}
