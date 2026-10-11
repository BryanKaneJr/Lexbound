import { describe, expect, it } from 'vitest';
import { applyEvents, chooseEncounter, eligible, newSave, nextStory, recordExposure, newConcept, SCHEDULER, weigh, type ContentInput, type Save } from '../src';
import { fixture } from './fixture';

const T = 1_700_000_000_000;
type Enc = NonNullable<ContentInput['encounters']>[number];
const scene = { background: 'forest', actors: [{ id: 'milo', art: 'milo', x: 0.5, y: 0.9 }] };
const enc = (id: string, extra: Partial<Enc> = {}, line = 'milo.si'): Enc => ({
  id,
  location: 'wood',
  title: id,
  kind: 'explore',
  repeatable: true,
  scene,
  steps: [{ type: 'say', line }, { type: 'end' }],
  ...extra,
});

const content = fixture({
  encounters: [
    enc('story.two', { kind: 'story', order: 2, repeatable: false }),
    enc('story.one', { kind: 'story', order: 1, repeatable: false }),
    enc('gated', { requires: { flags: ['open'] } }),
    enc('water', {}, 'milo.acqua'),
    enc('yes', {}, 'milo.si'),
    enc('hog.water', { scene: { background: 'forest', actors: [{ id: 'hog', art: 'hog', x: 0.5, y: 0.9 }] } }, 'hog.ahi'),
  ],
});

function finished(save: Save, ...ids: string[]): Save {
  let s = save;
  for (const id of ids) {
    s = applyEvents(s, content, [{ type: 'encounterStart', encounter: id, location: 'wood' }, { type: 'encounterEnd', encounter: id, complete: true }], T).save;
  }
  return s;
}

describe('scheduler', () => {
  it('runs story encounters first, in order, once each', () => {
    let save = newSave(T, 1);
    expect(nextStory(content, save, 'wood')?.id).toBe('story.one');
    expect(chooseEncounter(content, save, 'wood', T, 1).encounter?.id).toBe('story.one');
    save = finished(save, 'story.one');
    expect(chooseEncounter(content, save, 'wood', T, 1).encounter?.id).toBe('story.two');
    save = finished(save, 'story.two');
    expect(nextStory(content, save, 'wood')).toBeUndefined();
    expect(['water', 'yes', 'hog.water']).toContain(chooseEncounter(content, save, 'wood', T, 1).encounter?.id);
  });

  it('respects requirements and cooldowns', () => {
    let save = finished(newSave(T, 1), 'story.one', 'story.two');
    expect(eligible(content, save, 'wood').map((e) => e.id)).not.toContain('gated');
    save = { ...save, flags: { open: true } };
    expect(eligible(content, save, 'wood').map((e) => e.id)).toContain('gated');
    save = finished(save, 'water');
    expect(eligible(content, save, 'wood').map((e) => e.id)).not.toContain('water');
    save = finished(save, 'yes', 'gated');
    expect(eligible(content, save, 'wood').map((e) => e.id)).toContain('water');
  });

  it('penalises what you just saw and boosts what you are forgetting', () => {
    const base = finished(newSave(T, 1), 'story.one', 'story.two');
    const water = content.encounter.get('water')!;
    const fresh = weigh(content, base, water, T);
    expect(fresh.weight).toBe(10);
    const recent = weigh(content, { ...base, recent: ['water'] }, water, T);
    expect(recent.weight).toBeCloseTo(10 * SCHEDULER.recentPenalty);
    const due = weigh(content, { ...base, concepts: { water: recordExposure(newConcept(), T, { context: 'x' }) } }, water, T);
    expect(due.weight).toBeCloseTo(10 * (1 + SCHEDULER.dueBoost));
    expect(due.reasons).toContain('due:water');
    // Due, but this is the very situation it was met in: a smaller nudge (contextual diversity).
    const familiar = weigh(content, { ...base, concepts: { water: recordExposure(newConcept(), T, { context: 'water' }) } }, water, T);
    expect(familiar.weight).toBeCloseTo(10 * (1 + SCHEDULER.dueBoost * SCHEDULER.familiarContextShare));
  });

  it('favours someone new using a word the player already has a guess about', () => {
    const base = finished(newSave(T, 1), 'story.one', 'story.two');
    const guess = recordExposure(recordExposure(newConcept(), T, { context: 'a', speaker: 'milo' }), T, { context: 'b', speaker: 'milo' });
    const strong = { ...guess, strength: 0.9, successes: 3, successContexts: ['a', 'b', 'c'] };
    const c = weigh(content, { ...base, concepts: { water: strong } }, content.encounter.get('hog.water')!, T);
    expect(c.reasons).toContain('transfer:water@hog');
    expect(c.weight).toBeCloseTo(10 * (1 + SCHEDULER.transferBoost));
    // Once heard from the hog, it's no longer a transfer.
    const heard = { ...strong, speakers: ['milo', 'hog'] };
    expect(weigh(content, { ...base, concepts: { water: heard } }, content.encounter.get('hog.water')!, T).reasons.some((r) => r.startsWith('transfer'))).toBe(false);
  });

  it('avoids the same Lexling twice in a row', () => {
    const base = finished(newSave(T, 1), 'story.one', 'story.two', 'hog.water');
    const c = weigh(content, { ...base, recent: ['hog.water'] }, content.encounter.get('hog.water')!, T);
    expect(c.reasons).toContain('recent');
    const other = fixture({ encounters: [...content.encounters, enc('hog.again', { scene: { background: 'forest', actors: [{ id: 'hog', art: 'hog', x: 0.5, y: 0.9 }] } }, 'hog.flee')] });
    const d = weigh(other, { ...base, recent: ['hog.water'] }, other.encounter.get('hog.again')!, T);
    expect(d.reasons).toContain('same-speaker:hog');
    expect(d.weight).toBeCloseTo(10 * SCHEDULER.sameSpeakerPenalty);
  });

  it('holds back encounters that would pile on new words', () => {
    const busy = fixture({
      encounters: [
        enc('busy', { steps: [{ type: 'say', line: 'milo.acqua' }, { type: 'say', line: 'milo.si' }, { type: 'say', line: 'milo.guarda' }, { type: 'end' }] }),
      ],
    });
    const c = weigh(busy, newSave(T, 1), busy.encounter.get('busy')!, T);
    expect(c.weight).toBeCloseTo(10 * SCHEDULER.overloadPenalty);
  });

  it('favours due encounters over many picks', () => {
    const base = finished(newSave(T, 1), 'story.one', 'story.two');
    const save = { ...base, concepts: { water: recordExposure(newConcept(), T, { context: 'x' }), yes: { ...newConcept(), exposures: 9, successes: 9, strength: 0.99, lastSeen: T } } };
    let water = 0;
    // Both scenes that use the due word ("acqua") should win most picks.
    for (let seed = 0; seed < 600; seed++) if (['water', 'hog.water'].includes(chooseEncounter(content, save, 'wood', T, seed).encounter?.id ?? '')) water++;
    expect(water / 600).toBeGreaterThan(0.6);
  });
});
