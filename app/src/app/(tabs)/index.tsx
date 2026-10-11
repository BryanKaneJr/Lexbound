import { bondTier, miloLevel, nextStory, type SceneState } from '@lexbound/core';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Apron, SeamFade } from '@/art/atmosphere';
import { Background } from '@/art/backgrounds';
import { Icon } from '@/art/icons';
import { speakLine } from '@/audio/voice';
import { Scene, SCENE_ASPECT, type SceneAnims } from '@/components/Scene';
import { SpeechBubble } from '@/components/Speech';
import { Bar, Button, IconButton, Panel, tapFeedback, Txt, useReducedMotion } from '@/components/ui';
import { content } from '@/game/content';
import { useGame } from '@/state/store';
import { color, font, radius, shadow, space, type } from '@/theme/tokens';

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
  const { width: screenW } = useWindowDimensions();
  const sceneW = Math.min(screenW, 520);
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
      say(content.milo.camp.hungry, 'rub', 'tired');
      return;
    }
    const pool = content.milo.idle.filter((l) => l !== lastIdle.current);
    const id = pool[Math.floor(Math.random() * pool.length)] ?? content.milo.idle[0]!;
    lastIdle.current = id;
    say(id, IDLE_ANIM[id] ?? 'hop', IDLE_MOOD[id] ?? 'excited');
  };

  const snack = () => {
    setHungry(false);
    say(content.milo.camp.snack, 'eat', 'happy');
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
  const [groundH, setGroundH] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: color.night }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
                  <Txt style={{ fontFamily: font.displayHeavy, fontSize: 22, color: color.ink }}>!</Txt>
                </View>
              )}
            </Scene>
            <View style={styles.topBar}>
              <Txt style={[type.title, { color: color.white, textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 8 }]}>Camp</Txt>
              <IconButton icon="gear" label="Settings" onPress={() => router.push('/settings')} tint={color.white} style={{ backgroundColor: 'rgba(26,34,48,0.5)' }} />
            </View>
          </View>
        </View>

        {/* The camp's ground carries on below the picture; everything else sits on it. */}
        <View style={{ flexGrow: 1, alignSelf: 'center', width: sceneW, padding: space.md, paddingTop: space.lg, gap: space.lg }} onLayout={(e) => setGroundH(e.nativeEvent.layout.height)}>
          <View style={StyleSheet.absoluteFill}>
            <Apron id="camp" width={sceneW} height={groundH} />
          </View>
          <SeamFade id="camp" width={sceneW} height={(sceneW / SCENE_ASPECT) * 0.06} />
          <Panel name="Milo" nameColor={color.amberDeep}>
            <View style={styles.row}>
              <View style={[styles.row, { gap: 6 }]}>
                <Icon name="heart" size={16} />
                <Txt style={{ fontFamily: font.uiBold, fontSize: 14, color: color.heart }}>{tier.name}</Txt>
              </View>
              <Txt style={{ fontFamily: font.uiBold, fontSize: 14, color: color.inkSoft }}>Level {level}</Txt>
            </View>
            <Bar value={save.milo.bond} max={100} tint={color.heart} height={8} />
            <Button label={hungry ? 'Share some sunberries' : 'Share a snack'} icon="berries" kind={hungry ? 'primary' : 'secondary'} onPress={snack} />
          </Panel>

          <View style={{ gap: space.sm }}>
            <Txt style={[type.label, { color: color.paper, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }]}>Where to?</Txt>
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
                  style={({ pressed }) => [styles.place, pressed && { backgroundColor: color.amberSoft, transform: [{ translateY: 1 }] }]}>
                  <View style={styles.thumb}>
                    <Background id={p.background} width={72} height={72} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt style={type.heading}>{p.name}</Txt>
                    <Txt style={{ fontFamily: font.ui, fontSize: 13, lineHeight: 18, color: color.inkSoft }} numberOfLines={2}>
                      {p.blurb}
                    </Txt>
                  </View>
                  {waiting && (
                    <View style={styles.badge}>
                      <Txt style={{ fontFamily: font.displayHeavy, fontSize: 16, color: color.ink }}>!</Txt>
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
  alert: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: color.paper, ...shadow.lift },
  place: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: color.paper, borderRadius: radius.md, padding: space.sm, paddingRight: space.md, borderWidth: 2, borderBottomWidth: 4, borderColor: color.edge, ...shadow.card },
  thumb: { width: 72, height: 72, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1.5, borderColor: color.edgeDark },
  badge: { width: 30, height: 30, borderRadius: 15, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: color.amberDeep },
});
