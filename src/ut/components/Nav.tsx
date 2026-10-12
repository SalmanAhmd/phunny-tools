import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dices,
  Gamepad2,
  Home,
  Info,
  Menu,
  Moon,
  MousePointer2,
  Search,
  Sun,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from "lucide-react";
import { useUI } from "../lib/ui";
import { useSurprise } from "../lib/useSurprise";
import { sfx } from "../lib/sound";

const LINKS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/tools", label: "All Tools", Icon: Wrench },
  { to: "/games", label: "Mini Games", Icon: Gamepad2 },
  { to: "/nonsense", label: "My Nonsense", Icon: Dices },
  { to: "/about", label: "About", Icon: Info },
];

export function Nav() {
  const { theme, toggleTheme, soundOn, toggleSound, cursorOn, toggleCursor } = useUI();
  const surprise = useSurprise();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setOpen(false);
  }, [navigate]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/tools?q=${encodeURIComponent(q)}` : "/tools");
    setQuery("");
    setOpen(false);
  };

  const iconBtn =
    "flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink transition-transform hover:-translate-y-0.5 dark:border-cream";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-cream/90 backdrop-blur dark:border-cream dark:bg-ink-night/90">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2" aria-label="Useless Tools home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink bg-zing-orange text-lg shadow-pop-sm transition-transform group-hover:rotate-12 dark:border-cream">
            🔨
          </span>
          <span className="hidden font-display text-lg font-bold leading-none sm:block">
            Useless&nbsp;Tools
            <sup className="ml-0.5 text-[0.6rem]">™</sup>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 font-display text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-ink text-cream dark:bg-cream dark:text-ink"
                    : "hover:bg-ink/5 dark:hover:bg-cream/10"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden md:block" role="search">
          <label className="relative block">
            <span className="sr-only">Search tools</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className="w-44 rounded-xl border-2 border-ink bg-white py-2 pl-9 pr-3 text-sm outline-none transition-[width] focus:w-60 dark:border-cream dark:bg-ink-soft"
            />
          </label>
        </form>

        <button
          onClick={surprise}
          className={`${iconBtn} ml-auto bg-zing-purple text-white md:ml-0`}
          title="Launch a random tool. No take-backs."
          aria-label="Surprise me with a random tool"
        >
          <Dices size={18} />
        </button>

        <button
          onClick={toggleSound}
          className={`${iconBtn} bg-zing-yellow text-ink`}
          title={soundOn ? "Sound on. Mute the nonsense." : "Sound off. Enable the nonsense."}
          aria-label={soundOn ? "Mute sound" : "Enable sound"}
          aria-pressed={soundOn}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          onClick={toggleCursor}
          className={`${iconBtn} hidden bg-zing-lime text-ink sm:flex`}
          title={cursorOn ? "Custom cursor on" : "Custom cursor off"}
          aria-label={cursorOn ? "Disable custom cursor" : "Enable custom cursor"}
          aria-pressed={cursorOn}
        >
          <MousePointer2 size={18} />
        </button>

        <button
          onClick={() => {
            sfx("pop");
            toggleTheme();
          }}
          className={`${iconBtn} bg-white text-ink dark:bg-ink-soft dark:text-cream`}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={() => {
            sfx("click");
            setOpen((o) => !o);
          }}
          className={`${iconBtn} bg-white text-ink dark:bg-ink-soft dark:text-cream lg:hidden`}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t-2 border-ink lg:hidden dark:border-cream"
          >
            <div className="flex flex-col gap-2 p-4">
              <form onSubmit={submitSearch} role="search">
                <label className="relative block">
                  <span className="sr-only">Search tools</span>
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tools…"
                    className="tool-input pl-9"
                  />
                </label>
              </form>
              {LINKS.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl border-2 border-ink px-4 py-3 font-display font-semibold dark:border-cream ${
                      isActive ? "bg-zing-lime text-ink" : "bg-white dark:bg-ink-soft"
                    }`
                  }
                >
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
