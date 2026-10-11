import { useId } from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { GroundShadow, Shaded } from './paint';

/**
 * Lexora's humans. They speak English, so their art carries less of the
 * story than the Lexlings'; a face with some life in it and a silhouette you
 * can tell apart at a glance are enough.
 *
 * Painted like Milo (docs/art-direction.md): every form in two tones of
 * shade with a rim of light on its upper left, outlined in a darker, warmer
 * version of its own colour. Both stand three-quarters on, facing right,
 * feet on the bottom edge.
 */
type Ids = (n: string) => string;
type Tone = { lit: string; mid: string; shade: string; line: string };

const SKIN: Tone = { lit: '#FCDDC2', mid: '#F2C5A1', shade: '#D9A084', line: '#A3634B' };
const EYE = '#2A2236';
const MOUTH = '#8E3B3A';
const TONGUE = '#E58A8C';
const TEETH = '#FFF8EE';
const BLUSH = '#EE9A8E';

function useIds(): Ids {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (n: string) => `${n}${uid}`;
}

/** One painted form: `step` scales the shading to its size (1 suits a form about 100 units across). */
function Form({ g, id, d, t, step, lw = 1.5, rim = 0.4 }: { g: Ids; id: string; d: string; t: Tone; step: number; lw?: number; rim?: number }) {
  return <Shaded g={g} id={id} d={d} shade={t.shade} mid={t.mid} lit={t.lit} line={t.line} lineWidth={lw} rim={rim} step={step} />;
}

/** A tapered sliver for a fold or a strand: from (x1, y1) to (x2, y2), bowed through (cx, cy), `dx`/`dy` thick at the middle. */
function crease(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, dx: number, dy = 0): string {
  return `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2} Q${cx + dx} ${cy + dy} ${x1} ${y1} Z`;
}

/** Humans have a smaller set of faces than Milo; every mood maps onto one. */
type Face = 'idle' | 'happy' | 'surprised' | 'sad' | 'annoyed' | 'curious';

function faceFor(mood: string | undefined): Face {
  switch (mood) {
    case 'happy':
    case 'excited':
    case 'proud':
      return 'happy';
    case 'surprised':
    case 'scared':
      return 'surprised';
    case 'sad':
    case 'tired':
    case 'hurt':
      return 'sad';
    case 'annoyed':
    case 'angry':
    case 'fierce':
    case 'disgusted':
      return 'annoyed';
    case 'curious':
    case 'confused':
      return 'curious';
    default:
      return 'idle';
  }
}

/** An eye: dark, a lighter iris low in it, a big highlight upper right and a small one lower left. */
function Eye({ x, y, rx, ry, iris, face, lid }: { x: number; y: number; rx: number; ry: number; iris: string; face: Face; lid: string }) {
  if (face === 'happy') {
    return <Path d={`M${x - rx * 1.2} ${y + 0.6} Q${x} ${y - ry * 1.3} ${x + rx * 1.2} ${y + 0.6}`} stroke={EYE} strokeWidth={1.5} strokeLinecap="round" fill="none" />;
  }
  const s = face === 'surprised' ? 1.18 : 1;
  const ex = rx * s;
  const ey = ry * s;
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={ex} ry={ey} fill={EYE} />
      <Ellipse cx={x} cy={y + ey * 0.3} rx={ex * 0.72} ry={ey * 0.5} fill={iris} />
      <Circle cx={x + ex * 0.32} cy={y - ey * 0.36} r={ex * 0.42} fill="#FFFFFF" />
      <Circle cx={x - ex * 0.36} cy={y + ey * 0.36} r={ex * 0.18} fill="#FFFFFF" opacity={0.9} />
      {face === 'annoyed' && (
        <G>
          <Path d={`M${x - ex - 1} ${y - ey - 1} L${x + ex + 1} ${y - ey - 1} L${x + ex + 1} ${y - ey * 0.1} Q${x} ${y + ey * 0.1} ${x - ex - 1} ${y - ey * 0.1} Z`} fill={lid} />
          <Path d={`M${x - ex - 0.6} ${y - ey * 0.1} Q${x} ${y + ey * 0.1} ${x + ex + 0.6} ${y - ey * 0.1}`} stroke={EYE} strokeWidth={1.1} strokeLinecap="round" fill="none" />
        </G>
      )}
      {face === 'sad' && <Path d={`M${x - ex - 0.4} ${y - ey * 0.55} Q${x} ${y - ey * 0.95} ${x + ex + 0.4} ${y - ey * 0.35}`} stroke={EYE} strokeWidth={1} strokeLinecap="round" fill="none" />}
    </G>
  );
}

// ---------------------------------------------------------------- Maren

export const MAREN_ASPECT = 120 / 260;

