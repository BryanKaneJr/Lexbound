/**
 * Lexbound's look: a storybook RPG. Warm parchment panels over painted
 * scenes, deep ink text, one amber accent for the thing to press. Element
 * colours come from content (elements.json) so a tile, an effect and an icon
 * always agree.
 */
export const color = {
  ink: '#1F2A37',
  inkSoft: '#4A5566',
  inkMuted: '#7A8494',
  paper: '#FBF5EA',
  paperDeep: '#F1E6D2',
  paperLine: '#E2D3B8',
  night: '#1E2B3A',
  nightSoft: '#2C3E52',
  amber: '#E8A33D',
  amberDeep: '#C9822A',
  amberSoft: '#FCEBCB',
  leaf: '#4E9F6B',
  leafSoft: '#DCEFD9',
  heart: '#E25C7A',
  heartSoft: '#FBE0E6',
  sky: '#6DB7E8',
  danger: '#D2553F',
  white: '#FFFFFF',
  hp: '#5CBF6E',
  hpLow: '#E2A13A',
  hpCrit: '#D9553E',
  creature: '#FFFFFF',
  creatureLine: '#D9C9AE',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 18, xl: 26, pill: 999 } as const;

export const type = {
  title: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.3 },
  heading: { fontSize: 19, fontWeight: '800' as const },
  body: { fontSize: 16, fontWeight: '500' as const, lineHeight: 23 },
  small: { fontSize: 13, fontWeight: '600' as const },
  label: { fontSize: 12, fontWeight: '800' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  /** Creature speech: big and bold. It's the most important text in the game. */
  creature: { fontSize: 26, fontWeight: '900' as const, letterSpacing: 0.2 },
  tile: { fontSize: 22, fontWeight: '900' as const, letterSpacing: 1.5 },
} as const;

export const shadow = {
  card: { shadowColor: '#3B2A12', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  lift: { shadowColor: '#3B2A12', shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
} as const;
