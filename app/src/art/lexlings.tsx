import { useId } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';
import { GroundShadow, Shaded, blob } from './paint';

/**
 * The Lexlings of Whisperwood, drawn in code and painted like Milo
 * (docs/art-direction.md): each form in two tones of shade under a light
 * from the upper left, a rim of light, an outline in a darker, warmer
 * version of its own colour, and a soft shadow on the ground.
 *
 * Each faces right with its feet on the bottom edge; scenes flip them.
 * Moods are a small set per species (bible §52: 3-6 expressions for a minor
 * creature): idle, happy, angry, hurt, scared, confused, sad, plus "blazing"
 * for a fire Lexling whose flames were fanned. Moods must stay easy to tell
 * apart at a glance: the player reads what a creature feels from them.
 */
export type LexlingMood = 'idle' | 'happy' | 'angry' | 'hurt' | 'scared' | 'confused' | 'blazing' | 'sad';

type Ids = (n: string) => string;
/** Lit, mid, shade and outline colours of one painted form. */
type Tones = [lit: string, mid: string, shade: string, line: string];

const EYE = '#2A2236';
const BLUSH = '#F59BAE';

const f1 = (n: number) => Math.round(n * 10) / 10;

function useIds(): Ids {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (n: string) => `${n}${uid}`;
}

/**
 * A form painted with the shared two-tone shading in the given tones.
 * `glint` swaps the kit's broad white rim for a thin rim of warm light, which
 * suits saturated or dark forms (a broad white rim turns them chalky).
 */
function Paint({ g, id, d, t, w = 2.4, step = 1, rim = 0.5, glint, transform }: { g: Ids; id: string; d: string; t: Tones; w?: number; step?: number; rim?: number; glint?: [string, number]; transform?: string }) {
  if (!glint) return <Shaded g={g} id={id} d={d} lit={t[0]} mid={t[1]} shade={t[2]} line={t[3]} lineWidth={w} step={step} rim={rim} transform={transform} />;
  return (
    <G transform={transform}>
      <Shaded g={g} id={id} d={d} lit={t[0]} mid={t[1]} shade={t[2]} step={step} rim={0} />
      <Defs>
        <ClipPath id={g(`${id}-glint`)}>
          <Path d={d} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${g(`${id}-glint`)})`}>
        <Path d={d} stroke={glint[0]} strokeWidth={4.5 * step} fill="none" opacity={glint[1]} transform={`translate(${f1(2.6 * step)} ${f1(2.6 * step)})`} />
      </G>
      <Path d={d} stroke={t[3]} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" fill="none" />
    </G>
  );
}

/**
 * A fringe of fur along a path from (x1, y1) to (x2, y2): n soft scallops
 * bulging `depth` outward (to the left of the direction of travel, which is
 * outside for an outline drawn clockwise). Appends to a path already at (x1, y1).
 */
function fringe(x1: number, y1: number, x2: number, y2: number, n: number, depth: number): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = ((y2 - y1) / len) * depth;
  const ny = (-(x2 - x1) / len) * depth;
  let d = '';
  for (let i = 1; i <= n; i++) {
    const ax = x1 + ((x2 - x1) * (i - 0.5)) / n + nx;
    const ay = y1 + ((y2 - y1) * (i - 0.5)) / n + ny;
    d += ` Q${f1(ax)} ${f1(ay)} ${f1(x1 + ((x2 - x1) * i) / n)} ${f1(y1 + ((y2 - y1) * i) / n)}`;
  }
  return d;
}

/** An oval with soft tufts at the given angles (radians, 0 points right, y down): [angle, spread, size, frequency]. */
function furry(cx: number, cy: number, rx: number, ry: number, tufts: [number, number, number, number][], steps = 120): string {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI * 2;
    let fluff = 0;
    for (const [at, spread, amp, n] of tufts) {
      const dd = Math.atan2(Math.sin(th - at), Math.cos(th - at));
      fluff += amp * Math.max(0, 1 - Math.abs(dd) / spread) * Math.abs(Math.sin(dd * n));
    }
    d += `${i ? ' L' : 'M'}${f1(cx + (rx + fluff) * Math.cos(th))} ${f1(cy + (ry + fluff * (ry / rx)) * Math.sin(th))}`;
  }
  return `${d} Z`;
}

/** An ellipse as a path, for painting with `Paint`. */
function oval(cx: number, cy: number, rx: number, ry: number): string {
  return `M${f1(cx - rx)} ${f1(cy)} A${rx} ${ry} 0 1 0 ${f1(cx + rx)} ${f1(cy)} A${rx} ${ry} 0 1 0 ${f1(cx - rx)} ${f1(cy)} Z`;
}

type EyeColours = { iris: string; glint: string; line: string; dark?: string };

/**
 * An open eye in Milo's manner: dark, a lighter iris low in it, two
 * highlights (big upper right, small lower left). `lid` hides its top, as a
 * fraction of its height at the back and front corners (a lid sloping down to
 * the front reads as cross, down to the back as sad). `look` shifts the iris.
 */
function Eye({ g, id, x, y, rx, ry, c, lid, look = [0, 0] }: { g: Ids; id: string; x: number; y: number; rx: number; ry: number; c: EyeColours; lid?: [number, number]; look?: [number, number] }) {
  const px = x + look[0] * rx * 0.28;
  const py = y + look[1] * ry * 0.22;
  const ball = (
    <G>
      <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={c.dark ?? EYE} />
      <Ellipse cx={px} cy={py + ry * 0.26} rx={rx * 0.76} ry={ry * 0.55} fill={c.iris} />
      <Ellipse cx={px} cy={py + ry * 0.5} rx={rx * 0.52} ry={ry * 0.27} fill={c.glint} opacity={0.8} />
      <Circle cx={px + rx * 0.3} cy={py - ry * 0.36} r={rx * 0.42} fill="#fff" />
      <Circle cx={px - rx * 0.36} cy={py + ry * 0.36} r={rx * 0.17} fill="#fff" opacity={0.9} />
    </G>
  );
  if (!lid) return ball;
  // the lid is a straight edge from the back corner to the front corner
  const x1 = x - rx - 1;
  const x2 = x + rx + 1;
  const y1 = y - ry + 2 * ry * lid[0];
  const y2 = y - ry + 2 * ry * lid[1];
  const m = (y2 - y1) / (x2 - x1);
  const k = (m * rx) / ry;
  const q = (y1 + m * (x - x1) - y) / ry;
  const disc = k * k * q * q - (1 + k * k) * (q * q - 1);
  const edge =
    disc > 0
      ? [(-k * q - Math.sqrt(disc)) / (1 + k * k), (-k * q + Math.sqrt(disc)) / (1 + k * k)].map((u) => {
          const ex = x + u * rx * 1.08;
          return `${f1(ex)} ${f1(y1 + m * (ex - x1))}`;
        })
      : null;
  return (
    <G>
      <Defs>
        <ClipPath id={g(id)}>
          <Path d={`M${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)} L${f1(x2)} ${f1(y + ry + 2)} L${f1(x1)} ${f1(y + ry + 2)} Z`} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${g(id)})`}>{ball}</G>
      {edge && <Path d={`M${edge[0]} L${edge[1]}`} stroke={c.line} strokeWidth={ry * 0.34} strokeLinecap="round" />}
    </G>
  );
}

