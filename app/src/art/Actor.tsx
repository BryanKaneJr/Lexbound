import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, View } from 'react-native';
import { DrizzletArt, EmberhogArt, PebblitArt, PuffkinArt, type LexlingMood } from './lexlings';
import { ACTOR_ART, PROP_ART, type Idle } from './ids';
import { MiloArt, useBlink, type MiloMood, type MiloPose } from './Milo';
import { MarenArt, PipArt } from './people';
import { PropArt } from './props';

/**
 * Anything that stands in a scene: Milo, a Lexling, a person or a prop.
 * Static art comes alive through a few cheap transforms (bible §52):
 * breathing, bobbing, hops, shakes, squash and stretch. `anim` names a
 * one-shot animation; bump `animKey` to play it again.
 */
const ND = Platform.OS !== 'web';

/** Milo's arm pose for each animation that has one. */
const POSE: Record<string, MiloPose> = {
  wave: 'wave',
  point: 'point',
  beckon: 'beckon',
  clap: 'clap',
  bounce: 'up',
  jump: 'up',
  spread: 'up',
  splash: 'up',
  hug: 'up',
  cast: 'cast',
  rub: 'rub',
  drink: 'hold',
  eat: 'hold',
  chew: 'hold',
  grab: 'point',
  cover: 'cover',
  shake: 'rest',
  attack: 'cast',
  defend: 'clap',
};

export function poseFor(anim: string | undefined, mood: string | undefined): MiloPose {
  if (anim && POSE[anim]) return POSE[anim];
  if (mood === 'proud') return 'up';
  return 'rest';
}

type V = { tx: Animated.Value; ty: Animated.Value; rot: Animated.Value; sx: Animated.Value; sy: Animated.Value; op: Animated.Value };

const t = (v: Animated.Value, toValue: number, duration: number, easing = Easing.out(Easing.quad)) => Animated.timing(v, { toValue, duration, easing, useNativeDriver: ND });
const seq = Animated.sequence;
const par = Animated.parallel;
const rep = (a: Animated.CompositeAnimation, n: number) => Animated.loop(a, { iterations: n });

