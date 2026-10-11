import { Circle, ClipPath, Defs, G, LinearGradient, Path, Pattern, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * The painter's kit: the few techniques that turn flat shapes into an
 * illustration (art direction in docs/art-direction.md).
 *
 *  - procedural silhouettes (tree lines, ridges, foliage), seeded so a scene
 *    draws the same every time and on every device;
 *  - light: a glow for the sun or a lamp, soft shafts falling from it;
 *  - air: fog bands that push far layers back;
 *  - surface: a fine paper grain and a vignette over the whole picture.
 *
 * Everything here is plain SVG that react-native-svg draws on iOS, Android
 * and the web (no filters).
 */

export type Ids = (n: string) => string;

/** A small seeded random number generator (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth seeded noise in [-1, 1]: a few sine waves with random phases. */
export function wave(seed: number, octaves = 3): (t: number) => number {
  const r = rng(seed);
  const parts = Array.from({ length: octaves }, (_, i) => ({ f: (i + 1) * (0.7 + r() * 0.9), p: r() * Math.PI * 2, a: 1 / (i + 1) }));
  const total = parts.reduce((s, x) => s + x.a, 0);
  return (t) => parts.reduce((s, x) => s + x.a * Math.sin(t * x.f + x.p), 0) / total;
}

const f1 = (n: number) => Math.round(n * 10) / 10;

/**
 * A silhouette across the picture, closed to the bottom: a far ridge, a
 * hill, or (with `crowns`) a tree line of rounded crowns.
 */
export function ridge({
  y,
  amp = 10,
  seed,
  freq = 1,
  crowns = 0,
  crownAmp = 0,
  from = -10,
  to = 410,
  bottom = 470,
  step = 5,
}: {
  y: number;
  amp?: number;
  seed: number;
  freq?: number;
  /** How many rounded crowns across the width (0 for a smooth line). */
  crowns?: number;
  crownAmp?: number;
  from?: number;
  to?: number;
  bottom?: number;
  step?: number;
}): string {
  const n = wave(seed);
  const r = rng(seed + 7);
  const widths: number[] = [];
  if (crowns > 0) for (let i = 0; i < crowns * 1.4; i++) widths.push(0.6 + r() * 0.8);
  const total = widths.reduce((s, w) => s + w, 0) || 1;
  const crownAt = (x: number) => {
    if (!crowns) return 0;
    const t = ((x - from) / (to - from)) * total;
    let acc = 0;
    for (let i = 0; i < widths.length; i++) {
      const w = widths[i]!;
      if (t <= acc + w) {
        const u = (t - acc) / w;
        // a rounded crown, taller in the middle, each one a slightly different height
        return Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2)) * crownAmp * (0.55 + ((i * 37) % 10) / 22);
      }
      acc += w;
    }
    return 0;
  };
  let d = `M${from} ${bottom} L${from} ${f1(y + amp * n(0))}`;
  for (let x = from; x <= to; x += step) d += ` L${f1(x)} ${f1(y + amp * n(((x - from) / (to - from)) * Math.PI * 2 * freq) - crownAt(x))}`;
  return `${d} L${to} ${bottom} Z`;
}

/** An organic clump (foliage, a bush, a cloud): a circle with lobes and a little wobble. */
export function blob(cx: number, cy: number, r: number, { seed, lobes = 7, lobe = 0.18, wobble = 0.08, squash = 1 }: { seed: number; lobes?: number; lobe?: number; wobble?: number; squash?: number }): string {
  const n = wave(seed, 2);
  const steps = 72;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI * 2;
    const rr = r * (1 + lobe * Math.abs(Math.sin((th * lobes) / 2)) + wobble * n(th * 2));
    const x = cx + rr * Math.cos(th);
    const y = cy + rr * Math.sin(th) * squash;
    d += `${i ? ' L' : 'M'}${f1(x)} ${f1(y)}`;
  }
  return `${d} Z`;
}

