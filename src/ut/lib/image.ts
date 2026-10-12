/** Real, honest image manipulation using the Canvas API. */

/** Anything drawImage can take; lets us feed canvases back into the pipeline. */
export type ImageSource = HTMLImageElement | HTMLCanvasElement | ImageBitmap | HTMLVideoElement;

/** The "content" size of a source, regardless of which flavour it is. */
export function sourceSize(src: ImageSource): { width: number; height: number } {
  if (src instanceof HTMLImageElement) {
    return { width: src.naturalWidth, height: src.naturalHeight };
  }
  if (src instanceof HTMLVideoElement) {
    return { width: src.videoWidth, height: src.videoHeight };
  }
  return { width: src.width, height: src.height };
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return loadImageFromUrl(url).finally(() => {
    // The decoded image keeps its own copy, so we can release the URL.
    URL.revokeObjectURL(url);
  });
}

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

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png"): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The canvas declined to produce a blob."))),
      type,
      0.95,
    );
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read that blob."));
    reader.readAsDataURL(blob);
  });
}

export function fitWithin(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale), scale };
}

/** Real crop. Rect is in source-image pixel space. */
export function cropImage(
  src: ImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
): HTMLCanvasElement {
  const canvas = createCanvas(sw, sh);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable in this browser.");
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas;
}

/** Real blur. Optionally only within a rectangular region. */
export function blurImage(
  src: ImageSource,
  radius: number,
  region?: { x: number; y: number; w: number; h: number },
): HTMLCanvasElement {
  const size = sourceSize(src);
  const canvas = createCanvas(size.width, size.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable in this browser.");
  ctx.drawImage(src, 0, 0);
  const r = Math.max(0, radius);
  ctx.save();
  ctx.filter = `blur(${r}px)`;
  if (region) {
    ctx.beginPath();
    ctx.rect(region.x, region.y, region.w, region.h);
    ctx.clip();
    ctx.drawImage(src, 0, 0);
  } else {
    ctx.drawImage(src, 0, 0);
  }
  ctx.restore();
  return canvas;
}

/** Real nearest-neighbour upscale — the "enhance" joke, done honestly. */
export function scaleImage(
  src: ImageSource,
  factor: number,
  smooth = false,
): HTMLCanvasElement {
  const size = sourceSize(src);
  const w = Math.max(1, Math.round(size.width * factor));
  const h = Math.max(1, Math.round(size.height * factor));
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable in this browser.");
  ctx.imageSmoothingEnabled = smooth;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, w, h);
  return canvas;
}

/** Downscale with smoothing — used by the "honest enhance" pipeline. */
export function resizeToLongEdge(
  src: ImageSource,
  longEdge: number,
): HTMLCanvasElement {
  const size = sourceSize(src);
  const scale = longEdge / Math.max(size.width, size.height);
  const w = Math.max(1, Math.round(size.width * scale));
  const h = Math.max(1, Math.round(size.height * scale));
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, w, h);
  return canvas;
}