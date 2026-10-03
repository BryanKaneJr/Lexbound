# LEXBOUND — LANGUAGE DESIGN BIBLE
## The non-negotiable design contract for immersion, inference, mystery, and real language acquisition

> **This document overrides any interpretation of Lexbound that turns the language system into quizzes, vocabulary drills, flashcards, translation exercises, or "correct Italian = damage."**

Lexbound is a creature RPG about accomplishing something the world believes is nearly impossible:

**You are slowly learning to truly understand another intelligent species.**

The Lexlings' language happens to be real Italian. Inside the fiction, it is never called Italian. To the player, learning Italian must feel like discovering a hidden layer of the world.

---

# 1. NORTH STAR

Lexbound should repeatedly create one feeling:

> **"Wait... I understood that."**

That moment matters more than XP, a vocabulary unlock, a lesson-complete animation, or even many combat rewards.

The player should surprise themselves by understanding something that would have sounded meaningless earlier.

The game engineers those realizations without announcing them in advance.

The player is not studying a language so they can play Lexbound.

**Playing Lexbound causes them to acquire the language.**

---

# 2. CORE FANTASY

Humans speak English.

Lexlings speak a language humans do not understand.

Humans have lived beside Lexlings for generations. Most believe Lexlings communicate through relatively simple sounds, gestures, emotions, and instinct.

Some humans, called **Translators**, form unusually close relationships with individual Lexlings. They can interpret basic intentions such as hunger, fear, danger, come, go, fire, water, friend, and enemy.

Even experienced Translators generally believe this is close to the limit.

They are wrong.

Lexlings possess a complete language.

They converse. Joke. Lie. Gossip. Argue. Remember. Plan. Have relationships humans know nothing about. They discuss humans directly in front of humans because humans cannot understand them.

The player begins the game believing roughly what the human world believes.

Then they meet **Milo**.

Milo is unusual in two ways:

1. He can channel every elemental affinity.
2. The protagonist begins understanding him at an impossible rate.

These mysteries eventually connect to the larger plot.

---

# 3. THE SECRET

The Lexling language is **real Italian**.

The game never reveals this in-universe. There is no Italy in the fiction. Characters never call it Italian. To them it is simply the language of Lexlings.

Marketing can openly state that Lexbound teaches real Italian.

The design trick is making the player's experience of learning Italian feel like gaining access to forbidden knowledge.

---

# 4. THE SECOND REALITY PRINCIPLE

This is the most important design concept in Lexbound.

> **Understanding Lexlings changes what information exists for the player.**

Language must never be useful only for issuing combat commands.

A human sees a wild Lexling making noises.

The player eventually hears:

> "The hunters came through here yesterday."

A human sees hostile creatures growling.

The player eventually understands:

> "Attack Milo first. The human is harmless."

A Translator says:

> "I think she's hungry."

The player hears the Lexling say:

> "I hate those berries."

The world has not changed.

**The player's access to the world has changed.**

Comprehension can reveal:

- enemy intentions
- warnings
- secrets
- jokes
- personality
- relationships
- creature politics
- lies
- hidden routes
- treasure information
- alternate quest solutions
- emotional scenes
- lore
- foreshadowing
- evidence
- the actual main plot

Italian is not merely Milo's control scheme.

**Italian is Lexbound's second reality.**

---

# 5. INFERENCE BEFORE EXPLANATION

Avoid direct translation whenever reasonably possible.

Bad:

> ACQUA = WATER

Bad:

> What does ACQUA mean?
> A. Fire
> B. Water
> C. Wind

Bad:

> NEW WORD: ACQUA — WATER

Better:

Milo reaches a stream. He splashes. Drinks. Looks delighted.

> **"Acqua!"**

Later Milo is overheated and points at the player's flask.

> **"Acqua..."**

Later a fire creature attacks. Milo waits for a command:

> FUOCO
> ACQUA
> TERRA
> VENTO

The player chooses **ACQUA** because they independently inferred its meaning.

That is acquisition through experience.

---

# 6. THE ACQUISITION LOOP

Important concepts generally move through:

## EXPERIENCE
Encounter the language in inferable context.

## HYPOTHESIS
The player's brain forms a guess. The game does not necessarily confirm it.

## RE-ENCOUNTER
The concept appears in a different situation. The hypothesis strengthens, weakens, or changes.

## APPLICATION
The player acts using their understanding.

## CONSEQUENCE
The world responds naturally.

## TRANSFER
The concept appears with another speaker, modality, or situation.

## INTERNALIZATION
The player reacts without consciously translating.

Ideal:

> acqua -> 💧

Not:

> acqua -> "water" -> 💧

---

# 7. AMBIGUITY IS A FEATURE

The player should not always immediately know what a new word means.

Example:

Milo says:

> **"Aspetta!"**

while pointing somewhere.

The player may infer "look."

Later Milo says:

> **"Aspetta!"**

and physically stops the protagonist before a trap.

Later:

> **"Aspetta qui."**

Milo walks away while the protagonist stays.

Now the player realizes:

> Oh. Wait.

That realization is more powerful than a definition.

Use **safe ambiguity**. Provide enough visual, behavioral, environmental, and repeated evidence that the mystery eventually resolves.

