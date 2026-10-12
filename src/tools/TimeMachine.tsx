import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, RotateCcw } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { formatDuration } from '@/lib/utils'
import { pick } from '@/lib/random'

const COUNTDOWN_LABELS = [
  'Calibrating temporal disappointment…',
  'Borrowing a second from next Tuesday…',
  'Convincing the clock to go backwards…',
  'The clock has agreed, reluctantly, to consider it…',
  'Measuring the exact quantity of time you wasted…',
  'Result: zero. Again. Consistent. Reliable. Zero.',
]

const ACHIEVEMENT_TITLES = [
  'Temporal Auditor, Grade III',
  'Certified Chronological Pessimist',
  'Keeper of the Unrecovered Minute',
  'Associate Time Reversal Technician',
  'Senior Vice President of Yesterday',
]

export default function TimeMachine() {
  const [reversing, setReversing] = useState(false)
  const [label, setLabel] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [totalReversed, setTotalReversed] = useState(0)
  const [title, setTitle] = useState<string | null>(null)
  const [burst, fire] = useConfetti()
  const { stats, unlock } = useNonsense()
  const timers = useRef<number[]>([])

  const reverse = useCallback(() => {
    if (reversing) return
    setReversing(true)
    setTitle(null)
    sound.whoosh()
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []

    COUNTDOWN_LABELS.forEach((l, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setLabel(l)
          sound.click()
        }, i * 560),
      )
    })

    timers.current.push(
      window.setTimeout(
        () => {
          setReversing(false)
          setAttempts((a) => a + 1)
          setTotalReversed((t) => t + 0)
          const earned = pick(ACHIEVEMENT_TITLES)
          setTitle(earned)
          fire()
          sound.fail()
          unlock('time')
          notify.info(
            'Time successfully reversed',
            'By 0 seconds. You are welcome. Please continue wasting time as before.',
            '⏰',
          )
        },
        COUNTDOWN_LABELS.length * 560 + 300,
      ),
    )
  }, [reversing, fire, unlock])

  const hoursWasted = stats.secondsDoingNothing / 3600
  const equivalent = `${(hoursWasted * 60).toFixed(1)} minutes`
  const timeTravelAchievements = Math.floor(stats.secondsDoingNothing / 60)

  return (
    <ToolShell
      id="timemachine"
      name="The Time Machine"
      emoji="⏰"
      tagline="Recover the time you just wasted. Results may vary."
      category="Time-Wasting Machines"
      accent="grape"
      honesty="Time cannot be reversed by a website. This tool genuinely measures how long you have had this tab open and genuinely reverses exactly none of it. Every achievement below is fictional."
      aside={
        <ResultPanel title="Temporal readout">
          <ReportRow label="Reversal attempts" value={String(attempts)} />
          <ReportRow label="Seconds reversed (total)" value={String(totalReversed)} verdict="bad" />
          <ReportRow label="Time on this site" value={formatDuration(stats.secondsDoingNothing)} />
          <ReportRow label="Equivalent wasted" value={equivalent} verdict="bad" />
          <ReportRow label="Time-travel achievements" value={String(timeTravelAchievements)} />
          <ReportRow label="Achievement value" value="None" verdict="bad" />
          {title && (
            <div className="mt-4 rounded-2xl border-2 border-ink bg-grape p-3 text-white dark:border-cream">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                New imaginary title
              </div>
              <div className="font-display text-lg font-bold">{title}</div>
            </div>
          )}
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <div className="grid place-items-center rounded-3xl border-2 border-ink bg-cream-deep px-6 py-10 dark:border-cream dark:bg-[#100F0D]">
        {/* the clock */}
        <motion.div
          className="relative grid h-52 w-52 place-items-center rounded-full border-[6px] border-ink bg-white shadow-poplg dark:border-cream dark:bg-[#171512]"
          animate={reversing ? { rotate: -360 * 6 } : { rotate: 0 }}
          transition={reversing ? { duration: 3.4, ease: 'easeInOut' } : { type: 'spring', stiffness: 120 }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 rounded-full bg-ink/40 dark:bg-cream/40"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-88px)`,
              }}
            />
          ))}
          <span className="absolute left-1/2 top-1/2 h-16 w-1.5 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-tangerine" />
          <span className="absolute left-1/2 top-1/2 h-20 w-1 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-ink dark:bg-cream" />
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bubblegum" />
        </motion.div>

        <div className="mt-6 min-h-[3rem] text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={label || 'idle'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-md font-display text-base font-bold"
            >
              {reversing ? label : 'Press the button. Time will not reverse. We will both pretend.'}
            </motion.p>
          </AnimatePresence>
        </div>

        <Button
          variant="grape"
          size="xl"
          className="mt-4"
          onClick={reverse}
          disabled={reversing}
          icon={<History className={reversing ? 'h-5 w-5 animate-spin' : 'h-5 w-5'} />}
        >
          {reversing ? 'Reversing time…' : 'Reverse time'}
        </Button>

        {title && !reversing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-2xl border-2 border-ink bg-sunrise px-5 py-3 text-center shadow-pop dark:border-cream"
          >
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest">
              Time successfully reversed by 0 seconds
            </div>
            <div className="mt-1 font-display text-lg font-bold">You're welcome.</div>
          </motion.div>
        )}
      </div>

      <Card className="bg-grape text-white" tilt={-0.5}>
        <h2 className="font-display text-base font-bold">Your time-travel record</h2>
        <p className="mt-2 text-sm text-white/80">
          You have attempted to reverse time {attempts}{' '}
          {attempts === 1 ? 'time' : 'times'}, successfully recovering {totalReversed} seconds. Meanwhile,
          this website has measured {formatDuration(stats.secondsDoingNothing)} of your life and stored it
          in your browser, where it will sit forever, quietly, like a small monument.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip color="plain">Time-travel tier: {timeTravelAchievements}</Chip>
          <Chip color="sun">Recovered: {totalReversed}s</Chip>
          <Chip color="pink">Role: {title ?? 'Not yet appointed'}</Chip>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="sun"
            onClick={() => {
              setAttempts(0)
              setTotalReversed(0)
              setTitle(null)
              setLabel('')
              notify.success('Temporal history cleared', 'The past is blank. The future is also blank. Progress.', '🧹')
            }}
            icon={<RotateCcw className="h-4 w-4" />}
          >
            Reset my timeline
          </Button>
          <span className="self-center font-mono text-[11px] text-white/60">
            Resetting does not recover any seconds. Obviously.
          </span>
        </div>
      </Card>
    </ToolShell>
  )
}
