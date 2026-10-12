import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Dumbbell, HeartPulse } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { FileDropZone } from '@/components/ui/FileDropZone'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { formatBytes } from '@/lib/utils'
import { downloadText } from '@/lib/download'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick, pickMany } from '@/lib/random'

const FIRST = ['Brad', 'Chad', 'Kyle', 'Brayden', 'Dirk', 'Trent', 'Jaxon', 'Blaze', 'Gunnar', 'Brody']
const LAST = ['Deadlift', 'Proteinsson', 'Bicepovic', 'Gainsly', 'Quadzilla', 'Benchpress', 'Squatson', 'Cardiodeficient']
const NICKNAMES = ['The Rock (smaller)', 'The Quadfather', 'Sir Liftsalot', 'Two Scoops', 'The Bulk', 'Hamstring Harry', 'Iron Abs']

const WORKOUTS = [
  { name: 'Dumbbell curls', emoji: '🏋️', line: 'The file curls a 4 KB dumbbell. It wobbles.' },
  { name: 'Push-ups', emoji: '💪', line: 'The file completes three push-ups and requests a break.' },
  { name: 'Treadmill sprints', emoji: '🏃', line: 'The file runs at 3 KB/s and immediately regrets it.' },
  { name: 'Protein shake', emoji: '🥤', line: 'The file consumes 17 KB of whey and zero bytes are gained.' },
  { name: 'Leg day', emoji: '🦵', line: 'The file skips leg day. Leg day has been skipped again.' },
  { name: 'Deadlifts', emoji: '⚙️', line: 'The file attempts a deadlift. Nothing is lifted.' },
]