---

# 8. IMMERSION IS NOT OBSCURITY

The game should remain understandable even when the language is not.

Players should usually understand:

- what objects are present
- what actions are possible
- what is physically happening
- their immediate game goal
- Milo's broad emotional state

They may not understand exactly what Milo said.

That is intentional.

The situation carries the player while language adds information.

---

# 9. THE WORLD IS THE TRANSLATION LAYER

Meaning should primarily come from:

- animation
- facial expression
- object interaction
- environment
- repeated situations
- consequences
- pointing
- movement
- sound
- elemental effects
- character reactions
- contrast
- timing
- previous knowledge

English translation is an emergency tool, not the primary teacher.

If a concept can be demonstrated, demonstrate it.

---

# 10. MILO IS NOT A TUTOR

Never write Milo like Duolingo wearing a creature costume.

Milo does not know he is teaching.

Milo wants things. Gets annoyed. Jokes. Gets scared. Makes mistakes. Has opinions. Complains. Warns the player. Tells stories. Argues. Misunderstands humans.

His language exists because **he is a character with something to communicate**.

If a line exists only because the curriculum needs exposure to a word, rewrite the scene until Milo has a believable reason to say it.

---

# 11. RELATIONSHIP AS IMMERSION ENGINE

The player wants to understand Milo because they care about him.

Early communication is highly contextual:

> **"Ciao!"** while waving.

> **"Fame..."** while staring at food and rubbing his stomach.

> **"Vieni!"** while running ahead and beckoning.

> **"Guarda!"** while pointing excitedly.

Over time, obvious scaffolding decreases because the player no longer needs it.

Milo is not becoming more intelligent.

**The player is becoming more capable of understanding the intelligence that was always there.**

---

# 12. DO NOT MAKE MILO SPEAK LIKE A TEXTBOOK

Milo has always possessed language.

Early situations may naturally favor short expressions, but he should not exist as a sequence of pedagogically convenient one-word prompts.

Eventually the player should realize that Milo was never communicating primitively.

This realization is narratively important.

---

# 13. HIDDEN COMPREHENSION MODEL

Do not reduce language state to:

```ts
learnedWords: string[]
```

Use a richer hidden state:

```ts
type ComprehensionState =
  | "unseen"
  | "exposed"
  | "suspected"
  | "demonstrated"
  | "understood"
  | "internalized";
```

### UNSEEN
Never meaningfully encountered.

### EXPOSED
Encountered, but evidence was weak.

### SUSPECTED
Enough evidence exists for a reasonable hypothesis.

### DEMONSTRATED
Player successfully acted on the concept at least once.

### UNDERSTOOD
Successful demonstrations across different contexts suggest genuine comprehension.

### INTERNALIZED
Understanding survives time gaps and contextual variation.

Scores may exist beneath these states. The philosophy must remain.

---

# 14. NEVER DISPLAY THE HIDDEN MODEL DIRECTLY

Do not show:

> ACQUA — 82% mastery

or:

> SOTTO — SUSPECTED

or:

> Vocabulary: 143/1000

The player-facing fantasy is:

> **My bond with Milo is deepening.**
>
> **I'm beginning to understand them.**

Internal instrumentation can track everything.

---

# 15. EVIDENCE, NOT MERE REPETITION

Seeing `acqua` five times is weak.

Seeing it in five meaningful situations is strong:

1. Milo splashes in a stream.
2. Milo asks for a drink.
3. Rain fills a container.
4. A fire enemy fears water.
5. Another Lexling asks for water.
6. Milo uses a water shield.
7. An enemy warns another about Milo's water attack.

The scheduler should seek **contextual diversity**, not exposure count alone.

---

# 16. SPACED REPETITION MUST BE INVISIBLE

Lexbound can use spaced repetition internally.

The player should almost never perceive a review session.

If `sotto` needs reinforcement, do not say:

> Review SOTTO.

Instead:

Milo loses something.

> **"È sotto il letto."**

Later a creature hides beneath a bridge.

Later an enemy uses `sotto`.

Later a clue describes something beneath a statue.

The system is reviewing `sotto`.

The player thinks:

> things are happening in my adventure.

---

# 17. CONCEPT MEMORY DATA

Recommended direction:

```ts
interface ConceptMemory {
  conceptId: string;
  state: ComprehensionState;
  exposureCount: number;
  successfulApplications: number;
  failedApplications: number;
  lastSeenAt: number;
  lastSuccessfulAt?: number;
  contextsSeen: string[];
  speakersSeen: string[];
  modalitiesSeen: string[];
  confidenceScore: number;
}
```

Possible modalities:

- Milo speech
- wild Lexling speech
- enemy speech
- combat command
- environmental writing
- story scene
- object interaction
- visual demonstration

Prefer resurfacing through a different modality or speaker.

---

# 18. CROSS-CREATURE TRANSFER IS MANDATORY

One of Lexbound's strongest moments:

> **I learned this from Milo, and now I understand someone else.**

Milo repeatedly uses:

> **"Fame."**

Later a wild Lexling says:

> **"Ho fame."**

The player recognizes part of it.

