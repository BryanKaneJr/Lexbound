import { describe, expect, it } from 'vitest';
import {
  comprehension,
  isDue,
  isTransfer,
  LANGUAGE,
  lineLevel,
  newConcept,
  recordEvidence,
  recordExposure,
  recordHint,
  scaffoldLevel,
  speechPresentation,
  strengthAt,
  tilePresentation,
  type ConceptState,
} from '../src';

const T = 1_700_000_000_000;
const DAY = 86_400_000;

const hear = (s: ConceptState, context: string, speaker = 'milo', at = T) => recordExposure(s, at, { context, speaker, modality: speaker === 'milo' ? 'milo' : 'lexling' });
const use = (s: ConceptState, context: string, at = T) => recordEvidence(s, 'success', at, { context });

describe('comprehension model', () => {
  it('starts unseen, with every icon', () => {
    expect(comprehension(undefined, T)).toBe('unseen');
    expect(scaffoldLevel(newConcept(), T)).toBe(3);
  });

  it('hearing it in one place is only exposure; two different situations make a guess', () => {
    let s = hear(hear(newConcept(), 'stream'), 'stream');
    expect(comprehension(s, T)).toBe('exposed');
    expect(scaffoldLevel(s, T)).toBe(3);
    s = hear(s, 'path');
    expect(comprehension(s, T)).toBe('suspected');
    expect(scaffoldLevel(s, T)).toBe(2);
  });

  it('a new situation and a new speaker teach more than a repeat', () => {
    const once = hear(newConcept(), 'stream');
    // New place and new voice at once: the bonus is capped.
    expect(once.strength).toBeCloseTo(LANGUAGE.exposureGain * LANGUAGE.maxBonus);
    const repeat = hear(once, 'stream');
    const newPlace = hear(once, 'path');
    const newVoice = hear(once, 'stream', 'pebblit');
    expect(newPlace.strength).toBeGreaterThan(repeat.strength);
    expect(newVoice.strength).toBeGreaterThan(repeat.strength);
    expect(newVoice.speakers).toEqual(['milo', 'pebblit']);
    expect(newVoice.modalities).toEqual(['milo', 'lexling']);
  });

  it('never leaves suspected on hearing alone, however much', () => {
    let s = newConcept();
    for (let i = 0; i < 40; i++) s = hear(s, `ctx${i}`, i % 2 ? 'milo' : 'drizzlet');
    expect(strengthAt(s, T)).toBeGreaterThan(0.85);
    expect(comprehension(s, T)).toBe('suspected');
    expect(scaffoldLevel(s, T)).toBe(2);
  });

  it('acting on it correctly once is demonstrated: the icon leaves the tile', () => {
    const s = use(hear(hear(newConcept(), 'stream'), 'path'), 'path');
    expect(comprehension(s, T)).toBe('demonstrated');
    expect(scaffoldLevel(s, T)).toBe(1);
    expect(tilePresentation(scaffoldLevel(s, T), { persistentIcons: false }).icon).toBe(false);
  });

  it('understood needs success in different situations and more than one voice or channel', () => {
    let s = use(hear(newConcept(), 'stream'), 'stream');
    s = use(hear(s, 'path'), 'path');
    // Two successes, but only ever from Milo: still just demonstrated.
    expect(comprehension(s, T)).toBe('demonstrated');
    s = hear(s, 'river', 'drizzlet');
    expect(comprehension(s, T)).toBe('understood');
  });

  it('internalized needs retention across a time gap', () => {
    let s = hear(newConcept(), 'a');
    s = use(s, 'a');
    s = use(hear(s, 'b', 'drizzlet'), 'b');
    s = use(s, 'c');
    for (let i = 0; i < 4; i++) s = use(s, 'c');
    expect(comprehension(s, T)).toBe('understood');
    const later = T + 3 * DAY;
    s = use(hear(s, 'd', 'pebblit', later), 'd', later);
    expect(s.spaced).toBe(true);
    expect(comprehension(s, later)).toBe('internalized');
    expect(scaffoldLevel(s, later)).toBe(0);
  });

  it('a failure costs strength but never takes back a demonstration', () => {
    const s = use(hear(newConcept(), 'a'), 'a');
    const f = recordEvidence(s, 'fail', T);
    expect(f.failures).toBe(1);
    expect(f.strength).toBeCloseTo(s.strength * (1 - LANGUAGE.failureLoss));
    expect(comprehension(f, T)).toBe('demonstrated');
  });

  it('forgets with time, slower once used, and a returning player gets help back', () => {
    let s = newConcept();
    for (let i = 0; i < 5; i++) s = use(hear(s, `c${i}`, i ? 'drizzlet' : 'milo'), `c${i}`);
    expect(scaffoldLevel(s, T)).toBeLessThanOrEqual(1);
    const unused = hear(newConcept(), 'a');
    const keptUsed = strengthAt(s, T + 4 * DAY) / s.strength;
    const keptUnused = strengthAt(unused, T + 4 * DAY) / unused.strength;
    expect(keptUsed).toBeGreaterThan(keptUnused);
    expect(scaffoldLevel(s, T + 200 * DAY)).toBeGreaterThanOrEqual(2);
  });

  it('hints: a repeat is free, a clue costs a little, the meaning costs more', () => {
    const s = use(hear(newConcept(), 'a'), 'a');
    expect(recordHint(s, 1, T)).toBe(s);
    const clue = recordHint(s, 2, T);
    const meaning = recordHint(s, 3, T);
    expect(clue.strength).toBeLessThan(s.strength);
    expect(meaning.strength).toBeLessThan(clue.strength);
    expect(meaning.hints).toBe(1);
  });

  it('due: met but weak; never unmet', () => {
    expect(isDue(undefined, T)).toBe(false);
    const met = hear(newConcept(), 'a');
    expect(isDue(met, T)).toBe(true);
    let strong = met;
    for (let i = 0; i < 4; i++) strong = use(strong, `x${i}`);
    expect(isDue(strong, T)).toBe(false);
  });

  it('spots a transfer moment: a guess already formed, and a new speaker', () => {
    const s = hear(hear(newConcept(), 'camp'), 'stream');
    expect(isTransfer(s, 'pebblit', T)).toBe(true);
    expect(isTransfer(s, 'milo', T)).toBe(false);
    expect(isTransfer(hear(newConcept(), 'camp'), 'pebblit', T)).toBe(false);
  });

  it('tiles keep icon and colour until the word is demonstrated; settings can keep them', () => {
    expect(tilePresentation(3, { persistentIcons: false })).toEqual({ icon: true, tint: true });
    expect(tilePresentation(2, { persistentIcons: false })).toEqual({ icon: true, tint: true });
    expect(tilePresentation(1, { persistentIcons: false })).toEqual({ icon: false, tint: false });
    expect(tilePresentation(0, { persistentIcons: true })).toEqual({ icon: true, tint: true });
  });

  it('speech shows icons only while a word is new, and goes sound-first only when internalized', () => {
    expect(speechPresentation(3, { subtitles: 'always' }).icons).toBe(true);
    expect(speechPresentation(2, { subtitles: 'always' }).icons).toBe(false);
    expect(speechPresentation(0, { subtitles: 'adaptive' }).textFirst).toBe(false);
    expect(speechPresentation(0, { subtitles: 'always' }).textFirst).toBe(true);
    expect(speechPresentation(1, { subtitles: 'adaptive' }).textFirst).toBe(true);
  });

  it('a line is only as easy as its hardest word', () => {
    const known = use(hear(newConcept(), 'a'), 'a');
    expect(lineLevel({ water: known }, ['water'], T)).toBe(1);
    expect(lineLevel({ water: known }, ['water', 'yes'], T)).toBe(3);
    expect(lineLevel({ water: known }, [], T)).toBe(3);
  });
});
