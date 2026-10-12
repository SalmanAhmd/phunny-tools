import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Flower2, Hourglass, RotateCcw } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick } from '@/lib/random'

const STAGE_EMOJI = [
  { min: 100, emoji: '🌳', label: 'Fully useless tree' },
  { min: 66, emoji: '🪴', label: 'Potted personality' },
  { min: 33, emoji: '🌿', label: 'A sprout with dreams' },
  { min: 0, emoji: '🌱', label: 'An anxious seed' },
]

const TINY_VOICE = [
  'The plant senses your attention and wilts slightly.',
  'In botany, hovering counts as watering. The plant disagrees.',
  'You looked at it. That was enough for today.',
  'The plant has decided to grow only when you are looking away.',
  'Photosynthesis: happening somewhere. Probably in a different tab.',
]

export default function DigitalPlant() {
  const [growth, setGrowth] = useState(2)
  const [waterings, setWaterings] = useState(0)
  const [idleSeconds, setIdleSeconds] = useState(0)
  const [interruptions, setInterruptions] = useState(0)
  const [sessionOn, setSessionOn] = useState(false)
  const [sessionLeft, setSessionLeft] = useState(30)
  const [voice, setVoice] = useState('')
  const [finished, setFinished] = useState(false)
  const unlockedRef = useRef(false)
  const { unlock } = useNonsense()

  const stage = STAGE_EMOJI.find((s) => growth >= s.min) ?? STAGE_EMOJI[STAGE_EMOJI.length - 1]

  // Growing only happens while you do nothing. It even says so in the tagline.
  useEffect(() => {
    const id = window.setInterval(() => {
      setGrowth((g) => Math.min(100, g + 1))
      setIdleSeconds((s) => s + 1)
    }, 3000)
    return () => window.clearInterval(id)
  }, [])

  // A "focus session" where the plant grows per second you manage not to click.
  useEffect(() => {
    if (!sessionOn) return
    const id = window.setInterval(() => {
      setSessionLeft((t) => {
        if (t <= 1) {
          setSessionOn(false)
          setFinished(true)
          return 0
        }
        return t - 1
      })
      setGrowth((g) => Math.min(100, g + 2))
    }, 1000)
    return () => window.clearInterval(id)
  }, [sessionOn])

  // Unlock the botany achievement once the plant stops being a seed.
  useEffect(() => {
    if (growth >= 4 && !unlockedRef.current) {
      unlockedRef.current = true
      unlock('plant')
    }
  }, [growth, unlock])

  const water = useCallback(() => {
    if (finished) return
    setWaterings((w) => w + 1)
    setInterruptions((i) => i + 1)
    // Watering is a distraction. The plant sees it as a betrayal.
    setGrowth((g) => {
      const next = Math.max(0, g - 6)
      if (next < 100) return next
      return next
    })
    setVoice(pick(TINY_VOICE))
    sound.error()
    notify.info('The plant has been disturbed', 'Thank you. That was extremely unhelpful. -5% focus.', '🫗')
  }, [finished])

  const startSession = useCallback(() => {
    if (finished) return
    setSessionOn(true)
    setSessionLeft(30)
    setFinished(false)
    setVoice('')
    sound.pop()
    notify.info('Silence begins', 'Thirty seconds. No clicks. Do not look at it.', '🧘')
  }, [finished])

  const reset = useCallback(() => {
    setGrowth(2)
    setWaterings(0)
    setIdleSeconds(0)
    setInterruptions(0)
    setSessionOn(false)
    setSessionLeft(30)
    setFinished(false)
    setVoice('')
    sound.pop()
    notify.info('Replanted', 'A fresh seed. It does not trust you yet.', '🌱')
  }, [])

  return (
    <ToolShell
      id="plant"
      name="Digital Plant"
      emoji="🪴"
      tagline="A plant that grows only while you do absolutely nothing."
      category="Time-Wasting Machines"
      accent="lime"
      honesty="This is not a real plant and it cannot die, but it can be disappointed. It grows locally in your browser based on time spent genuinely doing nothing. There is no water involved and there never was."
      aside={
        <ResultPanel title="Botany report">
          <ReportRow label="Growth" value={`${growth}%`} verdict={growth > 66 ? 'good' : growth < 20 ? 'bad' : 'neutral'} />
          <ReportRow label="Disturbances (watering)" value={String(waterings)} verdict={waterings > 0 ? 'bad' : 'good'} />
          <ReportRow label="Seconds of self-restraint" value={String(idleSeconds)} />
          <ReportRow label="Interruptions logged" value={String(interruptions)} verdict={interruptions > 2 ? 'bad' : 'neutral'} />
          <ReportRow label="Photosynthesis" value="Suspected" />
          <div className="mt-4">
            <ProgressBar value={growth} color="limey" label="Unnecessary growth" />
          </div>
          {finished && (
            <div className="mt-4 rounded-2xl border-2 border-ink bg-limey p-3 dark:border-cream">
              <div className="font-mono text-[10px] uppercase tracking-widest">Session verdict</div>
              <div className="font-display text-base font-bold">You did nothing for 30 seconds. Gorgeous.</div>
            </div>
          )}
        </ResultPanel>
      }
    >
      <div className="grid place-items-center rounded-3xl border-2 border-ink bg-cream-deep px-6 py-12 dark:border-cream dark:bg-[#100F0D]">
        <motion.div
          animate={{ rotate: [0, -2, 2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-8xl sm:text-9xl"
          aria-hidden
        >
          {stage.emoji}
        </motion.div>
        <div className="mt-4 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={stage.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="font-display text-xl font-bold"
            >
              {stage.emoji} {stage.label}
            </motion.p>
          </AnimatePresence>
          <p className="mt-2 max-w-md text-sm text-ink-muted dark:text-cream/60">
            {voice ||
              (sessionOn
                ? `Focus session running. ${sessionLeft}s left. Do NOT touch the button below.`
                : 'It grows while you ignore it. Clicking makes it distrust you.')}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="lime" onClick={startSession} disabled={sessionOn} icon={<Hourglass className="h-4 w-4" />}>
            {sessionOn ? `Being still… ${sessionLeft}s` : 'Start a stillness session'}
          </Button>
          <Button variant="danger" onClick={water} disabled={sessionOn || finished} icon={<Droplets className="h-4 w-4" />}>
            Water it (this hurts it)
          </Button>
          <Button variant="ghost" onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
            Replant
          </Button>
        </div>

        {sessionOn && (
          <div className="mt-6 w-full max-w-sm">
            <ProgressBar value={(sessionLeft / 30) * 100} color="tangerine" label="Remaining stillness" indeterminate={false} />
          </div>
        )}
      </div>

      <Card className="bg-limey/50 dark:bg-limey/20">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <Flower2 className="h-4 w-4" /> Field notes from the greenhouse
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
          <li>• Object permanence is not this plant&apos;s strength.</li>
          <li>• It has never needed water. It needed silence.</li>
          <li>• At 100% it becomes a tree and accepts a job as a manager.</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip color="lime">Grows only during inaction</Chip>
          <Chip color="plain">0% water required</Chip>
          <Chip color="plain">100% disappointment available</Chip>
        </div>
      </Card>
    </ToolShell>
  )
}