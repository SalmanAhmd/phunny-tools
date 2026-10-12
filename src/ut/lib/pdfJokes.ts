import { corporateize } from "./jargon";
import { pick, randInt } from "./random";

export type ConversionId =
  | "emotional"
  | "invisible"
  | "jargon"
  | "meeting"
  | "certificate";

export interface ConversionDef {
  id: ConversionId;
  name: string;
  description: string;
  emoji: string;
}

export const CONVERSIONS: ConversionDef[] = [
  {
    id: "emotional",
    name: "PDF to Emotional Damage",
    description: "Every sentence is made quietly devastating. No facts survive.",
    emoji: "💔",
  },
  {
    id: "invisible",
    name: "PDF to Invisible Ink",
    description: "The content is still there. You just cannot see it. Or read it.",
    emoji: "🕵️",
  },
  {
    id: "jargon",
    name: "PDF to Corporate Jargon",
    description: "Perfectly clear writing becomes aligned, socialised and parked.",
    emoji: "💼",
  },
  {
    id: "meeting",
    name: "PDF to a 47-page meeting about the PDF",
    description: "Nobody reads the document. Everybody meets about it instead.",
    emoji: "📅",
  },
  {
    id: "certificate",
    name: "PDF to a suspicious-looking certificate",
    description: "Your document is now an award for something nobody can verify.",
    emoji: "🏅",
  },
];

const SAD_PREFIXES = [
  "It was then that I understood…",
  "Nobody warned me that…",
  "I keep returning to the part where…",
  "There is a version of this where…",
  "And yet, quietly,",
  "Somewhere between page one and page two,",
];

const SAD_SUFFIXES = [
  " and I have not been the same since.",
  ". The printer knew.",
  "…but the deadline did not care.",
  ". I saved it anyway. Twice.",
  "…and the meeting was scheduled regardless.",
];

export function toEmotionalDamage(text: string): string {
  const sentences = splitSentences(text);
  const lines = sentences.slice(0, 40).map((s) => {
    const lower = s.charAt(0).toLowerCase() + s.slice(1);
    return `${pick(SAD_PREFIXES)} ${lower.replace(/[.!?]+$/, "")}${pick(SAD_SUFFIXES)}`;
  });
  return ["— A DOCUMENT, IN ITS OWN WORDS —", "", ...lines].join("\n\n");
}

export function toInvisibleInk(text: string): string {
  const ink = text.replace(/\S/g, () => (Math.random() < 0.85 ? "█" : "░"));
  const blocks = text.replace(/[A-Za-z0-9 ]/g, "█");
  return [
    "— INVISIBLE INK EDITION —",
    "",
    "The following content has been redacted for no legal reason whatsoever.",
    "It remains technically present. You simply may not perceive it.",
    "",
    blocks.slice(0, 2200),
    "",
    "[ decoding impossible — pixels removed at the request of nobody ]",
    "",
    "Decorative residue of the original character data:",
    ink.slice(0, 120),
  ].join("\n");
}

export function toJargon(text: string): string {
  return [
    "— ALIGNED EDITION —",
    "",
    corporateize(text.slice(0, 2400) || "This document contained no extractable text."),
    "",
    "Next steps: socialise, cascade, circle back.",
  ].join("\n");
}

export function to47PageMeeting(fileName: string, pageCount: number): string {
  const agenda = Array.from({ length: 47 }, (_, i) => {
    const n = i + 1;
    return `Page ${String(n).padStart(2, "0")}: Discussion of the discussion about paragraph ${
      randInt(1, 12)
    } of "${fileName}" (page ${randInt(1, Math.max(1, pageCount))}) — owner: TBC.`;
  });
  return [
    "— 47-PAGE MEETING TRANSCRIPT —",
    `Subject: the document known as "${fileName}" (${pageCount} pages, allegedly).`,
    "Attendees: everyone. Outcome: none.",
    "",
    ...agenda,
    "",
    `Conclusion: a follow-up meeting has been scheduled to discuss pages ${randInt(
      40,
      46,
    )} and ${randInt(40, 46)}, which nobody reached.`,
  ].join("\n");
}

const AWARD_NAMES = [
  "Certificate of Outstanding Document Persistence",
  "Diploma in Sustained File Existence",
  "Accreditation of Notable Having Been Attached To An Email",
  "Commendation for Remaining Unopened Since March",
];

export function toCertificate(fileName: string, pageCount: number): string {
  const ref = `UT-${randInt(10000, 99999)}-${String.fromCharCode(65 + randInt(0, 25))}`;
  return [
    "╔══════════════════════════════════════════════════════╗",
    "║          PHUNNY TOOLS™ CERTIFICATE OF MERIT          ║",
    "╚══════════════════════════════════════════════════════╝",
    "",
    `This is to certify that the document known as "${fileName}"`,
    `containing ${pageCount} page(s) of entirely unverified substance,`,
    "has been inspected, admired, and otherwise not read.",
    "",
    `AWARD: ${pick(AWARD_NAMES)}`,
    `REFERENCE: ${ref}`,
    `ISSUED: ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}`,
    "",
    "Valid in all jurisdictions that do not exist.",
    "Signed: ______________________ (illegible by design)",
  ].join("\n");
}

export function convert(
  id: ConversionId,
  text: string,
  fileName: string,
  pageCount: number,
): string {
  switch (id) {
    case "emotional":
      return toEmotionalDamage(text);
    case "invisible":
      return toInvisibleInk(text);
    case "jargon":
      return toJargon(text);
    case "meeting":
      return to47PageMeeting(fileName, pageCount);
    case "certificate":
      return toCertificate(fileName, pageCount);
  }
}

function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return ["(this document said nothing, and said it loudly)"];
  return cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.length > 3);
}
