import type { LucideIcon } from "lucide-react";

export type ToolCategory =
  | "File Destruction & Management"
  | "Image Crimes"
  | "Office Productivity Disasters"
  | "Audio Nonsense"
  | "Time-Wasting Machines"
  | "Mini Games"
  | "Randomly Useless Utilities";

export type Accent = "orange" | "purple" | "yellow" | "lime" | "pink" | "cyan";

export interface ToolMeta {
  /** Stable id, also used in the URL. */
  id: string;
  name: string;
  /** Short one-liner shown on the card. */
  tagline: string;
  /** Longer description used on the tool page. */
  description: string;
  category: ToolCategory;
  Icon: LucideIcon;
  accent: Accent;
  /** Rendered as a playful badge on the card. */
  badge?: string;
  /** Marks the featured/priority experiences on the home page. */
  featured?: boolean;
  kind: "tool" | "game" | "utility";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Returns true when the achievement should be unlocked. */
  check: (stats: SessionStats, ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  /** e.g. "hammer_zip", "whack_a_bug" */
  lastEvent?: string;
  lastValue?: number;
}

export interface SessionStats {
  toolsUsed: string[];
  gamesPlayed: Record<string, number>;
  buttonsClicked: number;
  secondsWasted: number;
  achievements: string[];
  highestScores: Record<string, number>;
  nonsenseLevel: number;
}

export interface ToastMessage {
  id: number;
  title: string;
  body?: string;
  tone: "info" | "success" | "danger" | "chaos";
  icon?: string;
}

export type ProgressLine = string;
