import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
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
import { chance, pick, randInt, uid } from "../lib/random";
import { clampi } from "../lib/format";

const tool = TOOL_BY_ID.get("catch-the-productivity")!;

const GAME_SECONDS = 30;
const CATCH_LINE = 78;
const CATCH_HALF = 11;

interface Falling {
  id: string;
  x: number;
  y: number;
  vy: number;
  emoji: string;
  label: string;
  points: number;
  morphAt: number | null;
  morphed: boolean;
  morphEmoji?: string;
  morphLabel?: string;
  morphPoints?: number;
}

interface ItemKind {
  emoji: string;
  label: string;
  points: number;
}

const PRODUCTIVE: ItemKind[] = [
  { emoji: "✅", label: "Task done", points: 3 },
  { emoji: "📈", label: "Growth", points: 3 },
  { emoji: "📎", label: "Admin", points: 2 },
  { emoji: "📊", label: "Insight", points: 4 },
  { emoji: "🧠", label: "Focus", points: 5 },
];

const DISTRACTIONS: ItemKind[] = [
  { emoji: "☕", label: "Coffee", points: -4 },
  { emoji: "🐸", label: "Meme", points: -5 },
  { emoji: "📅", label: "Meeting", points: -6 },
  { emoji: "📱", label: "Doomscroll", points: -5 },
];

function makeItem(elapsed: number): Falling {
  const morphs = chance(0.45);
  const plainDistraction = !morphs && chance(0.32);
  const base = plainDistraction ? pick(DISTRACTIONS) : pick(PRODUCTIVE);
  const morph = morphs ? pick(DISTRACTIONS) : null;
  return {
    id: uid(),
    x: randInt(8, 92),
    y: -6,
    vy: 26 + Math.random() * 12 + elapsed * 0.5,
    emoji: base.emoji,
    label: base.label,
    points: base.points,
    morphAt: morph ? randInt(28, 68) : null,
    morphed: false,
    morphEmoji: morph?.emoji,
    morphLabel: morph?.label,
    morphPoints: morph?.points,
  };
}

type Phase = "idle" | "playing" | "over";

