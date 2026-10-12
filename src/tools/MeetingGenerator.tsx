import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarPlus, Copy, Download, RefreshCw } from 'lucide-react'
import { ToolShell, ResultPanel } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { downloadText } from '@/lib/download'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pickMany, shuffle } from '@/lib/random'

const FRAMEWORK = [
  'Identify the problem (this takes one meeting).',
  'Confirm that the problem is still a problem (this takes two).',
  'Rename the problem to something friendlier.',
  'Assemble a committee with no authority to decide anything.',
  'Agree on the definition of the word "decide".',
  'Schedule a meeting to schedule the decision meeting.',
  'Produce a two-page brief for a one-line question.',
  'Debate priorities for forty minutes, then agree to revisit.',
  'Assign an owner who is currently on leave.',
  'Add a risk register nobody will ever open.',
  'Present findings to leadership, who are double-booked.',
  'Defer the decision to next quarter and celebrate.',
]

const STAKEHOLDER_ROLES = [
  'Chief Alignment Officer',
  'Head of Cross-Functional Synergy',
  'Principal Stakeholder Wrangler',
  'Director of Scheduling the Scheduler',
  'VP of Being Copied On Things',
  'Senior Manager (Decisions, Deferred)',
  'Lead Communications Liaison to the Comms Team',
  'Head of Optics & Vibes',
  'Customer Champion (has never met a customer)',
  'Chief Risk Officer (Specialising in Pizza)',
  'Interim Interim Director',
  'Head of Post-Decision Analysis',
]

const STAKEHOLDER_OPINIONS = [
  'strongly prefers option A, but cannot attend.',
  'believes this should be a different meeting entirely.',
  'has prepared twelve slides for a nine-minute agenda item.',
  'would like to "just quickly" raise something unrelated.',
  'is unavailable but has delegated authority to a Slack emoji.',
  'has questions about the questions.',
  'wants to make sure the quieter voices are heard, loudly.',
  'would prefer to take this offline, permanently.',
  'has raised a blocker that only they can resolve.',
]

const AGENDA_ITEMS = [
  'Welcome & Land Acknowledgement of the Meeting Itself (3 min)',
  'Introductions (round-robin, no skipping) (8 min)',
  'Conflict of Interest Declarations (11 min)',
  'Review of Previous Meeting\'s Action Items (none were actioned) (7 min)',
  'Presentation of the Original Question, Unchanged Since March (4 min)',
  'Breakout Room: The Question, But Quieter (12 min)',
  'Reading Aloud of the Risk Register (14 min)',
  'Discussion Held Because Nobody Wants to Decide (22 min)',
  'Tabled Discussion About Tabulating Discussions (9 min)',
  'AOB from an attendee who joined at minute 44 (6 min)',
  'Confirmation That We Have Run Out of Time (1 min)',
  'Scheduling of the Follow-Up (see Appendix C) (5 min)',
]

const FOLLOW_UPS = [
  { title: 'Follow-up: The Follow-up', when: 'Tuesday, 8:00am, so nobody can attend', goal: 'Recap what we did not decide.' },
  { title: 'Decision Finalisation Workshop (Part 1 of 4)', when: 'Thursday, during lunch, cameras on', goal: 'Attempt a decision in a safe environment.' },
  { title: 'Post-Mortem on the Lack of a Decision', when: 'In three weeks, same attendees, longer agenda', goal: 'Understand why nothing happened, slowly.' },
  { title: 'Emergency Sync: Nothing Has Changed', when: 'Friday 4:55pm', goal: 'Ensure the status quo is maintained elegantly.' },
  { title: 'Stakeholder Alignment Summit (Retreat)', when: 'Two days, offsite, no internet', goal: 'Align. Do not decide.' },
]

const RISKS = [
  'Choosing the wrong option may require a follow-up meeting.',
  'Choosing the right option may set an unmanageable precedent of deciding things.',
  'Nobody may remember what the original question was. (Likelihood: certain.)',
  'The person with the authority may be on annual leave for the duration of the process.',
  'Documentation may be produced, which then has to be reviewed.',
  'The problem may resolve itself, rendering the committee unnecessary and furious.',
  'A brownie may be chosen but nobody may have confirmed dietary requirements.',
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)
}

