# Writing content

All gameplay is data in `content/data/`. Adding encounter #500 never needs engine or screen changes. Run `npm test` after any edit: the content tests check the schema, every cross-reference, the language rules (below), that every scene uses art the app can draw, that Chapter One still plays, and that no encounter can get stuck.

Read `docs/language-design.md` first. The short version: the player is learning to understand a living species, not studying. Never write a scene whose point is a word.

## The checklist (language bible §64)

Every encounter with creature lines must answer, in its `teaching` block and in the scene itself:

1. Why is this character saying this?
2. What non-English evidence makes the meaning inferable? (`grounding`)
3. What does it build on? (`reinforces`)
4. What new concept does it introduce, if any? (`introduces`)
5. Where will that concept turn up next, from someone else?
6. What happens if the player misunderstands? (A funny or useful consequence, never a red X.)
7. Does understanding give a real advantage?
8. **Would the scene still make sense if nobody were trying to teach a language?** If not, rewrite it.

## Where things live

| File | What |
| --- | --- |
| `data/concepts.json` | Language-neutral concepts (`water`, `look`...), with the English gloss and an optional icon. |
| `data/it/words.json` | The creature-language word for each concept (`acqua`), plus forms that appear in lines (`l'acqua`). |
| `data/it/lines.json` | Every creature line: speaker, exact text, concepts it exposes, English gloss, a context clue. |
| `data/it/notes.json` | The protagonist's field notes: observations that appear as the player's understanding grows. |
| `data/it/encounters/*.json` | Encounters, one file per location. They use Italian lines, so they belong to the language pack. |
| `data/lexlings.json` | Species: element, habitat, voice, and battle data for those that fight. |
| `data/milo.json` | Milo's voice, stats, commands, battle reactions and camp chatter. |
| `data/elements.json` | Elements and the type chart. |
| `data/abilities.json`, `items.json`, `npcs.json`, `locations.json`, `journal.json` | What they say. |

A new location file must be added to `content/index.ts`.

## Rules for creature lines

1. **Show meaning before translating it.** A line should be understandable from what's on screen: Milo pointing, a stream, a growl, a flask. Write the `clue` as what the player can see, never as a translation.
2. **Characters, not tutors.** Milo says things because he wants something, is scared, is showing off. Lexlings have personalities (the Pebblit mutters, Puffkins repeat themselves). Milo is not primitive: he can say whole sentences the player can't follow yet.
3. **Tag only words that are really in the line.** The validator checks that each tagged concept's word (or one of its `forms`) appears in the text. Tag useful chunks too: phrase concepts (`"type": "phrase"`, like `ho_fame`).
4. **Every line is annotated.** A line with no concepts must be `"chatter": true` (a growl, an "Ops!") or `"journal": "strange"`.
5. **Transfer is mandatory.** Every concept must be said by at least two speakers and met in at least two situations. Teach through Milo, then let a wild Lexling, an enemy or a story scene use it somewhere new.
6. **Few new words at once.** The scheduler holds back encounters that introduce more than two unseen concepts.
7. **Natural Italian, not English in Italian words.** "No! L'acqua no!", not "No acqua!". Contrast teaches grammar: "Ho fame" (I'm hungry) next to "Ha fame!" (it's hungry). Every line needs native review before launch.
8. **Strange lines may be beyond the player** ("Sei tu... Ti abbiamo trovato."): mark them `"journal": "strange"` and the journal keeps them, untranslated, for later. Never let one carry information the player must have.
9. Humans never speak the creature language. They use `talk` steps in English, and they may be plausibly wrong about Lexlings. Let the world show it; never let a character congratulate the player for understanding.

## Teaching metadata

```json
"teaching": {
  "purpose": "A wild Pebblit is stuck under a berry bush it can't climb, and it's starving.",
  "introduces": ["ho_fame"],
  "reinforces": ["hungry", "tasty", "thanks", "no"],
  "grounding": [{ "concept": "ho_fame", "type": "priorKnowledge", "how": "Milo's own word for hunger, from a Pebblit staring up at berries out of reach." }]
}
```

