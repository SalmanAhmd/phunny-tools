import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Play, RotateCcw } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { Hud, Stage, Overlay } from "../components/GameBits";
import { Callout } from "../components/bits";
import { ResultPanel } from "../components/ResultPanel";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { clampi, formatDuration } from "../lib/format";

const tool = TOOL_BY_ID.get("office-escape-room")!;

interface Choice {
  label: string;
  correct: boolean;
  feedback: string;
}

interface StageDef {
  emoji: string;
  title: string;
  prompt: string;
  hint: string;
  choices: Choice[];
}

const STAGES: StageDef[] = [
  {
    emoji: "🔗",
    title: "Find the meeting link",
    prompt:
      "It is 4:57 PM. The invite insists the meeting has already started. Find the actual link before it ends.",
    hint: "The real link is always in a reply nobody scrolls to. Go past the 'Thanks!' mines.",
    choices: [
      {
        label: "Join 'Quick Sync (Recurring)' — no link attached",
        correct: false,
        feedback: "There is no link. There is never a link on that one.",
      },
      {
        label: "Dig into reply #14 of the thread for the Meet link",
        correct: true,
        feedback: "Found it. Buried under eleven 'Thanks!' messages and a cat photo.",
      },
      {
        label: "Reuse the Zoom link from last quarter's invite",
        correct: false,
        feedback: "That meeting ended in March. You would be joining a memory.",
      },
      {
        label: "Ask the channel whether anyone has the link",
        correct: false,
        feedback: "You have now scheduled a second meeting about finding the first meeting.",
      },
    ],
  },
  {
    emoji: "🗂️",
    title: "Pick the final file",
    prompt:
      "The deck is due. Choose the correct version from the shared drive. There are eleven candidates.",
    hint: "The more official the filename, the more wrong it is. Trust the typo.",
    choices: [
      {
        label: "report_final_v7_FINAL_use-this-one.docx",
        correct: false,
        feedback: "Four official-sounding words. Therefore wrong. That is the rule.",
      },
      {
        label: "report_final_v7 (copy) (copy).docx",
        correct: false,
        feedback: "A copy of a copy. Deeply cursed energy. Skip it.",
      },
      {
        label: "reprot_final_v7_REAL_actually.docx",
        correct: true,
        feedback: "The typo proves a human made it in a hurry at 2 AM. This is the one.",
      },
      {
        label: "report_v7_FINAL_approved_by_boss_v2.docx",
        correct: false,
        feedback: "Approved by a boss who has since left the company. Nice try.",
      },
    ],
  },
  {
    emoji: "🖨️",
    title: "Unjam the printer",
    prompt:
      "The printer displays 'PAPER JAM – TRAY 2'. There is no paper in tray 2. Free the printer.",
    hint: "The jam is never where the display says it is. Check the back panel.",
    choices: [
      {
        label: "Reinstall the printer drivers",
        correct: false,
        feedback: "The drivers are fine. The printer is emotionally unwell. It was never the drivers.",
      },
      {
        label: "Yell 'come on' at it, firmly",
        correct: false,
        feedback: "The printer respects confidence, but not this much confidence.",
      },
      {
        label: "Open the back panel, remove the crumpled A3 sheet from 2019",
        correct: true,
        feedback: "There it is. A relic. The printer exhales and prints forty pages instantly.",
      },
      {
        label: "File a maintenance ticket for next Tuesday",
        correct: false,
        feedback: "You do not have until Tuesday. You do not even have until lunch.",
      },
    ],
  },
  {
    emoji: "🕵️",
    title: "Identify who broke production",
    prompt:
      "Prod fell over at 02:13. The commit message is 'wip'. The author is 'admin'. The branch is 'hotfix/hotfix2'. At 02:10 the intern asked: 'what does force push do?'. Dave, eleven years here, says he 'just merged main, didn't touch anything'. Who broke production?",
    hint: "Whoever says 'I didn't touch anything' touched everything.",
    choices: [
      {
        label: "The intern, obviously",
        correct: false,
        feedback: "Too obvious. The intern is the official scapegoat and everyone knows it.",
      },
      {
        label: "The CI pipeline",
        correct: false,
        feedback: "The pipeline only does what Dave told it to do at 2 AM.",
      },
      {
        label: "Dave, who 'just merged main' at 02:12",
        correct: true,
        feedback: "Every clue, including 'didn't touch anything', points at Dave. It is always Dave.",
      },
      { label: "Cosmic rays", correct: false, feedback: "Plausible. But cosmic rays do not type 'wip'." },
    ],
  },
  {
    emoji: "🚪",
    title: "Pick the real exit",
    prompt: "You are free. You just need the correct exit out of the building.",
    hint: "Real exits are labelled as anything except 'Exit'. Look for the boring, mislabelled door.",
    choices: [
      {
        label: "The big green EXIT door",
        correct: false,
        feedback: "That one triggers a full alarm and a mandatory fire drill. Not yet.",
      },
      {
        label: "'Staff Only' door, propped open with a chair",
        correct: false,
        feedback: "Behind it: another office, and a second, smaller office.",
      },
      {
        label: "'Meeting Room B', which everyone knows is secretly a stairwell",
        correct: true,
        feedback: "Correct. The real exits are always mislabelled. Down you go, to freedom.",
      },
      {
        label: "The window by the break room",
        correct: false,
        feedback: "That is a fourth-floor window. HR has been notified. Again.",
      },
    ],
  },
];

