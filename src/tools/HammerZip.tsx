import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hammer, RotateCcw, ShieldCheck } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { FileDropZone } from '@/components/ui/FileDropZone'
import { Button } from '@/components/ui/Button'
import { Chip, Card } from '@/components/ui/Primitives'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { toolFileMeta, formatBytes, cn } from '@/lib/utils'
import { sound } from '@/lib/sound'
import { notify } from '@/lib/toastBus'
import { useNonsense } from '@/store/nonsense'
import { usePrefs } from '@/store/prefs'
import { pick } from '@/lib/random'

const MESSAGES = [
  "Analyzing file's emotional weight…",
  'Applying brute-force compression algorithms…',
  'Removing unnecessary pixels from your spreadsheet…',
  'Negotiating with the file…',
  'Asking the file to become smaller…',
  'Consulting a medieval compression manual…',
  'Rendering the file mildly intimidated…',
  'Filing form 27B/6 with the compression authorities…',
  'Explaining the concept of "less" to the file…',
  'Hammering. Just hammering. That is the algorithm.',
]

const DAMAGE_VERDICTS = [
  'Severe',
  'Emotionally significant',
  'Structurally questionable',
  'Dentally concerning',
  'Legally ambiguous',
]

type Phase = 'idle' | 'working' | 'done'

