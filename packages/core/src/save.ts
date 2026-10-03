import { z } from 'zod';
import { newConcept, recordEvidence, recordExposure, recordHint, type ConceptState } from './language';
import { dayKey, levelForXp, MAX_BOND, SNACK_BOND_PER_DAY } from './progression';
import type { Condition, Content, Effects } from './schema';

/**
 * The player's save: everything that changes as you play, in one versioned
 * JSON document kept on the device (bible §43, §71 rule 5). Content updates
 * never live here, only references to content by stable id, so new content
 * can't break a save. Old saves are migrated forward step by step.
 */

export const SAVE_VERSION = 1;

const conceptStateSchema = z.object({
  exposures: z.number(),
  successes: z.number(),
  failures: z.number(),
  hints: z.number(),
  strength: z.number(),
  lastSeen: z.number(),
  contexts: z.array(z.string()),
});

export const settingsSchema = z.object({
  sound: z.boolean().default(true),
  voice: z.boolean().default(true),
  /** Creature speech speed, 0.6..1.2 (accessibility, bible §29). */
  speechRate: z.number().min(0.6).max(1.2).default(1),
  subtitles: z.enum(['always', 'adaptive']).default('always'),
  persistentIcons: z.boolean().default(false),
  /** Start the hint ladder at the context clue instead of a repeat. */
  strongHints: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  textScale: z.number().min(1).max(1.4).default(1),
  haptics: z.boolean().default(true),
});
export type Settings = z.infer<typeof settingsSchema>;

export const saveSchema = z.object({
  version: z.literal(SAVE_VERSION),
  createdAt: z.number(),
  /** Advances every time an engine needs a seed, so play never repeats exactly. */
  seed: z.number(),
  flags: z.record(z.string(), z.boolean()),
  encounters: z.record(z.string(), z.object({ count: z.number(), lastExplore: z.number() })),
  /** Explores per location, for cooldowns. */
  explores: z.record(z.string(), z.number()),
  /** The last few encounter ids, newest last. */
  recent: z.array(z.string()),
  concepts: z.record(z.string(), conceptStateSchema),
  milo: z.object({ xp: z.number(), bond: z.number() }),
  items: z.record(z.string(), z.number()),
  lexlings: z.record(z.string(), z.object({ seen: z.number(), befriended: z.boolean() })),
  journal: z.object({
    entries: z.array(z.string()),
    heard: z.record(z.string(), z.object({ count: z.number(), first: z.number() })),
  }),
  stats: z.object({
    battlesWon: z.number(),
    battlesLost: z.number(),
    snacks: z.object({ day: z.string(), count: z.number() }),
  }),
  settings: settingsSchema,
});
export type Save = z.infer<typeof saveSchema>;

export function newSave(now: number, seed: number): Save {
  return {
    version: SAVE_VERSION,
    createdAt: now,
    seed: seed >>> 0,
    flags: {},
    encounters: {},
    explores: {},
    recent: [],
    concepts: {},
    milo: { xp: 0, bond: 0 },
    items: {},
    lexlings: {},
    journal: { entries: [], heard: {} },
    stats: { battlesWon: 0, battlesLost: 0, snacks: { day: '', count: 0 } },
    settings: settingsSchema.parse({}),
  };
}

/**
 * Migrations, keyed by the version they upgrade FROM. Each takes the raw
 * object of that version and returns the next version's shape. Add one for
 * every SAVE_VERSION bump; never edit an old one.
 */
const MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {};

export type LoadResult = { save: Save; status: 'ok' | 'migrated' | 'reset' };

/**
 * Reads a stored save of any known version. Anything unreadable starts a new
 * save rather than crashing (status "reset", so the app can say so).
 */
export function loadSave(raw: unknown, now: number, seed: number): LoadResult {
  if (!raw || typeof raw !== 'object') return { save: newSave(now, seed), status: 'reset' };
  let data = raw as Record<string, unknown>;
  let migrated = false;
  let version = typeof data.version === 'number' ? data.version : 0;
  while (version < SAVE_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) return { save: newSave(now, seed), status: 'reset' };
    data = step(data);
    version = typeof data.version === 'number' ? data.version : version + 1;
    migrated = true;
  }
  const parsed = saveSchema.safeParse(data);
  if (!parsed.success) return { save: newSave(now, seed), status: 'reset' };
  return { save: parsed.data, status: migrated ? 'migrated' : 'ok' };
}

