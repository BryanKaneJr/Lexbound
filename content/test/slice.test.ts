import { describe, expect, it } from 'vitest';
import {
  advance,
  applyEvents,
  chooseCommand,
  comprehension,
  createRng,
  currentStep,
  isTransfer,
  miloLevel,
  miloMaxHp,
  newSave,
  nextStory,
  startBattle,
  startEncounter,
  tilePresentation,
  visibleNotes,
  type EncounterInput,
  type GameEvent,
  type Save,
} from '@lexbound/core';
import { content } from '../index';
import { Player, START } from './player';

/**
 * Plays Chapter One through the real engines and content, the way a
 * first-time player would, and checks the moments the language design
 * bible asks the MVP to prove (§79): acqua is inferred in context before the
 * battle and its icon is gone by then; Milo's word for hunger comes back
 * from a wild Pebblit (cross-creature transfer); a Translator misreads his
 * own Lexling; enemy speech pays in battle; and the strange lines wait in
 * the journal.
 */

describe('chapter one', () => {
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

  it('first night at camp: "Fame...", the wrong thing first, then a line nobody can follow yet', () => {
    expect(nextStory(content, p.save, 'camp')?.id).toBe('camp.first_meal');
    p.start('camp.first_meal');
    expect(p.until('give')?.type).toBe('give');
    p.input({ type: 'give', item: 'stick' });
    expect(p.until('give')?.type).toBe('give');
    p.input({ type: 'give', item: 'sunberries' });
    p.until();
    expect(p.save.concepts.hungry?.successes).toBe(1);
    expect(p.save.concepts.no?.exposures).toBeGreaterThan(0);
    expect(p.heard).toContain('milo.memory');
    expect(p.save.flags['camp.first_meal.done']).toBe(true);
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
    // Heard twice, but in one situation only: still just exposure.
    expect(comprehension(p.save.concepts.water, p.now)).toBe('exposed');
    expect(p.level('water')).toBe(3);
  });

  it("a wild Pebblit says Milo's word: the first cross-creature transfer", () => {
    expect(isTransfer(p.save.concepts.hungry, 'pebblit', p.now)).toBe(true);
    expect(p.explore('whisperwood')).toBe('ww.hungry_pebblit');
    expect(p.until('give')?.type).toBe('give');
    expect([...(p.save.concepts.hungry?.speakers ?? [])].sort()).toEqual(['milo', 'pebblit']);
    p.input({ type: 'give', item: 'sunberries' });
    p.until();
    expect(p.save.concepts.hungry?.successes).toBe(2);
    expect(p.save.lexlings.pebblit?.befriended).toBe(true);
    expect(visibleNotes(content, p.save).map((n) => n.id)).toContain('note.fame.transfer');
  });

  it('Milo asks for acqua on a hot path; the wrong things teach by contrast', () => {
    expect(p.explore('whisperwood')).toBe('ww.thirsty');
    expect(p.until('give')?.type).toBe('give');
    p.input({ type: 'give', item: 'stick' });
    expect(p.until('give')?.type).toBe('give');
    p.input({ type: 'give', item: 'flask' });
    p.until();
    expect(comprehension(p.save.concepts.water, p.now)).toBe('demonstrated');
  });

  it('by the first battle, ACQUA has lost its icon and the untaught elements keep theirs', () => {
    const settings = { persistentIcons: false };
    expect(p.level('water')).toBe(1);
    expect(tilePresentation(p.level('water'), settings).icon).toBe(false);
    for (const c of ['fire', 'earth', 'wind']) expect(tilePresentation(p.level(c), settings).icon).toBe(true);
  });

  it('the Emberhog announces each move: ACQUA douses "Fuoco!", TERRA walls off "All\'attacco!"', () => {
    expect(p.explore('whisperwood')).toBe('ww.emberhog');
    expect(p.until('battle')?.type).toBe('battle');
    const level = miloLevel(p.save);
    let b = startBattle(content, 'emberhog', { level, maxHp: miloMaxHp(content, level), context: 'ww.emberhog', seed: p.save.seed });
    p.apply(b.events);
    expect(b.beats).toContainEqual({ type: 'say', speaker: 'emberhog', line: 'emberhog.fuoco' });
    const plan = { flame_spit: 'water', charge: 'earth' } as Record<string, string>;
    let rounds = 0;
    while (b.state.outcome === 'ongoing') {
      const announced = content.lexling.get('emberhog')!.battle!.moves[b.state.intent]!.ability;
      b = chooseCommand(content, b.state, plan[announced]!);
      p.apply(b.events);
      rounds++;
      if (rounds === 1) expect(b.beats).toContainEqual({ type: 'countered', ability: 'flame_spit', by: 'water' });
      if (rounds === 2) expect(b.beats).toContainEqual({ type: 'countered', ability: 'charge', by: 'earth' });
    }
    expect(b.state.outcome).toBe('win');
    expect(rounds).toBe(3);
    // Listening paid: nothing landed on Milo.
    expect(b.state.milo.hp).toBe(b.state.milo.maxHp);
    // Walling off the charge, instead of the obvious water, shows the announcement was understood.
    expect(comprehension(p.save.concepts.attack, p.now)).toBe('demonstrated');
    p.input({ type: 'battle', result: 'win' });
    p.until();
    expect(p.save.flags['ww.emberhog.won']).toBe(true);
    expect(p.heard).toContain('emberhog.found');
    expect(p.save.milo.xp).toBeGreaterThanOrEqual(30);
  });

  it('back at camp Milo retells it, playing the Emberhog himself', () => {
    expect(nextStory(content, p.save, 'camp')?.id).toBe('camp.retell');
    p.start('camp.retell');
    p.choose('Laugh');
    p.until();
    expect([...(p.save.concepts.attack?.speakers ?? [])].sort()).toEqual(['emberhog', 'milo']);
    expect(nextStory(content, p.save, 'camp')).toBeUndefined();
  });

  it('two Puffkins whisper about Milo', () => {
    expect(p.explore('whisperwood')).toBe('ww.whispers');
    p.choose('Wave');
    p.until();
    expect(p.heard).toEqual(expect.arrayContaining(['puffkin.whisper.guarda', 'puffkin.whisper.si']));
    expect(p.save.concepts.look?.speakers).toContain('puffkin');
  });

  it("at the Lodge, Pip misreads his own Lexling; the player can tell", () => {
    expect(p.explore('lodge')).toBe('lodge.report');
    p.choose('Offer Bluster a sunberry');
    p.until();
    expect([...(p.save.concepts.hungry?.speakers ?? [])].sort()).toEqual(['milo', 'pebblit', 'puffkin']);
    expect(p.save.flags['chapter1.done']).toBe(true);
    expect(p.save.journal.entries).toEqual(expect.arrayContaining(['story.met_milo', 'story.first_night', 'story.pebblit', 'story.emberhog', 'story.whispers', 'story.report']));
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
        let save: Save = newSave(START, trial);
        const apply = (events: GameEvent[]) => {
          save = applyEvents(save, content, events, START).save;
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
