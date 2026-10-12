import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { Hud, Stage } from "../components/GameBits";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { pick, randInt, uid } from "../lib/random";

const tool = TOOL_BY_ID.get("click-the-wrong-button")!;

interface ChaosButton {
  id: string;
  label: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  hidden: boolean;
}

const SEED_LABELS = [
  "Do Not Click",
  "Definitely Don't Click",
  "This One Is Safe",
  "Click Here to Win Nothing",
];

const SWAP_LABELS = [
  "Actually Click This",
  "Microphone Is Live",
  "This Deletes Everything",
  "Free Lunch (Not Free)",
  "Reply All",
  "Mark as Urgent",
  "Totally Safe, Honestly",
  "One Weird Trick",
  "Accept All Cookies",
  "Unsubscribe From Joy",
];

const CONGRATS = [
  "Congratulations! You made a terrible decision.",
  "Well done. That was the wrong one. Again.",
  "You clicked. Nothing improved. Beautiful.",
  "A bold choice from someone with limited options.",
  "Impressive commitment to the wrong answer.",
  "That button has filed a complaint with HR.",
  "You have been added to a distribution list.",
  "Someone in IT has been notified. Not the good someone.",
];

function makeSeedButtons(): ChaosButton[] {
  const spots = [
    { x: 18, y: 22 },
    { x: 66, y: 26 },
    { x: 24, y: 68 },
    { x: 68, y: 70 },
  ];
  return SEED_LABELS.map((label, i) => ({
    id: uid(),
    label,
    x: spots[i].x,
    y: spots[i].y,
    scale: 1,
    rotate: randInt(-4, 4),
    hidden: false,
  }));
}

