import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { DoorOpen, Play, RotateCcw } from 'lucide-react'
import { GameShell, ScoreBanner } from '@/components/ui/GameShell'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { shuffle } from '@/lib/random'

interface Step {
  title: string
  prompt: string
  options: Array<{ label: string; emoji: string; correct: boolean; reaction: string }>
}

const STEPS: Step[] = [
  {
    title: 'Find the meeting link',
    prompt: 'Somewhere in this calendar chaos is the link to the 45-minute standup that could have been an email. Find it.',
    options: [
      { label: '1:1 with the microwave', emoji: '🍽️', correct: false, reaction: 'The microwave cancelled. Reschedule never.' },
      { label: 'Standup (mandatory, 45 min)', emoji: '📅', correct: true, reaction: 'Found it. Agony is now confirmed.' },
      { label: 'Sync about syncing', emoji: '🔄', correct: false, reaction: 'You synced with the syncing meeting. Wrong.' },
      { label: 'Focus time (blocked)', emoji: '🧘', correct: false, reaction: 'Focus time was declined by your own calendar.' },
      { label: 'Crying in the stairwell', emoji: '🪜', correct: false, reaction: 'That is not a Link. That is a lifestyle.' },
      { label: 'Vision alignment', emoji: '🔭', correct: false, reaction: 'Vision not found. Try the standup.' },
    ],
  },
  {
    title: 'Find the correct file version',
    prompt: 'The deliverable is somewhere in this pile. It is the one with the most desperate name.',
    options: [
      { label: 'final_v7.xlsx', emoji: '📊', correct: false, reaction: 'V7. Adorable. Ten versions ago, friend.' },
      { label: 'FINAL_v7_checked.xlsx', emoji: '📊', correct: false, reaction: 'Checked by whom? No one knows.' },
      { label: 'final_final_v7_FINAL.xlsx', emoji: '📄', correct: true, reaction: 'Correct. It still has the wrong numbers in it.' },
      { label: 'v8_actually_final.xlsx', emoji: '📊', correct: false, reaction: 'A lie, and the folder knows it.' },
      { label: 'copy_of_copy_final.xlsx', emoji: '📄', correct: false, reaction: 'A copy of a copy. Absolutely final until tomorrow.' },
      { label: 'use_this_one_FINAL.xlsx', emoji: '📄', correct: false, reaction: 'Confidence without credentials.' },
    ],
  },
  {
    title: 'Identify who broke production',
    prompt: 'The incidents page shows a deploy at 2:47 AM. Your job is the most important one in tech: blame ping-pong referee.',
    options: [
      { label: 'The intern', emoji: '🧑‍💻', correct: true, reaction: 'It was never the intern. But everyone needed it to be the intern.' },
      { label: 'The deploy script', emoji: '📜', correct: false, reaction: 'The script runs what it is told. Accuse someone with a name.' },
      { label: 'The VPN', emoji: '🌐', correct: false, reaction: 'The VPN is a scapegoat with good uptime.' },
      { label: 'Cameron', emoji: '👤', correct: false, reaction: 'Everyone blames Cameron. Cameron did not break prod today. Cameron broke it last month.' },
      { label: 'The config file', emoji: '⚙️', correct: false, reaction: 'A file cannot testify. Bad choice for a tribunal.' },
      { label: 'The coffee machine', emoji: '☕', correct: false, reaction: 'It produced a beverage, not an outage. Next.' },
    ],
  },
]

const REVIEWS = [
  { max: 15, title: 'Escape Room Legend', body: 'You escaped the office in record time. HR has been notified and is furious.' },
  { max: 30, title: 'Cubicle Acrobat', body: 'A brisk, professional escape. The meeting link never stood a chance.' },
  { max: 60, title: 'Committed Employee', body: 'You took your time, as a loyal employee should. The office appreciated the visit.' },
  { max: 120, title: 'Permanent Resident', body: 'You were basically living here by the end. The plants have accepted you.' },
  { max: Infinity, title: 'The Office Is Home Now', body: 'At this point the exit door has a desk and a badge of its own.' },
]

