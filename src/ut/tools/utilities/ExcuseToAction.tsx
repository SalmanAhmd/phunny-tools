import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Ban, CalendarPlus, ListChecks, RefreshCw, Users } from "lucide-react";
import { ToolShell } from "../../components/ToolShell";
import { Btn } from "../../components/Btn";
import { Callout, ProgressBar, StatPill } from "../../components/bits";
import { ExportButtons } from "../../components/ResultPanel";
import { TOOL_BY_ID } from "../../lib/registry";
import { useStats } from "../../lib/stats";
import { useUI } from "../../lib/ui";
import { sfx } from "../../lib/sound";
import { pick, pickMany, randInt } from "../../lib/random";
import { slugTitle } from "../../lib/format";

const tool = TOOL_BY_ID.get("excuse-to-action")!;

const PHASES = [
  "Parsing the excuse…",
  "Locating accountability…",
  "Scheduling a pre-meeting about the meeting…",
  "Assigning dependent tasks…",
  "Seeding blockers…",
  "Notifying stakeholders…",
  "Deferring to next quarter…",
];

const EXAMPLES = [
  "I'll do it tomorrow",
  "I'll start on Monday",
  "I'll circle back on this",
  "Let's take it offline",
  "I'll look into it",
];

const TASK_POOL = [
  "Draft a one-pager about the two-pager that explains the deck",
  "Set up a recurring sync to discuss whether the sync is needed",
  "Create a tracking spreadsheet for the tracking spreadsheet",
  "Rename the document 'FINAL_final_v3_USE-THIS-ONE'",
  "Book a room, move the room, cancel the room",
  "File a ticket in the system nobody has access to",
  "Add a comment that could have been a decision",
  "Convert the decision into a discussion point",
];

const BLOCKER_POOL = [
  "Waiting on a reply from a colleague who is on annual leave",
  "Pending legal review of a word choice",
  "The shared drive is having an emotional moment",
  "Budget approval required from a committee that has not met since 2019",
  "Blocked by an unresolved thread with 47 replies",
  "Dependency not scheduled until after the dependency it depends on",
];

const STAKEHOLDER_POOL = [
  "a product owner with strong feelings",
  "a finance partner who needs to 'understand the ROI'",
  "the design team, who would like more whitespace",
  "an engineer who will ask what the actual requirement is",
  "a director whose calendar is mostly meetings about calendars",
  "a legal advisor summoned by a single adjective",
  "the person who owns the process nobody documented",
];

const RISK_LINES = [
  "The plan is sound, assuming nothing happens and nobody speaks.",
  "High risk of progress. Mitigation: schedule a meeting.",
  "This may accidentally resolve itself, which would be off-process.",
  "Timeline is aspirational, the kind of aspirational that needs a plan.",
];

interface Plan {
  promise: string;
  title: string;
  when: Date;
  review: Date;
  tasks: string[];
  blockers: string[];
  stakeholders: string[];
  risk: string;
}

function buildPlan(promise: string): Plan {
  const when = new Date(Date.now() + randInt(3, 21) * 86_400_000);
  const review = new Date(when.getTime() + randInt(21, 120) * 86_400_000);
  return {
    promise,
    title: `Action Item: "${promise}"`,
    when,
    review,
    tasks: pickMany(TASK_POOL, randInt(3, 4)),
    blockers: pickMany(BLOCKER_POOL, randInt(2, 3)),
    stakeholders: pickMany(STAKEHOLDER_POOL, randInt(3, 5)),
    risk: pick(RISK_LINES),
  };
}

const niceDate = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function planToText(plan: Plan): string {
  const done = (items: string[]) => items.map((t) => `  [ ] ${t}`).join("\n");
  return [
    plan.title,
    "=".repeat(plan.title.length),
    "",
    `Original promise: "${plan.promise}"`,
    `Scheduled for:    ${niceDate(plan.when)}`,
    `Review date:      ${niceDate(plan.review)} (at this meeting we will book another)`,
    "",
    "DEPENDENT TASKS",
    done(plan.tasks),
    "",
    "BLOCKERS",
    done(plan.blockers),
    "",
    "STAKEHOLDERS WHO MUST BE CONSULTED",
    plan.stakeholders.map((s) => `  - ${s}`).join("\n"),
    "",
    `RISK ASSESSMENT`,
    `  ${plan.risk}`,
    "",
    "Conclusion: the promise has been converted into a process. The",
    "process is now the deliverable. Nothing will be actioned, ever.",
    "",
    "Generated locally. No data left your browser.",
  ].join("\n");
}

