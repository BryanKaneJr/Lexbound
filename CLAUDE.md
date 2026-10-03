# Lexbound: notes for AI coding agents

Read `docs/game-bible.md` (the vision) and `docs/decisions.md` (how it was built; it wins where they differ) before changing gameplay. `docs/content-guide.md` covers writing encounters and lines.

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
- **Scaffolding is per concept** (`language.ts`). A concept can't drop below level 2 without one success. Settings can always restore icons.
- **Command tiles reshuffle every round.**
- **Strange lines** (`"journal": "strange"`) are kept untranslated in the journal; don't add a meaning button there.
- **No punishment loops:** no hunger timers, energy, lives or guilt. Losing a battle costs nothing.
- **Offline first:** no network calls at runtime, no runtime LLM.
- **Saves are versioned** (`SAVE_VERSION`, `MIGRATIONS` in `save.ts`). Bump the version and add a migration for any breaking change; never edit an old migration. New settings need zod defaults so old saves load.
- **No em dashes** in anything Lexbound-authored (`npm run lint:copy`). Rewrite with a comma, colon, semicolon, parentheses or a full stop.
- Every Italian line needs native review before launch; flag new lines in your summary.

## UI

- Build from `app/src/components/ui.tsx` and `app/src/theme/tokens.ts`. Text goes through `Txt` so the text-size setting applies.
- Respect Reduce Motion (`useReducedMotion`): animations collapse to state changes.
- React lint rules forbid reading refs during render: hold `Animated.Value`s in `useState(() => new Animated.Value(0))`, and read the time with `useNow()` instead of `Date.now()` in render.
- Art is drawn in code (`app/src/art`). Register sizes in `art/ids.ts` (the content tests check every scene against it) and shapes in `ASPECT` (`art/Actor.tsx`).
- Keep e2e (`e2e/slice.mjs`) in step with button labels it relies on.
