import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Droplets, MessageCircle, RotateCcw, Sparkles, Sprout } from "lucide-react";
import { ToolShell } from "../../components/ToolShell";
import { Btn } from "../../components/Btn";
import { Callout, ProgressBar, StatPill } from "../../components/bits";
import { TOOL_BY_ID } from "../../lib/registry";
import { useStats } from "../../lib/stats";
import { useUI } from "../../lib/ui";
import { sfx } from "../../lib/sound";
import { pick } from "../../lib/random";
import { formatDuration } from "../../lib/format";
import { loadJSON, saveJSON } from "../../lib/storage";

const tool = TOOL_BY_ID.get("digital-plant")!;

/** Idle seconds required before the plant considers you suitably absent. */
const IDLE_THRESHOLD = 5;
const BASE_RATE = 0.7;
const BOOST_RATE = 2.6;
const BOOST_SECONDS = 15;

const STAGES = [
  { at: 0, name: "Seed", emoji: "🫘" },
  { at: 15, name: "Sprout", emoji: "🌱" },
  { at: 35, name: "Leaf", emoji: "🌿" },
  { at: 55, name: "Bud", emoji: "🌼" },
  { at: 75, name: "Flower", emoji: "🌻" },
  { at: 92, name: "Suspiciously Large", emoji: "🌳" },
];

const STAGE_COMMENTS: Record<string, string> = {
  Seed: "It is a seed. It believes in you, which is generous.",
  Sprout: "A tiny sprout. It has opinions about sunlight.",
  Leaf: "Leaves! Real ones. Mostly ignored by you.",
  Bud: "A bud has appeared. It expects nothing and gives everything.",
  Flower: "It flowered while you were elsewhere. Typical.",
  "Suspiciously Large": "It is now larger than your monitor. Do not ask how.",
};

const SPECIES = [
  "Sir Photosynthesis",
  "Kevin",
  "The Unsupervised Fern",
  "Bartholomew IV",
  "Greg",
];

const TALKS = [
  "You: 'How are you?' Plant: silence, but supportive silence.",
  "You told it about your day. It grew 0.0001% out of politeness.",
  "The plant nods, slowly, because a draft moved it.",
  "It says nothing. It is a plant. This is the healthiest relationship here.",
  "You apologised for being away. The plant accepted. Probably.",
];

const RETURN_LINES = [
  "You were gone {t}. The plant grew the entire time, unsupervised.",
  "Welcome back after {t}. The plant did not miss you, but it did grow.",
  "Absent for {t}. The plant used the time productively. You did not.",
  "You returned after {t}. The plant is taller and slightly smug.",
];

interface PlantState {
  growth: number;
  species: string;
  plantedAt: number;
  talks: number;
}

const DEFAULT_PLANT: PlantState = {
  growth: 0,
  species: pick(SPECIES),
  plantedAt: Date.now(),
  talks: 0,
};

