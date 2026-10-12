import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Gamepad2, Search, Wrench, Wand2 } from "lucide-react";
import { CATEGORIES, TOOLS } from "../lib/registry";
import { ToolCard } from "../components/ToolCard";
import { SectionTitle, EmptyState } from "../components/bits";
import { sfx } from "../lib/sound";

type KindFilter = "all" | "tool" | "game" | "utility";

const KIND: { id: KindFilter; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "tool", label: "Tools" },
  { id: "game", label: "Games" },
  { id: "utility", label: "Utilities" },
];

export default function AllTools() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "all";
  const kind = (params.get("kind") ?? "all") as KindFilter;

  const update = (patch: Record<string, string>) => {
    sfx("click");
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value && value !== "all") next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (kind !== "all" && t.kind !== kind) return false;
      if (!q) return true;
      const haystack = `${t.name} ${t.tagline} ${t.description} ${t.category}`.toLowerCase();
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [query, category, kind]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionTitle
        kicker="The catalogue"
        title="Every tool we built. And then questioned."
        subtitle={`${results.length} of ${TOOLS.length} experiences currently wasting time.`}
      />

      {/* Search + filters */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <label className="relative block">
          <span className="sr-only">Search the catalogue</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            value={query}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search for a way to waste time…"
            className="tool-input py-3.5 pl-12 text-base"
            aria-label="Search the catalogue"
          />
        </label>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by kind">
          {KIND.map((k) => (
            <button
              key={k.id}
              onClick={() => update({ kind: k.id })}
              aria-pressed={kind === k.id}
              className={`btn btn-pop btn-ghost flex-1 text-xs ${
                kind === k.id ? "!bg-zing-purple !text-white" : ""
              }`}
            >
              {k.id === "game" ? <Gamepad2 size={15} /> : k.id === "utility" ? <Wand2 size={15} /> : <Wrench size={15} />}
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          onClick={() => update({ category: "all" })}
          aria-pressed={category === "all"}
          className={`chip ${category === "all" ? "!bg-zing-yellow !text-ink" : "hover:bg-zing-yellow/40"}`}
        >
          All categories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => update({ category: c })}
            aria-pressed={category === c}
            className={`chip ${category === c ? "!bg-zing-yellow !text-ink" : "hover:bg-zing-yellow/40"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {results.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon="🕳️"
            title="Nothing matches that"
            body="We searched every drawer, opened every cabinet, and held a meeting about it. The catalogue remains empty."
            action={
              <button
                className="btn btn-pop btn-purple"
                onClick={() => {
                  sfx("pop");
                  setParams(new URLSearchParams(), { replace: true });
                }}
              >
                Clear the filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}