import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, ShieldCheck, Sparkles } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick } from '@/lib/random'

const STAGES = [
  'Interrogating the password gently…',
  'Counting the characters, then counting them again…',
  'Estimating entropy with a ruler…',
  'Consulting three fictional security experts…',
  'Cross-referencing against a list of pets we made up…',
  'Running it past the audit committee (a plant)…',
  'Preparing a strongly worded certificate…',
]

const RATINGS = [
  { max: 28, title: 'Catastrophic', verdict: 'bad' as const, body: 'A determined toddler with a keyboard could get in.' },
  { max: 45, title: 'Concerning', verdict: 'bad' as const, body: 'Fine for a password you never use again. Which is not a use case.' },
  { max: 64, title: 'Acceptable', verdict: 'neutral' as const, body: 'Neither impressive nor embarrassing. The beige of security.' },
  { max: 80, title: 'Respectable', verdict: 'good' as const, body: 'Good. Now please stop reusing it across seventeen sites.' },
  { max: 200, title: 'Excessive', verdict: 'good' as const, body: 'This password has entered the realm of performance art.' },
]

const SAMPLES = ['correct-horse-battery-staple', 'hunter2', 'letmein123', 'Tr0ub4dor&3', 'password123', 'butterfly-chandelier-9']

function analyse(value: string) {
  const length = value.length
  let charset = 0
  if (/[a-z]/.test(value)) charset += 26
  if (/[A-Z]/.test(value)) charset += 26
  if (/[0-9]/.test(value)) charset += 10
  if (/[^a-zA-Z0-9]/.test(value)) charset += 33
  const entropy = length > 0 && charset > 1 ? length * Math.log2(charset) : 0
  const guesses = Math.pow(2, entropy)
  const perSecond = 1e10
  const seconds = guesses / perSecond / 2 // average case
  const score = Math.min(100, Math.round((entropy / 90) * 100))
  const rating = RATINGS.find((r) => score <= r.max) ?? RATINGS[RATINGS.length - 1]
  return { length, charset, entropy, seconds, score, rating }
}

function humanTime(seconds: number): string {
  if (seconds < 1) return 'instantly'
  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [365, 'day'],
    [1000, 'year'],
    [1000, 'millennium'],
  ]
  let value = seconds
  let label = 'second'
  for (const [factor, name] of units) {
    if (value < factor) {
      label = name
      break
    }
    value /= factor
    label = name
  }
  if (value > 1e6) return `${value.toExponential(2)} ${label}s (effectively forever)`
  return `${value.toFixed(1)} ${label}${value >= 2 ? 's' : ''}`
}

