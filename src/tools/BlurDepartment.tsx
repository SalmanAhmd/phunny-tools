import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, EyeOff, RefreshCw } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { FileDropZone } from '@/components/ui/FileDropZone'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { blurImage } from '@/lib/image'
import { downloadBlob, readFileAsDataUrl } from '@/lib/download'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { cn } from '@/lib/utils'
import { pick } from '@/lib/random'

interface BlurMode {
  id: string
  label: string
  caption: string
  canvasMode: 'all' | 'center' | 'edges' | 'pixelate'
  intensity: number
}

const MODES: BlurMode[] = [
  {
    id: 'least-important',
    label: 'Blur everything except the least important thing',
    caption: 'We have protected the least relevant object in the frame with great care.',
    canvasMode: 'center',
    intensity: 14,
  },
  {
    id: 'background-background',
    label: "Blur the background's background",
    caption: 'A blur within a blur. Theoretically deep. Practically beige.',
    canvasMode: 'all',
    intensity: 9,
  },
  {
    id: 'forget',
    label: 'Blur so much that even you forget what it was',
    caption: 'Identification impossible. Memory: also compromised.',
    canvasMode: 'all',
    intensity: 26,
  },
  {
    id: 'corporate',
    label: 'Corporate privacy mode',
    caption: 'Pixelated beyond recognition. Compliant with policies that do not exist.',
    canvasMode: 'pixelate',
    intensity: 22,
  },
  {
    id: 'witness',
    label: 'Make it look like a witness protection photograph',
    caption: 'The subject is safe. The subject is also a rectangle now.',
    canvasMode: 'edges',
    intensity: 18,
  },
]

export default function BlurDepartment() {
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [src, setSrc] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<BlurMode | null>(null)
  const [intensity, setIntensity] = useState(14)
  const [busy, setBusy] = useState(false)
  const [burst, fire] = useConfetti()
  const [caption, setCaption] = useState('')
  const { unlock, registerFile } = useNonsense()

  const pickFile = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file)
    setSrc(dataUrl)
    setFileName(file.name)
    setFileSize(file.size)
    setResult(null)
    setActiveMode(null)
    setCaption('')
    registerFile()
  }

  const applyBlur = useCallback(
    async (mode: BlurMode, strength: number) => {
      if (!src) return
      setBusy(true)
      setActiveMode(mode)
      sound.whoosh()
      try {
        const out = await blurImage(src, strength, mode.canvasMode)
        setResult(out)
        setCaption(mode.caption)
        fire()
        sound.ding()
        unlock('blur')
        notify.success('Blur applied for real', 'This one is genuinely blurred. Up to you what to do about it.', '🕵️')
      } catch (e) {
        notify.error('Blur failed', e instanceof Error ? e.message : 'Unspecified blur incident.', '⚠️')
      } finally {
        setBusy(false)
      }
    },
    [src, fire, unlock],
  )

  const download = async () => {
    if (!result) return
    const blob = await (await fetch(result)).blob()
    downloadBlob(blob, `blurred-${Date.now()}.png`)
    notify.success('Downloaded', 'A genuinely blurred image. Enjoy your privacy-ish.', '⬇️')
  }

  return (
    <ToolShell
      id="blur"
      name="Professional Blur Department"
      emoji="🕵️"
      tagline="We make things harder to recognize."
      category="Image Crimes"
      accent="grape"
      honesty="The blur is real — we process your image on a canvas in your browser and hand back an actual blurred PNG. Download it whenever you like. Your original image is untouched and never uploaded."
      aside={
        <ResultPanel title="Department file">
          <ReportRow label="Subject" value={fileName ? fileName.slice(0, 22) : '—'} />
          <ReportRow label="Technique" value={activeMode?.label.split(' ').slice(0, 4).join(' ') ?? 'None'} />
          <ReportRow label="Intensity" value={`${intensity} px`} />
          <ReportRow label="Recognisability" value={result ? 'Compromised' : 'Intact'} verdict={result ? 'bad' : 'good'} />
          <ReportRow label="Real operation" value="Yes — canvas blur" verdict="good" />
          <ReportRow label="Original preserved" value="Always" verdict="good" />
          {result && (
            <Button variant="grape" className="mt-4 w-full" onClick={download} icon={<Download className="h-4 w-4" />}>
              Download blurred image
            </Button>
          )}
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-grape/10 p-3 text-xs">
            <EyeOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Blurring an image is not a secure way to hide information. Use real redaction for real secrets.
          </p>
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <FileDropZone
        accept="image"
        onFile={pickFile}
        label="Upload an image that deserves some privacy"
        hint="PNG, JPG, WEBP, GIF or BMP. Blurred locally with the Canvas API."
        current={fileName ? { name: fileName, size: fileSize } : null}
      />

      {src && (
        <>
          <Card>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Select a privacy strategy</h2>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setIntensity(m.intensity)
                    void applyBlur(m, m.intensity)
                  }}
                  aria-pressed={activeMode?.id === m.id}
                  className={cn(
                    'max-w-[17rem] rounded-2xl border-2 border-ink px-3 py-2 text-left font-display text-xs font-bold shadow-popsm transition hover:-translate-y-0.5 dark:border-cream',
                    activeMode?.id === m.id ? 'bg-limey' : 'bg-white dark:bg-[#171512]',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <label className="flex flex-1 items-center gap-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest">Intensity</span>
                <input
                  type="range"
                  min={1}
                  max={40}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full"
                  aria-label="Blur intensity in pixels"
                />
                <span className="w-14 font-mono text-xs font-bold">{intensity}px</span>
              </label>
              <Button
                variant="grape"
                onClick={() => {
                  const mode = activeMode ?? pick(MODES)
                  void applyBlur(mode, intensity)
                }}
                disabled={busy}
                icon={<RefreshCw className={cn('h-4 w-4', busy && 'animate-spin')} />}
              >
                {busy ? 'Blurring…' : 'Apply blur'}
              </Button>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border-2 border-ink bg-cream-deep p-4 shadow-pop dark:border-cream dark:bg-[#100F0D]">
              <Chip color="plain" className="mb-3">
                Before (sharp and honest)
              </Chip>
              <img src={src} alt="Original" className="max-h-72 w-full rounded-2xl border-2 border-ink object-contain dark:border-cream" />
            </div>
            <div className="rounded-3xl border-2 border-ink bg-cream-deep p-4 shadow-pop dark:border-cream dark:bg-[#100F0D]">
              <Chip color="grape" className="mb-3">
                After (professionally obscured)
              </Chip>
              {result ? (
                <motion.img
                  initial={{ opacity: 0, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  src={result}
                  alt="Blurred result"
                  className="max-h-72 w-full rounded-2xl border-2 border-ink object-contain dark:border-cream"
                />
              ) : (
                <div className="grid h-72 place-items-center rounded-2xl border-2 border-dashed border-ink/30 text-sm text-ink-muted dark:border-cream/30 dark:text-cream/50">
                  No blur applied yet
                </div>
              )}
            </div>
          </div>

          {caption && (
            <p className="text-center text-sm italic text-ink-muted dark:text-cream/60">“{caption}”</p>
          )}
        </>
      )}
    </ToolShell>
  )
}
