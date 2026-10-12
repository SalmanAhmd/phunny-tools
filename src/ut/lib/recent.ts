import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "./storage";

const KEY = "recent";
const EVENT = "ut:recent-changed";
const MAX = 8;

export function getRecentTools(): string[] {
  return loadJSON<string[]>(KEY, []);
}

export function markToolUsed(id: string): void {
  const next = [id, ...getRecentTools().filter((x) => x !== id)].slice(0, MAX);
  saveJSON(KEY, next);
  window.dispatchEvent(new Event(EVENT));
}

export function useRecentTools(): { recent: string[]; clear: () => void } {
  const [recent, setRecent] = useState<string[]>(() => getRecentTools());

  useEffect(() => {
    const handler = () => setRecent(getRecentTools());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    recent,
    clear: () => {
      saveJSON(KEY, []);
      window.dispatchEvent(new Event(EVENT));
    },
  };
}
