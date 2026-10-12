import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, RefreshCw } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { ExportButtons } from "../components/ResultPanel";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { generateMeetingReport, meetingToText, type MeetingReport } from "../lib/meeting";
import { slugTitle } from "../lib/format";
import { randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("unnecessary-meeting")!;

const EXAMPLES = [
  "Which pizza should we order?",
  "Should we rename the Slack channel?",
  "What time should the stand-up be?",
  "Do we need a logo for the off-site?",
  "Can we just use the existing template?",
];

function Section({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-5"
    >
      <h3 className="mb-3 flex items-center gap-3 font-display text-lg font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-ink bg-zing-yellow text-sm dark:border-cream">
          {index}
        </span>
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

export default function UnnecessaryMeeting() {
  const [topic, setTopic] = useState("");
  const [report, setReport] = useState<MeetingReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { recordToolUse } = useStats();

  const generate = () => {
    setLoading(true);
    recordToolUse(tool.id);
    const delay = randInt(700, 1600);
    window.setTimeout(() => {
      setReport(generateMeetingReport(topic));
      setLoading(false);
    }, delay);
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> these meetings, stakeholders and costs are entirely
          fictional. No calendar invites will be sent. We cannot prevent your real colleagues from
          scheduling the real thing, however hard we try.
        </span>
      }
    >
      <div className="card p-6">
        <label className="label" htmlFor="meeting-topic">
          What simple decision are we escalating today?
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="meeting-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="e.g. Which pizza should we order?"
            className="tool-input"
          />
          <Btn variant="primary" sound="whoosh" onClick={generate} disabled={loading} className="shrink-0">
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" /> Convening…
              </>
            ) : (
              <>
                <CalendarClock size={18} /> Escalate it
              </>
            )}
          </Btn>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setTopic(ex)}
              className="chip hover:bg-zing-yellow"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {!report && !loading && (
        <div className="mt-8">
          <Callout tone="warn" title="A note on scope" icon={<CalendarClock size={18} />}>
            Every simple question deserves at least five stakeholders, twelve framework steps and
            three follow-ups. Type something above and we will do our worst.
          </Callout>
        </div>
      )}

      {loading && (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-3xl border-2 border-ink/30 bg-white/60 dark:border-cream/30 dark:bg-ink-soft/60"
            />
          ))}
        </div>
      )}

      {report && !loading && (
        <div className="mt-8 space-y-5">
          <div className="rounded-3xl border-2 border-ink bg-ink p-6 text-cream shadow-pop-lg dark:border-cream">
            <p className="font-display text-xs uppercase tracking-widest text-zing-lime">
              Meeting record · {report.generatedAt.toLocaleString()}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">{report.topic}</h2>
            <p className="mt-2 text-sm text-cream/70">Estimated cost: {report.estimatedCost}</p>
          </div>

          <Section index={1} title="Executive summary">
            <p className="text-sm leading-relaxed opacity-85">{report.executiveSummary}</p>
          </Section>

          <Section index={2} title="Twelve-step decision framework">
            <ol className="grid gap-2 text-sm sm:grid-cols-2">
              {report.framework.map((step, i) => (
                <li key={i} className="flex gap-2 rounded-xl border-2 border-ink/15 p-2 dark:border-cream/15">
                  <span className="font-display font-bold text-zing-orange">{i + 1}</span>
                  <span className="opacity-85">{step}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Section index={3} title="Agenda (unnecessarily detailed)">
            <ul className="divide-y-2 divide-ink/10 text-sm dark:divide-cream/10">
              {report.agenda.map((item, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-2 py-2">
                  <span className="font-mono text-xs text-zing-purple">{item.time}</span>
                  <span className="flex-1">{item.item}</span>
                  <span className="chip">{item.owner}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section index={4} title="Stakeholders who must be consulted">
            <div className="grid gap-3 sm:grid-cols-2">
              {report.stakeholders.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border-2 border-ink/20 p-3 text-sm dark:border-cream/20"
                >
                  <p className="font-display font-bold">
                    {s.name} <span className="font-normal opacity-60">— {s.role}</span>
                  </p>
                  <p className="mt-1 opacity-80">
                    {s.name} {s.concern}.
                  </p>
                  <p className="mt-1 text-xs opacity-60">Availability: {s.availability}.</p>
                </div>
              ))}
            </div>
          </Section>

          <Section index={5} title="Three follow-up meetings">
            <div className="grid gap-3 sm:grid-cols-3">
              {report.followUps.map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl border-2 border-ink bg-zing-yellow p-3 text-sm text-ink"
                >
                  <p className="font-display font-bold">{f.title}</p>
                  <p className="mt-1">
                    {f.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <p className="mt-1 text-xs opacity-70">{f.duration}</p>
                  <p className="mt-2 text-xs">{f.purpose}.</p>
                </div>
              ))}
            </div>
          </Section>

          <Section index={6} title="Risk assessment">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="border-b-2 border-ink/20 p-2 dark:border-cream/20">Risk</th>
                    <th className="border-b-2 border-ink/20 p-2 dark:border-cream/20">Likelihood</th>
                    <th className="border-b-2 border-ink/20 p-2 dark:border-cream/20">Impact</th>
                    <th className="border-b-2 border-ink/20 p-2 dark:border-cream/20">Mitigation</th>
                  </tr>
                </thead>
                <tbody>
                  {report.risks.map((r, i) => (
                    <tr key={i}>
                      <td className="border-b border-ink/10 p-2 font-semibold dark:border-cream/10">{r.risk}</td>
                      <td className="border-b border-ink/10 p-2 dark:border-cream/10">{r.likelihood}</td>
                      <td className="border-b border-ink/10 p-2 dark:border-cream/10">{r.impact}</td>
                      <td className="border-b border-ink/10 p-2 dark:border-cream/10">{r.mitigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section index={7} title="Action items">
            <ul className="space-y-2 text-sm">
              {report.actionItems.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 font-bold text-zing-purple">[ ]</span>
                  <span className="opacity-85">{a}</span>
                </li>
              ))}
            </ul>
          </Section>

          <div className="rounded-3xl border-2 border-ink bg-zing-lime p-5 text-ink dark:border-cream">
            <p className="font-display text-lg font-bold">Verdict</p>
            <p className="mt-1">{report.verdict}</p>
          </div>

          <ExportButtons
            text={meetingToText(report)}
            filename={`${slugTitle(report.topic) || "MEETING"}_minutes.txt`}
            label="Download the minutes"
          />
        </div>
      )}
    </ToolShell>
  );
}
