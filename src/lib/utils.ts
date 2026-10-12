export type ClassValue = string | false | null | undefined | ClassValue[]

export function cn(...classes: ClassValue[]): string {
  const out: string[] = []
  for (const c of classes) {
    if (!c) continue
    if (Array.isArray(c)) {
      const inner = cn(...c)
      if (inner) out.push(inner)
    } else {
      out.push(c)
    }
  }
  return out.join(' ')
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes < 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(i === 0 ? 0 : decimals)} ${units[i]}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`
}

export function titleCase(input: string): string {
  return input
    .split(' ')
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function extensionOf(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'mystery'
}

export interface FileMetaLite {
  name: string
  base: string
  ext: string
  type: string
  size: number
}

/** Small helper for presenting a File in the comedy interface. */
export function toolFileMeta(file: File): FileMetaLite {
  const idx = file.name.lastIndexOf('.')
  return {
    name: file.name,
    base: idx > 0 ? file.name.slice(0, idx) : file.name,
    ext: idx > 0 ? file.name.slice(idx + 1).toLowerCase() : 'mystery',
    type: file.type || 'unknown/unknown',
    size: file.size,
  }
}
