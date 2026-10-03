/**
 * RPG progression that stands on its own (bible §39): Milo's level, health
 * and power come from experience, never from language mastery. Knowing the
 * creature language improves decisions; levels improve Milo.
 */

export const MAX_LEVEL = 20;

/** Total XP needed to reach a level. Level 1 is free; each level asks a little more. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return 40 * n + 10 * n * n;
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  return level;
}

/** Progress inside the current level, 0..1, for an XP bar. */
export function levelProgress(xp: number): number {
  const level = levelForXp(xp);
  if (level >= MAX_LEVEL) return 1;
  const from = xpForLevel(level);
  return (xp - from) / (xpForLevel(level + 1) - from);
}

/** The bond between you and Milo, 0..100. Tiers name it; nothing is a spreadsheet. */
export const BOND_TIERS = [
  { min: 0, name: 'New friends' },
  { min: 10, name: 'Getting along' },
  { min: 25, name: 'Partners' },
  { min: 50, name: 'Close friends' },
  { min: 80, name: 'Inseparable' },
] as const;

export const MAX_BOND = 100;

export function bondTier(bond: number): (typeof BOND_TIERS)[number] {
  let tier: (typeof BOND_TIERS)[number] = BOND_TIERS[0];
  for (const t of BOND_TIERS) if (bond >= t.min) tier = t;
  return tier;
}

/** Snacks raise the bond at most this many times a local day ("gifts / food in moderation", bible §24). */
export const SNACK_BOND_PER_DAY = 3;

export function dayKey(now: number, tzOffsetMinutes = 0): string {
  const d = new Date(now - tzOffsetMinutes * 60_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
