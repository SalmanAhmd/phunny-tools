import {
  Banknote,
  BatteryLow,
  BellRing,
  Bug,
  CalendarClock,
  CalendarPlus,
  Crop,
  DoorOpen,
  Download,
  Dumbbell,
  EyeOff,
  FileText,
  FolderOpen,
  Hammer,
  Headphones,
  Hourglass,
  KeyRound,
  Keyboard,
  Loader,
  MessageCircleWarning,
  MousePointerClick,
  Bot,
  ScanSearch,
  Sparkles,
  Sprout,
  Tags,
  Target,
  Type,
} from "lucide-react";
import type { ToolCategory, ToolMeta } from "./types";

export const CATEGORIES: ToolCategory[] = [
  "File Destruction & Management",
  "Image Crimes",
  "Office Productivity Disasters",
  "Audio Nonsense",
  "Time-Wasting Machines",
  "Mini Games",
  "Randomly Useless Utilities",
];

export const CATEGORY_BLURB: Record<ToolCategory, string> = {
  "File Destruction & Management": "Handling your precious files with the care of a forklift.",
  "Image Crimes": "Visual artefacts we are legally required to call 'art'.",
  "Office Productivity Disasters": "Turning small tasks into quarterly planning cycles.",
  "Audio Nonsense": "Sounds, generated live, that nobody asked for.",
  "Time-Wasting Machines": "Devices engineered to consume minutes and return nothing.",
  "Mini Games": "Playable. Competitive. Entirely without purpose.",
  "Randomly Useless Utilities": "Micro-tools for micro-problems you did not have.",
};

