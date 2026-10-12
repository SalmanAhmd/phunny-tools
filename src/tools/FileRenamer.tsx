import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Download, RefreshCw } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { FileDropZone } from '@/components/ui/FileDropZone'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { downloadBlob } from '@/lib/download'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { cn, extensionOf, formatBytes, toolFileMeta } from '@/lib/utils'
import { pick, randInt } from '@/lib/random'

interface Personality {
  id: string
  label: string
  emoji: string
  blurb: string
  rename: (base: string, ext: string) => string[]
}

const PERSONALITIES: Personality[] = [
  {
    id: 'ceo',
    label: 'Overconfident CEO',
    emoji: '👔',
    blurb: 'Everything is a final version and everything is critical.',
    rename: (base) => [
      `THIS_IS_THE_FINAL_${base.toUpperCase()}`,
      `${base.toUpperCase()}__FINAL__APPROVED_BY_EXEC`,
      `${base.toUpperCase()}_V1_STRATEGIC`,
      `${base.toUpperCase()}_DO_NOT_EDIT_THIS_IS_LIVE`,
    ],
  },
  {
    id: 'dev',
    label: 'Sleep-deprived developer',
    emoji: '😴',
    blurb: 'Named at 3:41am with no regard for future colleagues.',
    rename: (base) => [
      `${base}_fix_fix_final2`,
      `${base}_asdfgh`,
      `${base}_temp_ACTUAL_usethis`,
      `untitled_${base}_copy_(do not delete)`,
    ],
  },
  {
    id: 'manager',
    label: 'Passive-aggressive manager',
    emoji: '🙃',
    blurb: 'Per my last email, please rename this file.',
    rename: (base) => [
      `per_my_last_email_${base}`,
      `${base}_as_discussed`,
      `${base}_circling_back_on_this`,
      `${base}_just_a_quick_favour`,
    ],
  },
  {
    id: 'conspiracy',
    label: 'Conspiracy theorist',
    emoji: '🛸',
    blurb: 'The file name has clearly been redacted by someone.',
    rename: (base) => [
      `proof_that_${base}_is_real`,
      `${base}_THEY_DONT_WANT_YOU_TO_SEE`,
      `redacted_${base}_unredacted`,
      `${base}_wake_up_sheeple_v${randInt(2, 9)}`,
    ],
  },
  {
    id: 'gov',
    label: 'Extremely formal government officer',
    emoji: '📜',
    blurb: 'A file name should be a paragraph and a reference number.',
    rename: (base, ext) => [
      `FORM-${randInt(100, 999)}-${base.toUpperCase()}-REV-${String.fromCharCode(65 + randInt(0, 25))}.${ext}`,
      `Notice_Concerning_The_Matter_Of_${base}_Dated_${new Date().toISOString().slice(0, 10)}`,
      `${base.toUpperCase()}_APPROVED_FOR_INTERNAL_CIRCULATION_ONLY`,
      `Annex_${randInt(1, 99)}_To_${base}_For_Your_Records`,
    ],
  },
]