This proves Milo's sounds are not private signals. They are a language.

This should happen early enough to hook the player.

---

# 19. HUMANS SHOULD SOMETIMES BE WRONG

A Translator observes their Lexling:

> "She's nervous. She probably wants to leave."

The Lexling actually says:

> **"Ho fame."**

If the player understands `fame`, they know the Translator is wrong.

Do not immediately congratulate them.

Let them experience the realization.

This creates the power fantasy:

> **I understand them better than someone who has spent years doing this.**

---

# 20. HUMANS ARE NOT IDIOTS

Experienced Translators should be genuinely skilled at behavior, emotion, repeated sounds, and their own partners.

They simply misunderstand the **depth, structure, and universality** of Lexling language.

Their mistakes must be plausible.

---

# 21. THE LANGUAGE MYSTERY ESCALATES

## STAGE 1 — SOUNDS HAVE MEANING
The player recognizes concrete concepts.

## STAGE 2 — MEANING TRANSFERS
Other Lexlings use the same language.

## STAGE 3 — THERE IS STRUCTURE
Recurring combinations reveal grammar.

## STAGE 4 — COMPLEX THOUGHT
Lexlings express ideas humans believe are meaningless chatter.

## STAGE 5 — THEY TALK TO EACH OTHER
The player overhears conversations never intended for humans.

## STAGE 6 — THEY KNOW THINGS
Creature conversations reveal information humans do not possess.

## STAGE 7 — THEY HAVE A SOCIAL WORLD
Factions, relationships, grudges, traditions, fears, plans.

## STAGE 8 — THE CONFLICT IS NOT WHAT HUMANS THINK
Comprehension changes the interpretation of the main plot.

## STAGE 9 — MILO'S TRUE SIGNIFICANCE
His language connection and elemental abilities connect to the central mystery.

Do not rush these stages.

---

# 22. DO NOT ANNOUNCE THE MYSTERY

Avoid:

> "Could Lexlings secretly have a complete language?!"

Characters should rationalize strange events according to their worldview.

If the player responds correctly to something complex, a human might say:

> "You two really do understand each other."

Let the player reach the larger conclusion first.

---

# 23. LANGUAGE AS COMBAT POWER

Combat is an RPG system first.

> **The player makes the tactical decision. Language is how they communicate it to Milo.**

Never:

> Translate ACQUA correctly to deal damage.

Instead:

A fire creature appears. The player recognizes the matchup. Milo waits.

> FUOCO
> ACQUA
> TERRA
> VENTO

The player chooses **ACQUA** because they want Milo to use water.

Italian knowledge enables tactical control.

---

# 24. MILO'S ELEMENTAL UNIQUENESS

Most Lexlings have one affinity or a narrow combination.

Milo can channel every element.

Therefore precise communication with him is extraordinarily powerful.

His potential grows alongside the player's ability to understand and command him.

---

# 25. ELEMENTS

Useful concrete entry concepts include:

- acqua — water
- fuoco — fire
- terra — earth
- vento — wind
- ghiaccio — ice
- luce — light
- ombra — shadow
- fulmine — lightning

Final element balance is a gameplay decision, not a language curriculum decision.

---

# 26. COMMAND COMPLEXITY GROWS NATURALLY

Early:

> **Acqua!**

Later:

> **Usa l'acqua!**

Then:

> **Attacca con l'acqua!**

Then:

> **Attacca quello grande con l'acqua!**

Eventually:

> **Prima proteggimi, poi attacca quello grande con l'acqua!**

Increasing expressive ability feels like unlocking better tactical control.

Grammar becomes useful because precision becomes useful.

---

# 27. RECOGNITION BEFORE FREE PRODUCTION

Do not require typed Italian early.

Progression can be:

1. choose one command word
2. modifier + command
3. action + element
4. action + target + element
5. sequence two actions
6. flexible command construction

Production grows from comprehension.

---

# 28. ICONS ARE TEMPORARY SCAFFOLDING

Early:

> 💧 ACQUA

Later:

> ACQUA

The icon disappears quietly after demonstrated comprehension.

The game simply trusts the player more.

---

# 29. SHUFFLE COMMAND POSITION

Never let top-left = water become the learned behavior.

The player must recognize language, not UI position.

---

# 30. ENEMY SPEECH IS BATTLEFIELD INTELLIGENCE

Hostile Lexlings speak the same language.

Early:

> **"Fuoco!"**

Later:

> **"Attacca Milo!"**

Later:

> **"Prima il ragazzo. Poi Milo."**

Advanced:

> **"Fingi di attaccare Milo. Io prendo la chiave."**

Understanding eventually feels like intercepting enemy radio.

This is one of Lexbound's strongest RPG rewards.

---

# 31. DO NOT TRANSLATE ENEMY INTENT WITH UI

Bad:

> "Attacca Milo!"
>
> ENEMY INTENT: ATTACK MILO

That destroys the advantage.

A beginner should still receive visual telegraphing sufficient to play.

Language gives additional precision, warning, and strategic information.

---

# 32. FAILURE PRODUCES INFORMATION

Incorrect interpretation should often teach through consequence.

Milo:

> **"Non fuoco!"**

Player uses fire.

