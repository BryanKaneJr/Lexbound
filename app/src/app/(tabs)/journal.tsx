import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Icon } from '@/art/icons';
import { DrizzletArt, EmberhogArt, PebblitArt, PuffkinArt } from '@/art/lexlings';
import { HeardLine } from '@/components/HeardLine';
import { Card, Screen, tapFeedback, Txt } from '@/components/ui';
import { content, elementColor } from '@/game/content';
import { useGame } from '@/state/store';
import { color, radius, space, type } from '@/theme/tokens';

/**
 * The adventure record (bible §35): story, the Lexlings you've met (the
 * bestiary, with the lines you've heard each one say), places, and strange
 * things heard. Never a vocabulary table.
 */
type Tab = 'story' | 'lexlings' | 'places' | 'strange';
const TABS: { id: Tab; label: string }[] = [
  { id: 'story', label: 'Story' },
  { id: 'lexlings', label: 'Lexlings' },
  { id: 'places', label: 'Places' },
  { id: 'strange', label: 'Strange things' },
];

const ART: Record<string, (w: number, seen: boolean) => React.ReactNode> = {
  emberhog: (w, s) => <EmberhogArt width={w} mood={s ? 'angry' : 'idle'} />,
  drizzlet: (w) => <DrizzletArt width={w * 0.6} />,
  pebblit: (w) => <PebblitArt width={w * 0.8} mood="happy" />,
  puffkin: (w) => <PuffkinArt width={w * 0.7} />,
};

export default function Journal() {
  const save = useGame((s) => s.save);
  const [tab, setTab] = useState<Tab>('story');
  const entries = save.journal.entries.map((id) => content.entry.get(id)).filter((e) => !!e);
  const strange = Object.keys(save.journal.heard).filter((id) => content.line.get(id)?.journal === 'strange');
  return (
    <Screen>
      <View style={{ padding: space.lg, paddingBottom: 0, gap: space.md }}>
        <Txt style={type.title}>Journal</Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
          {TABS.map((t) => (
            <Pressable
              key={t.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t.id }}
              accessibilityLabel={t.label}
              onPress={() => {
                tapFeedback();
                setTab(t.id);
              }}
              style={[styles.tab, tab === t.id && styles.tabOn]}>
              <Txt style={[type.small, { color: tab === t.id ? color.ink : color.inkSoft }]}>{t.label}</Txt>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        {tab === 'story' &&
          (entries.filter((e) => e.section !== 'places').length === 0 ? (
            <Txt style={[type.body, { color: color.inkSoft }]}>Nothing written yet.</Txt>
          ) : (
            entries
              .filter((e) => e.section !== 'places')
              .map((e) => (
                <Card key={e.id} style={{ gap: space.xs }}>
                  <Txt style={type.heading}>{e.title}</Txt>
                  <Txt style={[type.body, { color: color.inkSoft }]}>{e.text}</Txt>
                </Card>
              ))
          ))}

        {tab === 'lexlings' &&
          content.lexlings.map((l) => {
            const seen = save.lexlings[l.id];
            const quotes = Object.keys(save.journal.heard).filter((id) => content.line.get(id)?.speaker === l.id && content.line.get(id)?.journal !== 'strange');
            return (
              <Card key={l.id} style={{ gap: space.sm }}>
                <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                  <View style={{ width: 84, height: 70, alignItems: 'center', justifyContent: 'flex-end', opacity: seen ? 1 : 0.12 }}>{ART[l.id]?.(84, !!seen)}</View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt style={type.heading}>{seen ? l.name : '???'}</Txt>
                    {seen && (
                      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', flexWrap: 'wrap' }}>
                        <View style={[styles.chip, { backgroundColor: elementColor(l.element) + '22' }]}>
                          <Icon name={l.element} size={14} />
                          <Txt style={[type.small, { fontSize: 12 }]}>{l.element}</Txt>
                        </View>
                        <Txt style={[type.small, { fontSize: 12, color: color.inkSoft }]}>{content.location.get(l.habitat)?.name}</Txt>
                        {seen.befriended && (
                          <View style={[styles.chip, { backgroundColor: color.heartSoft }]}>
                            <Icon name="heart" size={12} />
                            <Txt style={[type.small, { fontSize: 12 }]}>Friend</Txt>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
                {seen ? <Txt style={[type.body, { color: color.inkSoft }]}>{l.description}</Txt> : <Txt style={[type.body, { color: color.inkMuted }]}>Not met yet.</Txt>}
                {quotes.length > 0 && (
                  <View>
                    <Txt style={[type.label, { color: color.inkMuted, marginTop: space.xs }]}>Heard it say</Txt>
                    {quotes.map((q) => (
                      <HeardLine key={q} lineId={q} />
                    ))}
                  </View>
                )}
              </Card>
            );
          })}

        {tab === 'places' &&
          entries
            .filter((e) => e.section === 'places')
            .map((e) => (
              <Card key={e.id} style={{ gap: space.xs }}>
                <Txt style={type.heading}>{e.title}</Txt>
                <Txt style={[type.body, { color: color.inkSoft }]}>{e.text}</Txt>
              </Card>
            ))}

        {tab === 'strange' && (
          <>
            <Txt style={[type.body, { color: color.inkSoft }]}>{"Things Lexlings said that you couldn't quite follow. Maybe one day you will."}</Txt>
            {strange.length === 0 ? (
              <Txt style={[type.body, { color: color.inkMuted }]}>Nothing strange yet.</Txt>
            ) : (
              strange.map((id) => (
                <Card key={id} style={{ gap: 2 }}>
                  <Txt style={[type.small, { color: color.inkMuted }]}>{content.lexling.get(content.line.get(id)!.speaker)?.name}, to Milo</Txt>
                  <HeardLine lineId={id} reveal={false} />
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tab: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, backgroundColor: color.paper, borderWidth: 1, borderColor: color.paperLine },
  tabOn: { backgroundColor: color.amberSoft, borderColor: color.amber },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill },
});