// ---------------------------------------------------------------- reading

export function meets(save: Save, condition: Condition | undefined): boolean {
  if (!condition) return true;
  if (condition.flags?.some((f) => !save.flags[f])) return false;
  if (condition.notFlags?.some((f) => save.flags[f])) return false;
  if (condition.items?.some((i) => (save.items[i] ?? 0) <= 0)) return false;
  if (condition.discovered?.some((l) => !save.lexlings[l])) return false;
  return true;
}

export function miloLevel(save: Save): number {
  return levelForXp(save.milo.xp);
}

export function miloMaxHp(content: Content, level: number): number {
  return content.milo.hp.base + content.milo.hp.perLevel * (level - 1);
}

// ---------------------------------------------------------------- writing

/**
 * Everything that changes a save is a GameEvent. Engines return events; the
 * app applies them here. This keeps engines pure and every change in one place.
 */
export type GameEvent =
  | { type: 'heard'; line: string; context: string }
  | { type: 'used'; concepts: string[]; context: string }
  | { type: 'evidence'; concept: string; result: 'success' | 'fail'; context: string }
  | { type: 'hint'; concepts: string[]; rung: 1 | 2 | 3 }
  | { type: 'effects'; effects: Effects }
  | { type: 'encounterStart'; encounter: string; location: string }
  | { type: 'encounterEnd'; encounter: string; complete: boolean }
  | { type: 'battleEnd'; enemy: string; result: 'win' | 'lose'; xp: number }
  | { type: 'snack' }
  | { type: 'seed' };

/** What the player should be told about (toasts). The app words them. */
export type Notice =
  | { type: 'bond'; amount: number }
  | { type: 'xp'; amount: number }
  | { type: 'levelUp'; level: number }
  | { type: 'item'; item: string; amount: number }
  | { type: 'discovered'; lexling: string }
  | { type: 'befriended'; lexling: string }
  | { type: 'journal'; entry: string };

const RECENT = 6;

function concept(save: Save, id: string): ConceptState {
  return save.concepts[id] ?? newConcept();
}

function applyEffects(save: Save, content: Content, effects: Effects, notices: Notice[]): Save {
  let next = save;
  if (effects.bond) {
    const bond = Math.max(0, Math.min(MAX_BOND, next.milo.bond + effects.bond));
    if (bond !== next.milo.bond) notices.push({ type: 'bond', amount: bond - next.milo.bond });
    next = { ...next, milo: { ...next.milo, bond } };
  }
  if (effects.xp) next = gainXp(next, effects.xp, notices);
  if (effects.flags?.length) {
    const flags = { ...next.flags };
    for (const f of effects.flags) flags[f] = true;
    next = { ...next, flags };
  }
  if (effects.items) {
    const items = { ...next.items };
    for (const [item, n] of Object.entries(effects.items)) {
      items[item] = Math.max(0, (items[item] ?? 0) + n);
      if (n > 0) notices.push({ type: 'item', item, amount: n });
    }
    next = { ...next, items };
  }
  for (const l of effects.discover ?? []) next = discover(next, l, notices);
  for (const l of effects.befriend ?? []) {
    next = discover(next, l, notices);
    const entry = next.lexlings[l];
    if (entry && !entry.befriended) {
      next = { ...next, lexlings: { ...next.lexlings, [l]: { ...entry, befriended: true } } };
      notices.push({ type: 'befriended', lexling: l });
    }
  }
  for (const e of effects.journal ?? []) {
    if (next.journal.entries.includes(e) || !content.entry.has(e)) continue;
    next = { ...next, journal: { ...next.journal, entries: [...next.journal.entries, e] } };
    notices.push({ type: 'journal', entry: e });
  }
  return next;
}

