import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick, randInt } from '@/lib/random'

const OPENERS = [
  'Great question. I have considered it for 0.0004 seconds.',
  'Hmm. Yes. Almost certainly.',
  'I have consulted the soil and the soil agrees with me.',
  'This is a classic question with a classic answer, which I will now invent.',
  'I have run this through my extremely large internal starch reserve.',
  'Based on my extensive experience as a root vegetable,',
]

const ANSWERS = [
  'the answer is yes, provided you do not ask again.',
  'the answer is no, but with such confidence that nobody will check.',
  'that is a two-potato problem and I am one potato.',
  'you should absolutely do that. Or absolutely not. Either is defensible.',
  'nobody has ever asked me that and I have strong opinions anyway.',
  'the data supports both answers, which is convenient for me.',
  'this falls outside my expertise, but definitely.',
  'I recommend proceeding immediately and reviewing the consequences never.',
]

const CLOSERS = [
  'Please rate this answer 5 stars. There is no rating system. Please rate it anyway.',
  'This constitutes expert advice from a potato.',
  'Further questions may be directed to the potato.',
  'I have not read your question in full and I stand by my answer.',
  'Confidence level: 11 out of 10.',
]

const CONFIDENCE_LABELS = [
  'Enthusiastically Certain',
  'Statistically Invented',
  'Suspiciously Confident',
  'Based On Nothing',
  'Vibes-Based Reasoning',
]

interface Exchange {
  id: number
  question: string
  answer: string
  confidence: string
  percent: number
}

export default function PotatoAI() {
  const [input, setInput] = useState('')
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [thinking, setThinking] = useState(false)
  const [burst, fire] = useConfetti()
  const { unlock } = useNonsense()
  const idRef = useRef(0)

  const ask = useCallback(
    (question: string) => {
      const q = question.trim()
      if (!q) {
        notify.error('The potato cannot read minds', 'Ask something. Anything. Preferably short.', '🥔')
        return
      }
      setThinking(true)
      sound.whoosh()
      window.setTimeout(() => {
        const answer = `${pick(OPENERS)} ${pick(ANSWERS)}`
        const percent = randInt(72, 100)
        const exchange: Exchange = {
          id: ++idRef.current,
          question: q,
          answer,
          confidence: pick(CONFIDENCE_LABELS),
          percent,
        }
        setExchanges((e) => [exchange, ...e].slice(0, 12))
        setThinking(false)
        fire()
        sound.ding()
        unlock('potato')
        notify.success(
          'The potato has spoken',
          'This is parody, not artificial intelligence. There is no model, only a root vegetable.',
          '🥔',
        )
      }, 900)
    },
    [fire, unlock],
  )

  return (
    <ToolShell
      id="potato"
      name="AI-Powered Potato"
      emoji="🥔"
      tagline="Extremely confident answers from a fictional root vegetable."
      category="Randomly Useless Utilities"
      accent="sun"
      honesty="This is not artificial intelligence. It is not machine learning. It is a list of jokes with a potato on top. No data is collected, no model is queried, and the potato has no qualifications of any kind."
      aside={
        <ResultPanel title="Potato status">
          <ReportRow label="Model" value="Potato-1" />
          <ReportRow label="Parameters" value="0" />
          <ReportRow label="Starch reserve" value={`${randInt(40, 99)}%`} />
          <ReportRow label="Questions answered" value={String(exchanges.length)} />
          <ReportRow label="Answers verified" value="None" verdict="bad" />
          <ReportRow label="Is this real AI" value="No" verdict="bad" />
          <div className="mt-4 flex flex-wrap gap-2">
            {['🍟', '🥔', '🫘'].map((e) => (
              <Chip key={e} color="sun">
                {e} Parody
              </Chip>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-sunrise/70 p-3 text-xs text-ink">
            The potato is a decorative SVG-adjacent emoji with unearned authority. Please do not make
            life decisions based on its output.
          </p>
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <Card className="bg-sunrise">
        <div className="flex flex-wrap items-center gap-4">
          <motion.span
            className="text-6xl"
            animate={{ rotate: [-4, 4, -4], y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            aria-hidden
          >
            🥔
          </motion.span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold">Ask the potato</h2>
            <p className="text-sm text-ink/70">
              It will answer with total confidence and no information whatsoever.
            </p>
          </div>
          <Chip color="plain">NOT REAL AI</Chip>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask(input)}
            placeholder="Should I quit my job and become a professional potato farmer?"
            className="flex-1 rounded-2xl border-2 border-ink bg-white px-4 py-3 text-sm outline-none placeholder:text-ink/50 dark:border-cream dark:bg-[#171512] dark:placeholder:text-cream/40"
          />
          <Button variant="grape" size="lg" onClick={() => ask(input)} disabled={thinking} icon={<Send className="h-4 w-4" />}>
            {thinking ? 'Thinking (not really)…' : 'Ask the potato'}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {['Is now a good time?', 'Should I reply-all?', 'Do I need a meeting for this?'].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setInput(q)
                ask(q)
              }}
              className="rounded-full border-2 border-ink bg-white px-3 py-1 font-mono text-[11px] font-bold shadow-popsm transition hover:-translate-y-0.5 dark:border-cream dark:bg-[#171512] dark:text-cream"
            >
              {q}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {thinking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-3xl border-2 border-dashed border-ink/30 p-4 dark:border-cream/30"
            >
              <span className="animate-spin text-2xl" aria-hidden>🥔</span>
              <span className="font-mono text-xs uppercase tracking-widest text-ink-muted dark:text-cream/60">
                {pick(['Consulting the soil…', 'Accessing starch memory…', 'Running a vibes check…', 'Pretending to compute…'])}
              </span>
            </motion.div>
          )}
          {exchanges.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              layout
            >
              <Card>
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-cream-deep text-sm dark:border-cream dark:bg-[#100F0D]" aria-hidden>
                    🧑
                  </span>
                  <p className="font-display text-sm font-bold">{e.question}</p>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-sunrise text-sm dark:border-cream" aria-hidden>
                    🥔
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-ink-muted dark:text-cream/80">{e.answer}</p>
                    <p className="mt-2 text-xs italic text-ink-muted dark:text-cream/50">{pick(CLOSERS)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Chip color="lime">{e.confidence}</Chip>
                      <span className="font-mono text-[11px] text-ink-muted dark:text-cream/50">
                        confidence: {e.percent}% (unearned)
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {exchanges.length === 0 && !thinking && (
          <Card className="bg-cream-deep dark:bg-[#100F0D]">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" aria-hidden />
              <p className="text-sm text-ink-muted dark:text-cream/60">
                The potato is idle, which is its natural state. Ask it something and watch confidence
                arrive long before accuracy does.
              </p>
            </div>
          </Card>
        )}
      </div>
    </ToolShell>
  )
}
