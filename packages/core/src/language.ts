/**
 * The language engine: a hidden model of how well the player understands
 * each concept (language design bible §13-17). The player never sees it.
 * They see icons quietly disappear and speech that trusts them more.
 *
 * What it tracks is evidence, not repetition (§15): which situations a
 * concept was met in, who said it, through which channel (Milo, a wild
 * Lexling, an enemy, words carved in stone, a command), and whether the player ever acted on it
 * correctly, in how many different situations, and after a gap.
 *
 * From that it derives a comprehension state:
 *   unseen        never met;
 *   exposed       met, but the evidence is thin;
 *   suspected     met in enough different situations to form a guess;
 *   demonstrated  the player acted on it correctly at least once;
 *   understood    acted on it correctly in different situations, and has
 *                 met it from different speakers or channels;
 *   internalized  understood, and it survived a time gap.
 *
 * Underneath sits one memory strength in [0, 1] that grows with evidence
 * and fades with time away, so a returning player gets help back instead
 * of being punished (§26 of the game bible).
 */

export type Modality = 'milo' | 'lexling' | 'enemy' | 'writing' | 'command' | 'action';

export type ConceptState = {
  exposures: number;
  successes: number;
  failures: number;
  hints: number;
  /** Strength as of `lastSeen`. Read it through `strengthAt`, which applies decay. */
  strength: number;
  /** Epoch ms of the last exposure, use or hint. 0 = never seen. */
  lastSeen: number;
  /** Distinct situations (encounter or battle ids) it was met in, most recent last. */
  contexts: string[];
  /** Distinct speakers heard saying it ("milo", Lexling ids). */
  speakers: string[];
  /** Distinct channels it reached the player through. */
  modalities: Modality[];
  /** Distinct situations in which the player acted on it correctly. */
  successContexts: string[];
  /** Epoch ms of the last success. 0 = never. */
  lastSuccess: number;
  /** True once a success came after a real gap since the one before (retention, not short-term memory). */
  spaced: boolean;
};

export type Comprehension = 'unseen' | 'exposed' | 'suspected' | 'demonstrated' | 'understood' | 'internalized';

export const COMPREHENSION_ORDER: Comprehension[] = ['unseen', 'exposed', 'suspected', 'demonstrated', 'understood', 'internalized'];

export type ScaffoldLevel = 0 | 1 | 2 | 3;

export const LANGUAGE = {
  exposureGain: 0.12,
  /** An exposure in a situation not seen before counts this much more (contextual diversity, §15). */
  newContextBonus: 1.5,
  /** Hearing it from someone new counts this much more (cross-creature transfer, §18). */
  newSpeakerBonus: 1.5,
  /** The two bonuses together never exceed this multiplier. */
  maxBonus: 2,
  successGain: 0.35,
  failureLoss: 0.3,
  /** Per rung of the hint ladder above the first (a repeat is free; a clue costs 1, the meaning 2). */
  hintLoss: 0.08,
  /** Half-life of strength with no successes, in days. Each success adds this much again. */
  baseHalfLifeDays: 2,
  maxHalfLifeDays: 60,
  /** A success at least this many days after the previous one counts as retention. */
  spacedGapDays: 2,
  /** Thresholds the states use. */
  suspectStrength: 0.25,
  suspectContexts: 2,
  understandStrength: 0.55,
  internalizeStrength: 0.8,
  /** Below these, a concept the player once knew gets its help back. */
  rustyBelow: 0.3,
  forgottenBelow: 0.12,
  /** A concept is due for reinforcement below this (once it has been met). */
  dueBelow: 0.6,
  maxContexts: 8,
} as const;

const DAY = 24 * 60 * 60 * 1000;

