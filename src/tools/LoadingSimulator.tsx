import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, RotateCcw, Timer } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { useChaoticProgress } from '@/components/ui/ProgressBar'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick, randInt } from '@/lib/random'
import { cn } from '@/lib/utils'

const STAGES: { at: number; text: string }[] = [
  { at: 0, text: 'Thinking about starting.' },
  { at: 1, text: 'Thinking about starting.' },
  { at: 12, text: 'Warming up the CPU emotionally.' },
  { at: 24, text: 'Locating the file in question. It has moved.' },
  { at: 37, text: 'A minor inconvenience has occurred.' },
  { at: 52, text: 'Consulting the manual. The manual is a napkin.' },
  { at: 68, text: 'Almost ready to begin.' },
  { at: 79, text: 'Rewriting the thing we just wrote.' },
  { at: 89, text: 'Reconsidering life choices.' },
  { at: 96, text: 'Waiting for approval from management.' },
  { at: 99, text: 'Waiting for approval from management.' },
  { at: 100, text: 'Congratulations. Nothing happened.' },
]

const FAKE_ERRORS = [
  'Error 0x00: everything is technically fine.',
  'Warning: progress exceeded expectations and was reduced.',
  'Connection to the concept of progress was lost.',
  'A stakeholder has requested a redesign at 98%.',
  'Unhandled exception: enthusiasm.',
  'Reminder: this loading bar is not loading anything.',
  'The file has asked for more time.',
]

