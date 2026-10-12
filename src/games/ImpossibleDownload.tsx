import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, RotateCcw, Siren, Timer } from 'lucide-react'
import { GameShell, ScoreBanner } from '@/components/ui/GameShell'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { downloadText } from '@/lib/download'
import { pick } from '@/lib/random'

type Phase = 'idle' | 'downloading' | 'stuck' | 'done'

const EVENTS = [
  'Connecting to upload.shredder.services … there is no server.',
  'Negotiating 100 Mbit/s … the connection negotiated down to thoughts.',
  'Reserving disk space … you are out of disk space for a 0-byte file.',
  'Network interruption. The interruption was the network itself.',
  'Download manager consulted a lawyer. The lawyer hung up.',
  'Server suggested cancelling. You have been put on hold with the server instead.',
]

const STUCK_PLEAS = [
  'The final 1% is being reviewed by a committee.',
  'The last megabyte has requested a performance review.',
  'Your download is in a meeting about the download.',
  'The final byte is waiting for the right moment. It will not come.',
]

const COMPLAINT_RESULTS = [
  'Your complaint was logged, cherished, and filed directly into the bin.',
  'The download manager has apologised and then continued downloading nothing.',
  'Your complaint was forwarded to the quality department, which is the bin.',
]

export default function ImpossibleDownload() {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [log, setLog] = useState<string[]>([])
  const [stalls, setStalls] = useState(0)
  const [complaints, setComplaints] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const luckyRef = useRef(false)
  const progressRef = useRef(0)
  const { unlock, registerGame } = useNonsense()

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  const append = useCallback((line: string) => {
    setLog((l) => [line, ...l].slice(0, 7))
  }, [])

  // chaotic download progression
  useEffect(() => {
    if (phase !== 'downloading') return
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1)
      const p = progressRef.current
      if (p >= 99) return
      const roll = Math.random()
      if (roll < 0.12) {
        // stall
        setStalls((s) => s + 1)
        append(pick(STUCK_PLEAS))
        sound.error()
        return
      }
      if (roll < 0.2) {
        // dramatic rewind
        const back = Math.max(0, p - Math.random() * 22)
        append(`Download rewound to ${Math.round(back)}%. It does this.`)
        sound.tick()
        setProgress(back)
        return
      }
      if (roll < 0.28) {
        append(pick(EVENTS))
        sound.click()
      }
      setProgress(Math.min(99, p + 1 + Math.random() * 7))
    }, 700)
    return () => window.clearInterval(id)
  }, [phase, append])

  // find the automatic 99% wall
  useEffect(() => {
    if (progress >= 99 && phase === 'downloading') {
      setPhase('stuck')
      append('99%! It is now forever. Congratulations.')
      sound.fail()
    }
  }, [progress, phase, append])

  const start = () => {
    setProgress(0)
    setPhase('downloading')
    setLog(['Beginning an enormous, prestigious download…'])
    setStalls(0)
    setComplaints(0)
    setSeconds(0)
    luckyRef.current = false
    registerGame('game-download')
    sound.pop()
  }

  const keepWaiting = () => {
    if (phase !== 'stuck') return
    sound.tick()
    append('You are still waiting. The waiting appreciates your dedication.')
    setStalls((s) => s + 1)
  }

  const complain = () => {
    if (phase !== 'stuck') return
    const next = complaints + 1
    setComplaints(next)
    luckyRef.current = next >= 4
    if (luckyRef.current || Math.random() < 0.25) {
      setPhase('done')
      setProgress(100)
      sound.fanfare()
      unlock('game-download')
      append('The download manager admitted the file was already on your computer.')
      return
    }
    append(pick(COMPLAINT_RESULTS))
    setProgress(30 + Math.random() * 30)
    setPhase('downloading')
    sound.error()
    notify.error('Complaint processed', 'The download has been moved to the back of the line.', '😤')
  }

  const verify = () => {
    if (phase !== 'done') return
    downloadText(
      [
        'You downloaded nothing.',
        'The nothing was already on your computer.',
        'You have been waiting for less than nothing.',
        '',
        'This file is the receipt nobody will accept.',
      ].join('\n'),
      'receipt-for-nothing.txt',
    )
    sound.success()
    notify.success('Download verified', 'It was here all along. You knew this. We all knew this.', '📄')
  }

  return (
    <GameShell
      name="The Impossible Download"
      emoji="📦"
      tagline="A download that starts, stalls, rewinds, and disappoints on purpose."
      accent="grape"
      honesty="This is a simulated download. Nothing is transmitted, uploaded, or received. The only file you can actually download is a tiny joke text file confirming that nothing was downloaded."
      controls={
        <>
          <Button variant="primary" onClick={start} icon={phase === 'done' ? <RotateCcw className="h-4 w-4" /> : <Download className="h-4 w-4" />}>
            {phase === 'downloading' || phase === 'stuck' ? 'Restart the download' : phase === 'done' ? 'Download something else' : 'Start the download'}
          </Button>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
            <Siren className="h-3.5 w-3.5" /> It will not finish. Probably. Maybe.
          </span>
        </>
      }
    >
      <div className="mb-4">
        <ScoreBanner
          items={[
            { label: 'Progress', value: `${Math.round(progress)}%`, tone: progress >= 100 ? 'good' : 'default' },
            { label: 'Stalls survived', value: stalls, tone: stalls > 10 ? 'bad' : 'default' },
            { label: 'Complaints filed', value: complaints },
            { label: 'Seconds wasted', value: seconds },
          ]}
        />
      </div>

      <div className="rounded-3xl border-2 border-ink bg-white p-6 shadow-pop dark:border-cream dark:bg-[#171512]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink bg-grape text-2xl text-white dark:border-cream">
              📦
            </div>
            <div>
              <div className="font-display text-base font-bold">zero-value-attachment.zip</div>
              <div className="font-mono text-[11px] text-ink-muted dark:text-cream/50">0 MB · from a server that does not exist</div>
            </div>
          </div>
          <span
            className={cn(
              'rounded-full border-2 border-ink px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest dark:border-cream',
              phase === 'done' ? 'bg-limey text-ink' : phase === 'stuck' ? 'bg-bubblegum text-ink' : 'bg-cream-deep text-ink-muted dark:bg-[#221F1A] dark:text-cream/70',
            )}
          >
            {phase === 'done' ? 'Complete' : phase === 'stuck' ? 'Stuck at 99%' : phase === 'downloading' ? 'Downloading…' : 'Ready'}
          </span>
        </div>

        <ProgressBar value={progress} color={phase === 'stuck' ? 'tangerine' : progress >= 100 ? 'limey' : 'grape'} indeterminate={phase === 'downloading'} />

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="ghost" onClick={keepWaiting} disabled={phase !== 'stuck'} icon={<Timer className="h-4 w-4" />}>
            Keep waiting
          </Button>
          <Button variant="danger" onClick={complain} disabled={phase !== 'stuck'} icon={<Siren className="h-4 w-4" />}>
            Complain to the download manager
          </Button>
          <Button variant="lime" onClick={verify} disabled={phase !== 'done'} icon={<Download className="h-4 w-4" />}>
            Verify (it was here all along)
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border-2 border-ink bg-cream-deep p-5 shadow-pop dark:border-cream dark:bg-[#100F0D]">
        <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-ink-muted dark:text-cream/50">
          Download manager transcript
        </h2>
        <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-2">
          {log.length === 0 ? (
            <p className="text-sm text-ink-muted dark:text-cream/50">
              The transcript will only contain terrible news. Start the download to read it.
            </p>
          ) : (
            <AnimatePresence initial={false}>
              {log.map((line, i) => (
                <motion.p
                  key={`${line}-${log.length - i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 border-b-2 border-dashed border-ink/10 pb-2 text-sm last:border-0 dark:border-cream/10"
                >
                  <span aria-hidden className="text-tangerine">›</span>
                  <span className="text-ink/80 dark:text-cream/70">{line}</span>
                </motion.p>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </GameShell>
  )
}