const M_HAIR: Tone = { lit: '#E9E5E3', mid: '#C5BEC7', shade: '#958DA6', line: '#665D73' };
const M_BUN_T: Tone = { lit: '#D9D4D5', mid: '#B7AFBB', shade: '#8A8199', line: '#665D73' };
const M_COAT: Tone = { lit: '#9F7DBE', mid: '#7C5B9F', shade: '#5A4280', line: '#4D3062' };
const M_LAPEL: Tone = { lit: '#7E5F9F', mid: '#654684', shade: '#4B3469', line: '#4D3062' };
const M_CUFF: Tone = { lit: '#CBB4E0', mid: '#B096CC', shade: '#8D73AE', line: '#5D4377' };
const M_GOLD: Tone = { lit: '#F6D57E', mid: '#DDAC47', shade: '#AE7B3C', line: '#7B4E23' };
const M_BOOT: Tone = { lit: '#83634D', mid: '#634938', shade: '#46342F', line: '#2F201A' };
const M_BOOK: Tone = { lit: '#62A397', mid: '#418177', shade: '#2D5E5D', line: '#1F3E3A' };
const M_RIM = '#8A5A2E';

const M_COAT_D =
  'M50 99 C43 101 37 104 34 110 C30 128 27 160 21 196 C18 214 14 228 10 236 C21 242 32 238 42 240 C52 243 60 238 70 241 C80 244 92 239 105 236 C102 214 100 190 97 166 C95 146 92 124 88 111 C85 104 78 100 70 99 Z';
const M_SLEEVE_NEAR = 'M46 105 C35 103 28 112 26 126 C24 146 21 166 17 184 C24 189 34 191 42 188 C43 170 45 150 48 132 C49 120 50 110 46 105 Z';
const M_SLEEVE_FAR = 'M80 106 C91 106 97 116 99 130 C101 148 104 166 107 183 C101 188 94 189 89 187 C88 170 86 150 84 132 C83 122 82 112 80 106 Z';
const M_HEAD = 'M37 64 C36 46 47 35 61 35 C75 35 85 45 86 60 C87 70 85 80 80 87 C76 93 70 97 63 97 C53 97 44 90 40 80 C38 75 37 70 37 64 Z';
const M_HAIR_D =
  'M36 79 C31 74 29 67 31 61 C29 55 31 49 34 45 C36 39 40 35 45 33 C50 29 56 28 62 28 C69 26 76 28 81 33 C86 36 89 42 89 48 C90 52 90 55 89 58 C87 55 84 52 81 51 C78 48 74 48 71 48 C67 46 62 47 58 49 C54 50 51 53 49 57 C48 60 47 63 45 65 C44 69 42 72 41 74 C40 77 38 78 36 79 Z';
const M_BUN = 'M28 34 C27 25 33 19 41 19 C49 19 54 25 53 33 C53 40 47 45 40 44 C33 44 28 40 28 34 Z';