function buildReport(problem: string, seed: number) {
  const roles = pickMany(STAKEHOLDER_ROLES, 5)
  const opinions = shuffle(STAKEHOLDER_OPINIONS).slice(0, 5)
  const stakeholders = roles.map((role, i) => ({ role, note: opinions[i] }))
  const followUps = shuffle(FOLLOW_UPS).slice(0, 3)
  const risks = shuffle(RISKS).slice(0, 5)
  const attendeeCount = 11 + (seed % 7)
  const costPerHour = 240 + (seed % 400)

  const summary = [
    `EXECUTIVE SUMMARY — ${problem.toUpperCase()}`,
    '',
    `On ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, ${attendeeCount} colleagues convened to address the following matter: "${problem}".`,
    '',
    `The group made excellent progress towards the act of making progress. A twelve-step framework was adopted unanimously at step three and abandoned silently at step seven.`,
    '',
    `Outcome: no decision was reached, which is consistent with our governance model and honestly quite comfortable for everyone involved.`,
    '',
    `Total meeting time consumed: ${attendeeCount * 1} hours. Estimated fictional cost: ${(attendeeCount * costPerHour).toLocaleString('en-US')} currency units. Business value: unmeasurable, in both senses.`,
    '',
    `Recommendation: proceed directly to the three follow-up meetings detailed in this document.`,
  ].join('\n')

  return { stakeholders, followUps, risks, attendeeCount, costPerHour, summary }
}

