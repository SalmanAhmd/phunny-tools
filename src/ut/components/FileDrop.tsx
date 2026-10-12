import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { fileExtension, formatBytes } from "../lib/format";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { Btn } from "./Btn";

export function fileEmoji(file: File | { name: string }): string {
  const name = "name" in file ? file.name : "";
  const ext = fileExtension(name);
  if (["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "svg"].includes(ext)) return "🖼️";
  if (ext === "pdf") return "📕";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "🗜️";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "🎵";
  if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) return "🎬";
  if (["xls", "xlsx", "csv", "numbers"].includes(ext)) return "📊";
  if (["doc", "docx", "pages", "rtf", "txt", "md"].includes(ext)) return "📄";
  if (["ppt", "pptx", "key"].includes(ext)) return "📽️";
  if (["js", "ts", "tsx", "jsx", "py", "rb", "go", "rs", "java", "json"].includes(ext)) return "🧑‍💻";
  return "📦";
}

export interface FileDropProps {
  accept?: string;
  maxSizeMB?: number;
  onFile: (file: File) => void;
  file?: File | null;
  hint?: ReactNode;
  label?: string;
  /** Extra validation beyond the accept attribute. */
  validate?: (file: File) => string | null;
  compact?: boolean;
}

export function FileDrop({
  accept,
  maxSizeMB = 40,
  onFile,
  file,
  hint,
  label = "Drop a file here",
  validate,
  compact,
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { pushToast } = useUI();

  const handleFile = (candidate: File | undefined) => {
    if (!candidate) return;
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (candidate.size > maxBytes) {
      sfx("error");
      pushToast({
        title: "That file is enormous",
        body: `${formatBytes(candidate.size)} exceeds our generous ${maxSizeMB} MB limit.`,
        tone: "danger",
        icon: "🫸",
      });
      return;
    }
    const problem = validate?.(candidate);
    if (problem) {
      sfx("error");
      pushToast({ title: "We can't use that", body: problem, tone: "danger", icon: "🚫" });
      return;
    }
    sfx("pop");
    onFile(candidate);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`relative rounded-3xl border-2 border-dashed p-6 text-center transition-colors ${
          dragging
            ? "border-zing-orange bg-zing-orange/10"
            : "border-ink/40 bg-white/60 dark:border-cream/40 dark:bg-ink-soft/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {file ? (
          <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <span className={`text-5xl ${compact ? "" : "animate-float-y"}`} aria-hidden>
              {fileEmoji(file)}
            </span>
            <div>
              <p className="break-all font-display font-bold">{file.name}</p>
              <p className="text-sm opacity-70">
                {formatBytes(file.size)} · {file.type || fileExtension(file.name) || "mystery"}
              </p>
            </div>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => inputRef.current?.click()}
              aria-label="Choose a different file"
            >
              Swap file
            </Btn>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl" aria-hidden>
              📥
            </span>
            <p className="font-display text-lg font-bold">{label}</p>
            <p className="text-sm opacity-70">
              {accept ? `Accepts ${accept}. ` : ""}Max {maxSizeMB} MB. Stays on your device.
            </p>
            <Btn variant="purple" onClick={() => inputRef.current?.click()}>
              Choose file
            </Btn>
          </div>
        )}
      </div>
      {hint && <div className="mt-3 text-xs opacity-70">{hint}</div>}
    </div>
  );
}
