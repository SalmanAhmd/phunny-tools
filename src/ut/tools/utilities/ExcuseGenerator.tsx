import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Download, MessageCircleWarning, Trash2, Wand2 } from "lucide-react";
import { ToolShell } from "../../components/ToolShell";
import { Btn } from "../../components/Btn";
import { Callout, EmptyState, StatPill } from "../../components/bits";
import { TOOL_BY_ID } from "../../lib/registry";
import { useStats } from "../../lib/stats";
import { useUI } from "../../lib/ui";
import { sfx } from "../../lib/sound";
import { copyToClipboard, downloadText } from "../../lib/download";
import { pick, pickMany, uid } from "../../lib/random";

const tool = TOOL_BY_ID.get("excuse-generator")!;

type Category = "Late" | "Missed a meeting" | "Missed a deadline" | "Forgot something" | "Social";

const CATEGORIES: Category[] = [
  "Late",
  "Missed a meeting",
  "Missed a deadline",
  "Forgot something",
  "Social",
];

const OPENERS: Record<Category, string[]> = {
  Late: [
    "I know I'm late, and I need you to know it was not my fault.",
    "First, an apology. Second, the circumstances.",
    "I was on time in every timeline except this one.",
  ],
  "Missed a meeting": [
    "I have to be honest: I was in the meeting spiritually.",
    "The invite and I had a fundamental misunderstanding.",
    "I saw the calendar, and the calendar saw me, and yet.",
  ],
  "Missed a deadline": [
    "The deadline and I were operating on two different calendars, both of them yours.",
    "I want to be fully transparent about the timeline.",
    "The work is done. The file, however, is in a better place.",
  ],
  "Forgot something": [
    "It didn't slip my mind. It left voluntarily.",
    "I remembered it at 3am, which technically counts.",
    "My memory runs a strict one-item-at-a-time policy.",
  ],
  Social: [
    "I was genuinely looking forward to it, in principle.",
    "Sadly I am an introvert with a scheduling problem.",
    "I RSVP'd yes to the idea and no to the reality.",
  ],
};

const ESCALATIONS = [
  "my phone updated itself for forty-five minutes and then apologised",
  "the tram announced it was 'experiencing feelings'",
  "a pigeon established residency on my laptop",
  "my building's fire alarm hosted a surprise recital",
  "the calendar invite moved itself to another timezone",
  "I was selected for a mandatory survey about surveys",
  "my headphones entered a committed relationship with the mute button",
  "a barista misspelled my name so badly I had to start over",
  "the lift opened, considered the situation, and closed again",
  "my laptop installed a personality update during the stand-up",
];

const CONNECTORS = [
  "and then",
  "at which point",
  "shortly after which",
  "which naturally led to",
  "culminating in",
];

const LEVELS = [
  { name: "Barely a ripple", note: "1 clause. Fully deniable.", clauses: 1 },
  { name: "Mildly sincere", note: "2 clauses. A touch rehearsed.", clauses: 2 },
  { name: "Professionally sorry", note: "3 clauses. There is a slide deck.", clauses: 3 },
  { name: "Legally cautious", note: "4 clauses. Someone notarised this.", clauses: 4 },
  { name: "Presidential apology", note: "5 clauses. A podium has appeared.", clauses: 5 },
];

const CLOSERS: string[][] = [
  ["No hard feelings, I hope. I'll be right there.", "We move on. I certainly have.", "It's basically a non-event."],
  ["I take full responsibility for the parts that are not my fault.", "I've made a note, in a notebook I will lose.", "Thank you for your understanding, which I have assumed."],
  ["I've drafted a one-pager explaining the one-pager.", "I've looped in a stakeholder to loop in the other stakeholders.", "Let's take this offline, permanently."],
  ["My representatives will be in touch. My representatives are also me.", "I've had the incident independently reviewed by a mirror.", "Please find attached a document I have not attached."],
  ["I will now take no questions, and one question.", "History will judge this gently, I hope.", "Let us never speak of the timeline again, except in the memoir."],
];

interface Entry {
  id: string;
  text: string;
  category: Category;
  level: string;
  at: string;
}

function buildExcuse(category: Category, levelIndex: number): string {
  const level = LEVELS[levelIndex];
  const opener = pick(OPENERS[category]);
  const clauses = pickMany(ESCALATIONS, level.clauses);
  const middle = clauses
    .map((c, i) => `${CONNECTORS[Math.min(i, CONNECTORS.length - 1)]} ${c}`)
    .join(" ");
  return `${opener} ${middle} ${pick(CLOSERS[levelIndex])}`;
}

