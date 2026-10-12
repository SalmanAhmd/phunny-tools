import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Play, RotateCcw, Square, Timer, TrendingUp, Users } from "lucide-react";
import { ToolShell } from "../../components/ToolShell";
import { Btn } from "../../components/Btn";
import { Callout, ProgressBar, StatPill } from "../../components/bits";
import { ExportButtons, ResultPanel } from "../../components/ResultPanel";
import { TOOL_BY_ID } from "../../lib/registry";
import { useStats } from "../../lib/stats";
import { useUI } from "../../lib/ui";
import { sfx } from "../../lib/sound";
import { clampi, formatDuration } from "../../lib/format";

const tool = TOOL_BY_ID.get("meeting-cost-calculator")!;

/** A standard, deeply optimistic working year. */
const WORK_HOURS_PER_YEAR = 2080;

const OVERRUN_LINES = [
  "This agenda item now costs more than the thing it is about.",
  "The meeting has achieved escape velocity.",
  "Someone just said \"let's take this offline\", for the fourth time.",
  "The coffee budget has been reclassified as capital expenditure.",
];

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

export default function MeetingCostCalculator() {
  const [attendees, setAttendees] = useState(6);
  const [salary, setSalary] = useState(95000);
  const [durationMin, setDurationMin] = useState(30);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [invoice, setInvoice] = useState<{ seconds: number; total: number } | null>(null);
  const tickRef = useRef<number | null>(null);
  const recorded = useRef(false);
  const { recordToolUse } = useStats();
  const { pushToast, fireConfetti } = useUI();

  const hourly = salary / WORK_HOURS_PER_YEAR;
  const perSecond = (attendees * hourly) / 3600;
  const scheduled = durationMin * 60;
  const liveTotal = perSecond * elapsed;
  const overrun = Math.max(0, elapsed - scheduled);

  const stop = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return stop;
  }, [running, stop]);

  useEffect(() => {
    if (running && elapsed > 0 && elapsed % 5 === 0) sfx("tick");
  }, [running, elapsed]);

  const start = () => {
    if (running) return;
    if (!recorded.current) {
      recordToolUse(tool.id);
      recorded.current = true;
    }
    setInvoice(null);
    setRunning(true);
    sfx("pop");
    pushToast({
      title: "Meeting started",
      body: "Money is now leaving the building.",
      tone: "danger",
      icon: "💸",
    });
  };

  const end = () => {
    stop();
    setRunning(false);
    setInvoice({ seconds: elapsed, total: perSecond * elapsed });
    sfx("coin");
    if (elapsed >= 60) fireConfetti();
    pushToast({
      title: "Meeting ended",
      body: "The invoice has been prepared for absolutely nobody.",
      tone: "info",
      icon: "🧾",
    });
  };

  const reset = () => {
    stop();
    setRunning(false);
    setElapsed(0);
    setInvoice(null);
    sfx("pop");
  };

  const invoiceText = (data: { seconds: number; total: number }) =>
    [
      "IMAGINARY INVOICE",
      "=================",
      `Attendees:            ${attendees}`,
      `Average salary:       ${money(salary)}/year`,
      `Blended hourly burn:  ${money(hourly * attendees)}/hour`,
      `Scheduled duration:   ${formatDuration(scheduled)}`,
      `Actual duration:      ${formatDuration(data.seconds)}`,
      `Overrun:              ${formatDuration(Math.max(0, data.seconds - scheduled))}`,
      `Cost per attendee:    ${money(data.total / Math.max(1, attendees))}`,
      "",
      `GRAND TOTAL:          ${money(data.total)}`,
      "",
      "Value produced:       $0.00",
      "",
      "This invoice is fictional. No money changed hands, which is the only",
      "part of this simulation that is ever true.",
    ].join("\n");

  const overrunLine = OVERRUN_LINES[Math.floor(overrun / 15) % OVERRUN_LINES.length];

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> this is a simulation. No real salaries are read, no money
          is spent, and nothing is sent anywhere. The counter simply multiplies the numbers you type
          by the seconds that pass on your own device.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5">
          <div className="card p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="mc-attendees">
                  <Users size={14} className="mr-1 inline" /> Attendees
                </label>
                <input
                  id="mc-attendees"
                  type="number"
                  min={1}
                  max={500}
                  value={attendees}
                  onChange={(e) => setAttendees(clampi(Number(e.target.value) || 0, 1, 500))}
                  className="tool-input"
                />
              </div>
              <div>
                <label className="label" htmlFor="mc-salary">
                  Avg salary (USD/yr)
                </label>
                <input
                  id="mc-salary"
                  type="number"
                  min={0}
                  step={1000}
                  value={salary}
                  onChange={(e) => setSalary(clampi(Number(e.target.value) || 0, 0, 10_000_000))}
                  className="tool-input"
                />
              </div>
              <div>
                <label className="label" htmlFor="mc-duration">
                  <Timer size={14} className="mr-1 inline" /> Duration (min)
                </label>
                <input
                  id="mc-duration"
                  type="number"
                  min={1}
                  max={1440}
                  value={durationMin}
                  onChange={(e) => setDurationMin(clampi(Number(e.target.value) || 0, 1, 1440))}
                  className="tool-input"
                />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border-2 border-ink bg-ink p-6 text-center text-cream dark:border-cream">
              <p className="font-display text-xs uppercase tracking-widest text-zing-lime">
                {running ? "Burning right now" : invoice ? "Final invoice" : "Ready to burn"}
              </p>
              <motion.p
                key={Math.floor(liveTotal * 100)}
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                className="mt-2 font-display text-4xl font-bold tabular-nums sm:text-5xl"
              >
                {money(invoice ? invoice.total : liveTotal)}
              </motion.p>
              <p className="mt-2 text-sm text-cream/70">
                {money(perSecond)} per second · {money(perSecond * 60)} per minute
              </p>
            </div>

            <div className="mt-5">
              <ProgressBar
                percent={scheduled > 0 ? clampi((elapsed / scheduled) * 100, 0, 100) : 0}
                label={`${formatDuration(elapsed)} of a scheduled ${formatDuration(scheduled)}`}
              />
            </div>

            <AnimatePresence>
              {running && overrun > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-center font-display text-sm font-bold text-zing-pink"
                >
                  ⏰ {overrunLine}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-5 flex flex-wrap gap-3">
              <Btn
                variant="primary"
                sound="whoosh"
                size="lg"
                className="bg-gradient-to-r from-zing-lime to-zing-cyan"
                onClick={start}
                disabled={running}
              >
                <Play size={18} /> Start the meeting
              </Btn>
              <Btn variant="danger" sound="thud" size="lg" onClick={end} disabled={!running}>
                <Square size={18} /> End meeting
              </Btn>
              <Btn variant="ghost" sound="pop" onClick={reset}>
                <RotateCcw size={18} /> Reset
              </Btn>
            </div>
          </div>

          <Callout tone="info" title="What actually happens">
            Every second, this page multiplies your pretend salary by your pretend headcount. The
            result is real arithmetic about fictional money, which is the most corporate sentence
            we could write.
          </Callout>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatPill
              label="Attendees"
              value={attendees}
              accent="bg-zing-cyan"
              icon={<Users size={20} />}
            />
            <StatPill
              label="Blended hourly burn"
              value={money(hourly * attendees)}
              accent="bg-zing-lime"
              icon={<TrendingUp size={20} />}
            />
            <StatPill
              label="Elapsed"
              value={formatDuration(elapsed)}
              accent="bg-zing-yellow"
              icon={<Timer size={20} />}
            />
            <StatPill
              label="Overrun"
              value={formatDuration(overrun)}
              accent="bg-zing-pink"
              icon={<Banknote size={20} />}
            />
          </div>

          <div className="card p-5">
            <p className="label">Live breakdown</p>
            <dl className="divide-y-2 divide-ink/10 text-sm dark:divide-cream/10">
              {[
                { label: "Cost per second", value: money(perSecond) },
                { label: "Cost per minute", value: money(perSecond * 60) },
                { label: "Cost so far", value: money(liveTotal) },
                {
                  label: "Cost per attendee",
                  value: money(liveTotal / Math.max(1, attendees)),
                },
                { label: "Decisions reached", value: "0" },
                { label: "Value produced", value: money(0) },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-2 py-2">
                  <dt className="opacity-60">{row.label}</dt>
                  <dd className="font-display font-bold tabular-nums">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {invoice && (
            <ResultPanel
              tone="pink"
              title="Imaginary Meeting Invoice"
              subtitle="Payable never. Chase-up scheduled for a meeting about chase-ups."
              rows={[
                { label: "Attendees", value: attendees },
                { label: "Average salary", value: `${money(salary)}/year` },
                { label: "Blended hourly burn", value: `${money(hourly * attendees)}/hour` },
                { label: "Scheduled duration", value: formatDuration(scheduled) },
                { label: "Actual duration", value: formatDuration(invoice.seconds) },
                { label: "Overrun", value: formatDuration(Math.max(0, invoice.seconds - scheduled)) },
                {
                  label: "Cost per attendee",
                  value: money(invoice.total / Math.max(1, attendees)),
                },
                { label: "Grand total", value: money(invoice.total), emphasis: true },
              ]}
              footer={<ExportButtons text={invoiceText(invoice)} filename="imaginary-meeting-invoice.txt" />}
            />
          )}
        </div>
      </div>
    </ToolShell>
  );
}
