import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { blade, blob, Fill, Fog, Glow, mix, ridge, rng, Shafts, tuft, wave } from './paint';

/**
 * Painted locations (bible §9, §52): one illustration each, drawn in code
 * so the prototype ships with no image files. Each fills its box (slice),
 * with the ground in the lower fifth, where scenes stand their actors.
 */
type Bg = (g: (n: string) => string) => React.ReactNode;

function trunk(x: number, w: number, color: string, top = 0) {
  return <Rect x={x - w / 2} y={top} width={w} height={460} fill={color} />;
}

function canopy(cx: number, cy: number, r: number, color: string) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={color} />
      <Circle cx={cx - r * 0.7} cy={cy + r * 0.3} r={r * 0.75} fill={color} />
      <Circle cx={cx + r * 0.7} cy={cy + r * 0.25} r={r * 0.8} fill={color} />
    </G>
  );
}

function fern(x: number, y: number, s: number, color: string) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M0 0 Q-10 -30 -34 -40 Q-14 -24 -4 -2 Z" fill={color} />
      <Path d="M0 0 Q4 -36 -6 -58 Q12 -34 6 -2 Z" fill={color} />
      <Path d="M0 0 Q14 -26 38 -34 Q18 -20 6 0 Z" fill={color} />
    </G>
  );
}

