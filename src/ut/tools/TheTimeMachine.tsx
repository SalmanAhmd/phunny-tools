import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Gauge, RotateCcw } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { Callout, StatPill } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { formatDuration } from "../lib/format";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { pick, randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("the-time-machine")!;

const MEDALS = [
  { seconds: 0, title: "Time Curious", note: "You have arrived. Time has noticed." },
  { seconds: 60, title: "Junior Chrononaut", note: "One minute lost to the void. Recoverable: no." },
  { seconds: 180, title: "Certified Time Fritterer", note: "Three minutes. A personal best in a bad way." },
  { seconds: 600, title: "Senior Temporal Loiterer", note: "Ten minutes. You could have boiled an egg." },
  { seconds: 1800, title: "Grandmaster of the Long Way Round", note: "Thirty minutes. Genuinely impressive." },
  { seconds: 3600, title: "Keeper of the Lost Hour", note: "A full hour. Please hydrate." },
];

const COUNTDOWN_LINES = [
  "Spooling up the temporal coil…",
  "Reversing causality (approximately)…",
  "Un-asking the question you just asked…",
  "Un-sending the email you did not send…",
  "Reclaiming the seconds… metaphorically…",
  "Rewinding… rewinding… rewinding…",
];

const RESULTS = [
  "Time successfully reversed by 0 seconds. You're welcome.",
  "We have returned you to exactly where you were, but older.",
  "The past has been located. It has declined your request.",
  "Time is a flat circle, and we have drawn on it with a permanent marker.",
  "Nothing was reversed. Something was added: 12 seconds of confusion.",
];

export default function TheTimeMachine() {
  const [reversing, setReversing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [line, setLine] = useState(COUNTDOWN_LINES[0]);
  const [result, setResult] = useState<string | null>(null);
  const [trips, setTrips] = useState(0);
  const { stats, recordToolUse } = useStats();
  const { pushToast, fireConfetti } = useUI();

  useEffect(() => {
    if (!reversing) return;
    if (countdown <= 0) {
      setReversing(false);
      setResult(pick(RESULTS));
      sfx("sad");
      pushToast({
        title: "Temporal operation complete",
        body: "0 seconds recovered. Physics: undefeated.",
        tone: "chaos",
        icon: "⏳",
      });
      return;
    }
    const t = window.setTimeout(() => {
      setCountdown((c) => c - 1);
      sfx("tick");
    }, 320);
    return () => window.clearTimeout(t);
  }, [reversing, countdown, pushToast]);

  const startTrip = () => {
    if (reversing) return;
    setReversing(true);
    setResult(null);
    setCountdown(randInt(7, 12));
    setTrips((t) => t + 1);
    setLine(pick(COUNTDOWN_LINES));
    recordToolUse(tool.id);
    sfx("whoosh");
    if (trips >= 2) fireConfetti();
  };

  const medal = [...MEDALS].reverse().find((m) => stats.secondsWasted >= m.seconds) ?? MEDALS[0];

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> time is not reversed. Nothing is refunded. The "seconds
          wasted" counter is a local tally of how long this tab has been open, which only makes the
          joke sadder and more accurate.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5">
          <div className="card relative overflow-hidden p-6 text-center">
            <motion.div
              animate={reversing ? { rotate: -360 } : { rotate: 0 }}
              transition={
                reversing
                  ? { repeat: Infinity, duration: 1.4, ease: "linear" }
                  : { type: "spring", stiffness: 120, damping: 20 }
              }
              className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-4 border-ink bg-zing-yellow dark:border-cream"
            >
              <Clock size={80} className="text-ink" strokeWidth={1.8} />
            </motion.div>

            <p className="mt-5 font-display text-6xl font-bold tabular-nums">
              {reversing ? countdown : "0"}
            </p>
            <p className="mt-1 text-sm opacity-70">{reversing ? line : "seconds available for reversal"}</p>

            <Btn
              variant="primary"
              sound="thud"
              size="lg"
              className="mt-6 w-full bg-gradient-to-r from-zing-purple to-zing-orange"
              onClick={startTrip}
              disabled={reversing}
            >
              <RotateCcw size={20} /> {reversing ? "REVERSING TIME…" : "REVERSE TIME"}
            </Btn>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border-2 border-ink bg-zing-lime p-5 text-ink dark:border-cream"
              >
                <p className="font-display text-lg font-bold">Temporal report</p>
                <p className="mt-1">{result}</p>
                <p className="mt-3 font-mono text-xs">
                  Seconds recovered: 0 · Seconds actually elapsed: {Math.round(countdown * 0.32 * 10) / 10} ·
                  Net outcome: negative
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatPill label="Time on site" value={formatDuration(stats.secondsWasted)} accent="bg-zing-orange" icon={<Gauge size={20} />} />
            <StatPill label="Time recovered" value="0s" accent="bg-zing-yellow" />
            <StatPill label="Trips attempted" value={trips} accent="bg-zing-purple" />
            <StatPill label="Medals earned" value={MEDALS.filter((m) => stats.secondsWasted >= m.seconds).length} accent="bg-zing-lime" />
          </div>

          <div className="card p-5">
            <p className="label">Imaginary time-travel medals</p>
            <ul className="space-y-2">
              {MEDALS.map((m) => {
                const earned = stats.secondsWasted >= m.seconds;
                return (
                  <li
                    key={m.title}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-3 text-sm ${
                      earned
                        ? "border-ink bg-zing-yellow text-ink dark:border-cream"
                        : "border-ink/15 opacity-50 dark:border-cream/15"
                    }`}
                  >
                    <span className="text-xl" aria-hidden>
                      {earned ? "🏅" : "🔒"}
                    </span>
                    <span>
                      <span className="block font-display font-bold">{m.title}</span>
                      <span className="block text-xs opacity-75">
                        {m.seconds === 0 ? "Available immediately" : `Requires ${formatDuration(m.seconds)} of doing nothing`} — {m.note}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <Callout tone="info" title={`Current standing: ${medal.title}`}>
            {medal.note} Your total unrecoverable time is {formatDuration(stats.secondsWasted)}. We have
            framed it as an achievement. That is the service we provide.
          </Callout>
        </div>
      </div>
    </ToolShell>
  );
}
