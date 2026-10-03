import { createRng, nextSeed, pick, shuffle, type Rng } from './rng';
import type { GameEvent } from './save';
import type { Content, EffectEntry, Lexling, Reactions } from './schema';

/**
 * The battle engine (bible §11-18, Phase 5). Turn-based: each round the enemy
 * announces its move (speech plus a visible wind-up), the player tells Milo
 * what to do with a command tile, Milo acts first, then the enemy follows
 * through unless Milo's element put its move out.
 *
 * Language is the interface, not a quiz: a command is never "right" or
 * "wrong". Fire on a fire Lexling heals it (and it thanks you); wind fans its
 * flames; water douses them. The world shows the mistake (bible §18).
 *
 * The engine knows combat only. It returns:
 *   beats:  what happened, in order, for the app to animate;
 *   events: GameEvents for the save (lines heard, words used, evidence).
 */

export type Effectiveness = 'strong' | 'normal' | 'weak' | 'absorbed';

export type Beat =
  | { type: 'say'; speaker: string; line: string }
  | { type: 'windup'; move: string; windup: string; element: string | null }
  | { type: 'command'; command: string; ability: string; element: string | null }
  | { type: 'hit'; target: 'milo' | 'foe'; amount: number; effect: Effectiveness; element: string | null }
  | { type: 'heal'; target: 'milo' | 'foe'; amount: number }
  | { type: 'fanned' }
  | { type: 'countered'; ability: string }
  | { type: 'foeMove'; ability: string; element: string | null; boosted: boolean }
  | { type: 'end'; result: 'win' | 'lose' };

export type BattleState = {
  enemy: string;
  /** Context id for the language engine (the encounter that started it). */
  context: string;
  round: number;
  milo: { hp: number; maxHp: number; level: number };
  foe: { hp: number; maxHp: number; level: number; element: string };
  /** Index into the enemy's moves: what it announced for this round. */
  intent: number;
  patternAt: number;
  /** Multiplier on the foe's next move of its own element (wind fanned its flames). */
  boost: number;
  seed: number;
  /** Command ids in the order the tiles appear this round (shuffled: bible §13). */
  order: string[];
  outcome: 'ongoing' | 'win' | 'lose';
};

export type BattleResult = { state: BattleState; beats: Beat[]; events: GameEvent[] };

export const BATTLE = {
  /** Fanned flames hit this much harder. */
  fanBoost: 1.5,
  /** Absorbed attacks heal this share of their power. */
  absorbShare: 0.5,
  /** Damage varies by up to this much either way. */
  variance: 0.1,
  /** Enemy power per level above 1. */
  foePowerPerLevel: 0.12,
  /** Milo mentions he's hurt below this share of his health. */
  lowHp: 0.35,
  /** Chance Milo warns you after an enemy announces a move. */
  warnChance: 0.5,
} as const;

function foeData(content: Content, enemy: string): Lexling & { battle: NonNullable<Lexling['battle']> } {
  const l = content.lexling.get(enemy);
  if (!l?.battle) throw new Error(`"${enemy}" can't battle`);
  return l as Lexling & { battle: NonNullable<Lexling['battle']> };
}

export function chartEntry(content: Content, attacker: string | null, defender: string | null): EffectEntry {
  if (!attacker || !defender) return { multiplier: 1 };
  return content.elements.chart[attacker]?.[defender] ?? { multiplier: 1 };
}

function effectivenessOf(entry: EffectEntry): Effectiveness {
  if (entry.effect === 'absorb') return 'absorbed';
  if (entry.multiplier >= 2) return 'strong';
  if (entry.multiplier < 1) return 'weak';
  return 'normal';
}

/** The commands that hit this foe hardest (the counters). Empty if nothing beats neutral. */
export function bestCommands(content: Content, foeElement: string): string[] {
  let best = 1;
  let ids: string[] = [];
  for (const cmd of content.milo.commands) {
    const ability = content.ability.get(cmd.ability);
    const entry = chartEntry(content, ability?.element ?? null, foeElement);
    const m = entry.effect === 'absorb' ? 0 : entry.multiplier;
    if (m > best) {
      best = m;
      ids = [cmd.id];
    } else if (m === best && best > 1) ids.push(cmd.id);
  }
  return ids;
}

