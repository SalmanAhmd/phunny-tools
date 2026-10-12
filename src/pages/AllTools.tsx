import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { SectionTitle, EmptyState, Chip } from '@/components/ui/Primitives'
import { Button } from '@/components/ui/Button'
import { ToolCard } from '@/components/ToolCard'
import { CATEGORIES, TOOL_MAP, searchTools, type ToolKind } from '@/lib/tools'
import { cn } from '@/lib/utils'
import { useNonsense } from '@/store/nonsense'
import { sound } from '@/lib/sound'

type KindFilter = 'all' | ToolKind

export default function AllTools() {
  const [params, setParams] = useSearchParams()
  const initialCategory = params.get('category') ?? 'all'
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [kind, setKind] = useState<KindFilter>('all')
  const { stats } = useNonsense()

  useEffect(() => {
    setCategory(params.get('category') ?? 'all')
  }, [params])

  const selectCategory = (id: string) => {
    sound.click()
    setCategory(id)
    if (id === 'all') setParams({})
    else setParams({ category: id })
  }

  const results = useMemo(() => searchTools(query, category, kind), [query, category, kind])

  const recent = stats.recentTools.map((id) => TOOL_MAP[id]).filter(Boolean)
  const usedCount = stats.toolsUsed.length + stats.gamesPlayed.length

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SectionTitle
        kicker="Directory"
        title="All Useless Tools"
        subtitle={`${results.length} of ${Object.keys(TOOL_MAP).length} experiences match. You have already survived ${usedCount} of them.`}
      />

      {/* controls */}
      <div className="mb-6 space-y-4 rounded-3xl border-2 border-ink bg-white p-4 shadow-pop dark:border-cream dark:bg-[#171512]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-2xl border-2 border-ink bg-cream-deep px-3 py-2.5 dark:border-cream dark:bg-[#100F0D]">
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <span className="sr-only">Search tools</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: hammer, blur, meeting, bug…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted dark:placeholder:text-cream/40"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="rounded-lg p-1 hover:bg-ink/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <div className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-cream-deep p-1 dark:border-cream dark:bg-[#100F0D]">
            <SlidersHorizontal className="ml-1.5 h-3.5 w-3.5" aria-hidden />
            {(['all', 'tool', 'game'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k)
                  sound.click()
                }}
                aria-pressed={kind === k}
                className={cn(
                  'rounded-xl px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wide transition',
                  kind === k ? 'bg-ink text-cream dark:bg-cream dark:text-ink' : 'hover:bg-ink/10 dark:hover:bg-cream/10',
                )}
              >
                {k === 'all' ? 'Everything' : k === 'tool' ? 'Tools' : 'Games'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => selectCategory('all')} aria-pressed={category === 'all'}>
            <Chip color={category === 'all' ? 'orange' : 'plain'} className="cursor-pointer">
              All categories
            </Chip>
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" onClick={() => selectCategory(c.id)} aria-pressed={category === c.id}>
              <Chip color={category === c.id ? 'orange' : 'plain'} className="cursor-pointer">
                <span aria-hidden>{c.emoji}</span> {c.label}
              </Chip>
            </button>
          ))}
        </div>
      </div>

      {/* recently used */}
      {recent.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-ink-muted dark:text-cream/50">
            Recently used
          </h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((t) => (
              <a
                key={t.id}
                href={t.path}
                onClick={(e) => {
                  e.preventDefault()
                  window.history.pushState({}, '', t.path)
                  window.dispatchEvent(new PopStateEvent('popstate'))
                }}
                className="chip bg-white hover:bg-sunrise dark:bg-[#171512] dark:text-cream"
              >
                <span aria-hidden>{t.emoji}</span> {t.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* results */}
      {results.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No tools match that"
          body="Try something less specific, or just let us choose for you."
          action={
            <Button
              variant="sun"
              className="mt-3"
              onClick={() => {
                setQuery('')
                setCategory('all')
                setKind('all')
              }}
            >
              Reset the filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      )}

      <p className="mt-10 rounded-2xl border-2 border-dashed border-ink/25 p-4 text-center text-xs text-ink-muted dark:border-cream/25 dark:text-cream/50">
        Nothing on this page uploads anything. Everything you do stays in your browser, where it can
        accumulate quietly and never be analysed.
      </p>
    </div>
  )
}
