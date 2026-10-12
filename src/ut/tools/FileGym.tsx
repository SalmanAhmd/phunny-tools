import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, HeartPulse } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { FileDrop, fileEmoji } from "../components/FileDrop";
import { ResultPanel, ExportButtons } from "../components/ResultPanel";
import { Btn } from "../components/Btn";
import { Hud, Stage } from "../components/GameBits";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { formatBytes, slugTitle } from "../lib/format";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { pick, randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("file-gym")!;

const PREFIX = ["Chad", "Brad", "Kyle", "Tank", "Flex", "Brock", "Dwayne", "Gunnar", "Zane", "Rocco"];
const SUFFIX = ["Maximus", "Ironbyte", "Thunderfile", "Gainsberry", "Quadzilla", "Deadlift", "Byteflex", "Sunshine"];
const SHAKES = ["Whey-KB Isolate", "Creatine Monohydrate (Digital)", "Pixel Protein", "Turbo Gains™", "Bit Butter", "Mega Macros"];
const CERT_TITLES = [
  "Certified Absolutely Ripped (Digitally)",
  "Associate of Applied Heavy Lifting (Non-Physical)",
  "Distinguished Member of the File Fitness Federation",
  "Grandmaster of Consensual Data Bulking",
];

const LEVELS = ["Critical", "Low", "Concerning", "Adequate", "Weirdly High"] as const;
type Motivation = (typeof LEVELS)[number];

export default function FileGym() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [reps, setReps] = useState(0);
  const [strength, setStrength] = useState(2);
  const [mass, setMass] = useState(0.4);
  const [protein, setProtein] = useState(0);
  const [motivation, setMotivation] = useState<Motivation>("Critical");
  const [training, setTraining] = useState<"idle" | "bulk" | "emotional">("idle");
  const [showCert, setShowCert] = useState(false);
  const [shake, setShake] = useState(0);
  const [shakeName, setShakeName] = useState(SHAKES[0]);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  const handleFile = (f: File) => {
    setFile(f);
    setName(`${pick(PREFIX)} "${pick(SUFFIX)}" ${f.name.split(".")[0]}`);
    setReps(0);
    setStrength(2);
    setMass(0.4);
    setProtein(0);
    setMotivation("Critical");
    setShakeName(pick(SHAKES));
    setShowCert(false);
    recordToolUse(tool.id);
  };

  const runSession = (kind: "bulk" | "emotional") => {
    if (!file || training !== "idle") return;
    setTraining(kind);
    setShowCert(false);
    const total = randInt(8, 14);
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setReps((r) => r + 1);
      setStrength((s) => Math.min(100, s + randInt(1, 4)));
      setMass((m) => Math.round((m + (kind === "bulk" ? 0.6 : 0.15)) * 10) / 10);
      setProtein((p) => p + randInt(4, 22));
      setShake((s) => s + 1);
      sfx(kind === "bulk" ? "thud" : "ding");
      setMotivation(LEVELS[Math.min(LEVELS.length - 1, Math.floor((i / total) * LEVELS.length))]);

      if (i >= total) {
        window.clearInterval(interval);
        setTraining("idle");
        setShowCert(true);
        sfx("success");
        pushToast({
          title: kind === "bulk" ? "Bulk complete" : "Emotional strength achieved",
          body: "Your file feels better. Its size is unchanged, but its aura is enormous.",
          tone: "success",
          icon: "🏋️",
        });
      }
    }, 260);
  };

  const certText = file
    ? [
        "USELESS TOOLS™ — DIGITAL FITNESS CERTIFICATE",
        "".padEnd(54, "="),
        `ATHLETE:      ${name}`,
        `FILE:         ${file.name}`,
        `FILE SIZE:    ${formatBytes(file.size)} (unchanged, forever)`,
        `MUSCLE MASS:  ${mass.toFixed(1)} pixels`,
        `STRENGTH:     ${strength}/100`,
        `PROTEIN:      ${protein} KB`,
        `REPS:         ${reps}`,
        `TITLE:        ${pick(CERT_TITLES)}`,
        "",
        "This certifies that the above file completed a training session",
        "of dubious nutritional value. No bytes were added or removed.",
        "Valid indefinitely. Recognised by no governing body.",
      ].join("\n")
    : "";

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> no bytes are added, removed, or exercised. The "muscle
          mass" here is measured in pixels, which is not a unit. Your file is exactly as it was.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <FileDrop
            onFile={handleFile}
            file={file}
            label="Drop a file into the gym"
            hint="Nerds, spreadsheets and PDFs all welcome. No prior fitness experience required."
          />
          <Callout tone="info" title="House rules">
            Wipe down the equipment. Re-rack your bytes. Do not attempt to actually lift your
            laptop; it is heavier than it looks and the warranty does not cover confidence.
          </Callout>
        </div>

        <div className="space-y-5">
          <Hud
            items={[
              { label: "File strength", value: `${strength}/100`, accent: "bg-zing-lime" },
              { label: "Muscle mass", value: `${mass.toFixed(1)} px` },
              { label: "Motivation", value: motivation, accent: "bg-zing-yellow" },
              { label: "Protein", value: `${protein} KB` },
            ]}
          />

          <Stage className="flex h-64 flex-col items-center justify-center">
            {file ? (
              <motion.div
                key={shake}
                animate={
                  training === "bulk"
                    ? { y: [0, -26, 0], rotate: [0, -8, 0] }
                    : training === "emotional"
                      ? { scale: [1, 1.15, 1], rotate: [0, 4, -4, 0] }
                      : {}
                }
                transition={{ duration: 0.26 }}
                className="flex flex-col items-center"
              >
                <span className="text-6xl" aria-hidden>
                  {fileEmoji(file)}
                </span>
                <span className="mt-2 text-4xl" aria-hidden>
                  {training === "bulk" ? "🏋️" : training === "emotional" ? "🧘" : "😤"}
                </span>
                <p className="mt-2 max-w-[15rem] break-all text-center font-display text-sm font-bold">
                  {name}
                </p>
                <p className="text-xs opacity-70">{reps} reps completed</p>
              </motion.div>
            ) : (
              <div className="text-center opacity-60">
                <p className="text-6xl" aria-hidden>
                  🏋️
                </p>
                <p className="mt-2 font-display font-bold">The gym is empty</p>
                <p className="text-sm">Upload a file to begin its transformation.</p>
              </div>
            )}
          </Stage>

          <div className="flex flex-wrap gap-3">
            <Btn
              variant="primary"
              sound="thud"
              disabled={!file || training !== "idle"}
              onClick={() => runSession("bulk")}
            >
              <Dumbbell size={18} /> {training === "bulk" ? "Bulking…" : "Bulk up file"}
            </Btn>
            <Btn
              variant="purple"
              sound="ding"
              disabled={!file || training !== "idle"}
              onClick={() => runSession("emotional")}
            >
              <HeartPulse size={18} /> {training === "emotional" ? "Feeling…" : "Make it emotionally stronger"}
            </Btn>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-ink p-4 text-sm text-cream dark:border-cream">
            <p className="font-display font-bold text-zing-lime">Post-workout shake</p>
            <p className="mt-1 text-cream/80">
              Today's blend: {shakeName}. Taste: blue. Actual file size change: none.
            </p>
          </div>
        </div>
      </div>

      {showCert && file && (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <ResultPanel
            tone="lime"
            title="Fitness certificate"
            subtitle={pick(CERT_TITLES)}
            rows={[
              { label: "Athlete", value: name, emphasis: true },
              { label: "Strength", value: `${strength}/100` },
              { label: "Digital muscle mass", value: `${mass.toFixed(1)} pixels` },
              { label: "Protein consumed", value: `${protein} KB` },
              { label: "Motivation", value: motivation },
              { label: "Actual file size change", value: "None" },
            ]}
          />
          <div className="space-y-5">
            <Callout tone="success" title="Certificate note">
              Hang this on the fridge of your desktop. It recognises no governing body and confers
              no qualifications, but the file does seem happier.
            </Callout>
            <ExportButtons text={certText} filename={`${slugTitle(name)}_fitness_certificate.txt`} label="Download certificate" />
          </div>
        </div>
      )}
    </ToolShell>
  );
}
