import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Sparkles } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { FileDropZone } from '@/components/ui/FileDropZone'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { enhanceImage, canvasToPixelSample } from '@/lib/image'
import { downloadBlob, readFileAsDataUrl, loadImage } from '@/lib/download'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { cn } from '@/lib/utils'
import { pick } from '@/lib/random'

interface Mode {
  id: string
  label: string
  scale: number
  sharpen: boolean
  verdict: string
}

const MODES: Mode[] = [
  { id: '200', label: 'Enhance 200%', scale: 2, sharpen: true, verdict: 'Twice as large. Equally as blurry.' },
  { id: '400', label: 'Enhance 400%', scale: 4, sharpen: true, verdict: 'Four times the pixels, none of the new information.' },
  { id: 'physics', label: 'Enhance beyond the laws of physics', scale: 8, sharpen: true, verdict: 'Physics has been notified and is not happy.' },
  { id: 'cooperate', label: 'Ask the pixels to cooperate', scale: 1.5, sharpen: false, verdict: 'The pixels have been asked politely. They declined.' },
  { id: 'detective', label: 'Consult the digital detective', scale: 2, sharpen: true, verdict: 'The detective found the same blue pixel six times.' },
]

const DETECTIVE_NARRATION = [
  'Enhancing… enhancing… still enhancing…',
  'I have seen this pixel before. It was blue then, too.',
  'There is a smudge here that I do not trust.',
  'Zooming further reveals only more of the same.',
  'The evidence is inconclusive, and also below 400 pixels wide.',
  'My professional opinion: it is a screenshot. Of something. Probably.',
]

