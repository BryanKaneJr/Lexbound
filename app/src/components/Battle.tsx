import {
  battleHint,
  chooseCommand,
  miloLevel,
  miloMaxHp,
  startBattle,
  tilePresentation,
  type Beat,
  type BattleState,
  type SceneState,
} from '@lexbound/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/art/icons';
import { ELEMENT_SFX, playSfx } from '@/audio/sfx';
import { speakLine } from '@/audio/voice';
import { content, conceptLevel, elementColor, wordFor } from '@/game/content';
import { useNow } from '@/game/useNow';
import { takeSeed, useGame } from '@/state/store';
import { color, radius, shadow, space, type } from '@/theme/tokens';
import { placementBox, Scene, SCENE_ASPECT, type SceneAnims } from './Scene';
import { SpeechBubble } from './Speech';
import { Bar, Button, tapFeedback, Txt, useReducedMotion } from './ui';

/**
 * A battle (bible §11-18). The enemy announces its move in the creature
 * language with a visible wind-up; the player taps a command tile; Milo
 * acts; the world shows what happened. Tiles reshuffle every round, and each
 * word's icon fades as the player learns it.
 */
const ND = Platform.OS !== 'web';
const MILO = { x: 0.27, y: 0.9 };
const FOE = { x: 0.73, y: 0.84 };

type Fx = { key: number; element: string | null; from: 'milo' | 'foe'; kind: 'shot' | 'steam' };
type Popup = { key: number; target: 'milo' | 'foe'; text: string; tint: string; big: boolean };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function readTime(lineId: string): number {
  const text = content.line.get(lineId)?.text ?? '';
  return 1100 + text.length * 35;
}

