import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { toastBus, type ToastMessage } from '@/lib/toastBus'
import { cn } from '@/lib/utils'

const KIND_STYLE: Record<ToastMessage['kind'], string> = {
  info: 'bg-white dark:bg-[#171512]',
  success: 'bg-limey',
  error: 'bg-bubblegum',
  achievement: 'bg-sunrise',
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => toastBus.subscribe(setToasts), [])

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-2xl border-2 border-ink p-3 shadow-pop dark:border-cream',
              KIND_STYLE[t.kind],
            )}
          >
            <span className="text-xl leading-none" aria-hidden>
              {t.emoji ?? '💬'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold leading-tight text-ink">{t.title}</p>
              {t.body && <p className="mt-0.5 text-xs leading-snug text-ink/70">{t.body}</p>}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => toastBus.dismiss(t.id)}
              className="rounded-lg p-1 text-ink/60 transition hover:bg-ink/10 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
