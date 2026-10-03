import { bondTier, miloLevel, nextStory, type SceneState } from '@lexbound/core';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/art/icons';
import { speakLine } from '@/audio/voice';
import { Scene, SCENE_ASPECT, type SceneAnims } from '@/components/Scene';
import { SpeechBubble } from '@/components/Speech';
import { Bar, Button, Card, IconButton, tapFeedback, Txt, useReducedMotion } from '@/components/ui';
import { content } from '@/game/content';
import { useGame } from '@/state/store';
import { color, radius, space, type } from '@/theme/tokens';

/**
 * Camp: where Milo lives (bible §36). Tap him and he talks to you in the
 * creature language, which quietly reinforces what you know. Share a snack.
 * No hunger timers, no guilt; he's just glad you're here.
 */
const IDLE_ANIM: Record<string, string> = {
  'milo.ciao': 'wave',
  'milo.ciao.ciao': 'bounce',
  'milo.mmm': 'tilt',
  'milo.si': 'nod',
  'milo.amico': 'hug',
};
const IDLE_MOOD: Record<string, string> = { 'milo.mmm': 'curious', 'milo.amico': 'happy', 'milo.si': 'happy' };

export default function Camp() {
  const save = useGame((s) => s.save);
  const dispatch = useGame((s) => s.dispatch);
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const sceneW = Math.min(screenW, screenH * 0.5 * SCENE_ASPECT, 520);
  const [anims, setAnims] = useState<SceneAnims>({});
  const [line, setLine] = useState<string | null>(null);
  const [mood, setMood] = useState('happy');
  const [hungry, setHungry] = useState(false);
  const key = useRef(0);
  const lastIdle = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const story = nextStory(content, save, 'camp');
  const level = miloLevel(save);
  const tier = bondTier(save.milo.bond);

  const say = (id: string, anim: string, m: string) => {
    setLine(id);
    setMood(m);
    setAnims({ milo: { name: anim, key: ++key.current } });
    speakLine(id);
    dispatch([{ type: 'heard', line: id, context: 'camp' }]);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setLine(null);
      setMood('happy');
    }, 2600);
  };

  const tapMilo = () => {
    tapFeedback();
    if (story) {
      router.push({ pathname: '/play/[id]', params: { id: story.id } });
      return;
    }
    const snacksToday = save.stats.snacks.count;
    if (!hungry && Math.random() < (snacksToday < 3 ? 0.3 : 0.08)) {
      setHungry(true);
      say('milo.fame', 'rub', 'tired');
      return;
    }
    const pool = content.milo.idle.filter((l) => l !== lastIdle.current);
    const id = pool[Math.floor(Math.random() * pool.length)] ?? content.milo.idle[0]!;
    lastIdle.current = id;
    say(id, IDLE_ANIM[id] ?? 'hop', IDLE_MOOD[id] ?? 'excited');
  };

  const snack = () => {
    setHungry(false);
    say('milo.buono.grazie', 'eat', 'happy');
    dispatch([{ type: 'snack' }]);
  };

  const scene: SceneState = {
    background: 'camp',
    props: [
      { id: 'log', art: 'log', x: 0.2, y: 0.93, scale: 0.8, facing: 'right', hidden: false },
      { id: 'fire', art: 'campfire', x: 0.78, y: 0.92, scale: 0.85, facing: 'right', hidden: false },
    ],
    actors: [{ id: 'milo', art: 'milo', x: 0.46, y: 0.88, scale: 1.15, facing: 'right', mood, hidden: false }],
  };

  const places = content.locations.filter((l) => l.kind !== 'home' && !l.comingSoon);

  return (
    <View style={{ flex: 1, backgroundColor: color.paperDeep }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xl }}>
        <View style={{ backgroundColor: color.night, paddingTop: insets.top, alignItems: 'center' }}>
          <View>
            <Scene scene={scene} width={sceneW} anims={anims} reduced={reduced} speaker={line ? 'milo' : null} bubble={line ? <SpeechBubble lineId={line} icons={false} audioFirst={false} /> : null}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={story ? 'Milo wants to tell you something' : 'Milo'}
                onPress={tapMilo}
                style={{ position: 'absolute', left: sceneW * 0.3, top: sceneW / SCENE_ASPECT * 0.52, width: sceneW * 0.32, height: sceneW / SCENE_ASPECT * 0.38 }}
              />
              {story && !line && (
                <View pointerEvents="none" style={[styles.alert, { left: sceneW * 0.46 - 18, top: sceneW / SCENE_ASPECT * 0.48 }]}>
                  <Txt style={{ fontSize: 22, fontWeight: '900', color: color.ink }}>!</Txt>
                </View>
              )}
            </Scene>
            <View style={styles.topBar}>
              <Txt style={[type.title, { color: color.white, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 }]}>Camp</Txt>
              <IconButton icon="gear" label="Settings" onPress={() => router.push('/settings')} tint={color.white} style={{ backgroundColor: 'rgba(30,43,58,0.35)' }} />
            </View>
          </View>
        </View>

        <View style={{ padding: space.lg, gap: space.lg }}>
          <Card style={{ gap: space.sm }}>
            <View style={styles.row}>
              <Txt style={type.heading}>Milo</Txt>
              <Txt style={[type.small, { color: color.inkSoft }]}>Level {level}</Txt>
            </View>
            <View style={styles.row}>
              <View style={[styles.row, { gap: 6 }]}>
                <Icon name="heart" size={16} />
                <Txt style={[type.small, { color: color.heart }]}>{tier.name}</Txt>
              </View>
            </View>
            <Bar value={save.milo.bond} max={100} tint={color.heart} height={8} />
            <Button label={hungry ? 'Share some sunberries' : 'Share a snack'} icon="berries" kind={hungry ? 'primary' : 'secondary'} onPress={snack} style={{ marginTop: space.sm }} />
          </Card>

          <View style={{ gap: space.sm }}>
            <Txt style={[type.label, { color: color.inkMuted }]}>Where to?</Txt>
            {places.map((p) => {
              const waiting = !!nextStory(content, save, p.id);
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to ${p.name}`}
                  onPress={() => {
                    tapFeedback();
                    router.push({ pathname: '/place/[id]', params: { id: p.id } });
                  }}
                  style={({ pressed }) => [styles.place, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt style={type.heading}>{p.name}</Txt>
                    <Txt style={[type.small, { color: color.inkSoft }]} numberOfLines={2}>
                      {p.blurb}
                    </Txt>
                  </View>
                  {waiting && (
                    <View style={styles.badge}>
                      <Txt style={{ fontWeight: '900', color: color.ink }}>!</Txt>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', top: space.sm, left: space.lg, right: space.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alert: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: color.white },
  place: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: color.paper, borderRadius: radius.lg, padding: space.lg, borderWidth: 1, borderColor: color.paperLine },
  badge: { width: 30, height: 30, borderRadius: 15, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center' },
});
