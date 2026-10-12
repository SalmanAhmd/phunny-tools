import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { Hud, Stage, Overlay } from "../components/GameBits";
import { Callout } from "../components/bits";
import { ResultPanel } from "../components/ResultPanel";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { pick, randInt } from "../lib/random";
import { clampi } from "../lib/format";

const tool = TOOL_BY_ID.get("whack-a-bug")!;

interface Bug {
  label: string;
  emoji: string;
  points: number;
  feature?: boolean;
}

interface Slot {
  instanceId: number;
  bug: Bug;
}

const BUGS: Bug[] = [
  { label: "undefined", emoji: "❓", points: 2 },
  { label: "null", emoji: "␀", points: 2 },
  { label: "works_on_my_machine", emoji: "💻", points: 3 },
  { label: "production_bug", emoji: "🔥", points: 5 },
  { label: "one_small_CSS_issue", emoji: "🎨", points: 1 },
];

const FEATURE: Bug = { label: "FEATURE REQUEST", emoji: "📈", points: -8, feature: true };

const HOLES = 9;
const GAME_SECONDS = 45;

const REVIEWS = [
  {
    min: 90,
    title: "Principal Debugger",
    body: "You fixed everything except the actual problem. Outstanding work.",
  },
  {
    min: 60,
    title: "Senior Bug Wrangler",
    body: "Production is still on fire, but it is on fire more slowly now.",
  },
  { min: 35, title: "Mid-level Maintainer", body: "A solid performance, mostly by accident." },
  {
    min: 15,
    title: "Junior Hotfix Enthusiast",
    body: "You clicked things. Some of them were bugs. Growth mindset.",
  },
  {
    min: 0,
    title: "Unpaid Intern",
    body: "The bugs have filed a complaint about you specifically.",
  },
];

type Phase = "idle" | "playing" | "over";

