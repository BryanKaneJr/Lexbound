import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** Scene props, drawn in code. Each is a self-contained SVG; its box's bottom edge sits on the ground. */
type PropDef = { aspect: number; draw: (uid: string) => React.ReactNode; viewBox: string };

const g = (uid: string, n: string) => `${n}${uid}`;

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
