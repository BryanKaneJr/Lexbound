import { memo, useId, useMemo } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { blade, blob, Fill, Fog, Glow, GroundShadow, type Ids, mix, ridge, rng, Shafts, Shaded, tuft, wave } from './paint';

/**
 * Painted locations (bible §9, §52): one illustration each, drawn in code
 * so the prototype ships with no image files. Each fills its box (slice),
 * with the ground in the lower fifth, where scenes stand their actors.
 * Style rules: docs/art-direction.md; `forest_stream` is the reference.
 */
type Bg = (g: (n: string) => string) => React.ReactNode;

const f1 = (n: number) => Math.round(n * 10) / 10;

/** Three tones of a form: lit edge, body and shaded pocket (foliage), or shadow, body and lit top (rocks). */
type Tones = [string, string, string];

/** Pushes each tone toward the haze (atmospheric perspective). */
function hazed([a, b, c]: Tones, haze: string, t: number): Tones {
  return [mix(a, haze, t), mix(b, haze, t), mix(c, haze, t)];
}

/**
 * A clump of leaves with volume, cel-shaded like the characters: a soft lit
 * rim up and to the left, the body, a ragged crescent of shade on the lower
 * right, a lit patch toward the light, and a few leafy dabs breaking up the
 * lit edge. `flat` keeps only the rim and body, for clumps far off in the
 * haze where the rest would not show.
 */
function leafy(cx: number, cy: number, rad: number, seed: number, [lit, mid, dark]: Tones, dabs = 4, flat = false) {
  const r = rng(seed + 5);
  const rim = <Path d={blob(cx - rad * 0.1, cy - rad * 0.12, rad, { seed, lobes: 9, lobe: 0.2, wobble: 0.1 })} fill={mix(lit, mid, 0.35)} />;
  const body = <Path d={blob(cx, cy, rad * 0.97, { seed: seed + 1, lobes: 8, lobe: 0.2, wobble: 0.1 })} fill={mid} />;
  if (flat) {
    return (
      <G key={`lf${seed}`}>
        {rim}
        {body}
      </G>
    );
  }
  return (
    <G key={`lf${seed}`}>
      {rim}
      {body}
      <Path d={blob(cx + rad * 0.16, cy + rad * 0.2, rad * 0.76, { seed: seed + 2, lobes: 7, lobe: 0.16, wobble: 0.16 })} fill={dark} />
      <Path d={blob(cx - rad * 0.03, cy - rad * 0.03, rad * 0.7, { seed: seed + 3, lobes: 7, lobe: 0.18, wobble: 0.16 })} fill={mid} />
      <Path
        d={[
          [-0.32, -0.3, 0.27],
          [-0.12, -0.4, 0.21],
          [-0.4, -0.1, 0.18],
        ]
          .map(([dx, dy, k], i) => blob(cx + rad * dx!, cy + rad * dy!, rad * k!, { seed: seed + 4 + i, lobes: 4, lobe: 0.14, wobble: 0.22 }))
          .join(' ')}
        fill={mix(lit, mid, 0.28)}
      />
      {Array.from({ length: dabs }, (_, i) => {
        const th = Math.PI * (1.0 + r() * 0.55);
        const d = rad * (0.74 + r() * 0.2);
        return <Path key={i} d={blob(cx - rad * 0.08 + Math.cos(th) * d, cy - rad * 0.1 + Math.sin(th) * d, rad * (0.05 + r() * 0.05), { seed: seed + 10 + i, lobes: 3, lobe: 0.12, wobble: 0.2 })} fill={lit} />;
      })}
    </G>
  );
}

/** A rock: its shadow, body and lit top, as in the stream, in the scene's colours. */
function rock(cx: number, cy: number, s: number, seed: number, [shadow, body, lit]: Tones) {
  return (
    <G key={`rk${seed}`}>
      <Path d={blob(cx + 2 * s, cy + 4 * s, 15 * s, { seed, lobes: 3, lobe: 0.1, squash: 0.45 })} fill={shadow} opacity={0.6} />
      <Path d={blob(cx, cy, 14 * s, { seed: seed + 1, lobes: 3, lobe: 0.12, squash: 0.62 })} fill={body} />
      <Path d={blob(cx - 3 * s, cy - 3 * s, 9 * s, { seed: seed + 2, lobes: 2, lobe: 0.1, squash: 0.55 })} fill={lit} />
    </G>
  );
}

/** Grass with light on it: a lit tuft, and the same tuft a step to the right in shade over it. */
function grass(x: number, y: number, h: number, seed: number, dark: string, lit: string, count = 6) {
  return (
    <G key={`gr${seed}`}>
      <Path d={tuft(x - h * 0.07, y, h, seed, count)} fill={lit} />
      <Path d={tuft(x + h * 0.06, y, h * 0.94, seed, count)} fill={dark} />
    </G>
  );
}

/**
 * A fern frond rooted at (x, y): a tapering stem with leaflets along both
 * sides, longest near the root. `angle` leans it (degrees from upright,
 * positive to the right; past 90 it droops) and `curl` bows it sideways.
 */
function frond(x: number, y: number, len: number, angle: number, curl: number, count = 10): string {
  const a = (angle * Math.PI) / 180;
  const tx = x + Math.sin(a) * len;
  const ty = y - Math.cos(a) * len;
  const cx = (x + tx) / 2 + Math.cos(a) * curl;
  const cy = (y + ty) / 2 + Math.sin(a) * curl;
  const at = (t: number) => {
    const u = 1 - t;
    const dx = 2 * u * (cx - x) + 2 * t * (tx - cx);
    const dy = 2 * u * (cy - y) + 2 * t * (ty - cy);
    const l = Math.hypot(dx, dy) || 1;
    return { px: u * u * x + 2 * u * t * cx + t * t * tx, py: u * u * y + 2 * u * t * cy + t * t * ty, ux: dx / l, uy: dy / l };
  };
  const one: string[] = [];
  const two: string[] = [];
  for (let i = 0; i <= 8; i++) {
    const { px, py, ux, uy } = at(i / 8);
    const w = 1.5 * (1 - i / 8) + 0.3;
    one.push(`${f1(px - uy * w)} ${f1(py + ux * w)}`);
    two.push(`${f1(px + uy * w)} ${f1(py - ux * w)}`);
  }
  let d = `M${one.join(' L')} L${two.reverse().join(' L')} Z`;
  for (let i = 0; i < count; i++) {
    const t = 0.1 + (0.86 * i) / count;
    const { px, py, ux, uy } = at(t);
    const L = len * 0.3 * (1 - t * 0.75);
    const w = L * 0.27;
    for (const s of [-1, 1]) {
      // leaflets sweep forward, toward the tip
      let vx = -uy * s * 0.85 + ux * 0.55;
      let vy = ux * s * 0.85 + uy * 0.55;
      const vl = Math.hypot(vx, vy);
      vx /= vl;
      vy /= vl;
      const mx = px + vx * L * 0.5;
      const my = py + vy * L * 0.5;
      d += ` M${f1(px)} ${f1(py)} Q${f1(mx - vy * w)} ${f1(my + vx * w)} ${f1(px + vx * L)} ${f1(py + vy * L)} Q${f1(mx + vy * w)} ${f1(my - vx * w)} ${f1(px)} ${f1(py)} Z`;
    }
  }
  return d;
}

/** A clump of fern fronds fanning from (x, y), leaning toward `dir` (1 right, -1 left). */
function ferns(x: number, y: number, dir: number, s: number, [a, b]: [string, string], seed: number, n = 6) {
  const r = rng(seed);
  return (
    <G key={`fn${seed}`}>
      {Array.from({ length: n }, (_, i) => {
        const ang = dir * (-14 + (i / (n - 1)) * 86 + (r() - 0.5) * 10);
        const len = s * (74 + r() * 46);
        return <Path key={i} d={frond(x + (r() - 0.5) * 12 * s, y, len, ang, dir * len * 0.16, 11)} fill={i % 2 ? a : b} />;
      })}
    </G>
  );
}

/** A cumulus cloud lit from the upper left: its shade, then the lit lobes a step up and to the left. */
function cloud(cx: number, cy: number, w: number, seed: number, lit: string, shade: string) {
  const parts: [number, number, number, number][] = [
    [-0.3, 0.04, 0.22, 0.85],
    [-0.04, -0.1, 0.3, 0.9],
    [0.27, -0.01, 0.23, 0.85],
    [0, 0.1, 0.52, 0.28],
  ];
  const d = (ox: number, oy: number, k: number) =>
    parts.map(([dx, dy, rr, sq], i) => blob(cx + dx * w + ox, cy + dy * w + oy, rr * w * k, { seed: seed + i, lobes: 5, lobe: 0.14, squash: sq })).join(' ');
  return (
    <G key={`cl${seed}`}>
      <Path d={d(0, 0, 1)} fill={shade} />
      <Path d={d(-w * 0.04, -w * 0.06, 0.95)} fill={lit} />
    </G>
  );
}

/** A trunk from above the picture down to its foot at (x, y), `w` wide, flaring at the root. */
function trunkD(x: number, y: number, w: number, top = -10, lean = 0): string {
  const h = y - top;
  return `M${f1(x - w * 0.45 + lean)} ${top} L${f1(x + w * 0.45 + lean)} ${top} C${f1(x + w * 0.5 + lean * 0.3)} ${f1(top + h * 0.55)} ${f1(x + w * 0.45)} ${f1(y - w * 1.4)} ${f1(x + w * 1.05)} ${y} L${f1(x - w)} ${y} C${f1(x - w * 0.45)} ${f1(y - w * 1.4)} ${f1(x - w * 0.5 + lean * 0.3)} ${f1(top + h * 0.55)} ${f1(x - w * 0.45 + lean)} ${top} Z`;
}

/** A point on a cubic curve, for placing things along a path's edge. */
function bez([a, b, c, d]: [number, number][], t: number): [number, number] {
  const u = 1 - t;
  const k = (i: 0 | 1) => u * u * u * a![i] + 3 * u * u * t * b![i] + 3 * u * t * t * c![i] + t * t * t * d![i];
  return [k(0), k(1)];
}

