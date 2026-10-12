import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RotateCcw, ScanSearch, ZoomIn } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { FileDrop } from "../components/FileDrop";
import { ResultPanel } from "../components/ResultPanel";
import { Btn } from "../components/Btn";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import {
  blobToDataUrl,
  canvasToBlob,
  loadImageFromFile,
  resizeToLongEdge,
  scaleImage,
} from "../lib/image";
import { downloadBlob } from "../lib/download";
import { formatBytes } from "../lib/format";

const tool = TOOL_BY_ID.get("screenshot-enhancer")!;

const MAX_LONG_EDGE = 8192; // browser-safety cap for the 8× crime scene
const LENS_SIZE = 132;
const LENS_ZOOM = 2.6;

const FACTORS = [
  { value: 2, label: "2×", joke: "Emboldened but delusional." },
  { value: 4, label: "4×", joke: "Now with 4× the placebo." },
  { value: 8, label: "8×", joke: "At this point it's a crime scene." },
];

const VERDICTS = [
  "No new detail was found. Not a single pixel confessed.",
  "The image has been enhanced into a different kind of blur.",
  "Enhancement complete. The photo is now larger AND less legible.",
  "Forensics note: your screenshot remains exactly as mysterious.",
  "Zoomed, sharpened, and ultimately forgiven by nobody.",
  "The pixels are bigger now. That's called progress here.",
];

interface Result {
  url: string;
  blob: Blob;
  width: number;
  height: number;
  factor: number;
  verdict: string;
}

