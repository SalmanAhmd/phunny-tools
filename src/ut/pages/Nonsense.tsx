import { RotateCcw, Trash2 } from "lucide-react";
import { ACHIEVEMENTS, nonsenseTitle } from "../lib/achievements";
import { TOOL_BY_ID } from "../lib/registry";
import { useRecentTools } from "../lib/recent";
import { useStats } from "../lib/stats";
import { useUI } from "../lib/ui";
import { sfx } from "../lib/sound";
import { SectionTitle, StatPill, Callout, EmptyState } from "../components/bits";
import { Btn } from "../components/Btn";
import { formatDuration } from "../lib/format";
import { Link } from "react-router-dom";

export default function Nonsense() {
  const { stats, level, resetStats } = useStats();
  const { pushToast } = useUI();
  const { recent, clear } = useRecentTools();

  const gamesPlayed = Object.values(stats.gamesPlayed).reduce((a, b) => a + b, 0);
  const recentTools = recent.map((id) => TOOL_BY_ID.get(id)).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionTitle
        kicker="Your personal report"
        title="My Nonsense"
        subtitle="A complete, wholly fabricated dossier of the time you spent here. Enjoy."
      />

      {/* Level */}
      <div className="mt-8 overflow-hidden rounded-3xl border-2 border-ink bg-ink text-cream shadow-pop-lg dark:border-cream dark:bg-black">
        <div className="grid gap-2 p-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-zing-lime">
              Level {level}
            </p>
            <h2 className="mt-1 font-display text-4xl font-bold">{nonsenseTitle(level)}</h2>
            <p className="mt-2 max-w-xl text-sm text-cream/70">
              This rank was earned through sustained, verifiable inactivity. Promotion requires
              exactly nothing else.
            </p>
          </div>
          <span className="text-6xl" aria-hidden>
            🏅
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatPill label="Seconds wasted" value={formatDuration(stats.secondsWasted)} accent="bg-zing-yellow" />
        <StatPill label="Buttons clicked" value={stats.buttonsClicked} accent="bg-zing-purple text-white" />
        <StatPill label="Tools visited" value={stats.toolsUsed.length} accent="bg-zing-cyan" />
        <StatPill label="Games played" value={gamesPlayed} accent="bg-zing-pink text-white" />
      </div>

      {/* Achievements */}
      <div className="mt-12">
        <SectionTitle
          kicker="Trophies"
          title="Achievements"
          subtitle={`${stats.achievements.length} of ${ACHIEVEMENTS.length} imaginary milestones unlocked.`}
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = stats.achievements.includes(a.id);
            return (
              <div
                key={a.id}
                className={`flex items-start gap-3 rounded-2xl border-2 border-ink p-4 dark:border-cream ${
                  unlocked ? "bg-zing-lime text-ink" : "bg-white opacity-55 grayscale dark:bg-ink-soft"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {unlocked ? a.icon : "🔒"}
                </span>
                <div>
                  <p className="font-display font-bold">{a.title}</p>
                  <p className="mt-0.5 text-xs opacity-80">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent */}
      <div className="mt-12">
        <SectionTitle
          kicker="You clearly liked these"
          title="Recently visited"
          subtitle="Or you were lost. Both are achievements here."
        />
        <div className="mt-6 flex flex-wrap gap-2">
          {recentTools.length === 0 ? (
            <EmptyState
              icon="🧭"
              title="Nothing here yet"
              body="Visit a tool or play a game and it will show up here, glowing with quiet pride."
              action={
                <Link to="/tools" className="btn btn-pop btn-purple">
                  Go explore
                </Link>
              }
            />
          ) : (
            recentTools.map((tool) =>
              tool ? (
                <Link
                  key={tool.id}
                  to={tool.kind === "game" ? `/game/${tool.id}` : `/tool/${tool.id}`}
                  className="chip bg-white py-2 text-sm shadow-pop-sm transition-transform hover:-translate-y-0.5 dark:bg-ink-soft"
                >
                  {tool.name}
                </Link>
              ) : null,
            )
          )}
        </div>
        {recentTools.length > 0 && (
          <div className="mt-4">
            <Btn
              variant="ghost"
              size="sm"
              sound="click"
              onClick={() => {
                clear();
                sfx("pop");
              }}
            >
              <Trash2 size={15} /> Clear history
            </Btn>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="mt-12">
        <Callout tone="danger" title="The reset button. Obviously.">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Obliterate every stat, achievement and high score you have painstakingly earned by
              doing nothing.
            </span>
            <Btn
              variant="danger"
              sound="smash"
              onClick={() => {
                resetStats();
                pushToast({
                  title: "Progress demolished",
                  body: "Back to zero. Beautiful and meaningless.",
                  tone: "chaos",
                  icon: "🧨",
                });
              }}
            >
              <RotateCcw size={16} /> Reset everything
            </Btn>
          </div>
        </Callout>
      </div>
    </div>
  );
}