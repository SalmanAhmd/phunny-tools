import { useCallback, useEffect, useRef, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { Btn } from "../components/Btn";
import { Hud, Stage, Overlay } from "../components/GameBits";
import { ProgressBar, Callout } from "../components/bits";
import { ResultPanel } from "../components/ResultPanel";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { chance, pick, randInt } from "../lib/random";
import { clampi, formatDuration } from "../lib/format";

const tool = TOOL_BY_ID.get("impossible-download")!;

type EventKind = "info" | "fast" | "stall" | "rewind" | "resume";

interface DlEvent {
  at: number;
  label: string;
  kind: EventKind;
}

const EVENTS: DlEvent[] = [
  { at: 4, label: "Connecting to a server that may or may not exist…", kind: "info" },
  { at: 18, label: "Burst mode engaged. Suspiciously fast.", kind: "fast" },
  { at: 34, label: "Stalled: negotiating with the server's feelings.", kind: "stall" },
  { at: 46, label: "Recovery unsuccessful. Rewinding for no reason.", kind: "rewind" },
  { at: 58, label: "Resuming with renewed (false) confidence.", kind: "resume" },
  { at: 72, label: "Stalled again. A meeting has been scheduled about it.", kind: "stall" },
  { at: 86, label: "Oops. Un-downloading a small, avoidable amount.", kind: "rewind" },
  { at: 97, label: "Almost there. As always.", kind: "info" },
];

const WAIT_MESSAGES = [
  "Still 99%. Still fine. Everything is fine.",
  "We have asked the server politely. It has left the chat.",
  "Your download is in a meeting and cannot be disturbed.",
  "Recalculating the exact amount of nothing left to transfer.",
  "The last 1% contains all the important bytes. We lost the map.",
  "One moment. A manager is reviewing whether you may proceed.",
  "Progress is a social construct. Have you tried turning it off and on?",
  "99.9%. There is no 100. There was never a 100.",
  "Somewhere, a progress bar is doing its best. Not here, though.",
];

type Phase = "idle" | "running" | "over";

export default function ImpossibleDownload() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [percent, setPercent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [stuck, setStuck] = useState(false);
  const [status, setStatus] = useState("Awaiting your optimism…");
  const [log, setLog] = useState<string[]>(["Application loaded. Nothing has begun yet."]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const speedRef = useRef(1);
  const stalledRef = useRef(false);
  const loggedRef = useRef<Set<number>>(new Set());
  const { recordGamePlayed, recordButtonClick, recordToolUse } = useStats();
  const { pushToast, fireConfetti } = useUI();

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const loop = useCallback(
    (time: number) => {
      if (!lastRef.current) lastRef.current = time;
      const dt = Math.min(0.1, (time - lastRef.current) / 1000);
      lastRef.current = time;
      setElapsed((e) => e + dt);
      if (!stalledRef.current) {
        setPercent((p) => clampi(p + speedRef.current * 9 * dt, 0, 100));
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [],
  );

  // Threshold events. The rewind really does rewind, because comedy needs stakes.
  useEffect(() => {
    if (phase !== "running") return;
    for (const ev of EVENTS) {
      if (percent >= ev.at && !loggedRef.current.has(ev.at)) {
        loggedRef.current.add(ev.at);
        setLog((l) => [...l.slice(-6), ev.label]);
        setStatus(ev.label);
        if (ev.kind === "stall") sfx("error");
        else if (ev.kind === "rewind") sfx("boing");
        else sfx("tick");
        if (ev.kind === "fast") speedRef.current = 2.6;
        if (ev.kind === "stall") {
          stalledRef.current = true;
          window.setTimeout(() => {
            stalledRef.current = false;
          }, 1700);
        }
        if (ev.kind === "rewind") {
          stalledRef.current = false;
          speedRef.current = 1;
          setPercent((p) => clampi(p - randInt(10, 20), 0, 100));
        }
        if (ev.kind === "resume") {
          stalledRef.current = false;
          speedRef.current = 1.7;
        }
      }
    }

    // The punchline: 99% is a home now.
    if (percent >= 99 && !stuck) {
      setStuck(true);
      stalledRef.current = true;
      sfx("error");
      pushToast({
        title: "99%",
        body: "This is where we live now. It is fine. It is fine.",
        tone: "chaos",
        icon: "⏳",
      });
    }
  }, [percent, phase, stuck, pushToast]);

  useEffect(() => {
    if (phase !== "over") return;
    recordGamePlayed("impossible-download", clicks);
  }, [phase, clicks, recordGamePlayed]);

  const start = () => {
    stop();
    lastRef.current = 0;
    speedRef.current = 1;
    stalledRef.current = false;
    loggedRef.current = new Set();
    setPercent(0);
    setElapsed(0);
    setClicks(0);
    setStuck(false);
    setStatus("Connecting to a server that may or may not exist…");
    setLog(["Initialising. Please do not close the tab. It will not help."]);
    setPhase("running");
    recordToolUse(tool.id);
    sfx("whoosh");
    rafRef.current = requestAnimationFrame(loop);
  };

  const complete = () => {
    stop();
    stalledRef.current = true;
    setPercent(100);
    setStuck(false);
    setPhase("over");
    sfx("success");
    fireConfetti();
    pushToast({
      title: "Download complete",
      body: "The file is real. The file is a joke. Both can be true.",
      tone: "success",
      icon: "📦",
    });
  };

  const keepWaiting = () => {
    recordButtonClick();
    const next = clicks + 1;
    setClicks(next);
    const msg = pick(WAIT_MESSAGES);
    setLog((l) => [...l.slice(-6), msg]);
    setStatus(msg);
    sfx(chance(0.5) ? "tick" : "click");
    if (stuck && next >= 6) {
      complete();
      return;
    }
    pushToast({ title: "Still waiting", body: msg, tone: "info", icon: "⏳" });
  };

  const retry = () => {
    recordButtonClick();
    setClicks((c) => c + 1);
    const back = randInt(9, 22);
    stalledRef.current = false;
    speedRef.current = 1;
    setStuck(false);
    setPercent((p) => clampi(p - back, 0, 98));
    setLog((l) => [...l.slice(-6), `Rolled back ${back}%. This will not help.`]);
    sfx("error");
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> there is no server, no file, and no download. Nothing
          leaves your browser. The 99% is fictional, although you have definitely met it before.
        </span>
      }
    >
      <Hud
        items={[
          { label: "Progress", value: `${percent.toFixed(1)}%`, accent: "bg-zing-cyan text-ink" },
          { label: "Patience", value: clicks },
          { label: "Time invested", value: `${elapsed.toFixed(0)}s` },
          {
            label: "Status",
            value: phase === "over" ? "Done" : stuck ? "Stuck at 99%" : phase === "running" ? "Downloading" : "Idle",
          },
        ]}
      />

      <Stage className="h-[24rem] sm:h-[27rem] p-6">
        <div className="mx-auto flex h-full max-w-2xl flex-col justify-center gap-5">
          <div className="text-center">
            <p className="text-6xl" aria-hidden>
              {phase === "over" ? "📦" : "⬇️"}
            </p>
            <p className="mt-2 font-display text-lg font-bold">
              {status}
            </p>
          </div>

          <ProgressBar percent={percent} label={`${percent.toFixed(1)}% of an unknown quantity`} />

          <div className="rounded-2xl border-2 border-ink bg-ink px-4 py-3 font-mono text-xs text-zing-lime dark:border-cream">
            {log.slice(-4).map((line, i) => (
              <p key={`${line}-${i}`} className="truncate">
                <span className="mr-1 text-zing-orange">{">"}</span>
                {line}
              </p>
            ))}
          </div>
        </div>

        {phase === "idle" && (
          <Overlay>
            <p className="text-5xl" aria-hidden>
              ⬇️
            </p>
            <h2 className="font-display text-2xl font-bold">The Impossible Download</h2>
            <p className="max-w-md text-sm opacity-80">
              It starts strong. It stalls. It rewinds. It reaches 99% and settles in for the long
              haul. Your only real tools are patience and a button labelled Retry.
            </p>
            <Btn variant="primary" sound="whoosh" size="lg" onClick={start}>
              <Download size={20} /> Start download
            </Btn>
          </Overlay>
        )}
      </Stage>

      {phase === "running" && (
        <div className="mt-5 flex flex-wrap gap-3">
          <Btn variant="primary" sound="click" onClick={keepWaiting}>
            <Download size={18} /> Keep waiting {stuck ? "(this is the way)" : ""}
          </Btn>
          <Btn variant="danger" sound="error" onClick={retry}>
            <RotateCcw size={18} /> Retry from somewhere else
          </Btn>
          <Btn
            variant="ghost"
            sound="ding"
            onClick={() => {
              recordButtonClick();
              pushToast({
                title: "Support ticket filed",
                body: "Ticket #0000 has been filed into the void.",
                tone: "info",
                icon: "🎫",
              });
            }}
          >
            Contact support
          </Btn>
        </div>
      )}

      {phase === "over" && (
        <div className="mt-8">
          <ResultPanel
            tone="purple"
            title="Download complete (allegedly)"
            subtitle="Certified by nobody. Verified by the same nobody."
            rows={[
              { label: "File received", value: "final_report_v7(3).zip" },
              { label: "Time you will never recover", value: formatDuration(elapsed) },
              { label: "Times you said 'keep waiting'", value: clicks, emphasis: true },
              { label: "Bytes actually transferred", value: "0 (rounded up for morale)" },
              { label: "Actual contents", value: "download_failed_successfully.txt" },
              { label: "Real file on your device", value: "No. Obviously not." },
            ]}
            footer={
              <div className="flex flex-wrap gap-3">
                <Btn variant="primary" sound="pop" onClick={start}>
                  <RotateCcw size={18} /> Download it again
                </Btn>
              </div>
            }
          />
        </div>
      )}

      {phase !== "over" && (
        <div className="mt-6">
          <Callout tone="warn" title="Progress update">
            Percentages may go down. Percentages may lie. The 99% is the destination, not a delay.
            Patience is the high score, and you are winning it whether you like it or not.
          </Callout>
        </div>
      )}
    </ToolShell>
  );
}
