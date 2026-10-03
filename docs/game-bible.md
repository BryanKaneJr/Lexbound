# Lexbound: game and build bible

> **Names (owner, 2026-10-03):** the game is **Lexbound**, the world is **Lexora**, and its creatures are **Lexlings**. Where this bible says "Project Translator", "the world" or "creatures", read those names. "Translators" stays as the in-world name for creature-bonded humans, and Milo keeps his name.
>
> This is the owner's original bible, kept verbatim below. Product decisions made since are in `docs/decisions.md`; when they disagree, `decisions.md` wins.

---

# PROJECT TRANSLATOR
## Offline Creature-Companion Language RPG - Game & Build Bible

> **Core fantasy:** You are not studying Italian. You are becoming one of the rare humans capable of understanding and commanding magical creatures - and your companion, Milo, may be the most unusual creature in the world.

---

# 1. THE ONE-SENTENCE PITCH

A mobile creature-companion RPG where humans speak English, magical creatures speak Italian, and the player gradually learns to understand and communicate with their uniquely multi-elemental companion through exploration, relationships, story, and turn-based battles.

The player never needs to be told, in-world, that the creatures are speaking Italian. To the characters, it is simply the creature language.

The player's real-world reward is Italian acquisition. The in-world reward is becoming a powerful **Translator**.

---

# 2. THE CENTRAL IDEA

The game must never feel like:

- Duolingo with combat.
- Flashcards wearing an RPG costume.
- "Answer correctly to deal damage."
- Schoolwork between story scenes.
- A vocabulary quiz with animated creatures.

Instead, Italian is a **game interface**.

The player learns Italian because understanding the creature language gives them greater control over Milo, more information about enemies, deeper relationships with creatures, more story information, and more effective options in combat.

The fundamental loop is:

**Experience -> infer meaning -> use meaning -> see consequence -> encounter it again -> internalize it -> use it in a more complex context.**

The game should reward the moment when the player reacts to Italian **without translating it into English first**.

That is the target experience.

---

# 3. THE WORLD

Humans and magical creatures have always lived beside one another.

Humans speak the player's native language. For the initial product, that is English.

Creatures have their own language.

Most humans can understand creature emotion and behavior in the same way a person understands a dog or horse, but they cannot truly understand what creatures are saying.

A small number of people develop unusually close bonds with creatures and begin understanding pieces of their language. These people are known as **Translators** (working title).

Translators are explorers, creature handlers, mediators, defenders, researchers, and adventurers. Their bonded creatures accompany them throughout the world.

Most Translators understand their own companion better than other creatures. True fluency is extraordinarily rare.

Then the player meets **Milo**.

---

# 4. MILO

Milo is the heart of the game.

He is not a language tutor disguised as a mascot. He is the player's partner, friend, combat companion, emotional anchor, and primary reason to want to understand the creature language.

## Milo is special

Normal creatures have elemental affinities.

Examples:

- Fire
- Water
- Nature
- Earth
- Wind
- Ice
- Lightning
- Light
- Shadow

Milo can eventually channel **all elemental types**.

This is considered impossible, or nearly impossible, in the world.

At the beginning, neither the player nor Milo understands the extent of this ability.

Milo's elemental potential creates the mechanical reason why communication matters so much. Milo can potentially counter almost any enemy, but only if the player can successfully communicate what they want him to do.

## Milo's personality

Milo should feel alive with a very small animation budget.

He should be:

- expressive;
- curious;
- mischievous;
- brave when necessary;
- occasionally stubborn;
- affectionate without becoming saccharine;
- capable of humor;
- capable of frustration when communication fails;
- visibly proud when communication succeeds.

The relationship should eventually feel like two friends who developed their own rhythm together.

## Milo must never feel like a menu

The player should not think:

> Milo = battle unit.

They should think:

> That's Milo.

He reacts to locations, items, enemies, story moments, mistakes, victories, food, weather, other creatures, and the player's growing ability to understand him.

---

# 5. THE SECRET: THE CREATURE LANGUAGE IS REAL ITALIAN

Inside the fiction, it is never called Italian.

It is simply the language spoken by creatures.

Outside the fiction, the product can openly market itself as an Italian-learning RPG.

This distinction is important.

The player should psychologically experience:

> I'm beginning to understand Milo.

rather than:

> I completed vocabulary lesson 14.

Every Italian word learned represents a real expansion of the player's relationship and capability.

---

# 6. IMMERSION WITHOUT CONFUSION

The game cannot simply dump untranslated Italian onto beginners.

The key design principle is **comprehensible immersion**.

New language should first appear in contexts where meaning can be inferred without English.

Meaning can be communicated through:

- Milo's gestures;
- facial expressions;
- objects;
- environmental art;
- character movement;
- repeated situations;
- sound effects;
- consequences;
- elemental effects;
- icons used temporarily during early exposure;
- another character's visible behavior;
- contrast between two situations.

Example:

Milo reaches a stream, drinks, splashes happily, points toward it and says:

**"Acqua!"**

The game does not display:

> Acqua = water.

Later, Milo is thirsty and asks for **acqua**.

Later still, a fire creature appears and the player sees four elemental commands.

The player chooses **ACQUA**.

Milo attacks with water.

The player has now experienced the word in several meaningful contexts.

---

# 7. THE GOLDEN RULE OF TEACHING

Whenever practical:

> **Show meaning before translating meaning.**

English translation is a fallback, accessibility aid, and anti-frustration tool - not the default learning method.

If a concept can be communicated through animation, context, imagery, contrast, or consequence, do that first.

The game should not punish someone for needing help. A long-press or help action may reveal increasingly explicit clues and ultimately an English translation.

But the game should attempt immersion first.

---

# 8. THE CORE GAME LOOP

The app-sized core loop is intentionally simple:

1. **Choose a destination.**
2. **Experience a short encounter.**
3. **Interact with Milo, another creature, a human NPC, or the environment.**
4. **Encounter creature language in context.**
5. **Make a game decision based on what is happening.**
6. **Occasionally enter combat.**
7. **Communicate commands to Milo.**
8. **Receive immediate visual consequences.**
9. **Gain story progress, bond, items, creature discoveries, abilities, or access to new areas.**
10. **Return home / continue exploring.**

A session can last two minutes or thirty minutes.

---

# 9. MOBILE WORLD STRUCTURE

Do not build an open world.

Do not build free-roaming 3D environments.

Do not build a Pokémon clone.

The world is presented through **illustrated locations and encounter scenes**.

Example world map:

- Home / Translator Guild
- Village
- Forest
- Riverlands
- Coast
- Mountains
- Ruins
- Caverns
- Capital
- Endgame region

A location is primarily:

- a background illustration;
- optional ambient animation;
- encounter tables;
- creatures available there;
- story events;
- items;
- battles;
- short choices.

The player taps a location and receives authored or semi-randomized encounters.

This creates the *feeling* of a large RPG world without building a large RPG world.

---

# 10. ENCOUNTERS

The majority of content should be built through a reusable **Encounter Engine**.

An encounter is a small state machine containing:

- location;
- background;
- participants;
- dialogue;
- creature-language lines;
- visual actions;
- choices;
- prerequisites;
- outcomes;
- rewards;
- optional battle trigger;
- vocabulary/concepts being reinforced;
- story flags.

Examples:

- Milo notices something beneath a rock.
- A frightened creature is trapped.
- A creature asks for food.
- Two creatures are arguing.
- A human cannot understand what their companion wants.
- A hostile creature blocks the road.
- Milo hears something nearby.
- An injured creature refuses help.
- An enemy patrol discusses its plan.
- A strange creature repeats a word the player knows.
- Milo finds an object and tries to explain what it is.

The engine is programmed once. Most future gameplay is data.

---

# 11. COMBAT: THE CORE RPG SYSTEM

Combat must be a real game system.

It cannot be a quiz where correct Italian deals damage.

The player should make tactical decisions and use their growing understanding of creature language to communicate those decisions.

## Basic battle layout

Turn-based 2D battle.

Screen contains:

- enemy creature(s);
- Milo;
- health / energy;
- enemy visual state;
- environmental details when relevant;
- command area;
- occasional dialogue bubbles;
- effects / attack animations.

No grid is required for MVP.

## Elemental logic

Use a readable type-counter system.

Example relationships:

- Water counters Fire.
- Fire counters Ice / Nature.
- Nature counters Water / Earth depending on final chart.
- Earth counters Lightning.
- Wind may counter Earth or provide mobility.
- Light and Shadow oppose one another.

The final chart should remain simple enough to learn visually.

## Why Milo matters

Most creatures possess one primary element, possibly a secondary one later.

Milo can access all elements as the story progresses.

Therefore the player's challenge is not merely possessing the correct counter. Milo probably has it.

The challenge is **communicating the correct response**.

---

# 12. THE ELEMENT COMMAND EXAMPLE

A flaming creature attacks.

Visually, the player can infer that it is Fire-type.

Milo waits for direction.

Early game command options might be:

- 💧 ACQUA
- 🔥 FUOCO
- 🪨 TERRA
- 💨 VENTO

The player chooses **ACQUA**.

Milo performs a water attack.

The player was never asked:

> What does acqua mean?

They were asked, implicitly:

> What should Milo do?

That difference is foundational.

---

# 13. REMOVE LANGUAGE CRUTCHES GRADUALLY

Early exposure:

**💧 ACQUA**

After demonstrated understanding:

**ACQUA**

The icon disappears.

The game should quietly remove contextual scaffolding as confidence rises.

This should happen per concept rather than through blunt global difficulty levels.

The player may still restore accessibility assistance in settings.

Important: command positions should not remain fixed. Otherwise players can learn "water is top-left" rather than learning **acqua**.

---

# 14. COMMAND COMPLEXITY IS RPG PROGRESSION

Language progression should unlock **precision**, not arbitrary damage bonuses.

Early:

**Acqua!**

Then:

**Usa l'acqua!**

Then:

**Attacca con l'acqua!**

Then targeting:

**Attacca quello grande con l'acqua!**

Then sequencing:

**Prima proteggimi, poi attacca!**

Then richer tactical language:

**Proteggimi dal fuoco, poi attacca quello piccolo con l'acqua.**

The player experiences this as gaining increasingly sophisticated control over Milo.

The actual educational result is moving from isolated vocabulary toward sentence comprehension and production.

---

# 15. COMMANDS SHOULD NOT ALL BE ATTACKS

Language should control tactical concepts including:

### Elements
- acqua
- fuoco
- terra
- vento
- ghiaccio
- fulmine
- luce
- ombra

### Size / intensity
- grande
- piccolo
- forte
- debole

### Speed
- veloce
- lento

### Position / direction
- sinistra
- destra
- sopra
- sotto
- davanti
- dietro
- vicino
- lontano

### Actions
- attacca
- difendi
- aspetta
- vai
- vieni
- guarda
- prendi
- usa
- proteggi
- evita

### Sequencing
- prima
- poi
- dopo

### Targets / references
- io
- tu
- quello
- questo
- nemico
- grande
- piccolo

These concepts are useful both in battle and normal exploration, creating natural repetition.

---

# 16. ENEMY SPEECH IS GAME INFORMATION

Hostile creatures also speak the creature language.

This creates a second learning channel.

An enemy might shout:

**"Attacca Milo!"**

If the player understands it, they know the enemy's target before the action resolves.

Later:

**"Prima attacca il ragazzo, poi Milo!"**

The player's growing comprehension becomes tactical intelligence.

Enemy dialogue can reveal:

- intended target;
- intended element;
- fear / weakness;
- retreat plans;
- coordination;
- deception;
- story information;
- personality.

This makes receptive comprehension mechanically valuable without turning it into a test.

---

# 17. MILO SPEAKS DURING COMBAT

Milo is not simply waiting for commands.

He communicates observations.

Examples:

**"Attento!"**

**"Dietro di te!"**

**"Ha paura dell'acqua!"**

**"Sono stanco!"**

**"Proteggimi!"**

**"Posso farlo!"**

Understanding Milo gives the player better tactical information.

Misunderstanding should not always be catastrophic. It can produce funny, recoverable, or merely suboptimal outcomes.

---

# 18. COMMUNICATION FAILURE SHOULD BE FUN

Wrong choices must not feel like red X educational punishment.

If the player says **fuoco** against a Fire creature, Milo may look confused, shrug, then do it anyway.

The fire creature absorbs it.

Milo turns back with a look like:

> Seriously?

No teacher voice says "Incorrect!"

The world demonstrated the mistake.

This protects the fantasy.

---

# 19. THE PLAYER CHARACTER

The player character is a human becoming a Translator.

Humans speak English to the player normally.

This is crucial because it lets the game tell a compelling story without forcing a beginner to decode every plot point.

Human NPCs can:

- explain world lore;
- provide quests;
- react to Milo;
- discuss Translators;
- ask the player to interpret creatures;
- create mystery around Milo;
- misunderstand creature motives.

