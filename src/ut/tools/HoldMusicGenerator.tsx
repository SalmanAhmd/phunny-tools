import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Headphones, PhoneCall, Square } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { Loop, noteFreq } from "../lib/music";
import { pick, randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("hold-music-generator")!;

const PROGRESSION = [
  { pad: ["C4", "E4", "G4", "B4"], bass: "C2" },
  { pad: ["A3", "C4", "E4", "G4"], bass: "A1" },
  { pad: ["D4", "F4", "A4", "C5"], bass: "D2" },
  { pad: ["G3", "B3", "D4", "F4"], bass: "G1" },
];

const ANNOUNCEMENTS = [
  "Your call is important to us. Please continue to hold.",
  "You are currently number 47 in the queue.",
  "We are experiencing a higher than usual volume of calls. And feelings.",
  "Did you know you can also resolve this on our website? The website is also on hold.",
  "Your patience has been noted and will be considered at a later date.",
  "Please have your reference number ready. We will not ask for it.",
  "This call may be recorded for training purposes. The training is going badly.",
  "You have moved up in the queue. You have also moved down in the queue.",
];

export default function HoldMusicGenerator() {
  const [playing, setPlaying] = useState(false);
  const [jazziness, setJazziness] = useState(45);
  const [volume, setVolume] = useState(40);
  const [position, setPosition] = useState(47);
  const [announcement, setAnnouncement] = useState(ANNOUNCEMENTS[0]);
  const [holdSeconds, setHoldSeconds] = useState(0);
  const loopRef = useRef<Loop | null>(null);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  // Build the loop once; parameters are read through refs so it stays stable.
  const jazzRef = useRef(jazziness);
  jazzRef.current = jazziness;

  useEffect(() => {
    const loop = new Loop(
      (step, _time, play) => {
        const bar = Math.floor(step / 8) % PROGRESSION.length;
        const beat = step % 8;
        const chord = PROGRESSION[bar];
        const jazz = jazzRef.current / 100;

        if (beat === 0) {
          chord.pad.forEach((n, i) => {
            play({
              freq: noteFreq(n),
              duration: 1.5,
              type: "triangle",
              gain: 0.16 - i * 0.02,
              detune: i * 4,
            });
          });
          play({ freq: noteFreq(chord.bass), duration: 0.9, type: "sine", gain: 0.3 });
        }
        if (beat === 4) {
          play({ freq: noteFreq(chord.bass), duration: 0.7, type: "sine", gain: 0.24 });
        }
        // The little "please hold" melody, jazzier with the slider.
        if (beat === 2 || beat === 6) {
          play({ freq: noteFreq("G5"), duration: 0.18, type: "sine", gain: 0.12 });
        }
        if (jazz > 0.35 && beat === 3 && Math.random() < jazz) {
          const extra = pick(["Bb4", "F#4", "D#5", "A4"]);
          play({ freq: noteFreq(extra), duration: 0.2, type: "sine", gain: 0.09 });
        }
        if (jazz > 0.7 && beat === 7 && Math.random() < 0.5) {
          play({ freq: noteFreq(pick(["E5", "C5", "B4"])), duration: 0.15, type: "square", gain: 0.05 });
        }
      },
      32,
      78,
      0.3,
    );
    loopRef.current = loop;
    return () => loop.stop();
  }, []);

  useEffect(() => {
    loopRef.current?.setBpm(60 + jazziness * 0.7);
    loopRef.current?.setVolume((volume / 100) * 0.6);
  }, [jazziness, volume]);

  // Hold timer + queue nonsense.
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setHoldSeconds((s) => s + 1);
      setPosition((p) => {
        const drift = randInt(-2, 1);
        return Math.max(3, Math.min(99, p + drift));
      });
    }, 2500);
    const a = window.setInterval(() => {
      setAnnouncement(pick(ANNOUNCEMENTS));
      sfx("ding");
    }, 9000);
    return () => {
      window.clearInterval(t);
      window.clearInterval(a);
    };
  }, [playing]);

  const toggle = () => {
    const loop = loopRef.current;
    if (!loop) return;
    if (playing) {
      loop.stop();
      setPlaying(false);
      sfx("click");
    } else {
      loop.setBpm(60 + jazziness * 0.7);
      loop.setVolume((volume / 100) * 0.6);
      loop.start();
      setPlaying(true);
      recordToolUse(tool.id);
      sfx("pop");
      pushToast({
        title: "You are on hold",
        body: "Estimated wait: forever. Music quality: aggressively adequate.",
        tone: "chaos",
        icon: "☎️",
      });
    }
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> the hold music is generated live in your browser with the
          Web Audio API. There is no audio file and no network request. Turn down your volume before
          pressing play — this loop is designed to be endured.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-ink bg-zing-purple px-4 py-3 text-white dark:border-cream">
            <span className="flex items-center gap-2 font-display font-bold">
              <PhoneCall size={18} /> Support Line
            </span>
            <span className={`chip ${playing ? "bg-zing-lime text-ink" : "bg-white/20 text-white"}`}>
              {playing ? "● On hold" : "○ Disconnected"}
            </span>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center gap-6">
              <motion.span
                animate={playing ? { rotate: [-8, 8, -8] } : {}}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="text-6xl"
                aria-hidden
              >
                ☎️
              </motion.span>
              <div className="text-center">
                <p className="font-display text-5xl font-bold tabular-nums text-zing-purple">
                  #{position}
                </p>
                <p className="text-xs uppercase tracking-widest opacity-60">Your position</p>
              </div>
            </div>

            <div className="mt-6 flex h-16 items-end justify-center gap-1" aria-hidden>
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={playing ? { height: [6, randInt(10, 56), 6] } : { height: 6 }}
                  transition={{ repeat: Infinity, duration: 0.7 + (i % 5) * 0.12, delay: i * 0.03 }}
                  className="w-1.5 rounded-full bg-zing-orange"
                />
              ))}
            </div>

            <p className="mt-6 min-h-[3rem] text-center text-sm italic opacity-80">
              “{announcement}”
            </p>

            <p className="mt-4 text-center font-mono text-xs opacity-60">
              time spent on hold: {String(Math.floor(holdSeconds / 60)).padStart(2, "0")}:
              {String(holdSeconds % 60).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <label className="label" htmlFor="jazz">
              Jazziness — {jazziness}%
            </label>
            <input
              id="jazz"
              type="range"
              min={0}
              max={100}
              value={jazziness}
              onChange={(e) => setJazziness(Number(e.target.value))}
              className="w-full accent-zing-purple"
            />
            <p className="mt-2 text-xs opacity-70">
              Higher values add unresolved ninths and a saxophone you cannot actually hear.
            </p>

            <label className="label mt-5" htmlFor="vol">
              Volume — {volume}%
            </label>
            <input
              id="vol"
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-zing-orange"
            />

            <div className="mt-6 flex flex-wrap gap-3">
              <Btn variant={playing ? "danger" : "primary"} sound="pop" size="lg" onClick={toggle}>
                {playing ? (
                  <>
                    <Square size={18} /> Hang up
                  </>
                ) : (
                  <>
                    <Headphones size={18} /> Put me on hold
                  </>
                )}
              </Btn>
              <Btn
                variant="ghost"
                sound="boing"
                onClick={() => {
                  setPosition(randInt(3, 120));
                  setAnnouncement(pick(ANNOUNCEMENTS));
                }}
              >
                Transfer my call
              </Btn>
            </div>
          </div>

          <Callout tone="warn" title="Queue policy">
            Our queue is strictly first-in, first-out, unless someone else calls, in which case it is
            strictly last-in, first-out. Positions may increase at any time for operational reasons
            that we have chosen not to define.
          </Callout>

          <div className="rounded-2xl border-2 border-ink bg-ink p-4 text-xs text-cream dark:border-cream">
            <p className="font-display font-bold text-zing-lime">Progression currently deployed</p>
            <p className="mt-1 font-mono text-cream/70">
              Cmaj7 → Am7 → Dm7 → G7, repeated until you give up
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
