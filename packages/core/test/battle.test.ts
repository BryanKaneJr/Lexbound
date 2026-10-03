import { describe, expect, it } from 'vitest';
import { battleHint, bestCommands, chooseCommand, startBattle, type BattleState } from '../src';
import { fixture } from './fixture';

const content = fixture();
const begin = (seed = 9, level = 1) => startBattle(content, 'hog', { level, maxHp: 30, context: 'test', seed });

describe('battle engine', () => {
  it('opens with the enemy announcing its first move', () => {
    const { state, beats, events } = begin();
    expect(state.outcome).toBe('ongoing');
    expect(state.intent).toBe(0);
    expect(beats.find((b) => b.type === 'windup')).toMatchObject({ move: 'spit', element: 'fire' });
    expect(beats).toContainEqual({ type: 'say', speaker: 'hog', line: 'hog.fuoco' });
    expect(events).toContainEqual({ type: 'heard', line: 'hog.fuoco', context: 'test' });
    expect([...state.order].sort()).toEqual(['earth', 'fire', 'water', 'wind']);
  });

  it('knows the counter', () => {
    expect(bestCommands(content, 'fire')).toEqual(['water']);
    expect(bestCommands(content, 'water')).toEqual([]);
  });

  it('water on fire: strong, douses the announced fire move, and counts as understanding', () => {
    const { state } = begin();
    const r = chooseCommand(content, state, 'water');
    const hit = r.beats.find((b) => b.type === 'hit' && b.target === 'foe');
    expect(hit).toMatchObject({ effect: 'strong' });
    expect(hit && hit.type === 'hit' && hit.amount).toBeGreaterThanOrEqual(18);
    expect(r.beats).toContainEqual({ type: 'countered', ability: 'spit', by: 'water' });
    expect(r.beats.some((b) => b.type === 'foeMove')).toBe(false);
    expect(r.state.milo.hp).toBe(30);
    expect(r.events).toContainEqual({ type: 'evidence', concept: 'water', result: 'success', context: 'test' });
    expect(r.beats).toContainEqual({ type: 'say', speaker: 'hog', line: 'hog.ahi' });
  });

  it('enemy speech pays: countering an announced charge with earth blocks it and shows understanding', () => {
    const first = chooseCommand(content, begin().state, 'water');
    expect(first.state.intent).toBe(1);
    expect(first.beats).toContainEqual({ type: 'say', speaker: 'hog', line: 'hog.attacco' });
    // Water is the obvious matchup: it hits hard, but the charge lands, and it proves nothing about the announcement.
    const spam = chooseCommand(content, first.state, 'water');
    expect(spam.beats.some((b) => b.type === 'foeMove')).toBe(true);
    expect(spam.events.filter((e) => e.type === 'evidence' && e.concept === 'attack')).toEqual([]);
    // Earth answers the announcement: the charge is stopped, and that is evidence for "attacca".
    const wall = chooseCommand(content, first.state, 'earth');
    expect(wall.beats).toContainEqual({ type: 'countered', ability: 'tackle', by: 'earth' });
    expect(wall.beats.some((b) => b.type === 'foeMove')).toBe(false);
    expect(wall.state.milo.hp).toBe(first.state.milo.hp);
    expect(wall.events).toContainEqual({ type: 'evidence', concept: 'attack', result: 'success', context: 'test' });
  });

  it('fire on fire: absorbed, the hog heals and says thanks; no evidence either way', () => {
    const { state } = begin();
    const hurt: BattleState = { ...state, foe: { ...state.foe, hp: 20 } };
    const r = chooseCommand(content, hurt, 'fire');
    expect(r.beats.find((b) => b.type === 'hit' && b.target === 'foe')).toMatchObject({ effect: 'absorbed', amount: 0 });
    expect(r.state.foe.hp).toBe(25);
    expect(r.beats).toContainEqual({ type: 'say', speaker: 'hog', line: 'hog.grazie' });
    expect(r.events.some((e) => e.type === 'evidence')).toBe(false);
    expect(r.events).toContainEqual({ type: 'used', concepts: ['fire'], context: 'test' });
    // It still follows through on its announced fire move.
    expect(r.beats.some((b) => b.type === 'foeMove')).toBe(true);
    expect(r.state.milo.hp).toBeLessThan(30);
  });

  it('wind on fire: fans the flames, so its next fire move hits harder', () => {
    const { state } = begin();
    const r = chooseCommand(content, state, 'wind');
    expect(r.beats).toContainEqual({ type: 'fanned' });
    const move = r.beats.find((b) => b.type === 'foeMove');
    expect(move).toMatchObject({ ability: 'spit', boosted: true });
    expect(r.state.boost).toBe(1);
  });

  it('is deterministic from its seed and reshuffles tiles each round', () => {
    const a = chooseCommand(content, begin(5).state, 'wind');
    const b = chooseCommand(content, begin(5).state, 'wind');
    expect(a).toEqual(b);
    const orders = new Set<string>();
    let s = begin(5).state;
    for (let i = 0; i < 6 && s.outcome === 'ongoing'; i++) {
      orders.add(s.order.join());
      s = chooseCommand(content, s, 'wind').state;
    }
    expect(orders.size).toBeGreaterThan(1);
  });

  it('wins with water, paying XP; loses forgivingly if Milo runs out', () => {
    let s = begin().state;
    let last;
    while (s.outcome === 'ongoing') {
      last = chooseCommand(content, s, 'water');
      s = last.state;
    }
    expect(s.outcome).toBe('win');
    expect(last?.events).toContainEqual({ type: 'battleEnd', enemy: 'hog', result: 'win', xp: 20 });
    expect(last?.beats.at(-1)).toEqual({ type: 'end', result: 'win' });

    let l = begin().state;
    while (l.outcome === 'ongoing') l = chooseCommand(content, l, 'fire').state;
    expect(l.outcome).toBe('lose');
    expect(l.milo.hp).toBe(0);
  });

  it('ignores commands after the battle is over', () => {
    let s = begin().state;
    while (s.outcome === 'ongoing') s = chooseCommand(content, s, 'water').state;
    expect(chooseCommand(content, s, 'water')).toEqual({ state: s, beats: [], events: [] });
  });

  it('hints climb from a clue to icons to English, costing the counter word', () => {
    const { state } = begin();
    expect(battleHint(content, state, 1)).toMatchObject({ clue: 'Milo looks at the stream.', icons: false, glosses: false });
    expect(battleHint(content, state, 2)).toMatchObject({ icons: true, glosses: false });
    const h3 = battleHint(content, state, 3);
    expect(h3.glosses).toBe(true);
    expect(h3.events).toEqual([{ type: 'hint', concepts: ['water'], rung: 3 }]);
  });
});
