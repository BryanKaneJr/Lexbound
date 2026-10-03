# Decisions

Architecture and product decisions made while building, newest last. The bibles (`docs/game-bible.md`, and `docs/language-design.md`, which overrides any reading of the game bible that turns language into quizzes) are the vision; this file records how they were turned into code and anything that refines them. On implementation details, this file wins.

## 2026-10-03: First build is the vertical slice

The bible's absolute rule is to prove the smallest loop first (game bible §60, §75). The first build covered Phases 0 to 4 in full and the reusable core of Phases 5 to 8 and 11 to 13: a playable vertical slice on real engines rather than a throwaway prototype.

Out, on purpose (later phases): command composition (Phase 9, language L9), multi-step tactics, more regions, recorded audio, speech input, monetization.

## 2026-10-03: The language design bible becomes the contract

The owner's language design bible (`docs/language-design.md`) arrived after the first build. It keeps the foundation (§82) and changes the philosophy from "learned word, test word, schedule word" to "experience, infer, hypothesize, meet it elsewhere, act, consequence, transfer, internalize", and from "understanding Milo lets you control Milo" to "understanding Lexlings reveals information other humans can't access" (§83). What changed, by its build order (§81):

- **L1, rich hidden comprehension.** Concepts now record who said them, through which channel, in which situations the player acted on them, and whether a success came after a gap. Six hidden states replace a bare score. Save version 2, with a migration that keeps what v1 players had shown they know.
- **L2, grounding metadata.** Every encounter with creature lines declares a `teaching` block: its purpose (as story and game, never as language), the concepts it introduces and reinforces, and what on screen grounds each new one. The validator enforces this and the rest of §67.
- **L3, contextual scheduler.** Weighs contextual diversity, transfer value and same-speaker repetition, not just "due".
- **L4, cross-creature transfer.** Milo's "Fame..." on the first night comes back the next morning from a wild Pebblit: "Ho fame...", and Milo points: "Ha fame!" ("It's hungry!"). Every concept is now said by at least two speakers.
- **L5, human misunderstanding.** Pip reads Bluster's circling as restlessness; Bluster says "Ho fame." Nobody congratulates the player for knowing better (§19). Maren's tips include a plausible wrong belief ("Lexlings don't announce their charges"), and Milo tilts his head at it.
- **L6, enemy intelligence.** The Emberhog announces both its moves. "All'attacco!" means a charge that TERRA walls off; picking that over the obvious ACQUA is the evidence the player understood. Strong wind-up tells fade per word once understood.
- **L7, phrases.** Concepts can be chunks (`type: "phrase"`): "ho fame" is tracked alongside "fame".
- **L8, mystery beats.** Milo tells the stars something nobody can follow yet ("Mi ricordo una grande luce... e poi niente."); two Puffkins whisper about him ("Guarda... è lui." "Sì. È lui."): the player catches "guarda" and "sì" and realises they're talking about Milo.
- **Field notes** (§41): the journal now keeps the protagonist's observations ("Milo says “acqua” around water."), never definitions.
- **Removed:** Maren's "Not bad. Not bad at all." after the player read Bluster correctly (celebrating understanding), and Bluster's old "Acqua!" scene, whose human misreading wasn't plausible.

Not yet (later steps of the build order): L9 command composition, L10 audio refinement, written Lexling language (§37), constructions like "voglio / non voglio" (§42, §43), and more Lexling species (§79 asks for 5 to 8).

## Stack

- **Expo SDK 57, React Native, TypeScript, Expo Router** (game bible §44), the same versions as the owner's BrainScroll app.
- **npm workspaces:** `packages/core` (engines, pure TypeScript, no React), `content` (game data as JSON plus its validation tests), `app` (Expo). Engines never import React; content never contains code.
- **Zustand** for the one game store; **AsyncStorage** for the save.
- **zod** for the content contract and the save schema.
- **vitest** for unit and integration tests; **Playwright** plays Chapter One in a browser build.

