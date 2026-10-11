import { useId } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { blade, blob, GroundShadow, Glow, mix, Shaded, tuft } from './paint';

/**
 * Scene props, drawn in code. Each is a self-contained SVG; its box's bottom
 * edge sits on the ground.
 *
 * Painted like the characters (docs/art-direction.md): each form in its
 * shade colour with a mid tone and the lit colour stepped toward the upper
 * left, a rim of light, and an outline in a darker, warmer version of its own
 * colour. A soft contact shadow grounds each one; things that give light
 * (the fire, the glowing mushrooms, the shiny stone) carry their own glow.
 * They are small on screen, so the shapes are bold and the detail sparse.
 */
type PropDef = { aspect: number; draw: (uid: string) => React.ReactNode; viewBox: string };
type Ids = (n: string) => string;
type Tone = { lit: string; mid: string; shade: string; line: string };

const ids = (uid: string): Ids => (n) => `${n}${uid}`;

const STONE: Tone = { lit: '#B7AFA1', mid: '#8D877D', shade: '#5B626B', line: '#524640' };
const BARK: Tone = { lit: '#9F7352', mid: '#7A5238', shade: '#523A33', line: '#36211A' };
const WOOD: Tone = { lit: '#C68F59', mid: '#9A673D', shade: '#6A4631', line: '#42271A' };
const CUT: Tone = { lit: '#EFCB95', mid: '#D8A970', shade: '#B2804F', line: '#6E4428' };
const LEAF: Tone = { lit: '#80AF57', mid: '#4F8A4B', shade: '#2A5A45', line: '#1E3D2B' };
const MOSS: Tone = { lit: '#86AD56', mid: '#5A8746', shade: '#38613D', line: '#27452A' };
const GRASS = '#4E7C3B';
const GRASS_DARK = '#3B6531';
const AUTUMN = ['#D9822B', '#C4562A', '#E3A83A', '#A8602E', '#B8432A'];
const LIGHT = '#FFE9B8';
const COOL = '#3A3550';
const INK = '#2E160C';

/** One painted form: `step` scales the shading to its size (1 suits a form about 100 units across). */
function Form({ g, id, d, t, step = 1, lw = 2.4, rim = 0.45, transform }: { g: Ids; id: string; d: string; t: Tone; step?: number; lw?: number; rim?: number; transform?: string }) {
  return <Shaded g={g} id={id} d={d} shade={t.shade} mid={t.mid} lit={t.lit} line={t.line} lineWidth={lw} rim={rim} step={step} transform={transform} />;
}

/**
 * Overlapping clumps (foliage, moss) painted as one mass: a single bold
 * outline round the whole silhouette, then each clump in turn with a fine
 * inner line, so the clumps read as lumps of one bush rather than stickers.
 */
function Clumps({ g, clumps, step, lw = 2.4, rim = 0.35 }: { g: Ids; clumps: { id: string; d: string; t: Tone }[]; step: number; lw?: number; rim?: number }) {
  return (
    <G>
      {clumps.map((c) => (
        <Path key={`o${c.id}`} d={c.d} fill={c.t.line} stroke={c.t.line} strokeWidth={lw * 2} strokeLinejoin="round" />
      ))}
      {clumps.map((c) => (
        <Shaded key={c.id} g={g} id={c.id} d={c.d} shade={c.t.shade} mid={c.t.mid} lit={c.t.lit} line={mix(c.t.line, c.t.mid, 0.35)} lineWidth={lw * 0.45} rim={rim} step={step} />
      ))}
    </G>
  );
}

/**
 * Several shapes painted as one form: the same two-tone shading as `Shaded`,
 * but clipped to their union, so the bands of shade fall only along the
 * lower right of the whole mass and never between its parts.
 */
