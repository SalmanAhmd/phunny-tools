import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Hammer, RotateCcw } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { FileDrop, fileEmoji } from "../components/FileDrop";
import { ResultPanel } from "../components/ResultPanel";
import { Btn } from "../components/Btn";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { formatBytes, fileExtension } from "../lib/format";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { downloadBlob } from "../lib/download";
import { randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("hammer-zip")!;

const MESSAGES = [
  "Analyzing file's emotional weight…",
  "Applying brute-force compression algorithms…",
  "Removing unnecessary pixels from your spreadsheet…",
  "Negotiating with the file…",
  "Explaining the concept of 'smaller' to the file…",
  "Asking the file, nicely, to become smaller…",
  "Consulting a medieval manuscript on archiving…",
  "Reconsidering the entire compression industry…",
  "Finalising. Probably. Nobody knows.",
];

const DAMAGE = [
  "None (yet)",
  "Cosmetic",
  "Noticeable",
  "Concerning",
  "Severe",
  "Severe, bordering on theatrical",
  "Structurally questionable",
  "Emotionally devastating",
  "Total. Complete. Historic.",
];

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export default function HammerZip() {
  const [file, setFile] = useState<File | null>(null);
  const [hits, setHits] = useState(0);
  const [smashing, setSmashing] = useState(false);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [showReport, setShowReport] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shake, setShake] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { recordToolUse, recordButtonClick } = useStats();
  const { pushToast, fireConfetti } = useUI();

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const spawnParticles = () => {
    const batch: Particle[] = Array.from({ length: randInt(4, 8) }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: randInt(-70, 70),
      y: randInt(-40, 10),
      emoji: ["✨", "💥", "⚡", "🔩", "💨", "🧱"][randInt(0, 5)],
    }));
    setParticles((p) => [...p, ...batch]);
    window.setTimeout(() => {
      setParticles((p) => p.filter((x) => !batch.some((b) => b.id === x.id)));
    }, 900);
  };

  const startSmash = useCallback(() => {
    if (!file || smashing) return;
    clearTimer();
    setShowReport(false);
    setHits(0);
    setSmashing(true);
    recordToolUse(tool.id);
    sfx("whoosh");
    pushToast({
      title: "Hammering commenced",
      body: "Step back. This is a precision operation.",
      tone: "chaos",
      icon: "🔨",
    });

    let hitIndex = 0;
    timerRef.current = window.setInterval(() => {
      hitIndex += 1;
      setHits(hitIndex);
      setMessage(MESSAGES[Math.min(hitIndex, MESSAGES.length - 1)]);
      sfx("smash");
      spawnParticles();
      setShake(true);
      window.setTimeout(() => setShake(false), 350);

      if (hitIndex >= MESSAGES.length) {
        clearTimer();
        setSmashing(false);
        setShowReport(true);
        sfx("sad");
        fireConfetti();
      }
    }, 620);
  }, [file, smashing, recordToolUse, pushToast, fireConfetti]);

  const reset = () => {
    clearTimer();
    setHits(0);
    setSmashing(false);
    setShowReport(false);
    setMessage(MESSAGES[0]);
    setParticles([]);
    sfx("pop");
  };

  const flatness = Math.min(0.62, hits * 0.055);
  const bend = Math.min(14, hits * 1.4);

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> HammerZip is a comedy simulation. Your file is never
          uploaded, never modified and never compressed. Every number below is decorative. The
          original file on your device is completely untouched.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <FileDrop
            onFile={(f) => {
              setFile(f);
              reset();
            }}
            file={file}
            hint="Any file type. Hammering works on all of them equally badly."
          />

          <Callout tone="info" title="What actually happens">
            We shake the screen, play a sound, and render a frown on your file's behalf. The
            byte count is read once and displayed forever, unchanged, like a monument.
          </Callout>
        </div>

        <div className="space-y-6">
          {/* The smashing theatre */}
          <motion.div
            animate={shake ? { x: [0, -8, 7, -5, 3, 0], rotate: [0, -0.6, 0.6, 0] } : {}}
            transition={{ duration: 0.35 }}
            className="relative flex min-h-[19rem] flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-ink bg-gradient-to-b from-white to-cream-deep p-6 dark:border-cream dark:from-ink-soft dark:to-ink-night"
          >
            {/* impact particles */}
            <AnimatePresence>
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
                  animate={{ opacity: 0, x: p.x, y: p.y - 40, scale: 1.4, rotate: randInt(-90, 90) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="pointer-events-none absolute text-2xl"
                  style={{ top: "46%", left: "50%" }}
                  aria-hidden
                >
                  {p.emoji}
                </motion.span>
              ))}
            </AnimatePresence>

            {file ? (
              <motion.div
                animate={{
                  scaleY: hits > 0 ? 1 - flatness : 1,
                  rotate: hits * 1.4 - bend / 2,
                  y: hits * 6,
                }}
                transition={{ type: "spring", stiffness: 320, damping: 14 }}
                className="relative flex flex-col items-center"
                style={{ transformOrigin: "bottom center" }}
              >
                <motion.span
                  key={hits}
                  initial={{ scale: 1.25 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 12 }}
                  className="text-7xl"
                  aria-hidden
                >
                  {fileEmoji(file)}
                </motion.span>
                <p className="mt-3 max-w-[16rem] break-all text-center font-display text-sm font-bold">
                  {file.name}
                </p>
                <p className="text-xs opacity-70">
                  {formatBytes(file.size)} · {fileExtension(file.name)}
                </p>
                {hits > 5 && (
                  <p className="mt-2 rotate-3 font-display text-xs font-bold text-zing-pink">
                    status: structurally compromised
                  </p>
                )}
              </motion.div>
            ) : (
              <div className="text-center opacity-60">
                <p className="text-6xl" aria-hidden>
                  🧰
                </p>
                <p className="mt-3 font-display font-bold">Awaiting a victim</p>
                <p className="text-sm">Upload a file to begin the ritual.</p>
              </div>
            )}

            {/* the hammer */}
            <AnimatePresence>
              {smashing && (
                <motion.div
                  className="absolute right-4 top-2 text-6xl sm:right-10"
                  initial={{ rotate: -60, y: -30, opacity: 0 }}
                  animate={{ rotate: [-60, 30, -30, 25, -25, 20], y: [-30, 40, -20, 45, -10, 50] }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ repeat: Infinity, duration: 0.62, ease: "easeInOut" }}
                  aria-hidden
                >
                  🔨
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-3 left-3 flex gap-1.5" aria-hidden>
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-6 rounded-full border border-ink/40 ${
                    i < hits ? "bg-zing-orange" : "bg-white/60 dark:bg-ink"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* message ticker */}
          <div className="rounded-2xl border-2 border-ink bg-ink px-4 py-3 font-mono text-sm text-zing-lime dark:border-cream">
            <span className="mr-2 text-zing-orange">{">"}</span>
            {file ? message : "Waiting for a file…"}
          </div>

          <div className="flex flex-wrap gap-3">
            <Btn
              variant="primary"
              sound="thud"
              size="lg"
              className="w-full bg-gradient-to-r from-zing-pink to-zing-orange font-display text-lg sm:w-auto"
              disabled={!file || smashing}
              onClick={startSmash}
            >
              <Hammer size={20} /> {smashing ? "HAMMERING…" : "COMPRESS WITH HAMMER"}
            </Btn>
            <Btn variant="ghost" sound="pop" disabled={!file || smashing} onClick={reset}>
              <RotateCcw size={18} /> Reset the damage
            </Btn>
          </div>
        </div>
      </div>

      {showReport && file && (
        <div className="mt-10">
          <ResultPanel
            tone="purple"
            title="HammerZip™ Compression Report"
            subtitle="Certified by nobody. Reviewed by the file's next of kin."
            rows={[
              { label: "Original size", value: formatBytes(file.size) },
              { label: "Final size", value: formatBytes(file.size), emphasis: true },
              { label: "Bytes saved", value: "0 (rounded up for morale)" },
              { label: "Compression efficiency", value: "Emotionally devastating" },
              { label: "Physical damage", value: DAMAGE[Math.min(hits, DAMAGE.length - 1)] },
              { label: "Digital improvement", value: "None detected" },
              { label: "File contents modified", value: "Absolutely not" },
              { label: "Hammer strikes absorbed", value: `${hits}` },
            ]}
            footer={
              <div className="flex flex-wrap items-center gap-3">
                <Btn
                  variant="primary"
                  sound="thud"
                  onClick={() => {
                    recordButtonClick();
                    startSmash();
                  }}
                >
                  <Hammer size={18} /> Hammer again
                </Btn>
                <Btn
                  variant="ghost"
                  sound="ding"
                  onClick={() => {
                    downloadBlob(file, file.name);
                    pushToast({
                      title: "Original downloaded",
                      body: "Byte-for-byte identical. As promised. As always.",
                      tone: "success",
                      icon: "🛡️",
                    });
                  }}
                >
                  <Download size={18} /> Download the untouched original
                </Btn>
              </div>
            }
          />
        </div>
      )}
    </ToolShell>
  );
}
