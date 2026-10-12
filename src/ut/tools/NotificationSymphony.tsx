import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BellRing, Play, Shuffle, Square, Trash2 } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { Loop, noteFreq, type PlayOptions } from "../lib/music";

const tool = TOOL_BY_ID.get("notification-symphony")!;

interface Instrument {
  id: string;
  name: string;
  emoji: string;
  colour: string;
  voice: (play: (opts: PlayOptions) => void) => void;
}

const INSTRUMENTS: Instrument[] = [
  {
    id: "slack",
    name: "Slack Ping",
    emoji: "💬",
    colour: "bg-zing-purple",
    voice: (play) => play({ freq: noteFreq("A5"), duration: 0.16, type: "sine", gain: 0.35 }),
  },
  {
    id: "email",
    name: "Email Ding",
    emoji: "📧",
    colour: "bg-zing-orange",
    voice: (play) => {
      play({ freq: noteFreq("E6"), duration: 0.22, type: "triangle", gain: 0.28 });
      play({ freq: noteFreq("B5"), duration: 0.26, type: "triangle", gain: 0.18 });
    },
  },
  {
    id: "calendar",
    name: "Calendar Invite",
    emoji: "📅",
    colour: "bg-zing-yellow",
    voice: (play) => {
      play({ freq: noteFreq("E5"), duration: 0.18, type: "square", gain: 0.16 });
      play({ freq: noteFreq("A4"), duration: 0.3, type: "square", gain: 0.12 });
    },
  },
  {
    id: "dm",
    name: "DM Pop",
    emoji: "📨",
    colour: "bg-zing-lime",
    voice: (play) => {
      play({ freq: noteFreq("D6"), duration: 0.09, type: "sine", gain: 0.3 });
      play({ freq: noteFreq("A5"), duration: 0.12, type: "sine", gain: 0.22 });
    },
  },
  {
    id: "phone",
    name: "Phone Ring",
    emoji: "📞",
    colour: "bg-zing-pink",
    voice: (play) => {
      play({ freq: 440, duration: 0.14, type: "sawtooth", gain: 0.12 });
      play({ freq: 470, duration: 0.14, type: "sawtooth", gain: 0.1 });
    },
  },
];

const STEPS = 16;

function emptyGrid(): boolean[][] {
  return INSTRUMENTS.map(() => Array.from({ length: STEPS }, () => false));
}

function starterGrid(): boolean[][] {
  const grid = emptyGrid();
  // A little "I am drowning in notifications" motif to get people going.
  grid[0][0] = true;
  grid[0][4] = true;
  grid[1][2] = true;
  grid[1][6] = true;
  grid[2][4] = true;
  grid[3][3] = true;
  grid[3][7] = true;
  grid[3][11] = true;
  grid[4][8] = true;
  grid[4][12] = true;
  return grid;
}

