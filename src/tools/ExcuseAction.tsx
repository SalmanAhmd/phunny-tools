import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, Copy } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick } from '@/lib/random'

const PRECEDENTS = [
  { offsetDays: 1, label: 'Tomorrow', reason: 'Official starting point. Universally believed, never tested.' },
  { offsetDays: 3, label: 'After the weekend', reason: 'The weekend is a protected negotiation period.' },
  { offsetDays: 7, label: 'Next week sometime', reason: 'Deliberately vague so nobody can verify it.' },
  { offsetDays: 14, label: 'Once things calm down', reason: 'Things do not calm down. That is the point.' },
  { offsetDays: 30, label: 'Next month, definitely', reason: 'Now carrying a commitment-ish tone.' },
  { offsetDays: 92, label: 'End of the quarter', reason: 'A business unit of time meaning "not now".' },
  { offsetDays: 180, label: 'After the summer', reason: 'Requires the existence of a summer plan.' },
  { offsetDays: 365, label: 'Same time next year', reason: 'Now classed as a tradition rather than a task.' },
  { offsetDays: 1095, label: 'In three years, maybe', reason: 'You will have changed jobs by then. Convenient.' },
  { offsetDays: 3650, label: 'A decade from now', reason: 'The next milestone in the roadmap.' },
  { offsetDays: 18250, label: 'In fifty years', reason: 'Statistically resolvable by someone else.' },
]

const REASONS = [
  'A dependency has appeared. It is unnamed.',
  'This requires alignment we do not currently have.',
  'The person who could approve this is "around somewhere".',
  'It has been added to the backlog for prioritisation.',
  'This is now a Q3 item. No year has been specified.',
  'We are waiting on some data. The data is also waiting.',
  'It needs a meeting. The meeting needs a meeting.',
  'There is a blocker. The blocker is cultural.',
]

function formatDate(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ExcuseAction() {
  const [input, setInput] = useState("I'll do it tomorrow")
  const [generated, setGenerated] = useState(false)
  const [burst, fire] = useConfetti()
  const { unlock } = useNonsense()

  const rows = PRECEDENTS.map((p) => ({ ...p, date: formatDate(p.offsetDays), excuse: pick(REASONS) }))

  const run = () => {
    setGenerated(true)
    fire()
    sound.ding()
    unlock('excuseaction')
    notify.success('Timeline elaborated', 'Your task has been rescheduled into the distant future.', '📆')
  }

  const copyAll = async () => {
    const text = rows
      .map((r, i) => `${i + 1}. ${r.label} — ${r.date}\n   Reason: ${r.excuse}`)
      .join('\n\n')
    try {
      await navigator.clipboard.writeText(`Timeline for: ${input}\n\n${text}`)
      notify.success('Timeline copied', 'Twelve future dates, zero progress.', '📋')
    } catch {
      notify.error('Clipboard refused', 'Even it knows what you are doing.', '🚫')
    }
  }

  return (
    <ToolShell
      id="excuseaction"
      name="The Excuse-to-Action Converter"
      emoji="📆"
      tagline={'Converts "I\'ll do it tomorrow" into increasingly elaborate future dates.'}
      category="Randomly Useless Utilities"
      accent="pink"
      honesty="This is a text generator and a date calculator, both running locally. The dates are real dates; the reasons are not real reasons. Do not use this to communicate with a manager."
      aside={
        <ResultPanel title="Procrastination index">
          <ReportRow label="Original commitment" value={input.slice(0, 20) || '—'} />
          <ReportRow label="Dates generated" value={String(rows.length)} />
          <ReportRow label="Final scheduled date" value={formatDate(PRECEDENTS[PRECEDENTS.length - 1].offsetDays).slice(0, 22)} verdict="bad" />
          <ReportRow label="Effort required now" value="None" verdict="bad" />
          <ReportRow label="Advised" value="Probably not" verdict="bad" />
          <Button variant="danger" className="mt-4 w-full" onClick={copyAll} disabled={!generated} icon={<Copy className="h-4 w-4" />}>
            Copy the whole timeline
          </Button>
          <p className="mt-4 rounded-xl bg-bubblegum/40 p-3 text-xs text-ink">
            Every date here is real. Every reason is invented. The combination is, regrettably,
            familiar.
          </p>
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <Card>
        <label htmlFor="commitment" className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
          <CalendarClock className="h-4 w-4" /> Your commitment
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="commitment"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            className="flex-1 rounded-2xl border-2 border-ink bg-cream-deep px-4 py-3 text-sm outline-none focus:bg-white dark:border-cream dark:bg-[#100F0D] dark:focus:bg-[#171512]"
            placeholder="I'll do it tomorrow"
          />
          <Button variant="primary" size="lg" onClick={run}>
            Elaborate this timeline
          </Button>
        </div>
      </Card>

      {generated && (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, x: -12, rotate: -0.5 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 24 }}
              className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-ink bg-white p-4 shadow-popsm dark:border-cream dark:bg-[#171512]"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-sunrise font-display text-sm font-bold dark:border-cream">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-bold">
                  {r.label} <span className="font-normal text-ink-muted dark:text-cream/60">· {r.date}</span>
                </div>
                <div className="mt-0.5 text-xs text-ink-muted dark:text-cream/60">{r.excuse}</div>
              </div>
              {i === rows.length - 1 && <Chip color="pink">Final answer</Chip>}
            </motion.div>
          ))}
        </div>
      )}

      {!generated && (
        <Card className="bg-cream-deep dark:bg-[#100F0D]">
          <p className="text-sm text-ink-muted dark:text-cream/60">
            Type any commitment and we will build a fully documented timeline stretching into the next
            fifty years. None of it will happen. All of it will sound reasonable.
          </p>
        </Card>
      )}
    </ToolShell>
  )
}
