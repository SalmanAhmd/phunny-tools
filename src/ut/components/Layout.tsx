import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function Layout() {
  const { pathname } = useLocation();

  // Fresh page, fresh scroll position. Standard, but worth doing properly.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-xl focus:border-2 focus:border-ink focus:bg-zing-yellow focus:px-4 focus:py-2 focus:font-bold"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Link
        to="/random"
        className="fixed bottom-4 left-4 z-40 hidden rounded-2xl border-2 border-ink bg-zing-yellow px-4 py-3 font-display text-sm font-bold shadow-pop-sm transition-transform hover:-translate-y-0.5 md:block dark:border-cream"
        title="Teleport somewhere pointless"
      >
        🎲 Surprise me
      </Link>
    </div>
  );
}