export function newConcept(): ConceptState {
  return {
    exposures: 0,
    successes: 0,
    failures: 0,
    hints: 0,
    strength: 0,
    lastSeen: 0,
    contexts: [],
    speakers: [],
    modalities: [],
    successContexts: [],
    lastSuccess: 0,
    spaced: false,
  };
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

function add<T>(list: T[], item: T | undefined, max: number = LANGUAGE.maxContexts): T[] {
  if (item === undefined) return list;
  return [...list.filter((x) => x !== item), item].slice(-max);
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Where a piece of evidence came from. All optional, but the richer it is, the better the model. */
export type Source = { context?: string; speaker?: string; modality?: Modality };

export function recordExposure(state: ConceptState, now: number, source: Source = {}): ConceptState {
  const freshContext = !!source.context && !state.contexts.includes(source.context);
  const freshSpeaker = !!source.speaker && !state.speakers.includes(source.speaker);
  const bonus = Math.min(LANGUAGE.maxBonus, (freshContext ? LANGUAGE.newContextBonus : 1) * (freshSpeaker ? LANGUAGE.newSpeakerBonus : 1));
  const s = strengthAt(state, now);
  return {
    ...state,
    exposures: state.exposures + 1,
    strength: clamp(s + (1 - s) * LANGUAGE.exposureGain * bonus),
    lastSeen: now,
    contexts: add(state.contexts, source.context),
    speakers: add(state.speakers, source.speaker, 16),
    modalities: add(state.modalities, source.modality, 8),
  };
}

export function recordEvidence(state: ConceptState, result: 'success' | 'fail', now: number, source: Source = {}): ConceptState {
  const s = strengthAt(state, now);
  if (result === 'success') {
    const gap = state.lastSuccess > 0 ? (now - state.lastSuccess) / DAY : 0;
    return {
      ...state,
      successes: state.successes + 1,
      strength: clamp(s + (1 - s) * LANGUAGE.successGain),
      lastSeen: now,
      contexts: add(state.contexts, source.context),
      modalities: add(state.modalities, source.modality ?? 'action', 8),
      successContexts: add(state.successContexts, source.context),
      lastSuccess: now,
      spaced: state.spaced || gap >= LANGUAGE.spacedGapDays,
    };
  }
  return { ...state, failures: state.failures + 1, strength: clamp(s * (1 - LANGUAGE.failureLoss)), lastSeen: now };
}

/** `rung`: 1 = hear it again (free), 2 = a context clue, 3 = the meaning. */
export function recordHint(state: ConceptState, rung: 1 | 2 | 3, now: number): ConceptState {
  if (rung === 1) return state;
  const s = strengthAt(state, now);
  const loss = LANGUAGE.hintLoss * (rung - 1);
  return { ...state, hints: state.hints + 1, strength: clamp(s * (1 - loss)), lastSeen: Math.max(state.lastSeen, now) };
}

/** The hidden comprehension state, now. */
export function comprehension(state: ConceptState | undefined, now: number): Comprehension {
  if (!state || state.exposures + state.successes === 0) return 'unseen';
  const s = strengthAt(state, now);
  if (state.successes === 0) {
    return state.contexts.length >= LANGUAGE.suspectContexts && s >= LANGUAGE.suspectStrength ? 'suspected' : 'exposed';
  }
  const varied = state.speakers.length >= 2 || state.modalities.length >= 3;
  if (state.successContexts.length >= 2 && varied && s >= LANGUAGE.understandStrength) {
    return state.spaced && state.successContexts.length >= 3 && s >= LANGUAGE.internalizeStrength ? 'internalized' : 'understood';
  }
  return 'demonstrated';
}

export function atLeast(c: Comprehension, min: Comprehension): boolean {
  return COMPREHENSION_ORDER.indexOf(c) >= COMPREHENSION_ORDER.indexOf(min);
}

/**
 * How much help a concept gets:
 *   3  new (unseen, exposed): icons everywhere it appears;
 *   2  suspected, or once known but rusty: tiles keep their icon;
 *   1  demonstrated or understood: the plain word;
 *   0  internalized: the plain word, and speech may play as sound first.
 * Icons leave command tiles only after the player has acted on the word
 * (§28), and nothing reaches level 0 without surviving a time gap.
 */
export function scaffoldLevel(state: ConceptState | undefined, now: number): ScaffoldLevel {
  const c = comprehension(state, now);
  let level: ScaffoldLevel = c === 'internalized' ? 0 : c === 'understood' || c === 'demonstrated' ? 1 : c === 'suspected' ? 2 : 3;
  if (state && state.successes > 0) {
    const s = strengthAt(state, now);
    if (s < LANGUAGE.forgottenBelow) level = 3;
    else if (s < LANGUAGE.rustyBelow && level < 2) level = 2;
  }
  return level;
}

export function isDue(state: ConceptState | undefined, now: number): boolean {
  return !!state && state.exposures > 0 && strengthAt(state, now) < LANGUAGE.dueBelow;
}

/**
 * A line from this speaker would be a transfer moment for the concept: the
 * player already has a guess about it, and has never heard this speaker use
 * it (§18: "I learned this from Milo, and now I understand someone else").
 */
export function isTransfer(state: ConceptState | undefined, speaker: string, now: number): boolean {
  return !!state && atLeast(comprehension(state, now), 'suspected') && !state.speakers.includes(speaker);
}

export type LanguageSettings = {
  /** Keep element icons on command tiles no matter what (accessibility). */
  persistentIcons: boolean;
  /** "always": text with every line. "adaptive": internalized lines play sound first, text on tap. */
  subtitles: 'always' | 'adaptive';
};

/** How a command tile shows its word. */
export type TilePresentation = { icon: boolean; tint: boolean };

export function tilePresentation(level: ScaffoldLevel, settings: Pick<LanguageSettings, 'persistentIcons'>): TilePresentation {
  const help = settings.persistentIcons || level >= 2;
  return { icon: help, tint: help };
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
