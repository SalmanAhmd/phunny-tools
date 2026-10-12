import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Dices, Sparkles, Trophy, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, Chip, SectionTitle, Tooltip } from '@/components/ui/Primitives'
import { ToolCard } from '@/components/ToolCard'
import { HeroMachine } from '@/components/HeroMachine'
import { Confetti, useConfetti } from '@/components/ui/Confetti'
import { CATEGORIES, TOOLS, TOOL_MAP } from '@/lib/tools'
import { DAILY_CHALLENGES, FAKE_STATS, HOW_IT_WORKS, TICKER } from '@/lib/content'
import { seededPick, todaySeed, randInt } from '@/lib/random'
import { notify } from '@/lib/toastBus'
import { useNonsense } from '@/store/nonsense'
import { sound } from '@/lib/sound'
import { usePrefs } from '@/store/prefs'

function LiveCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const { reducedMotion } = usePrefs()
  const [display, setDisplay] = useState(reducedMotion ? value : 0)

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const duration = 1400
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(value * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, reducedMotion])

  const formatted = Number.isInteger(value)
    ? Math.round(display).toLocaleString('en-US')
    : display.toFixed(1)
  return (
    <span className="font-mono tabular-nums">
      {formatted}
      {suffix}
    </span>
  )
}

function Ticker() {
  return (
    <div
      className="relative overflow-hidden border-y-2 border-ink bg-ink py-3 text-cream dark:border-cream"
      aria-hidden
    >
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
        {[...TICKER, ...TICKER].map((t, i) => (
          <span key={i} className="flex items-center gap-8 font-display text-sm font-semibold uppercase tracking-widest">
            {t} <span className="text-sunrise">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function DailyChallenge() {
  const challenge = useMemo(() => seededPick(DAILY_CHALLENGES, todaySeed()), [])
  const { unlock } = useNonsense()
  const [claimed, setClaimed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(`useless-tools:challenge:${todaySeed()}`) === 'done'
  })
  const [burst, fire] = useConfetti()

  const claim = () => {
    if (claimed) return
    setClaimed(true)
    fire()
    sound.success()
    window.localStorage.setItem(`useless-tools:challenge:${todaySeed()}`, 'done')
    unlock('first-click')
    notify.achievement(
      'Today’s challenge completed',
      `You are now officially a ${challenge.reward}. This title is fictional and non-transferable.`,
      challenge.emoji,
    )
  }

  return (
    <Card className="relative overflow-hidden bg-sunrise" tilt={-0.6}>
      <Confetti trigger={burst} count={50} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <Chip color="plain">
            <Sparkles className="h-3 w-3" /> Daily useless challenge
          </Chip>
          <h3 className="mt-3 font-display text-2xl font-bold leading-tight">
            <span aria-hidden className="mr-2">{challenge.emoji}</span>
            {challenge.task}
          </h3>
          <p className="mt-2 text-sm text-ink/70">
            Reward: the title of <strong>{challenge.reward}</strong>, valid nowhere.
          </p>
        </div>
        <Button variant={claimed ? 'ghost' : 'grape'} onClick={claim} icon={<Trophy className="h-4 w-4" />} size="lg">
          {claimed ? 'Reward claimed' : 'Claim imaginary reward'}
        </Button>
      </div>
    </Card>
  )
}

function PickOfTheDay() {
  const tool = useMemo(() => seededPick(TOOLS, todaySeed() + 7), [])
  return (
    <Card className="flex h-full flex-col justify-between bg-grape text-white" tilt={0.8}>
      <div>
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
          Tool of the day
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-4xl" aria-hidden>{tool.emoji}</span>
          <div>
            <div className="font-display text-xl font-bold">{tool.name}</div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-white/70">
              {tool.effort}
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/85">{tool.tagline}</p>
      </div>
      <Link to={tool.path} className="btn mt-5 w-full border-white bg-white text-ink shadow-none">
        Launch it <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  )
}

export default function Home() {
  const { stats, nonsenseLevel, rank } = useNonsense()
  const [burst, fire] = useConfetti()
  const eggClicks = useRef(0)
  const { unlock } = useNonsense()

  const surprise = () => {
    fire()
    const pool = TOOLS
    const choice = pool[randInt(0, pool.length - 1)]
    unlock('surprise')
    notify.success(`Surprise! ${choice.name}`, choice.tagline, choice.emoji)
    window.history.pushState({}, '', choice.path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const secretEgg = () => {
    eggClicks.current += 1
    if (eggClicks.current === 7) {
      unlock('easter-egg')
      fire()
      notify.info('You found it', 'Seven clicks on a logo. Truly nothing better to do.', '🥚')
    }
  }

  return (
    <div>
      <Confetti trigger={burst} count={70} />

      {/* ------------------------------- hero ------------------------------- */}
      <section className="relative overflow-hidden px-4 pb-12 pt-10 sm:px-6 sm:pt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-limey px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest shadow-popsm dark:border-cream"
            >
              <Zap className="h-3 w-3" /> Premium tools · 0% functional value
            </motion.div>

            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Finally.{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Software</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 bg-sunrise sm:h-4"
                />
              </span>{' '}
              That Makes Everything <span className="text-tangerine">Worse.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted dark:text-cream/70">
              Compress files with a hammer. Crop images emotionally. Convert PDFs into existential
              crises. Welcome to the future of absolutely unnecessary productivity.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/tools" className="btn btn-primary" style={{ padding: '1rem 1.75rem' }}>
                Explore Useless Tools <ArrowRight className="h-4 w-4" />
              </Link>
              <Button variant="sun" size="lg" onClick={surprise} icon={<Dices className="h-4 w-4" />}>
                Surprise Me
              </Button>
              <Tooltip text="Our most requested button. It has never been useful.">
                <Link
                  to="/tools/loading"
                  className="font-mono text-xs font-bold uppercase tracking-widest text-ink-muted underline decoration-dotted underline-offset-4 transition hover:text-tangerine dark:text-cream/60"
                >
                  or wait for something
                </Link>
              </Tooltip>
            </div>

            <button
              type="button"
              onClick={secretEgg}
              className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-muted/70 transition hover:text-tangerine dark:text-cream/30"
            >
              <span aria-hidden>✦</span> 28 experiences · 0 uploads · 1 potato
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            className="relative"
          >
            <HeroMachine className="mx-auto w-full max-w-md drop-shadow-[10px_10px_0_rgba(13,12,10,0.12)]" />
          </motion.div>
        </div>

        {/* live status cards */}
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {FAKE_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 240, damping: 24 }}
              className="rounded-3xl border-2 border-ink bg-white p-4 shadow-pop dark:border-cream dark:bg-[#171512]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase leading-tight tracking-widest text-ink-muted dark:text-cream/50">
                  {s.label}
                </span>
                <span aria-hidden className="text-lg">{s.emoji}</span>
              </div>
              <div className="mt-2 text-2xl font-bold sm:text-3xl">
                <LiveCounter value={s.value} suffix={s.suffix} />
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mx-auto mt-3 max-w-6xl text-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted/70 dark:text-cream/40">
          All figures above are fictional and were generated by an intern with a calculator app.
        </p>
      </section>

      <Ticker />

      {/* --------------------------- featured + daily --------------------------- */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            <SectionTitle
              kicker="Start here"
              title="Six experiences engineered with love and no purpose"
              subtitle="Each one is fully interactive, entirely honest about being pointless, and will never touch your original files."
            />
            <DailyChallenge />
          </div>
          <div className="space-y-5">
            <PickOfTheDay />
            <Card className="bg-limey" tilt={-0.5}>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em]">
                Your nonsense level
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold">{nonsenseLevel}</span>
                <span className="text-sm font-semibold">{rank.emoji} {rank.title}</span>
              </div>
              <p className="mt-2 text-xs text-ink/70">
                {stats.buttonsClicked} buttons clicked · {stats.toolsUsed.length} tools visited ·{' '}
                {stats.achievements.length} achievements collected
              </p>
              <Link to="/nonsense" className="btn mt-4 w-full bg-ink text-cream dark:border-ink">
                Open my nonsense dashboard
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* ----------------------------- directory ----------------------------- */}
      <section className="px-4 pb-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            kicker="The collection"
            title="Useless tools, sorted into deeply serious categories"
            subtitle="Filter by category on the All Tools page, or simply start clicking and hope for the best."
          />

          <div className="space-y-10">
            {CATEGORIES.map((cat) => {
              const items = TOOLS.filter((t) => t.category === cat.id)
              if (!items.length) return null
              return (
                <div key={cat.id}>
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-2xl border-2 border-ink bg-sunrise text-lg shadow-popsm dark:border-cream"
                      aria-hidden
                    >
                      {cat.emoji}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold leading-none">{cat.label}</h3>
                      <p className="mt-1 text-xs text-ink-muted dark:text-cream/50">{cat.blurb}</p>
                    </div>
                    <Link
                      to={`/tools?category=${cat.id}`}
                      className="ml-auto font-mono text-[11px] font-bold uppercase tracking-widest text-tangerine underline decoration-dotted underline-offset-4"
                    >
                      See all {items.length}
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.slice(0, 3).map((tool, i) => (
                      <ToolCard key={tool.id} tool={tool} index={i} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------- how it works ---------------------------- */}
      <section className="border-y-2 border-ink bg-cream-deep px-4 py-16 dark:border-cream dark:bg-[#151310] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            kicker="Our process"
            title="How a single click becomes a five-department incident"
            subtitle="We have refined this pipeline over many years and it has never once produced a useful output."
          />
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 240, damping: 24 }}
                className="rounded-3xl border-2 border-ink bg-white p-5 shadow-pop dark:border-cream dark:bg-[#171512]"
              >
                <div className="font-mono text-xs font-bold tracking-[0.3em] text-tangerine">{step.step}</div>
                <div className="mt-3 text-3xl" aria-hidden>{step.emoji}</div>
                <h3 className="mt-3 font-display text-base font-bold leading-snug">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted dark:text-cream/60">{step.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-ink bg-white p-6 shadow-pop dark:border-cream dark:bg-[#171512]">
            <div>
              <h3 className="font-display text-xl font-bold">Ready to accomplish nothing?</h3>
              <p className="mt-1 text-sm text-ink-muted dark:text-cream/60">
                {TOOL_MAP.hammerzip.name} is waiting. It has been waiting for nine months.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/tools/hammerzip" className="btn btn-primary">
                🔨 Hammer a file
              </Link>
              <Link to="/games" className="btn btn-ghost">
                🕹️ Play a mini game
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