Creature communication remains the immersion space.

---

# 20. TRANSLATORS

Translators are the world's creature-bonded adventurers.

Different Translators have different levels of understanding.

Some understand only their own creature.

Some know common commands.

Some are scholars.

Some exaggerate their abilities.

Some misunderstand their partners.

This allows funny and dramatic scenes where the player realizes they understand more than an NPC who supposedly has years of experience.

Translator NPCs can act as rivals, mentors, allies, antagonists, and bosses.

---

# 21. OTHER CREATURES

Creature collection should exist without creating Pokémon-scale scope.

The player does **not** need to own and battle with 150 fully playable monsters.

Milo remains the primary battle companion.

Other creatures can be:

- discovered;
- befriended;
- catalogued;
- helped;
- invited to a sanctuary/home;
- encountered again;
- used for passive bonuses or small utilities;
- involved in stories.

This creates collection dopamine without requiring every creature to have a complete battle moveset.

## Optional later expansion

A small number of special creatures could eventually become alternate companions, but this is explicitly **not MVP**.

---

# 22. BEFRIENDING CREATURES

Befriending should often involve understanding what a creature wants.

Examples:

- food;
- help;
- protection;
- an item;
- being left alone;
- finding another creature;
- defeating a hostile creature;
- solving a misunderstanding;
- returning something stolen;
- correctly interpreting a warning.

The player does not answer a vocabulary question.

They take an action in the world.

---

# 23. CREATURE INDEX / BESTIARY

The collection screen acts as an RPG bestiary rather than a vocabulary list.

Each creature can include:

- illustration;
- name;
- habitat;
- elemental affinity;
- behavior;
- encounters completed;
- relationship status;
- snippets of creature dialogue the player has encountered;
- discoveries;
- optional lore.

Language knowledge can quietly appear here through remembered quotes rather than dictionary-style drills.

---

# 24. THE BOND SYSTEM

Milo's relationship with the player needs visible progression.

Working metrics:

- Bond
- Trust
- Understanding

Avoid turning the relationship into a giant stat spreadsheet.

Bond grows through:

- exploration;
- helping Milo;
- successful communication;
- story events;
- battles;
- gifts / food in moderation;
- spending time together;
- understanding emotional requests.

Bond can unlock:

- new animations;
- reactions;
- story scenes;
- elemental powers;
- more complex communication;
- cosmetic changes;
- special team abilities.

---

# 25. LANGUAGE MASTERY MODEL

Internally, the app should maintain a confidence score for concepts.

The player does not need to see raw educational analytics.

Each concept may track:

- exposures;
- successful inferred uses;
- failed uses;
- recent exposure time;
- contexts encountered;
- whether visual scaffolding is enabled;
- estimated mastery/confidence.

Example concept object:

```json
{
  "id": "acqua",
  "italian": "acqua",
  "concept": "water",
  "category": "noun",
  "exposures": 8,
  "successfulUses": 5,
  "failedUses": 1,
  "confidence": 0.82,
  "scaffoldLevel": 1,
  "lastSeen": "..."
}
```

The English `concept` exists internally for content management. It does not need to be displayed during normal gameplay.

---

# 26. SCAFFOLD LEVELS

A useful per-concept system:

### Level 3 - Heavy context
Italian + obvious icon/animation/environmental demonstration.

### Level 2 - Moderate context
Italian + contextual scene, but no explicit icon attached to the word.

### Level 1 - Light context
Italian appears naturally. The surrounding situation still provides clues.

### Level 0 - Fluent presentation
No special assistance.

The system can move concepts up or down based on performance.

Do not aggressively punish forgetting. If a player returns after two weeks, the game can naturally restore contextual support.

---

# 27. SPACED REPETITION WITHOUT STUDYING

The app should use learning science invisibly.

If the player needs reinforcement for **sotto**, the game does not open a review lesson.

Instead future encounter weighting favors natural uses:

- Milo's toy is under the bed.
- Something moves under a bridge.
- An enemy hides under a platform.
- A creature says an item is under a rock.

The player repeatedly experiences **sotto** across different contexts.

This prevents memorizing a single picture or phrase.

The learning scheduler should choose *game content* rather than flashcards.

---

# 28. LANGUAGE CURRICULUM WITHOUT LOOKING LIKE A CURRICULUM

Behind the scenes, content must still be carefully sequenced.

Recommended broad progression:

### Stage 1 - Immediate physical concepts
Greetings, yes/no, elements, food, basic objects, go/come/look/wait, basic emotion.

### Stage 2 - Descriptions
Colors, size, strength, speed, simple numbers, common adjectives.

### Stage 3 - Space
Left/right, above/below, near/far, in/out, here/there, before/behind.

### Stage 4 - Intent and combat
Attack, defend, protect, avoid, use, take, give, help.

### Stage 5 - Simple sentences
Subject/action/object relationships, wants, needs, possession, questions.

### Stage 6 - Sequence and time
Before, after, then, today, yesterday, soon, now.

### Stage 7 - More natural conversation
Reasons, opinions, feelings, plans, uncertainty.

### Stage 8 - Advanced story comprehension
Longer dialogue, tense variation, subordinate ideas, idiomatic language.

The player sees none of these stages as lessons.

---

# 29. LISTENING MUST MATTER

Text alone is insufficient for a language product.

Creature lines should have audio whenever feasible.

For MVP, audio can be pre-generated and shipped locally.

Requirements:

- offline playback;
- consistent creature voice identity;
- clear Italian pronunciation;
- optional replay button;
- adjustable speech speed as accessibility;
- text can accompany audio initially.

Long-term, the game should increasingly encourage recognition from sound rather than text alone.

Possible progression:

1. audio + Italian text + visual cue;
2. audio + Italian text;
3. audio first, text available after tap;
4. occasional audio-only reactions for mastered language.

Do not remove text universally; maintain accessibility settings.

---

# 30. SPEAKING / INPUT

Do not make speech recognition an MVP dependency.

It adds:

- microphone permissions;
- recognition errors;
- accents / pronunciation complexity;
- offline model size;
- platform inconsistencies;
- frustration unrelated to actual comprehension.

MVP communication uses tappable Italian words / phrases / command tiles.

Possible later feature:

**Speak to Milo** mode using on-device speech recognition where available.

It should be optional, not required to enjoy or complete the game.

---

# 31. COMMAND TILE SYSTEM

During relevant interactions, the player receives a small set of possible creature-language commands.

Examples:

**ACQUA | FUOCO | TERRA | VENTO**