function MarenFace({ face }: { face: Face }) {
  const brow = { stroke: '#8F889C', strokeWidth: 2.1, strokeLinecap: 'round' as const, fill: 'none' };
  const mouth = { stroke: MOUTH, strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const brows: Record<Face, string> = {
    idle: 'M52 59 Q57 56 63 58 M72 57 Q77 55 82 58',
    happy: 'M52 58 Q57 54 63 57 M72 56 Q77 53 82 57',
    surprised: 'M52 55 Q57 50 63 53 M72 52 Q77 48 82 52',
    sad: 'M52 58 Q58 58 63 55 M72 55 Q76 58 82 59',
    annoyed: 'M52 57 Q58 58 63 61 M72 61 Q77 58 82 57',
    curious: 'M52 59 Q57 57 63 59 M72 52 Q77 48 83 53',
  };
  return (
    <G>
      <Ellipse cx={53} cy={80} rx={5} ry={3} fill={BLUSH} opacity={face === 'sad' ? 0.25 : 0.45} />
      <Ellipse cx={81} cy={79} rx={3.6} ry={2.6} fill={BLUSH} opacity={face === 'sad' ? 0.25 : 0.45} />
      {/* laugh lines: she has smiled a lot */}
      <Path d="M65.5 79.5 Q63 83 64.5 87.5" stroke={SKIN.line} strokeWidth={0.8} strokeLinecap="round" fill="none" opacity={0.35} />
      <Eye x={59} y={69} rx={2.3} ry={2.8} iris="#566A8E" face={face} lid={SKIN.mid} />
      <Eye x={77} y={68.5} rx={2} ry={2.7} iris="#566A8E" face={face} lid={SKIN.mid} />
      {/* round glasses, catching the light */}
      <Path d="M52 67 L40 65" stroke={M_RIM} strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx={59} cy={69} r={7} fill="#FFFFFF" opacity={0.16} stroke={M_RIM} strokeWidth={1.4} />
      <Ellipse cx={77.5} cy={68.5} rx={5.6} ry={7} fill="#FFFFFF" opacity={0.16} stroke={M_RIM} strokeWidth={1.4} />
      <Path d="M66 68 Q69 66 72 68" stroke={M_RIM} strokeWidth={1.3} strokeLinecap="round" fill="none" />
      <Path d="M54.5 66 L57.5 63.5 M74 65.5 L76.5 63.3" stroke="#FFFFFF" strokeWidth={1.3} strokeLinecap="round" opacity={0.85} />
      <Path d={brows[face]} {...brow} />
      {/* nose */}
      <Path d="M72 70 C73 74 77 76 77 78.5 C77 80.5 74 81 71.5 80" stroke={SKIN.line} strokeWidth={1.1} strokeLinecap="round" fill="none" />
      {face === 'happy' ? (
        <G>
          <Path d="M64 85 Q71 93 78 84 Q71 87 64 85 Z" fill={MOUTH} stroke={MOUTH} strokeWidth={0.8} strokeLinejoin="round" />
          <Path d="M67.5 89.2 Q71 91 74.5 88.8 Q71 88 67.5 89.2 Z" fill={TONGUE} />
        </G>
      ) : face === 'surprised' ? (
        <Ellipse cx={71} cy={87} rx={2.4} ry={3} fill={MOUTH} />
      ) : face === 'sad' ? (
        <Path d="M65 88 Q71 84 77 87.5" {...mouth} />
      ) : face === 'annoyed' ? (
        <Path d="M65 86.5 Q71 86 77 85" {...mouth} />
      ) : face === 'curious' ? (
        <Path d="M66 86 Q71 88 77 84" {...mouth} />
      ) : (
        <Path d="M64.5 85 Q71 90 78 84" {...mouth} />
      )}
    </G>
  );
}

export function MarenArt({ width, mood = 'idle' }: { width: number; mood?: string }) {
  const g = useIds();
  const face = faceFor(mood);
  return (
    <Svg width={width} height={width / MAREN_ASPECT} viewBox="0 0 120 260">
      <GroundShadow g={g} id="ground" cx={58} cy={255} rx={52} ry={6} opacity={0.34} />
      {/* boots, peeking out under the hem */}
      <Form g={g} id="boot-far" d="M63 232 L79 232 L80 244 C88 245 94 248 95 252 C96 255 94 256 91 256 L62 256 Z" t={M_BOOT} step={0.25} lw={1.4} rim={0.25} />
      <Form g={g} id="boot-near" d="M38 234 L56 234 L57 246 C65 247 71 250 72 253 C73 256 71 257 68 257 L37 257 C36 250 37 242 38 234 Z" t={M_BOOT} step={0.25} lw={1.4} rim={0.25} />
      {/* the long coat */}
      <Form g={g} id="coat" d={M_COAT_D} t={M_COAT} step={0.62} lw={1.4} rim={0.35} />
      <G clipPath={`url(#${g('coat')})`}>
        {/* folds falling from the sash to the hem */}
        <Path d={crease(38, 158, 33, 198, 31, 238, 3.4)} fill={M_COAT.shade} opacity={0.85} />
        <Path d={crease(58, 160, 57, 200, 60, 240, 3.4)} fill={M_COAT.shade} opacity={0.85} />
        <Path d={crease(84, 158, 89, 200, 92, 240, -3.4)} fill={M_COAT.shade} opacity={0.85} />
        <Path d={crease(46, 162, 44, 200, 45, 238, 2.6)} fill={M_COAT.lit} opacity={0.55} />
        <Path d={crease(28, 164, 24, 200, 20, 236, 2.2)} fill={M_COAT.lit} opacity={0.5} />
        <Path d={crease(42, 112, 40, 130, 38, 146, 2)} fill={M_COAT.shade} opacity={0.6} />
        {/* where the front closes */}
        <Path d={crease(69, 138, 72, 190, 80, 242, -4)} fill={M_COAT.shade} />
        <Path d="M69 138 Q72 190 80 242" stroke={M_COAT.line} strokeWidth={1.1} fill="none" />
        {/* a pocket */}
        <Path d="M30 190 Q40 194 50 191" stroke={M_COAT.line} strokeWidth={1.1} strokeLinecap="round" fill="none" />
        <Path d="M30 191.5 Q40 195.5 50 192.5" stroke={M_COAT.lit} strokeWidth={0.9} strokeLinecap="round" fill="none" opacity={0.6} />
        {/* the sash */}
        <Path d="M20 146 C44 152 72 151 100 143 L101 152 C72 160 44 161 20 155 Z" fill={M_LAPEL.mid} />
        <Path d="M20 146 C44 152 72 151 100 143" stroke={M_LAPEL.lit} strokeWidth={1.2} fill="none" />
        <Path d="M20 155 C44 161 72 160 101 152" stroke={M_COAT.line} strokeWidth={1.1} fill="none" />
      </G>
      {[166, 190, 214].map((y, i) => (
        <G key={y}>
          <Circle cx={71.5 + i * 2.3} cy={y} r={2.5} fill={M_GOLD.mid} stroke={M_GOLD.line} strokeWidth={0.9} />
          <Circle cx={70.8 + i * 2.3} cy={y - 0.8} r={0.9} fill="#FFF6D6" />
        </G>
      ))}
      {/* the sash's knot and its tails */}
      <Form g={g} id="tail1" d="M72 153 C70 163 70 172 72 181 L77.5 180 C76.5 171 76.5 162 77 153 Z" t={M_LAPEL} step={0.2} lw={1.1} rim={0.2} />
      <Form g={g} id="tail2" d="M76 153 C80 161 82 169 84 177 L89 175 C87 167 83 159 79 152 Z" t={M_LAPEL} step={0.2} lw={1.1} rim={0.2} />
      <Form g={g} id="knot" d="M70 152 C70 148 74 146 77 147 C80 148 81 152 79 155 C77 157 72 157 70 152 Z" t={M_LAPEL} step={0.2} lw={1.1} rim={0.3} />
      {/* blouse in the neckline, then the lapels */}
      <Path d="M57 100 L73 100 L68.5 137 Z" fill="#EFE5D9" stroke="#B9A8A0" strokeWidth={0.8} />
      <Form g={g} id="lapel-near" d="M52 100 C46 108 45 119 49 127 C54 132 61 135 68.5 138 C62 126 59 112 60 101 Z" t={M_LAPEL} step={0.3} lw={1.3} rim={0.35} />
      <Form g={g} id="lapel-far" d="M72 100 C80 104 86 111 87 119 C81 126 75 132 68.5 138 C70 124 71.5 112 72 100 Z" t={M_LAPEL} step={0.3} lw={1.3} rim={0.3} />
      {/* the Lodge's pin */}
      <Circle cx={53.5} cy={118} r={3.3} fill={M_GOLD.mid} stroke={M_GOLD.line} strokeWidth={0.9} />
      <Circle cx={53.5} cy={118} r={1.4} fill="#4FA39A" />
      <Circle cx={52.6} cy={117} r={0.7} fill="#FFF6D6" />
      {/* far arm */}
      <Form g={g} id="sleeve-far" d={M_SLEEVE_FAR} t={M_COAT} step={0.32} lw={1.35} rim={0.25} />
      <Path d={crease(90, 150, 95, 156, 101, 152, 0, 2.4)} fill={M_COAT.shade} />
      <Form g={g} id="cuff-far" d="M88 183 C95 186 101 186 107 182 L108 190 C102 194 94 194 88 191 Z" t={M_CUFF} step={0.2} lw={1.2} rim={0.3} />
      <Form g={g} id="hand-far" d="M92 191 C97 190 104 191 105 195 C106 200 103 204 99 204 C95 204 92 201 91 197 C91 194 91 192 92 191 Z" t={SKIN} step={0.18} lw={1.2} rim={0.3} />
      {/* near arm, holding her notebook */}
      <Form g={g} id="sleeve-near" d={M_SLEEVE_NEAR} t={M_COAT} step={0.34} lw={1.35} rim={0.4} />
      <Path d={crease(29, 146, 36, 152, 45, 147, 0, 2.6)} fill={M_COAT.shade} />
      <Path d={crease(27, 162, 33, 166, 43, 163, 0, 2)} fill={M_COAT.shade} opacity={0.7} />
      <Form g={g} id="book" d="M5 193 L24 189.5 L28 218 L9 221.5 Z" t={M_BOOK} step={0.25} lw={1.3} rim={0.4} />
      <Path d="M24 189.5 L26.5 190 L30 217.6 L28 218 Z" fill="#F4EAD6" stroke={M_BOOK.line} strokeWidth={0.8} strokeLinejoin="round" />
      <Path d="M7.5 193 L11.5 221" stroke={M_BOOK.line} strokeWidth={0.9} opacity={0.7} />
      <Form g={g} id="cuff-near" d="M16 181 C24 186 34 188 43 185 L43 193 C34 196 24 195 15 189 Z" t={M_CUFF} step={0.2} lw={1.2} rim={0.4} />
      <Form g={g} id="hand-near" d="M22 192 C29 191 36 193 37 199 C37 205 33 210 27 210 C22 210 18 206 18 201 C18 197 19 193 22 192 Z" t={SKIN} step={0.2} lw={1.2} rim={0.35} />
      <Path d="M19.5 201 L28 203 M20 205.5 L27.5 207" stroke={SKIN.line} strokeWidth={0.8} strokeLinecap="round" opacity={0.8} />
      {/* neck, scarf, then the head, tipped a little: she is listening */}
      <G transform="rotate(-3 62 104)">
        <Path d="M55 84 L55 103 L70 103 L70 84 Z" fill={SKIN.shade} stroke={SKIN.line} strokeWidth={1.1} />
        <Form g={g} id="scarf" d="M50 95 C56 101 68 101 76 95 L78 102 C70 110 56 110 48 103 Z" t={M_GOLD} step={0.25} lw={1.2} rim={0.4} />
        <Form g={g} id="scarf-tail1" d="M66 107 C64 115 63 123 64 131 L70 130 C70 123 70 115 71 107 Z" t={M_GOLD} step={0.2} lw={1.1} rim={0.3} />
        <Form g={g} id="scarf-tail2" d="M71 107 C74 115 78 121 80 127 L85 124 C82 117 77 111 74 105 Z" t={M_GOLD} step={0.2} lw={1.1} rim={0.3} />
        <Form g={g} id="scarf-knot" d="M66 105 C66 101 70 99 73 100 C76 101 77 105 75 108 C73 110 68 110 66 105 Z" t={M_GOLD} step={0.2} lw={1.1} rim={0.4} />
        <Form g={g} id="head" d={M_HEAD} t={SKIN} step={0.42} lw={1.35} rim={0.45} />
        {/* soft under the chin */}
        <Path d="M50 92 Q62 99 74 93" stroke={SKIN.shade} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.8} />
        <Form g={g} id="hair" d={M_HAIR_D} t={M_HAIR} step={0.4} lw={1.35} rim={0.3} />
        <G clipPath={`url(#${g('hair')})`}>
          {/* strands swept back to the bun */}
          <Path d={crease(86, 50, 66, 40, 44, 46, 0, 1.8)} fill={M_HAIR.shade} opacity={0.85} />
          <Path d={crease(80, 40, 62, 34, 42, 40, 0, 1.5)} fill={M_HAIR.shade} opacity={0.75} />
          <Path d={crease(70, 31, 56, 31, 40, 37, 0, 1.2)} fill={M_HAIR.shade} opacity={0.6} />
          <Path d={crease(88, 56, 70, 47, 46, 58, 0, 1.4)} fill={M_HAIR.shade} opacity={0.6} />
          <Path d={crease(36, 52, 34, 62, 37, 72, 1.4)} fill={M_HAIR.shade} opacity={0.6} />
          <Path d={crease(76, 36, 60, 31, 44, 35, 0, 1.3)} fill="#FFFFFF" opacity={0.6} />
          <Path d={crease(84, 46, 68, 40, 50, 44, 0, 1)} fill="#FFFFFF" opacity={0.4} />
        </G>
        {/* the bun, with a pencil pushed through it */}
        <Path d="M22 45 L57 19" stroke="#7B4E23" strokeWidth={4.6} strokeLinecap="round" />
        <Path d="M24 43.6 L55.6 20.2" stroke="#E8B94A" strokeWidth={2.8} />
        <Path d="M24 42.7 L55 19.6" stroke="#FBE08A" strokeWidth={0.9} />
        <Path d="M55.4 20.2 L58.2 18.1" stroke="#E58A8C" strokeWidth={3} strokeLinecap="round" />
        <Path d="M24.4 43.4 L21 46" stroke="#E9C9A0" strokeWidth={2.6} strokeLinecap="round" />
        <Circle cx={20.6} cy={46.3} r={0.9} fill="#3A3240" />
        <Form g={g} id="bun" d={M_BUN} t={M_BUN_T} step={0.28} lw={1.3} rim={0.4} />
        <Path d={crease(31, 30, 38, 22, 50, 26, 0, 2)} fill={M_BUN_T.shade} />
        <Path d={crease(30, 38, 40, 30, 52, 35, 0, 2)} fill={M_BUN_T.shade} opacity={0.8} />
        <Path d={crease(33, 27, 40, 22, 46, 23, 0, 1.2)} fill="#FFFFFF" opacity={0.5} />
        <Path d="M45 25 L52 20.4" stroke="#7B4E23" strokeWidth={4.6} strokeLinecap="round" />
        <Path d="M45.6 24.4 L52.4 19.8" stroke="#E8B94A" strokeWidth={2.8} />
        {/* an ear, and a few wisps that escaped the bun */}
        <Path d="M42 66 C37 64 35 69 37 74 C38 78 42 79 44 77" fill={SKIN.mid} stroke={SKIN.line} strokeWidth={1.2} strokeLinecap="round" />
        <Path d="M40.5 69.5 C39.5 71 40 73.5 42 74.5" stroke={SKIN.line} strokeWidth={0.8} strokeLinecap="round" fill="none" />
        <Circle cx={40.5} cy={79.5} r={1.4} fill="#F4EEE4" stroke="#B5A898" strokeWidth={0.5} />
        <Path d="M37 77 Q33 82 35 88 M86 54 Q90 58 89 63" stroke={M_HAIR.line} strokeWidth={0.8} strokeLinecap="round" fill="none" opacity={0.8} />
        <MarenFace face={face} />
      </G>
    </Svg>
  );
}