/** A closed, smiling eye (a raised arc). */
function happyEye(x: number, y: number, w: number, color: string, sw: number) {
  return <Path d={`M${f1(x - w)} ${f1(y + w * 0.3)} Q${f1(x)} ${f1(y - w * 0.95)} ${f1(x + w)} ${f1(y + w * 0.3)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />;
}

/** An eye squeezed shut in pain: a chevron pointing `dir` (1 right, -1 left). */
function squeezeEye(x: number, y: number, s: number, dir: 1 | -1, color: string, sw: number) {
  return <Path d={`M${f1(x - s * dir)} ${f1(y - s * 0.85)} L${f1(x + s * 0.9 * dir)} ${f1(y)} L${f1(x - s * dir)} ${f1(y + s * 0.85)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}

/** A wide, frightened eye: white all round a small pupil. */
function ringEye(x: number, y: number, r: number, color: string, sw: number, look: [number, number] = [0, 0]) {
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={r} ry={r * 1.08} fill="#FFFDF7" stroke={color} strokeWidth={sw} />
      <Circle cx={x + look[0] * r * 0.3} cy={y + look[1] * r * 0.3} r={r * 0.42} fill={EYE} />
      <Circle cx={x + look[0] * r * 0.3 + r * 0.16} cy={y + look[1] * r * 0.3 - r * 0.16} r={r * 0.15} fill="#fff" />
    </G>
  );
}

/** A little question mark floating by a puzzled head. */
function puzzled(x: number, y: number, s: number, color: string) {
  return <Path d={`M${f1(x - s)} ${f1(y - s * 0.6)} Q${f1(x - s)} ${f1(y - s * 1.8)} ${f1(x)} ${f1(y - s * 1.8)} Q${f1(x + s)} ${f1(y - s * 1.8)} ${f1(x + s)} ${f1(y - s * 0.8)} Q${f1(x + s)} ${f1(y)} ${f1(x)} ${f1(y + s * 0.2)} L${f1(x)} ${f1(y + s * 0.8)} M${f1(x)} ${f1(y + s * 1.5)} L${f1(x)} ${f1(y + s * 1.55)}`} stroke={color} strokeWidth={s * 0.42} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}

/** A drop of water: a tear, or the sweat of a frightened creature. */
function drop(x: number, y: number, s: number) {
  return (
    <G>
      <Path d={`M${f1(x)} ${f1(y - s * 1.6)} Q${f1(x + s)} ${f1(y - s * 0.2)} ${f1(x)} ${f1(y + s * 0.6)} Q${f1(x - s)} ${f1(y - s * 0.2)} ${f1(x)} ${f1(y - s * 1.6)} Z`} fill="#A8DCF5" stroke="#4F95C6" strokeWidth={s * 0.28} strokeLinejoin="round" />
      <Circle cx={x - s * 0.3} cy={y - s * 0.2} r={s * 0.22} fill="#fff" opacity={0.9} />
    </G>
  );
}

/** A soft puff of smoke or dust, lit from the upper left. */
function puff(x: number, y: number, r: number, light: string, shade: string, o = 0.8) {
  return (
    <G opacity={o}>
      <Path d={`M${f1(x - r * 1.5)} ${f1(y + r * 0.5)} Q${f1(x - r * 1.9)} ${f1(y - r * 0.5)} ${f1(x - r * 0.8)} ${f1(y - r * 0.6)} Q${f1(x - r * 0.5)} ${f1(y - r * 1.5)} ${f1(x + r * 0.4)} ${f1(y - r * 1.1)} Q${f1(x + r * 1.5)} ${f1(y - r * 1.2)} ${f1(x + r * 1.4)} ${f1(y - r * 0.1)} Q${f1(x + r * 1.9)} ${f1(y + r * 0.7)} ${f1(x + r * 0.9)} ${f1(y + r * 0.8)} L${f1(x - r)} ${f1(y + r * 0.8)} Q${f1(x - r * 1.6)} ${f1(y + r * 0.8)} ${f1(x - r * 1.5)} ${f1(y + r * 0.5)} Z`} fill={shade} />
      <Path d={`M${f1(x - r * 1.3)} ${f1(y + r * 0.2)} Q${f1(x - r * 1.6)} ${f1(y - r * 0.5)} ${f1(x - r * 0.7)} ${f1(y - r * 0.5)} Q${f1(x - r * 0.4)} ${f1(y - r * 1.3)} ${f1(x + r * 0.4)} ${f1(y - r * 0.9)} Q${f1(x + r * 1)} ${f1(y - r * 0.9)} ${f1(x + r * 0.9)} ${f1(y - r * 0.2)} Q${f1(x)} ${f1(y - r * 0.1)} ${f1(x - r * 1.3)} ${f1(y + r * 0.2)} Z`} fill={light} />
    </G>
  );
}

/** A soft radial halo, for fire and glowing things (an ellipse, unlike `Glow` in the kit). */
function halo(g: Ids, id: string, cx: number, cy: number, rx: number, ry: number, color: string, opacity: number) {
  if (opacity <= 0) return null;
  return (
    <G>
      <Defs>
        <RadialGradient id={g(id)} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.4" stopColor={color} stopOpacity={opacity * 0.5} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${g(id)})`} />
    </G>
  );
}

/**
 * One tongue of flame rooted at (x, y), `h` tall and `w` wide at its belly,
 * leaning `tilt` degrees (negative leans back). Its tip flicks backward.
 */
function tongue(x: number, y: number, h: number, w: number, tilt: number): string {
  const r = (tilt * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const p = (u: number, v: number) => `${f1(x + u * c - v * s)} ${f1(y + u * s + v * c)}`;
  return `M${p(0, 0)} C${p(-w, 0)} ${p(-w * 1.15, -h * 0.4)} ${p(-w * 0.6, -h * 0.64)} C${p(-w * 0.3, -h * 0.79)} ${p(-w * 0.1, -h * 0.84)} ${p(-w * 0.26, -h)} C${p(w * 0.42, -h * 0.86)} ${p(w, -h * 0.6)} ${p(w * 0.92, -h * 0.3)} C${p(w * 0.86, -h * 0.08)} ${p(w * 0.55, 0)} ${p(0, 0)} Z`;
}

/** Outer, mid and core colours of a fire, and its outline. */
type FlameTones = [outer: string, mid: string, core: string, line: string];

/** A flame in three tones, cel-painted like the creatures that carry it. */
function Flame({ x, y, h, w, tilt, t, lw = 1.6 }: { x: number; y: number; h: number; w: number; tilt: number; t: FlameTones; lw?: number }) {
  return (
    <G>
      <Path d={tongue(x, y, h, w, tilt)} fill={t[0]} stroke={t[3]} strokeWidth={lw} strokeLinejoin="round" />
      <Path d={tongue(x + w * 0.12, y, h * 0.7, w * 0.6, tilt - 3)} fill={t[1]} />
      <Path d={tongue(x + w * 0.16, y, h * 0.4, w * 0.34, tilt - 5)} fill={t[2]} />
    </G>
  );
}

/** A spark: a tiny four-pointed ember. */
function spark(x: number, y: number, s: number, fill: string) {
  return <Path d={`M${f1(x)} ${f1(y - s)} Q${f1(x + s * 0.2)} ${f1(y - s * 0.2)} ${f1(x + s)} ${f1(y)} Q${f1(x + s * 0.2)} ${f1(y + s * 0.2)} ${f1(x)} ${f1(y + s)} Q${f1(x - s * 0.2)} ${f1(y + s * 0.2)} ${f1(x - s)} ${f1(y)} Q${f1(x - s * 0.2)} ${f1(y - s * 0.2)} ${f1(x)} ${f1(y - s)} Z`} fill={fill} />;
}

/* ------------------------------------------------------------------ */
/* Emberhog and Old Cinderback                                         */
/* ------------------------------------------------------------------ */

type HogLook = {
  fur: Tones;
  far: Tones;
  /** The pale of its muzzle, which also lights its rim. */
  pale: string;
  snout: Tones;
  tusk: Tones;
  hoof: string;
  inner: string;
  brow: string;
  eye: EyeColours;
  hotEye: EyeColours;
  flame: FlameTones;
  hot: FlameTones;
  low: FlameTones;
  ash: FlameTones;
  glow: string;
};

const EMBER: HogLook = {
  fur: ['#C2603A', '#9E4630', '#6E2E37', '#521D0F'],
  far: ['#8E402D', '#7A372C', '#5A2A33', '#43170E'],
  pale: '#F6C9A0',
  snout: ['#F4AE90', '#E08F78', '#B96A66', '#7A3026'],
  tusk: ['#FFF7E6', '#F2E2C4', '#D3BD9A', '#94714C'],
  hoof: '#4A2421',
  inner: '#E88C7C',
  brow: '#5A2216',
  eye: { iris: '#9A4A22', glint: '#E89A48', line: '#5A2216' },
  hotEye: { iris: '#E0761E', glint: '#FFD45A', line: '#5A2216' },
  flame: ['#EE5A28', '#FF9C30', '#FFE07A', '#B0341A'],
  hot: ['#FF6626', '#FFC23A', '#FFF8DA', '#B8381A'],
  low: ['#B64A30', '#DA7B42', '#F0B868', '#863022'],
  ash: ['#9C8279', '#BCA79A', '#DCCDBD', '#735A52'],
  glow: '#FFAE45',
};

const CINDER: HogLook = {
  fur: ['#9C5139', '#7C3D2F', '#542A35', '#36150F'],
  far: ['#713628', '#5F2E25', '#44222C', '#2C110C'],
  pale: '#D9AE94',
  snout: ['#D9CBC2', '#C0ACA2', '#998480', '#5A4440'],
  tusk: ['#F2DC9E', '#DCC07A', '#B39552', '#77592A'],
  hoof: '#33191A',
  inner: '#B87A70',
  brow: '#D5CCC4',
  eye: { iris: '#A8742C', glint: '#E8B858', line: '#3E1812' },
  hotEye: { iris: '#E8B030', glint: '#FFF0A8', line: '#3E1812' },
  flame: ['#C9381C', '#EE6A22', '#FFB23C', '#82220F'],
  hot: ['#DC4019', '#FFAE2A', '#FFFBEA', '#8A2610'],
  low: ['#8A2C1A', '#B24C26', '#D88A48', '#5E1A0E'],
  ash: ['#806660', '#A28C82', '#C7B6A8', '#5C4640'],
  glow: '#FF9A3A',
};

/** Rump, back, chest, then a fringe of fur along the belly. Drawn in the Emberhog's 220 x 170 frame. */
const EMBER_BODY = `M46 138 C24 120 32 88 66 80 C94 72 126 56 158 66 C186 76 194 120 178 140${fringe(178, 140, 122, 152, 4, 5)}${fringe(122, 152, 62, 149, 4, 5)} C54 147 49 143 46 138 Z`;
/** Old Cinderback is heavier, with a great hump of muscle over the shoulders. */
const CINDER_BODY = `M40 140 C16 122 24 86 60 76 C90 66 124 46 156 56 C188 68 198 120 182 144${fringe(182, 144, 120, 156, 4, 5)}${fringe(120, 156, 56, 152, 4, 5)} C48 150 43 146 40 140 Z`;
const HOG_HEAD = `M138 94 C142 76 168 68 186 82 C194 89 200 95 208 100 C216 106 216 126 208 132 C200 138 188 140 178 139${fringe(178, 139, 143, 127, 3, 6)} C137 120 135 106 138 94 Z`;
const HOG_EAR = 'M146 86 C139 70 141 55 150 46 C160 54 167 68 165 83 Z';
const OLD_EAR = 'M146 86 C139 70 141 55 150 46 L153 54 L157 51 C162 60 167 70 165 83 Z';
const EAR_INNER = 'M150 80 C147 69 148 60 151 54 C157 61 160 70 159 80 Z';

/** [root x, root y, height, tilt] for each flame quill, back to front. */
const EMBER_QUILLS: [number, number, number, number][] = [
  [44, 98, 26, -52],
  [58, 86, 36, -38],
  [78, 80, 44, -24],
  [100, 73, 50, -10],
  [124, 67, 50, 4],
  [146, 67, 40, 16],
];
const CINDER_QUILLS: [number, number, number, number][] = [
  [36, 98, 30, -56],
  [50, 84, 40, -42],
  [70, 74, 48, -28],
  [92, 66, 54, -14],
  [114, 58, 56, -2],
  [136, 55, 50, 10],
  [158, 60, 38, 22],
];

function Hog({ g, mood, old }: { g: Ids; mood: LexlingMood; old: boolean }) {
  const P = old ? CINDER : EMBER;
  const hot = mood === 'blazing';
  const hurt = mood === 'hurt';
  const sad = mood === 'sad';
  const scared = mood === 'scared';
  const happy = mood === 'happy';
  const cross = mood === 'angry' || hot;
  const confused = mood === 'confused';
  // Flames swell when it's pleased or fanned, sink when it's low, gutter to smoke when it's hurt.
  const scale = hot ? 1.42 : hurt ? 0.5 : sad ? 0.58 : scared ? 0.68 : cross ? 1.14 : happy ? 1.08 : confused ? 0.9 : 1;
  // swept back in fright or gloom, bristling forward when it's cross
  const sweep = scared ? -24 : sad ? -14 : hurt ? -8 : cross ? 6 : 0;
  const fl = hurt ? P.ash : sad ? P.low : hot ? P.hot : P.flame;
  const glow = hurt ? 0 : sad ? 0.16 : hot ? 0.72 : scared ? 0.18 : 0.4;
  const quills = old ? CINDER_QUILLS : EMBER_QUILLS;
  const wob = (i: number) => (confused ? (i % 2 ? 9 : -7) : 0);
  // The head hangs when it's low, pulls back when it's frightened.
  const head = sad ? 'rotate(9 146 116)' : hurt ? 'rotate(5 146 116)' : scared ? 'translate(-3 3) rotate(-4 146 116)' : undefined;
  // a big head reads at a glance; the old boar's is bigger still
  const big = old ? 'translate(136 112) scale(1.1) translate(-146 -112)' : 'translate(139 111) scale(1.1) translate(-146 -112)';
  const earTurn = cross ? -22 : scared ? -44 : sad ? -58 : hurt ? -34 : happy ? 6 : confused ? 12 : 0;
  const ear = old ? OLD_EAR : HOG_EAR;
  const legs = old ? [70, 150] : [72, 148];
  const farLegs = old ? [94, 170] : [94, 166];
  const legW = old ? 12.5 : 11;
  const leg = (x: number, i: number, far: boolean) => {
    const d = `M${x - legW} 128 L${x - legW - 1} 156 Q${x - legW - 1} 166 ${x - 2} 166 L${x + 3} 166 Q${x + legW + 1} 166 ${x + legW + 1} 156 L${x + legW} 128 Z`;
    return (
      <G key={`${far ? 'f' : 'n'}${i}`} transform={far ? 'translate(0 -3)' : undefined}>
        <Paint g={g} id={`${far ? 'fl' : 'nl'}${i}`} d={d} t={far ? P.far : P.fur} step={0.5} rim={far ? 0 : 0.4} />
        <Path d={`M${x - legW - 1} 157 Q${x - legW - 1} 166 ${x - 2} 166 L${x + 3} 166 Q${x + legW + 1} 166 ${x + legW + 1} 157 Q${x} 160 ${x - legW - 1} 157 Z`} fill={P.hoof} stroke={P.fur[3]} strokeWidth={1.6} strokeLinejoin="round" />
        <Path d={`M${x + 1.5} 160.5 L${x + 1.5} 165`} stroke={P.fur[3]} strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
      </G>
    );
  };
  const eyeX = 180;
  const eyeY = 98;
  return (
    <G>
      <GroundShadow g={g} id="ground" cx={112} cy={164} rx={old ? 92 : 84} ry={8} opacity={0.34} />
      {halo(g, 'halo', old ? 100 : 104, old ? 50 : 58, hot ? 110 : 88, hot ? 64 : 48, P.glow, glow)}
      {/* flame quills along the back, and a flame for a tail */}
      {quills.map(([x, y, h, t], i) => (
        <Flame key={i} x={x} y={y} h={Math.min(h * scale, y - 6)} w={(old ? 13 : 12) * Math.min(scale, 1.15)} tilt={t + sweep + wob(i)} t={fl} />
      ))}
      <Flame x={old ? 34 : 40} y={old ? 122 : 118} h={(old ? 26 : 22) * scale} w={7 * Math.min(scale, 1.15)} tilt={-78 + sweep * 0.5} t={fl} />
      {/* legs: the far pair darker, behind */}
      {farLegs.map((x, i) => leg(x, i, true))}
      {legs.map((x, i) => leg(x, i, false))}
      {/* body */}
      <Paint g={g} id="body" d={old ? CINDER_BODY : EMBER_BODY} t={P.fur} step={1.15} glint={[P.pale, old ? 0.36 : 0.5]} />
      {/* the line of the haunch, so the body is not one loaf */}
      <Path d={old ? 'M46 108 C60 102 80 114 84 146' : 'M52 106 C64 101 82 112 85 142'} stroke={P.fur[3]} strokeWidth={1.7} strokeLinecap="round" fill="none" opacity={0.42} />
      <Path d={old ? 'M62 120 q5 6 12 7 M84 132 q5 6 12 7 M118 134 q5 6 12 6' : 'M64 118 q5 6 12 7 M86 130 q5 6 12 7 M120 132 q5 6 12 6'} stroke={P.fur[3]} strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.35} />
      {old && (
        <G stroke="#F0CDB6" strokeLinecap="round" fill="none">
          {/* old scars: nicks between the quill roots, three claw marks across the flank */}
          <Path d="M78 76 L84 71 M102 66 L107 61" strokeWidth={2.4} opacity={0.85} />
          <Path d="M86 104 Q94 112 101 124 M95 100 Q104 109 112 121 M105 99 Q112 106 118 113" strokeWidth={2.6} opacity={0.62} />
        </G>
      )}
      <G transform={head}>
        <G transform={big}>
          {/* far ear, then near ear: the head covers their roots */}
          <G transform={`rotate(${earTurn} 156 84) translate(17 -2)`}>
            <Paint g={g} id="ear-far" d={ear} t={P.far} step={0.4} rim={0} w={2} />
          </G>
          <G transform={`rotate(${earTurn} 156 84)`}>
            <Paint g={g} id="ear" d={ear} t={P.fur} step={0.4} rim={0.4} w={2.2} />
            <Path d={EAR_INNER} fill={P.inner} opacity={0.8} />
          </G>
          <Paint g={g} id="head" d={HOG_HEAD} t={P.fur} step={1} glint={[P.pale, old ? 0.4 : 0.55]} />
          {old && (
            <G>
              {/* a grizzled grey ruff at the cheek */}
              <Path d={`M178 139${fringe(178, 139, 143, 127, 3, 6)} C139 121 138 115 140 110${fringe(140, 110, 178, 129, 4, 4)} Z`} fill="#AB9D95" />
              <Path d="M146 116 q4 5 9 7 M156 124 q5 3 10 4" stroke="#7A6862" strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.8} />
            </G>
          )}
          {/* muzzle: lighter round the snout, grey on the old one */}
          <Path d="M176 126 C178 112 194 104 210 106 L212 130 C204 138 188 140 178 136 Z" fill={old ? '#C9BDB4' : P.pale} opacity={old ? 0.85 : 0.4} />
          {/* far tusk behind the snout, then the snout and the near tusk */}
          <Path d={old ? 'M205 135 C206 128 210 123 215 120 C213 126 212 131 211 136 Z' : 'M205 133 C206 127 209 123 213 121 C211 126 210 130 209 134 Z'} fill={P.tusk[1]} stroke={P.tusk[3]} strokeWidth={1.4} strokeLinejoin="round" />
          <Paint g={g} id="snout" d={oval(208, 116, 9.5, 13)} t={P.snout} step={0.35} rim={0.5} w={2} />
          <Ellipse cx={205} cy={113} rx={2.2} ry={3.6} fill={P.fur[3]} />
          <Ellipse cx={212} cy={113.5} rx={1.8} ry={3.2} fill={P.fur[3]} />
          <Paint g={g} id="tusk" d={old ? 'M186 140 C181 129 183 118 192 108 C192 118 194 129 198 139 Z' : 'M189 138 C185 128 188 119 195 113 C194 121 195 130 198 137 Z'} t={P.tusk} step={0.3} rim={0.6} w={1.6} />
          {old && <Path d="M189 111 L192 108 L192.5 113 Z" fill={P.tusk[2]} />}
          {/* mouth */}
          {happy || hot ? (
            <G>
              <Path d={hot ? 'M202 129 Q198 146 180 132 Q190 136 202 129 Z' : 'M202 129 Q196 144 181 131 Q192 135 202 129 Z'} fill="#5A1E22" stroke={P.fur[3]} strokeWidth={1.4} strokeLinejoin="round" />
              {happy && <Ellipse cx={192} cy={137} rx={4.5} ry={2.4} fill="#F28C9C" />}
            </G>
          ) : (
            <Path
              d={sad || scared ? 'M201 133 Q193 128 184 133' : cross ? 'M202 131 Q192 129 183 134' : hurt || confused ? 'M201 131 q-4 -3 -8 0 t-8 0' : 'M201 130 Q193 135 184 131'}
              stroke={P.fur[3]}
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          )}
          {/* eye and brow */}
          {happy ? (
            happyEye(eyeX, eyeY + 2, 8.5, EYE, 4)
          ) : hurt ? (
            squeezeEye(eyeX, eyeY, 8, 1, EYE, 3.8)
          ) : scared ? (
            ringEye(eyeX, eyeY, 9.5, EYE, 2.2, [0.4, 0.2])
          ) : (
            <Eye g={g} id="eye" x={eyeX} y={eyeY} rx={8.5} ry={10} c={hot ? P.hotEye : P.eye} lid={cross ? [0.3, 0.6] : sad ? [0.55, 0.2] : old ? [0.22, 0.3] : confused ? undefined : [0.1, 0.16]} look={confused ? [-0.6, -0.9] : sad ? [0, 0.8] : [0.3, 0]} />
          )}
          {(() => {
            const brow = cross ? 'M167 83 L190 93' : sad ? 'M168 93 L188 84' : scared ? 'M168 87 Q177 79 189 84' : happy ? 'M169 86 Q178 80 188 85' : confused ? 'M168 84 Q177 78 188 82' : 'M168 86 Q178 82 189 86';
            // the old boar's brows are bushy and grey, outlined so they read on his dark face
            return old ? (
              <G>
                <Path d={brow} stroke={P.fur[3]} strokeWidth={7} strokeLinecap="round" fill="none" />
                <Path d={brow} stroke={P.brow} strokeWidth={4.4} strokeLinecap="round" fill="none" />
              </G>
            ) : (
              <Path d={brow} stroke={P.brow} strokeWidth={cross ? 4.4 : 3.6} strokeLinecap="round" fill="none" />
            );
          })()}
          {old && <Path d="M170 82 L196 116" stroke="#F0CDB6" strokeWidth={2.6} strokeLinecap="round" opacity={0.9} />}
          <Ellipse cx={186} cy={117} rx={6} ry={3.4} fill={BLUSH} opacity={happy ? 0.6 : hurt || sad ? 0.15 : 0.32} />
        </G>
      </G>
      {/* mood marks */}
      {hurt && (
        <G>
          {puff(88, 52, 9, '#EEEAEC', '#BFB8C2')}
          {puff(112, 40, 11, '#EEEAEC', '#BFB8C2')}
          {puff(134, 54, 7, '#EEEAEC', '#BFB8C2', 0.7)}
        </G>
      )}
      {hot && (
        <G>
          {spark(50, 26, 4, '#FFE07A')}
          {spark(150, 18, 3.4, '#FFF4C0')}
          {spark(176, 44, 3, '#FFC23A')}
          {spark(76, 12, 2.6, '#FFF4C0')}
          {spark(24, 60, 2.6, '#FFC23A')}
        </G>
      )}
      {mood === 'angry' && (
        <G>
          {spark(70, 34, 3, '#FFC23A')}
          {spark(140, 28, 2.6, '#FFE07A')}
        </G>
      )}
      {scared && drop(196, 84, 4.2)}
      {sad && drop(186, 112, 3.4)}
      {confused && puzzled(200, 58, 8, P.fur[3])}
    </G>
  );
}

