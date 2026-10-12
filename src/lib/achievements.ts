/**
 * All achievements are pure entertainment. Nothing here reflects real skill,
 * effort, or productivity — that's rather the point. They unlock loudly, are
 * stored locally, and mean absolutely nothing outside this tab.
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** Hidden on the dashboard until you unlock it. Mysterious, like everything else here. */
  secret?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-click", title: "It Begins", description: "Click literally anything. Congratulations on the momentum.", emoji: "🖱️" },
  { id: "click-50", title: "Fifty in the Bank", description: "Fifty clicks. Statistically, some of that was a button.", emoji: "👆" },
  { id: "click-250", title: "Regional Click Manager", description: "Two hundred and fifty clicks and counting. Impressive wrist.", emoji: "🩹" },
  { id: "click-1000", title: "Senior Vice President of Wasting Time", description: "One thousand clicks. The corner office has never been so pointless.", emoji: "🏢" },

  { id: "hammer", title: "Certified Digital Hammer Operator", description: "Strike a file with a blunt instrument. Your files forgive you.", emoji: "🔨" },
  { id: "hammer-10", title: "Hammer Enthusiast, Grade X", description: "Ten hammer swings. The file has stopped responding to compliments.", emoji: "🧨" },
  { id: "crop", title: "The Last Pixel Survivor", description: "Crop an image down to basically nothing.", emoji: "✂️" },
  { id: "pdf", title: "Format Dislocator", description: "Attempt a PDF conversion. The PDF survives. The formatting files a complaint.", emoji: "📄" },
  { id: "blur", title: "Certified Blur-Approved", description: "Make something unrecognisable. The pixels appreciate the privacy.", emoji: "🕵️" },
  { id: "screenshot", title: "Digital Detective", description: "Enhance a screenshot until it is a different blurry screenshot.", emoji: "🔍" },
  { id: "unzip", title: "Emotionally Extracted", description: "Unzip your feelings (and optionally a ZIP file).", emoji: "🗃️" },
  { id: "rename", title: "Chief Naming Officer", description: "Rename a file like an intern with too much confidence.", emoji: "🏷️" },
  { id: "font", title: "Typographically Adjusted", description: "Change the font of your problems. They remain problems.", emoji: "🔤" },
  { id: "meeting", title: "Professional Meeting Attendee", description: "Generate a meeting about a meeting. This is how calendars die.", emoji: "📅" },
  { id: "gym", title: "File Gains", description: "Take a file to the gym. It is emotionally stronger, same size.", emoji: "🏋️" },
  { id: "loading", title: "Professional Waiter", description: "Wait for a progress bar that is waiting for nothing.", emoji: "⏳" },
  { id: "polisher", title: "First Buff", description: "Polish a button that was manufactured clean.", emoji: "✨" },
  { id: "polish-100", title: "The Button Is Now Immaculate", description: "One hundred polish clicks. Still the same clean button.", emoji: "🧽" },
  { id: "plant", title: "Botanical Bystander", description: "Grow a digital plant by doing absolutely nothing.", emoji: "🪴" },
  { id: "timemachine", title: "Time Traveller (Allegedly)", description: "Recover the time you wasted. Results may vary. Result is zero.", emoji: "⏰" },
  { id: "jargonradio", title: "Voted Most Times Biweekly", description: "Tune in to a radio station that only broadcasts synergy.", emoji: "📻" },
  { id: "noisemachine", title: "Colourful Listener", description: "Enjoy white noise in entirely the wrong colours.", emoji: "🔊" },
  { id: "excuse", title: "Professional Excuse Artist", description: "Generate a legally formatted excuse for being late.", emoji: "🎭" },
  { id: "motivation", title: "Motivation Analyst", description: "Measure exactly how many minutes of focus you have left. It's two.", emoji: "🔋" },
  { id: "password", title: "Security Theatre Patron", description: "Submit a password to a dramatic, completely local analysis.", emoji: "🔐" },
  { id: "potato", title: "Potato Whisperer", description: "Ask a root vegetable for career advice. It is very confident.", emoji: "🥔" },
  { id: "meetingcost", title: "Chief Financial Destroyer", description: "Watch imaginary money evaporate in real time.", emoji: "💸" },
  { id: "excuseaction", title: "Procrastination Professional", description: "Convert 'tomorrow' into increasingly unlikely future dates.", emoji: "📆" },

  { id: "game-catch", title: "Productivity Catcher", description: "Catch productivity icons before they become snacks and meetings.", emoji: "🧲" },
  { id: "game-whack", title: "Bug Exterminator (Emotional)", description: "Complete a Whack-a-Bug session. Production is still on fire.", emoji: "🐛" },
  { id: "game-buttons", title: "Wrong Button Champion", description: "Make a series of terrible, highly rewarding button decisions.", emoji: "🚫" },
  { id: "game-download", title: "You Waited For This?", description: "Actually complete The Impossible Download. Somehow.", emoji: "📥" },
  { id: "game-keyboard", title: "Distinguished Keyboard Masher", description: "Finish a Keyboard Smash run. Your keyboard has filed a complaint.", emoji: "⌨️" },
  { id: "game-escape", title: "Escaped the Office", description: "Find all three things in the Office Escape Room. HR is notified.", emoji: "🚪" },

  { id: "time", title: "Time Traveller (Allegedly)", description: "Spend a whole minute here doing absolutely nothing measurable.", emoji: "⏳" },
  { id: "all-tools", title: "Head of Unnecessary Operations", description: "Visit at least 20 of our absolutely essential experiences.", emoji: "🧭" },
  { id: "surprise", title: "Blindfolded Navigator", description: "Let fate (a random number) choose your next useless tool.", emoji: "🎲", secret: true },
  { id: "easter-egg", title: "Certified Logo Clicker", description: "Click the micro-line seven times. Someone loves you.", emoji: "🥚", secret: true },
];

export const ACHIEVEMENT_MAP: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

export interface NonsenseRank {
  title: string;
  emoji: string;
}

const RANKS: Array<{ min: number; title: string; emoji: string }> = [
  { min: 250, title: "Supreme Chancellor of Absolute Nonsense", emoji: "🏆" },
  { min: 160, title: "Chief Executive of Nothing", emoji: "👑" },
  { min: 100, title: "Senior Vice President of Wasting Time", emoji: "💼" },
  { min: 60, title: "Regional Manager of Mild Confusion", emoji: "🗂️" },
  { min: 30, title: "Junior Nonsense Engineer", emoji: "🛠️" },
  { min: 12, title: "Enthusiastic Intern", emoji: "🧢" },
  { min: 3, title: "Curious Bystander", emoji: "👀" },
  { min: 0, title: "Innocent Civilian", emoji: "🤷" },
];

/** Map a nonsense level to a completely unserious job title. */
export function rankFor(level: number): NonsenseRank {
  const rank = RANKS.find((r) => level >= r.min) ?? RANKS[RANKS.length - 1];
  return { title: rank.title, emoji: rank.emoji };
}