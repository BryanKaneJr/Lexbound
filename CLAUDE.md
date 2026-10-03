# Lexbound: notes for AI coding agents

> **LEXBOUND LANGUAGE RULE:** Never treat Italian as quiz content. The player is learning to understand a living species. New language should be grounded through visible context, inferred before it is explained, resurfaced naturally through different situations, and eventually transferred across Milo, wild Lexlings, enemies, and story scenes. The game tracks comprehension invisibly. Understanding must reveal useful information: intentions, tactics, secrets, personality, relationships, routes, jokes, lore, and eventually the true plot. Milo is not a tutor. Enemy speech is intelligence. Human Translators can be plausibly wrong. Do not use translation questions, vocabulary popups, visible mastery scores, or "correct Italian = damage" as the core loop. The recurring emotional target is **"Wait... I understood that."** Italian is not merely Milo's command system. **Italian is the game's second reality.**
>
> (`docs/language-design.md` §92, pinned by the owner.)

Read before changing gameplay or content:

1. `docs/language-design.md`: the language design bible. It overrides any reading of the other docs that turns language into quizzes, drills or "correct Italian = damage".
2. `docs/game-bible.md`: the game's vision.
3. `docs/decisions.md`: how both were built and what changed; it wins on implementation details.
4. `docs/content-guide.md`: writing encounters and lines, including the authoring checklist every language-bearing encounter must pass.

Names: the game is **Lexbound**, the world **Lexora**, the creatures **Lexlings**. Milo is Milo.

## Commands (repo root)

- `npm run check`: typecheck all workspaces, lint the app (hook-order bugs are errors), copy lint (no em dashes), unit and content tests, and confirm the generated sound files are current. Run it before every commit.
- `npm run e2e`: build the web app and play the vertical slice in Chromium. Run it after changing screens, engines or story content. `npm run screens` saves screenshots to `./screens` to look at UI changes. Set `PW_CHROMIUM` to use an existing Chromium build.
- `npm run sfx`: regenerate `app/assets/sfx/` after editing `scripts/make-sfx.mjs`.
- `npm run app` / `npm run web`: Expo dev server. In `app/`, add dependencies with `npx expo install <pkg>` so they match SDK 57. Expo APIs change between SDKs: check the versioned docs (`https://docs.expo.dev/versions/v57.0.0/`) rather than memory.

## How it fits together

- **Engines are pure** (`packages/core`): `encounter.ts`, `battle.ts`, `scheduler.ts`, `language.ts`. They take content, input and a seed and return `GameEvent`s. Only `applyEvents` (`save.ts`) changes a save. Never mutate the save anywhere else, and never use `Math.random()` inside an engine (use `rng.ts` with a seed from the save).
- **Content is data** (`content/data`). New encounters, lines, Lexlings and places should need no engine or screen changes. Engines must not special-case content ids. The app may special-case only `lodge.intro` (first run).
- **Language-neutral vs language pack:** concepts, elements and Lexlings are neutral; words, lines and encounter scripts live under `content/data/it/`. Keep it that way so another creature language can ship later.
- The app reads content through `@/game/content`, the save through `useGame` (`app/src/state/store.ts`), and plays creature lines through `speakLine` (`app/src/audio/voice.ts`).

## Invariants

- **Italian is an interface, never a quiz.** No screen asks what a word means. Choices are actions ("Splash Milo"), tiles are commands, and the world shows the consequence. No "Correct!" or "Incorrect!", no red X. Mistakes are funny or recoverable (bible §18).
- **Never name the language in play.** No "Italian", "translate", "vocabulary", "lesson", "practice" or "review" in player-facing copy. The help ladder's last rung reads "It means: ...".
- **Show meaning before translating it.** English meaning is only ever the last rung of a help ladder the player chooses to climb. Context clues describe what's visible.
- **Language never buys raw power** (§39). Understanding improves decisions; XP and levels improve Milo. Don't add damage bonuses for language mastery.
- **Never announce mastery.** Toasts are about bond, XP, items, Lexlings and the journal, never about words learned.
- **Comprehension is hidden and per concept** (`language.ts`): unseen, exposed, suspected, demonstrated, understood, internalized, built from evidence (situations, speakers, channels, successful use, retention), never exposure counts alone. Icons leave command tiles only once a word is demonstrated; nothing reaches level 0 without surviving a time gap. Never show states, percentages or word counts to players (debug only). Settings can always restore icons.
- **Every language-bearing encounter declares its `teaching`** (purpose, introduces, reinforces, grounding). The validator enforces it, plus transfer: every concept must be said by at least two speakers and met in at least two situations. Story scenes may only lean on concepts an earlier story scene introduced.
- **Enemy speech is intelligence, never UI.** Don't caption enemy intent. Wind-up visuals carry beginners; once a word is demonstrated its strong visual tell fades and the word carries the information.
- **Don't celebrate understanding.** No praise when the player reacts correctly to language, from the UI or from characters (language bible §19, §48). Humans rationalize; they don't confirm the mystery.
- **Humans can be plausibly wrong** about Lexlings, and the world shows it through consequence, not commentary.
- **Field notes are observations, not definitions** ("Milo says “acqua” around water."), triggered by facts that never fade.
- **Command tiles reshuffle every round.**
- **Strange lines** (`"journal": "strange"`) are kept untranslated in the journal; don't add a meaning button there. Lines that teach nothing must say so (`"chatter": true`).
- **No punishment loops:** no hunger timers, energy, lives or guilt. Losing a battle costs nothing.
- **Offline first:** no network calls at runtime, no runtime LLM.
- **Saves are versioned** (`SAVE_VERSION`, `MIGRATIONS` in `save.ts`). Bump the version and add a migration for any breaking change; never edit an old migration. New settings need zod defaults so old saves load.
- **No em dashes** in anything Lexbound-authored (`npm run lint:copy`). Rewrite with a comma, colon, semicolon, parentheses or a full stop. The owner's verbatim documents (`docs/language-design.md`) are exempt.
- Every Italian line needs native review before launch; flag new lines in your summary.

## UI

- Build from `app/src/components/ui.tsx` and `app/src/theme/tokens.ts`. Text goes through `Txt` so the text-size setting applies.
- Respect Reduce Motion (`useReducedMotion`): animations collapse to state changes.
- React lint rules forbid reading refs during render: hold `Animated.Value`s in `useState(() => new Animated.Value(0))`, and read the time with `useNow()` instead of `Date.now()` in render.
- Art is drawn in code (`app/src/art`). Register sizes in `art/ids.ts` (the content tests check every scene against it) and shapes in `ASPECT` (`art/Actor.tsx`).
- Keep e2e (`e2e/slice.mjs`) in step with button labels it relies on.
