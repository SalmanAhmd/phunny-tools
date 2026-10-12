import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Play, RotateCcw, X } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { ProgressBar, Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("loading-bar-simulator")!;

interface Stage {
  at: number;
  label: string;
  quip: string;
}

const STAGES: Stage[] = [
  { at: 1, label: "Thinking about starting.", quip: "A bold opening." },
  { at: 12, label: "Warming up the CPU emotionally.", quip: "It has feelings about this." },
  { at: 37, label: "A minor inconvenience has occurred.", quip: "Nobody will explain what." },
  { at: 52, label: "Re-downloading the download that downloaded the download.", quip: "Recursive. Pointless. Ours." },
  { at: 68, label: "Almost ready to begin.", quip: "Almost. Almost. Almost." },
  { at: 89, label: "Reconsidering life choices.", quip: "Whose? Unclear." },
  { at: 99, label: "Waiting for approval from management.", quip: "They are in a meeting about approvals." },
  { at: 100, label: "Congratulations. Nothing happened.", quip: "Exactly as designed." },
];

const FAKE_ERRORS = [
  "Error 000: Something occurred. We have chosen not to elaborate.",
  "Error B12: Your patience level is not supported by this browser.",
  "Error 404: The thing we were doing was not found. Was never found.",
  "Error 808: Please hold. Please continue holding. Hold indefinitely.",
];

export default function LoadingBarSimulator() {
  const [percent, setPercent] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState<Stage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const speedRef = useRef(1);
  const stalledRef = useRef(false);
  const errorShownRef = useRef(false);
  const loggedRef = useRef<Set<number>>(new Set());
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const loop = useCallback(
    (time: number) => {
      if (!lastRef.current) lastRef.current = time;
      const dt = (time - lastRef.current) / 1000;
      lastRef.current = time;

      setElapsed((e) => e + dt);

      if (!stalledRef.current) {
        setPercent((p) => {
          // Deliberately uneven. Fast, then hesitant, then oddly slow near the end.
          const base = p < 40 ? 26 : p < 85 ? 12 : 4.5;
          const next = Math.min(100, p + base * dt * speedRef.current * (0.6 + Math.random() * 0.9));
          return next;
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [],
  );

  // React to progress crossings.
  useEffect(() => {
    if (!running) return;
    const stage = [...STAGES].reverse().find((s) => percent >= s.at);
    if (stage && !loggedRef.current.has(stage.at)) {
      loggedRef.current.add(stage.at);
      setLog((l) => [...l, stage]);
      sfx("tick");
      if (stage.at === 68) speedRef.current = 0.35;
      if (stage.at === 89) speedRef.current = 0.28;
    }

    // The management-approval stall at 99%.
    if (percent >= 99 && !stalledRef.current && !errorShownRef.current) {
      errorShownRef.current = true;
      stalledRef.current = true;
      sfx("error");
      setError(FAKE_ERRORS[randInt(0, FAKE_ERRORS.length - 1)]);
    }

    if (percent >= 100 && !done) {
      stop();
      setRunning(false);
      setDone(true);
      sfx("sad");
      pushToast({
        title: "Process complete",
        body: "Nothing happened. Statistically, that was inevitable.",
        tone: "chaos",
        icon: "🫥",
      });
    }
  }, [percent, running, done, stop, pushToast]);

  const start = () => {
    stop();
    loggedRef.current = new Set();
    lastRef.current = 0;
    speedRef.current = 1;
    stalledRef.current = false;
    errorShownRef.current = false;
    setPercent(0);
    setLog([]);
    setError(null);
    setDone(false);
    setElapsed(0);
    setRunning(true);
    recordToolUse(tool.id);
    sfx("pop");
    rafRef.current = requestAnimationFrame(loop);
  };

  const dismissError = () => {
    setError(null);
    stalledRef.current = false;
    lastRef.current = 0;
    sfx("ding");
    if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
  };

  const currentStage = [...STAGES].reverse().find((s) => percent >= s.at) ?? STAGES[0];

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> there is no process. There is no download. There is no
          server. This is a progress bar with nothing behind it, which makes it more honest than
          most progress bars you have met.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <ProgressBar percent={percent} />
            <p className="mt-4 text-center font-display text-lg font-bold">{currentStage.label}</p>
            <p className="mt-1 text-center text-sm opacity-70">{currentStage.quip}</p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border-2 border-ink/20 p-3 dark:border-cream/20">
                <p className="font-display text-2xl font-bold tabular-nums">{percent.toFixed(1)}%</p>
                <p className="text-xs uppercase tracking-wide opacity-60">Progress</p>
              </div>
              <div className="rounded-2xl border-2 border-ink/20 p-3 dark:border-cream/20">
                <p className="font-display text-2xl font-bold tabular-nums">{elapsed.toFixed(1)}s</p>
                <p className="text-xs uppercase tracking-wide opacity-60">Time invested</p>
              </div>
              <div className="rounded-2xl border-2 border-ink/20 p-3 dark:border-cream/20">
                <p className="font-display text-2xl font-bold tabular-nums">
                  {(elapsed * 0).toFixed(0)}
                </p>
                <p className="text-xs uppercase tracking-wide opacity-60">Value produced</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Btn variant="primary" sound="whoosh" size="lg" onClick={start}>
                <Play size={18} /> {done ? "Run it again for no reason" : "Start loading nothing"}
              </Btn>
              <Btn
                variant="ghost"
                sound="pop"
                onClick={() => {
                  stop();
                  setRunning(false);
                  setPercent(0);
                  setLog([]);
                  setDone(false);
                  setError(null);
                  setElapsed(0);
                }}
              >
                <RotateCcw size={18} /> Reset
              </Btn>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-start gap-3 rounded-2xl border-2 border-ink bg-zing-pink p-4 text-white dark:border-cream"
              role="alertdialog"
              aria-live="assertive"
            >
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-display font-bold">A totally preventable error</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
              <button
                onClick={dismissError}
                className="rounded-lg border-2 border-white/60 p-1 hover:bg-white/20"
                aria-label="Dismiss the error and continue pretending"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}

          {done && (
            <Callout tone="success" title="Final report">
              You waited {elapsed.toFixed(1)} seconds. In that time, you could have loaded
              absolutely anything else. We are genuinely proud of you.
            </Callout>
          )}
        </div>

        <div className="card p-5">
          <p className="label">System log (decorative)</p>
          <ul className="space-y-2 font-mono text-xs">
            {log.length === 0 && <li className="opacity-50">Awaiting your optimism…</li>}
            {log.map((stage) => (
              <motion.li
                key={stage.at}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2"
              >
                <span className="text-zing-orange">[{String(stage.at).padStart(3, "0")}%]</span>
                <span className="opacity-80">{stage.label}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </ToolShell>
  );
}
