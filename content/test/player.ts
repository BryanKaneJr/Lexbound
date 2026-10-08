import {
  advance,
  applyEvents,
  chooseCommand,
  chooseEncounter,
  currentStep,
  knownVerbs,
  miloLevel,
  miloMaxHp,
  newSave,
  scaffoldLevel,
  startBattle,
  startEncounter,
  type Beat,
  type BattleState,
  type EncounterInput,
  type EncounterRun,
  type GameEvent,
  type Save,
} from '@lexbound/core';
import { content } from '../index';

export const START = 1_700_000_000_000;

/** What to tell Milo this round: an element, and optionally a verb ("defend"). */
export type Plan = (state: BattleState) => { command: string; verb?: string };

/**
 * A player driving the real engines over the real content, the way the app
 * does: start an encounter, click through it, make choices, fight battles.
 * Every step moves the clock on a little, so comprehension sees real time.
 */
export class Player {
  now = START;
  save: Save = newSave(START, 7);
  run: EncounterRun | undefined;
  heard: string[] = [];
  beats: Beat[] = [];

  apply(events: GameEvent[]) {
    for (const e of events) if (e.type === 'heard') this.heard.push(e.line);
    this.save = applyEvents(this.save, content, events, this.now).save;
    this.now += 15_000;
  }

  /** Lets time pass (sleep, a few days away from the game). */
  wait(days: number) {
    this.now += days * 24 * 60 * 60 * 1000;
  }

  start(id: string) {
    const r = startEncounter(content, id, this.save);
    this.apply(r.events);
    this.run = r.run;
  }

  explore(location: string) {
    const pick = chooseEncounter(content, this.save, location, this.now, this.save.seed);
    this.apply([{ type: 'seed' }]);
    if (!pick.encounter) throw new Error(`nothing to do at ${location}`);
    this.start(pick.encounter.id);
    return pick.encounter.id;
  }

  step() {
    return this.run && currentStep(content, this.run);
  }

  input(input: EncounterInput) {
    if (!this.run) throw new Error('no encounter running');
    const r = advance(content, this.run, input, this.save);
    if (r.run === this.run) throw new Error(`input ${JSON.stringify(input)} did nothing at ${JSON.stringify(this.step())}`);
    this.apply(r.events);
    this.run = r.run;
  }

  /** Clicks through narration and speech until a decision (or the end). */
  until(type?: string) {
    for (let i = 0; i < 100; i++) {
      const s = this.step();
      if (!s || s.type === type) return s;
      if (['narrate', 'talk', 'say', 'act'].includes(s.type)) this.input({ type: 'continue' });
      else return s;
    }
    throw new Error('stuck');
  }

  choose(label: string) {
    const s = this.until('choice');
    if (s?.type !== 'choice') throw new Error(`expected a choice, got ${s?.type}`);
    const i = s.options.findIndex((o) => o.label.includes(label));
    if (i < 0) throw new Error(`no option "${label}"`);
    this.input({ type: 'choose', option: i });
  }

  /** Fights the encounter's battle the way `plan` says, then hands the result back to the encounter. */
  fight(plan: Plan): BattleState {
    const s = this.until('battle');
    if (s?.type !== 'battle' || !this.run) throw new Error(`expected a battle, got ${s?.type}`);
    const level = miloLevel(this.save);
    let b = startBattle(content, s.enemy, { level, maxHp: miloMaxHp(content, level), context: this.run.encounter, seed: this.save.seed, verbs: knownVerbs(content, this.save.flags) });
    this.apply([...b.events, { type: 'seed' }]);
    this.beats = [...b.beats];
    while (b.state.outcome === 'ongoing') {
      const { command, verb } = plan(b.state);
      b = chooseCommand(content, b.state, command, verb);
      this.apply(b.events);
      this.beats.push(...b.beats);
      if (b.state.round > 50) throw new Error('battle never ends');
    }
    this.input({ type: 'battle', result: b.state.outcome === 'win' ? 'win' : 'lose' });
    return b.state;
  }

  level(concept: string) {
    return scaffoldLevel(this.save.concepts[concept], this.now);
  }
}

/** The ability a foe announced for this round. */
export function announced(state: BattleState): string {
  return content.lexling.get(state.enemy)!.battle!.moves[state.intent]!.ability;
}

/** Plays Chapter One along its main path, for tests that start after it. */
export function playChapterOne(p: Player) {
  p.start('lodge.intro');
  p.choose('Wave');
  p.until();
  p.start('camp.first_meal');
  p.until('give');
  p.input({ type: 'give', item: 'sunberries' });
  p.until();
  p.explore('whisperwood');
  p.until('tap');
  p.input({ type: 'tap', prop: 'bush' });
  p.choose('Follow');
  p.until();
  p.explore('whisperwood');
  p.choose('Splash');
  p.until();
  p.explore('whisperwood');
  p.until('give');
  p.input({ type: 'give', item: 'sunberries' });
  p.until();
  p.explore('whisperwood');
  p.until('give');
  p.input({ type: 'give', item: 'flask' });
  p.until();
  p.explore('whisperwood');
  const plan: Record<string, string> = { flame_spit: 'water', charge: 'earth' };
  p.fight((s) => ({ command: plan[announced(s)] ?? 'water' }));
  p.until();
  p.start('camp.retell');
  p.choose('Laugh');
  p.until();
  p.explore('whisperwood');
  p.choose('Wave');
  p.until();
  p.explore('lodge');
  p.choose('Offer Bluster a sunberry');
  p.until();
  if (!p.save.flags['chapter1.done']) throw new Error('chapter one did not finish');
}
