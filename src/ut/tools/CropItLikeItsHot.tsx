import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Scissors, Shuffle, Wand2 } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { FileDrop } from "../components/FileDrop";
import { ResultPanel } from "../components/ResultPanel";
import { Btn } from "../components/Btn";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { canvasToBlob, cropImage, loadImageFromFile } from "../lib/image";
import { blobToDataUrl } from "../lib/image";
import { downloadBlob } from "../lib/download";
import { pick, randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("crop-it-like-its-hot")!;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type HandleId = "nw" | "ne" | "sw" | "se" | "move";

const MODES: { id: string; label: string; joke: string }[] = [
  { id: "personality", label: "Crop the left half of the subject's personality", joke: "Their right side was doing all the work anyway." },
  { id: "sky", label: "Remove the sky (it looks suspicious)", joke: "Clouds: evasive. Removed." },
  { id: "pixel", label: "Crop until only one pixel remains", joke: "A single pixel. Framed. Alone. Perfect." },
  { id: "tiny", label: "Crop into a suspiciously small rectangle", joke: "Suspicious of what? Nobody will say." },
  { id: "background", label: "Emotionally crop out the background", joke: "The background and I are no longer speaking." },
  { id: "intern", label: "Let an imaginary intern decide", joke: "The intern has chosen. The intern is 19." },
];

const CAPTIONS = [
  "Cropped with total confidence. Framing: debatable.",
  "We removed the parts you weren't emotionally ready for.",
  "Now 100% more rectangular. You're welcome.",
  "The composition is bad on purpose. That's called a style.",
  "Some pixels were harmed. The survivors are filing a complaint.",
  "A bold crop. A braver crop than most.",
];

export default function CropItLikeItsHot() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [display, setDisplay] = useState({ w: 0, h: 0 });
  const [cropping, setCropping] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [caption, setCaption] = useState(CAPTIONS[0]);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ handle: HandleId; startX: number; startY: number; rect: Rect } | null>(null);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  const natural = useMemo(
    () => (img ? { w: img.naturalWidth, h: img.naturalHeight } : { w: 0, h: 0 }),
    [img],
  );

  // Measure the rendered image so the crop box matches what the user sees.
  const measure = useCallback(() => {
    const el = frameRef.current?.querySelector("img");
    if (el) setDisplay({ w: el.clientWidth, h: el.clientHeight });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, img]);

  const handleFile = async (f: File) => {
    try {
      const image = await loadImageFromFile(f);
      setFile(f);
      setImg(image);
      setResultUrl(null);
      setResultBlob(null);
      recordToolUse(tool.id);
    } catch (err) {
      pushToast({
        title: "Image refused to cooperate",
        body: err instanceof Error ? err.message : "Unknown image nonsense.",
        tone: "danger",
        icon: "🖼️",
      });
    }
  };

  // Initialise the crop box once we know the display size.
  useEffect(() => {
    if (display.w && display.h) {
      setRect({
        x: display.w * 0.15,
        y: display.h * 0.15,
        w: display.w * 0.7,
        h: display.h * 0.7,
      });
    }
  }, [display.w, display.h]);

  const clampRect = (r: Rect): Rect => {
    const min = 8;
    const w = Math.max(min, Math.min(r.w, display.w));
    const h = Math.max(min, Math.min(r.h, display.h));
    const x = Math.max(0, Math.min(r.x, display.w - w));
    const y = Math.max(0, Math.min(r.y, display.h - h));
    return { x, y, w, h };
  };

  // ---- dragging -----------------------------------------------------------
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !display.w) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const base = drag.rect;
      let next: Rect = { ...base };
      switch (drag.handle) {
        case "move":
          next = { ...base, x: base.x + dx, y: base.y + dy };
          break;
        case "nw":
          next = { x: base.x + dx, y: base.y + dy, w: base.w - dx, h: base.h - dy };
          break;
        case "ne":
          next = { x: base.x, y: base.y + dy, w: base.w + dx, h: base.h - dy };
          break;
        case "sw":
          next = { x: base.x + dx, y: base.y, w: base.w - dx, h: base.h + dy };
          break;
        case "se":
          next = { x: base.x, y: base.y, w: base.w + dx, h: base.h + dy };
          break;
      }
      setRect(clampRect(next));
    };
    const onUp = () => {
      if (dragRef.current) sfx("pop");
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display.w, display.h]);

  const startDrag = (handle: HandleId) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, rect };
    sfx("click");
  };

  // ---- modes --------------------------------------------------------------
  const applyMode = (id: string) => {
    if (!display.w) return;
    const { w, h } = display;
    let next: Rect;
    switch (id) {
      case "personality":
        next = { x: 0, y: h * 0.1, w: w * 0.5, h: h * 0.8 };
        break;
      case "sky":
        next = { x: w * 0.05, y: h * 0.38, w: w * 0.9, h: h * 0.6 };
        break;
      case "pixel":
        next = { x: w / 2, y: h / 2, w: 10, h: 10 };
        break;
      case "tiny":
        next = { x: w * 0.42, y: h * 0.42, w: w * 0.14, h: h * 0.14 };
        break;
      case "background":
        next = { x: w * 0.14, y: h * 0.12, w: w * 0.72, h: h * 0.76 };
        break;
      default:
        next = {
          x: randInt(0, Math.max(1, Math.floor(w * 0.5))),
          y: randInt(0, Math.max(1, Math.floor(h * 0.5))),
          w: randInt(Math.floor(w * 0.2), Math.floor(w * 0.6)),
          h: randInt(Math.floor(h * 0.2), Math.floor(h * 0.6)),
        };
    }
    sfx("boing");
    setRect(clampRect(next));
    pushToast({
      title: "Crop mode engaged",
      body: MODES.find((m) => m.id === id)?.joke,
      tone: "chaos",
      icon: "✂️",
    });
  };

  // ---- perform the real crop ---------------------------------------------
  const performCrop = async () => {
    if (!img || !display.w) return;
    setCropping(true);
    sfx("whoosh");
    await new Promise((r) => setTimeout(r, 900));
    try {
      const scaleX = natural.w / display.w;
      const scaleY = natural.h / display.h;
      const sx = Math.round(rect.x * scaleX);
      const sy = Math.round(rect.y * scaleY);
      const sw = Math.max(1, Math.round(rect.w * scaleX));
      const sh = Math.max(1, Math.round(rect.h * scaleY));
      const canvas = cropImage(img, sx, sy, sw, sh);
      const blob = await canvasToBlob(canvas);
      const url = await blobToDataUrl(blob);
      setResultBlob(blob);
      setResultUrl(url);
      setCaption(pick(CAPTIONS));
      sfx("success");
      pushToast({
        title: "Cropped. Actually cropped.",
        body: `${sw}×${sh} pixels survived.`,
        tone: "success",
        icon: "✂️",
      });
    } catch (err) {
      sfx("error");
      pushToast({
        title: "The scissors jammed",
        body: err instanceof Error ? err.message : "Unknown cropping disaster.",
        tone: "danger",
        icon: "🩹",
      });
    } finally {
      setCropping(false);
    }
  };

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> the crop is <em>real</em> — we use the Canvas API and
          your downloaded file contains exactly the region you selected. The silly mode names,
          wobbly handles and captions are the fiction. Nothing is uploaded anywhere.
        </span>
      }
    >
      {!file ? (
        <FileDrop
          accept="image/*"
          onFile={handleFile}
          label="Drop an image to crop badly, on purpose"
          hint="PNG, JPG, WebP, GIF… anything your browser can decode."
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5">
            <div
              ref={frameRef}
              className="relative select-none overflow-hidden rounded-3xl border-2 border-ink bg-ink/90 p-2 dark:border-cream"
            >
              <div className="relative mx-auto w-fit">
                <img
                  src={img?.src}
                  alt="The image you are about to treat disrespectfully"
                  className="max-h-[26rem] w-auto max-w-full rounded-2xl"
                  onLoad={measure}
                  draggable={false}
                />

                {/* Mask + crop frame */}
                <div
                  className="pointer-events-none absolute"
                  style={{
                    left: rect.x,
                    top: rect.y,
                    width: rect.w,
                    height: rect.h,
                    boxShadow: "0 0 0 9999px rgba(20,17,15,0.62)",
                  }}
                >
                  <div className="absolute inset-0 border-[3px] border-zing-lime" />
                  {/* rule-of-thirds helpers, because professionals use these */}
                  <div className="absolute left-1/3 top-0 h-full w-px bg-zing-lime/50" />
                  <div className="absolute left-2/3 top-0 h-full w-px bg-zing-lime/50" />
                  <div className="absolute top-1/3 left-0 h-px w-full bg-zing-lime/50" />
                  <div className="absolute top-2/3 left-0 h-px w-full bg-zing-lime/50" />
                </div>

                {/* Draggable move surface */}
                <div
                  className="absolute cursor-move"
                  style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
                  onPointerDown={startDrag("move")}
                  aria-hidden
                />

                {/* Handles — these are the ones with commitment issues */}
                {(["nw", "ne", "sw", "se"] as HandleId[]).map((h) => {
                  const positions: Record<string, React.CSSProperties> = {
                    nw: { left: rect.x - 10, top: rect.y - 10, cursor: "nwse-resize" },
                    ne: { left: rect.x + rect.w - 10, top: rect.y - 10, cursor: "nesw-resize" },
                    sw: { left: rect.x - 10, top: rect.y + rect.h - 10, cursor: "nesw-resize" },
                    se: { left: rect.x + rect.w - 10, top: rect.y + rect.h - 10, cursor: "nwse-resize" },
                  };
                  return (
                    <motion.button
                      key={h}
                      type="button"
                      aria-label={`Resize crop from the ${h} corner`}
                      onPointerDown={startDrag(h)}
                      whileHover={{ scale: 1.4, rotate: 20 }}
                      whileTap={{ scale: 0.8 }}
                      className="absolute z-20 h-5 w-5 rounded-md border-2 border-ink bg-zing-yellow shadow-pop-sm dark:border-cream"
                      style={positions[h]}
                    />
                  );
                })}

                <AnimatePresence>
                  {cropping && (
                    <motion.div
                      initial={{ x: "-20%", opacity: 0, rotate: -20 }}
                      animate={{ x: "120%", opacity: 1, rotate: 10 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: "easeInOut" }}
                      className="absolute top-1/2 z-30 text-5xl drop-shadow-lg"
                      aria-hidden
                    >
                      ✂️
                    </motion.div>
                  )}
                </AnimatePresence>

                {cropping && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink/30">
                    <p className="animate-wobble rounded-2xl border-2 border-ink bg-zing-lime px-4 py-2 font-display font-bold text-ink">
                      Cropping with confidence…
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Btn
                variant="primary"
                sound="pop"
                onClick={performCrop}
                disabled={cropping}
                className="bg-gradient-to-r from-zing-purple to-zing-pink"
              >
                <Wand2 size={18} /> Crop With Confidence
              </Btn>
              <Btn variant="ghost" sound="boing" onClick={() => applyMode("intern")}>
                <Shuffle size={18} /> Intern decides
              </Btn>
              <Btn
                variant="ghost"
                sound="click"
                onClick={() => {
                  setFile(null);
                  setImg(null);
                  setResultUrl(null);
                }}
              >
                New image
              </Btn>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <p className="label">Ridiculous crop modes</p>
              <div className="grid gap-2">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => applyMode(mode.id)}
                    className="group flex items-start gap-3 rounded-2xl border-2 border-ink/20 p-3 text-left text-sm transition-colors hover:border-ink hover:bg-zing-yellow/30 dark:border-cream/20 dark:hover:border-cream"
                    title={mode.joke}
                  >
                    <Scissors size={16} className="mt-0.5 shrink-0 opacity-60" />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Callout tone="info" title="Crop box coordinates">
              In case you were curious (you were not): x {Math.round(rect.x)} · y{" "}
              {Math.round(rect.y)} · {Math.round(rect.w)}×{Math.round(rect.h)} display pixels. The
              real crop is computed against the {natural.w}×{natural.h} original.
            </Callout>

            {resultUrl && resultBlob && (
              <ResultPanel
                tone="pink"
                title="Crop complete"
                subtitle={caption}
                rows={[
                  { label: "Original dimensions", value: `${natural.w} × ${natural.h}` },
                  { label: "Cropped dimensions", value: `${Math.round(rect.w * (natural.w / display.w))} × ${Math.round(rect.h * (natural.h / display.h))}`, emphasis: true },
                  { label: "Pixels discarded", value: "Yes, without ceremony" },
                  { label: "Confidence level", value: "Misplaced but high" },
                ]}
                footer={
                  <div className="flex flex-wrap items-center gap-4">
                    <img
                      src={resultUrl}
                      alt="The cropped result"
                      className="h-20 w-20 rounded-xl border-2 border-ink object-cover dark:border-cream"
                    />
                    <Btn
                      variant="primary"
                      sound="ding"
                      onClick={() => {
                        downloadBlob(resultBlob, `cropped-${file.name.replace(/\.[^.]+$/, "")}.png`);
                        pushToast({
                          title: "Downloaded",
                          body: "A genuine crop. Terrifying. Real.",
                          tone: "success",
                          icon: "💾",
                        });
                      }}
                    >
                      <Download size={18} /> Download cropped image
                    </Btn>
                  </div>
                }
              />
            )}
          </div>
        </div>
      )}
    </ToolShell>
  );
}