## Engines are pure; the save changes only through events

Every engine (`encounter`, `battle`, `scheduler`, `language`) is a pure function of content, input and a seed. Engines return `GameEvent`s (`heard`, `used`, `evidence`, `hint`, `effects`, `battleEnd`...) and the one function `applyEvents` (core `save.ts`) turns them into a new save plus `Notice`s for the toasts. Every change to progress happens in one place, and a whole playthrough can run in a unit test (`content/test/slice.test.ts`).

All randomness is seeded (`rng.ts`). The save carries the seed and advances it.

## Comprehension model

One record per concept (core `language.ts`): exposures, successes, failures, hints, a memory strength, the situations it was met in, the speakers heard saying it, the channels it arrived through (Milo, a wild Lexling, an enemy, a command, an action), the situations the player used it in, and whether a success came after a gap.

Strength, in [0, 1]:

- an exposure adds 12% of the remaining gap, 1.5x in a new situation and 1.5x from a new speaker (together capped at 2x);
- a success adds 35%; a failure removes 30%;
- a hint costs nothing for a repeat, 8% for a context clue, 16% for the meaning;
- it halves every 2 days without successes, plus 2 days per success (capped at 60).

States, derived:

| State | When |
| --- | --- |
| unseen | never met |
| exposed | met, but in fewer than two situations or still faint |
| suspected | met in at least two situations, strength 0.25+ |
| demonstrated | acted on correctly at least once |
| understood | correct in two or more situations, heard from two speakers or through three channels, strength 0.55+ |
| internalized | understood, three or more success situations, a success after a 2-day gap, strength 0.8+ |

Help per state (the scaffold level):

| Level | When | Command tile | Creature speech |
| --- | --- | --- | --- |
| 3 | unseen, exposed, or forgotten (strength below 0.12 after a success) | icon + colour | icon beside the word |
| 2 | suspected, or rusty (below 0.3) | icon + colour | plain |
| 1 | demonstrated, understood | plain word | plain |
| 0 | internalized | plain word | plain, or sound first with "Sound first when I know them" |

Icons leave command tiles only after the player has acted on the word (language bible §28). Settings can put icons back at any time ("Keep element pictures").

## What counts as understanding

Player action is assessment (§34). Evidence is authored per decision: a `choice`, `tap` or `give` option can carry `evidence: [{ concept, result }]` (the flask when Milo asks for "acqua" is a success for water; the stick is a failure). An encounter may only judge concepts its `teaching` declares.

In battle:

- picking the counter to the foe's element (ACQUA against fire) is a success for its words;
- countering an announced move with something other than the obvious matchup (TERRA against "All'attacco!") is a success for the words of the announcement;
- anything else is only an exposure: the player may know exactly what "fuoco" means and be experimenting.

## Battles

- Turn order: the foe announces its move (speech plus a wind-up), the player picks a tile, Milo acts, the foe follows through unless Milo's move cancelled it.
- **Abilities declare what they cancel** (`counters` in `abilities.json`): water puts out a fire move, the stone wall stops a charge (`physical`). The element chart is data too (`elements.json`): water beats fire, wind beats earth, same-element hits are halved, **fire on a fire Lexling heals it** ("Mmm... grazie!"), **wind on fire fans its next fire move** (x1.5). Provisional and easy to change.
- **Wind-ups are scaffolding.** While the word a move is announced with is new (level 2 or 3), the app shows a strong tell (embers for fire, pawing for a charge). Once the word is demonstrated, the tell becomes generic smoke and the word carries the information. "Keep element pictures" keeps strong tells.
- The first Emberhog (54 HP) opens fire, charge, fire. Listening (ACQUA, TERRA, ACQUA) wins in three rounds with no damage; ACQUA alone also wins in three, taking the charge. Beginners can always play (§31); understanding pays.
- Tiles reshuffle every round (§29). Losing is gentle and a lost story battle comes back on the next explore.
- Battle help ladder: Milo's context clue (free), icons on every tile, the meaning under each tile.