function discover(save: Save, lexling: string, notices: Notice[]): Save {
  const entry = save.lexlings[lexling];
  if (entry) return { ...save, lexlings: { ...save.lexlings, [lexling]: { ...entry, seen: entry.seen + 1 } } };
  notices.push({ type: 'discovered', lexling });
  return { ...save, lexlings: { ...save.lexlings, [lexling]: { seen: 1, befriended: false } } };
}

function gainXp(save: Save, amount: number, notices: Notice[]): Save {
  const before = levelForXp(save.milo.xp);
  const xp = save.milo.xp + amount;
  notices.push({ type: 'xp', amount });
  const after = levelForXp(xp);
  for (let l = before + 1; l <= after; l++) notices.push({ type: 'levelUp', level: l });
  return { ...save, milo: { ...save.milo, xp } };
}

export function applyEvents(save: Save, content: Content, events: readonly GameEvent[], now: number, tzOffsetMinutes = 0): { save: Save; notices: Notice[] } {
  const notices: Notice[] = [];
  let s = save;
  for (const e of events) {
    switch (e.type) {
      case 'heard': {
        const line = content.line.get(e.line);
        if (!line) break;
        const concepts = { ...s.concepts };
        for (const c of line.concepts) concepts[c] = recordExposure(concept(s, c), now, e.context);
        const prev = s.journal.heard[e.line];
        const heard = { ...s.journal.heard, [e.line]: { count: (prev?.count ?? 0) + 1, first: prev?.first ?? now } };
        s = { ...s, concepts, journal: { ...s.journal, heard } };
        // Hearing a Lexling speak means you've met its kind.
        if (content.lexling.has(line.speaker) && !s.lexlings[line.speaker]) s = discover(s, line.speaker, notices);
        break;
      }
      case 'used': {
        const concepts = { ...s.concepts };
        for (const c of e.concepts) concepts[c] = recordExposure(concept(s, c), now, e.context);
        s = { ...s, concepts };
        break;
      }
      case 'evidence':
        s = { ...s, concepts: { ...s.concepts, [e.concept]: recordEvidence(concept(s, e.concept), e.result, now, e.context) } };
        break;
      case 'hint': {
        const concepts = { ...s.concepts };
        for (const c of e.concepts) concepts[c] = recordHint(concept(s, c), e.rung, now);
        s = { ...s, concepts };
        break;
      }
      case 'effects':
        s = applyEffects(s, content, e.effects, notices);
        break;
      case 'encounterStart': {
        const explores = { ...s.explores, [e.location]: (s.explores[e.location] ?? 0) + 1 };
        const prev = s.encounters[e.encounter];
        const encounters = { ...s.encounters, [e.encounter]: { count: prev?.count ?? 0, lastExplore: explores[e.location] ?? 0 } };
        s = { ...s, explores, encounters, recent: [...s.recent.filter((r) => r !== e.encounter), e.encounter].slice(-RECENT) };
        break;
      }
      case 'encounterEnd': {
        if (!e.complete) break;
        const prev = s.encounters[e.encounter] ?? { count: 0, lastExplore: 0 };
        s = { ...s, encounters: { ...s.encounters, [e.encounter]: { ...prev, count: prev.count + 1 } } };
        break;
      }
      case 'battleEnd': {
        const stats = { ...s.stats, battlesWon: s.stats.battlesWon + (e.result === 'win' ? 1 : 0), battlesLost: s.stats.battlesLost + (e.result === 'lose' ? 1 : 0) };
        s = { ...s, stats };
        s = discover(s, e.enemy, notices);
        if (e.result === 'win' && e.xp > 0) s = gainXp(s, e.xp, notices);
        break;
      }
      case 'snack': {
        const day = dayKey(now, tzOffsetMinutes);
        const count = s.stats.snacks.day === day ? s.stats.snacks.count : 0;
        s = { ...s, stats: { ...s.stats, snacks: { day, count: count + 1 } } };
        if (count < SNACK_BOND_PER_DAY) s = applyEffects(s, content, { bond: 1 }, notices);
        break;
      }
      case 'seed':
        s = { ...s, seed: (Math.imul(s.seed ^ 0x9e3779b9, 0x85ebca6b) + 1) >>> 0 };
        break;
    }
  }
  return { save: s, notices };
}