/** A circle as path data, so many dots can share one path. */
const dot = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0 Z`;

/** Wildflowers in a drift around (x, y): each a few petals round a bright eye, smaller with distance. */
function blooms(x: number, y: number, seed: number, colors: string[], stem: string, horizon = 300, eye = '#F6D86A') {
  const r = rng(seed);
  const s = 0.55 + Math.max(0, y - horizon) / 110;
  const c = colors[seed % colors.length]!;
  let stems = '';
  let leaves = '';
  let petals = '';
  let eyes = '';
  for (let i = 0; i < 5; i++) {
    const fx = x + (r() - 0.5) * 34 * s;
    const fy = y + (r() - 0.5) * 8 * s;
    const h = (2.5 + r() * 3.5) * s;
    const tx = fx + (r() - 0.5) * 2;
    const ty = fy - h;
    const p = 0.95 * s;
    stems += `M${f1(fx)} ${f1(fy)} Q${f1(fx)} ${f1(fy - h / 2)} ${f1(tx)} ${f1(ty)} `;
    leaves += `M${f1(fx - 2.5 * s)} ${f1(fy)} Q${f1(fx - 1.5 * s)} ${f1(fy - h * 0.6)} ${f1(fx)} ${f1(fy - h * 0.2)} Z `;
    for (let k = 0; k < 4; k++) petals += dot(tx + Math.cos(k * 1.57 + i) * p, ty + Math.sin(k * 1.57 + i) * p * 0.7, 1.05 * s) + ' ';
    eyes += dot(tx, ty, 0.55 * s) + ' ';
  }
  return (
    <G key={`bl${seed}`}>
      <Path d={stems} stroke={stem} strokeWidth={f1(0.7 * s)} fill="none" opacity={0.8} />
      <Path d={leaves} fill={stem} opacity={0.7} />
      <Path d={petals} fill={c} />
      <Path d={eyes} fill={eye} />
    </G>
  );
}

/** Dappled light on the ground: soft pale patches. */
function dapples(spots: [number, number, number][], color: string, opacity: number, key: string) {
  return (
    <G key={key}>
      {spots.map(([x, y, w], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.17} fill={color} opacity={opacity * (0.7 + ((i * 37) % 10) / 30)} />
      ))}
    </G>
  );
}

const BOOKS = ['#9A4636', '#BF8A3E', '#5A7A54', '#3A666C', '#68465F', '#D6C298', '#86563A', '#485878'];

/** One shelf of books standing on `floor` between x0 and x1, with now and then a gap, a lying stack or a jar. */
function shelfRow(x0: number, x1: number, floor: number, room: number, seed: number, extra?: 'stack' | 'jar') {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  // the light on each spine, its shaded side and its gilt bands share one path each
  let lit = '';
  let dark = '';
  let gilt = '';
  let k = 0;
  const rect = (x: number, y: number, w: number, h: number) => `M${f1(x)} ${f1(y)} h${f1(w)} v${f1(h)} h${f1(-w)} Z `;
  const book = (bx: number, w: number, h: number, c: string) => {
    out.push(<Rect key={k++} x={f1(bx)} y={f1(floor - h)} width={f1(w)} height={f1(h)} fill={c} />);
    lit += rect(bx, floor - h, 1.3, h);
    dark += rect(bx + w - 1.5, floor - h, 1.5, h);
    if (w > 7.5) gilt += rect(bx, floor - h + 3.5, w, 1.1) + rect(bx, floor - 5, w, 1.1);
  };
  const extraAt = extra ? x0 + (x1 - x0) * (0.35 + r() * 0.3) : Infinity;
  let x = x0 + 1;
  let placed = false;
  while (x < x1 - 4) {
    if (!placed && x >= extraAt) {
      placed = true;
      if (extra === 'stack') {
        for (let i = 0; i < 3; i++) {
          const w = 22 - i * 2.5;
          const y = floor - (i + 1) * 5.2;
          out.push(<Rect key={k++} x={f1(x + i * 1.2)} y={f1(y)} width={w} height={5} fill={BOOKS[(seed + i * 3) % BOOKS.length]!} />);
          lit += rect(x + i * 1.2, y, w, 1.1);
          dark += rect(x + i * 1.2, y + 3.9, w, 1.1);
        }
        x += 25;
      } else {
        out.push(
          <G key={k++}>
            <Path d={`M${f1(x + 2)} ${floor} L${f1(x + 1)} ${floor - 14} Q${f1(x + 1)} ${floor - 17} ${f1(x + 4)} ${floor - 17} L${f1(x + 10)} ${floor - 17} Q${f1(x + 13)} ${floor - 17} ${f1(x + 13)} ${floor - 14} L${f1(x + 12)} ${floor} Z`} fill="#8FB4A6" opacity={0.5} />
            <Rect x={f1(x + 2.5)} y={floor - 10} width={9} height={10} fill="#C4663C" opacity={0.85} />
            <Rect x={f1(x + 2)} y={floor - 20} width={10} height={3.5} rx={1} fill="#5A3828" />
            <Rect x={f1(x + 3.2)} y={floor - 15} width={1.4} height={12} fill="#FFFFFF" opacity={0.35} />
          </G>,
        );
        x += 17;
      }
      continue;
    }
    if (r() < 0.07) {
      x += 5 + r() * 4;
      continue;
    }
    const c = BOOKS[Math.floor(r() * BOOKS.length)]!;
    if (x1 - x < 17 && x1 - x > 9) {
      // the last book leans on the case
      const h = room * 0.8;
      out.push(
        <G key={k++} transform={`rotate(15 ${f1(x + 1)} ${floor})`}>
          <Rect x={f1(x + 1)} y={f1(floor - h)} width={7} height={f1(h)} fill={c} />
          <Rect x={f1(x + 1)} y={f1(floor - h)} width={1.3} height={f1(h)} fill={mix(c, '#FFE6BC', 0.35)} />
          <Rect x={f1(x + 6.5)} y={f1(floor - h)} width={1.5} height={f1(h)} fill={mix(c, '#1A0C12', 0.45)} />
        </G>,
      );
      break;
    }
    const w = Math.min(6 + r() * 5, x1 - x);
    if (w < 4) break;
    book(x, w, room * (0.6 + r() * 0.34), c);
    x += w + 0.5;
  }
  out.push(<Path key={k++} d={lit} fill="#FFE6BC" opacity={0.32} />);
  out.push(<Path key={k++} d={dark} fill="#1A0C12" opacity={0.42} />);
  out.push(<Path key={k++} d={gilt} fill="#F2D08A" opacity={0.5} />);
  return out;
}

/** A hanging lamp whose cap sits at (x, y), on a chain down from the beam. */
function lantern(g: Ids, id: string, x: number, y: number) {
  const m = '#3A261E';
  return (
    <G key={id}>
      <Defs>
        <RadialGradient id={g(id)} cx="0.5" cy="0.55" r="0.6">
          <Stop offset="0" stopColor="#FFFCEA" />
          <Stop offset="0.45" stopColor="#FFDC8E" />
          <Stop offset="1" stopColor="#E8963A" />
        </RadialGradient>
      </Defs>
      <Path d={`M${x} 76 L${x} ${y - 5}`} stroke="#24140F" strokeWidth={1.6} strokeDasharray="2.4 1.2" />
      <Circle cx={x} cy={y - 3} r={2.6} stroke={m} strokeWidth={1.4} fill="none" />
      <Path d={`M${x - 10} ${y + 25} Q${x - 13.5} ${y + 15} ${x - 9} ${y + 6} L${x + 9} ${y + 6} Q${x + 13.5} ${y + 15} ${x + 10} ${y + 25} Z`} fill={`url(#${g(id)})`} />
      <Path d={`M${x - 3.6} ${y + 7} L${x - 4.2} ${y + 25} M${x + 3.6} ${y + 7} L${x + 4.2} ${y + 25}`} stroke={m} strokeWidth={1.1} opacity={0.55} />
      <Path d={`M${x} ${y + 11} Q${x + 2.8} ${y + 16.5} ${x} ${y + 20} Q${x - 2.8} ${y + 16.5} ${x} ${y + 11} Z`} fill="#FFFFFF" />
      <Path d={`M${x - 12.5} ${y + 7} L${x - 6} ${y} L${x + 6} ${y} L${x + 12.5} ${y + 7} Z`} fill={m} />
      <Path d={`M${x - 12.5} ${y + 7} L${x - 6} ${y} L${x + 3} ${y}`} stroke="#C08A58" strokeWidth={1.1} fill="none" opacity={0.8} />
      <Rect x={x - 11} y={y + 24} width={22} height={4.5} rx={1.5} fill={m} />
      <Rect x={x - 11} y={y + 24} width={22} height={1.1} fill="#F2B860" opacity={0.7} />
      <Path d={`M${x - 4} ${y + 28.5} L${x} ${y + 33} L${x + 4} ${y + 28.5} Z`} fill={m} />
    </G>
  );
}

/** The meadow camp (bible §9): by day, or by night with the fire lit at the lower right, where encounters put it. */
function camp(g: Ids, night: boolean) {
  const c = (day: string, dark: string) => (night ? dark : day);
  const haze = c('#E6E8D2', '#2E3F62');
  const r = rng(76);
  const leaf: Tones = night ? ['#28404F', '#1C3036', '#13222A'] : ['#9CBE6E', '#588A52', '#3A6644'];
  const flowers = night ? ['#4E5670', '#4A5068', '#565070', '#4C566C'] : ['#F8F0DC', '#F4D67C', '#EBA6AE', '#B8A6DA'];
  const stars = rng(5);
  const tentFront = 'M244 334 Q271 279 292 222 Q313 281 338 336 Q291 329 244 334 Z';
  const tentSide = 'M292 222 L334 214 Q357 266 384 322 Q362 326 338 336 Q313 281 292 222 Z';
  const door = 'M276 334 Q285 296 292 262 Q300 298 310 335 Q293 331 276 334 Z';
  const trunk = 'M28 368 C42 356 46 334 46 304 C46 262 42 214 38 168 C36 150 34 134 32 120 L54 120 C54 140 56 160 58 180 C62 226 64 272 66 310 C68 340 78 356 98 368 Z';
  const drifts: [number, number][] = [[58, 350], [150, 342], [352, 348], [226, 344], [26, 404], [376, 398], [110, 452], [320, 452], [66, 430], [356, 428]];
  const fireRim = '#E08A50';
  return (
    <G>
      <Defs>
        <LinearGradient id={g('trunk')} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={c('#A68664', '#3E4250')} />
          <Stop offset="0.45" stopColor={c('#5E4836', '#24242C')} />
          <Stop offset="0.85" stopColor={c('#3A2C24', '#2A2228')} />
          <Stop offset="1" stopColor={c('#3A2C24', '#7A4A34')} />
        </LinearGradient>
      </Defs>
      <Fill g={g} id="sky" stops={night ? [[0, '#0C142C'], [0.34, '#19284A'], [0.58, '#384C72']] : [[0, '#82B6D2'], [0.32, '#B9D7DB'], [0.56, '#F6E8C2']]} />
      {night ? (
        <G>
          <G transform="rotate(-30 280 130)">
            <Fog g={g} id="milky" x={-120} width={800} y={130} height={80} color="#9AAAD8" opacity={0.12} />
          </G>
          {[0.4, 0.6, 0.85].map((o, k) => (
            <Path key={`st${k}`} d={Array.from({ length: 30 }, () => dot(stars() * 400, Math.pow(stars(), 1.3) * 260, 0.35 + stars() * 0.85)).join(' ')} fill="#FFF6DC" opacity={o} />
          ))}
          {[[232, 30], [374, 22], [360, 150], [214, 120], [392, 206]].map(([x, y], i) => (
            <G key={`sg${i}`}>
              <Glow g={g} id={`sg${i}`} cx={x!} cy={y!} r={8} color="#FFF6DC" opacity={0.7} />
              <Path d={`M${x! - 5} ${y} L${x! + 5} ${y} M${x} ${y! - 5} L${x} ${y! + 5}`} stroke="#FFF6DC" strokeWidth={0.6} opacity={0.75} />
              <Circle cx={x} cy={y} r={1.2} fill="#FFFBEA" />
            </G>
          ))}
          <Glow g={g} id="moonHalo" cx={306} cy={62} r={150} color="#B4C8EC" opacity={0.42} />
          <Glow g={g} id="moonGlow" cx={306} cy={62} r={40} color="#EEF0DA" opacity={0.7} />
          <Circle cx={306} cy={62} r={15} fill="#F4EED4" />
          <Path d={blob(301, 57, 4.2, { seed: 8, lobes: 3, lobe: 0.2 })} fill="#DAD2B4" opacity={0.75} />
          <Path d={blob(311, 67, 3.2, { seed: 9, lobes: 3, lobe: 0.2 })} fill="#DAD2B4" opacity={0.6} />
          <Path d={blob(309, 55, 1.8, { seed: 10, lobes: 3, lobe: 0.2 })} fill="#DAD2B4" opacity={0.6} />
          <Path d={blob(244, 106, 60, { seed: 600, lobes: 4, lobe: 0.14, squash: 0.15 })} fill="#34446A" opacity={0.65} />
          <Path d={blob(254, 102, 40, { seed: 601, lobes: 4, lobe: 0.14, squash: 0.16 })} fill="#5A6C98" opacity={0.4} />
          <Path d={blob(372, 112, 40, { seed: 620, lobes: 4, lobe: 0.12, squash: 0.12 })} fill="#34446A" opacity={0.55} />
        </G>
      ) : (
        <G>
          <Glow g={g} id="sun" cx={198} cy={58} r={240} color="#FFF3CC" opacity={0.95} />
          {cloud(272, 70, 76, 600, '#FFFAEE', '#D6D4E2')}
          {cloud(364, 122, 50, 610, mix('#FFFAEE', haze, 0.2), mix('#D6D4E2', haze, 0.3))}
          {cloud(232, 160, 30, 620, mix('#FFFAEE', haze, 0.45), mix('#D6D4E2', haze, 0.55))}
        </G>
      )}
      {/* far mountains and the wood below them, lost in the air */}
      <Path d={ridge({ y: 238, amp: 16, seed: 12, freq: 0.9, step: 4 })} fill={mix(c('#7A8CAE', '#2E3E62'), haze, 0.45)} />
      <Path d={ridge({ y: 258, amp: 4, seed: 13, crowns: 14, crownAmp: 14 })} fill={mix(c('#5E8468', '#1C2C42'), haze, 0.5)} />
      <Path d={ridge({ y: 262, amp: 4, seed: 14, crowns: 18, crownAmp: 11 })} fill={mix(c('#5E8468', '#1C2C42'), haze, 0.5)} />
      <Fog g={g} id="fog" y={264} height={64} color={c('#F6F0D8', '#5A6E96')} opacity={night ? 0.3 : 0.6} />
      {/* the rolling meadow */}
      <Path d={ridge({ y: 288, amp: 9, seed: 15, freq: 0.8 })} fill={c('#D6E09C', '#40606A')} />
      <Fill g={g} id="hill" d={ridge({ y: 291, amp: 9, seed: 15, freq: 0.8 })} stops={[[0, c('#AFCB80', '#2C4448')], [0.3, c('#94B66A', '#25393C')]]} />
      {[[156, 290, 10], [176, 288, 7], [372, 284, 9]].map(([x, y, s], i) => (
        <G key={`ht${i}`}>
          <Path d={`M${x} ${y} L${x} ${y! - s! * 1.4}`} stroke={mix(c('#5E4836', '#141A26'), haze, 0.35)} strokeWidth={1.6} />
          {leafy(x!, y! - s! * 1.7, s!, 640 + i * 5, hazed(leaf, haze, 0.35), 0, true)}
        </G>
      ))}
      <Path d={ridge({ y: 326, amp: 4, seed: 16, freq: 1.2, bottom: 460 })} fill={c('#CADE8E', '#36524C')} />
      <Fill g={g} id="meadow" d={ridge({ y: 329, amp: 4, seed: 16, freq: 1.2, bottom: 460 })} stops={[[0, c('#A2C46E', '#2A443E')], [0.3, c('#86AB56', '#22392F')], [1, c('#557E3A', '#1B2E26')]]} />
      {Array.from({ length: 18 }, (_, i) => {
        const x = r() * 400;
        const y = 334 + r() * 26;
        return <Path key={`mt${i}`} d={tuft(x, y, 5 + (y - 330) * 0.16, 700 + i, 5)} fill={c('#79A04E', '#223A30')} />;
      })}
      {!night && <GroundShadow g={g} id="treeShadow" cx={116} cy={368} rx={100} ry={13} opacity={0.3} />}
      {/* the camp: ground worn bare where the fire and the log go */}
      <Path d={blob(214, 418, 168, { seed: 33, lobes: 7, lobe: 0.08, wobble: 0.12, squash: 0.2 })} fill={c('#A3AE6E', '#26382E')} opacity={0.75} />
      <Path d={blob(214, 420, 142, { seed: 34, lobes: 7, lobe: 0.1, wobble: 0.12, squash: 0.2 })} fill={c('#BCA174', '#30342C')} />
      <Path d={blob(196, 414, 96, { seed: 35, lobes: 6, lobe: 0.1, wobble: 0.1, squash: 0.2 })} fill={c('#D6BF92', '#383A32')} opacity={0.6} />
      {[[120, 428, 2.4], [168, 440, 1.8], [262, 432, 2], [300, 444, 2.6], [228, 404, 1.6], [330, 414, 1.8]].map(([x, y, s], i) => (
        <G key={`pb${i}`}>
          <Ellipse cx={x} cy={y! + 0.6} rx={s! * 1.6} ry={s! * 0.8} fill={c('#7A6650', '#1A1C18')} opacity={0.6} />
          <Ellipse cx={x} cy={y} rx={s! * 1.4} ry={s! * 0.8} fill={c('#A89A84', '#4A4A44')} />
          <Ellipse cx={x! - s! * 0.3} cy={y! - s! * 0.3} rx={s! * 0.8} ry={s! * 0.4} fill={c('#E6DCC6', '#62625A')} />
        </G>
      ))}
      {/* the tent */}
      <GroundShadow g={g} id="tentShadow" cx={320} cy={336} rx={94} ry={10} opacity={night ? 0.5 : 0.38} />
      <Fill g={g} id="tentSide" d={tentSide} stops={night ? [[0, '#8C94B2'], [1, '#4A4C66']] : [[0, '#C08C62'], [1, '#8E6252']]} />
      <Fill g={g} id="tentFront" d={tentFront} stops={night ? [[0, '#4E3C42'], [0.55, '#764E40'], [1, '#C27A4A']] : [[0, '#F4C870'], [1, '#D9974A']]} />
      <Fill g={g} id="door" d={door} stops={night ? [[0, '#140C10'], [1, '#4E2C1E']] : [[0, '#3A2228'], [1, '#62403A']]} />
      <Path d="M292 262 Q272 292 263 333 L276 334 Q285 296 292 262 Z" fill={c('#FADDA8', '#D88E5C')} />
      <Path d="M292 262 Q312 293 322 335 L310 335 Q300 298 292 262 Z" fill={c('#C88A58', '#A4643E')} />
      <Path d="M292 222 L292 262" stroke={c('#C08040', '#3A2A2E')} strokeWidth={1} opacity={0.6} />
      <Path d="M313 218 Q338 270 361 329" stroke={c('#7E5446', '#5A5E7A')} strokeWidth={0.8} opacity={0.5} fill="none" />
      <Path d="M246 331 Q291 326 336 333" stroke={c('#B87A3E', '#8A4E32')} strokeWidth={1} opacity={0.6} fill="none" />
      <Path d={night ? 'M292 222 L334 214' : 'M244 334 Q271 279 292 222'} stroke={c('#FFEBB4', '#C8D2EE')} strokeWidth={1.8} fill="none" opacity={0.85} strokeLinecap="round" />
      <Path d={tentFront} stroke={c('#8A5634', '#24161A')} strokeWidth={1.2} fill="none" strokeLinejoin="round" />
      <Path d={tentSide} stroke={c('#7A4E3A', '#24161A')} strokeWidth={1.2} fill="none" strokeLinejoin="round" />
      <Path d="M292 223 L290 205" stroke={c('#6A4A34', '#2A2226')} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M290 206 Q300 205 311 210 Q301 214 290 217 Z" fill={c('#CC5A4C', '#7A4648')} />
      <Path d="M292 223 L222 346 M334 214 L398 318" stroke={c('#8A7258', '#3E4048')} strokeWidth={0.9} opacity={0.8} />
      <Path d="M220 342 L224 350 M396 314 L400 322" stroke={c('#6A5240', '#2A2A30')} strokeWidth={2} strokeLinecap="round" />
      {/* a pack leaning on the tent, a bedroll strapped on top */}
      <GroundShadow g={g} id="packShadow" cx={242} cy={338} rx={20} ry={3.5} opacity={0.45} />
      <G transform="rotate(8 238 338)">
        <Path d="M225 338 C222 328 222 316 227 310 C231 306 245 306 249 310 C254 316 254 328 251 338 Z" fill={c('#7A7648', '#2C2C26')} />
        <Path d="M225 338 C222 328 222 316 227 310 C229 308 232 307 235 307 C230 312 228 326 230 338 Z" fill={c('#9C975E', '#3A3A30')} />
        <Path d="M226 316 C228 309 247 308 250 316 L250 321 Q238 324 226 321 Z" fill={c('#929056', '#36362C')} />
        <Path d="M229 327 Q238 325 247 327 L246 335 Q238 336 230 335 Z" fill={c('#64603A', '#22221C')} />
        <Rect x={236.5} y={319} width={3} height={4} fill={c('#DCCC94', '#5A5848')} />
        <Rect x={222} y={300} width={32} height={8} rx={4} fill={c('#B05844', '#5A3430')} />
        <Rect x={222} y={300} width={32} height={2.4} rx={1.2} fill={c('#DA8A6C', '#7A4A40')} />
        <Ellipse cx={253.5} cy={304} rx={2.2} ry={4} fill={c('#D88068', '#6A4038')} />
        <Path d="M230 299.5 L230 308.5 M246 299.5 L246 308.5" stroke={c('#5A4A30', '#1E1A16')} strokeWidth={1.5} />
      </G>
      {/* the old tree on the left */}
      <Path d={trunk} fill={`url(#${g('trunk')})`} />
      <Path d="M51 200 C52 250 53 300 50 350 M58 210 C60 260 62 310 67 354" stroke={c('#2E221C', '#121216')} strokeWidth={2} fill="none" opacity={0.4} />
      {night && <Path d="M66 310 C68 340 78 356 98 368" stroke={fireRim} strokeWidth={2} fill="none" opacity={0.55} />}
      <Path d="M46 202 C62 174 92 154 126 140 M42 192 C30 170 14 152 -6 144 M50 198 C80 188 124 186 158 170" stroke={c('#5E4836', '#22222A')} strokeWidth={5} strokeLinecap="round" fill="none" />
      {leafy(150, 74, 42, 650, leaf, 3)}
      {leafy(-18, 150, 56, 651, leaf, 3)}
      {leafy(18, 72, 72, 652, leaf, 6)}
      {leafy(92, 44, 62, 653, leaf, 6)}
      {leafy(150, 128, 38, 654, leaf, 4)}
      {leafy(40, 168, 46, 655, leaf, 5)}
      {leafy(104, 152, 44, 656, leaf, 5)}
      {leafy(-4, 8, 60, 657, leaf, 4)}
      {leafy(170, 26, 38, 658, leaf, 3)}
      {!night && dapples([[96, 372, 22], [140, 378, 14], [60, 384, 12]], '#F6EDB0', 0.3, 'dap')}
      {/* grass and wildflowers */}
      {drifts.map(([x, y], i) => blooms(x, y, 720 + i, flowers, c('#5E8A44', '#1E3428'), 320, c('#F6D86A', '#6A6A5A')))}
      {[[86, 392, 14], [150, 452, 18], [276, 456, 16], [358, 398, 13], [38, 438, 20], [380, 446, 18], [196, 362, 9], [118, 360, 9], [330, 360, 9]].map(([x, y, h], i) =>
        grass(x!, y!, h!, 740 + i, c('#4E7C3A', '#182C22'), c('#8CB65C', '#2C4A40')),
      )}
      {night && (
        <G>
          <G transform="translate(300 404) scale(1 0.34) translate(-300 -404)">
            <Glow g={g} id="fireGround" cx={300} cy={404} r={200} color="#FF9A48" opacity={0.6} />
          </G>
          <Glow g={g} id="fireAir" cx={300} cy={372} r={140} color="#FFB060" opacity={0.22} />
        </G>
      )}
      {/* tall grass and ferns at the near corners */}
      {ferns(-8, 466, 1, 0.85, night ? ['#10201A', '#14261E'] : ['#2E5236', '#386040'], 760)}
      <Path d={Array.from({ length: 8 }, (_, k) => blade(406 - k * 5, 468, 48 + k * 8, -(8 + k * 6), 2.8)).join(' ')} fill={c('#4E7A3A', '#12221A')} />
      <Path d={Array.from({ length: 5 }, (_, k) => blade(400 - k * 7, 468, 40 + k * 7, -(4 + k * 7), 2.2)).join(' ')} fill={c('#7EA854', '#1A3024')} />
    </G>
  );
}

