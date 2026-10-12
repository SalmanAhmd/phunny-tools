import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Keyboard, Play, RotateCcw } from 'lucide-react'
import { GameShell, ScoreBanner } from '@/components/ui/GameShell'
import { Button } from '@/components/ui/Button'
import { KeyHint } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'

const ROUND_SECONDS = 10

const REVIEWS = [
  { min: 400, title: 'Chaos Grandmaster', body: 'Your keystrokes have transcended language. Linguists are preparing a statement.' },
  { min: 240, title: 'Senior Button Masher', body: 'A magnificent, unreadable performance. The keyboard would like a word.' },
  { min: 120, title: 'Enthusiastic Amateur', body: 'You definitely typed. Whether you typed anything is another question.' },
  { min: 40, title: 'Tentative Typist', body: 'Delicate, uncertain, and arguably still typing. Growth mindset.' },
  { min: 0, title: 'Mouse Loyalist', body: 'You barely touched the keyboard. The keyboard is relieved.' },
]

export default function KeyboardSmash() {
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [presses, setPresses] = useState(0)
  const [uniqueKeys, setUniqueKeys] = useState<Set<string>>(new Set())
  const [longestStreak, setLongestStreak] = useState(0)
  const [smashLog, setSmashLog] = useState('')
  const lastPressRef = useRef(0)
  const streakRef = useRef(0)
  const logRef = useRef('')
  const { unlock, registerGame } = useNonsense()

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!running || finished) return
      const key = e.key.length === 1 ? e.key : `[${e.key}]`
      const now = performance.now()
      const gap = now - lastPressRef.current
      if (gap > 1600) streakRef.current = 0
      streakRef.current += 1
      setLongestStreak((s) => Math.max(s, streakRef.current))
      lastPressRef.current = now

      setPresses((p) => p + 1)
      setUniqueKeys((u) => {
        if (u.has(key)) return u
        const next = new Set(u)
        next.add(key)
        return next
      })
      logRef.current = (logRef.current + key).slice(-24)
      setSmashLog(logRef.current)

      if (Math.random() < 0.16) sound.tick()
      else sound.click()
      e.preventDefault()
    },
    [running, finished],
  )

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKey])

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
    setPresses(0)
    setUniqueKeys(new Set())
    setLongestStreak(0)
    streakRef.current = 0
    lastPressRef.current = 0
    logRef.current = ''
    setSmashLog('')
    setTimeLeft(ROUND_SECONDS)
    setFinished(false)
    setRunning(true)
    registerGame('game-keyboard')
    sound.pop()
  }

  useEffect(() => {
    if (!finished) return
    unlock('game-keyboard')
    sound.fanfare()
  }, [finished, unlock])

  const chaos = presses * 4 + uniqueKeys.size * 8
  const fakeWpm = Math.round((presses / ROUND_SECONDS) * 6)
  const review = REVIEWS.find((r) => chaos >= r.min) ?? REVIEWS[REVIEWS.length - 1]

  return (
    <GameShell
      name="Keyboard Smash Championship"
      emoji="⌨️"
      tagline="Ten seconds. Any keys. A professional chaos rating."
      accent="lime"
      honesty="Nothing you type is read, stored, or transmitted. It is counted locally, admired briefly, and then completely ignored. This is the most secure typing test ever made."
      controls={
        <>
          <Button variant="primary" onClick={start} icon={running || finished ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}>
            {running ? 'Reset' : finished ? 'Smash again' : 'Start smashing'}
          </Button>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
            <Keyboard className="h-3.5 w-3.5" /> Any keys. Especially the loud ones.
          </span>
        </>
      }
    >
      <div className="mb-4">
        <ScoreBanner
          items={[
            { label: 'Chaos rating', value: chaos, tone: chaos > 300 ? 'good' : 'default' },
            { label: 'Keystrokes', value: presses },
            { label: 'Unique keys', value: uniqueKeys.size },
            { label: 'Time left', value: `${timeLeft}s` },
          ]}
        />
      </div>

      <div
        className={cn(
          'relative grid min-h-[16rem] place-items-center rounded-3xl border-2 border-ink p-6 shadow-pop transition-colors dark:border-cream',
          running ? 'bg-sunrise' : finished ? 'bg-limey' : 'bg-cream-deep dark:bg-[#100F0D]',
        )}
      >
        <div className="text-center">
          {running || finished ? (
            <motion.div
              key={running ? 'go' : 'done'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-5xl font-bold sm:text-6xl"
            >
              {running ? 'SMASH!' : 'DONE.'}
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="text-6xl" aria-hidden>⌨️</div>
              <p className="max-w-sm text-center text-sm text-ink-muted dark:text-cream/60">
                Click start, focus this page, then flail wildly across the keyboard for ten glorious
                seconds. The judging panel (also us) is watching.
              </p>
            </motion.div>
          )}

          <div className="mt-6 min-h-[3.5rem]">
            {smashLog ? (
              <p
                aria-hidden
                className="break-all font-mono text-lg font-bold leading-tight tracking-widest text-ink/90"
              >
                {smashLog}
              </p>
            ) : (
              <p className="font-mono text-xs uppercase tracking-widest text-ink-muted dark:text-cream/40">
                {finished ? 'Identified characters: none of significance' : 'No keys yet. The keyboard is unimpressed.'}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <KeyHint>any key</KeyHint>
            <KeyHint>space</KeyHint>
            <KeyHint>even the wrong key</KeyHint>
          </div>
        </div>
      </div>

      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-3xl border-2 border-ink bg-white p-6 shadow-pop dark:border-cream dark:bg-[#171512]"
        >
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-tangerine">Official assessment</div>
          <h2 className="mt-2 font-display text-2xl font-bold">{review.title}</h2>
          <p className="mt-2 text-sm text-ink-muted dark:text-cream/70">{review.body}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-2xl border-2 border-ink bg-sunrise p-3 dark:border-cream">
              <div className="font-mono text-[10px] uppercase tracking-widest">Chaos rating</div>
              <div className="font-display text-xl font-bold">{chaos}</div>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-limey p-3 dark:border-cream">
              <div className="font-mono text-[10px] uppercase tracking-widest">WPM (fictional)</div>
              <div className="font-display text-xl font-bold">{fakeWpm}</div>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-cream-deep p-3 dark:border-cream dark:bg-[#221F1A]">
              <div className="font-mono text-[10px] uppercase tracking-widest">Longest streak</div>
              <div className="font-display text-xl font-bold">{longestStreak} keys</div>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-bubblegum p-3 dark:border-cream">
              <div className="font-mono text-[10px] uppercase tracking-widest">Unique keys</div>
              <div className="font-display text-xl font-bold">{uniqueKeys.size}</div>
            </div>
          </div>
        </motion.div>
      )}

      {!running && !finished && (
        <p className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-ink-muted dark:text-cream/50">
          Beginner tip: press the key with the most satisfying click. Repeat.
        </p>
      )}
    </GameShell>
  )
}