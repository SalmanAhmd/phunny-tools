import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, RotateCcw, Siren } from 'lucide-react'
import { GameShell, ScoreBanner } from '@/components/ui/GameShell'
import { Button } from '@/components/ui/Button'
import { cn, clamp } from '@/lib/utils'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick } from '@/lib/random'

interface Bug {
  id: number
  label: string
  emoji: string
  points: number
  isFeatureRequest?: boolean
}

const BUGS: Bug[] = [
  { id: 1, label: 'undefined', emoji: '❓', points: 2 },
  { id: 2, label: 'null', emoji: '␀', points: 2 },
  { id: 3, label: 'works_on_my_machine', emoji: '💻', points: 3 },
  { id: 4, label: 'production_bug', emoji: '🔥', points: 5 },
  { id: 5, label: 'one_small_CSS_issue', emoji: '🎨', points: 1 },
]

const FEATURE_REQUEST: Bug = {
  id: 99,
  label: 'FEATURE REQUEST',
  emoji: '📈',
  points: -8,
  isFeatureRequest: true,
}

interface Slot {
  bug: Bug
  instanceId: number
  bornAt: number
}

const HOLES = 9
const GAME_SECONDS = 45

const REVIEWS = [
  { min: 90, title: 'Principal Debugger', body: 'You fixed everything except the actual problem. Outstanding.' },
  { min: 60, title: 'Senior Bug Wrangler', body: 'Production is still broken but it is broken more slowly now.' },
  { min: 35, title: 'Mid-level Maintainer', body: 'A solid performance. Mostly by accident, we assume.' },
  { min: 15, title: 'Junior Hotfix Enthusiast', body: 'You clicked things. Some of them were bugs. Growth mindset.' },
  { min: 0, title: 'Unpaid Intern', body: 'The bugs have filed a complaint about you specifically.' },
]

