import { useEffect, useRef, useState } from "react";
import { Download, EyeOff, Sparkles } from "lucide-react";
import { ToolShell } from "../components/ToolShell";
import { FileDrop } from "../components/FileDrop";
import { Btn } from "../components/Btn";
import { Callout } from "../components/bits";
import { TOOL_BY_ID } from "../lib/registry";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import {
  blurImage,
  canvasToBlob,
  createCanvas,
  loadImageFromFile,
  resizeToLongEdge,
  sourceSize,
  type ImageSource,
} from "../lib/image";
import { downloadBlob } from "../lib/download";
import { randInt } from "../lib/random";

const tool = TOOL_BY_ID.get("professional-blur")!;

type ModeId = "except" | "backgrounds-background" | "forget" | "corporate" | "witness";

const MODES: { id: ModeId; label: string; description: string; radius: number }[] = [
  {
    id: "except",
    label: "Blur everything except the least important thing",
    description: "We choose the least important region with proprietary indifference technology.",
    radius: 16,
  },
  {
    id: "backgrounds-background",
    label: "Blur the background's background",
    description: "A blur applied to the blur. Semantically bold. Visually mush.",
    radius: 26,
  },
  {
    id: "forget",
    label: "Blur so much that even you forget what it was",
    description: "An aggressive commitment to memory loss.",
    radius: 48,
  },
  {
    id: "corporate",
    label: "Corporate privacy mode",
    description: "Nothing sensitive visible, nothing meaningful either. Very on-brand.",
    radius: 14,
  },
  {
    id: "witness",
    label: "Make it look like a witness protection photograph",
    description: "Heavy blur, drained colour, faint urban menace.",
    radius: 34,
  },
];

function renderBlur(
  src: ImageSource,
  mode: ModeId,
  radius: number,
): HTMLCanvasElement {
  const size = sourceSize(src);
  let canvas = blurImage(src, radius);

  if (mode === "except") {
    // Blurred base + one deliberately unblurred rectangle.
    const sharpW = Math.round(size.width * (0.14 + Math.random() * 0.1));
    const sharpH = Math.round(size.height * (0.14 + Math.random() * 0.1));
    const x = randInt(0, Math.max(1, size.width - sharpW));
    const y = randInt(0, Math.max(1, size.height - sharpH));
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.save();
      ctx.filter = "none";
      ctx.drawImage(src, x, y, sharpW, sharpH, x, y, sharpW, sharpH);
      ctx.strokeStyle = "rgba(182,240,46,0.9)";
      ctx.lineWidth = Math.max(2, size.width * 0.004);
      ctx.strokeRect(x, y, sharpW, sharpH);
      ctx.restore();
    }
  }

  if (mode === "backgrounds-background") {
    // Blur the already-blurred result. Twice the mush, none of the meaning.
    const second = createCanvas(canvas.width, canvas.height);
    const sctx = second.getContext("2d");
    if (sctx) {
      sctx.filter = `blur(${Math.round(radius / 2)}px)`;
      sctx.drawImage(canvas, 0, 0);
    }
    canvas = second;
  }

  if (mode === "witness") {
    const out = createCanvas(canvas.width, canvas.height);
    const ctx = out.getContext("2d");
    if (ctx) {
      ctx.filter = "grayscale(0.75) contrast(0.92) brightness(0.92)";
      ctx.drawImage(canvas, 0, 0);
    }
    canvas = out;
  }

  return canvas;
}