or

**SINISTRA | DESTRA**

or

**ATTACCA | DIFENDI | ASPETTA**

Later, the player can construct commands from known pieces.

Example:

`ATTACCA` + `CON` + `ACQUA`

Then:

`PRIMA` + `DIFENDI` + `POI` + `ATTACCA`

This system should feel like tactical command construction, not sentence homework.

---

# 32. DO NOT OVERUSE MULTIPLE CHOICE

Four options are useful early and in combat, but the game must avoid becoming one endless multiple-choice interface.

Vary interaction types:

- choose an action in the scene;
- select a target;
- select an element;
- arrange 2-4 command tiles;
- tap an object Milo referred to;
- choose where to move;
- give an item;
- respond to Milo;
- interpret enemy intent through gameplay;
- choose whether to trust a creature;
- use a known word to modify a command.

The question should usually be **what do I want to do?**, not **what does this word mean?**

---

# 33. STORY FOUNDATION

Creatures across the world are becoming unusually aggressive.

Humans see attacks, thefts, disappearances, and coordinated creature behavior.

The prevailing belief is that something is causing creatures to become hostile.

The player and Milo begin helping defend people and investigating incidents.

As the player's creature-language comprehension improves, they discover something disturbing:

The hostile creatures are not acting randomly.

They are communicating.

They are coordinating.

They are looking for something.

Some mention Milo.

Some appear to recognize what he is.

Some creatures humans label as "hostile" may have completely different motives than humans assume.

The central mystery should exploit the player's growing comprehension.

Information that sounded meaningless early in the game can become meaningful later.

---

# 34. STORY AND LANGUAGE SHOULD INTERLOCK

A great story moment should occasionally occur because the player understands a creature directly rather than because a human explains it.

Example:

A supposedly hostile creature is defeated.

It looks at Milo and says:

**"Non sai cosa sei."**

A beginner may only understand pieces.

Later, the meaning becomes clear:

> You don't know what you are.

That line suddenly matters.

The game can preserve important creature dialogue in a journal so old lines become understandable as the player progresses.

This creates retroactive discovery.

---

# 35. THE JOURNAL

The journal should feel like the protagonist's adventure record, not a textbook.

Sections could include:

- Story
- Creatures
- Places
- Milo
- Strange Things We've Heard

Optional language information should be integrated naturally.

For example, **Things Milo Says** can show familiar phrases and allow replaying audio.

Avoid giant English/Italian vocabulary tables as the primary experience.

---

# 36. HOME / CAMP

The home screen gives the app emotional continuity.

Milo lives here.

Possible interactions:

- tap Milo;
- feed Milo;
- give him discovered objects;
- replay conversations;
- see idle behavior;
- access map;
- inspect journal;
- see befriended creatures;
- trigger occasional mini-events.

This screen can create a Tamagotchi-like bond without requiring complex simulation.

No punishing hunger timers or manipulative neglect systems.

---

# 37. QUEST DESIGN

Human quests can be communicated normally in English.

Creature-driven quests should rely more heavily on observation and communication.

Examples:

**Human:** "The creatures near the river have been stealing supplies. Find out why."

At the river, the player discovers creatures discussing **fame** (hunger) and realizes they are starving.

Now the quest becomes morally and narratively different because the player understood them.

This is the type of interaction that makes the language mechanic matter beyond combat.

---

# 38. ITEMS AND EQUIPMENT

Keep equipment deliberately light.

Potential player equipment:

- Translator charm;
- backpack upgrades;
- protective gear;
- artifacts;
- consumables.

Potential Milo upgrades:

- charms;
- elemental focus items;
- cosmetic accessories;
- story-linked artifacts.

Do not build Diablo inventory management.

A handful of meaningful equipment slots is enough.

---

# 39. LEVELING

There should be genuine RPG progression independent of language.

Milo gains experience through encounters and combat.

Leveling can improve:

- health;
- energy;
- elemental abilities;
- status resistance;
- new attacks;
- team abilities.

The player can also gain Translator Rank through story milestones.

Important:

Do not directly convert language mastery into raw combat stats.

Knowing Italian should improve the player's **decision-making and command precision**, while traditional RPG progression improves Milo's underlying power.

These systems complement each other.

---

# 40. ELEMENTAL ABILITIES

Each element should have a small, understandable toolkit.

Example:

## Water
- Water Bolt
- Water Shield
- Rain

## Fire
- Flame Burst
- Fire Wall
- Heat

## Earth
- Stone Strike
- Barrier
- Tremor

## Wind
- Gust
- Speed / evade
- Push

## Ice
- Freeze
- Ice Shield
- Slow

Do not launch with 100 skills.

MVP can have four elements with two abilities each.

---

# 41. BOSS BATTLES

Bosses should test **combined understanding**, not obscure vocabulary.

A boss might:

- change elemental forms;
- announce attacks;
- command minions;
- react to Milo's commands;
- create environmental hazards;
- deceive the player;
- require multi-step commands.

Example:

Boss changes from Fire to Earth.

Milo asks:

**"Acqua o vento?"**

Later the boss commands:

**"Attaccate prima Milo!"**

The player can anticipate the assault if they understand.

A great boss feels like the culmination of the player's relationship with Milo, not an Italian exam.

---

# 42. GAME OVER / FAILURE

Failure should be forgiving for mobile play.

Losing a battle can:

- return the player to camp;
- cost a small consumable/resource;
- allow immediate retry;
- slightly alter a story encounter.

Do not punish language mistakes with excessive grinding.

---

# 43. OFFLINE-FIRST REQUIREMENT

The game must function fully offline after installation / required language pack download.

Offline assets include:

- encounter data;
- dialogue;
- audio;
- creature art;
- animations;
- progression logic;
- save data;
- curriculum data.

No LLM is required at runtime.

No server is required for core gameplay.

This is a major advantage:

- predictable behavior;
- low operating cost;
- child-friendly potential;
- airplane/travel use;
- fast response;
- no AI hallucination risk in language instruction.

---

# 44. RECOMMENDED TECH STACK

For a Claude Code / Codex-friendly mobile project:

## App

**React Native + Expo + TypeScript**

Reasons:

- rapid iteration;
- one codebase for iOS and Android;
- strong AI coding support;
- easy audio / animation / local storage;
- excellent for screen-based 2D games;
- avoids unnecessary Unity complexity.

This project is an app-shaped RPG, not a physics-heavy game. React Native is appropriate.

## State

Start simple:

- Zustand or similarly lightweight state store.

## Persistence

MVP:

- local JSON / AsyncStorage for lightweight state.

Production:

- SQLite for content/progression if useful;
- versioned save migrations.

## Content

Structured JSON or TypeScript data files initially.

Eventually move large content sets to generated JSON bundles.

## Animation

- sprite sheets;
- Lottie where appropriate;
- Reanimated for UI motion;
- simple image swaps for expressions.

Do not build skeletal animation unless truly necessary.

## Audio

Pre-generated local audio assets with metadata references.

---

# 45. APP ARCHITECTURE

Keep the engine modular.

Suggested modules:

```text
/src
  /app
  /components
  /screens
  /engine
    encounterEngine.ts
    battleEngine.ts
    languageEngine.ts
    progressionEngine.ts
    rewardEngine.ts
    storyEngine.ts
  /data
    /encounters
    /creatures
    /language
    /locations
    /story
    /items
    /abilities
  /state
  /audio
  /utils
/assets
  /creatures
  /backgrounds
  /effects
  /audio
```

The exact structure can evolve, but the important rule is:

> **Separate engine logic from content.**

Adding encounter #500 should not require changing encounter engine code.

---

# 46. CONTENT DATA MODEL

Example encounter:

```json
{
  "id": "forest_stream_001",
  "location": "forest",
  "type": "exploration",
  "weight": 10,
  "requirements": [],
  "actors": ["milo"],
  "scene": {
    "background": "forest_stream",
    "miloAnimation": "drink"
  },
  "dialogue": [
    {
      "speaker": "milo",
      "language": "creature",
      "text": "Acqua!",
      "audio": "milo_acqua_01.mp3",
      "concepts": ["acqua"]
    }
  ],
  "choices": [
    {
      "id": "splash",
      "label": "Splash Milo",
      "outcome": "milo_playful"
    },
    {
      "id": "continue",
      "label": "Keep walking",
      "outcome": "end"
    }
  ]
}
```

---

# 47. BATTLE DATA MODEL

Example enemy:

```json
{
  "id": "ember_boar",
  "name": "Ember Boar",
  "element": "fire",
  "hp": 40,
  "attacks": ["charge", "flame_burst"],
  "speechPool": [
    "enemy_attack_milo",
    "enemy_fire_warning"
  ],
  "weaknesses": ["water"],
  "resistances": ["fire"]
}
```

Example command:

```json
{
  "id": "element_water",
  "display": "ACQUA",
  "concepts": ["acqua"],
  "effect": {
    "type": "elementAttack",
    "element": "water"
  }
}
```

The battle engine should know combat effects. The language layer decides how commands are presented and scaffolded.

---

# 48. LANGUAGE ENGINE RESPONSIBILITIES

The language engine should:

- track concept exposure;
- track demonstrated understanding;
- determine scaffold level;
- choose whether icons/context aids appear;
- identify concepts due for reinforcement;
- provide encounter weighting hints;
- track audio exposure;
- support phrase complexity progression;
- expose debug information for developers.

It should **not**:

- interrupt gameplay with mandatory lessons;
- constantly announce mastery;
- convert everything into points;
- require perfect recall.

---

# 49. ENCOUNTER SCHEDULER

The scheduler selects content using:

- current location;
- story state;
- encounter cooldowns;
- concepts due for reinforcement;
- concepts currently being introduced;
- recent encounter history;
- creature availability;
- player progression;
- random weighting.

This is how the game creates disguised spaced repetition.

Pseudo-logic:

```text
eligible encounters
-> remove unmet story requirements
-> reduce recently seen encounters
-> boost encounters containing due concepts
-> boost current story encounters
-> weighted random selection
```

Do not overengineer adaptive learning in V1.

Simple weighting is enough.

---

# 50. CONTENT AUTHORING PIPELINE

AI should be used heavily **during development**, not necessarily at runtime.

Create scripts/tools that allow Claude/Codex to generate structured encounter content.

Recommended pipeline:

1. Define language concepts and allowed grammar for a chapter.
2. Define locations and available creatures.
3. Generate encounter drafts constrained to those concepts.
4. Validate JSON schema automatically.
5. Run language QA.
6. Human review important story / teaching scenes.
7. Generate or assign audio.
8. Add to content bundle.
9. Automated test confirms references/assets exist.

The project becomes scalable because content generation is structured.

---

# 51. LANGUAGE ACCURACY PIPELINE

This cannot rely blindly on AI output.

Every Italian line should eventually be validated for:

- grammatical correctness;
- natural phrasing;
- appropriate register;
- target difficulty;
- consistency with known vocabulary;
- pronunciation/audio quality.

For prototype development, AI validation is acceptable.

Before commercial launch, important curriculum/content should receive review from a fluent/native Italian speaker or qualified language professional.

---

# 52. ART STRATEGY

The visual target should feel premium but be inexpensive to produce.

Recommended:

- 2D illustrated creatures;
- transparent PNG/WebP sprites;
- 3-6 key expressions per minor creature;
- more expressions for Milo;
- static painted backgrounds;
- particle effects layered over art;
- screen shake / flashes / motion tweens for attacks;
- simple shadows;
- subtle idle movement.

A static illustration can feel surprisingly alive through:

- breathing scale loop;
- blink frames;
- bounce;
- tilt;
- squash/stretch;
- particles;
- camera movement;
- sound.

Do not animate everything frame-by-frame.

---

# 53. MILO ART REQUIREMENTS

Milo needs the largest animation budget because the player will stare at him constantly.

MVP Milo states:

- idle;
- blink;
- happy;
- excited;
- confused;
- annoyed;
- scared;
- tired;
- hurt;
- celebrate;
- eat;
- drink;
- point / indicate;
- attack;
- defend;
- elemental charge.

Elemental effects can be overlays rather than unique full-body animations.

This dramatically reduces asset requirements.

---

# 54. AUDIO STRATEGY

Audio matters enormously because this is language acquisition.

Minimum:

- Milo creature voice / Italian speech;
- enemy creature speech;
- attack SFX;
- UI feedback;
- ambient loops;
- music;
- creature reactions.

Creature speech should remain intelligible Italian. Do not distort voices so heavily that pronunciation becomes useless.

Different creatures can have pitch/timbre processing while preserving clarity.

---

# 55. USER INTERFACE

The UI should feel like an RPG first.

Primary navigation:

- Home
- Map
- Milo
- Journal / Bestiary
- Inventory

Battle UI appears only during combat.

Avoid permanent education-style navigation such as:

- Lessons
- Practice
- Vocabulary
- Grammar
- Review

