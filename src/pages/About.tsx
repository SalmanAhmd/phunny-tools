import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SectionTitle, Card, Chip } from '@/components/ui/Primitives'
import { ABOUT_PARAGRAPHS, TESTIMONIALS_ARE_FAKE_NOTE } from '@/lib/content'
import { HeroMachine } from '@/components/HeroMachine'
import { TOOLS } from '@/lib/tools'

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionTitle
        kicker="About"
        title="The fictional philosophy behind useless productivity"
        subtitle="We are not a real company. We are an idea that got approved in a meeting that should have been an email."
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {ABOUT_PARAGRAPHS.map((p, i) => (
            <motion.div
              key={p.heading}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Card tilt={i % 2 === 0 ? -0.4 : 0.4}>
                <h2 className="font-display text-xl font-bold">{p.heading}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-cream/70">{p.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="space-y-5">
          <Card className="bg-grape text-white" tilt={0.8}>
            <Chip color="plain">Mission statement</Chip>
            <p className="mt-3 font-display text-lg font-bold leading-snug">
              “Why do it in one click when you can do it in seventeen?”
            </p>
            <p className="mt-3 text-xs text-white/70">— our entire product strategy, 2019–present</p>
          </Card>

          <Card>
            <h2 className="font-display text-base font-bold">By the numbers</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ['Experiences built', String(TOOLS.length)],
                ['Real files uploaded', '0'],
                ['Servers involved', '0'],
                ['Potatoes employed', '1'],
                ['Problems solved efficiently', '0'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b-2 border-dashed border-ink/15 pb-1.5 last:border-0 dark:border-cream/15">
                  <dt className="text-ink-muted dark:text-cream/60">{k}</dt>
                  <dd className="font-mono font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="bg-limey" tilt={-0.7}>
            <h2 className="font-display text-base font-bold">A note on honesty</h2>
            <p className="mt-2 text-xs leading-relaxed text-ink/80">
              {TESTIMONIALS_ARE_FAKE_NOTE} Every tool here tells you exactly what it really does.
              Where a real operation happens — cropping, blurring, resizing, reading a ZIP — we say so.
              Where nothing happens, we say that too, loudly.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border-2 border-ink bg-white p-6 shadow-pop dark:border-cream dark:bg-[#171512]">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_1.2fr]">
          <HeroMachine className="mx-auto w-full max-w-xs" />
          <div>
            <h2 className="font-display text-2xl font-bold">Still reading? Admirable.</h2>
            <p className="mt-2 text-sm text-ink-muted dark:text-cream/70">
              You have now spent more time on this page than most people spend on their actual jobs.
              That deserves recognition, so here is a sentence about how impressive that is. It is
              fictional recognition, obviously, but it is recognition nonetheless.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/tools" className="btn btn-primary">
                Open the tools
              </Link>
              <Link to="/tools/potato" className="btn btn-ghost">
                🥔 Ask the potato
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