export default function FileRenamer() {
  const [file, setFile] = useState<File | null>(null)
  const [personality, setPersonality] = useState<Personality>(PERSONALITIES[0])
  const [seed, setSeed] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [burst, fire] = useConfetti()
  const { unlock, registerFile } = useNonsense()

  const meta = file ? toolFileMeta(file) : null

  const suggestions = useMemo(() => {
    if (!meta) return []
    void seed // seed exists so we can force a re-roll
    const ext = extensionOf(meta.name)
    return personality.rename(meta.base, ext).map((name) =>
      name.includes('.') || !ext || ext === 'mystery' ? name : `${name}.${ext}`,
    )
  }, [meta, personality, seed])

  const choose = (name: string) => {
    setChosen(name)
    sound.ding()
    unlock('rename')
    notify.success('Name selected', `${name} — sounds confident. Nobody will question it.`, '🏷️')
  }

  const download = () => {
    if (!file || !chosen) return
    const copy = new File([file], chosen, { type: file.type || 'application/octet-stream' })
    downloadBlob(copy, copy.name)
    notify.success('Copy downloaded', 'A renamed copy. Your original file is untouched and still called that.', '⬇️')
  }

  return (
    <ToolShell
      id="renamer"
      name="The World-Famous File Renamer"
      emoji="🏷️"
      tagline="Rename every file like an unqualified intern."
      category="File Destruction & Management"
      accent="lime"
      honesty="The rename is real, but it applies to a downloaded copy. Browsers cannot rename files in place, and we would never touch your original anyway. The original keeps its original, sensible name."
      aside={
        <ResultPanel title="Rename record">
          <ReportRow label="Original name" value={meta?.name.slice(0, 24) ?? '—'} />
          <ReportRow label="Extension" value={meta ? `.${meta.ext}` : '—'} />
          <ReportRow label="Size" value={file ? formatBytes(file.size) : '—'} />
          <ReportRow label="Personality" value={personality.label} />
          <ReportRow label="Chosen name" value={chosen ? chosen.slice(0, 24) : 'Not chosen'} verdict={chosen ? 'good' : 'neutral'} />
          <ReportRow label="Original overwritten" value="Never" verdict="good" />
          {chosen && (
            <Button variant="lime" className="mt-4 w-full" onClick={download} icon={<Download className="h-4 w-4" />}>
              Download renamed copy
            </Button>
          )}
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={40} />

      <FileDropZone
        accept="any"
        onFile={(f) => {
          setFile(f)
          setChosen(null)
          registerFile()
        }}
        label="Upload a file with a perfectly reasonable name"
        hint="Any file type. We will not open it, only judge its title."
        current={file ? { name: file.name, size: file.size } : null}
      />

      {file && meta && (
        <>
          <Card>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Choose a renaming personality</h2>
            <div className="flex flex-wrap gap-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPersonality(p)
                    setChosen(null)
                    setSeed((s) => s + 1)
                    sound.click()
                  }}
                  aria-pressed={personality.id === p.id}
                  className={cn(
                    'max-w-[16rem] rounded-2xl border-2 border-ink px-3 py-2 text-left shadow-popsm transition hover:-translate-y-0.5 dark:border-cream',
                    personality.id === p.id ? 'bg-sunrise' : 'bg-white dark:bg-[#171512]',
                  )}
                >
                  <div className="font-display text-sm font-bold">
                    <span aria-hidden className="mr-1">{p.emoji}</span>
                    {p.label}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-muted dark:text-cream/60">{p.blurb}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Chip color="plain">Current name</Chip>
              <span className="break-all font-mono text-sm">{meta.name}</span>
            </div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide">Proposed names</h2>
              <Button variant="ghost" size="sm" onClick={() => { setSeed((s) => s + 1); setChosen(null) }} icon={<RefreshCw className="h-3.5 w-3.5" />}>
                Re-roll
              </Button>
            </div>
            <ul className="space-y-2">
              {suggestions.map((name, i) => (
                <motion.li
                  key={name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 p-3',
                    chosen === name ? 'border-ink bg-limey dark:border-cream' : 'border-ink/20 dark:border-cream/25',
                  )}
                >
                  <div className="min-w-0">
                    <div className="break-all font-mono text-xs font-bold">{name}</div>
                    <div className="mt-0.5 text-[11px] text-ink-muted dark:text-cream/50">
                      {pick([
                        'Confident. Possibly misleading.',
                        'Will confuse the next person to open this folder.',
                        'Technically a file name. Barely.',
                        'Reads like a cry for help.',
                      ])}
                    </div>
                  </div>
                  <Button variant={chosen === name ? 'lime' : 'ghost'} size="sm" onClick={() => choose(name)} icon={chosen === name ? <Check className="h-3.5 w-3.5" /> : undefined}>
                    {chosen === name ? 'Chosen' : 'Choose'}
                  </Button>
                </motion.li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="sun"
                onClick={() => {
                  const name = pick(suggestions)
                  choose(name)
                  fire()
                }}
              >
                🎲 Let the intern decide
              </Button>
              <span className="self-center font-mono text-[11px] text-ink-muted dark:text-cream/50">
                The intern has chosen {randInt(4, 40)} times today and regretted all of them.
              </span>
            </div>
          </Card>
        </>
      )}
    </ToolShell>
  )
}