export default function CatchTheProductivity() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [items, setItems] = useState<Falling[]>([]);
  const [basketX, setBasketX] = useState(50);
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [distracted, setDistracted] = useState(0);
  const [dropped, setDropped] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const itemsRef = useRef<Falling[]>([]);
  const basketXRef = useRef(50);
  const keys = useRef({ left: false, right: false });
  const elapsedRef = useRef(0);
  const milestoneRef = useRef(0);
  itemsRef.current = items;
  const { recordGamePlayed, recordButtonClick, stats } = useStats();
  const { pushToast, fireConfetti } = useUI();

  const elapsed = GAME_SECONDS - timeLeft;
  elapsedRef.current = elapsed;

  // The physics loop: move the basket, spawn items, catch things, regret things.
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = performance.now();
    let spawnAcc = 0;

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
      if (dir !== 0) {
        const next = clampi(basketXRef.current + dir * 62 * dt, 4, 96);
        basketXRef.current = next;
        setBasketX(next);
      }

      spawnAcc += dt;
      const every = Math.max(0.32, 0.8 - elapsedRef.current * 0.012);
      if (spawnAcc >= every) {
        spawnAcc = 0;
        itemsRef.current = [...itemsRef.current, makeItem(elapsedRef.current)];
      }

      let delta = 0;
      let gotGood = 0;
      let gotBad = 0;
      let missed = 0;
      const next: Falling[] = [];
      for (const it of itemsRef.current) {
        const y = it.y + it.vy * dt;
        let morphed = it.morphed;
        let emoji = it.emoji;
        let label = it.label;
        let points = it.points;
        if (it.morphAt !== null && !morphed && y >= it.morphAt) {
          morphed = true;
          emoji = it.morphEmoji ?? emoji;
          label = it.morphLabel ?? label;
          points = it.morphPoints ?? points;
        }
        if (y >= CATCH_LINE && Math.abs(it.x - basketXRef.current) <= CATCH_HALF) {
          delta += points;
          if (points > 0) {
            gotGood += 1;
            sfx("coin");
          } else {
            gotBad += 1;
            sfx("error");
          }
          continue;
        }
        if (y >= 104) {
          if (points > 0) missed += 1;
          continue;
        }
        next.push({ ...it, y, morphed, emoji, label, points });
      }

      itemsRef.current = next;
      setItems(next);
      if (delta !== 0) setScore((s) => Math.max(0, s + delta));
      if (gotGood) setCaught((c) => c + gotGood);
      if (gotBad) setDistracted((d) => d + gotBad);
      if (missed) setDropped((d) => d + missed);
      if (gotGood + gotBad > 0) recordButtonClick(gotGood + gotBad);
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase, recordButtonClick]);

  // Arrow keys, without scrolling the page out from under the player.
  useEffect(() => {
    if (phase !== "playing") return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        keys.current.left = true;
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        keys.current.right = true;
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (score >= milestoneRef.current + 40) {
      milestoneRef.current += 40;
      fireConfetti();
      sfx("success");
      pushToast({
        title: "Genuinely productive",
        body: "HR would like a word about your enthusiasm.",
        tone: "success",
        icon: "🚀",
      });
    }
  }, [score, phase, fireConfetti, pushToast]);

  useEffect(() => {
    if (phase !== "playing" || timeLeft > 0) return;
    keys.current.left = false;
    keys.current.right = false;
    setItems([]);
    itemsRef.current = [];
    setPhase("over");
    sfx("sad");
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== "over") return;
    recordGamePlayed("catch-the-productivity", score);
  }, [phase, score, recordGamePlayed]);

  const start = () => {
    itemsRef.current = [];
    basketXRef.current = 50;
    keys.current.left = false;
    keys.current.right = false;
    milestoneRef.current = 0;
    setItems([]);
    setBasketX(50);
    setScore(0);
    setCaught(0);
    setDistracted(0);
    setDropped(0);
    setTimeLeft(GAME_SECONDS);
    setPhase("playing");
    sfx("pop");
    recordButtonClick();
  };

  const movePointer = (clientX: number, rect: DOMRect) => {
    if (phase !== "playing") return;
    const pct = clampi(((clientX - rect.left) / rect.width) * 100, 4, 96);
    basketXRef.current = pct;
    setBasketX(pct);
  };

  const hold = (side: "left" | "right", value: boolean) => {
    keys.current[side] = value;
  };

  const best = stats.highestScores["catch-the-productivity"] ?? 0;
  const kps = (score / Math.max(1, elapsed)).toFixed(1);

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> nothing is caught, nothing is productivity, and the
          falling icons are browser emoji. This is a 30-second game with no workplace consequences.
        </span>
      }
    >
      <Hud
        items={[
          { label: "Productivity", value: score, accent: "bg-zing-lime" },
          { label: "Time left", value: `${timeLeft}s` },
          { label: "Caught", value: caught },
          { label: "Distracted", value: distracted, accent: "bg-zing-pink text-white" },
        ]}
      />

      <Stage className="h-[26rem] sm:h-[30rem] touch-none">
        <div
          className="absolute inset-0"
          onPointerMove={(e) => movePointer(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerDown={(e) => movePointer(e.clientX, e.currentTarget.getBoundingClientRect())}
        >
          {items.map((it) => (
            <span
              key={it.id}
              className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center ${
                it.points > 0 ? "" : "text-zing-pink"
              }`}
              style={{ left: `${it.x}%`, top: `${it.y}%` }}
            >
              <span className="text-3xl leading-none" aria-hidden>
                {it.emoji}
              </span>
              <span
                className={`mt-0.5 max-w-[6rem] truncate rounded-full border border-ink px-1.5 py-0.5 font-display text-[8px] font-bold ${
                  it.points > 0 ? "bg-zing-lime text-ink" : "bg-zing-pink text-white"
                }`}
              >
                {it.label}
              </span>
            </span>
          ))}
        </div>

        {/* the catcher */}
        <div
          className="absolute bottom-2 z-20 -translate-x-1/2"
          style={{ left: `${basketX}%` }}
          aria-hidden
        >
          <div className="flex flex-col items-center">
            <span className="text-4xl leading-none">🧺</span>
            <span className="h-1.5 w-24 rounded-full border-2 border-ink bg-zing-yellow dark:border-cream" />
          </div>
        </div>

        <AnimatePresence>
          {phase === "idle" && (
            <Overlay>
              <p className="text-5xl" aria-hidden>
                🧺
              </p>
              <h2 className="font-display text-2xl font-bold">Catch the Productivity</h2>
              <p className="max-w-md text-sm opacity-80">
                Move the basket with ← → (or drag your pointer). Catch the wholesome icons. Fair
                warning: about half of them betray you mid-air and become coffee, memes or meetings.
              </p>
              <Btn variant="primary" sound="pop" size="lg" onClick={start}>
                <Play size={20} /> Start the shift
              </Btn>
            </Overlay>
          )}
        </AnimatePresence>
      </Stage>

      {phase === "playing" && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Move basket left"
            onPointerDown={() => hold("left", true)}
            onPointerUp={() => hold("left", false)}
            onPointerLeave={() => hold("left", false)}
            className="rounded-2xl border-2 border-ink bg-white px-6 py-3 font-display text-xl font-bold text-ink shadow-pop-sm active:scale-95 dark:border-cream dark:bg-ink-soft dark:text-cream"
          >
            ◀
          </button>
          <span className="font-mono text-xs opacity-60">{kps} pts/sec</span>
          <button
            type="button"
            aria-label="Move basket right"
            onPointerDown={() => hold("right", true)}
            onPointerUp={() => hold("right", false)}
            onPointerLeave={() => hold("right", false)}
            className="rounded-2xl border-2 border-ink bg-white px-6 py-3 font-display text-xl font-bold text-ink shadow-pop-sm active:scale-95 dark:border-cream dark:bg-ink-soft dark:text-cream"
          >
            ▶
          </button>
        </div>
      )}

      {phase === "over" && (
        <div className="mt-8">
          <ResultPanel
            tone="lime"
            title="End of shift report"
            subtitle="A performance summary nobody requested and nobody will read."
            rows={[
              { label: "Net productivity", value: `${score} points`, emphasis: true },
              { label: "Things caught", value: caught },
              { label: "Distractions absorbed", value: distracted },
              { label: "Dropped on the floor", value: dropped },
              { label: "Session best", value: best },
              { label: "Actual work completed", value: "None. None at all." },
            ]}
            footer={
              <div className="flex flex-wrap gap-3">
                <Btn variant="primary" sound="pop" onClick={start}>
                  <RotateCcw size={18} /> Clock in again
                </Btn>
              </div>
            }
          />
        </div>
      )}

      {phase !== "over" && (
        <div className="mt-6">
          <Callout tone="info" title="Basket management">
            The basket is forgiving but not patient. Anything that turns pink as it falls is a
            distraction; let those hit the floor and keep your score intact.
          </Callout>
        </div>
      )}
    </ToolShell>
  );
}