type Phase = "idle" | "playing" | "over";

export default function OfficeEscapeRoom() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);
  const [lastWrong, setLastWrong] = useState<string | null>(null);
  const startRef = useRef(0);
  const penaltyRef = useRef(0);
  const finalTimeRef = useRef(0);
  const { recordGamePlayed, recordButtonClick, stats } = useStats();
  const { pushToast, fireConfetti } = useUI();

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000);
    }, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  const finish = useCallback(() => {
    finalTimeRef.current = (Date.now() - startRef.current) / 1000 + penaltyRef.current;
    setPhase("over");
    sfx("success");
    fireConfetti();
  }, [fireConfetti]);

  useEffect(() => {
    if (phase !== "over") return;
    const score = clampi(
      Math.round(1000 - finalTimeRef.current * 3 - mistakes * 40),
      0,
      1000,
    );
    recordGamePlayed("office-escape-room", score);
  }, [phase, mistakes, recordGamePlayed]);

  const start = () => {
    startRef.current = Date.now();
    penaltyRef.current = 0;
    finalTimeRef.current = 0;
    setPhase("playing");
    setStageIndex(0);
    setMistakes(0);
    setPenalty(0);
    setElapsed(0);
    setShowHint(false);
    setHintUsed(false);
    setWrongPicks([]);
    setLastWrong(null);
    sfx("pop");
    recordButtonClick();
  };

  const choose = (choice: Choice) => {
    if (phase !== "playing" || wrongPicks.includes(choice.label)) return;
    recordButtonClick();
    if (choice.correct) {
      sfx("success");
      pushToast({ title: "Unlocked", body: choice.feedback, tone: "success", icon: "🔓" });
      if (stageIndex + 1 >= STAGES.length) {
        finish();
      } else {
        setStageIndex((i) => i + 1);
        setShowHint(false);
        setHintUsed(false);
        setWrongPicks([]);
        setLastWrong(null);
      }
    } else {
      penaltyRef.current += 10;
      setPenalty(penaltyRef.current);
      setMistakes((m) => m + 1);
      setWrongPicks((w) => [...w, choice.label]);
      setLastWrong(choice.feedback);
      sfx("error");
      pushToast({ title: "Wrong turn", body: choice.feedback, tone: "danger", icon: "🚧" });
    }
  };

  const askHint = () => {
    recordButtonClick();
    if (!hintUsed) {
      penaltyRef.current += 5;
      setPenalty(penaltyRef.current);
      setHintUsed(true);
      sfx("ding");
    }
    setShowHint((s) => !s);
  };

  const stage = STAGES[stageIndex];
  const totalTime = elapsed + penalty;
  const score = clampi(Math.round(1000 - finalTimeRef.current * 3 - mistakes * 40), 0, 1000);
  const best = stats.highestScores["office-escape-room"] ?? 0;

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> this escape room is fictional. No meetings will be
          located, no printers will be repaired, and Dave will never admit anything. Hints cost fake
          seconds.
        </span>
      }
    >
      <Hud
        items={[
          {
            label: "Stage",
            value: `${Math.min(stageIndex + 1, STAGES.length)} / ${STAGES.length}`,
            accent: "bg-zing-purple text-white",
          },
          { label: "Time on the clock", value: formatDuration(totalTime) },
          { label: "Mistakes", value: mistakes },
          { label: "Penalties", value: `+${penalty}s`, accent: "bg-zing-pink text-white" },
        ]}
      />

      <div className="mb-3 flex items-center justify-center gap-2">
        {STAGES.map((s, i) => (
          <span
            key={s.title}
            className={`h-2.5 w-10 rounded-full border-2 border-ink dark:border-cream ${
              i < stageIndex ? "bg-zing-lime" : i === stageIndex ? "bg-zing-yellow" : "bg-white/40 dark:bg-ink-soft"
            }`}
          />
        ))}
      </div>

      <Stage className="min-h-[24rem] p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.title}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-4xl" aria-hidden>
                {stage.emoji}
              </span>
              <div>
                <p className="font-display text-xl font-bold">{stage.title}</p>
                <p className="mt-1 max-w-2xl text-sm opacity-80">{stage.prompt}</p>
              </div>
            </div>

            <div className="grid gap-3">
              {stage.choices.map((choice) => {
                const wrong = wrongPicks.includes(choice.label);
                return (
                  <Btn
                    key={choice.label}
                    variant={wrong ? "danger" : "primary"}
                    sound={wrong ? null : "click"}
                    disabled={wrong}
                    className={`w-full justify-start text-left ${wrong ? "opacity-60" : ""}`}
                    onClick={() => choose(choice)}
                  >
                    {wrong ? "✗ " : "› "}
                    {choice.label}
                  </Btn>
                );
              })}
            </div>

            {showHint && (
              <Callout tone="info" title="Colleague's hint" icon={<Lightbulb size={18} />}>
                {stage.hint}
              </Callout>
            )}

            {lastWrong && (
              <Callout tone="danger" title="That was not it">
                {lastWrong} It cost you ten seconds. Try again.
              </Callout>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {phase === "idle" && (
            <Overlay>
              <p className="text-5xl" aria-hidden>
                🚪
              </p>
              <h2 className="font-display text-2xl font-bold">Office Escape Room</h2>
              <p className="max-w-md text-sm opacity-80">
                Five absurd office obstacles stand between you and going home. Choose carefully;
                wrong answers cost you time. Hints cost a little extra dignity.
              </p>
              <Btn variant="primary" sound="pop" size="lg" onClick={start}>
                <Play size={20} /> Start escaping
              </Btn>
            </Overlay>
          )}
        </AnimatePresence>
      </Stage>

      {phase === "playing" && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Btn variant="yellow" sound="ding" onClick={askHint}>
            <Lightbulb size={18} /> {showHint ? "Hide the hint" : "Ask a colleague for a hint (+5s)"}
          </Btn>
          <span className="text-sm opacity-60">
            {hintUsed ? "A colleague is now owed a favour." : "No favours owed. Yet."}
          </span>
        </div>
      )}

      {phase === "over" && (
        <div className="mt-8">
          <ResultPanel
            tone="purple"
            title="You escaped the office"
            subtitle="A triumph of navigation, patience and not asking Dave any questions."
            rows={[
              { label: "Final score", value: score, emphasis: true },
              { label: "Obstacles cleared", value: `${STAGES.length} / ${STAGES.length}` },
              { label: "Time on the clock", value: formatDuration(finalTimeRef.current) },
              { label: "Mistakes made", value: mistakes },
              { label: "Hint penalties", value: `+${penalty}s` },
              { label: "Exit used", value: "'Meeting Room B' (obviously)" },
              { label: "Session best", value: best },
            ]}
            footer={
              <div className="flex flex-wrap gap-3">
                <Btn variant="primary" sound="pop" onClick={start}>
                  <RotateCcw size={18} /> Escape again
                </Btn>
              </div>
            }
          />
        </div>
      )}

      {phase !== "over" && (
        <div className="mt-6">
          <Callout tone="success" title="Objective">
            Score starts at 1000. Every second costs three points and every mistake costs forty. You
            can absolutely finish with a negative dignity score. That is fine. Go home.
          </Callout>
        </div>
      )}
    </ToolShell>
  );
}