export default function LoadingSimulator() {
  const { progress, setProgress, running } = useChaoticProgress()
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const [cancels, setCancels] = useState(0)
  const [errorsOn, setErrorsOn] = useState(true)
  const [events, setEvents] = useState<{ id: number; text: string; kind: 'stage' | 'error' }[]>([])
  const [burst, fire] = useConfetti()
  const { unlock } = useNonsense()
  const lastStage = useRef(-1)
  const eventId = useRef(0)

  const currentStage = useMemo(() => {
    let stage = STAGES[0]
    for (const s of STAGES) if (progress >= s.at) stage = s
    return stage
  }, [progress])

  useEffect(() => {
    if (!started) return
    if (STAGES.findIndex((s) => s === currentStage) !== lastStage.current) {
      lastStage.current = STAGES.findIndex((s) => s === currentStage)
      setEvents((e) =>
        [{ id: ++eventId.current, text: `${Math.floor(progress)}% — ${currentStage.text}`, kind: 'stage' as const }, ...e].slice(0, 14),
      )
    }
  }, [currentStage, progress, started])

  useEffect(() => {
    if (!started || !errorsOn || done) return
    const id = window.setInterval(() => {
      if (Math.random() < 0.22) {
        const text = pick(FAKE_ERRORS)
        setEvents((e) => [{ id: ++eventId.current, text, kind: 'error' as const }, ...e].slice(0, 14))
        sound.error()
      }
    }, 2600)
    return () => window.clearInterval(id)
  }, [started, errorsOn, done])

  useEffect(() => {
    if (progress >= 100 && !done) {
      setDone(true)
      fire()
      sound.fanfare()
      unlock('loading')
      notify.success('Loading complete', 'Nothing was loaded. The bar simply ran out of purpose.', '⏳')
    }
  }, [progress, done, fire, unlock])

  const start = () => {
    setStarted(true)
    setDone(false)
    setEvents([])
    lastStage.current = -1
    setProgress(0.5)
    sound.pop()
    window.setTimeout(() => {
      if (Math.random() < 0.7) {
        notify.info('Loading started', 'This will take approximately forever. Thank you for your patience.', '🚀')
      }
    }, 600)
  }

  const reset = () => {
    setStarted(false)
    setDone(false)
    setProgress(0)
    setEvents([])
    lastStage.current = -1
  }

  const cancel = () => {
    setCancels((c) => c + 1)
    sound.fail()
    notify.error(
      'Cancellation failed',
      pick([
        'The cancel button has been added to the backlog and will be reviewed next quarter.',
        'You cannot cancel progress. Progress cancels you.',
        'Cancel request submitted. A meeting has been scheduled to discuss it.',
      ]),
      '🚫',
    )
  }

  const percent = Math.min(100, Math.floor(progress))

  return (
    <ToolShell
      id="loading"
      name="Loading Bar Simulator"
      emoji="⏳"
      tagline="Experience the thrill of waiting for absolutely nothing."
      category="Time-Wasting Machines"
      accent="sun"
      honesty="Nothing is loading. No process is running. The bar is a decorative number that occasionally moves backwards on purpose. This is the entire product."
      aside={
        <ResultPanel title="Session summary">
          <ReportRow label="Progress achieved" value={`${percent}%`} verdict={percent >= 100 ? 'bad' : 'neutral'} />
          <ReportRow label="Files loaded" value="0" />
          <ReportRow label="Bytes transferred" value="0 B" />
          <ReportRow label="Cancel attempts" value={String(cancels)} verdict={cancels > 0 ? 'bad' : 'neutral'} />
          <ReportRow label="Time reclaimed" value="None" verdict="bad" />
          <ReportRow label="Sensation of progress" value="Strong" verdict="good" />
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-sunrise/70 p-3 text-xs">
            <Timer className="h-4 w-4 shrink-0" aria-hidden />
            Progress bars are the cheapest form of entertainment ever engineered. We are proud of this one.
          </div>
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={60} />

      <Card className="bg-cream-deep dark:bg-[#100F0D]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Chip color="sun">
            {started ? (done ? 'Finished (allegedly)' : 'Loading something') : 'Idle and unbothered'}
          </Chip>
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
            <input
              type="checkbox"
              checked={errorsOn}
              onChange={(e) => setErrorsOn(e.target.checked)}
              className="h-4 w-4 accent-[#FF6A00]"
            />
            Fake error messages
          </label>
        </div>

        {/* the bar, but enormous */}
        <div className="rounded-2xl border-2 border-ink bg-white p-5 dark:border-cream dark:bg-[#171512]">
          <div className="mb-3 flex items-end justify-between gap-4">
            <motion.span
              key={percent}
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-5xl font-bold tabular-nums sm:text-6xl"
            >
              {percent}%
            </motion.span>
            <span className="max-w-[60%] text-right font-display text-sm font-bold">
              {started ? currentStage.text : 'Press start to begin achieving nothing.'}
            </span>
          </div>

          <div className="relative h-10 w-full overflow-hidden rounded-full border-2 border-ink bg-cream-deep dark:border-cream dark:bg-[#100F0D]">
            {/* stripes */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #0D0C0A 0 8px, transparent 8px 16px)',
              }}
            />
            <motion.div
              className={cn('relative h-full rounded-full', done ? 'bg-limey' : 'bg-tangerine')}
              animate={{ width: `${percent}%` }}
              transition={{ type: 'spring', stiffness: 90, damping: 20 }}
            />
            {running && (
              <motion.div
                aria-hidden
                className="absolute inset-y-0 w-16 bg-white/40 blur-md"
                animate={{ x: ['-4rem', '100%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" onClick={start} icon={<Play className="h-4 w-4" />}>
              {done ? 'Load nothing again' : started ? 'Restart loading' : 'Start loading nothing'}
            </Button>
            {started && !done && (
              <Button variant="ghost" onClick={cancel}>
                Cancel {cancels > 0 && `(${cancels})`}
              </Button>
            )}
            {started && (
              <Button variant="ghost" onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
                Reset
              </Button>
            )}
            <Button
              variant="sun"
              onClick={() => {
                setProgress((p) => Math.max(0, p - randInt(8, 25)))
                sound.error()
                notify.info('Negative progress', 'We have moved the bar backwards. For realism.', '↩️')
              }}
              disabled={!started}
            >
              Undo progress
            </Button>
          </div>
        </div>
      </Card>

      {/* event log */}
      <Card>
        <h2 className="font-display text-sm font-bold uppercase tracking-wide">Dramatic event log</h2>
        <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto font-mono text-xs">
          <AnimatePresence initial={false}>
            {events.length === 0 && (
              <p className="text-ink-muted dark:text-cream/50">Nothing has happened yet. It will continue to not happen.</p>
            )}
            {events.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'flex items-start gap-2 rounded-lg px-2 py-1',
                  e.kind === 'error' ? 'bg-bubblegum/40 text-ink' : 'text-ink-muted dark:text-cream/60',
                )}
              >
                <span aria-hidden>{e.kind === 'error' ? '⚠️' : '›'}</span>
                <span>{e.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    </ToolShell>
  )
}
