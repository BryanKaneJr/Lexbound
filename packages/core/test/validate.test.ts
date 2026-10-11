import { describe, expect, it } from 'vitest';
import { validateContent, type ContentInput } from '../src';
import { fixture } from './fixture';

type Enc = NonNullable<ContentInput['encounters']>[number];
const scene = { background: 'forest', props: [{ id: 'bush', art: 'bush', x: 0.5, y: 0.9 }], actors: [{ id: 'milo', art: 'milo', x: 0.5, y: 0.9 }, { id: 'hog', art: 'hog', x: 0.7, y: 0.9 }] };
const enc = (extra: Partial<Enc>): Enc => ({ id: 'wood.x', location: 'wood', title: 'x', kind: 'explore', repeatable: true, scene, steps: [{ type: 'end' }], ...extra });
const has = (problems: string[], text: string) => problems.some((p) => p.includes(text));

describe('language validation', () => {
  it('flags lines that teach nothing without saying so', () => {
    const p = validateContent(fixture());
    expect(has(p, 'line milo.ops: teaches nothing')).toBe(true);
    const chatter = fixture({ lines: fixture().lines.map((l) => (l.concepts.length ? l : { ...l, chatter: true })) });
    expect(has(validateContent(chatter), 'teaches nothing')).toBe(false);
  });

  it('requires teaching metadata, grounding for every introduced concept, and declared evidence', () => {
    const bare = enc({ steps: [{ type: 'say', line: 'milo.acqua' }, { type: 'end' }] });
    expect(has(validateContent(fixture({ encounters: [bare] })), 'declares no teaching')).toBe(true);

    const ungrounded = enc({ teaching: { purpose: 'Milo finds water.', introduces: ['water'], reinforces: [], grounding: [] }, steps: [{ type: 'say', line: 'milo.acqua' }, { type: 'end' }] });
    expect(has(validateContent(fixture({ encounters: [ungrounded] })), 'introduces "water" with no grounding')).toBe(true);

    const undeclared = enc({
      teaching: { purpose: 'Milo finds water.', introduces: ['water'], reinforces: [], grounding: [{ concept: 'water', type: 'object', how: 'A stream.' }] },
      steps: [{ type: 'say', line: 'milo.acqua' }, { type: 'tap', targets: [{ prop: 'bush', evidence: [{ concept: 'look', result: 'success' }] }] }, { type: 'end' }],
    });
    expect(has(validateContent(fixture({ encounters: [undeclared] })), 'judges "look" without declaring it')).toBe(true);
  });

  it('insists on transfer: a concept only one speaker ever says is a problem', () => {
    const p = validateContent(fixture());
    expect(has(p, 'concept look: is only ever said by milo')).toBe(true);
    expect(has(p, 'concept water: is only ever said')).toBe(false);
  });

  it('story scenes may only reinforce what an earlier story scene introduced', () => {
    const late = enc({ id: 'wood.a', kind: 'story', order: 1, repeatable: false, teaching: { purpose: 'p', introduces: [], reinforces: ['water'], grounding: [] }, steps: [{ type: 'say', line: 'milo.acqua' }, { type: 'end' }] });
    const early = enc({ id: 'wood.b', kind: 'story', order: 2, repeatable: false, teaching: { purpose: 'p', introduces: ['water'], reinforces: [], grounding: [{ concept: 'water', type: 'object', how: 'A stream.' }] }, steps: [{ type: 'say', line: 'milo.acqua' }, { type: 'end' }] });
    expect(has(validateContent(fixture({ encounters: [late, early] })), 'reinforces "water" before any earlier story scene introduces it')).toBe(true);
    expect(has(validateContent(fixture({ encounters: [{ ...late, order: 3 }, early] })), 'before any earlier story scene')).toBe(false);
  });

  it('finds steps that can never run and flags nothing sets', () => {
    const dead = enc({ requires: { flags: ['never.set'] }, steps: [{ type: 'end' }, { type: 'narrate', text: 'lost' }] });
    const p = validateContent(fixture({ encounters: [dead] }));
    expect(has(p, 'step 1 (narrate) can never be reached')).toBe(true);
    expect(has(p, 'waits for flag "never.set"')).toBe(true);
  });

  it('flags lines nobody ever uses', () => {
    expect(has(validateContent(fixture()), 'line milo.guarda: is never used')).toBe(true);
  });

  it('lets field notes be about writing, but not about a speaker that does not exist', () => {
    const notes = [
      { id: 'note.carved', concept: 'water', when: 'heard' as const, speaker: 'writing', text: 'Carved, not said.' },
      { id: 'note.ghost', concept: 'water', when: 'heard' as const, speaker: 'ghost', text: 'Nobody.' },
    ];
    const p = validateContent(fixture({ notes }));
    expect(has(p, 'note note.carved')).toBe(false);
    expect(has(p, 'note note.ghost: unknown speaker "ghost"')).toBe(true);
  });
});

describe('battle steps', () => {
  it('a named fighter must be in the scene', () => {
    const fight = (actor: string) => enc({ steps: [{ type: 'battle', enemy: 'hog', name: 'Old Hog', actor }, { type: 'end' }] });
    expect(has(validateContent(fixture({ encounters: [fight('hog')] })), 'fighter')).toBe(false);
    expect(has(validateContent(fixture({ encounters: [fight('bluster')] })), 'fighter "bluster" isn\'t in the scene')).toBe(true);
  });
});
