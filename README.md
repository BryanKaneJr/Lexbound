# Lexbound

An offline creature-companion RPG. In **Lexora**, humans speak English and the creatures, the **Lexlings**, speak their own language. You're a Translator-in-training, and your partner is **Milo**, a small Lexling nobody can identify who can somehow use every element. Understanding what he says is how you tell him what to do.

The Lexlings' language is real Italian. The game never says so; it just becomes the player's superpower.

<p>
  <img src="docs/img/stream.png" width="200" alt="Milo at the stream saying Acqua!">
  <img src="docs/img/battle.png" width="200" alt="The first battle against an Emberhog, with the command tiles ACQUA, VENTO, TERRA, FUOCO">
  <img src="docs/img/lodge.png" width="200" alt="Pip and Bluster at the Translators' Lodge">
  <img src="docs/img/journal.png" width="200" alt="The journal's bestiary">
</p>

## What's playable

Chapter One, on real engines:

1. **The Lodge.** Maren, a basket, a Lexling who says "Ciao!".
2. **The first night.** Milo is starving: "Fame..." He eats, then looks at the stars and says something nobody can follow yet.
3. **Whisperwood.** "Guarda!" and he points; "Vieni!" and he runs ahead.
4. **The stream.** Milo splashes and says "Acqua!". No translation anywhere.
5. **A hungry Pebblit.** A wild Lexling says "Ho fame...", and you realise it's Milo's word.
6. **The hot path.** Milo asks for "Acqua..."; the stick doesn't help, the flask does.
7. **The Emberhog.** It shouts before every move. ACQUA puts out "Fuoco!"; TERRA walls off "All'attacco!". By now ACQUA has lost its icon; the words you haven't used still have theirs. Listen, and nothing lands on Milo.
8. **After.** The Emberhog says something to Milo you can't follow yet. Two Puffkins whisper about him. Milo acts out the fight at camp. At the Lodge, Pip insists his Puffkin is restless; you can hear it's hungry.

Then Whisperwood keeps going: seven repeatable encounters picked by a scheduler that brings back the words you're losing, in new situations and from new voices. Camp, map, Milo's page, a journal (story, field notes, a bestiary with remembered lines, strange things heard), a bag, accessibility settings and developer tools come with it.

## Run it

Node 22.

```bash
npm install
npm run app          # Expo dev server: press i / a for a simulator, or scan with Expo Go
npm run web          # in a browser
```

## Check it

```bash
npm run check        # typecheck, lint, copy lint, unit + content tests, sound files up to date
npm run e2e          # builds for web and plays the whole slice in Chromium
npm run screens      # the same, saving screenshots to ./screens
```

## Layout

| Folder | What |
| --- | --- |
| `packages/core` | The engines: language model, encounters, battles, scheduler, progression, save. Pure TypeScript, fully unit-tested. |
| `content` | The game as data: concepts, Italian lines, Lexlings, places, encounters. Its tests validate every reference and play the slice. |
| `app` | The Expo app. Art is drawn in code (`app/src/art`). |
| `e2e` | Playwright: plays the slice in a browser build. |
| `docs` | `language-design.md` (the language contract), `game-bible.md` (the vision), `decisions.md` (how it was built and what changed), `content-guide.md` (writing encounters). |

## Not yet

Command composition ("ATTACCA + CON + ACQUA"), constructions like "voglio / non voglio", written Lexling language, more Lexling species and regions, recorded voices (creature lines use the device's Italian text-to-speech for now), and a native Italian speaker's review of every line. See `docs/decisions.md`.
