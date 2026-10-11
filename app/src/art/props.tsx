import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/** Scene props, drawn in code. Each is a self-contained SVG; its box's bottom edge sits on the ground. */
type PropDef = { aspect: number; draw: (uid: string) => React.ReactNode; viewBox: string };

const g = (uid: string, n: string) => `${n}${uid}`;

const AUTUMN = ['#D9822B', '#C4562A', '#E3A83A', '#9A5A2E', '#B8432A'];

/** A dead leaf: an almond with a vein, from (x, y) pointing along `turn`. */
function leaf(x: number, y: number, turn: number, len: number, fill = AUTUMN[0], key?: number | string) {
  return (
    <G key={key} transform={`translate(${x} ${y}) rotate(${turn})`}>
      <Path d={`M0 0 Q${len * 0.5} ${-len * 0.38} ${len} 0 Q${len * 0.5} ${len * 0.38} 0 0 Z`} fill={fill} />
      <Path d={`M${len * 0.1} 0 L${len * 0.85} 0`} stroke="#6E3A1C" strokeWidth={1} opacity={0.5} />
    </G>
  );
}

/** Grass tufts along the top of the dirt wall: [x, y]. */
const TUFTS: [number, number][] = [
  [26, 30],
  [58, 26],
  [92, 27],
  [128, 23],
  [166, 30],
];

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

