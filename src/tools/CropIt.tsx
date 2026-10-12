import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Scissors, Wand2, RefreshCw } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { FileDropZone } from '@/components/ui/FileDropZone'
import { Button } from '@/components/ui/Button'
import { Chip, Card } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { cropImage, type Rect } from '@/lib/image'
import { downloadBlob, readFileAsDataUrl } from '@/lib/download'
import { cn, clamp } from '@/lib/utils'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick, randInt } from '@/lib/random'

interface CropMode {
  id: string
  label: string
  caption: string
  rect: (w: number, h: number) => Rect
}

const CROP_MODES: CropMode[] = [
  {
    id: 'personality',
    label: "Crop the left half of the subject's personality",
    caption: 'Personality successfully halved. Remaining charm: archived.',
    rect: (w, h) => ({ x: w / 2, y: 0, w: w / 2, h }),
  },
  {
    id: 'sky',
    label: 'Remove the sky because it looks suspicious',
    caption: 'Sky removed pending investigation. Clouds unavailable for comment.',
    rect: (w, h) => ({ x: 0, y: h * 0.3, w, h: h * 0.7 }),
  },
  {
    id: 'pixel',
    label: 'Crop until only one pixel remains',
    caption: 'Behold: the single most important pixel in the entire photograph.',
    rect: () => ({ x: 0, y: 0, w: 1, h: 1 }),
  },
  {
    id: 'small',
    label: 'Crop the image into a suspiciously small rectangle',
    caption: 'Suspiciously small. Investigators have been notified.',
    rect: (w, h) => ({ x: w * 0.35, y: h * 0.35, w: w * 0.3, h: h * 0.3 }),
  },
  {
    id: 'emotional',
    label: 'Emotionally crop out the background',
    caption: 'Background removed without severance pay. It was very brave about it.',
    rect: (w, h) => ({ x: w * 0.18, y: h * 0.12, w: w * 0.64, h: h * 0.76 }),
  },
  {
    id: 'intern',
    label: 'Let an imaginary intern decide',
    caption: 'The intern has chosen. The intern is no longer with the company.',
    rect: (w, h) => {
      const cw = w * (0.2 + Math.random() * 0.5)
      const ch = h * (0.2 + Math.random() * 0.5)
      return { x: Math.random() * (w - cw), y: Math.random() * (h - ch), w: cw, h: ch }
    },
  },
]

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se' | null