If optional review tools eventually exist, hide them naturally inside the Journal or Translator Guild.

---

# 56. ACCESSIBILITY / ANTI-FRUSTRATION

Players must never become permanently stuck because they forgot a word.

Support layers:

1. contextual visual clue;
2. repeat audio;
3. Milo repeats / gestures;
4. stronger visual hint;
5. optional English meaning.

The player chooses how much help they need.

Settings should include:

- subtitles;
- audio replay;
- speech speed;
- persistent element icons;
- stronger language hints;
- color-blind-safe elemental indicators;
- reduced motion;
- text size.

Learning purity is less important than keeping the player playing.

---

# 57. WHAT WE ARE EXPLICITLY NOT BUILDING

For V1, reject scope creep involving:

- 3D open world;
- free-roaming joystick exploration;
- multiplayer;
- PvP;
- trading;
- guilds;
- live service dependencies;
- runtime LLM conversations;
- procedural AI dialogue;
- breeding;
- hundreds of playable battle creatures;
- elaborate crafting;
- complex equipment grids;
- housing construction;
- MMO systems;
- mandatory speech recognition;
- giant skill trees;
- real-time action combat;
- physics-heavy puzzles.

These features are not required to prove the idea.

---

# 58. MVP DEFINITION

The first real playable prototype should contain:

## World
- Home / camp
- Forest
- Village or Guild

## Characters
- Player
- Milo
- 2 human NPCs
- 4-6 creature species
- 2 hostile creature types
- 1 mini-boss

## Language
- approximately 50-100 core concepts;
- greetings;
- four initial elements;
- basic actions;
- basic directions/descriptors;
- simple combat phrases.

## Combat
- turn-based;
- Milo + one enemy initially;
- four elements;
- 1-2 abilities per element;
- weaknesses/resistances;
- enemy speech telegraphs;
- Milo battle speech;
- simple status effects if easy.

## Content
- 30-50 encounters;
- one short story arc;
- one mystery involving creature communication;
- one boss/mini-boss;
- approximately 45-90 minutes of content.

## Systems
- local save;
- language confidence tracking;
- encounter weighting;
- map;
- journal;
- bestiary;
- simple inventory;
- Milo bond;
- audio playback.

This is enough to determine whether the concept works.

---

# 59. MVP SUCCESS TEST

Do not judge the prototype primarily by downloads or retention yet.

The core experiment is:

> Give the game to someone with little or no Italian. After 45-60 minutes, can they correctly react to familiar creature-language commands without consciously translating them?

Secondary questions:

- Did they like Milo?
- Did they want to understand him?
- Did combat feel like a game rather than a quiz?
- Did they voluntarily replay creature speech?
- Did they notice themselves understanding words automatically?
- Did they want to continue the story?
- Did they feel clever when they understood enemy dialogue?

If those answers are yes, scale content.

---

# 60. BUILD ORDER - ABSOLUTE RULE

**Do not start by building the whole game.**

Build the smallest loop proving the mechanic, then expand outward.

The build order below is intentional.

---

# PHASE 0 - PROJECT FOUNDATION

## Goal

Bootable offline app with clean architecture.

## Build

1. Create Expo React Native TypeScript project.
2. Configure navigation.
3. Add state store.
4. Add local persistence.
5. Create asset loading conventions.
6. Create JSON/schema validation approach.
7. Add developer/debug screen.
8. Establish formatting/lint/typecheck/tests.

## Done when

The app boots, navigates between placeholder Home, Explore, Battle, Journal, and Settings screens, and saves a test value locally.

---

# PHASE 1 - MILO ON SCREEN

## Goal

Make Milo feel like a character before building the RPG.

## Build

1. Home screen.
2. Milo sprite.
3. Idle animation.
4. Tap reaction.
5. Dialogue bubble.
6. Audio playback.
7. 4-6 emotional states.
8. Basic scripted interaction sequence.

Example sequence:

Milo waves:

**"Ciao!"**

Player taps Milo.

Milo responds differently.

## Done when

A tester can open the app and immediately feel that Milo is a character, not a static menu mascot.

---

# PHASE 2 - LANGUAGE CONCEPT ENGINE

## Goal

Teach **acqua** without showing "water."

## Build

1. Concept data model.
2. Exposure tracking.
3. Confidence score.
4. Scaffold levels.
5. Visual hint component.
6. Audio replay.
7. Developer override/debug controls.

Create 10 test concepts.

## Done when

The app can present the same concept differently depending on estimated familiarity.

---

# PHASE 3 - FIRST IMMERSION SCENE

## Goal

Prove experiential learning.

Build one polished scene:

Milo reaches water -> drinks/splashes -> says **"Acqua!"** -> player interacts -> later Milo requests acqua in another context.

No battle yet.

## Done when

A zero-Italian tester can infer **acqua** without an English translation.

If this fails, fix this before doing anything else.

---

# PHASE 4 - BATTLE PROTOTYPE

## Goal

Prove the central combat idea.

Build exactly:

- Milo;
- one Fire enemy;
- four elemental command choices;
- water weakness;
- one enemy attack;
- HP;
- victory / defeat;
- simple animations;
- sound.

The tester should learn **acqua** before battle and then need it in battle.

## Done when

A tester selects **ACQUA** because they want water, not because the UI told them the correct answer.

This is the project's single most important milestone.

---

# PHASE 5 - REUSABLE BATTLE ENGINE

## Goal

Turn the prototype into a system.

Build:

1. battle state machine;
2. enemy data definitions;
3. abilities;
4. elemental chart;
5. damage calculation;
6. targeting;
7. enemy intent;
8. enemy speech;
9. Milo speech;
10. rewards;
11. battle result screen.

## Done when

A new enemy can be created primarily by adding data, not writing new battle code.

---

# PHASE 6 - ENCOUNTER ENGINE

## Goal

Make exploration content data-driven.

Build:

1. encounter schema;
2. dialogue steps;
3. animation instructions;
4. choices;
5. branching outcomes;
6. rewards;
7. battle triggers;
8. story flags;
9. language concept tags;
10. cooldown / repeat rules.

## Done when

A developer can add a new encounter JSON file and see it work without changing the renderer.

---

# PHASE 7 - MAP / EXPLORATION

## Goal

Create the illusion of an RPG world cheaply.

Build:

1. map screen;
2. Forest location;
3. location background;
4. Explore button;
5. encounter selection;
6. return/continue flow.

Do not add walking controls.

## Done when

The player can repeatedly explore the Forest and receive varied encounters.

---

