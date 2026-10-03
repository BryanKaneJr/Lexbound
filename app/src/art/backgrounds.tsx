import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

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

  forest_stream: (g) => (
    <G>
      {sky(g, '#CDEAF2', '#E8F5E8')}
      {trunk(50, 22, '#B8C9AE')}
      {trunk(350, 22, '#B8C9AE')}
      {canopy(60, 40, 80, '#A7CF98')}
      {canopy(340, 30, 80, '#A7CF98')}
      {trunk(24, 36, '#7A5634')}
      {trunk(380, 34, '#6E4A2E')}
      {canopy(20, 80, 70, '#4E9F6B')}
      {canopy(390, 70, 70, '#3F8A5A')}
      <Path d="M0 290 Q200 270 400 290 L400 460 L0 460 Z" fill="#6BA65F" />
      <Defs>
        <LinearGradient id={g('water')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7CC6F2" />
          <Stop offset="1" stopColor="#3B8FD9" />
        </LinearGradient>
      </Defs>
      <Path d="M0 318 Q100 300 200 316 T400 312 L400 380 Q300 396 200 382 T0 388 Z" fill={`url(#${g('water')})`} />
      <Path d="M30 336 Q60 328 90 336 M180 350 Q210 342 240 350 M300 334 Q330 326 360 334" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
      <Ellipse cx={120} cy={384} rx={20} ry={9} fill="#9A938A" />
      <Ellipse cx={290} cy={314} rx={16} ry={7} fill="#9A938A" />
      <Rect x={0} y={386} width={400} height={74} fill="#5E9C55" />
      {[40, 340].map((x) => (
        <G key={x}>{fern(x, 430, 0.9, '#3F8A4E')}</G>
      ))}
    </G>
  ),

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
};

export const BACKGROUND_IDS = Object.keys(BACKGROUNDS);

export function Background({ id, width, height }: { id: string; width: number; height: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const draw = BACKGROUNDS[id] ?? BACKGROUNDS.forest_path!;
  return (
    <Svg width={width} height={height} viewBox="0 0 400 460" preserveAspectRatio="xMidYMax slice">
      {draw((n) => `${n}${uid}`)}
    </Svg>
  );
}
