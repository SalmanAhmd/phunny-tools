/**
 * Best-effort PDF text extraction. Real tools exist; we are not one of them.
 * We read the PDF bytes, loudly announce our findings, and give up gracefully
 * when the file is compressed or having a bad day. Honest about all of it.
 */

export interface PdfExtraction {
  ok: boolean
  text?: string
  pages?: number
  error?: string
}

/** Extract printable text runs that live in uncompressed PDF content streams. */
export async function extractPdfText(data: ArrayBuffer): Promise<PdfExtraction> {
  try {
    const bytes = new Uint8Array(data)
    // latin-1 decoding preserves every byte without misinterpreting UTF-16/UTF-8.
    let raw: string
    try {
      raw = new TextDecoder('latin1').decode(bytes)
    } catch {
      raw = String.fromCharCode(...Array.from(bytes))
    }

    const pages = (raw.match(/\/Type\s*\/Page[^s]/g) ?? []).length || undefined

    // Content stream text operators: (text) Tj and [(a)(b)] TJ
    const runs: string[] = []
    const tjRe = /\(((?:[^()\\]|\\.)*)\)\s*Tj/g
    let m: RegExpExecArray | null
    while ((m = tjRe.exec(raw))) runs.push(xpdf(m[1]))
    const tjListRe = /\[((?:[^\[\]()\\]|\\.|\([^()\\]*\))*)\]\s*TJ/g
    while ((m = tjListRe.exec(raw))) {
      const parts = m[1].match(/\(((?:[^()\\]|\\.)*)\)/g) ?? []
      if (parts.length) {
        runs.push(parts.map((p) => xpdf(p.slice(1, -1))).join(''))
      }
    }

    const text = runs.join(' ').replace(/\s+/g, ' ').trim()

    if (text.length < 3) {
      return {
        ok: false,
        pages,
        error:
          'This PDF is compressed, encrypted, or simply suspicious. Our extraction intern tried her best and then went home.',
      }
    }
    return { ok: true, text, pages }
  } catch {
    return { ok: false, error: 'That PDF physically refused to be read. It has rights too, you know.' }
  }
}

/** Decode the few PDF string escapes that are worth decoding. */
function xpdf(input: string): string {
  return input
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
}