# PHASE 8 - DISGUISED REPETITION

## Goal

Turn encounter selection into a learning scheduler.

Build simple weighting:

- concepts with low confidence receive a boost;
- recently seen encounters receive a penalty;
- current story encounters receive a boost;
- newly introduced concepts are limited to prevent overload.

## Done when

A concept can naturally recur across different encounters without obvious repetition.

---

# PHASE 9 - COMMAND COMPOSITION

## Goal

Move beyond one-word elemental choices.

Add commands such as:

- ATTACCA
- DIFENDI
- ACQUA
- FUOCO
- GRANDE
- PICCOLO

Allow two-piece commands first:

**ATTACCA + ACQUA**

Then:

**DIFENDI + ME** or equivalent natural Italian construction after language review.

Important: use natural Italian rather than mechanically translating English tile order.

## Done when

More language gives the player meaningfully more tactical precision.

---

# PHASE 10 - ENEMY LANGUAGE TELEGRAPHS

## Goal

Make listening comprehension tactically valuable.

Add enemies that announce:

- target;
- element;
- next action.

Initially pair speech with strong animation.

Gradually reduce scaffolding.

## Done when

A tester understands an enemy's plan from its Italian and changes strategy accordingly.

---

# PHASE 11 - STORY ENGINE

## Goal

Add narrative without hardcoding everything.

Build:

- story flags;
- sequential events;
- required encounters;
- unlock conditions;
- human dialogue scenes;
- creature dialogue scenes;
- location unlocks;
- boss trigger.

Then write the first small arc.

---

# PHASE 12 - JOURNAL / BESTIARY

## Goal

Give progress permanence.

Build:

- discovered creatures;
- locations;
- story notes;
- memorable creature quotes;
- Milo relationship page;
- audio replay for discovered phrases where appropriate.

Keep it adventurous, not academic.

---

# PHASE 13 - BOND AND RPG PROGRESSION

## Goal

Make continued play rewarding even aside from language.

Add:

- Milo XP;
- levels;
- bond milestones;
- elemental unlocks;
- abilities;
- cosmetic rewards;
- small inventory.

Keep the system lean.

---

# PHASE 14 - CONTENT TOOLS

## Goal

Make adding 500 encounters possible without destroying development speed.

Build internal scripts for:

- encounter generation templates;
- schema validation;
- concept validation;
- duplicate phrase detection;
- missing asset detection;
- difficulty checks;
- content reports;
- audio manifest generation.

Create an internal content spreadsheet/JSON pipeline only when needed. Do not prematurely build a giant CMS.

---

# PHASE 15 - MVP CONTENT PASS

Produce:

- 30-50 encounters;
- 50-100 concepts;
- 4-6 friendly/neutral creatures;
- 2 hostile species;
- mini-boss;
- Forest;
- Home;
- Guild/Village;
- short mystery;
- polished beginning;
- satisfying MVP ending / cliffhanger.

---

# PHASE 16 - POLISH

Only after the loop works:

- haptics;
- transitions;
- particles;
- attack juice;
- screen shake;
- sound design;
- music;
- better Milo reactions;
- onboarding cleanup;
- accessibility;
- save migration testing;
- offline testing;
- device performance testing.

Polish should make communication feel magical.

---

# 61. FIRST 15 MINUTES - TARGET EXPERIENCE

The opening should prove the concept quickly.

### Minute 0-2
Human-world introduction. Player meets Milo. Milo says **"Ciao."** Visual context makes greeting obvious.

### Minute 2-5
Milo follows player into first illustrated exploration scene. Player learns **guarda** and/or **vieni** through gestures.

### Minute 5-8
Stream scene introduces **acqua** through physical context.

### Minute 8-10
A minor encounter repeats **acqua** differently. Milo is thirsty or interacts with water.

### Minute 10-15
First Fire creature battle.

Milo waits.

Four elemental commands appear.

The player recognizes **ACQUA**.

They choose it.

Milo unleashes water.

Enemy is weak to it.

Big satisfying animation.

The player should think:

> **OH. I actually knew what to tell him.**

That feeling sells the entire game.

---

# 62. THE FIRST HOUR

By the end of hour one, the player should:

- care about Milo;
- understand 20-40 concepts to varying degrees;
- have fought several creatures;
- have used at least four elemental words;
- have understood an enemy warning;
- have given Milo a two-part command;
- have met another Translator;
- have discovered that Milo is unusual;
- have encountered the first clue that hostile creatures are organized;
- want to know what creatures are really saying.

Do not chase a giant vocabulary count. Durable comprehension matters more.

---

# 63. DESIGN TEST FOR EVERY FEATURE

Before adding anything, ask:

### Does this make the game more fun even if the player temporarily forgets it is educational?

If no, reconsider it.

### Does language affect what the player can understand, decide, or communicate?

If yes, good.

### Is the player being asked about Italian, or are they using Italian to accomplish something?

Prefer the latter.

### Can this be built with the existing engines/data model?

If not, it must justify its engineering cost.

---

# 64. DESIGN TEST FOR EVERY LANGUAGE MOMENT

Bad:

> What does "acqua" mean?

Better:

> Milo is thirsty. What do you give him?

Best:

> Milo says "Acqua..." while looking between you and a stream. The player chooses what to do.

Bad:

> Translate "attack with water."

Better:

> Pick the correct Italian phrase.

Best:

> A Fire creature is charging Milo. The player constructs **ATTACCA + CON + ACQUA** because that is the action they actually want Milo to perform.

---

# 65. CONTENT DESIGN PRINCIPLE: REUSE WORDS ACROSS SYSTEMS

A high-value word should appear in multiple domains.

Example: **acqua**

- Milo drinks water.
- Water appears in battle.
- A creature asks for water.
- An NPC mentions creatures near the water.
- An enemy fears water.
- Rain occurs.
- Milo asks whether the player wants to cross the water.

This is much stronger than repeating the same vocabulary prompt five times.

---

# 66. CONTENT DESIGN PRINCIPLE: TEACH CONTRASTS

Pairs naturally teach one another:

- grande / piccolo
- caldo / freddo
- veloce / lento
- sopra / sotto
- sinistra / destra
- vicino / lontano
- entra / esci
- sì / no

Show contrasting outcomes visually.

This reduces dependence on English.

---

# 67. CONTENT DESIGN PRINCIPLE: EMOTION IS MEMORY

Important words should be attached to memorable moments.

The player will remember a word better if:

- Milo was hilarious;
- Milo was scared;
- the player saved him;
- a boss screamed it;
- a creature tricked them;
- they misunderstood it and something funny happened;
- it solved a difficult encounter.

