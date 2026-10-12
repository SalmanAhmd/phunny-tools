import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cog, Download, FileText, Play } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { FileDrop } from "../components/FileDrop";
import { Btn } from "../components/Btn";
import { Callout, ProgressBar } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { formatBytes, slugTitle } from "../lib/format";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { downloadText, copyToClipboard } from "../lib/download";
import { extractPdfText } from "../lib/pdf";
import { CONVERSIONS, convert, type ConversionId } from "../lib/pdfJokes";
import { randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("pdf-to-whatever")!;

const MACHINE_LINES = [
  "Warming the conversion apparatus…",
  "Feeding the document into the chute…",
  "Unnecessarily spinning gears…",
  "Emitting tasteful smoke…",
  "Consulting the manual (there is no manual)…",
  "Preparing results of no practical value…",
];

export default function PdfToWhatever() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [extracted, setExtracted] = useState<string>("");
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [conversion, setConversion] = useState<ConversionId>("emotional");
  const [running, setRunning] = useState(false);
  const [percent, setPercent] = useState(0);
  const [line, setLine] = useState(MACHINE_LINES[0]);
  const [output, setOutput] = useState<string | null>(null);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  const handleFile = async (f: File) => {
    setFile(f);
    setOutput(null);
    setReadError(null);
    setExtracted("");
    setPageCount(0);
    recordToolUse(tool.id);

    if (!/\.pdf$/i.test(f.name)) {
      setReadError(
        "That is not a PDF. We salute the confidence, but we cannot extract text from it. We will invent some anyway.",
      );
      return;
    }

    setReading(true);
    try {
      const result = await extractPdfText(f, 12);
      setPageCount(result.numPages);
      setExtracted(result.text);
      if (!result.text.trim()) {
        setReadError(
          `This PDF has ${result.numPages} page(s) but no extractable text — it is most likely a scan or a picture of a document. We have therefore invented its contents, which is honestly an improvement.`,
        );
      }
    } catch {
      setReadError(
        "pdf.js could not read that file. It may be corrupted, encrypted, or simply unwilling. We shall proceed on vibes.",
      );
    } finally {
      setReading(false);
    }
  };

  const run = () => {
    if (!file || running) return;
    setRunning(true);
    setOutput(null);
    setPercent(0);
    sfx("whoosh");
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setPercent(Math.min(100, (i / MACHINE_LINES.length) * 100));
      setLine(MACHINE_LINES[Math.min(i, MACHINE_LINES.length - 1)]);
      sfx("tick");
      if (i >= MACHINE_LINES.length) {
        window.clearInterval(timer);
        setRunning(false);
        setOutput(convert(conversion, extracted || "This document contained no extractable text.", file.name, pageCount || randInt(2, 18)));
        sfx("success");
        pushToast({
          title: "Conversion complete (emotionally)",
          body: "No file format was changed. Your PDF is exactly where you left it.",
          tone: "success",
          icon: "🎩",
        });
      }
    }, 520);
  };

  const active = CONVERSIONS.find((c) => c.id === conversion)!;

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> we <em>do</em> genuinely extract the real text from your
          PDF using pdf.js, entirely in your browser. What we do <em>not</em> do is convert your PDF
          into another format. The output is a joke document. Your original is untouched and is never
          uploaded.
        </span>
      }
    >
      {!file ? (
        <FileDrop
          accept="application/pdf,.pdf"
          onFile={handleFile}
          label="Drop a PDF into the conversion machine"
          hint="Text-based PDFs work best. Scanned PDFs get a full comedy substitute."
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          <div className="space-y-5">
            <div className="card flex items-center gap-4 p-4">
              <span className="text-4xl" aria-hidden>
                📕
              </span>
              <div className="min-w-0">
                <p className="break-all font-display font-bold">{file.name}</p>
                <p className="text-sm opacity-70">
                  {formatBytes(file.size)}
                  {pageCount > 0 ? ` · ${pageCount} page(s)` : ""}
                </p>
              </div>
              <Btn
                variant="ghost"
                size="sm"
                sound="pop"
                className="ml-auto shrink-0"
                onClick={() => {
                  setFile(null);
                  setOutput(null);
                }}
              >
                Swap
              </Btn>
            </div>

            {reading && (
              <Callout tone="info" title="Reading your PDF locally">
                Extracting real text with pdf.js. Nothing is transmitted. Your document stays on this
                device, which is more than most "free online converters" can promise.
              </Callout>
            )}

            {readError && (
              <Callout tone="warn" title="A note about your file">
                {readError}
              </Callout>
            )}

            {/* The conversion machine */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-ink bg-ink p-6 dark:border-cream">
              <div className="flex items-center justify-between">
                <div className="text-4xl" aria-hidden>
                  {running ? "🎰" : "⚙️"}
                </div>
                <div className="flex gap-2" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={running ? { opacity: [0.2, 1, 0.2] } : { opacity: 0.25 }}
                      transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.2 }}
                      className={`h-3 w-3 rounded-full ${
                        ["bg-zing-pink", "bg-zing-yellow", "bg-zing-lime"][i]
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-6">
                <Cog size={48} className={running ? "animate-spin-slow text-zing-yellow" : "text-cream/30"} />
                <Cog size={32} className={running ? "animate-spin-slow text-zing-orange" : "text-cream/20"} />
                <Cog size={56} className={running ? "animate-spin-slow text-zing-lime" : "text-cream/30"} />
              </div>

              <AnimatePresence>
                {running &&
                  [0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: -50, opacity: [0, 0.6, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.4 }}
                      className="absolute bottom-16 text-2xl"
                      style={{ left: `${25 + i * 20}%` }}
                      aria-hidden
                    >
                      💨
                    </motion.span>
                  ))}
              </AnimatePresence>

              <div className="mt-6">
                <ProgressBar percent={percent} label={running ? line : "The machine is idle and judgemental."} />
              </div>

              <Btn
                variant="primary"
                sound="whoosh"
                size="lg"
                className="mt-5 w-full"
                disabled={running}
                onClick={run}
              >
                <Play size={18} /> {running ? "Converting…" : "Run the conversion machine"}
              </Btn>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <p className="label">Choose a destination format</p>
              <div className="grid gap-2">
                {CONVERSIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setConversion(c.id);
                      setOutput(null);
                      sfx("click");
                    }}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-3 text-left text-sm transition-colors ${
                      conversion === c.id
                        ? "border-ink bg-zing-orange text-white dark:border-cream"
                        : "border-ink/20 hover:border-ink dark:border-cream/20 dark:hover:border-cream"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {c.emoji}
                    </span>
                    <span>
                      <span className="block font-display font-bold">{c.name}</span>
                      <span className="block text-xs opacity-80">{c.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {extracted && (
              <details className="card p-4 text-sm">
                <summary className="cursor-pointer font-display font-bold">
                  Peek at the text we really extracted ({extracted.length} characters)
                </summary>
                <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-xl border-2 border-ink/20 p-3 text-xs dark:border-cream/20">
                  {extracted.slice(0, 800)}
                  {extracted.length > 800 ? "…" : ""}
                </pre>
              </details>
            )}

            {output && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="card overflow-hidden"
              >
                <div className="flex items-center gap-2 border-b-2 border-ink bg-zing-purple px-4 py-2 text-white dark:border-cream">
                  <FileText size={16} />
                  <span className="font-display text-sm font-bold">
                    {active.emoji} {active.name}
                  </span>
                </div>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words p-4 text-xs">
                  {output}
                </pre>
                <div className="flex flex-wrap gap-3 border-t-2 border-ink p-4 dark:border-cream">
                  <Btn
                    variant="primary"
                    sound="ding"
                    onClick={() => {
                      downloadText(output, `${slugTitle(file.name.replace(/\.pdf$/i, ""))}_${conversion}.txt`);
                      pushToast({
                        title: "Joke report downloaded",
                        body: "It is a .txt file. It is not your PDF. That was never on the table.",
                        tone: "info",
                        icon: "📄",
                      });
                    }}
                  >
                    <Download size={18} /> Download joke report
                  </Btn>
                  <Btn
                    variant="ghost"
                    sound="pop"
                    onClick={async () => {
                      const ok = await copyToClipboard(output);
                      pushToast({
                        title: ok ? "Copied" : "Copy failed",
                        body: ok ? "Paste it somewhere it does not belong." : "The browser refused.",
                        tone: ok ? "success" : "danger",
                      });
                    }}
                  >
                    Copy
                  </Btn>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </ToolShell>
  );
}
