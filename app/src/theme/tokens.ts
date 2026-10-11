/**
 * Lexbound's look: a painted storybook (docs/art-direction.md). Parchment
 * panels with inked edges sit on the scene's own ground; deep warm ink for
 * text; one gold accent for the thing to press. Element colours come from
 * content (elements.json) so a tile, an effect and an icon always agree.
 */
export const color = {
  ink: '#2A2119',
  inkSoft: '#56473A',
  inkMuted: '#8A7A68',
  paper: '#FBF4E4',
  paperDeep: '#EFE2C8',
  paperLine: '#D9C4A0',
  /** The inked edge of a parchment panel or button. */
  edge: '#8A6A47',
  edgeDark: '#5E4630',
  night: '#1A2230',
  nightSoft: '#2A3546',
  amber: '#E2A240',
  amberDeep: '#B9782A',
  amberSoft: '#F8E6C2',
  leaf: '#5E9A5E',
  leafSoft: '#DCEBD3',
  heart: '#D9576F',
  heartSoft: '#F7DDE1',
  sky: '#6DB7E8',
  danger: '#C8513C',
  white: '#FFFFFF',
  hp: '#6CC06A',
  hpLow: '#E2A13A',
  hpCrit: '#D9553E',
  creature: '#FFFBF0',
  creatureLine: '#C2A57C',
} as const;

/** Bundled typefaces (loaded in app/_layout.tsx). Custom fonts carry their weight in the family name. */
export const font = {
  /** Fraunces: titles, creature speech, command tiles. */
  display: 'Fraunces_700Bold',
  displayHeavy: 'Fraunces_900Black',
  displaySemi: 'Fraunces_600SemiBold',
  /** Fraunces italic: narration, like a storybook's prose. */
  story: 'Fraunces_400Regular_Italic',
  /** Atkinson Hyperlegible: everything else, chosen for readability. */
  ui: 'AtkinsonHyperlegible_400Regular',
  uiBold: 'AtkinsonHyperlegible_700Bold',
  uiItalic: 'AtkinsonHyperlegible_400Regular_Italic',
  uiBoldItalic: 'AtkinsonHyperlegible_700Bold_Italic',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 18, xl: 26, pill: 999 } as const;

export const type = {
  title: { fontFamily: font.display, fontSize: 28, letterSpacing: -0.2 },
  heading: { fontFamily: font.displaySemi, fontSize: 20 },
  body: { fontFamily: font.ui, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: font.uiBold, fontSize: 13 },
  label: { fontFamily: font.uiBold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase' as const },
  /** Narration: storybook prose. */
  story: { fontFamily: font.story, fontSize: 18, lineHeight: 26 },
  /** Creature speech: big and bold. It's the most important text in the game. */
  creature: { fontFamily: font.displayHeavy, fontSize: 27, letterSpacing: 0.2 },
  tile: { fontFamily: font.display, fontSize: 22, letterSpacing: 1.5 },
} as const;

export const shadow = {
  card: { shadowColor: '#24170B', shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  lift: { shadowColor: '#24170B', shadowOpacity: 0.34, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
} as const;