Language content should therefore be designed alongside emotional/gameplay beats, not as a detached word list.

---

# 68. MONETIZATION - DO NOT DESIGN YET, BUT PROTECT THE GAME

The initial build should not depend on monetization architecture.

Potential future models:

- premium game;
- free first region + one-time full unlock;
- subscription for multiple language campaigns;
- base game purchase + language packs.

Avoid designing energy systems, lives, or learning punishment around monetization.

The core game must first be genuinely good.

---

# 69. MULTIPLE LANGUAGES - FUTURE ARCHITECTURE

Although Italian is the initial creature language, content should not hardcode Italian assumptions everywhere.

Separate:

- semantic concept IDs;
- displayed target-language strings;
- audio;
- grammar templates;
- language-specific content.

Example semantic concept:

```json
{
  "conceptId": "water",
  "target": "acqua",
  "audio": "it/acqua.mp3"
}
```

However, do **not** assume every future language can simply replace words one-for-one.

Story/encounter content may need language-specific versions because grammar and learning order differ.

Architect for localization. Do not prematurely build a universal grammar engine.

---

# 70. DEVELOPMENT PHILOSOPHY FOR CLAUDE CODE / CODEX

AI coding agents should receive small, testable responsibilities.

Do not prompt:

> Build the entire game described in this document.

Instead work phase-by-phase.

Every phase should include:

1. exact goal;
2. files/systems allowed to change;
3. acceptance criteria;
4. tests;
5. explicit instruction not to build future phases;
6. request to document architectural decisions.

Example:

> Implement Phase 2 only: the language concept engine. Do not build battles, maps, quests, or additional gameplay. Add concept confidence, exposure tracking, scaffold levels, persistence, and a developer debug panel. Include tests for confidence updates and scaffold selection. Preserve existing Milo/home behavior.

This prevents AI agents from producing giant fragile systems prematurely.

---

# 71. DEVELOPMENT RULES

1. **Build vertically before horizontally.** One polished acqua -> Fire battle loop is worth more than 40 unfinished systems.
2. **Data-drive content.** New encounters should rarely require engine changes.
3. **Keep gameplay deterministic.** No runtime LLM dependency.
4. **Test offline constantly.** Airplane mode should not break the game.
5. **Keep saves versioned.** Content updates cannot destroy player progress.
6. **Instrument debug builds.** Developers need to see concept confidence, flags, encounter weights, and battle state.
7. **Never let educational architecture dominate UI architecture.** The player sees an RPG.
8. **Do not prematurely optimize.** Prove fun first.
9. **Do not add systems because other RPGs have them.** Every system pays rent.
10. **Protect Milo.** He is the product's emotional hook.

---

# 72. DEBUG TOOLS WE WILL NEED

Developer-only panel should eventually support:

- reset save;
- unlock locations;
- set Milo level;
- set bond;
- unlock elements;
- view concept confidence;
- set concept confidence;
- force scaffold level;
- force encounter;
- force battle;
- inspect story flags;
- toggle all language hints;
- replay audio;
- simulate returning player decay;
- export save state/log.

These tools will save enormous development time.

---

# 73. TESTING STRATEGY

## Automated

Test:

- elemental damage;
- save/load;
- encounter eligibility;
- story flags;
- concept confidence changes;
- scaffold selection;
- scheduler weighting;
- invalid content references;
- missing audio/assets;
- save migration.

## Human playtesting

The most important testing cannot be automated.

Recruit people who do **not** know Italian.

Do not tell them what words mean.

Observe:

- what they infer;
- what confuses them;
- whether they use hints;
- whether they remember words later;
- whether they choose commands based on meaning;
- whether they enjoy battles independently of learning;
- whether they care about Milo.

---

# 74. THE BIGGEST FAILURE MODES

## Failure 1: It becomes a quiz app

Fix: ask players to make game decisions, not identify translations.

## Failure 2: Too much Italian too quickly

Fix: constrain new concepts and maximize comprehensible context.

## Failure 3: Player memorizes UI positions

Fix: shuffle choices and remove redundant scaffolding after mastery.

## Failure 4: Language mistakes feel punishing

Fix: use recoverable consequences, humor, hints, and retries.

## Failure 5: Milo feels like a tutor

Fix: give him wants, personality, reactions, story agency, and non-learning interactions.

## Failure 6: RPG is too shallow

Fix: ensure real battles, progression, bosses, discovery, story mystery, loot, and creature collection exist independently.

## Failure 7: RPG becomes too expensive to build

Fix: illustrated locations, data-driven encounters, turn-based combat, limited playable party, reusable effects.

## Failure 8: Content is grammatically unnatural

Fix: language QA pipeline and native/fluent review before launch.

## Failure 9: It teaches reading but not listening

Fix: creature speech audio is a first-class content asset.

## Failure 10: The team builds 1,000 encounters before proving the mechanic

Fix: prove the first 15 minutes with real users first.

---

# 75. THE VERTICAL SLICE

Before building the MVP, create one extremely polished vertical slice containing:

1. Milo home interaction.
2. Forest selection.
3. Stream encounter.
4. **Acqua** contextual introduction.
5. Second contextual acqua exposure.
6. Fire creature appears.
7. Turn-based battle.
8. Player selects **ACQUA** from four commands.
9. Milo performs a spectacular water counter.
10. Enemy announces a simple intention in creature language.
11. Milo reacts.
12. Victory.
13. Bond/progression reward.
14. Return home.
15. Milo references the adventure using language the player now partially understands.

This 10-15 minute slice should be treated like the entire company's product until it is fun.

---

# 76. THE MOMENT WE ARE BUILDING TOWARD

The most important moment is not the first boss.

It is not a level-up.

It is not unlocking Fire.

It is this:

Milo says something in Italian.

The player reacts correctly.

Then, half a second later, they realize:

> **Wait. I understood him.**

No translation appeared.

No quiz occurred.

Nobody congratulated them for learning vocabulary.

They simply understood their friend.

That feeling is the product.

Everything else exists to make the player want to experience it again with increasingly sophisticated language.

---

# 77. NORTH STAR

**Build a genuinely enjoyable creature RPG where learning a real language feels like gaining a supernatural ability.**

The player begins hearing noises from a creature they barely understand.

They end fighting beside a best friend, anticipating enemies, understanding creature society, uncovering a mystery humans cannot solve, and communicating naturally in a language they once thought was gibberish.

They believe they became a Translator.

In reality, they learned Italian.

