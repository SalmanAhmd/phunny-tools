import { TOOL_BY_ID } from "./registry";
import type { Achievement, SessionStats } from "./types";

/**
 * All achievements are pure entertainment. Nothing here reflects real skill,
 * effort, or productivity — that's rather the point.
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-click",
    title: "It Begins",
    description: "Click literally anything. Congratulations on the momentum.",
    icon: "🖱️",
    check: (s) => s.buttonsClicked >= 1,
  },
  {
    id: "click-100",
    title: "Master of Meaningless Clicks",
    description: "Click 100 times. Statistically, some of that was productive.",
    icon: "👆",
    check: (s) => s.buttonsClicked >= 100,
  },
  {
    id: "click-500",
    title: "Senior Vice President of Wasting Time",
    description: "Click 500 times. Corner office unlocked.",
    icon: "🏢",
    check: (s) => s.buttonsClicked >= 500,
  },
  {
    id: "hammer-1",
    title: "Certified Digital Hammer Operator",
    description: "Use HammerZip at least once. Your files forgive you.",
    icon: "🔨",
    check: (s) => s.toolsUsed.includes("hammer-zip"),
  },
  {
    id: "hammer-3",
    title: "Hammer Enthusiast, Grade III",
    description: "Return to HammerZip three separate times. Please stop.",
    icon: "🧨",
    check: (s) => s.toolsUsed.filter((t) => t === "hammer-zip").length >= 3,
  },
  {
    id: "crop",
    title: "The Last Pixel Survivor",
    description: "Crop an image down to basically nothing.",
    icon: "✂️",
    check: (s) => s.toolsUsed.includes("crop-it-like-its-hot"),
  },
  {
    id: "meeting",
    title: "Professional Meeting Attendee",
    description: "Generate a meeting about a meeting. This is how calendars die.",
    icon: "📅",
    check: (s) => s.toolsUsed.includes("unnecessary-meeting"),
  },
  {
    id: "games-1",
    title: "Junior Button Masher",
    description: "Play any mini game once.",
    icon: "🎮",
    check: (s) => Object.keys(s.gamesPlayed).length >= 1,
  },
  {
    id: "games-3",
    title: "Chief Executive of Nothing",
    description: "Play three different mini games.",
    icon: "👑",
    check: (s) => Object.keys(s.gamesPlayed).length >= 3,
  },
  {
    id: "bug-20",
    title: "Bug Exterminator (Emotional)",
    description: "Whack 20 bugs. Production is still on fire.",
    icon: "🐛",
    check: (s) => (s.highestScores["whack-a-bug"] ?? 0) >= 20,
  },
  {
    id: "smash",
    title: "Distinguished Keyboard Masher",
    description: "Finish a Keyboard Smash run. Your keyboard has filed a complaint.",
    icon: "⌨️",
    check: (s) => (s.gamesPlayed["keyboard-smash-championship"] ?? 0) >= 1,
  },
  {
    id: "time-5m",
    title: "Time Traveller (Allegedly)",
    description: "Spend 5 minutes doing absolutely nothing measurable.",
    icon: "⏳",
    check: (s) => s.secondsWasted >= 300,
  },
  {
    id: "time-20m",
    title: "The Last Pixel Survivor's Roommate",
    description: "Spend 20 minutes here. We are honoured. We are also concerned.",
    icon: "🕰️",
    check: (s) => s.secondsWasted >= 1200,
  },
  {
    id: "all-categories",
    title: "Head of Unnecessary Operations",
    description: "Try a tool from three different categories.",
    icon: "🧭",
    check: (s) =>
      new Set(
        s.toolsUsed.map((id) => TOOL_BY_ID.get(id)?.category).filter(Boolean),
      ).size >= 3,
  },
  {
    id: "download",
    title: "You Waited For This?",
    description: "Actually download one of our joke files.",
    icon: "📥",
    check: (s) => (s.gamesPlayed["impossible-download"] ?? 0) >= 1,
  },
];

export const ACHIEVEMENT_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export function nonsenseTitle(level: number): string {
  if (level >= 180) return "Supreme Chancellor of Absolute Nonsense";
  if (level >= 120) return "Chief Executive of Nothing";
  if (level >= 80) return "Senior Vice President of Wasting Time";
  if (level >= 50) return "Regional Manager of Mild Confusion";
  if (level >= 25) return "Junior Nonsense Engineer";
  if (level >= 10) return "Enthusiastic Intern";
  if (level >= 3) return "Curious Bystander";
  return "Innocent Civilian";
}

export function nonsenseLevel(stats: SessionStats): number {
  const games = Object.values(stats.gamesPlayed).reduce((a, b) => a + b, 0);
  return (
    stats.toolsUsed.length * 3 +
    games * 4 +
    Math.floor(stats.buttonsClicked / 8) +
    Math.floor(stats.secondsWasted / 15)
  );
}
