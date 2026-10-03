import { z } from 'zod';

/**
 * The content contract. Everything the game shows or plays is data that
 * passes these schemas: concepts, creature lines, Lexlings, places, items and
 * encounters. Engines read only these types, so adding encounter #500 never
 * needs engine changes (bible §45).
 *
 * Language-neutral content (concepts, elements, Lexlings) is kept apart from
 * the creature-language pack (words and lines), so a future language can ship
 * its own pack and its own encounter scripts (bible §69).
 */

const id = z.string().regex(/^[a-z0-9][a-z0-9_.-]*$/, 'ids are lowercase: letters, digits, _ . -');

// ---------------------------------------------------------------- language

export const conceptSchema = z.object({
  id,
  /** English meaning, for authors and the last rung of the hint ladder. Never shown by default. */
  gloss: z.string(),
  category: z.enum(['greeting', 'answer', 'element', 'action', 'feeling', 'thing', 'describe', 'place', 'social']),
  /** Curriculum stage (bible §28). 1 = immediate physical concepts. */
  stage: z.number().int().min(1).max(8),
  /** A single word, or a chunk learned whole before it's taken apart ("ho fame", language bible §63). */
  type: z.enum(['word', 'phrase']).default('word'),
  /** An icon the app can show beside the word while the concept is new (heavy scaffolding). */
  icon: z.string().optional(),
});
export type Concept = z.infer<typeof conceptSchema>;

export const wordSchema = z.object({
  concept: id,
  /** The word as a command tile shows it, e.g. "acqua". */
  word: z.string(),
  /** Other spellings that appear in lines ("l'acqua"), so the app can find the word in a sentence. */
  forms: z.array(z.string()).default([]),
});
export type Word = z.infer<typeof wordSchema>;

export const lineSchema = z.object({
  id,
  /** Who says it: "milo" or a Lexling id. Humans never use lines; they speak English in `talk` steps. */
  speaker: id,
  /** The creature-language text, exactly as spoken. */
  text: z.string(),
  /** Concepts this line exposes the player to. Story lines may carry none. */
  concepts: z.array(id).default([]),
  /** English meaning: the final rung of the hint ladder. */
  gloss: z.string(),
  /** A context clue in plain English that points at the meaning without translating it. */
  clue: z.string().optional(),
  /** "strange" lines are kept in the journal for later understanding (bible §34). */
  journal: z.enum(['strange']).optional(),
  /** Deliberately teaches nothing: a growl, an "Ops!", chatter (language bible §78). Untagged lines must say so. */
  chatter: z.boolean().default(false),
});
export type Line = z.infer<typeof lineSchema>;

/**
 * The protagonist's field notes (language bible §41): observations about
 * the Lexlings, never definitions. Each appears once its trigger is true:
 *   heard     the concept was heard (from `speaker`, if set);
 *   noticed   it was met in at least two different situations;
 *   used      the player acted on it correctly;
 *   transfer  it was heard from at least two different speakers.
 */
export const fieldNoteSchema = z.object({
  id,
  concept: id,
  when: z.enum(['heard', 'noticed', 'used', 'transfer']),
  speaker: id.optional(),
  text: z.string(),
});
export type FieldNote = z.infer<typeof fieldNoteSchema>;

// ---------------------------------------------------------------- world

export const voiceSchema = z.object({
  pitch: z.number().min(0.5).max(2),
  rate: z.number().min(0.5).max(1.5),
});
export type Voice = z.infer<typeof voiceSchema>;

export const effectEntrySchema = z.object({
  multiplier: z.number().min(0),
  /** absorb: the defender is healed instead of hurt. fan: the defender's next move of its own element grows. */
  effect: z.enum(['absorb', 'fan']).optional(),
});
export type EffectEntry = z.infer<typeof effectEntrySchema>;

export const elementSchema = z.object({
  id,
  /** The concept whose word commands this element. */
  concept: id,
  color: z.string(),
});

export const elementsSchema = z.object({
  elements: z.array(elementSchema),
  /** chart[attacker][defender]. Missing pairs are neutral (x1). */
  chart: z.record(z.string(), z.record(z.string(), effectEntrySchema)),
});
export type Elements = z.infer<typeof elementsSchema>;

