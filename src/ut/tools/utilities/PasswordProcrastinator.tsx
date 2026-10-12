import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Copy, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { ToolShell } from "../../components/ToolShell";
import { Btn } from "../../components/Btn";
import { Callout, ProgressBar, StatPill } from "../../components/bits";
import { ResultPanel, type ReportRow } from "../../components/ResultPanel";
import { TOOL_BY_ID } from "../../lib/registry";
import { useStats } from "../../lib/stats";
import { useUI } from "../../lib/ui";
import { sfx } from "../../lib/sound";
import { copyToClipboard } from "../../lib/download";
import { clampi } from "../../lib/format";
import { pick, randInt } from "../../lib/random";

const tool = TOOL_BY_ID.get("password-procrastinator")!;

const STEPS = [
  "Counting the characters, one at a time, suspiciously…",
  "Sniffing for uppercase energy…",
  "Consulting the vibe archive…",
  "Cross-referencing known pet names…",
  "Hunting for '123' in all its disguises…",
  "Feeding the numbers into a very serious calculator…",
  "Assigning blame…",
];

const VIBES = [
  "Aggressively nostalgic",
  "Vaguely edible",
  "Legally concerning",
  "Suspiciously optimistic",
  "Emotionally unavailable",
  "Structurally a poem",
  "Too confident",
  "Faintly damp",
];

const PET_NAMES = [
  "rex",
  "bella",
  "luna",
  "max",
  "buddy",
  "fluffy",
  "whiskers",
  "milo",
  "bailey",
  "rocky",
];

const SUGGESTION_WORDS = [
  "moist",
  "gravy",
  "trolley",
  "mustard",
  "quilt",
  "penguin",
  "sandal",
  "cactus",
  "biscuit",
  "lantern",
];

const SUGGESTION_SYMBOLS = ["!", "#", "?", "%", "&"];

interface PwReport {
  score: number;
  verdict: string;
  suggestion: string;
  rows: ReportRow[];
}

function vibeFor(pw: string): string {
  let hash = 0;
  for (let i = 0; i < pw.length; i++) hash = (hash * 31 + pw.charCodeAt(i)) >>> 0;
  return VIBES[hash % VIBES.length];
}

function crackTime(score: number): string {
  if (score < 20) return "0.3 seconds, on a smart fridge";
  if (score < 40) return "about one lunch break";
  if (score < 60) return "until the intern gets bored (Tuesday)";
  if (score < 80) return "several geological eras";
  return "longer than the universe has patience for";
}

function verdictFor(score: number): string {
  if (score < 20) return "This password has given up. We respect the honesty.";
  if (score < 45) return "Security theatre, but make it sad.";
  if (score < 70) return "Acceptable. Barely. Like a shrug with letters.";
  if (score < 90) return "Respectable. Suspiciously so, frankly.";
  return "Genuinely strong. Why are you even here?";
}

function analyse(pw: string): PwReport {
  const len = pw.length;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const variety = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
  const pet = PET_NAMES.find((name) => pw.toLowerCase().includes(name));
  const predictable = /123|abc|qwerty|password|letmein|admin/i.test(pw);

  let score = Math.min(len * 4, 40) + variety * 10;
  if (pet) score -= 18;
  if (predictable) score -= 25;
  if (len === 0) score = 0;
  score = clampi(score, 0, 100);

  return {
    score,
    verdict: verdictFor(score),
    suggestion: `${pick(SUGGESTION_WORDS)}-${pick(SUGGESTION_WORDS)}-${randInt(1000, 9999)}-${pick(
      SUGGESTION_SYMBOLS,
    )}-DoNotReuse-${randInt(10, 99)}`,
    rows: [
      { label: "Length", value: `${len} character${len === 1 ? "" : "s"}`, emphasis: true },
      { label: "Character variety", value: `${variety} of 4 families` },
      { label: "Uppercase energy", value: hasUpper ? "Present" : "Absent" },
      { label: "Digits", value: hasDigit ? "Detected" : "None" },
      { label: "Symbols", value: hasSymbol ? "Yes, fancy" : "None" },
      { label: "Pet name detected", value: pet ? `Yes — "${pet}"` : "None (good)" },
      { label: 'Contains "123" or similar', value: predictable ? "Yes. Oh no." : "No" },
      { label: "Vibe assessment", value: vibeFor(pw) },
      { label: "Estimated time to crack", value: crackTime(score), emphasis: true },
    ],
  };
}

