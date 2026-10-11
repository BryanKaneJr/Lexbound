import {
  battleHint,
  chooseCommand,
  commandSentence,
  knownVerbs,
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
import { speakCall, speakLine } from '@/audio/voice';
import { content, conceptLevel, elementColor, lineScaffold, wordFor } from '@/game/content';
import { useNow } from '@/game/useNow';
import { takeSeed, useGame } from '@/state/store';
import { color, font, radius, shadow, space, type } from '@/theme/tokens';
import { Apron, SeamFade } from '@/art/atmosphere';
import { placementBox, Scene, stageLayout, type SceneAnims } from './Scene';
import { SpeechBubble } from './Speech';
import { Bar, Button, Panel, tapFeedback, Txt, useReducedMotion } from './ui';

/**
 * A battle (bible §11-18). The enemy announces its move in the creature
 * language with a visible wind-up; the player taps a command tile; Milo
 * acts; the world shows what happened. Tiles reshuffle every round, and each
 * word's icon fades as the player learns it.
 *
 * Once Milo knows verbs (Phase 9), a row of them sits above the tiles: pick
 * one and the tiles finish the sentence ("DIFENDI" + "CON L'ACQUA"). With no
 * verb picked, a tile is a plain one-word attack, as in Chapter One.
 */
const ND = Platform.OS !== 'web';
const MILO = { x: 0.27, y: 0.9 };
const FOE = { x: 0.73, y: 0.84 };

type Fx = { key: number; element: string | null; from: 'milo' | 'foe'; kind: 'shot' | 'steam' | 'wall'; big?: boolean };
type Popup = { key: number; target: 'milo' | 'foe'; text: string; tint: string; big: boolean };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function readTime(lineId: string): number {
  const text = content.line.get(lineId)?.text ?? '';
  return 1100 + text.length * 35;
}

type BattleProps = {
  enemy: string;
  background: string;
  context: string;
  /** A name for this one opponent ("Bluster"). */
  name?: string;
  /** Art for the opponent, when it isn't the species' own. */
  art?: string;
  onEnd: (result: 'win' | 'lose') => void;
};

export function Battle({ enemy, background, context, name, art, onEnd }: BattleProps) {
  const save = useGame((s) => s.save);
  const dispatch = useGame((s) => s.dispatch);
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  // Room below the picture for the verb row and four tiles.
  const stage = stageLayout(screenW, screenH, insets.top, insets.bottom, 318);
  const sceneW = stage.width;
  const sceneH = stage.height;
  const [apronH, setApronH] = useState(0);

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
  const [verb, setVerb] = useState<string | null>(null);
  const [call, setCall] = useState<{ key: number; text: string } | null>(null);
  const [shield, setShield] = useState<{ key: number; element: string | null; hit: number; broken: boolean } | null>(null);
  const [shake] = useState(() => new Animated.Value(0));
  const alive = useRef(true);
  const keys = useRef(0);
  const started = useRef(false);
  const hpRef = useRef({ milo: 1, foe: 1 });
  const steadyRef = useRef(false);
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
            setCall(null);
            setBubble({ speaker: b.speaker, line: b.line });
            speakLine(b.line);
            if (b.speaker === enemy && content.lexling.get(enemy)?.battle?.moves.some((m) => m.telegraph === b.line)) setLastTelegraph(b.line);
            animate(b.speaker, b.speaker === 'milo' ? 'hop' : 'stomp');
            await wait(readTime(b.line));
            break;
          case 'windup': {
            const tell = windupTell(enemy, b.move, b.windup);
            setWindup(tell);
            animate(enemy, WINDUP_ANIM[tell] ?? 'crouch');
            if (tell === 'inferno') setMoods((m) => ({ ...m, [enemy]: 'blazing' }));
            await wait(650);
            break;
          }
          case 'command':
            setBubble(null);
            animate('milo', 'attack');
            setMoods((m) => ({ ...m, milo: 'fierce' }));
            playSfx(ELEMENT_SFX[b.element ?? ''] ?? 'hit');
            setFx({ key: ++keys.current, element: b.element, from: 'milo', kind: 'shot', big: steadyRef.current });
            steadyRef.current = false;
            await wait(reduced ? 200 : 560);
            break;
          case 'shield':
            setBubble(null);
            animate('milo', 'brace');
            setMoods((m) => ({ ...m, milo: 'fierce' }));
            playSfx(ELEMENT_SFX[b.element ?? ''] ?? 'hit');
            setShield({ key: ++keys.current, element: b.element, hit: 0, broken: false });
            await wait(reduced ? 200 : 600);
            break;
          case 'blocked':
            setWindup(null);
            setMoods((m) => ({ ...m, [enemy]: 'angry', milo: 'proud' }));
            animate(enemy, 'lunge');
            await wait(reduced ? 100 : 260);
            setShield((s) => (s ? { ...s, hit: s.hit + 1 } : s));
            playSfx(b.by === 'earth' ? 'earth' : 'steam');
            await wait(reduced ? 200 : 750);
            setShield(null);
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
            setFx({ key: ++keys.current, element: b.by, from: 'foe', kind: b.by === 'earth' ? 'wall' : 'steam' });
            playSfx(b.by === 'earth' ? 'earth' : 'steam');
            await wait(650);
            break;
          case 'foeMove':
            setBubble(null);
            setCall(null);
            setWindup(null);
            animate(enemy, 'lunge');
            if (b.element) {
              setFx({ key: ++keys.current, element: b.element, from: 'foe', kind: 'shot' });
              playSfx(ELEMENT_SFX[b.element] ?? 'hit');
            }
            // A shield of the wrong element softens the blow, then gives way.
            if (b.halved) setShield((s) => (s ? { ...s, hit: s.hit + 1, broken: true } : s));
            await wait(reduced ? 200 : 480);
            setShield(null);
            setMoods((m) => ({ ...m, [enemy]: 'angry' }));
            break;
          case 'end':
            setResult(b.result);
            setWindup(null);
            setShield(null);
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
    const r = startBattle(content, enemy, { level, maxHp, context, seed: takeSeed(), verbs: knownVerbs(content, s.flags) });
    useGame.getState().dispatch(r.events);
    setHp({ milo: r.state.milo.hp, miloMax: r.state.milo.maxHp, foe: r.state.foe.hp, foeMax: r.state.foe.maxHp });
    hpRef.current = { milo: r.state.milo.hp, foe: r.state.foe.hp };
    void play(r.beats, r.state);
    // The battle starts once.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (commandId: string) => {
    if (!state || busy) return;
    tapFeedback();
    const v = verb ?? undefined;
    const r = chooseCommand(content, state, commandId, v);
    // A held shield last round makes this attack land harder: show it.
    steadyRef.current = state.steady && v !== 'defend';
    if (v) {
      const text = commandSentence(content, commandId, v);
      setCall({ key: ++keys.current, text });
      speakCall(text);
    }
    setVerb(null);
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

  const foeArt = art ?? enemy;
  const verbs = state?.verbs ?? [];
  const sceneState: SceneState = {
    background,
    props: [],
    actors: [
      { id: 'milo', art: 'milo', x: MILO.x, y: MILO.y, scale: 1, facing: 'right', hidden: false },
      { id: enemy, art: foeArt, x: FOE.x, y: FOE.y, scale: 1, facing: 'left', hidden: false },
    ],
  };
  const foeName = name ?? content.lexling.get(enemy)?.name ?? enemy;
  const foeBox = placementBox(foeArt, FOE.x, FOE.y, 1, sceneW, sceneH);
  const miloBox = placementBox('milo', MILO.x, MILO.y, 1, sceneW, sceneH);
  const centre = (box: typeof foeBox) => ({ x: box.left + box.width / 2, y: box.top + box.height * 0.5 });

  return (
    <View style={{ flex: 1, backgroundColor: color.night }}>
      <View style={{ width: stage.frame, alignSelf: 'center', flex: 1 }}>
        <View style={{ paddingTop: insets.top }}>
          <Animated.View style={{ height: sceneH, overflow: 'hidden', transform: [{ translateX: shake }] }}>
            <View style={{ position: 'absolute', left: stage.offset, top: 0 }}>
              <Scene
                scene={sceneState}
                width={sceneW}
                crop={stage.crop}
                anims={anims}
                moods={moods}
                reduced={reduced}
                speaker={bubble?.speaker === 'milo' ? 'milo' : bubble ? enemy : null}
                bubble={bubble ? <SpeechBubble lineId={bubble.line} icons={false} audioFirst={false} /> : null}>
                {windup === 'embers' && <Embers at={{ x: foeBox.left + foeBox.width * 0.06, y: foeBox.top + foeBox.height * 0.72 }} reduced={reduced} />}
                {windup === 'paw' && <Dust at={{ x: foeBox.left + foeBox.width * 0.5, y: foeBox.top + foeBox.height }} reduced={reduced} />}
                {windup === 'ready' && <Smoke at={{ x: foeBox.left + foeBox.width * 0.5, y: foeBox.top + foeBox.height * 0.2 }} reduced={reduced} />}
                {windup === 'inferno' && <Embers at={{ x: foeBox.left + foeBox.width * 0.06, y: foeBox.top + foeBox.height * 0.7 }} reduced={reduced} scale={2.2} />}
                {windup && PARTICLES[windup] && <Particles key={windup} at={{ x: foeBox.left + foeBox.width * 0.5, y: foeBox.top + foeBox.height * 0.55 }} spread={foeBox.width} {...PARTICLES[windup]} reduced={reduced} />}
                {shield && <Shield key={shield.key} shield={shield} at={{ x: miloBox.left + miloBox.width * 1.05, y: miloBox.top + miloBox.height }} height={miloBox.height * 1.1} reduced={reduced} />}
                {call && (
                  <View pointerEvents="none" style={[styles.call, { top: Math.max(space.sm, miloBox.top - 52), left: Math.max(space.sm, miloBox.left - space.md), maxWidth: sceneW * 0.55 }]}>
                    <Txt style={styles.callText}>{call.text}</Txt>
                  </View>
                )}
                {fx?.kind === 'wall' && <Wall key={fx.key} at={{ x: (miloBox.left + miloBox.width + foeBox.left) / 2, y: foeBox.top + foeBox.height }} height={foeBox.height * 0.9} reduced={reduced} />}
                {fx && fx.kind !== 'wall' && (
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
                <View style={[styles.hpCard, { right: stage.crop + space.sm, top: space.sm }]}>
                  <Txt style={styles.hpName}>{foeName}</Txt>
                  <Bar value={hp.foe} max={hp.foeMax} tint={hpTint(hp.foe, hp.foeMax)} track="rgba(255,255,255,0.16)" />
                </View>
                <View style={[styles.hpCard, { left: stage.crop + space.sm, top: space.sm }]}>
                  <Txt style={styles.hpName}>Milo · Lv {state?.milo.level ?? miloLevel(save)}</Txt>
                  <Bar value={hp.milo} max={hp.miloMax} tint={hpTint(hp.milo, hp.miloMax)} track="rgba(255,255,255,0.16)" />
                  <Txt style={styles.hpNum}>
                    {hp.milo} / {hp.miloMax}
                  </Txt>
                </View>
              </Scene>
            </View>
          </Animated.View>
        </View>

        <View style={{ flex: 1 }} onLayout={(e) => setApronH(e.nativeEvent.layout.height)}>
          <Apron id={background} width={stage.frame} height={apronH} />
          <SeamFade id={background} width={stage.frame} height={sceneH * 0.07} />
          <View style={[styles.dock, { paddingBottom: insets.bottom + space.md }]}>
            <Panel>
              {result ? (
                <View style={{ gap: space.md }}>
                  <Txt style={[type.title, { textAlign: 'center' }]}>{result === 'win' ? `${name ? name : `The ${foeName}`} backs off!` : 'Milo is worn out.'}</Txt>
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
                  {verbs.length >= 2 && (
                    <View style={styles.verbs} testID="verbs">
                      {verbs.map((id) => {
                        const v = content.milo.verbs.find((x) => x.id === id)!;
                        const concept = v.concepts[0]!;
                        const look = tilePresentation(conceptLevel(save.concepts, concept, now), save.settings);
                        const icon = (look.icon || hint >= 2) && content.concept.get(concept)?.icon;
                        const word = (content.phrasing.verbs[id] ?? wordFor(concept)).toUpperCase();
                        const on = verb === id;
                        return (
                          <Pressable
                            key={id}
                            accessibilityRole="button"
                            accessibilityState={{ selected: on }}
                            accessibilityLabel={word}
                            disabled={busy || !state}
                            onPress={() => {
                              tapFeedback();
                              setVerb(on ? null : id);
                            }}
                            style={({ pressed }) => [styles.verb, on && styles.verbOn, { opacity: busy ? 0.55 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
                            {icon && <Icon name={icon} size={20} color={on ? color.white : undefined} />}
                            <View style={{ alignItems: 'center' }}>
                              <Txt style={[type.tile, { fontSize: 17 }, on && { color: color.white }]}>{word}</Txt>
                              {hint >= 3 && <Txt style={[type.small, { color: on ? color.white : color.inkSoft }]}>{content.concept.get(concept)?.gloss}</Txt>}
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
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
                      const words = (verb && el ? (content.phrasing.with[el] ?? cmd.concepts.map(wordFor).join(' ')) : cmd.concepts.map(wordFor).join(' ')).toUpperCase();
                      const gloss = cmd.concepts.map((c) => content.concept.get(c)?.gloss).join(' ');
                      return (
                        <Pressable
                          key={id}
                          accessibilityRole="button"
                          accessibilityLabel={verb ? commandSentence(content, id, verb) : words}
                          disabled={busy || !state}
                          onPress={() => choose(id)}
                          style={({ pressed }) => [
                            styles.tile,
                            tint && { backgroundColor: elementColor(el) + '22', borderColor: elementColor(el) },
                            { opacity: busy ? 0.55 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
                          ]}>
                          {icons && content.concept.get(concept)?.icon && <Icon name={content.concept.get(concept)!.icon!} size={26} />}
                          <View style={{ alignItems: 'center' }}>
                            <Txt style={verb ? styles.phrase : type.tile}>{words}</Txt>
                            {hint >= 3 && <Txt style={[type.small, { color: color.inkSoft }]}>{verb ? `with ${gloss}` : gloss}</Txt>}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </Panel>
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * How clearly the enemy shows what's coming. While the word it shouts is new
 * to the player, the wind-up is a strong visual tell (embers, pawing). Once
 * the player has acted on that word, the tell becomes a generic "about to
 * strike" and the word carries the information (language bible §31, §57;
 * game bible Phase 10). "Keep element pictures" keeps the strong tells.
 */
function windupTell(enemy: string, ability: string, windup: string): string {
  const { save } = useGame.getState();
  const move = content.lexling.get(enemy)?.battle?.moves.find((m) => m.ability === ability);
  if (!move?.telegraph || save.settings.persistentIcons) return windup;
  return lineScaffold(save.concepts, move.telegraph, Date.now()) >= 2 ? windup : 'ready';
}

/** How the foe moves while it winds up each tell. */
const WINDUP_ANIM: Record<string, string> = { paw: 'stomp', gale: 'puff', inferno: 'blaze', dive: 'float', gust: 'puff', rocks: 'stomp' };

/** Little particles for the tells that have them: swirling air, a rising gale, stones lifting. */
const PARTICLES: Record<string, { tint: string; count: number; size: number; rise: number }> = {
  gust: { tint: '#CDEDE6', count: 4, size: 14, rise: 26 },
  gale: { tint: '#A9E0D4', count: 7, size: 22, rise: 46 },
  dive: { tint: '#FFFFFF', count: 3, size: 10, rise: -30 },
  rocks: { tint: '#9A7547', count: 5, size: 12, rise: 30 },
};

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
  const size = (fx.element ? 46 : 30) * (fx.big ? 1.5 : 1);
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

function Embers({ at, reduced, scale = 1 }: { at: { x: number; y: number }; reduced: boolean; scale?: number }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) return;
    const a = Animated.loop(Animated.sequence([Animated.timing(t, { toValue: 1, duration: 380, useNativeDriver: ND }), Animated.timing(t, { toValue: 0, duration: 380, useNativeDriver: ND })]));
    a.start();
    return () => a.stop();
  }, [t, reduced]);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: at.x - 15, top: at.y - 15, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFB347', opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.95] }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.8 * scale, 1.25 * scale] }) }] }}>
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

function Smoke({ at, reduced }: { at: { x: number; y: number }; reduced: boolean }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) return;
    const a = Animated.loop(Animated.timing(t, { toValue: 1, duration: 900, useNativeDriver: ND }));
    a.start();
    return () => a.stop();
  }, [t, reduced]);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: at.x - 36, top: at.y - 10, flexDirection: 'row', gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#8D8A87', opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -18 - i * 6] }) }] }} />
      ))}
    </View>
  );
}

/** A stone wall shooting up between Milo and a charging foe. */
function Wall({ at, height, reduced }: { at: { x: number; y: number }; height: number; reduced: boolean }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const a = Animated.timing(t, { toValue: 1, duration: reduced ? 1 : 900, useNativeDriver: ND });
    a.start();
    return () => a.stop();
  }, [t, reduced]);
  const w = height * 0.45;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: at.x - w / 2,
        top: at.y - height,
        width: w,
        height,
        opacity: t.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
        transform: [{ translateY: t.interpolate({ inputRange: [0, 0.25, 1], outputRange: [height * 0.6, 0, 0] }) }],
      }}>
      <View style={{ flex: 1, borderTopLeftRadius: 10, borderTopRightRadius: 14, backgroundColor: elementColor('earth'), borderWidth: 3, borderColor: '#6B5132', overflow: 'hidden' }}>
        {[0.25, 0.55, 0.8].map((y) => (
          <View key={y} style={{ position: 'absolute', left: 0, right: 0, top: `${y * 100}%`, height: 3, backgroundColor: '#6B5132', opacity: 0.6 }} />
        ))}
      </View>
    </Animated.View>
  );
}

/** A loop of particles around the foe while it winds up. */
function Particles({ at, spread, tint, count, size, rise, reduced }: { at: { x: number; y: number }; spread: number; tint: string; count: number; size: number; rise: number; reduced: boolean }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) return;
    const a = Animated.loop(Animated.timing(t, { toValue: 1, duration: 800, useNativeDriver: ND }));
    a.start();
    return () => a.stop();
  }, [t, reduced]);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: at.x - spread / 2, top: at.y, width: spread, height: 1 }}>
      {Array.from({ length: count }, (_, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: (spread * (i + 0.5)) / count - size / 2,
            top: ((i * 37) % 23) - 12,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: tint,
            opacity: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.2, 0.85, 0] }),
            transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -rise - (i % 3) * 6] }) }, { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.2] }) }],
          }}
        />
      ))}
    </View>
  );
}

