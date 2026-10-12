import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, PackageOpen, ShieldAlert } from 'lucide-react'
import JSZip from 'jszip'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { FileDropZone } from '@/components/ui/FileDropZone'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { formatBytes } from '@/lib/utils'
import { readFileAsArrayBuffer } from '@/lib/download'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { shuffle } from '@/lib/random'

const WARNINGS = [
  'CONTAINS UNRESOLVED FILES',
  'MAY CONTAIN 2019',
  'HANDLE WITH FEELINGS',
  'THIS BAG IS NOT A TOY',
  'DO NOT OPEN ALONE',
]

const UNPACK_STEPS = [
  'Locating the emotional weak point of the archive…',
  'Peeling back the first layer of unresolved feelings…',
  'Encountering a folder named "New Folder (3)"…',
  'Apologising to the files for what comes next…',
  'Finding a file that says "final" but is not final…',
  'Discovering a screenshot of a screenshot…',
  'Rearranging everything into a nicer pile…',
  'Pretending not to see the contents of "old"…',
  'Blowing dust off a document from an unknown decade…',
  'Resealing the box. Nothing has been extracted. Everything has been felt.',
]

const JOKE_FILES = [
  { name: 'final_final_really_final.docx', note: 'This is version eleven. It is not final.' },
  { name: 'taxes_and_regrets.xlsx', note: 'Three sheets: 2019, 2020, and denial.' },
  { name: 'important_stuff_2021_old.zip', note: 'An archive within an archive. Turtles all the way down.' },
  { name: 'why_is_this_folder_here.txt', note: 'Nobody knows. It has been here since onboarding.' },
  { name: 'screenshot_2023-04-02_at_14.11.58.png', note: 'A screenshot of a conversation about screenshots.' },
  { name: 'resume_FINAL_v7_ACTUAL.pdf', note: 'Superseded by resume_FINAL_v8_ACTUAL.pdf.' },
  { name: 'meeting_notes_nobody_read.docx', note: 'Contains one line: "discussed."' },
  { name: 'Untitled document (12).doc', note: 'Contains a single lowercase "a".' },
  { name: 'IMG_4482.JPG', note: 'A blurry photo of a ceiling. Yours, presumably.' },
  { name: 'budget_v3_USE THIS ONE.xlsx', note: 'Do not use this one.' },
]

function describe(name: string): string {
  const lower = name.toLowerCase()
  if (/final/.test(lower)) return 'A "final" file. There will be more. There are always more.'
  if (/invoice|receipt/.test(lower)) return 'A receipt for something you do not remember buying.'
  if (/\.(png|jpe?g|gif|webp)$/.test(lower)) return 'An image. Probably a screenshot of a mistake.'
  if (/\.(txt|md)$/.test(lower)) return 'Plain text. The most honest format, and the loneliest.'
  if (/\.(xlsx?|csv)$/.test(lower)) return 'A spreadsheet with one column and no explanation.'
  if (/\.(docx?|pdf)$/.test(lower)) return 'A document. It has opinions about margins.'
  if (/old|backup|copy|bak/.test(lower)) return 'A backup of a backup. Nobody has opened it since creation.'
  if (/tax|irs|hmrc/.test(lower)) return 'Financial material. Handle with a qualified professional.'
  if (/\.(zip|rar|7z|tar)$/.test(lower)) return 'An archive inside the archive. We must go deeper.'
  return 'A file of unknown emotional significance.'
}

interface Entry {
  name: string
  dir: boolean
  size?: number
  note: string
}

