import { describe, expect, it } from 'vitest';
import { bestCommands, chooseCommand, miloMaxHp, startBattle, type BattleState } from '@lexbound/core';
import { content } from '../index';
import { announced, type Plan } from './player';

/**
 * Battle balance (bible §31, language bible §30): listening always pays,
 * and a beginner who ignores the words can still win with levels. Each
 * strategy is played over many seeds at the level a player usually is when
 * they meet the fight.
 */

const counterTo = (s: BattleState) => {
  const move = content.ability.get(announced(s))!;
  const key = move.element ?? 'physical';
  return content.milo.commands.find((c) => content.ability.get(c.ability)!.counters.includes(key))?.id;
};
const best = (s: BattleState) => bestCommands(content, s.foe.element)[0] ?? 'water';

const plans: Record<string, Plan> = {
  /** Always the obvious elemental matchup, never a verb. */
  ignore: (s) => ({ command: best(s) }),
  /** Listens: shields against what no attack can stop, counters the rest, and follows a held shield with an attack. */
  listen: (s) => {
    const counter = counterTo(s);
    if (content.ability.get(announced(s))!.unstoppable && counter) return { command: counter, verb: 'defend' };
    if (s.steady) return { command: best(s), verb: 'attack' };
    return { command: counter ?? best(s) };
  },
};

function play(enemy: string, level: number, plan: Plan, seeds = 60) {
  let wins = 0;
  let hpLeft = 0;
  for (let seed = 1; seed <= seeds; seed++) {
    let s = startBattle(content, enemy, { level, maxHp: miloMaxHp(content, level), context: 'test', seed, verbs: ['attack', 'defend'] }).state;
    while (s.outcome === 'ongoing') {
      const { command, verb } = plan(s);
      s = chooseCommand(content, s, command, verb).state;
    }
    if (s.outcome === 'win') {
      wins++;
      hpLeft += s.milo.hp / s.milo.maxHp;
    }
  }
  return { winRate: wins / seeds, hpLeft: wins ? hpLeft / wins : 0 };
}

describe('battle balance', () => {
  it('Bluster (a spar at level 1): anyone wins, and a wall against the gale saves most of the damage', () => {
    const listen = play('puffkin', 1, plans.listen!);
    const ignore = play('puffkin', 1, plans.ignore!);
    expect(listen.winRate).toBe(1);
    expect(ignore.winRate).toBe(1);
    expect(listen.hpLeft).toBeGreaterThan(ignore.hpLeft + 0.25);
  });

  it('the Cragling (level 2): countering what it announces takes no damage at all', () => {
    expect(play('cragling', 2, plans.listen!)).toEqual({ winRate: 1, hpLeft: 1 });
    expect(play('cragling', 2, plans.ignore!).winRate).toBe(1);
  });

  it('Old Cinderback (level 2): shielding the great fire wins; ignoring it loses until Milo is stronger', () => {
    const listen = play('cinderback', 2, plans.listen!);
    expect(listen.winRate).toBe(1);
    expect(listen.hpLeft).toBeGreaterThan(0.5);
    expect(play('cinderback', 2, plans.ignore!).winRate).toBe(0);
    // Levels still carry a player who never reads the words (bible §31, §39).
    expect(play('cinderback', 5, plans.ignore!).winRate).toBe(1);
  });
});