export const TOOLS: ToolMeta[] = [
  /* ---------------------------------------------------------------- files */
  {
    id: "hammer-zip",
    name: "HammerZip",
    tagline: "Reduce your file size using advanced medieval technology.",
    description:
      "The world's worst file compressor. Upload a file, then hit it repeatedly with a cartoon hammer until the numbers stop changing. (They will not change.)",
    category: "File Destruction & Management",
    Icon: Hammer,
    accent: "orange",
    badge: "Flagship",
    featured: true,
    kind: "tool",
  },
  {
    id: "file-gym",
    name: "File Weightlifting Gym",
    tagline: "Your files are weak. Make them stronger (emotionally).",
    description:
      "Send your file through a cartoon gym: dumbbells, push-ups and a digital protein shake. The file size will not change. The confidence might.",
    category: "File Destruction & Management",
    Icon: Dumbbell,
    accent: "lime",
    kind: "tool",
  },
  {
    id: "unzip-your-feelings",
    name: "Unzip Your Feelings",
    tagline: "Extract files and unresolved emotions.",
    description:
      "Upload a ZIP and we will list the real contents, then emotionally annotate every one of them. We read the archive. We do not judge. (We judge.)",
    category: "File Destruction & Management",
    Icon: FolderOpen,
    accent: "purple",
    kind: "tool",
  },
  {
    id: "the-renamer",
    name: "The World-Famous File Renamer",
    tagline: "Rename every file like an unqualified intern.",
    description:
      "Choose a personality. We will propose a new name. You may download a renamed copy — your original stays exactly where it is, untouched.",
    category: "File Destruction & Management",
    Icon: Tags,
    accent: "cyan",
    kind: "tool",
  },

  /* --------------------------------------------------------------- images */
  {
    id: "crop-it-like-its-hot",
    name: "Crop It Like It's Hot",
    tagline: "Professional image cropping by someone who has never used Photoshop.",
    description:
      "A genuinely working cropper wearing an extremely unprofessional hat. The comedy is fake; the crop is real; the download works.",
    category: "Image Crimes",
    Icon: Crop,
    accent: "pink",
    badge: "Featured",
    featured: true,
    kind: "tool",
  },
  {
    id: "professional-blur",
    name: "Professional Blur Department",
    tagline: "We make things harder to recognize.",
    description:
      "Real Gaussian blur, applied through an unnecessarily bureaucratic interface. Perfect for witness protection, or hiding your mistakes.",
    category: "Image Crimes",
    Icon: EyeOff,
    accent: "purple",
    kind: "tool",
  },
  {
    id: "screenshot-enhancer",
    name: "The Screenshot Enhancer",
    tagline: "Enhance this blurry screenshot until it becomes a different blurry screenshot.",
    description:
      "A detective-grade interface that zooms, sharpens, and ultimately admits the truth. Real resizing, honest labelling, dramatic magnifying glass.",
    category: "Image Crimes",
    Icon: ScanSearch,
    accent: "cyan",
    kind: "tool",
  },

  /* -------------------------------------------------------------- office */
  {
    id: "pdf-to-whatever",
    name: "PDF to Whatever",
    tagline: "Convert your important documents into something less important.",
    description:
      "We extract the real text from your PDF, then run it through a machine of dubious intent. No format conversion occurs. Vibes are converted.",
    category: "Office Productivity Disasters",
    Icon: FileText,
    accent: "orange",
    kind: "tool",
  },
  {
    id: "unnecessary-meeting",
    name: "The Unnecessary Meeting Generator",
    tagline: "Turn a simple decision into a calendar crisis.",
    description:
      "Give us a question. We will give you a 12-step framework, five stakeholders and three follow-ups. Exportable, because it must be documented.",
    category: "Office Productivity Disasters",
    Icon: CalendarClock,
    accent: "yellow",
    badge: "Fan favourite",
    featured: true,
    kind: "tool",
  },
  {
    id: "fontify-your-problems",
    name: "Fontify Your Problems",
    tagline: "Your problems aren't serious enough. Change their font.",
    description:
      "Type anything and watch it become a legal notice, a crime thriller, or a birthday card. Includes a corporate jargon translator.",
    category: "Office Productivity Disasters",
    Icon: Type,
    accent: "lime",
    kind: "tool",
  },

  /* --------------------------------------------------------------- audio */
  {
    id: "hold-music-generator",
    name: "Hold Music Department",
    tagline: "Your call is important to us. Please remain on the line forever.",
    description:
      "Generates an endless, slightly depressing hold-music loop using the Web Audio API. Adjustable jazziness. Ungodly sustained.",
    category: "Audio Nonsense",
    Icon: Headphones,
    accent: "purple",
    kind: "tool",
  },
  {
    id: "notification-symphony",
    name: "Notification Symphony",
    tagline: "An orchestra made entirely of pings, dings and calendar invites.",
    description:
      "Compose a tiny symphony out of office notification sounds. Then realise you cannot mute real life.",
    category: "Audio Nonsense",
    Icon: BellRing,
    accent: "yellow",
    kind: "tool",
  },

  /* ---------------------------------------------------------------- time */
  {
    id: "loading-bar-simulator",
    name: "Loading Bar Simulator",
    tagline: "Experience the thrill of waiting for absolutely nothing.",
    description:
      "A faithful simulation of every progress bar you have ever stared at. Includes management approval delays and a satisfying non-conclusion.",
    category: "Time-Wasting Machines",
    Icon: Loader,
    accent: "purple",
    badge: "Featured",
    featured: true,
    kind: "tool",
  },
  {
    id: "the-time-machine",
    name: "The Time Machine",
    tagline: "Recover the time you just wasted. Results may vary.",
    description:
      "Press a lever. Watch a clock spin backwards. Receive a full refund of zero seconds. Now with session-based time-travel medals.",
    category: "Time-Wasting Machines",
    Icon: Hourglass,
    accent: "orange",
    kind: "tool",
  },

  /* --------------------------------------------------------------- games */
  {
    id: "catch-the-productivity",
    name: "Catch the Productivity",
    tagline: "Catch productivity. Receive distractions. Thirty seconds of chaos.",
    description:
      "A tiny worker. Falling icons. A 30-second timer. Unfortunately, the icons keep turning into coffee and memes mid-air.",
    category: "Mini Games",
    Icon: Target,
    accent: "lime",
    kind: "game",
  },
  {
    id: "whack-a-bug",
    name: "Whack-a-Bug",
    tagline: "Debugging, as nature intended: physically.",
    description:
      "Bugs pop up. Whack them. Avoid the giant FEATURE REQUEST. Difficulty escalates. Production remains on fire.",
    category: "Mini Games",
    Icon: Bug,
    accent: "orange",
    badge: "Playable now",
    featured: true,
    kind: "game",
  },
  {
    id: "impossible-download",
    name: "The Impossible Download",
    tagline: "It reaches 99%. It always reaches 99%.",
    description:
      "A download that starts strong, collapses, recovers, then gets stuck emotionally at 99%. The payoff is exactly as advertised.",
    category: "Mini Games",
    Icon: Download,
    accent: "cyan",
    kind: "game",
  },
  {
    id: "click-the-wrong-button",
    name: "Click the Wrong Button",
    tagline: "Every option is a mistake. Choose confidently.",
    description:
      "Buttons that flee, duplicate, swap labels and congratulate you for failure. There is a reset button. It is also a mistake.",
    category: "Mini Games",
    Icon: MousePointerClick,
    accent: "pink",
    badge: "Featured",
    featured: true,
    kind: "game",
  },
  {
    id: "keyboard-smash-championship",
    name: "Keyboard Smash Championship",
    tagline: "Ten seconds. Random letters. Professional chaos rating.",
    description:
      "Smash keys as fast as you can. We measure your throughput, then award you a title you cannot put on LinkedIn.",
    category: "Mini Games",
    Icon: Keyboard,
    accent: "yellow",
    kind: "game",
  },
  {
    id: "office-escape-room",
    name: "Office Escape Room",
    tagline: "Find the meeting link. Escape the approval chain. Get home.",
    description:
      "A small puzzle adventure across five absurd office obstacles. Hints included. Dignity not included.",
    category: "Mini Games",
    Icon: DoorOpen,
    accent: "purple",
    kind: "game",
  },

  /* ----------------------------------------------------------- utilities */
  {
    id: "excuse-generator",
    name: "Excuse Generator",
    tagline: "For when the truth is not doing enough heavy lifting.",
    description: "Endless, escalating, mostly plausible excuses for being late.",
    category: "Randomly Useless Utilities",
    Icon: MessageCircleWarning,
    accent: "orange",
    kind: "utility",
  },
  {
    id: "motivation-calculator",
    name: "Motivation Calculator",
    tagline: "How long until you check your phone? Let's find out.",
    description: "Enter your motivation. Receive a precise countdown to distraction.",
    category: "Randomly Useless Utilities",
    Icon: BatteryLow,
    accent: "pink",
    kind: "utility",
  },
  {
    id: "password-procrastinator",
    name: "Password Procrastinator",
    tagline: "Dramatic security theatre for a password nobody will use.",
    description:
      "Type a sample password. Receive a stern analysis. Nothing is stored, transmitted, or remembered — by us or by it.",
    category: "Randomly Useless Utilities",
    Icon: KeyRound,
    accent: "purple",
    kind: "utility",
  },
  {
    id: "button-polisher",
    name: "Button Polisher",
    tagline: "Polish the button. The button was already clean.",
    description: "A tactile, deeply unnecessary cleaning ritual for a button.",
    category: "Randomly Useless Utilities",
    Icon: Sparkles,
    accent: "cyan",
    kind: "utility",
  },
  {
    id: "ai-powered-potato",
    name: "AI-Powered Potato",
    tagline: "Extremely confident answers from a tuber.",
    description:
      "Ask a question. Receive wisdom from a potato. This is parody, not artificial intelligence, though the confidence is genuine.",
    category: "Randomly Useless Utilities",
    Icon: Bot,
    accent: "yellow",
    kind: "utility",
  },
  {
    id: "meeting-cost-calculator",
    name: "Meeting Cost Calculator",
    tagline: "Watch money evaporate in real time.",
    description: "Enter attendees and duration. Behold the imaginary invoice.",
    category: "Randomly Useless Utilities",
    Icon: Banknote,
    accent: "lime",
    kind: "utility",
  },
  {
    id: "excuse-to-action",
    name: "The Excuse-to-Action Converter",
    tagline: "\"I'll do it tomorrow\" → date pending review.",
    description: "Converts vague promises into elaborately scheduled non-events.",
    category: "Randomly Useless Utilities",
    Icon: CalendarPlus,
    accent: "orange",
    kind: "utility",
  },
  {
    id: "digital-plant",
    name: "Digital Plant",
    tagline: "Grows when you do nothing. Which is your speciality.",
    description: "A plant that thrives on your inattention and comments on your return.",
    category: "Randomly Useless Utilities",
    Icon: Sprout,
    accent: "lime",
    kind: "utility",
  },
];

export const TOOL_BY_ID = new Map(TOOLS.map((t) => [t.id, t]));

export function toolsByCategory(category: ToolCategory): ToolMeta[] {
  return TOOLS.filter((t) => t.category === category);
}

export const NOT_FOUND_JOKES = [
  "We looked everywhere. Even behind the recycling bin.",
  "That tool has been deprecated, restored, and deprecated again.",
  "It existed. Then a meeting about it happened.",
];