export default function PasswordProcrastinator() {
  const [pw, setPw] = useState("");
  const [phase, setPhase] = useState<"idle" | "analyzing" | "done">("idle");
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<PwReport | null>(null);
  const [used, setUsed] = useState(false);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  useEffect(() => {
    if (phase !== "analyzing") return;
    if (step >= STEPS.length) {
      setReport(analyse(pw));
      setPhase("done");
      sfx("error");
      pushToast({
        title: "Analysis complete",
        body: "It was not good news. It was never going to be.",
        tone: "danger",
        icon: "🚨",
      });
      return;
    }
    const timer = window.setTimeout(() => {
      setStep((s) => s + 1);
      sfx("tick");
    }, 360);
    return () => window.clearTimeout(timer);
  }, [phase, step, pw, pushToast]);

  const analyze = () => {
    if (!pw) return;
    if (!used) {
      recordToolUse(tool.id);
      setUsed(true);
    }
    setPhase("analyzing");
    setStep(0);
    setReport(null);
    sfx("whoosh");
  };

  const reset = () => {
    setPw("");
    setPhase("idle");
    setStep(0);
    setReport(null);
    sfx("pop");
  };

  const copySuggestion = async () => {
    if (!report) return;
    const ok = await copyToClipboard(report.suggestion);
    if (ok) sfx("success");
    pushToast({
      title: ok ? "Absurd password copied" : "Copy failed",
      body: ok ? "Please do not actually use this." : "The browser refused. It has standards.",
      tone: ok ? "success" : "danger",
      icon: ok ? "📋" : "😵",
    });
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> nothing you type is stored, logged, transmitted or
          remembered. There is no network request and no database. Close this tab and the password
          is gone from our side entirely — it was never ours to keep.
        </span>
      }
    >
      <div className="card-pop p-6">
        <label className="label" htmlFor="pw-sample">
          Type a sample password (visible on purpose, so you can watch the comedy unfold)
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="pw-sample"
            type="text"
            value={pw}
            autoComplete="off"
            spellCheck={false}
            disabled={phase === "analyzing"}
            placeholder="e.g. fluffy123"
            className="tool-input"
            onChange={(e) => {
              setPw(e.target.value);
              setPhase("idle");
              setStep(0);
              setReport(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
          />
          <Btn
            variant="primary"
            sound="whoosh"
            className="shrink-0"
            disabled={!pw || phase === "analyzing"}
            onClick={analyze}
          >
            {phase === "analyzing" ? (
              <>
                <RefreshCw size={18} className="animate-spin" /> Analysing…
              </>
            ) : (
              <>
                <Sparkles size={18} /> Judge my password
              </>
            )}
          </Btn>
          <Btn variant="ghost" sound="pop" className="shrink-0" onClick={reset} disabled={!pw}>
            <RefreshCw size={18} /> Reset
          </Btn>
        </div>
        <p className="mt-3 font-mono text-xs opacity-60">
          {pw.length} characters in the box · 0 sent anywhere · 0 remembered
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <AnimatePresence mode="wait">
            {phase === "analyzing" && (
              <motion.div
                key="steps"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card-pop p-5"
              >
                <p className="mb-4 flex items-center gap-2 font-display font-bold">
                  <ShieldAlert size={18} /> Running the very serious analysis
                </p>
                <ul className="space-y-2">
                  {STEPS.map((text, i) => (
                    <li
                      key={text}
                      className={`flex items-start gap-2 rounded-xl border-2 p-2 text-sm ${
                        i < step
                          ? "border-ink/60 bg-zing-lime/40 dark:border-cream/60"
                          : "border-ink/15 opacity-45 dark:border-cream/15"
                      }`}
                    >
                      {i < step ? (
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-zing-purple" />
                      ) : (
                        <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-current" />
                      )}
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {phase !== "analyzing" && (
              <motion.div
                key="meter"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <StatPill
                  label="Security score"
                  value={report ? `${report.score}/100` : "—"}
                  accent={report && report.score < 45 ? "bg-zing-pink" : "bg-zing-lime"}
                  icon={<ShieldAlert size={20} />}
                />
                <ProgressBar
                  percent={report ? report.score : 0}
                  label={report ? report.verdict : "Awaiting a password to judge"}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Callout tone="info" title="Data handling, stated plainly">
            This analysis runs entirely in your browser using regular expressions and a random
            number generator. There is no storage, no telemetry and no network. Refreshing the page
            erases everything you typed here.
          </Callout>
        </div>

        <div className="space-y-5">
          <AnimatePresence>
            {report && phase === "done" && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ResultPanel
                  tone="pink"
                  title="Password Security Assessment"
                  subtitle="Prepared by a department that does not exist."
                  rows={report.rows}
                  footer={
                    <div className="space-y-3">
                      <p className="text-sm">
                        Suggested "stronger" password:{" "}
                        <span className="font-mono font-bold">{report.suggestion}</span>
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Btn variant="primary" sound="ding" onClick={copySuggestion}>
                          <Copy size={18} /> Copy the absurd suggestion
                        </Btn>
                        <Btn variant="ghost" sound="pop" onClick={analyze}>
                          <RefreshCw size={18} /> Justify it again
                        </Btn>
                      </div>
                      <p className="text-xs opacity-70">
                        That suggestion is deliberately unusable. Do not adopt it. We are not a
                        password manager and we are barely a website.
                      </p>
                    </div>
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!report && phase !== "analyzing" && (
            <div className="rounded-3xl border-2 border-dashed border-ink/40 p-10 text-center dark:border-cream/40">
              <p className="text-4xl" aria-hidden>
                🔑
              </p>
              <p className="mt-3 font-display text-lg font-bold">No verdict yet</p>
              <p className="mt-2 text-sm opacity-70">
                Type something into the box and we will judge it with unwarranted confidence.
              </p>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
