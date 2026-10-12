import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Check } from 'lucide-react'
import type { ToolMeta } from '@/lib/tools'
import { cn } from '@/lib/utils'
import { useNonsense } from '@/store/nonsense'

const ACCENT_BG: Record<ToolMeta['accent'], string> = {
  sun: 'bg-sunrise text-ink',
  lime: 'bg-limey text-ink',
  grape: 'bg-grape text-white',
  orange: 'bg-tangerine text-white',
  pink: 'bg-bubblegum text-ink',
}

/**
 * Card for the tool directory. A whole product in miniature:
 * big emoji, a promise, and a disclaimer about how it all stays local.
 */
export function ToolCard({ tool, index = 0 }: { tool: ToolMeta; index?: number }) {
  const { stats } = useNonsense()
  const visited = stats.toolsUsed.includes(tool.id) || stats.gamesPlayed.includes(tool.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min((index % 3) * 0.05, 0.2), type: 'spring', stiffness: 260, damping: 24 }}
      whileHover={{ y: -6, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
    >
      <Link
        to={tool.path}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-ink bg-white p-5 shadow-pop transition-colors hover:bg-sunrise/20 dark:border-cream dark:bg-[#171512] dark:hover:bg-[#221F1A]"
        aria-label={`Open ${tool.name}`}
      >
        <div className="flex items-start justify-between gap-3">
          <motion.span
            whileHover={{ rotate: -10, scale: 1.1 }}
            className={cn(
              'grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink text-2xl shadow-popsm dark:border-cream',
              ACCENT_BG[tool.accent],
            )}
            aria-hidden
          >
            {tool.emoji}
          </motion.span>
          <span className="flex items-center gap-1.5">
            {visited && (
              <span
                className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-limey px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest dark:border-cream"
                title="You have survived this experience"
              >
                <Check className="h-2.5 w-2.5" aria-hidden /> Tried
              </span>
            )}
            <span className="rounded-full border-2 border-ink/20 p-1 transition group-hover:bg-ink group-hover:text-cream dark:border-cream/20 dark:group-hover:bg-cream dark:group-hover:text-ink">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </span>
        </div>

        <h3 className="mt-4 font-display text-lg font-bold leading-tight">{tool.name}</h3>
        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-muted dark:text-cream/60">{tool.tagline}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="chip shrink-0 bg-cream-deep px-2.5 py-0.5 text-[9px] dark:bg-[#221F1A] dark:text-cream/80">
            {tool.category}
          </span>
          <span className="chip shrink-0 bg-white px-2.5 py-0.5 text-[9px] dark:bg-[#100F0D] dark:text-cream/60">
            {tool.effort}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}