export default function WhackABug() {
  const [slots, setSlots] = useState<(Slot | null)[]>(Array(HOLES).fill(null))
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [streetCred, setStreetCred] = useState(0)
  const [lastHit, setLastHit] = useState<{ label: string; points: number; id: number } | null>(null)
  const instanceRef = useRef(0)
  const timeouts = useRef<number[]>([])
  const { unlock, registerGame } = useNonsense()

  const clearAll = useCallback(() => {
    timeouts.current.forEach((t) => window.clearTimeout(t))
    timeouts.current = []
  }, [])

  useEffect(() => () => clearAll(), [clearAll])

  const elapsed = GAME_SECONDS - timeLeft
  const difficulty = clamp(1 + elapsed / 14, 1, 3.6)

  // spawn loop
  useEffect(() => {
    if (!running) return
    let cancelled = false

    const spawn = () => {
      if (cancelled) return
      setSlots((prev) => {
        const free = prev.map((s, i) => (s ? -1 : i)).filter((i) => i >= 0)
        if (!free.length) return prev
        const index = free[Math.floor(Math.random() * free.length)]
        const isFeature = Math.random() < 0.12
        const bug = isFeature ? FEATURE_REQUEST : pick(BUGS)
        const instanceId = ++instanceRef.current
        const lifetime = clamp((1500 - elapsed * 22) * (isFeature ? 1.6 : 1), 520, 2000)
        const next = [...prev]
        next[index] = { bug, instanceId, bornAt: performance.now() }
        timeouts.current.push(
          window.setTimeout(() => {
            setSlots((cur) => cur.map((s) => (s && s.instanceId === instanceId ? null : s)))
          }, lifetime),
        )
        return next
      })
      const interval = clamp(760 / difficulty, 200, 900)
      timeouts.current.push(window.setTimeout(spawn, interval + Math.random() * 220))
    }

    timeouts.current.push(window.setTimeout(spawn, 300))
    return () => {
      cancelled = true
    }
  }, [running, difficulty, elapsed])

  // timer
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setRunning(false)
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  const start = () => {
    clearAll()
    setSlots(Array(HOLES).fill(null))
    setScore(0)
    setMisses(0)
    setTimeLeft(GAME_SECONDS)
    setFinished(false)
    setStreetCred(0)
    setLastHit(null)
    setRunning(true)
    registerGame('game-whack')
    sound.pop()
  }

  const hit = (index: number) => {
    if (!running) return
    const slot = slots[index]
    if (!slot) {
      setMisses((m) => m + 1)
      sound.error()
      setStreetCred((c) => c + 1)
      return
    }
    const { bug, instanceId } = slot
    setSlots((cur) => cur.map((s) => (s && s.instanceId === instanceId ? null : s)))
    if (bug.isFeatureRequest) {
      setScore((s) => Math.max(0, s + bug.points))
      sound.fail()
      setLastHit({ label: 'SCOPE CREEP! -8', points: -8, id: instanceId })
    } else {
      setScore((s) => s + bug.points)
      sound.pop()
      setLastHit({ label: `+${bug.points} ${bug.label}`, points: bug.points, id: instanceId })
    }
  }

  const review = REVIEWS.find((r) => score >= r.min) ?? REVIEWS[REVIEWS.length - 1]

  useEffect(() => {
    if (!finished) return
    setHighScore((h) => Math.max(h, score))
    unlock('game-whack')
    sound.fanfare()
  }, [finished, score, unlock])

  return (
    <GameShell
      name="Whack-a-Bug"
      emoji="🐛"
      tagline="A parody of debugging: hit the bugs before they ship themselves."
      accent="orange"
      honesty="This is a game. No real bugs are harmed, no real code is fixed, and no actual production systems are involved. The feature requests are fictional but you will still resent them."
      controls={
        <>
          <Button variant="primary" onClick={start} icon={finished || !running ? <Play className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}>
            {running ? 'Restart' : finished ? 'Play again' : 'Start debugging'}
          </Button>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
            <Siren className="h-3.5 w-3.5" /> Avoid the giant FEATURE REQUEST
          </span>
        </>
      }
    >
      <div className="mb-4">
        <ScoreBanner
          items={[
            { label: 'Score', value: score, tone: 'good' },
            { label: 'Time left', value: `${timeLeft}s` },
            { label: 'Misses', value: misses, tone: misses > 5 ? 'bad' : 'default' },
            { label: 'Session best', value: highScore },
          ]}
        />
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 gap-3 rounded-3xl border-2 border-ink bg-cream-deep p-4 shadow-pop dark:border-cream dark:bg-[#100F0D]">
          {slots.map((slot, i) => (
            <button
              key={i}
              type="button"
              onClick={() => hit(i)}
              className={cn(
                'relative grid h-24 place-items-center overflow-hidden rounded-3xl border-2 border-ink transition sm:h-28 dark:border-cream',
                slot ? 'bg-white dark:bg-[#171512]' : 'bg-ink/85 dark:bg-[#221F1A]',
              )}
              aria-label={slot ? `Bug: ${slot.bug.label}` : `Empty hole ${i + 1}`}
            >
              {/* hole */}
              <span
                aria-hidden
                className={cn(
                  'absolute bottom-3 h-6 w-16 rounded-full border-2 border-ink transition dark:border-cream',
                  slot ? 'bg-ink' : 'bg-cream-deep dark:bg-[#0E0D0B]',
                )}
              />
              <AnimatePresence>
                {slot && (
                  <motion.span
                    key={slot.instanceId}
                    initial={{ y: 46, scale: 0.5, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 40, scale: 0.6, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 24 }}
                    className={cn(
                      'relative z-10 flex flex-col items-center gap-1',
                      slot.bug.isFeatureRequest && 'text-bubblegum',
                    )}
                  >
                    <span className={cn('leading-none', slot.bug.isFeatureRequest ? 'text-4xl' : 'text-3xl')} aria-hidden>
                      {slot.bug.emoji}
                    </span>
                    <span
                      className={cn(
                        'max-w-[7rem] truncate rounded-full border border-ink bg-sunrise px-1.5 py-0.5 font-mono text-[8px] font-bold leading-tight text-ink',
                        slot.bug.isFeatureRequest && 'bg-bubblegum',
                      )}
                    >
                      {slot.bug.label}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {lastHit && running && (
            <motion.div
              key={lastHit.id}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className={cn(
                'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 font-display text-xl font-bold',
                lastHit.points > 0 ? 'text-limey' : 'text-bubblegum',
              )}
            >
              {lastHit.label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-3xl border-2 border-ink bg-sunrise p-6 shadow-poplg dark:border-cream"
        >
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em]">Performance review</div>
          <h2 className="mt-2 font-display text-2xl font-bold">{review.title}</h2>
          <p className="mt-2 max-w-xl text-sm text-ink/80">{review.body}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-2xl border-2 border-ink bg-white/70 p-3 dark:border-cream dark:bg-[#171512]/70">
              <div className="font-mono text-[10px] uppercase tracking-widest">Final score</div>
              <div className="font-display text-xl font-bold">{score}</div>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-white/70 p-3 dark:border-cream dark:bg-[#171512]/70">
              <div className="font-mono text-[10px] uppercase tracking-widest">Missed clicks</div>
              <div className="font-display text-xl font-bold">{misses}</div>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-white/70 p-3 dark:border-cream dark:bg-[#171512]/70">
              <div className="font-mono text-[10px] uppercase tracking-widest">Session best</div>
              <div className="font-display text-xl font-bold">{highScore}</div>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-white/70 p-3 dark:border-cream dark:bg-[#171512]/70">
              <div className="font-mono text-[10px] uppercase tracking-widest">Escaped bugs</div>
              <div className="font-display text-xl font-bold">{clamp(streetCred, 0, 999)}</div>
            </div>
          </div>
          <p className="mt-4 text-xs italic text-ink/70">
            Bugs still in production: all of them. Your score has been added to nothing.
          </p>
          <Button variant="grape" className="mt-4" onClick={start} icon={<RotateCcw className="h-4 w-4" />}>
            Debug again
          </Button>
        </motion.div>
      )}

      {!running && !finished && (
        <p className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-ink-muted dark:text-cream/50">
          Press start, then click bugs. The big one is a trap.
        </p>
      )}
    </GameShell>
  )
}