/** A single blade or frond, curving from its root at (x, y). */
export function blade(x: number, y: number, h: number, lean: number, w = 3): string {
  return `M${f1(x - w)} ${f1(y)} Q${f1(x + lean * 0.4)} ${f1(y - h * 0.6)} ${f1(x + lean)} ${f1(y - h)} Q${f1(x + lean * 0.3 + w * 0.4)} ${f1(y - h * 0.55)} ${f1(x + w)} ${f1(y)} Z`;
}

/** A tuft of grass: several blades from one root. */
export function tuft(x: number, y: number, h: number, seed: number, count = 6): string {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < count; i++) d += blade(x + (r() - 0.5) * h * 0.5, y, h * (0.55 + r() * 0.6), (r() - 0.5) * h * 0.9, 1.6 + r() * 1.6) + ' ';
  return d.trim();
}

/** A soft round glow: the sun through leaves, a lamp, a fire. */
export function Glow({ g, id, cx, cy, r, color, opacity = 1 }: { g: Ids; id: string; cx: number; cy: number; r: number; color: string; opacity?: number }) {
  return (
    <G>
      <Defs>
        <RadialGradient id={g(id)} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.35" stopColor={color} stopOpacity={opacity * 0.45} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${g(id)})`} />
    </G>
  );
}

/** Shafts of light falling from (x, y) at an angle (degrees from straight down, positive leans right). */
export function Shafts({ g, id, x, y, angle, length, count = 4, spread = 120, width = 26, color = '#FFF4D6', opacity = 0.28, seed }: { g: Ids; id: string; x: number; y: number; angle: number; length: number; count?: number; spread?: number; width?: number; color?: string; opacity?: number; seed: number }) {
  const r = rng(seed);
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = Math.cos(rad);
  const shafts = Array.from({ length: count }, (_, i) => {
    const off = (i / Math.max(1, count - 1) - 0.5) * spread + (r() - 0.5) * 16;
    const w0 = width * (0.4 + r() * 0.5);
    const w1 = width * (1.2 + r() * 1.4);
    const len = length * (0.7 + r() * 0.3);
    const sx = x + off;
    const ex = sx + dx * len;
    const ey = y + dy * len;
    return { pts: `${f1(sx - w0 / 2)},${f1(y)} ${f1(sx + w0 / 2)},${f1(y)} ${f1(ex + w1 / 2)},${f1(ey)} ${f1(ex - w1 / 2)},${f1(ey)}`, o: opacity * (0.5 + r() * 0.5) };
  });
  return (
    <G>
      <Defs>
        <LinearGradient id={g(id)} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={1} />
          <Stop offset="0.6" stopColor={color} stopOpacity={0.45} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {shafts.map((s, i) => (
        <Polygon key={i} points={s.pts} fill={`url(#${g(id)})`} opacity={s.o} />
      ))}
    </G>
  );
}

/** A band of mist: strongest at `y`, fading above and below. */
export function Fog({ g, id, y, height, color, opacity = 0.5, x = 0, width = 400 }: { g: Ids; id: string; y: number; height: number; color: string; opacity?: number; x?: number; width?: number }) {
  return (
    <G>
      <Defs>
        <LinearGradient id={g(id)} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0} />
          <Stop offset="0.5" stopColor={color} stopOpacity={opacity} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x={x} y={y - height / 2} width={width} height={height} fill={`url(#${g(id)})`} />
    </G>
  );
}

/** A vertical gradient filling a rectangle (sky, water, a floor). */
export function Fill({ g, id, stops, x = 0, y = 0, width = 400, height = 460, d }: { g: Ids; id: string; stops: [number, string, number?][]; x?: number; y?: number; width?: number; height?: number; d?: string }) {
  return (
    <G>
      <Defs>
        <LinearGradient id={g(id)} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([o, c, a], i) => (
            <Stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
          ))}
        </LinearGradient>
      </Defs>
      {d ? <Path d={d} fill={`url(#${g(id)})`} /> : <Rect x={x} y={y} width={width} height={height} fill={`url(#${g(id)})`} />}
    </G>
  );
}

