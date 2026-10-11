import {
  advance,
  chooseEncounter,
  currentStep,
  speechPresentation,
  startEncounter,
  WRITING,
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
import { Apron, SeamFade } from '@/art/atmosphere';
import { Battle } from '@/components/Battle';
import { Inscription } from '@/components/Inscription';
import { Scene, stageLayout, type SceneAnims } from '@/components/Scene';
import { SpeechBubble, SpeechHelp } from '@/components/Speech';
import { Button, Choice, IconButton, Panel, tapFeedback, Txt, useReducedMotion } from '@/components/ui';
import { content, lineScaffold, speakerName } from '@/game/content';
import { useNow } from '@/game/useNow';
import { takeSeed, useGame } from '@/state/store';
import { color, font, radius, shadow, space, type } from '@/theme/tokens';

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
  // Room below the picture for a panel of three choices.
  const stage = stageLayout(screenW, screenH, insets.top, insets.bottom, 268);

  const [run, setRun] = useState<EncounterRun | null>(null);
  const [stepKey, setStepKey] = useState(0);
  const [replays, setReplays] = useState(0);
  const [hint, setHint] = useState<0 | 1 | 2 | 3>(0);
  const [revealed, setRevealed] = useState(false);
  const [apronH, setApronH] = useState(0);
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
    const fighter = step.actor ? run.scene.actors.find((a) => a.id === step.actor)?.art : undefined;
    return <Battle enemy={step.enemy} name={step.name} art={fighter} background={step.background ?? run.scene.background} context={encounter.id} onEnd={(result) => send({ type: 'battle', result })} />;
  }

  const looks: Record<string, string> = {};
  let speaker: string | null = null;
  let bubble: React.ReactNode = null;
  let carved: React.ReactNode = null;
  if (step?.type === 'say' && content.line.get(step.line)?.speaker === WRITING) {
    // Written words have no speaker: they appear carved, over the scene.
    carved = (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { paddingTop: stage.height * 0.15, alignItems: 'center' }]}>
        <Inscription lineId={step.line} width={stage.width - stage.crop * 2} />
      </View>
    );
  } else if (step?.type === 'say') {
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
      <View style={{ width: stage.frame, alignSelf: 'center', flex: 1 }}>
        <View style={{ paddingTop: insets.top, backgroundColor: color.night }}>
          <View style={{ height: stage.height, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', left: stage.offset, top: 0 }}>
              <Scene
                scene={run.scene}
                width={stage.width}
                crop={stage.crop}
                anims={anims}
                looks={looks}
                reduced={reduced}
                tappable={step?.type === 'tap'}
                onTap={(prop) => send({ type: 'tap', prop })}
                speaker={speaker}
                bubble={bubble}
                highlight={step?.type === 'say' && hint >= 2 ? step.look : undefined}>
                {carved}
              </Scene>
            </View>
            {/* The opening scene can't be skipped: it's where you meet Milo. */}
            {!run.done && encounter.id !== 'lodge.intro' && <IconButton icon="close" label="Leave" onPress={leave} tint={color.paper} style={styles.close} size={18} />}
          </View>
        </View>
        {/* The scene's ground carries on below the picture; the dialogue sits on it. */}
        <View style={{ flex: 1 }} onLayout={(e) => setApronH(e.nativeEvent.layout.height)}>
          <Apron id={run.scene.background} width={stage.frame} height={apronH} />
          <SeamFade id={run.scene.background} width={stage.frame} height={stage.height * 0.07} />
          <ScrollView contentContainerStyle={[styles.dock, { paddingBottom: insets.bottom + space.md }]} keyboardShouldPersistTaps="handled">
            {run.done ? <EndPanel encounterId={encounter.id} complete={run.complete} /> : step && <StepPanel step={step} send={send} hint={hint} onHelp={help} />}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

function Continue({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Continue" onPress={() => { tapFeedback(); onPress(); }} style={({ pressed }) => [styles.continue, pressed && { backgroundColor: color.amberSoft }]}>
      <Txt style={{ fontFamily: font.uiBold, fontSize: 14, color: color.inkSoft }}>Continue</Txt>
      <Txt style={{ fontFamily: font.uiBold, fontSize: 13, color: color.amberDeep }}>▶</Txt>
    </Pressable>
  );
}

function StepPanel({ step, send, hint, onHelp }: { step: Step; send: (i: EncounterInput) => void; hint: 0 | 1 | 2 | 3; onHelp: () => void }) {
  const go = () => send({ type: 'continue' });
  switch (step.type) {
    case 'narrate':
      return (
        <Pressable onPress={go} accessible={false}>
          <Panel>
            <Txt style={[type.story, styles.narration]}>{step.text}</Txt>
            <Continue onPress={go} />
          </Panel>
        </Pressable>
      );
    case 'talk': {
      const npc = content.npc.get(step.npc);
      return (
        <Pressable onPress={go} accessible={false}>
          <Panel name={npc?.name ?? step.npc} nameColor={npc?.color}>
            <Txt style={[type.body, { fontSize: 17, lineHeight: 25 }]}>{step.text}</Txt>
            <Continue onPress={go} />
          </Panel>
        </Pressable>
      );
    }
    case 'say': {
      const line = content.line.get(step.line);
      const who = step.by ? step.by.charAt(0).toUpperCase() + step.by.slice(1) : line ? speakerName(line.speaker) : '';
      return (
        <Panel name={who} nameColor={line?.speaker === 'milo' ? color.amberDeep : color.edgeDark}>
          <SpeechHelp lineId={step.line} rung={hint} onReplay={() => speakLine(step.line)} onHelp={onHelp} />
          <Continue onPress={go} />
        </Panel>
      );
    }
    case 'act':
      return step.text ? (
        <Pressable onPress={go} accessible={false}>
          <Panel>
            <Txt style={[type.story, styles.narration]}>{step.text}</Txt>
            <Continue onPress={go} />
          </Panel>
        </Pressable>
      ) : (
        <View />
      );
    case 'choice':
      return (
        <Panel>
          {step.prompt && <Txt style={[type.story, styles.narration]}>{step.prompt}</Txt>}
          <View style={{ gap: space.sm }}>
            {step.options.map((o, i) => (
              <Choice key={o.label} label={o.label} onPress={() => send({ type: 'choose', option: i })} />
            ))}
          </View>
        </Panel>
      );
    case 'tap':
      return (
        <Panel>
          <Txt style={[type.story, styles.narration]}>{step.prompt ?? 'Tap something in the scene.'}</Txt>
        </Panel>
      );
    case 'give': {
      const to = step.to === 'milo' ? 'Milo' : speakerName(step.to);
      return (
        <Panel>
          <Txt style={[type.story, styles.narration]}>{step.prompt ?? `What do you give ${to}?`}</Txt>
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
                  style={({ pressed }) => [styles.item, pressed && { backgroundColor: color.amberSoft, transform: [{ translateY: 1 }] }]}>
                  <Icon name={item?.icon ?? 'bag'} size={40} />
                  <Txt style={{ fontFamily: font.uiBold, fontSize: 13, textAlign: 'center' }}>{item?.name ?? it.item}</Txt>
                </Pressable>
              );
            })}
          </View>
        </Panel>
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
      <Panel>
        <Txt style={type.title}>Milo is coming home with you.</Txt>
        <Button label="Go to camp" onPress={home} />
      </Panel>
    );
  }
  return (
    <Panel>
      <Txt style={type.title}>{complete ? enc.title : 'Back to safety'}</Txt>
      {location?.kind === 'explore' && <Button label={complete ? 'Keep exploring' : 'Try again'} onPress={exploreAgain} />}
      {location?.kind === 'hub' && <Button label="Back to the Lodge" kind="secondary" onPress={() => router.replace({ pathname: '/place/[id]', params: { id: enc.location } })} />}
      <Button label="Back to camp" kind={location?.kind === 'explore' ? 'secondary' : 'primary'} onPress={home} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.night },
  dock: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: space.md, paddingTop: space.xl },
  close: { position: 'absolute', top: space.sm, left: space.sm, backgroundColor: 'rgba(26,34,48,0.55)' },
  narration: { color: color.inkSoft },
  continue: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: color.paperDeep, borderWidth: 1.5, borderColor: color.paperLine },
  items: { flexDirection: 'row', gap: space.md, flexWrap: 'wrap' },
  item: { width: 96, alignItems: 'center', gap: space.xs, padding: space.md, borderRadius: radius.md, backgroundColor: color.paper, borderWidth: 2, borderBottomWidth: 4, borderColor: color.edge, ...shadow.card },
});