export default function ExcuseGenerator() {
  const [category, setCategory] = useState<Category>("Late");
  const [levelIndex, setLevelIndex] = useState(1);
  const [excuse, setExcuse] = useState<string | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [used, setUsed] = useState(false);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  const generate = () => {
    if (!used) {
      recordToolUse(tool.id);
      setUsed(true);
    }
    const text = buildExcuse(category, levelIndex);
    setExcuse(text);
    setHistory((h) =>
      [
        {
          id: uid(),
          text,
          category,
          level: LEVELS[levelIndex].name,
          at: new Date().toLocaleTimeString(),
        },
        ...h,
      ].slice(0, 50),
    );
    sfx(pick(["pop", "ding", "boing"] as const));
  };

  const copyExcuse = async () => {
    if (!excuse) return;
    const ok = await copyToClipboard(excuse);
    if (ok) sfx("success");
    pushToast({
      title: ok ? "Excuse copied" : "Copy failed",
      body: ok ? "Go. Say it with a straight face." : "Your browser declined. Improvise.",
      tone: ok ? "success" : "danger",
      icon: ok ? "📋" : "😵",
    });
  };

  const downloadReport = () => {
    const report = [
      `${tool.name} — Excuse Archive`,
      `Generated: ${new Date().toLocaleString()}`,
      `Excuses on file: ${history.length}`,
      "",
      ...history.map((e, i) => `${i + 1}. [${e.at}] (${e.category} · ${e.level})\n   ${e.text}`),
      "",
      "Honesty notice: every excuse above is fictional. We cannot verify a single one.",
    ].join("\n");
    downloadText(report, "excuse-archive.txt");
    sfx("ding");
    pushToast({
      title: "Archive downloaded",
      body: "A permanent record of impermanence.",
      tone: "info",
      icon: "🗄️",
    });
  };

  const clear = () => {
    setHistory([]);
    setExcuse(null);
    sfx("thud");
    pushToast({
      title: "Archive cleared",
      body: "The excuses never existed. Officially.",
      tone: "chaos",
      icon: "🧹",
    });
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> this tool does not send, schedule or apologise to
          anyone. It assembles random sentences on your device and keeps them only in this tab's
          memory. The excuses are fabricated; the consequences remain entirely yours.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <div className="card-pop p-6">
            <p className="label">1. What are we covering up?</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => {
                    setCategory(c);
                    sfx("click");
                  }}
                  className={`chip ${category === c ? "bg-zing-yellow" : "hover:bg-zing-yellow/60"}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <p className="label mt-6">2. How sorry are we pretending to be?</p>
            <input
              type="range"
              min={0}
              max={LEVELS.length - 1}
              value={levelIndex}
              onChange={(e) => {
                setLevelIndex(Number(e.target.value));
                sfx("tick");
              }}
              className="w-full"
              aria-label="Seriousness level"
            />
            <p className="mt-2 font-display text-sm font-bold">
              {LEVELS[levelIndex].name} — <span className="font-normal opacity-70">{LEVELS[levelIndex].note}</span>
            </p>

            <Btn
              variant="primary"
              sound="whoosh"
              size="lg"
              className="mt-6 w-full bg-gradient-to-r from-zing-orange to-zing-pink font-display text-lg"
              onClick={generate}
            >
              <Wand2 size={20} /> Generate an excuse
            </Btn>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatPill label="Excuses made" value={history.length} accent="bg-zing-orange" />
            <StatPill label="Clauses" value={LEVELS[levelIndex].clauses} accent="bg-zing-yellow" />
            <StatPill label="Seriousness" value={levelIndex + 1} accent="bg-zing-purple" />
          </div>
        </div>

        <div className="space-y-5">
          <AnimatePresence mode="wait">
            {excuse ? (
              <motion.div
                key={excuse}
                initial={{ opacity: 0, y: 18, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="rounded-3xl border-2 border-ink bg-white p-6 shadow-pop-lg dark:border-cream dark:bg-ink-soft"
              >
                <p className="font-mono text-xs uppercase tracking-widest opacity-60">
                  Excuse #{history.length} · {category}
                </p>
                <p className="mt-3 font-display text-xl font-bold leading-snug">{excuse}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Btn variant="purple" sound="ding" onClick={copyExcuse}>
                    <Copy size={18} /> Copy excuse
                  </Btn>
                  <Btn variant="ghost" sound="pop" onClick={downloadReport}>
                    <Download size={18} /> Download report
                  </Btn>
                  <Btn variant="danger" sound="thud" onClick={clear}>
                    <Trash2 size={18} /> Clear
                  </Btn>
                </div>
              </motion.div>
            ) : (
              <EmptyState
                key="empty"
                icon={<MessageCircleWarning size={36} />}
                title="No excuse on file"
                body="Pick a category and a seriousness level, then generate something you will absolutely regret saying out loud."
              />
            )}
          </AnimatePresence>

          <div className="card-pop p-5">
            <p className="label">Archive ({history.length})</p>
            {history.length === 0 ? (
              <p className="text-sm opacity-60">Nothing yet. Your record is, for now, clean.</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {history.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-2xl border-2 border-ink/15 p-3 text-sm dark:border-cream/15"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-wide opacity-55">
                      {e.at} · {e.category} · {e.level}
                    </p>
                    <p className="mt-1 opacity-85">{e.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Callout tone="warn" title="Usage warning" icon={<Wand2 size={18} />}>
            Escalation is real: the higher the seriousness, the longer the excuse. At the top level
            it becomes a speech. Nobody has ever believed it.
          </Callout>
        </div>
      </div>
    </ToolShell>
  );
}
