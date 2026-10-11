import { useEffect, useId, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { lookFor } from './backgrounds';
import { blob, Grain, rng, tuft, Vignette } from './paint';

/**
 * The air of a scene, laid over its painting and everyone in it: the light
 * from above, the shade from below, a vignette and a fine grain (so actors
 * share the scene's light instead of floating on it), and specks drifting
 * through the light. See `LOOKS` in backgrounds.tsx.
 */
const ND = Platform.OS !== 'web';

export function SceneGrade({ id, width, height }: { id: string; width: number; height: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = (n: string) => `${n}${uid}`;
  const look = lookFor(id);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} viewBox="0 0 400 460" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={g('grade')} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={look.light[0]} stopOpacity={look.light[1]} />
            <Stop offset="0.45" stopColor={look.light[0]} stopOpacity={0} />
            <Stop offset="0.6" stopColor={look.shade[0]} stopOpacity={0} />
            <Stop offset="1" stopColor={look.shade[0]} stopOpacity={look.shade[1]} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={400} height={460} fill={`url(#${g('grade')})`} />
        <Vignette g={g} strength={look.vignette} />
        <Grain g={g} />
      </Svg>
    </View>
  );
}

/** Specks drifting through the scene's light: pollen, dust, embers, fireflies. */
export function Motes({ id, width, height, reduced }: { id: string; width: number; height: number; reduced: boolean }) {
  const motes = lookFor(id).motes;
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!motes || reduced) return;
    const a = Animated.loop(Animated.timing(t, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: ND }));
    a.start();
    return () => a.stop();
  }, [t, motes, reduced]);
  if (!motes) return null;
  const r = rng(id.length * 31 + 7);
  const specks = Array.from({ length: motes.count }, () => ({ x: r(), y: 0.15 + r() * 0.7, phase: r(), s: motes.size * (0.6 + r() * 0.9), sway: (r() - 0.5) * 24 }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {specks.map((p, i) => {
        const local = Animated.modulo(Animated.add(t, p.phase), 1);
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x * width,
              top: p.y * height,
              width: p.s * 2,
              height: p.s * 2,
              borderRadius: p.s,
              backgroundColor: motes.color,
              shadowColor: motes.color,
              shadowOpacity: 0.9,
              shadowRadius: p.s * 2,
              opacity: reduced ? 0.5 : local.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.85, 0.85, 0] }),
              transform: reduced
                ? []
                : [
                    { translateY: local.interpolate({ inputRange: [0, 1], outputRange: [0, -motes.rise] }) },
                    { translateX: local.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.sway, 0] }) },
                  ],
            }}
          />
        );
      })}
    </View>
  );
}

/**
 * The ground continuing below a scene's picture, darkening toward the
 * viewer, with the scene's grain and edge silhouettes so the seam
 * disappears. Screens put their dialogue box on it.
 */
export function Apron({ id, width, height }: { id: string; width: number; height: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = (n: string) => `${n}${uid}`;
  const look = lookFor(id);
  if (height <= 0) return null;
  const h = (400 * height) / width;
  const edge = look.apronEdgeColor ?? look.apron[0];
  const r = rng(id.length * 13 + 3);
  return (
    <Svg width={width} height={height} viewBox={`0 0 400 ${h}`} preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id={g('apron')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={look.apron[0]} />
          <Stop offset="1" stopColor={look.apron[1]} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={400} height={h} fill={`url(#${g('apron')})`} />
      <G opacity={0.9}>
        {look.apronEdge === 'grass' &&
          Array.from({ length: 12 }, (_, i) => <Path key={i} d={tuft(i * 36 + r() * 20, 18 + r() * 12, 18 + r() * 14, 200 + i, 6)} fill={edge} />)}
        {look.apronEdge === 'moss' &&
          Array.from({ length: 9 }, (_, i) => <Path key={i} d={blob(i * 48 + r() * 20, 8 + r() * 10, 14 + r() * 10, { seed: 300 + i, lobes: 6, lobe: 0.2, squash: 0.45 })} fill={edge} />)}
        {look.apronEdge === 'boards' &&
          Array.from({ length: 5 }, (_, i) => <Rect key={i} x={0} y={14 + i * 34} width={400} height={2} fill={edge} opacity={0.5} />)}
        {look.apronEdge === 'stone' &&
          Array.from({ length: 7 }, (_, i) => <Path key={i} d={blob(i * 64 + r() * 30, 22 + r() * 30, 10 + r() * 8, { seed: 400 + i, lobes: 3, lobe: 0.1, squash: 0.55 })} fill={edge} opacity={0.6} />)}
      </G>
      <Vignette g={g} width={400} height={h} strength={look.vignette + 0.15} cy={0.1} />
      <Grain g={g} width={400} height={h} />
    </Svg>
  );
}

/** Fades the bottom of a scene's picture into its apron so the seam disappears. Place it over the picture's lower edge. */
export function SeamFade({ id, width, height }: { id: string; width: number; height: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const look = lookFor(id);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: -height, height }}>
      <Svg width={width} height={height} viewBox="0 0 10 10" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={`seam${uid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={look.apron[0]} stopOpacity={0} />
            <Stop offset="1" stopColor={look.apron[0]} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={10} height={10} fill={`url(#seam${uid})`} />
      </Svg>
    </View>
  );
}