/** Fine paper grain over the whole picture: tiny light and dark specks on a repeating tile. */
export function Grain({ g, id = 'grain', width = 400, height = 460, opacity = 1, seed = 11 }: { g: Ids; id?: string; width?: number; height?: number; opacity?: number; seed?: number }) {
  const r = rng(seed);
  const specks = Array.from({ length: 90 }, () => ({ x: f1(r() * 40), y: f1(r() * 40), s: f1(0.25 + r() * 0.45), dark: r() < 0.5, o: 0.03 + r() * 0.05 }));
  return (
    <G opacity={opacity}>
      <Defs>
        <Pattern id={g(id)} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          {specks.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={p.s} fill={p.dark ? '#2B1E10' : '#FFF8E8'} opacity={p.o} />
          ))}
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${g(id)})`} />
    </G>
  );
}

/** Darkened edges that pull the eye to the middle of the picture. */
export function Vignette({ g, id = 'vignette', width = 400, height = 460, color = '#120C14', strength = 0.35, cy = 0.45 }: { g: Ids; id?: string; width?: number; height?: number; color?: string; strength?: number; cy?: number }) {
  return (
    <G>
      <Defs>
        <RadialGradient id={g(id)} cx="0.5" cy={cy} r="0.75">
          <Stop offset="0" stopColor={color} stopOpacity={0} />
          <Stop offset="0.6" stopColor={color} stopOpacity={0} />
          <Stop offset="1" stopColor={color} stopOpacity={strength} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${g(id)})`} />
    </G>
  );
}

/**
 * A form painted the Lexbound way (docs/art-direction.md): its shade colour,
 * a mid tone and the lit colour stepped toward the upper left (so two soft
 * bands of shade sit on the lower right), a rim of light on the upper-left
 * edge, then its outline. `step` scales the offsets for small or large forms
 * (1 suits a form about 100 units across).
 */
export function Shaded({ g, id, d, shade, mid, lit, line, lineWidth = 2.4, rim = 0.55, step = 1, transform }: { g: Ids; id: string; d: string; shade: string; mid: string; lit: string; line?: string; lineWidth?: number; rim?: number; step?: number; transform?: string }) {
  const o = (x: number, y: number) => `translate(${f1(x * step)} ${f1(y * step)})`;
  return (
    <G transform={transform}>
      <Defs>
        <ClipPath id={g(id)}>
          <Path d={d} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${g(id)})`}>
        <Path d={d} fill={shade} />
        <Path d={d} fill={mid} transform={o(-6, -6)} />
        <Path d={d} fill={lit} transform={o(-12, -11)} />
        {rim > 0 && <Path d={d} stroke="#FFFFFF" strokeWidth={8 * step} fill="none" opacity={rim} transform={o(4, 4)} />}
      </G>
      {line && <Path d={d} stroke={line} strokeWidth={lineWidth} strokeLinejoin="round" strokeLinecap="round" fill="none" />}
    </G>
  );
}

/** A soft contact shadow on the ground under a creature or prop. */
export function GroundShadow({ g, id, cx, cy, rx, ry, opacity = 0.32 }: { g: Ids; id: string; cx: number; cy: number; rx: number; ry: number; opacity?: number }) {
  return (
    <G>
      <Defs>
        <RadialGradient id={g(id)} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#1A1208" stopOpacity={opacity} />
          <Stop offset="1" stopColor="#1A1208" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path d={`M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`} fill={`url(#${g(id)})`} />
    </G>
  );
}

/** Mixes two hex colours: t = 0 gives a, t = 1 gives b. For atmospheric perspective (far things lean toward the haze). */
export function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t)
    .toString(16)
    .padStart(2, '0');
  return `#${c(r1!, r2!)}${c(g1!, g2!)}${c(b1!, b2!)}`;
}
