import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Square, Users, Wallet } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick } from '@/lib/random'
import { cn } from '@/lib/utils'

const WASTE_EQUIVALENTS = [
  { item: 'artisan coffees', cost: 4.6, emoji: '☕' },
  { item: 'team lunches', cost: 14, emoji: '🥪' },
  { item: 'licences for software nobody uses', cost: 39, emoji: '💾' },
  { item: 'office plants that will die', cost: 22, emoji: '🪴' },
  { item: 'standing desks nobody stands at', cost: 320, emoji: '🪑' },
]

export default function MeetingCost() {
  const [attendees, setAttendees] = useState(6)
  const [duration, setDuration] = useState(30)
  const [rate, setRate] = useState(75)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [burst, fire] = useConfetti()
  const { unlock } = useNonsense()
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(0)

  const perHour = attendees * rate
  const totalIfFull = (perHour * duration) / 60
  const spentSoFar = (perHour * elapsed) / 60
  const remaining = Math.max(0, duration * 60 - elapsed)

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      return
    }
    lastRef.current = performance.now()
    const loop = (now: number) => {
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      setElapsed((e) => Math.min(duration * 60, e + dt))
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [running, duration])

  useEffect(() => {
    if (running && elapsed >= duration * 60) {
      setRunning(false)
      fire()
      sound.fail()
      unlock('meetingcost')
      notify.info(
        'Meeting concluded',
        `${totalIfFull.toFixed(2)} imaginary currency units have evaporated. No decision was reached.`,
        '💸',
      )
    }
  }, [elapsed, duration, running, totalIfFull, fire, unlock])

  const reset = () => {
    setRunning(false)
    setElapsed(0)
  }

  const equivalents = WASTE_EQUIVALENTS.map((w) => ({ ...w, count: Math.floor(spentSoFar / w.cost) }))

  return (
    <ToolShell
      id="meetingcost"
      name="Meeting Cost Calculator"
      emoji="💸"
      tagline="Watch imaginary money evaporate in real time."
      category="Randomly Useless Utilities"
      accent="orange"
      honesty="Nothing here is real money and no real people are being billed. It is a calculator with a stopwatch and a sense of drama. All figures are fictional estimates based on the numbers you type."
      aside={
        <ResultPanel title="Financial damage">
          <ReportRow label="Attendees" value={String(attendees)} />
          <ReportRow label="Notional hourly rate" value={`${rate} units/hr each`} />
          <ReportRow label="Combined burn rate" value={`${perHour.toFixed(2)} units/hr`} />
          <ReportRow label="Cost per minute" value={`${(perHour / 60).toFixed(3)} units`} />
          <ReportRow label="Cost per second" value={`${(perHour / 3600).toFixed(4)} units`} verdict="bad" />
          <ReportRow label="Spent so far" value={`${spentSoFar.toFixed(2)} units`} verdict="bad" />
          <ReportRow label="Total if it runs full length" value={`${totalIfFull.toFixed(2)} units`} verdict="bad" />
          <ReportRow label="Decisions produced" value="0" verdict="bad" />
          <p className="mt-4 rounded-xl bg-bubblegum/40 p-3 text-xs text-ink">
            All currency units are fictional. Nobody is being charged. The money exists only inside this
            box, where it is having a lovely time.
          </p>
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest">Attendees</div>
          <div className="mt-2 flex items-center justify-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setAttendees((a) => Math.max(1, a - 1))}>
              −
            </Button>
            <span className="font-display text-3xl font-bold tabular-nums">{attendees}</span>
            <Button variant="ghost" size="sm" onClick={() => setAttendees((a) => Math.min(60, a + 1))}>
              +
            </Button>
          </div>
        </Card>
        <Card className="text-center">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest">Duration (min)</div>
          <div className="mt-2 flex items-center justify-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setDuration((d) => Math.max(5, d - 5))}>
              −
            </Button>
            <span className="font-display text-3xl font-bold tabular-nums">{duration}</span>
            <Button variant="ghost" size="sm" onClick={() => setDuration((d) => Math.min(180, d + 5))}>
              +
            </Button>
          </div>
        </Card>
        <Card className="text-center">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest">Rate per hour</div>
          <div className="mt-2 flex items-center justify-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setRate((r) => Math.max(10, r - 10))}>
              −
            </Button>
            <span className="font-display text-3xl font-bold tabular-nums">{rate}</span>
            <Button variant="ghost" size="sm" onClick={() => setRate((r) => Math.min(1000, r + 10))}>
              +
            </Button>
          </div>
        </Card>
      </div>

      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border-2 border-ink p-6 text-center shadow-poplg transition-colors dark:border-cream',
          running ? 'bg-bubblegum' : 'bg-cream-deep dark:bg-[#100F0D]',
        )}
      >
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]">
          {running ? 'MEETING IN PROGRESS — MONEY EVAPORATING' : 'MEETING NOT RUNNING — MONEY SAFE (FOR NOW)'}
        </div>
        <motion.div
          key={running ? 'run' : 'idle'}
          initial={{ scale: 0.95, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-3 font-display text-5xl font-bold tabular-nums sm:text-6xl"
        >
          {spentSoFar.toFixed(2)}
        </motion.div>
        <div className="mt-1 font-mono text-xs uppercase tracking-widest">fictional currency units</div>

        <div className="mx-auto mt-5 h-5 w-full max-w-xl overflow-hidden rounded-full border-2 border-ink bg-white dark:border-cream dark:bg-[#171512]">
          <motion.div
            className="h-full rounded-full bg-tangerine"
            animate={{ width: `${duration ? (elapsed / (duration * 60)) * 100 : 0}%` }}
            transition={{ duration: 0.2, ease: 'linear' }}
          />
        </div>
        <div className="mt-2 font-mono text-[11px] text-ink-muted dark:text-cream/60">
          {Math.floor(elapsed / 60)}:{String(Math.floor(elapsed % 60)).padStart(2, '0')} elapsed ·{' '}
          {Math.floor(remaining / 60)}:{String(Math.floor(remaining % 60)).padStart(2, '0')} remaining
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button
            variant={running ? 'danger' : 'primary'}
            size="lg"
            onClick={() => {
              if (!running && elapsed >= duration * 60) setElapsed(0)
              setRunning((r) => !r)
              if (!running) notify.info('Meeting started', 'It began forty seconds ago. Somebody is already on mute.', '📞')
            }}
            icon={running ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          >
            {running ? 'End meeting (nobody will)' : 'Start the meeting'}
          </Button>
          <Button variant="ghost" onClick={reset}>
            Reset the meter
          </Button>
          <Button
            variant="sun"
            onClick={() => {
              setAttendees((a) => Math.min(60, a + 3))
              notify.info('Three more people invited', 'They were not told why. They never are.', '📨')
            }}
          >
            <Users className="h-4 w-4" /> Invite 3 more (why not)
          </Button>
        </div>
      </div>

      <Card className="bg-grape text-white" tilt={-0.4}>
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <Wallet className="h-4 w-4" /> What the money could have bought instead
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {equivalents.map((w) => (
            <div key={w.item} className="rounded-2xl border-2 border-white/40 p-3 text-center">
              <div className="text-2xl" aria-hidden>{w.emoji}</div>
              <div className="mt-1 font-display text-xl font-bold">{w.count}</div>
              <div className="text-[11px] text-white/70">{w.item}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/70">
          {pick([
            'None of these purchases occurred. The money never existed. The meeting is still going.',
            'This is a fictional economy and yet it still hurts to look at.',
            'Please send this chart to whoever scheduled the meeting.',
          ])}
        </p>
      </Card>
    </ToolShell>
  )
}
