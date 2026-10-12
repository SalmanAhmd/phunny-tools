import { Link } from "react-router-dom";
import { Building2, FileQuestion, HeartHandshake, Rocket } from "lucide-react";
import { SectionTitle, Callout } from "../components/bits";

const TEAM = [
  { emoji: "🧑‍💼", name: "The Visionary CEO", role: "Decides things other people will not do", duty: "Scheduling alignment meetings about the alignment meetings" },
  { emoji: "🧑‍🔧", name: "Senior Hammer Technician", role: "Percussion-based compression specialist", duty: "Hitting files softly but with authority" },
  { emoji: "🫡", name: "Head of Done-ish", role: "Signs off on 'good enough', then revises it", duty: "Shipping exactly 87% of the roadmap, quarterly" },
  { emoji: "🧑‍🍳", name: "Chief Vibes Officer", role: "Ensures every tool feels like a startup exit", duty: "Distributing free range confidence" },
  { emoji: "🌱", name: "Tuber of Distinction (Potato)", role: "AI-like answers, 0% artificial intelligence", duty: "Providing starch-based wisdom on tap" },
  { emoji: "🪑", name: "The Intern (Imaginary)", role: "Believes in the mission the most", duty: "Watching the loading bar, heroically" },
];

const VALUES = [
  { Icon: Rocket, title: "Speed", body: "We move at the speed of a meeting that could have been an email." },
  { Icon: Building2, title: "Structure", body: "Every department exists. Every department contradicts another." },
  { Icon: HeartHandshake, title: "Synergy", body: "We align, socialise and circle back until everyone forgets why." },
  { Icon: FileQuestion, title: "Documentation", body: "47-page transcripts for decisions that were never made." },
];

const FAQ = [
  { q: "Is this a real company?", a: "No. It is a fictional company staffed entirely by imaginary interns. The invoices are also fictional." },
  { q: "Does it actually compress my files?", a: "No. Nothing is uploaded, converted, compressed or improved. Every number is decorative." },
  { q: "Why does the loading bar never finish?", a: "Because finishing would be a conclusion, and conclusions are outside our remit." },
  { q: "Can I use this at work?", a: "We strongly encourage it. We also accept no liability whatsoever." },
  { q: "Where is the source code?", a: "Everywhere. Simultaneously. We call it 'multi-repo rhymes with leftover'." },
];

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <SectionTitle
        kicker="About us"
        title="A company that does not exist, doing nothing, magnificently"
        subtitle="Useless Tools™ was founded during a meeting that had been scheduled to decide whether to schedule a meeting. It has been profitable ever since (the imaginary kind)."
      />

      {/* Mission */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-7">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-zing-purple">
            Our mission
          </p>
          <p className="mt-3 text-lg leading-relaxed">
            To make easy things unnecessarily difficult, at internet scale, with world-class
            design and zero meaningful output. We believe everyone deserves a premium experience —
            just not a useful one.
          </p>
        </div>
        <div className="card p-7">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-zing-orange">
            Our promise
          </p>
          <p className="mt-3 text-lg leading-relaxed">
            Every tool is honest about what it does: nothing. Every disclosure is real, every
            statistic is fictional, and every file you upload stays on your own device, judging
            you silently.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mt-14">
        <SectionTitle kicker="Corporate values" title="What we stand for (briefly)" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ Icon, title, body }) => (
            <div key={title} className="card p-5">
              <Icon size={22} className="mb-3 text-zing-purple" />
              <p className="font-display font-bold">{title}</p>
              <p className="mt-1 text-sm opacity-75">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mt-14">
        <SectionTitle
          kicker="The imaginary team"
          title="People of questionable purpose"
          subtitle="None of these people exist, yet each one performs a vital function."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <div key={member.name} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-zing-yellow text-2xl shadow-pop-sm">
                  {member.emoji}
                </span>
                <div>
                  <p className="font-display font-bold leading-tight">{member.name}</p>
                  <p className="text-xs opacity-70">{member.role}</p>
                </div>
              </div>
              <p className="mt-3 rounded-xl bg-cream-deep p-3 text-xs text-ink/80 dark:bg-ink">
                {member.duty}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-14">
        <SectionTitle kicker="Frequently asked" title="Questions we have answered" />
        <div className="mt-6 space-y-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="card group p-5">
              <summary className="cursor-pointer list-none font-display font-bold [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block text-zing-orange transition-transform group-open:rotate-90">
                  ▸
                </span>
                {q}
              </summary>
              <p className="mt-3 pl-6 text-sm opacity-80">{a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <Callout tone="info" title="Still curious?">
          <p>
            The best thing we can do for you is send you somewhere that definitely does not
            exist yet but is very easy to visit:{" "}
            <Link to="/tools" className="font-bold underline underline-offset-2">
              the catalogue
            </Link>
            .
          </p>
        </Callout>
      </div>
    </div>
  );
}