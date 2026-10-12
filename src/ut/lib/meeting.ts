import { pick, pickMany, randInt, shuffle } from "./random";

export interface Stakeholder {
  name: string;
  role: string;
  concern: string;
  availability: string;
}

export interface MeetingReport {
  topic: string;
  generatedAt: Date;
  executiveSummary: string;
  framework: string[];
  agenda: { time: string; item: string; owner: string }[];
  stakeholders: Stakeholder[];
  followUps: { title: string; date: Date; duration: string; purpose: string }[];
  risks: { risk: string; likelihood: string; impact: string; mitigation: string }[];
  verdict: string;
  estimatedCost: string;
  actionItems: string[];
}

const FIRST_NAMES = [
  "Priya", "Marcus", "Dana", "Oluwaseun", "Kenji", "Beatriz", "Hassan", "Ingrid",
  "Tobias", "Amara", "Ravi", "Sofia", "Leon", "Nadia", "Gustav", "Chloe",
];

const ROLES = [
  "Head of Strategic Alignment",
  "Director of Cross-Functional Synergy",
  "Principal Stakeholder Liaison",
  "VP of Pre-Decision Alignment",
  "Chief Retrospective Officer",
  "Senior Manager of Managerial Overlap",
  "Lead of the Follow-Up Follow-Up",
  "Executive Sponsor (Part-Time)",
];

const CONCERNS = [
  "wants to be consulted early but is unavailable until next quarter",
  "has strong opinions about the phrasing of the title",
  "believes this should have been an email",
  "would like the decision deferred to a committee",
  "is worried about the precedent this sets for other decisions",
  "has a conflict and will send a delegate who has no context",
  "requires a pre-read at least four business days in advance",
  "wants a dashboard, and has offered to build the dashboard",
];

const AVAILABILITY = [
  "Tuesdays 8:00–8:15am only",
  "flexible, in theory",
  "highly available but not for this",
  "off-site until further notice",
  "double-booked but will 'join for the first bit'",
  "on a focus block for the next eleven weeks",
];

const FRAMEWORK_STEPS = [
  "1. Acknowledge that a decision is, hypothetically, required.",
  "2. Restate the decision in three different tones of voice.",
  "3. Compile a pre-read that nobody will open.",
  "4. Circulate the pre-read with the subject line 'Quick one!'.",
  "5. Schedule the alignment meeting to schedule the decision meeting.",
  "6. Identify every person who could theoretically be affected.",
  "7. Add eleven more people, just in case.",
  "8. Run a silent vote using a tool that requires a paid licence.",
  "9. Disagree publicly about the tool, not the decision.",
  "10. Escalate to leadership, who also cannot attend.",
  "11. Form a working group to revisit step 3.",
  "12. Announce that a decision will be made 'shortly'.",
];

const AGENDA_ITEMS = [
  "Welcome & framing remarks (repeated from last time)",
  "Review of previous meeting's outstanding action items (none completed)",
  "Open floor: general unease",
  "Presentation of three options, all identical",
  "Extended debate about option naming conventions",
  "Risk, risk-adjacent risk, and vibes",
  "Stakeholder alignment checkpoint",
  "Parking lot (which will never be unparked)",
  "Any other business (there is always other business)",
  "Confirmation of date for the follow-up",
];

const FOLLOW_UP_TITLES = [
  "Pre-Decision Alignment (Part II)",
  "Follow-Up to the Follow-Up",
  "Decision Retrospective (pre-decision edition)",
  "Deep Dive: Why We Are Still Here",
  "Alignment Sync — Alignment Sync",
];

const FOLLOW_UP_PURPOSES = [
  "to confirm the outcome of the meeting that confirmed nothing",
  "to escalate the unresolved items to people with less time",
  "to revisit an option that was already ruled out",
  "to present findings from a survey nobody completed",
  "to formally close the loop, then open it again immediately",
];

const RISKS = [
  { risk: "Wrong option selected", likelihood: "Moderate", impact: "Catastrophic", mitigation: "Schedule a meeting" },
  { risk: "Correct option selected too quickly", likelihood: "Low", impact: "Suspicious", mitigation: "Question the process" },
  { risk: "Nobody attends the alignment meeting", likelihood: "High", impact: "Severe", mitigation: "Book a second alignment meeting" },
  { risk: "Decision is made without the correct 14 stakeholders", likelihood: "Moderate", impact: "Political", mitigation: "Add 4 more stakeholders" },
  { risk: "Decision accidentally becomes final", likelihood: "Very low", impact: "Unprecedented", mitigation: "Reopen it" },
  { risk: "Someone suggests using a spreadsheet", likelihood: "Elevated", impact: "Dignified", mitigation: "Politely decline" },
];

const ACTION_ITEMS = [
  "Everyone: review the pre-read you will not read.",
  "Someone: own this, but not formally.",
  "The group: agree to disagree, then agree to meet again.",
  "Communications: draft a message that commits to nothing.",
  "Leadership: express enthusiasm without approving anything.",
  "Someone else: prepare the update for the update.",
];

