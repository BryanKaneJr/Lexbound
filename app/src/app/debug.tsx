import { chooseEncounter, comprehension, isDue, LANGUAGE, scaffoldLevel, strengthAt, xpForLevel, levelForXp, newConcept, type ConceptState, type Save } from '@lexbound/core';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Button, Card, IconButton, Screen, Txt } from '@/components/ui';
import { content, wordFor } from '@/game/content';
import { useNow } from '@/game/useNow';
import { useGame } from '@/state/store';
import { color, radius, space, type } from '@/theme/tokens';

/**
 * Developer tools (bible §72): see and bend everything the player never
 * sees. Concept strength and scaffold levels, story flags, scheduler
 * weights; force an encounter or a battle; jump time forward to see a
 * returning player get their help back.
 */
const DAY = 86_400_000;
/** A concept record that lands on a given scaffold level (3 exposed, 2 suspected, 1 demonstrated, 0 internalized). */
function forced(prev: ConceptState, level: number, now: number): ConceptState {
  const base = { ...prev, lastSeen: now, exposures: Math.max(prev.exposures, 2) };
  switch (level) {
    case 3:
      return { ...base, strength: 0.05, successes: 0, successContexts: [], contexts: ['debug'], spaced: false };
    case 2:
      return { ...base, strength: 0.4, successes: 0, successContexts: [], contexts: ['debug', 'debug.2'], spaced: false };
    case 1:
      return { ...base, strength: 0.7, successes: Math.max(1, prev.successes), successContexts: ['debug'], lastSuccess: now, spaced: false };
    default:
      return { ...base, strength: 0.95, successes: Math.max(3, prev.successes), successContexts: ['debug', 'debug.2', 'debug.3'], speakers: ['milo', 'debug'], lastSuccess: now, spaced: true };
  }
}

/** Marks every story scene before `order` as played, with the flags, items and journal entries it gives. */
function skipStory(s: Save, order: number, xp: number): Save {
  const flags = { ...s.flags };
  const items: Record<string, number> = { flask: 1, sunberries: 1, stick: 1, charm: 1, ...s.items };
  const journal = new Set(s.journal.entries);
  const encounters = { ...s.encounters };
  for (const e of content.encounters) {
    if (e.kind !== 'story' || (e.order ?? 0) >= order) continue;
    encounters[e.id] = { count: 1, lastExplore: 0 };
    for (const step of e.steps) {
      if (step.type !== 'reward') continue;
      for (const f of step.effects.flags ?? []) flags[f] = true;
      for (const j of step.effects.journal ?? []) journal.add(j);
      for (const [i, n] of Object.entries(step.effects.items ?? {})) items[i] = Math.max(items[i] ?? 0, n);
    }
  }
  return { ...s, flags, items, encounters, journal: { ...s.journal, entries: [...journal] }, milo: { ...s.milo, xp: Math.max(s.milo.xp, xp) } };
}

