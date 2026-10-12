import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { BatteryLow, Brain, CalendarX, Coffee, Moon, Smartphone } from "lucide-react";
import { ToolShell } from "../../components/ToolShell";
import { Btn } from "../../components/Btn";
import { Callout, ProgressBar, StatPill } from "../../components/bits";
import { TOOL_BY_ID } from "../../lib/registry";
import { useStats } from "../../lib/stats";
import { sfx } from "../../lib/sound";
import { clampi, formatDuration } from "../../lib/format";

const tool = TOOL_BY_ID.get("motivation-calculator")!;

interface Breakdown {
  label: string;
  value: string;
}

interface Calculation {
  minutes: number;
  motivation: number;
  fun: number;
  breakdown: Breakdown[];
  verdict: { title: string; note: string };
}

function verdictFor(minutes: number): { title: string; note: string } {
  if (minutes < 10) {
    return { title: "Your phone is already in your hand.", note: "It was there before you opened this calculator." };
  }
  if (minutes < 45) {
    return { title: "A brief, fragile window of focus.", note: "Use it wisely, or don't. Statistically, don't." };
  }
  if (minutes < 120) {
    return { title: "Genuinely employable, for now.", note: "Screenshot this before it changes." };
  }
  if (minutes < 300) {
    return { title: "Impressive. Suspicious, even.", note: "Are you sure you slept? Be honest." };
  }
  return { title: "Wait — you might actually do the work.", note: "Statistically unlikely. We are rooting for you." };
}

function compute(sleep: number, coffees: number, meetings: number, dread: number): Calculation {
  const morning = sleep * 13;
  const caffeine = coffees <= 2 ? coffees * 9 : 18 - (coffees - 2) * 8;
  const meetingTax = meetings * 15;
  const dreadTax = dread * 14;
  const minutes = clampi(Math.round(20 + morning + caffeine - meetingTax - dreadTax), 1, 720);
  const motivation = clampi(Math.round((minutes / 720) * 100), 0, 100);
  const fun = clampi(
    Math.round(72 - dread * 6 - meetings * 5 + coffees * 3 - (sleep < 5 ? 20 : 0)),
    0,
    100,
  );
  return {
    minutes,
    motivation,
    fun,
    breakdown: [
      { label: "Baseline human hope", value: "+20" },
      { label: `Sleep hours × 13 (morning optimism)`, value: `+${morning}` },
      { label: `Coffee curve (${coffees} cup${coffees === 1 ? "" : "s"})`, value: `${caffeine >= 0 ? "+" : "−"}${Math.abs(caffeine)}` },
      { label: "Meeting tax (each one costs 15)", value: `−${meetingTax}` },
      { label: "Existential dread levy", value: `−${dreadTax}` },
    ],
    verdict: verdictFor(minutes),
  };
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  icon,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  icon: ReactNode;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between font-display text-sm font-bold">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="tabular-nums">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        aria-label={label}
      />
    </label>
  );
}

