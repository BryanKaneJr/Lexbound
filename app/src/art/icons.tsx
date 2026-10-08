import Svg, { Circle, Ellipse, G, Path, Polygon, Rect } from 'react-native-svg';

/**
 * Small icons: element marks for scaffolded command tiles and speech, item
 * pictures for giving, and tab icons. All in a 48 x 48 box.
 */
const ICONS: Record<string, (c?: string) => React.ReactNode> = {
  water: (c = '#3B8FD9') => (
    <G>
      <Path d="M24 4 C24 4 40 24 40 32 C40 41 33 46 24 46 C15 46 8 41 8 32 C8 24 24 4 24 4 Z" fill={c} />
      <Ellipse cx={17} cy={30} rx={3} ry={6} fill="#fff" opacity={0.6} transform="rotate(20 17 30)" />
    </G>
  ),
  fire: (c = '#E8622C') => (
    <G>
      <Path d="M24 2 C12 18 8 26 10 34 C12 42 18 46 24 46 C32 46 38 40 38 32 C38 24 32 22 30 14 C28 20 26 22 24 22 C26 14 26 8 24 2 Z" fill={c} />
      <Path d="M24 26 C18 32 18 38 20 41 Q24 44 28 41 C30 38 30 32 24 26 Z" fill="#FFD54A" />
    </G>
  ),
  earth: (c = '#9A7547') => (
    <G>
      <Path d="M6 40 L12 20 L24 10 L38 16 L44 38 Z" fill={c} />
      <Path d="M12 20 L24 26 L38 16 M24 26 L22 40" stroke="#fff" strokeWidth={2} opacity={0.4} fill="none" />
      <Path d="M4 42 L44 42" stroke={c} strokeWidth={4} strokeLinecap="round" />
    </G>
  ),
  wind: (c = '#5BB8A6') => (
    <G>
      <Path d="M4 18 L30 18 C36 18 38 10 32 8 C28 7 26 10 27 12" stroke={c} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      <Path d="M4 28 L38 28 C44 28 46 36 40 38 C36 39 34 36 35 34" stroke={c} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      <Path d="M10 38 L24 38" stroke={c} strokeWidth={4.5} strokeLinecap="round" />
    </G>
  ),
  flask: () => (
    <G>
      <Rect x={18} y={4} width={12} height={8} rx={2} fill="#7A5634" />
      <Path d="M16 12 L32 12 L32 18 Q42 24 40 36 Q38 46 24 46 Q10 46 8 36 Q6 24 16 18 Z" fill="#7CC6F2" stroke="#4E7FA8" strokeWidth={2} />
      <Path d="M10 32 Q24 28 38 32 Q38 44 24 44 Q10 44 10 32 Z" fill="#3B8FD9" />
    </G>
  ),
  berries: () => (
    <G>
      <Path d="M24 6 Q30 12 26 18" stroke="#4E9F6B" strokeWidth={3} fill="none" />
      <Path d="M24 8 Q34 2 40 10 Q32 14 24 8 Z" fill="#6CBF6A" />
      <Circle cx={16} cy={28} r={10} fill="#F2A33A" />
      <Circle cx={32} cy={30} r={10} fill="#E8862C" />
      <Circle cx={24} cy={40} r={8} fill="#F6B54A" />
      <Circle cx={13} cy={25} r={2.5} fill="#fff" opacity={0.7} />
      <Circle cx={29} cy={27} r={2.5} fill="#fff" opacity={0.7} />
    </G>
  ),
  stick: () => (
    <G>
      <Path d="M8 42 L40 8" stroke="#8A5A34" strokeWidth={6} strokeLinecap="round" />
      <Path d="M26 22 L36 24" stroke="#8A5A34" strokeWidth={4} strokeLinecap="round" />
      <Path d="M36 24 Q42 22 42 28 Q36 30 36 24 Z" fill="#6CBF6A" />
    </G>
  ),
  charm: () => (
    <G>
      <Path d="M24 2 L24 10" stroke="#7A5634" strokeWidth={2} />
      <Circle cx={24} cy={28} r={17} fill="#C9935A" stroke="#8A5A34" strokeWidth={2.5} />
      <Path d="M16 28 Q24 16 32 28 Q24 40 16 28 Z" fill="none" stroke="#5A3820" strokeWidth={2.5} />
      <Circle cx={24} cy={28} r={3.5} fill="#5A3820" />
    </G>
  ),
  stone: () => (
    <G>
      <Circle cx={24} cy={26} r={20} fill="#FFF6C8" opacity={0.7} />
      <Path d="M14 40 L9 26 L19 12 L32 14 L39 28 L32 40 Z" fill="#B7E3F2" stroke="#6FA9C7" strokeWidth={2} />
      <Path d="M16 20 L19 17" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </G>
  ),
  pebble: () => (
    <G>
      <Ellipse cx={24} cy={40} rx={16} ry={4} fill="#000" opacity={0.12} />
      <Ellipse cx={24} cy={27} rx={16} ry={14} fill="#A9A298" stroke="#7C7366" strokeWidth={2} />
      <Ellipse cx={18} cy={21} rx={5} ry={3} fill="#fff" opacity={0.5} />
    </G>
  ),
  feather: () => (
    <G>
      <Path d="M24 44 Q22 30 24 12" stroke="#8DBF9A" strokeWidth={2.5} fill="none" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return <Circle key={i} cx={24 + Math.cos(a) * 12} cy={14 + Math.sin(a) * 10} r={5} fill="#F6FFFD" stroke="#BFE3DB" strokeWidth={1.2} />;
      })}
      <Circle cx={24} cy={14} r={6} fill="#fff" />
    </G>
  ),
  heart: (c = '#E25C7A') => <Path d="M24 42 C10 32 4 24 4 16 C4 9 9 5 15 5 C19 5 22 7 24 11 C26 7 29 5 33 5 C39 5 44 9 44 16 C44 24 38 32 24 42 Z" fill={c} />,
  speaker: (c = '#1F2A37') => (
    <G>
      <Path d="M6 18 L16 18 L28 8 L28 40 L16 30 L6 30 Z" fill={c} />
      <Path d="M34 16 Q40 24 34 32" stroke={c} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d="M38 10 Q48 24 38 38" stroke={c} strokeWidth={4} strokeLinecap="round" fill="none" />
    </G>
  ),
  tent: (c = '#1F2A37') => (
    <G>
      <Polygon points="4,42 24,6 44,42" fill={c} />
      <Polygon points="18,42 24,26 30,42" fill="#fff" opacity={0.85} />
    </G>
  ),
  map: (c = '#1F2A37') => (
    <G>
      <Path d="M4 10 L16 6 L32 12 L44 8 L44 40 L32 44 L16 38 L4 42 Z" fill={c} />
      <Path d="M16 6 L16 38 M32 12 L32 44" stroke="#fff" strokeWidth={2} opacity={0.8} />
      <Circle cx={36} cy={22} r={3} fill="#fff" />
    </G>
  ),
  milo: (c = '#1F2A37') => (
    <G>
      <Path d="M12 18 C6 10 4 2 8 2 C12 2 18 10 20 14 Z M36 18 C42 10 44 2 40 2 C36 2 30 10 28 14 Z" fill={c} />
      <Ellipse cx={24} cy={28} rx={18} ry={16} fill={c} />
      <Circle cx={18} cy={27} r={3} fill="#fff" />
      <Circle cx={30} cy={27} r={3} fill="#fff" />
    </G>
  ),
  journal: (c = '#1F2A37') => (
    <G>
      <Rect x={8} y={4} width={32} height={40} rx={4} fill={c} />
      <Rect x={12} y={4} width={4} height={40} fill="#fff" opacity={0.4} />
      <Path d="M22 14 L34 14 M22 20 L32 20" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
    </G>
  ),
  bag: (c = '#1F2A37') => (
    <G>
      <Path d="M16 14 Q16 4 24 4 Q32 4 32 14" stroke={c} strokeWidth={4} fill="none" />
      <Rect x={6} y={14} width={36} height={30} rx={8} fill={c} />
      <Rect x={18} y={22} width={12} height={8} rx={2} fill="#fff" opacity={0.8} />
    </G>
  ),
  star: (c = '#E8A33D') => <Polygon points="24,3 30,17 45,18 33,28 37,43 24,35 11,43 15,28 3,18 18,17" fill={c} />,
  lock: (c = '#7A8494') => (
    <G>
      <Path d="M14 22 L14 16 Q14 6 24 6 Q34 6 34 16 L34 22" stroke={c} strokeWidth={4} fill="none" />
      <Rect x={8} y={22} width={32} height={22} rx={5} fill={c} />
    </G>
  ),
  gear: (c = '#1F2A37') => (
    <G>
      {[0, 45, 90, 135].map((a) => (
        <Rect key={a} x={20} y={2} width={8} height={44} rx={3} fill={c} transform={`rotate(${a} 24 24)`} />
      ))}
      <Circle cx={24} cy={24} r={14} fill={c} />
      <Circle cx={24} cy={24} r={6} fill="#fff" />
    </G>
  ),
  question: (c = '#1F2A37') => (
    <G>
      <Circle cx={24} cy={24} r={21} fill={c} />
      <Path d="M17 18 Q17 10 24 10 Q32 10 32 17 Q32 22 26 24 L26 29" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" fill="none" />
      <Circle cx={26} cy={37} r={3} fill="#fff" />
    </G>
  ),
  close: (c = '#1F2A37') => <Path d="M12 12 L36 36 M36 12 L12 36" stroke={c} strokeWidth={5} strokeLinecap="round" />,
  rubbing: () => (
    <G>
      <Path d="M9 5 L35 4 L41 10 L40 44 L8 45 Z" fill="#F4EEDF" stroke="#B9A88A" strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M35 4 L35 10 L41 10 Z" fill="#DCCFB4" stroke="#B9A88A" strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M12 12 Q22 9 34 12 Q37 23 35 35 Q24 38 13 35 Q10 23 12 12 Z" fill="#45454C" />
      <Path d="M11 17 L16 11 M11 24 L22 11 M12 31 L30 11 M15 36 L36 15 M23 37 L37 23 M31 37 L37 31" stroke="#64646C" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
      <Path d="M16 16 L16 22 M19 16 L21 22 L23 16 M26 16 L26 22 L30 22 M16 27 L20 27 M18 27 L18 32 M23 27 Q27 29.5 23 32 M29 32 L31 27 L33 32" stroke="#EDE8DC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M15 40 Q24 38 33 40" stroke="#8A8A90" strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.6} />
    </G>
  ),
  shield: (c = '#4E7FA8') => (
    <G>
      <Path d="M24 4 C31 4 37 6 42 9 C42 30 35 40 24 45 C13 40 6 30 6 9 C11 6 17 4 24 4 Z" fill={c} />
      <Path d="M24 9 C19 9 15 10 11 12 C11 28 16 35 24 39 Z" fill="#fff" opacity={0.25} />
      <Path d="M24 9 C29 9 33 10 37 12 C37 28 32 35 24 39 C16 35 11 28 11 12 C15 10 19 9 24 9 Z" fill="none" stroke="#fff" strokeWidth={2} opacity={0.55} />
    </G>
  ),
  burst: (c = '#D8572A') => (
    <G>
      <Path d="M3 17 L11 17 M2 24 L9 24 M3 31 L11 31" stroke={c} strokeWidth={3.5} strokeLinecap="round" opacity={0.7} />
      <Polygon points="32.0,7.6 33.7,17.5 40.2,16.0 37.2,22.0 46.9,26.0 36.5,27.7 37.7,33.8 32.0,31.2 28.0,40.9 26.3,30.5 19.4,32.3 22.8,26.0 13.1,22.0 23.5,20.3 22.0,13.8 28.0,16.8" fill={c} strokeLinejoin="round" />
      <Polygon points="31.0,15.8 31.8,20.7 35.1,20.0 33.6,23.0 38.4,25.0 33.3,25.8 33.9,28.9 31.0,27.6 29.0,32.4 28.2,27.3 24.7,28.2 26.4,25.0 21.6,23.0 26.7,22.2 26.0,18.9 29.0,20.4" fill="#fff" opacity={0.55} />
    </G>
  ),
};

export function Icon({ name, size = 24, color }: { name: string; size?: number; color?: string }) {
  const draw = ICONS[name];
  if (!draw) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {draw(color)}
    </Svg>
  );
}