export default function UnzipFeelings() {
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [entries, setEntries] = useState<Entry[]>([])
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [burst, fire] = useConfetti()
  const { unlock, registerFile } = useNonsense()
  const timers = useRef<number[]>([])

  const unpack = async (file: File) => {
    setFileName(file.name)
    setFileSize(file.size)
    setEntries([])
    setDone(false)
    setSteps([])
    setProgress(0)
    setRunning(true)
    registerFile()
    sound.whoosh()

    let real: Entry[] = []
    let failed = false
    try {
      const buffer = await readFileAsArrayBuffer(file)
      const zip = await JSZip.loadAsync(buffer)
      const all = Object.values(zip.files)
      real = all.slice(0, 60).map((f) => {
        let size: number | undefined
        try {
          // JSZip exposes uncompressed size on the internal data object.
          size = (f as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize
        } catch {
          size = undefined
        }
        return { name: f.name, dir: f.dir, size, note: describe(f.name) }
      })
      notify.info(
        `Archive opened locally`,
        `We found ${all.length} entries. We read the file names and absolutely nothing else.`,
        '🗃️',
      )
    } catch {
      failed = true
      notify.error(
        'This ZIP resisted opening',
        'It may be encrypted or damaged. We will proceed with imaginary files instead.',
        '⚠️',
      )
      real = shuffle(JOKE_FILES).slice(0, 8).map((f) => ({ name: f.name, dir: false, note: f.note }))
    }

    const finalEntries = real

    // dramatic unpacking sequence
    UNPACK_STEPS.forEach((step, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setSteps((s) => [...s, step])
          setProgress(Math.round(((i + 1) / UNPACK_STEPS.length) * 100))
          sound.click()
        }, i * 520),
      )
    })

    timers.current.push(
      window.setTimeout(() => {
        setRunning(false)
        setDone(true)
        setEntries(finalEntries)
        fire()
        sound.success()
        unlock('unzip')
        notify.success(
          'Feelings unpacked',
          `We listed ${finalEntries.length} names and extracted zero of them. The archive is untouched.`,
          '🗃️',
        )
      }, UNPACK_STEPS.length * 520 + 500),
    )

    if (failed && real.length) {
      setSteps((s) => [...s, 'Falling back to imaginary files. Honestly, they are more relatable.'])
    }
  }

  const folders = entries.filter((e) => e.dir).length
  const files = entries.filter((e) => !e.dir)
  const jokeExtras = shuffle(JOKE_FILES).slice(0, 4)

  return (
    <ToolShell
      id="unzip"
      name="Unzip Your Feelings"
      emoji="🗃️"
      tagline="Extract files and unresolved emotions."
      category="File Destruction & Management"
      accent="pink"
      honesty="JSZip reads the table of contents of your archive locally so we can show you the real file names. Nothing is decompressed to disk, nothing is extracted, and your original archive is never modified or uploaded."
      aside={
        <ResultPanel title="Archive autopsy">
          <ReportRow label="Archive" value={fileName ? fileName.slice(0, 22) : '—'} />
          <ReportRow label="Archive size" value={fileName ? formatBytes(fileSize) : '—'} />
          <ReportRow label="Entries discovered" value={String(entries.length)} />
          <ReportRow label="Folders" value={String(folders)} />
          <ReportRow label="Files" value={String(files.length)} />
          <ReportRow label="Files actually extracted" value="0" verdict="good" />
          <ReportRow label="Original modified" value="Never" verdict="good" />
          <div className="mt-4 flex flex-wrap gap-2">
            {shuffle(WARNINGS).slice(0, 3).map((w) => (
              <Chip key={w} color="pink">
                <ShieldAlert className="h-3 w-3" /> {w}
              </Chip>
            ))}
          </div>
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={50} />

      <FileDropZone
        accept="zip"
        onFile={(f) => void unpack(f)}
        label="Hand over your ZIP archive and your feelings"
        hint="You can even password-protect it. We will simply respect that and make things up."
        current={fileName ? { name: fileName, size: fileSize } : null}
      />

      {fileName && (
        <>
          {/* cartoon box */}
          <div className="relative grid min-h-[13rem] place-items-center overflow-hidden rounded-3xl border-2 border-ink bg-cream-deep p-6 dark:border-cream dark:bg-[#100F0D]">
            <motion.div
              className="text-7xl"
              animate={running ? { rotate: [-4, 4, -4], y: [0, -6, 0] } : { rotate: 0 }}
              transition={{ duration: 0.6, repeat: running ? Infinity : 0 }}
              aria-hidden
            >
              {running ? '📦' : '🗃️'}
            </motion.div>
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              {WARNINGS.slice(0, 3).map((w, i) => (
                <motion.span
                  key={w}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-full border-2 border-ink bg-bubblegum px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest dark:border-cream"
                >
                  {w}
                </motion.span>
              ))}
            </div>
            <div className="absolute right-4 top-4 flex flex-col gap-1.5 font-mono text-[9px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
              <span>Fragile</span>
              <span>Sentimental</span>
              <span>Do not fold</span>
            </div>
            <div className="relative mt-4 w-full max-w-md">
              <ProgressBar value={progress} label={running ? 'Dramatically unpacking' : done ? 'Unpacking complete' : 'Ready'} sublabel={`${progress}%`} color="grape" />
            </div>
          </div>

          <Card>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide">Dramatic unpacking log</h2>
            <div className="mt-3 space-y-1.5 font-mono text-xs">
              <AnimatePresence initial={false}>
                {steps.map((s, i) => (
                  <motion.div
                    key={`${s}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 text-ink-muted dark:text-cream/60"
                  >
                    <span className="text-limey">✔</span>
                    <span>{s}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {steps.length === 0 && <p className="text-ink-muted dark:text-cream/50">The box is sealed. It is humming slightly.</p>}
            </div>
          </Card>

          {done && (
            <>
              <Card>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <PackageOpen className="h-4 w-4" aria-hidden />
                  <h2 className="font-display text-base font-bold">
                    Real file names from your archive
                  </h2>
                  <Chip color="lime">Read locally with JSZip</Chip>
                </div>
                {entries.length === 0 ? (
                  <p className="text-sm text-ink-muted dark:text-cream/60">
                    This archive is empty. A perfect metaphor. Nothing to see, and yet still moving.
                  </p>
                ) : (
                  <ul className="max-h-80 space-y-2 overflow-y-auto">
                    {entries.map((e, i) => (
                      <motion.li
                        key={`${e.name}-${i}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.015, 0.4) }}
                        className="flex flex-col gap-1 rounded-2xl border-2 border-ink/15 bg-cream-deep p-3 dark:border-cream/20 dark:bg-[#100F0D]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="break-all font-mono text-xs font-bold">
                            {e.dir ? '📁 ' : '📄 '}
                            {e.name}
                          </span>
                          {typeof e.size === 'number' && (
                            <span className="font-mono text-[10px] text-ink-muted dark:text-cream/50">
                              {formatBytes(e.size)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs italic text-ink-muted dark:text-cream/60">{e.note}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="bg-limey/60 dark:bg-limey/20">
                <h2 className="font-display text-base font-bold">Bonus feelings we invented for you</h2>
                <p className="mt-1 text-xs text-ink-muted dark:text-cream/60">
                  These files were not in your archive. We added them because they felt important.
                </p>
                <ul className="mt-3 space-y-2">
                  {jokeExtras.map((j, i) => (
                    <li key={j.name} className="flex flex-col gap-0.5 rounded-2xl border-2 border-dashed border-ink/25 p-3 dark:border-cream/25">
                      <span className="break-all font-mono text-xs font-bold">
                        {['🫠', '📉', '🧾', '🫥'][i % 4]} {j.name}
                      </span>
                      <span className="text-xs italic text-ink-muted dark:text-cream/60">{j.note}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}

          {done && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="grape"
                onClick={() => {
                  setDone(false)
                  setEntries([])
                  setSteps([])
                  setProgress(0)
                }}
                icon={<Box className="h-4 w-4" />}
              >
                Reseal the box
              </Button>
              <span className="font-mono text-[11px] text-ink-muted dark:text-cream/50">
                No files were extracted. Your archive remains exactly where it was, only more
                emotionally significant.
              </span>
            </div>
          )}
        </>
      )}
    </ToolShell>
  )
}
