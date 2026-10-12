import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Command, Menu, Moon, Search, Sun, Volume2, VolumeX, X } from 'lucide-react'
import { CATEGORIES, searchTools, TOOLS } from '@/lib/tools'
import { useNonsense } from '@/store/nonsense'
import { usePrefs } from '@/store/prefs'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tools', label: 'All Tools' },
  { to: '/games', label: 'Mini Games' },
  { to: '/nonsense', label: 'My Nonsense' },
  { to: '/about', label: 'About' },
]

/* --------------------------------- NavBar --------------------------------- */

export function NavBar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { theme, toggleTheme, soundOn, toggleSound } = usePrefs()
  const [mobileOpen, setMobileOpen] = useState(false)
  const locationRef = useRef(window.location.pathname)

  useEffect(() => {
    setMobileOpen(false)
  }, [locationRef.current])

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-cream/90 backdrop-blur dark:border-cream dark:bg-[#0E0D0B]/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2" onClick={() => sound.pop()}>
          <span className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-sunrise text-lg shadow-popsm transition-transform group-hover:-rotate-6 dark:border-cream">
            🧰
          </span>
          <span className="hidden font-display text-base font-bold leading-none tracking-tight sm:block">
            Useless Tools
            <span className="align-super text-[9px] font-semibold text-tangerine">™</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-3 py-2 font-display text-[13px] font-bold uppercase tracking-wide transition',
                  isActive ? 'bg-ink text-cream dark:bg-cream dark:text-ink' : 'hover:bg-ink/10 dark:hover:bg-cream/10',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-xl border-2 border-ink bg-white px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest shadow-popsm transition hover:bg-sunrise dark:border-cream dark:bg-[#171512] dark:text-cream"
            aria-label="Open search (⌘K)"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded-md border border-ink/30 px-1 font-mono text-[9px] sm:inline">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-white shadow-popsm transition hover:bg-sunrise dark:border-cream dark:bg-[#171512] dark:text-cream"
            aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
            aria-pressed={soundOn}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-white shadow-popsm transition hover:bg-sunrise dark:border-cream dark:bg-[#171512] dark:text-cream"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-white shadow-popsm md:hidden dark:border-cream dark:bg-[#171512] dark:text-cream"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t-2 border-ink/10 md:hidden dark:border-cream/10"
            aria-label="Mobile"
          >
            <div className="space-y-1 px-4 py-3">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide',
                      isActive ? 'bg-ink text-cream dark:bg-cream dark:text-ink' : 'hover:bg-ink/10 dark:hover:bg-cream/10',
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

/* --------------------------------- Footer --------------------------------- */

const FOOTER_DISCLAIMERS = [
  'No files are uploaded. There is no server. There was never a server.',
  'No compression, conversion, or recovery actually occurs. It was all vibes.',
  'All testimonials, metrics, and team members are fictional except the potato.',
  'Your data stays in your browser, where it belongs: with you, and nowhere.',
]

export function Footer() {
  const { stats } = useNonsense()
  const { soundOn } = usePrefs()
  const toggleSound = usePrefs().toggleSound

  return (
    <footer className="border-t-2 border-ink bg-cream-deep dark:border-cream dark:bg-[#151310]">
      {/* disclaimer ticker */}
      <div className="relative overflow-hidden border-b-2 border-ink bg-ink py-2.5 text-cream dark:border-cream" aria-hidden>
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...FOOTER_DISCLAIMERS, ...FOOTER_DISCLAIMERS].map((d, i) => (
            <span key={i} className="flex items-center gap-10 font-mono text-[11px] font-semibold uppercase tracking-widest">
              {d} <span className="text-sunrise">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-sunrise text-lg shadow-popsm dark:border-cream">
              🧰
            </span>
            <span className="font-display text-lg font-bold">
              Useless Tools<span className="align-super text-[10px] text-tangerine">™</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-ink-muted dark:text-cream/60">
            We make easy things unnecessarily difficult. Proudly pointless since the meeting that
            should have been an email.
          </p>
          <button
            type="button"
            onClick={toggleSound}
            className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted transition hover:text-tangerine dark:text-cream/60"
          >
            {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            Sound {soundOn ? 'on' : 'off'}
          </button>
        </div>

        <div>
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-tangerine">Categories</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/tools?category=${c.id}`} className="text-ink-muted transition hover:text-ink dark:text-cream/60 dark:hover:text-cream">
                  <span aria-hidden className="mr-1.5">{c.emoji}</span>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-tangerine">Your nonsense</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-cream/60">
            <li>{stats.toolsUsed.length + stats.gamesPlayed.length} experiences survived</li>
            <li>{stats.buttonsClicked.toLocaleString()} buttons clicked</li>
            <li>{stats.achievements.length} achievements acquired</li>
            <li>0 files harmed (we checked)</li>
          </ul>
          <p className="mt-4 text-xs italic text-ink-muted/80 dark:text-cream/40">
            {TOOLS.length} experiences · 0 uploads · 1 potato.
          </p>
        </div>
      </div>

      <div className="border-t-2 border-ink/15 py-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted dark:border-cream/15 dark:text-cream/40">
        © {new Date().getFullYear()} Useless Tools™ · Legal department: an empty chair · All rights utterly wasted
      </div>
    </footer>
  )
}

/* ------------------------------ PageTransition ------------------------------ */

export function PageTransition({ children }: { children: ReactNode }) {
  const { reducedMotion } = usePrefs()
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------ CommandPalette ------------------------------ */

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => searchTools(query, 'all', 'all').slice(0, 12), [query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    const t = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  const go = (path: string) => {
    sound.pop()
    onClose()
    navigate(path)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((a) => Math.min(a + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((a) => Math.max(a - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = results[active]
        if (item) go(item.path)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, active])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/50 px-4 pt-24 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search experiences"
            className="w-full max-w-xl overflow-hidden rounded-3xl border-2 border-ink bg-white shadow-poplg dark:border-cream dark:bg-[#171512]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b-2 border-ink/10 px-4 py-3 dark:border-cream/10">
              <Command className="h-4 w-4 text-ink-muted" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a tool or game… (hammer, bug, meeting, potato)"
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted dark:placeholder:text-cream/40"
                aria-label="Search experiences"
              />
              <kbd className="rounded-md border border-ink/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-muted dark:border-cream/30 dark:text-cream/50">
                esc
              </kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-muted dark:text-cream/50">
                  Nothing matches “{query}”. Try something less useful.
                </p>
              ) : (
                results.map((tool, i) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => go(tool.path)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition',
                      i === active ? 'bg-ink text-cream dark:bg-cream dark:text-ink' : 'hover:bg-ink/5 dark:hover:bg-cream/10',
                    )}
                  >
                    <span className="text-xl" aria-hidden>{tool.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-sm font-bold">{tool.name}</span>
                      <span className={cn('block truncate text-xs', i === active ? 'text-cream/70 dark:text-ink/60' : 'text-ink-muted dark:text-cream/50')}>
                        {tool.tagline}
                      </span>
                    </span>
                    <span className={cn('shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest', i === active ? 'text-sunrise' : 'text-ink-muted dark:text-cream/40')}>
                      {tool.kind}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}