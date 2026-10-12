import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, RefreshCw, Sparkles } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick } from '@/lib/random'

const OPENERS = [
  'I am so sorry, but',
  'Genuinely embarrassed to say this, however',
  'You will not believe this, and honestly, neither do I, but',
  'Quick heads up, and please do not judge me, but',
  'No excuses, but also, in my defence,',
]

const REASONS = [
  'my alarm clock needed emotional support this morning',
  'my phone updated itself into a slightly different phone',
  'I was held hostage by a very slow pedestrian crossing',
  'my coffee was too hot and then, devastatingly, too cold',
  'I made eye contact with my neighbour and it escalated into a conversation',
  'my front door was being difficult and we had to talk it through',
  'I took a shortcut that turned out to be a longer cut',
  'a pigeon made a decision that affected my commute',
  'my laundry achieved sentience and demanded to be folded',
  'I was 30 seconds into a documentary and could not leave',
  'my satnav rerouted me through a period of personal reflection',
  'I did leave on time, but then I came back for something I still cannot identify',
  'a meeting appeared in my calendar that I did not attend but felt guilty about',
  'my shoes and I had a disagreement',
  'I was emotionally prepared to leave, but not logistically',
]

const ESCALATIONS = [
  'I will be there in four minutes. Please start without me, and also do not start without me.',
  'Currently in transit. Transit is a flexible concept today.',
  'Almost there. Definition of "almost" currently under review.',
  'En route. Have also prepared a short apology deck.',
  'Arriving shortly. Have already added this to the agenda as "AOB".',
  'I will join with my camera off and answer every question with "agreed".',
]

export default function ExcuseGenerator() {
  const [excuse, setExcuse] = useState('')
  const [escalation, setEscalation] = useState('')
  const [count, setCount] = useState(0)
  const [burst, fire] = useConfetti()
  const { unlock } = useNonsense()

  const generate = () => {
    const text = `${pick(OPENERS)} ${pick(REASONS)}.`
    setExcuse(text)
    setEscalation(pick(ESCALATIONS))
    setCount((c) => c + 1)
    fire()
    sound.ding()
    unlock('excuse')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${excuse}\n\n${escalation}`)
      notify.success('Excuse copied', 'Paste it somewhere official and walk away quickly.', '📋')
    } catch {
      notify.error('Clipboard refused', 'Even your browser has standards.', '🚫')
    }
  }

  const believability = Math.max(6, 94 - count * 7)

  return (
    <ToolShell
      id="excuse"
      name="Excuse Generator"
      emoji="🎭"
      tagline="Ridiculous excuses for being late, professionally formatted."
      category="Randomly Useless Utilities"
      accent="sun"
      honesty="This generates text on your device. That is all it does. It does not send anything anywhere, and we strongly advise against using the output in any real workplace situation."
      aside={
        <ResultPanel title="Excuse metrics">
          <ReportRow label="Excuses generated" value={String(count)} />
          <ReportRow label="Believability" value={`${believability}%`} verdict={believability > 50 ? 'good' : 'bad'} />
          <ReportRow label="Professional risk" value={count > 4 ? 'High' : 'Manageable'} verdict={count > 4 ? 'bad' : 'neutral'} />
          <ReportRow label="Recommended use" value="Comedy only" verdict="good" />
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="sun" onClick={copy} disabled={!excuse} icon={<Copy className="h-4 w-4" />}>
              Copy excuse
            </Button>
            <Button variant="ghost" onClick={generate} icon={<RefreshCw className="h-4 w-4" />}>
              Another one
            </Button>
          </div>
          <p className="mt-4 rounded-xl bg-sunrise/70 p-3 text-xs text-ink">
            Believability decreases with each excuse because, statistically, you are using them too
            often.
          </p>
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <Card className="text-center">
        <Chip color="plain" className="mb-4">
          <Sparkles className="h-3 w-3" /> Latest masterpiece
        </Chip>
        <div className="min-h-[9rem]">
          {excuse ? (
            <motion.div
              key={excuse}
              initial={{ opacity: 0, y: 10, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              className="space-y-4"
            >
              <p className="font-display text-xl font-bold leading-snug sm:text-2xl">“{excuse}”</p>
              <p className="text-sm text-ink-muted dark:text-cream/60">{escalation}</p>
            </motion.div>
          ) : (
            <p className="grid h-36 place-items-center text-sm text-ink-muted dark:text-cream/50">
              No excuse on file yet. Your excuses have been impeccable so far, allegedly.
            </p>
          )}
        </div>
        <Button variant="primary" size="xl" className="mt-6" onClick={generate} icon={<Sparkles className="h-5 w-5" />}>
          {excuse ? 'Generate another excuse' : 'Generate an excuse'}
        </Button>
      </Card>

      <Card className="bg-cream-deep dark:bg-[#100F0D]">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide">Excuse taxonomy</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { title: 'Domestic', body: 'Alarms, laundry, doors, and household objects with opinions.' },
            { title: 'Logistical', body: 'Routes, transit, timing, and the fundamental cruelty of Tuesdays.' },
            { title: 'Existential', body: 'Documentaries, self-reflection, and losing arguments with your shoes.' },
          ].map((t) => (
            <div key={t.title} className="rounded-2xl border-2 border-ink bg-white p-3 dark:border-cream dark:bg-[#171512]">
              <div className="font-display text-sm font-bold">{t.title}</div>
              <p className="mt-1 text-xs text-ink-muted dark:text-cream/60">{t.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </ToolShell>
  )
}