export default function WhackABug() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [slots, setSlots] = useState<(Slot | null)[]>(() => Array(HOLES).fill(null));
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [feedback, setFeedback] = useState<{ id: number; text: string; good: boolean } | null>(null);
  const instanceRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const milestoneRef = useRef(0);
  const timeLeftRef = useRef(GAME_SECONDS);
  timeLeftRef.current = timeLeft;
  const { recordGamePlayed, recordButtonClick, stats } = useStats();
  const { pushToast, fireConfetti } = useUI();

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Bugs pop up on their own schedule, getting faster and less patient.
  useEffect(() => {
    if (phase !== "playing") return;
    let cancelled = false;

    function spawn() {
      if (cancelled) return;
      const elapsed = GAME_SECONDS - timeLeftRef.current;
      const difficulty = clampi(1 + elapsed / 14, 1, 3.6);
      setSlots((prev) => {
        const free = prev.map((s, i) => (s ? -1 : i)).filter((i) => i >= 0);
        if (free.length === 0) return prev;
        const index = free[randInt(0, free.length - 1)];
        const isFeature = Math.random() < 0.12;
        const bug = isFeature ? FEATURE : pick(BUGS);
        const instanceId = ++instanceRef.current;
        const lifetime = clampi((1500 - elapsed * 22) * (isFeature ? 1.6 : 1), 520, 2200);
        const next = [...prev];
        next[index] = { instanceId, bug };
        timersRef.current.push(
          window.setTimeout(() => {
            setSlots((cur) => cur.map((s) => (s && s.instanceId === instanceId ? null : s)));
          }, lifetime),
        );
        return next;
      });
      const interval = clampi(760 / difficulty, 180, 900);
      timersRef.current.push(window.setTimeout(spawn, interval + randInt(0, 200)));
    }

    timersRef.current.push(window.setTimeout(spawn, 320));
    return () => {
      cancelled = true;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || timeLeft > 0) return;
    clearTimers();
    setSlots(Array(HOLES).fill(null));
    setFeedback(null);
    setPhase("over");
    sfx("sad");
  }, [phase, timeLeft, clearTimers]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (score >= milestoneRef.current + 25) {
      milestoneRef.current += 25;
      fireConfetti();
      sfx("success");
      pushToast({
        title: `${milestoneRef.current} points of debugging`,
        body: "Production remains on fire, but you are thriving.",
        tone: "success",
        icon: "🔥",
      });
    }
  }, [score, phase, fireConfetti, pushToast]);

  useEffect(() => {
    if (phase !== "over") return;
    recordGamePlayed("whack-a-bug", score);
  }, [phase, score, recordGamePlayed]);

  const start = () => {
    clearTimers();
    instanceRef.current = 0;
    milestoneRef.current = 0;
    setSlots(Array(HOLES).fill(null));
    setScore(0);
    setMisses(0);
    setTimeLeft(GAME_SECONDS);
    setFeedback(null);
    setPhase("playing");
    sfx("pop");
    recordButtonClick();
  };

  const hit = (index: number) => {
    if (phase !== "playing") return;
    const slot = slots[index];
    if (!slot) {
      setMisses((m) => m + 1);
      setFeedback({ id: Date.now(), text: "whiff 💨", good: false });
      sfx("whoosh");
      return;
    }
    const { bug, instanceId } = slot;
    setSlots((cur) => cur.map((s) => (s && s.instanceId === instanceId ? null : s)));
    recordButtonClick();
    if (bug.feature) {
      setScore((s) => Math.max(0, s + bug.points));
      setFeedback({ id: instanceId, text: "−8 scope creep!", good: false });
      sfx("error");
      pushToast({
        title: "You whacked the FEATURE REQUEST",
        body: "Scope expanded. Timelines moved. Nice one.",
        tone: "danger",
        icon: "📈",
      });
    } else {
      setScore((s) => s + bug.points);
      setFeedback({ id: instanceId, text: `+${bug.points} ${bug.label}`, good: true });
      sfx(bug.points >= 5 ? "coin" : "pop");
    }
  };

  const review = REVIEWS.find((r) => score >= r.min) ?? REVIEWS[REVIEWS.length - 1];
  const best = stats.highestScores["whack-a-bug"] ?? 0;

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> these are pretend bugs in a browser. No real code is
          debugged, no ticket is closed, and production is exactly as on fire as it was before.
        </span>
      }
    >
      <Hud
        items={[
          { label: "Score", value: score, accent: "bg-zing-orange text-white" },
          { label: "Time left", value: `${timeLeft}s` },
          { label: "Misses", value: misses },
          { label: "Session best", value: best, accent: "bg-zing-lime" },
        ]}
      />

      <Stage className="h-[24rem] sm:h-[28rem]">
        <div className="grid h-full grid-cols-3 gap-3 p-4">
          {slots.map((slot, i) => (
            <button
              key={i}
              type="button"
              onClick={() => hit(i)}
              aria-label={slot ? `Bug: ${slot.bug.label}` : `Empty hole ${i + 1}`}
              className={`relative grid place-items-center overflow-hidden rounded-3xl border-2 border-ink transition active:scale-95 dark:border-cream ${
                slot ? "bg-white dark:bg-ink-soft" : "bg-ink/80 dark:bg-ink-night"
              }`}
            >
              <span
                aria-hidden
                className={`absolute bottom-3 h-5 w-16 rounded-full border-2 border-ink dark:border-cream ${
                  slot ? "bg-ink" : "bg-cream-deep dark:bg-ink"
                }`}
              />
              <AnimatePresence>
                {slot && (
                  <motion.span
                    key={slot.instanceId}
                    initial={{ y: 44, scale: 0.5, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 40, scale: 0.6, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 24 }}
                    className="relative z-10 flex flex-col items-center gap-1"
                  >
                    <span
                      aria-hidden
                      className={`leading-none ${slot.bug.feature ? "text-4xl" : "text-3xl"}`}
                    >
                      {slot.bug.emoji}
                    </span>
                    <span
                      className={`max-w-[6.5rem] truncate rounded-full border border-ink px-1.5 py-0.5 font-display text-[8px] font-bold ${
                        slot.bug.feature ? "bg-zing-pink text-white" : "bg-zing-yellow text-ink"
                      }`}
                    >
                      {slot.bug.label}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: 1, y: -18, scale: 1 }}
              exit={{ opacity: 0, y: -44 }}
              className={`pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 font-display text-xl font-bold ${
                feedback.good ? "text-zing-lime" : "text-zing-pink"
              }`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "idle" && (
            <Overlay>
              <p className="text-5xl" aria-hidden>
                🐛
              </p>
              <h2 className="font-display text-2xl font-bold">Debugging, as nature intended</h2>
              <p className="max-w-md text-sm opacity-80">
                Bugs pop up for a moment at a time. Whack them for points. If a big{" "}
                <span className="font-bold text-zing-pink">FEATURE REQUEST</span> appears, leave it
                alone — that is scope creep and it costs you eight points.
              </p>
              <Btn variant="primary" sound="pop" size="lg" onClick={start}>
                <Play size={20} /> Start debugging
              </Btn>
            </Overlay>
          )}
        </AnimatePresence>
      </Stage>

      {phase === "over" && (
        <div className="mt-8">
          <ResultPanel
            tone="lime"
            title="Performance review"
            subtitle={review.body}
            rows={[
              { label: "Verdict", value: review.title, emphasis: true },
              { label: "Debt removed", value: `${score} points` },
              { label: "Missed clicks", value: misses },
              { label: "Session best", value: best },
              { label: "Bugs still in production", value: "All of them" },
            ]}
            footer={
              <div className="flex flex-wrap gap-3">
                <Btn variant="primary" sound="pop" onClick={start}>
                  <RotateCcw size={18} /> Debug again
                </Btn>
              </div>
            }
          />
        </div>
      )}

      {phase !== "over" && (
        <div className="mt-6">
          <Callout tone="warn" title="Strategy tip">
            It is 45 seconds long. The bugs get quicker and more impatient as the clock runs down.
            The feature request never gets smaller, and neither does the backlog.
          </Callout>
        </div>
      )}
    </ToolShell>
  );
}
