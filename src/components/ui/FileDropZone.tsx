import { useCallback, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud } from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { validateFile } from '@/lib/files'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'

interface FileDropZoneProps {
  accept?: 'image' | 'pdf' | 'zip' | 'any'
  onFile: (file: File) => void
  label?: string
  hint?: string
  current?: { name: string; size: number } | null
  className?: string
  multiple?: false
  children?: ReactNode
}

export function FileDropZone({
  accept = 'any',
  onFile,
  label = 'Drop a file here',
  hint = 'Everything stays in your browser. We could not afford a server.',
  current,
  className,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (!file) return
      const result = validateFile(file, { accept })
      if (!result.ok) {
        sound.error()
        notify.error('File rejected', result.message, '🚫')
        return
      }
      sound.pop()
      onFile(file)
    },
    [accept, onFile],
  )

  const acceptAttr =
    accept === 'image'
      ? 'image/*'
      : accept === 'pdf'
        ? 'application/pdf,.pdf'
        : accept === 'zip'
          ? '.zip,application/zip'
          : undefined

  return (
    <div
      className={cn(
        'relative rounded-3xl border-2 border-dashed border-ink p-6 text-center transition-all dark:border-cream',
        dragging ? 'scale-[1.01] bg-limey/40' : 'bg-white/60 dark:bg-[#171512]',
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {current ? (
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-5xl"
            aria-hidden
          >
            📁
          </motion.div>
          <p className="break-all font-display text-sm font-bold">{current.name}</p>
          <p className="font-mono text-xs text-ink-muted dark:text-cream/60">
            {formatBytes(current.size)} · untouched and unharmed
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="h-8 w-8" aria-hidden />
          <p className="font-display text-base font-bold">{label}</p>
          <p className="max-w-sm text-xs text-ink-muted dark:text-cream/60">{hint}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn btn-primary mt-4"
      >
        {current ? 'Choose a different file' : 'Browse files'}
      </button>
    </div>
  )
}
