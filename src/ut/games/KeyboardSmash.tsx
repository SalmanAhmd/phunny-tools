import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, Play, RotateCcw } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { Hud, Stage, Overlay } from "../components/GameBits";
import { Callout } from "../components/bits";
import { ResultPanel } from "../components/ResultPanel";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { clampi } from "../lib/format";

const tool = TOOL_BY_ID.get("keyboard-smash-championship")!;

const GAME_SECONDS = 10;

interface Title {
  min: number;
  title: string;
  body: string;
}

const TITLES: Title[] = [
  {
    min: 130,
    title: "Human Keyboard",
    body: "You have transcended letters. Somewhere, a mechanical switch is applauding.",
  },
  {
    min: 90,
    title: "Keyboard Warlord",
    body: "Aggressive, relentless, and completely unreadable. A true professional.",
  },
  {
    min: 60,
    title: "Senior Vice President of Typing Loudly",
    body: "Impressive throughput. Zero sentences. The emails write themselves.",
  },
  {
    min: 35,
    title: "Aggressive Correspondent",
    body: "You typed a lot and said almost nothing. Management material.",
  },
  {
    min: 15,
    title: "Enthusiastic Intern",
    body: "Fast fingers, no plan. Exactly what the quarterly report needed.",
  },
  {
    min: 1,
    title: "Gentle Tapper",
    body: "Deliberate. Measured. Possibly still looking for the 'any' key.",
  },
  {
    min: 0,
    title: "Professional Observer",
    body: "You watched the timer with great focus. The keyboard thanks you for your restraint.",
  },
];

function prettyKey(key: string): string {
  if (key === " ") return "Space";
  if (key.startsWith("Arrow")) return key.replace("Arrow", "Arrow ");
  if (key.length === 1) return key.toUpperCase();
  return key;
}

type Phase = "idle" | "playing" | "over";

export default function KeyboardSmash() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const keyCounts = useRef<Map<string, number>>(new Map());
  const countRef = useRef(0);
  const { recordGamePlayed, recordButtonClick, stats } = useStats();
  const { pushToast, fireConfetti } = useUI();

  // Count every keydown, while politely refusing to scroll the page.
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === " " ||
        e.key === "PageUp" ||
        e.key === "PageDown" ||
        e.key === "Home" ||
        e.key === "End" ||
        e.key.startsWith("Arrow")
      ) {
        e.preventDefault();
      }
      if (e.repeat) return;
      countRef.current += 1;
      keyCounts.current.set(e.key, (keyCounts.current.get(e.key) ?? 0) + 1);
      setTotal(countRef.current);
      setLastKey(e.key);
      if (countRef.current % 10 === 0) sfx("tick");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || timeLeft > 0) return;
    setPhase("over");
    sfx("success");
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== "over") return;
    recordGamePlayed("keyboard-smash-championship", countRef.current);
    fireConfetti();
    pushToast({
      title: "Keyboard has filed a complaint",
      body: "It was a good keyboard. It did nothing wrong.",
      tone: "chaos",
      icon: "⌨️",
    });
  }, [phase, recordGamePlayed, fireConfetti, pushToast]);

  const start = () => {
    countRef.current = 0;
    keyCounts.current = new Map();
    setTotal(0);
    setTimeLeft(GAME_SECONDS);
    setLastKey(null);
    setPhase("playing");
    sfx("pop");
    recordButtonClick();
  };

  let mostKey = "—";
  let mostCount = 0;
  for (const [k, v] of keyCounts.current) {
    if (v > mostCount) {
      mostCount = v;
      mostKey = k;
    }
  }

  const liveSeconds = Math.max(1, GAME_SECONDS - timeLeft);
  const kps = total / liveSeconds;
  const finalKps = total / GAME_SECONDS;
  const wpm = (total / 5) / (GAME_SECONDS / 60);
  const chaos = clampi(Math.round(finalKps * 9), 0, 100);
  const award = TITLES.find((t) => total >= t.min) ?? TITLES[TITLES.length - 1];
  const best = stats.highestScores["keyboard-smash-championship"] ?? 0;
  const topKeys = [...keyCounts.current.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> this counts keystrokes on a web page. It does not type
          anything real, save anything, or improve anyone's words per minute. Your keyboard survives.
        </span>
      }
    >
      <Hud
        items={[
          { label: "Keystrokes", value: total, accent: "bg-zing-yellow text-ink" },
          { label: "Time left", value: `${timeLeft}s` },
          { label: "Keys/sec", value: kps.toFixed(1) },
          { label: "Most used", value: prettyKey(mostKey), accent: "bg-zing-purple text-white" },
        ]}
      />

      <Stage className="flex h-[22rem] flex-col items-center justify-center gap-5 p-6 sm:h-[26rem]">
        <AnimatePresence mode="popLayout">
          {lastKey && phase === "playing" && (
            <motion.div
              key={total}
              initial={{ scale: 0.6, rotate: -6, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-ink bg-white font-display text-4xl font-bold text-ink shadow-pop dark:border-cream dark:bg-ink-soft dark:text-cream"
            >
              {prettyKey(lastKey)}
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "playing" && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {topKeys.map(([k, v]) => (
              <span
                key={k}
                className="rounded-xl border-2 border-ink bg-zing-lime px-3 py-1.5 font-mono text-xs font-bold text-ink dark:border-cream"
              >
                {prettyKey(k)} ×{v}
              </span>
            ))}
          </div>
        )}

        {phase !== "playing" && (
          <p className="text-center text-sm opacity-70">
            {phase === "over"
              ? "Time. Your keyboard may now rest."
              : "Ten seconds of lawful keyboard chaos await."}
          </p>
        )}

        <AnimatePresence>
          {phase === "idle" && (
            <Overlay>
              <p className="text-5xl" aria-hidden>
                ⌨️
              </p>
              <h2 className="font-display text-2xl font-bold">Keyboard Smash Championship</h2>
              <p className="max-w-md text-sm opacity-80">
                Press start, then hammer the keys for ten seconds. No words required. No words will
                be formed. We measure raw throughput and award a title you cannot use on LinkedIn.
              </p>
              <Btn variant="primary" sound="pop" size="lg" onClick={start}>
                <Play size={20} /> Begin smashing
              </Btn>
            </Overlay>
          )}
        </AnimatePresence>
      </Stage>

      {phase === "over" && (
        <div className="mt-8">
          <ResultPanel
            tone="yellow"
            title="Official championship results"
            subtitle={award.body}
            rows={[
              { label: "Awarded title", value: award.title, emphasis: true },
              { label: "Total keystrokes", value: total },
              { label: "Keys per second", value: finalKps.toFixed(1) },
              { label: "Nonsense WPM", value: wpm.toFixed(0) },
              { label: "Most used key", value: `${prettyKey(mostKey)} (${mostCount}×)` },
              { label: "Chaos rating", value: `${chaos}/100` },
              { label: "Session best", value: best },
            ]}
            footer={
              <div className="flex flex-wrap gap-3">
                <Btn variant="primary" sound="pop" onClick={start}>
                  <RotateCcw size={18} /> Smash again
                </Btn>
              </div>
            }
          />
        </div>
      )}

      {phase !== "over" && (
        <div className="mt-6">
          <Callout tone="info" title="House rules" icon={<Keyboard size={18} />}>
            Space, arrows and paging keys are blocked during play so the page stays put. Everything
            else is fair game, including the keys you forgot existed.
          </Callout>
        </div>
      )}
    </ToolShell>
  );
}
