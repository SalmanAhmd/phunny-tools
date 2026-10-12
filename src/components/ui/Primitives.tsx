import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({
  children,
  className,
  tilt = 0,
  hover = false,
}: {
  children: ReactNode
  className?: string
  tilt?: number
  hover?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      whileHover={hover ? { y: -6, rotate: tilt } : undefined}
      style={{ rotate: tilt }}
      className={cn(
        'relative rounded-3xl border-2 border-ink bg-white p-5 shadow-pop dark:border-cream dark:bg-[#171512]',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export function Chip({
  children,
  className,
  color = 'sun',
}: {
  children: ReactNode
  className?: string
  color?: 'sun' | 'lime' | 'grape' | 'orange' | 'pink' | 'plain'
}) {
  const colors: Record<string, string> = {
    sun: 'bg-sunrise text-ink',
    lime: 'bg-limey text-ink',
    grape: 'bg-grape text-white',
    orange: 'bg-tangerine text-white',
    pink: 'bg-bubblegum text-ink',
    plain: 'bg-white text-ink dark:bg-[#171512] dark:text-cream',
  }
  return <span className={cn('chip', colors[color], className)}>{children}</span>
}

export function SectionTitle({
  kicker,
  title,
  subtitle,
  className,
}: {
  kicker?: string
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={cn('mb-8', className)}>
      {kicker && (
        <div className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.25em] text-tangerine">
          {kicker}
        </div>
      )}
      <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-3 max-w-2xl text-base text-ink-muted dark:text-cream/70">{subtitle}</p>}
    </div>
  )
}

export function StatBlock({
  label,
  value,
  hint,
  emoji,
  color = 'sun',
}: {
  label: string
  value: string
  hint?: string
  emoji?: string
  color?: 'sun' | 'lime' | 'grape' | 'orange' | 'pink' | 'plain'
}) {
  const colors: Record<string, string> = {
    sun: 'bg-sunrise',
    lime: 'bg-limey',
    grape: 'bg-grape text-white',
    orange: 'bg-tangerine text-white',
    pink: 'bg-bubblegum',
    plain: 'bg-white dark:bg-[#171512] dark:text-cream',
  }
  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-ink p-4 shadow-pop dark:border-cream',
        colors[color],
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</span>
        {emoji && <span aria-hidden className="text-lg">{emoji}</span>}
      </div>
      <div className="mt-1 font-display text-2xl font-bold leading-none">{value}</div>
      {hint && <div className="mt-1 text-[11px] opacity-70">{hint}</div>}
    </div>
  )
}

export function Tooltip({ children, text }: { children: ReactNode; text: string }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-[15rem] -translate-x-1/2 scale-90 rounded-xl border-2 border-ink bg-sunrise px-3 py-1.5 text-center font-mono text-[11px] font-semibold text-ink opacity-0 shadow-pop transition-all duration-150 group-hover/tt:scale-100 group-hover/tt:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}

export function EmptyState({
  emoji = '🕳️',
  title,
  body,
  action,
}: {
  emoji?: string
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink/30 p-10 text-center dark:border-cream/30">
      <div className="text-4xl" aria-hidden>
        {emoji}
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {body && <p className="max-w-sm text-sm text-ink-muted dark:text-cream/60">{body}</p>}
      {action}
    </div>
  )
}

export function LoadingDots({ label = 'Working on nothing' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-ink-muted dark:text-cream/60">
      <span>{label}</span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-tangerine"
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
    </div>
  )
}