Milo panics. Enemy absorbs it.

That gives `non` powerful evidence.

Failure can create:

- humor
- character reaction
- alternate outcomes
- tactical disadvantage
- stronger memory
- new evidence

Avoid:

> WRONG! NON = NOT.

---

# 33. NEVER GRADE LANGUAGE LIKE SCHOOL

Avoid normal gameplay UI such as:

- 8/10 correct
- vocabulary accuracy
- grammar score
- red X
- incorrect translation
- lesson failed
- visible study streak pressure

Internally measure what is useful. Externally maintain the fantasy.

---

# 34. PLAYER ACTION IS ASSESSMENT

To infer whether the player understands `acqua`, observe whether they:

- choose water against fire
- give Milo water when requested
- select a water route
- respond appropriately when another Lexling asks
- use it in a composed command

Do not ask what `acqua` means unless a rare diegetic situation truly justifies it.

---

# 35. UNDERSTANDING CREATES ADVANTAGES

Comprehension should reward:

- easier fights
- better choices
- hidden loot
- alternate routes
- better relationships
- rescued creatures
- secrets
- foreshadowing
- humor
- efficient solutions
- additional story context

The player should usually be able to progress without understanding every line.

---

# 36. OCCASIONAL REQUIRED COMPREHENSION

Major moments may require demonstrated understanding, but they must be contextual, built from prior exposure, retryable, and narratively justified.

Example:

Milo is trapped and sees something the player cannot.

> **"La leva! A sinistra!"**

The player chooses a side.

That is a game event, not a quiz.

---

# 37. WRITTEN LEXLING LANGUAGE

Later, Lexling-created spaces can contain written Italian.

This can reveal:

- warnings
- directions
- names
- territory
- maps
- lore
- graffiti
- clues

The revelation that Lexlings **write** should itself matter.

---

# 38. AUDIO MATTERS

Long term, Lexling speech should be heard, not merely read.

We want:

> sound -> meaning

not only:

> spelling -> meaning

For MVP, Italian TTS is acceptable.

Before production, important language content needs deliberate voice treatment and native review.

Useful controls:

- replay
- optional slower replay
- subtitles
- accessibility settings

Natural rhythm should remain the default.

---

# 39. TEXT DISPLAY

Avoid English directly beneath Italian.

Bad:

> Ho fame.
> I'm hungry.

Better:

> **"Ho fame."**
>
> Milo rubs his stomach and stares at bread.

Optional assists can exist without dominating default play.

---

# 40. HELP LADDER

If the player is stuck:

1. replay
2. repeat/exaggerate gesture
3. highlight relevant context
4. partial visual clue
5. optional translation as last resort

Never shame use of help.

Accessibility assistance must not reduce rewards.

---

# 41. JOURNAL

The journal should feel like an explorer documenting a species.

Good:

> "Milo says 'acqua' around water."

> "I've heard several Lexlings use 'fame' before eating."

> "Emberhogs shout 'fuoco' before certain attacks."

> "Pip thinks Nemi's chirp means fear. I'm not sure."

Avoid making the default journal a plain Italian-English flashcard table.

---

# 42. KNOWN LANGUAGE TEACHES UNKNOWN LANGUAGE

Once surrounding concepts are known, sentences provide inference.

Known:

- Milo
- acqua
- vuole

Then:

> **"Milo non vuole acqua."**

Contrast helps infer `non`.

Later:

> **"Non attaccare."**

Now it transfers.

Eventually the language increasingly teaches itself.

---

# 43. GRAMMAR EMERGES FROM CONTRAST

Do not begin with grammar lectures.

Use patterns:

> Acqua.

> Voglio acqua.

> Non voglio acqua.

> Vuoi acqua?

Experience comes first.

Optional explanation can consolidate discovery later.

---

# 44. ENGLISH SUPPORTS THE RPG, NOT THE TRANSLATION

Humans speak English.

English can explain:

- objectives
- places
- world history
- combat basics
- inventory
- politics
- human relationships

English explains **the human world**.

Italian reveals **the Lexling world**.

---

# 45. TWO INTERLEAVED STORIES

Lexbound effectively contains:

## THE HUMAN STORY
What humans believe is happening.

## THE LEXLING STORY
What Lexlings are actually saying and experiencing.

Early game mostly exposes the human story.

Mid game reveals contradictions.

Late game allows the player to compare both realities.

Language acquisition therefore becomes narrative progression.

---

# 46. REVISITING OLD LOCATIONS

Return visits can reveal new meaning.

Early:

A Lexling outside a cave says a line the player barely understands.

Hours later:

> **"Don't go inside. The hunters put traps near the river."**

The location did not level up.

**The player did.**

---

# 47. OLD DIALOGUE BECOMES NEW CONTENT

Store important previously encountered lines.

Camp, memories, or journal entries can replay them.

A sentence that was incomprehensible hours earlier can suddenly make sense.

This creates progression without new assets.

---

# 48. DO NOT CELEBRATE EVERY SUCCESS

Sometimes the strongest reward is silence.

Enemy:

> **"Dietro di lui."**

The player reacts correctly.

Battle resolves favorably.

Nothing says:

