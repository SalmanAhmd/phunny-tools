import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePrefs } from '@/store/prefs'

interface Particle {
  id: number
  x: number
  color: string
  delay: number
  rotate: number
  size: number
  shape: 'square' | 'circle' | 'tri'
}

const COLORS = ['#FF6A00', '#7C3AED', '#FFD400', '#B4E600', '#FF4FA3', '#0D0C0A']

/**
 * Fire-and-forget confetti for pointless achievements.
 * Renders into a fixed overlay; unmounts itself after the animation.
 */
export function Confetti({ trigger, count = 60 }: { trigger: number; count?: number }) {
  const { reducedMotion } = usePrefs()
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!trigger || reducedMotion) return
    const batch: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: trigger * 1000 + i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.35,
      rotate: Math.random() * 720 - 360,
      size: 8 + Math.random() * 12,
      shape: (['square', 'circle', 'tri'] as const)[Math.floor(Math.random() * 3)],
    }))
    setParticles(batch)
    const t = window.setTimeout(() => setParticles([]), 3200)
    return () => window.clearTimeout(t)
  }, [trigger, count, reducedMotion])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ y: -40, x: 0, opacity: 1, rotate: 0 }}
            animate={{ y: '105vh', x: [0, Math.random() * 120 - 60, Math.random() * 200 - 100], rotate: p.rotate, opacity: [1, 1, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4 + Math.random() * 0.9, delay: p.delay, ease: 'easeIn' }}
            className={cn('absolute', p.shape === 'circle' && 'rounded-full', p.shape === 'tri' && '')}
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              background: p.shape === 'tri' ? 'transparent' : p.color,
              borderLeft: p.shape === 'tri' ? `${p.size / 2}px solid transparent` : undefined,
              borderRight: p.shape === 'tri' ? `${p.size / 2}px solid transparent` : undefined,
              borderBottom: p.shape === 'tri' ? `${p.size}px solid ${p.color}` : undefined,
              border: p.shape === 'square' ? '2px solid #0D0C0A' : undefined,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/** Convenience hook: const [burst, fire] = useConfetti() */
export function useConfetti() {
  const [trigger, setTrigger] = useState(0)
  return [trigger, () => setTrigger((t) => t + 1)] as const
}
