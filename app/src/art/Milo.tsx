import { useEffect, useId, useState } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';

/**
 * Milo, drawn in code. He has the biggest expression budget in the game
 * (bible §53): every mood has its own eyes, brows and mouth, and his arms
 * take poses for pointing, waving, beckoning and the rest.
 *
 * The four element colours hide in his ear tips, tail tip and forehead gem.
 * Nobody in Lexora has noticed what that means yet.
 *
 * Drawn facing right in a 200 x 220 box, feet on the bottom edge.
 */
export type MiloMood =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'curious'
  | 'confused'
  | 'annoyed'
  | 'scared'
  | 'tired'
  | 'hurt'
  | 'sad'
  | 'surprised'
  | 'fierce'
  | 'proud'
  | 'disgusted';

export type MiloPose = 'rest' | 'wave' | 'point' | 'beckon' | 'clap' | 'up' | 'cast' | 'rub' | 'hold' | 'cover';

export const MILO_ASPECT = 200 / 220;

const FUR = '#FFF3DF';
const FUR_SHADE = '#F2DDBD';
const BELLY = '#FFFBF3';
const LINE = '#D8B88C';
const EYE = '#2A2236';
const BLUSH = '#F59BAE';
const MOUTH = '#7A2E3B';
const TONGUE = '#F28C9C';

/** Blinks every few seconds on its own unless told not to. */
export function useBlink(enabled: boolean): boolean {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      timer = setTimeout(
        () => {
          if (!alive) return;
          setClosed(true);
          timer = setTimeout(() => {
            if (!alive) return;
            setClosed(false);
            loop();
          }, 130);
        },
        1800 + Math.random() * 3200,
      );
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [enabled]);
  return closed;
}

function Eyes({ mood, blink }: { mood: MiloMood; blink: boolean }) {
  const L = 76;
  const R = 124;
  const Y = 94;
  const closedArc = (x: number) => <Path d={`M${x - 11} ${Y} Q${x} ${Y + 8} ${x + 11} ${Y}`} stroke={EYE} strokeWidth={4.5} strokeLinecap="round" fill="none" />;
  const happyArc = (x: number) => <Path d={`M${x - 11} ${Y + 3} Q${x} ${Y - 10} ${x + 11} ${Y + 3}`} stroke={EYE} strokeWidth={5} strokeLinecap="round" fill="none" />;
  const open = (x: number, rx = 11, ry = 14) => (
    <G>
      <Ellipse cx={x} cy={Y} rx={rx} ry={ry} fill={EYE} />
      <Circle cx={x + rx * 0.35} cy={Y - ry * 0.4} r={rx * 0.38} fill="#fff" />
      <Circle cx={x - rx * 0.35} cy={Y + ry * 0.35} r={rx * 0.17} fill="#fff" />
    </G>
  );
  const ring = (x: number) => (
    <G>
      <Circle cx={x} cy={Y} r={12} fill="#fff" stroke={EYE} strokeWidth={2.5} />
      <Circle cx={x} cy={Y + 1} r={5.5} fill={EYE} />
      <Circle cx={x + 2} cy={Y - 1.5} r={1.8} fill="#fff" />
    </G>
  );
  const squeeze = (x: number, dir: 1 | -1) => (
    <Path d={`M${x - 9 * dir} ${Y - 8} L${x + 8 * dir} ${Y} L${x - 9 * dir} ${Y + 8}`} stroke={EYE} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  );
  const lidded = (x: number, cover: number) => (
    <G>
      {open(x)}
      <Path d={`M${x - 13} ${Y - 15} L${x + 13} ${Y - 15} L${x + 13} ${Y - 15 + cover} Q${x} ${Y - 13 + cover} ${x - 13} ${Y - 15 + cover} Z`} fill={FUR} />
      <Path d={`M${x - 12} ${Y - 15 + cover} Q${x} ${Y - 13 + cover} ${x + 12} ${Y - 15 + cover}`} stroke={EYE} strokeWidth={3} strokeLinecap="round" fill="none" />
    </G>
  );
  const line = (x: number) => <Path d={`M${x - 10} ${Y} L${x + 10} ${Y}`} stroke={EYE} strokeWidth={4.5} strokeLinecap="round" />;

  const blinkable = ['idle', 'curious', 'excited', 'sad', 'fierce', 'annoyed', 'confused'].includes(mood);
  if (blink && blinkable) {
    return (
      <G>
        {closedArc(L)}
        {closedArc(R)}
      </G>
    );
  }
  switch (mood) {
    case 'happy':
    case 'proud':
      return (
        <G>
          {happyArc(L)}
          {happyArc(R)}
        </G>
      );
    case 'excited':
      return (
        <G>
          {open(L, 12.5, 15.5)}
          {open(R, 12.5, 15.5)}
        </G>
      );
    case 'surprised':
    case 'scared':
      return (
        <G>
          {ring(L)}
          {ring(R)}
        </G>
      );
    case 'tired':
      return (
        <G>
          {lidded(L, 15)}
          {lidded(R, 15)}
        </G>
      );
    case 'annoyed':
      return (
        <G>
          {lidded(L, 10)}
          {lidded(R, 10)}
        </G>
      );
    case 'hurt':
      return (
        <G>
          {squeeze(L, 1)}
          {squeeze(R, -1)}
        </G>
      );
    case 'disgusted':
      return (
        <G>
          {line(L)}
          {squeeze(R, -1)}
        </G>
      );
    case 'confused':
      return (
        <G>
          {open(L, 9, 11)}
          {open(R, 12, 15)}
        </G>
      );
    case 'sad':
      return (
        <G>
          {open(L, 10, 12.5)}
          {open(R, 10, 12.5)}
        </G>
      );
    default:
      return (
        <G>
          {open(L)}
          {open(R)}
        </G>
      );
  }
}