/** Milo's shield: a curtain of his element in front of him. It flashes when something hits it, and cracks if it's the wrong element. */
function Shield({ shield, at, height, reduced }: { shield: { element: string | null; hit: number; broken: boolean }; at: { x: number; y: number }; height: number; reduced: boolean }) {
  const [t] = useState(() => new Animated.Value(reduced ? 1 : 0));
  const [flash] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const a = Animated.timing(t, { toValue: 1, duration: reduced ? 1 : 260, easing: Easing.out(Easing.back(1.5)), useNativeDriver: ND });
    a.start();
    return () => a.stop();
  }, [t, reduced]);
  useEffect(() => {
    if (!shield.hit || reduced) return;
    const a = Animated.sequence([Animated.timing(flash, { toValue: 1, duration: 90, useNativeDriver: ND }), Animated.timing(flash, { toValue: 0, duration: 400, useNativeDriver: ND })]);
    a.start();
    return () => a.stop();
  }, [shield.hit, flash, reduced]);
  const c = elementColor(shield.element);
  const w = height * 0.32;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: at.x - w / 2,
        top: at.y - height,
        width: w,
        height,
        opacity: t,
        transform: [{ scaleY: t.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }, { scale: flash.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
      }}>
      <View style={{ flex: 1, borderRadius: w / 2, backgroundColor: c + (shield.broken ? '33' : '55'), borderWidth: 4, borderColor: c, borderStyle: shield.broken ? 'dashed' : 'solid', alignItems: 'center', justifyContent: 'center' }}>
        {shield.element && <Icon name={shield.element} size={w * 0.55} color="#fff" />}
      </View>
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: w / 2, backgroundColor: '#fff', opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }) }]} />
    </Animated.View>
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
  hpCard: { position: 'absolute', width: 150, backgroundColor: 'rgba(28,21,14,0.8)', borderRadius: radius.md, borderWidth: 1.5, borderColor: '#C9A35E', paddingHorizontal: space.md, paddingVertical: space.sm, gap: 5, ...shadow.card },
  hpName: { fontFamily: font.displaySemi, fontSize: 15, color: color.paper },
  hpNum: { fontFamily: font.uiBold, fontSize: 11, color: '#D9C9A8', textAlign: 'right' },
  dock: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: space.md, paddingTop: space.lg },
  panelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: color.paperDeep, borderWidth: 1.5, borderColor: color.paperLine },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  verbs: { flexDirection: 'row', gap: space.sm },
  verb: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: color.paperDeep,
    borderWidth: 2,
    borderColor: color.edge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  verbOn: { backgroundColor: color.ink, borderColor: color.edgeDark },
  phrase: { ...type.tile, fontSize: 16, letterSpacing: 0.5, textAlign: 'center' },
  call: { position: 'absolute', backgroundColor: color.paper, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.xs + 2, borderWidth: 2, borderColor: color.amberDeep, ...shadow.card },
  callText: { ...type.body, fontWeight: '800', fontStyle: 'italic' },
  tile: {
    flexBasis: '46%',
    flexGrow: 1,
    minHeight: 66,
    borderRadius: radius.md,
    backgroundColor: color.paper,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: color.edge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    ...shadow.card,
  },
});
