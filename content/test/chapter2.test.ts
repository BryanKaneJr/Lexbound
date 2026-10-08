import { describe, expect, it } from 'vitest';
import { bestCommands, commandSentence, comprehension, knownVerbs, meets, nextStory, visibleNotes, type BattleState } from '@lexbound/core';
import { content } from '../index';
import { announced, playChapterOne, Player, type Plan } from './player';

/**
 * Plays Chapter Two (the Old Hollow) through the real engines: Milo's game
 * at camp teaches him to say how he uses an element, a spar with Bluster
 * shows why a shield matters, the Hollow brings "aspetta", "paura" and
 * "luce" through situations, the Craglings' plan can be overheard, and
 * written Lexling turns up carved in stone.
 */

/** Listens to every announcement: shields against what no attack can stop, counters the rest. */
const listen: Plan = (s: BattleState) => {
  const move = content.ability.get(announced(s))!;
  const key = move.element ?? 'physical';
  const counter = content.milo.commands.find((c) => content.ability.get(c.ability)!.counters.includes(key))?.id;
  const best = bestCommands(content, s.foe.element)[0];
  if (move.unstoppable && counter) return { command: counter, verb: 'defend' };
  if (s.steady && best) return { command: best, verb: 'attack' };
  return { command: counter ?? best ?? 'water' };
};

describe('chapter two', () => {
  const p = new Player();

  it('starts once Chapter One is done', () => {
    playChapterOne(p);
    expect(nextStory(content, p.save, 'camp')?.id).toBe('camp.practice');
    expect(meets(p.save, content.location.get('hollow')!.requires)).toBe(false);
    expect(knownVerbs(content, p.save.flags)).toEqual([]);
  });

  it("Milo's pinecone game: every shot announced the same way", () => {
    p.start('camp.practice');
    p.choose('Toss');
    p.until();
    expect(p.heard).toEqual(expect.arrayContaining(['milo.attacco.acqua', 'milo.attacco.vento', 'milo.difendo.terra']));
    expect(p.save.concepts.with?.exposures).toBeGreaterThanOrEqual(3);
    expect(knownVerbs(content, p.save.flags).sort()).toEqual(['attack', 'defend']);
    expect(commandSentence(content, 'earth', 'defend')).toBe('Difendi con la terra!');
    expect(commandSentence(content, 'water', 'attack')).toBe("Attacca con l'acqua!");
  });

  it('a spar with Bluster: a wall stops the gale no attack could', () => {
    expect(p.explore('lodge')).toBe('lodge.ch2.spar');
    const end = p.fight(listen);
    expect(end.outcome).toBe('win');
    expect(p.beats).toContainEqual({ type: 'blocked', ability: 'big_gust', by: 'earth' });
    expect(p.heard).toContain('puffkin.spar.grande');
    // Shielding against the announced big gust is evidence for the words of the announcement.
    expect(p.save.concepts.big?.successes).toBeGreaterThan(0);
    expect(p.save.concepts.defend?.successes).toBeGreaterThan(0);
    p.until();
    expect(p.save.flags['ch2.hollow_open']).toBe(true);
    expect(meets(p.save, content.location.get('hollow')!.requires)).toBe(true);
  });

  it('into the Hollow: "Aspetta!" just before the ground gives way', () => {
    expect(p.explore('hollow')).toBe('hollow.entrance');
    p.choose('Stop');
    p.choose('Stay put');
    p.until();
    expect(p.save.concepts.wait?.successes).toBe(1);
    expect(p.save.journal.entries).toContain('story.hollow');
  });

  it('a Flickerwing too scared to glow: "Non ho fame... ho paura."', () => {
    expect(p.explore('hollow')).toBe('hollow.flickerwing');
    p.choose('Sit down');
    p.until();
    expect(p.heard).toContain('flickerwing.non_fame');
    expect(p.save.concepts.afraid?.successes).toBe(1);
    expect(p.save.concepts.not?.exposures).toBeGreaterThan(0);
    expect(p.save.lexlings.flickerwing?.befriended).toBe(true);
  });

  it('words carved in stone, and a name', () => {
    expect(p.explore('hollow')).toBe('hollow.stones');
    p.choose('rubbing');
    p.until();
    expect(p.heard).toEqual(expect.arrayContaining(['writing.qui_dorme', 'writing.milo']));
    expect(p.save.concepts.light?.modalities).toContain('writing');
    expect(p.save.items.rubbing).toBe(1);
    expect(visibleNotes(content, p.save).map((n) => n.id)).toContain('note.writing');
  });

  it("overheard Craglings give away their plan: wind breaks it", () => {
    expect(p.explore('hollow')).toBe('hollow.overheard');
    p.choose('Keep listening');
    expect(p.heard).toContain('cragling.overheard.a2');
    const end = p.fight(listen);
    expect(end.outcome).toBe('win');
    expect(end.milo.hp).toBe(end.milo.maxHp);
    p.until();
    expect(p.save.flags['hollow.overheard.done']).toBe(true);
  });

  it('Old Cinderback: "Ora... il fuoco grande!" is the moment to shield', () => {
    expect(p.explore('hollow')).toBe('hollow.cinderback');
    expect(p.heard).not.toContain('cinderback.non_sai');
    const end = p.fight(listen);
    expect(end.outcome).toBe('win');
    expect(p.beats).toContainEqual({ type: 'blocked', ability: 'inferno', by: 'water' });
    p.until();
    expect(p.save.flags['ch2.boss.won']).toBe(true);
    expect(p.heard).toEqual(expect.arrayContaining(['cinderback.non_sai', 'cinderback.casa']));
    expect(comprehension(p.save.concepts.big, p.now)).not.toBe('unseen');
  });

  it('that night, Milo says what the Flickerwing said', () => {
    expect(p.save.concepts.ho_paura?.speakers).toEqual(['flickerwing']);
    expect(nextStory(content, p.save, 'camp')?.id).toBe('camp.ch2.night');
    p.start('camp.ch2.night');
    p.choose('Hold');
    p.until();
    expect([...(p.save.concepts.ho_paura?.speakers ?? [])].sort()).toEqual(['flickerwing', 'milo']);
  });

  it("at the Lodge, the rubbing matches the basket tag; Pip has a theory", () => {
    expect(p.explore('lodge')).toBe('lodge.ch2.report');
    p.choose('Hold the rubbing up');
    p.until();
    expect(p.save.flags['chapter2.done']).toBe(true);
    expect(p.save.journal.entries).toEqual(expect.arrayContaining(['story.practice', 'story.spar', 'story.flickerwing', 'story.stones', 'story.overheard', 'story.cinderback', 'story.ch2_night', 'story.ch2_report']));
  });

  it('the Hollow stays open, with things to find', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) {
      seen.add(p.explore('hollow'));
      p.run = undefined;
    }
    expect(seen.size).toBeGreaterThanOrEqual(5);
    expect(seen).toContain('hollow.carvings');
  });
});
