import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PackageOpen, HeartCrack } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { FileDrop } from "../components/FileDrop";
import { Btn } from "../components/Btn";
import { Callout, ProgressBar } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { formatBytes } from "../lib/format";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { readZipEntries, type ZipEntryInfo } from "../lib/zip";
import { pick, pickMany, randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("unzip-your-feelings")!;

const UNPACK_LINES = [
  "Breaking the emotional seal…",
  "Counting regrets before unpacking…",
  "Alphabetising your unresolved feelings…",
  "Negotiating with the compression ratio…",
  "Finding the file you definitely renamed 'final'…",
  "Discovering three more copies of that file…",
  "Apologising to the folder structure…",
  "Unpacking complete. Nothing is resolved.",
];

const FICTIONAL_FILES = [
  "final_final_really_final.docx",
  "taxes_and_regrets.xlsx",
  "important_stuff_2021_old.zip",
  "why_is_this_folder_here.txt",
  "screenshot_2021-03-04_at_11.02.33.png",
  "new_folder (2)/new_folder (1)/document.pdf",
  "untitled_document_47.doc",
  "do_not_open_backup_backup.zip",
  "CV_final_v9_USE_THIS_ONE.pdf",
  "meeting_notes_that_changed_nothing.md",
  "photo_of_a_whiteboard.jpg",
];

const EMOTIONS = [
  "emotionally: unresolved",
  "emotionally: fine (lying)",
  "emotionally: 2019",
  "emotionally: needs a holiday",
  "emotionally: pending review",
  "emotionally: attached to a project that was cancelled",
  "emotionally: doing its best",
  "emotionally: avoidant",
];

function annotate(path: string): string {
  const lower = path.toLowerCase();
  if (/(final|final_final|v\d+|copy)/.test(lower)) return "A file that has been 'finished' at least eleven times.";
  if (lower.includes("tax") || lower.includes("invoice")) return "Do not open before 11pm. Contains numbers and dread.";
  if (lower.includes("backup")) return "A backup of a backup. Neither has ever been opened.";
  if (lower.endsWith(".png") || lower.endsWith(".jpg")) return "A screenshot of a conversation you would rather forget.";
  if (lower.includes("meeting") || lower.includes("minutes")) return "Notes from a meeting that decided nothing.";
  if (lower.includes("old")) return "It is not old. It is 'legacy' and it has feelings about the word.";
  if (lower.endsWith(".zip")) return "A zip inside a zip. A nesting doll of avoidance.";
  if (lower.includes("todo") || lower.includes("task")) return "A to-do list from a more optimistic era.";
  if (lower.includes("readme")) return "Nobody read it. Not even its author.";
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "Fourteen revisions. All worse than the first.";
  if (lower.endsWith(".xlsx") || lower.endsWith(".csv")) return "Contains a formula that only one person understood.";
  if (lower.endsWith(".pdf")) return "Page 7 is the important one. You will never find page 7.";
  return "Its purpose has been lost to time and organisational restructuring.";
}

export default function UnzipYourFeelings() {
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ZipEntryInfo[] | null>(null);
  const [unpacking, setUnpacking] = useState(false);
  const [percent, setPercent] = useState(0);
  const [line, setLine] = useState(UNPACK_LINES[0]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedReal, setUsedReal] = useState(false);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  const handleFile = async (f: File) => {
    setFile(f);
    setEntries(null);
    setDone(false);
    setError(null);
    setUsedReal(false);
    recordToolUse(tool.id);
    try {
      const list = await readZipEntries(f);
      setEntries(list);
    } catch {
      setEntries(null);
      setError("We could not read that archive. We have substituted our own, and honestly it is better.");
    }
  };

  const unpack = () => {
    if (!file || unpacking) return;
    setUnpacking(true);
    setDone(false);
    setPercent(0);
    sfx("whoosh");
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      const p = Math.min(100, (i / UNPACK_LINES.length) * 100);
      setPercent(p);
      setLine(UNPACK_LINES[Math.min(i, UNPACK_LINES.length - 1)]);
      sfx("tick");
      if (i >= UNPACK_LINES.length) {
        window.clearInterval(timer);
        setUnpacking(false);
        setDone(true);
        sfx("success");
        setUsedReal(Boolean(file.name.toLowerCase().endsWith(".zip") || file.name.toLowerCase().endsWith(".zipx")));
        pushToast({
          title: "Extraction complete",
          body: "All files recovered. All feelings remain compressible.",
          tone: "success",
          icon: "🗜️",
        });
      }
    }, 420);
  };

  const shownFiles: { path: string; size?: number; real: boolean }[] = entries && entries.length
    ? entries
        .filter((e) => !e.directory)
        .slice(0, 40)
        .map((e) => ({ path: e.path, size: e.size, real: true }))
    : pickMany(FICTIONAL_FILES, 8).map((path) => ({ path, real: false }));

  void usedReal;
  void randInt;

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> when you upload a ZIP, we use a real ZIP library to list
          the genuine filenames inside it. The commentary layered on top is invented. The archive is
          read only — never modified, never extracted to disk, never uploaded.
        </span>
      }
    >
      {!file ? (
        <FileDrop
          accept=".zip,.zipx,application/zip"
          onFile={handleFile}
          label="Drop a ZIP archive (the emotional kind)"
          hint="Real filenames, fake feelings. Max 40 MB."
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-5">
            <div className="card flex flex-col items-center p-6 text-center">
              <motion.span
                animate={unpacking ? { rotate: [-3, 3, -3], y: [0, -6, 0] } : { rotate: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="text-7xl"
                aria-hidden
              >
                🗜️
              </motion.span>
              <p className="mt-3 break-all font-display font-bold">{file.name}</p>
              <p className="text-sm opacity-70">{formatBytes(file.size)}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="chip bg-zing-pink text-white">⚠ Fragile</span>
                <span className="chip bg-zing-yellow text-ink">Handle with feelings</span>
                <span className="chip">Do not open alone</span>
              </div>
              {error && (
                <p className="mt-4 rounded-xl border-2 border-ink bg-zing-pink px-3 py-2 text-xs text-white dark:border-cream">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Btn variant="primary" sound="whoosh" disabled={unpacking} onClick={unpack}>
                <PackageOpen size={18} /> {unpacking ? "Unpacking…" : "Begin dramatic unpacking"}
              </Btn>
              <Btn
                variant="ghost"
                sound="pop"
                onClick={() => {
                  setFile(null);
                  setEntries(null);
                  setDone(false);
                }}
              >
                Different archive
              </Btn>
            </div>

            {(unpacking || done) && (
              <div className="card p-5">
                <ProgressBar percent={percent} label={line} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Callout tone="info" title="Contents">
              {entries && entries.length
                ? `We found ${entries.length} real entries. ${entries.filter((e) => e.directory).length} of them are folders, which is normal and still slightly upsetting.`
                : "We have invented a plausible archive for you. Honestly, it is probably accurate."}
            </Callout>

            <AnimatePresence mode="popLayout">
              {shownFiles.map((f, i) => (
                <motion.div
                  key={f.path + i}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: done || entries ? 1 : 0.45, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.5) }}
                  className="flex items-start gap-3 rounded-2xl border-2 border-ink bg-white p-3 text-sm dark:border-cream dark:bg-ink-soft"
                >
                  <span className="text-2xl" aria-hidden>
                    {f.real ? "📄" : "🫥"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-mono text-xs font-bold">{f.path}</p>
                    <p className="mt-1 opacity-75">{annotate(f.path)}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs opacity-60">
                      {f.size !== undefined && f.size > 0 && <span>{formatBytes(f.size)}</span>}
                      <span className="italic">{pick(EMOTIONS)}</span>
                      {f.real && <span className="text-zing-purple">· real entry</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!done && (
              <p className="flex items-center gap-2 text-sm opacity-60">
                <HeartCrack size={16} /> Press unpack to have these feelings processed.
              </p>
            )}
          </div>
        </div>
      )}
    </ToolShell>
  );
}
