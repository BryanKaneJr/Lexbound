import { meets, nextStory } from '@lexbound/core';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Polygon } from 'react-native-svg';
import { Icon } from '@/art/icons';
import { Screen, tapFeedback, Txt } from '@/components/ui';
import { content } from '@/game/content';
import { useGame } from '@/state/store';
import { color, radius, shadow, space, type } from '@/theme/tokens';

/**
 * Lexora. Illustrated places, not an open world (bible §9): tap a place to
 * go there. Places still to come stay on the map so the world feels as big
 * as it will be.
 */
function Parchment({ w, h }: { w: number; h: number }) {
  return (
    <Svg width={w} height={h} viewBox="0 0 400 440">
      <Path d="M8 14 Q200 0 392 14 L386 428 Q200 440 14 426 Z" fill="#F3E6C8" stroke="#C9AE7E" strokeWidth={3} />
      <Path d="M40 60 Q120 30 220 50 Q330 40 360 120 Q380 220 340 300 Q300 400 180 390 Q60 400 40 300 Q20 180 40 60 Z" fill="#DCE8C2" />
      {/* Whisperwood */}
      {[
        [70, 140],
        [95, 120],
        [110, 155],
        [80, 175],
        [130, 130],
        [60, 110],
        [120, 180],
      ].map(([x, y], i) => (
        <G key={i}>
          <Circle cx={x} cy={y} r={16} fill="#7DB56E" />
          <Circle cx={(x as number) - 4} cy={(y as number) - 4} r={8} fill="#9CC78A" />
        </G>
      ))}
      {/* the Old Hollow: the darkest, oldest trees, past Whisperwood */}
      {[
        [52, 62],
        [76, 50],
        [92, 72],
        [64, 84],
      ].map(([x, y], i) => (
        <G key={`h${i}`}>
          <Circle cx={x} cy={y} r={15} fill="#4E7A5A" />
          <Circle cx={(x as number) - 4} cy={(y as number) - 4} r={7} fill="#6A9572" />
        </G>
      ))}
      <Polygon points="70,74 73,58 77,74" fill="#8E928A" />
      {/* Ember Ridge */}
      <Polygon points="270,110 300,50 330,110" fill="#B9A58A" />
      <Polygon points="300,110 335,40 370,110" fill="#A89377" />
      <Polygon points="322,52 335,40 348,52 335,58" fill="#fff" />
      {/* river */}
      <Path d="M150 40 Q170 120 230 170 Q290 220 260 300 Q240 360 280 420" stroke="#7CC6F2" strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* coast */}
      <Path d="M360 200 Q392 260 380 340 L392 340 L392 200 Z" fill="#9FD2F2" />
      <Path d="M366 230 Q376 236 372 246 M372 290 Q382 296 378 306" stroke="#fff" strokeWidth={2} fill="none" />
      {/* path from camp to the Lodge, the woods and the Hollow */}
      <Path d="M120 270 Q160 300 220 340 M120 270 Q100 220 90 160 Q66 120 70 76" stroke="#B8946A" strokeWidth={3} strokeDasharray="6 6" fill="none" />
      <Ellipse cx={200} cy={410} rx={60} ry={8} fill="#E6D3AE" />
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
                <View style={[styles.dot, { backgroundColor: open ? (loc.kind === 'home' ? color.amber : color.leaf) : color.inkMuted }]}>
                  {!open ? <Icon name="lock" size={14} color={color.white} /> : story ? <Txt style={{ color: color.white, fontWeight: '900' }}>!</Txt> : null}
                </View>
                <View style={styles.label}>
                  <Txt style={[type.small, { fontSize: 12 }]} numberOfLines={1}>
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
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: color.white, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  label: { backgroundColor: 'rgba(251,245,234,0.95)', paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill, borderWidth: 1, borderColor: color.paperLine },
});
