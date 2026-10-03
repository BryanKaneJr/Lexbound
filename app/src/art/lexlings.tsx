import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

/**
 * The Lexlings of Whisperwood, drawn in code. Each faces right; scenes flip
 * them. Moods are a small set per species (bible §52: 3-6 expressions for a
 * minor creature): idle, happy, angry, hurt, scared, confused, plus
 * "blazing" for an Emberhog whose flames were fanned.
 */
export type LexlingMood = 'idle' | 'happy' | 'angry' | 'hurt' | 'scared' | 'confused' | 'blazing' | 'sad';

const EYE = '#2A2236';

function useIds() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (n: string) => `${n}${uid}`;
}

function flame(x: number, y: number, h: number, w: number, fill: string, tilt = 0) {
  return (
    <Path
      d={`M${x} ${y} C${x - w} ${y - h * 0.35} ${x - w * 0.6} ${y - h * 0.75} ${x} ${y - h} C${x + w * 0.2} ${y - h * 0.7} ${x + w} ${y - h * 0.45} ${x + w * 0.7} ${y - h * 0.15} C${x + w * 0.5} ${y} ${x + w * 0.2} ${y + 2} ${x} ${y} Z`}
      fill={fill}
      transform={`rotate(${tilt} ${x} ${y})`}
    />
  );
}

export const EMBERHOG_ASPECT = 220 / 170;

