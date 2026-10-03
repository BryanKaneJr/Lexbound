import type { SceneState } from '@lexbound/core';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Actor, artWidth } from '@/art/Actor';
import { Background } from '@/art/backgrounds';
import { ACTOR_ART, PROP_ART } from '@/art/ids';

/**
 * A painted scene: background, props and actors placed by their content
 * coordinates (x across, y = where their feet touch the ground), plus an
 * optional speech bubble over whoever is talking. The box keeps the
 * backgrounds' 400 x 460 shape so content coordinates always line up.
 */
export const SCENE_ASPECT = 400 / 460;
const ND = Platform.OS !== 'web';

export type SceneAnims = Record<string, { name: string; key: number }>;

type Props = {
  scene: SceneState;
  width: number;
  anims?: SceneAnims;
  /** actor id -> the id of what they're looking at (turns them to face it). */
  looks?: Record<string, string>;
  /** Overrides per actor (battle moods, for instance). */
  moods?: Record<string, string>;
  tappable?: boolean;
  onTap?: (id: string) => void;
  reduced?: boolean;
  speaker?: string | null;
  bubble?: ReactNode;
  children?: ReactNode;
};

export function placementBox(art: string, x: number, y: number, scale: number, W: number, H: number) {
  const size = ACTOR_ART[art]?.height ?? PROP_ART[art]?.height ?? 0.15;
  const h = size * H * scale;
  const w = artWidth(art, h);
  return { left: x * W - w / 2, top: y * H - h, width: w, height: h };
}

function Placed({ left, top, children }: { left: number; top: number; children: ReactNode }) {
  const [pos] = useState(() => new Animated.ValueXY({ x: left, y: top }));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      pos.setValue({ x: left, y: top });
      return;
    }
    const a = Animated.timing(pos, { toValue: { x: left, y: top }, duration: 650, useNativeDriver: ND });
    a.start();
    return () => a.stop();
  }, [left, top, pos]);
  return <Animated.View style={{ position: 'absolute', left: 0, top: 0, transform: pos.getTranslateTransform() }}>{children}</Animated.View>;
}

export function Scene({ scene, width, anims = {}, looks = {}, moods = {}, tappable, onTap, reduced, speaker, bubble, children }: Props) {
  const W = width;
  const H = width / SCENE_ASPECT;
  const [bubbleSize, setBubbleSize] = useState({ w: 0, h: 0 });
  const everyone = [...scene.props, ...scene.actors];
  const xOf = (id: string) => everyone.find((p) => p.id === id)?.x;

  const speakerPlacement = speaker ? scene.actors.find((a) => a.id === speaker) : undefined;
  let bubbleStyle: { left: number; top: number } | undefined;
  if (speakerPlacement) {
    const box = placementBox(speakerPlacement.art, speakerPlacement.x, speakerPlacement.y, speakerPlacement.scale, W, H);
    const left = Math.max(8, Math.min(W - bubbleSize.w - 8, speakerPlacement.x * W - bubbleSize.w / 2));
    let top = box.top - bubbleSize.h - 6;
    if (top < 6) top = Math.min(H - bubbleSize.h - 6, box.top + box.height + 6);
    bubbleStyle = { left, top };
  }

  return (
    <View style={{ width: W, height: H, overflow: 'hidden' }}>
      <View style={StyleSheet.absoluteFill}>
        <Background id={scene.background} width={W} height={H} />
      </View>
      {scene.props.map((p) => {
        if (p.hidden) return null;
        const box = placementBox(p.art, p.x, p.y, p.scale, W, H);
        const a = anims[p.id];
        return (
          <Placed key={p.id} left={box.left} top={box.top}>
            <Actor art={p.art} height={box.height} facing={p.facing} anim={a?.name} animKey={a?.key} reduced={reduced} onPress={tappable && onTap ? () => onTap(p.id) : undefined} label={p.art.replace(/_/g, ' ')} />
          </Placed>
        );
      })}
      {scene.actors.map((p) => {
        const box = placementBox(p.art, p.x, p.y, p.scale, W, H);
        const a = anims[p.id];
        const target = looks[p.id];
        const tx = target ? xOf(target) : undefined;
        const facing = tx === undefined ? p.facing : tx >= p.x ? 'right' : 'left';
        return (
          <Placed key={p.id} left={box.left} top={box.top}>
            <Actor
              art={p.art}
              height={box.height}
              mood={moods[p.id] ?? p.mood}
              facing={facing}
              anim={a?.name}
              animKey={a?.key}
              reduced={reduced}
              hidden={p.hidden}
              onPress={tappable && onTap ? () => onTap(p.id) : undefined}
              label={p.id}
            />
          </Placed>
        );
      })}
      {children}
      {bubble && bubbleStyle && (
        <View
          style={[styles.bubbleWrap, { left: bubbleStyle.left, top: bubbleStyle.top, maxWidth: W * 0.78, opacity: bubbleSize.w ? 1 : 0 }]}
          onLayout={(e) => {
            const { width: w, height: h } = e.nativeEvent.layout;
            if (Math.abs(w - bubbleSize.w) > 1 || Math.abs(h - bubbleSize.h) > 1) setBubbleSize({ w, h });
          }}>
          {bubble}
        </View>
      )}
    </View>
  );
}

/** A tappable stand-in for the whole scene (for "tap to continue"). */
export function SceneTapCatcher({ onPress, label }: { onPress: () => void; label: string }) {
  return <Pressable style={StyleSheet.absoluteFill} onPress={onPress} accessibilityLabel={label} accessibilityRole="button" />;
}

const styles = StyleSheet.create({
  bubbleWrap: { position: 'absolute' },
});