function HammerScene({ swinging, flat }: { swinging: boolean; flat: number }) {
  const { reducedMotion } = usePrefs()
  return (
    <div className="relative grid h-56 place-items-center overflow-hidden rounded-3xl border-2 border-ink bg-cream-deep dark:border-cream dark:bg-[#100F0D]">
      {/* dust */}
      <AnimatePresence>
        {swinging && !reducedMotion && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={`dust-${i}`}
                initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                animate={{ opacity: [0, 0.8, 0], scale: 1.8, x: [-20, 20, -10][i], y: [-10, -30][i % 2] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                className="absolute bottom-14 h-8 w-8 rounded-full bg-ink/20 blur-sm"
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* the file */}
      <motion.div
        aria-hidden
        animate={{
          scaleY: Math.max(0.28, 1 - flat * 0.14),
          rotate: flat * 2.5,
          y: flat * 6,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
        className="relative z-10 grid h-28 w-24 place-items-center rounded-xl border-2 border-ink bg-white shadow-pop dark:border-cream dark:bg-[#171512]"
      >
        <div className={cn('transition-all', flat > 2 && 'opacity-60')}>
          <div className="mx-auto mb-1 h-1.5 w-12 rounded bg-ink/30" />
          <div className="mx-auto mb-1 h-1.5 w-14 rounded bg-ink/30" />
          <div className="mx-auto h-1.5 w-8 rounded bg-ink/30" />
        </div>
        {flat > 4 && (
          <span className="absolute -right-2 -top-2 text-lg">💢</span>
        )}
        {flat > 7 && (
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] font-bold uppercase text-tangerine">
            structurally sad
          </span>
        )}
      </motion.div>

      {/* hammer */}
      <motion.div
        aria-hidden
        className="absolute right-10 top-4 z-20 origin-bottom-right text-6xl"
        animate={
          swinging && !reducedMotion
            ? { rotate: [-50, 10, -50], y: [-6, 10, -6] }
            : { rotate: -35 }
        }
        transition={{ duration: 0.42, repeat: swinging ? Infinity : 0, ease: 'easeIn' }}
      >
        🔨
      </motion.div>

      {/* impact star */}
      <AnimatePresence>
        {swinging && (
          <motion.div
            key="impact"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.6] }}
            transition={{ duration: 0.42, repeat: Infinity }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 text-5xl"
          >
            💥
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HammerZip() {
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [flat, setFlat] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [seenMessages, setSeenMessages] = useState<string[]>([])
  const [shakes, setShakes] = useState(0)
  const [hammerCount, setHammerCount] = useState(0)
  const [reports, setReports] = useState<{ damage: string; efficiency: string }[]>([])
  const [burst, fire] = useConfetti()
  const { unlock, registerFile } = useNonsense()
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const begin = useCallback(() => {
    if (!file || phase === 'working') return
    setPhase('working')
    setSeenMessages([])
    setMessageIndex(0)
    setFlat(0)
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []

    MESSAGES.forEach((msg, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setMessageIndex(i)
          setSeenMessages((prev) => [...prev, msg])
          if (i > 0) sound.hammer()
          setShakes((s) => s + 1)
          setFlat((f) => f + 1)
        }, i * 620),
      )
    })

    timers.current.push(
      window.setTimeout(
        () => {
          setPhase('done')
          setShakes((s) => s + 1)
          setHammerCount((c) => c + 1)
          const damage = pick(DAMAGE_VERDICTS)
          const efficiency = pick([
            'Emotionally devastating',
            'None detected',
            'Not applicable',
            'Legally none',
            'A rounding error of hope',
          ])
          setReports((r) => [{ damage, efficiency }, ...r].slice(0, 6))
          sound.fail()
          fire()
          notify.info(
            'Compression complete',
            'Nothing changed. Your file is exactly as it was. That is the whole point.',
            '🔨',
          )
          unlock('hammer')
          if (hammerCount + 1 >= 10) unlock('hammer-10')
        },
        MESSAGES.length * 620 + 400,
      ),
    )
  }, [file, phase, hammerCount, unlock])

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    setPhase('idle')
    setFlat(0)
    setSeenMessages([])
    setMessageIndex(0)
  }

  const handleFile = (f: File) => {
    setFile(f)
    registerFile()
    setPhase('idle')
    setFlat(0)
    setSeenMessages([])
    setReports([])
  }

  const progress = phase === 'idle' ? 0 : phase === 'done' ? 100 : Math.round(((messageIndex + 1) / MESSAGES.length) * 100)

  return (
    <ToolShell
      id="hammerzip"
      name="HammerZip"
      emoji="🔨"
      tagline="Reduce your file size using advanced medieval technology."
      category="File Destruction & Management"
      accent="orange"
      honesty="Nothing is compressed. Your file is never uploaded, never modified, and never opened. HammerZip only pretends to smash a cartoon copy of it. The real file stays on your device, exactly the same size."
      aside={
        <ResultPanel title="Compression report">
          <ReportRow label="Original size" value={file ? formatBytes(file.size) : '—'} />
          <ReportRow label="Final size" value={file ? formatBytes(file.size) : '—'} />
          <ReportRow
            label="Compression efficiency"
            value={phase === 'done' ? reports[0]?.efficiency ?? 'Emotionally devastating' : 'Pending'}
            verdict="bad"
          />
          <ReportRow label="Physical damage" value={phase === 'done' ? reports[0]?.damage ?? 'Severe' : 'Pending'} verdict="bad" />
          <ReportRow label="Digital improvement" value="None detected" verdict="neutral" />
          <ReportRow label="Hammers deployed" value={String(hammerCount)} />
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-limey/60 p-3 text-xs text-ink">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Your original file is untouched. Emailed to nobody. Stored nowhere. This is a comedy
            simulation, not a compression utility.
          </p>
          {phase === 'done' && (
            <div className="mt-4">
              <Button variant="primary" className="w-full" onClick={begin} icon={<Hammer className="h-4 w-4" />}>
                Hammer Again
              </Button>
            </div>
          )}
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} />

      <FileDropZone
        accept="any"
        onFile={handleFile}
        label="Feed the machine a file"
        hint="Any file type. We will not look inside it, mostly because we cannot."
        current={file ? { name: file.name, size: file.size } : null}
      />

      {file && (
        <>
          <motion.div
            key={shakes}
            animate={shakes ? { x: [0, -7, 6, -5, 4, 0], y: [0, 4, -5, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <HammerScene swinging={phase === 'working'} flat={flat} />
          </motion.div>

          <div className="rounded-3xl border-2 border-ink bg-white p-5 shadow-pop dark:border-cream dark:bg-[#171512]">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Chip color="orange">{toolFileMeta(file).ext.toUpperCase()}</Chip>
              <Chip color="plain">{formatBytes(file.size)}</Chip>
              <Chip color="lime">Untouched</Chip>
            </div>
            <ProgressBar
              value={progress}
              label={phase === 'idle' ? 'Awaiting violence' : phase === 'done' ? 'Done (nothing happened)' : 'Compressing'}
              sublabel={`${progress}%`}
              color="tangerine"
            />
            <div className="mt-4 min-h-[7rem] space-y-1.5 font-mono text-xs">
              <AnimatePresence initial={false}>
                {seenMessages.map((m) => (
                  <motion.div
                    key={m}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-ink-muted dark:text-cream/60"
                  >
                    <span className="text-limey">✔</span> {m}
                  </motion.div>
                ))}
              </AnimatePresence>
              {phase === 'working' && (
                <div className="flex items-center gap-2 text-tangerine">
                  <span className="animate-pulse">▌</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="danger"
                size="xl"
                onClick={begin}
                disabled={phase === 'working'}
                icon={<Hammer className={cn('h-5 w-5', phase === 'working' && 'animate-wobble')} />}
              >
                {phase === 'working' ? 'Compressing…' : 'Compress with Hammer'}
              </Button>
              {phase === 'done' && (
                <Button variant="ghost" size="lg" onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
                  Reset the cartoon
                </Button>
              )}
            </div>
          </div>

          {reports.length > 1 && (
            <Card>
              <h2 className="font-display text-sm font-bold uppercase tracking-wide">
                Historical hammering record
              </h2>
              <p className="mt-1 text-xs text-ink-muted dark:text-cream/60">
                All previous attempts produced identical results. We keep them anyway.
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                {reports.map((r, i) => (
                  <li key={i} className="flex items-center justify-between border-b-2 border-dashed border-ink/15 pb-1.5 font-mono last:border-0 dark:border-cream/15">
                    <span>Attempt #{reports.length - i}</span>
                    <span className="text-ink-muted dark:text-cream/60">
                      {r.efficiency} · damage: {r.damage}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </ToolShell>
  )
}