/** A one-shot animation. `dir` is 1 facing right, -1 facing left. */
function animation(name: string, v: V, dir: 1 | -1, size: number): Animated.CompositeAnimation {
  const hop = (h: number, d = 160) => seq([par([t(v.ty, -h, d), t(v.sy, 1.06, d)]), par([t(v.ty, 0, d, Easing.in(Easing.quad)), t(v.sy, 0.94, d)]), t(v.sy, 1, 90)]);
  const s = size / 100;
  switch (name) {
    case 'hop':
    case 'pop':
      return name === 'pop' ? seq([par([t(v.op, 1, 120), t(v.ty, -30 * s, 200)]), t(v.ty, 0, 200, Easing.bounce)]) : hop(18 * s);
    case 'bounce':
    case 'splash':
      return seq([hop(14 * s, 130), hop(18 * s, 140), hop(10 * s, 120)]);
    case 'jump':
      return hop(42 * s, 240);
    case 'nod':
      return rep(seq([t(v.ty, 5 * s, 110), t(v.ty, 0, 110)]), 2);
    case 'shake':
    case 'gag':
      return seq([t(v.rot, -9, 70), t(v.rot, 9, 110), t(v.rot, -7, 100), t(v.rot, 6, 90), t(v.rot, 0, 80)]);
    case 'wiggle':
    case 'tug':
      return rep(seq([t(v.rot, -6, 60), t(v.rot, 6, 90), t(v.rot, 0, 60)]), 3);
    case 'tilt':
    case 'look':
      return seq([t(v.rot, -12 * dir, 220), Animated.delay(500), t(v.rot, 0, 260)]);
    case 'droop':
    case 'slump':
      return seq([par([t(v.sy, 0.88, 300), t(v.sx, 1.06, 300)]), Animated.delay(700), par([t(v.sy, 1, 400), t(v.sx, 1, 400)])]);
    case 'crouch':
    case 'defend':
      return seq([par([t(v.sy, 0.86, 160), t(v.sx, 1.08, 160)]), Animated.delay(500), par([t(v.sy, 1, 260), t(v.sx, 1, 260)])]);
    case 'peek':
      return seq([par([t(v.op, 1, 200), t(v.tx, 8 * dir * s, 200)]), t(v.tx, 0, 300)]);
    case 'run':
      return rep(seq([t(v.ty, -6 * s, 80), t(v.ty, 0, 80)]), 4);
    case 'stomp':
    case 'dig':
      return rep(seq([t(v.ty, -8 * s, 90), t(v.ty, 0, 70, Easing.in(Easing.quad))]), 3);
    case 'stagger':
      return seq([par([t(v.rot, -10 * dir, 150), t(v.tx, -10 * dir * s, 150)]), t(v.rot, 6 * dir, 200), par([t(v.rot, 0, 250), t(v.tx, 0, 250)])]);
    case 'flee':
      return par([t(v.tx, 220 * dir * s, 600, Easing.in(Easing.quad)), t(v.op, 0, 600)]);
    case 'spin':
      return seq([t(v.rot, 360, 600, Easing.inOut(Easing.quad)), t(v.rot, 0, 0)]);
    case 'bob':
    case 'float':
      return rep(seq([t(v.ty, -8 * s, 300, Easing.inOut(Easing.sin)), t(v.ty, 0, 300, Easing.inOut(Easing.sin))]), 2);
    case 'drink':
    case 'eat':
    case 'chew':
      return seq([t(v.rot, 10 * dir, 200), rep(seq([t(v.sy, 0.95, 100), t(v.sy, 1, 100)]), 4), t(v.rot, 0, 200)]);
    case 'pant':
      return rep(seq([t(v.sy, 0.97, 90), t(v.sy, 1, 90)]), 6);
    case 'sniff':
      return seq([rep(seq([t(v.tx, 5 * dir * s, 90), t(v.tx, 0, 90)]), 3), t(v.rot, 5 * dir, 150), t(v.rot, 0, 150)]);
    case 'wave':
    case 'beckon':
      return rep(seq([t(v.rot, 5, 150), t(v.rot, -5, 150)]), 2);
    case 'point':
    case 'grab':
      return seq([t(v.tx, 8 * dir * s, 160), Animated.delay(400), t(v.tx, 0, 250)]);
    case 'clap':
      return rep(seq([t(v.sy, 0.95, 90), t(v.sy, 1, 90)]), 3);
    case 'cast':
    case 'attack':
      return seq([par([t(v.tx, 26 * dir * s, 140), t(v.sx, 1.08, 140)]), par([t(v.tx, 0, 260), t(v.sx, 1, 260)])]);
    case 'lunge':
      return seq([t(v.tx, -10 * dir * s, 120), t(v.tx, 60 * dir * s, 160, Easing.in(Easing.quad)), t(v.tx, 0, 300)]);
    case 'recoil':
      return seq([par([t(v.tx, -18 * dir * s, 90), t(v.op, 0.5, 90)]), t(v.op, 1, 90), t(v.op, 0.6, 80), par([t(v.op, 1, 120), t(v.tx, 0, 260)])]);
    case 'puff':
    case 'blaze':
      return seq([par([t(v.sx, 1.15, 220), t(v.sy, 1.15, 220)]), Animated.delay(400), par([t(v.sx, 1, 300), t(v.sy, 1, 300)])]);
    case 'glow':
      return seq([par([t(v.sx, 1.08, 200), t(v.sy, 1.08, 200)]), par([t(v.sx, 1, 300), t(v.sy, 1, 300)])]);
    case 'spread':
    case 'hug':
      return seq([t(v.sx, 1.08, 200), Animated.delay(400), t(v.sx, 1, 200)]);
    case 'bow':
      return seq([t(v.rot, 18 * dir, 260), Animated.delay(350), t(v.rot, 0, 260)]);
    case 'dive':
      return seq([par([t(v.ty, 60 * s, 320, Easing.in(Easing.quad)), t(v.op, 0.2, 320)]), par([t(v.ty, 0, 360), t(v.op, 1, 360)])]);
    case 'flare':
      return seq([t(v.sy, 1.4, 180), t(v.sy, 0.95, 220), t(v.sy, 1.2, 160), t(v.sy, 1, 200)]);
    case 'hiss':
      return seq([t(v.op, 0.25, 500), t(v.sy, 0.6, 300)]);
    case 'faint':
      return par([t(v.rot, 80 * dir, 500), t(v.op, 0.6, 500)]);
    default:
      return hop(14 * s);
  }
}

function idleLoop(idle: Idle, v: V, breath: Animated.Value): Animated.CompositeAnimation | null {
  switch (idle) {
    case 'breathe':
      return Animated.loop(seq([t(breath, 1.025, 1300, Easing.inOut(Easing.sin)), t(breath, 1, 1300, Easing.inOut(Easing.sin))]));
    case 'bob':
    case 'float':
      return Animated.loop(seq([t(breath, 1.04, idle === 'float' ? 1600 : 900, Easing.inOut(Easing.sin)), t(breath, 1, idle === 'float' ? 1600 : 900, Easing.inOut(Easing.sin))]));
    case 'flicker':
      return Animated.loop(seq([t(breath, 1.06, 220), t(breath, 0.97, 260), t(breath, 1.03, 200), t(breath, 1, 240)]));
    default:
      return null;
  }
}

