import { loadContent, type ContentInput, type Content } from '../src';

/** A tiny world for engine tests: two elements' worth of everything. */
export function fixture(overrides: Partial<ContentInput> = {}): Content {
  const base: ContentInput = {
    language: { code: 'it', name: 'Italian', speechLocale: 'it-IT' },
    concepts: [
      { id: 'water', gloss: 'water', category: 'element', stage: 1, icon: 'water' },
      { id: 'fire', gloss: 'fire', category: 'element', stage: 1, icon: 'fire' },
      { id: 'wind', gloss: 'wind', category: 'element', stage: 1, icon: 'wind' },
      { id: 'yes', gloss: 'yes', category: 'answer', stage: 1 },
      { id: 'look', gloss: 'look', category: 'action', stage: 1 },
      { id: 'earth', gloss: 'earth', category: 'element', stage: 1, icon: 'earth' },
      { id: 'attack', gloss: 'attack', category: 'action', stage: 1 },
    ],
    words: [
      { concept: 'water', word: 'acqua', forms: ["l'acqua"] },
      { concept: 'fire', word: 'fuoco' },
      { concept: 'wind', word: 'vento' },
      { concept: 'yes', word: 'sì' },
      { concept: 'look', word: 'guarda' },
      { concept: 'earth', word: 'terra' },
      { concept: 'attack', word: 'attacca', forms: ["all'attacco"] },
    ],
    lines: [
      { id: 'milo.acqua', speaker: 'milo', text: 'Acqua!', concepts: ['water'], gloss: 'Water!' },
      { id: 'milo.si', speaker: 'milo', text: 'Sì!', concepts: ['yes'], gloss: 'Yes!' },
      { id: 'milo.guarda', speaker: 'milo', text: 'Guarda!', concepts: ['look'], gloss: 'Look!' },
      { id: 'milo.ops', speaker: 'milo', text: 'Ops!', gloss: 'Oops!' },
      { id: 'hog.fuoco', speaker: 'hog', text: 'Fuoco!', concepts: ['fire'], gloss: 'Fire!' },
      { id: 'hog.grazie', speaker: 'hog', text: 'Grazie!', gloss: 'Thanks!' },
      { id: 'hog.ahi', speaker: 'hog', text: "No! L'acqua no!", concepts: ['water'], gloss: 'Not the water!' },
      { id: 'hog.flee', speaker: 'hog', text: 'Ahi!', gloss: 'Ow!' },
      { id: 'hog.attacco', speaker: 'hog', text: "All'attacco!", concepts: ['attack'], gloss: 'Charge!' },
    ],
    elements: {
      elements: [
        { id: 'water', concept: 'water', color: '#00f' },
        { id: 'fire', concept: 'fire', color: '#f00' },
        { id: 'wind', concept: 'wind', color: '#0f0' },
        { id: 'earth', concept: 'earth', color: '#a70' },
      ],
      chart: {
        water: { fire: { multiplier: 2 } },
        fire: { fire: { multiplier: 0, effect: 'absorb' } },
        wind: { fire: { multiplier: 0.5, effect: 'fan' } },
      },
    },
    abilities: [
      { id: 'water_bolt', name: 'Water Bolt', element: 'water', power: 10, counters: ['fire'] },
      { id: 'stone', name: 'Stone Wall', element: 'earth', power: 5, counters: ['physical'] },
      { id: 'flame', name: 'Flame', element: 'fire', power: 10 },
      { id: 'gust', name: 'Gust', element: 'wind', power: 10 },
      { id: 'spit', name: 'Spit', element: 'fire', power: 8 },
      { id: 'tackle', name: 'Tackle', element: null, power: 6 },
    ],
    lexlings: [
      {
        id: 'hog',
        name: 'Hog',
        element: 'fire',
        habitat: 'wood',
        temperament: 'hostile',
        description: 'A hog.',
        voice: { pitch: 0.8, rate: 1 },
        battle: {
          level: 1,
          hp: 40,
          moves: [
            { ability: 'spit', telegraph: 'hog.fuoco', windup: 'embers' },
            { ability: 'tackle', telegraph: 'hog.attacco', windup: 'paw' },
          ],
          pattern: [0, 1],
          xp: 20,
          reactions: { strong: ['hog.ahi'], absorbed: ['hog.grazie'], defeat: ['hog.flee'] },
          clue: 'Milo looks at the stream.',
        },
      },
    ],
    milo: {
      voice: { pitch: 1.5, rate: 1 },
      hp: { base: 30, perLevel: 5 },
      powerPerLevel: 0.1,
      commands: [
        { id: 'water', concepts: ['water'], ability: 'water_bolt' },
        { id: 'fire', concepts: ['fire'], ability: 'flame' },
        { id: 'wind', concepts: ['wind'], ability: 'gust' },
        { id: 'earth', concepts: ['earth'], ability: 'stone' },
      ],
      reactions: { strong: ['milo.si'], fanned: ['milo.ops'] },
      idle: ['milo.si'],
      camp: { hungry: 'milo.si', snack: 'milo.si' },
    },
    npcs: [{ id: 'maren', name: 'Maren', title: 'Warden', color: '#000' }],
    items: [
      { id: 'flask', name: 'Flask', description: 'A flask.', icon: 'flask' },
      { id: 'stick', name: 'Stick', description: 'A stick.', icon: 'stick' },
    ],
    locations: [{ id: 'wood', name: 'Wood', kind: 'explore', background: 'forest', blurb: 'Trees.', map: { x: 0.5, y: 0.5 } }],
    journal: [{ id: 'story.one', section: 'story', title: 'One', text: 'It began.' }],
    encounters: [],
  };
  return loadContent({ ...base, ...overrides });
}
