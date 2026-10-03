import { describe, expect, it } from 'vitest';
import { applyEvents, levelForXp, loadSave, newSave, saveSchema, SNACK_BOND_PER_DAY, xpForLevel, bondTier, levelProgress } from '../src';
import { fixture } from './fixture';

const T = 1_700_000_000_000;
const content = fixture();

describe('save', () => {
  it('a new save is valid and round-trips through JSON', () => {
    const s = newSave(T, 123);
    expect(saveSchema.safeParse(s).success).toBe(true);
    expect(loadSave(JSON.parse(JSON.stringify(s)), T, 1)).toEqual({ save: s, status: 'ok' });
  });

  it('starts fresh, never crashes, on unreadable or unknown saves', () => {
    expect(loadSave(null, T, 1).status).toBe('reset');
    expect(loadSave('nonsense', T, 1).status).toBe('reset');
    expect(loadSave({ version: 0 }, T, 1).status).toBe('reset');
    expect(loadSave({ version: 1, flags: 'oops' }, T, 1).status).toBe('reset');
  });

  it('fills in settings added after a save was written', () => {
    const s = newSave(T, 1) as Record<string, unknown>;
    const old = { ...s, settings: { sound: false } };
    const loaded = loadSave(old, T, 1);
    expect(loaded.status).toBe('ok');
    expect(loaded.save.settings.sound).toBe(false);
    expect(loaded.save.settings.speechRate).toBe(1);
  });

  it('hearing a line exposes its words, remembers it, and meets its speaker', () => {
    const { save, notices } = applyEvents(newSave(T, 1), content, [{ type: 'heard', line: 'hog.ahi', context: 'x' }], T);
    expect(save.concepts.water?.exposures).toBe(1);
    expect(save.journal.heard['hog.ahi']).toEqual({ count: 1, first: T });
    expect(save.lexlings.hog).toEqual({ seen: 1, befriended: false });
    expect(notices).toContainEqual({ type: 'discovered', lexling: 'hog' });
  });

  it('applies effects: bond is clamped, items add up, journal entries are added once', () => {
    let s = newSave(T, 1);
    s = applyEvents(s, content, [{ type: 'effects', effects: { bond: 150, items: { flask: 1 }, flags: ['a'], journal: ['story.one', 'story.one', 'nope'] } }], T).save;
    expect(s.milo.bond).toBe(100);
    expect(s.items.flask).toBe(1);
    expect(s.flags.a).toBe(true);
    expect(s.journal.entries).toEqual(['story.one']);
    s = applyEvents(s, content, [{ type: 'effects', effects: { bond: -500, items: { flask: -3 } } }], T).save;
    expect(s.milo.bond).toBe(0);
    expect(s.items.flask).toBe(0);
  });

  it('battle wins pay XP and announce level-ups', () => {
    const r = applyEvents(newSave(T, 1), content, [{ type: 'battleEnd', enemy: 'hog', result: 'win', xp: xpForLevel(3) }], T);
    expect(r.save.stats.battlesWon).toBe(1);
    expect(r.notices.filter((n) => n.type === 'levelUp')).toEqual([{ type: 'levelUp', level: 2 }, { type: 'levelUp', level: 3 }]);
    const lost = applyEvents(newSave(T, 1), content, [{ type: 'battleEnd', enemy: 'hog', result: 'lose', xp: 0 }], T);
    expect(lost.save.stats.battlesLost).toBe(1);
    expect(lost.save.milo.xp).toBe(0);
  });

  it('snacks raise the bond only a few times a day', () => {
    let s = newSave(T, 1);
    for (let i = 0; i < SNACK_BOND_PER_DAY + 3; i++) s = applyEvents(s, content, [{ type: 'snack' }], T).save;
    expect(s.milo.bond).toBe(SNACK_BOND_PER_DAY);
    s = applyEvents(s, content, [{ type: 'snack' }], T + 86_400_000).save;
    expect(s.milo.bond).toBe(SNACK_BOND_PER_DAY + 1);
  });

  it('advances the seed', () => {
    const s = newSave(T, 1);
    expect(applyEvents(s, content, [{ type: 'seed' }], T).save.seed).not.toBe(s.seed);
  });
});

describe('progression', () => {
  it('levels climb with XP and never skip', () => {
    for (let l = 1; l < 15; l++) {
      expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l));
      expect(levelForXp(xpForLevel(l))).toBe(l);
      expect(levelForXp(xpForLevel(l + 1) - 1)).toBe(l);
    }
    expect(levelProgress(0)).toBe(0);
  });

  it('names the bond', () => {
    expect(bondTier(0).name).toBe('New friends');
    expect(bondTier(30).name).toBe('Partners');
    expect(bondTier(100).name).toBe('Inseparable');
  });
});
