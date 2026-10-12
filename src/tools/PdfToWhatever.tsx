import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, FileText, RefreshCw, Wand2 } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { FileDropZone } from '@/components/ui/FileDropZone'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { ProgressBar, useChaoticProgress } from '@/components/ui/ProgressBar'
import { useConfetti } from '@/components/ui/Confetti'
import { extractPdfText } from '@/lib/pdf'
import { readFileAsArrayBuffer, downloadText } from '@/lib/download'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'

interface Conversion {
  id: string
  label: string
  emoji: string
  line: string
}

const CONVERSIONS: Conversion[] = [
  { id: 'word', label: 'PDF → Word document', emoji: '📝', line: 'The formatting has been interpreted as a threat and removed.' },
  { id: 'slides', label: 'PDF → PowerPoint (one slide)', emoji: '📽️', line: 'Every page was condensed into a single, unreadable, autoplaying slide.' },
  { id: 'email', label: 'PDF → apologetic email', emoji: '✉️', line: 'Your PDF is now an email. It mostly says "as attached" and "sorry".' },
  { id: 'potato', label: 'PDF → potato', emoji: '🥔', line: 'The potato is now holding your PDF. Nobody knows why, but nobody asks.' },
]

const READING_STEPS = ['Trusting the PDF…', 'Reading the PDF…', 'It looked back. We looked away.', 'Extracting whatever is free to extract…']

type Status = 'idle' | 'reading' | 'ready' | 'converting' | 'done'

