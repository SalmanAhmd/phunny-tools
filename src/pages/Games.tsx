import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, Trophy } from 'lucide-react'
import { SectionTitle, Card, Chip } from '@/components/ui/Primitives'
import { GAMES } from '@/lib/tools'
import { useNonsense } from '@/store/nonsense'

export default function Games() {
  const { stats, has } = useNonsense()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SectionTitle
        kicker="Mini games"
        title="Six games. Infinite excuses."
        subtitle="Short, replayable, and engineered to drain the exact number of minutes you were saving for something useful."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-ink bg-sunrise p-4 shadow-pop dark:border-cream">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest">Games started</div>
          <div className="mt-1 font-display text-2xl font-bold">{stats.gamesPlayedCount}</div>
        </div>
        <div className="rounded-2xl border-2 border-ink bg-limey p-4 shadow-pop dark:border-cream">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest">Distinct games played</div>
          <div className="mt-1 font-display text-2xl font-bold">
            {stats.gamesPlayed.length} / {GAMES.length}
          </div>
        </div>
        <div className="rounded-2xl border-2 border-ink bg-grape p-4 text-white shadow-pop dark:border-cream">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest">Time doing nothing</div>
          <div className="mt-1 font-display text-2xl font-bold">
            {Math.floor(stats.secondsDoingNothing / 60)}m {stats.secondsDoingNothing % 60}s
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {GAMES.map((game, i) => {
          const badge =
            game.id === 'game-catch'
              ? 'productivity'
              : game.id === 'game-whack'
                ? 'whack'
                : game.id === 'game-download'
                  ? 'download'
                  : game.id === 'game-buttons'
                    ? 'buttons'
                    : game.id === 'game-keyboard'
                      ? 'keyboard'
                      : 'escape'
          const unlocked = has(`game-${badge}`)
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 240, damping: 26 }}
            >
              <Card
                className="flex h-full flex-col justify-between"
                tilt={i % 2 === 0 ? -0.5 : 0.5}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-4xl" aria-hidden>
                      {game.emoji}
                    </span>
                    {unlocked && (
                      <Chip color="lime">
                        <Trophy className="h-3 w-3" /> Completed
                      </Chip>
                    )}
                  </div>
                  <h2 className="mt-3 font-display text-xl font-bold">{game.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-cream/60">
                    {game.tagline}
                  </p>
                </div>
                <Link to={game.path} className="btn btn-primary mt-5 w-full">
                  <Gamepad2 className="h-4 w-4" /> Play now
                </Link>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-12 rounded-3xl border-2 border-ink bg-cream-deep p-6 dark:border-cream dark:bg-[#151310]">
        <h2 className="font-display text-xl font-bold">House rules</h2>
        <ul className="mt-3 grid gap-2 text-sm text-ink-muted dark:text-cream/70 sm:grid-cols-2">
          <li>• Every score is stored only in your browser and forgotten by everyone else.</li>
          <li>• Keyboard controls exist for the games that make sense. Try arrows and space.</li>
          <li>• Sound is off until you enable it, because forcing audio on people is a crime.</li>
          <li>• Winning changes nothing. Losing also changes nothing. Enjoy the symmetry.</li>
        </ul>
      </div>
    </div>
  )
}