> GREAT JOB! YOU UNDERSTOOD "BEHIND HIM"!

Trust the player.

Celebrate only major relationship/story breakthroughs.

---

# 49. BOND IS NOT VOCABULARY COUNT

Bond may correlate with communication but also includes:

- caring for Milo
- shared victories
- trust
- exploration
- story choices
- optional interactions

Never make 100 learned words mechanically equal Bond Level 5.

---

# 50. LANGUAGE CHANGES MILO'S RELATIONSHIP WITH THE PLAYER

As communication improves:

- Milo trusts more complex commands
- asks nuanced questions
- tells longer stories
- jokes
- warns more precisely
- shares memories
- argues
- reveals opinions

Language growth should feel like relationship growth.

---

# 51. MILO KNOWS THINGS THE PLAYER WANTS TO KNOW

Questions around Milo:

- Why can he use every element?
- Where did he come from?
- Why does he recognize certain ruins?
- Why does he react to particular Lexlings?
- What is he afraid of?
- What happened before he met the player?

Milo may try to explain before the player can understand.

This is excellent motivation:

> **Milo already knows the answer. I just can't understand it yet.**

---

# 52. EARLY FORESHADOWING THROUGH UNUNDERSTOOD SPEECH

Plant meaningful information in early Milo dialogue.

Later comprehension or replay gives it new meaning.

Use carefully so mandatory plot information is never permanently missed.

---

# 53. OTHER LEXLINGS NEED PERSONALITIES

Lexlings should not be interchangeable vocabulary dispensers.

Possible differences:

- rapid speaker
- terse speaker
- shy
- sarcastic
- repetitive
- talkative
- formal
- childlike
- habitual liar
- favorite expressions

Keep language fair for learners and professionally reviewed.

---

# 54. HOSTILE LEXLINGS NEED MOTIVES

Some can be:

- territorial
- manipulated
- protective
- frightened
- ideological
- corrupted
- desperate
- genuinely malicious

Understanding them can reveal motive or occasionally enable a noncombat solution.

Do not make every enemy secretly innocent. That becomes predictable.

---

# 55. COMBAT MUST STILL BE FUN

The elemental RPG must function even without the language novelty.

Useful systems:

- readable matchups
- health
- stamina/resource
- status effects
- defend
- enemy intent
- Milo abilities
- boss patterns
- simple upgrades

Do not overbuild.

---

# 56. MOBILE COMBAT TARGET

Initial target:

- Milo vs. 1–3 enemies
- turn-based
- portrait-friendly
- large tap targets
- short encounters
- expressive 2D attacks
- minimal menus
- no grid
- no physics
- no real-time movement
- no 3D requirement

---

# 57. COMBAT INFORMATION HIERARCHY

No Italian comprehension:
- appearance
- elemental clues
- visual wind-up
- HP
- basic danger

Some comprehension:
- attack type
- target
- timing
- coordination
- spoken weaknesses

Advanced:
- multi-turn plans
- feints
- retreat conditions
- strategic arguments
- boss mechanics
- emotional state

Language produces graduated advantage.

---

# 58. EXAMPLE COMBAT PROGRESSION

### Beginner

Emberhog visibly burns and shouts:

> **"Fuoco!"**

Options include icon-supported elemental words.

Player uses water.

### Developing

Enemy:

> **"Attacca Milo!"**

Animation gives a broad warning. Language reveals exact target.

### Intermediate

Enemy A:

> **"Prima Milo."**

Enemy B:

> **"Poi il ragazzo."**

Player can prepare ahead.

### Advanced

Enemy:

> **"Fingi di attaccare Milo. Quando si difende, prendi la pietra."**

Comprehension reveals a feint.

That is an RPG reward, not a language quiz.

---

# 59. COMMANDS ARE SEMANTIC, NOT SPELL PASSWORDS

If `ACQUA` only ever activates one attack, the player may learn it as a button label.

Force transfer.

`acqua` should appear around:

- drinking
- rivers
- rain
- requests
- combat
- enemy speech
- descriptions
- compound commands

Players must learn meaning, not button association.

---

# 60. ELEMENTS ARE THE ENTRY POINT, NOT THE CURRICULUM

Expand beyond elemental nouns into:

- wants
- needs
- actions
- position
- time
- people
- objects
- emotion
- description
- negation
- questions
- sequencing
- possession
- memory
- intention
- uncertainty
- social interaction

Otherwise the player only learns fantasy combat vocabulary.

---

# 61. HIGH-VALUE EARLY CONCEPTS

Prioritize language that is common, demonstrable, useful, and reusable.

Examples:

### Social
ciao, grazie, sì, no

### Needs
fame, acqua, aiuto

### Actions
guarda, vieni, vai, aspetta, prendi, lascia, apri, chiudi

### Spatial
qui, lì, sopra, sotto, dentro, fuori, davanti, dietro

### Descriptive
grande, piccolo, caldo, freddo, veloce, lento

### Combat
attacca, difendi, proteggi

### Structure
non, prima, poi

Final sequencing needs expert Italian review.

---

# 62. DO NOT OPTIMIZE FOR WORD COUNT

A network of deeply grounded concepts can be more useful than thousands of shallow translations.

