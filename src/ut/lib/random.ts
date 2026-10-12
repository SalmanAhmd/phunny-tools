/** Tiny, dependency-free randomness helpers used all over the nonsense. */

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function pickMany<T>(items: readonly T[], count: number): T[] {
  return shuffle(items).slice(0, Math.max(0, Math.min(count, items.length)));
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function chance(probability: number): boolean {
  return Math.random() < probability;
}

export const uid = (() => {
  let n = 0;
  return () => `ut-${Date.now().toString(36)}-${(n++).toString(36)}`;
})();