export default function ScreenshotEnhancer() {
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [src, setSrc] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [dims, setDims] = useState({ w: 0, h: 0, nw: 0, nh: 0 })
  const [working, setWorking] = useState(false)
  const [narration, setNarration] = useState<string[]>([])
  const [verdict, setVerdict] = useState('')
  const [analysis, setAnalysis] = useState<{ label: string; avg: string } | null>(null)
  const [burst, fire] = useConfetti()
  const { unlock, registerFile } = useNonsense()

  const pickFile = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file)
    const img = await loadImage(dataUrl)
    setSrc(dataUrl)
    setFileName(file.name)
    setFileSize(file.size)
    setResult(null)
    setNarration([])
    setVerdict('')
    setAnalysis(null)
    setDims({ w: img.naturalWidth, h: img.naturalHeight, nw: img.naturalWidth, nh: img.naturalHeight })
    registerFile()
  }

  const enhance = useCallback(
    async (mode: Mode) => {
      if (!src || working) return
      setWorking(true)
      setResult(null)
      setNarration([])
      setVerdict('')
      sound.whoosh()

      const lines = [mode.label.toUpperCase() + ' — ENGAGED', ...DETECTIVE_NARRATION]
      for (let i = 0; i < lines.length; i++) {
        await new Promise((r) => setTimeout(r, 420))
        setNarration((n) => [...n, lines[i]])
      }

      try {
        const out = await enhanceImage(src, mode.scale)
        const img = await loadImage(out)
        const sample = await canvasToPixelSample(out)
        setResult(out)
        setDims((d) => ({ ...d, nw: img.naturalWidth, nh: img.naturalHeight }))
        setAnalysis(sample)
        setVerdict(mode.verdict)
        fire()
        sound.success()
        unlock('screenshot')
        notify.info(
          'Enhancement complete',
          'The image is bigger. It contains exactly the same amount of information.',
          '🔍',
        )
      } catch (e) {
        notify.error('Enhancement failed', e instanceof Error ? e.message : 'The pixels refused.', '⚠️')
      } finally {
        setWorking(false)
      }
    },
    [src, working, fire, unlock],
  )

  const download = async () => {
    if (!result) return
    const blob = await (await fetch(result)).blob()
    downloadBlob(blob, `enhanced-${Date.now()}.png`)
    notify.success('Downloaded', 'Not a single new detail was added.', '⬇️')
  }

  return (
    <ToolShell
      id="screenshot"
      name="The Screenshot Enhancer"
      emoji="🔍"
      tagline="Enhance this blurry screenshot until it becomes a different blurry screenshot."
      category="Image Crimes"
      accent="sun"
      honesty="This is an honest upscale: we redraw your image at a larger size with smoothing. No new detail can possibly appear because the detail was never in the file. We never claim otherwise."
      aside={
        <ResultPanel title="Evidence log">
          <ReportRow label="Exhibit A" value={fileName ? fileName.slice(0, 20) : '—'} />
          <ReportRow label="Original" value={dims.w ? `${dims.w} × ${dims.h}` : '—'} />
          <ReportRow label="Enhanced" value={result ? `${dims.nw} × ${dims.nh}` : '—'} />
          <ReportRow label="New detail recovered" value="None" verdict="bad" />
          <ReportRow label="Pixel count increase" value={result ? `${(dims.nw * dims.nh - dims.w * dims.h).toLocaleString('en-US')}` : '—'} />
          {analysis && (
            <>
              <ReportRow label="Dominant pixel" value={analysis.avg} />
              <ReportRow label="Detective's note" value={analysis.label} verdict="bad" />
            </>
          )}
          {result && (
            <Button variant="primary" className="mt-4 w-full" onClick={download} icon={<Download className="h-4 w-4" />}>
              Download enhanced image
            </Button>
          )}
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <FileDropZone
        accept="image"
        onFile={pickFile}
        label="Drop the blurry screenshot you are desperate to fix"
        hint="We cannot fix it. We can make it larger and sadder."
        current={fileName ? { name: fileName, size: fileSize } : null}
      />

      {src && (
        <>
          <Card className="bg-ink text-cream dark:border-cream dark:bg-[#171512]">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>🕵️</span>
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-widest">PIXEL FORENSICS UNIT</h2>
                <p className="font-mono text-[11px] text-cream/60">
                  Case #{Math.floor(Math.random() * 9000) + 1000} · jurisdiction: your browser
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="relative shrink-0">
                <img src={src} alt="Exhibit" className="h-40 w-auto rounded-xl border-2 border-cream/40" />
                <motion.span
                  className="pointer-events-none absolute inset-0 grid place-items-center text-4xl"
                  animate={{ x: [-40, 40, -40], y: [-20, 20, -20] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden
                >
                  🔍
                </motion.span>
                <span className="absolute -left-2 -top-2 rounded-full border-2 border-cream bg-sunrise px-2 py-0.5 font-mono text-[10px] font-bold text-ink">
                  EXHIBIT A
                </span>
              </div>
              <div className="min-h-[10rem] flex-1 font-mono text-xs leading-relaxed text-cream/80">
                {narration.length === 0 && <p className="text-cream/50">Detective standing by. Select an enhancement method below.</p>}
                {narration.map((line, i) => (
                  <motion.p key={`${line}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="mb-1">
                    <span className="text-limey">›</span> {line}
                  </motion.p>
                ))}
                {working && <span className="animate-pulse text-sunrise">▌</span>}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Request an enhancement</h2>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={working}
                  onClick={() => void enhance(m)}
                  className="max-w-[17rem] rounded-2xl border-2 border-ink bg-white px-3 py-2 text-left font-display text-xs font-bold shadow-popsm transition hover:-translate-y-0.5 disabled:opacity-50 dark:border-cream dark:bg-[#171512]"
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Card>

          {result && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border-2 border-ink bg-cream-deep p-4 shadow-pop dark:border-cream dark:bg-[#100F0D]">
                <Chip color="plain" className="mb-3">Before · {dims.w} × {dims.h}</Chip>
                <img src={src} alt="Original screenshot" className="max-h-72 w-full rounded-2xl border-2 border-ink object-contain dark:border-cream" />
              </div>
              <div className="rounded-3xl border-2 border-ink bg-cream-deep p-4 shadow-pop dark:border-cream dark:bg-[#100F0D]">
                <Chip color="lime" className="mb-3">
                  After · {dims.nw} × {dims.nh}
                </Chip>
                <motion.img
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={result}
                  alt="Enhanced screenshot"
                  className="max-h-72 w-full rounded-2xl border-2 border-ink object-contain dark:border-cream"
                />
              </div>
            </div>
          )}

          {verdict && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex flex-wrap items-center gap-3 rounded-3xl border-2 border-ink p-5 shadow-pop dark:border-cream',
                'bg-sunrise',
              )}
            >
              <Sparkles className="h-5 w-5" aria-hidden />
              <p className="font-display text-sm font-bold">
                Detective's verdict: “{verdict}”
              </p>
              <p className="w-full text-xs text-ink/70">{pick([
                'Case closed. Nothing was found. The unit is going for lunch.',
                'We have ruled out the possibility of more detail.',
                'The pixels have lawyered up.',
              ])}</p>
            </motion.div>
          )}
        </>
      )}
    </ToolShell>
  )
}
