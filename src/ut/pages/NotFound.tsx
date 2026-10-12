import { useState } from "react";
import { Link } from "react-router-dom";
import { NOT_FOUND_JOKES } from "../lib/registry";
import { sfx } from "../lib/sound";
import { useUI } from "../lib/ui";
import { Btn } from "../components/Btn";
import { pick } from "../lib/random";

export default function NotFound() {
  const [joke, setJoke] = useState(() => pick(NOT_FOUND_JOKES));
  const { fireConfetti } = useUI();

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <div className="text-6xl" aria-hidden>
        🧭
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">404: Location Desired</h1>
      <p className="mt-3 max-w-md text-sm opacity-75 sm:text-base">
        Whatever you were looking for has filed for a meeting and never returned. The page may
        have been moved, renamed, or promoted to a non-page.
      </p>

      <p className="mt-6 max-w-md rounded-2xl border-2 border-ink bg-zing-yellow p-4 font-display text-sm font-bold text-ink shadow-pop-sm dark:border-cream">
        {joke}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-pop btn-primary">
          Back to home
        </Link>
        <Link to="/tools" className="btn btn-pop btn-purple">
          Browse every tool
        </Link>
        <Btn
          variant="ghost"
          sound="boing"
          onClick={() => {
            setJoke(pick(NOT_FOUND_JOKES));
            sfx("boing");
            fireConfetti();
          }}
        >
          Another excuse, please
        </Btn>
      </div>

      <p className="mt-10 text-xs opacity-50">
        Error genuinely 404. The drama, however, is entirely self-inflicted.
      </p>
    </div>
  );
}