export const EMBERHOG_ASPECT = 220 / 170;

export function EmberhogArt({ width, mood = 'angry' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  return (
    <Svg width={width} height={width / EMBERHOG_ASPECT} viewBox="0 0 220 170">
      <Hog g={g} mood={mood} old={false} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* Drizzlet                                                            */
/* ------------------------------------------------------------------ */

export const DRIZZLET_ASPECT = 120 / 140;

const WATER: Tones = ['#93D6F6', '#5FB2EA', '#4278C8', '#284F96'];
const WATER_EYE: EyeColours = { iris: '#2D5C9E', glint: '#79C4F2', line: '#284F96', dark: '#1B2444' };

/** The round bottom every Drizzlet shares, from its right side round to its left. */
const DROP_BOTTOM = 'C100 118 82 134 60 134 C37 134 20 118 20 93';

/** Its body, by the shape of the little curl on top: perky, drooping, stiff with fright, or flicked backward. */
const DROP: Record<'curl' | 'droop' | 'straight' | 'back', string> = {
  curl: `M64 16 C72 30 100 58 100 92 ${DROP_BOTTOM} C20 62 44 36 54 16 C58 8 64 3 71 4 C77 5 79 11 74 13 C71 14 68 12 64 16 Z`,
  droop: `M66 24 C76 38 100 62 100 92 ${DROP_BOTTOM} C20 64 40 40 52 26 C57 18 66 14 74 17 C81 20 82 29 77 32 C73 34 70 29 66 24 Z`,
  straight: `M63 14 C72 30 100 58 100 92 ${DROP_BOTTOM} C20 60 46 36 56 14 C58 9 59 5 60 1 C61 5 62 9 63 14 Z`,
  back: `M58 18 C70 32 100 58 100 92 ${DROP_BOTTOM} C20 62 36 42 46 26 C43 20 38 16 32 16 C37 9 48 9 53 13 C55 15 57 16 58 18 Z`,
};

/** A flipper, shoulder at the origin, reaching left with its tip curling up. */
const FIN = 'M3 -6 C-6 -9 -14 -7 -19 -14 C-21 -3 -13 7 3 6 Z';

/**
 * A water Lexling: a playful droplet with a curl on top, little flippers
 * and a glossy, see-through body (light gathers in its lower right, the way
 * it does in a drop of water).
 */
export function DrizzletArt({ width, mood = 'happy' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  const happy = mood === 'happy';
  const cross = mood === 'angry';
  const fierce = mood === 'blazing';
  const sad = mood === 'sad';
  const scared = mood === 'scared';
  const hurt = mood === 'hurt';
  const confused = mood === 'confused';
  const tip = sad || hurt ? 'droop' : scared ? 'straight' : confused ? 'back' : 'curl';
  // The whole drop squashes and stretches with its mood, from its base.
  const squash = hurt ? 'translate(60 134) scale(1.07 0.9) translate(-60 -134)' : sad ? 'translate(60 134) scale(1.05 0.94) translate(-60 -134)' : scared ? 'translate(60 134) scale(0.93 1.03) translate(-60 -134)' : happy ? 'translate(60 134) scale(1 1.02) translate(-60 -134)' : undefined;
  // Flippers: up with joy or fright, down when low, back on its hips when cross.
  const fin = happy || fierce ? 34 : scared ? 58 : sad || hurt ? -26 : cross ? -8 : confused ? 16 : 6;
  const L = 45;
  const R = 75;
  const Y = 94;
  return (
    <Svg width={width} height={width / DRIZZLET_ASPECT} viewBox="0 0 120 140">
      <GroundShadow g={g} id="ground" cx={60} cy={136} rx={40} ry={5} opacity={0.3} />
      <G transform={squash}>
        {/* feet, then flippers, behind the body */}
        <Paint g={g} id="foot-l" d={oval(47, 134, 9, 5)} t={WATER} step={0.25} rim={0.3} w={2} />
        <Paint g={g} id="foot-r" d={oval(73, 134, 9, 5)} t={WATER} step={0.25} rim={0.3} w={2} />
        <G transform={`translate(25 98) rotate(${fin})`}>
          <Paint g={g} id="fin-l" d={FIN} t={WATER} step={0.3} rim={0.4} w={2.2} />
        </G>
        <G transform={`translate(95 98) scale(-1 1) rotate(${fin})`}>
          <Paint g={g} id="fin-r" d={FIN} t={WATER} step={0.3} rim={0} w={2.2} />
        </G>
        {/* the drop */}
        <Paint g={g} id="body" d={DROP[tip]} t={WATER} step={0.85} rim={0.55} w={2.6} />
        {/* light gathered in the lower right, a gloss on the upper left, two bubbles */}
        <Path d="M80 124 C92 116 97 105 97 94 C100 109 95 121 82 128 Z" fill="#CFF6FF" opacity={0.75} />
        <Path d="M33 74 C33 58 40 46 49 37 C45 49 41 60 41 74 C41 80 33 80 33 74 Z" fill="#fff" opacity={0.78} />
        <Circle cx={37} cy={86} r={2.6} fill="#fff" opacity={0.8} />
        <Circle cx={74} cy={58} r={2.6} fill="none" stroke="#E2F8FF" strokeWidth={1.2} opacity={0.85} />
        <Circle cx={68} cy={49} r={1.6} fill="none" stroke="#E2F8FF" strokeWidth={1} opacity={0.8} />
        {/* cheeks */}
        <Ellipse cx={33} cy={106} rx={6.5} ry={3.6} fill={BLUSH} opacity={hurt || scared ? 0.25 : happy ? 0.7 : 0.5} />
        <Ellipse cx={87} cy={106} rx={6.5} ry={3.6} fill={BLUSH} opacity={hurt || scared ? 0.25 : happy ? 0.7 : 0.5} />
        {/* eyes */}
        {happy ? (
          <G>
            {happyEye(L, Y + 1, 7.5, WATER_EYE.dark!, 3.6)}
            {happyEye(R, Y + 1, 7.5, WATER_EYE.dark!, 3.6)}
          </G>
        ) : hurt ? (
          <G>
            {squeezeEye(L, Y, 7, 1, WATER_EYE.dark!, 3.4)}
            {squeezeEye(R, Y, 7, -1, WATER_EYE.dark!, 3.4)}
          </G>
        ) : scared ? (
          <G>
            {ringEye(L, Y - 1, 8.5, WATER_EYE.dark!, 2, [0.3, 0.1])}
            {ringEye(R, Y - 1, 8.5, WATER_EYE.dark!, 2, [0.3, 0.1])}
          </G>
        ) : (
          <G>
            <Eye g={g} id="eye-l" x={L} y={Y} rx={confused ? 6.5 : 7.5} ry={confused ? 8 : 9.5} c={WATER_EYE} lid={cross ? [0.22, 0.6] : fierce ? [0.18, 0.42] : sad ? [0.58, 0.2] : undefined} look={confused ? [-0.4, -0.8] : sad ? [0, 0.8] : [0.25, 0]} />
            <Eye g={g} id="eye-r" x={R} y={Y} rx={7.5} ry={confused ? 10.5 : 9.5} c={WATER_EYE} lid={cross ? [0.6, 0.22] : fierce ? [0.42, 0.18] : sad ? [0.2, 0.58] : undefined} look={confused ? [-0.4, -0.8] : sad ? [0, 0.8] : [0.25, 0]} />
          </G>
        )}
        {/* mouth */}
        {happy || fierce ? (
          <G>
            <Path d={fierce ? 'M50 107 Q60 104 70 107 Q67 119 60 119 Q53 119 50 107 Z' : 'M51 107 Q60 109 69 107 Q66 120 60 120 Q54 120 51 107 Z'} fill="#3A2440" />
            <Ellipse cx={60} cy={116} rx={4.2} ry={2.4} fill="#F28C9C" />
          </G>
        ) : scared ? (
          <Ellipse cx={60} cy={112} rx={3.6} ry={4.6} fill="#3A2440" />
        ) : (
          <Path
            d={sad || cross ? 'M52 114 Q60 107 68 114' : hurt || confused ? 'M51 111 q4.5 -4 9 0 t9 0' : 'M52 108 Q60 116 68 108'}
            stroke={WATER_EYE.dark}
            strokeWidth={2.8}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </G>
      {/* mood marks */}
      {happy && (
        <G>
          {drop(14, 40, 3.4)}
          {drop(104, 30, 2.8)}
          {drop(98, 52, 2.2)}
        </G>
      )}
      {hurt && (
        <G>
          {drop(12, 66, 3.6)}
          {drop(108, 58, 3.2)}
          {drop(100, 40, 2.4)}
        </G>
      )}
      {scared && (
        <G>
          {drop(100, 70, 3.4)}
          {drop(18, 64, 2.6)}
        </G>
      )}
      {sad && drop(33, 112, 3)}
      {cross && (
        <G opacity={0.85}>
          {/* cross enough to steam */}
          {puff(86, 24, 5, '#F2F8FB', '#C6D6E0')}
          {puff(100, 14, 3.6, '#F2F8FB', '#C6D6E0', 0.7)}
        </G>
      )}
      {confused && puzzled(98, 28, 7, WATER[3])}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* Pebblit                                                             */
/* ------------------------------------------------------------------ */

export const PEBBLIT_ASPECT = 140 / 110;

const STONE: Tones = ['#CFC1A8', '#AC9E88', '#7E7488', '#54483F'];
const CLAY: Tones = ['#CC9E74', '#AD7E57', '#835A42', '#5A3A26'];
const MOSS: Tones = ['#9AC66C', '#73A54F', '#4F7F3D', '#355A2B'];
const CLAY_EYE: EyeColours = { iris: '#6A4430', glint: '#B8865A', line: '#5A3A26', dark: '#2A1E1C' };

/** A lumpy river stone, domed over the Pebblit, its rim sagging toward us. */
function domePath(): string {
  const steps = 60;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const th = Math.PI + (i / steps) * Math.PI;
    const lump = 1 + 0.035 * Math.sin(th * 2 + 2.2) + 0.02 * Math.sin(th * 3 + 0.4);
    d += `${i ? ' L' : 'M'}${f1(70 + 55 * Math.cos(th) * lump)} ${f1(72 + 55 * Math.sin(th) * lump)}`;
  }
  return `${d} C108 82 32 82 15 72 Z`;
}
const DOME = domePath();

/** Pebbles it has gathered into its stone, several bulging past the edge: [x, y, rx, ry, turn, tones]. */
const SLATE: Tones = ['#B6BEC4', '#959EA8', '#717A8C', '#474C5A'];
const OCHRE: Tones = ['#E6C28C', '#CCA06A', '#9C7656', '#684830'];
const RUST: Tones = ['#D89E78', '#BB7D5A', '#8C5A48', '#5C3A2C'];
const PEBBLES: [number, number, number, number, number, Tones][] = [
  [19, 56, 9, 7.5, -30, OCHRE],
  [120, 50, 8.5, 7, 25, SLATE],
  [98, 24, 7.5, 6, 20, RUST],
  [44, 42, 8, 6.5, -15, SLATE],
  [86, 56, 7, 5.5, 10, OCHRE],
  [60, 60, 4.5, 3.8, 0, RUST],
  [108, 72, 6, 4.6, 0, OCHRE],
];

/**
 * A shy earth Lexling hiding under a domed stone it has studded with
 * pebbles and a cap of moss, only its round face and toes peeking out.
 * Frightened, it pulls the stone down to its eyes; hurt, it shuts itself in.
 */
export function PebblitArt({ width, mood = 'scared' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  const curled = mood === 'hurt';
  const happy = mood === 'happy';
  const scared = mood === 'scared';
  const sad = mood === 'sad';
  const cross = mood === 'angry';
  const brave = mood === 'blazing';
  const confused = mood === 'confused';
  // The stone sits high when it's bold, low over its eyes when it's frightened, on the ground when it's shut in.
  const lift = curled ? 30 : scared ? 8 : happy || brave ? -3 : sad ? 3 : 0;
  // The sprout on top says the rest: perky, drooping, trembling, bent.
  const sprout = happy || brave ? 10 : sad ? 62 : curled ? 80 : scared ? -26 : confused ? -40 : cross ? 0 : 6;
  const L = 53;
  const R = 86;
  const Y = 89;
  return (
    <Svg width={width} height={width / PEBBLIT_ASPECT} viewBox="0 0 140 110">
      <GroundShadow g={g} id="ground" cx={70} cy={106} rx={curled ? 60 : 54} ry={5} opacity={0.32} />
      {!curled && (
        <G>
          {/* toes, then the round little body under the stone */}
          <Paint g={g} id="toe-l" d={oval(46, 104, 9.5, 5.5)} t={CLAY} step={0.25} rim={0.3} w={2.2} />
          <Paint g={g} id="toe-r" d={oval(94, 104, 9.5, 5.5)} t={CLAY} step={0.25} rim={0.3} w={2.2} />
          <Paint g={g} id="body" d={oval(70, 84, 50, 22)} t={CLAY} step={0.6} rim={0.35} w={2.6} />
          <Ellipse cx={72} cy={98} rx={22} ry={6} fill="#F0D0A8" opacity={0.5} />
          <Ellipse cx={37} cy={97} rx={6.5} ry={3.6} fill={BLUSH} opacity={happy ? 0.8 : scared ? 0.3 : 0.55} />
          <Ellipse cx={103} cy={97} rx={6.5} ry={3.6} fill={BLUSH} opacity={happy ? 0.8 : scared ? 0.3 : 0.55} />
          {happy ? (
            <G>
              {happyEye(L, Y + 1, 8, CLAY_EYE.dark!, 3.6)}
              {happyEye(R, Y + 1, 8, CLAY_EYE.dark!, 3.6)}
            </G>
          ) : scared ? (
            <G>
              {ringEye(L, Y + 2, 9, CLAY_EYE.dark!, 2, [0.5, 0.3])}
              {ringEye(R, Y + 2, 9, CLAY_EYE.dark!, 2, [0.5, 0.3])}
            </G>
          ) : (
            <G>
              <Eye g={g} id="eye-l" x={L} y={Y} rx={confused ? 6.8 : 8} ry={confused ? 8 : 9.5} c={CLAY_EYE} lid={cross ? [0.25, 0.62] : brave ? [0.3, 0.38] : sad ? [0.6, 0.22] : undefined} look={sad ? [0, 0.8] : confused ? [-0.5, -0.6] : [0.6, 0.3]} />
              <Eye g={g} id="eye-r" x={R} y={Y} rx={8} ry={confused ? 10.5 : 9.5} c={CLAY_EYE} lid={cross ? [0.62, 0.25] : brave ? [0.38, 0.3] : sad ? [0.22, 0.6] : undefined} look={sad ? [0, 0.8] : confused ? [-0.5, -0.6] : [0.6, 0.3]} />
            </G>
          )}
          {happy || brave ? (
            <Path d={brave ? 'M63 100 Q70 98 77 100 Q74 106 70 106 Q66 106 63 100 Z' : 'M63 99 Q70 101 77 99 Q74 106 70 106 Q66 106 63 99 Z'} fill="#4A2A22" />
          ) : (
            <Path d={scared || confused ? 'M63 102 q3.5 -3 7 0 t7 0' : sad || cross ? 'M64 103 Q70 98 76 103' : 'M66 100 Q70 103.5 74 100'} stroke={CLAY[3]} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          )}
        </G>
      )}
      <G transform={`translate(0 ${lift})${curled ? ' translate(70 72) scale(1.06 0.92) translate(-70 -72)' : ''}`}>
        {/* the stone, with the pebbles it has gathered, a chip and a crack */}
        <Paint g={g} id="dome" d={DOME} t={STONE} step={0.85} rim={0.5} w={2.6} />
        <G fill={STONE[3]} opacity={0.28}>
          <Circle cx={66} cy={44} r={1.3} />
          <Circle cx={74} cy={68} r={1.2} />
          <Circle cx={34} cy={66} r={1.2} />
          <Circle cx={100} cy={42} r={1.1} />
          <Circle cx={52} cy={28} r={1} />
        </G>
        <Path d={curled ? 'M74 76 L78 62 L72 54 L80 42 L76 32' : 'M118 66 L113 60 L116 55'} stroke={STONE[3]} strokeWidth={curled ? 2.2 : 1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {PEBBLES.map(([x, y, rx, ry, turn, t], i) => (
          <G key={i}>
            <Ellipse cx={x + 1.6} cy={y + 1.8} rx={rx} ry={ry} fill={STONE[3]} opacity={0.3} transform={`rotate(${turn} ${x} ${y})`} />
            <Paint g={g} id={`pebble${i}`} d={oval(x, y, rx, ry)} t={t} step={0.22} rim={0.55} w={1.5} transform={`rotate(${turn} ${x} ${y})`} />
          </G>
        ))}
        {/* a cap of moss, and a sprout */}
        <G transform={`rotate(${sprout} 66 22)`}>
          <Path d="M66 22 Q64 12 67 6" stroke={MOSS[2]} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          <Path d="M66 10 C58 10 54 6 53 2 C59 1 64 4 66 10 Z" fill={MOSS[1]} stroke={MOSS[3]} strokeWidth={1.3} strokeLinejoin="round" />
          <Path d="M67 8 C72 3 78 2 82 4 C79 9 72 11 67 8 Z" fill={MOSS[0]} stroke={MOSS[3]} strokeWidth={1.3} strokeLinejoin="round" />
        </G>
        <Paint g={g} id="moss" d={blob(64, 24, 13, { seed: 5, lobes: 9, lobe: 0.14, wobble: 0.1, squash: 0.62 })} t={MOSS} step={0.28} rim={0.4} w={1.7} />
        <Paint g={g} id="moss2" d={blob(80, 28, 6.5, { seed: 9, lobes: 7, lobe: 0.16, wobble: 0.1, squash: 0.7 })} t={MOSS} step={0.18} rim={0.4} w={1.5} />
      </G>
      {/* mood marks */}
      {curled && (
        <G>
          {puff(20, 98, 6, '#EEE6DA', '#C7BBAA')}
          {puff(122, 96, 5, '#EEE6DA', '#C7BBAA', 0.7)}
        </G>
      )}
      {scared && (
        <G>
          {drop(118, 88, 3.4)}
          <Path d="M8 70 L2 66 M9 78 L2 78 M132 70 L138 66" stroke={STONE[3]} strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
        </G>
      )}
      {sad && drop(40, 100, 3)}
      {confused && puzzled(122, 14, 6.5, STONE[3])}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* Puffkin (and Bluster, Pip's Puffkin in a scarf)                     */
/* ------------------------------------------------------------------ */

export const PUFFKIN_ASPECT = 1;

const PUFF: Tones = ['#F8FDFA', '#DDF0EA', '#B3D4D3', '#6C9C97'];
const PUFF_EYE: EyeColours = { iris: '#2E6E69', glint: '#7FCBC0', line: '#4E7C78', dark: '#1E2E36' };
const SCARF: Tones = ['#E2574B', '#C63F36', '#97303A', '#6A1D22'];
const WISP = '#8DBDB5';

/** A seed head at the end of a wisp: a little fluffy tuft. */
function seedTuft(x: number, y: number, r: number, seed: number) {
  return (
    <G key={seed}>
      <Path d={blob(x, y, r, { seed, lobes: 5, lobe: 0.32, wobble: 0.08 })} fill="#F7FCFA" stroke={WISP} strokeWidth={1.2} strokeLinejoin="round" />
      <Circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.35} fill="#fff" />
    </G>
  );
}

/** `scarf` dresses a Puffkin in a little knitted scarf: that's Bluster, Pip's Puffkin. */
export function PuffkinArt({ width, mood = 'happy', scarf = false }: { width: number; mood?: LexlingMood; scarf?: boolean }) {
  const g = useIds();
  const happy = mood === 'happy';
  const cross = mood === 'angry';
  const gusty = mood === 'blazing';
  const sad = mood === 'sad';
  const scared = mood === 'scared';
  const hurt = mood === 'hurt';
  const confused = mood === 'confused';
  const cx = 70;
  const cy = 64;
  const r = scared ? 27 : 30.5;
  // Its wisps are its mood: spread wide when glad, bristling when cross, pulled in when afraid,
  // drooping when low, curled when puzzled, streaming back in a gust when it's worked up.
  const reach = scared ? 40 : happy ? 55 : sad ? 50 : hurt ? 47 : 52;
  const lost = hurt ? [1, 4, 8, 11] : [];
  const wispSet = (count: number, turn: number, k: number, front: boolean) =>
    Array.from({ length: count }, (_, i) => i)
      .filter((i) => !front || !lost.includes(i))
      .map((i) => {
        let a = (i / count) * Math.PI * 2 - Math.PI / 2 + turn + 0.09 * Math.sin(i * 2.3);
        if (gusty) a += Math.atan2(Math.sin(Math.PI - a), Math.cos(Math.PI - a)) * 0.42;
        const len = reach * k * (0.9 + 0.14 * (((i * 7) % 5) / 4)) * (gusty ? 1.12 : 1);
        const x0 = cx + Math.cos(a) * r * 0.55;
        const y0 = cy + Math.sin(a) * r * 0.55;
        const x1 = cx + Math.cos(a) * len;
        let y1 = cy + Math.sin(a) * len;
        // sagging when sad, lifting a little when happy
        if (sad) y1 += 10 + 10 * Math.cos(a) ** 2;
        if (happy) y1 -= 4 * Math.cos(a) ** 2;
        const bend = cross ? 0 : confused ? 13 : gusty ? 9 : 5;
        const mx = (x0 + x1) / 2 - Math.sin(a) * bend;
        const my = (y0 + y1) / 2 + Math.cos(a) * bend;
        const curl = confused ? ` q${f1(Math.cos(a + 1.6) * 6)} ${f1(Math.sin(a + 1.6) * 6)} ${f1(Math.cos(a + 3) * 4)} ${f1(Math.sin(a + 3) * 4)}` : '';
        return { i, d: `M${f1(x0)} ${f1(y0)} Q${f1(mx)} ${f1(my)} ${f1(x1)} ${f1(y1)}${curl}`, x1, y1, s: (cross ? 3.4 : 4.2) * (0.85 + 0.3 * (((i * 3) % 4) / 3)) };
      });
  const back = wispSet(9, 0.35, 0.86, false);
  const wisps = wispSet(12, 0.08, 1, true);
  const tail = gusty ? 'M68 90 C60 102 50 108 40 114 C34 117 30 114 32 110' : sad ? 'M70 90 C66 106 74 116 68 126 C66 129 62 130 61 127' : 'M70 90 C64 104 76 114 70 124 C67 129 62 129 62 125';
  const L = 61;
  const R = 81;
  const Y = 63;
  return (
    <Svg width={width} height={width} viewBox="0 0 140 140">
      <GroundShadow g={g} id="ground" cx={70} cy={134} rx={30} ry={4} opacity={0.22} />
      {/* a curling wisp of a tail */}
      <Path d={tail} stroke={PUFF[3]} strokeWidth={5.2} strokeLinecap="round" fill="none" />
      <Path d={tail} stroke="#A9D6C4" strokeWidth={2.8} strokeLinecap="round" fill="none" />
      {/* wisps, each ending in a tuft: a cooler row behind, a brighter row in front */}
      {back.map((w) => (
        <Path key={`b${w.i}`} d={w.d} stroke={PUFF[2]} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      ))}
      {back.map((w) => (
        <Path key={`bt${w.i}`} d={blob(w.x1, w.y1, w.s * 0.85, { seed: w.i + 20, lobes: 5, lobe: 0.32, wobble: 0.08 })} fill={PUFF[1]} stroke={PUFF[2]} strokeWidth={1.1} />
      ))}
      {wisps.map((w) => (
        <Path key={`w${w.i}`} d={w.d} stroke={WISP} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      ))}
      {wisps.map((w) => seedTuft(w.x1, w.y1, w.s, w.i + 1))}
      {/* the puff itself */}
      <Paint g={g} id="puff" d={blob(cx, cy, r, { seed: 3, lobes: cross ? 14 : 11, lobe: cross ? 0.2 : 0.12, wobble: 0.05 })} t={PUFF} step={0.6} rim={0.6} w={2.4} />
      {/* the face, a touch larger than life so it reads at a distance */}
      <G transform="translate(71 68) scale(1.12) translate(-71 -68)">
      <Ellipse cx={54} cy={72} rx={5.5} ry={3.2} fill={BLUSH} opacity={happy ? 0.7 : hurt || scared ? 0.25 : 0.5} />
      <Ellipse cx={88} cy={72} rx={5.5} ry={3.2} fill={BLUSH} opacity={happy ? 0.7 : hurt || scared ? 0.25 : 0.5} />
      {happy ? (
        <G>
          {happyEye(L, Y + 1, 5.8, PUFF_EYE.dark!, 3)}
          {happyEye(R, Y + 1, 5.8, PUFF_EYE.dark!, 3)}
        </G>
      ) : hurt ? (
        <G>
          {squeezeEye(L, Y, 5.5, 1, PUFF_EYE.dark!, 2.8)}
          {squeezeEye(R, Y, 5.5, -1, PUFF_EYE.dark!, 2.8)}
        </G>
      ) : scared ? (
        <G>
          {ringEye(L, Y, 6.5, PUFF_EYE.dark!, 1.6)}
          {ringEye(R, Y, 6.5, PUFF_EYE.dark!, 1.6)}
        </G>
      ) : (
        <G>
          <Eye g={g} id="eye-l" x={L} y={Y} rx={confused ? 4.8 : 5.6} ry={confused ? 5.8 : 7} c={PUFF_EYE} lid={cross ? [0.22, 0.62] : gusty ? [0.2, 0.42] : sad ? [0.6, 0.2] : undefined} look={sad ? [0, 0.8] : confused ? [-0.5, -0.7] : [0.3, 0]} />
          <Eye g={g} id="eye-r" x={R} y={Y} rx={5.6} ry={confused ? 7.8 : 7} c={PUFF_EYE} lid={cross ? [0.62, 0.22] : gusty ? [0.42, 0.2] : sad ? [0.2, 0.6] : undefined} look={sad ? [0, 0.8] : confused ? [-0.5, -0.7] : [0.3, 0]} />
        </G>
      )}
      {happy || gusty ? (
        <G>
          <Path d="M64 73 Q71 75 78 73 Q76 82 71 82 Q66 82 64 73 Z" fill="#3A2A3A" />
          <Ellipse cx={71} cy={79.5} rx={3.2} ry={1.8} fill="#F28C9C" />
        </G>
      ) : scared ? (
        <Ellipse cx={71} cy={77} rx={2.8} ry={3.6} fill="#3A2A3A" />
      ) : (
        <Path d={sad || cross ? 'M65 79 Q71 74 77 79' : hurt || confused ? 'M64 77 q3.5 -3 7 0 t7 0' : 'M65 75 Q71 81 77 75'} stroke={PUFF_EYE.dark} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      )}
      </G>
      {scarf && (
        <G>
          {/* the trailing end, knotted at the back and streaming behind */}
          <Paint g={g} id="scarf-end" d="M50 88 Q42 104 26 114 L34 124 Q50 112 60 95 Z" t={SCARF} step={0.3} rim={0.35} w={2} />
          <Path d="M28 117 L21 122 M31 120 L25 127 M35 123 L31 130" stroke={SCARF[1]} strokeWidth={2.6} strokeLinecap="round" />
          <Path d="M47 102 L40 98 M42 109 L35 105" stroke={SCARF[3]} strokeWidth={1.4} strokeLinecap="round" opacity={0.6} />
          {/* the band round the neck, knitted in ribs */}
          <Paint g={g} id="scarf" d="M42 82 Q70 98 98 82 L97 94 Q70 110 43 94 Z" t={SCARF} step={0.35} rim={0.4} w={2.2} />
          {[50, 58, 66, 74, 82, 90].map((x) => (
            <Path key={x} d={`M${x} ${f1(91 - Math.abs(x - 70) * 0.28)} l2 3.6 l2 -3.6`} stroke={SCARF[3]} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.75} />
          ))}
          <Paint g={g} id="knot" d={oval(52, 95, 6.5, 6)} t={SCARF} step={0.2} rim={0.4} w={2} />
        </G>
      )}
      {/* mood marks */}
      {happy && (
        <G>
          <Path d="M112 30 Q118 24 124 22" stroke={WISP} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          {seedTuft(125, 21, 3.6, 41)}
          <Path d="M104 14 Q109 10 114 9" stroke={WISP} strokeWidth={1.2} strokeLinecap="round" fill="none" />
          {seedTuft(115, 9, 3, 42)}
        </G>
      )}
      {hurt && (
        <G>
          {seedTuft(16, 40, 3.6, 51)}
          {seedTuft(8, 62, 3, 52)}
          {seedTuft(22, 22, 2.8, 53)}
        </G>
      )}
      {gusty && (
        <G stroke={WISP} strokeWidth={2.2} strokeLinecap="round" fill="none">
          <Path d="M8 40 Q30 32 50 38 Q60 42 56 50 Q52 54 48 50" />
          <Path d="M4 92 Q26 86 44 92" />
          <Path d="M110 112 Q124 106 134 110" />
        </G>
      )}
      {scared && <Path d="M18 56 L10 52 M18 66 L9 66 M122 56 L130 52 M122 66 L131 66" stroke={WISP} strokeWidth={2} strokeLinecap="round" />}
      {sad && drop(54, 76, 2.8)}
      {confused && puzzled(112, 22, 6.5, PUFF[3])}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* Flickerwing                                                         */
/* ------------------------------------------------------------------ */

export const FLICKERWING_ASPECT = 150 / 120;

const MOTH: Tones = ['#FFD9A6', '#F2B077', '#C77B58', '#86452A'];
const MOTH_WING: Tones = ['#FFF1D6', '#F6D5AA', '#D9A982', '#93593A'];
const MOTH_WING_FAR: Tones = ['#EBCBA2', '#DBB08A', '#BC8C6C', '#86502F'];
const MOTH_EYE: EyeColours = { iris: '#8A4A22', glint: '#E8A050', line: '#86452A', dark: '#2A1A1E' };

/** A broad, soft moth wing, its root at the origin, reaching up. */
const MOTH_WING_PATH = 'M0 0 C-16 -4 -23 -25 -16 -40 C-9 -53 13 -52 17 -39 C21 -26 12 -6 0 0 Z';
/** A feathery antenna tip. */
const FEATHER = 'M0 0 C-5 -3 -6 -10 -2 -15 C3 -11 4 -4 0 0 Z';

/**
 * A moth-sized fire Lexling with a fuzzy body, soft wings and feathery
 * antennae. Its coal tail is its mood: bright and haloed when content,
 * redder when cross, dim when sad or hurt, nearly out when frightened, white
 * hot when fanned.
 */
export function FlickerwingArt({ width, mood = 'happy' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  const dark = mood === 'scared';
  const dim = mood === 'sad' || mood === 'hurt';
  const hot = mood === 'blazing';
  const cross = mood === 'angry';
  const happy = mood === 'happy';
  const confused = mood === 'confused';
  const coal: Tones = dark
    ? ['#8E8076', '#675950', '#463C36', '#2E2622']
    : dim
      ? ['#E3A070', '#B8643A', '#7E3E2A', '#5A2A1A']
      : hot
        ? ['#FFFFF2', '#FFE68A', '#FFA830', '#C25418']
        : cross
          ? ['#FFD47A', '#FF8A2A', '#D8401A', '#8A2A12']
          : ['#FFF6C2', '#FFC03A', '#EE6A1E', '#A8401A'];
  const glow = dark ? 0 : dim ? 0.28 : hot ? 1 : happy ? 0.9 : cross ? 0.7 : confused ? 0.6 : 0.8;
  // Wings rise when it's content, droop when it's low and fold flat when it's frightened.
  const tilt = dark ? -62 : dim ? -30 : happy || hot ? 8 : cross ? -6 : 0;
  // Antennae: perky, laid back in fright, drooping when low, thrust forward when cross.
  const feelers = dark
    ? { a: 'M94 44 Q86 32 74 28', b: 'M104 46 Q100 34 90 26', ta: [74, 28, -110], tb: [90, 26, -100] }
    : dim
      ? { a: 'M94 44 Q98 34 108 32', b: 'M104 46 Q114 38 124 42', ta: [108, 32, 100], tb: [124, 42, 130] }
      : cross
        ? { a: 'M94 44 Q102 34 114 30', b: 'M104 46 Q116 40 128 40', ta: [114, 30, 70], tb: [128, 40, 90] }
        : { a: 'M94 43 Q95 30 102 20', b: 'M104 46 Q112 34 124 28', ta: [102, 20, 20], tb: [124, 28, 55] };
  const L = 90;
  const R = 110;
  const Y = 67;
  return (
    <Svg width={width} height={width / FLICKERWING_ASPECT} viewBox="0 0 150 120">
      <GroundShadow g={g} id="ground" cx={86} cy={114} rx={32} ry={4.5} opacity={0.24} />
      {halo(g, 'halo', 30, 82, hot ? 40 : 32, hot ? 40 : 32, cross ? '#FF8A3A' : '#FFC34A', glow)}
      {/* wings, behind the body: the far one darker */}
      <G transform={`translate(80 53) rotate(${-44 + tilt}) scale(0.9)`}>
        <Paint g={g} id="wing-far" d={MOTH_WING_PATH} t={MOTH_WING_FAR} step={0.35} rim={0} w={2.6} />
      </G>
      <G transform={`translate(92 50) rotate(${-12 + tilt}) scale(0.86)`}>
        <Paint g={g} id="wing" d={MOTH_WING_PATH} t={MOTH_WING} step={0.35} rim={0.6} w={2.6} />
        <Circle cx={1} cy={-30} r={7} fill="#F2A65A" stroke="#B8582E" strokeWidth={1.6} />
        <Circle cx={1} cy={-30} r={3} fill="#8A3A22" />
        <Circle cx={-0.5} cy={-31.5} r={1.1} fill="#FFE9CC" />
      </G>
      {/* a striped abdomen, like a firefly's, ending in the coal */}
      <Paint g={g} id="tail" d="M72 74 C60 69 46 72 37 82 C45 93 60 96 72 92 Z" t={MOTH} step={0.3} rim={0.4} w={2.6} />
      <Path d="M58 72 Q54 83 58 94 M48 75 Q45 83 48 92" stroke={MOTH[2]} strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.8} />
      {/* the coal glows from inside; a crust of ash creeps over it as its spirits sink */}
      <Defs>
        <RadialGradient id={g('coal')} cx="0.45" cy="0.45" r="0.6">
          <Stop offset="0" stopColor={coal[0]} />
          <Stop offset="0.55" stopColor={coal[1]} />
          <Stop offset="1" stopColor={coal[2]} />
        </RadialGradient>
      </Defs>
      <Path d={blob(30, 83, 13, { seed: 7, lobes: 5, lobe: 0.05, wobble: 0.07 })} fill={`url(#${g('coal')})`} stroke={coal[3]} strokeWidth={2.6} strokeLinejoin="round" />
      <G fill="#4A3530" opacity={dark ? 0.92 : dim ? 0.7 : 0.4}>
        <Path d="M19 84 L24 78 L28 83 L23 90 Z" />
        <Path d="M31 92 L38 88 L41 93 L35 95 Z" />
        <Path d="M33 71 L40 74 L36 79 L31 76 Z" />
        {(dark || dim) && <Path d="M24 72 L30 70 L29 77 L23 78 Z M38 80 L43 82 L41 87 L36 86 Z" />}
      </G>
      {dark && (
        <G>
          <Path d="M24 89 L30 84 L36 87" stroke="#FF7A2A" strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.85} />
          <Circle cx={30} cy={84.5} r={1.8} fill="#FF8A3A" />
        </G>
      )}
      {!dark && <Circle cx={26} cy={79} r={3} fill="#fff" opacity={dim ? 0.25 : 0.7} />}
      {hot && (
        <G>
          {spark(16, 58, 3.6, '#FFE070')}
          {spark(34, 50, 2.8, '#FFF6C0')}
          {spark(8, 72, 2.4, '#FFB52E')}
          {spark(48, 62, 2.2, '#FFE070')}
        </G>
      )}
      {mood === 'hurt' && puff(30, 60, 6, '#EEEAEC', '#BFB8C2', 0.75)}
      {/* feet, then the fuzzy body with a pale ruff */}
      <Paint g={g} id="foot-l" d={oval(80, 102, 6, 4.5)} t={MOTH} step={0.15} rim={0} w={2.2} />
      <Paint g={g} id="foot-r" d={oval(97, 103, 6, 4.5)} t={MOTH} step={0.15} rim={0} w={2.2} />
      <Paint g={g} id="body" d={furry(90, 71, 27, 27, [[-Math.PI / 2, 0.7, 5, 7], [Math.PI, 0.55, 4, 6], [0.45, 0.5, 3.5, 6], [Math.PI / 2, 0.6, 4, 8]])} t={MOTH} step={0.55} rim={0.6} w={2.8} />
      <Path d={blob(98, 89, 13, { seed: 12, lobes: 10, lobe: 0.14, wobble: 0.05, squash: 0.55 })} fill="#FFF2DC" opacity={0.8} />
      {/* feathery antennae */}
      <Path d={feelers.a} stroke={MOTH[3]} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d={feelers.b} stroke={MOTH[3]} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Paint g={g} id="feather-a" d={FEATHER} t={MOTH} step={0.15} rim={0} w={2} transform={`translate(${feelers.ta[0]} ${feelers.ta[1]}) rotate(${feelers.ta[2]}) scale(1.15)`} />
      <Paint g={g} id="feather-b" d={FEATHER} t={MOTH} step={0.15} rim={0} w={2} transform={`translate(${feelers.tb[0]} ${feelers.tb[1]}) rotate(${feelers.tb[2]}) scale(1.15)`} />
      {/* cheeks, eyes, brows, mouth */}
      <Ellipse cx={80} cy={81} rx={5.5} ry={3.2} fill="#F07A6A" opacity={dark ? 0.2 : happy ? 0.65 : 0.45} />
      <Ellipse cx={117} cy={81} rx={4.5} ry={3.2} fill="#F07A6A" opacity={dark ? 0.2 : happy ? 0.65 : 0.45} />
      {happy ? (
        <G>
          {happyEye(L, Y + 1, 8, MOTH_EYE.dark!, 3.6)}
          {happyEye(R, Y + 1, 8, MOTH_EYE.dark!, 3.6)}
        </G>
      ) : mood === 'hurt' ? (
        <G>
          {squeezeEye(L, Y, 7.5, 1, MOTH_EYE.dark!, 3.6)}
          {squeezeEye(R, Y, 7.5, -1, MOTH_EYE.dark!, 3.6)}
        </G>
      ) : dark ? (
        <G>
          {ringEye(L, Y, 10, MOTH_EYE.dark!, 2.2, [0.4, 0])}
          {ringEye(R, Y, 10, MOTH_EYE.dark!, 2.2, [0.4, 0])}
        </G>
      ) : (
        <G>
          <Eye g={g} id="eye-l" x={L} y={Y} rx={confused ? 7.2 : 8.5} ry={confused ? 8.5 : 10} c={hot ? { ...MOTH_EYE, iris: '#C8641E', glint: '#FFD45A' } : MOTH_EYE} lid={cross || hot ? [0.22, 0.58] : mood === 'sad' ? [0.6, 0.2] : undefined} look={mood === 'sad' ? [0, 0.8] : confused ? [-0.5, -0.8] : [0.3, 0.1]} />
          <Eye g={g} id="eye-r" x={R} y={Y} rx={8.5} ry={confused ? 11 : 10} c={hot ? { ...MOTH_EYE, iris: '#C8641E', glint: '#FFD45A' } : MOTH_EYE} lid={cross || hot ? [0.58, 0.22] : mood === 'sad' ? [0.2, 0.6] : undefined} look={mood === 'sad' ? [0, 0.8] : confused ? [-0.5, -0.8] : [0.3, 0.1]} />
        </G>
      )}
      {dark && <Path d="M81 53 L95 49 M119 53 L105 49" stroke={MOTH[3]} strokeWidth={3} strokeLinecap="round" />}
      {happy || hot ? (
        <G>
          <Path d="M93 82 Q100 84 107 82 Q105 91 100 91 Q95 91 93 82 Z" fill="#4A2228" />
          <Ellipse cx={100} cy={88.5} rx={3.2} ry={1.8} fill="#F28C9C" />
        </G>
      ) : (
        <Path
          d={dark || confused ? 'M93 86 q3.5 -3 7 0 t7 0' : dim || cross ? 'M94 88 Q100 82 106 88' : 'M94 84 Q100 90 106 84'}
          stroke={MOTH_EYE.dark}
          strokeWidth={2.8}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {dark && drop(122, 56, 3.2)}
      {mood === 'sad' && drop(82, 84, 2.8)}
      {confused && puzzled(136, 50, 6.5, MOTH[3])}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* Cragling                                                            */
/* ------------------------------------------------------------------ */

export const CRAGLING_ASPECT = 190 / 140;

const CRAG: Tones = ['#B4A08A', '#8F7D6C', '#66606E', '#3E342D'];
const CLAW: Tones = ['#B1B8BB', '#8C959B', '#676F80', '#3C3F4C'];
const CLAW_FAR: Tones = ['#8F979C', '#757E86', '#59606E', '#33363F'];
const CRAG_LEG = ['#3A2C24', '#7A6352', '#A08670'];
const CRAG_LEG_FAR = ['#2C211B', '#5C4A3E', '#78624F'];
const CRAG_EYE: EyeColours = { iris: '#5A4A3A', glint: '#A8906C', line: '#3C3F4C', dark: '#221C1E' };
const EYEBALL: Tones = ['#F1EADF', '#DCD2C4', '#B4AA9E', '#3C3F4C'];

/** The boulder on its back: chunky, with flat facets and a chip out of its crown. */
const CRAG_SHELL = 'M14 108 L17 90 L24 78 L34 67 L46 58 L55 53 L59 47 L66 51 L76 45 L94 43 L108 46 L120 52 L130 60 L138 72 L142 86 L145 108 Z';
/** Its facets, lit from the upper left: the crown catches the light, the front face is in shade. */
const CRAG_CROWN = 'M46 58 L55 53 L59 47 L66 51 L76 45 L94 43 L108 46 L103 63 L85 71 L62 72 Z';
const CRAG_FLANK = 'M14 108 L17 90 L24 78 L34 67 L46 58 L62 72 L57 90 L50 108 Z';
const CRAG_FRONT = 'M108 46 L120 52 L130 60 L138 72 L142 86 L145 108 L118 108 L115 84 L103 63 Z';

/** A crab leg as a painted tube: hip, knee, tip, the shin thinner than the thigh. */
type Leg = [number, number, number, number, number, number];

function crabLeg([hx, hy, kx, ky, tx, ty]: Leg, w: number, c: string[]) {
  const thigh = `M${hx} ${hy} L${kx} ${ky}`;
  const shin = `M${kx} ${ky} L${tx} ${ty}`;
  return (
    <G>
      <Path d={thigh} stroke={c[0]} strokeWidth={w + 2.6} strokeLinecap="round" />
      <Path d={shin} stroke={c[0]} strokeWidth={w * 0.7 + 2.6} strokeLinecap="round" />
      <Path d={thigh} stroke={c[1]} strokeWidth={w} strokeLinecap="round" />
      <Path d={shin} stroke={c[1]} strokeWidth={w * 0.7} strokeLinecap="round" />
      <Path d={`M${hx - 1} ${hy - 1} L${kx - 1} ${ky - 1}`} stroke={c[2]} strokeWidth={w * 0.32} strokeLinecap="round" opacity={0.8} />
    </G>
  );
}

const NEAR_LEGS: Leg[] = [
  [36, 106, 16, 96, 6, 128],
  [60, 110, 44, 106, 34, 130],
  [96, 110, 112, 106, 120, 130],
  [118, 106, 136, 98, 146, 126],
];
const FAR_LEGS: Leg[] = [
  [48, 104, 28, 92, 20, 124],
  [76, 106, 66, 104, 60, 128],
  [108, 104, 124, 96, 134, 124],
];
const NEAR_LEGS_TUCKED: Leg[] = [
  [36, 106, 22, 104, 14, 112],
  [116, 106, 130, 104, 136, 112],
];
const FAR_LEGS_TUCKED: Leg[] = [
  [50, 104, 36, 102, 28, 110],
  [104, 104, 118, 100, 126, 110],
];

/** One heavy stone pincer, wrist at the origin, pointing up, its gap facing forward. */
const CLAW_PALM = 'M-4 3 C-18 1 -22 -18 -17 -31 C-12 -43 6 -45 14 -35 C21 -26 19 -9 9 -1 C5 2 0 4 -4 3 Z';
const CLAW_FIXED = 'M-16 -26 C-22 -46 -14 -64 0 -72 C-2 -62 -4 -50 -2 -38 Z';
const CLAW_MOVING = 'M14 -30 C23 -42 23 -57 13 -68 C10 -58 6 -50 2 -42 Z';

type Arm = { from: [number, number]; bend: [number, number]; to: [number, number]; turn: number; size: number };

function CragArm({ g, id, arm: { from, bend, to, turn, size }, open, t }: { g: Ids; id: string; arm: Arm; open: boolean; t: Tones }) {
  const d = `M${from[0]} ${from[1]} Q${bend[0]} ${bend[1]} ${to[0]} ${to[1]}`;
  return (
    <G>
      <Path d={d} stroke={t[3]} strokeWidth={14 * size + 2.6} strokeLinecap="round" fill="none" />
      <Path d={d} stroke={t[1]} strokeWidth={14 * size} strokeLinecap="round" fill="none" />
      <Path d={d} stroke={t[0]} strokeWidth={4 * size} strokeLinecap="round" fill="none" opacity={0.7} transform="translate(-1.5 -1.5)" />
      <G transform={`translate(${to[0]} ${to[1]}) rotate(${turn}) scale(${size})`}>
        <Paint g={g} id={`${id}-fixed`} d={CLAW_FIXED} t={t} step={0.3} rim={0.4} w={2.6} />
        <G transform={open ? 'rotate(30 8 -36)' : 'rotate(-6 8 -36)'}>
          <Paint g={g} id={`${id}-moving`} d={CLAW_MOVING} t={t} step={0.25} rim={0.4} w={2.6} />
        </G>
        <Paint g={g} id={`${id}-palm`} d={CLAW_PALM} t={t} step={0.4} rim={0.45} w={2.6} />
        <Path d="M-10 -10 q3 -3 6 -2 M-11 -20 q3 -3 6 -2" stroke={t[3]} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.5} />
      </G>
    </G>
  );
}

/**
 * An earth Lexling of the Old Hollow: squat and crab-like under a faceted
 * boulder of a shell, with heavy stone pincers and grumpy stalk eyes.
 */
export function CraglingArt({ width, mood = 'angry' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  const fierce = mood === 'angry' || mood === 'blazing';
  const hurt = mood === 'hurt';
  const tucked = mood === 'scared';
  const sad = mood === 'sad';
  const happy = mood === 'happy';
  const confused = mood === 'confused';
  const arms: { far: Arm; near: Arm } = fierce
    ? { far: { from: [114, 88], bend: [136, 84], to: [136, 64], turn: -12, size: 0.7 }, near: { from: [122, 100], bend: [158, 100], to: [156, 72], turn: 10, size: 0.88 } }
    : hurt
      ? { far: { from: [114, 92], bend: [128, 104], to: [136, 106], turn: 72, size: 0.7 }, near: { from: [122, 104], bend: [136, 118], to: [146, 118], turn: 82, size: 0.82 } }
      : tucked
        ? { far: { from: [116, 92], bend: [128, 92], to: [128, 82], turn: -4, size: 0.64 }, near: { from: [122, 102], bend: [144, 102], to: [142, 88], turn: 4, size: 0.76 } }
        : happy
          ? { far: { from: [114, 88], bend: [136, 90], to: [140, 76], turn: 18, size: 0.7 }, near: { from: [122, 100], bend: [152, 106], to: [156, 90], turn: 26, size: 0.86 } }
          : { far: { from: [114, 90], bend: [136, 98], to: [142, 94], turn: 40, size: 0.7 }, near: { from: [122, 102], bend: [148, 112], to: [152, 106], turn: 48, size: 0.84 } };
  const sink = tucked ? 12 : hurt ? 4 : 0;
  // Stalk eyes: up and glaring, pulled down in fright, drooping when low, askew when puzzled.
  const eyes: [[number, number], [number, number]] = tucked
    ? [[109, 42], [126, 47]]
    : sad
      ? [[100, 44], [130, 50]]
      : confused
        ? [[100, 34], [128, 44]]
        : [[105, 34], [127, 39]];
  // How far the stone eyelids come down, back and front corner: grumpy even at rest.
  const lid = (i: number): [number, number] | null => {
    const inner = i === 0 ? 1 : 0;
    const slope = (a: number, b: number): [number, number] => (inner ? [a, b] : [b, a]);
    if (fierce) return slope(0.3, 0.7);
    if (sad) return slope(0.62, 0.3);
    if (mood === 'idle') return slope(0.3, 0.42);
    return null;
  };
  return (
    <Svg width={width} height={width / CRAGLING_ASPECT} viewBox="0 0 190 140">
      <GroundShadow g={g} id="ground" cx={86} cy={132} rx={80} ry={7} opacity={0.34} />
      <G transform={`translate(0 ${sink})`}>
        {(tucked ? FAR_LEGS_TUCKED : FAR_LEGS).map((l, i) => (
          <G key={i}>{crabLeg(l, 6, CRAG_LEG_FAR)}</G>
        ))}
        <CragArm g={g} id="arm-far" arm={arms.far} open={fierce} t={CLAW_FAR} />
        {/* stalk eyes, each in a stone socket with a heavy lid */}
        {eyes.map(([x, y], i) => {
          const stalk = `M${i ? 122 : 110} ${i ? 66 : 62} Q${i ? (x + 122) / 2 + 3 : (x + 110) / 2 - 3} ${(y + 62) / 2} ${x} ${y}`;
          const l = lid(i);
          return (
            <G key={i}>
              <Path d={stalk} stroke={CLAW[3]} strokeWidth={7.6} strokeLinecap="round" fill="none" />
              <Path d={stalk} stroke={CLAW[1]} strokeWidth={5} strokeLinecap="round" fill="none" />
              <Paint g={g} id={`ball${i}`} d={oval(x, y, 10.5, 10.5)} t={hurt || happy ? CLAW : EYEBALL} step={0.18} rim={0.5} w={2.4} />
              {hurt ? (
                squeezeEye(x, y, 5.5, i ? -1 : 1, CRAG_EYE.dark!, 3)
              ) : happy ? (
                happyEye(x, y + 1, 6, CRAG_EYE.dark!, 3)
              ) : (
                <Eye g={g} id={`eye${i}`} x={confused ? x + (i ? 3 : -2.5) : x + 1.5} y={sad ? y + 2.6 : confused ? y + (i ? 2.5 : -2.5) : y + 1} rx={tucked ? 4 : 5.6} ry={tucked ? 4.8 : 6.6} c={CRAG_EYE} look={tucked ? [0.4, 0.6] : [0.3, 0]} />
              )}
              {l && (
                <G>
                  <Defs>
                    <ClipPath id={g(`lid${i}`)}>
                      <Path d={oval(x, y, 11.6, 11.6)} />
                    </ClipPath>
                  </Defs>
                  <Path d={`M${x - 13} ${f1(y - 12)} L${x + 13} ${f1(y - 12)} L${x + 13} ${f1(y - 10.5 + 21 * l[1])} L${x - 13} ${f1(y - 10.5 + 21 * l[0])} Z`} fill={CLAW[1]} stroke={CLAW[3]} strokeWidth={2.4} strokeLinejoin="round" clipPath={`url(#${g(`lid${i}`)})`} />
                </G>
              )}
            </G>
          );
        })}
        {tucked && <Path d="M104 46 L112 42 M128 46 L136 50" stroke={CLAW[3]} strokeWidth={2.6} strokeLinecap="round" />}
        {/* the soft underbelly, then the boulder shell */}
        <Paint g={g} id="belly" d={oval(80, 108, 60, 9)} t={['#6A5A4E', '#57483E', '#433630', '#2E231D']} step={0.3} rim={0} w={2.2} />
        <Paint g={g} id="shell" d={CRAG_SHELL} t={CRAG} step={1.05} rim={0.4} w={2.6} />
        {/* facets: a cool lit crown, a warm flank, the front face in shade, edges where the planes meet */}
        <Path d={CRAG_CROWN} fill="#D6D4CC" opacity={0.5} />
        <Path d={CRAG_FLANK} fill="#C8A47E" opacity={0.3} />
        <Path d={CRAG_FRONT} fill="#4E4858" opacity={0.32} />
        <Path d="M46 58 L62 72 L85 71 L103 63 L108 46 M62 72 L57 90 L50 108 M103 63 L115 84 L118 108" stroke={CRAG[3]} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.45} />
        <G fill={CRAG[3]} opacity={0.3}>
          <Circle cx={36} cy={88} r={1.4} />
          <Circle cx={80} cy={88} r={1.2} />
          <Circle cx={92} cy={56} r={1.1} />
          <Circle cx={128} cy={80} r={1.2} />
          <Circle cx={70} cy={98} r={1.3} />
        </G>
        {/* chips and moss */}
        <Path d="M131 63 L136 70 L131 72 Z" fill={CRAG[0]} stroke={CRAG[3]} strokeWidth={1.2} strokeLinejoin="round" />
        <Path d="M36 98 L42 94 L44 100 Z" fill={CRAG[2]} opacity={0.6} />
        <Paint g={g} id="moss1" d={blob(52, 58, 8, { seed: 21, lobes: 8, lobe: 0.18, wobble: 0.1, squash: 0.6 })} t={MOSS} step={0.18} rim={0.4} w={1.5} />
        <Paint g={g} id="moss2" d={blob(90, 50, 5, { seed: 23, lobes: 7, lobe: 0.18, wobble: 0.1, squash: 0.6 })} t={MOSS} step={0.12} rim={0.4} w={1.4} />
        <Paint g={g} id="moss3" d={blob(30, 76, 5, { seed: 25, lobes: 7, lobe: 0.18, wobble: 0.1, squash: 0.7 })} t={MOSS} step={0.12} rim={0.4} w={1.4} />
        {hurt && (
          <G>
            <Path d="M82 46 L77 60 L85 69 L75 82 L81 96" stroke={CRAG[3]} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M85 69 L97 72" stroke={CRAG[3]} strokeWidth={2} strokeLinecap="round" />
            <Path d="M150 52 L157 48 L156 56 Z" fill={CRAG[1]} stroke={CRAG[3]} strokeWidth={1.2} strokeLinejoin="round" />
            {puff(64, 32, 7, '#EEE6DA', '#C7BBAA')}
            {puff(84, 22, 9, '#EEE6DA', '#C7BBAA')}
          </G>
        )}
        {(tucked ? NEAR_LEGS_TUCKED : NEAR_LEGS).map((l, i) => (
          <G key={i}>{crabLeg(l, 8, CRAG_LEG)}</G>
        ))}
        {/* mouth, on the front of the shell */}
        <G transform="translate(-4 -9)">
        {fierce ? (
          <G>
            <Path d="M122 94 Q132 89 142 93 L141 100 Q132 97 123 100 Z" fill="#2A1E1C" stroke={CRAG[3]} strokeWidth={1.6} strokeLinejoin="round" />
            <Path d="M126 94 L127 97.5 M131 92.5 L131 96.5 M136 92.5 L135.5 96.5" stroke="#F1EADF" strokeWidth={1.8} strokeLinecap="round" />
          </G>
        ) : happy ? (
          <Path d="M122 93 Q132 98 142 93 Q138 102 132 102 Q125 102 122 93 Z" fill="#2A1E1C" stroke={CRAG[3]} strokeWidth={1.6} strokeLinejoin="round" />
        ) : (
          <Path
            d={tucked ? 'M126 97 q3 -3 6 0 t6 0 t6 0' : hurt || confused ? 'M123 97 q3.5 -3.5 7 0 t7 0 t7 0' : sad ? 'M123 100 Q132 92 141 99' : 'M123 99 Q132 93 141 97'}
            stroke={CRAG[3]}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        )}
        </G>
        <CragArm g={g} id="arm-near" arm={arms.near} open={fierce} t={CLAW} />
      </G>
      {mood === 'blazing' && (
        <G>
          {puff(176, 52, 5, '#EEE6DA', '#C7BBAA', 0.8)}
          <Path d="M170 30 L176 26 L177 33 Z M182 40 L187 38 L186 44 Z" fill={CRAG[1]} stroke={CRAG[3]} strokeWidth={1.2} strokeLinejoin="round" />
        </G>
      )}
      {tucked && drop(150, 70, 3.4)}
      {sad && drop(132, 64, 2.8)}
      {confused && puzzled(150, 24, 7, CRAG[3])}
    </Svg>
  );
}

export const CINDERBACK_ASPECT = 240 / 180;

/**
 * Old Cinderback: an Emberhog older than anyone at the Lodge. Built like
 * EmberhogArt, but heavier, with a hump over the shoulders, grey at the snout
 * and the cheek, scarred along the quills and face, with a notched ear,
 * yellowed tusks and darker flames that burn white-hot at the tips when fanned.
 */
export function CinderbackArt({ width, mood = 'angry' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  return (
    <Svg width={width} height={width / CINDERBACK_ASPECT} viewBox="0 0 240 180">
      <G transform="translate(3 1) scale(1.06)">
        <Hog g={g} mood={mood} old />
      </G>
    </Svg>
  );
}