- `purpose` describes the scene as story and game. If it only makes sense as a lesson, rewrite the scene.
- Every concept the encounter's lines use (including battle telegraphs) must be in `introduces` or `reinforces`, and so must every concept its `evidence` judges.
- Every introduced concept needs a `grounding` entry: `gesture`, `object`, `animation`, `environment`, `contrast`, `consequence` or `priorKnowledge`.
- Story encounters may only `reinforce` concepts an earlier story encounter introduced (by `order`, one sequence for the whole game).

## Field notes

```json
{ "id": "note.fame.transfer", "concept": "hungry", "when": "transfer", "text": "A wild Pebblit said “fame”, the same sound Milo makes. It isn't just a Milo thing." }
```

Triggers: `heard` (optionally from a `speaker`), `noticed` (met in two situations), `used` (the player acted on it correctly), `transfer` (heard from two speakers). Write them as the protagonist's observations and hunches, never as definitions.

## Battle telegraphs

An enemy move's `telegraph` line is what it shouts as it winds up; its `windup` is the strong visual tell shown while that word is new. Abilities list what they cancel in `counters` (an element id, or `physical`). Make understanding pay: give each telegraphed move a counter that differs from the obvious elemental matchup, so reacting to the words is a better choice than ignoring them.

## Encounter steps

```json
{ "type": "narrate", "text": "The trees open onto a bright, chattering stream." }
{ "type": "talk", "npc": "maren", "text": "Hello there, little one." }
{ "type": "say", "line": "milo.acqua", "anim": "point", "mood": "excited", "look": "stream" }
{ "type": "act", "actor": "milo", "anim": "drink", "text": "He laps at the water." }
{ "type": "stage", "show": ["stone"], "hide": ["bush"], "move": [{ "id": "milo", "x": 0.8 }] }
{ "type": "choice", "options": [{ "label": "Splash Milo", "goto": "splash", "effects": { "bond": 2 } }] }
{ "type": "tap", "targets": [{ "prop": "bush", "goto": "found", "evidence": [{ "concept": "look", "result": "success" }] }], "otherwise": { "goto": "again" } }
{ "type": "give", "items": [{ "item": "flask", "goto": "drink", "evidence": [{ "concept": "water", "result": "success" }] }] }
{ "type": "battle", "enemy": "emberhog", "win": "won", "lose": "lost" }
{ "type": "reward", "effects": { "bond": 1, "xp": 5, "items": { "feather": 1 }, "flags": ["x.done"], "befriend": ["puffkin"], "journal": ["story.x"] } }
{ "type": "branch", "if": { "flags": ["x.done"] }, "then": "after", "else": "before" }
{ "type": "end", "complete": false }
```

- Steps run in order; `goto` and `next` jump to a step `id`.
- `choice` labels are what the **player** does, in English. The question is "what do I want to do?", never "what does this word mean?" (bible §32, §64).
- `evidence` marks a decision that shows whether the player understood a concept. Only add it where the right action really depends on the word.
- Scene coordinates: `x` across (0 to 1), `y` where the feet touch the ground (0 to 1, ground is about 0.85 to 0.93). Art ids are in `app/src/art/ids.ts`.
- Story encounters (`"kind": "story"`) need a unique `order` (one sequence for the whole game) and run before anything else at their location, once each. Explore encounters set `repeatable`, `weight` and `cooldown`.
- Animations (`anim`) are named in `app/src/art/Actor.tsx`; unknown names fall back to a hop. Milo's arm pose follows the animation (`point`, `wave`, `beckon`, `clap`, `hold`...).

## Moods

Milo: `idle happy excited curious confused annoyed scared tired hurt sad surprised fierce proud disgusted`. Lexlings: `idle happy angry hurt scared confused blazing sad` (not every species draws every mood).
