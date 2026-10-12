import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MousePointerClick, Play, RotateCcw } from 'lucide-react'
import { GameShell, ScoreBanner } from '@/components/ui/GameShell'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick } from '@/lib/random'

type FallingKind = 'productivity' | 'snack' | 'meeting'

interface FallingItem {
  id: number
  kind: FallingKind
  emoji: string
  label: string
  x: number
  y: number
  speed: number
  points: number
}

const GOOD: Array<Pick<FallingItem, 'emoji' | 'label' | 'points'>> = [
  { emoji: '✅', label: 'task done', points: 1 },
  { emoji: '📈', label: 'synergy', points: 1 },
  { emoji: '⏰', label: 'punctuality', points: 2 },
  { emoji: '🎯', label: 'deadline met', points: 2 },
  { emoji: '💡', label: 'a good idea', points: 3 },
]

const BAD: Array<Pick<FallingItem, 'emoji' | 'label' | 'points'>> = [
  { emoji: '🍕', label: 'snack break', points: -2 },
  { emoji: '📅', label: 'status meeting', points: -3 },
  { emoji: '☕', label: 'coffee run', points: -1 },
  { emoji: '📱', label: 'phone scroll', points: -2 },
]

const GAME_SECONDS = 30

const REVIEWS = [
  { min: 30, title: 'Head of Productivity', body: 'You caught so much productivity that the concept became meaningless. Excellent.' },
  { min: 20, title: 'Focus Facilitator', body: 'A respectable haul, briefly interrupted by a slice of pizza. Relatable.' },
  { min: 10, title: 'Occasional Catcher', body: 'You caught some things. Some of them might have been productivity.' },
  { min: 0, title: 'Snack Connoisseur', body: 'You mostly caught snacks and meetings. A beautiful waste.' },
]

export default function CatchProductivity() {
  const [items, setItems] = useState<FallingItem[]>([])
  const [score, setScore] = useState(0)
  const [caught, setCaught] = useState(0)
  const [spawned, setSpawned] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const nextId = useRef(1)
  const { unlock, registerGame } = useNonsense()

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

  // spawn loop
  useEffect(() => {
    if (!running) return
    let lengthRef = items.length
    const spawn = () => {
      if (lengthRef >= 14) return
      const good = Math.random() < 0.65
      const base = good ? pick(GOOD) : pick(BAD)
      const item: FallingItem = {
        id: nextId.current++,
        kind: good ? 'productivity' : base.emoji === '📅' ? 'meeting' : 'snack',
        emoji: base.emoji,
        label: base.label,
        x: 4 + Math.random() * 84,
        y: -6,
        speed: 1.4 + Math.random() * 1.9,
        points: base.points,
      }
      lengthRef += 1
      setItems((prev) => [...prev, item])
      setSpawned((s) => s + 1)
    }
    const interval = window.setInterval(spawn, Math.max(420, 900 - (GAME_SECONDS - timeLeft) * 22))
    const first = window.setTimeout(spawn, 400)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(first)
    }
  }, [running, timeLeft, items.length])

  // fall physics
  useEffect(() => {
    if (!running) return
    let raf = 0
    const step = () => {
      setItems((prev) =>
        prev
          .map((it) => ({ ...it, y: it.y + it.speed }))
          .filter((it) => it.y <= 108),
      )
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [running])

  // escaped items are simply the difference between spawned and what remains visible
  const missed = Math.max(0, spawned - caught - items.length)

  const catchItem = (item: FallingItem) => {
    if (!running) return
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    setScore((s) => Math.max(-99, s + item.points))
    setCaught((c) => c + 1)
    if (item.points > 0) sound.pop()
    else sound.error()
  }

  const start = () => {
    nextId.current = 1
    setItems([])
    setScore(0)
    setCaught(0)
    setSpawned(0)
    setTimeLeft(GAME_SECONDS)
    setFinished(false)
    setRunning(true)
    registerGame('game-catch')
    sound.pop()
  }

  useEffect(() => {
    if (!finished) return
    unlock('game-catch')
    sound.fanfare()
  }, [finished, unlock])

  const review = REVIEWS.find((r) => score >= r.min) ?? REVIEWS[REVIEWS.length - 1]

  return (
    <GameShell
      name="Catch the Productivity"
      emoji="🧲"
      tagline="Catch productivity icons before they turn into snacks and meetings."
      accent="lime"
      honesty="This is a game. No real productivity is caught, and the snacks are fictional but deeply tempting. Your score lives only in this tab and means nothing to your employer."
      controls={
        <>
          <Button variant="primary" onClick={start} icon={running || finished ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}>
            {running ? 'Restart' : finished ? 'Play again' : 'Start catching'}
          </Button>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
            <MousePointerClick className="h-3.5 w-3.5" /> Click the good stuff. The snacks are a trap.
          </span>
        </>
      }
    >
      <div className="mb-4">
        <ScoreBanner
          items={[
            { label: 'Productivity caught', value: caught, tone: 'good' },
            { label: 'Score', value: score, tone: score < 0 ? 'bad' : 'default' },
            { label: 'Escaped', value: missed, tone: missed > 8 ? 'bad' : 'default' },
            { label: 'Time left', value: `${timeLeft}s` },
          ]}
        />
      </div>

      <div
        className="relative h-[26rem] overflow-hidden rounded-3xl border-2 border-ink bg-cream-deep p-4 shadow-pop dark:border-cream dark:bg-[#100F0D]"
        role="region"
        aria-label="Falling productivity game area"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#0D0C0A 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        />
        <p className="relative mb-2 text-center font-mono text-xs uppercase tracking-widest text-ink-muted dark:text-cream/50">
          {running ? 'The productivity is falling. Do something about it.' : 'Press start. The productivity will not wait.'}
        </p>
        {items.map((it) => (
          <motion.button
            key={it.id}
            type="button"
            onClick={() => catchItem(it)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className={cn(
              'absolute z-10 flex -translate-x-1/2 flex-col items-center rounded-2xl border-2 border-ink px-2.5 py-1.5 shadow-popsm dark:border-cream',
              it.points > 0 ? 'bg-sunrise' : 'bg-bubblegum',
            )}
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
            aria-label={`Catch ${it.label}`}
          >
            <span className="text-2xl leading-none" aria-hidden>{it.emoji}</span>
            <span className="mt-0.5 max-w-[6rem] truncate font-mono text-[8px] font-bold uppercase tracking-wider text-ink">
              {it.label}
            </span>
          </motion.button>
        ))}
        {!running && !finished && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="rounded-3xl border-2 border-ink bg-white/80 p-6 text-center shadow-pop dark:border-cream dark:bg-[#171512]/80">
              <div className="text-4xl" aria-hidden>🧲</div>
              <p className="mt-2 font-display text-lg font-bold">Productivity in the wild</p>
              <p className="mt-1 max-w-xs text-sm text-ink-muted dark:text-cream/60">
                Thirty seconds. Catch the ticks, charts, and deadlines. Avoid the pizza.
              </p>
            </div>
          </div>
        )}
        {finished && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl border-2 border-ink bg-sunrise p-6 text-center shadow-poplg dark:border-cream"
            >
              <div className="text-4xl" aria-hidden>🏁</div>
              <h2 className="mt-2 font-display text-2xl font-bold">{review.title}</h2>
              <p className="mt-2 text-sm text-ink/80">{review.body}</p>
              <div className="mt-3 font-mono text-sm font-bold">Final score: {score}</div>
              <Button variant="grape" className="mt-4" onClick={start} icon={<RotateCcw className="h-4 w-4" />}>
                Catch again
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </GameShell>
  )
}