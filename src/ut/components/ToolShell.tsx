import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { ToolMeta } from "../lib/types";

const ACCENT_BG: Record<string, string> = {
  orange: "bg-zing-orange",
  purple: "bg-zing-purple",
  yellow: "bg-zing-yellow",
  lime: "bg-zing-lime",
  pink: "bg-zing-pink",
  cyan: "bg-zing-cyan",
};

export function ToolShell({
  tool,
  children,
  disclosure,
}: {
  tool: ToolMeta;
  children: ReactNode;
  /** Honest note about what the tool actually does. */
  disclosure?: ReactNode;
}) {
  const Icon = tool.Icon;
  const isGame = tool.kind === "game";
  const accent = ACCENT_BG[tool.accent] ?? "bg-zing-orange";
  const textOnAccent = ["yellow", "lime", "cyan"].includes(tool.accent) ? "text-ink" : "text-white";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <Link
        to={isGame ? "/games" : "/tools"}
        className="mb-6 inline-flex items-center gap-2 font-display text-sm font-bold opacity-70 hover:opacity-100"
      >
        <ArrowLeft size={16} /> {isGame ? "All mini games" : "All tools"}
      </Link>

      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
        <motion.div
          initial={{ rotate: -8, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-2 border-ink shadow-pop dark:border-cream ${accent} ${textOnAccent}`}
        >
          <Icon size={38} strokeWidth={2.4} />
        </motion.div>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="chip">{tool.category}</span>
            {tool.badge && (
              <span className="chip bg-zing-yellow text-ink">{tool.badge}</span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{tool.name}</h1>
          <p className="mt-2 max-w-2xl opacity-75">{tool.description}</p>
        </div>
      </header>

      {disclosure && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border-2 border-ink bg-white/70 p-4 text-sm dark:border-cream dark:bg-ink-soft/70">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-zing-purple" />
          <div className="opacity-80">{disclosure}</div>
        </div>
      )}

      {children}
    </div>
  );
}
