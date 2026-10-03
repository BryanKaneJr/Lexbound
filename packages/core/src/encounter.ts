import type { GameEvent, Save } from './save';
import { applyEvents, meets } from './save';
import type { Content, Encounter, Placement, Scene, Step, StepOf } from './schema';

/**
 * The encounter engine (bible §10, Phase 6): a small state machine that walks
 * an encounter's steps. It is pure. The app renders the current step, sends
 * the player's input back, and applies the returned GameEvents to the save.
 *
 * Presentational steps (narrate, talk, say, act) wait for the app to call
 * `advance` with no input once they've been shown. Interactive steps wait for
 * the matching input. Instant steps (stage, reward, branch) never stop.
 */

export type SceneState = {
  background: string;
  props: Placement[];
  actors: Placement[];
};

export type EncounterRun = {
  encounter: string;
  index: number;
  scene: SceneState;
  done: boolean;
  /** Set when finished: whether it counted (a lost story battle doesn't). */
  complete: boolean;
};

export type EncounterInput =
  | { type: 'continue' }
  | { type: 'choose'; option: number }
  | { type: 'tap'; prop: string }
  | { type: 'give'; item: string }
  | { type: 'battle'; result: 'win' | 'lose' };

export type StepResult = { run: EncounterRun; events: GameEvent[] };

/** How many instant steps may chain before we call the content broken (a branch loop). */
const MAX_HOPS = 200;

function sceneFrom(scene: Scene): SceneState {
  return { background: scene.background, props: scene.props.map((p) => ({ ...p })), actors: scene.actors.map((a) => ({ ...a })) };
}

export function stepIndex(encounter: Encounter, id: string): number {
  const i = encounter.steps.findIndex((s) => s.id === id);
  if (i < 0) throw new Error(`${encounter.id}: no step "${id}"`);
  return i;
}

export function currentStep(content: Content, run: EncounterRun): Step | undefined {
  if (run.done) return undefined;
  return encounterOf(content, run).steps[run.index];
}

function encounterOf(content: Content, run: EncounterRun): Encounter {
  const enc = content.encounter.get(run.encounter);
  if (!enc) throw new Error(`Unknown encounter "${run.encounter}"`);
  return enc;
}

/** Where a step goes when it's done: an explicit target, its `next`, or the following step. */
function after(encounter: Encounter, index: number, target?: string): number {
  if (target) return stepIndex(encounter, target);
  const step = encounter.steps[index];
  if (step?.next) return stepIndex(encounter, step.next);
  return index + 1;
}

function restage(scene: SceneState, step: StepOf<'stage'>): SceneState {
  const update = (p: Placement): Placement => {
    let next = p;
    if (step.show?.includes(p.id)) next = { ...next, hidden: false };
    if (step.hide?.includes(p.id)) next = { ...next, hidden: true };
    const move = step.move?.find((m) => m.id === p.id);
    if (move) next = { ...next, x: move.x, y: move.y ?? next.y };
    const mood = step.mood?.[p.id];
    if (mood) next = { ...next, mood };
    return next;
  };
  return { background: step.background ?? scene.background, props: scene.props.map(update), actors: scene.actors.map(update) };
}

function withMood(scene: SceneState, actor: string, mood: string | undefined): SceneState {
  if (!mood) return scene;
  return { ...scene, actors: scene.actors.map((a) => (a.id === actor ? { ...a, mood } : a)) };
}

/**
 * Moves forward through instant steps until one needs the app (or the end),
 * emitting what landing there means: hearing a line exposes its concepts.
 */
function land(content: Content, run: EncounterRun, save: Save, events: GameEvent[]): EncounterRun {
  const enc = encounterOf(content, run);
  let r = run;
  for (let hops = 0; hops < MAX_HOPS; hops++) {
    const step = enc.steps[r.index];
    if (!step) return { ...r, done: true, complete: true };
    switch (step.type) {
      case 'stage':
        r = { ...r, scene: restage(r.scene, step), index: after(enc, r.index) };
        continue;
      case 'reward':
        events.push({ type: 'effects', effects: step.effects });
        r = { ...r, index: after(enc, r.index) };
        continue;
      case 'branch': {
        // Branches see effects granted earlier in this same advance (a flag set by the option just chosen).
        const pending = events.filter((e) => e.type === 'effects');
        const view = pending.length ? applyEvents(save, content, pending, 0).save : save;
        r = { ...r, index: meets(view, step.if) ? stepIndex(enc, step.then) : after(enc, r.index, step.else) };
        continue;
      }
      case 'end':
        return { ...r, done: true, complete: step.complete };
      case 'say': {
        const line = content.line.get(step.line);
        if (line) {
          events.push({ type: 'heard', line: line.id, context: enc.id });
          r = { ...r, scene: withMood(r.scene, step.by ?? line.speaker, step.mood) };
        }
        return r;
      }
      case 'act':
        return { ...r, scene: withMood(r.scene, step.actor, step.mood) };
      default:
        return r;
    }
  }
  throw new Error(`${enc.id}: more than ${MAX_HOPS} instant steps in a row (a branch loop?)`);
}

