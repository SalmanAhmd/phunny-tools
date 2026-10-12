import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Paintbrush, RotateCcw, Sparkles } from "lucide-react";
import { ToolShell } from "../../components/ToolShell";
import { Btn } from "../../components/Btn";
import { Callout, ProgressBar, StatPill } from "../../components/bits";
import { TOOL_BY_ID } from "../../lib/registry";
import { useStats } from "../../lib/stats";
import { useUI } from "../../lib/ui";
import { sfx } from "../../lib/sound";
import { randInt } from "../../lib/random";

const tool = TOOL_BY_ID.get("button-polisher")!;

const MILESTONES = [25, 50, 75, 100];

const MILESTONE_TOASTS: Record<number, string> = {
  25: "A quarter clean. A quarter pointlessly committed.",
  50: "Halfway to hygienic. Nobody asked for this.",
  75: "Almost clinically clean. Please consider stopping.",
  100: "Immaculate. Technically pointless. Deeply satisfying.",
};

export default function ButtonPolisher() {
  const [clean, setClean] = useState(0);
  const [polishes, setPolishes] = useState(0);
  const [smudges, setSmudges] = useState(0);
  const [holding, setHolding] = useState(false);
  const { recordToolUse } = useStats();
  const { pushToast, fireConfetti, reducedMotion } = useUI();

  const cleanRef = useRef(clean);
  cleanRef.current = clean;
  const usedRef = useRef(false);
  const milestonesRef = useRef<Set<number>>(new Set());

  const bump = useCallback(() => {
    const prev = cleanRef.current;
    let next: number;
    if (prev < 100) {
      next = Math.min(100, prev + randInt(2, 6));
      sfx("tick");
    } else {
      next = Math.max(0, prev - randInt(4, 9));
      setSmudges((s) => s + 1);
      sfx("boing");
    }
    cleanRef.current = next;
    setClean(next);
    setPolishes((p) => p + 1);

    for (const milestone of MILESTONES) {
      if (next >= milestone && !milestonesRef.current.has(milestone)) {
        milestonesRef.current.add(milestone);
        sfx("success");
        pushToast({
          title: `${milestone}% polished`,
          body: MILESTONE_TOASTS[milestone],
          tone: milestone === 100 ? "success" : "info",
          icon: "🧼",
        });
        if (milestone === 100 && !reducedMotion) fireConfetti();
      }
    }
  }, [pushToast, fireConfetti, reducedMotion]);

  useEffect(() => {
    if (!holding) return;
    const id = window.setInterval(bump, 70);
    return () => window.clearInterval(id);
  }, [holding, bump]);

  useEffect(() => {
    if (!holding) return;
    const end = () => setHolding(false);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [holding]);

  const start = () => {
    if (holding) return;
    if (!usedRef.current) {
      usedRef.current = true;
      recordToolUse(tool.id);
    }
    setHolding(true);
    bump();
  };

  const stop = () => setHolding(false);

  const startOver = () => {
    stop();
    cleanRef.current = 0;
    setClean(0);
    setPolishes(0);
    setSmudges((s) => s + 1);
    milestonesRef.current = new Set();
    sfx("thud");
    pushToast({
      title: "Fresh smudge applied",
      body: "You have made it worse, deliberately. Respect.",
      tone: "chaos",
      icon: "🫥",
    });
  };

  const shiny = clean >= 100;

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> the button was already clean. It has always been clean.
          This ritual changes nothing except a local number and your afternoon. No files, devices or
          buttons are actually polished.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <div className="relative flex min-h-[22rem] flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-ink bg-gradient-to-b from-white to-cream-deep p-6 dark:border-cream dark:from-ink-soft dark:to-ink-night">
            <motion.button
              type="button"
              onPointerDown={start}
              onPointerUp={stop}
              onPointerLeave={stop}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  start();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") stop();
              }}
              animate={holding ? { scale: 0.93, rotate: -2 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 17 }}
              aria-label="Polish the button. Press and hold for continuous polishing."
              className="relative h-56 w-56 touch-none select-none overflow-hidden rounded-full border-4 border-ink bg-gradient-to-br from-white to-cream-deep shadow-pop-lg dark:border-cream dark:from-ink-soft dark:to-ink-night"
            >
              {!reducedMotion && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 h-40 w-14 -translate-y-1/2 rounded-full bg-white/70 blur-md"
                  animate={holding ? { x: [-70, 210], rotate: 15 } : { x: -70, rotate: 15 }}
                  transition={
                    holding
                      ? { repeat: Infinity, duration: 0.9, ease: "linear" }
                      : { duration: 0.2 }
                  }
                />
              )}
              <span className="relative flex flex-col items-center gap-2">
                <Paintbrush size={46} strokeWidth={2.2} />
                <span className="font-display text-lg font-bold">
                  {holding ? "POLISHING…" : "PRESS & HOLD"}
                </span>
                <span className="font-mono text-xs opacity-70">{clean}% clean</span>
              </span>
            </motion.button>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-hidden>
              {Array.from({ length: Math.min(smudges, 8) }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xl"
                >
                  💧
                </motion.span>
              ))}
              {smudges === 0 && <span className="text-sm opacity-60">No smudges. Yet.</span>}
            </div>
          </div>

          <ProgressBar percent={clean} label={shiny ? "Achieved: immaculate" : "Cleanliness"} />

          <div className="flex flex-wrap gap-3">
            <Btn variant="ghost" sound="thud" onClick={startOver}>
              <RotateCcw size={18} /> Start over (add a fresh smudge)
            </Btn>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <StatPill label="Clean" value={`${clean}%`} accent="bg-zing-cyan" icon={<Sparkles size={18} />} />
            <StatPill label="Polishes" value={polishes} accent="bg-zing-yellow" />
            <StatPill label="Smudges" value={smudges} accent="bg-zing-pink" />
          </div>

          <div className="card-pop p-5">
            <p className="label">Milestones</p>
            <ul className="space-y-2">
              {MILESTONES.map((m) => {
                const earned = milestonesRef.current.has(m);
                return (
                  <li
                    key={m}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-sm ${
                      earned
                        ? "border-ink bg-zing-lime text-ink dark:border-cream"
                        : "border-ink/15 opacity-50 dark:border-cream/15"
                    }`}
                  >
                    <span className="text-xl" aria-hidden>
                      {earned ? "🏅" : "🔒"}
                    </span>
                    <span>
                      <span className="block font-display font-bold">{m}% polished</span>
                      <span className="block text-xs opacity-75">{MILESTONE_TOASTS[m]}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <Callout tone="warn" title="Over-polishing is a real risk" icon={<Paintbrush size={18} />}>
            Keep polishing past 100% and you will begin removing the shine you just added. Every
            smudge is a small, avoidable tragedy of your own making.
          </Callout>
        </div>
      </div>
    </ToolShell>
  );
}
