import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BatteryCharging, Calculator, Smartphone } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick } from '@/lib/random'
import { cn } from '@/lib/utils'
import { notify } from '@/lib/toastBus'

const VERDICTS = [
  { max: 2, title: 'Functionally Absent', body: 'You will check your phone before the first sentence finishes. This is not a judgement.' },
  { max: 6, title: 'Technically Employed', body: 'Capable of replying "sounds good" to a document you have not opened.' },
  { max: 12, title: 'Deliberately Distracted', body: 'A solid burst followed by a 40-minute detour into a group chat.' },
  { max: 25, title: 'Mildly Present', body: 'You will do the work and then immediately describe it as exhausting.' },
  { max: 45, title: 'Suspiciously Focused', body: 'Either genuine focus or you have forgotten your phone exists. Both are concerning.' },
  { max: 101, title: 'Unrecognisable Professional', body: 'Are you unwell? Should we call someone? Nobody works for this long.' },
]

export default function MotivationCalculator() {
  const [motivation, setMotivation] = useState(35)
  const [computed, setComputed] = useState(false)
  const [burst, fire] = useConfetti()
  const { unlock } = useNonsense()

  const result = useMemo(() => {
    // Deliberately silly formula, but consistent and explained.
    const base = Math.pow(motivation / 10, 1.4)
    const phone = motivation > 20 ? 4 : 11
    const minutes = Math.max(0, base * 4.2 - phone)
    const verdict = VERDICTS.find((v) => minutes <= v.max) ?? VERDICTS[VERDICTS.length - 1]
    const distractions = Math.max(1, Math.round(60 / (minutes + 2)))
    const coffees = Math.max(1, Math.round((100 - motivation) / 12))
    return { minutes, verdict, distractions, coffees, formula: `(${motivation}/10)^1.4 × 4.2 − ${phone}` }
  }, [motivation])

  const compute = () => {
    setComputed(true)
    fire()
    sound.ding()
    unlock('motivation')
  }

  return (
    <ToolShell
      id="motivation"
      name="Motivation Calculator"
      emoji="🔋"
      tagline="How many minutes can you realistically work before checking your phone?"
      category="Randomly Useless Utilities"
      accent="lime"
      honesty="There is a real formula behind this, and it is shown to you in full so you can see exactly how unscientific it is. No data leaves your browser and nothing about you is assessed."
      aside={
        <ResultPanel title="Calculation details">
          <ReportRow label="Motivation input" value={`${motivation}%`} />
          <ReportRow label="Formula used" value={result.formula} />
          <ReportRow label="Estimated focus" value={`${result.minutes.toFixed(1)} min`} />
          <ReportRow label="Phone checks (per hour)" value={String(result.distractions)} verdict="bad" />
          <ReportRow label="Coffees required" value={String(result.coffees)} />
          <ReportRow label="Peer reviewed" value="Absolutely not" verdict="bad" />
          {computed && (
            <div className="mt-4 rounded-2xl border-2 border-ink bg-limey p-3 dark:border-cream">
              <div className="font-mono text-[10px] uppercase tracking-widest">Verdict</div>
              <div className="font-display text-lg font-bold">{result.verdict.title}</div>
            </div>
          )}
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <Card>
        <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
          <BatteryCharging className="h-4 w-4" /> Your motivation level
        </h2>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-4xl" aria-hidden>
            {motivation < 20 ? '🪫' : motivation < 60 ? '🔋' : '⚡'}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={motivation}
            onChange={(e) => setMotivation(Number(e.target.value))}
            className="w-full"
            aria-label="Motivation level 0 to 100"
          />
          <span className="w-16 text-right font-mono text-lg font-bold">{motivation}%</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="primary" size="lg" onClick={compute} icon={<Calculator className="h-5 w-5" />}>
            Calculate realistically
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setMotivation(100)
              notify.info('Motivation set to 100%', 'This is aspirational and will not be reflected in reality.', '✨')
            }}
          >
            Set to maximum (lying)
          </Button>
        </div>
      </Card>

      {computed && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <Card className="bg-limey" tilt={-0.5}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em]">
                  Realistic working time
                </div>
                <div className="mt-1 font-display text-5xl font-bold">{result.minutes.toFixed(1)} min</div>
                <div className="mt-2 font-display text-lg font-bold">{result.verdict.title}</div>
              </div>
              <div className="text-5xl" aria-hidden>📱</div>
            </div>
            <p className="mt-3 max-w-xl text-sm text-ink/80">{result.verdict.body}</p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border-2 border-ink bg-white p-4 shadow-pop dark:border-cream dark:bg-[#171512]">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest">
                <Smartphone className="h-3.5 w-3.5" /> Phone checks
              </div>
              <div className="mt-2 font-display text-3xl font-bold">{result.distractions}</div>
              <p className="text-xs text-ink-muted dark:text-cream/60">per theoretical hour of work</p>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-white p-4 shadow-pop dark:border-cream dark:bg-[#171512]">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest">☕ Coffees required</div>
              <div className="mt-2 font-display text-3xl font-bold">{result.coffees}</div>
              <p className="text-xs text-ink-muted dark:text-cream/60">diminishing returns after the third</p>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-white p-4 shadow-pop dark:border-cream dark:bg-[#171512]">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest">📉 Productivity shape</div>
              <div className="mt-2 flex h-12 items-end gap-1">
                {[0.9, 1, 0.85, 0.6, 0.35, 0.15, 0.05].map((h, i) => (
                  <div
                    key={i}
                    className={cn('flex-1 rounded-t', h > 0.5 ? 'bg-limey' : 'bg-tangerine')}
                    style={{ height: `${h * 100 * (motivation / 100 + 0.3)}%` }}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-ink-muted dark:text-cream/60">
                {pick([
                  'Classic decay curve. Very relatable.',
                  'The dip is where the group chat happens.',
                  'The last bar is you, staring at the ceiling.',
                ])}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <Card className="bg-cream-deep dark:bg-[#100F0D]">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide">Full disclosure</h2>
        <p className="mt-2 text-sm text-ink-muted dark:text-cream/60">
          The formula is <span className="font-mono">(motivation / 10) ^ 1.4 × 4.2 − phone penalty</span>. We
          wrote it in about ninety seconds and then gave it a nice colour. It is not science. Please do
          not make decisions with it.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip color="lime">Local only</Chip>
          <Chip color="plain">No analytics</Chip>
          <Chip color="pink">No judgement (some judgement)</Chip>
        </div>
      </Card>
    </ToolShell>
  )
}