export default function OfficeEscape() {
  const [stepIndex, setStepIndex] = useState(0)
  const [options, setOptions] = useState<Step['options']>([])
  const [mistakes, setMistakes] = useState(0)
  const [morale, setMorale] = useState(100)
  const [seconds, setSeconds] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [won, setWon] = useState(false)
  const ranRef = useRef(false)
  const { unlock, registerGame } = useNonsense()

  const start = useCallback(() => {
    if (!ranRef.current) {
      ranRef.current = true
      unlock('game-escape')
      registerGame('game-escape')
    }
    setStepIndex(0)
    setOptions(shuffle(STEPS[0].options))
    setMistakes(0)
    setMorale(100)
    setSeconds(0)
    setWon(false)
    setPlaying(true)
    sound.pop()
  }, [unlock, registerGame])

  useEffect(() => {
    if (!playing || won) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [playing, won])

  const choose = (correct: boolean, reaction: string) => {
    if (!playing || won) return
    if (correct) {
      sound.success()
      notify.success('Correct-ish', reaction, '✅')
      if (stepIndex >= STEPS.length - 1) {
        setWon(true)
        setPlaying(false)
        unlock('game-escape')
        sound.fanfare()
      } else {
        const next = stepIndex + 1
        setOptions(shuffle(STEPS[next].options))
        setStepIndex(next)
      }
    } else {
      setMistakes((m) => m + 1)
      setMorale((m) => Math.max(0, m - 8))
      sound.error()
      notify.error('Wrong suspect', reaction, '🤦')
    }
  }

  const step = STEPS[Math.min(stepIndex, STEPS.length - 1)]
  const review = won ? (REVIEWS.find((r) => seconds <= r.max) ?? REVIEWS[REVIEWS.length - 1]) : null
  const resultTone = morale <= 40 ? 'bad' : morale <= 75 ? 'default' : 'good'

  return (
    <GameShell
      name="Escape the Office"
      emoji="🚪"
      tagline="Three tiny puzzles stand between you and the exit. Good luck with all of them."
      accent="orange"
      honesty="This is a single-player comedy game. No meetings were attended, no files were located, and no blame was legally assigned during your escape. Your time is tracked locally and glorified for nobody."
      controls={
        <>
          <Button variant="primary" onClick={start} icon={playing || won ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}>
            {playing ? 'Restart' : won ? 'Escape again' : 'Start escaping'}
          </Button>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
            <DoorOpen className="h-3.5 w-3.5" /> The exit is a metaphor. Probably.
          </span>
        </>
      }
    >
      <div className="mb-4">
        <ScoreBanner
          items={[
            { label: 'Puzzle', value: `${Math.min(stepIndex + 1, STEPS.length)}/${STEPS.length}` },
            { label: 'Time', value: `${seconds}s`, tone: seconds > 60 ? 'bad' : 'default' },
            { label: 'Blame shuffle', value: `${mistakes} wrong` },
            { label: 'Team morale', value: `${morale}%`, tone: resultTone },
          ]}
        />
      </div>

      <div className="rounded-3xl border-2 border-ink bg-white p-6 shadow-pop dark:border-cream dark:bg-[#171512]">
        {!playing && !won ? (
          <div className="py-6 text-center">
            <div className="text-5xl" aria-hidden>🏢</div>
            <h2 className="mt-3 font-display text-2xl font-bold">The office has you at the door.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted dark:text-cream/60">
              Find the meeting link among six that all say &ldquo;standup&rdquo;, locate the true final
              file version, and heroically assign the blame for production. Three steps. One exit.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-tangerine">
                Puzzle {Math.min(stepIndex + 1, STEPS.length)} of {STEPS.length}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold">{step.title}</h2>
              <p className="mt-1 text-sm text-ink-muted dark:text-cream/60">{step.prompt}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((opt, i) => (
                <motion.button
                  key={`${stepIndex}-${opt.label}`}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 320, damping: 26 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => choose(opt.correct, opt.reaction)}
                  className={cn(
                    'rounded-2xl border-2 border-ink bg-cream-deep p-4 text-left shadow-popsm transition-colors hover:bg-sunrise/40 dark:border-cream dark:bg-[#221F1A]',
                    opt.correct && won ? 'bg-limey' : '',
                  )}
                >
                  <span className="text-2xl" aria-hidden>{opt.emoji}</span>
                  <span className="mt-1 block font-display text-sm font-bold leading-snug">{opt.label}</span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>

      {won && review && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-3xl border-2 border-ink bg-limey p-6 text-center shadow-pop dark:border-cream"
        >
          <div className="text-5xl" aria-hidden>🎉</div>
          <h2 className="mt-2 font-display text-2xl font-bold">You escaped in {seconds}s</h2>
          <p className="mt-2 text-sm text-ink/80">{review.body}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest dark:bg-[#171512] dark:text-cream">
            Title acquired: {review.title}
          </div>
        </motion.div>
      )}
    </GameShell>
  )
}