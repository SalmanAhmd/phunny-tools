export interface ToolFile {
  name: string
  size: number
  type: string
  lastModified: number
}

export function toToolFile(file: File): ToolFile {
  return {
    name: file.name,
    size: file.size,
    type: file.type || 'unknown/unknown',
    lastModified: file.lastModified,
  }
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp']

export const ACCEPT = {
  image: 'image/*',
  pdf: 'application/pdf',
  zip: '.zip,application/zip,application/x-zip-compressed',
  any: undefined,
} as const

export const MAX_FILE_BYTES = 40 * 1024 * 1024

export interface ValidationResult {
  ok: boolean
  message?: string
}

export function validateFile(
  file: File,
  opts: { accept?: 'image' | 'pdf' | 'zip' | 'any'; maxBytes?: number } = {},
): ValidationResult {
  const max = opts.maxBytes ?? MAX_FILE_BYTES
  if (file.size > max) {
    return { ok: false, message: `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Our comedy budget only covers ${(max / 1024 / 1024).toFixed(0)} MB.` }
  }
  if (file.size === 0) {
    return { ok: false, message: 'That file is empty. It is already as useless as we are.' }
  }
  const accept = opts.accept ?? 'any'
  const lower = file.name.toLowerCase()
  if (accept === 'image' && !(IMAGE_TYPES.includes(file.type) || /\.(png|jpe?g|webp|gif|bmp)$/.test(lower))) {
    return { ok: false, message: 'That is not an image. Even our imaginary intern can tell.' }
  }
  if (accept === 'pdf' && !(file.type === 'application/pdf' || lower.endsWith('.pdf'))) {
    return { ok: false, message: 'That is not a PDF. The conversion machine refuses to be confused.' }
  }
  if (accept === 'zip' && !(file.type.includes('zip') || lower.endsWith('.zip'))) {
    return { ok: false, message: 'That archive is not a ZIP. We can only unpack ZIP-flavoured feelings here.' }
  }
  return { ok: true }
}