// ---------------------------------------------------------------- Pip

export const PIP_ASPECT = 110 / 230;

const P_HAIR: Tone = { lit: '#C2814A', mid: '#965B33', shade: '#683F2E', line: '#46261A' };
const P_COAT: Tone = { lit: '#8BBF6E', mid: '#58925B', shade: '#3B6B57', line: '#29472C' };
const P_SCARF: Tone = { lit: '#FAB066', mid: '#E6802F', shade: '#B4552C', line: '#7A3318' };
const P_PANTS: Tone = { lit: '#68768F', mid: '#4A5872', shade: '#36405D', line: '#262A3E' };
const P_LEATHER: Tone = { lit: '#CD975E', mid: '#A27042', shade: '#724D36', line: '#4C2E1B' };
const P_BOOT: Tone = { lit: '#966847', mid: '#734D34', shade: '#52382E', line: '#34221A' };
const P_GOLD = '#F2C14E';

const P_COAT_D =
  'M46 96 C40 97 34 100 31 106 C28 124 27 150 24 172 C23 178 22 182 20 188 C32 192 45 187 56 189 C68 191 80 187 92 184 C90 168 87 150 85 132 C84 118 82 106 77 100 C73 97 67 96 62 96 Z';
const P_SLEEVE_NEAR = 'M40 101 C30 101 22 108 16 116 C11 122 7 128 6 134 C6 140 14 146 23 152 L28 156 L34 147 C28 143 22 139 19.5 135 C22 128 26 122 32 117 Z';
const P_SLEEVE_FAR = 'M74 100 C81 100 88 102 92 104 L93 87 L104 86 C105 95 106 104 106 112 C106 118 102 121 97 121 C91 121 86 120 81 119 Z';
const P_HEAD = 'M32 60 C31 43 42 32 56 32 C70 32 80 42 81 57 C82 68 80 77 75 84 C71 89 65 92 58 92 C48 92 40 86 36 77 C33 72 32 66 32 60 Z';
const P_HAIR_D =
  'M31 72 C25 62 25 49 30 41 L21 32 L35 33 C35 26 39 19 46 15 L48 25 C52 19 58 15 67 12 L63 23 C71 21 79 24 86 30 L77 32 C83 37 86 45 85 55 C81 48 75 43 69 42 C71 46 71 51 68 56 C64 48 57 43 50 45 C46 49 44 55 44 61 C40 63 37 67 35 73 Z';