export default function MeetingGenerator() {
  const [problem, setProblem] = useState('')
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000))
  const [generated, setGenerated] = useState(problem.length > 0)
  const [burst, fire] = useConfetti()
  const { unlock } = useNonsense()

  const data = useMemo(() => buildReport(problem || 'This matter', seed), [problem, seed])

  const generate = () => {
    const q = problem.trim() || 'Which pizza should we order?'
    setProblem(q)
    setSeed(Math.floor(Math.random() * 100000))
    setGenerated(true)
    fire()
    sound.ding()
    unlock('meeting')
    notify.success('Meeting generated', 'Nobody is invited. Everybody will be copied in anyway.', '📅')
  }

  const asText = () => {
    const lines: string[] = []
    lines.push('╔══════════════════════════════════════════════════════╗')
    lines.push('║   UNNECESSARY MEETING REPORT — STRICTLY CONFIDENTIAL  ║')
    lines.push('╚══════════════════════════════════════════════════════╝')
    lines.push('')
    lines.push(data.summary)
    lines.push('')
    lines.push('— 12-STEP DECISION-MAKING FRAMEWORK —')
    FRAMEWORK.forEach((s, i) => lines.push(`${String(i + 1).padStart(2, '0')}. ${s}`))
    lines.push('')
    lines.push('— AGENDA —')
    AGENDA_ITEMS.forEach((s, i) => lines.push(`${String(i + 1).padStart(2, '0')}. ${s}`))
    lines.push('')
    lines.push('— STAKEHOLDERS WHO MUST BE CONSULTED —')
    data.stakeholders.forEach((s) => lines.push(`• ${s.role} — ${s.note}`))
    lines.push('')
    lines.push('— FOLLOW-UP MEETINGS —')
    data.followUps.forEach((f, i) => lines.push(`${i + 1}. ${f.title}\n   When: ${f.when}\n   Goal: ${f.goal}`))
    lines.push('')
    lines.push('— RISK ASSESSMENT: CHOOSING WRONG —')
    data.risks.forEach((r) => lines.push(`• ${r}`))
    lines.push('')
    lines.push('— ESTIMATES —')
    lines.push(`Attendees: ${data.attendeeCount}`)
    lines.push(`Load-bearing cost: ${data.costPerHour} currency units per hour (fictional)`)
    lines.push(`Total fictional spend: ${(data.attendeeCount * data.costPerHour).toLocaleString('en-US')} currency units`)
    lines.push('')
    lines.push('This document is a joke. It contains no real business value and should not be actioned.')
    return lines.join('\n')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText())
      sound.ding()
      notify.success('Copied to clipboard', 'You can now inconvenience people in writing.', '📋')
    } catch {
      notify.error('Clipboard refused', 'Your browser is protecting you. Wise.', '🚫')
    }
  }

  return (
    <ToolShell
      id="meeting"
      name="The Unnecessary Meeting Generator"
      emoji="📅"
      tagline="Turn a simple decision into a calendar crisis."
      category="Office Productivity Disasters"
      accent="grape"
      honesty="This tool genuinely generates text and genuinely lets you copy or download it. What it is not is a real meeting invitation service — nothing is scheduled, sent, or shared with anyone."
      aside={
        <ResultPanel title="Fictional estimates">
          <div className="space-y-3 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-ink-muted dark:text-cream/60">Attendees</span>
              <span className="font-mono font-bold">{data.attendeeCount}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-ink-muted dark:text-cream/60">Running time</span>
              <span className="font-mono font-bold">1 hour (minimum)</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-ink-muted dark:text-cream/60">Notional cost</span>
              <span className="font-mono font-bold">
                {(data.attendeeCount * data.costPerHour).toLocaleString('en-US')} units
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-ink-muted dark:text-cream/60">Decisions made</span>
              <span className="font-mono font-bold text-tangerine">0</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-ink-muted dark:text-cream/60">Follow-ups created</span>
              <span className="font-mono font-bold">{data.followUps.length}</span>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-cream-deep p-3 text-xs text-ink-muted dark:bg-[#100F0D] dark:text-cream/60">
            All currency figures are fictional and are denominated in "units". Nobody was charged. Nobody
            was paid. Nobody decided anything.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="lime" onClick={copy} icon={<Copy className="h-4 w-4" />}>
              Copy report
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                downloadText(asText(), `meeting-report-${slugify(problem) || 'unnecessary'}.txt`)
                notify.success('Report downloaded', 'Please do not actually send this to anyone.', '⬇️')
              }}
              icon={<Download className="h-4 w-4" />}
            >
              Download as .txt
            </Button>
          </div>
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <Card>
        <label htmlFor="problem" className="font-display text-sm font-bold uppercase tracking-wide">
          Describe your extremely simple problem
        </label>
        <p className="mt-1 text-xs text-ink-muted dark:text-cream/60">
          Keep it trivial. The more trivial, the more we can escalate it.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            placeholder="Which pizza should we order?"
            className="flex-1 rounded-2xl border-2 border-ink bg-cream-deep px-4 py-3 text-sm outline-none placeholder:text-ink-muted focus:bg-white dark:border-cream dark:bg-[#100F0D] dark:placeholder:text-cream/40 dark:focus:bg-[#171512]"
          />
          <Button variant="primary" size="lg" onClick={generate} icon={<CalendarPlus className="h-5 w-5" />}>
            Generate meeting crisis
          </Button>
        </div>
      </Card>

      {generated && (
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-sunrise" tilt={-0.4}>
              <Chip color="plain">Executive summary</Chip>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">{data.summary}</pre>
            </Card>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <h2 className="font-display text-base font-bold">12-step decision-making framework</h2>
              <ol className="mt-3 space-y-2 text-sm">
                {FRAMEWORK.map((s, i) => (
                  <li key={s} className="flex gap-2">
                    <span className="font-mono text-xs font-bold text-tangerine">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-ink-muted dark:text-cream/70">{s}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card>
              <h2 className="font-display text-base font-bold">Completely unnecessary agenda</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {AGENDA_ITEMS.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-tangerine">•</span>
                    <span className="text-ink-muted dark:text-cream/70">{s}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
            <h2 className="font-display text-base font-bold">Five stakeholders who must be consulted</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {data.stakeholders.map((s, i) => (
                <div key={s.role} className="rounded-2xl border-2 border-ink bg-cream-deep p-3 dark:border-cream dark:bg-[#100F0D]">
                  <div className="font-display text-sm font-bold">
                    {['👔', '🧑‍💼', '📎', '🕶️', '☕'][i % 5]} {s.role}
                  </div>
                  <p className="mt-1 text-xs text-ink-muted dark:text-cream/60">This stakeholder {s.note}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <Card className="bg-grape text-white" tilt={0.5}>
              <h2 className="font-display text-base font-bold">Three follow-up meetings</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {data.followUps.map((f) => (
                  <li key={f.title} className="rounded-2xl border-2 border-white/40 p-3">
                    <div className="font-bold">{f.title}</div>
                    <div className="mt-1 text-xs text-white/80">When: {f.when}</div>
                    <div className="text-xs text-white/80">Goal: {f.goal}</div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="font-display text-base font-bold">Risk assessment: choosing wrong</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {data.risks.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-bubblegum">⚠</span>
                    <span className="text-ink-muted dark:text-cream/70">{r}</span>
                  </li>
                ))}
              </ul>
              <Button variant="ghost" className="mt-4 w-full" onClick={generate} icon={<RefreshCw className="h-4 w-4" />}>
                Regenerate everything
              </Button>
            </Card>
          </div>
        </div>
      )}

      {!generated && (
        <Card className="bg-cream-deep dark:bg-[#100F0D]">
          <p className="text-sm text-ink-muted dark:text-cream/60">
            Type anything above and press generate. You will receive a framework, an agenda, five
            stakeholders, three follow-ups, a risk register, and an executive summary. You will not
            receive a decision.
          </p>
        </Card>
      )}
    </ToolShell>
  )
}
