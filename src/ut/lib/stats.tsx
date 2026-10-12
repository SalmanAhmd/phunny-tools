import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ACHIEVEMENTS, nonsenseLevel } from "./achievements";
import { loadJSON, saveJSON } from "./storage";
import { useUI } from "./ui";
import type { SessionStats } from "./types";

const EMPTY: SessionStats = {
  toolsUsed: [],
  gamesPlayed: {},
  buttonsClicked: 0,
  secondsWasted: 0,
  achievements: [],
  highestScores: {},
  nonsenseLevel: 0,
};

interface StatsContextValue {
  stats: SessionStats;
  level: number;
  recordButtonClick: (count?: number) => void;
  recordToolUse: (id: string) => void;
  recordGamePlayed: (id: string, score?: number) => void;
  unlockAchievement: (id: string) => void;
  resetStats: () => void;
}

const StatsContext = createContext<StatsContextValue | null>(null);

export function useStats(): StatsContextValue {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error("useStats must be used inside <StatsProvider>");
  return ctx;
}

export function StatsProvider({ children }: { children: ReactNode }) {
  const { pushToast, fireConfetti, reducedMotion } = useUI();
  const [stats, setStats] = useState<SessionStats>(() => ({
    ...EMPTY,
    ...loadJSON<Partial<SessionStats>>("stats", {}),
  }));
  const statsRef = useRef(stats);
  statsRef.current = stats;

  // Persist whenever stats change.
  useEffect(() => {
    saveJSON("stats", stats);
  }, [stats]);

  // The "time spent doing nothing" counter. Pauses when the tab is hidden.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setStats((s) => ({ ...s, secondsWasted: s.secondsWasted + 1 }));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Count every meaningful (and meaningless) click anywhere on the site.
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("button, a, [role='button'], input[type='button'], input[type='submit']")) {
        setStats((s) => ({ ...s, buttonsClicked: s.buttonsClicked + 1 }));
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const announce = useCallback(
    (titles: string[]) => {
      titles.forEach((title, i) => {
        window.setTimeout(() => {
          pushToast({
            title: "Achievement unlocked",
            body: title,
            tone: "success",
            icon: "🏆",
          });
        }, i * 500);
      });
      if (titles.length && !reducedMotion) fireConfetti();
    },
    [pushToast, fireConfetti, reducedMotion],
  );

  // Evaluate achievements after every stats change.
  useEffect(() => {
    const already = new Set(stats.achievements);
    const newlyUnlocked = ACHIEVEMENTS.filter(
      (a) => !already.has(a.id) && a.check(stats, {}),
    );
    if (newlyUnlocked.length) {
      setStats((s) => ({
        ...s,
        achievements: [...s.achievements, ...newlyUnlocked.map((a) => a.id)],
      }));
      announce(newlyUnlocked.map((a) => `${a.icon} ${a.title}`));
    }
  }, [stats, announce]);

  const recordButtonClick = useCallback((count = 1) => {
    setStats((s) => ({ ...s, buttonsClicked: s.buttonsClicked + count }));
  }, []);

  const recordToolUse = useCallback((id: string) => {
    setStats((s) => ({ ...s, toolsUsed: [...s.toolsUsed, id] }));
  }, []);

  const recordGamePlayed = useCallback((id: string, score?: number) => {
    setStats((s) => ({
      ...s,
      gamesPlayed: { ...s.gamesPlayed, [id]: (s.gamesPlayed[id] ?? 0) + 1 },
      highestScores:
        score === undefined
          ? s.highestScores
          : { ...s.highestScores, [id]: Math.max(s.highestScores[id] ?? 0, score) },
    }));
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setStats((s) =>
      s.achievements.includes(id) ? s : { ...s, achievements: [...s.achievements, id] },
    );
  }, []);

  const resetStats = useCallback(() => {
    setStats({ ...EMPTY });
    pushToast({
      title: "Progress obliterated",
      body: "You are, once again, nothing. Beautiful.",
      tone: "danger",
      icon: "🧹",
    });
  }, [pushToast]);

  const level = useMemo(() => nonsenseLevel(stats), [stats]);

  const value = useMemo<StatsContextValue>(
    () => ({
      stats,
      level,
      recordButtonClick,
      recordToolUse,
      recordGamePlayed,
      unlockAchievement,
      resetStats,
    }),
    [stats, level, recordButtonClick, recordToolUse, recordGamePlayed, unlockAchievement, resetStats],
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}