export default function CropIt() {
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [src, setSrc] = useState<string | null>(null)
  const [natural, setNatural] = useState({ w: 0, h: 0 })
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 100, h: 100 }) // in natural px
  const [boxSize, setBoxSize] = useState({ w: 0, h: 0 })
  const [activeMode, setActiveMode] = useState<string | null>(null)
  const [biting, setBiting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [resultMeta, setResultMeta] = useState({ w: 0, h: 0, caption: '' })
  const [busy, setBusy] = useState(false)
  const [burst, fire] = useConfetti()
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ mode: DragMode; startX: number; startY: number; startRect: Rect } | null>(null)
  const { unlock, registerFile } = useNonsense()

  // Keep the overlay in sync with the rendered image size.
  useEffect(() => {
    const update = () => {
      const img = wrapRef.current?.querySelector('img')
      if (img) setBoxSize({ w: img.clientWidth, h: img.clientHeight })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [src])

  const pickFile = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const img = new Image()
      img.onload = () => {
        setNatural({ w: img.naturalWidth, h: img.naturalHeight })
        setRect({ x: img.naturalWidth * 0.15, y: img.naturalHeight * 0.15, w: img.naturalWidth * 0.7, h: img.naturalHeight * 0.7 })
      }
      img.src = dataUrl
      setSrc(dataUrl)
      setFileName(file.name)
      setFileSize(file.size)
      setResult(null)
      registerFile()
    } catch {
      notify.error('Could not read that image', 'The file declined to participate.', '🖼️')
    }
  }

  const applyMode = (mode: CropMode) => {
    setActiveMode(mode.id)
    setRect(mode.rect(natural.w, natural.h))
    setBiting(true)
    sound.whoosh()
    window.setTimeout(() => setBiting(false), 900)
    if (mode.id === 'pixel') {
      notify.info('Extreme crop selected', 'One pixel. An entire photograph reduced to a single opinion.', '🔬')
    }
  }

  // ---- pointer dragging -------------------------------------------------
  const scale = boxSize.w > 0 && natural.w > 0 ? natural.w / boxSize.w : 1

  const onPointerDown = (mode: DragMode) => (e: React.PointerEvent) => {
    e.preventDefault()
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, startRect: { ...rect } }
    const move = (ev: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || !drag.mode) return
      const dx = (ev.clientX - drag.startX) * scale
      const dy = (ev.clientY - drag.startY) * scale
      const s = drag.startRect
      let next: Rect = { ...s }
      if (drag.mode === 'move') {
        next.x = clamp(s.x + dx, 0, natural.w - s.w)
        next.y = clamp(s.y + dy, 0, natural.h - s.h)
      } else {
        if (drag.mode.includes('w')) {
          const nx = clamp(s.x + dx, 0, s.x + s.w - 8)
          next.w = s.w + (s.x - nx)
          next.x = nx
        }
        if (drag.mode.includes('e')) next.w = clamp(s.w + dx, 8, natural.w - s.x)
        if (drag.mode.includes('n')) {
          const ny = clamp(s.y + dy, 0, s.y + s.h - 8)
          next.h = s.h + (s.y - ny)
          next.y = ny
        }
        if (drag.mode.includes('s')) next.h = clamp(s.h + dy, 8, natural.h - s.y)
      }
      setRect(next)
    }
    const up = () => {
      dragRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // Handles occasionally "run away" from the cursor for comedy.
  const [runaway, setRunaway] = useState(false)
  useEffect(() => {
    const t = window.setInterval(() => setRunaway((r) => !r), 2600)
    return () => window.clearInterval(t)
  }, [])

  const performCrop = useCallback(async () => {
    if (!src) return
    setBusy(true)
    sound.whoosh()
    await new Promise((r) => setTimeout(r, 700))
    try {
      const dataUrl = await cropImage(src, rect)
      setResult(dataUrl)
      const mode = CROP_MODES.find((m) => m.id === activeMode)
      setResultMeta({
        w: Math.round(rect.w),
        h: Math.round(rect.h),
        caption: mode?.caption ?? pick(['Cropped with confidence. Confidence unearned.', 'A bold boundary decision.']),
      })
      fire()
      sound.success()
      unlock('crop')
      if (rect.w <= 3 && rect.h <= 3) unlock('crop')
      notify.success('Real crop performed', 'This one actually resized pixels. You are welcome and also baffled.', '✂️')
    } catch (e) {
      notify.error('Crop failed', e instanceof Error ? e.message : 'Unknown cropping incident.', '⚠️')
    } finally {
      setBusy(false)
    }
  }, [src, rect, activeMode, fire, unlock])

  const download = async () => {
    if (!result) return
    const res = await fetch(result)
    const blob = await res.blob()
    downloadBlob(blob, `cropped-${Date.now()}.png`)
    notify.success('Downloaded', 'The one tool on this website that does what it says.', '⬇️')
  }

  const pct = (v: number, total: number) => (total ? (v / total) * 100 : 0)
  const shownRect = {
    left: `${pct(rect.x, natural.w)}%`,
    top: `${pct(rect.y, natural.h)}%`,
    width: `${pct(rect.w, natural.w)}%`,
    height: `${pct(rect.h, natural.h)}%`,
  }

  const handlePositions: { mode: Exclude<DragMode, 'move' | null>; className: string }[] = [
    { mode: 'nw', className: '-left-2 -top-2 cursor-nwse-resize' },
    { mode: 'ne', className: '-right-2 -top-2 cursor-nesw-resize' },
    { mode: 'sw', className: '-left-2 -bottom-2 cursor-nesw-resize' },
    { mode: 'se', className: '-right-2 -bottom-2 cursor-nwse-resize' },
  ]

  return (
    <ToolShell
      id="crop"
      name="Crop It Like It's Hot"
      emoji="✂️"
      tagline="Professional image cropping by someone who has never used Photoshop."
      category="Image Crimes"
      accent="sun"
      honesty="The crop itself is real: we redraw the selected region onto a canvas and give you a proper PNG. The jokes are decorative. Your original image is not modified and never leaves the browser."
      aside={
        <ResultPanel title="Crop report">
          <ReportRow label="Source file" value={fileName ? fileName.slice(0, 22) : '—'} />
          <ReportRow label="Original dimensions" value={natural.w ? `${natural.w} × ${natural.h}` : '—'} />
          <ReportRow label="Crop box" value={`${Math.round(rect.w)} × ${Math.round(rect.h)}`} />
          <ReportRow
            label="Selected mode"
            value={CROP_MODES.find((m) => m.id === activeMode)?.label.split(' ').slice(0, 3).join(' ') ?? 'Manual'}
          />
          <ReportRow label="Personality retained" value={activeMode === 'personality' ? '50%' : 'Untested'} verdict="bad" />
          <ResultPanel title="Cropped result" className="mt-4 border-dashed">
            {result ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border-2 border-ink bg-cream-deep dark:border-cream dark:bg-[#100F0D]">
                  <img src={result} alt="Cropped result" className="mx-auto max-h-56 w-auto" />
                </div>
                <p className="text-xs italic text-ink-muted dark:text-cream/60">“{resultMeta.caption}”</p>
                <Button variant="lime" className="w-full" onClick={download} icon={<Download className="h-4 w-4" />}>
                  Download cropped PNG
                </Button>
              </div>
            ) : (
              <p className="text-xs text-ink-muted dark:text-cream/50">
                No crop yet. The scissors are sharpened and mildly overconfident.
              </p>
            )}
          </ResultPanel>
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={50} />

      <FileDropZone
        accept="image"
        onFile={pickFile}
        label="Upload an image to emotionally damage"
        hint="PNG, JPG, WEBP, GIF or BMP. Processed entirely on your device."
        current={fileName ? { name: fileName, size: fileSize } : null}
      />

      {src && (
        <>
          <Card>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">
              Step 1 — Choose your crime
            </h2>
            <div className="flex flex-wrap gap-2">
              {CROP_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => applyMode(m)}
                  aria-pressed={activeMode === m.id}
                  className={cn(
                    'rounded-2xl border-2 border-ink px-3 py-2 text-left font-display text-xs font-bold shadow-popsm transition hover:-translate-y-0.5 dark:border-cream',
                    activeMode === m.id ? 'bg-limey' : 'bg-white dark:bg-[#171512]',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Card>

          <div className="rounded-3xl border-2 border-ink bg-cream-deep p-4 shadow-pop dark:border-cream dark:bg-[#100F0D]">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Chip color="sun">Step 2 — Drag the frame</Chip>
              <span className="font-mono text-[11px] text-ink-muted dark:text-cream/50">
                The handles are a bit anxious today.
              </span>
            </div>

            <div ref={wrapRef} className="relative mx-auto w-fit max-w-full select-none">
              <img
                src={src}
                alt="Source to crop"
                className="max-h-[440px] w-auto max-w-full rounded-2xl border-2 border-ink dark:border-cream"
                draggable={false}
                onLoad={(e) => {
                  const el = e.currentTarget
                  setBoxSize({ w: el.clientWidth, h: el.clientHeight })
                }}
              />

              {/* darkened outside */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-ink/35" />

              {/* selection */}
              <div
                className="absolute cursor-move rounded-lg border-[3px] border-dashed border-sunrise shadow-[0_0_0_9999px_rgba(0,0,0,0)] transition-[box-shadow]"
                style={{ ...shownRect, boxShadow: '0 0 0 3px rgba(255,212,0,0.6)' }}
                onPointerDown={onPointerDown('move')}
                role="presentation"
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-sunrise/10"
                  style={{ clipPath: 'none' }}
                />
                {handlePositions.map((h) => (
                  <button
                    key={h.mode}
                    type="button"
                    aria-label={`Resize crop from ${h.mode}`}
                    className={cn(
                      'absolute h-4 w-4 rounded-full border-2 border-ink bg-sunrise transition-transform',
                      h.className,
                      runaway && 'animate-wobble',
                    )}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      onPointerDown(h.mode)(e)
                    }}
                  />
                ))}
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl opacity-70">
                  <motion.span
                    animate={runaway ? { x: [0, 6, -6, 0], y: [0, -4, 4, 0] } : { x: 0, y: 0 }}
                    transition={{ duration: 1.2, repeat: runaway ? Infinity : 0 }}
                  >
                    ✂️
                  </motion.span>
                </div>
              </div>

              <AnimatePresence>
                {biting && (
                  <motion.div
                    initial={{ scale: 0, rotate: -30, opacity: 0 }}
                    animate={{ scale: 1.2, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="pointer-events-none absolute right-4 top-4 text-5xl"
                    aria-hidden
                  >
                    😬
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" onClick={performCrop} disabled={busy} icon={<Scissors className="h-5 w-5" />}>
                {busy ? 'Cropping with confidence…' : 'Crop With Confidence'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const m = CROP_MODES.find((c) => c.id === 'intern')
                  if (m) applyMode(m)
                }}
                icon={<Wand2 className="h-4 w-4" />}
              >
                Intern, take over
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setRect({
                    x: natural.w * 0.15,
                    y: natural.h * 0.15,
                    w: natural.w * 0.7,
                    h: natural.h * 0.7,
                  })
                }
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Reset frame
              </Button>
            </div>
            <p className="mt-3 font-mono text-[11px] text-ink-muted dark:text-cream/50">
              Random intern selection #{randInt(1000, 9999)} · intern confidence: unwarranted
            </p>
          </div>
        </>
      )}
    </ToolShell>
  )
}
