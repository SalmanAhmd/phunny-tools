import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'
import { useNonsense } from '@/store/nonsense'
import { pick } from '@/lib/random'
import { cn } from '@/lib/utils'

const MESSAGES = [
  'Slightly shinier. Intangible progress achieved.',
  'You are polishing a button that was manufactured clean.',
  'The button appreciates the attention, if not the outcome.',
  'Shine levels rising. Purpose levels falling.',
  'At this rate you will finish in approximately never.',
]

export default function ButtonPolisher() {
  const [clicks, setClicks] = useState(0)
  const [shine, setShine] = useState(0)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [burst, fire] = useConfetti()
  const { unlock } = useNonsense()

  const polish = useCallback(() => {
    if (finished) return
    const next = clicks + 1
    setClicks(next)
    setShine(Math.min(100, next))
    setMessage(pick(MESSAGES))
    sound.click()
    if (next % 10 === 0) sound.ding()
    if (next >= 100) {
      setFinished(true)
      fire()
      sound.fanfare()
      unlock('polisher')
      unlock('polish-100')
      notify.success(
        'Polishing complete',
        'Congratulations. The button was already clean. It is now clean AND buffed.',
        '✨',
      )
    }
  }, [clicks, finished, fire, unlock])

  return (
    <ToolShell
      id="polisher"
      name="Button Polisher"
      emoji="✨"
      tagline="Click to make it shinier. It was already clean."
      category="Time-Wasting Machines"
      accent="lime"
      honesty="This button does not become cleaner. It is a button on a web page and it was sanitary from the moment it was rendered. What it does do is count your clicks, locally, and give you a small feeling."
      aside={
        <ResultPanel title="Polish report">
          <ReportRow label="Clicks delivered" value={String(clicks)} />
          <ReportRow label="Shine index" value={`${shine}%`} />
          <ReportRow label="Cleanliness before" value="Already clean" verdict="good" />
          <ReportRow label="Cleanliness after" value={finished ? 'Still clean, but shinier' : 'Under review'} />
          <ReportRow label="Microfibre cloths used" value="0" verdict="bad" />
          <ReportRow label="Purpose of activity" value="None identified" verdict="bad" />
          <div className="mt-4 h-4 w-full overflow-hidden rounded-full border-2 border-ink bg-cream-deep dark:border-cream dark:bg-[#100F0D]">
            <motion.div
              className="h-full bg-limey"
              animate={{ width: `${shine}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            />
          </div>
          {finished && (
            <div className="mt-4 rounded-2xl border-2 border-ink bg-sunrise p-3 dark:border-cream">
              <div className="font-mono text-[10px] uppercase tracking-widest">Official finding</div>
              <div className="font-display text-base font-bold">The button was already clean.</div>
            </div>
          )}
        </ResultPanel>
      }
    >
      <Confetti trigger={burst} count={80} />

      <div className="grid place-items-center rounded-3xl border-2 border-ink bg-cream-deep px-6 py-12 dark:border-cream dark:bg-[#100F0D]">
        <motion.button
          type="button"
          onClick={polish}
          disabled={finished}
          whileHover={{ scale: 1.06, rotate: 1 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 460, damping: 20 }}
          className={cn(
            'relative rounded-3xl border-[3px] border-ink px-12 py-8 font-display text-2xl font-bold uppercase tracking-widest shadow-poplg transition-all dark:border-cream',
            finished ? 'bg-limey' : 'bg-white dark:bg-[#171512] dark:text-cream',
          )}
          style={{
            boxShadow: `0 0 ${12 + shine * 0.5}px rgba(255, 212, 0, ${0.2 + shine / 200}), 8px 8px 0 0 #0D0C0A`,
          }}
          aria-label="Polish the button"
        >
          {finished ? 'Immacuately Clean' : 'Polish Me'}
          {/* sparkle overlay */}
          <AnimatePresence>
            {clicks > 0 && (
              <motion.span
                key={clicks}
                initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
                animate={{ opacity: [0, 1, 0], scale: 1.4, rotate: 20 }}
                transition={{ duration: 0.6 }}
                className="pointer-events-none absolute right-2 top-2 text-xl"
                aria-hidden
              >
                ✨
              </motion.span>
            )}
          </AnimatePresence>
          {/* shine sweep */}
          {clicks > 20 && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-10 bg-white/50 blur-md"
              animate={{ x: ['-3rem', '110%'] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8, ease: 'linear' }}
            />
          )}
        </motion.button>

        <div className="mt-6 text-center">
          <div className="font-display text-4xl font-bold tabular-nums">{clicks}</div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
            clicks · shine {shine}%
          </div>
        </div>

        <div className="mt-5 min-h-[2.5rem] max-w-md text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-sm text-ink-muted dark:text-cream/60"
            >
              {finished
                ? 'It was already clean. You have buffed a clean button. Somewhere, a facilities manager is proud.'
                : message || 'The button is clean. Polish it to confirm this.'}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setClicks(0)
              setShine(0)
              setMessage('')
              setFinished(false)
              notify.info('Polish erased', 'The button is back to being merely clean.', '🧽')
            }}
          >
            Reset the polish
          </Button>
          <Button
            variant="sun"
            onClick={() => {
              setClicks((c) => {
                const target = Math.max(c, 99)
                setShine(100)
                setFinished(true)
                fire()
                sound.fanfare()
                unlock('polisher')
                unlock('polish-100')
                notify.success('Polished instantly', 'You skipped the labour and kept the achievement. Efficient!', '⚡')
                return target + 1
              })
            }}
            disabled={finished}
          >
            Use immediate polish (cheating)
          </Button>
        </div>
      </div>

      <Card className="bg-limey/50 dark:bg-limey/20">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <Sparkles className="h-4 w-4" /> Notes from the polishing department
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
          <li>• The button has never been dirty.</li>
          <li>• The button has never been used for anything.</li>
          <li>• You are, nonetheless, doing an excellent job.</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip color="lime">100 clicks = one achievement</Chip>
          <Chip color="plain">0 clicks = same button</Chip>
        </div>
      </Card>
    </ToolShell>
  )
}