export default function ClickTheWrongButton() {
  const [buttons, setButtons] = useState<ChaosButton[]>(makeSeedButtons);
  const [terribleDecisions, setTerribleDecisions] = useState(0);
  const [escapes, setEscapes] = useState(0);
  const [regrets, setRegrets] = useState(0);
  const [clones, setClones] = useState(0);
  const { recordGamePlayed, recordButtonClick } = useStats();
  const { pushToast, fireConfetti } = useUI();

  const reset = useCallback(() => {
    setButtons(makeSeedButtons());
    setTerribleDecisions(0);
    setEscapes(0);
    setRegrets(0);
    setClones(0);
    sfx("pop");
    pushToast({
      title: "Everything reset",
      body: "The buttons have returned and they remember nothing. Probably.",
      tone: "info",
      icon: "🔄",
    });
  }, [pushToast]);

  const handleClick = (id: string) => {
    recordButtonClick();
    recordGamePlayed("click-the-wrong-button");
    setTerribleDecisions((d) => d + 1);
    const roll = randInt(0, 9);

    setButtons((prev) => {
      const current = prev.find((b) => b.id === id);
      if (!current) return prev;

      switch (roll) {
        case 0:
        case 1: {
          // It flees.
          setEscapes((e) => e + 1);
          sfx("boing");
          return prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  x: randInt(6, 78),
                  y: randInt(8, 78),
                  rotate: randInt(-14, 14),
                }
              : b,
          );
        }
        case 2:
        case 3: {
          // It duplicates.
          setClones((c) => c + 1);
          sfx("pop");
          if (prev.length >= 14) {
            return prev.map((b) =>
              b.id === id ? { ...b, x: randInt(6, 78), y: randInt(8, 78) } : b,
            );
          }
          return [
            ...prev,
            {
              id: uid(),
              label: pick(SWAP_LABELS),
              x: randInt(6, 78),
              y: randInt(8, 78),
              scale: 0.95,
              rotate: randInt(-10, 10),
              hidden: false,
            },
          ];
        }
        case 4:
        case 5: {
          // Labels get shuffled around the room.
          sfx("whoosh");
          const labels = prev.map((b) => b.label);
          const shuffled = [...labels].reverse();
          return prev.map((b, i) => ({ ...b, label: shuffled[i] ?? b.label }));
        }
        case 6: {
          // It shrinks. Cruelly.
          sfx("click");
          return prev.map((b) =>
            b.id === id ? { ...b, scale: Math.max(0.45, b.scale * 0.72) } : b,
          );
        }
        case 7: {
          // It grows and becomes unmissable.
          sfx("boing");
          return prev.map((b) =>
            b.id === id ? { ...b, scale: Math.min(1.9, b.scale * 1.3), rotate: randInt(-6, 6) } : b,
          );
        }
        case 8: {
          // It plays dead for a second, then returns.
          sfx("error");
          window.setTimeout(() => {
            setButtons((cur) => cur.map((b) => (b.id === id ? { ...b, hidden: false } : b)));
          }, 900);
          return prev.map((b) => (b.id === id ? { ...b, hidden: true } : b));
        }
        default: {
          // Nothing happens. Which is somehow the worst outcome.
          setRegrets((r) => r + 1);
          sfx("tick");
          return prev.map((b) => b);
        }
      }
    });

    if (roll === 0 || roll === 1) {
      pushToast({ title: "Click registered. Button fled.", tone: "chaos", icon: "💨" });
    } else if (roll === 2 || roll === 3) {
      pushToast({ title: "It duplicated", body: "Why would it do that. Why.", tone: "chaos", icon: "👥" });
    } else if (roll >= 4 && roll <= 7) {
      pushToast({ title: "Wrong button", body: pick(CONGRATS), tone: "danger", icon: "😬" });
    } else if (roll === 9) {
      pushToast({ title: "Nothing happened", body: "Somehow that is worse.", tone: "info", icon: "🫥" });
    }
    if (terribleDecisions + 1 === 25) fireConfetti();
  };

  const nonsense = Math.min(100, terribleDecisions * 3 + clones * 2);

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> none of these buttons do anything real, which is more
          than can be said for several buttons in real software. There is no way to win. There is a
          way to reset, and even that is a trap.
        </span>
      }
    >
      <Hud
        items={[
          { label: "Terrible decisions", value: terribleDecisions, accent: "bg-zing-pink text-white" },
          { label: "Buttons on the loose", value: escapes },
          { label: "Regrets", value: regrets },
          { label: "Clones spawned", value: clones, accent: "bg-zing-purple text-white" },
        ]}
      />

      <Stage className="h-[26rem] sm:h-[30rem]">
        <AnimatePresence>
          {buttons.map((b) => (
            <motion.button
              key={b.id}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: b.hidden ? 0 : 1,
                scale: b.scale,
                rotate: b.rotate,
              }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
              onClick={() => handleClick(b.id)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-ink bg-white px-4 py-3 font-display text-sm font-bold text-ink shadow-pop-sm hover:bg-zing-yellow dark:border-cream dark:bg-ink-soft dark:text-cream"
            >
              {b.label}
            </motion.button>
          ))}
        </AnimatePresence>

        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border-2 border-ink bg-ink px-4 py-1 font-display text-xs font-bold text-zing-lime dark:border-cream">
          {nonsense}% nonsense
        </div>
      </Stage>

      <div className="mt-5 flex flex-wrap gap-3">
        <Btn variant="ghost" sound="pop" onClick={reset}>
          <RotateCcw size={18} /> Reset the chaos
        </Btn>
        <Btn
          variant="primary"
          sound="coin"
          onClick={() => {
            const extra = randInt(1, 3);
            for (let i = 0; i < extra; i++) {
              setButtons((prev) =>
                prev.length >= 16
                  ? prev
                  : [
                      ...prev,
                      {
                        id: uid(),
                        label: pick(SWAP_LABELS),
                        x: randInt(6, 78),
                        y: randInt(8, 78),
                        scale: 1,
                        rotate: randInt(-8, 8),
                        hidden: false,
                      },
                    ],
              );
            }
            sfx("boing");
            pushToast({
              title: `Summoned ${extra} more buttons`,
              body: "An excellent use of everyone's time.",
              tone: "chaos",
              icon: "✨",
            });
          }}
        >
          <Sparkles size={18} /> Release more buttons
        </Btn>
      </div>

      <div className="mt-6">
        <Callout tone="warn" title="Strategy tip">
          There is no correct button. Every click is a small, confident mistake. The only winning
          move is to close the tab, and even that is arguably a draw.
        </Callout>
      </div>
    </ToolShell>
  );
}