function say(beats: Beat[], events: GameEvent[], content: Content, context: string, pool: string[], rng: Rng): void {
  if (pool.length === 0) return;
  const id = pick(pool, rng);
  const line = content.line.get(id);
  if (!line) return;
  beats.push({ type: 'say', speaker: line.speaker, line: id });
  events.push({ type: 'heard', line: id, context });
}

function vary(n: number, rng: Rng): number {
  return n * (1 - BATTLE.variance + rng() * 2 * BATTLE.variance);
}

function announce(content: Content, state: BattleState, beats: Beat[], events: GameEvent[], rng: Rng): void {
  const foe = foeData(content, state.enemy);
  const move = foe.battle.moves[state.intent];
  if (!move) return;
  const ability = content.ability.get(move.ability);
  beats.push({ type: 'windup', move: move.ability, windup: move.windup, element: ability?.element ?? null });
  if (move.telegraph) {
    say(beats, events, content, state.context, [move.telegraph], rng);
    if (rng() < BATTLE.warnChance) say(beats, events, content, state.context, content.milo.reactions.warn, rng);
  }
}

export function startBattle(content: Content, enemy: string, opts: { level: number; maxHp: number; context: string; seed: number }): BattleResult {
  const foe = foeData(content, enemy);
  const rng = createRng(opts.seed);
  const first = foe.battle.pattern[0] ?? 0;
  const state: BattleState = {
    enemy,
    context: opts.context,
    round: 1,
    milo: { hp: opts.maxHp, maxHp: opts.maxHp, level: opts.level },
    foe: { hp: foe.battle.hp, maxHp: foe.battle.hp, level: foe.battle.level, element: foe.element },
    intent: first,
    patternAt: 0,
    boost: 1,
    seed: 0,
    order: shuffle(
      content.milo.commands.map((c) => c.id),
      rng,
    ),
    outcome: 'ongoing',
  };
  const beats: Beat[] = [];
  const events: GameEvent[] = [];
  say(beats, events, content, opts.context, foe.battle.reactions.start, rng);
  say(beats, events, content, opts.context, content.milo.reactions.start, rng);
  announce(content, state, beats, events, rng);
  return { state: { ...state, seed: nextSeed(rng) }, beats, events };
}

function react(content: Content, state: BattleState, key: keyof Reactions, beats: Beat[], events: GameEvent[], rng: Rng, who: 'foe' | 'milo' | 'both' = 'both'): void {
  const foe = foeData(content, state.enemy);
  if (who !== 'milo') say(beats, events, content, state.context, foe.battle.reactions[key], rng);
  if (who !== 'foe') say(beats, events, content, state.context, content.milo.reactions[key], rng);
}