Track:

- transfer
- contextual diversity
- delayed recall
- combination comprehension
- successful action
- listening recognition

not merely exposures.

---

# 63. PHRASES MATTER

Track useful chunks as well as individual concepts:

- ho fame
- va bene
- vieni qui
- guarda lì
- non lo so
- andiamo
- stai attento
- dietro di te
- dov'è?

Some language can be acquired as a meaningful chunk before being analytically decomposed.

---

# 64. CONTENT AUTHORING CHECKLIST

Every language-bearing encounter must answer:

1. Why is this character saying this?
2. What non-English evidence makes meaning inferable?
3. What prior concepts does it build on?
4. What new concept is introduced, if any?
5. How will the concept transfer elsewhere?
6. What happens if the player misunderstands?
7. Does understanding create an actual game benefit?
8. Would the scene still make sense if nobody were trying to teach a language?

If #8 is no, rewrite it.

---

# 65. ENCOUNTER DATA DIRECTION

```ts
interface LanguageEncounter {
  id: string;
  location: string;
  speakers: string[];

  narrativePurpose: string;
  gameplayPurpose: string;

  lines: {
    speaker: string;
    italian: string;
    concepts: string[];
    audioId?: string;
  }[];

  introducedConcepts: string[];
  reinforcedConcepts: string[];

  contextEvidence: {
    type:
      | "gesture"
      | "object"
      | "animation"
      | "environment"
      | "contrast"
      | "consequence"
      | "priorKnowledge";
    description: string;
  }[];

  playerActions: string[];
  outcomes: Record<string, string>;
  transferTargets: string[];
  requiredForStory: boolean;
}
```

The exact schema can evolve.

The key is forcing authors to define **how meaning is grounded**.

---

# 66. CONCEPT DATA DIRECTION

```ts
interface LanguageConcept {
  id: string;
  italian: string;
  lemma?: string;

  type:
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "function"
    | "phrase"
    | "construction";

  difficulty: number;
  visualGroundability: number;
  gameplayUtility: number;
  realWorldFrequency: number;

  prerequisites: string[];
  initialContexts: string[];
  transferContexts: string[];
  allowedScaffolds: string[];
  notesForWriters: string;
}
```

---

# 67. CONTENT VALIDATION

Automated tests should flag:

- unknown concept IDs
- language lines without annotations
- introduced concepts with no later transfer
- inappropriate prerequisite violations
- encounters with no grounding evidence
- combat-only concepts that should transfer
- mandatory scenes relying on unsupported advanced language
- duplicate content
- unreachable encounters

---

# 68. SCHEDULER: ADVENTURE, NOT HOMEWORK

The scheduler may use language needs, but output must be:

> **a believable thing that happens next**

not:

> a review item

Possible inputs:

- region
- story state
- recent encounters
- concept memory
- creature availability
- encounter rarity
- unresolved mini-stories
- contextual diversity

Possible weighting:

```text
story relevance
+ world variety
+ creature variety
+ due concept reinforcement
+ transfer value
+ unresolved character thread
- recent repetition
- same-speaker repetition
- same-modality repetition
- obvious drill feeling
```

---

# 69. MINI-STORIES BEAT RANDOM SENTENCES

Instead of three disconnected `sotto` encounters:

1. Milo loses a charm.
2. He thinks it is under the bed.
3. Another Lexling saw someone hide it under a bridge.
4. A later enemy mentions something beneath a rock.

Repetition belongs to an adventure.

---

# 70. CREATURE COLLECTION SUPPORTS IMMERSION

New Lexlings provide:

- voices
- personalities
- contexts
- transfer opportunities
- collectible motivation
- optional stories

Befriending, rescuing, documenting, or gaining trust can populate the bestiary.

Do not build a huge Pokémon party-management system.

Milo remains the mechanical center.

---

# 71. DO NOT BUILD POKÉMON

Lexbound needs:

- creature appeal
- elemental combat
- collection
- partnership

It does not need:

- hundreds of playable party members
- breeding
- giant evolution trees
- open-world movement
- huge move lists
- multiplayer battles
- trading
- 3D world simulation

Keep the fantasy large and the software small.

---

# 72. MOBILE WORLD STRUCTURE

Use illustrated locations and encounter nodes.

Example:

```text
LODGE
  |
WHISPERWOOD
  |-- Stream
  |-- Old Path
  |-- Hollow
  |-- Ruins
```

A location can be:

- background art
- ambient animation
- encounter pool
- story events
- battle background
- creatures
- discoverable details

This feels like a world without free movement.

---

# 73. VISUAL QUALITY IS PART OF LANGUAGE DESIGN

Context teaches meaning.

Therefore visuals are not cosmetic.

Art must clearly communicate:

- object identity
- gesture
- direction
- emotion
- elemental state
- relative size
- position
- action

Poor visuals can make language ambiguous for the wrong reason.

---

# 74. SMALL ANIMATIONS ARE ENOUGH

Useful Milo loops:

- idle
- look
- point
- wave
- eat
- drink
- shiver
- sweat
- sleep
- jump
- celebrate
- scared
- angry
- confused
- attack
- defend
- elemental cast

