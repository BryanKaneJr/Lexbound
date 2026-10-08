import { encounterConcepts } from './encounter';
import { isDue, isTransfer } from './language';
import { createRng, weightedPick } from './rng';
import { meets, WRITING, type Save } from './save';
import type { Content, Encounter } from './schema';

/**
 * The encounter scheduler: adventure, not homework (language bible §16,
 * §68). It never opens a review. It picks a believable next thing to
 * happen, leaning toward scenes that help the player's understanding:
 *
 *   story first: the next story beat at this place always wins
 *   + scenes that use words the player is losing, most when the scene is a
 *     situation they haven't met the word in (contextual diversity, §15)
 *   + scenes where someone new uses a word the player already has a guess
 *     about (cross-creature transfer, §18)
 *   - what was just seen, and the same speaker twice in a row
 *   - scenes that would pile on too many new words at once
 */

export const SCHEDULER = {
  recentPenalty: 0.25,
  sameSpeakerPenalty: 0.6,
  /** Up to this much extra weight when every concept in a scene is due and the scene is a new situation for them. */
  dueBoost: 1.5,
  /** A due concept in a situation the player already met it in counts this much toward the boost. */
  familiarContextShare: 0.4,
  transferBoost: 1,
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

/** Every creature line an encounter can play, with who says it (battle telegraphs included). */
export function encounterLines(content: Content, encounter: Encounter): { line: string; speaker: string }[] {
  const out: { line: string; speaker: string }[] = [];
  for (const step of encounter.steps) {
    if (step.type === 'say') {
      const line = content.line.get(step.line);
      if (line) out.push({ line: line.id, speaker: line.speaker });
    }
    if (step.type === 'battle') {
      for (const m of content.lexling.get(step.enemy)?.battle?.moves ?? []) if (m.telegraph) out.push({ line: m.telegraph, speaker: step.enemy });
    }
  }
  return out;
}

/** The Lexlings (not Milo, not writing) who speak in an encounter. */
export function encounterSpeakers(content: Content, encounter: Encounter): string[] {
  return [...new Set(encounterLines(content, encounter).map((l) => l.speaker))].filter((s) => s !== 'milo' && s !== WRITING);
}

export function weigh(content: Content, save: Save, encounter: Encounter, now: number): Candidate {
  const reasons: string[] = [];
  let weight = encounter.weight;

  if (save.recent.includes(encounter.id)) {
    weight *= SCHEDULER.recentPenalty;
    reasons.push('recent');
  }

  const last = save.recent.at(-1);
  const lastEncounter = last && last !== encounter.id ? content.encounter.get(last) : undefined;
  if (lastEncounter) {
    const before = new Set(encounterSpeakers(content, lastEncounter));
    const same = encounterSpeakers(content, encounter).filter((s) => before.has(s));
    if (same.length) {
      weight *= SCHEDULER.sameSpeakerPenalty;
      reasons.push(`same-speaker:${same.join(',')}`);
    }
  }

  const concepts = encounterConcepts(content, encounter);
  if (concepts.length) {
    let share = 0;
    const due: string[] = [];
    for (const c of concepts) {
      const state = save.concepts[c];
      if (!isDue(state, now)) continue;
      due.push(c);
      share += state && state.contexts.includes(encounter.id) ? SCHEDULER.familiarContextShare : 1;
    }
    if (due.length) {
      weight *= 1 + SCHEDULER.dueBoost * (share / concepts.length);
      reasons.push(`due:${due.join(',')}`);
    }

    const transfers = new Set<string>();
    for (const { line, speaker } of encounterLines(content, encounter)) {
      if (speaker === 'milo') continue;
      for (const c of content.line.get(line)?.concepts ?? []) if (isTransfer(save.concepts[c], speaker, now)) transfers.add(`${c}@${speaker}`);
    }
    if (transfers.size) {
      weight *= 1 + SCHEDULER.transferBoost;
      reasons.push(`transfer:${[...transfers].join(',')}`);
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