export function Battle({ enemy, background, context, onEnd }: { enemy: string; background: string; context: string; onEnd: (result: 'win' | 'lose') => void }) {
  const save = useGame((s) => s.save);
  const dispatch = useGame((s) => s.dispatch);
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const sceneW = Math.min(screenW, (screenH * 0.56) * SCENE_ASPECT, 520);
  const sceneH = sceneW / SCENE_ASPECT;

  const [state, setState] = useState<BattleState | null>(null);
  const [busy, setBusy] = useState(true);
  const [bubble, setBubble] = useState<{ speaker: string; line: string } | null>(null);
  const [anims, setAnims] = useState<SceneAnims>({});
  const [moods, setMoods] = useState<Record<string, string>>({ milo: 'fierce', [enemy]: 'angry' });
  const [hp, setHp] = useState({ milo: 1, miloMax: 1, foe: 1, foeMax: 1 });
  const [fx, setFx] = useState<Fx | null>(null);
  const [windup, setWindup] = useState<string | null>(null);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [hint, setHint] = useState<0 | 1 | 2 | 3>(0);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [lastTelegraph, setLastTelegraph] = useState<string | null>(null);
  const [shake] = useState(() => new Animated.Value(0));
  const alive = useRef(true);
  const keys = useRef(0);
  const started = useRef(false);
  const hpRef = useRef({ milo: 1, foe: 1 });
  const now = useNow();

  const animate = useCallback((id: string, name: string) => setAnims((a) => ({ ...a, [id]: { name, key: ++keys.current } })), []);
  const pop = useCallback((target: 'milo' | 'foe', text: string, tint: string, big = false) => {
    const key = ++keys.current;
    setPopups((p) => [...p, { key, target, text, tint, big }]);
    setTimeout(() => alive.current && setPopups((p) => p.filter((x) => x.key !== key)), 1100);
  }, []);
  const quake = useCallback(() => {
    if (reduced) return;
    Animated.sequence([0, 1, 2, 3].map((i) => Animated.timing(shake, { toValue: i % 2 ? -7 : 7, duration: 45, useNativeDriver: ND })).concat(Animated.timing(shake, { toValue: 0, duration: 45, useNativeDriver: ND }))).start();
  }, [reduced, shake]);

  const play = useCallback(
    async (beats: Beat[], next: BattleState) => {
      setBusy(true);
      let miloHp = hpRef.current.milo;
      let foeHp = hpRef.current.foe;
      for (const b of beats) {
        if (!alive.current) return;
        switch (b.type) {
          case 'say':
            setBubble({ speaker: b.speaker, line: b.line });
            speakLine(b.line);
            if (b.speaker === enemy && content.lexling.get(enemy)?.battle?.moves.some((m) => m.telegraph === b.line)) setLastTelegraph(b.line);
            animate(b.speaker, b.speaker === 'milo' ? 'hop' : 'stomp');
            await wait(readTime(b.line));
            break;
          case 'windup':
            setWindup(b.windup);
            animate(enemy, b.windup === 'paw' ? 'stomp' : 'crouch');
            await wait(650);
            break;
          case 'command':
            setBubble(null);
            animate('milo', 'attack');
            setMoods((m) => ({ ...m, milo: 'fierce' }));
            playSfx(ELEMENT_SFX[b.element ?? ''] ?? 'hit');
            setFx({ key: ++keys.current, element: b.element, from: 'milo', kind: 'shot' });
            await wait(reduced ? 200 : 560);
            break;
          case 'hit':
            if (b.target === 'foe') {
              if (b.effect === 'absorbed') {
                animate(enemy, 'glow');
                setMoods((m) => ({ ...m, [enemy]: 'happy', milo: 'confused' }));
              } else {
                foeHp = Math.max(0, foeHp - b.amount);
                setHp((h) => ({ ...h, foe: foeHp }));
                animate(enemy, 'recoil');
                if (b.effect === 'strong') {
                  quake();
                  setMoods((m) => ({ ...m, [enemy]: 'hurt', milo: 'excited' }));
                } else if (b.effect === 'weak') setMoods((m) => ({ ...m, milo: 'confused' }));
                pop('foe', `-${b.amount}`, b.effect === 'strong' ? color.danger : color.ink, b.effect === 'strong');
                playSfx('hit');
              }
            } else {
              miloHp = Math.max(0, miloHp - b.amount);
              setHp((h) => ({ ...h, milo: miloHp }));
              animate('milo', 'recoil');
              setMoods((m) => ({ ...m, milo: 'hurt' }));
              pop('milo', `-${b.amount}`, color.danger);
              playSfx('hit');
            }
            await wait(520);
            break;
          case 'heal':
            if (b.target === 'foe') {
              foeHp = foeHp + b.amount;
              setHp((h) => ({ ...h, foe: foeHp }));
            }
            pop(b.target, `+${b.amount}`, color.leaf);
            playSfx('heal');
            await wait(450);
            break;
          case 'fanned':
            setMoods((m) => ({ ...m, [enemy]: 'blazing', milo: 'scared' }));
            animate(enemy, 'blaze');
            playSfx('fire');
            await wait(600);
            break;
          case 'countered':
            setWindup(null);
            setFx({ key: ++keys.current, element: null, from: 'foe', kind: 'steam' });
            playSfx('steam');
            await wait(650);
            break;
          case 'foeMove':
            setBubble(null);
            setWindup(null);
            animate(enemy, 'lunge');
            if (b.element) {
              setFx({ key: ++keys.current, element: b.element, from: 'foe', kind: 'shot' });
              playSfx(ELEMENT_SFX[b.element] ?? 'hit');
            }
            await wait(reduced ? 200 : 480);
            setMoods((m) => ({ ...m, [enemy]: 'angry' }));
            break;
          case 'end':
            setResult(b.result);
            setWindup(null);
            setMoods((m) => ({ ...m, milo: b.result === 'win' ? 'proud' : 'tired', [enemy]: b.result === 'win' ? 'hurt' : 'happy' }));
            if (b.result === 'lose') animate('milo', 'slump');
            playSfx(b.result === 'win' ? 'victory' : 'defeat');
            break;
        }
      }
      if (!alive.current) return;
      hpRef.current = { milo: next.milo.hp, foe: next.foe.hp };
      setState(next);
      setHint(0);
      if (next.outcome === 'ongoing') {
        setMoods((m) => ({ ...m, milo: miloHp < next.milo.maxHp * 0.35 ? 'tired' : 'fierce' }));
      }
      setBusy(false);
    },
    [animate, enemy, pop, quake, reduced],
  );

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const s = useGame.getState().save;
    const level = miloLevel(s);
    const maxHp = miloMaxHp(content, level);
    const r = startBattle(content, enemy, { level, maxHp, context, seed: takeSeed() });
    useGame.getState().dispatch(r.events);
    setHp({ milo: r.state.milo.hp, miloMax: r.state.milo.maxHp, foe: r.state.foe.hp, foeMax: r.state.foe.maxHp });
    hpRef.current = { milo: r.state.milo.hp, foe: r.state.foe.hp };
    void play(r.beats, r.state);
    // The battle starts once.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (commandId: string) => {
    if (!state || busy) return;
    tapFeedback();
    const r = chooseCommand(content, state, commandId);
    dispatch(r.events);
    void play(r.beats, r.state);
  };

  const askHint = () => {
    if (!state || busy || hint >= 3) return;
    const strong = save.settings.strongHints && hint === 0;
    const rung = (strong ? 2 : hint + 1) as 1 | 2 | 3;
    const h = battleHint(content, state, rung);
    dispatch(h.events);
    setHint(rung);
    if (rung === 1) animate('milo', 'look');
  };

  const sceneState: SceneState = {
    background,
    props: [],
    actors: [
      { id: 'milo', art: 'milo', x: MILO.x, y: MILO.y, scale: 1, facing: 'right', hidden: false },
      { id: enemy, art: enemy, x: FOE.x, y: FOE.y, scale: 1, facing: 'left', hidden: false },
    ],
  };
  const foeName = content.lexling.get(enemy)?.name ?? enemy;
  const foeBox = placementBox(enemy, FOE.x, FOE.y, 1, sceneW, sceneH);
  const miloBox = placementBox('milo', MILO.x, MILO.y, 1, sceneW, sceneH);
  const centre = (box: typeof foeBox) => ({ x: box.left + box.width / 2, y: box.top + box.height * 0.5 });

  return (
    <View style={{ flex: 1, backgroundColor: color.night }}>
      <View style={{ paddingTop: insets.top, alignItems: 'center' }}>
        <Animated.View style={{ transform: [{ translateX: shake }] }}>
          <Scene
            scene={sceneState}
            width={sceneW}
            anims={anims}
            moods={moods}
            reduced={reduced}
            speaker={bubble?.speaker === 'milo' ? 'milo' : bubble ? enemy : null}
            bubble={bubble ? <SpeechBubble lineId={bubble.line} icons={false} audioFirst={false} /> : null}>
            {windup === 'embers' && <Embers at={{ x: foeBox.left + foeBox.width * 0.06, y: foeBox.top + foeBox.height * 0.72 }} reduced={reduced} />}
            {windup === 'paw' && <Dust at={{ x: foeBox.left + foeBox.width * 0.5, y: foeBox.top + foeBox.height }} reduced={reduced} />}
            {fx && (
              <Shot
                key={fx.key}
                fx={fx}
                from={fx.from === 'milo' ? centre(miloBox) : { x: foeBox.left + foeBox.width * 0.15, y: foeBox.top + foeBox.height * 0.6 }}
                to={fx.from === 'milo' ? centre(foeBox) : centre(miloBox)}
                reduced={reduced}
              />
            )}
            {popups.map((p) => (
              <DamagePop key={p.key} popup={p} at={centre(p.target === 'milo' ? miloBox : foeBox)} reduced={reduced} />
            ))}
            <View style={[styles.hpCard, { right: space.sm, top: space.sm }]}>
              <Txt style={styles.hpName}>{foeName}</Txt>
              <Bar value={hp.foe} max={hp.foeMax} tint={hpTint(hp.foe, hp.foeMax)} />
            </View>
            <View style={[styles.hpCard, { left: space.sm, bottom: space.sm }]}>
              <Txt style={styles.hpName}>Milo · Lv {state?.milo.level ?? miloLevel(save)}</Txt>
              <Bar value={hp.milo} max={hp.miloMax} tint={hpTint(hp.milo, hp.miloMax)} />
              <Txt style={styles.hpNum}>
                {hp.milo} / {hp.miloMax}
              </Txt>
            </View>
          </Scene>
        </Animated.View>
      </View>

      <View style={[styles.panel, { paddingBottom: insets.bottom + space.md }]}>
        {result ? (
          <View style={{ gap: space.md }}>
            <Txt style={[type.title, { textAlign: 'center' }]}>{result === 'win' ? `The ${foeName} backs off!` : 'Milo is worn out.'}</Txt>
            <Txt style={[type.body, { textAlign: 'center', color: color.inkSoft }]}>
              {result === 'win' ? `+${content.lexling.get(enemy)?.battle?.xp ?? 0} XP` : 'No harm done. You can always try again.'}
            </Txt>
            <Button label="Continue" onPress={() => onEnd(result)} />
          </View>
        ) : (
          <>
            <View style={styles.panelHead}>
              <Txt style={[type.label, { color: color.inkMuted }]}>{busy ? ' ' : 'Your call'}</Txt>
              <View style={{ flexDirection: 'row', gap: space.sm }}>
                {lastTelegraph && (
                  <Pressable accessibilityRole="button" accessibilityLabel="Hear it again" onPress={() => speakLine(lastTelegraph)} style={styles.chip}>
                    <Icon name="speaker" size={16} color={color.inkSoft} />
                  </Pressable>
                )}
                {hint < 3 && (
                  <Pressable accessibilityRole="button" accessibilityLabel="Help" onPress={askHint} disabled={busy} style={[styles.chip, busy && { opacity: 0.4 }]}>
                    <Icon name="question" size={16} color={color.inkSoft} />
                    <Txt style={[type.small, { color: color.inkSoft }]}>Help</Txt>
                  </Pressable>
                )}
              </View>
            </View>
            {hint >= 1 && <Txt style={[type.body, { fontStyle: 'italic', color: color.inkSoft, marginBottom: space.sm }]}>{content.lexling.get(enemy)?.battle?.clue}</Txt>}
            <View style={styles.tiles}>
              {(state?.order ?? content.milo.commands.map((c) => c.id)).map((id) => {
                const cmd = content.milo.commands.find((c) => c.id === id)!;
                const ability = content.ability.get(cmd.ability);
                const concept = cmd.concepts[0]!;
                const level = Math.max(...cmd.concepts.map((c) => conceptLevel(save.concepts, c, now))) as 0 | 1 | 2 | 3;
                const look = tilePresentation(level, save.settings);
                const icons = look.icon || hint >= 2;
                const tint = look.tint || hint >= 2;
                const el = ability?.element ?? null;
                const words = cmd.concepts.map(wordFor).join(' ').toUpperCase();
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityLabel={words}
                    disabled={busy || !state}
                    onPress={() => choose(id)}
                    style={({ pressed }) => [
                      styles.tile,
                      tint && { backgroundColor: elementColor(el) + '22', borderColor: elementColor(el) },
                      { opacity: busy ? 0.55 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
                    ]}>
                    {icons && content.concept.get(concept)?.icon && <Icon name={content.concept.get(concept)!.icon!} size={26} />}
                    <View style={{ alignItems: 'center' }}>
                      <Txt style={type.tile}>{words}</Txt>
                      {hint >= 3 && <Txt style={[type.small, { color: color.inkSoft }]}>{cmd.concepts.map((c) => content.concept.get(c)?.gloss).join(' ')}</Txt>}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function hpTint(v: number, max: number) {
  const p = v / max;
  return p > 0.5 ? color.hp : p > 0.25 ? color.hpLow : color.hpCrit;
}

/** A blob of element flying from one side to the other, or a puff of steam where fire was put out. */
function Shot({ fx, from, to, reduced }: { fx: Fx; from: { x: number; y: number }; to: { x: number; y: number }; reduced: boolean }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const a = Animated.timing(t, { toValue: 1, duration: reduced ? 1 : fx.kind === 'steam' ? 700 : 480, easing: Easing.out(Easing.quad), useNativeDriver: ND });
    a.start();
    return () => a.stop();
  }, [t, reduced, fx.kind]);
  if (fx.kind === 'steam') {
    return (
      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: to.x - 40, top: from.y - 60, opacity: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] }), transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [10, -30] }) }, { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) }] }}>
        <View style={{ flexDirection: 'row' }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEF3F6', marginLeft: -6, marginTop: i === 1 ? -10 : 0 }} />
          ))}
        </View>
      </Animated.View>
    );
  }
  const c = elementColor(fx.element);
  const size = fx.element ? 46 : 30;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: from.x - size / 2,
        top: from.y - size / 2,
        opacity: t.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, to.x - from.x] }) },
          { translateY: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -30, to.y - from.y] }) },
          { scale: t.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0.6, 1.1, 1.8] }) },
        ],
      }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c + 'CC', alignItems: 'center', justifyContent: 'center', ...shadow.lift }}>
        {fx.element && <Icon name={fx.element} size={size * 0.7} color="#fff" />}
      </View>
    </Animated.View>
  );
}

