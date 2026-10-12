import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Chip } from './Primitives'

export function GameShell({
  name,
  emoji,
  tagline,
  accent = 'lime',
  honesty,
  controls,
  children,
  footer,
}: {
  name: string
  emoji: string
  tagline: string
  accent?: 'sun' | 'lime' | 'grape' | 'orange' | 'pink'
  honesty: string
  controls?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  const accents: Record<string, string> = {
    sun: 'bg-sunrise',
    lime: 'bg-limey',
    grape: 'bg-grape text-white',
    orange: 'bg-tangerine text-white',
    pink: 'bg-bubblegum',
  }
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link
        to="/games"
        className="mb-5 inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-ink-muted transition hover:text-tangerine dark:text-cream/60"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All mini games
      </Link>

      <header className="mb-5 flex flex-wrap items-center gap-4">
        <div
          className={cn(
            'grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-ink text-2xl shadow-pop dark:border-cream',
            accents[accent],
          )}
          aria-hidden
        >
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <Chip color="plain">Mini game</Chip>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">{name}</h1>
          <p className="mt-1 text-sm text-ink-muted dark:text-cream/70">{tagline}</p>
        </div>
      </header>

      <div className="mb-5 flex items-start gap-2.5 rounded-2xl border-2 border-ink bg-limey/60 p-3 dark:border-cream">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p className="text-xs leading-relaxed text-ink">
          <strong className="font-display uppercase tracking-wide">Reality check:</strong> {honesty}
        </p>
      </div>

      {controls && <div className="mb-4 flex flex-wrap items-center gap-3">{controls}</div>}

      {children}

      {footer && <div className="mt-6">{footer}</div>}
    </div>
  )
}

export function ScoreBanner({
  items,
}: {
  items: { label: string; value: string | number; tone?: 'default' | 'good' | 'bad' }[]
}) {
  const tones = {
    default: 'bg-white dark:bg-[#171512]',
    good: 'bg-limey',
    bad: 'bg-bubblegum',
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className={cn('rounded-2xl border-2 border-ink px-4 py-3 shadow-popsm dark:border-cream', tones[it.tone ?? 'default'])}
        >
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-70">{it.label}</div>
          <div className="mt-1 font-display text-xl font-bold tabular-nums">{it.value}</div>
        </div>
      ))}
    </div>
  )
}