function PipFace({ face }: { face: Face }) {
  const brow = { stroke: P_HAIR.line, strokeWidth: 2.1, strokeLinecap: 'round' as const, fill: 'none' };
  const mouth = { stroke: MOUTH, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  // the far brow sits higher than the near one: he is always a little pleased with himself
  const brows: Record<Face, string> = {
    idle: 'M49 54 Q55 51.5 60 53.5 M66 50 Q72 46 78 50',
    happy: 'M49 53 Q55 50 60 52 M66 49 Q72 45.5 78 49',
    surprised: 'M49 50 Q55 46 60 48.5 M66 47 Q72 43 78 47',
    sad: 'M49 53 Q55 54 60 50.5 M66 50.5 Q72 53 78 54',
    annoyed: 'M49 52 Q55 53 61 56 M66 56 Q72 52 78 52',
    curious: 'M49 55 Q55 53 60 55 M66 47.5 Q72 43 78 48',
  };
  return (
    <G>
      <Ellipse cx={49} cy={74} rx={5} ry={3} fill={BLUSH} opacity={0.3} />
      <Ellipse cx={77} cy={73} rx={3.6} ry={2.6} fill={BLUSH} opacity={0.3} />
      <G fill="#C07A5C" opacity={0.6}>
        <Circle cx={47} cy={72.5} r={0.65} />
        <Circle cx={50.5} cy={74.5} r={0.6} />
        <Circle cx={46} cy={75.8} r={0.55} />
        <Circle cx={75.5} cy={71} r={0.55} />
        <Circle cx={78.5} cy={73.4} r={0.55} />
        <Circle cx={69.5} cy={69} r={0.5} />
      </G>
      <Eye x={55} y={63} rx={2.8} ry={3.5} iris="#6B8A4E" face={face} lid={SKIN.mid} />
      <Eye x={71.5} y={62.5} rx={2.4} ry={3.4} iris="#6B8A4E" face={face} lid={SKIN.mid} />
      <Path d={brows[face]} {...brow} />
      {/* a small turned-up nose */}
      <Path d="M71 66 C72 69 76 70 76 72.5 C76 74.5 73 75 71 74" stroke={SKIN.line} strokeWidth={1.1} strokeLinecap="round" fill="none" />
      {face === 'happy' ? (
        <G>
          <Path d="M58 77 Q67.5 89.5 78.5 75.5 Q68.5 80 58 77 Z" fill={MOUTH} stroke={MOUTH} strokeWidth={0.8} strokeLinejoin="round" />
          <Path d="M59.5 77.8 Q68.5 80.4 77.2 76.6 L76.3 78.5 Q68.5 81.6 60.6 79.4 Z" fill={TEETH} />
          <Path d="M64 84.2 Q69 86.4 74 83.4 Q69 82.6 64 84.2 Z" fill={TONGUE} />
        </G>
      ) : face === 'surprised' ? (
        <Ellipse cx={68} cy={81} rx={2.8} ry={3.6} fill={MOUTH} />
      ) : face === 'sad' ? (
        <Path d="M61 83 Q68 78 76 82" {...mouth} />
      ) : face === 'annoyed' ? (
        <Path d="M61 81 Q68 81.5 76 79" {...mouth} />
      ) : face === 'curious' ? (
        <G>
          <Path d="M62 80 Q68 82 75 78" {...mouth} />
        </G>
      ) : (
        <G>
          {/* the grin: wider on one side */}
          <Path d="M60 78 Q68.5 86.5 78 75.5 Q69 81 60 78 Z" fill={MOUTH} stroke={MOUTH} strokeWidth={0.8} strokeLinejoin="round" />
          <Path d="M61.5 78.8 Q69.5 81.2 77 76.6 L76.3 78.3 Q69.5 82 62.6 80.2 Z" fill={TEETH} />
          <Path d="M78 75.5 Q79.2 74.2 79.6 72.6" stroke={MOUTH} strokeWidth={1.2} strokeLinecap="round" fill="none" />
        </G>
      )}
    </G>
  );
}

export function PipArt({ width, mood = 'idle' }: { width: number; mood?: string }) {
  const g = useIds();
  const face = faceFor(mood);
  return (
    <Svg width={width} height={width / PIP_ASPECT} viewBox="0 0 110 230">
      <GroundShadow g={g} id="ground" cx={57} cy={225} rx={44} ry={5.5} opacity={0.34} />
      {/* the scarf's long end, streaming out behind him */}
      <Form g={g} id="scarf-back" d="M46 97 C36 90 25 89 12 94 C16 98 14 103 8 108 C20 110 33 107 46 105 Z" t={P_SCARF} step={0.28} lw={1.3} rim={0.35} />
      <Path d="M12 94 L9 92 M10 101 L6 101 M8 108 L5 110" stroke={P_SCARF.line} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M44 101 C34 98 24 98 14 101" stroke={P_SCARF.shade} strokeWidth={1.3} strokeLinecap="round" fill="none" />
      {/* legs and boots, planted wide */}
      <Form g={g} id="leg-far" d="M57 172 L74 172 L76 206 L62 207 Z" t={P_PANTS} step={0.25} lw={1.4} rim={0.2} />
      <Form g={g} id="leg-near" d="M34 172 L52 172 L51 209 L36 209 Z" t={P_PANTS} step={0.25} lw={1.4} rim={0.3} />
      <Path d={crease(40, 190, 44, 192, 49, 189, 0, 1.8)} fill={P_PANTS.shade} />
      <Form g={g} id="boot-far" d="M61 201 L77 201 C77 206 78 210 81 211 C87 212 91 215 91 219 C91 222 89 224 86 224 L60 224 C59 216 60 208 61 201 Z" t={P_BOOT} step={0.25} lw={1.4} rim={0.25} />
      <Form g={g} id="boot-near" d="M35 203 L52 203 C52 208 53 212 56 213 C62 214 67 217 67 221 C67 224 65 226 62 226 L34 226 C33 218 34 210 35 203 Z" t={P_BOOT} step={0.25} lw={1.4} rim={0.3} />
      <Path d="M35 207 L52 207 M61 205 L77 205" stroke={P_BOOT.line} strokeWidth={1} opacity={0.8} />
      {/* the green coat */}
      <Form g={g} id="coat" d={P_COAT_D} t={P_COAT} step={0.56} lw={1.4} rim={0.35} />
      <G clipPath={`url(#${g('coat')})`}>
        <Path d={crease(36, 150, 32, 170, 31, 190, 2.8)} fill={P_COAT.shade} opacity={0.8} />
        <Path d={crease(82, 146, 86, 168, 88, 188, -2.8)} fill={P_COAT.shade} opacity={0.8} />
        <Path d={crease(44, 152, 42, 172, 42, 190, 2.2)} fill={P_COAT.lit} opacity={0.5} />
        {/* the front edge, and its toggles */}
        <Path d={crease(63, 102, 64, 146, 70, 190, -3.6)} fill={P_COAT.shade} />
        <Path d="M63 102 Q64 146 70 190" stroke={P_COAT.line} strokeWidth={1.1} fill="none" />
        {/* a belt across the middle */}
        <Path d="M20 150 C42 156 66 155 92 148 L93 156 C66 163 42 164 20 158 Z" fill={P_LEATHER.shade} />
        <Path d="M20 150 C42 156 66 155 92 148" stroke={P_LEATHER.lit} strokeWidth={1.1} fill="none" />
        <Path d="M20 158 C42 164 66 163 93 156" stroke={P_LEATHER.line} strokeWidth={1} fill="none" />
      </G>
      <Path d="M61 151 L69 150.4 L69.6 158 L61.6 158.8 Z" fill="none" stroke={P_GOLD} strokeWidth={1.6} strokeLinejoin="round" />
      {[124, 138, 172].map((y) => (
        <G key={y}>
          <Path d={`M${62} ${y} L${69} ${y - 0.5}`} stroke={P_LEATHER.line} strokeWidth={3.2} strokeLinecap="round" />
          <Path d={`M${62} ${y - 0.4} L${69} ${y - 0.9}`} stroke={P_LEATHER.lit} strokeWidth={1.4} strokeLinecap="round" />
        </G>
      ))}
      {/* "Translator Second Class": the badge he made himself, pinned on a little crooked */}
      <G transform="rotate(14 46 122)">
        <Path d="M43 125 L41 134 L45 131.5 L47 135 L49 125 Z" fill="#C8433A" stroke="#7A2A22" strokeWidth={0.8} strokeLinejoin="round" />
        <Path d="M46 115 L48 119.8 L53 120 L49.2 123 L50.5 128 L46 125.2 L41.5 128 L42.8 123 L39 120 L44 119.8 Z" fill={P_GOLD} stroke="#8A5A1C" strokeWidth={0.9} strokeLinejoin="round" />
        <Path d="M46 117.5 L47 120.5 L44.6 121" stroke="#FFF4C8" strokeWidth={0.9} strokeLinecap="round" fill="none" />
      </G>
      {/* the satchel: strap over the near shoulder, bag on the far hip */}
      <Path d="M36 102 L43 99 L90 153 L84 158 Z" fill={P_LEATHER.mid} stroke={P_LEATHER.line} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d="M39 101.5 L87 155" stroke={P_LEATHER.lit} strokeWidth={1} opacity={0.7} />
      <Path d="M79 136 L84 133.5 L88.5 148 L83 150 Z" fill="#F4EAD6" stroke="#A8957C" strokeWidth={0.8} strokeLinejoin="round" />
      <Path d="M80.5 137.5 L84.5 135.5" stroke="#A8957C" strokeWidth={0.7} />
      <Form g={g} id="bag" d="M74 151 C74 148 76 146 79 146 L100 146 C103 146 105 148 105 151 L105 173 C105 177 102 179 98 179 L81 179 C77 179 74 177 74 173 Z" t={P_LEATHER} step={0.3} lw={1.4} rim={0.35} />
      <Form g={g} id="flap" d="M72.5 145 L106 145 L106 160 C99 165 80 165 72.5 160 Z" t={P_LEATHER} step={0.25} lw={1.3} rim={0.45} />
      <Path d="M87 160.5 L91.5 160.5 L91.5 167 L87 167 Z" fill="none" stroke={P_GOLD} strokeWidth={1.3} />
      <Path d="M89.2 154 L89.2 164" stroke={P_LEATHER.line} strokeWidth={2.4} strokeLinecap="round" />
      {/* near arm, hand on hip */}
      <Form g={g} id="sleeve-near" d={P_SLEEVE_NEAR} t={P_COAT} step={0.3} lw={1.35} rim={0.4} />
      <Path d={crease(12, 128, 16, 134, 13, 140, 2.2, 0)} fill={P_COAT.shade} />
      <Path d="M22 150 L31 144 L35.5 149 L27 157 Z" fill={P_COAT.shade} stroke={P_COAT.line} strokeWidth={1.1} strokeLinejoin="round" />
      <Form g={g} id="fist" d="M28 150 C28 145 33 143 37 145 C40 147 40 153 37 156 C34 158 29 156 28 150 Z" t={SKIN} step={0.15} lw={1.2} rim={0.35} />
      {/* far arm up: "Watch." */}
      <Form g={g} id="sleeve-far" d={P_SLEEVE_FAR} t={P_COAT} step={0.3} lw={1.35} rim={0.35} />
      <Path d={crease(84, 112, 92, 110, 99, 114, 0, 2.4)} fill={P_COAT.shade} />
      <Path d="M91.5 86.5 L104.5 85.5 L104.8 91.5 L92 92.4 Z" fill={P_COAT.shade} stroke={P_COAT.line} strokeWidth={1.1} strokeLinejoin="round" />
      <Form g={g} id="hand-far" d="M93 85 C92 80 93 75 96 74 L96 64 C96 61.5 99.5 61.5 99.5 64 L99.5 74 C102 74 104 77 104 81 C104 85 101 87 98 87 C95 87 93 87 93 85 Z" t={SKIN} step={0.15} lw={1.2} rim={0.35} />
      <Path d="M96 80 L101.5 79.5 M95.5 83 L101.5 82.5" stroke={SKIN.line} strokeWidth={0.8} strokeLinecap="round" opacity={0.8} />
      {/* collar turned up, neck, scarf */}
      <Form g={g} id="collar-near" d="M42 104 C36 98 32 91 31 84 C38 88 47 93 55 100 Z" t={P_COAT} step={0.2} lw={1.3} rim={0.4} />
      <Form g={g} id="collar-far" d="M73 104 C79 98 83 91 84 83 C77 88 68 93 62 100 Z" t={P_COAT} step={0.2} lw={1.3} rim={0.3} />
      <Path d="M49 82 L49 100 L63 100 L63 82 Z" fill={SKIN.shade} stroke={SKIN.line} strokeWidth={1.1} />
      <Form g={g} id="scarf" d="M42 93 C48 101 64 101 72 92 L75 100 C67 110 48 110 40 101 Z" t={P_SCARF} step={0.28} lw={1.3} rim={0.4} />
      <Path d="M44 99 C52 104 62 104 70 98" stroke={P_SCARF.shade} strokeWidth={1.1} strokeLinecap="round" fill="none" />
      <Form g={g} id="scarf-front" d="M60 104 C63 114 64 124 62 134 L70 133 C72 123 71 112 67 102 Z" t={P_SCARF} step={0.2} lw={1.2} rim={0.35} />
      <Path d="M62.6 134 L62 137.5 M65.2 133.8 L65 137.4 M67.8 133.4 L68.2 137" stroke={P_SCARF.line} strokeWidth={1} strokeLinecap="round" />
      {/* head */}
      <Form g={g} id="head" d={P_HEAD} t={SKIN} step={0.42} lw={1.35} rim={0.45} />
      <Path d="M44 86 Q56 93 70 88" stroke={SKIN.shade} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.7} />
      <Path d="M38 61 C33 59 31 64 33 69 C34 73 38 74 40 72" fill={SKIN.mid} stroke={SKIN.line} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M36.5 64.5 C35.5 66 36 68.5 38 69.5" stroke={SKIN.line} strokeWidth={0.8} strokeLinecap="round" fill="none" />
      <Form g={g} id="hair" d={P_HAIR_D} t={P_HAIR} step={0.4} lw={1.35} rim={0.5} />
      <G clipPath={`url(#${g('hair')})`}>
        <Path d={crease(80, 36, 62, 28, 42, 34, 0, 1.6)} fill={P_HAIR.shade} opacity={0.7} />
        <Path d={crease(70, 22, 58, 26, 52, 38, 1.4, 0)} fill={P_HAIR.shade} opacity={0.7} />
        <Path d={crease(64, 24, 52, 26, 40, 30, 0, 1.4)} fill="#FFFFFF" opacity={0.4} />
      </G>
      <PipFace face={face} />
    </Svg>
  );
}
