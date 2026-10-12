/**
 * Real, honest image manipulation using the Canvas API.
 * The tools may be a joke, but the pixels actually move.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Load an image element from any src (data URL or object URL). */
export function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That image refused to load. Typical."));
    img.src = src;
  });
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

/** Crop an image (data URL) to the given rectangle. Returns a PNG data URL. */
export async function cropImage(src: string, rect: Rect): Promise<string> {
  const img = await loadImageFromUrl(src);
  const w = Math.max(1, Math.round(rect.w));
  const h = Math.max(1, Math.round(rect.h));
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas privileges revoked.");
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, -Math.round(rect.x), -Math.round(rect.y));
  return canvas.toDataURL("image/png");
}

export type BlurRegion = "all" | "center" | "edges" | "pixelate";

/** Blur (or aggressively pixelate) an image. Also real. Witness protection not included. */
export async function blurImage(src: string, strength: number, region: BlurRegion): Promise<string> {
  const img = await loadImageFromUrl(src);
  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas privileges revoked.");
  const { naturalWidth: w, naturalHeight: h } = img;

  ctx.drawImage(img, 0, 0);

  if (region === "pixelate") {
    // Blocky pixelation: scale down hard, then scale back up with smoothing off.
    const block = Math.max(2, Math.round(strength));
    const small = createCanvas(Math.max(1, Math.round(w / block)), Math.max(1, Math.round(h / block)));
    const sctx = small.getContext("2d");
    if (!sctx) throw new Error("Canvas privileges revoked for the thumbnail.");
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(img, 0, 0, small.width, small.height);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(small, 0, 0, w, h);
    return canvas.toDataURL("image/png");
  }

  // Classic gaussian-ish blur: draw a scaled-down copy, then stretch it back.
  const factor = Math.max(2, Math.round(strength / 4) + 2);
  const softW = Math.max(1, Math.round(w / factor));
  const softH = Math.max(1, Math.round(h / factor));
  const soft = createCanvas(softW, softH);
  const sctx = soft.getContext("2d");
  if (!sctx) throw new Error("Canvas privileges revoked for the softening stage.");
  sctx.drawImage(img, 0, 0, softW, softH);
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = 1;
  ctx.drawImage(soft, 0, 0, softW, softH, 0, 0, w, h);

  if (region === "center") {
    // Restore an unnaturally sharp centre slice, because we are professionals.
    const cx = w * 0.5;
    const cy = h * 0.5;
    const cw = Math.max(1, w * 0.3);
    const ch = Math.max(1, h * 0.3);
    ctx.drawImage(img, cx - cw / 2, cy - ch / 2, cw, ch, cx - cw / 2, cy - ch / 2, cw, ch);
  } else if (region === "edges") {
    // Sharp oval in the middle, blur around it — the classic ID-card look.
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(soft, 0, 0, softW, softH, 0, 0, w, h);
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.34, h * 0.42, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

/** Scale an image up by a factor. Genuinely larger; no new information is added. */
export async function enhanceImage(src: string, scale: number): Promise<string> {
  const img = await loadImageFromUrl(src);
  const outW = Math.max(1, Math.round(img.naturalWidth * scale));
  const outH = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = createCanvas(outW, outH);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas privileges revoked.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, outW, outH);
  return canvas.toDataURL("image/png");
}

/** Sample the average pixel colour so the detective can report on the evidence. */
export async function canvasToPixelSample(
  src: string,
): Promise<{ label: string; avg: string }> {
  const img = await loadImageFromUrl(src);
  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas privileges revoked.");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  let r = 0;
  let g = 0;
  let b = 0;
  const step = Math.max(1, Math.floor(data.length / 4 / 8000));
  let counted = 0;
  for (let i = 0; i < data.length; i += 4 * step) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    counted += 1;
  }
  const avg = (n: number) => Math.round(n / Math.max(1, counted));
  const rr = avg(r);
  const gg = avg(g);
  const bb = avg(b);
  const nearest: Array<[string, [number, number, number]]> = [
    ["an alarming red", [220, 40, 30]],
    ["a corporate orange", [255, 106, 0]],
    ["unearned lemon yellow", [255, 212, 0]],
    ["suspicious lime green", [180, 230, 0]],
    ["a grape-coloured mystery", [124, 58, 237]],
    ["business-casual pink", [255, 79, 163]],
    ["depression blue", [40, 90, 200]],
    ["a shade of absence", [20, 20, 22]],
  ];
  let best = nearest[0];
  let bestDist = Infinity;
  for (const [name, [cr, cg, cb]] of nearest) {
    const d = (rr - cr) ** 2 + (gg - cg) ** 2 + (bb - cb) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = [name, [cr, cg, cb]];
    }
  }
  return { label: `Dominant colour: ${best[0]}`, avg: `rgb(${rr}, ${gg}, ${bb})` };
}