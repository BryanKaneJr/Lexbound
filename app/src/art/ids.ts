/**
 * Every piece of art the app can draw, by id, with how big it stands in a
 * scene (a fraction of the scene's height) and how it idles. Plain data with
 * no React imports, so the content tests can check that every encounter
 * only uses art that exists.
 */
export type Idle = 'breathe' | 'bob' | 'float' | 'flicker' | 'none';

export const ACTOR_ART: Record<string, { height: number; idle: Idle }> = {
  milo: { height: 0.27, idle: 'breathe' },
  emberhog: { height: 0.25, idle: 'breathe' },
  drizzlet: { height: 0.15, idle: 'bob' },
  pebblit: { height: 0.11, idle: 'breathe' },
  puffkin: { height: 0.17, idle: 'float' },
  maren: { height: 0.6, idle: 'breathe' },
  pip: { height: 0.52, idle: 'breathe' },
};

export const PROP_ART: Record<string, { height: number; idle: Idle }> = {
  basket: { height: 0.12, idle: 'none' },
  bush: { height: 0.2, idle: 'none' },
  shiny_stone: { height: 0.06, idle: 'bob' },
  log: { height: 0.08, idle: 'none' },
  mushroom: { height: 0.07, idle: 'none' },
  ripple: { height: 0.06, idle: 'bob' },
  rock_big: { height: 0.17, idle: 'none' },
  rock_small: { height: 0.06, idle: 'none' },
  campfire: { height: 0.16, idle: 'flicker' },
  puddle: { height: 0.05, idle: 'none' },
  well: { height: 0.25, idle: 'none' },
  pouch: { height: 0.06, idle: 'none' },
  bowl: { height: 0.2, idle: 'none' },
};

export const BACKGROUND_ART = ['lodge', 'camp', 'camp_night', 'forest_path', 'forest_stream', 'forest_clearing', 'sunny_path'];

export const ART_IDS = {
  backgrounds: new Set(BACKGROUND_ART),
  props: new Set(Object.keys(PROP_ART)),
  actors: new Set(Object.keys(ACTOR_ART)),
};
