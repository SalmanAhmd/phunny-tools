import { Link } from "react-router-dom";
import { CATEGORIES } from "../lib/registry";

export function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-ink bg-ink text-cream dark:border-cream dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-cream bg-zing-orange text-lg">
                🔨
              </span>
              <span className="font-display text-lg font-bold">
                Useless Tools<sup className="text-[0.6rem]">™</sup>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm text-cream/70">
              We make easy things unnecessarily difficult. Built with genuine engineering effort
              in service of absolutely nothing. Every statistic on this site is fictional, every
              achievement is imaginary, and every file stays on your own device.
            </p>
            <p className="mt-4 font-display text-xs uppercase tracking-widest text-zing-lime">
              99% effort · 0% meaningful results
            </p>
          </div>

          <div>
            <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-cream/60">
              Categories
            </p>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <Link
                    to={`/tools?category=${encodeURIComponent(c)}`}
                    className="text-cream/80 hover:text-zing-lime"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-cream/60">
              The Fine Print
            </p>
            <ul className="space-y-2 text-sm text-cream/80">
              <li>
                <Link to="/nonsense" className="hover:text-zing-lime">
                  My Nonsense
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-zing-lime">
                  Our fictional philosophy
                </Link>
              </li>
              <li>
                <Link to="/games" className="hover:text-zing-lime">
                  Mini games
                </Link>
              </li>
              <li>No cookies, no tracking, no server.</li>
              <li>Your files never leave your browser.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border-2 border-cream/30 bg-white/5 p-5 text-sm text-cream/70">
          <p className="font-semibold text-cream">Disclaimer, in full:</p>
          <p className="mt-2">
            Useless Tools™ is not responsible for lost productivity, unnecessary laughter,
            damaged egos, or the sudden urge to hammer your laptop. Please do not actually hammer
            your hardware. No files are uploaded, compressed, converted, or improved. Side effects
            may include mild bewilderment and an inexplicable desire to share this with a
            colleague.
          </p>
        </div>

        <p className="mt-8 text-xs text-cream/50">
          © {new Date().getFullYear()} Useless Tools™, a fictional company staffed entirely by
          imaginary interns. All rights reserved for no reason.
        </p>
      </div>
    </footer>
  );
}
