import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      <motion.div
        initial={{ rotate: -8, scale: 0.8 }}
        animate={{ rotate: [0, -6, 6, 0], scale: 1 }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-6xl"
        aria-hidden
      >
        🧭
      </motion.div>
      <h1 className="mt-6 font-display text-4xl font-bold">404 — Page Not Productive</h1>
      <p className="mt-3 max-w-md text-sm text-ink-muted dark:text-cream/60">
        This page was scheduled for a meeting and then cancelled. It may exist in a future sprint
        that will never be planned.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          Back to the homepage
        </Link>
        <Link to="/tools" className="btn btn-ghost">
          Browse all tools
        </Link>
      </div>
    </div>
  )
}
