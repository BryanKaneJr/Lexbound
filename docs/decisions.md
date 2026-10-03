# Decisions

Architecture and product decisions made while building, newest last. The bible (`docs/game-bible.md`) is the vision; this file records how it was turned into code and anything that refines it. When they disagree, this file wins.

## 2026-10-03: First build is the vertical slice

The bible's absolute rule is to prove the smallest loop first (§60, §75). The first build covers Phases 0 to 4 in full and the reusable core of Phases 5 to 8, 11 to 13: a playable vertical slice on real engines rather than a throwaway prototype.

In: the Lodge intro (meet Milo, "Ciao!"), Whisperwood's story run (guarda and vieni, the stream, the thirsty path, the Emberhog battle), Milo's retelling at camp, the Lodge report that closes Chapter One, seven repeatable Whisperwood encounters plus three Lodge chats, Camp, Map, Milo, Journal (story, bestiary, places, strange things heard), Bag, Settings, developer tools.

Out, on purpose (later phases): command composition (Phase 9), multi-step tactics, more regions, recorded audio, speech input, monetization.

## Stack

- **Expo SDK 57, React Native, TypeScript, Expo Router** (bible §44), the same versions as the owner's BrainScroll app.
- **npm workspaces:** `packages/core` (engines, pure TypeScript, no React), `content` (game data as JSON plus its validation tests), `app` (Expo). Engines never import React, content never contains code.
- **Zustand** for the one game store; **AsyncStorage** for the save (bible §44 MVP persistence).
- **zod** for the content contract and the save schema.
- **vitest** for unit and integration tests; **Playwright** plays the slice in a browser build.

## Engines are pure; the save changes only through events

Every engine (`encounter`, `battle`, `scheduler`, `language`) is a pure function of content, input and a seed. Engines return `GameEvent`s (`heard`, `used`, `evidence`, `hint`, `effects`, `battleEnd`...) and the one function `applyEvents` (core `save.ts`) turns them into a new save plus `Notice`s for the toasts. This keeps engines testable without React, makes every change to progress visible in one place, and lets a whole playthrough run in a unit test (`content/test/slice.test.ts`).

All randomness is seeded (`rng.ts`). The save carries the seed and advances it, so battles and encounter picks can be replayed exactly.

## Language model

One memory strength per concept, 0 to 1 (core `language.ts`):

- an exposure (hearing it in context) adds 12% of the remaining gap, 18% in a context not seen before;
- a success (acting on it correctly) adds 35%; a failure removes 30%;
- a hint costs nothing for a repeat, 8% for a context clue, 16% for the English meaning;
- strength halves every 2 days without successes, plus 2 days per success (capped at 60), so a returning player gets their help back instead of being punished (§26).

Strength picks the scaffold level: 0.85+ fluent (0), 0.55+ light (1), 0.25+ moderate (2), else heavy (3). **A concept never drops below level 2 until the player has acted on it correctly at least once**: hearing a word a lot is not the same as knowing it.

What each level changes:

| Level | Command tile | Creature speech |
| --- | --- | --- |
| 3 heavy | icon + element colour | icon beside the word |
| 2 moderate | element colour only | text |
| 1 light | plain word | text |
| 0 fluent | plain word | text, or sound first with "Sound first when I know them" on |

Settings can put the icons back at any time ("Keep element pictures").

## What counts as understanding

Evidence is authored per decision, not guessed. A `choice`, `tap` or `give` option can carry `evidence: [{ concept, result }]` (giving Milo the flask when he asks for "acqua" is a success for water; the stick is a failure). In battle, picking the counter command is a success for its words; anything else is only an exposure, because the player may know exactly what "fuoco" means and be experimenting. Using a command always counts as an exposure: you watched Milo do it.

## Battles

- Turn order: the foe announces its move (speech plus a visible wind-up), the player picks a tile, Milo acts, the foe follows through.
- **The element chart is data** (`content/data/elements.json`). For the four MVP elements: water beats fire; wind beats earth; same-element hits are halved; **fire on a fire Lexling heals it** (and it says "Mmm... grazie!"); **wind on fire fans its next fire move** (x1.5). Water that hits a foe winding up a fire move also puts that move out. The chart is provisional and easy to change.
- Tiles reshuffle every round (bible §13, failure mode 3).
- The first Emberhog has 54 HP so ACQUA takes exactly three hits at level 1 and the player hears "Fuoco!" twice.
- Losing is gentle: "Milo is worn out", no cost, and a lost story battle doesn't count, so it comes back on the next explore.
- Battle help ladder: Milo's context clue (free), then icons on every tile, then English under each tile.

## Encounters

Steps: `narrate`, `talk` (humans, English), `say` (creatures, the creature language), `act`, `stage` (show, hide, move), `choice`, `tap`, `give`, `battle`, `reward`, `branch`, `end`. Branches see effects granted earlier in the same input. `end` can say `complete: false` (a retreat doesn't count). A content test plays every encounter 25 times with random input to prove none can get stuck.

Story encounters run first, in `order`, at their location. Otherwise the scheduler weighs repeatable encounters: x0.25 if seen recently, up to x2.5 when their words are due for reinforcement, x0.2 when they would introduce more than two new words at once (§49).

## Audio

- **Creature voices use the device's own text-to-speech** in Italian for the prototype, with a pitch and pace per species (Milo high and quick, the Emberhog low and slow). `app/src/audio/voice.ts` has a `CLIPS` table: a recorded or pre-generated clip registered there for a line id replaces TTS for that line. Recorded or pre-generated audio is the plan before launch (§29, §54); TTS keeps the prototype offline with no audio files.
- **Sound effects** are synthesised by `scripts/make-sfx.mjs` into `app/assets/sfx/` (placeholders; `npm run sfx -- --check` fails if they drift). Replace any file with a real one of the same name.

## Art

All art is drawn in code with react-native-svg so the prototype ships with no image files: Milo (14 moods, 10 arm poses, blinking), four Lexlings, Maren, Pip, eleven props, six backgrounds, icons. Static drawings come alive through cheap transforms (breathing, hops, shakes, squash and stretch; `art/Actor.tsx`). Milo's ear tips, tail tip and forehead gem carry the four element colours: a visual hint at what he is. Replacing any piece with painted art later only touches `app/src/art/`.

## Naming in-world

- Humans say "Lexlings"; Lexlings never name their language. The words "Italian" and "translation" never appear in play. The help ladder's last rung says "It means: Water!", not "Translation".
- Human NPCs: **Maren Holt**, Warden of the Translators' Lodge, and **Pip Calloway**, Translator Second Class (self-appointed), with Pip's Puffkin, **Bluster**.
- Species: **Emberhog** (fire, hostile), **Drizzlet** (water, playful), **Pebblit** (earth, shy), **Puffkin** (wind, playful).
- Places: **Camp**, the **Translators' Lodge**, **Whisperwood**; coming later: Riverlands, Ember Ridge, Saltglass Coast.

## Strange lines are not translated in the journal

"Sei tu... Ti abbiamo trovato." ("It's you... We found you.") is kept in Journal, Strange things, with replay only and no meaning button: understanding it later is the point (§34). Every other remembered line can reveal its meaning on request. The in-scene help ladder still offers the meaning for every line, so nobody is ever stuck.

## Italian review

Every line was written for natural, simple Italian, but none has had a native speaker's review yet. That review is required before launch (§51).
