import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Type } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick } from '@/lib/random'
import { cn } from '@/lib/utils'

interface FontChoice {
  id: string
  label: string
  family: string
  severity: number
  note: string
}

const FONTS: FontChoice[] = [
  {
    id: 'comic',
    label: 'Comic Sans Emergency',
    family: '"Comic Sans MS", "Comic Neue", "Chalkboard SE", cursive',
    severity: 78,
    note: 'Deployed in genuine emergencies only. Never in genuine emergencies only.',
  },
  {
    id: 'times',
    label: 'Times New Roman Depression',
    family: '"Times New Roman", Times, serif',
    severity: 64,
    note: 'The official font of unread memoranda and quiet despair.',
  },
  {
    id: 'papyrus',
    label: 'Papyrus Executive Edition',
    family: 'Papyrus, "Papyrus", "Copperplate", fantasy',
    severity: 88,
    note: 'Trusted by film posters and absolutely nobody in design.',
  },
  {
    id: 'impact',
    label: 'Impactful Life Decisions',
    family: 'Impact, "Haettenschweiler", "Arial Black", sans-serif',
    severity: 92,
    note: 'Every sentence becomes a threat when set in Impact.',
  },
  {
    id: 'wingdings',
    label: 'Wingdings Legal Notice',
    family: 'Wingdings, "Zapf Dingbats", "Apple Symbols", fantasy',
    severity: 99,
    note: 'Legally binding in at least two jurisdictions that do not exist.',
  },
]

const JARGON_VERBS = ['leverage', 'operationalise', 'socialise', 'circle back on', 'double-click on', 'unpack', 'align on']
const JARGON_NOUNS = ['the deliverable', 'our north star', 'the value proposition', 'the ask', 'the roadmap', 'stakeholder alignment']
const JARGON_SUFFIX = [
  'before the end of the quarter',
  'in a dedicated breakout room',
  'without boiling the ocean',
  'for visibility and alignment',
  'so we can take it offline',
]

function corporateise(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  const out = (sentences.length ? sentences : [text]).map((s) => {
    const topic = s.replace(/[.!?]+$/, '').split(' ').slice(0, 6).join(' ')
    return `Moving forward, we should ${pick(JARGON_VERBS)} ${pick(JARGON_NOUNS)} regarding "${topic}", ${pick(JARGON_SUFFIX)}.`
  })
  return out.join('\n\n')
}

export default function Fontify() {
  const [text, setText] = useState('Our relationship is fine, we just need to talk about the wedding budget.')
  const [font, setFont] = useState<FontChoice>(FONTS[0])
  const [corporate, setCorporate] = useState('')
  const [burst, fire] = useConfetti()
  const { unlock } = useNonsense()

  const severity = useMemo(() => {
    const lengthBonus = Math.min(18, text.length / 12)
    return Math.min(100, Math.round(font.severity + lengthBonus))
  }, [font, text])

  const apply = (f: FontChoice) => {
    setFont(f)
    sound.click()
    unlock('font')
  }

  const makeCorporate = () => {
    const result = corporateise(text)
    setCorporate(result)
    fire()
    sound.ding()
    unlock('font')
    notify.success('Corporate transformation complete', 'The meaning has been professionally removed.', '💼')
  }

  return (
    <ToolShell
      id="fontify"
      name="Fontify Your Problems"
      emoji="🔤"
      tagline="Your problems aren't serious enough. Change their font."
      category="Office Productivity Disasters"
      accent="pink"
      honesty="This is a real font preview — your text is rendered in whatever family your device has available. The severity score is entirely made up. The corporate jargon button works, in the sense that it produces words."
      aside={
        <ResultPanel title="Typography triage">
          <ReportRow label="Selected treatment" value={font.label} />
          <ReportRow label="Severity score" value={`${severity}/100`} verdict={severity > 85 ? 'bad' : 'neutral'} />
          <ReportRow label="Characters treated" value={String(text.length)} />
          <ReportRow label="Legibility retained" value={font.id === 'wingdings' ? 'No' : 'Partial'} verdict={font.id === 'wingdings' ? 'bad' : 'good'} />
          <ReportRow label="Professional advice" value={font.id === 'papyrus' ? 'Please do not' : 'Unclear'} verdict="bad" />
          <p className="mt-4 rounded-xl bg-sunrise/70 p-3 text-xs text-ink">
            {font.note}
          </p>
          <div className="mt-4 h-4 w-full overflow-hidden rounded-full border-2 border-ink bg-cream-deep dark:border-cream dark:bg-[#100F0D]">
            <motion.div
              className={cn('h-full', severity > 85 ? 'bg-bubblegum' : severity > 65 ? 'bg-tangerine' : 'bg-limey')}
              animate={{ width: `${severity}%` }}
              transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
            <span>Fine</span>
            <span>Resignation letter</span>
          </div>
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <Card>
        <label htmlFor="problem-text" className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
          <Type className="h-4 w-4" /> Your problem, in words
        </label>
        <textarea
          id="problem-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="mt-3 w-full resize-y rounded-2xl border-2 border-ink bg-cream-deep p-4 text-sm outline-none focus:bg-white dark:border-cream dark:bg-[#100F0D] dark:focus:bg-[#171512]"
          placeholder="Type your extremely reasonable concern here…"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => apply(f)}
              aria-pressed={font.id === f.id}
              className={cn(
                'rounded-2xl border-2 border-ink px-3 py-2 font-display text-xs font-bold shadow-popsm transition hover:-translate-y-0.5 dark:border-cream',
                font.id === f.id ? 'bg-sunrise' : 'bg-white dark:bg-[#171512]',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      <motion.div
        key={font.id}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border-2 border-ink bg-white p-6 shadow-pop dark:border-cream dark:bg-[#171512]"
      >
        <Chip color="plain" className="mb-4">
          Rendered in {font.label}
        </Chip>
        <p style={{ fontFamily: font.family }} className="break-words text-2xl leading-snug sm:text-3xl">
          {text || 'Type something above and watch it become a design decision.'}
        </p>
        {font.id === 'wingdings' && (
          <p className="mt-4 font-mono text-[11px] text-ink-muted dark:text-cream/50">
            If the letters above look like letters, your device does not have this font and has
            substituted something sensible. Consider yourself protected.
          </p>
        )}
      </motion.div>

      <Card className="bg-cream-deep dark:bg-[#100F0D]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide">Make it more corporate</h2>
            <p className="mt-1 text-xs text-ink-muted dark:text-cream/60">
              Converts a human sentence into something a committee would nod at.
            </p>
          </div>
          <Button variant="grape" onClick={makeCorporate} icon={<Briefcase className="h-4 w-4" />}>
            Make It More Corporate
          </Button>
        </div>
        {corporate && (
          <motion.pre
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 whitespace-pre-wrap rounded-2xl border-2 border-dashed border-ink/30 bg-white p-4 font-sans text-sm leading-relaxed dark:border-cream/30 dark:bg-[#171512]"
          >
            {corporate}
          </motion.pre>
        )}
      </Card>
    </ToolShell>
  )
}