export default function ScreenshotEnhancer() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [factor, setFactor] = useState(2);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [lens, setLens] = useState<{ x: number; y: number; on: boolean }>({ x: 0, y: 0, on: false });
  const stageRef = useRef<HTMLDivElement>(null);
  const { recordToolUse, recordButtonClick } = useStats();
  const { pushToast, fireConfetti } = useUI();

  // The on-screen stage size: fit the image into this box, downscaled.
  const view = useMemo(() => {
    if (!img) return { w: 0, h: 0, scale: 0 };
    const maxW = 680;
    const maxH = 420;
    const s = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
    return { w: Math.round(img.naturalWidth * s), h: Math.round(img.naturalHeight * s), scale: s };
  }, [img]);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  const handleFile = async (f: File) => {
    try {
      const image = await loadImageFromFile(f);
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      setFile(f);
      setImg(image);
      setSourceUrl(URL.createObjectURL(f));
      setResult(null);
      setLens({ x: 0, y: 0, on: false });
      recordToolUse(tool.id);
      sfx("pop");
      pushToast({
        title: "Evidence accepted",
        body: "Your screenshot has been entered into a very serious case file.",
        tone: "info",
        icon: "🕵️",
      });
    } catch (err) {
      pushToast({
        title: "Image refused to cooperate",
        body: err instanceof Error ? err.message : "Unknown image nonsense.",
        tone: "danger",
        icon: "🖼️",
      });
    }
  };

  const enhance = async (f: number) => {
    if (!img) return;
    recordButtonClick();
    setWorking(true);
    sfx("whoosh");
    await new Promise((r) => setTimeout(r, 700)); // dramatic pause; the crop below is real

    // Keep the "8×" promise without detonating the browser: cap the long edge.
    const capped =
      Math.min(f, MAX_LONG_EDGE / Math.max(img.naturalWidth, img.naturalHeight)) || 1;
    const canvas = scaleImage(img, capped, false);

    let blob: Blob;
    let url: string;
    try {
      blob = await canvasToBlob(canvas);
      url = await blobToDataUrl(blob);
    } catch (err) {
      setWorking(false);
      pushToast({
        title: "Canvas declined",
        body: err instanceof Error ? err.message : "The pixels refused to be processed.",
        tone: "danger",
        icon: "💾",
      });
      return;
    }
    setWorking(false);
    setResult({
      url,
      blob,
      width: canvas.width,
      height: canvas.height,
      factor: capped,
      verdict: VERDICTS[Math.floor(Math.random() * VERDICTS.length)],
    });
    sfx("success");
    fireConfetti();
  };

  const honestRefine = async () => {
    // Real, honest pipeline: upscale with pixels, then refocus back to a
    // more modest size. The result is a slightly different, slightly softer
    // picture — exactly the "enhanced" screenshot the department promises.
    if (!img) return;
    recordButtonClick();
    setWorking(true);
    sfx("whoosh");
    await new Promise((r) => setTimeout(r, 900));

    const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
    const bigger = scaleImage(img, 3, false);
    const refined = resizeToLongEdge(bigger, longEdge);
    let blob: Blob;
    let url: string;
    try {
      blob = await canvasToBlob(refined);
      url = await blobToDataUrl(blob);
    } catch (err) {
      setWorking(false);
      pushToast({
        title: "Refinement failed gloriously",
        body: err instanceof Error ? err.message : "The pixels have unionised.",
        tone: "danger",
        icon: "🌀",
      });
      return;
    }
    setWorking(false);
    setResult({
      url,
      blob,
      width: refined.width,
      height: refined.height,
      factor: 1,
      verdict: "Refined honestly: same size, fresh blur. That's the department's speciality.",
    });
    sfx("ding");
    fireConfetti();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setLens({ x: e.clientX - rect.left, y: e.clientY - rect.top, on: true });
  };

  const pixelsCreated = result
    ? Math.max(0, result.width * result.height - (img?.naturalWidth ?? 0) * (img?.naturalHeight ?? 0))
    : 0;

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice (read in a dramatic whisper):</strong> There is nothing hidden in
          your screenshot. Zooming and resizing are real — recovering detail is impossible, and we
          would never claim otherwise. Everything stays on your device. Case closed.
        </span>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
        <div className="space-y-6">
          <FileDrop
            accept="image/*"
            onFile={handleFile}
            file={file}
            hint="PNG, JPG, WebP… anything blurry and deeply important."
          />

          <div className="rounded-2xl border-2 border-ink bg-ink px-4 py-3 font-mono text-sm text-zing-lime dark:border-cream">
            <span className="mr-2 text-zing-orange">{"CASE #0047"}</span>
            {file
              ? `suspect: "${file.name}" · ${formatBytes(file.size)} · zoom: ${LENS_ZOOM}×`
              : "awaiting evidence… (an image)"}
          </div>

          {img && (
            <div className="space-y-2">
              <p className="font-display text-sm font-bold">Enhancement factor</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Enhancement factor">
                {FACTORS.map((f) => (
                  <Btn
                    key={f.value}
                    variant={factor === f.value ? "purple" : "ghost"}
                    size="sm"
                    sound="tick"
                    onClick={() => {
                      setFactor(f.value);
                      sfx("tick");
                    }}
                    aria-pressed={factor === f.value}
                  >
                    {f.label}
                  </Btn>
                ))}
              </div>
              <p className="min-h-[1rem] text-xs opacity-60 italic">
                {FACTORS.find((f) => f.value === factor)?.joke}
              </p>
            </div>
          )}

          <Callout tone="info" title="How zooming works here">
            The magnifying glass is honest: it shows the same pixels, bigger. No hidden detail, no
            inserted faces in bushes, no confession.
          </Callout>
        </div>

        {/* the evidence theatre + magnifying lens */}
        <div className="space-y-6">
          <div
            ref={stageRef}
            onPointerMove={img ? onPointerMove : undefined}
            onPointerLeave={() => setLens((l) => ({ ...l, on: false }))}
            className="relative flex min-h-[24rem] items-center justify-center overflow-hidden rounded-3xl border-2 border-ink bg-gradient-to-b from-white to-cream-deep p-6 dark:border-cream dark:from-ink-soft dark:to-ink-night"
          >
            {img && sourceUrl ? (
              <div
                className="relative"
                style={{ width: view.w, height: view.h }}
                role="img"
                aria-label="Your screenshot, under investigation"
              >
                <img
                  src={sourceUrl}
                  alt=""
                  draggable={false}
                  className="h-full w-full select-none"
                  style={{ width: view.w, height: view.h }}
                />

                <AnimatePresence>
                  {lens.on && view.w > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ type: "spring", stiffness: 400, damping: 24 }}
                      className="pointer-events-none absolute z-10 overflow-hidden rounded-full border-4 border-ink shadow-pop"
                      style={{
                        left: lens.x - LENS_SIZE / 2,
                        top: lens.y - LENS_SIZE / 2,
                        width: LENS_SIZE,
                        height: LENS_SIZE,
                      }}
                      aria-hidden
                    >
                      <img
                        src={sourceUrl}
                        alt=""
                        draggable={false}
                        style={{
                          position: "absolute",
                          left: -(lens.x * LENS_ZOOM - LENS_SIZE / 2),
                          top: -(lens.y * LENS_ZOOM - LENS_SIZE / 2),
                          width: view.w * LENS_ZOOM,
                          height: view.h * LENS_ZOOM,
                          maxWidth: "none",
                        }}
                      />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border-2 border-ink bg-zing-yellow px-2 font-display text-[10px] font-bold text-ink">
                        {LENS_ZOOM}×
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center opacity-60">
                <p className="text-6xl" aria-hidden>
                  🔍
                </p>
                <p className="mt-3 font-display font-bold">The evidence board is empty</p>
                <p className="text-sm">Upload a screenshot to begin the investigation.</p>
              </div>
            )}

            {img && (
              <div className="absolute bottom-3 right-3 flex gap-1.5" aria-hidden>
                <ZoomIn size={16} className="opacity-60" />
                <span className="font-mono text-xs opacity-60">
                  {img.naturalWidth}×{img.naturalHeight} — on screen: {view.w}×{view.h}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Btn
              variant="primary"
              size="lg"
              sound="whoosh"
              disabled={!img || working}
              className="w-full bg-gradient-to-r from-zing-purple to-zing-pink font-display sm:w-auto"
              onClick={() => enhance(factor)}
            >
              <ScanSearch size={20} /> {working ? "ENHANCING…" : "ENHANCE"}
            </Btn>
            <Btn variant="ghost" sound="boing" disabled={!img || working} onClick={honestRefine}>
              Refine honestly (yes it's a joke)
            </Btn>
            <Btn
              variant="ghost"
              sound="pop"
              disabled={!img}
              onClick={() => {
                sfx("pop");
                setResult(null);
              }}
            >
              <RotateCcw size={18} /> Clear result
            </Btn>
          </div>
        </div>
      </div>

      {result && img && (
        <div className="mt-10">
          <div className="mb-4 overflow-hidden rounded-3xl border-2 border-ink bg-ink p-3 dark:border-cream">
            <motion.img
              key={result.url}
              src={result.url}
              alt="Your enhanced screenshot"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="mx-auto max-h-[26rem] w-auto rounded-2xl border border-cream/20"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          <ResultPanel
            tone="purple"
            title="Forensic Enhancement Report"
            subtitle={result.verdict}
            rows={[
              { label: "Original dimensions", value: `${img.naturalWidth}×${img.naturalHeight}` },
              {
                label: "Enhanced dimensions",
                value: `${result.width}×${result.height}`,
                emphasis: result.factor > 1,
              },
              {
                label: "Applied factor",
                value: result.factor > 1 ? `${result.factor}× (nearest-neighbour, honest)` : "refinement pass",
              },
              {
                label: "New detail produced",
                value: result.factor > 1 ? "0 pixels — confirmed by maths" : "0 pixels — also maths",
                emphasis: false,
              },
              {
                label: "Equivalent new pixels",
                value: `${pixelsCreated.toLocaleString()} (all duplicates)`,
              },
              { label: "Image modified", value: "A copy. Original untouched." },
            ]}
            footer={
              <div className="flex flex-wrap items-center gap-3">
                <Btn
                  variant="primary"
                  sound="ding"
                  onClick={() => {
                    const isOriginal = result.factor <= 1 && result.width === img.naturalWidth;
                    downloadBlob(result.blob, isOriginal ? "enhanced-softer.png" : "enhanced.png");
                    recordButtonClick();
                    pushToast({
                      title: "Enhanced artifact downloaded",
                      body: "Frame it. It is now evidence.",
                      tone: "success",
                      icon: "🖼️",
                    });
                  }}
                >
                  <Download size={18} /> Download enhanced result
                </Btn>
                <Btn
                  variant="ghost"
                  sound="ding"
                  onClick={() => {
                    downloadBlob(file as File, file?.name ?? "screenshot.png");
                    pushToast({
                      title: "Original downloaded",
                      body: "Byte-for-byte untouched. The department respects chain of custody.",
                      tone: "info",
                      icon: "🗂️",
                    });
                  }}
                >
                  <Download size={18} /> Download the original
                </Btn>
              </div>
            }
          />
        </div>
      )}
    </ToolShell>
  );
}