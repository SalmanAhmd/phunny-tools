import { pick } from "./random";

const JARGON: Record<string, string> = {
  "i think": "I am aligned to the view",
  "i want": "The business requirement is",
  "fix": "remediate at the appropriate cadence",
  "bug": "unplanned feature interaction",
  "problem": "opportunity to realign",
  "mistake": "learning moment",
  "slow": "experiencing latency in the value stream",
  "broken": "not operating within expected parameters",
  "meeting": "cross-functional alignment session",
  "talk": "sync",
  "talk to": "sync with",
  "ask": "socialise",
  "tell": "cascade",
  "use": "leverage",
  "help": "enable",
  "more": "additional incremental",
  "try": "run a proof of concept on",
  "later": "in a future planning cycle",
  "tomorrow": "next business opportunity window",
  "now": "at pace",
  "quickly": "with velocity",
  "email": "asynchronous comms",
  "cheap": "capital-efficient",
  "expensive": "investment-grade",
  "staff": "headcount",
  "people": "resources",
  "fire someone": "rightsize the team",
  "give up": "deprioritise",
  "cancel": "sunset",
  "yes": "aligned",
  "no": "not currently on the roadmap",
  "i don't know": "let me circle back on that",
  "we need to": "there is a business imperative to",
  "hello": "circling round to align",
  "sorry": "noting the delay and taking ownership",
};

const SUFFIXES = [
  " Let's take this offline.",
  " I'll set up a quick sync.",
  " Looping in the wider team.",
  " Flagging for visibility.",
  " Parking that for now.",
  " Let's double-click on that.",
  " Circling back shortly.",
];

export function corporateize(text: string): string {
  let output = text;
  for (const [plain, jargon] of Object.entries(JARGON)) {
    const pattern = new RegExp(`\\b${plain}\\b`, "gi");
    output = output.replace(pattern, (match) =>
      match[0] === match[0].toUpperCase() && match.length > 1
        ? jargon.charAt(0).toUpperCase() + jargon.slice(1)
        : jargon,
    );
  }
  // Sentences get a closing idiom, because a plain full stop is not corporate enough.
  output = output
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => (sentence.trim().length > 24 ? sentence.trim() + pick(SUFFIXES) : sentence))
    .join(" ");
  return output;
}

const TITLES = [
  "Senior Alignment Facilitator",
  "Director of Taking This Offline",
  "Head of Circling Back",
  "VP of Double-Clicking On That",
  "Chief Visibility Officer",
  "Regional Owner of the Loop",
];

export function corporateTitle(): string {
  return pick(TITLES);
}