export function startEncounter(content: Content, encounterId: string, save: Save): StepResult {
  const enc = content.encounter.get(encounterId);
  if (!enc) throw new Error(`Unknown encounter "${encounterId}"`);
  const events: GameEvent[] = [{ type: 'encounterStart', encounter: enc.id, location: enc.location }];
  const run = land(content, { encounter: enc.id, index: 0, scene: sceneFrom(enc.scene), done: false, complete: false }, save, events);
  if (run.done) events.push({ type: 'encounterEnd', encounter: enc.id, complete: run.complete });
  return { run, events };
}

type Outcome = { goto?: string; effects?: StepOf<'choice'>['options'][number]['effects']; evidence?: StepOf<'choice'>['options'][number]['evidence'] };

function resolve(enc: Encounter, run: EncounterRun, outcome: Outcome, events: GameEvent[]): EncounterRun {
  if (outcome.effects) events.push({ type: 'effects', effects: outcome.effects });
  for (const ev of outcome.evidence ?? []) events.push({ type: 'evidence', concept: ev.concept, result: ev.result, context: enc.id });
  return { ...run, index: after(enc, run.index, outcome.goto) };
}

/**
 * Applies the player's input to the current step. Input that doesn't fit the
 * step (a tap during a choice) is ignored: the run comes back unchanged.
 * `save` is the save with every earlier event already applied, so branches
 * see the latest flags.
 */
export function advance(content: Content, run: EncounterRun, input: EncounterInput, save: Save): StepResult {
  const enc = encounterOf(content, run);
  const step = currentStep(content, run);
  const events: GameEvent[] = [];
  if (!step) return { run, events };
  let next: EncounterRun | undefined;
  switch (step.type) {
    case 'narrate':
    case 'talk':
    case 'say':
    case 'act':
      if (input.type === 'continue') next = { ...run, index: after(enc, run.index) };
      break;
    case 'choice': {
      const option = input.type === 'choose' ? step.options[input.option] : undefined;
      if (option) next = resolve(enc, run, option, events);
      break;
    }
    case 'tap': {
      if (input.type !== 'tap') break;
      const target = step.targets.find((t) => t.prop === input.prop);
      if (target) next = resolve(enc, run, target, events);
      else if (step.otherwise && run.scene.props.some((p) => p.id === input.prop && !p.hidden)) next = resolve(enc, run, step.otherwise, events);
      break;
    }
    case 'give': {
      const option = input.type === 'give' ? step.items.find((i) => i.item === input.item) : undefined;
      if (option) next = resolve(enc, run, option, events);
      break;
    }
    case 'battle':
      if (input.type === 'battle') {
        const target = input.result === 'win' ? step.win : step.lose;
        next = { ...run, index: after(enc, run.index, target) };
      }
      break;
    default:
      break;
  }
  if (!next) return { run, events };
  const landed = land(content, next, save, events);
  if (landed.done) events.push({ type: 'encounterEnd', encounter: enc.id, complete: landed.complete });
  return { run: landed, events };
}

/** Every concept an encounter's creature lines expose, for the scheduler. */
export function encounterConcepts(content: Content, encounter: Encounter): string[] {
  const out = new Set<string>();
  const addLine = (id: string) => content.line.get(id)?.concepts.forEach((c) => out.add(c));
  for (const step of encounter.steps) {
    if (step.type === 'say') addLine(step.line);
    if (step.type === 'battle') {
      const battle = content.lexling.get(step.enemy)?.battle;
      battle?.moves.forEach((m) => m.telegraph && addLine(m.telegraph));
    }
  }
  return [...out];
}