function Brows({ mood }: { mood: MiloMood }) {
  const b = (d: string) => <Path d={d} stroke={LINE} strokeWidth={4} strokeLinecap="round" fill="none" />;
  switch (mood) {
    case 'sad':
    case 'scared':
    case 'tired':
      return (
        <G>
          {b('M64 74 Q72 70 84 66')}
          {b('M136 74 Q128 70 116 66')}
        </G>
      );
    case 'annoyed':
    case 'fierce':
      return (
        <G>
          {b('M64 66 Q74 68 86 74')}
          {b('M136 66 Q126 68 114 74')}
        </G>
      );
    case 'confused':
      return (
        <G>
          {b('M66 72 L84 72')}
          {b('M114 66 Q124 60 136 66')}
        </G>
      );
    case 'surprised':
    case 'excited':
      return (
        <G>
          {b('M64 68 Q74 60 86 66')}
          {b('M114 66 Q126 60 136 68')}
        </G>
      );
    default:
      return null;
  }
}

function Mouth({ mood }: { mood: MiloMood }) {
  const s = { stroke: MOUTH, strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (mood) {
    case 'happy':
    case 'excited':
    case 'proud':
      return (
        <G>
          <Path d="M87 113 Q100 134 113 113 Z" fill={MOUTH} />
          <Ellipse cx={100} cy={124} rx={7} ry={4.5} fill={TONGUE} />
        </G>
      );
    case 'surprised':
    case 'scared':
      return <Ellipse cx={100} cy={121} rx={6} ry={8} fill={MOUTH} />;
    case 'sad':
    case 'tired':
      return <Path d="M90 123 Q100 114 110 123" {...s} />;
    case 'annoyed':
      return <Path d="M91 119 L109 117" {...s} />;
    case 'confused':
      return <Path d="M89 119 Q94 114 100 119 Q106 124 111 119" {...s} />;
    case 'hurt':
      return <Path d="M88 118 Q94 113 100 118 Q106 123 112 118" {...s} />;
    case 'fierce':
      return (
        <G>
          <Path d="M86 115 Q100 126 114 115" {...s} />
          <Polygon points="104,119 109,118 107,125" fill="#fff" />
        </G>
      );
    case 'disgusted':
      return (
        <G>
          <Path d="M88 118 Q94 113 100 118 Q106 123 112 118" {...s} />
          <Path d="M101 119 Q104 131 110 127 Q109 121 106 120 Z" fill={TONGUE} />
        </G>
      );
    default:
      return <Path d="M90 114 Q95 120 100 114 Q105 120 110 114" {...s} />;
  }
}

function Arms({ pose }: { pose: MiloPose }) {
  const arm = (cx: number, cy: number, rx: number, ry: number, rot: number, key: string) => (
    <Ellipse key={key} cx={cx} cy={cy} rx={rx} ry={ry} fill={FUR} stroke={LINE} strokeWidth={2} transform={`rotate(${rot} ${cx} ${cy})`} />
  );
  switch (pose) {
    case 'wave':
      return <G>{[arm(52, 160, 11, 17, 18, 'l'), arm(158, 108, 10, 19, -28, 'r')]}</G>;
    case 'point':
      return <G>{[arm(52, 160, 11, 17, 18, 'l'), arm(164, 140, 22, 9, -8, 'r')]}</G>;
    case 'beckon':
      return <G>{[arm(52, 160, 11, 17, 18, 'l'), arm(158, 124, 10, 18, -55, 'r')]}</G>;
    case 'clap':
      return <G>{[arm(90, 150, 10, 16, 30, 'l'), arm(110, 150, 10, 16, -30, 'r')]}</G>;
    case 'up':
      return <G>{[arm(44, 112, 10, 19, 28, 'l'), arm(156, 112, 10, 19, -28, 'r')]}</G>;
    case 'cast':
      return <G>{[arm(150, 134, 20, 9, 8, 'l'), arm(162, 150, 22, 9, -6, 'r')]}</G>;
    case 'rub':
      return <G>{[arm(52, 160, 11, 17, 18, 'l'), arm(112, 170, 19, 9, -10, 'r')]}</G>;
    case 'hold':
      return <G>{[arm(84, 146, 10, 14, 35, 'l'), arm(116, 146, 10, 14, -35, 'r')]}</G>;
    case 'cover':
      return <G>{[arm(78, 96, 14, 12, 0, 'l'), arm(122, 96, 14, 12, 0, 'r')]}</G>;
    default:
      return <G>{[arm(52, 160, 11, 17, 18, 'l'), arm(148, 160, 11, 17, -18, 'r')]}</G>;
  }
}

export function MiloArt({ width, mood = 'idle', pose = 'rest', blink = false, glow = false }: { width: number; mood?: MiloMood; pose?: MiloPose; blink?: boolean; glow?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = (n: string) => `${n}${uid}`;
  const over = pose === 'cover';
  return (
    <Svg width={width} height={width / MILO_ASPECT} viewBox="0 0 200 220">
      <Defs>
        <LinearGradient id={g('ear')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3B8FD9" />
          <Stop offset="0.2" stopColor="#5BB8A6" />
          <Stop offset="0.42" stopColor={FUR} />
        </LinearGradient>
        <LinearGradient id={g('tail')} x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E8622C" />
          <Stop offset="0.22" stopColor="#E8A33D" />
          <Stop offset="0.45" stopColor={FUR} />
        </LinearGradient>
        <RadialGradient id={g('body')} cx="0.4" cy="0.35" r="0.75">
          <Stop offset="0" stopColor="#FFFDF8" />
          <Stop offset="0.7" stopColor={FUR} />
          <Stop offset="1" stopColor={FUR_SHADE} />
        </RadialGradient>
        <RadialGradient id={g('glow')} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FFF6C8" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#FFF6C8" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {glow && <Ellipse cx={100} cy={120} rx={100} ry={100} fill={`url(#${g('glow')})`} />}
      <Ellipse cx={100} cy={213} rx={52} ry={6} fill="#000" opacity={0.13} />
      {/* tail, behind everything */}
      <Path d="M132 182 C176 182 196 146 178 112 C170 98 150 100 156 116 C164 136 152 154 128 160 Z" fill={`url(#${g('tail')})`} stroke={LINE} strokeWidth={2} />
      {/* ears */}
      <Path d="M66 62 C48 42 36 16 42 6 C52 -2 80 28 88 50 Z" fill={`url(#${g('ear')})`} stroke={LINE} strokeWidth={2} />
      <Path d="M68 56 C56 42 48 24 50 16 C58 14 74 34 80 48 Z" fill="#F7C6CF" opacity={0.55} />
      <Path d="M134 62 C152 42 164 16 158 6 C148 -2 120 28 112 50 Z" fill={`url(#${g('ear')})`} stroke={LINE} strokeWidth={2} />
      <Path d="M132 56 C144 42 152 24 150 16 C142 14 126 34 120 48 Z" fill="#F7C6CF" opacity={0.55} />
      {/* feet */}
      <Ellipse cx={78} cy={205} rx={17} ry={9} fill={FUR} stroke={LINE} strokeWidth={2} />
      <Ellipse cx={122} cy={205} rx={17} ry={9} fill={FUR} stroke={LINE} strokeWidth={2} />
      {/* body */}
      <Ellipse cx={100} cy={164} rx={50} ry={44} fill={`url(#${g('body')})`} stroke={LINE} strokeWidth={2} />
      <Ellipse cx={100} cy={172} rx={31} ry={28} fill={BELLY} />
      {!over && <Arms pose={pose} />}
      {/* head */}
      <Ellipse cx={100} cy={92} rx={66} ry={57} fill={`url(#${g('body')})`} stroke={LINE} strokeWidth={2} />
      {/* fluff tuft */}
      <Path d="M88 38 Q94 26 100 36 Q106 24 112 38" stroke={LINE} strokeWidth={2} fill={FUR} />
      {/* forehead gem: four colours, one for each element */}
      <G transform="translate(100 56)">
        <Polygon points="0,-8 6,0 0,8 -6,0" fill="#fff" stroke="#C9B08A" strokeWidth={1.2} />
        <Polygon points="0,-8 6,0 0,0" fill="#3B8FD9" opacity={0.85} />
        <Polygon points="6,0 0,8 0,0" fill="#E8622C" opacity={0.85} />
        <Polygon points="0,8 -6,0 0,0" fill="#9A7547" opacity={0.85} />
        <Polygon points="-6,0 0,-8 0,0" fill="#5BB8A6" opacity={0.85} />
      </G>
      <Ellipse cx={58} cy={112} rx={11} ry={6.5} fill={BLUSH} opacity={mood === 'hurt' || mood === 'tired' ? 0.25 : 0.55} />
      <Ellipse cx={142} cy={112} rx={11} ry={6.5} fill={BLUSH} opacity={mood === 'hurt' || mood === 'tired' ? 0.25 : 0.55} />
      <Eyes mood={mood} blink={blink} />
      <Brows mood={mood} />
      <Mouth mood={mood} />
      {over && <Arms pose={pose} />}
      {mood === 'confused' && <Path d="M160 34 Q160 22 170 22 Q180 22 180 32 Q180 40 170 42 L170 48 M170 55 L170 56" stroke={LINE} strokeWidth={4} strokeLinecap="round" fill="none" />}
      {mood === 'scared' && <Path d="M150 70 Q153 78 150 84 Q147 78 150 70 Z" fill="#9BD3F0" />}
    </Svg>
  );
}