export default function DigitalPlant() {
  const [plant, setPlant] = useState<PlantState>(() => loadJSON<PlantState>("plant", DEFAULT_PLANT));
  const [idle, setIdle] = useState(0);
  const [boost, setBoost] = useState(0);
  const [awayNote, setAwayNote] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const lastActivityRef = useRef(Date.now());
  const hiddenAtRef = useRef<number | null>(null);
  const boostRef = useRef(0);
  const recorded = useRef(false);
  const { recordToolUse } = useStats();
  const { pushToast, reducedMotion } = useUI();

  boostRef.current = boost;

  useEffect(() => {
    saveJSON("plant", plant);
  }, [plant]);

  useEffect(() => {
    const activity = () => {
      lastActivityRef.current = Date.now();
      setIdle(0);
    };
    window.addEventListener("pointerdown", activity);
    window.addEventListener("keydown", activity);
    return () => {
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", activity);
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }
      const away = hiddenAtRef.current ? (Date.now() - hiddenAtRef.current) / 1000 : 0;
      if (away >= 8) setAwayNote(pick(RETURN_LINES).replace("{t}", formatDuration(away)));
      hiddenAtRef.current = null;
      lastActivityRef.current = Date.now();
      setIdle(0);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const idleNow = (Date.now() - lastActivityRef.current) / 1000;
      setIdle(idleNow);
      setBoost((b) => (b > 0 ? b - 1 : 0));
      if (idleNow >= IDLE_THRESHOLD) {
        setPlant((p) =>
          p.growth >= 100
            ? p
            : {
                ...p,
                growth: Math.min(100, p.growth + BASE_RATE + (boostRef.current > 0 ? BOOST_RATE : 0)),
              },
        );
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const stageIndex = STAGES.reduce((acc, s, i) => (plant.growth >= s.at ? i : acc), 0);
  const stage = STAGES[stageIndex];
  const growing = idle >= IDLE_THRESHOLD && plant.growth < 100;
  const untilGrowth = Math.max(0, IDLE_THRESHOLD - idle);
  const comment =
    awayNote ??
    (plant.growth >= 100
      ? "It is now larger than the browser. We have stopped measuring."
      : growing
        ? `Growing quietly. ${STAGE_COMMENTS[stage.name]}`
        : `Idle required: ${untilGrowth.toFixed(0)}s more of doing nothing.`);

  const noteInteraction = () => {
    if (!recorded.current) {
      recordToolUse(tool.id);
      recorded.current = true;
    }
  };

  const water = () => {
    noteInteraction();
    setBoost(BOOST_SECONDS);
    setPlant((p) => ({ ...p, growth: Math.min(100, p.growth + 4) }));
    setAwayNote(null);
    sfx("pop");
    pushToast({
      title: "Watered",
      body: "A temporary boost of dubious botanical value.",
      tone: "success",
      icon: "💧",
    });
  };

  const talk = () => {
    noteInteraction();
    const line = pick(TALKS);
    setLog((l) => [line, ...l].slice(0, 5));
    setPlant((p) => ({ ...p, talks: p.talks + 1 }));
    setAwayNote(null);
    sfx("ding");
  };

  const replant = () => {
    setPlant({ growth: 0, species: pick(SPECIES), plantedAt: Date.now(), talks: 0 });
    setLog([]);
    setAwayNote(null);
    setBoost(0);
    sfx("thud");
    pushToast({
      title: "A fresh plant",
      body: "All progress discarded. It will grow back while you are not looking.",
      tone: "info",
      icon: "🌱",
    });
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> this plant is a number in your browser's localStorage. It
          grows because a timer adds to it, not because anything is alive. It makes no network
          requests and will not survive you clearing your site data.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-5">
          <div className="card flex min-h-[20rem] flex-col items-center justify-center overflow-hidden p-6 text-center">
            <motion.div
              animate={
                reducedMotion
                  ? {}
                  : { y: [0, -8, 0], rotate: growing ? [0, 2, -2, 0] : [0, 0.6, -0.6, 0] }
              }
              transition={{ repeat: Infinity, duration: growing ? 2.2 : 4.5, ease: "easeInOut" }}
              className="select-none"
              style={{ fontSize: `${3 + (plant.growth / 100) * 4}rem`, lineHeight: 1 }}
              aria-hidden
            >
              {stage.emoji}
            </motion.div>

            <p className="mt-4 font-display text-xl font-bold">{plant.species}</p>
            <p className="text-sm opacity-70">
              {stage.name} · planted {new Date(plant.plantedAt).toLocaleDateString()}
            </p>

            <div className="mt-5 w-full max-w-sm">
              <ProgressBar
                percent={plant.growth}
                label={growing ? "🌿 growing while you do nothing" : `${Math.round(plant.growth)}% grown`}
              />
            </div>

            {boost > 0 && (
              <p className="mt-3 flex items-center gap-1 font-display text-sm font-bold text-zing-purple">
                <Sparkles size={16} /> Hydration boost: {boost}s left
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Btn variant="primary" sound="pop" onClick={water}>
              <Droplets size={18} /> Water (temporary boost)
            </Btn>
            <Btn variant="purple" sound="ding" onClick={talk}>
              <MessageCircle size={18} /> Talk to it
            </Btn>
            <Btn variant="ghost" sound="thud" onClick={replant}>
              <RotateCcw size={18} /> Plant a new one
            </Btn>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-ink px-4 py-3 font-display text-sm text-zing-lime dark:border-cream">
            {comment}
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatPill
              label="Idle time"
              value={formatDuration(idle)}
              accent="bg-zing-cyan"
              icon={<Clock size={20} />}
            />
            <StatPill
              label="Growth stage"
              value={stage.name}
              accent="bg-zing-lime"
              icon={<Sprout size={20} />}
            />
            <StatPill label="Growth" value={`${Math.round(plant.growth)}%`} accent="bg-zing-yellow" />
            <StatPill label="Conversations" value={plant.talks} accent="bg-zing-purple" />
          </div>

          <Callout tone="info" title="How this plant grows">
            It only grows while this tab is visible and you have not clicked or typed for{" "}
            {IDLE_THRESHOLD} seconds. Your absence is its fertiliser. Progress is saved in this
            browser, so it will still be here — slightly larger — when you return.
          </Callout>

          <div className="card p-5">
            <p className="label">Things you have said to a plant</p>
            {log.length === 0 ? (
              <p className="text-sm opacity-60">Nothing yet. The plant is fine with that.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {log.map((line, i) => (
                  <motion.li
                    key={`${line}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border-2 border-ink/15 p-2 opacity-85 dark:border-cream/15"
                  >
                    {line}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
