import { meets, nextStory } from '@lexbound/core';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useId } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { Icon } from '@/art/icons';
import { blob, Fill, Grain, rng, Vignette, wave } from '@/art/paint';
import { Screen, tapFeedback, Txt } from '@/components/ui';
import { content } from '@/game/content';
import { useGame } from '@/state/store';
import { color, font, radius, shadow, space, type } from '@/theme/tokens';

/**
 * Lexora. Illustrated places, not an open world (bible §9): tap a place to
 * go there. Places still to come stay on the map so the world feels as big
 * as it will be. Drawn as an explorer's map: ink on aged paper, watercolour
 * washes, little inked trees and peaks.
 */
const INK = '#5A4128';

/** The east coast: where the land ends and the sea begins, at height y. */
const coastX = (y: number) => 352 + 16 * wave(17)((y / 440) * Math.PI * 3) + 6 * wave(18)((y / 440) * Math.PI * 9);

function Tree({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <G>
      <Path d={`M${x} ${y + 2} L${x} ${y + 9 * s}`} stroke={INK} strokeWidth={1.3} />
      <Path d={blob(x, y - 2 * s, 8 * s, { seed: Math.round(x * 7 + y), lobes: 5, lobe: 0.16, squash: 1.1 })} fill={fill} stroke={INK} strokeWidth={1.1} />
    </G>
  );
}

function Peak({ x, y, s }: { x: number; y: number; s: number }) {
  const h = 46 * s;
  const w = 34 * s;
  return (
    <G>
      <Path d={`M${x - w} ${y} L${x} ${y - h} L${x + w} ${y} Z`} fill="#D9C7A4" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      {/* hatching on the shaded east face */}
      {[0.25, 0.42, 0.59, 0.76].map((u) => (
        <Path key={u} d={`M${x + 2} ${y - h * (1 - u)} L${x + w * u * 0.9} ${y - 1}`} stroke={INK} strokeWidth={0.9} opacity={0.6} />
      ))}
      <Path d={`M${x - w * 0.28} ${y - h * 0.72} L${x} ${y - h} L${x + w * 0.28} ${y - h * 0.72} L${x + w * 0.1} ${y - h * 0.78} L${x - w * 0.06} ${y - h * 0.7} Z`} fill="#FFFDF6" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
    </G>
  );
}

