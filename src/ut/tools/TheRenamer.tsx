import { useState } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw, Tags } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { FileDrop, fileEmoji } from "../components/FileDrop";
import { Btn } from "../components/Btn";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { formatBytes, fileExtension } from "../lib/format";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { downloadBlob } from "../lib/download";
import { pick, randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("the-renamer")!;

const PERSONALITIES = [
  {
    id: "ceo",
    name: "Overconfident CEO",
    emoji: "🦈",
    blurb: "Speaks exclusively in declarations. Has never read the file.",
  },
  {
    id: "dev",
    name: "Sleep-deprived Developer",
    emoji: "🥱",
    blurb: "Has not slept since the last deploy. Names things honestly.",
  },
  {
    id: "manager",
    name: "Passive-aggressive Manager",
    emoji: "🙂",
    blurb: "Per my last email, this file needs renaming.",
  },
  {
    id: "conspiracy",
    name: "Conspiracy Theorist",
    emoji: "🛸",
    blurb: "This file knows something. The filename should reflect that.",
  },
  {
    id: "gov",
    name: "Extremely Formal Government Officer",
    emoji: "🏛️",
    blurb: "Nothing is a file. Everything is a numbered correspondence.",
  },
] as const;

type PersonalityId = (typeof PERSONALITIES)[number]["id"];

const STEM_PARTS: Record<PersonalityId, string[]> = {
  ceo: ["FINAL", "APPROVED", "URGENT", "SIGNED_OFF", "THE_FINAL", "ABSOLUTE_FINAL"],
  dev: ["final_final", "actually_final", "dont_touch_it_works", "temp", "broken_but_shipping", "v3_real"],
  manager: ["as_discussed", "per_my_last_email", "final_v2", "please_review", "kind_regards", "for_visibility"],
  conspiracy: ["proof", "do_not_share", "redacted", "they_are_watching", "unredacted_truth", "receipts"],
  gov: ["CORRESPONDENCE", "FORM", "APPLICATION", "MEMORANDUM", "REFERENCE", "NOTICE"],
};

function generateName(file: File, personality: PersonalityId, nonce: number): string {
  const ext = fileExtension(file.name);
  const suffix = ext && ext !== "unknown" ? `.${ext}` : "";
  const stem = pick(STEM_PARTS[personality]);
  const year = randInt(2019, 2025);
  const num = randInt(1, 99);

  switch (personality) {
    case "ceo":
      return `${stem}_${file.name.split(".")[0].toUpperCase().replace(/[^A-Z0-9]+/g, "_")}${suffix}`.slice(0, 90);
    case "dev":
      return `${stem}${nonce > 0 ? `_${nonce}` : ""}${suffix}`;
    case "manager":
      return `${stem}_${year}${suffix}`;
    case "conspiracy":
      return `${stem}_${year}_v${num}${suffix}`;
    case "gov":
      return `${stem}-${String(num).padStart(3, "0")}B_REV${randInt(1, 9)}${suffix}`.toUpperCase();
  }
}

const NOTES: Record<PersonalityId, string[]> = {
  ceo: [
    "Ownership: implied. Revision requested: never.",
    "This file is now a strategic asset. Nothing has been added.",
    "All caps because confidence is a font.",
  ],
  dev: [
    "It works on my machine. That is the entire naming convention.",
    "There are now two files with this name. One of them lies.",
    "Committed directly to main. As is tradition.",
  ],
  manager: [
    "Flagging this for your visibility. Visibility achieved.",
    "No action required, but please action it.",
    "Circling back on a circle. The circle is complete.",
  ],
  conspiracy: [
    "The extension is a disguise. Trust nothing.",
    "Filed under: things they do not want you to archive.",
    "Back it up twice. Tell no one.",
  ],
  gov: [
    "Any alteration to this filename is a reportable alteration.",
    "Please retain for a minimum of seven (7) fiscal years.",
    "Duplicate submission void. Duplicate submission expected.",
  ],
};

export default function TheRenamer() {
  const [file, setFile] = useState<File | null>(null);
  const [personality, setPersonality] = useState<PersonalityId>("ceo");
  const [newName, setNewName] = useState("");
  const [nonce, setNonce] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  const rename = (p: PersonalityId = personality, increment = false) => {
    if (!file) return;
    const nextNonce = increment ? nonce + 1 : nonce;
    const name = generateName(file, p, nextNonce);
    setNonce(nextNonce);
    setNewName(name);
    setHistory((h) => [name, ...h].slice(0, 6));
    sfx("pop");
  };

  const handleFile = (f: File) => {
    setFile(f);
    setHistory([]);
    setPersonality("ceo");
    setNonce(0);
    const name = generateName(f, "ceo", 0);
    setNewName(name);
    setHistory([name]);
    recordToolUse(tool.id);
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> the download creates a genuine copy of your file under the
          new name via your browser's own download mechanism. Your original file is never renamed or
          touched. Everything here happens locally.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <FileDrop onFile={handleFile} file={file} label="Drop a file to be renamed by an intern" />

          <div className="card p-5">
            <p className="label">Choose a renaming personality</p>
            <div className="grid gap-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPersonality(p.id);
                    rename(p.id, false);
                  }}
                  className={`flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${
                    personality === p.id
                      ? "border-ink bg-zing-lime text-ink dark:border-cream"
                      : "border-ink/20 hover:border-ink dark:border-cream/20 dark:hover:border-cream"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {p.emoji}
                  </span>
                  <span>
                    <span className="block font-display font-bold">{p.name}</span>
                    <span className="block text-xs opacity-70">{p.blurb}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {file ? (
            <>
              <motion.div
                key={newName}
                initial={{ scale: 0.94, rotate: -1.5, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                className="card p-6"
              >
                <p className="label">Rename preview</p>
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border-2 border-ink/20 p-3 dark:border-cream/20">
                    <p className="text-xs uppercase tracking-wide opacity-60">Before</p>
                    <p className="break-all font-mono text-sm">{file.name}</p>
                  </div>
                  <div className="text-center text-2xl" aria-hidden>
                    ⬇️
                  </div>
                  <div className="rounded-2xl border-2 border-ink bg-zing-yellow p-3 text-ink">
                    <p className="text-xs uppercase tracking-wide opacity-70">After</p>
                    <p className="break-all font-mono text-sm font-bold">{newName}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm italic opacity-75">{pick(NOTES[personality])}</p>
              </motion.div>

              <div className="flex flex-wrap gap-3">
                <Btn variant="primary" sound="pop" onClick={() => rename(personality, true)}>
                  <RefreshCw size={18} /> Generate another name
                </Btn>
                <Btn
                  variant="purple"
                  sound="ding"
                  onClick={() => {
                    downloadBlob(file, newName);
                    pushToast({
                      title: "Renamed copy downloaded",
                      body: `${fileEmoji(file)} ${newName}`,
                      tone: "success",
                      icon: "🏷️",
                    });
                  }}
                >
                  <Download size={18} /> Download renamed copy
                </Btn>
              </div>

              <Callout tone="info" title="Rename history">
                <ul className="space-y-1 font-mono text-xs">
                  {history.map((h, i) => (
                    <li key={h + i} className="flex items-center gap-2">
                      <Tags size={12} /> {h}
                    </li>
                  ))}
                </ul>
              </Callout>

              <div className="rounded-2xl border-2 border-ink/20 p-4 text-sm dark:border-cream/20">
                <p className="font-display font-bold">File facts</p>
                <p className="mt-1 opacity-75">
                  Size {formatBytes(file.size)} · Type {file.type || "unknown"} · Copy operations
                  performed on your device. The original keeps its name, its dignity, and its exact
                  byte count.
                </p>
              </div>
            </>
          ) : (
            <Callout tone="warn" title="No file yet">
              Upload something and we will apply the confident naming practices of an intern who has
              been given a deadline and no training.
            </Callout>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