export const abilitySchema = z.object({
  id,
  name: z.string(),
  element: id.nullable(),
  power: z.number().int().min(1),
  /**
   * Foe moves this cancels when Milo uses it during their wind-up: element ids, or "physical" for
   * moves with no element. Water puts out a fire move; a stone wall stops a charge.
   */
  counters: z.array(z.string()).default([]),
});
export type Ability = z.infer<typeof abilitySchema>;

/** Battle chatter: events map to a pool of line ids, one picked at random. */
export const reactionsSchema = z.object({
  start: z.array(id).default([]),
  strong: z.array(id).default([]),
  weak: z.array(id).default([]),
  absorbed: z.array(id).default([]),
  fanned: z.array(id).default([]),
  countered: z.array(id).default([]),
  hurt: z.array(id).default([]),
  lowHp: z.array(id).default([]),
  victory: z.array(id).default([]),
  defeat: z.array(id).default([]),
  /** Said after the enemy announces a move (Milo warns you). */
  warn: z.array(id).default([]),
});
export type Reactions = z.infer<typeof reactionsSchema>;

export const enemyMoveSchema = z.object({
  ability: id,
  /** What the enemy says as it winds up: the telegraph (bible §16). Optional: some moves are only a growl. */
  telegraph: id.optional(),
  /** Visible wind-up the app animates, so speech is paired with a strong cue while it's new. */
  windup: z.string(),
});

export const lexlingSchema = z.object({
  id,
  name: z.string(),
  element: id,
  habitat: id,
  temperament: z.enum(['friendly', 'shy', 'playful', 'hostile']),
  description: z.string(),
  voice: voiceSchema,
  battle: z
    .object({
      level: z.number().int().min(1),
      hp: z.number().int().min(1),
      moves: z.array(enemyMoveSchema).min(1),
      /** Moves are used in this order, looping. Indices into `moves`. */
      pattern: z.array(z.number().int().min(0)).min(1),
      xp: z.number().int().min(0),
      reactions: reactionsSchema,
      /** The context clue the battle hint shows first. */
      clue: z.string(),
    })
    .optional(),
});
export type Lexling = z.infer<typeof lexlingSchema>;

export const commandSchema = z.object({
  id,
  /** The concepts whose words make up this command, in spoken order. */
  concepts: z.array(id).min(1),
  ability: id,
});
export type Command = z.infer<typeof commandSchema>;

export const miloSchema = z.object({
  voice: voiceSchema,
  hp: z.object({ base: z.number().int(), perLevel: z.number().int() }),
  /** Power multiplier gained per level above 1. */
  powerPerLevel: z.number(),
  commands: z.array(commandSchema).min(1),
  reactions: reactionsSchema,
  /** What Milo might say when tapped at camp. */
  idle: z.array(id).min(1),
  /** Camp: what he says when he's peckish, and when you share a snack. */
  camp: z.object({ hungry: id, snack: id }),
});
export type Milo = z.infer<typeof miloSchema>;

export const npcSchema = z.object({
  id,
  name: z.string(),
  title: z.string(),
  color: z.string(),
});
export type Npc = z.infer<typeof npcSchema>;

export const itemSchema = z.object({
  id,
  name: z.string(),
  description: z.string(),
  icon: z.string(),
});
export type Item = z.infer<typeof itemSchema>;

export const conditionSchema = z.object({
  flags: z.array(z.string()).optional(),
  notFlags: z.array(z.string()).optional(),
  items: z.array(id).optional(),
  discovered: z.array(id).optional(),
});
export type Condition = z.infer<typeof conditionSchema>;

export const locationSchema = z.object({
  id,
  name: z.string(),
  kind: z.enum(['home', 'hub', 'explore']),
  background: z.string(),
  blurb: z.string(),
  /** The button that starts an encounter here ("Explore", "Talk to Maren"). */
  action: z.string().optional(),
  /** Shown when nothing is available here right now. */
  quiet: z.string().optional(),
  /** Shown while `requires` isn't met yet. */
  locked: z.string().optional(),
  requires: conditionSchema.optional(),
  /** On the map but not playable yet: the world is bigger than the build. */
  comingSoon: z.boolean().default(false),
  /** Map position, 0..1 in each axis. */
  map: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
});
export type Location = z.infer<typeof locationSchema>;

