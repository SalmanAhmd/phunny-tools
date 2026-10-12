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

let uidCounter = 0;
export function uid(): string {
  uidCounter += 1;
  return `ut-${Date.now().toString(36)}-${uidCounter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/* ------------------------------ seeded helpers ------------------------------ */

/** A stable per-day seed string derived from the local date. */
export function todaySeed(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** Tiny deterministic hash so the same seed always gives the same "random" pick. */
function hashString(input: string): number {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Pick the same item every day for a given seed — our daily routine stabiliser. */
export function seededPick<T>(items: readonly T[], seed: string): T {
  if (!items.length) throw new Error("seededPick needs at least one item");
  const index = hashString(seed) % items.length;
  return items[index];
}