## Encounters and story

Steps: `narrate`, `talk` (humans, English), `say` (creatures, the creature language), `act`, `stage`, `choice`, `tap`, `give`, `battle`, `reward`, `branch`, `end`. Branches see effects granted earlier in the same input. `end` can say `complete: false`.

**Story order is one sequence for the whole game** (`order`): Lodge intro (1), first night at camp (2), Whisperwood first steps (3), the stream (4), the hungry Pebblit (5), the hot path (6), the Emberhog (7), Milo's retelling (8), the whispers (9), the Lodge report (10). Each runs ahead of anything else at its place. Whisperwood opens once Milo has eaten; its repeatable scenes open after the Emberhog.

## Validation

The content tests check the schema, every reference and every scene's art, then the language rules (§67):

- every line teaches concepts or says it's `chatter` or `strange`; no speaker says the same line twice; every line is used;
- every encounter with creature lines has `teaching`; every concept it uses is declared; every introduced concept is grounded; evidence only judges declared concepts;
- story scenes only reinforce concepts an earlier story scene introduced;
- every concept is said by at least two speakers and met in at least two situations; none exists only as a command;
- no step is unreachable; no flag is waited on that nothing sets.

A test plays every encounter 25 times with random input to prove none can get stuck, and `content/test/slice.test.ts` plays Chapter One end to end.

## Scheduler

Story first. Otherwise a weighted pick: x0.25 if seen recently; x0.6 if the same Lexling spoke in the last scene; up to x2.5 when its words are due, full weight only when the scene is a new situation for them; x2 when someone new would use a word the player already suspects (a transfer moment); x0.2 when it would introduce more than two new words at once.

## Audio

- **Creature voices use the device's own text-to-speech** in Italian for the prototype (language bible §38 allows it for the MVP), with a pitch and pace per species. `app/src/audio/voice.ts` has a `CLIPS` table: a recorded clip registered there for a line id replaces TTS for that line.
- **Sound effects** are synthesised by `scripts/make-sfx.mjs` into `app/assets/sfx/` (placeholders; `npm run sfx -- --check` fails if they drift).

## Art

All art is drawn in code with react-native-svg: Milo (14 moods, 10 arm poses, blinking), four Lexling species, Maren, Pip, thirteen props, seven backgrounds, icons. Static drawings come alive through cheap transforms (`art/Actor.tsx`). Milo's ear tips, tail tip and forehead gem carry the four element colours. The language bible ranks visual direction after the language experience (§84), but art is part of grounding (§73): it must show objects, gestures, direction and emotion clearly.

## Naming in-world

- Humans say "Lexlings" and believe Lexlings communicate with a handful of sounds. Lexlings never name their language. The words "Italian" and "translation" never appear in play. The help ladder's last rung says "It means: ...".
- Human NPCs: **Maren Holt**, Warden of the Translators' Lodge; **Pip Calloway**, Translator Second Class (self-appointed), with his Puffkin **Bluster**.
- Species: **Emberhog** (fire, hostile), **Drizzlet** (water, playful), **Pebblit** (earth, shy), **Puffkin** (wind, playful).
- Places: **Camp**, the **Translators' Lodge**, **Whisperwood**; coming later: Riverlands, Ember Ridge, Saltglass Coast.

## Strange lines are not translated in the journal

"Sei tu... Ti abbiamo trovato." (the Emberhog), "Mi ricordo una grande luce... e poi niente." (Milo) and the Puffkins' whispers are kept in Journal, Strange things, with replay only: understanding them later is the point (§47, §52). The in-scene help ladder still offers the meaning of every line, so nobody is ever stuck.

## Italian review

Every line was written for natural, simple Italian, but none has had a native speaker's review. That review is required before launch (§88).