export type ActorProps = {
  art: string;
  /** Height in px; width follows the art's shape. */
  height: number;
  mood?: string;
  facing?: 'left' | 'right';
  anim?: string;
  animKey?: number;
  reduced?: boolean;
  hidden?: boolean;
  onPress?: () => void;
  label?: string;
};

export const ASPECT: Record<string, number> = {
  milo: 200 / 220,
  emberhog: 220 / 170,
  drizzlet: 120 / 140,
  pebblit: 140 / 110,
  puffkin: 1,
  maren: 120 / 260,
  pip: 110 / 230,
  basket: 140 / 100,
  bush: 160 / 120,
  shiny_stone: 1,
  log: 200 / 70,
  mushroom: 1,
  ripple: 240 / 60,
  rock_big: 170 / 110,
  rock_small: 120 / 60,
  campfire: 1,
  puddle: 200 / 50,
  well: 120 / 150,
};

export function artWidth(art: string, height: number): number {
  return height * (ASPECT[art] ?? 1);
}

function ArtFor({ art, width, mood, anim, reduced }: { art: string; width: number; mood?: string; anim?: string; reduced: boolean }) {
  const blink = useBlink(art === 'milo' && !reduced);
  switch (art) {
    case 'milo':
      return <MiloArt width={width} mood={(mood as MiloMood) ?? 'idle'} pose={poseFor(anim, mood)} blink={blink} />;
    case 'emberhog':
      return <EmberhogArt width={width} mood={(mood as LexlingMood) ?? 'angry'} />;
    case 'drizzlet':
      return <DrizzletArt width={width} mood={(mood as LexlingMood) ?? 'happy'} />;
    case 'pebblit':
      return <PebblitArt width={width} mood={(mood as LexlingMood) ?? 'scared'} />;
    case 'puffkin':
      return <PuffkinArt width={width} mood={(mood as LexlingMood) ?? 'happy'} />;
    case 'maren':
      return <MarenArt width={width} mood={mood} />;
    case 'pip':
      return <PipArt width={width} mood={mood} />;
    default:
      return <PropArt art={art} width={width} />;
  }
}

export function Actor({ art, height, mood, facing = 'right', anim, animKey = 0, reduced = false, hidden = false, onPress, label }: ActorProps) {
  const [v] = useState<V>(() => ({
    tx: new Animated.Value(0),
    ty: new Animated.Value(0),
    rot: new Animated.Value(0),
    sx: new Animated.Value(1),
    sy: new Animated.Value(1),
    op: new Animated.Value(1),
  }));
  const [breath] = useState(() => new Animated.Value(1));
  const width = artWidth(art, height);
  const dir = facing === 'left' ? -1 : 1;
  const idle = ACTOR_ART[art]?.idle ?? PROP_ART[art]?.idle ?? 'none';

  useEffect(() => {
    if (reduced) return;
    const loop = idleLoop(idle, v, breath);
    loop?.start();
    return () => loop?.stop();
  }, [idle, reduced, v, breath]);

  useEffect(() => {
    if (!anim) return;
    // Every one-shot starts from rest so they never stack up oddly.
    v.tx.setValue(0);
    v.ty.setValue(0);
    v.rot.setValue(0);
    v.sx.setValue(1);
    v.sy.setValue(1);
    v.op.setValue(anim === 'pop' || anim === 'peek' ? 0 : 1);
    if (reduced) {
      v.op.setValue(1);
      return;
    }
    const a = animation(anim, v, dir, height);
    a.start();
    return () => a.stop();
    // animKey replays the same animation.
  }, [anim, animKey, reduced, v, dir, height]);

  if (hidden) return null;

  const floaty = idle === 'bob' || idle === 'float';
  const body = (
    <Animated.View
      style={{
        width,
        height,
        opacity: v.op,
        transformOrigin: '50% 100%',
        transform: [
          { translateX: v.tx },
          { translateY: floaty ? Animated.add(v.ty, Animated.multiply(Animated.add(breath, -1), -120)) : v.ty },
          { rotate: v.rot.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] }) },
          { scaleX: v.sx },
          { scaleY: floaty ? v.sy : Animated.multiply(v.sy, breath) },
        ],
      }}>
      <View style={{ transform: [{ scaleX: dir }] }}>
        <ArtFor art={art} width={width} mood={mood} anim={anim} reduced={reduced} />
      </View>
    </Animated.View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label ?? art} hitSlop={8}>
      {body}
    </Pressable>
  );
}
