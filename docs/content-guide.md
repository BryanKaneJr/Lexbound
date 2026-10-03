# Writing content

All gameplay is data in `content/data/`. Adding encounter #500 never needs engine or screen changes. Run `npm test` after any edit: the content tests check the schema, every cross-reference, that every scene uses art the app can draw, that the slice still plays, and that no encounter can get stuck.

## Where things live

| File | What |
| --- | --- |
| `data/concepts.json` | Language-neutral concepts (`water`, `look`...), with the English gloss and an optional icon. |
| `data/it/words.json` | The creature-language word for each concept (`acqua`), plus forms that appear in lines (`l'acqua`). |
| `data/it/lines.json` | Every creature line: speaker, exact text, concepts it exposes, English gloss, a context clue. |
| `data/it/encounters/*.json` | Encounters, one file per location. They use Italian lines, so they belong to the language pack. |
| `data/lexlings.json` | Species: element, habitat, voice, and battle data for those that fight. |
| `data/milo.json` | Milo's voice, stats, commands, battle reactions and camp chatter. |
| `data/elements.json` | Elements and the type chart. |
| `data/abilities.json`, `items.json`, `npcs.json`, `locations.json`, `journal.json` | What they say. |

A new location file must be added to `content/index.ts`.

## Rules for creature lines

1. **Show meaning before translating it** (bible §7). A line should be understandable from what's on screen: Milo pointing, a stream, a growl, a flask. Write the `clue` as what the player can see, never as a translation.
2. **Tag only words that are really in the line.** The validator checks that each tagged concept's word (or one of its `forms`) appears in the text.
3. **Few new words at once.** The scheduler holds back encounters that introduce more than two unseen concepts, but write with it in mind.
4. **Natural Italian, not English in Italian words.** "No! L'acqua no!", not "No acqua!". Every line needs native review before launch.
5. **Story lines may be beyond the player** ("Sei tu... Ti abbiamo trovato."). Give them no concepts and `"journal": "strange"` so the journal keeps them for later.
6. Humans never speak the creature language. They use `talk` steps in English.

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
- Story encounters (`"kind": "story"`) need an `order` and run before anything else at their location, once each. Explore encounters set `repeatable`, `weight` and `cooldown`.
- Animations (`anim`) are named in `app/src/art/Actor.tsx`; unknown names fall back to a hop. Milo's arm pose follows the animation (`point`, `wave`, `beckon`, `clap`, `hold`...).

## Moods

Milo: `idle happy excited curious confused annoyed scared tired hurt sad surprised fierce proud disgusted`. Lexlings: `idle happy angry hurt scared confused blazing sad` (not every species draws every mood).