function Embers({ at, reduced }: { at: { x: number; y: number }; reduced: boolean }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) return;
    const a = Animated.loop(Animated.sequence([Animated.timing(t, { toValue: 1, duration: 380, useNativeDriver: ND }), Animated.timing(t, { toValue: 0, duration: 380, useNativeDriver: ND })]));
    a.start();
    return () => a.stop();
  }, [t, reduced]);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: at.x - 15, top: at.y - 15, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFB347', opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.95] }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.25] }) }] }}>
      <View style={{ position: 'absolute', left: 8, top: 8, width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFE89A' }} />
    </Animated.View>
  );
}

function Dust({ at, reduced }: { at: { x: number; y: number }; reduced: boolean }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) return;
    const a = Animated.loop(Animated.timing(t, { toValue: 1, duration: 600, useNativeDriver: ND }));
    a.start();
    return () => a.stop();
  }, [t, reduced]);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: at.x - 40, top: at.y - 20, flexDirection: 'row', gap: 16 }}>
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#C9B48F', opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }), transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -14 - i * 4] }) }] }} />
      ))}
    </View>
  );
}

function DamagePop({ popup, at, reduced }: { popup: Popup; at: { x: number; y: number }; reduced: boolean }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: reduced ? 1 : 1000, easing: Easing.out(Easing.quad), useNativeDriver: ND }).start();
  }, [t, reduced]);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: at.x - 40, top: at.y - 50, width: 80, alignItems: 'center', opacity: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }), transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }, { scale: popup.big ? 1.4 : 1 }] }}>
      <Txt style={{ fontSize: 26, fontWeight: '900', color: popup.tint, textShadowColor: '#fff', textShadowRadius: 6 }}>{popup.text}</Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hpCard: { position: 'absolute', width: 150, backgroundColor: 'rgba(251,245,234,0.92)', borderRadius: radius.md, padding: space.sm, gap: 4, ...shadow.card },
  hpName: { ...type.small, fontWeight: '800' },
  hpNum: { ...type.small, fontSize: 11, color: color.inkSoft, textAlign: 'right' },
  panel: { flex: 1, backgroundColor: color.paperDeep, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.lg, marginTop: -space.lg },
  panelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: color.paper, borderWidth: 1, borderColor: color.paperLine },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    flexBasis: '46%',
    flexGrow: 1,
    minHeight: 72,
    borderRadius: radius.lg,
    backgroundColor: color.paper,
    borderWidth: 2.5,
    borderColor: color.paperLine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    ...shadow.card,
  },
});
