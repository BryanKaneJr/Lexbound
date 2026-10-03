import { describe, expect, it } from 'vitest';
import { advance, applyEvents, currentStep, encounterConcepts, newSave, startEncounter, type ContentInput, type GameEvent, type Save } from '../src';
import { fixture } from './fixture';

const T = 1_700_000_000_000;

const encounter: NonNullable<ContentInput['encounters']>[number] = {
  id: 'wood.test',
  location: 'wood',
  title: 'Test',
  kind: 'explore',
  repeatable: true,
  scene: {
    background: 'forest',
    props: [
      { id: 'bush', art: 'bush', x: 0.7, y: 0.9 },
      { id: 'rock', art: 'rock', x: 0.2, y: 0.9 },
      { id: 'gem', art: 'gem', x: 0.7, y: 0.9, hidden: true },
    ],
    actors: [{ id: 'milo', art: 'milo', x: 0.4, y: 0.9 }],
  },
  steps: [
    { type: 'narrate', text: 'A wood.' },
    { type: 'say', line: 'milo.guarda', look: 'bush', mood: 'excited' },
    {
      id: 'tap',
      type: 'tap',
      targets: [{ prop: 'bush', goto: 'found', evidence: [{ concept: 'look', result: 'success' }] }],
      otherwise: { goto: 'again' },
    },
    { id: 'again', type: 'say', line: 'milo.guarda', next: 'tap' },
    { id: 'found', type: 'stage', show: ['gem'] },
    {
      type: 'choice',
      options: [
        { label: 'Take it', goto: 'took', effects: { flags: ['took'] } },
        { label: 'Leave it', goto: 'check' },
      ],
    },
    { id: 'took', type: 'reward', effects: { bond: 2 } },
    { id: 'check', type: 'branch', if: { flags: ['took'] }, then: 'give', else: 'skip' },
    {
      id: 'give',
      type: 'give',
      items: [
        { item: 'flask', goto: 'happy', evidence: [{ concept: 'water', result: 'success' }] },
        { item: 'stick', goto: 'give', evidence: [{ concept: 'water', result: 'fail' }] },
      ],
    },
    { id: 'happy', type: 'say', line: 'milo.acqua' },
    { type: 'battle', enemy: 'hog', win: 'won', lose: 'lost' },
    { id: 'won', type: 'end' },
    { id: 'lost', type: 'end', complete: false },
    { id: 'skip', type: 'end' },
  ],
};

function play() {
  const content = fixture({ encounters: [encounter] });
  let save: Save = newSave(T, 1);
  const all: GameEvent[] = [];
  const apply = (events: GameEvent[]) => {
    all.push(...events);
    save = applyEvents(save, content, events, T).save;
  };
  const start = startEncounter(content, 'wood.test', save);
  apply(start.events);
  let run = start.run;
  const go = (input: Parameters<typeof advance>[2]) => {
    const r = advance(content, run, input, save);
    apply(r.events);
    run = r.run;
    return r;
  };
  return { content, go, get run() { return run; }, get save() { return save; }, all };
}

describe('encounter engine', () => {
  it('stops on presentational steps and records the start', () => {
    const p = play();
    expect(currentStep(p.content, p.run)?.type).toBe('narrate');
    expect(p.all[0]).toEqual({ type: 'encounterStart', encounter: 'wood.test', location: 'wood' });
    expect(p.save.explores.wood).toBe(1);
  });

  it('landing on a creature line exposes its concepts and sets the mood', () => {
    const p = play();
    p.go({ type: 'continue' });
    expect(currentStep(p.content, p.run)?.type).toBe('say');
    expect(p.all.at(-1)).toEqual({ type: 'heard', line: 'milo.guarda', context: 'wood.test' });
    expect(p.save.concepts.look?.exposures).toBe(1);
    expect(p.run.scene.actors.find((a) => a.id === 'milo')?.mood).toBe('excited');
  });

  it('ignores input that does not fit the step', () => {
    const p = play();
    const before = p.run;
    const r = p.go({ type: 'choose', option: 0 });
    expect(r.run).toBe(before);
    expect(r.events).toEqual([]);
  });

  it('tapping elsewhere loops back; tapping the target records evidence and restages', () => {
    const p = play();
    p.go({ type: 'continue' });
    p.go({ type: 'continue' });
    expect(currentStep(p.content, p.run)?.type).toBe('tap');
    p.go({ type: 'tap', prop: 'rock' });
    expect(currentStep(p.content, p.run)?.id).toBe('again');
    p.go({ type: 'continue' });
    expect(currentStep(p.content, p.run)?.id).toBe('tap');
    p.go({ type: 'tap', prop: 'gem' }); // hidden: not tappable
    expect(currentStep(p.content, p.run)?.id).toBe('tap');
    p.go({ type: 'tap', prop: 'bush' });
    expect(p.save.concepts.look?.successes).toBe(1);
    expect(p.run.scene.props.find((x) => x.id === 'gem')?.hidden).toBe(false);
    expect(currentStep(p.content, p.run)?.type).toBe('choice');
  });

  it('a branch sees the flag set by the option chosen in the same advance', () => {
    const p = play();
    p.go({ type: 'continue' });
    p.go({ type: 'continue' });
    p.go({ type: 'tap', prop: 'bush' });
    p.go({ type: 'choose', option: 0 });
    expect(p.save.flags.took).toBe(true);
    expect(p.save.milo.bond).toBe(2);
    expect(currentStep(p.content, p.run)?.id).toBe('give');
  });

  it('give: the wrong thing costs the concept and asks again; the right thing moves on', () => {
    const p = play();
    p.go({ type: 'continue' });
    p.go({ type: 'continue' });
    p.go({ type: 'tap', prop: 'bush' });
    p.go({ type: 'choose', option: 0 });
    p.go({ type: 'give', item: 'stick' });
    expect(currentStep(p.content, p.run)?.id).toBe('give');
    expect(p.save.concepts.water?.failures).toBe(1);
    p.go({ type: 'give', item: 'flask' });
    expect(p.save.concepts.water?.successes).toBe(1);
    expect(currentStep(p.content, p.run)?.id).toBe('happy');
  });

  it('battle results route the encounter; a lost story battle does not count', () => {
    const p = play();
    p.go({ type: 'continue' });
    p.go({ type: 'continue' });
    p.go({ type: 'tap', prop: 'bush' });
    p.go({ type: 'choose', option: 0 });
    p.go({ type: 'give', item: 'flask' });
    p.go({ type: 'continue' });
    expect(currentStep(p.content, p.run)?.type).toBe('battle');
    const r = p.go({ type: 'battle', result: 'lose' });
    expect(p.run.done).toBe(true);
    expect(p.run.complete).toBe(false);
    expect(r.events.at(-1)).toEqual({ type: 'encounterEnd', encounter: 'wood.test', complete: false });
    expect(p.save.encounters['wood.test']?.count ?? 0).toBe(0);
  });

  it('leaving it skips to its own end and counts', () => {
    const p = play();
    p.go({ type: 'continue' });
    p.go({ type: 'continue' });
    p.go({ type: 'tap', prop: 'bush' });
    p.go({ type: 'choose', option: 1 });
    expect(p.run.done).toBe(true);
    expect(p.save.encounters['wood.test']?.count).toBe(1);
  });

  it('lists the concepts an encounter teaches, including battle telegraphs', () => {
    const content = fixture({ encounters: [encounter] });
    expect(encounterConcepts(content, content.encounter.get('wood.test')!).sort()).toEqual(['fire', 'look', 'water']);
  });
});