export function EmberhogArt({ width, mood = 'angry' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  const scale = mood === 'blazing' ? 1.4 : mood === 'hurt' ? 0.55 : mood === 'happy' ? 1.1 : 1;
  const quills = [
    [52, 82, -38],
    [74, 70, -22],
    [98, 64, -6],
    [122, 66, 8],
    [142, 74, 22],
  ];
  return (
    <Svg width={width} height={width / EMBERHOG_ASPECT} viewBox="0 0 220 170">
      <Defs>
        <LinearGradient id={g('fl')} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={mood === 'hurt' ? '#9C6B52' : '#D8381E'} />
          <Stop offset="0.5" stopColor={mood === 'hurt' ? '#C08A6A' : '#F07A1E'} />
          <Stop offset="1" stopColor={mood === 'hurt' ? '#D9B79C' : '#FFD54A'} />
        </LinearGradient>
        <RadialGradient id={g('bd')} cx="0.45" cy="0.35" r="0.8">
          <Stop offset="0" stopColor="#C2603C" />
          <Stop offset="1" stopColor="#7E2F1D" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={110} cy={164} rx={78} ry={6} fill="#000" opacity={0.15} />
      {/* flame quills along the back */}
      <G>
        {quills.map(([x, y, t], i) => (
          <G key={i}>{flame(x as number, y as number, 46 * scale, 15 * Math.min(scale, 1.2), `url(#${g('fl')})`, t as number)}</G>
        ))}
        {mood !== 'hurt' && flame(98, 64, 22 * scale, 7, '#FFE89A', -6)}
      </G>
      {/* tail flame */}
      {flame(26, 112, 26 * scale, 9, `url(#${g('fl')})`, -70)}
      {/* legs */}
      {[58, 82, 132, 156].map((x) => (
        <Ellipse key={x} cx={x} cy={152} rx={11} ry={12} fill="#6B2716" />
      ))}
      {/* body */}
      <Ellipse cx={100} cy={116} rx={74} ry={44} fill={`url(#${g('bd')})`} />
      <Ellipse cx={108} cy={136} rx={50} ry={20} fill="#E2A07A" opacity={0.85} />
      {/* head + snout */}
      <Circle cx={162} cy={104} r={36} fill={`url(#${g('bd')})`} />
      <Path d="M150 72 L160 50 L172 74 Z" fill="#7E2F1D" />
      <Ellipse cx={196} cy={118} rx={18} ry={14} fill="#D88A6E" />
      <Ellipse cx={191} cy={116} rx={3} ry={4} fill="#5A1E12" />
      <Ellipse cx={202} cy={116} rx={3} ry={4} fill="#5A1E12" />
      <Path d="M184 130 Q182 140 188 144" stroke="#FFF3DC" strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d="M204 130 Q206 140 200 144" stroke="#FFF3DC" strokeWidth={4} strokeLinecap="round" fill="none" />
      {/* eye */}
      {mood === 'hurt' ? (
        <Path d="M164 92 L176 100 M176 92 L164 100" stroke={EYE} strokeWidth={4} strokeLinecap="round" />
      ) : mood === 'happy' ? (
        <Path d="M162 98 Q170 88 178 98" stroke={EYE} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      ) : mood === 'scared' || mood === 'confused' ? (
        <G>
          <Circle cx={170} cy={96} r={9} fill="#fff" stroke={EYE} strokeWidth={2} />
          <Circle cx={171} cy={97} r={4} fill={EYE} />
        </G>
      ) : (
        <G>
          <Ellipse cx={170} cy={97} rx={7} ry={8} fill="#FFE070" />
          <Ellipse cx={171} cy={98} rx={3.5} ry={6} fill={EYE} />
          <Path d="M156 84 L182 92" stroke="#4A160B" strokeWidth={5} strokeLinecap="round" />
        </G>
      )}
      {mood === 'hurt' && (
        <G opacity={0.7}>
          <Circle cx={90} cy={40} r={10} fill="#E8EEF2" />
          <Circle cx={106} cy={30} r={13} fill="#E8EEF2" />
          <Circle cx={124} cy={42} r={9} fill="#E8EEF2" />
        </G>
      )}
    </Svg>
  );
}

export const DRIZZLET_ASPECT = 120 / 140;

export function DrizzletArt({ width, mood = 'happy' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  return (
    <Svg width={width} height={width / DRIZZLET_ASPECT} viewBox="0 0 120 140">
      <Defs>
        <LinearGradient id={g('w')} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#9AD8FF" />
          <Stop offset="1" stopColor="#2F7FD1" />
        </LinearGradient>
      </Defs>
      <Path d="M14 96 Q2 86 6 74 Q16 84 22 88 Z" fill="#5AA9E8" />
      <Path d="M106 96 Q118 86 114 74 Q104 84 98 88 Z" fill="#5AA9E8" />
      <Path d="M60 6 C60 6 104 62 104 92 C104 118 84 136 60 136 C36 136 16 118 16 92 C16 62 60 6 60 6 Z" fill={`url(#${g('w')})`} opacity={0.95} />
      <Ellipse cx={42} cy={70} rx={8} ry={16} fill="#fff" opacity={0.55} transform="rotate(20 42 70)" />
      {mood === 'happy' ? (
        <G>
          <Path d="M38 96 Q46 86 54 96" stroke={EYE} strokeWidth={4} strokeLinecap="round" fill="none" />
          <Path d="M66 96 Q74 86 82 96" stroke={EYE} strokeWidth={4} strokeLinecap="round" fill="none" />
        </G>
      ) : (
        <G>
          <Ellipse cx={46} cy={94} rx={7} ry={9} fill={EYE} />
          <Ellipse cx={74} cy={94} rx={7} ry={9} fill={EYE} />
          <Circle cx={48} cy={90} r={2.5} fill="#fff" />
          <Circle cx={76} cy={90} r={2.5} fill="#fff" />
        </G>
      )}
      <Path d={mood === 'sad' ? 'M52 116 Q60 110 68 116' : 'M52 110 Q60 120 68 110'} stroke={EYE} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Ellipse cx={36} cy={106} rx={6} ry={3.5} fill="#F59BAE" opacity={0.5} />
      <Ellipse cx={84} cy={106} rx={6} ry={3.5} fill="#F59BAE" opacity={0.5} />
    </Svg>
  );
}

export const PEBBLIT_ASPECT = 140 / 110;

export function PebblitArt({ width, mood = 'scared' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  const curled = mood === 'hurt';
  return (
    <Svg width={width} height={width / PEBBLIT_ASPECT} viewBox="0 0 140 110">
      <Defs>
        <RadialGradient id={g('s')} cx="0.4" cy="0.3" r="0.8">
          <Stop offset="0" stopColor="#B9B2A6" />
          <Stop offset="1" stopColor="#7C7366" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={70} cy={106} rx={52} ry={4} fill="#000" opacity={0.15} />
      {!curled && (
        <G>
          <Ellipse cx={42} cy={100} rx={9} ry={6} fill="#8A6F55" />
          <Ellipse cx={98} cy={100} rx={9} ry={6} fill="#8A6F55" />
        </G>
      )}
      <Path d={curled ? 'M20 100 Q20 30 70 30 Q120 30 120 100 Z' : 'M16 84 Q16 18 70 18 Q124 18 124 84 Z'} fill={`url(#${g('s')})`} stroke="#6A6256" strokeWidth={2} />
      <Circle cx={50} cy={40} r={7} fill="#A39A8C" />
      <Circle cx={88} cy={34} r={5} fill="#A39A8C" />
      <Circle cx={100} cy={56} r={6} fill="#A39A8C" />
      <Circle cx={36} cy={62} r={4} fill="#A39A8C" />
      <Path d={curled ? 'M54 32 Q70 20 86 32' : 'M50 20 Q70 6 90 20 Q80 24 70 22 Q60 24 50 20 Z'} fill="#6FA35A" />
      {!curled && (
        <G>
          <Path d="M24 84 Q70 98 116 84 L116 92 Q70 106 24 92 Z" fill="#8A6F55" />
          {mood === 'happy' ? (
            <G>
              <Path d="M50 82 Q56 76 62 82" stroke={EYE} strokeWidth={3.5} strokeLinecap="round" fill="none" />
              <Path d="M78 82 Q84 76 90 82" stroke={EYE} strokeWidth={3.5} strokeLinecap="round" fill="none" />
            </G>
          ) : (
            <G>
              <Circle cx={56} cy={80} r={mood === 'scared' ? 7 : 6} fill="#fff" />
              <Circle cx={84} cy={80} r={mood === 'scared' ? 7 : 6} fill="#fff" />
              <Circle cx={57} cy={81} r={3.2} fill={EYE} />
              <Circle cx={85} cy={81} r={3.2} fill={EYE} />
            </G>
          )}
        </G>
      )}
    </Svg>
  );
}

export const PUFFKIN_ASPECT = 1;

export function PuffkinArt({ width, mood = 'happy' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  const spokes = Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2);
  return (
    <Svg width={width} height={width} viewBox="0 0 140 140">
      <Defs>
        <RadialGradient id={g('p')} cx="0.5" cy="0.45" r="0.6">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#D8F1EC" />
        </RadialGradient>
      </Defs>
      {spokes.map((a, i) => {
        const x = 70 + Math.cos(a) * 54;
        const y = 66 + Math.sin(a) * 54;
        return (
          <G key={i}>
            <Line x1={70} y1={66} x2={x} y2={y} stroke="#D3ECE7" strokeWidth={2} />
            <Circle cx={x} cy={y} r={7} fill="#F6FFFD" stroke="#CFE9E3" strokeWidth={1.2} />
          </G>
        );
      })}
      <Circle cx={70} cy={66} r={30} fill={`url(#${g('p')})`} stroke="#BFE3DB" strokeWidth={2} />
      <Path d="M70 96 Q66 116 72 132" stroke="#8DBF9A" strokeWidth={3} fill="none" strokeLinecap="round" />
      {mood === 'happy' ? (
        <G>
          <Path d="M56 66 Q61 60 66 66" stroke={EYE} strokeWidth={3.2} strokeLinecap="round" fill="none" />
          <Path d="M74 66 Q79 60 84 66" stroke={EYE} strokeWidth={3.2} strokeLinecap="round" fill="none" />
        </G>
      ) : (
        <G>
          <Circle cx={61} cy={64} r={4.5} fill={EYE} />
          <Circle cx={79} cy={64} r={4.5} fill={EYE} />
        </G>
      )}
      <Path d={mood === 'sad' ? 'M64 80 Q70 75 76 80' : 'M64 76 Q70 82 76 76'} stroke={EYE} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <Ellipse cx={54} cy={74} rx={5} ry={3} fill="#F59BAE" opacity={0.5} />
      <Ellipse cx={86} cy={74} rx={5} ry={3} fill="#F59BAE" opacity={0.5} />
    </Svg>
  );
}
