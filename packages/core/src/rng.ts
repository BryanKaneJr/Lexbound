/**
 * Seeded randomness. Every engine takes its randomness from here so a battle,
 * a shuffle or an encounter pick can be replayed exactly from a seed (tests,
 * debug tools, bug reports). Never call Math.random() inside an engine.
 */
export type Rng = () => number;

/** mulberry32: small, fast, good enough for games. Returns floats in [0, 1). */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh 32-bit seed drawn from an Rng (to hand a sub-system its own stream). */
export function nextSeed(rng: Rng): number {
  return Math.floor(rng() * 4294967296) >>> 0;
}

/** Fisher-Yates on a copy. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/** Picks one item by weight. Items with weight <= 0 are never picked. Undefined if none can be. */
export function weightedPick<T>(items: readonly T[], weight: (item: T) => number, rng: Rng): T | undefined {
  let total = 0;
  for (const item of items) total += Math.max(0, weight(item));
  if (total <= 0) return undefined;
  let roll = rng() * total;
  for (const item of items) {
    const w = Math.max(0, weight(item));
    if (w <= 0) continue;
    roll -= w;
    if (roll < 0) return item;
  }
  // Floating point can leave a sliver; the last positive item takes it.
  for (let i = items.length - 1; i >= 0; i--) if (weight(items[i] as T) > 0) return items[i];
  return undefined;
}

/** One item from a non-empty list. */
export function pick<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) throw new Error('pick() from an empty list');
  return items[Math.floor(rng() * items.length)] as T;
}
