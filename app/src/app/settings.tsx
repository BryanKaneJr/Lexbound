import type { Settings } from '@lexbound/core';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Button, Card, IconButton, Screen, tapFeedback, Txt } from '@/components/ui';
import { useGame } from '@/state/store';
import { color, radius, space, type } from '@/theme/tokens';

/**
 * Accessibility and comfort (bible §56): learning purity matters less than
 * keeping the player playing. Every crutch the game removes on its own can
 * be put back here.
 */
function Toggle({ label, detail, value, onChange }: { label: string; detail?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt style={type.body}>{label}</Txt>
        {detail && <Txt style={[type.small, { color: color.inkSoft, fontWeight: '500' }]}>{detail}</Txt>}
      </View>
      <Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ true: color.amber, false: color.paperLine }} thumbColor={color.white} />
    </View>
  );
}

function Choice<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <View style={{ gap: space.sm, paddingVertical: space.sm }}>
      <Txt style={type.body}>{label}</Txt>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {options.map((o) => (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: o.value === value }}
            accessibilityLabel={`${label}: ${o.label}`}
            onPress={() => {
              tapFeedback();
              onChange(o.value);
            }}
            style={[styles.option, o.value === value && styles.optionOn]}>
            <Txt style={[type.small, { color: o.value === value ? color.ink : color.inkSoft }]}>{o.label}</Txt>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const s = useGame((x) => x.save.settings);
  const update = useGame((x) => x.settings);
  const reset = useGame((x) => x.reset);
  const [confirm, setConfirm] = useState(false);
  const set = (patch: Partial<Settings>) => update(patch);
  return (
    <Screen>
      <View style={styles.head}>
        <IconButton icon="close" label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <Txt style={type.title}>Settings</Txt>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }}>
        <Card>
          <Txt style={[type.label, styles.section]}>Sound</Txt>
          <Toggle label="Creature voices" detail="Lexlings speak their lines aloud." value={s.voice} onChange={(voice) => set({ voice })} />
          <Toggle label="Sound effects" value={s.sound} onChange={(sound) => set({ sound })} />
          <Choice label="Creature speech speed" value={s.speechRate} onChange={(speechRate) => set({ speechRate })} options={[{ value: 0.7, label: 'Slow' }, { value: 0.85, label: 'Relaxed' }, { value: 1, label: 'Normal' }]} />
        </Card>
        <Card>
          <Txt style={[type.label, styles.section]}>Help with the creature language</Txt>
          <Choice
            label="Creature words on screen"
            value={s.subtitles}
            onChange={(subtitles) => set({ subtitles })}
            options={[
              { value: 'always', label: 'Always' },
              { value: 'adaptive', label: 'Sound first when I know them' },
            ]}
          />
          <Toggle label="Keep element pictures" detail="Command tiles and speech always show their pictures." value={s.persistentIcons} onChange={(persistentIcons) => set({ persistentIcons })} />
          <Toggle label="Stronger hints" detail="Help starts with a clue instead of a repeat." value={s.strongHints} onChange={(strongHints) => set({ strongHints })} />
        </Card>
        <Card>
          <Txt style={[type.label, styles.section]}>Comfort</Txt>
          <Choice label="Text size" value={s.textScale} onChange={(textScale) => set({ textScale })} options={[{ value: 1, label: 'Standard' }, { value: 1.15, label: 'Large' }, { value: 1.3, label: 'Larger' }]} />
          <Toggle label="Reduce motion" value={s.reducedMotion} onChange={(reducedMotion) => set({ reducedMotion })} />
          <Toggle label="Vibration" value={s.haptics} onChange={(haptics) => set({ haptics })} />
        </Card>
        <Button label="Developer tools" kind="quiet" onPress={() => router.push('/debug')} />
        {confirm ? (
          <Card style={{ gap: space.md }}>
            <Txt style={type.body}>Start over from the very beginning? Milo will forget everything.</Txt>
            <Button
              label="Yes, start over"
              onPress={async () => {
                await reset();
                router.replace({ pathname: '/play/[id]', params: { id: 'lodge.intro' } });
              }}
            />
            <Button label="Keep my adventure" kind="secondary" onPress={() => setConfirm(false)} />
          </Card>
        ) : (
          <Button label="Start over" kind="quiet" onPress={() => setConfirm(true)} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.sm },
  section: { color: color.inkMuted, marginBottom: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  option: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: color.paperLine, backgroundColor: color.paperDeep, flexShrink: 1 },
  optionOn: { backgroundColor: color.amberSoft, borderColor: color.amber },
});
