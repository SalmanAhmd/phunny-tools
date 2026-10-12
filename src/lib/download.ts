/** Download + file-reading helpers. Everything stays local; nothing leaves the browser. */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadText(text: string, filename: string, mime = "text/plain"): void {
  downloadBlob(new Blob([text], { type: `${mime};charset=utf-8` }), filename);
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  triggerDownload(dataUrl, filename);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Read a File as a data URL (used by the image tools for real canvas work). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("That file refused to be read. Typical."));
    reader.readAsDataURL(file);
  });
}

/** Read a File as an ArrayBuffer (used by the honest ZIP lister). */
export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

/** Load an image from a src/data URL, rejecting with a characterful error. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That image refused to load. Typical."));
    img.src = src;
  });
}

function triggerDownload(href: string, filename: string): void {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}