export default function ExcuseToAction() {
  const [promise, setPromise] = useState("");
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(-1);
  const [plan, setPlan] = useState<Plan | null>(null);
  const timerRef = useRef<number | null>(null);
  const recorded = useRef(false);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const convert = useCallback(() => {
    const input = promise.trim();
    if (!input || running) return;
    if (!recorded.current) {
      recordToolUse(tool.id);
      recorded.current = true;
    }
    setRunning(true);
    setPlan(null);
    setPhase(0);
    sfx("whoosh");

    let step = 0;
    timerRef.current = window.setInterval(() => {
      step += 1;
      if (step < PHASES.length) {
        setPhase(step);
        sfx("tick");
        return;
      }
      clearTimer();
      const result = buildPlan(input);
      setPlan(result);
      setPhase(PHASES.length);
      setRunning(false);
      sfx("success");
      pushToast({
        title: "Promise converted",
        body: `Rescheduled to ${result.when.toLocaleDateString()}. It will not happen.`,
        tone: "success",
        icon: "📅",
      });
    }, 460);
  }, [promise, running, recordToolUse, clearTimer, pushToast]);

  const percent =
    phase < 0 ? 0 : running ? ((phase + 1) / PHASES.length) * 100 : 100;

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> this tool does not schedule anything, invite anyone or
          contact a single calendar. It builds a fictional plan in your browser from fixed text
          pools and a random number generator.
        </span>
      }
    >
      <div className="card p-6">
        <label className="label" htmlFor="eta-promise">
          Enter a vague promise
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="eta-promise"
            value={promise}
            onChange={(e) => setPromise(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && convert()}
            placeholder="e.g. I'll do it tomorrow"
            className="tool-input"
          />
          <Btn
            variant="primary"
            sound="whoosh"
            onClick={convert}
            disabled={running || !promise.trim()}
            className="shrink-0"
          >
            {running ? (
              <>
                <RefreshCw size={18} className="animate-spin" /> Processing…
              </>
            ) : (
              <>
                <CalendarPlus size={18} /> Convert to action
              </>
            )}
          </Btn>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip hover:bg-zing-yellow" onClick={() => setPromise(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </div>

      {phase >= 0 && (
        <div className="mt-6">
          <ProgressBar percent={percent} label={running ? PHASES[Math.min(phase, PHASES.length - 1)] : "Process complete"} />
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {PHASES.map((step, i) => {
              const done = i < phase || (!running && plan !== null);
              const active = i === phase && running;
              return (
                <li
                  key={step}
                  className={`flex items-center gap-2 rounded-xl border-2 p-2 text-sm ${
                    done
                      ? "border-ink bg-zing-lime text-ink dark:border-cream"
                      : active
                        ? "border-ink bg-zing-yellow text-ink dark:border-cream"
                        : "border-ink/15 opacity-50 dark:border-cream/15"
                  }`}
                >
                  <span aria-hidden>{done ? "✅" : active ? "⏳" : "•"}</span>
                  <span className="flex-1">{step}</span>
                  {i < PHASES.length - 1 && <ArrowRight size={14} className="opacity-40" />}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {!plan && !running && (
        <div className="mt-8">
          <Callout tone="warn" title="A promise is just a task that has not been calendared yet">
            Type something above and we will bury it beneath tasks, blockers, stakeholders and a
            review date far enough away to feel like progress.
          </Callout>
        </div>
      )}

      <AnimatePresence>
        {plan && !running && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-5"
          >
            <div className="rounded-3xl border-2 border-ink bg-ink p-6 text-cream shadow-pop-lg dark:border-cream">
              <p className="font-display text-xs uppercase tracking-widest text-zing-lime">
                Converted action item
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">{plan.title}</h2>
              <p className="mt-2 text-sm text-cream/70">
                Scheduled for {niceDate(plan.when)} · Review {niceDate(plan.review)}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatPill label="Dependent tasks" value={plan.tasks.length} accent="bg-zing-yellow" />
              <StatPill label="Blockers" value={plan.blockers.length} accent="bg-zing-pink" />
              <StatPill label="Stakeholders" value={plan.stakeholders.length} accent="bg-zing-purple" />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="card p-5">
                <p className="label flex items-center gap-2">
                  <ListChecks size={16} /> Dependent tasks
                </p>
                <ul className="space-y-2 text-sm">
                  {plan.tasks.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-xl border-2 border-ink/15 p-2 dark:border-cream/15">
                      <span className="font-bold text-zing-orange">[ ]</span>
                      <span className="opacity-85">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-5">
                <p className="label flex items-center gap-2">
                  <Ban size={16} /> Blockers
                </p>
                <ul className="space-y-2 text-sm">
                  {plan.blockers.map((b, i) => (
                    <li key={i} className="rounded-xl border-2 border-ink/15 p-2 opacity-85 dark:border-cream/15">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card p-5">
              <p className="label flex items-center gap-2">
                <Users size={16} /> Stakeholders who must be consulted
              </p>
              <div className="flex flex-wrap gap-2">
                {plan.stakeholders.map((s, i) => (
                  <span key={i} className="chip bg-zing-cyan text-ink">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <Callout tone="danger" title="Risk assessment">
              {plan.risk}
            </Callout>

            <ExportButtons
              text={planToText(plan)}
              filename={`${slugTitle(plan.promise) || "PROMISE"}_plan.txt`}
              label="Download the plan"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolShell>
  );
}
