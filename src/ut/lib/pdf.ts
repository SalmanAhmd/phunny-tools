/**
 * Best-effort PDF text extraction, entirely in the browser.
 *
 * This is deliberately simple: we look for text-showing operators (Tj, TJ, ')
 * in the raw bytes, and if the streams are Flate-compressed we try to inflate
 * them with the browser's DecompressionStream. It works on many simple PDFs and
 * fails gracefully on the rest — which the UI is honest about.
 */

const STRING_OP = /\((?:[^()\\]|\\.)*\)\s*(?:Tj|'|")/g
const ARRAY_OP = /\[(?:[^\[\]\\]|\\.)*\]\s*TJ/g

function decodePdfEscapes(raw: string): string {
  return raw
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\([0-7]{1,3})/g, (_, oct: string) => String.fromCharCode(parseInt(oct, 8)))
}

function extractFromSource(src: string): string[] {
  const chunks: string[] = []
  let m: RegExpExecArray | null
  STRING_OP.lastIndex = 0
  while ((m = STRING_OP.exec(src))) {
    const inner = m[0].slice(1, m[0].lastIndexOf(')'))
    chunks.push(decodePdfEscapes(inner))
  }
  ARRAY_OP.lastIndex = 0
  while ((m = ARRAY_OP.exec(src))) {
    const parts = m[0].match(/\((?:[^()\\]|\\.)*\)/g) ?? []
    const joined = parts.map((p) => decodePdfEscapes(p.slice(1, -1))).join('')
    if (joined.trim()) chunks.push(joined)
  }
  return chunks
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array | null> {
  const DS = (globalThis as { DecompressionStream?: typeof DecompressionStream }).DecompressionStream
  if (!DS) return null
  try {
    const stream = new Blob([bytes as unknown as BlobPart]).stream().pipeThrough(new DS('deflate'))
    const buf = await new Response(stream).arrayBuffer()
    return new Uint8Array(buf)
  } catch {
    return null
  }
}

/** Streams in a PDF look like: << /Filter /FlateDecode ... >> stream ... endstream */
function findStreams(src: string, maxStreams: number): Uint8Array[] {
  const bytes = new TextEncoder().encode(src)
  const out: Uint8Array[] = []
  const marker = 'stream'
  let idx = 0
  while (out.length < Math.max(1, maxStreams)) {
    const s = src.indexOf(marker, idx)
    if (s === -1) break
    // skip "stream\r\n" or "stream\n"
    let start = s + marker.length
    if (src[start] === '\r') start++
    if (src[start] === '\n') start++
    const e = src.indexOf('endstream', start)
    if (e === -1) break
    out.push(bytes.slice(start, e))
    idx = e + 9
  }
  return out
}

export interface PdfExtraction {
  text: string
  words: number
  numPages: number
  method: 'direct' | 'inflated' | 'none'
}

export async function extractPdfText(file: File, maxStreams = 24): Promise<PdfExtraction> {
  const buffer = await file.arrayBuffer()
  const latin1 = new TextDecoder('latin1').decode(buffer)

  // Best-effort page count: `/Type /Page` entries in the header/dictionary
  // streams. Hidden inside compressed trailers? Then it's a mystery, like us.
  const pages = latin1.match(/\/Type\s*\/Page\b/g)
  const numPages = pages ? pages.length : 1

  const direct = extractFromSource(latin1).join('\n')
  if (direct.replace(/\s+/g, '').length > 40) {
    return { text: normalise(direct), words: countWords(direct), numPages, method: 'direct' }
  }

  const streams = findStreams(latin1, maxStreams)
  const inflatedChunks: string[] = []
  for (const s of streams) {
    const result = await inflate(s)
    if (!result) continue
    const text = new TextDecoder('latin1').decode(result)
    inflatedChunks.push(...extractFromSource(text))
    if (inflatedChunks.join('').length > 4000) break
  }
  const joined = inflatedChunks.join('\n')
  if (joined.replace(/\s+/g, '').length > 40) {
    return { text: normalise(joined), words: countWords(joined), numPages, method: 'inflated' }
  }

  return { text: '', words: 0, numPages, method: 'none' }
}

function normalise(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 12000)
}

function countWords(text: string): number {
  const m = text.trim().match(/[\p{L}\p{N}']+/gu)
  return m ? m.length : 0
}