export default function NotificationSymphony() {
  const [grid, setGrid] = useState<boolean[][]>(starterGrid);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(116);
  const [currentStep, setCurrentStep] = useState(-1);
  const loopRef = useRef<Loop | null>(null);
  const gridRef = useRef(grid);
  gridRef.current = grid;
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  useEffect(() => {
    const loop = new Loop(
      (step, _time, play) => {
        gridRef.current.forEach((row, instrumentIndex) => {
          if (row[step]) INSTRUMENTS[instrumentIndex].voice(play);
        });
        // Visual playhead, approximately in time. Good enough for comedy.
        window.setTimeout(() => setCurrentStep(step), 0);
      },
      STEPS,
      bpm,
      0.32,
    );
    loopRef.current = loop;
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loopRef.current?.setBpm(bpm);
  }, [bpm]);

  const toggleCell = (instrumentIndex: number, step: number) => {
    setGrid((prev) =>
      prev.map((row, i) =>
        i === instrumentIndex ? row.map((on, s) => (s === step ? !on : on)) : row,
      ),
    );
    sfx("tick");
  };

  const togglePlay = () => {
    const loop = loopRef.current;
    if (!loop) return;
    if (playing) {
      loop.stop();
      setPlaying(false);
      setCurrentStep(-1);
      sfx("click");
    } else {
      loop.setBpm(bpm);
      loop.start();
      setPlaying(true);
      recordToolUse(tool.id);
      sfx("pop");
      pushToast({
        title: "Notifications: unlimited",
        body: "Your focus mode has been respectfully ignored.",
        tone: "chaos",
        icon: "🔔",
      });
    }
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> every sound is synthesised live in your browser. No audio
          files, no notifications, no interruptions to your actual work. Well — the audio might
          interrupt. That part is real.
        </span>
      }
    >
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-3 text-cream dark:border-cream">
          <span className="flex items-center gap-2 font-display font-bold">
            <BellRing size={18} className="text-zing-yellow" /> Notification Symphony
          </span>
          <span className="font-mono text-xs text-cream/70">
            {STEPS} steps · {bpm} bpm · {INSTRUMENTS.length} instruments
          </span>
        </div>

        <div className="overflow-x-auto p-4">
          <div className="min-w-[38rem]">
            {/* playhead */}
            <div className="mb-2 flex items-center gap-2 pl-40">
              {Array.from({ length: STEPS }).map((_, s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    currentStep === s ? "bg-zing-lime" : "bg-ink/10 dark:bg-cream/10"
                  }`}
                />
              ))}
            </div>

            {INSTRUMENTS.map((instrument, i) => (
              <div key={instrument.id} className="mb-2 flex items-center gap-2">
                <div className="flex w-36 shrink-0 items-center gap-2">
                  <span className="text-lg" aria-hidden>
                    {instrument.emoji}
                  </span>
                  <span className="font-display text-sm font-bold">{instrument.name}</span>
                </div>
                <div className="flex flex-1 gap-2">
                  {Array.from({ length: STEPS }).map((_, s) => {
                    const on = grid[i][s];
                    return (
                      <button
                        key={s}
                        onClick={() => toggleCell(i, s)}
                        aria-label={`${instrument.name}, step ${s + 1}, ${on ? "on" : "off"}`}
                        aria-pressed={on}
                        className={`h-9 flex-1 rounded-lg border-2 border-ink transition-all dark:border-cream ${
                          on ? `${instrument.colour} scale-100` : "bg-white/40 hover:bg-white dark:bg-ink-soft"
                        } ${currentStep === s ? "ring-2 ring-zing-lime" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t-2 border-ink p-4 dark:border-cream">
          <Btn variant={playing ? "danger" : "primary"} sound="pop" onClick={togglePlay}>
            {playing ? (
              <>
                <Square size={18} /> Silence the office
              </>
            ) : (
              <>
                <Play size={18} /> Play
              </>
            )}
          </Btn>
          <Btn variant="ghost" sound="pop" onClick={() => setGrid(emptyGrid())}>
            <Trash2 size={18} /> Clear grid
          </Btn>
          <Btn
            variant="ghost"
            sound="boing"
            onClick={() => {
              setGrid(INSTRUMENTS.map(() => Array.from({ length: STEPS }, () => Math.random() < 0.18)));
              sfx("whoosh");
            }}
          >
            <Shuffle size={18} /> Randomise (chaos mode)
          </Btn>
          <label className="flex items-center gap-3 text-sm font-semibold">
            Tempo
            <input
              type="range"
              min={60}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="accent-zing-purple"
            />
            <span className="font-mono tabular-nums">{bpm}</span>
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Callout tone="info" title="How to compose">
          Click cells to schedule a notification. Press play. Congratulations, you have recreated your
          morning. Try to make something that sounds like a Wednesday.
        </Callout>
        <Callout tone="warn" title="Focus mode">
          There is no focus mode. This is a symphony of interruptions, which is at least honest about
          it.{" "}
          <motion.span
            className="inline-block"
            animate={{ rotate: [0, 14, -14, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            aria-hidden
          >
            🔔
          </motion.span>
        </Callout>
      </div>
    </ToolShell>
  );
}