export const PROPS: Record<string, PropDef> = {
  basket: {
    aspect: 140 / 100,
    viewBox: '0 0 140 100',
    draw: () => (
      <G>
        <Ellipse cx={70} cy={96} rx={58} ry={4} fill="#000" opacity={0.15} />
        <Path d="M14 40 L126 40 L114 94 L26 94 Z" fill="#C89356" stroke="#9A6B37" strokeWidth={2} />
        {[52, 64, 76].map((y) => (
          <Path key={y} d={`M${18 + (y - 40) * 0.2} ${y} L${122 - (y - 40) * 0.2} ${y}`} stroke="#9A6B37" strokeWidth={2} />
        ))}
        {[40, 60, 80, 100].map((x) => (
          <Path key={x} d={`M${x} 42 L${x + (x < 70 ? 4 : -4)} 92`} stroke="#B07E45" strokeWidth={2} />
        ))}
        <Path d="M10 40 Q70 30 130 40 Q130 46 70 46 Q10 46 10 40 Z" fill="#DDAA6A" stroke="#9A6B37" strokeWidth={2} />
        <Path d="M30 40 Q70 -6 110 40" stroke="#9A6B37" strokeWidth={5} fill="none" />
        <Rect x={96} y={54} width={26} height={16} rx={3} fill="#FFF7E6" stroke="#9A6B37" strokeWidth={1.5} transform="rotate(12 109 62)" />
      </G>
    ),
  },
  bush: {
    aspect: 160 / 120,
    viewBox: '0 0 160 120',
    draw: (uid) => (
      <G>
        <Defs>
          <LinearGradient id={g(uid, 'b')} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6CBF6A" />
            <Stop offset="1" stopColor="#3C8A4C" />
          </LinearGradient>
        </Defs>
        <Ellipse cx={80} cy={116} rx={70} ry={5} fill="#000" opacity={0.15} />
        <Circle cx={44} cy={78} r={36} fill={`url(#${g(uid, 'b')})`} />
        <Circle cx={112} cy={76} r={38} fill={`url(#${g(uid, 'b')})`} />
        <Circle cx={78} cy={52} r={42} fill={`url(#${g(uid, 'b')})`} />
        <Rect x={16} y={84} width={128} height={32} rx={16} fill="#3C8A4C" />
        <Circle cx={62} cy={40} r={4} fill="#E25C7A" />
        <Circle cx={100} cy={58} r={4} fill="#E25C7A" />
        <Circle cx={40} cy={74} r={4} fill="#E25C7A" />
      </G>
    ),
  },
  shiny_stone: {
    aspect: 1,
    viewBox: '0 0 60 60',
    draw: () => (
      <G>
        <Circle cx={30} cy={34} r={26} fill="#FFF6C8" opacity={0.6} />
        <Path d="M18 50 L12 34 L24 18 L40 20 L48 36 L40 50 Z" fill="#B7E3F2" stroke="#6FA9C7" strokeWidth={2} />
        <Path d="M24 18 L30 34 L40 20 M12 34 L30 34 L48 36 M30 34 L18 50 M30 34 L40 50" stroke="#8CC4DC" strokeWidth={1.2} />
        <Path d="M20 26 L24 22" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      </G>
    ),
  },
  log: {
    aspect: 200 / 70,
    viewBox: '0 0 200 70',
    draw: () => (
      <G>
        <Ellipse cx={100} cy={66} rx={92} ry={4} fill="#000" opacity={0.15} />
        <Rect x={16} y={18} width={168} height={46} rx={23} fill="#8A5A34" />
        <Path d="M30 30 Q90 24 150 32 M40 48 Q100 44 170 50" stroke="#6E4426" strokeWidth={2} fill="none" />
        <Ellipse cx={176} cy={41} rx={14} ry={23} fill="#C79A6A" stroke="#8A5A34" strokeWidth={3} />
        <Ellipse cx={176} cy={41} rx={7} ry={12} fill="none" stroke="#A57A4E" strokeWidth={2} />
        <Path d="M40 20 Q60 6 80 18 Q100 8 116 20" fill="#6FA35A" />
      </G>
    ),
  },
  mushroom: {
    aspect: 1,
    viewBox: '0 0 80 80',
    draw: () => (
      <G>
        <Ellipse cx={40} cy={77} rx={26} ry={3} fill="#000" opacity={0.15} />
        <Rect x={32} y={40} width={16} height={36} rx={7} fill="#F6EBD9" />
        <Path d="M8 44 Q8 10 40 10 Q72 10 72 44 Z" fill="#D9553E" />
        <Circle cx={28} cy={26} r={5} fill="#fff" />
        <Circle cx={50} cy={22} r={4} fill="#fff" />
        <Circle cx={58} cy={36} r={3.5} fill="#fff" />
      </G>
    ),
  },
  ripple: {
    aspect: 240 / 60,
    viewBox: '0 0 240 60',
    draw: () => (
      <G opacity={0.85}>
        <Ellipse cx={120} cy={30} rx={110} ry={22} fill="#7CC6F2" opacity={0.35} />
        <Path d="M30 30 Q60 20 90 30 T150 30 T210 30" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d="M60 44 Q80 38 100 44 T140 44" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
      </G>
    ),
  },
  rock_big: {
    aspect: 170 / 110,
    viewBox: '0 0 170 110',
    draw: (uid) => (
      <G>
        <Defs>
          <LinearGradient id={g(uid, 'r')} x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor="#B4AEA4" />
            <Stop offset="1" stopColor="#77706A" />
          </LinearGradient>
        </Defs>
        <Ellipse cx={85} cy={106} rx={80} ry={5} fill="#000" opacity={0.18} />
        <Path d="M10 104 Q4 60 40 34 Q80 6 124 26 Q166 46 160 104 Z" fill={`url(#${g(uid, 'r')})`} stroke="#6A635C" strokeWidth={2} />
        <Path d="M50 40 Q80 26 110 36" stroke="#CFC9C0" strokeWidth={4} strokeLinecap="round" fill="none" />
        <Path d="M30 30 Q60 10 96 18 Q70 22 54 34 Z" fill="#6FA35A" />
      </G>
    ),
  },
  rock_small: {
    aspect: 120 / 60,
    viewBox: '0 0 120 60',
    draw: () => (
      <G>
        <Ellipse cx={60} cy={57} rx={54} ry={3} fill="#000" opacity={0.15} />
        <Ellipse cx={34} cy={42} rx={26} ry={16} fill="#9A938A" />
        <Ellipse cx={78} cy={46} rx={20} ry={12} fill="#A9A298" />
        <Ellipse cx={100} cy={50} rx={12} ry={8} fill="#8D867D" />
      </G>
    ),
  },
  campfire: {
    aspect: 1,
    viewBox: '0 0 120 120',
    draw: (uid) => (
      <G>
        <Defs>
          <LinearGradient id={g(uid, 'f')} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#D8381E" />
            <Stop offset="0.5" stopColor="#F07A1E" />
            <Stop offset="1" stopColor="#FFD54A" />
          </LinearGradient>
        </Defs>
        <Ellipse cx={60} cy={114} rx={52} ry={5} fill="#000" opacity={0.18} />
        <Circle cx={60} cy={70} r={46} fill="#FFB347" opacity={0.18} />
        {[18, 36, 54, 72, 90, 102].map((x, i) => (
          <Ellipse key={x} cx={x} cy={104 + (i % 2) * 2} rx={11} ry={8} fill="#8D867D" />
        ))}
        <Rect x={28} y={92} width={64} height={10} rx={5} fill="#6E4426" transform="rotate(-12 60 97)" />
        <Rect x={28} y={92} width={64} height={10} rx={5} fill="#8A5A34" transform="rotate(12 60 97)" />
        <Path d="M60 22 C40 50 34 70 42 88 Q60 98 78 88 C86 70 80 50 60 22 Z" fill={`url(#${g(uid, 'f')})`} />
        <Path d="M60 50 C50 66 48 78 52 88 Q60 92 68 88 C72 78 70 66 60 50 Z" fill="#FFE89A" />
      </G>
    ),
  },
  puddle: {
    aspect: 200 / 50,
    viewBox: '0 0 200 50',
    draw: () => (
      <G>
        <Ellipse cx={100} cy={28} rx={92} ry={18} fill="#7A6145" />
        <Ellipse cx={100} cy={26} rx={80} ry={13} fill="#9C8160" />
        <Path d="M60 24 Q80 20 100 24" stroke="#C9B48F" strokeWidth={3} fill="none" strokeLinecap="round" />
        <Circle cx={140} cy={28} r={3} fill="#C9B48F" />
      </G>
    ),
  },
  pouch: {
    aspect: 1,
    viewBox: '0 0 60 60',
    draw: () => (
      <G>
        <Ellipse cx={30} cy={57} rx={22} ry={3} fill="#000" opacity={0.15} />
        <Path d="M12 26 Q8 54 30 56 Q52 54 48 26 Z" fill="#B07E45" stroke="#7A5634" strokeWidth={2} />
        <Path d="M14 26 Q30 18 46 26 Q30 32 14 26 Z" fill="#9A6B37" />
        <Path d="M18 22 Q30 30 42 22" stroke="#5A3820" strokeWidth={2.5} fill="none" />
        <Circle cx={24} cy={20} r={6} fill="#F2A33A" />
        <Circle cx={34} cy={18} r={6} fill="#E8862C" />
        <Circle cx={30} cy={13} r={5} fill="#F6B54A" />
        <Circle cx={22} cy={18} r={1.6} fill="#fff" opacity={0.7} />
      </G>
    ),
  },
  bowl: {
    aspect: 120 / 130,
    viewBox: '0 0 120 130',
    draw: () => (
      <G>
        <Ellipse cx={60} cy={126} rx={50} ry={4} fill="#000" opacity={0.15} />
        <Rect x={22} y={70} width={10} height={56} fill="#7A5634" />
        <Rect x={88} y={70} width={10} height={56} fill="#7A5634" />
        <Rect x={8} y={60} width={104} height={14} rx={4} fill="#9A6B37" stroke="#5A3820" strokeWidth={2} />
        <Circle cx={46} cy={40} r={8} fill="#F2A33A" />
        <Circle cx={60} cy={36} r={8} fill="#E8862C" />
        <Circle cx={74} cy={40} r={8} fill="#F6B54A" />
        <Circle cx={54} cy={28} r={7} fill="#F2A33A" />
        <Path d="M30 42 Q60 70 90 42 Z" fill="#E7DCC8" stroke="#B9A88A" strokeWidth={2} />
      </G>
    ),
  },
  well: {
    aspect: 120 / 150,
    viewBox: '0 0 120 150',
    draw: () => (
      <G>
        <Ellipse cx={60} cy={146} rx={52} ry={4} fill="#000" opacity={0.15} />
        <Rect x={14} y={8} width={8} height={100} fill="#7A5634" />
        <Rect x={98} y={8} width={8} height={100} fill="#7A5634" />
        <Path d="M4 16 L60 0 L116 16 Z" fill="#9C4A3A" />
        <Path d="M60 16 L60 60" stroke="#5A4030" strokeWidth={2} />
        <Rect x={50} y={58} width={20} height={16} rx={3} fill="#9A6B37" />
        <Rect x={8} y={94} width={104} height={52} rx={8} fill="#A9A298" />
        {[104, 120, 136].map((y) => (
          <Path key={y} d={`M8 ${y} L112 ${y}`} stroke="#8D867D" strokeWidth={2} />
        ))}
        <Ellipse cx={60} cy={94} rx={52} ry={9} fill="#5C7C93" stroke="#8D867D" strokeWidth={3} />
      </G>
    ),
  },
  pinecone: {
    aspect: 60 / 70,
    viewBox: '0 0 60 70',
    draw: () => (
      <G>
        <Ellipse cx={30} cy={67} rx={20} ry={3} fill="#000" opacity={0.15} />
        <G transform="rotate(12 30 40)">
          <Path d="M30 13 L31 5" stroke="#5E3A20" strokeWidth={3.5} strokeLinecap="round" />
          <Ellipse cx={30} cy={40} rx={18} ry={26} fill="#5E3A20" />
          {PINE_ROWS.map(([y, hw, n], r) =>
            Array.from({ length: n }, (_, i) => {
              const x = 30 - hw + (2 * hw * (i + 0.5)) / n;
              const s = (hw / n) * 1.15 + 1.5;
              return (
                <G key={`${r}-${i}`}>
                  <Path d={`M${x - s} ${y - 4} Q${x - s} ${y + 5} ${x} ${y + 6} Q${x + s} ${y + 5} ${x + s} ${y - 4} Z`} fill={(r + i) % 2 ? '#8A5A34' : '#9C6A3E'} stroke="#5E3A20" strokeWidth={1.2} />
                  <Path d={`M${x - s * 0.5} ${y + 3} Q${x} ${y + 5} ${x + s * 0.5} ${y + 3}`} stroke="#C8955E" strokeWidth={1.4} strokeLinecap="round" fill="none" />
                </G>
              );
            }),
          )}
        </G>
      </G>
    ),
  },
  dirtwall: {
    aspect: 200 / 110,
    viewBox: '0 0 200 110',
    draw: (uid) => (
      <G>
        <Defs>
          <LinearGradient id={g(uid, 'd')} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#A87A4E" />
            <Stop offset="1" stopColor="#6A452A" />
          </LinearGradient>
        </Defs>
        <Ellipse cx={100} cy={105} rx={96} ry={5} fill="#000" opacity={0.18} />
        <Path d="M8 106 L14 42 Q16 30 30 28 L60 24 Q74 20 90 26 L126 22 Q144 20 160 28 L176 30 Q188 32 188 46 L194 106 Z" fill={`url(#${g(uid, 'd')})`} />
        <Path d="M8 106 L14 42 Q16 30 30 28 L36 28 Q26 60 30 106 Z" fill="#C2946A" opacity={0.35} />
        <Path d="M15 58 Q60 52 100 58 T189 56 M13 80 Q70 74 120 82 T192 78" stroke="#7E5432" strokeWidth={3} fill="none" opacity={0.6} />
        <Path d="M120 32 Q126 44 118 56 Q114 64 120 72" stroke="#4E3018" strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.8} />
        <Ellipse cx={46} cy={68} rx={7} ry={5} fill="#9A938A" />
        <Ellipse cx={156} cy={64} rx={5} ry={4} fill="#A9A298" />
        <Ellipse cx={138} cy={92} rx={8} ry={5} fill="#8D867D" />
        <Ellipse cx={78} cy={94} rx={5} ry={3.5} fill="#A9A298" />
        <Circle cx={96} cy={44} r={2.5} fill="#5A3820" />
        <Circle cx={170} cy={84} r={2} fill="#5A3820" />
        {/* the grassy top */}
        <Path d="M14 42 Q16 30 30 28 L60 24 Q74 20 90 26 L126 22 Q144 20 160 28 L176 30 Q188 32 188 46" stroke="#5E9C55" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {TUFTS.map(([x, y]) => (
          <Path key={x} d={`M${x - 9} ${y} L${x - 6} ${y - 12} L${x - 2} ${y} L${x + 1} ${y - 15} L${x + 4} ${y} L${x + 7} ${y - 10} L${x + 10} ${y} Z`} fill="#6FA35A" />
        ))}
      </G>
    ),
  },
  leafpile: {
    aspect: 180 / 70,
    viewBox: '0 0 180 70',
    draw: () => (
      <G>
        <Ellipse cx={90} cy={66} rx={84} ry={4} fill="#000" opacity={0.16} />
        <Path d="M6 64 Q20 32 60 24 Q90 14 122 24 Q160 32 174 64 Z" fill="#7A4A26" />
        {LEAF_PILE.map(([x, y, t, l], i) => leaf(x, y, t, l, AUTUMN[i % AUTUMN.length], i))}
      </G>
    ),
  },
  pit: {
    aspect: 200 / 60,
    viewBox: '0 0 200 60',
    draw: (uid) => (
      <G>
        <Defs>
          <RadialGradient id={g(uid, 'h')} cx="0.5" cy="0.6" r="0.55">
            <Stop offset="0" stopColor="#050302" />
            <Stop offset="1" stopColor="#24170F" />
          </RadialGradient>
        </Defs>
        <Ellipse cx={100} cy={32} rx={94} ry={26} fill="#6E4A2E" />
        <Ellipse cx={100} cy={33} rx={82} ry={20} fill={`url(#${g(uid, 'h')})`} />
        {/* the far wall, just visible inside the rim */}
        <Path d="M18 32 Q100 4 182 32 Q100 20 18 32 Z" fill="#4A3020" />
        {PIT_RIM.map(([x, y, t, l], i) => leaf(x, y, t, l, AUTUMN[(i + 2) % AUTUMN.length], i))}
      </G>
    ),
  },
  standing_stone: {
    aspect: 100 / 220,
    viewBox: '0 0 100 220',
    draw: (uid) => (
      <G>
        <Defs>
          <LinearGradient id={g(uid, 's')} x1="0" y1="0" x2="1" y2="0.2">
            <Stop offset="0" stopColor="#A3AAA2" />
            <Stop offset="1" stopColor="#626A64" />
          </LinearGradient>
        </Defs>
        <Ellipse cx={50} cy={215} rx={46} ry={5} fill="#000" opacity={0.2} />
        <Path d="M18 214 L14 120 Q12 60 22 28 Q32 6 54 8 Q76 10 82 36 Q90 80 86 140 L84 214 Z" fill={`url(#${g(uid, 's')})`} />
        <Path d="M70 12 Q82 24 84 60 Q90 110 86 160 L84 214 L72 214 Q76 140 74 90 Q72 40 70 12 Z" fill="#525A54" opacity={0.55} />
        <Path d="M24 40 Q30 30 40 32 M20 150 Q24 140 30 146" stroke="#C3C9C0" strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.5} />
        {/* faint carved marks: letters nobody at the Lodge can read */}
        {GLYPHS.map((d, i) => (
          <G key={i}>
            <Path d={d} stroke="#D4D9D0" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.3} transform="translate(0.8 1)" />
            <Path d={d} stroke="#3C433E" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.5} />
          </G>
        ))}
        {/* a small round creature carved near the foot, a name beneath it */}
        <G>
          <Path d="M39 147 L41 136 L47 143 M53 143 L59 136 L61 147 M50 154 m-13 0 a13 12 0 1 0 26 0 a13 12 0 1 0 -26 0 M46 158 Q50 161 54 158 M44 166 L43 171 M56 166 L57 171" stroke="#D4D9D0" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.3} transform="translate(0.8 1)" />
          <Path d="M39 147 L41 136 L47 143 M53 143 L59 136 L61 147 M50 154 m-13 0 a13 12 0 1 0 26 0 a13 12 0 1 0 -26 0 M46 158 Q50 161 54 158 M44 166 L43 171 M56 166 L57 171" stroke="#3C433E" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.55} />
          <Circle cx={45} cy={152} r={1.8} fill="#3C433E" opacity={0.6} />
          <Circle cx={55} cy={152} r={1.8} fill="#3C433E" opacity={0.6} />
          <Path d="M34 180 L34 188 M40 180 L44 188 L48 180 M54 180 L54 188 L60 188 M64 180 L68 188" stroke="#3C433E" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.45} />
        </G>
        {/* moss */}
        <Path d="M24 30 Q32 8 54 8 Q74 10 81 32 Q72 24 62 28 Q50 18 40 30 Q32 26 24 30 Z" fill="#6FA35A" />
        <Path d="M40 30 Q42 40 38 44 M62 28 Q64 36 60 40" stroke="#6FA35A" strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M15 132 Q14 118 22 116 Q28 122 24 134 Q20 140 15 132 Z" fill="#5E9A4E" />
        <Path d="M80 92 Q88 88 86 102 Q82 106 80 92 Z" fill="#5E9A4E" opacity={0.9} />
        <Path d="M14 214 Q16 198 26 200 Q30 190 40 200 Q50 194 56 204 Q66 196 72 204 Q80 198 86 214 Z" fill="#5E9A4E" />
        <Circle cx={36} cy={44} r={2} fill="#8BC06E" />
        <Circle cx={22} cy={124} r={2} fill="#8BC06E" />
      </G>
    ),
  },
  glowshroom: {
    aspect: 90 / 80,
    viewBox: '0 0 90 80',
    draw: (uid) => {
      const cap = (x: number, y: number, r: number, h: number) => `M${x - r} ${y} Q${x - r} ${y - h} ${x} ${y - h} Q${x + r} ${y - h} ${x + r} ${y} Q${x} ${y + 4} ${x - r} ${y} Z`;
      return (
        <G>
          <Defs>
            <RadialGradient id={g(uid, 'h')} cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor="#B8FFF0" stopOpacity={0.7} />
              <Stop offset="1" stopColor="#B8FFF0" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id={g(uid, 'c')} cx="0.45" cy="0.3" r="0.75">
              <Stop offset="0" stopColor="#F4FFFC" />
              <Stop offset="0.55" stopColor="#A6EEDD" />
              <Stop offset="1" stopColor="#58C2AE" />
            </RadialGradient>
          </Defs>
          <Circle cx={45} cy={40} r={42} fill={`url(#${g(uid, 'h')})`} />
          <Ellipse cx={45} cy={77} rx={34} ry={3} fill="#000" opacity={0.15} />
          <Rect x={20} y={46} width={8} height={31} rx={4} fill="#E6EFE9" />
          <Rect x={41} y={30} width={10} height={47} rx={5} fill="#EEF5F0" />
          <Rect x={65} y={56} width={7} height={21} rx={3.5} fill="#E6EFE9" />
          <Path d="M41 40 L41 74" stroke="#C9D8CF" strokeWidth={3} strokeLinecap="round" />
          <Path d={cap(24, 48, 16, 20)} fill={`url(#${g(uid, 'c')})`} />
          <Path d={cap(46, 32, 22, 26)} fill={`url(#${g(uid, 'c')})`} />
          <Path d={cap(68, 58, 12, 15)} fill={`url(#${g(uid, 'c')})`} />
          <Path d="M10 48 Q24 53 40 48 M26 32 Q46 38 68 32 M58 58 Q68 62 80 58" stroke="#7FD3C0" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.8} />
          <Circle cx={38} cy={18} r={2.6} fill="#fff" opacity={0.85} />
          <Circle cx={52} cy={14} r={2} fill="#fff" opacity={0.85} />
          <Circle cx={20} cy={38} r={2} fill="#fff" opacity={0.85} />
          <Circle cx={70} cy={49} r={1.6} fill="#fff" opacity={0.85} />
          <Circle cx={12} cy={22} r={1.4} fill="#CFFFF4" />
          <Circle cx={80} cy={34} r={1.6} fill="#CFFFF4" />
          <Circle cx={62} cy={8} r={1.2} fill="#CFFFF4" />
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
