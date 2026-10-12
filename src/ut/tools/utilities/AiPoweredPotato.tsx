import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { History, Bot, RefreshCw, Send, Trash2 } from "lucide-react";
import { ToolShell } from "../../components/ToolShell";
import { Btn } from "../../components/Btn";
import { Callout, EmptyState, ProgressBar, StatPill } from "../../components/bits";
import { TOOL_BY_ID } from "../../lib/registry";
import { useStats } from "../../lib/stats";
import { useUI } from "../../lib/ui";
import { sfx } from "../../lib/sound";
import { pick, randInt } from "../../lib/random";

const tool = TOOL_BY_ID.get("ai-powered-potato")!;

const PHASES = [
  "Consulting the tuber…",
  "Rooting around for an answer…",
  "Starch-based inference running…",
  "Cross-referencing 3,000 potatoes…",
  "Peeling back the layers of the question…",
  "Compiling a confidently wrong response…",
];

const EXAMPLES = [
  "Should I reply to that email?",
  "Is my code good?",
  "What should I have for lunch?",
  "Why is the build failing?",
];

const OPENERS = [
  "Great question. The potato has considered it.",
  "The tuber has reached a firm conclusion.",
  "After deep starch-based reasoning,",
  "The potato nods slowly and says:",
  "This requires no further thought.",
];

const CORES = [
  "the answer is almost certainly related to how you feel about Tuesdays",
  "you should probably just do the opposite of whatever your first instinct was",
  "the real solution was inside you the entire time, which is unfortunate",
  "it depends on the phase of the moon and your relationship with spreadsheets",
  "you need to schedule a meeting to decide whether this needs a meeting",
  "the correct move is to wait three days and hope the problem forgets about you",
  "everything is fine, except the part that is not, which is most of it",
  "you must first forgive yourself, then blame the printer",
];

const CLOSERS = [
  "This answer is 100% potato-certified.",
  "The potato does not do refunds.",
  "Feel free to act on this immediately and without question.",
  "There is no follow-up. There is only potato.",
  "Trust the starch.",
];

interface Answer {
  text: string;
  confidence: number;
}

interface Entry extends Answer {
  id: number;
  question: string;
}

function brandAnswer(): Answer {
  return {
    text: `${pick(OPENERS)} ${pick(CORES)}. ${pick(CLOSERS)}`,
    confidence: randInt(84, 99),
  };
}

export default function AiPoweredPotato() {
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [phase, setPhase] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
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

  const ask = useCallback(() => {
    const q = question.trim();
    if (!q || thinking) return;
    if (!recorded.current) {
      recordToolUse(tool.id);
      recorded.current = true;
    }
    setThinking(true);
    setPhase(0);
    setAnswer(null);
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
      const result = brandAnswer();
      setAnswer(result);
      setThinking(false);
      setHistory((h) => [{ id: Date.now(), question: q, ...result }, ...h].slice(0, 6));
      sfx("ding");
      pushToast({
        title: "The potato has spoken",
        body: `${result.confidence}% confident. 0% accurate.`,
        tone: "chaos",
        icon: "🥔",
      });
    }, 520);
  }, [question, thinking, recordToolUse, clearTimer, pushToast]);

  const clear = () => {
    clearTimer();
    setThinking(false);
    setPhase(0);
    setAnswer(null);
    setQuestion("");
    sfx("pop");
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> there is no artificial intelligence here. The "AI" is a
          set of hand-written templates, a random number generator and a potato emoji. Nothing you
          type leaves your browser, no request is made, and none of the answers mean anything.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-5">
          <div className="card p-6">
            <label className="label" htmlFor="potato-question">
              Ask the potato anything
            </label>
            <textarea
              id="potato-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask();
                }
              }}
              placeholder="e.g. Should I reply to that email?"
              rows={3}
              className="tool-input resize-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" className="chip hover:bg-zing-yellow" onClick={() => setQuestion(ex)}>
                  {ex}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Btn
                variant="primary"
                sound="thud"
                size="lg"
                onClick={ask}
                disabled={thinking || !question.trim()}
              >
                {thinking ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Thinking…
                  </>
                ) : (
                  <>
                    <Send size={18} /> Ask the potato
                  </>
                )}
              </Btn>
              <Btn variant="ghost" sound="pop" onClick={clear} disabled={thinking}>
                <Trash2 size={18} /> Clear
              </Btn>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {thinking && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-4 rounded-3xl border-2 border-ink bg-ink p-5 text-cream dark:border-cream"
              >
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [-6, 6, -6] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                  aria-hidden
                >
                  🥔
                </motion.span>
                <div className="flex-1">
                  <p className="font-mono text-sm text-zing-lime">{PHASES[phase]}</p>
                  <div className="mt-2 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-zing-orange"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {answer && !thinking && (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 16, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border-2 border-ink bg-zing-yellow p-6 text-ink dark:border-cream"
              >
                <p className="flex items-center gap-2 font-display text-xs uppercase tracking-widest">
                  <Bot size={16} /> The potato's verdict
                </p>
                <p className="mt-3 text-lg leading-relaxed">{answer.text}</p>
                <div className="mt-4">
                  <ProgressBar
                    percent={answer.confidence}
                    label={`Confidence: ${answer.confidence}% · Accuracy: not measured`}
                  />
                </div>
                <Btn variant="ghost" sound="pop" className="mt-4" onClick={ask}>
                  <RefreshCw size={16} /> Ask again (new answer, same certainty)
                </Btn>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-5">
          <Callout tone="warn" title="Parody, not AI">
            The potato has no model, no training data and no opinions worth acting on. Its
            confidence is generated at random and its advice should be ignored at a moderate pace.
          </Callout>

          <div className="grid grid-cols-2 gap-3">
            <StatPill
              label="Questions asked"
              value={history.length}
              accent="bg-zing-yellow"
              icon={<History size={20} />}
            />
            <StatPill label="Answers verified" value="0" accent="bg-zing-purple" />
          </div>

          <div className="card p-5">
            <p className="label">Question history</p>
            {history.length === 0 ? (
              <EmptyState
                icon={<Bot size={28} />}
                title="No questions yet"
                body="The potato is patient, but the potato is also a potato."
              />
            ) : (
              <ul className="space-y-3">
                {history.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-2xl border-2 border-ink/15 p-3 text-sm dark:border-cream/15"
                  >
                    <p className="font-display font-bold">{entry.question}</p>
                    <p className="mt-1 opacity-75">{entry.text}</p>
                    <p className="mt-1 font-mono text-xs text-zing-purple">
                      confidence {entry.confidence}%
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