function Parchment({ w, h }: { w: number; h: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = (n: string) => `${n}${uid}`;
  const ys = Array.from({ length: 45 }, (_, i) => 6 + i * 10);
  const land = `M6 6 L${ys.map((y) => `${coastX(y).toFixed(1)} ${y}`).join(' L')} L6 446 Z`;
  const coast = `M${ys.map((y) => `${coastX(y).toFixed(1)} ${y}`).join(' L')}`;
  const beach = `M${ys.map((y) => `${(coastX(y) - 5).toFixed(1)} ${y}`).join(' L')}`;
  const r = rng(9);
  const wood: [number, number][] = [[64, 124], [86, 112], [106, 128], [76, 146], [98, 152], [122, 142], [58, 164], [84, 176], [110, 172], [132, 118], [140, 160], [118, 196]];
  const hollow: [number, number][] = [[40, 54], [58, 44], [78, 52], [50, 74], [92, 70], [36, 86]];
  return (
    <Svg width={w} height={h} viewBox="0 0 400 440">
      {/* the sheet: aged paper, the sea along its east edge */}
      <Fill g={g} id="sea" stops={[[0, '#C4DCD3'], [1, '#A8CBC6']]} width={400} height={440} />
      <Fill g={g} id="land" d={land} stops={[[0, '#E3DDB2'], [0.5, '#D9DCAA'], [1, '#E0D7A6']]} />
      <Path d={blob(150, 230, 120, { seed: 4, lobes: 4, lobe: 0.1, wobble: 0.14, squash: 1.2 })} fill="#C8D49A" opacity={0.45} />
      <Path d={beach} stroke="#EAD9A8" strokeWidth={9} fill="none" strokeLinecap="round" />
      <Path d={coast} stroke={INK} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      {([[372, 120], [384, 200], [370, 300], [386, 370], [376, 60]] as const).map(([x, y], i) => (
        <Path key={i} d={`M${x - 8} ${y} q4 -4 8 0 q4 4 8 0`} stroke="#5E8C8E" strokeWidth={1.3} fill="none" />
      ))}
      {/* the river, inked on both banks */}
      <Path d="M150 6 Q168 110 226 166 Q292 222 262 300 Q238 362 280 446" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
      <Path d="M150 6 Q168 110 226 166 Q292 222 262 300 Q238 362 280 446" stroke="#9CC3CC" strokeWidth={6.5} fill="none" strokeLinecap="round" />
      {/* reeds in the Riverlands */}
      {([[232, 214], [246, 226], [276, 206], [272, 238]] as const).map(([x, y], i) => (
        <Path key={i} d={`M${x} ${y} l-2 -9 M${x + 3} ${y} l1 -11 M${x + 6} ${y} l3 -8`} stroke={INK} strokeWidth={1} opacity={0.7} />
      ))}
      {/* the Old Hollow, darkest and oldest, with its standing stone */}
      {hollow.map(([x, y], i) => (
        <Tree key={`h${i}`} x={x} y={y} s={1.1} fill="#7E9A6A" />
      ))}
      <Path d="M66 92 L68 76 L74 75 L76 92 Z" fill="#B8B2A2" stroke={INK} strokeWidth={1.1} />
      {/* Whisperwood */}
      {wood.map(([x, y], i) => (
        <Tree key={`w${i}`} x={x + (r() - 0.5) * 4} y={y} s={0.95 + r() * 0.25} fill={i % 3 ? '#A9C187' : '#97B57A'} />
      ))}
      {/* Ember Ridge */}
      <Peak x={290} y={104} s={0.8} />
      <Peak x={326} y={98} s={1.05} />
      <Peak x={300} y={122} s={0.6} />
      {[[318, 108], [330, 114], [308, 114]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={1.6} fill="#D2552E" opacity={0.8} />
      ))}
      {/* camp's tent and the Lodge */}
      <Path d="M108 262 L118 246 L128 262 Z" fill="#E2A240" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <Path d="M206 330 L206 318 L216 310 L226 318 L226 330 Z" fill="#C89A6A" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      {/* roads */}
      <Path d="M120 270 Q160 300 220 340 M120 270 Q100 220 90 160 Q66 120 70 76" stroke={INK} strokeWidth={1.8} strokeDasharray="1 6" strokeLinecap="round" fill="none" />
      {/* compass rose */}
      <G transform="translate(52 382)">
        <Circle cx={0} cy={0} r={20} fill="none" stroke={INK} strokeWidth={1} opacity={0.7} />
        <Path d="M0 -26 L5 0 L0 26 L-5 0 Z" fill={INK} opacity={0.85} />
        <Path d="M-26 0 L0 4 L26 0 L0 -4 Z" fill={INK} opacity={0.55} />
        <Path d="M0 -26 L5 0 L0 0 Z" fill="#E2A240" />
      </G>
      {/* an inked double border and the paper's age */}
      <Rect x={5} y={5} width={390} height={430} rx={6} fill="none" stroke={INK} strokeWidth={2} />
      <Rect x={10} y={10} width={380} height={420} rx={4} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.6} />
      <Vignette g={g} width={400} height={440} color="#7A5426" strength={0.38} cy={0.5} />
      <Grain g={g} width={400} height={440} />
    </Svg>
  );
}

export default function MapScreen() {
  const save = useGame((s) => s.save);
  const { width } = useWindowDimensions();
  const w = Math.min(width - space.lg * 2, 480);
  const h = w * 1.1;
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, alignItems: 'center' }}>
        <View style={{ alignSelf: 'stretch' }}>
          <Txt style={type.title}>Lexora</Txt>
          <Txt style={[type.small, { color: color.inkSoft }]}>Where will you and Milo go?</Txt>
        </View>
        <View style={[{ width: w, height: h }, shadow.card]}>
          <Parchment w={w} h={h} />
          {content.locations.map((loc) => {
            const open = !loc.comingSoon && meets(save, loc.requires);
            // A place that's only waiting on the story can still be visited, to read why it's locked.
            const visitable = open || !loc.comingSoon;
            const story = open && !!nextStory(content, save, loc.id);
            const go = () => {
              tapFeedback();
              if (loc.kind === 'home') router.navigate('/');
              else router.push({ pathname: '/place/[id]', params: { id: loc.id } });
            };
            return (
              <Pressable
                key={loc.id}
                disabled={!visitable}
                accessibilityRole="button"
                accessibilityLabel={open ? loc.name : `${loc.name} (not yet)`}
                onPress={go}
                style={[styles.pin, { left: loc.map.x * w - 60, top: loc.map.y * h - 22, opacity: open ? 1 : 0.55 }]}>
                <View style={[styles.dot, { backgroundColor: open ? (loc.kind === 'home' ? color.amber : '#B5462E') : '#9A8E7C' }]}>
                  {!open ? <Icon name="lock" size={13} color={color.paper} /> : story ? <Txt style={{ fontFamily: font.displayHeavy, fontSize: 15, color: color.paper }}>!</Txt> : null}
                </View>
                <View style={styles.label}>
                  <Txt style={{ fontFamily: font.displaySemi, fontSize: 13, color: color.ink }} numberOfLines={1}>
                    {loc.name}
                  </Txt>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pin: { position: 'absolute', width: 120, alignItems: 'center', gap: 4 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2.5, borderColor: INK, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  label: { backgroundColor: 'rgba(251,244,228,0.94)', paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.sm, borderWidth: 1.5, borderColor: color.edge },
});
