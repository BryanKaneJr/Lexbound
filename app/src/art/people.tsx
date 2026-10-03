import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * Lexora's humans. They speak English, so their art carries less of the
 * story than the Lexlings'; a friendly face and a silhouette you can tell
 * apart are enough. Drawn facing right.
 */
const SKIN = '#F2C9A5';
const INK = '#2A2236';

export const MAREN_ASPECT = 120 / 260;

export function MarenArt({ width, mood = 'idle' }: { width: number; mood?: string }) {
  return (
    <Svg width={width} height={width / MAREN_ASPECT} viewBox="0 0 120 260">
      <Ellipse cx={60} cy={256} rx={40} ry={4} fill="#000" opacity={0.15} />
      <Rect x={40} y={210} width={14} height={42} rx={5} fill="#4A3B2E" />
      <Rect x={66} y={210} width={14} height={42} rx={5} fill="#4A3B2E" />
      <Path d="M28 112 Q60 96 92 112 L104 226 Q60 238 16 226 Z" fill="#6E4F8C" />
      <Path d="M60 104 L60 232" stroke="#5A3F74" strokeWidth={2} />
      <Circle cx={60} cy={150} r={3} fill="#E8C66A" />
      <Circle cx={60} cy={176} r={3} fill="#E8C66A" />
      <Path d="M30 116 Q16 150 22 190" stroke="#6E4F8C" strokeWidth={15} strokeLinecap="round" fill="none" />
      <Path d="M90 116 Q104 150 98 190" stroke="#6E4F8C" strokeWidth={15} strokeLinecap="round" fill="none" />
      <Circle cx={22} cy={194} r={8} fill={SKIN} />
      <Circle cx={98} cy={194} r={8} fill={SKIN} />
      <Path d="M38 106 Q60 124 82 106 L78 98 Q60 110 42 98 Z" fill="#C9A24A" />
      <Rect x={53} y={86} width={14} height={16} fill={SKIN} />
      <Ellipse cx={60} cy={66} rx={26} ry={30} fill={SKIN} />
      <Path d="M34 64 Q34 30 60 30 Q86 30 86 64 Q80 46 60 44 Q40 46 34 64 Z" fill="#A9A4A0" />
      <Circle cx={60} cy={26} r={13} fill="#A9A4A0" />
      <Path d="M52 22 Q60 16 68 22" stroke="#8E8984" strokeWidth={2} fill="none" />
      <Circle cx={50} cy={68} r={7} fill="none" stroke="#6B4E2E" strokeWidth={2} />
      <Circle cx={72} cy={68} r={7} fill="none" stroke="#6B4E2E" strokeWidth={2} />
      <Path d="M57 68 L65 68" stroke="#6B4E2E" strokeWidth={2} />
      <Circle cx={50} cy={68} r={2.4} fill={INK} />
      <Circle cx={72} cy={68} r={2.4} fill={INK} />
      {mood === 'surprised' ? (
        <Ellipse cx={61} cy={84} rx={4} ry={5} fill="#8A3B3B" />
      ) : (
        <Path d="M53 82 Q61 89 69 82" stroke="#8A3B3B" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      )}
      <Path d={mood === 'surprised' ? 'M43 56 Q50 50 56 55 M66 55 Q72 50 79 56' : 'M44 58 Q50 55 56 58 M66 58 Q72 55 78 58'} stroke="#7E7975" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Ellipse cx={44} cy={78} rx={5} ry={3} fill="#E89B9B" opacity={0.5} />
      <Ellipse cx={78} cy={78} rx={5} ry={3} fill="#E89B9B" opacity={0.5} />
    </Svg>
  );
}

export const PIP_ASPECT = 110 / 230;

export function PipArt({ width }: { width: number; mood?: string }) {
  return (
    <Svg width={width} height={width / PIP_ASPECT} viewBox="0 0 110 230">
      <Ellipse cx={55} cy={226} rx={36} ry={4} fill="#000" opacity={0.15} />
      <Rect x={36} y={178} width={13} height={44} rx={5} fill="#3D4A5C" />
      <Rect x={60} y={178} width={13} height={44} rx={5} fill="#3D4A5C" />
      <Path d="M26 104 Q55 92 84 104 L90 186 Q55 196 20 186 Z" fill="#4F8A5B" />
      <Path d="M28 108 Q14 136 20 166" stroke="#4F8A5B" strokeWidth={13} strokeLinecap="round" fill="none" />
      <Path d="M82 108 Q100 120 96 92" stroke="#4F8A5B" strokeWidth={13} strokeLinecap="round" fill="none" />
      <Circle cx={20} cy={170} r={7} fill={SKIN} />
      <Circle cx={96} cy={88} r={7} fill={SKIN} />
      <Path d="M24 120 L86 170" stroke="#7A5634" strokeWidth={5} />
      <Rect x={70} y={160} width={22} height={18} rx={4} fill="#9C6B3E" />
      <Path d="M34 98 Q55 116 76 98 Q78 110 70 112 L40 112 Q32 110 34 98 Z" fill="#E07A2C" />
      <Path d="M62 108 L70 132 L60 130 Z" fill="#E07A2C" />
      <Rect x={48} y={80} width={14} height={16} fill={SKIN} />
      <Ellipse cx={55} cy={62} rx={24} ry={27} fill={SKIN} />
      <Path d="M30 60 Q28 30 55 32 Q84 30 80 60 Q76 44 66 48 Q60 38 52 46 Q42 40 38 52 Q34 50 30 60 Z" fill="#7A4A2A" />
      <Path d="M40 36 L36 26 L46 32 M58 32 L60 20 L66 32" stroke="#7A4A2A" strokeWidth={5} strokeLinecap="round" fill="none" />
      <Circle cx={46} cy={64} r={3} fill={INK} />
      <Circle cx={64} cy={64} r={3} fill={INK} />
      <Path d="M44 76 Q55 86 66 76" stroke="#8A3B3B" strokeWidth={2.5} strokeLinecap="round" fill="#fff" />
      <G opacity={0.55}>
        <Circle cx={40} cy={72} r={1.2} fill="#B5795A" />
        <Circle cx={44} cy={74} r={1.2} fill="#B5795A" />
        <Circle cx={66} cy={74} r={1.2} fill="#B5795A" />
        <Circle cx={70} cy={72} r={1.2} fill="#B5795A" />
      </G>
    </Svg>
  );
}
