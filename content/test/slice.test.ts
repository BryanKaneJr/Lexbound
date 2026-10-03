import { describe, expect, it } from 'vitest';
import {
  advance,
  applyEvents,
  chooseCommand,
  chooseEncounter,
  createRng,
  currentStep,
  miloLevel,
  miloMaxHp,
  newSave,
  nextStory,
  scaffoldLevel,
  startBattle,
  startEncounter,
  tilePresentation,
  type EncounterInput,
  type EncounterRun,
  type GameEvent,
  type Save,
} from '@lexbound/core';
import { content } from '../index';

/**
 * Plays the vertical slice (bible §75) through the real engines and content,
 * the way a first-time player would, and checks the moments that matter:
 * acqua is learned in context before the battle, the ACQUA tile has lost its
 * icon by then while the untaught elements keep theirs, water wins, and the
 * story moves on.
 */

let now = 1_700_000_000_000;

class Player {
  save: Save = newSave(now, 7);
  run: EncounterRun | undefined;
  heard: string[] = [];

  apply(events: GameEvent[]) {
    for (const e of events) if (e.type === 'heard') this.heard.push(e.line);
    this.save = applyEvents(this.save, content, events, now).save;
    now += 15_000;
  }

  start(id: string) {
    const r = startEncounter(content, id, this.save);
    this.apply(r.events);
    this.run = r.run;
  }

  explore(location: string) {
    const pick = chooseEncounter(content, this.save, location, now, this.save.seed);
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

  level(concept: string) {
    return scaffoldLevel(this.save.concepts[concept], now);
  }
}

describe('the vertical slice', () => {
  const p = new Player();

  it('meets Milo at the Lodge: "Ciao!"', () => {
    p.start('lodge.intro');
    p.choose('Ciao');
    p.until();
    expect(p.run?.done).toBe(true);
    expect(p.save.flags['intro.done']).toBe(true);
    expect(p.save.items.flask).toBe(1);
    expect(p.heard).toContain('milo.ciao');
    expect(p.save.concepts.hello?.successes).toBe(1);
  });

  it('Whisperwood opens with guarda and vieni', () => {
    expect(p.explore('whisperwood')).toBe('ww.first_steps');
    expect(p.until('tap')?.type).toBe('tap');
    p.input({ type: 'tap', prop: 'mushroom' });
    expect(p.until('tap')?.type).toBe('tap');
    p.input({ type: 'tap', prop: 'bush' });
    p.choose('Stay put');
    p.choose('Follow');
    p.until();
    expect(p.save.items.shiny_stone).toBe(1);
    expect(p.save.concepts.look?.successes).toBe(1);
    expect(p.save.concepts.come?.successes).toBe(1);
  });

  it('the stream introduces acqua with no English anywhere', () => {
    expect(p.explore('whisperwood')).toBe('ww.stream');
    p.choose('Splash');
    p.until();
    expect(p.save.concepts.water?.exposures).toBeGreaterThanOrEqual(2);
    // Heard twice in one place: lighter than brand new, but never "known" without being used.
    expect(p.level('water')).toBe(2);
  });

  it('Milo asks for acqua on a hot path; the wrong things teach by contrast', () => {
    expect(p.explore('whisperwood')).toBe('ww.thirsty');
    expect(p.until('give')?.type).toBe('give');
    p.input({ type: 'give', item: 'stick' });
    expect(p.until('give')?.type).toBe('give');
    p.input({ type: 'give', item: 'flask' });
    p.until();
    expect(p.save.concepts.water?.successes).toBe(1);
  });

  it('by the first battle, ACQUA has lost its icon and the untaught elements keep theirs', () => {
    const settings = { persistentIcons: false };
    expect(p.level('water')).toBeLessThanOrEqual(1);
    expect(tilePresentation(p.level('water'), settings).icon).toBe(false);
    for (const c of ['fire', 'earth', 'wind']) expect(tilePresentation(p.level(c), settings).icon).toBe(true);
  });

  it('the Emberhog announces "Fuoco!"; ACQUA douses it and wins', () => {
    expect(p.explore('whisperwood')).toBe('ww.emberhog');
    expect(p.until('battle')?.type).toBe('battle');
    const level = miloLevel(p.save);
    let b = startBattle(content, 'emberhog', { level, maxHp: miloMaxHp(content, level), context: 'ww.emberhog', seed: p.save.seed });
    p.apply(b.events);
    expect(b.beats).toContainEqual({ type: 'say', speaker: 'emberhog', line: 'emberhog.fuoco' });
    let rounds = 0;
    while (b.state.outcome === 'ongoing') {
      b = chooseCommand(content, b.state, 'water');
      p.apply(b.events);
      rounds++;
      if (rounds === 1) expect(b.beats).toContainEqual({ type: 'countered', ability: 'flame_spit' });
    }
    expect(b.state.outcome).toBe('win');
    expect(rounds).toBe(3);
    expect(b.state.milo.hp).toBeGreaterThan(0);
    p.input({ type: 'battle', result: 'win' });
    p.until();
    expect(p.save.flags['ww.emberhog.won']).toBe(true);
    expect(p.heard).toContain('emberhog.found');
    expect(p.save.milo.xp).toBeGreaterThanOrEqual(30);
  });

  it('back at camp Milo retells it; at the Lodge the chapter closes', () => {
    expect(nextStory(content, p.save, 'camp')?.id).toBe('camp.retell');
    p.start('camp.retell');
    p.choose('Laugh');
    p.until();
    expect(nextStory(content, p.save, 'camp')).toBeUndefined();

    expect(p.explore('lodge')).toBe('lodge.report');
    p.choose('He wants water');
    p.until();
    expect(p.save.flags['chapter1.done']).toBe(true);
    expect(p.save.journal.entries).toEqual(expect.arrayContaining(['story.met_milo', 'story.emberhog', 'story.report']));
  });

  it('afterwards, Whisperwood keeps offering varied encounters', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const id = p.explore('whisperwood');
      seen.add(id);
      expect(content.encounter.get(id)?.kind).toBe('explore');
      // Bail out of whatever it is: we only care what gets picked.
      p.run = undefined;
    }
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });
});

describe('every encounter can always be finished', () => {
  it('a player pressing random things never gets stuck', () => {
    for (const enc of content.encounters) {
      for (let trial = 0; trial < 25; trial++) {
        const rng = createRng(trial * 7919 + enc.id.length);
        let save: Save = newSave(now, trial);
        const apply = (events: GameEvent[]) => {
          save = applyEvents(save, content, events, now).save;
        };
        const start = startEncounter(content, enc.id, save);
        apply(start.events);
        let run = start.run;
        let steps = 0;
        while (!run.done) {
          if (++steps > 400) throw new Error(`${enc.id} (trial ${trial}) never ends`);
          const step = currentStep(content, run);
          let input: EncounterInput;
          switch (step?.type) {
            case 'choice':
              input = { type: 'choose', option: Math.floor(rng() * step.options.length) };
              break;
            case 'tap': {
              const visible = run.scene.props.filter((x) => !x.hidden);
              input = { type: 'tap', prop: visible[Math.floor(rng() * visible.length)]?.id ?? '' };
              break;
            }
            case 'give':
              input = { type: 'give', item: step.items[Math.floor(rng() * step.items.length)]!.item };
              break;
            case 'battle':
              input = { type: 'battle', result: rng() < 0.5 ? 'win' : 'lose' };
              break;
            default:
              input = { type: 'continue' };
          }
          const r = advance(content, run, input, save);
          apply(r.events);
          run = r.run;
        }
      }
    }
  });
});
