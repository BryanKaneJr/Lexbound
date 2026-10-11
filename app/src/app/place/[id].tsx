import { chooseEncounter, meets, nextStory, type SceneState } from '@lexbound/core';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Portrait } from '@/art/Actor';
import { Scene, SCENE_ASPECT } from '@/components/Scene';
import { Button, Card, IconButton, Txt, useReducedMotion } from '@/components/ui';
import { content } from '@/game/content';
import { takeSeed, useGame } from '@/state/store';
import { color, space, type } from '@/theme/tokens';

/** How wide each species sits on a place's "Lexlings here" card. */
const SMALL: Record<string, { scale: number; mood?: string }> = {
  emberhog: { scale: 1, mood: 'angry' },
  drizzlet: { scale: 0.7 },
  pebblit: { scale: 1, mood: 'happy' },
  puffkin: { scale: 0.8 },
  flickerwing: { scale: 0.6, mood: 'happy' },
  cragling: { scale: 0.9, mood: 'angry' },
  cinderback: { scale: 1, mood: 'angry' },
};

/** A place: its painting, what's been found here, and the button that starts an encounter. */
export default function Place() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const loc = content.location.get(id);
  const save = useGame((s) => s.save);
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const sceneW = Math.min(screenW, screenH * 0.5 * SCENE_ASPECT, 520);
  const [quiet, setQuiet] = useState(false);
  if (!loc) return null;
  const open = !loc.comingSoon && meets(save, loc.requires);
  const story = nextStory(content, save, loc.id);
  const locals = content.lexlings.filter((l) => l.habitat === loc.id);

  const go = () => {
    const pick = chooseEncounter(content, useGame.getState().save, loc.id, Date.now(), takeSeed());
    if (!pick.encounter) {
      setQuiet(true);
      return;
    }
    router.push({ pathname: '/play/[id]', params: { id: pick.encounter.id, n: String(Date.now()) } });
  };

  const scene: SceneState = { background: loc.background, props: [], actors: [{ id: 'milo', art: 'milo', x: 0.4, y: 0.9, scale: 1, facing: 'right', mood: 'excited', hidden: false }] };

  return (
    <View style={{ flex: 1, backgroundColor: color.paperDeep }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xl }}>
        <View style={{ backgroundColor: color.night, paddingTop: insets.top, alignItems: 'center' }}>
          <View>
            <Scene scene={scene} width={sceneW} reduced={reduced} />
            <IconButton icon="close" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} tint={color.white} size={18} style={styles.back} />
          </View>
        </View>
        <View style={{ padding: space.lg, gap: space.lg }}>
          <View style={{ gap: space.xs }}>
            <Txt style={type.title}>{loc.name}</Txt>
            <Txt style={[type.body, { color: color.inkSoft }]}>{loc.blurb}</Txt>
          </View>
          {open ? (
            <>
              <Button label={story ? `${loc.action ?? 'Explore'} (something's happening)` : (loc.action ?? 'Explore')} onPress={go} a11y={loc.action ?? 'Explore'} />
              {quiet && <Txt style={[type.body, { color: color.inkSoft, fontStyle: 'italic' }]}>{loc.quiet ?? 'Nothing happening right now.'}</Txt>}
            </>
          ) : (
            <Txt style={[type.body, { color: color.inkSoft, fontStyle: 'italic' }]}>{loc.comingSoon ? 'Not yet. Maybe Milo will lead you here someday.' : (loc.locked ?? 'Not yet.')}</Txt>
          )}
          {locals.length > 0 && (
            <Card style={{ gap: space.md }}>
              <Txt style={[type.label, { color: color.inkMuted }]}>Lexlings here</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>
                {locals.map((l) => {
                  const seen = !!save.lexlings[l.id];
                  return (
                    <View key={l.id} style={{ alignItems: 'center', gap: 4, width: 70 }}>
                      <View style={{ height: 56, justifyContent: 'flex-end', opacity: seen ? 1 : 0.15 }}><Portrait art={l.id} width={60 * (SMALL[l.id]?.scale ?? 0.8)} mood={SMALL[l.id]?.mood} /></View>
                      <Txt style={[type.small, { fontSize: 12 }]}>{seen ? l.name : '???'}</Txt>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { position: 'absolute', top: space.sm, left: space.sm, backgroundColor: 'rgba(30,43,58,0.45)' },
});
