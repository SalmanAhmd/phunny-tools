import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ToolMeta } from "../lib/types";
import { sfx } from "../lib/sound";
import { markToolUsed } from "../lib/recent";
import { toolPath } from "../lib/useSurprise";
import { useStats } from "../lib/stats";

const ACCENT_BG: Record<string, string> = {
  orange: "bg-zing-orange",
  purple: "bg-zing-purple",
  yellow: "bg-zing-yellow",
  lime: "bg-zing-lime",
  pink: "bg-zing-pink",
  cyan: "bg-zing-cyan",
};

export function ToolCard({ tool, index = 0 }: { tool: ToolMeta; index?: number }) {
  const navigate = useNavigate();
  const { recordToolUse } = useStats();
  const Icon = tool.Icon;

  const open = () => {
    markToolUsed(tool.id);
    recordToolUse(tool.id);
    sfx(tool.kind === "game" ? "coin" : "whoosh");
    navigate(toolPath(tool));
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.04, 0.3), type: "spring", stiffness: 260, damping: 24 }}
      className="group flex h-full flex-col rounded-3xl border-2 border-ink bg-white p-5 shadow-pop transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 dark:border-cream dark:bg-ink-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink text-ink shadow-pop-sm transition-transform duration-300 group-hover:rotate-6 dark:border-cream ${
            ACCENT_BG[tool.accent] ?? "bg-zing-orange"
          } ${["orange", "purple", "pink"].includes(tool.accent) ? "text-white" : "text-ink"}`}
          aria-hidden
        >
          <Icon size={26} strokeWidth={2.4} />
        </span>
        {tool.badge && (
          <span className="chip bg-zing-yellow text-ink dark:bg-zing-yellow dark:text-ink">
            {tool.badge}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-xl font-bold leading-tight">{tool.name}</h3>
      <p className="mt-2 flex-1 text-sm opacity-75">{tool.tagline}</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          onClick={open}
          className="btn btn-pop btn-ghost w-full text-sm"
          aria-label={`Use ${tool.name}`}
        >
          <Sparkles size={16} />
          Use tool
          <ArrowUpRight size={16} />
        </button>
      </div>
    </motion.article>
  );
}