function sky(g: (n: string) => string, top: string, bottom: string) {
  return (
    <G>
      <Defs>
        <LinearGradient id={g('sky')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={400} height={460} fill={`url(#${g('sky')})`} />
    </G>
  );
}

const BACKGROUNDS: Record<string, Bg> = {
  lodge: (g) => (
    <G>
      <Defs>
        <LinearGradient id={g('wall')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7A5236" />
          <Stop offset="1" stopColor="#A5714A" />
        </LinearGradient>
        <LinearGradient id={g('floor')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8A5A36" />
          <Stop offset="1" stopColor="#6A4228" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={400} height={460} fill={`url(#${g('wall')})`} />
      {[60, 140, 220, 300, 380].map((x) => (
        <Rect key={x} x={x - 4} y={0} width={8} height={360} fill="#6A4228" opacity={0.5} />
      ))}
      <Rect x={0} y={20} width={400} height={18} fill="#5A3820" />
      <Rect x={0} y={70} width={400} height={12} fill="#5A3820" opacity={0.8} />
      {/* window with daylight */}
      <Rect x={150} y={110} width={100} height={120} rx={50} fill="#BFE3F5" stroke="#5A3820" strokeWidth={8} />
      <Path d="M200 112 L200 228 M152 170 L248 170" stroke="#5A3820" strokeWidth={6} />
      <Polygon points="150,230 250,230 330,400 90,400" fill="#FFF3C4" opacity={0.18} />
      {/* bookshelf */}
      <Rect x={18} y={120} width={100} height={210} fill="#5A3820" />
      {[150, 200, 250, 300].map((y, i) => (
        <G key={y}>
          <Rect x={24} y={y - 34} width={88} height={34} fill="#4A2E1A" />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <Rect key={k} x={28 + k * 14} y={y - 30 + ((k + i) % 3) * 3} width={11} height={30 - ((k + i) % 3) * 3} fill={['#C9533E', '#4E7FA8', '#D9A441', '#5E9A6A', '#8C5BA3', '#C97B4A'][(k + i) % 6]} />
          ))}
        </G>
      ))}
      {/* hanging lanterns */}
      {[90, 310].map((x) => (
        <G key={x}>
          <Path d={`M${x} 38 L${x} 70`} stroke="#3A2414" strokeWidth={2} />
          <Circle cx={x} cy={84} r={22} fill="#FFD27A" opacity={0.35} />
          <Rect x={x - 9} y={70} width={18} height={26} rx={5} fill="#F2B84B" stroke="#7A4E1E" strokeWidth={2} />
        </G>
      ))}
      {/* small Lexlings in the rafters */}
      <Circle cx={250} cy={58} r={9} fill="#F6FFFD" />
      <Circle cx={247} cy={57} r={1.6} fill="#2A2236" />
      <Circle cx={253} cy={57} r={1.6} fill="#2A2236" />
      <Ellipse cx={174} cy={60} rx={10} ry={8} fill="#9AD8FF" />
      <Circle cx={171} cy={59} r={1.6} fill="#2A2236" />
      <Circle cx={177} cy={59} r={1.6} fill="#2A2236" />
      {/* floor and rug */}
      <Rect x={0} y={350} width={400} height={110} fill={`url(#${g('floor')})`} />
      {[0, 1, 2, 3].map((i) => (
        <Path key={i} d={`M0 ${362 + i * 26} L400 ${362 + i * 26}`} stroke="#5A3820" strokeWidth={2} opacity={0.6} />
      ))}
      <Ellipse cx={210} cy={418} rx={150} ry={30} fill="#9C4A3A" />
      <Ellipse cx={210} cy={418} rx={122} ry={22} fill="none" stroke="#D9A441" strokeWidth={4} />
    </G>
  ),

  camp: (g) => (
    <G>
      {sky(g, '#9FD2F2', '#FCE6C3')}
      <Circle cx={320} cy={90} r={34} fill="#FFE8A6" />
      <Path d="M0 260 Q100 190 200 240 T400 220 L400 460 L0 460 Z" fill="#9CC78A" />
      <Path d="M0 300 Q120 250 240 290 T400 280 L400 460 L0 460 Z" fill="#7DB56E" />
      {canopy(56, 170, 46, '#4E9F6B')}
      <Rect x={50} y={190} width={12} height={110} fill="#7A5634" />
      {/* tent */}
      <Polygon points="230,330 300,200 370,330" fill="#E8A33D" />
      <Polygon points="300,200 370,330 330,330" fill="#C9822A" />
      <Polygon points="280,330 300,268 320,330" fill="#5A3820" />
      <Path d="M300 200 L300 186" stroke="#7A5634" strokeWidth={4} />
      <Path d="M300 188 L318 194 L300 200 Z" fill="#E25C7A" />
      <Rect x={0} y={360} width={400} height={100} fill="#6BA65F" />
      <Path d="M0 360 Q200 344 400 360" fill="#7DB56E" />
      {[30, 120, 190, 260, 350].map((x, i) => (
        <G key={x}>{fern(x, 380 + (i % 2) * 30, 0.6, '#4E9F6B')}</G>
      ))}
    </G>
  ),

  camp_night: (g) => (
    <G>
      {sky(g, '#16233A', '#3A4A6B')}
      {[
        [40, 40],
        [90, 80],
        [140, 30],
        [200, 60],
        [250, 25],
        [300, 70],
        [360, 40],
        [60, 120],
        [180, 110],
        [330, 130],
        [230, 150],
        [120, 160],
      ].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.2 : 1.4} fill="#FFF6D8" opacity={0.9} />
      ))}
      <Circle cx={320} cy={90} r={22} fill="#F4EBC8" />
      <Circle cx={312} cy={84} r={22} fill="#16233A" opacity={0.25} />
      <Path d="M0 260 Q100 190 200 240 T400 220 L400 460 L0 460 Z" fill="#2E4A3A" />
      <Path d="M0 300 Q120 250 240 290 T400 280 L400 460 L0 460 Z" fill="#2A4434" />
      {canopy(56, 170, 46, '#1F3A2C')}
      <Rect x={50} y={190} width={12} height={110} fill="#2E2218" />
      <Polygon points="230,330 300,200 370,330" fill="#8A5E26" />
      <Polygon points="300,200 370,330 330,330" fill="#6E4A1E" />
      <Polygon points="280,330 300,268 320,330" fill="#1E1408" />
      <Rect x={0} y={360} width={400} height={100} fill="#24402F" />
      <Ellipse cx={312} cy={420} rx={110} ry={60} fill="#FFB347" opacity={0.12} />
    </G>
  ),

  forest_path: (g) => (
    <G>
      {sky(g, '#CFEBD6', '#EAF6E4')}
      {trunk(30, 24, '#B8C9AE')}
      {trunk(130, 18, '#B8C9AE')}
      {trunk(260, 22, '#B8C9AE')}
      {trunk(370, 20, '#B8C9AE')}
      {canopy(80, 40, 70, '#A7CF98')}
      {canopy(300, 30, 80, '#A7CF98')}
      {trunk(70, 34, '#7A5634')}
      {trunk(330, 40, '#6E4A2E')}
      {canopy(40, 70, 70, '#4E9F6B')}
      {canopy(360, 60, 80, '#3F8A5A')}
      {canopy(200, -10, 70, '#5BAA6E')}
      <Polygon points="160,0 220,0 280,380 140,380" fill="#FFF8D6" opacity={0.25} />
      <Rect x={0} y={330} width={400} height={130} fill="#5E9C55" />
      <Path d="M150 460 Q190 400 200 330 L230 330 Q250 400 300 460 Z" fill="#C9A878" />
      {[20, 90, 300, 370].map((x, i) => (
        <G key={x}>{fern(x, 360 + (i % 2) * 40, 0.9, '#3F8A4E')}</G>
      ))}
    </G>
  ),

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

  forest_clearing: (g) => (
    <G>
      {sky(g, '#BFE4F5', '#F4F2D8')}
      <Circle cx={200} cy={70} r={60} fill="#FFF3C4" opacity={0.6} />
      {canopy(20, 60, 90, '#4E9F6B')}
      {canopy(380, 50, 90, '#3F8A5A')}
      {trunk(10, 30, '#7A5634', 100)}
      {trunk(392, 30, '#6E4A2E', 90)}
      <Path d="M0 300 Q200 250 400 300 L400 460 L0 460 Z" fill="#8CC47A" />
      <Path d="M0 340 Q200 310 400 340 L400 460 L0 460 Z" fill="#76B566" />
      {[60, 150, 250, 330].map((x, i) => (
        <G key={x}>
          <Circle cx={x} cy={360 + (i % 2) * 40} r={3.5} fill={i % 2 ? '#FFE070' : '#fff'} />
          <Circle cx={x + 18} cy={378 + (i % 2) * 30} r={3} fill={i % 2 ? '#fff' : '#E25C7A'} />
        </G>
      ))}
      {[10, 380].map((x) => (
        <G key={x}>{fern(x, 440, 1, '#3F8A4E')}</G>
      ))}
    </G>
  ),

  sunny_path: (g) => (
    <G>
      {sky(g, '#8CCBF0', '#FFF0C8')}
      <Circle cx={310} cy={80} r={44} fill="#FFE070" />
      <Circle cx={310} cy={80} r={64} fill="#FFE070" opacity={0.25} />
      <Path d="M0 250 Q80 230 140 250 T260 240 T400 250 L400 460 L0 460 Z" fill="#A9CF8E" />
      {canopy(40, 220, 30, '#6FAE6A')}
      {canopy(90, 230, 22, '#6FAE6A')}
      <Path d="M0 290 Q200 270 400 300 L400 460 L0 460 Z" fill="#E3CF8C" />
      <Path d="M120 460 Q170 380 230 300 L260 300 Q230 380 260 460 Z" fill="#D8B878" />
      {[30, 70, 330, 370].map((x, i) => (
        <Path key={x} d={`M${x} ${400 + (i % 2) * 20} l4 -20 l4 20 l4 -16 l4 16`} stroke="#B89A55" strokeWidth={2} fill="none" />
      ))}
    </G>
  ),

  hollow: (g) => (
    <G>
      <Defs>
        <LinearGradient id={g('shade')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0E2226" />
          <Stop offset="0.6" stopColor="#1C3A3A" />
          <Stop offset="1" stopColor="#264538" />
        </LinearGradient>
        <LinearGradient id={g('beam')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E6F7DC" stopOpacity={0.28} />
          <Stop offset="1" stopColor="#E6F7DC" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id={g('moss')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4E7E4C" />
          <Stop offset="1" stopColor="#2E5034" />
        </LinearGradient>
        <RadialGradient id={g('glow')} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#A8FFEA" stopOpacity={0.75} />
          <Stop offset="1" stopColor="#A8FFEA" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={400} height={460} fill={`url(#${g('shade')})`} />
      {/* far trunks in the gloom */}
      {trunk(118, 26, '#183233')}
      {trunk(254, 22, '#183233')}
      {trunk(340, 36, '#16302F')}
      {canopy(100, -10, 80, '#0B1C1F')}
      {canopy(310, -20, 90, '#0B1C1F')}
      {canopy(210, -40, 70, '#0D2023')}
      <Path d="M146 40 Q150 80 144 120 M178 30 Q174 66 180 96 M282 50 Q286 90 280 130 M300 40 Q296 70 302 92" stroke="#2F5A46" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.7} />
      {/* a far mossy rise, and the old stones leaning together on it */}
      <Path d="M80 352 Q214 300 350 350 L350 400 L80 400 Z" fill="#22402F" />
      <Path d="M164 336 L178 266 Q186 250 200 254 L206 334 Z" fill="#43605A" />
      <Path d="M198 332 L205 244 Q216 228 228 240 L236 332 Z" fill="#4D6A63" />
      <Path d="M230 336 L232 268 Q242 254 256 264 L266 338 Z" fill="#43605A" />
      <Path d="M178 266 Q186 250 200 254 L200 266 Q188 262 178 272 Z M205 244 Q216 228 228 240 L228 250 Q216 242 205 252 Z M232 268 Q242 254 256 264 L257 274 Q244 266 232 278 Z" fill="#4E7A4A" />
      <Path d="M210 270 L210 290 M218 268 L222 288 L226 268 M182 286 L182 300" stroke="#2E4440" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <Ellipse cx={214} cy={338} rx={150} ry={16} fill="#A8D0C4" opacity={0.1} />
      {/* faint shafts of pale light from far above */}
      <Polygon points="180,0 216,0 272,360 196,360" fill={`url(#${g('beam')})`} />
      <Polygon points="272,0 286,0 334,330 304,330" fill={`url(#${g('beam')})`} opacity={0.7} />
      <Polygon points="84,0 96,0 128,300 104,300" fill={`url(#${g('beam')})`} opacity={0.5} />
      {/* the old tree on the left, standing on huge mossy roots */}
      <Path d="M-10 0 L64 0 Q58 180 70 270 Q84 330 150 378 Q104 380 76 354 Q66 374 46 388 Q40 362 26 344 Q14 372 -10 386 Z" fill="#2E2B22" />
      <Path d="M18 0 Q12 140 20 260 M42 0 Q38 150 48 280" stroke="#3C382C" strokeWidth={4} fill="none" />
      <Path d="M64 230 Q76 320 148 376 M30 330 Q34 352 46 386 M4 360 Q-4 374 -10 386" stroke="#5A8A50" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.9} />
      {/* a root arching out of the right bank */}
      <Path d="M410 296 Q336 286 304 330 Q284 358 262 388" stroke="#2E2B22" strokeWidth={30} strokeLinecap="round" fill="none" />
      <Path d="M410 284 Q338 274 302 316 Q284 340 268 366" stroke="#5A8A50" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.85} />
      {/* mossy ground */}
      <Path d="M0 380 Q100 368 200 378 T400 374 L400 460 L0 460 Z" fill={`url(#${g('moss')})`} />
      {[
        [40, 392, 26],
        [130, 404, 34],
        [250, 398, 30],
        [350, 410, 28],
        [80, 436, 34],
        [200, 444, 40],
        [320, 446, 30],
      ].map(([x, y, r], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={r} ry={5} fill="#64965A" opacity={0.35} />
      ))}
      {/* tiny glowing mushrooms */}
      {[
        [84, 372],
        [96, 378],
        [156, 382],
        [276, 384],
        [288, 380],
        [372, 388],
        [24, 420],
        [228, 430],
        [340, 432],
        [120, 452],
        [190, 340],
      ].map(([x, y], i) => (
        <G key={i}>
          <Circle cx={x} cy={y} r={7} fill={`url(#${g('glow')})`} />
          <Circle cx={x} cy={y} r={1.8} fill="#D2FFF4" />
        </G>
      ))}
      {fern(14, 452, 1, '#2A4E34')}
      {fern(388, 448, 0.9, '#2A4E34')}
    </G>
  ),
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
  forest_stream: {
    light: ['#FFE6AE', 0.14],
    shade: ['#16323C', 0.24],
    vignette: 0.38,
    motes: { color: '#FFF3C4', count: 16, size: 2.2, rise: 26 },
    apron: ['#4A7438', '#1F331E'],
    apronEdge: 'grass',
    apronEdgeColor: '#3B6531',
  },
};

export function lookFor(id: string): Look {
  return LOOKS[id] ?? DEFAULT_LOOK;
}

export function Background({ id, width, height }: { id: string; width: number; height: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const draw = BACKGROUNDS[id] ?? BACKGROUNDS.forest_path!;
  return (
    <Svg width={width} height={height} viewBox="0 0 400 460" preserveAspectRatio="xMidYMax slice">
      {draw((n) => `${n}${uid}`)}
    </Svg>
  );
}