export default function MotivationCalculator() {
  const [sleep, setSleep] = useState(6);
  const [coffees, setCoffees] = useState(2);
  const [meetings, setMeetings] = useState(3);
  const [dread, setDread] = useState(5);
  const [used, setUsed] = useState(false);
  const { recordToolUse } = useStats();

  const result = compute(sleep, coffees, meetings, dread);

  const touch = () => {
    if (!used) {
      recordToolUse(tool.id);
      setUsed(true);
    }
    sfx("tick");
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> the maths below is decorative. No calculation can predict
          when you will check your phone, and this one does not try especially hard. Everything is
          computed locally from four sliders and does not leave your device.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <div className="card-pop space-y-5 p-6">
            <Slider
              label="Hours of sleep"
              value={sleep}
              min={0}
              max={12}
              suffix="h"
              icon={<Moon size={18} />}
              onChange={(v) => {
                setSleep(v);
                touch();
              }}
            />
            <Slider
              label="Coffees consumed"
              value={coffees}
              min={0}
              max={10}
              icon={<Coffee size={18} />}
              onChange={(v) => {
                setCoffees(v);
                touch();
              }}
            />
            <Slider
              label="Meetings today"
              value={meetings}
              min={0}
              max={8}
              icon={<CalendarX size={18} />}
              onChange={(v) => {
                setMeetings(v);
                touch();
              }}
            />
            <Slider
              label="Existential dread"
              value={dread}
              min={0}
              max={10}
              suffix="/10"
              icon={<Brain size={18} />}
              onChange={(v) => {
                setDread(v);
                touch();
              }}
            />
          </div>

          <Callout tone="info" title="How the formula works">
            It adds optimism, subtracts meetings and multiplies everything by vibes. The
            coefficients were chosen by someone who has not slept. Treat every number as honest
            nonsense.
          </Callout>
        </div>

        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border-2 border-ink bg-gradient-to-b from-white to-cream-deep p-6 dark:border-cream dark:from-ink-soft dark:to-ink-night">
            <div className="flex items-center justify-between">
              <p className="font-display text-xs uppercase tracking-widest opacity-60">
                Minutes until you check your phone
              </p>
              <motion.span
                animate={
                  result.minutes < 45
                    ? { rotate: [0, -12, 12, -8, 0], scale: [1, 1.08, 1] }
                    : { rotate: 0, scale: 1 }
                }
                transition={{ repeat: Infinity, duration: 1.6 }}
                className="text-3xl"
                aria-hidden
              >
                <Smartphone size={30} />
              </motion.span>
            </div>
            <p className="mt-2 font-display text-6xl font-bold tabular-nums">
              {result.minutes}
            </p>
            <p className="text-sm opacity-70">
              minutes — roughly {formatDuration(result.minutes * 60)} of theoretical focus
            </p>

            <div className="mt-6 space-y-4">
              <ProgressBar percent={result.motivation} label="Motivation remaining" />
              <ProgressBar percent={result.fun} label="Fun meter (independent of reality)" />
            </div>
          </div>

          <motion.div
            key={result.verdict.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="rounded-3xl border-2 border-ink bg-zing-purple p-5 text-white dark:border-cream"
          >
            <p className="font-display text-xl font-bold">{result.verdict.title}</p>
            <p className="mt-1 text-sm opacity-85">{result.verdict.note}</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill label="Sleep" value={`${sleep}h`} accent="bg-zing-purple" icon={<Moon size={18} />} />
            <StatPill label="Coffees" value={coffees} accent="bg-zing-yellow" icon={<Coffee size={18} />} />
            <StatPill label="Meetings" value={meetings} accent="bg-zing-pink" icon={<CalendarX size={18} />} />
            <StatPill label="Dread" value={`${dread}/10`} accent="bg-zing-lime" icon={<Brain size={18} />} />
          </div>

          <div className="card-pop p-5">
            <p className="mb-3 flex items-center gap-2 font-display font-bold">
              <BatteryLow size={18} /> The formula, in full
            </p>
            <ul className="divide-y-2 divide-ink/10 text-sm dark:divide-cream/10">
              {result.breakdown.map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-3 py-2">
                  <span className="opacity-75">{row.label}</span>
                  <span className="font-display font-bold tabular-nums">{row.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-xl border-2 border-ink/15 p-3 font-mono text-xs opacity-80 dark:border-cream/15">
              minutes = clamp(20 + sleep×13 + coffeeCurve − meetings×15 − dread×14, 1, 720)
            </p>
          </div>

          <Btn
            variant="ghost"
            sound="pop"
            className="w-full"
            onClick={() => {
              setSleep(6);
              setCoffees(2);
              setMeetings(3);
              setDread(5);
              sfx("boing");
            }}
          >
            Restore an average, unremarkable Tuesday
          </Btn>
        </div>
      </div>
    </ToolShell>
  );
}