export default function ProfessionalBlur() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<ModeId>("except");
  const [radius, setRadius] = useState(16);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const debounce = useRef<number | null>(null);
  const prevUrl = useRef<string | null>(null);
  const { recordToolUse } = useStats();
  const { pushToast } = useUI();

  const handleFile = async (f: File) => {
    try {
      const image = await loadImageFromFile(f);
      setFile(f);
      setImg(image);
      setOutputUrl(null);
      recordToolUse(tool.id);
    } catch (err) {
      pushToast({
        title: "That image would not load",
        body: err instanceof Error ? err.message : "Unknown image problem.",
        tone: "danger",
        icon: "🫥",
      });
    }
  };

  const apply = async (overrideRadius?: number, overrideMode?: ModeId, preview = false) => {
    if (!img) return;
    const r = overrideRadius ?? radius;
    const m = overrideMode ?? mode;
    setBusy(true);
    await new Promise((res) => setTimeout(res, 260));
    try {
      const source = preview ? resizeToLongEdge(img, 900) : img;
      const canvas = renderBlur(source, m, r);
      const blob = await canvasToBlob(canvas);
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
      const url = URL.createObjectURL(blob);
      prevUrl.current = url;
      setOutputUrl(url);
      if (!preview) setOutputBlob(blob);
      sfx("pop");
    } catch (err) {
      pushToast({
        title: "The blur department is overwhelmed",
        body: err instanceof Error ? err.message : "Unknown blur incident.",
        tone: "danger",
        icon: "💨",
      });
    } finally {
      setBusy(false);
    }
  };

  // Auto-preview when settings change (debounced, so we stay performant).
  useEffect(() => {
    if (!img) return;
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => void apply(undefined, undefined, true), 320);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, mode, radius]);

  const selected = MODES.find((m) => m.id === mode)!;

  return (
    <ToolShell
      tool={tool}
      disclosure={
        <span>
          <strong>Honesty notice:</strong> the blur is completely real — it is a genuine Canvas
          filter applied to a copy of your image, and the download contains that blurred result. Only
          the bureaucratic tone is fictional.
        </span>
      }
    >
      {!file ? (
        <FileDrop accept="image/*" onFile={handleFile} label="Upload an image for professional obscuring" />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <div className="card overflow-hidden">
              <div className="grid sm:grid-cols-2">
                <div className="relative border-b-2 border-ink sm:border-b-0 sm:border-r-2 dark:border-cream">
                  <span className="absolute left-3 top-3 z-10 chip bg-white text-ink">Before</span>
                  <img src={img?.src} alt="Original" className="h-64 w-full object-contain bg-cream-deep dark:bg-ink-night" />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-3 z-10 chip bg-zing-purple text-white">After</span>
                  {outputUrl ? (
                    <img src={outputUrl} alt="Blurred result" className="h-64 w-full object-contain bg-cream-deep dark:bg-ink-night" />
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-cream-deep dark:bg-ink-night">
                      <span className="animate-wobble text-3xl">🌫️</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-5">
              <label className="label" htmlFor="blur-radius">
                Manual blur intensity — {radius}px
              </label>
              <input
                id="blur-radius"
                type="range"
                min={1}
                max={60}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-zing-purple"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <Btn
                  variant="primary"
                  sound="ding"
                  disabled={busy}
                  onClick={async () => {
                    await apply(undefined, undefined, false);
                    pushToast({
                      title: "Blur applied for real",
                      body: `Radius ${radius}px. Recognisability: compromised.`,
                      tone: "success",
                      icon: "🌫️",
                    });
                  }}
                >
                  <Sparkles size={18} /> {busy ? "Obscuring…" : "Apply for real"}
                </Btn>
                <Btn
                  variant="ghost"
                  sound="pop"
                  onClick={() => {
                    setFile(null);
                    setImg(null);
                    setOutputUrl(null);
                  }}
                >
                  New image
                </Btn>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <p className="label">Departmental blur programmes</p>
              <div className="grid gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id);
                      setRadius(m.radius);
                      sfx("click");
                      void apply(m.radius, m.id, false);
                    }}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-3 text-left text-sm transition-colors ${
                      mode === m.id
                        ? "border-ink bg-zing-purple text-white dark:border-cream"
                        : "border-ink/20 hover:border-ink dark:border-cream/20 dark:hover:border-cream"
                    }`}
                  >
                    <EyeOff size={16} className="mt-0.5 shrink-0 opacity-70" />
                    <span>
                      <span className="block font-display font-bold">{m.label}</span>
                      <span className="block text-xs opacity-75">{m.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Callout tone="info" title="Blur report">
              Programme: <strong>{selected.label}</strong>. Radius: {radius}px. Pixels consulted: all
              of them. Pixels satisfied: unclear. The output is a genuine image file; blur cannot be
              reversed by us or by anyone else, which is the entire point of blurring.
            </Callout>

            {outputBlob && (
              <Btn
                variant="purple"
                sound="ding"
                onClick={() => {
                  downloadBlob(outputBlob, `blurred-${file.name.replace(/\.[^.]+$/, "")}.png`);
                  pushToast({
                    title: "Downloaded",
                    body: "Nobody will ever know what that was.",
                    tone: "success",
                    icon: "💾",
                  });
                }}
              >
                <Download size={18} /> Download blurred image
              </Btn>
            )}
          </div>
        </div>
      )}
    </ToolShell>
  );
}
