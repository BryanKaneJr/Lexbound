import { encounterConcepts } from './encounter';
import { isDue } from './language';
import { createRng, weightedPick } from './rng';
import { meets, type Save } from './save';
import type { Content, Encounter } from './schema';

/**
 * The encounter scheduler (bible §27, §49, Phase 8): disguised spaced
 * repetition. It never opens a review lesson; it just makes the forest more
 * likely to hand you a scene that uses the words you're losing.
 *
 *   eligible encounters
 *   -> story first: the next story encounter here always wins
 *   -> drop unmet requirements, finished one-offs, encounters on cooldown
 *   -> penalise recently seen ones
 *   -> boost ones that use concepts due for reinforcement
 *   -> hold back ones that would introduce too many new words at once
 *   -> weighted random pick
 */

export const SCHEDULER = {
  recentPenalty: 0.25,
  /** Up to this much extra weight when every concept in an encounter is due. */
  dueBoost: 1.5,
  /** More unseen concepts than this in one non-story encounter is too many at once. */
  maxNewConcepts: 2,
  overloadPenalty: 0.2,
} as const;

export type Candidate = { id: string; weight: number; reasons: string[] };
export type Pick = { encounter: Encounter | undefined; candidates: Candidate[] };

export function eligible(content: Content, save: Save, location: string): Encounter[] {
  const explores = save.explores[location] ?? 0;
  return content.encounters.filter((e) => {
    if (e.location !== location) return false;
    if (!meets(save, e.requires)) return false;
    const seen = save.encounters[e.id];
    if (!e.repeatable && seen && seen.count > 0) return false;
    if (e.repeatable && seen && explores - seen.lastExplore < e.cooldown) return false;
    return true;
  });
}

/** The next story encounter at a location, if one is ready. */
export function nextStory(content: Content, save: Save, location: string): Encounter | undefined {
  return eligible(content, save, location)
    .filter((e) => e.kind === 'story')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
}

export function weigh(content: Content, save: Save, encounter: Encounter, now: number): Candidate {
  const reasons: string[] = [];
  let weight = encounter.weight;
  if (save.recent.includes(encounter.id)) {
    weight *= SCHEDULER.recentPenalty;
    reasons.push('recent');
  }
  const concepts = encounterConcepts(content, encounter);
  if (concepts.length) {
    const due = concepts.filter((c) => isDue(save.concepts[c], now));
    if (due.length) {
      weight *= 1 + SCHEDULER.dueBoost * (due.length / concepts.length);
      reasons.push(`due:${due.join(',')}`);
    }
    const unseen = concepts.filter((c) => !save.concepts[c] || save.concepts[c].exposures === 0);
    if (unseen.length > SCHEDULER.maxNewConcepts) {
      weight *= SCHEDULER.overloadPenalty;
      reasons.push(`new:${unseen.length}`);
    }
  }
  return { id: encounter.id, weight, reasons };
}

export function chooseEncounter(content: Content, save: Save, location: string, now: number, seed: number): Pick {
  const story = nextStory(content, save, location);
  if (story) return { encounter: story, candidates: [{ id: story.id, weight: Infinity, reasons: ['story'] }] };
  const pool = eligible(content, save, location).filter((e) => e.kind !== 'story');
  const candidates = pool.map((e) => weigh(content, save, e, now));
  const chosen = weightedPick(candidates, (c) => c.weight, createRng(seed));
  return { encounter: chosen ? content.encounter.get(chosen.id) : undefined, candidates };
}
