import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FlaskConical, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Chip } from './Primitives'

export interface ToolShellProps {
  id: string
  name: string
  emoji: string
  tagline: string
  category: string
  accent?: 'sun' | 'lime' | 'grape' | 'orange' | 'pink'
  /** Truthfulness banner text. Every tool must be honest about what it really does. */
  honesty: string
  children: ReactNode
  /** Right hand sidebar, e.g. the result report. */
  aside?: ReactNode
  className?: string
}

const ACCENTS: Record<string, string> = {
  sun: 'bg-sunrise',
  lime: 'bg-limey',
  grape: 'bg-grape',
  orange: 'bg-tangerine',
  pink: 'bg-bubblegum',
}

export function ToolShell({
  name,
  emoji,
  tagline,
  category,
  accent = 'sun',
  honesty,
  children,
  aside,
  className,
}: ToolShellProps) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 py-8 sm:px-6', className)}>
      <Link
        to="/tools"
        className="mb-5 inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-ink-muted transition hover:text-tangerine dark:text-cream/60"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All tools
      </Link>

      <header className="mb-6 flex flex-wrap items-start gap-4">
        <motion.div
          initial={{ scale: 0.5, rotate: -14 }}
          animate={{ scale: 1, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          className={cn(
            'grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-ink text-3xl shadow-pop dark:border-cream',
            ACCENTS[accent],
          )}
          aria-hidden
        >
          {emoji}
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Chip color="plain">{category}</Chip>
            <Chip color="orange">Interactive</Chip>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">{name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted dark:text-cream/70">{tagline}</p>
        </div>
      </header>

      <div className="mb-6 flex items-start gap-2.5 rounded-2xl border-2 border-ink bg-limey/60 p-3 dark:border-cream">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p className="text-xs leading-relaxed text-ink">
          <strong className="font-display uppercase tracking-wide">What actually happens:</strong> {honesty}
        </p>
      </div>

      <div className={cn('grid gap-6', aside ? 'lg:grid-cols-[1.6fr_1fr]' : '')}>
        <div className="min-w-0 space-y-5">{children}</div>
        {aside && <div className="min-w-0 space-y-5">{aside}</div>}
      </div>
    </div>
  )
}

export function ResultPanel({
  title = 'Report',
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      className={cn('rounded-3xl border-2 border-ink bg-white p-5 shadow-pop dark:border-cream dark:bg-[#171512]', className)}
      aria-live="polite"
    >
      <div className="mb-3 flex items-center gap-2">
        <FlaskConical className="h-4 w-4" aria-hidden />
        <h2 className="font-display text-base font-bold uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </motion.section>
  )
}

export function ReportRow({
  label,
  value,
  verdict,
}: {
  label: string
  value: string
  verdict?: 'good' | 'bad' | 'neutral'
}) {
  const verdictColor =
    verdict === 'good' ? 'text-limey dark:text-limey' : verdict === 'bad' ? 'text-tangerine' : ''
  return (
    <div className="flex items-baseline justify-between gap-4 border-b-2 border-dashed border-ink/15 py-2 last:border-0 dark:border-cream/15">
      <span className="text-xs font-medium text-ink-muted dark:text-cream/60">{label}</span>
      <span className={cn('text-right font-mono text-sm font-bold', verdictColor)}>{value}</span>
    </div>
  )
}