export default function PasswordProcrastinator() {
  const [value, setValue] = useState('')
  const [shown, setShown] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [done, setDone] = useState(false)
  const [burst, fire] = useConfetti()
  const { unlock } = useNonsense()
  const timers = useRef<number[]>([])

  const result = analyse(value)

  const run = useCallback(() => {
    if (!value) {
      notify.error('Nothing to analyse', 'An empty password is technically very secure and also not a password.', '🚫')
      return
    }
    setAnalysing(true)
    setDone(false)
    setProgress(0)
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    sound.whoosh()

    STAGES.forEach((s, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setStage(s)
          setProgress(Math.round(((i + 1) / STAGES.length) * 100))
          sound.click()
        }, i * 480),
      )
    })

    timers.current.push(
      window.setTimeout(() => {
        setAnalysing(false)
        setDone(true)
        fire()
        result.score > 60 ? sound.success() : sound.error()
        unlock('password')
        notify.success(
          'Security theatre complete',
          'Nothing was sent anywhere. This analysis happened entirely on your device.',
          '🔐',
        )
      }, STAGES.length * 480 + 400),
    )
  }, [value, fire, unlock, result.score])

  return (
    <ToolShell
      id="password"
      name="Password Procrastinator"
      emoji="🔐"
      tagline="A dramatic security analysis of a sample password."
      category="Randomly Useless Utilities"
      accent="grape"
      honesty="Nothing is stored, logged, or transmitted — the check runs in memory in your browser. But please: never type a real password into a comedy website. Use the sample generator instead. That is genuinely good advice."
      aside={
        <ResultPanel title="Security report">
          <ReportRow label="Length" value={String(result.length)} />
          <ReportRow label="Character set size" value={String(result.charset)} />
          <ReportRow label="Estimated entropy" value={`${result.entropy.toFixed(1)} bits`} />
          <ReportRow label="Score" value={`${result.score}/100`} verdict={result.rating.verdict} />
          <ReportRow label="Crack time (10bn/s)" value={humanTime(result.seconds)} verdict={result.score > 60 ? 'good' : 'bad'} />
          <ReportRow label="Stored by us" value="No" verdict="good" />
          <ReportRow label="Transmitted anywhere" value="No" verdict="good" />
          {done && (
            <div className="mt-4 rounded-2xl border-2 border-ink bg-grape p-3 text-white dark:border-cream">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/70">Verdict</div>
              <div className="font-display text-lg font-bold">{result.rating.title}</div>
            </div>
          )}
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <Card>
        <div className="flex items-start gap-3 rounded-2xl bg-bubblegum/40 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="text-xs text-ink">
            <strong>Please use a fake password.</strong> This is a comedy tool. Type something like
            “correct-horse-battery-staple” and enjoy the show.
          </p>
        </div>

        <label htmlFor="pw" className="mt-5 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
          <Lock className="h-4 w-4" /> Sample password
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              id="pw"
              type={shown ? 'text' : 'password'}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setDone(false)
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder="not-a-real-password"
              className="w-full rounded-2xl border-2 border-ink bg-cream-deep px-4 py-3 pr-12 font-mono text-sm outline-none focus:bg-white dark:border-cream dark:bg-[#100F0D] dark:focus:bg-[#171512]"
            />
            <button
              type="button"
              onClick={() => setShown((s) => !s)}
              aria-label={shown ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 hover:bg-ink/10 dark:hover:bg-cream/10"
            >
              {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button variant="ghost" onClick={() => { setValue(pick(SAMPLES)); setDone(false) }}>
            🎲 Random sample
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="grape" size="lg" onClick={run} disabled={analysing} icon={<Sparkles className="h-5 w-5" />}>
            {analysing ? 'Analysing dramatically…' : 'Analyse dramatically'}
          </Button>
          <span className="self-center font-mono text-[11px] text-ink-muted dark:text-cream/50">
            Live score: {result.score}/100 · {result.rating.title}
          </span>
        </div>
      </Card>

      {(analysing || done) && (
        <Card className="bg-cream-deep dark:bg-[#100F0D]">
          <ProgressBar value={progress} label="Security theatre in progress" sublabel={`${progress}%`} color="grape" />
          <div className="mt-3 min-h-[6rem] space-y-1.5 font-mono text-xs">
            <AnimatePresence>
              {stage && (
                <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-ink-muted dark:text-cream/60">
                  <span className="text-limey">✔</span> {stage}
                </motion.p>
              )}
            </AnimatePresence>
            {done && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-ink dark:text-cream">
                Assessment: {result.rating.title}. {result.rating.body}
              </motion.p>
            )}
          </div>
        </Card>
      )}

      <Card className="bg-limey/60 dark:bg-limey/20">
        <h2 className="font-display text-base font-bold">Real advice (genuinely)</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
          <li>• Use a password manager. This website is not one.</li>
          <li>• Longer beats complicated. A passphrase of four random words is excellent.</li>
          <li>• Never reuse the same password across important accounts.</li>
          <li>• Turn on two-factor authentication wherever it is offered.</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip color="lime">Local only</Chip>
          <Chip color="plain">Zero storage</Chip>
          <Chip color="grape">Real maths, silly framing</Chip>
        </div>
      </Card>
    </ToolShell>
  )
}