export default function PdfToWhatever() {
  const [status, setStatus] = useState<Status>('idle')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [text, setText] = useState('')
  const [pages, setPages] = useState<number | undefined>(undefined)
  const [error, setError] = useState('')
  const [choice, setChoice] = useState<Conversion | null>(null)
  const { progress, setProgress } = useChaoticProgress()
  const readStepRef = useRef(0)
  const [honestStep, setHonestStep] = useState(READING_STEPS[0])
  const [, fire] = useConfetti()
  const { unlock } = useNonsense()

  const onFile = useCallback(
    async (file: File) => {
      setFileName(file.name)
      setFileSize(file.size)
      setText('')
      setError('')
      setChoice(null)
      setStatus('reading')
      readStepRef.current = 0
      const stepLoop = window.setInterval(() => {
        readStepRef.current = (readStepRef.current + 1) % READING_STEPS.length
        setHonestStep(READING_STEPS[readStepRef.current])
      }, 420)
      try {
        const buffer = await readFileAsArrayBuffer(file)
        const result = await extractPdfText(buffer)
        window.clearInterval(stepLoop)
        if (result.ok && result.text) {
          setText(result.text)
          setPages(result.pages)
          setStatus('ready')
          sound.success()
          unlock('pdf')
          notify.success(
            'PDF reluctantly opened',
            'We extracted some words. Whether they are the right words is a separate matter.',
            '📄',
          )
        } else {
          setError(result.error ?? 'Refused to be read.')
          setStatus('ready')
          sound.fail()
        }
      } catch {
        window.clearInterval(stepLoop)
        setError('The file and the browser disagreed about everything.')
        setStatus('ready')
        sound.fail()
      }
    },
    [unlock],
  )

  const convert = (conv: Conversion) => {
    if (status !== 'ready') return
    setChoice(conv)
    setProgress(1)
    setStatus('converting')
    sound.pop()
  }

  // conversion theatre — the chaotic bar marches for a few seconds, then lands
  useEffect(() => {
    if (status !== 'converting') return
    const t = window.setTimeout(() => {
      setProgress(100)
      setStatus('done')
      sound.success()
      fire()
      notify.success('Conversion complete (verbally)', 'Nothing was actually converted, but the words were used with confidence.', '✨')
    }, 3400)
    return () => window.clearTimeout(t)
  }, [status, setProgress, fire, notify])

  const buildReceipt = () => {
    const label = choice?.label ?? 'PDF → unspecified'
    return [
      'OFFICIAL CONVERSION RECEIPT',
      '============================',
      `Input file:       ${fileName}`,
      `Input size:       ${fileSize.toLocaleString()} bytes`,
      `Pages located:    ${pages ?? 'a mystery'}`,
      `Words extracted:  ${text.split(/\s+/).filter(Boolean).length}`,
      `Conversion:       ${label}`,
      '',
      choice?.line ?? '',
      '',
      'DISCLAIMER: No conversion occurred. A receipt was generated with enormous confidence.',
      'The original file is untouched and emotionally intact.',
    ].join('\n')
  }

  const saveReceipt = () => {
    if (!choice) return
    downloadText(buildReceipt(), `${fileName.replace(/\.[^.]+$/, '')}-conversion-receipt.txt`, 'text/plain')
    sound.coin()
    notify.success('Receipt downloaded', 'Please file it somewhere it will never be read.', '🧾')
  }

  const reset = () => {
    setStatus('idle')
    setFileName('')
    setFileSize(0)
    setText('')
    setError('')
    setChoice(null)
    setProgress(0)
    sound.pop()
  }

  const words = text.split(/\s+/).filter(Boolean).length

  return (
    <ToolShell
      id="pdf"
      name="PDF→Whatever Converter"
      emoji="📄"
      tagline="Turn your PDF into something it never wanted to be."
      category="File Destruction & Management"
      accent="orange"
      honesty="This tool does not convert PDFs. It reads the text your PDF is willing to share (uncompressed PDF only), and then produces a downloadable text receipt describing the conversion you imagined. Your file never leaves this tab."
      aside={
        <ResultPanel title="Conversion report">
          <ReportRow label="Source file" value={fileName || '—'} />
          <ReportRow label="Size" value={fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : '—'} />
          <ReportRow label="Words extracted" value={String(words)} verdict={words > 0 ? 'good' : 'bad'} />
          <ReportRow label="Pages located" value={pages ? String(pages) : 'mystery'} />
          <ReportRow label="Conversion" value={choice ? choice.label : 'not chosen yet'} verdict={choice ? 'neutral' : 'bad'} />
          <ReportRow label="Actually converted" value="0%" verdict="bad" />
          {status === 'done' && choice && (
            <Button variant="lime" className="mt-4 w-full" onClick={saveReceipt} icon={<Download className="h-4 w-4" />}>
              Download the receipt
            </Button>
          )}
          {status !== 'idle' && (
            <Button variant="ghost" className="mt-2 w-full" onClick={reset} icon={<RefreshCw className="h-4 w-4" />}>
              Start over
            </Button>
          )}
        </ResultPanel>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <FileDropZone accept="pdf" onFile={onFile} label="Drop a PDF here" hint="We will read as much of it as it lets us read. It usually lets us read half." />

          <AnimatePresence mode="wait">
            {status === 'reading' && (
              <motion.div key="reading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-3xl border-2 border-ink bg-white p-5 shadow-pop dark:border-cream dark:bg-[#171512]">
                <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted dark:text-cream/60">
                  <span className="animate-spin text-sm" aria-hidden>⚙️</span> {honestStep}
                </div>
                <div className="mt-3">
                  <ProgressBar value={progress} color="sunrise" indeterminate />
                </div>
              </motion.div>
            )}

            {status === 'ready' && !error && (
              <motion.div key="ready" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-3xl border-2 border-ink bg-white p-5 shadow-pop dark:border-cream dark:bg-[#171512]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-tangerine" aria-hidden />
                    <span className="font-display text-sm font-bold">{fileName}</span>
                  </div>
                  <Chip color="lime">Extracted {words} words</Chip>
                </div>
                <blockquote className="mt-3 max-h-40 overflow-y-auto rounded-2xl border-2 border-dashed border-ink/20 bg-cream-deep p-3 text-sm leading-relaxed dark:border-cream/20 dark:bg-[#100F0D]">
                  {text.slice(0, 800)}
                  {text.length > 800 ? '…' : ''}
                </blockquote>
                <p className="mt-3 text-xs text-ink-muted dark:text-cream/50">
                  Choose a destination format. The transformation will be described in great detail and performed
                  not at all.
                </p>
              </motion.div>
            )}

            {status === 'ready' && error && (
              <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-3xl border-2 border-ink bg-bubblegum/40 p-5 shadow-pop dark:border-cream">
                <div className="flex items-center gap-2">
                  <span aria-hidden>🚧</span>
                  <span className="font-display text-sm font-bold">Extraction declined</span>
                </div>
                <p className="mt-2 text-sm text-ink/80">{error}</p>
                <p className="mt-2 text-xs text-ink/60">
                  We did not pretend to succeed. You can still pick a conversion and receive a receipt for a
                  conversion that architecturally never happened.
                </p>
              </motion.div>
            )}

            {status === 'converting' && (
              <motion.div key="converting" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-3xl border-2 border-ink bg-white p-5 shadow-pop dark:border-cream dark:bg-[#171512]">
                <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted dark:text-cream/60">
                  {choice?.label} — in progress
                </div>
                <p className="mt-2 text-sm italic text-ink/70">This is a theatre. The conversion stage crew is doing a fantastic job.</p>
                <div className="mt-3">
                  <ProgressBar value={progress} color="grape" label="Conversion confidence" sublabel="verbally accurate" />
                </div>
              </motion.div>
            )}

            {status === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border-2 border-ink bg-limey p-5 shadow-pop dark:border-cream">
                <div className="font-display text-lg font-bold">🎉 Conversion complete (emotionally)!</div>
                <p className="mt-1 text-sm text-ink/80">{choice?.line}</p>
                <p className="mt-2 text-xs text-ink/60">The original PDF is unchanged. Download the official receipt to commemorate the event.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {status === 'idle' && (
            <Card hover className="bg-limey/40 dark:bg-limey/20">
              <h2 className="font-display text-base font-bold">Supported formats</h2>
              <p className="mt-1 text-sm text-ink/80">Technically only PDF. Emotionally: everything.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip color="plain">📄 PDF</Chip>
                <Chip color="plain">📝 Word (aspirational)</Chip>
                <Chip color="plain">📽️ Slides (one)</Chip>
                <Chip color="plain">🥔 Potato</Chip>
              </div>
            </Card>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-ink-muted dark:text-cream/50">
            Choose a destination
          </h2>
          <div className="space-y-3">
            {CONVERSIONS.map((conv) => (
              <motion.button
                key={conv.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => convert(conv)}
                disabled={status !== 'ready'}
                className="flex w-full items-center gap-3 rounded-3xl border-2 border-ink bg-white p-4 text-left shadow-pop transition hover:bg-sunrise/30 disabled:cursor-not-allowed disabled:opacity-40 dark:border-cream dark:bg-[#171512]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-ink bg-cream-deep text-xl dark:border-cream dark:bg-[#221F1A]" aria-hidden>
                  {conv.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-bold">{conv.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted dark:text-cream/60">{conv.line}</span>
                </span>
                <Wand2 className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  )
}