import { TOOLS } from "../lib/registry";
import { ToolCard } from "../components/ToolCard";
import { SectionTitle, Callout } from "../components/bits";

export default function Games() {
  const games = TOOLS.filter((t) => t.kind === "game");
  const featured = games.find((g) => g.featured);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionTitle
        kicker="The arcade of inaction"
        title="Mini games, maximum nothing"
        subtitle="Completely playable. Entirely without purpose. Each one takes roughly 30 seconds and permanently volunteers for none of your resolutions."
      />

      <div className="mt-8">
        <Callout tone="success" title="Your high scores are real (and local)">
          Scores are tracked per browser, stored on your device, and used exclusively to inflate
          your own sense of achievement. There is no online leaderboard because we could not be
          bothered, and neither should you.
        </Callout>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} index={i} />
        ))}
      </div>

      {featured && (
        <div className="mt-12 rounded-3xl border-2 border-ink bg-zing-orange p-8 text-white shadow-pop-lg dark:border-cream">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-white/80">
            Currently on the arcade floor
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">{featured.name}</h2>
          <p className="mt-2 max-w-2xl opacity-90">{featured.description}</p>
        </div>
      )}
    </div>
  );
}