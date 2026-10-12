import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePrefs } from '@/store/prefs'

export function ProgressBar({
  value,
  label,
  sublabel,
  color = 'tangerine',
  className,
  indeterminate = false,
}: {
  value: number
  label?: string
  sublabel?: string
  color?: 'tangerine' | 'grape' | 'limey' | 'sunrise'
  className?: string
  indeterminate?: boolean
}) {
  const colors: Record<string, string> = {
    tangerine: 'bg-tangerine',
    grape: 'bg-grape',
    limey: 'bg-limey',
    sunrise: 'bg-sunrise',
  }
  return (
    <div className={cn('w-full', className)}>
      {(label || sublabel) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label && <span className="font-display text-sm font-bold">{label}</span>}
          {sublabel && (
            <span className="font-mono text-[11px] text-ink-muted dark:text-cream/60">{sublabel}</span>
          )}
        </div>
      )}
      <div className="h-5 w-full overflow-hidden rounded-full border-2 border-ink bg-white dark:border-cream dark:bg-[#171512]">
        <motion.div
          className={cn('h-full rounded-full', colors[color])}
          animate={
            indeterminate
              ? { x: ['-40%', '140%'], width: '40%' }
              : { width: `${Math.max(0, Math.min(100, value))}%` }
          }
          transition={
            indeterminate
              ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
              : { type: 'spring', stiffness: 120, damping: 22 }
          }
          style={indeterminate ? { width: '40%' } : undefined}
        />
      </div>
    </div>
  )
}

/** A progress bar that fights back: it randomly stalls, rewinds, and lies. */
export function useChaoticProgress() {
  const { reducedMotion } = usePrefs()
  const [progress, setProgress] = useState(0)
  const running = progress > 0 && progress < 100

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100
        const roll = Math.random()
        let delta = reducedMotion ? 1.5 : 1 + Math.random() * 2.4
        if (!reducedMotion && roll < 0.06) delta = -Math.random() * 14 // dramatic regression
        else if (!reducedMotion && roll < 0.14) delta = 0 // suspicious stall
        return Math.max(0, Math.min(100, p + delta))
      })
    }, 220)
    return () => window.clearInterval(id)
  }, [running, reducedMotion])

  return { progress, setProgress, running }
}

export function KeyHint({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border-2 border-ink bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold shadow-popsm dark:border-cream dark:bg-[#221F1A]">
      {children}
    </kbd>
  )
}
