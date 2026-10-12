import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, MousePointerClick } from 'lucide-react'
import { GameShell, ScoreBanner } from '@/components/ui/GameShell'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick, randInt, uid } from '@/lib/random'

interface ChaosButton {
  id: string
  label: string
  x: number
  y: number
  rotate: number
  tone: string
}

const LABELS = [
  'Do Not Click.',
  "Definitely Don't Click.",
  'This One Is Safe.',
  'Click Here to Win Nothing.',
]

const TONES = [
  'bg-tangerine text-white',
  'bg-grape text-white',
  'bg-sunrise text-ink',
  'bg-limey text-ink',
  'bg-bubblegum text-ink',
  'bg-white text-ink dark:bg-[#171512] dark:text-cream',
]

const CONGRATULATIONS = [
  'Congratulations! You have made a terrible decision. We are all very proud.',
  'Excellent choice. It was, objectively, the worst one available.',
  'You clicked the button. The button clicked back, emotionally.',
  'Well done. A notification has been sent to nobody about this.',
  'You have won absolutely nothing. Please collect your nothing at the door.',
  'That was the wrong button. It was also the right button. Nobody knows.',
  'A manager has been assigned to your case. They are also confused.',
  'You have unlocked a new meeting. It starts in four minutes.',
]

const CONSEQUENCE_TONES = ['info', 'success', 'error'] as const

function makeButton(label?: string): ChaosButton {
  return {
    id: uid(),
    label: label ?? pick(LABELS),
    x: randInt(-6, 6),
    y: randInt(-6, 6),
    rotate: randInt(-6, 6),
    tone: pick(TONES),
  }
}