Tiny animation vocabulary can provide huge contextual value.

---

# 75. HUMOR AND EMOTION HELP MEMORY

Miscommunication can be funny without a red X.

Milo asks for something. Player gives the wrong item. Milo stares at it, then at the player, then points dramatically at what he wanted.

Important language should also appear during:

- danger
- reunion
- betrayal
- victory
- fear
- affection
- humor

Story is part of pedagogy.

---

# 76. LANGUAGE MUST MATTER OUTSIDE COMBAT

At least half of meaningful language use should eventually occur outside battle:

- exploration
- camp
- creature care
- story
- secrets
- navigation
- puzzles
- human misunderstandings
- relationships
- collection
- environmental discovery

Otherwise Italian becomes an attack menu.

---

# 77. AVOID CONSTANT FOUR-OPTION QUESTIONS

Four options are useful on mobile, but not every interaction should be a 1-of-4 prompt.

Mix:

- select object
- choose action
- choose direction
- give item
- target
- wait
- move
- command tiles
- order actions
- environmental interaction
- decide whether to trust information
- do nothing

Language informs the action. It is not always itself "the answer."

---

# 78. SOME SPEECH CAN REMAIN MYSTERIOUS

Not every line must be pedagogically optimized.

Lexlings can chatter.

Milo can say things the player does not understand.

Some lines can remain mysterious for hours.

This makes the language feel alive.

Protect mandatory information through context, retry, hints, or alternate routes.

---

# 79. MVP LANGUAGE GOAL

The MVP proves:

> **A player with zero Italian can acquire real comprehension through play and feel excited when it transfers.**

Recommended MVP:

- Milo
- one human hub
- one region
- four elemental concepts
- roughly 20–40 deeply grounded concepts
- one or two simple constructions
- recurring phrases
- 5–8 other Lexlings
- 30–60 language-bearing encounters
- 3–5 battles
- one mini mystery
- one plausible human mistranslation
- one cross-creature comprehension moment
- one enemy-speech tactical advantage

Do not try to prove fluency.

---

# 80. MVP TEST

Give the game to someone with no Italian.

Do not explain vocabulary.

After playing, present a novel scene.

A Lexling points to a cup:

> **"Voglio acqua."**

Does the player infer that it wants water?

Then:

> **"Non voglio acqua."**

Does their interpretation change?

Battle:

> **"Fuoco!"**

Do they anticipate fire?

Most importantly:

**Teach a concept only through Milo, then have a different Lexling use it in a new context.**

If the player understands, we have acquisition rather than UI memorization.

---

# 81. BUILD ORDER FOR THE LANGUAGE SYSTEM

## L1 — RICH CONCEPT MEMORY
Implement exposure, hypothesis/confidence, successful application, contextual diversity, and time.

## L2 — GROUNDING METADATA
Every teaching encounter must declare why meaning is inferable.

## L3 — CONTEXTUAL SCHEDULER
Resurface due concepts through different situations instead of review screens.

## L4 — CROSS-CREATURE TRANSFER
Teach through Milo, reuse through another Lexling.

## L5 — HUMAN MISUNDERSTANDING
An experienced human makes a plausible incorrect interpretation the player can recognize.

## L6 — ENEMY INTELLIGENCE
Enemy speech conveys useful tactical information.

## L7 — PHRASES AND CONSTRUCTIONS
Track meaningful chunks and simple structures beyond isolated words.

## L8 — LANGUAGE MYSTERY STORY BEATS
Make narrative progression and comprehension progression inseparable.

## L9 — COMMAND COMPOSITION
Expand Milo commands beyond single-word selection.

## L10 — AUDIO REFINEMENT
Strengthen listening-first acquisition and sound-to-meaning transfer.

---

# 82. CURRENT REPOSITORY: PRESERVE THE GOOD FOUNDATION

The current Lexbound repository already has valuable foundations:

- offline-first architecture
- pure TypeScript core
- content-as-data
- encounter engine
- battle engine
- scheduler
- save/progression
- stream `Acqua` grounding
- hot-path application
- Emberhog elemental test
- scaffold removal
- enemy `Fuoco!` telegraph
- repeat encounters
- post-battle cross-creature direction
- automated content tests
- E2E testing

Do not discard these blindly.

They need to serve the deeper language philosophy.

---

# 83. CURRENT REPOSITORY: PHILOSOPHICAL CHANGE

Stop thinking primarily:

> learned word -> test word -> schedule word

Think:

> **experience -> infer -> hypothesize -> encounter elsewhere -> act -> consequence -> transfer -> internalize**

And expand:

> understanding Milo lets you control Milo

into:

> **understanding Lexlings reveals information other humans cannot access.**

That is Lexbound's identity.

---

# 84. DO NOT POLISH THE WRONG GAME

The current programmer art can and should eventually be replaced.

But first make the prototype produce the correct psychological experience.

Priority:

1. language mystery
2. inference system
3. cross-creature transfer
4. combat information benefit
5. encounter quality
6. visual direction
7. polish

A beautiful contextual-flashcard app is still the wrong game.

Once this architecture is right, visual quality becomes a major priority because visuals are part of grounding.

---

# 85. AI CONTENT PIPELINE