const BACKGROUNDS: Record<string, Bg> = {
  lodge: (g) => {
    // Evening in Maren's lodge. Two lamps hang from the beam; the left one,
    // by the books, is the key light. Dusk shows blue in the round window.
    const r = rng(17);
    const planks: { x: number; w: number; tone: number; lean: number }[] = [];
    for (let x = -4; x < 404; ) {
      const w = 30 + r() * 14;
      planks.push({ x, w, tone: r(), lean: (r() - 0.5) * 3 });
      x += w;
    }
    const seams = [357, 364, 372, 381, 391, 402, 414, 427, 441, 456];
    const joints = seams.slice(0, -1).flatMap((y, i) => [0, 1, 2].map((k) => ({ x: f1(k * 140 + r() * 120), y, h: seams[i + 1]! - y })));
    const rug = (rx: number, ox = 0, oy = 0) => blob(206 + ox, 416 + oy, rx, { seed: 90, lobes: 2, lobe: 0.02, wobble: 0.012, squash: 0.19 });
    const herbs = (x: number, y: number, n: number) => Array.from({ length: n }, (_, i) => blade(x + (i - n / 2) * 1.6, y, -(24 + (i % 3) * 5), (i - n / 2) * 2.2, 1.5)).join(' ');
    return (
      <G>
        <Defs>
          <ClipPath id={g('win')}>
            <Circle cx={200} cy={168} r={44} />
          </ClipPath>
          <LinearGradient id={g('postL')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#1E100C" />
            <Stop offset="0.6" stopColor="#4A2C20" />
            <Stop offset="1" stopColor="#9A6644" />
          </LinearGradient>
          <LinearGradient id={g('postR')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#A87248" />
            <Stop offset="0.22" stopColor="#5A3626" />
            <Stop offset="1" stopColor="#1E100C" />
          </LinearGradient>
        </Defs>
        {/* the back wall: rough vertical planks, darker up under the roof */}
        <Fill g={g} id="wall" height={352} stops={[[0, '#28161A'], [0.25, '#523222'], [0.55, '#6C452E'], [1, '#5A3826']]} />
        {planks.map((p, i) => (
          <G key={`pl${i}`}>
            <Rect x={f1(p.x)} y={60} width={f1(p.w)} height={232} fill={p.tone > 0.5 ? '#D29A66' : '#20100C'} opacity={Math.round(Math.abs(p.tone - 0.5) * 20) / 100} />
            <Path d={`M${f1(p.x + p.w * 0.38)} 60 Q${f1(p.x + p.w * 0.44 + p.lean)} 180 ${f1(p.x + p.w * 0.34)} 292`} stroke="#2E1614" strokeWidth={0.7} fill="none" opacity={0.18} />
            <Path d={`M${f1(p.x)} 60 Q${f1(p.x + p.lean)} 180 ${f1(p.x + p.lean * 0.4)} 292`} stroke="#2E1614" strokeWidth={1.8} fill="none" opacity={0.7} />
            <Path d={`M${f1(p.x + 2)} 60 Q${f1(p.x + 2 + p.lean)} 180 ${f1(p.x + 2 + p.lean * 0.4)} 292`} stroke="#E0AA74" strokeWidth={1} fill="none" opacity={0.18} />
            {p.tone > 0.68 && (
              <G>
                <Ellipse cx={f1(p.x + p.w * 0.55)} cy={f1(110 + p.tone * 150)} rx={6.5} ry={3.6} stroke="#3E2218" strokeWidth={0.8} fill="none" opacity={0.35} />
                <Ellipse cx={f1(p.x + p.w * 0.55)} cy={f1(110 + p.tone * 150)} rx={3.6} ry={2.2} fill="#3E2218" opacity={0.6} />
              </G>
            )}
          </G>
        ))}
        {/* wainscot and rail */}
        <Rect x={0} y={292} width={400} height={60} fill="#4A2E21" />
        {Array.from({ length: 21 }, (_, i) => (
          <Rect key={`ws${i}`} x={i * 20 - 3} y={296} width={1.4} height={54} fill="#2E1812" opacity={0.55} />
        ))}
        <Rect x={0} y={286} width={400} height={9} fill="#7E5236" />
        <Rect x={0} y={286} width={400} height={1.8} fill="#D09A66" opacity={0.7} />
        <Fill g={g} id="railShadow" y={295} height={9} stops={[[0, '#1A0C0A', 0.45], [1, '#1A0C0A', 0]]} />
        {/* the roof boards, and two small Lexlings peeking over the beam */}
        <Fill g={g} id="ceiling" height={56} stops={[[0, '#120A0E'], [1, '#261618']]} />
        {[12, 28, 42].map((y) => (
          <Rect key={`cb${y}`} x={0} y={y} width={400} height={1.2} fill="#0C0608" opacity={0.6} />
        ))}
        <Shaded g={g} id="lexA" d={blob(172, 47, 11, { seed: 81, lobes: 11, lobe: 0.1, wobble: 0.05 })} shade="#BFB4C8" mid="#E6DEE2" lit="#FFF8EE" line="#8E7E7A" lineWidth={1.1} step={0.22} rim={0.4} />
        <Shaded g={g} id="lexB" d="M252 33 C256 39 262 44 262 50 A10 10 0 1 1 242 50 C242 44 248 39 252 33 Z" shade="#4A7AA4" mid="#78AEDA" lit="#B6DEF6" line="#365E86" lineWidth={1.1} step={0.2} rim={0.4} />
        {[[167.5, 46], [176.5, 46], [248, 48], [256, 48]].map(([x, y], i) => (
          <G key={`eye${i}`}>
            <Ellipse cx={x} cy={y} rx={1.8} ry={2.2} fill="#2A2236" />
            <Circle cx={x! + 0.6} cy={y! - 0.8} r={0.75} fill="#FFFFFF" />
            <Circle cx={x! - 0.5} cy={y! + 0.8} r={0.35} fill="#FFFFFF" />
          </G>
        ))}
        <Ellipse cx={163.5} cy={49.5} rx={1.7} ry={0.9} fill="#F2A0A0" opacity={0.7} />
        <Ellipse cx={180.5} cy={49.5} rx={1.7} ry={0.9} fill="#F2A0A0" opacity={0.7} />
        <Fill g={g} id="beamShadow" y={76} height={24} stops={[[0, '#140808', 0.55], [1, '#140808', 0]]} />
        <Fill g={g} id="beam" y={52} height={24} stops={[[0, '#8A5C3C'], [0.12, '#74482F'], [1, '#462A1E']]} />
        <Rect x={0} y={52} width={400} height={1.8} fill="#D9A26C" opacity={0.65} />
        <Path d="M0 60 Q100 58 200 61 T400 59 M0 68 Q120 70 240 67 T400 69" stroke="#2E1812" strokeWidth={0.8} opacity={0.35} fill="none" />
        {[[166, 53], [178, 53], [259, 53]].map(([x, y], i) => (
          <Ellipse key={`paw${i}`} cx={x} cy={y} rx={2.6} ry={1.7} fill={i < 2 ? '#F2ECE6' : '#86BAE2'} stroke={i < 2 ? '#8E7E7A' : '#365E86'} strokeWidth={0.8} />
        ))}
        {/* braces from the posts to the beam */}
        <Path d="M10 158 L10 140 L70 76 L90 76 Z" fill="#583424" />
        <Path d="M10 140 L70 76" stroke="#B88050" strokeWidth={1.4} opacity={0.55} />
        <Path d="M390 158 L390 140 L330 76 L310 76 Z" fill="#4C2C20" />
        <Path d="M390 140 L330 76" stroke="#B88050" strokeWidth={1.4} opacity={0.45} />
        {/* the round window: dusk outside */}
        <Circle cx={201} cy={171} r={57} fill="#1E0E0C" opacity={0.35} />
        <Circle cx={200} cy={168} r={56} fill="#5E3A28" />
        <Path d="M148 156 A54 54 0 0 1 214 116" stroke="#C8915E" strokeWidth={2.2} fill="none" opacity={0.7} strokeLinecap="round" />
        <G clipPath={`url(#${g('win')})`}>
          <Fill g={g} id="dusk" x={156} y={124} width={88} height={88} stops={[[0, '#2C4266'], [0.45, '#6984A6'], [0.75, '#D6AC8E'], [1, '#E9C79C']]} />
          {[[178, 140, 1], [214, 134, 0.7], [232, 152, 0.6], [190, 156, 0.6]].map(([x, y, s], i) => (
            <Circle key={`wst${i}`} cx={x} cy={y} r={s} fill="#FFF6DC" opacity={0.85} />
          ))}
          <Path d={ridge({ y: 194, amp: 2.5, seed: 61, crowns: 5, crownAmp: 11, from: 150, to: 250, bottom: 216, step: 2.5 })} fill="#4A5E72" />
          <Path d={ridge({ y: 203, amp: 2, seed: 62, crowns: 6, crownAmp: 10, from: 150, to: 250, bottom: 216, step: 2.5 })} fill="#2E3C4E" />
          <Path d="M160 150 L190 126 L197 131 L166 160 Z" fill="#FFFFFF" opacity={0.1} />
          <Rect x={197.5} y={120} width={5} height={100} fill="#4A2C1E" />
          <Rect x={150} y={165.5} width={100} height={5} fill="#4A2C1E" />
          <Rect x={197.5} y={120} width={1.2} height={100} fill="#C08A58" opacity={0.55} />
          <Rect x={150} y={165.5} width={100} height={1.2} fill="#C08A58" opacity={0.55} />
          <Circle cx={200} cy={168} r={44} stroke="#160C0C" strokeWidth={6} fill="none" opacity={0.45} />
        </G>
        <Circle cx={200} cy={168} r={44.5} stroke="#2A1612" strokeWidth={1.6} fill="none" />
        {/* the sill: a candle stub and a pot of seedlings */}
        <Rect x={142} y={222} width={116} height={7} fill="#7A4E34" />
        <Rect x={142} y={222} width={116} height={1.6} fill="#D09A66" opacity={0.7} />
        <Fill g={g} id="sillShadow" x={142} y={229} width={116} height={9} stops={[[0, '#1A0C0A', 0.45], [1, '#1A0C0A', 0]]} />
        <Path d="M231 206 C226 198 222 194 216 193 C222 198 226 202 229 207 Z M232 206 C234 197 238 192 244 191 C239 196 236 201 234 207 Z M231 206 C231 198 232 192 233 186 C234 193 234 199 233 207 Z" fill="#7AA460" />
        <Path d="M222 222 L224 208 L240 208 L242 222 Z" fill="#A85E42" />
        <Path d="M235 208 L240 208 L242 222 L236 222 Z" fill="#7A3E30" />
        <Rect x={221} y={204.5} width={22} height={4.5} rx={1} fill="#C47454" />
        <Rect x={165} y={209} width={8} height={13} rx={1.2} fill="#EAD8B0" />
        <Rect x={169.5} y={209} width={3.5} height={13} fill="#C8B088" />
        <Glow g={g} id="candle" cx={169} cy={203} r={22} color="#FFD27A" opacity={0.6} />
        <Path d="M169 199 Q171.4 204 169 207.5 Q166.6 204 169 199 Z" fill="#FFF0B8" />
        {/* the bookcase */}
        <Rect x={18} y={100} width={106} height={252} fill="#22121A" />
        {shelfRow(28, 114, 158, 46, 3)}
        {shelfRow(28, 114, 214, 46, 4, 'stack')}
        {shelfRow(28, 114, 270, 46, 5, 'jar')}
        {shelfRow(28, 114, 326, 46, 6)}
        {[158, 214, 270, 326].map((y) => (
          <G key={`sh${y}`}>
            <Rect x={26} y={y} width={90} height={6} fill="#6A4230" />
            <Rect x={26} y={y} width={90} height={1.4} fill="#C08A58" opacity={0.8} />
            <Fill g={g} id={`shs${y}`} x={26} y={y + 6} width={90} height={7} stops={[[0, '#0E0608', 0.6], [1, '#0E0608', 0]]} />
          </G>
        ))}
        <Rect x={18} y={100} width={9} height={252} fill="#5A3626" />
        <Rect x={115} y={100} width={9} height={252} fill="#4A2C22" />
        <Rect x={18} y={100} width={1.6} height={252} fill="#C08A58" opacity={0.45} />
        <Rect x={115} y={100} width={1.6} height={252} fill="#C08A58" opacity={0.55} />
        <Rect x={12} y={93} width={118} height={9} fill="#6E4430" />
        <Rect x={12} y={93} width={118} height={1.8} fill="#D29C68" opacity={0.75} />
        <Rect x={18} y={332} width={106} height={20} fill="#4A2C22" />
        <Rect x={18} y={332} width={106} height={1.4} fill="#B07A50" opacity={0.6} />
        <Fill g={g} id="caseShade" x={18} y={100} width={106} height={252} stops={[[0, '#160A10', 0], [0.4, '#160A10', 0.06], [1, '#160A10', 0.42]]} />
        {[[32, 84, 26], [60, 86, 22]].map(([x, y, w], i) => (
          <G key={`scroll${i}`}>
            <Rect x={x} y={y} width={w} height={7.5} rx={3.75} fill={i ? '#D8C49A' : '#E6D4AA'} />
            <Rect x={x} y={y! + 5} width={w} height={2.5} rx={1.25} fill="#B09A72" />
            <Ellipse cx={x! + w!} cy={y! + 3.75} rx={2.2} ry={3.75} fill="#C8B088" />
          </G>
        ))}
        {/* the floor: boards running across, the joints staggered */}
        <Fill g={g} id="floor" y={350} height={110} stops={[[0, '#3E2619'], [0.2, '#704830'], [0.55, '#6A432E'], [1, '#4E3024']]} />
        {seams.map((y, i) => (
          <G key={`fs${i}`}>
            <Rect x={0} y={y} width={400} height={f1(1 + i * 0.14)} fill="#341C14" opacity={0.6} />
            <Rect x={0} y={f1(y + 1 + i * 0.14)} width={400} height={f1(0.8 + i * 0.06)} fill="#D8A472" opacity={0.16} />
          </G>
        ))}
        <Path d={joints.map((j) => `M${j.x} ${j.y} h1.2 v${j.h} h-1.2 Z`).join(' ')} fill="#341C14" opacity={0.45} />
        <Rect x={0} y={343} width={400} height={9} fill="#4E3022" />
        <Rect x={0} y={343} width={400} height={1.6} fill="#B88050" opacity={0.6} />
        <Fill g={g} id="skirtShadow" y={352} height={14} stops={[[0, '#120808', 0.5], [1, '#120808', 0]]} />
        {/* the rug */}
        <Path d={rug(174, 3, 5)} fill="#1E0E0C" opacity={0.45} />
        <Path d={rug(172)} fill="#76302A" />
        <Path d={rug(163)} fill="#C18A40" />
        <Path d={rug(156)} fill="#6A2A26" />
        <Path d={rug(141)} fill="#A24638" />
        <Path
          d={Array.from({ length: 28 }, (_, i) => {
            const th = (i / 28) * Math.PI * 2;
            const x = 206 + 159.5 * Math.cos(th);
            const y = 416 + 159.5 * 0.19 * Math.sin(th);
            return `M${f1(x - 2.2)} ${f1(y)} a2.2 0.9 0 1 0 4.4 0 a2.2 0.9 0 1 0 -4.4 0 Z`;
          }).join(' ')}
          fill="#6A2A26"
        />
        <Path d="M146 416 L206 405 L266 416 L206 427 Z" fill="#3A6264" />
        <Path d="M164 416 L206 408.5 L248 416 L206 423.5 Z" fill="#C18A40" />
        <Path d="M184 416 L206 412 L228 416 L206 420 Z" fill="#E8D2A2" />
        <Path d="M86 416 L100 413 L114 416 L100 419 Z M298 416 L312 413 L326 416 L312 419 Z" fill="#3A6264" />
        <Path d={Array.from({ length: 9 }, (_, i) => `M34 ${409 + i * 1.8} L${24 + (i % 2) * 2} ${f1(409 + i * 2.2 - 1)} M378 ${409 + i * 1.8} L${388 - (i % 2) * 2} ${f1(409 + i * 2.2 - 1)}`).join(' ')} stroke="#E2CC9C" strokeWidth={1} opacity={0.8} />
        {/* the light of the lamps on the walls and the floor */}
        <Glow g={g} id="ambient" cx={200} cy={190} r={300} color="#FFB45A" opacity={0.12} />
        <Glow g={g} id="lampL" cx={96} cy={118} r={160} color="#FFB85C" opacity={0.58} />
        <Glow g={g} id="lampR" cx={316} cy={112} r={135} color="#FFB85C" opacity={0.5} />
        <G transform="translate(118 398) scale(1 0.26) translate(-118 -398)">
          <Glow g={g} id="poolL" cx={118} cy={398} r={190} color="#FFCB80" opacity={0.5} />
        </G>
        <G transform="translate(300 398) scale(1 0.26) translate(-300 -398)">
          <Glow g={g} id="poolR" cx={300} cy={398} r={150} color="#FFCB80" opacity={0.38} />
        </G>
        <Glow g={g} id="coreL" cx={96} cy={117} r={34} color="#FFF0C8" opacity={0.9} />
        {lantern(g, 'lanternL', 96, 100)}
        <Glow g={g} id="coreR" cx={316} cy={113} r={30} color="#FFF0C8" opacity={0.85} />
        {lantern(g, 'lanternR', 316, 96)}
        {/* bunches of herbs drying by the door */}
        <Path d="M350 76 L350 88 M362 76 L362 86" stroke="#24140F" strokeWidth={1.2} />
        <Path d={herbs(350, 89, 7)} fill="#8E7AA6" />
        <Path d={herbs(362, 87, 6)} fill="#8A9A66" />
        <Rect x={346} y={86.5} width={8} height={3} rx={1} fill="#C8A060" />
        <Rect x={358.5} y={84.5} width={7} height={3} rx={1} fill="#C8A060" />
        {/* the posts, and a fern in a pot by the door */}
        <Path d="M-10 -10 L12 -10 C13 120 11 300 13 470 L-10 470 Z" fill={`url(#${g('postL')})`} />
        <Path d="M372 -10 L410 -10 L410 470 L371 470 C373 320 370 140 372 -10 Z" fill={`url(#${g('postR')})`} />
        <Path d="M380 0 C381 140 378 300 381 470 M396 0 C394 160 398 320 395 470" stroke="#1A0C0A" strokeWidth={1.2} opacity={0.35} fill="none" />
        <GroundShadow g={g} id="potShadow" cx={22} cy={450} rx={34} ry={6} opacity={0.5} />
        <Path d={[blade(20, 404, 62, -34, 7), blade(22, 404, 74, -6, 7), blade(24, 404, 60, 22, 7), blade(16, 404, 48, -50, 6), blade(26, 404, 50, 40, 6)].join(' ')} fill="#4E6E44" transform="translate(-1.5 -1.5)" />
        <Path d={[blade(20, 404, 62, -34, 7), blade(22, 404, 74, -6, 7), blade(24, 404, 60, 22, 7), blade(16, 404, 48, -50, 6), blade(26, 404, 50, 40, 6)].join(' ')} fill="#2A4430" />
        <Path d="M-2 406 L46 406 L41 450 L3 450 Z" fill="#7A4232" />
        <Path d="M30 406 L46 406 L41 450 L28 450 Z" fill="#552C24" />
        <Rect x={-5} y={400} width={54} height={8} rx={2} fill="#9A5A40" />
        <Rect x={-5} y={400} width={54} height={1.6} rx={0.8} fill="#D08A62" opacity={0.7} />
      </G>
    );
  },

  camp: (g) => camp(g, false),

  camp_night: (g) => camp(g, true),

  forest_path: (g) => {
    // Whisperwood at mid-morning. The path winds back between the trunks to
    // a bright gap; the sun is high on the left and its shafts cross the path.
    const haze = '#E3EBCF';
    const r = rng(23);
    const leaf: Tones = ['#74A46A', '#3A6A4E', '#2A5440'];
    const near: Tones = ['#5C8F5E', '#2C5444', '#1F3F30'];
    const L1: [number, number][] = [[84, 470], [130, 430], [196, 398], [176, 362]];
    const L2: [number, number][] = [[176, 362], [164, 340], [196, 318], [208, 300]];
    const R2: [number, number][] = [[222, 300], [230, 318], [214, 338], [240, 362]];
    const R1: [number, number][] = [[240, 362], [268, 392], [306, 430], [350, 470]];
    const pathD = 'M84 470 C130 430 196 398 176 362 C164 340 196 318 208 300 L222 300 C230 318 214 338 240 362 C268 392 306 430 350 470 Z';
    const edges = [...[0.18, 0.42, 0.66].map((t) => bez(L1, t)), ...[0.3, 0.7].map((t) => bez(L2, t)), ...[0.3, 0.7].map((t) => bez(R2, t)), ...[0.3, 0.55, 0.8].map((t) => bez(R1, t))];
    return (
      <G>
        <Defs>
          <LinearGradient id={g('midTrunk')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={mix('#B89C74', haze, 0.22)} />
            <Stop offset="0.28" stopColor={mix('#62503E', haze, 0.24)} />
            <Stop offset="1" stopColor={mix('#2E2620', haze, 0.26)} />
          </LinearGradient>
          <LinearGradient id={g('trunkL')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#7E6A50" />
            <Stop offset="0.5" stopColor="#4A3C30" />
            <Stop offset="1" stopColor="#2A221C" />
          </LinearGradient>
          <LinearGradient id={g('trunkR')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#968060" />
            <Stop offset="0.14" stopColor="#4A3C30" />
            <Stop offset="1" stopColor="#221B16" />
          </LinearGradient>
        </Defs>
        <Fill g={g} id="sky" stops={[[0, '#A6CBBB'], [0.36, '#DDE9CD'], [0.58, '#F7F0CC']]} />
        <Glow g={g} id="gap" cx={215} cy={270} r={180} color="#FFF8DA" />
        <Glow g={g} id="sun" cx={80} cy={24} r={210} color="#FFF0C0" opacity={0.85} />
        {/* the far wood, lost in the light */}
        {Array.from({ length: 11 }, (_, i) => {
          const x = 26 + i * 35 + (r() - 0.5) * 18;
          const w = 3 + r() * 4;
          const t = 0.62 + r() * 0.12;
          if (Math.abs(x - 215) < 26) return null;
          return <Path key={`ft${i}`} d={trunkD(x, 296, w, 40)} fill={mix('#56483A', haze, t)} />;
        })}
        {[[30, 14, 84], [150, -14, 72], [276, -4, 80], [386, 26, 76]].map(([x, y, rad], i) => leafy(x!, y!, rad!, 300 + i * 7, hazed(leaf, haze, 0.62), 0, true))}
        <Path d={ridge({ y: 292, amp: 3, seed: 24, crowns: 14, crownAmp: 16 })} fill={mix('#557A5E', haze, 0.58)} />
        <Path d={ridge({ y: 296, amp: 3, seed: 25, crowns: 18, crownAmp: 12 })} fill={mix('#557A5E', haze, 0.58)} />
        <Fog g={g} id="fog1" y={284} height={96} color={haze} opacity={0.62} />
        {/* nearer, a second rank of trunks and the undergrowth at their feet */}
        {[[40, 312, 8], [120, 306, 6], [258, 306, 6], [306, 310, 7.5], [374, 314, 9]].map(([x, y, w], i) => (
          <Path key={`it${i}`} d={trunkD(x!, y!, w!)} fill={mix('#5A4A3C', haze, 0.48)} />
        ))}
        {[[46, 120, 46], [136, 76, 40], [290, 70, 42], [366, 112, 48]].map(([x, y, rad], i) => leafy(x!, y!, rad!, 310 + i * 7, hazed(leaf, haze, 0.48), 0, true))}
        {[[18, 294, 38], [94, 300, 28], [134, 304, 18], [290, 302, 20], [332, 296, 32], [394, 290, 40]].map(([x, y, rad], i) => leafy(x!, y!, rad!, 330 + i * 7, hazed(leaf, haze, 0.44), 0, true))}
        <Fog g={g} id="fog2" y={300} height={40} color={haze} opacity={0.35} />
        {/* the middle trees */}
        {[[88, 330, 15, -6], [148, 316, 9, 4], [286, 318, 11, -3], [336, 332, 17, 7]].map(([x, y, w, lean], i) => (
          <G key={`mt${i}`}>
            <Path d={trunkD(x!, y!, w!, -10, lean!)} fill={`url(#${g('midTrunk')})`} />
            <Path d={`M${f1(x! + lean! + w! * 0.1)} 0 C${f1(x! + lean! * 0.3 + w! * 0.12)} 180 ${f1(x! + w! * 0.08)} 260 ${f1(x! + w! * 0.12)} ${y! - 6}`} stroke={mix('#2E2620', haze, 0.3)} strokeWidth={1.2} fill="none" opacity={0.5} />
          </G>
        ))}
        {[[70, 18, 64], [196, -40, 60], [252, -30, 56], [352, 26, 62]].map(([x, y, rad], i) => leafy(x!, y!, rad!, 320 + i * 7, hazed(leaf, haze, 0.32), 4))}
        {[[50, 324, 26], [116, 318, 17], [306, 318, 18], [364, 326, 27], [162, 309, 11], [262, 309, 12]].map(([x, y, rad], i) => leafy(x!, y!, rad!, 340 + i * 7, hazed(leaf, haze, 0.28), 3))}
        <Shafts g={g} id="shafts" x={56} y={-20} angle={16} length={460} count={5} spread={250} width={30} color="#FFF3CC" opacity={0.3} seed={6} />
        {/* the forest floor and the path */}
        <Path d={ridge({ y: 306, amp: 2.5, seed: 26, freq: 1.3, bottom: 460 })} fill="#C9D78E" />
        <Fill g={g} id="floor" d={ridge({ y: 309, amp: 2.5, seed: 26, freq: 1.3, bottom: 460 })} stops={[[0, '#A3BC76'], [0.22, '#7DA155'], [1, '#4A7438']]} />
        <Fill g={g} id="path" d={pathD} stops={[[0, '#EFE3B8'], [0.25, '#DCC290'], [1, '#B08B5E']]} />
        {dapples([[200, 334, 9], [186, 372, 18], [232, 396, 26], [178, 420, 22], [262, 436, 30]], '#FFF4C8', 0.45, 'pd')}
        {[[196, 352, 1.4], [226, 380, 1.8], [168, 404, 2], [246, 418, 2.4], [212, 440, 2.2], [290, 446, 2.6]].map(([x, y, s], i) => (
          <G key={`pp${i}`}>
            <Ellipse cx={x! + 0.6} cy={y! + 0.8} rx={s! * 1.6} ry={s! * 0.7} fill="#7A6040" opacity={0.5} />
            <Ellipse cx={x} cy={y} rx={s! * 1.4} ry={s! * 0.8} fill="#A8987E" />
            <Ellipse cx={x! - s! * 0.3} cy={y! - s! * 0.3} rx={s! * 0.8} ry={s! * 0.4} fill="#EEE4CC" />
          </G>
        ))}
        {edges.map(([x, y], i) => grass(x, y + 2, 6 + (y - 300) * 0.12, 380 + i, '#4E7C3A', '#93BA62', 5))}
        {ferns(60, 352, 1, 0.3, ['#3E6E46', '#4A7A4E'], 390, 5)}
        {ferns(122, 342, -1, 0.24, ['#46744A', '#52804E'], 391, 5)}
        {ferns(300, 344, 1, 0.24, ['#46744A', '#52804E'], 392, 5)}
        {ferns(352, 356, -1, 0.32, ['#3E6E46', '#4A7A4E'], 393, 5)}
        {[[40, 380], [104, 368], [324, 372], [372, 392], [96, 420]].map(([x, y], i) => blooms(x!, y!, 400 + i, ['#FFF8E4', '#F4E6A8', '#E8DDF2'], '#4E7C3A'))}
        {dapples([[70, 396, 26], [124, 446, 34], [330, 410, 30], [366, 446, 24], [20, 430, 20]], '#F6EDB0', 0.2, 'fd')}
        {[[30, 412, 16], [118, 392, 12], [320, 396, 13], [372, 418, 15], [64, 444, 18]].map(([x, y, h], i) => grass(x!, y!, h!, 410 + i, '#3E6A32', '#7EA854'))}
        {/* the near edge of the path, in grass */}
        <Fill g={g} id="lip" d={ridge({ y: 447, amp: 3, seed: 27, freq: 2.2, bottom: 460 })} stops={[[0, '#56803E'], [1, '#41672F']]} />
        {[20, 62, 104, 150, 196, 240, 284, 330, 376].map((x, i) => grass(x, 452, 14 + (i % 3) * 4, 420 + i, '#36602C', '#679448', 7))}
        {/* the near trees, the canopy overhead and ferns in the corners */}
        <Path d="M-24 -10 L24 -10 C20 110 20 240 24 320 C27 372 36 408 52 438 C70 440 84 448 94 456 L-24 456 Z" fill={`url(#${g('trunkL')})`} />
        <Path d="M6 30 C9 130 7 250 12 360 M16 60 C19 160 18 270 22 350" stroke="#211A14" strokeWidth={2.4} fill="none" opacity={0.45} />
        <Path d="M410 -10 L376 -10 C378 110 376 250 372 330 C370 384 360 418 346 448 L410 448 Z" fill={`url(#${g('trunkR')})`} />
        <Path d="M376 -10 C378 110 376 250 372 330 C370 384 360 418 346 448" stroke="#B49674" strokeWidth={1.8} fill="none" opacity={0.4} />
        <Path d="M377 214 C373 260 371 300 369 340 C367 372 362 398 354 420 C360 404 366 380 370 352 C374 312 376 262 380 220 Z" fill="#4E6E3C" opacity={0.85} />
        <Path d="M376 230 C373 270 372 300 370 330" stroke="#86A85E" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.7} />
        {leafy(14, 6, 76, 360, near, 6)}
        {leafy(110, -34, 54, 361, near, 4)}
        {leafy(392, 12, 78, 362, near, 6)}
        {leafy(302, -34, 50, 363, near, 4)}
        {ferns(-6, 462, 1, 1, ['#244630', '#2C5236'], 370)}
        {ferns(406, 462, -1, 0.85, ['#244630', '#2C5236'], 371)}
      </G>
    );
  },

  forest_stream: (g) => {
    // Morning by a woodland stream. The sun is up and to the left, behind the
    // canopy: warm light and shafts from there, cool shade on the right.
    const haze = '#E2EAD2';
    const r = rng(41);
    const waterTop = (x: number) => 313 + 3 * wave(51)((x / 400) * Math.PI * 2);
    const waterBottom = (x: number) => 386 + 4 * wave(52)((x / 400) * Math.PI * 3);
    const xs = Array.from({ length: 43 }, (_, i) => -10 + i * 10);
    const water = `M${xs.map((x) => `${x} ${waterTop(x).toFixed(1)}`).join(' L')} L${[...xs].reverse().map((x) => `${x} ${waterBottom(x).toFixed(1)}`).join(' L')} Z`;
    const reflection = `M${xs.map((x) => `${x} ${waterTop(x).toFixed(1)}`).join(' L')} L${[...xs].reverse().map((x) => `${x} ${(waterTop(x) + 20).toFixed(1)}`).join(' L')} Z`;
    const rock = (cx: number, cy: number, s: number, seed: number) => (
      <G key={seed}>
        <Path d={blob(cx + 2, cy + 4 * s, 15 * s, { seed, lobes: 3, lobe: 0.1, squash: 0.45 })} fill="#3F5559" opacity={0.7} />
        <Path d={blob(cx, cy, 14 * s, { seed: seed + 1, lobes: 3, lobe: 0.12, squash: 0.62 })} fill="#8E8A80" />
        <Path d={blob(cx - 3 * s, cy - 3 * s, 9 * s, { seed: seed + 2, lobes: 2, lobe: 0.1, squash: 0.55 })} fill="#C8C1B1" />
        <Path d={`M${cx - 18 * s} ${cy + 5 * s} Q${cx} ${cy + 11 * s} ${cx + 19 * s} ${cy + 4 * s}`} stroke="#F4FBF8" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.75} />
      </G>
    );
    const leaves = (cx: number, cy: number, rad: number, seed: number) => (
      <G key={seed}>
        <Path d={blob(cx - rad * 0.12, cy - rad * 0.12, rad, { seed, lobes: 9, lobe: 0.22 })} fill="#5C8F63" />
        <Path d={blob(cx, cy, rad * 0.98, { seed: seed + 1, lobes: 8, lobe: 0.2 })} fill="#2F5A45" />
        <Path d={blob(cx + rad * 0.16, cy + rad * 0.2, rad * 0.7, { seed: seed + 2, lobes: 6, lobe: 0.18 })} fill="#234636" />
      </G>
    );
    return (
      <G>
        <Fill g={g} id="sky" stops={[[0, '#9DCAD2'], [0.42, '#D5E7D2'], [0.7, '#F3EAC4']]} />
        <Glow g={g} id="sun" cx={112} cy={92} r={200} color="#FFF0C0" opacity={0.95} />
        {/* the far side of the wood, lost in haze */}
        <Path d={ridge({ y: 200, amp: 7, seed: 3, crowns: 8, crownAmp: 40 })} fill={mix('#5C8C78', haze, 0.66)} />
        <Path d={ridge({ y: 208, amp: 6, seed: 4, crowns: 11, crownAmp: 30 })} fill={mix('#5C8C78', haze, 0.66)} />
        {Array.from({ length: 7 }, (_, i) => {
          const x = 72 + i * 42 + (r() - 0.5) * 22;
          const w = 3 + r() * 5;
          const top = 170 + r() * 40;
          return <Path key={i} d={`M${x - w * 0.4} ${top} L${x + w * 0.4} ${top} L${x + w * 0.7} 300 L${x - w * 0.7} 300 Z`} fill={mix('#4E3F33', haze, 0.62 + r() * 0.12)} />;
        })}
        <Fog g={g} id="fog1" y={236} height={96} color={haze} opacity={0.6} />
        <Path d={ridge({ y: 264, amp: 6, seed: 9, crowns: 15, crownAmp: 22 })} fill={mix('#4D7C60', haze, 0.36)} />
        <Shafts g={g} id="shafts" x={60} y={-20} angle={17} length={420} count={5} spread={220} width={30} color="#FFF3CC" opacity={0.3} seed={5} />
        {/* far bank, its lip catching the light */}
        <Path d={ridge({ y: 289, amp: 3.5, seed: 21, freq: 1.4 })} fill="#BCD37F" />
        <Fill g={g} id="bank" d={ridge({ y: 293, amp: 3.5, seed: 21, freq: 1.4 })} stops={[[0, '#97BC63'], [1, '#6A954C']]} />
        {[40, 96, 180, 250, 318, 372].map((x, i) => (
          <Path key={x} d={tuft(x, 300, 12 + (i % 3) * 3, 60 + i, 5)} fill="#5A8644" />
        ))}
        {/* the stream: sky above it, the far bank reflected under its edge */}
        <Fill g={g} id="water" d={water} stops={[[0, '#D6EADF'], [0.2, '#A8D1CD'], [0.56, '#6DA8B4'], [1, '#3D7C93']]} />
        <Fill g={g} id="refl" d={reflection} stops={[[0, '#557F4F', 0.6], [1, '#557F4F', 0]]} />
        <G transform="translate(132 336) scale(1 0.2) translate(-132 -336)">
          <Glow g={g} id="glint" cx={132} cy={336} r={110} color="#FFFBEA" opacity={0.85} />
        </G>
        {[
          [24, 330, 34], [92, 346, 26], [160, 326, 40], [214, 358, 30], [282, 338, 36], [340, 362, 28], [60, 372, 22], [250, 376, 24],
        ].map(([x, y, l], i) => (
          <Path key={i} d={`M${x} ${y} Q${x! + l! / 2} ${y! - 3} ${x! + l!} ${y}`} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
        ))}
        {[[120, 352, 30], [300, 350, 26], [190, 372, 34]].map(([x, y, l], i) => (
          <Path key={`d${i}`} d={`M${x} ${y} Q${x! + l! / 2} ${y! + 3} ${x! + l!} ${y}`} stroke="#2C6479" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.35} />
        ))}
        {rock(296, 318, 0.9, 70)}
        {rock(108, 376, 1.15, 80)}
        {rock(360, 380, 0.7, 90)}
        <Fog g={g} id="mist" y={316} height={36} color="#F4F2DE" opacity={0.4} />
        {/* near bank */}
        <Path d={ridge({ y: 383, amp: 3, seed: 33, freq: 1.2 })} fill="#A6C875" />
        <Fill g={g} id="near" d={ridge({ y: 387, amp: 3, seed: 33, freq: 1.2 })} stops={[[0, '#84AD5A'], [0.25, '#6E9B4D'], [1, '#4A7438']]} />
        {[[70, 392, 4], [150, 395, 3], [236, 390, 3.5], [318, 394, 3]].map(([x, y, s], i) => (
          <G key={`p${i}`}>
            <Ellipse cx={x} cy={y} rx={s! * 1.6} ry={s} fill="#8E8673" />
            <Ellipse cx={x! - 1} cy={y! - 1} rx={s! * 1.1} ry={s! * 0.6} fill="#C3B9A2" />
          </G>
        ))}
        {[[150, 420, 70, 10], [270, 438, 60, 9], [60, 446, 40, 7]].map(([x, y, rx, ry], i) => (
          <Ellipse key={`l${i}`} cx={x} cy={y} rx={rx} ry={ry} fill="#F6EDB0" opacity={0.17} />
        ))}
        {[[44, 404, 16], [120, 412, 12], [206, 404, 14], [292, 410, 13], [352, 402, 15], [90, 450, 20], [330, 452, 22]].map(([x, y, h], i) => (
          <Path key={`t${i}`} d={tuft(x!, y!, h!, 90 + i, 7)} fill={i > 4 ? '#3B6531' : '#4E7C3B'} />
        ))}
        {/* the big trees either side, and the canopy overhead */}
        <Defs>
          <LinearGradient id={g('trunkL')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#7A6248" />
            <Stop offset="0.45" stopColor="#4D3C2D" />
            <Stop offset="1" stopColor="#2C221B" />
          </LinearGradient>
          <LinearGradient id={g('trunkR')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#6B5640" />
            <Stop offset="0.18" stopColor="#3A2D23" />
            <Stop offset="1" stopColor="#231A15" />
          </LinearGradient>
        </Defs>
        <Path d="M-20 -10 L30 -10 C26 120 27 262 33 352 C37 400 54 432 72 470 L-20 470 Z" fill={`url(#${g('trunkL')})`} />
        <Path d="M6 40 C9 140 7 260 12 380 M18 70 C21 170 20 280 24 360" stroke="#231A14" strokeWidth={2.5} fill="none" opacity={0.45} />
        <Path d={blob(10, 400, 26, { seed: 7, lobes: 5, lobe: 0.25, squash: 0.6 })} fill="#5F7F43" opacity={0.85} />
        <Path d="M410 -10 L367 -10 C371 110 369 250 365 348 C362 398 345 432 330 470 L410 470 Z" fill={`url(#${g('trunkR')})`} />
        <Path d="M367 -10 C371 110 369 250 365 348 C362 398 345 432 330 470" stroke="#A98B6A" strokeWidth={2} fill="none" opacity={0.45} />
        {leaves(24, 8, 74, 100)}
        {leaves(118, -24, 54, 110)}
        {leaves(384, 18, 76, 120)}
        {leaves(296, -26, 50, 130)}
        {/* ferns in the near corners, in shadow */}
        {[[-4, 470, 1, 1], [404, 470, -1, 0.75]].map(([x, y, dir, s], i) => (
          <G key={`f${i}`}>
            {[0, 1, 2, 3, 4].map((k) => (
              <Path key={k} d={blade(x!, y!, (64 + k * 12) * s!, dir! * (16 + k * 14) * s!, 6)} fill={k % 2 ? '#25432F' : '#2C4E36'} />
            ))}
          </G>
        ))}
      </G>
    );
  },

  forest_clearing: (g) => {
    // A clearing in Whisperwood at noon: open sky overhead, the sun pouring
    // in from the upper left, wildflowers in the warm grass, and the wood
    // standing all round in its own shade.
    const haze = '#E6ECD2';
    const r = rng(29);
    const leaf: Tones = ['#A6C880', '#4E7E58', '#3A6A4A'];
    const near: Tones = ['#6E9E62', '#2E5844', '#21422F'];
    const shade = mix('#2C4A40', haze, 0.26);
    const drifts: [number, number][] = [[70, 336], [150, 330], [250, 334], [336, 340], [40, 376], [124, 366], [300, 372], [372, 382], [204, 352], [92, 428], [252, 440], [338, 432], [170, 450]];
    return (
      <G>
        <Defs>
          <LinearGradient id={g('itrunk')} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={mix('#76684E', shade, 0.5)} stopOpacity={0} />
            <Stop offset="0.4" stopColor={mix('#76684E', shade, 0.5)} stopOpacity={1} />
            <Stop offset="1" stopColor={mix('#76684E', shade, 0.5)} stopOpacity={1} />
          </LinearGradient>
          <LinearGradient id={g('trunkR')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#94805E" />
            <Stop offset="0.2" stopColor="#4A3C30" />
            <Stop offset="1" stopColor="#241C17" />
          </LinearGradient>
        </Defs>
        <Fill g={g} id="sky" stops={[[0, '#88BDD6'], [0.28, '#C6DFDA'], [0.5, '#F6EDC8']]} />
        <Glow g={g} id="sun" cx={136} cy={58} r={250} color="#FFF3C8" />
        {cloud(272, 96, 62, 800, mix('#FFFAEE', haze, 0.15), mix('#D6D6E2', haze, 0.3))}
        {cloud(346, 150, 36, 810, mix('#FFFAEE', haze, 0.4), mix('#D6D6E2', haze, 0.5))}
        {/* hills beyond the wood */}
        <Path d={ridge({ y: 224, amp: 8, seed: 31, crowns: 6, crownAmp: 20 })} fill={mix('#6E9080', haze, 0.7)} />
        {/* the tree line across the clearing: crowns lit from the upper left, trunks standing in their shade */}
        <Rect x={0} y={250} width={400} height={80} fill={shade} />
        {[[128, 224, 24], [196, 214, 30], [232, 226, 22], [286, 220, 26]].map(([x, y, rad], i) => leafy(x!, y!, rad!, 815 + i * 3, hazed(leaf, haze, 0.36), 0, true))}
        <Path d={ridge({ y: 244, amp: 6, seed: 32, crowns: 11, crownAmp: 30, from: -18, to: 402, bottom: 296 })} fill={mix('#B4D08A', haze, 0.2)} />
        <Fill g={g} id="crowns" d={ridge({ y: 249, amp: 6, seed: 32, crowns: 11, crownAmp: 30, from: -10, to: 410, bottom: 300 })} stops={[[0, mix('#5A8A60', haze, 0.3)], [0.38, mix('#3E6A50', haze, 0.28)], [0.6, shade], [1, shade]]} />
        {Array.from({ length: 13 }, (_, i) => {
          const x = 8 + i * 31 + (r() - 0.5) * 14;
          const w = 4 + r() * 6;
          return <Path key={`it${i}`} d={trunkD(x, 318, w, 256)} fill={`url(#${g('itrunk')})`} opacity={f1(0.55 + r() * 0.45)} />;
        })}
        {Array.from({ length: 14 }, (_, i) => (
          <Circle key={`fl${i}`} cx={f1(r() * 400)} cy={f1(276 + r() * 32)} r={f1(0.8 + r() * 1.4)} fill="#E8F0C0" opacity={0.35} />
        ))}
        {/* two nearer trees at the edge of the clearing */}
        <Path d={trunkD(62, 318, 9, 220)} fill={mix('#5E4E3E', haze, 0.2)} />
        <Path d={trunkD(334, 318, 11, 214)} fill={mix('#5E4E3E', haze, 0.2)} />
        {leafy(44, 214, 40, 820, hazed(leaf, haze, 0.14), 4)}
        {leafy(82, 196, 32, 821, hazed(leaf, haze, 0.14), 3)}
        {leafy(318, 200, 36, 822, hazed(leaf, haze, 0.14), 4)}
        {leafy(356, 190, 42, 823, hazed(leaf, haze, 0.14), 4)}
        {leafy(340, 236, 30, 824, hazed(leaf, haze, 0.14), 3)}
        <Shafts g={g} id="shafts" x={96} y={-20} angle={14} length={430} count={5} spread={230} width={36} color="#FFF3CC" opacity={0.24} seed={9} />
        {/* bushes along the edge of the wood */}
        {[[28, 312, 26], [98, 308, 19], [162, 314, 15], [234, 312, 17], [298, 308, 21], [372, 314, 28]].map(([x, y, rad], i) => leafy(x!, y!, rad!, 830 + i * 7, hazed(leaf, haze, 0.1), 4))}
        {/* the meadow, a pool of sun in the middle */}
        <Path d={ridge({ y: 314, amp: 3, seed: 34, freq: 1.4, bottom: 460 })} fill="#E2E8A2" />
        <Fill g={g} id="meadow" d={ridge({ y: 317, amp: 3, seed: 34, freq: 1.4, bottom: 460 })} stops={[[0, '#BCD27E'], [0.3, '#98BA62'], [0.7, '#6E9A4A'], [1, '#527C3A']]} />
        <G transform="translate(196 376) scale(1 0.3) translate(-196 -376)">
          <Glow g={g} id="pool" cx={196} cy={376} r={210} color="#FFF6C8" opacity={0.55} />
        </G>
        {Array.from({ length: 22 }, (_, i) => {
          const x = r() * 400;
          const y = 322 + r() * 40;
          return <Path key={`mt${i}`} d={tuft(x, y, 4 + (y - 316) * 0.18, 850 + i, 5)} fill="#7CA450" />;
        })}
        {drifts.map(([x, y], i) => blooms(x, y, 860 + i, ['#FFF6DE', '#F4D67C', '#EBA6AE', '#B8A6DA'], '#5E8A44', 300))}
        {[[60, 400, 14], [140, 388, 11], [262, 392, 12], [346, 404, 14], [30, 440, 18], [206, 446, 16], [300, 444, 17], [108, 452, 15]].map(([x, y, h], i) =>
          grass(x!, y!, h!, 880 + i, '#4A7838', '#90BA60'),
        )}
        {/* framing: the canopy overhead, a trunk on the right, fern and grass in the corners */}
        <Path d="M412 40 L386 40 C388 160 386 300 382 380 C380 414 374 436 364 452 L412 452 Z" fill={`url(#${g('trunkR')})`} />
        <Path d="M386 40 C388 160 386 300 382 380 C380 414 374 436 364 452" stroke="#C0A07A" strokeWidth={1.6} fill="none" opacity={0.4} />
        {leafy(-10, 20, 92, 890, near, 6)}
        {leafy(84, -42, 62, 891, near, 5)}
        {leafy(-34, 124, 58, 892, near, 4)}
        {leafy(408, 14, 90, 893, near, 6)}
        {leafy(316, -44, 58, 894, near, 5)}
        {ferns(-6, 464, 1, 1.05, ['#2A5034', '#33603C'], 895)}
        <Path d={Array.from({ length: 8 }, (_, k) => blade(408 - k * 5, 466, 50 + k * 8, -(8 + k * 6), 2.8)).join(' ')} fill="#3E6A30" />
        {blooms(372, 436, 896, ['#F4D67C'], '#3E6A30', 300)}
      </G>
    );
  },

  sunny_path: (g) => {
    // Out of the trees at noon. The sun stands high and white, the grass is
    // bleached to straw, and the far end of the path shivers in the heat.
    // Shadows are short and sharp, pooled right under things.
    const haze = '#F4EEDA';
    const r = rng(43);
    const pathD = 'M92 470 C150 424 214 384 206 344 C200 316 228 298 238 284 L246 284 C248 300 232 320 242 346 C256 386 300 428 346 470 Z';
    const foliage: Tones = ['#C6D486', '#76985A', '#485E56'];
    const scrub: Tones = ['#C8C890', '#8E9466', '#6A6E58'];
    // fence posts along the left of the path, near to far: x, foot, height
    const posts: [number, number, number][] = [[20, 394, 46], [78, 364, 30], [118, 345, 22], [146, 331, 16.5], [166, 321, 12.5], [180, 314, 9.5], [190, 309, 7.5]];
    const rail = (k: number) => `M${posts.map(([x, y, h]) => `${f1(x)} ${f1(y - h * k)}`).join(' L')}`;
    const blades = Array.from({ length: 48 }, (_, i) => {
      const y = 300 + Math.pow(r(), 0.8) * 150;
      const t = (y - 284) / 186;
      const mid = 242 - 40 * t;
      const half = 6 + 118 * t * t;
      let x = r() * 420 - 10;
      if (Math.abs(x - mid) < half) x = x < mid ? mid - half - r() * 20 : mid + half + r() * 20;
      return { x, y, h: 3 + t * 12 + r() * 4, lean: (r() - 0.4) * (4 + t * 8), lit: r() < 0.45 };
    });
    return (
      <G>
        <Defs>
          <LinearGradient id={g('trunk')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#D2B892" />
            <Stop offset="0.22" stopColor="#7A6458" />
            <Stop offset="1" stopColor="#463A48" />
          </LinearGradient>
        </Defs>
        <Fill g={g} id="sky" stops={[[0, '#86B4D0'], [0.2, '#B2D0DC'], [0.42, '#EEEEDE'], [0.56, '#FAF2D8']]} />
        <Glow g={g} id="halo" cx={146} cy={42} r={310} color="#FFFAE2" />
        <Glow g={g} id="core" cx={146} cy={42} r={70} color="#FFFFFF" />
        <Circle cx={146} cy={42} r={15} fill="#FFFFFC" />
        <Path d={blob(304, 86, 62, { seed: 4, lobes: 4, lobe: 0.1, squash: 0.08 })} fill="#FFFFFF" opacity={0.45} />
        <Path d={blob(346, 122, 40, { seed: 5, lobes: 4, lobe: 0.1, squash: 0.08 })} fill="#FFFFFF" opacity={0.35} />
        {/* far hills, violet in the heat, and a copse on the nearer rise */}
        <Path d={ridge({ y: 242, amp: 14, seed: 44, freq: 1.1, step: 4 })} fill={mix('#9C90AC', haze, 0.55)} />
        <Path d={ridge({ y: 258, amp: 9, seed: 45, freq: 1.7, step: 4 })} fill={mix('#B49E7C', haze, 0.46)} />
        {[[22, 256, 7], [36, 258, 5], [92, 262, 4], [286, 254, 7], [300, 252, 9], [316, 254, 8], [330, 256, 6], [372, 258, 5]].map(([x, y, s], i) => (
          <Path key={`fh${i}`} d={blob(x!, y! - s! * 0.8, s!, { seed: 450 + i, lobes: 5, lobe: 0.2, squash: 0.85 })} fill={mix('#6E7A56', haze, 0.48)} />
        ))}
        <Fog g={g} id="heat" y={270} height={30} color="#FFFCEE" opacity={0.55} />
        {[0, 1, 2].map((k) => {
          const n = wave(70 + k);
          const pts = Array.from({ length: 17 }, (_, i) => `${150 + i * 12} ${f1(276 + k * 4 + 1.1 * n(i * 1.3))}`);
          return <Path key={`hz${k}`} d={`M${pts.join(' L')}`} stroke="#FFFFFF" strokeWidth={1.1} fill="none" opacity={0.36 - k * 0.08} />;
        })}
        {/* the dry hills and the open ground */}
        <Path d={ridge({ y: 284, amp: 6, seed: 46, freq: 0.9 })} fill="#F8E8B6" />
        <Fill g={g} id="hills" d={ridge({ y: 287, amp: 6, seed: 46, freq: 0.9 })} stops={[[0, '#E6CF92'], [0.2, '#D6BA7C']]} />
        {[[30, 292, 11], [62, 295, 7], [320, 291, 9], [352, 297, 12], [384, 293, 8]].map(([x, y, rad], i) => {
          const [lit, mid, dark] = hazed(scrub, haze, 0.25);
          return (
            <G key={`sb${i}`}>
              <Path d={blob(x!, y!, rad!, { seed: 455 + i, lobes: 6, lobe: 0.2, wobble: 0.12, squash: 0.62 })} fill={dark} />
              <Path d={blob(x! - rad! * 0.12, y! - rad! * 0.14, rad! * 0.86, { seed: 460 + i, lobes: 6, lobe: 0.2, wobble: 0.12, squash: 0.56 })} fill={mid} />
              <Path d={blob(x! - rad! * 0.3, y! - rad! * 0.26, rad! * 0.46, { seed: 465 + i, lobes: 5, lobe: 0.2, wobble: 0.15, squash: 0.5 })} fill={lit} />
            </G>
          );
        })}
        <Path d={ridge({ y: 302, amp: 3, seed: 47, freq: 1.3, bottom: 460 })} fill="#F2E0A8" />
        <Fill g={g} id="ground" d={ridge({ y: 305, amp: 3, seed: 47, freq: 1.3, bottom: 460 })} stops={[[0, '#DCC284'], [0.3, '#CBAA68'], [1, '#A38244']]} />
        {blades.map((b, i) => (
          <Path key={`db${i}`} d={tuft(b.x, b.y, b.h, 940 + i, 4)} fill={b.lit ? '#E6CC86' : '#B08C4C'} />
        ))}
        <Fill g={g} id="path" d={pathD} stops={[[0, '#FFF6DE'], [0.3, '#F2E0B2'], [1, '#DABE88']]} />
        <Ellipse cx={242} cy={287} rx={20} ry={2.6} fill="#FFFFFF" opacity={0.55} />
        <Path d="M60 414 l6 -3 l5 4 l7 -2 M70 411 l1 6 M336 420 l5 3 l6 -3 l5 2 M347 420 l-1 5" stroke="#8E7040" strokeWidth={0.8} fill="none" opacity={0.6} />
        {[[214, 330, 1.2], [232, 362, 1.6], [196, 392, 2], [260, 404, 2.2], [230, 428, 2.6], [176, 438, 2.2], [292, 440, 2.4]].map(([x, y, s], i) => (
          <G key={`pp${i}`}>
            <Ellipse cx={x} cy={y! + s! * 0.7} rx={s! * 1.7} ry={s! * 0.55} fill="#7E6268" opacity={0.5} />
            <Ellipse cx={x} cy={y} rx={s! * 1.4} ry={s! * 0.8} fill="#C8B08E" />
            <Ellipse cx={x! - s! * 0.2} cy={y! - s! * 0.35} rx={s! * 0.9} ry={s! * 0.4} fill="#FFF8E8" />
          </G>
        ))}
        {/* an old fence along the path, silvered by the sun */}
        {posts.map(([x, y, h], i) => (
          <Ellipse key={`fs${i}`} cx={f1(x + h * 0.12)} cy={y} rx={f1(h * 0.16)} ry={f1(h * 0.04)} fill="#6A5260" opacity={0.5} />
        ))}
        <Path d={`${rail(0.72)} ${rail(0.38)}`} stroke="#8C7C6C" strokeWidth={2.2} fill="none" strokeLinejoin="round" />
        <Path d={`${rail(0.74)} ${rail(0.4)}`} stroke="#E8DCC2" strokeWidth={0.8} fill="none" strokeLinejoin="round" opacity={0.8} />
        {posts.map(([x, y, h], i) => {
          const w = h * 0.11;
          return (
            <G key={`fp${i}`}>
              <Path d={`M${f1(x - w)} ${y} L${f1(x - w)} ${f1(y - h + w * 0.6)} L${f1(x)} ${f1(y - h)} L${f1(x + w)} ${f1(y - h + w * 0.8)} L${f1(x + w)} ${y} Z`} fill="#8A7868" />
              <Path d={`M${f1(x - w)} ${y} L${f1(x - w)} ${f1(y - h + w * 0.6)} L${f1(x)} ${f1(y - h)} L${f1(x)} ${y} Z`} fill="#D8CAAE" />
            </G>
          );
        })}
        {[[60, 396, 14], [140, 420, 12], [312, 404, 14], [352, 380, 11], [110, 356, 9], [294, 352, 9]].map(([x, y, h], i) => (
          <G key={`dt${i}`}>
            <Ellipse cx={x! + 1} cy={y! + 0.8} rx={h! * 0.55} ry={h! * 0.12} fill="#7A626E" opacity={0.35} />
            {grass(x!, y!, h!, 460 + i, i % 3 === 1 ? '#8E9466' : '#B08C4C', i % 3 === 1 ? '#C8CC92' : '#F0D890', 6)}
          </G>
        ))}
        {[[46, 380], [124, 412], [330, 388], [366, 424]].map(([x, y], i) => blooms(x!, y!, 470 + i, ['#F6E8A0', '#FFF6E0'], '#9A8A52', 290))}
        {/* the last tree of the wood, its shadow pooled short beneath it */}
        <Path d="M412 -10 L380 -10 C382 120 378 250 374 330 C372 380 366 418 356 452 L412 452 Z" fill={`url(#${g('trunk')})`} />
        <Path d="M388 20 C390 140 386 260 384 360 M400 0 C402 140 400 280 398 400" stroke="#3A2E3A" strokeWidth={1.8} fill="none" opacity={0.4} />
        {leafy(330, -22, 54, 900, foliage, 4)}
        {leafy(398, 22, 82, 901, foliage, 5)}
        {leafy(396, 126, 44, 902, foliage, 3)}
        <GroundShadow g={g} id="treeShadow" cx={374} cy={446} rx={62} ry={9} opacity={0.45} />
        {/* a sun-bleached rock, and seeding grass in the near corners */}
        <GroundShadow g={g} id="rockShadow" cx={58} cy={444} rx={30} ry={5} opacity={0.5} />
        {rock(54, 434, 1.45, 910, ['#6E5E78', '#CDBFA6', '#F8F0DE'])}
        {[[4, 10, 70], [12, 22, 58], [-2, 30, 82], [376, -14, 66], [388, -26, 54], [396, -8, 78]].map(([x, lean, h], i) => {
          const tx = x! + lean!;
          const ty = 462 - h!;
          return (
            <G key={`sd${i}`}>
              <Path d={`M${x} 462 Q${f1(x! + lean! * 0.3)} ${f1(462 - h! * 0.6)} ${f1(tx)} ${f1(ty)}`} stroke="#B08C4C" strokeWidth={1.2} fill="none" />
              {[0, 1, 2, 3, 4].map((k) => (
                <Path key={k} d={blob(tx + (k % 2 ? 2 : -2) + lean! * 0.02 * k, ty + k * 4, 2.2, { seed: 920 + i * 5 + k, lobes: 2, lobe: 0.1, squash: 1.7 })} fill={k % 2 ? '#E8CE88' : '#C8A45C'} />
              ))}
            </G>
          );
        })}
        <Path d={Array.from({ length: 7 }, (_, k) => blade(-6 + k * 4, 462, 30 + k * 5, 8 + k * 5, 2.4)).join(' ')} fill="#B08C4C" />
        <Path d={Array.from({ length: 4 }, (_, k) => blade(-4 + k * 6, 462, 24 + k * 5, 4 + k * 6, 1.8)).join(' ')} fill="#EED892" />
        {/* the near edge, dry grass */}
        <Fill g={g} id="lip" d={ridge({ y: 448, amp: 3, seed: 49, freq: 2.4, bottom: 460 })} stops={[[0, '#B4964F'], [1, '#9A7C42']]} />
        {[24, 66, 110, 156, 200, 244, 290, 336, 380].map((x, i) => grass(x, 454, 13 + (i % 3) * 4, 480 + i, '#957538', '#E0C47E', 7))}
      </G>
    );
  },

  hollow: (g) => {
    // The oldest part of Whisperwood. The canopy has closed overhead; pale
    // light falls through one gap onto a ring of old stones far off, and tiny
    // mushrooms glow in the moss.
    const haze = '#5C8A82';
    const stones: [number, number, number, number, number][] = [
      // x, foot, width, height, lean
      [160, 331, 13, 25, -2],
      [185, 325, 15, 35, -1],
      [214, 322, 18, 46, 1],
      [244, 325, 14, 33, 2],
      [269, 332, 12, 23, 3],
    ];
    const stoneD = ([x, foot, w, h, lean]: [number, number, number, number, number]) =>
      `M${f1(x - w / 2)} ${foot} C${f1(x - w * 0.55)} ${f1(foot - h * 0.5)} ${f1(x - w * 0.48 + lean)} ${f1(foot - h * 0.85)} ${f1(x - w * 0.3 + lean)} ${f1(foot - h)} Q${f1(x + lean)} ${f1(foot - h - w * 0.25)} ${f1(x + w * 0.3 + lean)} ${f1(foot - h)} C${f1(x + w * 0.48 + lean)} ${f1(foot - h * 0.85)} ${f1(x + w * 0.55)} ${f1(foot - h * 0.5)} ${f1(x + w / 2)} ${foot} Z`;
    const shrooms = (x: number, y: number, s: number, seed: number) => {
      const q = rng(seed);
      const n = 2 + Math.floor(q() * 3);
      return (
        <G key={`sh${seed}`}>
          <Circle cx={x} cy={f1(y - 3 * s)} r={f1(18 * s)} fill={`url(#${g('spore')})`} />
          {Array.from({ length: n }, (_, i) => {
            const mx = x + (i - (n - 1) / 2) * 4.2 * s + (q() - 0.5) * 2 * s;
            const h = (3 + q() * 4.5) * s;
            const cw = (2.1 + q() * 1.6) * s;
            const tip = mx + (q() - 0.5) * 2 * s;
            return (
              <G key={i}>
                <Path d={`M${f1(mx - 0.7 * s)} ${y} Q${f1((mx + tip) / 2 - 0.6 * s)} ${f1(y - h / 2)} ${f1(tip - 0.5 * s)} ${f1(y - h)} L${f1(tip + 0.5 * s)} ${f1(y - h)} Q${f1((mx + tip) / 2 + 0.7 * s)} ${f1(y - h / 2)} ${f1(mx + 0.7 * s)} ${y} Z`} fill="#B6E2D4" />
                <Path d={`M${f1(tip - cw)} ${f1(y - h + 0.7 * s)} Q${f1(tip - cw * 0.2)} ${f1(y - h - cw * 1.25)} ${f1(tip + cw)} ${f1(y - h + 0.7 * s)} Z`} fill="#86F0D4" />
                <Path d={`M${f1(tip - cw * 0.6)} ${f1(y - h - 0.2 * s)} Q${f1(tip - cw * 0.3)} ${f1(y - h - cw * 0.8)} ${f1(tip + cw * 0.1)} ${f1(y - h - cw * 0.85)}`} stroke="#EAFFF8" strokeWidth={f1(0.7 * s)} fill="none" strokeLinecap="round" />
              </G>
            );
          })}
        </G>
      );
    };
    const strands: [number, number, number][] = [[22, 150, 0], [44, 96, 1], [70, 124, 0], [104, 70, 1], [300, 86, 1], [326, 140, 0], [352, 104, 1], [380, 160, 0]];
    return (
      <G>
        <Defs>
          <RadialGradient id={g('spore')} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#A6FFE6" stopOpacity={0.75} />
            <Stop offset="0.35" stopColor="#7AF0D0" stopOpacity={0.28} />
            <Stop offset="1" stopColor="#7AF0D0" stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id={g('oldTree')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#121814" />
            <Stop offset="0.55" stopColor="#232820" />
            <Stop offset="0.86" stopColor="#3A4030" />
            <Stop offset="1" stopColor="#5A5E44" />
          </LinearGradient>
          <LinearGradient id={g('root')} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#3C4434" />
            <Stop offset="1" stopColor="#1A1E18" />
          </LinearGradient>
        </Defs>
        <Fill g={g} id="air" stops={[[0, '#0A161A'], [0.28, '#132C2E'], [0.6, '#2A5450'], [0.72, '#24463C'], [1, '#183024']]} />
        <Glow g={g} id="gap" cx={196} cy={-30} r={240} color="#D8ECC4" opacity={0.4} />
        {/* the far trunks, huge and old, fading into the gloom */}
        {[[24, 20], [100, 16], [176, 14], [250, 15], [326, 18], [392, 22]].map(([x, w], i) => (
          <Path key={`f2${i}`} d={trunkD(x!, 320, w!)} fill={mix('#1E3836', haze, 0.5)} />
        ))}
        {[[58, 34], [138, 26], [292, 28], [356, 38]].map(([x, w], i) => (
          <G key={`f1${i}`}>
            <Path d={trunkD(x!, 338, w!)} fill={mix('#18302E', haze, 0.3)} />
            <Path d={x! < 200 ? `M${x! + w! * 0.42} 0 C${x! + w! * 0.47} 150 ${x! + w! * 0.44} 260 ${x! + w! * 0.9} 336` : `M${x! - w! * 0.42} 0 C${x! - w! * 0.47} 150 ${x! - w! * 0.44} 260 ${x! - w! * 0.9} 336`} stroke={mix('#9ABCA0', haze, 0.3)} strokeWidth={1.6} fill="none" opacity={0.35} />
          </G>
        ))}
        {[[40, -34, 74], [126, -60, 70], [290, -58, 70], [374, -30, 76]].map(([x, y, rad], i) => leafy(x!, y!, rad!, 500 + i * 7, ['#1E3C36', '#0E1E1E', '#0A1616'], 3))}
        {strands.map(([x, len, k], i) => {
          const n = wave(510 + i);
          const pts = Array.from({ length: 9 }, (_, j) => `${f1(x + 3 * n(j * 0.8))} ${f1((j / 8) * len)}`);
          return (
            <G key={`ms${i}`}>
              <Path d={`M${pts.join(' L')}`} stroke={k ? '#2E5442' : '#3A6A4E'} strokeWidth={2.4} fill="none" opacity={0.75} />
              <Path d={blob(x + 3 * n(6.4), len, 3.2, { seed: 520 + i, lobes: 4, lobe: 0.3, squash: 1.5 })} fill={k ? '#2E5442' : '#3A6A4E'} opacity={0.8} />
            </G>
          );
        })}
        <Shafts g={g} id="shafts" x={164} y={-20} angle={9} length={380} count={4} spread={130} width={28} color="#EEF4C8" opacity={0.32} seed={13} />
        <Fog g={g} id="mist1" y={316} height={84} color="#8AB4A8" opacity={0.42} />
        {/* the rise, and the old stones on it */}
        <Fill g={g} id="rise" d="M60 352 C112 330 166 318 214 317 C264 316 316 330 368 352 L368 362 L60 362 Z" stops={[[0, mix('#86AE76', haze, 0.25)], [0.4, mix('#3E6A4E', haze, 0.36)], [1, mix('#2A4C3C', haze, 0.4)]]} />
        <G transform="translate(214 324) scale(1 0.34) translate(-214 -324)">
          <Glow g={g} id="pool" cx={214} cy={324} r={110} color="#E6F2C6" opacity={0.5} />
        </G>
        {stones.map((s, i) => {
          const [x, foot, w, h, lean] = s;
          return (
            <G key={`ss${i}`}>
              <Ellipse cx={x + 3} cy={foot} rx={w * 0.8} ry={2.2} fill="#14282A" opacity={0.45} />
              <Shaded g={g} id={`ss${i}`} d={stoneD(s)} shade={mix('#2E4848', haze, 0.38)} mid={mix('#4E6866', haze, 0.32)} lit={mix('#A2BCAC', haze, 0.18)} step={w / 26} rim={0.2} />
              <Path d={blob(x + lean * 0.8, foot - h + 1.5, w * 0.42, { seed: 530 + i, lobes: 6, lobe: 0.25, squash: 0.55 })} fill={mix('#4E7E4E', haze, 0.3)} />
              <Path d={blob(x + lean * 0.8 - w * 0.12, foot - h, w * 0.26, { seed: 540 + i, lobes: 5, lobe: 0.25, squash: 0.5 })} fill={mix('#9AC27E', haze, 0.22)} />
              <Path d={`M${f1(x - w * 0.3 + lean)} ${f1(foot - h + 2)} Q${f1(x - w * 0.36)} ${f1(foot - h * 0.6)} ${f1(x - w * 0.42)} ${f1(foot - h * 0.35)}`} stroke={mix('#4E7E4E', haze, 0.3)} strokeWidth={2} strokeLinecap="round" fill="none" />
            </G>
          );
        })}
        <Path d="M214.5 296 Q214.5 294 216.6 294.6 Q218.6 295.6 217.6 298.4 Q216 300.6 213 299.8 Q210.2 298.4 211 294.6 Q212.4 291 217.2 291.4 M210 306 L219.5 306 M212.2 306 L211.6 310 M217.2 306 L217.8 310" stroke="#2A3E3E" strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.6} />
        {shrooms(178, 332, 0.4, 550)}
        {shrooms(252, 333, 0.4, 551)}
        <Fog g={g} id="mist2" y={346} height={34} color="#86B0A4" opacity={0.36} />
        {/* the mossy floor */}
        <Path d={ridge({ y: 362, amp: 4, seed: 55, freq: 1.1, bottom: 460 })} fill="#5E8A58" />
        <Fill g={g} id="moss" d={ridge({ y: 365, amp: 4, seed: 55, freq: 1.1, bottom: 460 })} stops={[[0, '#3E6A48'], [0.3, '#2C5036'], [1, '#1C3626']]} />
        {[[58, 398, 22], [292, 390, 17], [354, 414, 22]].map(([x, y, s], i) => (
          <G key={`ml${i}`}>
            <Path d={blob(x!, y!, s!, { seed: 560 + i, lobes: 7, lobe: 0.12, squash: 0.42 })} fill="#18302A" />
            <Path d={blob(x! - s! * 0.05, y! - s! * 0.12, s! * 0.92, { seed: 570 + i, lobes: 7, lobe: 0.14, squash: 0.4 })} fill="#2E5238" />
            <Path d={blob(x! - s! * 0.18, y! - s! * 0.24, s! * 0.6, { seed: 580 + i, lobes: 6, lobe: 0.2, squash: 0.36 })} fill="#4E7E50" />
          </G>
        ))}
        {[[30, 430, 12], [96, 448, 14], [150, 420, 9], [236, 452, 13], [300, 430, 10], [372, 452, 12], [196, 398, 7], [262, 404, 7]].map(([x, y, h], i) =>
          grass(x!, y!, h!, 640 + i, '#1E3A28', '#3E6A46', 7),
        )}
        {dapples([[214, 384, 54], [244, 414, 36], [186, 436, 30]], '#D6EEC0', 0.14, 'ld')}
        {[[190, 386, 0.5], [264, 382, 0.55], [24, 412, 0.9], [168, 446, 0.7]].map(([x, y, s], i) => shrooms(x!, y!, s!, 590 + i))}
        {/* a root crawling out across the moss */}
        <Path d="M30 418 C70 430 120 436 170 440 C200 442 226 446 250 452 C226 450 200 448 170 446 C120 443 70 438 26 428 Z" fill="#1A2018" />
        <Path d="M30 418 C70 430 120 436 170 440 C200 442 226 446 250 452" stroke="#4E7A48" strokeWidth={1.6} fill="none" opacity={0.6} />
        {/* the old tree on the left, standing on great mossy roots */}
        <Path d="M-12 -10 L60 -10 C56 110 58 200 66 262 C76 318 110 352 150 378 C122 382 96 374 78 360 C72 374 60 388 46 396 C42 372 32 354 22 348 C14 370 2 386 -12 394 Z" fill={`url(#${g('oldTree')})`} />
        <Path d="M14 0 C10 120 16 240 22 330 M36 0 C34 130 40 230 50 300 M48 0 C46 110 50 200 58 260" stroke="#0C100C" strokeWidth={2.6} fill="none" opacity={0.45} />
        <Path d="M63 250 C72 312 108 352 148 377 M28 338 C34 352 42 372 46 394 M2 364 C-2 374 -8 384 -12 392" stroke="#2E5236" strokeWidth={9} strokeLinecap="round" fill="none" />
        {[[66, 270, 6], [74, 300, 7], [88, 326, 7], [108, 346, 7], [130, 362, 6], [30, 346, 5], [40, 368, 5]].map(([x, y, s], i) => (
          <Path key={`rm${i}`} d={blob(x!, y!, s!, { seed: 620 + i, lobes: 6, lobe: 0.25, squash: 0.7 })} fill="#3E6A44" />
        ))}
        <Path d="M61 252 C69 308 104 348 144 373 M26 338 C32 352 40 370 44 390" stroke="#6E9858" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.65} />
        {/* a root arching out of the right bank */}
        <Path d="M412 278 C380 276 356 294 346 328 C340 350 338 370 336 392 L354 394 C356 374 360 354 368 338 C380 314 396 302 412 302 Z" fill={`url(#${g('root')})`} />
        <Path d="M412 279 C380 277 356 295 346 329 C341 350 339 368 337 390" stroke="#2E5236" strokeWidth={6} strokeLinecap="round" fill="none" />
        {[[392, 278, 6], [366, 288, 6], [350, 310, 5], [344, 336, 5]].map(([x, y, s], i) => (
          <Path key={`am${i}`} d={blob(x!, y!, s!, { seed: 630 + i, lobes: 6, lobe: 0.25, squash: 0.7 })} fill="#3E6A44" />
        ))}
        <Path d="M412 277 C380 275 356 293 345 327 C341 346 339 362 337 378" stroke="#6E9858" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.65} />
        {[[84, 368, 1], [104, 374, 0.8], [140, 382, 0.9], [346, 392, 0.85], [370, 398, 0.7], [312, 448, 1.3], [104, 450, 1.3]].map(([x, y, s], i) => shrooms(x!, y!, s!, 600 + i))}
        {ferns(-8, 460, 1, 0.95, ['#18342A', '#1E3E2E'], 610)}
        {ferns(408, 460, -1, 0.85, ['#18342A', '#1E3E2E'], 611)}
      </G>
    );
  },
};

export const BACKGROUND_IDS = Object.keys(BACKGROUNDS);

/**
 * How each scene is lit, beyond its painting: a colour grade laid over
 * everything in it (actors too, so they stand in the same light), the
 * vignette, the specks drifting in the air, and the colours of the ground
 * continuing below the picture (the apron, under the dialogue box).
 */
export type Look = {
  /** Tint falling from above: colour and strength at the top edge. */
  light: [string, number];
  /** Shade rising from below: colour and strength at the bottom edge. */
  shade: [string, number];
  vignette: number;
  /** Specks in the air. `rise` is how far each drifts up per loop (negative falls). */
  motes?: { color: string; count: number; size: number; rise: number };
  /** The ground below the picture: its colour at the seam, and at the bottom. */
  apron: [string, string];
  /** Silhouettes along the apron's top edge (grass, fern, floorboards, stone). */
  apronEdge?: 'grass' | 'boards' | 'stone' | 'moss';
  apronEdgeColor?: string;
};

const DEFAULT_LOOK: Look = { light: ['#FFF4D8', 0], shade: ['#1B2433', 0.12], vignette: 0.28, apron: ['#4F7A40', '#25381F'], apronEdge: 'grass', apronEdgeColor: '#3B6531' };

export const LOOKS: Record<string, Look> = {
  lodge: {
    light: ['#FFD08A', 0.05],
    shade: ['#2A1420', 0.3],
    vignette: 0.46,
    motes: { color: '#FFE2A6', count: 9, size: 1.5, rise: 12 },
    apron: ['#4E3024', '#22130E'],
    apronEdge: 'boards',
    apronEdgeColor: '#341C14',
  },
  camp: {
    light: ['#FFEAB4', 0.14],
    shade: ['#1E3A3A', 0.2],
    vignette: 0.3,
    motes: { color: '#FFF6D0', count: 10, size: 1.8, rise: 22 },
    apron: ['#557E3A', '#25381F'],
    apronEdge: 'grass',
    apronEdgeColor: '#41672F',
  },
  camp_night: {
    light: ['#6A80B8', 0.16],
    shade: ['#0A1020', 0.34],
    vignette: 0.5,
    motes: { color: '#F2EE96', count: 12, size: 1.8, rise: 14 },
    apron: ['#1B2E26', '#0C1612'],
    apronEdge: 'grass',
    apronEdgeColor: '#13241C',
  },
  forest_path: {
    light: ['#FFE6AE', 0.14],
    shade: ['#16323C', 0.24],
    vignette: 0.38,
    motes: { color: '#FFF3C4', count: 14, size: 2, rise: 24 },
    apron: ['#41672F', '#1F331E'],
    apronEdge: 'grass',
    apronEdgeColor: '#36602C',
  },
  forest_stream: {
    light: ['#FFE6AE', 0.14],
    shade: ['#16323C', 0.24],
    vignette: 0.38,
    motes: { color: '#FFF3C4', count: 16, size: 2.2, rise: 26 },
    apron: ['#4A7438', '#1F331E'],
    apronEdge: 'grass',
    apronEdgeColor: '#3B6531',
  },
  forest_clearing: {
    light: ['#FFEDB8', 0.16],
    shade: ['#1E3A34', 0.2],
    vignette: 0.32,
    motes: { color: '#FFF6C8', count: 18, size: 2, rise: 30 },
    apron: ['#527C3A', '#22361E'],
    apronEdge: 'grass',
    apronEdgeColor: '#3E6A30',
  },
  sunny_path: {
    light: ['#FFF3C4', 0.28],
    shade: ['#5E4E6E', 0.12],
    vignette: 0.2,
    motes: { color: '#FFF4D6', count: 8, size: 1.3, rise: 8 },
    apron: ['#9A7C42', '#5A4626'],
    apronEdge: 'grass',
    apronEdgeColor: '#8A6C38',
  },
  hollow: {
    light: ['#CDEBD2', 0.08],
    shade: ['#06141A', 0.36],
    vignette: 0.52,
    motes: { color: '#B8FFE6', count: 9, size: 1.6, rise: 18 },
    apron: ['#1C3626', '#0A1810'],
    apronEdge: 'moss',
    apronEdgeColor: '#1F3C2A',
  },
};

export function lookFor(id: string): Look {
  return LOOKS[id] ?? DEFAULT_LOOK;
}

/** A painted location. Memoized: a scene's painting is costly to build and never changes while it is shown. */
export const Background = memo(function Background({ id, width, height }: { id: string; width: number; height: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const painting = useMemo(() => (BACKGROUNDS[id] ?? BACKGROUNDS.forest_path!)((n) => `${n}${uid}`), [id, uid]);
  return (
    <Svg width={width} height={height} viewBox="0 0 400 460" preserveAspectRatio="xMidYMax slice">
      {painting}
    </Svg>
  );
});