export const journalEntrySchema = z.object({
  id,
  section: z.enum(['story', 'places', 'milo']),
  title: z.string(),
  text: z.string(),
});
export type JournalEntry = z.infer<typeof journalEntrySchema>;

// ---------------------------------------------------------------- encounters

export const effectsSchema = z.object({
  bond: z.number().int().optional(),
  xp: z.number().int().min(0).optional(),
  flags: z.array(z.string()).optional(),
  items: z.record(z.string(), z.number().int()).optional(),
  discover: z.array(id).optional(),
  befriend: z.array(id).optional(),
  journal: z.array(id).optional(),
});
export type Effects = z.infer<typeof effectsSchema>;

/** What a player's decision says about a concept: they acted on it correctly, or didn't. */
export const evidenceSchema = z.object({
  concept: id,
  result: z.enum(['success', 'fail']),
});
export type Evidence = z.infer<typeof evidenceSchema>;

export const placementSchema = z.object({
  /** Instance id within the scene (targets of `tap`, `look`). */
  id,
  /** Art id the app draws. */
  art: z.string(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  scale: z.number().positive().default(1),
  facing: z.enum(['left', 'right']).default('right'),
  /** Starting expression for actors. */
  mood: z.string().optional(),
  hidden: z.boolean().default(false),
});
export type Placement = z.infer<typeof placementSchema>;

export const sceneSchema = z.object({
  background: z.string(),
  props: z.array(placementSchema).default([]),
  /** Characters: "milo", Lexling ids, NPC ids. Their art is their id unless set. */
  actors: z.array(placementSchema).default([]),
});
export type Scene = z.infer<typeof sceneSchema>;

const stepBase = { id: id.optional(), next: id.optional() };
const outcome = {
  goto: id.optional(),
  effects: effectsSchema.optional(),
  evidence: z.array(evidenceSchema).optional(),
};

export const stepSchema = z.discriminatedUnion('type', [
  /** Narration in English: what you see. */
  z.object({ ...stepBase, type: z.literal('narrate'), text: z.string() }),
  /** A human speaks English. */
  z.object({ ...stepBase, type: z.literal('talk'), npc: id, text: z.string(), mood: z.string().optional() }),
  /**
   * A creature speaks: exposes the line's concepts. `anim` plays on the speaker; `look` turns them toward
   * something. `by` names the actor in the scene when it isn't the line's speaker (Pip's Puffkin, Bluster).
   */
  z.object({
    ...stepBase,
    type: z.literal('say'),
    line: id,
    by: id.optional(),
    anim: z.string().optional(),
    mood: z.string().optional(),
    look: id.optional(),
  }),
  /** Someone (or something: a wiggling basket) does something without words. `text` is an optional caption. */
  z.object({
    ...stepBase,
    type: z.literal('act'),
    actor: id,
    anim: z.string(),
    mood: z.string().optional(),
    look: id.optional(),
    text: z.string().optional(),
  }),
  /** Show, hide or move things in the scene. Instant. */
  z.object({
    ...stepBase,
    type: z.literal('stage'),
    show: z.array(id).optional(),
    hide: z.array(id).optional(),
    move: z.array(z.object({ id, x: z.number().min(0).max(1), y: z.number().min(0).max(1).optional() })).optional(),
    mood: z.record(z.string(), z.string()).optional(),
    background: z.string().optional(),
  }),
  /** The player picks an action. Labels are what YOU do, in English. */
  z.object({
    ...stepBase,
    type: z.literal('choice'),
    prompt: z.string().optional(),
    options: z.array(z.object({ label: z.string(), ...outcome })).min(1),
  }),
  /** The player taps something in the scene. Untargeted props fall through to `otherwise`. */
  z.object({
    ...stepBase,
    type: z.literal('tap'),
    prompt: z.string().optional(),
    targets: z.array(z.object({ prop: id, ...outcome })).min(1),
    otherwise: z.object(outcome).optional(),
  }),
  /** The player hands Milo (or someone) one of a few things. */
  z.object({
    ...stepBase,
    type: z.literal('give'),
    prompt: z.string().optional(),
    to: id.default('milo'),
    items: z.array(z.object({ item: id, ...outcome })).min(1),
  }),
  /** A turn-based battle. */
  z.object({ ...stepBase, type: z.literal('battle'), enemy: id, win: id.optional(), lose: id.optional(), background: z.string().optional() }),
  /** Grant effects. Instant; the app shows what changed. */
  z.object({ ...stepBase, type: z.literal('reward'), effects: effectsSchema }),
  /** Jump on a condition. Instant. */
  z.object({ ...stepBase, type: z.literal('branch'), if: conditionSchema, then: id, else: id.optional() }),
  /** Finish. `complete: false` means it didn't count (a lost story battle can be tried again). */
  z.object({ ...stepBase, type: z.literal('end'), complete: z.boolean().default(true) }),
]);
export type Step = z.infer<typeof stepSchema>;
export type StepOf<T extends Step['type']> = Extract<Step, { type: T }>;

/**
 * Why the language in an encounter can be understood (language bible §64,
 * §65). Every encounter with creature lines declares it, so no scene exists
 * only to show a word.
 */
export const groundingTypes = ['gesture', 'object', 'animation', 'environment', 'contrast', 'consequence', 'priorKnowledge'] as const;

export const teachingSchema = z.object({
  /** Why this happens, as a story and as a game, without mentioning language. */
  purpose: z.string().min(1),
  /** Concepts this scene can be the first to establish. Each needs grounding. */
  introduces: z.array(id).default([]),
  /** Concepts this scene uses that are established elsewhere. */
  reinforces: z.array(id).default([]),
  /** What on screen makes each introduced concept inferable without English. */
  grounding: z.array(z.object({ concept: id, type: z.enum(groundingTypes), how: z.string().min(1) })).default([]),
});
export type Teaching = z.infer<typeof teachingSchema>;

export const encounterSchema = z.object({
  id,
  location: id,
  title: z.string(),
  kind: z.enum(['story', 'explore']),
  /** Story order, one sequence for the whole game. Story beats run ahead of anything else at their location. */
  order: z.number().int().optional(),
  weight: z.number().min(0).default(10),
  repeatable: z.boolean().default(false),
  /** After it runs, skip it for this many explores at its location. */
  cooldown: z.number().int().min(0).default(2),
  requires: conditionSchema.optional(),
  teaching: teachingSchema.optional(),
  scene: sceneSchema,
  steps: z.array(stepSchema).min(1),
});
export type Encounter = z.infer<typeof encounterSchema>;

// ---------------------------------------------------------------- bundle

export const contentSchema = z.object({
  language: z.object({ code: z.string(), name: z.string(), speechLocale: z.string() }),
  concepts: z.array(conceptSchema),
  words: z.array(wordSchema),
  lines: z.array(lineSchema),
  elements: elementsSchema,
  abilities: z.array(abilitySchema),
  lexlings: z.array(lexlingSchema),
  milo: miloSchema,
  npcs: z.array(npcSchema),
  items: z.array(itemSchema),
  locations: z.array(locationSchema),
  journal: z.array(journalEntrySchema),
  notes: z.array(fieldNoteSchema).default([]),
  encounters: z.array(encounterSchema),
});
export type ContentInput = z.input<typeof contentSchema>;
export type ContentData = z.infer<typeof contentSchema>;

/** Content plus lookup tables, built once. */
export type Content = ContentData & {
  concept: Map<string, Concept>;
  word: Map<string, Word>;
  line: Map<string, Line>;
  ability: Map<string, Ability>;
  lexling: Map<string, Lexling>;
  npc: Map<string, Npc>;
  item: Map<string, Item>;
  location: Map<string, Location>;
  encounter: Map<string, Encounter>;
  entry: Map<string, JournalEntry>;
};

function index<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

/** Parses raw content (throws a readable error) and builds the lookup tables. */
export function loadContent(raw: unknown): Content {
  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 8).map((i) => `  ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Content failed its schema:\n${issues.join('\n')}`);
  }
  const data = parsed.data;
  return {
    ...data,
    concept: index(data.concepts),
    word: new Map(data.words.map((w) => [w.concept, w])),
    line: index(data.lines),
    ability: index(data.abilities),
    lexling: index(data.lexlings),
    npc: index(data.npcs),
    item: index(data.items),
    location: index(data.locations),
    encounter: index(data.encounters),
    entry: index(data.journal),
  };
}
