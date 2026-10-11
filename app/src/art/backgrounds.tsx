import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

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

export function Background({ id, width, height }: { id: string; width: number; height: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const draw = BACKGROUNDS[id] ?? BACKGROUNDS.forest_path!;
  return (
    <Svg width={width} height={height} viewBox="0 0 400 460" preserveAspectRatio="xMidYMax slice">
      {draw((n) => `${n}${uid}`)}
    </Svg>
  );
}