/** One round: Milo performs the command, then the foe follows through on what it announced. */
export function chooseCommand(content: Content, prev: BattleState, commandId: string): BattleResult {
  if (prev.outcome !== 'ongoing') return { state: prev, beats: [], events: [] };
  const cmd = content.milo.commands.find((c) => c.id === commandId);
  if (!cmd) throw new Error(`Unknown command "${commandId}"`);
  const ability = content.ability.get(cmd.ability);
  if (!ability) throw new Error(`Unknown ability "${cmd.ability}"`);
  const foe = foeData(content, prev.enemy);
  const rng = createRng(prev.seed);
  const beats: Beat[] = [];
  const events: GameEvent[] = [];
  let state: BattleState = { ...prev, milo: { ...prev.milo }, foe: { ...prev.foe } };

  // Telling Milo something and watching him do it is an exposure to its words.
  events.push({ type: 'used', concepts: cmd.concepts, context: state.context });
  // Choosing the counter is evidence the player understood it. Anything else is
  // just an experiment: the player may know exactly what fuoco means.
  if (bestCommands(content, state.foe.element).includes(cmd.id)) {
    for (const c of cmd.concepts) events.push({ type: 'evidence', concept: c, result: 'success', context: state.context });
  }

  beats.push({ type: 'command', command: cmd.id, ability: ability.id, element: ability.element });
  const power = ability.power * (1 + content.milo.powerPerLevel * (state.milo.level - 1));
  const entry = chartEntry(content, ability.element, state.foe.element);
  const effect = effectivenessOf(entry);

  if (effect === 'absorbed') {
    const heal = Math.min(state.foe.maxHp - state.foe.hp, Math.round(power * BATTLE.absorbShare));
    beats.push({ type: 'hit', target: 'foe', amount: 0, effect, element: ability.element });
    if (heal > 0) beats.push({ type: 'heal', target: 'foe', amount: heal });
    state.foe.hp += heal;
    react(content, state, 'absorbed', beats, events, rng);
  } else {
    const dmg = Math.max(1, Math.round(vary(power * entry.multiplier, rng)));
    state.foe.hp = Math.max(0, state.foe.hp - dmg);
    beats.push({ type: 'hit', target: 'foe', amount: dmg, effect, element: ability.element });
    if (entry.effect === 'fan') {
      state.boost = BATTLE.fanBoost;
      beats.push({ type: 'fanned' });
      if (state.foe.hp > 0) react(content, state, 'fanned', beats, events, rng);
    } else if (state.foe.hp > 0 && effect === 'strong') react(content, state, 'strong', beats, events, rng);
    else if (state.foe.hp > 0 && effect === 'weak') react(content, state, 'weak', beats, events, rng);
  }

  // Did Milo's element put out what the foe was winding up? (Water douses a fire move.)
  const move = foe.battle.moves[state.intent];
  const moveAbility = move ? content.ability.get(move.ability) : undefined;
  const countered = !!moveAbility && chartEntry(content, ability.element, moveAbility.element).multiplier >= 2;

  if (state.foe.hp <= 0) {
    state.outcome = 'win';
    react(content, state, 'defeat', beats, events, rng, 'foe');
    react(content, state, 'victory', beats, events, rng, 'milo');
    beats.push({ type: 'end', result: 'win' });
    events.push({ type: 'battleEnd', enemy: state.enemy, result: 'win', xp: foe.battle.xp });
    return { state: { ...state, seed: nextSeed(rng) }, beats, events };
  }

  if (countered && moveAbility) {
    beats.push({ type: 'countered', ability: moveAbility.id });
    react(content, state, 'countered', beats, events, rng, 'milo');
    state.boost = 1;
  } else if (moveAbility) {
    const boosted = state.boost > 1 && moveAbility.element === state.foe.element;
    const foePower = moveAbility.power * (1 + BATTLE.foePowerPerLevel * (state.foe.level - 1)) * (boosted ? state.boost : 1);
    const dmg = Math.max(1, Math.round(vary(foePower, rng)));
    const wasHigh = state.milo.hp > state.milo.maxHp * BATTLE.lowHp;
    beats.push({ type: 'foeMove', ability: moveAbility.id, element: moveAbility.element, boosted });
    state.milo.hp = Math.max(0, state.milo.hp - dmg);
    beats.push({ type: 'hit', target: 'milo', amount: dmg, effect: 'normal', element: moveAbility.element });
    if (boosted) state.boost = 1;
    if (state.milo.hp <= 0) {
      state.outcome = 'lose';
      react(content, state, 'victory', beats, events, rng, 'foe');
      react(content, state, 'defeat', beats, events, rng, 'milo');
      beats.push({ type: 'end', result: 'lose' });
      events.push({ type: 'battleEnd', enemy: state.enemy, result: 'lose', xp: 0 });
      return { state: { ...state, seed: nextSeed(rng) }, beats, events };
    }
    if (wasHigh && state.milo.hp <= state.milo.maxHp * BATTLE.lowHp) react(content, state, 'lowHp', beats, events, rng, 'milo');
  }

  // Next round: the foe announces its next move, and the tiles reshuffle.
  const patternAt = state.patternAt + 1;
  state = {
    ...state,
    round: state.round + 1,
    patternAt,
    intent: foe.battle.pattern[patternAt % foe.battle.pattern.length] ?? 0,
    order: shuffle(state.order, rng),
  };
  announce(content, state, beats, events, rng);
  return { state: { ...state, seed: nextSeed(rng) }, beats, events };
}

/**
 * The battle's hint ladder (bible §56). Rung 1: Milo's context clue (free).
 * Rung 2: icons on every tile. Rung 3: the English meaning under each tile.
 * Each rung records a hint against the counter's words.
 */
export function battleHint(content: Content, state: BattleState, rung: 1 | 2 | 3): { clue?: string; icons: boolean; glosses: boolean; events: GameEvent[] } {
  const foe = foeData(content, state.enemy);
  const counters = bestCommands(content, state.foe.element);
  const concepts = content.milo.commands.filter((c) => counters.includes(c.id)).flatMap((c) => c.concepts);
  return {
    clue: foe.battle.clue,
    icons: rung >= 2,
    glosses: rung >= 3,
    events: concepts.length ? [{ type: 'hint', concepts, rung }] : [],
  };
}
