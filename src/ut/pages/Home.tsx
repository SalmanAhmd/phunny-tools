import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Dices, Hammer, Sparkles } from "lucide-react";
import { CATEGORIES, TOOL_BY_ID, TOOLS } from "../lib/registry";
import { ToolCard } from "../components/ToolCard";
import { Marquee, SectionTitle, StatPill, Callout } from "../components/bits";
import { useSurprise } from "../lib/useSurprise";
import { useRecentTools } from "../lib/recent";
import { useStats } from "../lib/stats";

const CATEGORY_EMOJI: Record<string, string> = {
  "File Destruction & Management": "🗂️",
  "Image Crimes": "🖼️",
  "Office Productivity Disasters": "📎",
  "Audio Nonsense": "🔊",
  "Time-Wasting Machines": "⏳",
  "Mini Games": "🕹️",
  "Randomly Useless Utilities": "🧰",
};

const TICKER = [
  "99% effort · 0% meaningful results",
  "Productivity is temporary. Nonsense is forever.",
  "Your files are safe. Their dignity is not.",
  "No cookies, no tracking, no server.",
  "Every statistic on this site is fictional.",
  "Meetings scheduled: 47. Decisions made: none.",
];

export default function Home() {
  const surprise = useSurprise();
  const { recent } = useRecentTools();
  const { stats, level } = useStats();

  const featured = TOOLS.filter((t) => t.featured);
  const games = TOOLS.filter((t) => t.kind === "game");
  const recentTools = recent.map((id) => TOOL_BY_ID.get(id)).filter(
    (t): t is NonNullable<typeof t> => Boolean(t),
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b-2 border-ink dark:border-cream">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:pb-24 lg:pt-20"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-zing-yellow px-3 py-1 font-display text-xs font-bold uppercase tracking-widest shadow-pop-sm dark:border-cream">
              <Hammer size={14} /> Working hard at doing absolutely nothing
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Phunny Tools<span className="align-top text-2xl">™</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-balance opacity-80">
              A premium-looking suite of tools that make easy things unnecessarily difficult.
              Compress files with a hammer. Crop images emotionally. Convert PDFs into feelings.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/tools" className="btn btn-pop btn-primary text-base">
                <Sparkles size={18} /> Explore the catalogue
              </Link>
              <button
                onClick={surprise}
                className="btn btn-pop btn-purple text-base"
                aria-label="Launch a random tool"
              >
                <Dices size={18} /> Surprise me
              </button>
            </div>
            <p className="mt-4 text-sm opacity-60">
              {TOOLS.length} experiences · {games.length} mini games · 0 meaningful results
            </p>
          </div>

          <div className="relative hidden lg:block">
            <motion.div
              animate={{ rotate: [-6, 8, -6] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
              className="flex h-56 w-56 items-center justify-center rounded-[2.5rem] border-2 border-ink bg-zing-orange text-8xl shadow-pop-lg dark:border-cream"
              aria-hidden
            >
              🔨
            </motion.div>
            <div className="absolute -bottom-4 -left-6 rotate-[-6deg] rounded-2xl border-2 border-ink bg-white px-4 py-3 shadow-pop dark:border-cream dark:bg-ink-soft">
              <p className="font-display text-sm font-bold">File compressed!</p>
              <p className="text-xs opacity-70">Size: exactly the same</p>
            </div>
            <div className="absolute -right-2 -top-4 rotate-6 rounded-2xl border-2 border-ink bg-zing-lime px-4 py-3 shadow-pop">
              <p className="font-display text-sm font-bold text-ink">ZERO progress made</p>
              <p className="text-xs text-ink/70">Certified by an imaginary intern</p>
            </div>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 pb-14 sm:px-6 lg:grid-cols-4">
          <StatPill label="Effort invested" value="99%" accent="bg-zing-orange text-white" icon={<Hammer size={20} />} />
          <StatPill label="Meaningful results" value="0%" accent="bg-zing-lime" />
          <StatPill label="Meeting rebookings" value="∞" accent="bg-zing-purple text-white" />
          <StatPill label="Your nonsense level" value={level} accent="bg-zing-pink text-white" />
        </div>
      </section>

      <Marquee items={TICKER} />

      {/* Featured experiences */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            kicker="The hits"
            title="Featured nonsense"
            subtitle="Crowd-pleasing machines of questionable purpose, selected by a committee of one."
          />
          <Link to="/tools" className="hidden items-center gap-1 font-display text-sm font-bold sm:flex">
            All tools <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y-2 border-ink bg-cream-deep dark:border-cream dark:bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionTitle
            kicker="Browse by category"
            title="Choose your flavour of waste"
            subtitle="Seven meticulously curated departments of doing nothing."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CATEGORIES.map((category, i) => {
              const count = TOOLS.filter((t) => t.category === category).length;
              return (
                <motion.div key={category} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                  <Link
                    to={`/tools?category=${encodeURIComponent(category)}`}
                    className="group block h-full rounded-3xl border-2 border-ink bg-white p-5 shadow-pop transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 dark:border-cream dark:bg-ink-soft"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl" aria-hidden>
                        {CATEGORY_EMOJI[category] ?? "📦"}
                      </span>
                      <span className="font-display text-sm font-bold tabular-nums opacity-60">
                        {count}
                      </span>
                    </div>
                    <p className="mt-4 font-display font-bold leading-snug">{category}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recently used */}
      {recentTools.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionTitle
            kicker="You were just here"
            title="Recently used by you"
            subtitle="A truly elite list. Cards were not clicked accidentally this much in a row."
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentTools.slice(0, 3).map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Stats teaser */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border-2 border-ink bg-zing-purple p-8 text-white shadow-pop-lg dark:border-cream sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl font-bold">{stats.secondsWasted}s wasted, and counting</h2>
              <p className="mt-2 max-w-lg opacity-85">
                Your life-clock is already ticking. View your full report of imaginary achievements
                and fabricated statistics.
              </p>
            </div>
            <Link to="/nonsense" className="btn btn-pop bg-zing-yellow text-ink">
              My Nonsense <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Callout tone="warn" title="Before you continue">
          Everything on this site is a parody. Nothing is uploaded, nothing is compressed, and
          nothing will appear on your performance review (we cannot promise that, actually — please
          draft your own excuses).
        </Callout>
      </div>
    </div>
  );
}