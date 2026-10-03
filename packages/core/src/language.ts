/**
 * The language engine (bible §25-27, §48). It quietly tracks how well the
 * player knows each concept and decides how much help the game gives, per
 * concept, never through a global difficulty. The player never sees these
 * numbers; they see icons fade away and speech that trusts them more.
 *
 * Model: one memory strength per concept in [0, 1].
 *   - an exposure (hearing it in context) nudges it up, more in a new context;
 *   - a success (acting on it correctly) moves it up a lot;
 *   - a failure (acting on it wrongly) knocks it down;
 *   - a hint costs a little, more for an English translation;
 *   - it decays with time away, and decays slower the more often it was used.
 * Strength picks a scaffold level: 3 heavy context, 2 moderate, 1 light, 0 fluent.
 */

export type ConceptState = {
  exposures: number;
  successes: number;
  failures: number;
  hints: number;
  /** Strength as of `lastSeen`. Read it through `strengthAt`, which applies decay. */
  strength: number;
  /** Epoch ms of the last exposure, use or hint. 0 = never seen. */
  lastSeen: number;
  /** Distinct contexts (encounter or battle ids) it was met in, most recent last. */
  contexts: string[];
};

export type ScaffoldLevel = 0 | 1 | 2 | 3;

export const LANGUAGE = {
  exposureGain: 0.12,
  /** An exposure in a context not seen before counts this much more (variety matters, bible §27). */
  newContextBonus: 1.5,
  successGain: 0.35,
  failureLoss: 0.3,
  /** Per rung of the hint ladder above the first (a repeat is free; a clue costs 1, English 2). */
  hintLoss: 0.08,
  /** Half-life of strength with no successes, in days. Each success adds this much again. */
  baseHalfLifeDays: 2,
  maxHalfLifeDays: 60,
  /** Strength needed for each level. Below the last, level 3. */
  levels: [
    { level: 0, min: 0.85 },
    { level: 1, min: 0.55 },
    { level: 2, min: 0.25 },
  ] as { level: ScaffoldLevel; min: number }[],
  /** A concept is due for reinforcement below this (once it has been met). */
  dueBelow: 0.6,
  maxContexts: 8,
} as const;

const DAY = 24 * 60 * 60 * 1000;

export function newConcept(): ConceptState {
  return { exposures: 0, successes: 0, failures: 0, hints: 0, strength: 0, lastSeen: 0, contexts: [] };
}

export function halfLifeDays(state: ConceptState): number {
  return Math.min(LANGUAGE.maxHalfLifeDays, LANGUAGE.baseHalfLifeDays * (1 + state.successes));
}

/** Strength now, after forgetting since it was last seen. */
export function strengthAt(state: ConceptState, now: number): number {
  if (state.lastSeen === 0) return 0;
  const days = Math.max(0, now - state.lastSeen) / DAY;
  return state.strength * Math.pow(0.5, days / halfLifeDays(state));
}

function withContext(contexts: string[], context: string | undefined): string[] {
  if (!context) return contexts;
  const rest = contexts.filter((c) => c !== context);
  return [...rest, context].slice(-LANGUAGE.maxContexts);
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function recordExposure(state: ConceptState, now: number, context?: string): ConceptState {
  const fresh = !!context && !state.contexts.includes(context);
  const gain = LANGUAGE.exposureGain * (fresh ? LANGUAGE.newContextBonus : 1);
  const s = strengthAt(state, now);
  return {
    ...state,
    exposures: state.exposures + 1,
    strength: clamp(s + (1 - s) * gain),
    lastSeen: now,
    contexts: withContext(state.contexts, context),
  };
}

export function recordEvidence(state: ConceptState, result: 'success' | 'fail', now: number, context?: string): ConceptState {
  const s = strengthAt(state, now);
  if (result === 'success') {
    return {
      ...state,
      successes: state.successes + 1,
      strength: clamp(s + (1 - s) * LANGUAGE.successGain),
      lastSeen: now,
      contexts: withContext(state.contexts, context),
    };
  }
  return { ...state, failures: state.failures + 1, strength: clamp(s * (1 - LANGUAGE.failureLoss)), lastSeen: now };
}

/** `rung`: 1 = hear it again (free), 2 = a context clue, 3 = the English meaning. */
export function recordHint(state: ConceptState, rung: 1 | 2 | 3, now: number): ConceptState {
  if (rung === 1) return state;
  const s = strengthAt(state, now);
  const loss = LANGUAGE.hintLoss * (rung - 1);
  return { ...state, hints: state.hints + 1, strength: clamp(s * (1 - loss)), lastSeen: Math.max(state.lastSeen, now) };
}

/**
 * How much help this concept gets. A concept never drops below level 2
 * until the player has acted on it correctly at least once: hearing a word
 * a lot is not the same as knowing it.
 */
export function scaffoldLevel(state: ConceptState | undefined, now: number): ScaffoldLevel {
  if (!state || state.exposures + state.successes === 0) return 3;
  const s = strengthAt(state, now);
  let level: ScaffoldLevel = 3;
  for (const step of LANGUAGE.levels) {
    if (s >= step.min) {
      level = step.level;
      break;
    }
  }
  if (state.successes === 0 && level < 2) level = 2;
  return level;
}

export function isDue(state: ConceptState | undefined, now: number): boolean {
  return !!state && state.exposures > 0 && strengthAt(state, now) < LANGUAGE.dueBelow;
}

export type LanguageSettings = {
  /** Keep element icons on command tiles no matter what (accessibility). */
  persistentIcons: boolean;
  /** "always": text with every line. "adaptive": well-known lines play audio first, text on tap. */
  subtitles: 'always' | 'adaptive';
};

/** How a command tile shows its word. */
export type TilePresentation = { icon: boolean; tint: boolean };

export function tilePresentation(level: ScaffoldLevel, settings: Pick<LanguageSettings, 'persistentIcons'>): TilePresentation {
  if (settings.persistentIcons) return { icon: true, tint: true };
  return { icon: level >= 3, tint: level >= 2 };
}

/** How a creature line is shown, from the least-known concept in it. */
export type SpeechPresentation = { icons: boolean; textFirst: boolean };

export function speechPresentation(level: ScaffoldLevel, settings: Pick<LanguageSettings, 'subtitles'>): SpeechPresentation {
  return { icons: level >= 3, textFirst: settings.subtitles === 'always' || level > 0 };
}

/** The level of the least-known of these concepts (a line is only as easy as its hardest word). */
export function lineLevel(states: Record<string, ConceptState>, concepts: readonly string[], now: number): ScaffoldLevel {
  let level: ScaffoldLevel = 0;
  for (const c of concepts) {
    const l = scaffoldLevel(states[c], now);
    if (l > level) level = l;
  }
  return concepts.length === 0 ? 3 : level;
}