export default function WrongButton() {
  const [buttons, setButtons] = useState<ChaosButton[]>(() => LABELS.map((l) => makeButton(l)))
  const [clicks, setClicks] = useState(0)
  const [escapes, setEscapes] = useState(0)
  const [duplications, setDuplications] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const { unlock, registerGame } = useNonsense()

  const consequence = useCallback(
    (btn: ChaosButton) => {
      const roll = Math.random()
      const record = (text: string) => setHistory((h) => [text, ...h].slice(0, 8))

      if (roll < 0.28 && buttons.length < 12) {
        // duplicate
        const clone: ChaosButton = {
          ...makeButton(btn.label),
          tone: pick(TONES),
        }
        setButtons((b) => [...b, clone])
        setDuplications((d) => d + 1)
        record('The button has duplicated itself. This is legally allowed.')
        sound.pop()
        notify.info('Button duplicated', 'It has reproduced. HR has questions.', '🐇')
        return
      }
      if (roll < 0.52) {
        // run away
        setButtons((b) =>
          b.map((x) =>
            x.id === btn.id
              ? { ...x, x: randInt(-40, 40), y: randInt(-34, 34), rotate: randInt(-25, 25) }
              : x,
          ),
        )
        setEscapes((e) => e + 1)
        record('The button sprinted to a safer part of the screen.')
        sound.whoosh()
        notify.info('It ran away', 'Try hovering. It will only get faster.', '🏃')
        return
      }
      if (roll < 0.74 && buttons.length > 1) {
        // swap labels between two buttons
        const other = pick(buttons.filter((b) => b.id !== btn.id))
        if (other) {
          setButtons((b) =>
            b.map((x) => {
              if (x.id === btn.id) return { ...x, label: other.label }
              if (x.id === other.id) return { ...x, label: btn.label }
              return x
            }),
          )
          setSwaps((s) => s + 1)
          record('Two buttons have exchanged identities. Nobody noticed.')
          sound.error()
          notify.info('Labels swapped', 'Nothing means anything anymore. Carry on.', '🔀')
          return
        }
      }
      // congratulate for a terrible decision
      const text = pick(CONGRATULATIONS)
      record(text)
      setButtons((b) => b.map((x) => (x.id === btn.id ? { ...x, tone: pick(TONES) } : x)))
      const tone = pick(CONSEQUENCE_TONES)
      if (tone === 'success') {
        sound.success()
        notify.success('Outstanding decision-making', text, '🎉')
      } else if (tone === 'error') {
        sound.error()
        notify.error('Decision recorded', text, '🚨')
      } else {
        sound.ding()
        notify.info('Noted', text, '📝')
      }
    },
    [buttons],
  )

  const handleClick = (btn: ChaosButton) => {
    setClicks((c) => {
      const next = c + 1
      if (next === 1) registerGame('game-buttons')
      return next
    })
    consequence(btn)
    if (clicks + 1 >= 15) unlock('game-buttons')
  }

  const reset = () => {
    setButtons(LABELS.map((l) => makeButton(l)))
    setClicks(0)
    setEscapes(0)
    setDuplications(0)
    setSwaps(0)
    setHistory([])
    sound.pop()
    notify.success('Reality restored', 'Fresh buttons, fresh lies. Go and make mistakes.', '🔄')
  }

  const verdict =
    clicks === 0
      ? 'You have not made any mistakes yet. Suspicious.'
      : clicks < 5
        ? 'Mild chaos. You are still technically employable.'
        : clicks < 12
          ? 'Substantial chaos. The buttons have formed opinions about you.'
          : 'Total chaos. Somewhere, a product manager is crying. Beautiful.'

  return (
    <GameShell
      name="Click the Wrong Button"
      emoji="🚫"
      tagline="Every button is a trap. Every label is a lie. Have fun."
      accent="pink"
      honesty="This is a joke game. The buttons do not really run away from your cursor forever, the duplicates are only on this screen, and nothing is submitted anywhere. Your clicks stay in your browser."
      controls={
        <>
          <Button variant="ghost" onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
            Restore order
          </Button>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
            <MousePointerClick className="h-3.5 w-3.5" /> Hover for extra chaos
          </span>
        </>
      }
    >
      <div className="mb-4">
        <ScoreBanner
          items={[
            { label: 'Terrible decisions', value: clicks, tone: 'bad' },
            { label: 'Escapes', value: escapes },
            { label: 'Duplications', value: duplications },
            { label: 'Label swaps', value: swaps },
          ]}
        />
      </div>

      <div className="relative min-h-[24rem] overflow-hidden rounded-3xl border-2 border-ink bg-cream-deep p-6 shadow-pop dark:border-cream dark:bg-[#100F0D]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#0D0C0A 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        />
        <p className="relative mb-6 text-center font-mono text-xs uppercase tracking-widest text-ink-muted dark:text-cream/50">
          Choose wisely. There is no wise choice.
        </p>
        <div className="relative flex min-h-[16rem] flex-wrap items-center justify-center gap-5">
          <AnimatePresence>
            {buttons.map((btn) => (
              <motion.button
                key={btn.id}
                type="button"
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, x: btn.x, y: btn.y, rotate: btn.rotate }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.08, rotate: btn.rotate + randInt(-8, 8) }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                onClick={() => handleClick(btn)}
                className={cn(
                  'rounded-2xl border-2 border-ink px-5 py-3 font-display text-sm font-bold uppercase tracking-wide shadow-pop dark:border-cream',
                  btn.tone,
                )}
              >
                {btn.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border-2 border-ink bg-white p-5 shadow-pop dark:border-cream dark:bg-[#171512]">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide">Incident log</h2>
          <div className="mt-3 space-y-2 text-sm">
            {history.length === 0 ? (
              <p className="text-ink-muted dark:text-cream/50">
                Nothing has gone wrong yet. The buttons are watching you.
              </p>
            ) : (
              history.map((h, i) => (
                <motion.div
                  key={`${h}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 border-b-2 border-dashed border-ink/15 pb-2 last:border-0 dark:border-cream/15"
                >
                  <span aria-hidden>›</span>
                  <span className="text-ink-muted dark:text-cream/70">{h}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border-2 border-ink bg-sunrise p-5 shadow-pop dark:border-cream">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide">Behavioural assessment</h2>
          <p className="mt-3 text-sm font-medium">{verdict}</p>
          <p className="mt-3 text-xs text-ink/70">
            This assessment is fictional, unserious, and will not follow you to any future role.
            Probably.
          </p>
        </div>
      </div>
    </GameShell>
  )
}