export function generateMeetingReport(rawTopic: string): MeetingReport {
  const topic = rawTopic.trim() || "Which pizza should we order?";
  const attendees = randInt(7, 19);
  const rate = randInt(78, 165);
  const cost = Math.round(attendees * (randInt(45, 95) / 60) * rate);
  const now = new Date();

  const stakeholders: Stakeholder[] = pickMany(FIRST_NAMES, 5).map((name, i) => ({
    name,
    role: ROLES[i],
    concern: pick(CONCERNS),
    availability: pick(AVAILABILITY),
  }));

  const followUps = pickMany(FOLLOW_UP_TITLES, 3).map((title, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() + 3 + i * 4 + randInt(0, 3));
    return {
      title,
      date,
      duration: pick(["30 minutes", "45 minutes", "1 hour", "90 minutes", "recurring, every Monday, forever"]),
      purpose: pick(FOLLOW_UP_PURPOSES),
    };
  });

  const agenda = AGENDA_ITEMS.map((item, i) => {
    const minutes = (i + 1) * 5;
    return {
      time: `+${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
      item,
      owner: pick(["Facilitator", "The group", "Slightly confused intern", "Owner (TBC)", "Nobody, apparently"]),
    };
  });

  const verdicts = [
    "No decision was reached. This is considered a successful outcome.",
    "A decision was provisionally reached, then immediately un-reached.",
    "The group agreed to reconvene before agreeing.",
    "Consensus was achieved on everything except the thing.",
    "The meeting was productive in the sense that it occurred.",
  ];

  return {
    topic,
    generatedAt: now,
    executiveSummary: `On ${now.toLocaleDateString(undefined, { dateStyle: "long" })}, a group of ${attendees} highly compensated professionals convened to consider the matter of "${topic}". After a thorough ${randInt(
      38,
      74,
    )}-minute deliberation extending across ${randInt(2, 5)} calendars, the group successfully identified ${randInt(
      3,
      9,
    )} new questions and zero answers. The decision has been deferred to a follow-up meeting, which has itself been deferred. Next steps remain, by design, unclear.`,
    framework: FRAMEWORK_STEPS.map((s) => s.replace(/^\d+\.\s?/, "")),
    agenda,
    stakeholders,
    followUps,
    risks: shuffle(RISKS).slice(0, 4).map((r) => ({ ...r })),
    verdict: pick(verdicts),
    estimatedCost: `$${cost.toLocaleString()} of imaginary budget, plus ${attendees} units of goodwill.`,
    actionItems: pickMany(ACTION_ITEMS, 4),
  };
}

export function meetingToText(r: MeetingReport): string {
  const line = "=".repeat(72);
  const sub = "-".repeat(72);
  const dateStr = (d: Date) => d.toLocaleDateString(undefined, { dateStyle: "full" });
  return [
    line,
    "  USELESS TOOLS™ — UNNECESSARY MEETING RECORD",
    "  Prepared by the Department of Unresolved Decisions",
    line,
    "",
    `SUBJECT: ${r.topic}`,
    `GENERATED: ${r.generatedAt.toLocaleString()}`,
    `ESTIMATED COST: ${r.estimatedCost}`,
    "",
    "1. EXECUTIVE SUMMARY",
    sub,
    r.executiveSummary,
    "",
    "2. TWELVE-STEP DECISION FRAMEWORK",
    sub,
    ...r.framework.map((s, i) => `   ${String(i + 1).padStart(2, "0")}. ${s}`),
    "",
    "3. AGENDA",
    sub,
    ...r.agenda.map((a) => `   [${a.time}] ${a.item}  (owner: ${a.owner})`),
    "",
    "4. STAKEHOLDERS WHO MUST BE CONSULTED",
    sub,
    ...r.stakeholders.map(
      (s) => `   • ${s.name} — ${s.role}\n     ${s.concern}; ${s.availability}`,
    ),
    "",
    "5. FOLLOW-UP MEETINGS",
    sub,
    ...r.followUps.map(
      (f, i) => `   ${i + 1}. ${f.title}\n      ${dateStr(f.date)} · ${f.duration}\n      Purpose: ${f.purpose}`,
    ),
    "",
    "6. RISK ASSESSMENT",
    sub,
    ...r.risks.map(
      (k) => `   • ${k.risk}\n     Likelihood: ${k.likelihood} · Impact: ${k.impact} · Mitigation: ${k.mitigation}`,
    ),
    "",
    "7. ACTION ITEMS",
    sub,
    ...r.actionItems.map((a) => `   [ ] ${a}`),
    "",
    "8. VERDICT",
    sub,
    `   ${r.verdict}`,
    "",
    line,
    "  This document has been reviewed by nobody and approved by everyone.",
    "  Useless Tools™ is a parody. No real meetings were harmed.",
    line,
  ].join("\n");
}