export default function Debug() {
  const save = useGame((s) => s.save);
  const replace = useGame((s) => s.replace);
  const reset = useGame((s) => s.reset);
  const [showSave, setShowSave] = useState(false);
  const now = useNow();
  const edit = (f: (s: Save) => Save) => replace(f(useGame.getState().save));

  const setLevel = (concept: string, level: number) =>
    edit((s) => {
      const prev = s.concepts[concept] ?? newConcept();
      return {
        ...s,
        concepts: {
          ...s.concepts,
          [concept]: forced(prev, level, now),
        },
      };
    });

  const timeTravel = (days: number) =>
    edit((s) => ({
      ...s,
      concepts: Object.fromEntries(Object.entries(s.concepts).map(([k, c]) => [k, { ...c, lastSeen: c.lastSeen ? c.lastSeen - days * DAY : 0 }])),
    }));

  const explorable = content.locations.filter((l) => l.kind === 'explore');
  const weights = explorable.map((l) => ({ place: l, candidates: chooseEncounter(content, save, l.id, now, 1).candidates }));

  return (
    <Screen>
      <View style={styles.head}>
        <IconButton icon="close" label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <Txt style={type.title}>Developer tools</Txt>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }}>
        <Card style={{ gap: space.sm }}>
          <Txt style={[type.label, styles.section]}>Concepts (tap a level to force it)</Txt>
          {content.concepts.map((c) => {
            const st = save.concepts[c.id];
            const level = scaffoldLevel(st, now);
            return (
              <View key={c.id} style={styles.conceptRow}>
                <View style={{ flex: 1 }}>
                  <Txt style={[type.body, { fontWeight: '800' }]}>
                    {wordFor(c.id)} <Txt style={[type.small, { color: color.inkMuted }]}>{c.gloss}</Txt>
                  </Txt>
                  <Txt style={[type.small, { color: color.inkSoft, fontWeight: '500' }]}>
                    {comprehension(st, now)} · s {strengthAt(st ?? newConcept(), now).toFixed(2)} · seen {st?.exposures ?? 0} in {st?.contexts.length ?? 0} · ✓{st?.successes ?? 0} in {st?.successContexts.length ?? 0} ✗{st?.failures ?? 0} · hints {st?.hints ?? 0}
                    {isDue(st, now) ? ' · due' : ''}
                    {st?.speakers.length ? `\nheard from ${st.speakers.join(', ')} · via ${st.modalities.join(', ')}` : ''}
                  </Txt>
                </View>
                {[3, 2, 1, 0].map((l) => (
                  <Pressable key={l} accessibilityRole="button" accessibilityLabel={`${c.id} level ${l}`} onPress={() => setLevel(c.id, l)} style={[styles.level, l === level && styles.levelOn]}>
                    <Txt style={[type.small, { color: l === level ? color.ink : color.inkMuted }]}>{l}</Txt>
                  </Pressable>
                ))}
              </View>
            );
          })}
          <Txt style={[type.small, { color: color.inkMuted, fontWeight: '500' }]}>Levels: 3 new, 2 suspected (or rusty), 1 demonstrated or understood, 0 internalized. Due below {LANGUAGE.dueBelow}. Never shown to players.</Txt>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button label="+3 days" kind="secondary" onPress={() => timeTravel(3)} style={{ flex: 1 }} />
            <Button label="+14 days" kind="secondary" onPress={() => timeTravel(14)} style={{ flex: 1 }} />
          </View>
        </Card>

        <Card style={{ gap: space.sm }}>
          <Txt style={[type.label, styles.section]}>Milo</Txt>
          <Txt style={type.body}>
            Level {levelForXp(save.milo.xp)} · {save.milo.xp} XP · bond {save.milo.bond}
          </Txt>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button label="Level up" kind="secondary" style={{ flex: 1 }} onPress={() => edit((s) => ({ ...s, milo: { ...s.milo, xp: xpForLevel(levelForXp(s.milo.xp) + 1) } }))} />
            <Button label="Bond +10" kind="secondary" style={{ flex: 1 }} onPress={() => edit((s) => ({ ...s, milo: { ...s.milo, bond: Math.min(100, s.milo.bond + 10) } }))} />
          </View>
        </Card>

        {weights.map(({ place, candidates }) => (
          <Card key={place.id} style={{ gap: space.sm }}>
            <Txt style={[type.label, styles.section]}>{place.name} scheduler weights</Txt>
            {candidates.length === 0 && <Txt style={type.small}>Nothing ready.</Txt>}
            {candidates.map((w) => (
              <Txt key={w.id} style={[type.small, { fontWeight: '500' }]}>
                {w.id}: {Number.isFinite(w.weight) ? w.weight.toFixed(1) : 'story'} {w.reasons.length ? `(${w.reasons.join(' ')})` : ''}
              </Txt>
            ))}
          </Card>
        ))}

        <Card style={{ gap: space.sm }}>
          <Txt style={[type.label, styles.section]}>Force an encounter</Txt>
          {content.encounters.map((e) => (
            <Pressable key={e.id} accessibilityRole="button" accessibilityLabel={`Play ${e.id}`} onPress={() => router.push({ pathname: '/play/[id]', params: { id: e.id, n: String(Date.now()) } })} style={styles.linkRow}>
              <Txt style={[type.small, { fontWeight: '600' }]}>
                {e.id} <Txt style={[type.small, { color: color.inkMuted }]}>{save.encounters[e.id]?.count ? `×${save.encounters[e.id]!.count}` : ''}</Txt>
              </Txt>
            </Pressable>
          ))}
          <Button label="Force battle: Emberhog" kind="secondary" onPress={() => router.push({ pathname: '/battle/[enemy]', params: { enemy: 'emberhog' } })} />
        </Card>

        <Card style={{ gap: space.sm }}>
          <Txt style={[type.label, styles.section]}>Story flags</Txt>
          {Object.keys(save.flags).length === 0 && <Txt style={type.small}>None yet.</Txt>}
          {Object.keys(save.flags).map((f) => (
            <Pressable key={f} accessibilityRole="button" accessibilityLabel={`Clear ${f}`} onPress={() => edit((s) => ({ ...s, flags: Object.fromEntries(Object.entries(s.flags).filter(([k]) => k !== f)) }))} style={styles.linkRow}>
              <Txt style={[type.small, { fontWeight: '600' }]}>{f} ✕</Txt>
            </Pressable>
          ))}
          <Button label="Art lab" kind="secondary" onPress={() => router.push('/artlab')} />
          <Button label="Skip to after the Emberhog" kind="secondary" onPress={() => edit((s) => skipStory(s, 8, 30))} />
          <Button label="Skip to Chapter Two" kind="secondary" onPress={() => edit((s) => skipStory(s, 11, 30))} />
          <Button label="Skip to the Old Hollow" kind="secondary" onPress={() => edit((s) => skipStory(s, 13, 55))} />
        </Card>

        <Card style={{ gap: space.sm }}>
          <Txt style={[type.label, styles.section]}>Save</Txt>
          <Button label={showSave ? 'Hide save JSON' : 'Show save JSON'} kind="secondary" onPress={() => setShowSave((v) => !v)} />
          {showSave && <TextInput multiline editable={false} value={JSON.stringify(save, null, 2)} style={styles.json} />}
          <Button
            label="Reset save"
            kind="secondary"
            onPress={async () => {
              await reset();
              router.replace({ pathname: '/play/[id]', params: { id: 'lodge.intro' } });
            }}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.sm },
  section: { color: color.inkMuted },
  conceptRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: color.paperLine },
  level: { width: 28, height: 28, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.paperLine },
  levelOn: { backgroundColor: color.amberSoft, borderColor: color.amber },
  linkRow: { paddingVertical: 6 },
  json: { fontFamily: 'monospace', fontSize: 11, minHeight: 240, backgroundColor: color.paperDeep, borderRadius: radius.md, padding: space.sm, color: color.ink },
});
