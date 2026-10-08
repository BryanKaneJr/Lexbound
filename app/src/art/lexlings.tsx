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

/** `scarf` dresses a Puffkin in a little knitted scarf: that's Bluster, Pip's Puffkin. */
export function PuffkinArt({ width, mood = 'happy', scarf = false }: { width: number; mood?: LexlingMood; scarf?: boolean }) {
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
      {scarf && (
        <G>
          {/* the trailing end, knotted at the back and streaming behind */}
          <Path d="M50 90 Q42 106 28 116 L36 124 Q50 112 60 96 Z" fill="#C2362F" />
          <Path d="M30 118 L24 124 M33 121 L28 128 M37 123 L34 130" stroke="#C2362F" strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M46 104 L40 99 M41 110 L35 106" stroke="#97241F" strokeWidth={1.6} strokeLinecap="round" opacity={0.8} />
          {/* the band round the neck */}
          <Path d="M43 84 Q70 100 97 84 L96 95 Q70 111 44 95 Z" fill="#D8433A" />
          {[50, 58, 66, 74, 82, 90].map((x) => (
            <Path key={x} d={`M${x} ${88 + Math.abs(x - 70) * -0.12 + 3} l2 4 l2 -4`} stroke="#A82E28" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
          <Path d="M44 86 Q70 101 96 86" stroke="#F07468" strokeWidth={1.6} fill="none" opacity={0.7} />
          <Circle cx={52} cy={95} r={6} fill="#C2362F" />
        </G>
      )}
    </Svg>
  );
}

export const FLICKERWING_ASPECT = 150 / 120;

/** A soft paddle wing, base at the origin, pointing up. */
const WING = 'M0 0 C-13 -4 -19 -22 -13 -36 C-7 -48 10 -48 14 -36 C18 -24 10 -6 0 0 Z';

/**
 * A moth-sized fire Lexling. Its coal tail is its mood: bright and haloed
 * when content, dim when sad, nearly out when frightened.
 */
export function FlickerwingArt({ width, mood = 'happy' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  const dark = mood === 'scared';
  const dim = mood === 'sad' || mood === 'hurt';
  const hot = mood === 'blazing';
  const coal = dark ? ['#857467', '#62544A', '#40362F'] : dim ? ['#F0A866', '#C0632F', '#7A3A22'] : hot ? ['#FFFFFF', '#FFE070', '#F07A1E'] : ['#FFF6C0', '#FFB52E', '#E0521E'];
  const halo = dark ? 0 : dim ? 0.3 : hot ? 0.95 : mood === 'happy' || mood === 'idle' ? 0.75 : 0.6;
  // Wings rise when it's content, droop when it's low and fold flat when it's frightened.
  const tilt = dark ? -62 : dim ? -30 : mood === 'happy' || hot ? 8 : 0;
  const fuzz = Array.from({ length: 22 }, (_, i) => (i / 22) * Math.PI * 2);
  return (
    <Svg width={width} height={width / FLICKERWING_ASPECT} viewBox="0 0 150 120">
      <Defs>
        <RadialGradient id={g('h')} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FFD36A" stopOpacity={1} />
          <Stop offset="0.45" stopColor="#FFB347" stopOpacity={0.5} />
          <Stop offset="1" stopColor="#FFB347" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={g('c')} cx="0.42" cy="0.4" r="0.62">
          <Stop offset="0" stopColor={coal[0]} />
          <Stop offset="0.55" stopColor={coal[1]} />
          <Stop offset="1" stopColor={coal[2]} />
        </RadialGradient>
        <RadialGradient id={g('b')} cx="0.42" cy="0.36" r="0.7">
          <Stop offset="0" stopColor="#FFE2B8" />
          <Stop offset="0.6" stopColor="#EFA868" />
          <Stop offset="1" stopColor="#C9733F" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={84} cy={116} rx={32} ry={3.5} fill="#000" opacity={0.15} />
      {halo > 0 && <Circle cx={30} cy={82} r={30} fill={`url(#${g('h')})`} opacity={halo} />}
      {/* wings, behind the body */}
      <Path d={WING} fill="#F2C08E" transform={`translate(80 48) rotate(${-42 + tilt}) scale(1.05)`} />
      <Path d={WING} fill="#FFE9CC" transform={`translate(90 45) rotate(${-14 + tilt})`} />
      <Circle cx={0} cy={-30} r={6} fill="#F2A65A" transform={`translate(90 45) rotate(${-14 + tilt})`} />
      <Circle cx={0} cy={-30} r={2.6} fill="#B8582E" transform={`translate(90 45) rotate(${-14 + tilt})`} />
      {/* the coal tail */}
      <Path d="M62 84 Q48 90 36 84" stroke="#C9733F" strokeWidth={10} strokeLinecap="round" fill="none" />
      <Circle cx={30} cy={82} r={14} fill={`url(#${g('c')})`} />
      <Path d="M22 76 L29 81 L26 90 M29 81 L38 78" stroke={coal[2]} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.55} />
      {dark && (
        <G>
          <Circle cx={34} cy={85} r={6} fill="#FF8A3A" opacity={0.3} />
          <Circle cx={34} cy={85} r={2.6} fill="#FF7A2A" />
        </G>
      )}
      {hot && (
        <G>
          <Circle cx={20} cy={60} r={2.4} fill="#FFE070" />
          <Circle cx={34} cy={54} r={1.8} fill="#FFF6C0" />
          <Circle cx={12} cy={70} r={1.6} fill="#FFB52E" />
        </G>
      )}
      {/* feet, then the fuzzy body */}
      <Ellipse cx={78} cy={101} rx={5.5} ry={4} fill="#9A4E2C" />
      <Ellipse cx={96} cy={102} rx={5.5} ry={4} fill="#9A4E2C" />
      {fuzz.map((a, i) => (
        <Circle key={i} cx={86 + Math.cos(a) * 29} cy={70 + Math.sin(a) * 29} r={6} fill="#DE9358" />
      ))}
      <Circle cx={86} cy={70} r={31} fill={`url(#${g('b')})`} />
      <Ellipse cx={92} cy={88} rx={17} ry={9} fill="#FFF0D6" opacity={0.6} />
      {/* feathery antennae */}
      <Path d={dark ? 'M94 44 Q88 30 76 26' : 'M94 42 Q96 28 104 18'} stroke="#8A4A2A" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Path d={dark ? 'M104 46 Q102 32 92 24' : 'M104 46 Q112 34 124 28'} stroke="#8A4A2A" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Ellipse cx={dark ? 74 : 105} cy={dark ? 26 : 16} rx={4} ry={6.5} fill="#E59A5C" transform={dark ? 'rotate(-70 74 26)' : 'rotate(25 105 16)'} />
      <Ellipse cx={dark ? 90 : 126} cy={dark ? 23 : 27} rx={4} ry={6.5} fill="#E59A5C" transform={dark ? 'rotate(-60 90 23)' : 'rotate(60 126 27)'} />
      {/* big eyes */}
      {mood === 'hurt' ? (
        <G>
          <Path d="M82 60 L92 66 L82 72" stroke={EYE} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M112 60 L102 66 L112 72" stroke={EYE} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </G>
      ) : (
        <G>
          <Circle cx={88} cy={66} r={dark ? 10.5 : 9.5} fill="#fff" />
          <Circle cx={107} cy={66} r={dark ? 10.5 : 9.5} fill="#fff" />
          <Circle cx={mood === 'confused' ? 87 : 89.5} cy={mood === 'sad' ? 69 : mood === 'confused' ? 63 : 67} r={dark ? 4 : 6.5} fill={EYE} />
          <Circle cx={108.5} cy={mood === 'sad' ? 69 : 67} r={dark ? 4 : 6.5} fill={EYE} />
          <Circle cx={86.5} cy={63} r={dark ? 1.6 : 2.6} fill="#fff" />
          <Circle cx={105.5} cy={63} r={dark ? 1.6 : 2.6} fill="#fff" />
          {mood === 'sad' && (
            <G>
              <Path d="M77 56 L99 56 L99 63 Q90 63 77 59 Z" fill="#EFA868" />
              <Path d="M96 56 L118 56 L118 59 Q105 63 96 63 Z" fill="#EFA868" />
            </G>
          )}
        </G>
      )}
      {(mood === 'angry' || hot) && <Path d="M79 54 L95 59 M116 54 L101 59" stroke="#7A3A22" strokeWidth={3.5} strokeLinecap="round" />}
      {dark && <Path d="M80 52 L94 48 M115 52 L101 48" stroke="#7A3A22" strokeWidth={3} strokeLinecap="round" />}
      {/* mouth */}
      <Path
        d={dark ? 'M93 85 q2.5 -3 5 0 t5 0' : mood === 'sad' || mood === 'hurt' ? 'M93 87 Q98 82 103 87' : mood === 'confused' ? 'M93 85 q2.5 -3 5 0 t5 0' : 'M93 83 Q98 89 103 83'}
        stroke={EYE}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx={80} cy={80} rx={5} ry={3} fill="#F07A6A" opacity={dark ? 0.2 : 0.45} />
      <Ellipse cx={113} cy={80} rx={4} ry={3} fill="#F07A6A" opacity={dark ? 0.2 : 0.45} />
    </Svg>
  );
}

export const CRAGLING_ASPECT = 190 / 140;

/** One pincer, wrist at the origin, pointing up, its gap facing forward. */
function pincer(open: boolean, fill: string, light: string) {
  return (
    <G>
      <Path
        d={open ? 'M-2 4 C-16 2 -22 -16 -19 -32 C-15 -48 0 -56 12 -50 L4 -31 L24 -31 C26 -14 14 2 -2 4 Z' : 'M-2 4 C-16 2 -22 -16 -19 -32 C-15 -48 2 -54 15 -45 L9 -36 L20 -34 C24 -18 14 2 -2 4 Z'}
        fill={fill}
      />
      <Path d="M-15 -12 L-13 -32 L-3 -43 L-6 -22 Z" fill={light} opacity={0.5} />
    </G>
  );
}

type Arm = { from: [number, number]; bend: [number, number]; to: [number, number]; turn: number; size: number };

function arm({ from, bend, to, turn, size }: Arm, open: boolean, fill: string, light: string) {
  return (
    <G>
      <Path d={`M${from[0]} ${from[1]} Q${bend[0]} ${bend[1]} ${to[0]} ${to[1]}`} stroke={fill} strokeWidth={12 * size} strokeLinecap="round" fill="none" />
      <G transform={`translate(${to[0]} ${to[1]}) rotate(${turn}) scale(${size})`}>{pincer(open, fill, light)}</G>
    </G>
  );
}

/**
 * An earth Lexling of the Old Hollow: squat and crab-like under a faceted
 * shell of stone, with heavy pincers and small stalk eyes.
 */
export function CraglingArt({ width, mood = 'angry' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  const fierce = mood === 'angry' || mood === 'blazing';
  const hurt = mood === 'hurt';
  const tucked = mood === 'scared';
  const arms: { far: Arm; near: Arm } = fierce
    ? { far: { from: [114, 88], bend: [136, 84], to: [136, 62], turn: -12, size: 0.8 }, near: { from: [122, 100], bend: [158, 100], to: [156, 70], turn: 10, size: 1 } }
    : hurt
      ? { far: { from: [114, 92], bend: [128, 104], to: [136, 104], turn: 72, size: 0.8 }, near: { from: [122, 104], bend: [136, 118], to: [144, 116], turn: 82, size: 0.92 } }
      : tucked
        ? { far: { from: [116, 92], bend: [128, 92], to: [128, 80], turn: -4, size: 0.72 }, near: { from: [122, 102], bend: [144, 102], to: [142, 86], turn: 4, size: 0.84 } }
        : { far: { from: [114, 90], bend: [136, 98], to: [142, 92], turn: 40, size: 0.8 }, near: { from: [122, 102], bend: [148, 112], to: [150, 104], turn: 48, size: 0.94 } };
  const drop = tucked ? 12 : hurt ? 4 : 0;
  const eyes: [number, number][] = tucked ? [[112, 54], [126, 58]] : [[108, 40], [124, 44]];
  return (
    <Svg width={width} height={width / CRAGLING_ASPECT} viewBox="0 0 190 140">
      <Defs>
        <LinearGradient id={g('sh')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.16} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.24} />
        </LinearGradient>
      </Defs>
      <Ellipse cx={88} cy={134} rx={72} ry={5} fill="#000" opacity={0.18} />
      {/* legs, far side then near side */}
      {[46, 68, 90, 110].map((x) => (
        <Path key={x} d={tucked ? `M${x} 112 L${x - 5} 122` : `M${x} 102 L${x - 8} 112 L${x - 6} 126`} stroke="#3A312A" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
      {[32, 54, 76, 98].map((x) => (
        <Path key={x} d={tucked ? `M${x} 114 L${x - 7} 124` : `M${x} 104 L${x - 10} 116 L${x - 7} 130`} stroke="#54473D" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
      <G transform={`translate(0 ${drop})`}>
        {arm(arms.far, fierce, '#5F676E', '#9AA0A4')}
        {/* stalk eyes */}
        <Path d={`M110 62 L${eyes[0][0]} ${eyes[0][1]}`} stroke="#5A4C41" strokeWidth={5} strokeLinecap="round" />
        <Path d={`M122 66 L${eyes[1][0]} ${eyes[1][1]}`} stroke="#5A4C41" strokeWidth={5} strokeLinecap="round" />
        {eyes.map(([x, y], i) =>
          hurt ? (
            <G key={i}>
              <Circle cx={x} cy={y} r={8} fill="#8A7058" />
              <Path d={i === 0 ? `M${x - 4} ${y - 4} L${x + 3} ${y} L${x - 4} ${y + 4}` : `M${x + 4} ${y - 4} L${x - 3} ${y} L${x + 4} ${y + 4}`} stroke={EYE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </G>
          ) : mood === 'happy' ? (
            <G key={i}>
              <Circle cx={x} cy={y} r={8} fill="#9AA0A4" />
              <Path d={`M${x - 4.5} ${y + 1.5} Q${x} ${y - 4.5} ${x + 4.5} ${y + 1.5}`} stroke={EYE} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            </G>
          ) : (
            <G key={i}>
              <Circle cx={x} cy={y} r={tucked ? 9 : 8} fill="#fff" />
              <Circle cx={x + 1.5} cy={y + (mood === 'sad' ? 2.5 : 1)} r={tucked ? 3 : 4} fill={EYE} />
              {mood === 'sad' && <Path d={`M${x - 9} ${y - 3} Q${x} ${y - 6} ${x + 9} ${y - 1} L${x + 9} ${y - 10} L${x - 9} ${y - 10} Z`} fill="#7D858B" />}
            </G>
          ),
        )}
        {fierce && <Path d="M98 30 L115 36 M117 39 L134 32" stroke="#2E2620" strokeWidth={4.5} strokeLinecap="round" />}
        {tucked && <Path d="M102 42 L110 38 M128 42 L136 46" stroke="#2E2620" strokeWidth={3} strokeLinecap="round" />}
        {/* the faceted stone shell */}
        <Path d="M16 108 L22 82 L40 62 L68 50 L100 50 L124 62 L138 84 L142 108 Z" fill="#8A7058" />
        <Path d="M22 82 L40 62 L68 50 L62 78 Z" fill="#A6896D" />
        <Path d="M68 50 L100 50 L92 76 L62 78 Z" fill="#A3A9AD" />
        <Path d="M100 50 L124 62 L138 84 L112 84 L92 76 Z" fill="#7D858B" />
        <Path d="M16 108 L22 82 L62 78 L56 108 Z" fill="#76604F" />
        <Path d="M112 84 L138 84 L142 108 L104 108 Z" fill="#646C73" />
        <Path d="M22 82 L62 78 L92 76 L112 84 M62 78 L56 108 M112 84 L104 108 M68 50 L62 78 M100 50 L92 76" stroke="#C9C2B6" strokeWidth={1.4} opacity={0.45} fill="none" />
        <Path d="M16 108 L22 82 L40 62 L68 50 L100 50 L124 62 L138 84 L142 108 Z" fill={`url(#${g('sh')})`} />
        <Path d="M12 106 L146 106 L142 115 L18 115 Z" fill="#4A3F37" />
        {/* moss */}
        <Circle cx={58} cy={58} r={5} fill="#6FA35A" />
        <Circle cx={65} cy={55} r={3.5} fill="#8BC06E" />
        <Circle cx={94} cy={54} r={3} fill="#6FA35A" />
        <Circle cx={36} cy={72} r={3.5} fill="#6FA35A" />
        <Circle cx={40} cy={69} r={2.2} fill="#8BC06E" />
        {hurt && (
          <G>
            <Path d="M80 50 L76 62 L84 70 L74 82 L80 94" stroke="#2A221C" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M84 70 L96 72" stroke="#2A221C" strokeWidth={2.2} strokeLinecap="round" />
            <Path d="M120 60 L126 64 L122 68 Z" fill="#2A221C" opacity={0.7} />
            <G opacity={0.7}>
              <Circle cx={60} cy={30} r={8} fill="#E8EEF2" />
              <Circle cx={74} cy={22} r={10} fill="#E8EEF2" />
              <Circle cx={88} cy={32} r={7} fill="#E8EEF2" />
            </G>
          </G>
        )}
        {/* mouth, on the front of the shell */}
        <Path
          d={tucked ? 'M131 96 q2.5 -3 5 0 t5 0' : mood === 'happy' ? 'M127 95 Q133 101 140 96' : hurt ? 'M127 98 q3 -3 6 0 t6 0' : 'M127 99 Q133 94 140 97'}
          stroke="#2A221C"
          strokeWidth={2.6}
          strokeLinecap="round"
          fill="none"
        />
        {arm(arms.near, fierce, '#7D858B', '#B8BDC0')}
      </G>
    </Svg>
  );
}

export const CINDERBACK_ASPECT = 240 / 180;

/**
 * Old Cinderback: an Emberhog older than anyone at the Lodge. Built like
 * EmberhogArt, but heavier, grey at the snout, scarred along the quills and
 * face, with yellowed tusks and darker flames that burn white-hot at the
 * tips when fanned.
 */
export function CinderbackArt({ width, mood = 'angry' }: { width: number; mood?: LexlingMood }) {
  const g = useIds();
  const hot = mood === 'blazing';
  const low = mood === 'sad';
  const hurt = mood === 'hurt';
  const scale = hot ? 1.4 : hurt ? 0.5 : low ? 0.5 : mood === 'happy' ? 1.05 : 1;
  const stops: [string, string][] = hurt
    ? [['0', '#7A5A4A'], ['0.5', '#A87E66'], ['1', '#CDB39E']]
    : low
      ? [['0', '#6E2014'], ['0.55', '#A8421F'], ['1', '#D9803E']]
      : hot
        ? [['0', '#7A140C'], ['0.38', '#E2471C'], ['0.7', '#FFC43A'], ['1', '#FFFCEE']]
        : [['0', '#8A180E'], ['0.55', '#D4401C'], ['1', '#FFA63A']];
  const quills = [
    [44, 100, -46],
    [64, 84, -32],
    [88, 74, -16],
    [114, 70, -2],
    [138, 74, 12],
    [158, 86, 26],
  ];
  // Sad, the old head hangs low; hurt, it sags a little.
  const head = low ? 'translate(0 14) rotate(9 166 126)' : hurt ? 'translate(0 6)' : undefined;
  return (
    <Svg width={width} height={width / CINDERBACK_ASPECT} viewBox="0 0 240 180">
      <Defs>
        <LinearGradient id={g('fl')} x1="0" y1="1" x2="0" y2="0">
          {stops.map(([o, c]) => (
            <Stop key={o} offset={o} stopColor={c} />
          ))}
        </LinearGradient>
        <RadialGradient id={g('bd')} cx="0.45" cy="0.35" r="0.8">
          <Stop offset="0" stopColor="#A6573A" />
          <Stop offset="1" stopColor="#5A2214" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={116} cy={174} rx={94} ry={6} fill="#000" opacity={0.17} />
      {/* flame quills along the back */}
      <G>
        {quills.map(([x, y, t], i) => (
          <G key={i}>{flame(x as number, y as number, 52 * scale, 17 * Math.min(scale, 1.2), `url(#${g('fl')})`, t as number)}</G>
        ))}
        {hot && [88, 114, 138].map((x, i) => <G key={x}>{flame(x, [74, 70, 74][i] as number, 26 * scale, 7, '#FFF8E2', [-16, -2, 12][i] as number)}</G>)}
        {!hot && !hurt && flame(114, 70, 22 * scale, 7, '#FFC46A', -2)}
      </G>
      {/* tail flame */}
      {flame(24, 126, 28 * scale, 10, `url(#${g('fl')})`, -70)}
      {/* heavy legs */}
      {[60, 88, 144, 170].map((x) => (
        <Ellipse key={x} cx={x} cy={161} rx={15} ry={13} fill="#4A1A0F" />
      ))}
      {/* body, with old pale scars across the quill roots and flank */}
      <Ellipse cx={106} cy={124} rx={86} ry={50} fill={`url(#${g('bd')})`} />
      <Ellipse cx={114} cy={151} rx={58} ry={18} fill="#C49A84" opacity={0.8} />
      <Path d="M54 98 L66 110 M82 84 L90 98 M108 76 L112 90 M132 76 L128 92 M154 86 L148 100 M70 132 Q86 122 102 128" stroke="#E9C8B2" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85} />
      <G transform={head}>
        {/* head */}
        <Circle cx={180} cy={112} r={42} fill={`url(#${g('bd')})`} />
        <Path d="M164 80 L170 50 L177 62 L182 56 L190 80 Z" fill="#5A2214" />
        {/* grey muzzle and snout */}
        <Ellipse cx={204} cy={128} rx={24} ry={20} fill="#9C928B" opacity={0.85} />
        <Ellipse cx={220} cy={126} rx={20} ry={16} fill="#BDB3AB" />
        <Ellipse cx={214} cy={124} rx={3.2} ry={4.2} fill="#4A3A34" />
        <Ellipse cx={226} cy={124} rx={3.2} ry={4.2} fill="#4A3A34" />
        {/* yellowed tusks */}
        <Path d="M206 140 Q200 154 210 160" stroke="#C9AE68" strokeWidth={6.5} strokeLinecap="round" fill="none" />
        <Path d="M230 140 Q236 154 226 160" stroke="#E4CC86" strokeWidth={6.5} strokeLinecap="round" fill="none" />
        {/* scars across the face */}
        <Path d="M172 90 L196 118 M212 112 L218 118" stroke="#E9C8B2" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
        {/* eye */}
        {hurt ? (
          <Path d="M180 98 L192 110 M192 98 L180 110" stroke={EYE} strokeWidth={4} strokeLinecap="round" />
        ) : low ? (
          <G>
            <Path d="M179 106 Q186 112 194 106" stroke={EYE} strokeWidth={4} strokeLinecap="round" fill="none" />
            <Path d="M172 98 Q182 88 198 94" stroke="#CFC6BE" strokeWidth={5} strokeLinecap="round" fill="none" />
          </G>
        ) : mood === 'happy' ? (
          <Path d="M178 106 Q186 96 194 106" stroke={EYE} strokeWidth={4.5} strokeLinecap="round" fill="none" />
        ) : mood === 'scared' || mood === 'confused' ? (
          <G>
            <Circle cx={186} cy={104} r={9} fill="#fff" stroke={EYE} strokeWidth={2} />
            <Circle cx={187} cy={105} r={4} fill={EYE} />
          </G>
        ) : (
          <G>
            <Ellipse cx={186} cy={105} rx={6.5} ry={7.5} fill={hot ? '#FFF4C2' : '#F0CC58'} />
            <Ellipse cx={187} cy={106} rx={hot ? 2.4 : 3.2} ry={hot ? 4.5 : 5.5} fill={EYE} />
            <Path d="M170 90 L198 100" stroke="#CFC6BE" strokeWidth={6} strokeLinecap="round" />
          </G>
        )}
      </G>
      {hurt && (
        <G opacity={0.7}>
          <Circle cx={92} cy={46} r={11} fill="#E8EEF2" />
          <Circle cx={110} cy={34} r={14} fill="#E8EEF2" />
          <Circle cx={130} cy={46} r={10} fill="#E8EEF2" />
          <Circle cx={150} cy={34} r={8} fill="#E8EEF2" />
        </G>
      )}
    </Svg>
  );
}