function Mass({ g, id, ds, t, step, lw = 1.6 }: { g: Ids; id: string; ds: string[]; t: Tone; step: number; lw?: number }) {
  const layer = (fill: string, dx: number, dy: number) => (
    <G transform={`translate(${(dx * step).toFixed(1)} ${(dy * step).toFixed(1)})`}>
      {ds.map((d, i) => (
        <Path key={i} d={d} fill={fill} />
      ))}
    </G>
  );
  return (
    <G>
      {ds.map((d, i) => (
        <Path key={`o${i}`} d={d} fill={t.line} stroke={t.line} strokeWidth={lw * 2} strokeLinejoin="round" />
      ))}
      <Defs>
        <ClipPath id={g(id)}>
          {ds.map((d, i) => (
            <Path key={i} d={d} />
          ))}
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${g(id)})`}>
        {layer(t.shade, 0, 0)}
        {layer(t.mid, -6, -6)}
        {layer(t.lit, -12, -11)}
      </G>
    </G>
  );
}

/** A cushion of moss: lumpy clumps in a row, [x, y, radius], painted as one mass. */
function Moss({ g, id, at, squash = 0.72, seed = 1 }: { g: Ids; id: string; at: [number, number, number][]; squash?: number; seed?: number }) {
  const ds = at.map(([x, y, r], i) => blob(x, y, r, { seed: seed + i * 3, lobes: 5, lobe: 0.16, wobble: 0.08, squash }));
  return <Mass g={g} id={id} ds={ds} t={MOSS} step={Math.max(...at.map((a) => a[2])) / 34} lw={1.5} />;
}

/** A tapered sliver (a crack, a fold, a groove): from (x1, y1) to (x2, y2), bowed through (cx, cy), `dx`/`dy` thick at the middle. */
function crease(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, dx: number, dy = 0): string {
  return `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2} Q${cx + dx} ${cy + dy} ${x1} ${y1} Z`;
}

/** A leaf lying in the light: its upper half lit, its lower half in shade, a vein down the middle. `dim` pushes it into shadow. */
function Leaf({ x, y, turn, len, color, dim = 0 }: { x: number; y: number; turn: number; len: number; color: string; dim?: number }) {
  const c = mix(color, COOL, dim);
  const w = len * 0.55;
  const line = mix(c, INK, 0.55);
  return (
    <G transform={`translate(${x} ${y}) rotate(${turn})`}>
      <Path d={`M0 0 Q${len * 0.42} ${-w} ${len} 0 Z`} fill={mix(c, LIGHT, 0.3)} />
      <Path d={`M0 0 Q${len * 0.42} ${w} ${len} 0 Z`} fill={mix(c, COOL, 0.22)} />
      <Path d={`M0 0 Q${len * 0.42} ${-w} ${len} 0 Q${len * 0.42} ${w} 0 0 Z`} fill="none" stroke={line} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d={`M${-len * 0.14} 0 L${len * 0.84} 0`} stroke={line} strokeWidth={0.9} strokeLinecap="round" opacity={0.75} />
    </G>
  );
}

/** A sunberry: orange, glossy, round. */
function Berry({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill="#C9601F" />
      <Circle cx={x - r * 0.16} cy={y - r * 0.16} r={r * 0.78} fill="#EE8A30" />
      <Circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.42} fill="#FFBE5E" />
      <Circle cx={x} cy={y} r={r} fill="none" stroke="#86391A" strokeWidth={1} />
      <Circle cx={x - r * 0.38} cy={y - r * 0.42} r={r * 0.17} fill="#FFFFFF" opacity={0.9} />
    </G>
  );
}

/** A small green leaf, for berries and sprouts. */
function Sprig({ x, y, turn, len }: { x: number; y: number; turn: number; len: number }) {
  return <Leaf x={x} y={y} turn={turn} len={len} color="#5E9A4A" />;
}

/** A sparkle: four thin points of light. */
function sparkle(x: number, y: number, r: number): string {
  const k = r * 0.22;
  return `M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z`;
}

/** A flame: a teardrop that licks up to a point at (x + lean, y - h). */
function flame(x: number, y: number, h: number, w: number, lean = 0): string {
  return `M${x - w} ${y} C${x - w * 1.15} ${y - h * 0.4} ${x + lean * 0.2 - w * 0.5} ${y - h * 0.62} ${x + lean} ${y - h} C${x + lean * 0.4 + w * 0.55} ${y - h * 0.6} ${x + w * 1.2} ${y - h * 0.38} ${x + w} ${y} C${x + w * 0.5} ${y + w * 0.35} ${x - w * 0.5} ${y + w * 0.35} ${x - w} ${y} Z`;
}

/** Rows of woven cane on a basket: a scalloped line per row, bowed with the basket's curve. */
function weave(top: number, bottom: number, left: number, right: number, rowH: number, cell: number): { dark: string; light: string } {
  let dark = '';
  let light = '';
  for (let r = 0, y = top; y <= bottom; r++, y += rowH) {
    const off = (r % 2) * (cell / 2);
    const bow = (x: number) => 3 * (1 - ((x - (left + right) / 2) / ((right - left) / 2)) ** 2);
    for (let x = left - cell + off; x < right + cell; x += cell) {
      const y0 = y + bow(x);
      const y1 = y + bow(x + cell);
      dark += `M${x.toFixed(1)} ${y0.toFixed(1)} Q${(x + cell / 2).toFixed(1)} ${((y0 + y1) / 2 + rowH * 0.42).toFixed(1)} ${(x + cell).toFixed(1)} ${y1.toFixed(1)} `;
      light += `M${(x + 1.5).toFixed(1)} ${(y0 + rowH * 0.3).toFixed(1)} Q${(x + cell / 2).toFixed(1)} ${((y0 + y1) / 2 + rowH * 0.05).toFixed(1)} ${(x + cell - 1.5).toFixed(1)} ${(y1 + rowH * 0.3).toFixed(1)} `;
    }
  }
  return { dark, light };
}

/** The leaf pile, back to front: [x, y, turn, length]. */
const LEAF_PILE: [number, number, number, number][] = [
  [40, 34, -20, 22],
  [70, 24, 10, 24],
  [104, 22, -10, 26],
  [132, 30, 24, 22],
  [22, 50, -30, 22],
  [52, 42, 30, 26],
  [86, 36, -40, 24],
  [116, 40, 14, 26],
  [146, 46, -16, 22],
  [12, 62, -8, 20],
  [36, 56, 18, 24],
  [66, 52, -24, 26],
  [96, 54, 36, 22],
  [124, 56, -12, 26],
  [152, 60, 20, 22],
  [80, 62, 4, 24],
  [48, 64, -14, 20],
  [134, 64, 160, 18],
];

/** Leaves underneath, filling out the pile: [x, y, turn, length]. */
const LEAF_PILE_UNDER: [number, number, number, number][] = [
  [30, 44, -10, 20],
  [62, 32, 20, 22],
  [92, 26, -24, 22],
  [118, 28, 30, 20],
  [140, 40, -20, 22],
  [160, 54, 30, 18],
  [18, 58, 20, 18],
  [104, 46, -30, 22],
  [74, 44, 40, 22],
  [58, 60, 10, 20],
  [110, 62, -20, 20],
  [166, 62, 10, 16],
  [26, 64, 0, 18],
];

/** Broken leaves round the rim of the pit: [x, y, turn, length]. */
const PIT_RIM: [number, number, number, number][] = [
  [10, 26, -30, 16],
  [26, 14, 20, 18],
  [58, 8, -10, 16],
  [96, 6, 14, 18],
  [134, 8, -20, 16],
  [166, 14, 30, 18],
  [178, 30, 70, 14],
  [12, 44, 10, 18],
  [40, 52, -20, 20],
  [76, 54, 6, 18],
  [112, 54, -8, 20],
  [148, 52, 24, 18],
  [176, 44, -40, 16],
];

/** Rows of pinecone scales, top to bottom: [y, half-width, count]. */
const PINE_ROWS: [number, number, number][] = [
  [16, 8, 2],
  [23, 14, 3],
  [30, 18, 4],
  [37, 20, 4],
  [44, 19, 4],
  [51, 16, 3],
  [57, 11, 2],
  [62, 5, 1],
];

/** Carved letter-like marks, a row at a time. */
const GLYPHS = [
  'M30 54 L30 66 M36 54 L40 66 L44 54 M50 54 L50 66 L57 66 M63 54 Q70 54 70 60 Q70 66 63 66',
  'M28 78 L34 78 M31 78 L31 90 M40 78 Q47 84 40 90 M52 78 L52 90 M52 84 L58 78 M52 84 L58 90 M64 90 L68 78 L72 90',
  'M32 102 Q38 98 40 104 Q42 110 36 114 M48 102 L48 114 L54 108 L60 114 L60 102 M66 102 L72 114',
];
/** The small round creature carved near the foot, and the name beneath it. */
const CARVED_CREATURE = 'M39 147 L41 136 L47 143 M53 143 L59 136 L61 147 M50 154 m-13 0 a13 12 0 1 0 26 0 a13 12 0 1 0 -26 0 M46 158 Q50 161 54 158 M44 166 L43 171 M56 166 L57 171';
const CARVED_NAME = 'M34 180 L34 188 M40 180 L44 188 L48 180 M54 180 L54 188 L60 188 M64 180 L68 188';

/** A mark cut into stone: a dark groove, its lower lip catching the light. */
function Carved({ d, width, strength = 1 }: { d: string; width: number; strength?: number }) {
  const s = { strokeWidth: width, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <G>
      <Path d={d} stroke="#CBD2C4" opacity={0.65 * strength} transform="translate(0.9 1.1)" {...s} />
      <Path d={d} stroke="#1E2422" opacity={0.75 * strength} {...s} />
    </G>
  );
}

export const PROPS: Record<string, PropDef> = {
  basket: {
    aspect: 140 / 100,
    viewBox: '0 0 140 100',
    draw: (uid) => {
      const g = ids(uid);
      const cane: Tone = { lit: '#E6B677', mid: '#C88E4F', shade: '#8F6142', line: '#673F22' };
      const cloth: Tone = { lit: '#CFE0EF', mid: '#A9C3DC', shade: '#7F9AB9', line: '#566F8C' };
      const body = 'M14 46 C13 66 18 82 28 93 C50 98 90 98 112 93 C122 82 127 66 126 46 Z';
      const w = weave(52, 90, 14, 126, 7, 11);
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={70} cy={94} rx={64} ry={7} opacity={0.36} />
          {/* the handle, wrapped in cane */}
          <Form g={g} id="handle" d="M27 47 C26 5 114 5 113 47 L105 47 C105 17 35 17 35 47 Z" t={cane} step={0.3} lw={2} />
          <G clipPath={`url(#${g('handle')})`}>
            <Path d="M31 47 C31 11 109 11 109 47" stroke={cane.line} strokeWidth={8} strokeDasharray="1.4 3.6" fill="none" opacity={0.45} />
          </G>
          {/* a blanket bunched inside: something slept in here */}
          <Form g={g} id="cloth" d="M24 47 C27 40 36 35 48 36 C58 31 72 31 82 35 C95 33 108 38 116 47 Z" t={cloth} step={0.35} lw={1.8} />
          <Path d="M58 33 C62 38 64 43 64 47 M86 35 C90 39 92 43 92 47" stroke={cloth.shade} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M32 43 C44 39 58 38 70 39 C84 39 98 40 110 45" stroke="#F6EEDC" strokeWidth={2.2} strokeLinecap="round" strokeDasharray="3 2.2" fill="none" />
          {/* the basket */}
          <Form g={g} id="body" d={body} t={cane} step={0.75} lw={2.2} rim={0.4} />
          <G clipPath={`url(#${g('body')})`}>
            <Path d={w.light} stroke={cane.lit} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.75} />
            <Path d={w.dark} stroke={cane.line} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.6} />
          </G>
          <Path d="M28 93 C50 98 90 98 112 93" stroke={cane.line} strokeWidth={2.2} strokeLinecap="round" fill="none" />
          {/* the rolled rim */}
          <Form g={g} id="rim" d="M10 46 C10 41 30 40 70 40 C110 40 130 41 130 46 C130 52 110 55 70 55 C30 55 10 52 10 46 Z" t={cane} step={0.35} lw={2} rim={0.5} />
          <Path d="M14 47 C30 51 110 51 126 47" stroke={cane.line} strokeWidth={6} strokeDasharray="1.2 4.2" fill="none" opacity={0.35} />
          {/* a corner of the blanket hanging over the rim */}
          <Form g={g} id="corner" d="M26 49 C32 52 42 53 50 50 C52 57 50 64 46 69 C44 72 40 73 38 70 C33 64 29 57 26 49 Z" t={cloth} step={0.2} lw={1.8} rim={0.4} />
          <Path d="M32 53 C38 55 44 55 48 53" stroke="#F6EEDC" strokeWidth={2} strokeLinecap="round" strokeDasharray="3 2" fill="none" />
          <Path d="M38 56 C40 62 41 66 41 71" stroke={cloth.shade} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          {/* the paper tag, on a string */}
          <Path d="M110 50 C112 54 109 59 108 63" stroke="#7A6250" strokeWidth={1.2} strokeLinecap="round" fill="none" />
          <G transform="translate(106 56) rotate(16)">
            <Path d="M0 2.5 L4 0 L23 0 L23 14 L4 14 L0 11.5 Z" fill="#F8EEDB" stroke="#9B8468" strokeWidth={1.3} strokeLinejoin="round" />
            <Path d="M4 11.8 L23 11.8 L23 14 L4 14 Z" fill="#DCCDB4" />
            <Circle cx={3.6} cy={7} r={1.4} fill="#9B8468" />
            <Path d="M8 5 L12 5 M13.5 5 L19.5 5 M8 9 L17 9" stroke="#3A3240" strokeWidth={1.3} strokeLinecap="round" />
          </G>
        </G>
      );
    },
  },
  bush: {
    aspect: 160 / 120,
    viewBox: '0 0 160 120',
    draw: (uid) => {
      const g = ids(uid);
      const back: Tone = { lit: '#5F9450', mid: '#3D7346', shade: '#244B3E', line: LEAF.line };
      const clumps = [
        { id: 'c0', d: 'M8 114 C4 100 12 88 28 86 L132 86 C148 88 156 100 152 114 Z', t: back },
        { id: 'c1', d: blob(118, 70, 33, { seed: 3, lobes: 8, lobe: 0.2, wobble: 0.06 }), t: back },
        { id: 'c2', d: blob(42, 74, 31, { seed: 5, lobes: 8, lobe: 0.2, wobble: 0.06 }), t: back },
        { id: 'c3', d: blob(82, 46, 35, { seed: 7, lobes: 9, lobe: 0.2, wobble: 0.06 }), t: LEAF },
        { id: 'c4', d: blob(54, 87, 28, { seed: 9, lobes: 8, lobe: 0.2, wobble: 0.06 }), t: LEAF },
        { id: 'c5', d: blob(106, 90, 26, { seed: 11, lobes: 8, lobe: 0.2, wobble: 0.06 }), t: LEAF },
      ];
      // leaves catching the sun on the upper left of each clump, and a few deep in shade
      const flecks: [number, number, number, number][] = [
        [62, 24, -40, 10], [74, 18, -20, 9], [54, 36, -60, 8], [24, 56, -50, 9], [34, 50, -30, 8], [92, 70, -40, 9], [100, 66, -20, 8], [34, 76, -40, 8], [44, 70, -30, 7], [104, 44, -50, 7], [112, 40, -30, 7],
      ];
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={80} cy={113} rx={80} ry={9} opacity={0.42} />
          <Defs>
            <ClipPath id={g('base')}>
              <Path d="M0 0 L160 0 L160 112 C120 116 40 116 0 112 Z" />
            </ClipPath>
          </Defs>
          <G clipPath={`url(#${g('base')})`}>
            <Clumps g={g} clumps={clumps} step={0.95} lw={2.2} rim={0.3} />
            {flecks.map(([x, y, turn, len], i) => (
              <Path key={i} d={`M${x} ${y} q${len * 0.4} ${-len * 0.35} ${len} 0 q${-len * 0.6} ${len * 0.3} ${-len} 0 Z`} fill="#A9CF74" opacity={0.75} transform={`rotate(${turn} ${x} ${y})`} />
            ))}
            {[[124, 84], [138, 72], [80, 100], [118, 104], [70, 66], [60, 104]].map(([x, y], i) => (
              <Path key={`d${i}`} d={`M${x} ${y} q4 -3 9 0 q-5 3 -9 0 Z`} fill={LEAF.line} opacity={0.45} transform={`rotate(${20 + i * 25} ${x} ${y})`} />
            ))}
          </G>
          {/* berries */}
          {[[60, 40], [100, 62], [34, 82], [126, 88], [80, 84]].map(([x, y], i) => (
            <G key={`b${i}`}>
              <Circle cx={x! + 4} cy={y! + 3} r={3.4} fill="#A82E4A" stroke="#5E1828" strokeWidth={1} />
              <Circle cx={x} cy={y} r={3.8} fill="#D44562" stroke="#5E1828" strokeWidth={1} />
              <Circle cx={x! - 1.2} cy={y! - 1.3} r={1.2} fill="#FFE0E6" />
            </G>
          ))}
          {/* grass at its foot */}
          <Path d={tuft(12, 116, 14, 4, 6)} fill={GRASS} />
          <Path d={tuft(60, 116, 11, 8, 6)} fill={GRASS_DARK} />
          <Path d={tuft(146, 116, 14, 12, 6)} fill={GRASS_DARK} />
          <Path d={tuft(100, 117, 10, 16, 5)} fill={GRASS} />
        </G>
      );
    },
  },
  shiny_stone: {
    aspect: 1,
    viewBox: '0 0 60 60',
    draw: (uid) => {
      const g = ids(uid);
      const O = [[9, 35], [19, 17], [37, 12], [52, 26], [48, 46], [24, 52]];
      const T = [[21, 32], [27, 24], [37, 22], [42, 30], [39, 39], [27, 41]];
      const fills = ['#CDEFF5', '#F3FDFB', '#A4DBEA', '#6DB0CF', '#4C8DB6', '#8ACADF'];
      const pt = (p: number[]) => `${p[0]} ${p[1]}`;
      return (
        <G>
          <Glow g={g} id="glow" cx={30} cy={32} r={30} color="#FFF4C8" opacity={0.85} />
          <GroundShadow g={g} id="ground" cx={31} cy={55} rx={20} ry={3.6} opacity={0.3} />
          {O.map((o, i) => {
            const j = (i + 1) % 6;
            return <Path key={i} d={`M${pt(o)} L${pt(O[j]!)} L${pt(T[j]!)} L${pt(T[i]!)} Z`} fill={fills[i]} stroke={fills[i]} strokeWidth={0.6} strokeLinejoin="round" />;
          })}
          <Path d={`M${T.map(pt).join(' L')} Z`} fill="#BEE8F1" />
          <Path d="M30 27 L36 26 L38 32 L33 35 Z" fill="#FFF3C4" opacity={0.85} />
          <Path d={`M${T.map(pt).join(' L')} Z ${O.map((o, i) => `M${pt(o)} L${pt(T[i]!)}`).join(' ')}`} stroke="#5D93B6" strokeWidth={0.9} strokeLinejoin="round" fill="none" opacity={0.7} />
          <Path d={`M${O.map(pt).join(' L')} Z`} stroke="#3B6A90" strokeWidth={2.2} strokeLinejoin="round" fill="none" />
          <Path d={sparkle(21, 21, 7)} fill="#FFFFFF" />
          <Circle cx={45} cy={18} r={1.3} fill="#FFFFFF" opacity={0.9} />
        </G>
      );
    },
  },
  log: {
    aspect: 200 / 70,
    viewBox: '0 0 200 70',
    draw: (uid) => {
      const g = ids(uid);
      const body = 'M22 18 C60 14 130 14 174 16 C186 17 192 28 192 40 C192 53 186 63 174 64 C130 66 64 66 26 64 C18 63 14 60 12 55 L17 50 L10 45 L15 40 L9 34 L16 29 C14 23 17 19 22 18 Z';
      const face = 'M162 40.5 A14 23.5 0 1 0 190 40.5 A14 23.5 0 1 0 162 40.5 Z';
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={100} cy={64} rx={94} ry={7} opacity={0.4} />
          <Form g={g} id="body" d={body} t={BARK} step={0.55} lw={2.4} rim={0.4} />
          <G clipPath={`url(#${g('body')})`}>
            <Path d={crease(24, 27, 80, 22, 140, 26, 0, 2.2)} fill={BARK.line} opacity={0.5} />
            <Path d={crease(40, 37, 100, 33, 160, 36, 0, 2.4)} fill={BARK.line} opacity={0.45} />
            <Path d={crease(20, 48, 70, 45, 120, 48, 0, 2.4)} fill={BARK.line} opacity={0.45} />
            <Path d={crease(110, 52, 140, 50, 168, 53, 0, 2)} fill={BARK.line} opacity={0.4} />
            <Path d={crease(30, 23, 70, 20, 118, 22, 0, 1.6)} fill={BARK.lit} opacity={0.7} />
            <Path d={crease(70, 31, 110, 29, 150, 31, 0, 1.4)} fill={BARK.lit} opacity={0.5} />
          </G>
          {/* a knot */}
          <Ellipse cx={76} cy={42} rx={6} ry={3.6} fill={BARK.shade} stroke={BARK.line} strokeWidth={1.4} />
          <Ellipse cx={75} cy={41.4} rx={2.6} ry={1.4} fill={BARK.line} />
          {/* the cut end, its rings */}
          <Form g={g} id="face" d={face} t={CUT} step={0.24} lw={3.4} rim={0.4} />
          <Path d={face} stroke={BARK.mid} strokeWidth={1.6} fill="none" opacity={0.9} />
          <Ellipse cx={176.5} cy={41} rx={9.5} ry={16} fill="none" stroke="#A8743F" strokeWidth={1.3} opacity={0.75} />
          <Ellipse cx={177} cy={41.5} rx={5.5} ry={9.5} fill="none" stroke="#A8743F" strokeWidth={1.2} opacity={0.75} />
          <Ellipse cx={177.4} cy={42} rx={1.8} ry={3} fill="#8E5F36" />
          <Path d="M178 44 L183 58" stroke={CUT.line} strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
          {/* moss along the top, and a sprout */}
          <Moss g={g} id="moss" at={[[30, 21, 6], [40, 18.5, 8], [53, 17.5, 9], [66, 18.5, 7.5], [77, 20.5, 6], [86, 22, 4.5]]} seed={21} squash={0.6} />
          <Path d="M40 21 Q40 25 38 27 M60 20 Q61 23 59 26" stroke={MOSS.mid} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          <Path d="M132 16 Q131 10 133 5" stroke="#4E7C3B" strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Sprig x={133} y={7} turn={-150} len={9} />
          <Sprig x={133} y={6} turn={-30} len={10} />
          <Path d={tuft(24, 67, 10, 21, 5)} fill={GRASS} />
          <Path d={tuft(154, 67, 9, 23, 5)} fill={GRASS_DARK} />
        </G>
      );
    },
  },
  mushroom: {
    aspect: 1,
    viewBox: '0 0 80 80',
    draw: (uid) => {
      const g = ids(uid);
      const stem: Tone = { lit: '#FFF8EC', mid: '#EFE1CB', shade: '#C4B19F', line: '#8A7462' };
      const cap: Tone = { lit: '#F27E5E', mid: '#D5503C', shade: '#A0363C', line: '#6C2128' };
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={42} cy={76} rx={34} ry={5} opacity={0.38} />
          {/* a little one beside it */}
          <Form g={g} id="stem2" d="M62 64 C62 69 61 73 60 77 C63 78 67 78 70 77 C69 73 68 69 68 64 Z" t={stem} step={0.12} lw={1.6} />
          <Form g={g} id="cap2" d="M55 66 C54 59 59 54 65 54 C71 54 76 59 75 66 C70 68 60 68 55 66 Z" t={cap} step={0.18} lw={1.8} />
          <Circle cx={62} cy={58.5} r={1.8} fill="#FFF4E4" />
          {/* the big one */}
          <Form g={g} id="stem" d="M32 44 C31 56 29 68 27 75 C35 79 46 79 53 75 C51 68 49 56 48 44 Z" t={stem} step={0.3} lw={2} />
          <Path d="M13 45 C24 51 56 51 67 45 C56 48 24 48 13 45 Z" fill="#9A6A5E" />
          <Form g={g} id="cap" d="M7 46 C5 30 18 11 40 10 C62 9 75 28 73 44 C67 50 54 52 40 52 C26 52 13 51 7 46 Z" t={cap} step={0.6} lw={2.4} rim={0.5} />
          <G clipPath={`url(#${g('cap')})`}>
            <Ellipse cx={25} cy={25} rx={6.5} ry={4.8} fill="#FFF4E4" transform="rotate(-28 25 25)" />
            <Ellipse cx={46} cy={18} rx={5} ry={3.6} fill="#FFF4E4" transform="rotate(4 46 18)" />
            <Ellipse cx={62} cy={32} rx={4} ry={3.6} fill="#F4DCCB" transform="rotate(30 62 32)" />
            <Ellipse cx={14} cy={41} rx={3.4} ry={2.6} fill="#FFF4E4" transform="rotate(-20 14 41)" />
            <Ellipse cx={39} cy={37} rx={4} ry={2.8} fill="#FBE8D8" />
          </G>
          <Path d={tuft(18, 78, 11, 31, 5)} fill={GRASS} />
          <Path d={tuft(50, 79, 9, 33, 4)} fill={GRASS_DARK} />
        </G>
      );
    },
  },
  ripple: {
    aspect: 240 / 60,
    viewBox: '0 0 240 60',
    draw: (uid) => {
      const g = ids(uid);
      const ring = (rx: number, ry: number, o: number, w: number, k: number) => (
        <G key={k}>
          <Ellipse cx={120} cy={31 + 2.4} rx={rx} ry={ry} fill="none" stroke="#2C6479" strokeWidth={w} opacity={o * 0.4} />
          <Path d={`M${120 - rx} 31 A${rx} ${ry} 0 0 0 ${120 + rx} 31`} stroke="#FFFFFF" strokeWidth={w} strokeLinecap="round" fill="none" opacity={o} />
          <Path d={`M${120 - rx} 31 A${rx} ${ry} 0 0 1 ${120 + rx} 31`} stroke="#FFFFFF" strokeWidth={w * 0.8} strokeLinecap="round" fill="none" opacity={o * 0.55} strokeDasharray={`${rx * 0.9} ${rx * 0.35}`} />
        </G>
      );
      return (
        <G>
          <Defs>
            <RadialGradient id={g('calm')} cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor="#EAF6F0" stopOpacity={0.55} />
              <Stop offset="1" stopColor="#EAF6F0" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={120} cy={31} rx={116} ry={27} fill={`url(#${g('calm')})`} />
          {ring(104, 22, 0.55, 2.4, 0)}
          {ring(70, 14.5, 0.75, 3, 1)}
          {ring(38, 8, 0.95, 3.4, 2)}
          <Ellipse cx={120} cy={31} rx={14} ry={3.4} fill="#FFFFFF" opacity={0.5} />
          <Circle cx={112} cy={26} r={2.4} fill="none" stroke="#FFFFFF" strokeWidth={1.4} opacity={0.9} />
          <Circle cx={129} cy={24} r={1.6} fill="none" stroke="#FFFFFF" strokeWidth={1.2} opacity={0.85} />
          <Circle cx={121} cy={20} r={1.1} fill="#FFFFFF" opacity={0.85} />
        </G>
      );
    },
  },
  rock_big: {
    aspect: 170 / 110,
    viewBox: '0 0 170 110',
    draw: (uid) => {
      const g = ids(uid);
      const body = 'M8 104 C4 90 8 74 18 62 L30 44 C38 32 50 22 66 16 C78 12 92 12 102 16 L120 22 C132 26 140 34 144 44 L150 52 C160 60 166 76 164 92 L162 104 Z';
      const topLine = 'M18 62 C34 50 52 42 72 38 C88 35 100 34 108 34 C124 36 138 42 150 52';
      const sideLine = 'M108 34 C114 50 118 72 120 104';
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={86} cy={104} rx={86} ry={10} opacity={0.45} />
          <Form g={g} id="body" d={body} t={STONE} step={1} lw={2.6} rim={0.22} />
          <G clipPath={`url(#${g('body')})`}>
            {/* the top plane, facing the sky; the right side turning away */}
            <Path d={`${topLine} L170 52 L170 0 L0 0 L0 62 Z`} fill="#D9D2C2" opacity={0.5} />
            <Path d="M108 34 C114 50 118 72 120 104 L170 104 L170 52 L150 52 C138 42 124 36 108 34 Z" fill={STONE.shade} opacity={0.38} />
            <Path d={topLine} stroke="#F0E9D9" strokeWidth={1.8} fill="none" opacity={0.55} strokeDasharray="34 8 50 10 40" />
            <Path d={topLine} stroke={STONE.shade} strokeWidth={4} fill="none" opacity={0.35} transform="translate(0 3.5)" />
            <Path d={sideLine} stroke={STONE.shade} strokeWidth={3} fill="none" opacity={0.4} transform="translate(2 0)" />
            {/* grain and lichen */}
            {[[40, 84, 1.4], [62, 94, 1.2], [92, 76, 1.6], [104, 92, 1.2], [140, 82, 1.3], [78, 62, 1.1], [26, 94, 1.2], [132, 66, 1.1]].map(([x, y, r], i) => (
              <Circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#E3DCCB' : STONE.line} opacity={0.45} />
            ))}
            <Ellipse cx={52} cy={76} rx={4.4} ry={2.8} fill="#C6C48A" opacity={0.75} />
            <Ellipse cx={61} cy={80} rx={2.6} ry={1.7} fill="#C6C48A" opacity={0.7} />
            <Ellipse cx={136} cy={74} rx={3} ry={2} fill="#C9B47A" opacity={0.6} />
          </G>
          <Path d="M84 40 L79 52 L85 60 L81 72" stroke={STONE.line} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M85.6 41 L81 52 L87 60" stroke="#EEE7D6" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.55} transform="translate(1.2 0.6)" />
          {/* moss on the crown */}
          <Moss g={g} id="moss" at={[[35, 51, 7], [47, 39, 10], [62, 28, 12], [80, 22, 11], [97, 21, 10], [112, 26, 7]]} seed={11} squash={0.62} />
          <Path d="M44 46 Q45 51 43 54 M70 34 Q71 38 69 41 M100 28 Q101 32 99 35" stroke={MOSS.mid} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d={tuft(14, 107, 14, 41, 6)} fill={GRASS} />
          <Path d={tuft(46, 108, 9, 42, 5)} fill={GRASS_DARK} />
          <Path d={tuft(92, 108, 11, 43, 5)} fill={GRASS} />
          <Path d={tuft(130, 107, 9, 44, 5)} fill={GRASS_DARK} />
          <Path d={tuft(160, 107, 13, 45, 6)} fill={GRASS_DARK} />
        </G>
      );
    },
  },
  rock_small: {
    aspect: 120 / 60,
    viewBox: '0 0 120 60',
    draw: (uid) => {
      const g = ids(uid);
      const stones: [string, string, string, number][] = [
        ['c', 'M94 57 L93 51 C93 46 97 43 103 43 C109 43 114 47 114 52 L113 57 Z', 'M93 50 C98 47 108 47 114 50', 0.2],
        ['b', 'M58 57 L57 48 C57 42 62 37 70 35 L82 33 C90 33 95 39 96 46 L95 57 Z', 'M57 46 C66 42 84 40 96 45', 0.34],
        ['a', 'M12 56 L10 44 C10 36 16 28 24 24 L38 20 C46 19 54 24 57 30 L61 42 L59 56 Z', 'M10 42 C24 34 44 32 61 40', 0.48],
      ];
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={62} cy={55} rx={60} ry={6.5} opacity={0.45} />
          {stones.map(([id, d, top, step]) => (
            <G key={id}>
              <Form g={g} id={id} d={d} t={STONE} step={step} lw={2.2} rim={0.25} />
              <G clipPath={`url(#${g(id)})`}>
                <Path d={`${top} L120 0 L0 0 Z`} fill="#D6CFBF" opacity={0.45} />
                <Path d={top} stroke="#EEE7D6" strokeWidth={1.4} fill="none" opacity={0.65} />
              </G>
            </G>
          ))}
          <Path d="M40 22 L37 30 L41 35" stroke={STONE.line} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Ellipse cx={22} cy={32} rx={3} ry={2} fill="#C6C48A" opacity={0.75} />
          <Form g={g} id="peb" d="M47 59 C46 56 49 54 52 54 C56 54 58 56 57 59 Z" t={STONE} step={0.08} lw={1.4} rim={0.25} />
          <Path d={tuft(8, 59, 9, 51, 4)} fill={GRASS} />
          <Path d={tuft(116, 59, 8, 53, 4)} fill={GRASS_DARK} />
        </G>
      );
    },
  },
  campfire: {
    aspect: 1,
    viewBox: '0 0 120 120',
    draw: (uid) => {
      const g = ids(uid);
      // Lit by its own flames: warm on the edges that face the fire.
      const stone: Tone = { lit: '#A08A7C', mid: '#756D6C', shade: '#4A4552', line: '#352C2E' };
      const log: Tone = { lit: '#A06A42', mid: '#734A30', shade: '#4A322C', line: '#2E1C14' };
      const backStones: [number, number, number][] = [[28, 95, 9], [46, 92, 8], [74, 92, 8], [92, 95, 9]];
      const frontStones: [number, number, number][] = [[14, 106, 11], [36, 110, 12], [60, 112, 12], [84, 110, 12], [106, 106, 11]];
      const rock = (x: number, y: number, r: number) => `M${x - r} ${y + r * 0.5} C${x - r * 1.1} ${y - r * 0.2} ${x - r * 0.5} ${y - r * 0.75} ${x + r * 0.1} ${y - r * 0.72} C${x + r * 0.7} ${y - r * 0.7} ${x + r * 1.1} ${y - r * 0.2} ${x + r} ${y + r * 0.5} Z`;
      const logD = 'M0 -6 L64 -6 C68 -6 70 -3 70 0 C70 3 68 6 64 6 L0 6 C-3 6 -5 3 -5 0 C-5 -3 -3 -6 0 -6 Z';
      return (
        <G>
          <Defs>
            <RadialGradient id={g('pool')} cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor="#FFB45A" stopOpacity={0.55} />
              <Stop offset="1" stopColor="#FFB45A" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Glow g={g} id="glow" cx={60} cy={66} r={58} color="#FFC46A" opacity={0.6} />
          <Ellipse cx={60} cy={104} rx={60} ry={15} fill={`url(#${g('pool')})`} />
          <GroundShadow g={g} id="ground" cx={60} cy={114} rx={54} ry={5} opacity={0.3} />
          {backStones.map(([x, y, r], i) => (
            <Form key={`bs${i}`} g={g} id={`bs${i}`} d={rock(x, y, r)} t={stone} step={0.18} lw={1.8} rim={0.2} />
          ))}
          {/* two logs crossed, their inner ends burning */}
          <Form g={g} id="log1" d={logD} t={log} step={0.14} lw={2} rim={0.2} transform="translate(12 96) rotate(-22)" />
          <Form g={g} id="log2" d={logD} t={log} step={0.14} lw={2} rim={0.2} transform="translate(108 96) rotate(202)" />
          {/* the logs' cut ends, and embers glowing along them */}
          <Ellipse cx={8.5} cy={97.5} rx={4} ry={6} fill="#C99A68" stroke={log.line} strokeWidth={1.6} transform="rotate(-22 8.5 97.5)" />
          <Ellipse cx={111.5} cy={97.5} rx={4} ry={6} fill="#B98A5A" stroke={log.line} strokeWidth={1.6} transform="rotate(22 111.5 97.5)" />
          <Path d="M24 88 L34 84 M86 84 L96 88" stroke="#FF8A3A" strokeWidth={1.8} strokeLinecap="round" opacity={0.85} />
          {/* the flames */}
          <Path d={flame(60, 94, 70, 20, 0)} fill="#E2502A" />
          <Path d={flame(44, 94, 42, 12, -10)} fill="#E2502A" />
          <Path d={flame(77, 94, 48, 12, 9)} fill="#E2502A" />
          <Path d={flame(60, 94, 54, 15, 3)} fill="#F58A2E" />
          <Path d={flame(48, 94, 30, 9, -6)} fill="#F58A2E" />
          <Path d={flame(73, 94, 34, 9, 6)} fill="#F58A2E" />
          <Path d={flame(60, 95, 36, 11, -2)} fill="#FFCF57" />
          <Path d={flame(60, 96, 20, 7, 1)} fill="#FFF3C2" />
          {[[44, 28, 1.6], [74, 20, 1.3], [64, 9, 1.1], [52, 16, 1], [82, 34, 1.2]].map(([x, y, r], i) => (
            <Circle key={`s${i}`} cx={x} cy={y} r={r} fill="#FFD27A" opacity={0.9} />
          ))}
          {frontStones.map(([x, y, r], i) => (
            <G key={`fs${i}`}>
              <Form g={g} id={`fs${i}`} d={rock(x, y, r)} t={stone} step={0.22} lw={2} rim={0.2} />
              <Path d={`M${x - r * 0.7} ${y - r * 0.3} C${x - r * 0.3} ${y - r * 0.72} ${x + r * 0.3} ${y - r * 0.72} ${x + r * 0.7} ${y - r * 0.3}`} stroke="#FFAE62" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.9} />
            </G>
          ))}
        </G>
      );
    },
  },
  puddle: {
    aspect: 200 / 50,
    viewBox: '0 0 200 50',
    draw: (uid) => {
      const g = ids(uid);
      const mud = blob(100, 28, 94, { seed: 31, lobes: 4, lobe: 0.05, wobble: 0.06, squash: 0.22 });
      const water = blob(100, 27, 80, { seed: 33, lobes: 5, lobe: 0.05, wobble: 0.05, squash: 0.2 });
      return (
        <G>
          <Defs>
            <LinearGradient id={g('sky')} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#E6F2EC" />
              <Stop offset="0.45" stopColor="#A9CDD0" />
              <Stop offset="1" stopColor="#6893A6" />
            </LinearGradient>
          </Defs>
          <Path d={mud} fill="#6E5540" />
          <Path d={mud} fill="none" stroke="#9C7F5E" strokeWidth={2} opacity={0.6} transform="translate(0 1.5)" />
          <Path d={water} fill={`url(#${g('sky')})`} />
          {/* the far edge reflected, dark under the rim */}
          <G clipPath={`url(#${g('w')})`}>
            <Path d="M0 0 L200 0 L200 14 C150 18 50 18 0 14 Z" fill="#4C6B4E" opacity={0.45} />
          </G>
          <Defs>
            <ClipPath id={g('w')}>
              <Path d={water} />
            </ClipPath>
          </Defs>
          <Path d={water} fill="none" stroke="#4F3A2A" strokeWidth={2} />
          <Path d="M56 22 Q74 18.5 94 21.5" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.85} />
          <Path d="M118 31 Q130 29 144 31" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.7} />
          <Leaf x={146} y={24} turn={-14} len={14} color={AUTUMN[2]!} />
          <Form g={g} id="p1" d="M22 40 C21 36 25 33 29 34 C33 35 34 38 33 41 Z" t={STONE} step={0.1} lw={1.4} rim={0.3} />
          <Form g={g} id="p2" d="M170 44 C169 40 173 38 177 39 C180 40 181 43 180 45 Z" t={STONE} step={0.1} lw={1.4} rim={0.3} />
        </G>
      );
    },
  },
  pouch: {
    aspect: 1,
    viewBox: '0 0 60 60',
    draw: (uid) => {
      const g = ids(uid);
      const leather: Tone = { lit: '#DCA86C', mid: '#B07E45', shade: '#7D5535', line: '#543220' };
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={31} cy={56} rx={24} ry={4} opacity={0.4} />
          <Form g={g} id="sack" d="M17 28 C9 36 8 49 15 55 C23 60 38 60 46 55 C53 49 52 36 44 28 Z" t={leather} step={0.4} lw={2.2} rim={0.45} />
          <Path d="M21 33 Q18 39 19 45 M29 34 Q28 38 29 42 M39 33 Q42 39 41 45" stroke={leather.shade} strokeWidth={1.7} strokeLinecap="round" fill="none" opacity={0.85} />
          <Path d="M14 26 C20 22 40 22 47 26 C44 30 18 30 14 26 Z" fill="#4A2C1C" />
          <Berry x={23} y={22} r={6} />
          <Berry x={37} y={21} r={6} />
          <Berry x={30} y={14} r={5.5} />
          <Sprig x={34} y={11} turn={-35} len={10} />
          <Path d="M14 26 C18 31 42 31 47 26" stroke={leather.line} strokeWidth={2.2} strokeLinecap="round" fill={leather.mid} />
          {/* the drawstring, tied off */}
          <Path d="M15 31 C22 34 38 34 46 31" stroke="#E9D3A8" strokeWidth={2} strokeLinecap="round" fill="none" />
          <Path d="M43 32 C46 36 46 40 44 44 M45 32 C49 35 51 38 51 42" stroke="#E9D3A8" strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Circle cx={44} cy={44.5} r={1.6} fill="#E9D3A8" />
          <Circle cx={51} cy={42.5} r={1.6} fill="#E9D3A8" />
        </G>
      );
    },
  },
  bowl: {
    aspect: 120 / 130,
    viewBox: '0 0 120 130',
    draw: (uid) => {
      const g = ids(uid);
      const clay: Tone = { lit: '#FFF9EE', mid: '#EDE0CA', shade: '#BFAE9A', line: '#8A7866' };
      const leg = (x: number) => `M${x - 5} 70 L${x + 5} 70 L${x + 4} 96 C${x + 6} 99 ${x + 6} 104 ${x + 4} 107 L${x + 3.4} 126 L${x - 3.4} 126 L${x - 4} 107 C${x - 6} 104 ${x - 6} 99 ${x - 4} 96 Z`;
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={60} cy={125} rx={56} ry={6} opacity={0.4} />
          {/* a small side table */}
          <Path d="M57 70 L63 70 L62.4 122 L57.6 122 Z" fill={WOOD.shade} stroke={WOOD.line} strokeWidth={1.4} />
          <Form g={g} id="legL" d={leg(20)} t={WOOD} step={0.18} lw={1.8} rim={0.35} />
          <Form g={g} id="legR" d={leg(100)} t={WOOD} step={0.18} lw={1.8} rim={0.3} />
          <Path d="M24 104 L96 104 L96 109 L24 109 Z" fill={WOOD.mid} stroke={WOOD.line} strokeWidth={1.4} />
          <Path d="M25 104.8 L95 104.8" stroke={WOOD.lit} strokeWidth={1} opacity={0.7} />
          <Path d="M13 68 L107 68 L105 76 L15 76 Z" fill={WOOD.shade} stroke={WOOD.line} strokeWidth={1.6} strokeLinejoin="round" />
          <Form g={g} id="top" d="M4 60 L116 60 C117 60 118 61 118 62 L118 67 C118 68 117 69 116 69 L4 69 C3 69 2 68 2 67 L2 62 C2 61 3 60 4 60 Z" t={WOOD} step={0.28} lw={1.8} rim={0.4} />
          <Path d="M10 52 L110 52 L117 60.5 L3 60.5 Z" fill={WOOD.lit} stroke={WOOD.line} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M20 55 L60 55 M70 57.5 L104 57.5" stroke={WOOD.mid} strokeWidth={1} strokeLinecap="round" opacity={0.6} />
          {/* the bowl, heaped with sunberries */}
          <Ellipse cx={60} cy={56} rx={28} ry={3.4} fill={WOOD.line} opacity={0.35} />
          <Form g={g} id="bowl" d="M26 38 C28 50 42 57 60 57 C78 57 92 50 94 38 Z" t={clay} step={0.42} lw={2} rim={0.5} />
          <Path d="M30 46 C40 51 80 51 90 46 L88.4 49.6 C78 54 42 54 31.6 49.6 Z" fill="#5E8FB8" opacity={0.9} />
          <Ellipse cx={60} cy={38} rx={34} ry={5} fill="#7A5B45" stroke={clay.line} strokeWidth={1.8} />
          <Berry x={36} y={36} r={7} />
          <Berry x={84} y={36} r={7} />
          <Berry x={48} y={33} r={7.5} />
          <Berry x={72} y={33} r={7.5} />
          <Berry x={60} y={35} r={7.5} />
          <Berry x={54} y={23} r={7} />
          <Berry x={68} y={24} r={7} />
          <Berry x={61} y={13} r={6.5} />
          <Sprig x={66} y={9} turn={-30} len={13} />
          <Sprig x={44} y={24} turn={-160} len={11} />
          <Path d="M26 38 C30 43 90 43 94 38" stroke={clay.line} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Path d="M28 38.6 C34 42 86 42 92 38.6" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.7} />
        </G>
      );
    },
  },
  well: {
    aspect: 120 / 150,
    viewBox: '0 0 120 150',
    draw: (uid) => {
      const g = ids(uid);
      const roof: Tone = { lit: '#C66E50', mid: '#9E4C3B', shade: '#6E3436', line: '#4A2020' };
      const wall = 'M8 98 C8 108 8 132 10 141 C30 149 90 149 110 141 C112 132 112 108 112 98 C100 106 20 106 8 98 Z';
      const rows = [108, 119, 130, 141];
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={60} cy={145} rx={58} ry={6.5} opacity={0.42} />
          {/* posts and roof */}
          <Form g={g} id="postL" d="M13 12 L22 12 L22 104 L13 104 Z" t={WOOD} step={0.18} lw={1.8} rim={0.4} />
          <Form g={g} id="postR" d="M98 12 L107 12 L107 104 L98 104 Z" t={WOOD} step={0.18} lw={1.8} rim={0.3} />
          <Path d="M7 31 L113 31 L111 36 L9 36 Z" fill={roof.line} opacity={0.9} />
          <Form g={g} id="roof" d="M3 31 L19 4 C40 2 80 2 101 4 L117 31 C80 34 40 34 3 31 Z" t={roof} step={0.5} lw={2} rim={0.45} />
          <G clipPath={`url(#${g('roof')})`}>
            {[11, 18, 25].map((y, i) => (
              <Path key={y} d={Array.from({ length: 12 }, (_, k) => `M${-4 + k * 11 + (i % 2) * 5.5} ${y} q5.5 ${4} 11 0`).join(' ')} stroke={roof.line} strokeWidth={1.3} fill="none" opacity={0.55} />
            ))}
          </G>
          <Path d="M17 4.5 C40 2 80 2 103 4.5" stroke={roof.line} strokeWidth={4} strokeLinecap="round" fill="none" />
          {/* the windlass, its rope and the bucket */}
          <Form g={g} id="bar" d="M20 43 L100 43 L100 51 L20 51 Z" t={WOOD} step={0.14} lw={1.6} rim={0.4} />
          <Path d="M50 43 L50 51 M54 43 L54 51 M58 43 L58 51 M62 43 L62 51 M66 43 L66 51" stroke="#D9BC85" strokeWidth={2.4} />
          <Path d="M100 47 L110 47 L110 60" stroke={WOOD.line} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M100 47 L110 47 L110 60" stroke={WOOD.lit} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M60 51 L60 70" stroke="#C9A66B" strokeWidth={1.6} />
          <Path d="M52 72 Q60 64 68 72" stroke="#5E5A5A" strokeWidth={1.4} fill="none" />
          <Form g={g} id="bucket" d="M50 72 L70 72 L68 88 L52 88 Z" t={WOOD} step={0.14} lw={1.6} rim={0.4} />
          <Path d="M50.6 76 L69.4 76 M51.6 84 L68.4 84" stroke="#5E5A5A" strokeWidth={1.6} />
          {/* the stone wall */}
          <Form g={g} id="wall" d={wall} t={STONE} step={0.8} lw={2.2} rim={0.35} />
          <G clipPath={`url(#${g('wall')})`}>
            {rows.map((y, r) => (
              <G key={y}>
                <Path d={`M4 ${y - 4} Q60 ${y + 6} 116 ${y - 4}`} stroke={STONE.line} strokeWidth={1.4} fill="none" opacity={0.7} />
                <Path d={`M4 ${y - 2.4} Q60 ${y + 7.6} 116 ${y - 2.4}`} stroke="#EDE6D6" strokeWidth={1.1} fill="none" opacity={0.45} />
                {Array.from({ length: 6 }, (_, k) => {
                  const x = 14 + k * 19 + (r % 2) * 9.5;
                  const yy = y - 4 + 10 * (1 - ((x - 60) / 56) ** 2) * 0.5;
                  return <Path key={k} d={`M${x} ${yy - 10} L${x} ${yy}`} stroke={STONE.line} strokeWidth={1.4} opacity={0.7} />;
                })}
              </G>
            ))}
          </G>
          {/* the rim and the dark water down inside */}
          <Form g={g} id="rim" d="M6 98 C6 91 30 88 60 88 C90 88 114 91 114 98 C114 105 90 108 60 108 C30 108 6 105 6 98 Z" t={STONE} step={0.3} lw={2.2} rim={0.5} />
          <Path d="M16 97 C16 93 36 91 60 91 C84 91 104 93 104 97 C104 101 84 103 60 103 C36 103 16 101 16 97 Z" fill="#2E4652" stroke={STONE.line} strokeWidth={1.4} />
          <Path d="M30 98.5 C44 101 76 101 90 98.5" stroke="#8FB6C4" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.7} />
          <Moss g={g} id="moss" at={[[12, 99, 4.5], [20, 96, 5], [29, 96, 4]]} seed={31} />
          <Path d="M16 102 Q16 108 14 112 M26 101 Q27 105 25 108" stroke={MOSS.mid} strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <Path d={tuft(10, 146, 13, 61, 6)} fill={GRASS} />
          <Path d={tuft(108, 145, 12, 63, 6)} fill={GRASS_DARK} />
        </G>
      );
    },
  },
  pinecone: {
    aspect: 60 / 70,
    viewBox: '0 0 60 70',
    draw: (uid) => {
      const g = ids(uid);
      const lit = '#C38A57';
      const shade = '#5C3B2C';
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={31} cy={66} rx={22} ry={4} opacity={0.4} />
          <G transform="rotate(12 30 40)">
            <Path d="M30 14 L31 5" stroke="#4A2E1E" strokeWidth={4} strokeLinecap="round" />
            <Path d="M30 14 L31 5" stroke="#8A5A34" strokeWidth={1.6} strokeLinecap="round" />
            <Ellipse cx={30} cy={40} rx={18} ry={26} fill="#4A2E1E" />
            {PINE_ROWS.map(([y, hw, n], r) =>
              Array.from({ length: n }, (_, i) => {
                const x = 30 - hw + (2 * hw * (i + 0.5)) / n;
                const s = (hw / n) * 1.15 + 1.5;
                // scales on the upper left catch the light; lower right sink into shade
                const t = Math.min(1, Math.max(0, (x - 12) / 36) * 0.7 + (y / 66) * 0.45);
                const c = mix(lit, shade, t);
                return (
                  <G key={`${r}-${i}`}>
                    <Path d={`M${x - s} ${y - 4} Q${x - s} ${y + 5} ${x} ${y + 6} Q${x + s} ${y + 5} ${x + s} ${y - 4} Z`} fill={c} stroke="#3E2416" strokeWidth={1.2} />
                    <Path d={`M${x - s * 0.55} ${y + 2.6} Q${x} ${y + 5} ${x + s * 0.55} ${y + 2.6}`} stroke={mix('#F0C48A', c, 0.25 + t * 0.4)} strokeWidth={1.5} strokeLinecap="round" fill="none" />
                  </G>
                );
              }),
            )}
          </G>
        </G>
      );
    },
  },
  dirtwall: {
    aspect: 200 / 110,
    viewBox: '0 0 200 110',
    draw: (uid) => {
      const g = ids(uid);
      // Packed earth that has just shoved its way up out of the ground: torn
      // turf on top, clods breaking off, dirt spilled round its foot.
      const dirt: Tone = { lit: '#B88A5B', mid: '#926845', shade: '#664A3F', line: '#45301F' };
      const turf: Tone = { lit: '#8DBA5A', mid: '#5E9549', shade: '#3D6B41', line: '#2A4A2C' };
      const body = 'M7 106 C8 90 10 70 13 54 L16 41 C18 35 24 31 31 32 L45 30 C51 26 59 24 67 27 L81 26 C89 22 99 21 107 24 L123 22 C131 19 141 20 149 25 L163 27 C173 28 182 32 186 40 L189 54 C191 72 192 90 194 106 Z';
      const turfs = [
        'M14 44 C16 35 23 31 31 32 L45 30 C51 26 59 24 67 27 L72 27 C70 33 64 34 60 37 C54 35 50 39 44 38 C38 41 32 38 26 42 C21 44 17 46 14 44 Z',
        'M99 22 C103 21 105 23 107 24 L123 22 C131 19 141 20 149 25 L154 26 C152 31 146 31 142 34 C136 31 130 35 124 33 C118 35 112 32 106 33 C101 30 99 26 99 22 Z',
        'M165 28 C172 28 180 31 185 38 C181 40 176 38 172 40 C168 37 165 33 165 28 Z',
      ];
      const clods: [number, number, number][] = [[80, 27, 6], [91, 24, 5.5], [158, 27, 4.5]];
      const stones: [number, number, number][] = [[46, 70, 7], [156, 64, 5.5], [138, 92, 8], [78, 94, 5.5], [104, 70, 4]];
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={100} cy={105} rx={100} ry={8} opacity={0.42} />
          <Form g={g} id="body" d={body} t={dirt} step={1} lw={2.4} rim={0.3} />
          <G clipPath={`url(#${g('body')})`}>
            <Path d="M0 60 C40 54 80 62 120 58 C150 55 180 60 200 58 L200 64 C180 66 150 61 120 64 C80 68 40 60 0 66 Z" fill={dirt.lit} opacity={0.3} />
            <Path d="M0 82 C40 78 90 86 130 81 C160 78 186 84 200 82 L200 88 C186 90 160 85 130 88 C90 92 40 85 0 89 Z" fill={dirt.shade} opacity={0.45} />
            <Path d={crease(60, 40, 64, 56, 58, 70, 3)} fill={dirt.shade} opacity={0.7} />
            <Path d={crease(150, 36, 146, 52, 152, 66, -3)} fill={dirt.shade} opacity={0.6} />
            {[[30, 58], [62, 84], [120, 52], [170, 76], [94, 60], [148, 98], [24, 92], [182, 60]].map(([x, y], i) => (
              <Circle key={i} cx={x} cy={y} r={1.6} fill={dirt.line} opacity={0.55} />
            ))}
          </G>
          {stones.map(([x, y, r], i) => (
            <Form key={i} g={g} id={`st${i}`} d={blob(x, y, r, { seed: 70 + i, lobes: 3, lobe: 0.1, squash: 0.72 })} t={STONE} step={r / 40} lw={1.5} rim={0.3} />
          ))}
          {/* roots torn through */}
          <Path d="M122 34 Q128 46 120 58 Q115 66 121 76" stroke={dirt.line} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          <Path d="M122 34 Q127 46 119.4 58" stroke="#C49A70" strokeWidth={0.9} strokeLinecap="round" fill="none" opacity={0.8} transform="translate(-0.8 -0.4)" />
          <Path d="M36 40 Q32 48 36 56 M36 48 Q40 52 39 56" stroke={dirt.line} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          {/* clods on the bare top, and torn turf */}
          {clods.map(([x, y, r], i) => (
            <Form key={`c${i}`} g={g} id={`clod${i}`} d={blob(x, y, r, { seed: 90 + i, lobes: 4, lobe: 0.18, squash: 0.8 })} t={dirt} step={r / 30} lw={1.6} rim={0.4} />
          ))}
          {turfs.map((d, i) => (
            <Form key={`t${i}`} g={g} id={`turf${i}`} d={d} t={turf} step={0.3} lw={1.8} rim={0.35} />
          ))}
          {[[18, 42, 10], [30, 37, 12], [42, 35, 9], [56, 32, 12], [66, 31, 9], [106, 30, 11], [118, 29, 13], [132, 29, 10], [146, 27, 12], [170, 35, 9], [180, 38, 8]].map(([x, y, h], i) => (
            <Path key={`g${i}`} d={tuft(x!, y!, h!, 80 + i, 6)} fill={i % 3 === 0 ? turf.lit : i % 3 === 1 ? turf.mid : turf.shade} />
          ))}
          <Path d={blade(26, 43, -7, -2, 1.8)} fill={turf.mid} />
          <Path d={blade(124, 33, -8, 2, 1.8)} fill={turf.mid} />
          <Path d={blade(144, 33, -6, -1, 1.6)} fill={turf.shade} />
          {/* crumbs tumbling off, and dirt spilled round its foot */}
          <Form g={g} id="spillL" d="M0 108 C4 103 11 101 18 103 C21 104 24 106 26 108 Z" t={dirt} step={0.15} lw={1.6} rim={0.3} />
          <Form g={g} id="spillR" d="M174 108 C177 104 184 102 191 103 C195 104 198 106 200 108 Z" t={dirt} step={0.15} lw={1.6} rim={0.3} />
          {[[4, 78, 2.2], [8, 90, 1.6], [196, 72, 2], [193, 86, 1.6], [86, 16, 1.4], [96, 12, 1.2]].map(([x, y, r], i) => (
            <Circle key={`k${i}`} cx={x} cy={y} r={r} fill={dirt.mid} stroke={dirt.line} strokeWidth={0.8} />
          ))}
        </G>
      );
    },
  },
  leafpile: {
    aspect: 180 / 70,
    viewBox: '0 0 180 70',
    draw: (uid) => {
      const g = ids(uid);
      const mound: Tone = { lit: '#C77A3E', mid: '#9A5229', shade: '#6A3428', line: '#472218' };
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={90} cy={65} rx={88} ry={7} opacity={0.42} />
          <Form g={g} id="mound" d="M4 66 C10 48 30 32 56 26 C76 20 104 18 126 25 C152 32 170 48 176 66 Z" t={mound} step={0.7} lw={2.2} rim={0.35} />
          {LEAF_PILE_UNDER.map(([x, y, t, l], i) => (
            <Leaf key={`u${i}`} x={x} y={y} turn={t} len={l} color={AUTUMN[(i + 3) % AUTUMN.length]!} dim={0.18 + Math.max(0, (x - 90) / 90) * 0.25} />
          ))}
          {LEAF_PILE.map(([x, y, t, l], i) => (
            <Leaf key={i} x={x} y={y} turn={t} len={l + 2} color={AUTUMN[i % AUTUMN.length]!} dim={Math.max(0, (x - 90) / 90) * 0.3 + (y > 58 ? 0.05 : 0)} />
          ))}
          <Path d="M4 66 C10 48 30 32 56 26" stroke="#FFE6B0" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.35} />
        </G>
      );
    },
  },
  pit: {
    aspect: 200 / 60,
    viewBox: '0 0 200 60',
    draw: (uid) => {
      const g = ids(uid);
      const ring = blob(100, 32, 96, { seed: 61, lobes: 5, lobe: 0.04, wobble: 0.05, squash: 0.28 });
      const hole = blob(100, 34, 80, { seed: 63, lobes: 6, lobe: 0.04, wobble: 0.05, squash: 0.25 });
      return (
        <G>
          <Defs>
            <RadialGradient id={g('deep')} cx="0.5" cy="0.62" r="0.6">
              <Stop offset="0" stopColor="#120C10" />
              <Stop offset="0.7" stopColor="#24180F" />
              <Stop offset="1" stopColor="#3B2718" />
            </RadialGradient>
            <LinearGradient id={g('wall')} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#3A281D" />
              <Stop offset="0.55" stopColor="#5E412C" />
              <Stop offset="1" stopColor="#8A6240" />
            </LinearGradient>
            <ClipPath id={g('hole')}>
              <Path d={hole} />
            </ClipPath>
          </Defs>
          <Path d={ring} fill="#7A5538" />
          <Path d={ring} fill="none" stroke="#A47E58" strokeWidth={3} opacity={0.55} transform="translate(-1.5 -1.5)" />
          <Path d={hole} fill={`url(#${g('deep')})`} />
          <G clipPath={`url(#${g('hole')})`}>
            {/* the far wall, lit on the right where the light falls in */}
            <Path d="M10 34 Q100 2 190 34 Q100 22 10 34 Z" fill={`url(#${g('wall')})`} />
            <Path d="M70 16 Q72 24 68 30 M120 14 Q118 22 123 28 M146 18 Q150 24 147 30" stroke="#3B2418" strokeWidth={1.8} strokeLinecap="round" fill="none" />
          </G>
          <Path d={hole} fill="none" stroke="#2E1C12" strokeWidth={2} />
          <Path d="M40 52 Q100 64 162 52" stroke="#B08860" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.7} />
          {/* broken sticks and leaves round the rim */}
          <Path d="M28 22 L52 30 M150 28 L176 20" stroke="#4A2E1E" strokeWidth={3.6} strokeLinecap="round" />
          <Path d="M28 21 L52 29 M150 27 L176 19" stroke="#9C6E46" strokeWidth={1.4} strokeLinecap="round" />
          {PIT_RIM.map(([x, y, t, l], i) => (
            <Leaf key={i} x={x} y={y} turn={t} len={l} color={AUTUMN[(i + 2) % AUTUMN.length]!} dim={Math.max(0, (x - 100) / 100) * 0.25} />
          ))}
        </G>
      );
    },
  },
  standing_stone: {
    aspect: 100 / 220,
    viewBox: '0 0 100 220',
    draw: (uid) => {
      const g = ids(uid);
      const rock: Tone = { lit: '#6F7B73', mid: '#535E5B', shade: '#363F4A', line: '#242A28' };
      const body = 'M18 214 C15 184 13 150 14 120 C14 86 15 54 22 30 C27 16 38 8 54 8 C70 9 79 20 83 36 C89 64 89 102 86 140 C85 166 84 192 85 214 Z';
      return (
        <G>
          <GroundShadow g={g} id="ground" cx={51} cy={214} rx={50} ry={7} opacity={0.42} />
          <Form g={g} id="body" d={body} t={rock} step={0.85} lw={2.4} rim={0.18} />
          <G clipPath={`url(#${g('body')})`}>
            {/* weathered patches, lighter and darker */}
            <Path d={blob(36, 70, 16, { seed: 140, lobes: 4, lobe: 0.15, squash: 1.4 })} fill="#C2C8BA" opacity={0.25} />
            <Path d={blob(30, 170, 14, { seed: 141, lobes: 4, lobe: 0.15, squash: 1.2 })} fill="#C2C8BA" opacity={0.2} />
            <Path d={blob(60, 134, 12, { seed: 142, lobes: 4, lobe: 0.15, squash: 1.3 })} fill={rock.shade} opacity={0.2} />
            {/* its right side turns away from the light */}
            <Path d="M72 12 C80 26 84 52 86 80 C88 120 86 170 85 214 L75 214 C77 170 78 120 77 84 C76 52 75 30 72 12 Z" fill={rock.shade} opacity={0.5} />
            <Path d="M72 12 C75 30 77 52 77 84 C78 120 77 170 75 214" stroke="#D9DDD0" strokeWidth={1.2} fill="none" opacity={0.45} />
            {/* weathering: a chip, a crack, lichen */}
            <Path d={crease(16, 96, 22, 104, 17, 112, 3)} fill={rock.shade} opacity={0.6} />
            <Path d="M24 196 L30 186 L28 176" stroke={rock.line} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.7} />
            {[[26, 46, 2.4], [70, 58, 2], [22, 166, 2.6], [74, 120, 1.8], [66, 196, 2.2], [30, 128, 1.6]].map(([x, y, r], i) => (
              <Circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 1 ? '#D9A85A' : '#CCD194'} opacity={0.7} />
            ))}
          </G>
          {/* carved marks: letters nobody at the Lodge can read */}
          {GLYPHS.map((d, i) => (
            <Carved key={i} d={d} width={2.7} />
          ))}
          {/* a small round creature carved near the foot, a name beneath it */}
          <Carved d={CARVED_CREATURE} width={2.5} />
          <Circle cx={45} cy={152} r={1.9} fill="#2F3733" opacity={0.65} />
          <Circle cx={55} cy={152} r={1.9} fill="#2F3733" opacity={0.65} />
          <Carved d={CARVED_NAME} width={2.3} strength={0.85} />
          {/* moss: a cap on the crown, clumps down the side, a cushion at the foot */}
          <Moss g={g} id="cap" at={[[27, 31, 6], [35, 21, 9], [50, 15, 11], [65, 15, 10], [76, 24, 8], [81, 33, 5]]} seed={51} squash={0.72} />
          <Path d="M36 30 Q38 37 35 41 M60 22 Q62 29 59 33 M74 30 Q76 34 74 37" stroke={MOSS.mid} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Moss g={g} id="side" at={[[16.5, 127, 3.6], [16, 133, 2.8]]} seed={61} squash={0.9} />
          <Moss g={g} id="side2" at={[[85, 97, 2.6]]} seed={71} squash={0.9} />
          <Moss g={g} id="foot" at={[[18, 212, 7], [32, 208, 8], [48, 209, 8], [63, 208, 7.5], [78, 211, 7]]} seed={81} squash={0.7} />
          <Path d={tuft(14, 216, 12, 101, 6)} fill={GRASS} />
          <Path d={tuft(88, 216, 11, 103, 6)} fill={GRASS_DARK} />
        </G>
      );
    },
  },
  glowshroom: {
    aspect: 90 / 80,
    viewBox: '0 0 90 80',
    draw: (uid) => {
      const g = ids(uid);
      const stem: Tone = { lit: '#F6FFFC', mid: '#D8EFE8', shade: '#9CCAC0', line: '#4F8E86' };
      const moss: Tone = { lit: '#7FBF98', mid: '#4C8460', shade: '#2E5640', line: '#1F3D2E' };
      const cap = (x: number, y: number, r: number, h: number) => `M${x - r} ${y} C${x - r} ${y - h * 0.8} ${x - r * 0.5} ${y - h} ${x} ${y - h} C${x + r * 0.5} ${y - h} ${x + r} ${y - h * 0.8} ${x + r} ${y} C${x + r * 0.5} ${y + 4} ${x - r * 0.5} ${y + 4} ${x - r} ${y} Z`;
      const gills = (x: number, y: number, r: number) => `M${x - r + 1} ${y} C${x - r * 0.5} ${y + 4.5} ${x + r * 0.5} ${y + 4.5} ${x + r - 1} ${y} C${x + r * 0.5} ${y + 2} ${x - r * 0.5} ${y + 2} ${x - r + 1} ${y} Z`;
      const caps: [number, number, number, number][] = [
        [24, 48, 16, 20],
        [68, 58, 12, 15],
        [46, 32, 22, 26],
      ];
      return (
        <G>
          <Defs>
            <RadialGradient id={g('cap')} cx="0.42" cy="0.25" r="0.8">
              <Stop offset="0" stopColor="#FAFFFD" />
              <Stop offset="0.45" stopColor="#B4F3E4" />
              <Stop offset="1" stopColor="#4FB8A4" />
            </RadialGradient>
            <RadialGradient id={g('pool')} cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor="#A8FFEA" stopOpacity={0.5} />
              <Stop offset="1" stopColor="#A8FFEA" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Glow g={g} id="glow" cx={45} cy={40} r={44} color="#B8FFF0" opacity={0.65} />
          <Ellipse cx={45} cy={74} rx={44} ry={8} fill={`url(#${g('pool')})`} />
          <GroundShadow g={g} id="ground" cx={46} cy={78} rx={40} ry={3} opacity={0.3} />
          {/* stems */}
          <Form g={g} id="s1" d="M20 46 C21 56 20 66 18 76 L28 76 C27 66 27 56 28 46 Z" t={stem} step={0.12} lw={1.5} rim={0.3} />
          <Form g={g} id="s3" d="M65 56 C65 62 64 69 63 76 L71 76 C70 69 70 62 71 56 Z" t={stem} step={0.1} lw={1.5} rim={0.3} />
          <Form g={g} id="s2" d="M41 30 C42 44 41 60 39 76 L52 76 C51 60 50 44 51 30 Z" t={stem} step={0.15} lw={1.6} rim={0.3} />
          {/* caps, glowing from inside, their gills brightest of all */}
          {caps.map(([x, y, r, h], i) => (
            <G key={i}>
              <Path d={gills(x, y, r)} fill="#EFFFFA" />
              <Path d={cap(x, y, r, h)} fill={`url(#${g('cap')})`} stroke="#3E9E8E" strokeWidth={1.6} strokeLinejoin="round" />
              <Path d={`M${x - r * 0.62} ${y - h * 0.5} C${x - r * 0.5} ${y - h * 0.82} ${x - r * 0.15} ${y - h * 0.92} ${x + r * 0.1} ${y - h * 0.92}`} stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.85} />
              <Circle cx={x + r * 0.35} cy={y - h * 0.5} r={r * 0.11} fill="#FFFFFF" opacity={0.85} />
              <Circle cx={x - r * 0.1} cy={y - h * 0.3} r={r * 0.08} fill="#FFFFFF" opacity={0.75} />
            </G>
          ))}
          {/* a cushion of moss at their feet, lit from above by them */}
          <Form g={g} id="moss" d="M4 79 C7 72 16 68 26 70 C34 65 48 65 56 69 C66 67 80 70 86 79 Z" t={moss} step={0.28} lw={1.6} rim={0.3} />
          <Path d="M14 72 C24 69 34 68 44 68 C56 68 68 70 78 74" stroke="#9FF2D8" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.6} />
          {[[12, 22, 1.6], [80, 34, 1.8], [62, 8, 1.3], [30, 14, 1.1], [74, 18, 1]].map(([x, y, r], i) => (
            <G key={`m${i}`}>
              <Circle cx={x} cy={y} r={r! * 2.6} fill="#CFFFF4" opacity={0.25} />
              <Circle cx={x} cy={y} r={r} fill="#E8FFFA" />
            </G>
          ))}
        </G>
      );
    },
  },
};

export function PropArt({ art, width }: { art: string; width: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const p = PROPS[art];
  if (!p) return null;
  return (
    <Svg width={width} height={width / p.aspect} viewBox={p.viewBox}>
      {p.draw(uid)}
    </Svg>
  );
}
