import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Type } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { corporateize } from "../lib/jargon";
import { clampi } from "../lib/format";

const tool = TOOL_BY_ID.get("fontify-your-problems")!;

interface FontChoice {
  id: string;
  name: string;
  stack: string;
  base: number;
  note: string;
}

const FONTS: FontChoice[] = [
  {
    id: "comic",
    name: "Comic Sans Emergency",
    stack: '"Comic Sans MS", "Comic Sans", "Chalkboard SE", cursive',
    base: 91,
    note: "Deployed in genuine emergencies, such as a memo about parking.",
  },
  {
    id: "times",
    name: "Times New Roman Depression",
    stack: '"Times New Roman", Times, "Liberation Serif", serif',
    base: 64,
    note: "Every letter loaded with the weight of an unpaid invoice.",
  },
  {
    id: "papyrus",
    name: "Papyrus Executive Edition",
    stack: 'Papyrus, "Papyrus MS", "Comic Sans MS", fantasy',
    base: 88,
    note: "The font of blockbuster films and extremely serious business.",
  },
  {
    id: "impact",
    name: "Impactful Life Decisions",
    stack: 'Impact, Haettenschweiler, "Arial Black", sans-serif',
    base: 76,
    note: "Perfect for announcements nobody asked for.",
  },
  {
    id: "wingdings",
    name: "Wingdings Legal Notice",
    stack: 'Wingdings, "Zapf Dingbats", "Apple Symbols", fantasy',
    base: 99,
    note: "Legally binding in at least one jurisdiction. Nobody knows which.",
  },
];

export default function FontifyYourProblems() {
  const [text, setText] = useState("I have a small problem with the printer.");
  const [fontId, setFontId] = useState(FONTS[0].id);
  const [corporate, setCorporate] = useState(false);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  const font = FONTS.find((f) => f.id === fontId) ?? FONTS[0];
  const shown = corporate ? corporateize(text) : text;

  const severity = useMemo(() => {
    const caps = (shown.match(/[A-Z]/g)?.length ?? 0) / Math.max(1, shown.length);
    const bangs = (shown.match(/!/g)?.length ?? 0) * 4;
    const length = Math.min(20, shown.length / 4);
    const corporateBonus = corporate ? 12 : 0;
    return clampi(Math.round(font.base * 0.6 + caps * 40 + bangs + length + corporateBonus), 1, 100);
  }, [shown, font.base, corporate]);

  const severityLabel =
    severity > 92
      ? "Critically unserious"
      : severity > 78
        ? "Aggressively informal"
        : severity > 60
          ? "Noticeably wrong"
          : severity > 40
            ? "Mildly regrettable"
            : "Almost professional";

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> the preview uses fonts your device already has. If a font
          is missing, your browser substitutes something even less appropriate, which is arguably
          funnier. The severity score is a vibe, not a science.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <div className="card p-5">
            <label className="label" htmlFor="font-text">
              Your emotionally unresolved text
            </label>
            <textarea
              id="font-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="tool-input resize-y"
              placeholder="Type something that needs to be taken less seriously…"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Btn
                variant="purple"
                sound="pop"
                onClick={() => {
                  setCorporate((c) => !c);
                  recordToolUse(tool.id);
                  sfx("whoosh");
                  pushToast({
                    title: corporate ? "Corporate filter removed" : "Corporate filter engaged",
                    body: corporate
                      ? "Clarity restored. For now."
                      : "Your sentence is now aligned, socialised and parked.",
                    tone: "chaos",
                    icon: "💼",
                  });
                }}
              >
                <Briefcase size={18} /> {corporate ? "Undo corporatisation" : "Make it more corporate"}
              </Btn>
            </div>
          </div>

          <div className="card p-5">
            <p className="label">Ridiculous font styles</p>
            <div className="grid gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFontId(f.id);
                    recordToolUse(tool.id);
                    sfx("click");
                  }}
                  className={`rounded-2xl border-2 p-3 text-left transition-colors ${
                    fontId === f.id
                      ? "border-ink bg-zing-lime dark:border-cream"
                      : "border-ink/20 hover:border-ink dark:border-cream/20 dark:hover:border-cream"
                  }`}
                >
                  <span className="block font-display font-bold">{f.name}</span>
                  <span className="block text-xs opacity-70">{f.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-4 py-2 text-cream dark:border-cream">
              <span className="flex items-center gap-2 font-display text-sm font-bold">
                <Type size={16} /> Live preview
              </span>
              <span className="font-mono text-xs opacity-70">{font.name}</span>
            </div>
            <div className="flex min-h-[14rem] items-center justify-center p-6">
              <motion.p
                key={font.id + corporate}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-full break-words text-center text-2xl leading-snug sm:text-3xl"
                style={{ fontFamily: font.stack }}
              >
                {shown || "…"}
              </motion.p>
            </div>
          </div>

          <div className="rounded-3xl border-2 border-ink bg-zing-pink p-5 text-white dark:border-cream">
            <p className="font-display text-sm uppercase tracking-widest text-white/70">
              Severity score
            </p>
            <p className="font-display text-5xl font-bold">{severity}/100</p>
            <p className="mt-1">{severityLabel}</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-white/50">
              <motion.div
                className="h-full bg-zing-yellow"
                animate={{ width: `${severity}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          <Callout tone="info" title="What changed?">
            Nothing about your problem. It is the same problem. It is simply now wearing Papyrus, and
            that is somehow worse for everyone.
          </Callout>
        </div>
      </div>
    </ToolShell>
  );
}
