import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award, RotateCcw, Share2, Timer, Trophy } from 'lucide-react'
import { SectionTitle, Card, Chip, StatBlock } from '@/components/ui/Primitives'
import { Button } from '@/components/ui/Button'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { TOOL_MAP, TOOLS } from '@/lib/tools'
import { useNonsense } from '@/store/nonsense'
import { formatDuration, cn } from '@/lib/utils'
import { downloadText } from '@/lib/download'
import { notify } from '@/lib/toastBus'

export default function MyNonsense() {
  const { stats, nonsenseLevel, rank, achievements, reset } = useNonsense()
  const [burst, fire] = useConfetti()
  const [confirming, setConfirming] = useState(false)

  const totalExperiences = TOOLS.length
  const visited = new Set([...stats.toolsUsed, ...stats.gamesPlayed])

  const mostUseless = useMemo(() => {
    if (!achievements.length) return null
    return achievements[achievements.length - 1]
  }, [achievements])

  const certify = () => {
    fire()
    const text = [
      '╔══════════════════════════════════════════════════════╗',
      '║        OFFICIAL CERTIFICATE OF USELESSNESS           ║',
      '╚══════════════════════════════════════════════════════╝',
      '',
      `  Awarded to:        A Distinguished Visitor`,
      `  Title:             ${rank.title}`,
      `  Nonsense level:    ${nonsenseLevel}`,
      `  Buttons clicked:   ${stats.buttonsClicked}`,
      `  Tools visited:     ${stats.toolsUsed.length}`,
      `  Games played:      ${stats.gamesPlayedCount}`,
      `  Time doing nothing:${' '}${formatDuration(stats.secondsDoingNothing)}`,
      `  Achievements:      ${stats.achievements.length}`,
      '',
      '  This certificate is fictional, non-transferable, and',
      '  has no legal, financial, or emotional value whatsoever.',
      '',
      '  Signed: The Management (a potato)',
      '',
    ].join('\n')
    downloadText(text, 'certificate-of-uselessness.txt')
    notify.success('Certificate downloaded', 'Frame it. Or do not. We are not your boss.', '📜')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Confetti trigger={burst} count={70} />

      <SectionTitle
        kicker="Dashboard"
        title="My Nonsense"
        subtitle="Every number on this page was counted locally in your browser and will be forgotten the moment you clear your storage. That is the most honest data policy we could write."
      />

      {/* headline stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border-2 border-ink bg-grape p-6 text-white shadow-poplg dark:border-cream sm:col-span-2 lg:col-span-1"
        >
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
            Current nonsense level
          </div>
          <div className="mt-2 font-display text-6xl font-bold leading-none">{nonsenseLevel}</div>
          <div className="mt-2 text-lg font-semibold">
            {rank.emoji} {rank.title}
          </div>
          <p className="mt-3 text-xs text-white/70">
            Levels are calculated with a formula we invented in a car park. It has never been peer
            reviewed.
          </p>
        </motion.div>

        <StatBlock label="Total tools used" value={String(stats.toolsUsed.length)} hint={`of ${totalExperiences} experiences`} emoji="🧰" color="sun" />
        <StatBlock label="Total games played" value={String(stats.gamesPlayedCount)} hint={`${stats.gamesPlayed.length} distinct games`} emoji="🕹️" color="lime" />
        <StatBlock label="Time spent doing nothing" value={formatDuration(stats.secondsDoingNothing)} hint="Recoverable: no" emoji="⏳" color="pink" />
        <StatBlock label="Buttons clicked" value={stats.buttonsClicked.toLocaleString('en-US')} hint="Each one mattered equally little" emoji="🖱️" color="orange" />
        <StatBlock
          label="Most useless achievement"
          value={mostUseless ? mostUseless.title : 'None yet'}
          hint={mostUseless ? mostUseless.description : 'Go and waste some time first'}
          emoji={mostUseless?.emoji ?? '🏆'}
          color="plain"
        />
      </div>

      {/* progress + certificate */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card hover>
          <h2 className="font-display text-xl font-bold">Collection progress</h2>
          <p className="mt-1 text-sm text-ink-muted dark:text-cream/60">
            You have visited {visited.size} of {totalExperiences} experiences. This proves nothing but
            feels fantastic.
          </p>
          <div className="mt-4 h-5 w-full overflow-hidden rounded-full border-2 border-ink bg-cream-deep dark:border-cream dark:bg-[#100F0D]">
            <motion.div
              className="h-full rounded-full bg-limey"
              animate={{ width: `${(visited.size / totalExperiences) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>

          <h3 className="mt-6 font-display text-sm font-bold uppercase tracking-wide">Visited experiences</h3>
          {visited.size === 0 ? (
            <p className="mt-2 text-sm text-ink-muted dark:text-cream/50">
              Nothing yet. The headquarters of nothing are empty and waiting.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {[...visited].map((id) => {
                const tool = TOOL_MAP[id]
                if (!tool) return null
                return (
                  <Link
                    key={id}
                    to={tool.path}
                    className="chip bg-white hover:bg-sunrise dark:bg-[#171512] dark:text-cream"
                  >
                    <span aria-hidden>{tool.emoji}</span> {tool.name}
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        <Card className="bg-sunrise" tilt={0.6}>
          <Chip color="plain">
            <Award className="h-3 w-3" /> Fictional certification
          </Chip>
          <h2 className="mt-3 font-display text-xl font-bold">
            Certificate of Uselessness
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            A downloadable text file confirming that you have spent measurable time on immeasurable
            nonsense. Valid nowhere.
          </p>
          <Button variant="grape" className="mt-4 w-full" onClick={certify} icon={<Share2 className="h-4 w-4" />}>
            Download certificate
          </Button>

          <div className="mt-5 border-t-2 border-dashed border-ink/25 pt-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide">Danger zone</h3>
            <p className="mt-1 text-xs text-ink/70">
              Erase all progress, achievements, and your nonsense level. Irreversible and, honestly,
              therapeutic.
            </p>
            {confirming ? (
              <div className="mt-3 flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    reset()
                    setConfirming(false)
                  }}
                >
                  Yes, erase it
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setConfirming(true)} icon={<RotateCcw className="h-3.5 w-3.5" />}>
                Reset my nonsense
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* achievements */}
      <div className="mt-10">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Trophy className="h-5 w-5" aria-hidden />
          <h2 className="font-display text-2xl font-bold">
            Achievements ({stats.achievements.length}/{ACHIEVEMENTS.length})
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a, i) => {
            const unlocked = stats.achievements.includes(a.id)
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.02, 0.25) }}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border-2 border-ink p-4 transition dark:border-cream',
                  unlocked ? 'bg-limey shadow-pop' : 'bg-white/50 opacity-70 dark:bg-[#171512]',
                )}
              >
                <span className={cn('text-2xl', !unlocked && 'grayscale')} aria-hidden>
                  {unlocked ? a.emoji : '🔒'}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-sm font-bold leading-snug">
                    {a.secret && !unlocked ? 'Secret achievement' : a.title}
                  </div>
                  <div className="mt-1 text-xs text-ink/70 dark:text-cream/60">
                    {a.secret && !unlocked ? 'Hidden. Probably findable. Probably pointless.' : a.description}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 rounded-3xl border-2 border-dashed border-ink/25 p-5 dark:border-cream/25">
        <Timer className="h-5 w-5" aria-hidden />
        <p className="text-sm text-ink-muted dark:text-cream/60">
          Everything here is entertainment data. It is not analytics, it is not tracking, and it will
          never leave your device.
        </p>
      </div>
    </div>
  )
}