export default function FileGym() {
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [bro, setBro] = useState<{ first: string; last: string; nick: string } | null>(null)
  const [strength, setStrength] = useState(2)
  const [muscle, setMuscle] = useState(0.4)
  const [protein, setProtein] = useState(0)
  const [motivation, setMotivation] = useState<'Critical' | 'Concerning' | 'Mild' | 'Overconfident'>('Critical')
  const [log, setLog] = useState<string[]>([])
  const [training, setTraining] = useState(false)
  const [burst, fire] = useConfetti()
  const { unlock, registerFile } = useNonsense()
  const timers = useRef<number[]>([])

  const admitFile = (f: File) => {
    setFileName(f.name)
    setFileSize(f.size)
    const names = pickMany(FIRST, 1)
    setBro({ first: names[0], last: pick(LAST), nick: pick(NICKNAMES) })
    setStrength(2)
    setMuscle(0.4)
    setProtein(0)
    setMotivation('Critical')
    setLog([`New member joined the gym: ${f.name}. Initial assessment: weak.`])
    registerFile()
    sound.pop()
  }

  const train = useCallback(
    (emotionally: boolean) => {
      if (!fileName || training) return
      setTraining(true)
      const rounds = 3 + Math.floor(Math.random() * 2)
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []

      for (let i = 0; i < rounds; i++) {
        timers.current.push(
          window.setTimeout(() => {
            const w = pick(WORKOUTS)
            setLog((l) => [`${w.emoji} ${w.name}: ${w.line}`, ...l].slice(0, 10))
            sound.pop()
            setStrength((s) => Math.min(99, s + Math.floor(Math.random() * 3)))
            setMuscle((m) => Number((m + Math.random() * 0.3).toFixed(2)))
            setProtein((p) => p + Math.floor(Math.random() * 6))
          }, i * 700),
        )
      }

      timers.current.push(
        window.setTimeout(
          () => {
            setTraining(false)
            setMotivation(emotionally ? 'Overconfident' : pick(['Concerning', 'Mild', 'Critical']))
            setLog((l) =>
              [
                emotionally
                  ? '❤️ Emotional strength session complete. The file feels seen, but is unchanged.'
                  : '💪 Physical session complete. File size: identical.',
                ...l,
              ].slice(0, 10),
            )
            fire()
            sound.success()
            unlock('gym')
            notify.success(
              emotionally ? 'Emotionally stronger' : 'Bulk up complete',
              'Digital muscle mass increased. Actual file size: unchanged. As always.',
              '🏋️',
            )
          },
          rounds * 700 + 400,
        ),
      )
    },
    [fileName, training, fire, unlock],
  )

  const certificate = () => {
    if (!bro) return
    const text = [
      '╔══════════════════════════════════════════════════════╗',
      '║          CERTIFICATE OF DIGITAL FITNESS              ║',
      '╚══════════════════════════════════════════════════════╝',
      '',
      `  Gym name:        ${bro.nick}`,
      `  Member:          ${bro.first} ${bro.last}`,
      `  Registered file: ${fileName}`,
      `  File size:       ${formatBytes(fileSize)}  (unchanged, always)`,
      '',
      '  ACHIEVEMENTS',
      `  · File strength:      ${strength}/100`,
      `  · Digital muscle mass:${muscle} pixels`,
      `  · Protein consumed:   ${protein} KB`,
      `  · Motivation:         ${motivation}`,
      '',
      '  This certificate confirms that the above file attended the gym',
      '  and that absolutely nothing about it improved.',
      '',
      '  Signed: ${bro.nick}, Head Trainer (no relevant qualifications)',
      '',
    ].join('\n')
    downloadText(text, `fitness-certificate-${bro.first.toLowerCase()}.txt`)
    notify.success('Certificate issued', 'You may display this. Nobody will ask to see it.', '🏅')
  }

  return (
    <ToolShell
      id="gym"
      name="File Weightlifting Gym"
      emoji="🏋️"
      tagline="Your files are weak. Make them stronger."
      category="File Destruction & Management"
      accent="lime"
      honesty="No file is ever modified. 'Strength', 'muscle mass' and 'protein' are fictional units we invented for this page. Your file's real size does not change, because nothing real happens to it."
      aside={
        <ResultPanel title="Member profile">
          {bro ? (
            <>
              <div className="mb-3 rounded-2xl border-2 border-ink bg-limey p-3 dark:border-cream">
                <div className="font-mono text-[10px] uppercase tracking-widest">Gym name</div>
                <div className="font-display text-lg font-bold">“{bro.nick}”</div>
                <div className="text-xs">
                  {bro.first} {bro.last} · {fileName.slice(0, 18)}
                </div>
              </div>
              <ReportRow label="File strength" value={`${strength}/100`} />
              <ReportRow label="Digital muscle mass" value={`${muscle} pixels`} />
              <ReportRow label="Motivation" value={motivation} verdict={motivation === 'Critical' ? 'bad' : 'neutral'} />
              <ReportRow label="Protein consumed" value={`${protein} KB`} />
              <ReportRow label="Actual file size change" value="None" verdict="bad" />
              <ReportRow label="Real modifications" value="Zero" verdict="good" />
              <Button variant="lime" className="mt-4 w-full" onClick={certificate} icon={<Download className="h-4 w-4" />}>
                Download fitness certificate
              </Button>
            </>
          ) : (
            <p className="text-sm text-ink-muted dark:text-cream/60">
              No member yet. Upload a file and we will assign it a gym-bro identity.
            </p>
          )}
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={50} />

      <FileDropZone
        accept="any"
        onFile={admitFile}
        label="Admit a weak file to the gym"
        hint="Any file type. We will not look inside it, we will simply judge it physically."
        current={fileName ? { name: fileName, size: fileSize } : null}
      />

      {fileName && bro && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative grid h-52 place-items-center overflow-hidden rounded-3xl border-2 border-ink bg-cream-deep dark:border-cream dark:bg-[#100F0D]">
              <motion.div
                className="text-6xl"
                animate={training ? { y: [0, -22, 0], rotate: [0, -6, 6, 0] } : { y: [0, -6, 0] }}
                transition={{ duration: training ? 0.6 : 2.4, repeat: Infinity }}
                aria-hidden
              >
                🏋️
              </motion.div>
              <AnimatePresence>
                {training && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 rounded-full border-2 border-ink bg-sunrise px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest dark:border-cream"
                  >
                    {pick(['No pain, no size reduction', 'Form: questionable', 'Reps: disputed'])}
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
                {bro.nick}
              </span>
            </div>

            <div className="rounded-3xl border-2 border-ink bg-white p-5 shadow-pop dark:border-cream dark:bg-[#171512]">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide">Training log</h2>
              <div className="mt-3 max-h-40 space-y-2 overflow-y-auto text-sm">
                {log.map((l, i) => (
                  <motion.div key={`${l}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                    <span className="text-ink-muted dark:text-cream/40">›</span>
                    <span className="text-ink-muted dark:text-cream/70">{l}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <Card>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg" onClick={() => train(false)} disabled={training} icon={<Dumbbell className="h-5 w-5" />}>
                {training ? 'Training…' : 'Bulk up file'}
              </Button>
              <Button variant="grape" size="lg" onClick={() => train(true)} disabled={training} icon={<HeartPulse className="h-5 w-5" />}>
                Make file emotionally stronger
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setProtein((p) => p + 17)
                  setLog((l) => ['🥤 Digital protein shake consumed. 17 KB of pure nothing.', ...l].slice(0, 10))
                  sound.pop()
                  notify.info('Protein consumed', '17 KB of imaginary whey. Muscle mass may or may not respond.', '🥤')
                }}
              >
                🥤 Digital protein shake
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip color="lime">Strength {strength}/100</Chip>
              <Chip color="sun">Muscle {muscle}px</Chip>
              <Chip color="pink">Protein {protein} KB</Chip>
              <Chip color="plain">Size {formatBytes(fileSize)} · forever</Chip>
            </div>
          </Card>
        </>
      )}
    </ToolShell>
  )
}
