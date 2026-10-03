import { describe, expect, it } from 'vitest';
import {
  isDue,
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
} from '../src';

const T = 1_700_000_000_000;
const DAY = 86_400_000;

describe('language engine', () => {
  it('starts every concept at heavy scaffolding', () => {
    expect(scaffoldLevel(undefined, T)).toBe(3);
    expect(scaffoldLevel(newConcept(), T)).toBe(3);
  });

  it('counts exposures, and a new context teaches more than a repeat', () => {
    const once = recordExposure(newConcept(), T, 'stream');
    const sameContext = recordExposure(once, T, 'stream');
    const newContext = recordExposure(once, T, 'path');
    expect(once.exposures).toBe(1);
    expect(once.strength).toBeCloseTo(LANGUAGE.exposureGain * LANGUAGE.newContextBonus);
    expect(newContext.strength).toBeGreaterThan(sameContext.strength);
    expect(newContext.contexts).toEqual(['stream', 'path']);
  });

  it('never drops below level 2 on exposure alone', () => {
    let s = newConcept();
    for (let i = 0; i < 40; i++) s = recordExposure(s, T, `ctx${i}`);
    expect(strengthAt(s, T)).toBeGreaterThan(0.85);
    expect(scaffoldLevel(s, T)).toBe(2);
  });

  it('a success unlocks lighter scaffolding; a failure costs strength', () => {
    let s = newConcept();
    s = recordExposure(s, T, 'stream');
    s = recordExposure(s, T, 'stream');
    s = recordExposure(s, T, 'path');
    expect(scaffoldLevel(s, T)).toBe(2);
    const success = recordEvidence(s, 'success', T, 'path');
    expect(success.successes).toBe(1);
    expect(scaffoldLevel(success, T)).toBe(1);
    const fail = recordEvidence(s, 'fail', T);
    expect(fail.failures).toBe(1);
    expect(fail.strength).toBeCloseTo(s.strength * (1 - LANGUAGE.failureLoss));
  });

  it('forgets with time, and slower once it has been used successfully', () => {
    let s = recordExposure(newConcept(), T, 'a');
    s = recordEvidence(s, 'success', T, 'a');
    const unused = recordExposure(newConcept(), T, 'a');
    const later = T + 4 * DAY;
    expect(strengthAt(s, later)).toBeLessThan(s.strength);
    const keptUsed = strengthAt(s, later) / s.strength;
    const keptUnused = strengthAt(unused, later) / unused.strength;
    expect(keptUsed).toBeGreaterThan(keptUnused);
  });

  it('a returning player gets help back instead of being punished', () => {
    let s = newConcept();
    for (let i = 0; i < 5; i++) s = recordEvidence(recordExposure(s, T, `c${i}`), 'success', T, `c${i}`);
    expect(scaffoldLevel(s, T)).toBe(0);
    expect(scaffoldLevel(s, T + 120 * DAY)).toBeGreaterThan(0);
  });

  it('hints: hearing it again is free, a clue costs a little, English costs more', () => {
    let s = recordEvidence(recordExposure(newConcept(), T, 'a'), 'success', T, 'a');
    expect(recordHint(s, 1, T)).toBe(s);
    const clue = recordHint(s, 2, T);
    const english = recordHint(s, 3, T);
    expect(clue.strength).toBeLessThan(s.strength);
    expect(english.strength).toBeLessThan(clue.strength);
    expect(english.hints).toBe(1);
  });

  it('marks met-but-weak concepts as due, never unmet ones', () => {
    expect(isDue(undefined, T)).toBe(false);
    const met = recordExposure(newConcept(), T, 'a');
    expect(isDue(met, T)).toBe(true);
    let strong = met;
    for (let i = 0; i < 4; i++) strong = recordEvidence(strong, 'success', T, `x${i}`);
    expect(isDue(strong, T)).toBe(false);
  });

  it('tiles lose the icon, then the tint; persistent icons keep both', () => {
    expect(tilePresentation(3, { persistentIcons: false })).toEqual({ icon: true, tint: true });
    expect(tilePresentation(2, { persistentIcons: false })).toEqual({ icon: false, tint: true });
    expect(tilePresentation(1, { persistentIcons: false })).toEqual({ icon: false, tint: false });
    expect(tilePresentation(0, { persistentIcons: true })).toEqual({ icon: true, tint: true });
  });

  it('speech goes audio-first only when fluent and the player allows it', () => {
    expect(speechPresentation(0, { subtitles: 'adaptive' }).textFirst).toBe(false);
    expect(speechPresentation(0, { subtitles: 'always' }).textFirst).toBe(true);
    expect(speechPresentation(1, { subtitles: 'adaptive' }).textFirst).toBe(true);
  });

  it('a line is only as easy as its hardest word', () => {
    const known = recordEvidence(recordExposure(recordExposure(newConcept(), T, 'a'), T, 'b'), 'success', T, 'b');
    const states = { water: known };
    expect(lineLevel(states, ['water'], T)).toBe(1);
    expect(lineLevel(states, ['water', 'yes'], T)).toBe(3);
    expect(lineLevel(states, [], T)).toBe(3);
  });
});
