import {
  advance,
  chooseEncounter,
  currentStep,
  speechPresentation,
  startEncounter,
  type EncounterInput,
  type EncounterRun,
  type Step,
} from '@lexbound/core';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/art/icons';
import { speakLine, stopVoice } from '@/audio/voice';
import { Battle } from '@/components/Battle';
import { Scene, SCENE_ASPECT, type SceneAnims } from '@/components/Scene';
import { SpeechBubble, SpeechHelp } from '@/components/Speech';
import { Button, IconButton, tapFeedback, Txt, useReducedMotion } from '@/components/ui';
import { content, lineScaffold, speakerName } from '@/game/content';
import { useNow } from '@/game/useNow';
import { takeSeed, useGame } from '@/state/store';
import { color, radius, shadow, space, type } from '@/theme/tokens';

/**
 * The encounter player. It renders whatever step the encounter engine is on
 * and sends the player's input back; it knows nothing about any particular
 * encounter. A new encounter is a new JSON entry, never a change here
 * (bible Phase 6).
 */
export default function PlayRoute() {
  const { id, n } = useLocalSearchParams<{ id: string; n?: string }>();
  return <Play key={`${id}:${n ?? ''}`} encounterId={id} />;
}

function Play({ encounterId }: { encounterId: string }) {
  const encounter = content.encounter.get(encounterId);
  const dispatch = useGame((s) => s.dispatch);
  const save = useGame((s) => s.save);
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const sceneW = Math.min(screenW, screenH * 0.58 * SCENE_ASPECT, 520);

  const [run, setRun] = useState<EncounterRun | null>(null);
  const [stepKey, setStepKey] = useState(0);
  const [replays, setReplays] = useState(0);
  const [hint, setHint] = useState<0 | 1 | 2 | 3>(0);
  const [revealed, setRevealed] = useState(false);
  const started = useRef(false);
  const now = useNow();

  useEffect(() => {
    if (started.current || !encounter) return;
    started.current = true;
    const r = startEncounter(content, encounter.id, useGame.getState().save);
    useGame.getState().dispatch(r.events);
    setRun(r.run);
  }, [encounter]);

  useEffect(() => () => stopVoice(), []);

  const step = run ? currentStep(content, run) : undefined;

  // Each new creature line is spoken aloud as it appears.
  useEffect(() => {
    if (step?.type === 'say') speakLine(step.line);
    // stepKey changes on every advance, even back to the same step.
  }, [stepKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // The current step's animation, replayed when the player asks to hear a line again.
  const anims: SceneAnims = {};
  if (step?.type === 'say') {
    const who = step.by ?? content.line.get(step.line)?.speaker;
    if (who) anims[who] = { name: step.anim ?? 'hop', key: stepKey * 1000 + replays };
  } else if (step?.type === 'act') {
    anims[step.actor] = { name: step.anim, key: stepKey * 1000 };
  }

  const send = useCallback(
    (input: EncounterInput) => {
      if (!run) return;
      const r = advance(content, run, input, useGame.getState().save);
      if (r.run === run) return;
      dispatch(r.events);
      setRun(r.run);
      setStepKey((k) => k + 1);
      setHint(0);
      setRevealed(false);
      setReplays(0);
    },
    [run, dispatch],
  );

  // Silent actions (no caption) move on by themselves once they've played.
  useEffect(() => {
    if (step?.type !== 'act' || step.text) return;
    const t = setTimeout(() => send({ type: 'continue' }), reduced ? 300 : 1000);
    return () => clearTimeout(t);
  }, [stepKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!encounter) {
    return (
      <View style={[styles.fill, { padding: space.xl, paddingTop: insets.top + space.xl }]}>
        <Txt style={type.heading}>That path seems to have vanished.</Txt>
        <Button label="Back" onPress={() => router.back()} />
      </View>
    );
  }
  if (!run) return <View style={styles.fill} />;

  if (step?.type === 'battle') {
    return <Battle enemy={step.enemy} background={step.background ?? run.scene.background} context={encounter.id} onEnd={(result) => send({ type: 'battle', result })} />;
  }

  const looks: Record<string, string> = {};
  let speaker: string | null = null;
  let bubble: React.ReactNode = null;
  if (step?.type === 'say') {
    const line = content.line.get(step.line);
    speaker = step.by ?? line?.speaker ?? null;
    if (speaker && step.look) looks[speaker] = step.look;
    const level = lineScaffold(save.concepts, step.line, now);
    const look = speechPresentation(level, save.settings);
    bubble = <SpeechBubble lineId={step.line} icons={look.icons || save.settings.persistentIcons} audioFirst={!look.textFirst && !revealed} onReveal={() => setRevealed(true)} />;
  } else if (step?.type === 'act' && step.look) {
    looks[step.actor] = step.look;
  }

  const help = () => {
    if (step?.type !== 'say') return;
    const line = content.line.get(step.line);
    const rung = (save.settings.strongHints && hint === 0 ? 2 : Math.min(3, hint + 1)) as 1 | 2 | 3;
    setHint(rung);
    if (rung === 1) {
      speakLine(step.line, { slow: true });
      setReplays((n) => n + 1);
    }
    if (line?.concepts.length) dispatch([{ type: 'hint', concepts: line.concepts, rung }]);
  };

  const leave = () => {
    stopVoice();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={styles.fill}>
      <View style={{ paddingTop: insets.top, alignItems: 'center', backgroundColor: color.night }}>
        <View>
          <Scene
            scene={run.scene}
            width={sceneW}
            anims={anims}
            looks={looks}
            reduced={reduced}
            tappable={step?.type === 'tap'}
            onTap={(prop) => send({ type: 'tap', prop })}
            speaker={speaker}
            bubble={bubble}
            highlight={step?.type === 'say' && hint >= 2 ? step.look : undefined}
          />
          {/* The opening scene can't be skipped: it's where you meet Milo. */}
          {!run.done && encounter.id !== 'lodge.intro' && <IconButton icon="close" label="Leave" onPress={leave} tint={color.paper} style={styles.close} size={18} />}
        </View>
      </View>
      <View style={[styles.panel, { paddingBottom: insets.bottom + space.md }]}>
        <ScrollView contentContainerStyle={{ gap: space.md, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {run.done ? <EndPanel encounterId={encounter.id} complete={run.complete} /> : step && <StepPanel step={step} send={send} hint={hint} onHelp={help} />}
        </ScrollView>
      </View>
    </View>
  );
}

function Continue({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Continue" onPress={() => { tapFeedback(); onPress(); }} style={styles.continue}>
      <Txt style={[type.small, { color: color.inkSoft }]}>Continue</Txt>
      <Txt style={{ fontSize: 16, color: color.amberDeep, fontWeight: '900' }}>▶</Txt>
    </Pressable>
  );
}

function StepPanel({ step, send, hint, onHelp }: { step: Step; send: (i: EncounterInput) => void; hint: 0 | 1 | 2 | 3; onHelp: () => void }) {
  const go = () => send({ type: 'continue' });
  switch (step.type) {
    case 'narrate':
      return (
        <Pressable onPress={go} style={{ gap: space.md }} accessible={false}>
          <Txt style={[type.body, styles.narration]}>{step.text}</Txt>
          <Continue onPress={go} />
        </Pressable>
      );
    case 'talk': {
      const npc = content.npc.get(step.npc);
      return (
        <Pressable onPress={go} style={{ gap: space.sm }} accessible={false}>
          <View style={[styles.nameTag, { backgroundColor: npc?.color ?? color.inkSoft }]}>
            <Txt style={[type.small, { color: color.white }]}>{npc?.name ?? step.npc}</Txt>
          </View>
          <Txt style={type.body}>{step.text}</Txt>
          <Continue onPress={go} />
        </Pressable>
      );
    }
    case 'say': {
      const line = content.line.get(step.line);
      return (
        <View style={{ gap: space.md }}>
          <Txt style={[type.label, { color: color.inkMuted }]}>{step.by ? step.by.charAt(0).toUpperCase() + step.by.slice(1) : line ? speakerName(line.speaker) : ''}</Txt>
          <SpeechHelp lineId={step.line} rung={hint} onReplay={() => speakLine(step.line)} onHelp={onHelp} />
          <Continue onPress={go} />
        </View>
      );
    }
    case 'act':
      return step.text ? (
        <Pressable onPress={go} style={{ gap: space.md }} accessible={false}>
          <Txt style={[type.body, styles.narration]}>{step.text}</Txt>
          <Continue onPress={go} />
        </Pressable>
      ) : (
        <View />
      );
    case 'choice':
      return (
        <View style={{ gap: space.sm }}>
          {step.prompt && <Txt style={[type.body, styles.narration]}>{step.prompt}</Txt>}
          {step.options.map((o, i) => (
            <Button key={o.label} label={o.label} kind="secondary" onPress={() => send({ type: 'choose', option: i })} />
          ))}
        </View>
      );
    case 'tap':
      return (
        <View style={{ gap: space.sm }}>
          <Txt style={[type.body, styles.narration]}>{step.prompt ?? 'Tap something in the scene.'}</Txt>
        </View>
      );
    case 'give': {
      const to = step.to === 'milo' ? 'Milo' : speakerName(step.to);
      return (
        <View style={{ gap: space.sm }}>
          <Txt style={[type.body, styles.narration]}>{step.prompt ?? `What do you give ${to}?`}</Txt>
          <View style={styles.items}>
            {step.items.map((it) => {
              const item = content.item.get(it.item);
              return (
                <Pressable
                  key={it.item}
                  accessibilityRole="button"
                  accessibilityLabel={`Give ${item?.name ?? it.item}`}
                  onPress={() => {
                    tapFeedback();
                    send({ type: 'give', item: it.item });
                  }}
                  style={({ pressed }) => [styles.item, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
                  <Icon name={item?.icon ?? 'bag'} size={40} />
                  <Txt style={[type.small, { textAlign: 'center' }]}>{item?.name ?? it.item}</Txt>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }
    default:
      return null;
  }
}

function EndPanel({ encounterId, complete }: { encounterId: string; complete: boolean }) {
  const enc = content.encounter.get(encounterId)!;
  const location = content.location.get(enc.location);
  const exploreAgain = () => {
    const save = useGame.getState().save;
    const pick = chooseEncounter(content, save, enc.location, Date.now(), takeSeed());
    if (pick.encounter) router.replace({ pathname: '/play/[id]', params: { id: pick.encounter.id, n: String(Date.now()) } });
    else router.replace({ pathname: '/place/[id]', params: { id: enc.location } });
  };
  const home = () => router.replace('/');
  if (encounterId === 'lodge.intro') {
    return (
      <View style={{ gap: space.md }}>
        <Txt style={type.heading}>Milo is coming home with you.</Txt>
        <Button label="Go to camp" onPress={home} />
      </View>
    );
  }
  return (
    <View style={{ gap: space.sm }}>
      <Txt style={[type.heading, { marginBottom: space.xs }]}>{complete ? enc.title : 'Back to safety'}</Txt>
      {location?.kind === 'explore' && <Button label={complete ? 'Keep exploring' : 'Try again'} onPress={exploreAgain} />}
      {location?.kind === 'hub' && <Button label="Back to the Lodge" kind="secondary" onPress={() => router.replace({ pathname: '/place/[id]', params: { id: enc.location } })} />}
      <Button label="Back to camp" kind={location?.kind === 'explore' ? 'secondary' : 'primary'} onPress={home} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.paperDeep },
  panel: { flex: 1, backgroundColor: color.paperDeep, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.lg, marginTop: -space.lg },
  close: { position: 'absolute', top: space.sm, left: space.sm, backgroundColor: 'rgba(30,43,58,0.45)' },
  narration: { color: color.inkSoft, fontStyle: 'italic' },
  nameTag: { alignSelf: 'flex-start', paddingHorizontal: space.md, paddingVertical: 4, borderRadius: radius.pill },
  continue: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: color.paper, borderWidth: 1, borderColor: color.paperLine },
  items: { flexDirection: 'row', gap: space.md, flexWrap: 'wrap' },
  item: { width: 96, alignItems: 'center', gap: space.xs, padding: space.md, borderRadius: radius.lg, backgroundColor: color.paper, borderWidth: 2, borderColor: color.paperLine, ...shadow.card },
});