Claude/Codex can generate candidate content, but every generation must follow this document.

Pipeline:

1. choose target concepts
2. choose already-known concepts
3. choose gameplay purpose
4. choose believable character motivation
5. choose grounding mechanism
6. draft encounter
7. draft misunderstanding outcome
8. define transfer encounter
9. validate schema
10. expert/native Italian review
11. integrate
12. human playtest

Never prompt:

> Generate 50 Italian exercises.

Prompt:

> Generate believable Whisperwood events involving Milo and local Lexlings. Each needs an independent RPG purpose, must naturally ground its target concept, and must never ask the player to translate.

---

# 86. AI CONTENT REJECTION RULES

Reject or flag content that:

- asks for translation
- immediately gives English after Italian
- says correct/incorrect for language
- exists solely to test a word
- makes Milo behave like a tutor
- introduces too many concepts at once
- provides no inferable context
- uses language only as an attack password
- repeats identical contexts
- requires unsupported grammar
- sounds unnatural
- breaks character motivation
- feels like a worksheet

---

# 87. CLAUDE/CODEX IMPLEMENTATION DIRECTIVE

For every language feature ask:

> **Does this make the player feel like they are learning to understand a living species, or like they are using a language-learning app?**

If the second answer is stronger, redesign it.

Do not default to:

- multiple-choice translation
- English definitions
- vocabulary popups
- mastery bars
- explicit review
- school terminology

Default to:

- situation
- observation
- action
- consequence
- recurrence
- transfer

---

# 88. NATIVE REVIEW IS REQUIRED BEFORE RELEASE

AI-generated Italian is draft content.

Before substantial production release, language needs expert/native review for:

- correctness
- naturalness
- register
- consistency
- age/tone appropriateness
- character voice
- pronunciation/audio

Incorrect Italian undermines the product.

---

# 89. ONE-SENTENCE DESIGN TEST

Every major Lexbound feature should fit:

> **I kept playing because I wanted to know what Milo and the other Lexlings were saying, and one day I realized I actually understood them.**

If the game achieves that, the language system is working.

---

# 90. IDEAL PLAYER EMOTIONAL ARC

Beginning:

> "Milo is cute. I can kind of tell what he wants."

Then:

> "Wait, I think acqua is water."

Then:

> "Oh shit, I knew what he wanted before he pointed."

Then:

> "That OTHER creature just said the same thing."

Then:

> "That Translator misunderstood her."

Then:

> "These aren't commands. They're actually talking."

Then:

> "I understood that whole sentence."

Then:

> "The enemies just told each other their plan."

Then:

> "Milo tried to tell me this HOURS ago."

Then:

> "The humans have no idea what's really happening."

Finally:

> **"I can understand them."**

That arc is Lexbound.

---

# 91. NON-NEGOTIABLES

1. Lexbound is an RPG first.
2. Italian is the real Lexling language, never an in-world school subject.
3. Milo is a character, not a tutor.
4. The player infers before the game explains.
5. Context teaches meaning.
6. Ambiguity is allowed.
7. Failure gives evidence instead of a red X.
8. Repetition occurs through varied world events.
9. Spaced repetition remains invisible.
10. Comprehension is deeper than learned/unlearned.
11. Cross-creature transfer is mandatory.
12. Human Translators can plausibly misunderstand Lexlings.
13. Enemy speech becomes tactical intelligence.
14. Language unlocks information, not merely attacks.
15. Combat remains a real RPG system.
16. Milo's multi-element nature makes precise communication powerful.
17. Language complexity grows with tactical and narrative complexity.
18. No disguised flashcards.
19. No constant translation questions.
20. No mandatory English gloss under every line.
21. No visible mastery percentage as the core fantasy.
22. The world remains playable before full comprehension.
23. Understanding should often feel like discovering a secret.
24. Important concepts transfer into new contexts.
25. The language mystery escalates with the story.
26. The protagonist and player discover meaning together.
27. Old dialogue can become newly meaningful.
28. Visual context is part of the language system.
29. Audio recognition is a long-term requirement.
30. Italian requires expert/native review before release.
31. Scope stays mobile-sized and data-driven.
32. Do not build Pokémon. Build Lexbound.
33. The ultimate reward is understanding.
34. Repeated emotional target: **"Wait... I understood that."**
35. **Italian is Lexbound's second reality.**

---

# 92. SHORT VERSION TO PIN IN CLAUDE.md

> **LEXBOUND LANGUAGE RULE:** Never treat Italian as quiz content. The player is learning to understand a living species. New language should be grounded through visible context, inferred before it is explained, resurfaced naturally through different situations, and eventually transferred across Milo, wild Lexlings, enemies, and story scenes. The game tracks comprehension invisibly. Understanding must reveal useful information: intentions, tactics, secrets, personality, relationships, routes, jokes, lore, and eventually the true plot. Milo is not a tutor. Enemy speech is intelligence. Human Translators can be plausibly wrong. Do not use translation questions, vocabulary popups, visible mastery scores, or "correct Italian = damage" as the core loop. The recurring emotional target is **"Wait... I understood that."** Italian is not merely Milo's command system. **Italian is the game's second reality.**
