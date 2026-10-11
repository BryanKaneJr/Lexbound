import type { SceneState } from '@lexbound/core';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Portrait } from '@/art/Actor';
import { BACKGROUND_IDS } from '@/art/backgrounds';
import { ACTOR_ART, PROP_ART } from '@/art/ids';
import { Scene } from '@/components/Scene';
import { Txt } from '@/components/ui';
import { color, space, type } from '@/theme/tokens';

/**
 * Developer tools: every background with Milo and a Lexling standing in it,
 * then every actor in its moods and every prop. For judging the art at the
 * size the game shows it.
 */
const GUESTS = ['emberhog', 'drizzlet', 'pebblit', 'puffkin', 'flickerwing', 'cragling', 'cinderback', 'bluster'];
const MILO_MOODS = ['idle', 'happy', 'excited', 'curious', 'confused', 'annoyed', 'scared', 'tired', 'hurt', 'sad', 'surprised', 'fierce', 'proud', 'disgusted'];
const LEXLING_MOODS = ['idle', 'happy', 'angry', 'hurt', 'scared', 'confused', 'sad', 'blazing'];

export default function ArtLab() {
  const { width } = useWindowDimensions();
  const w = Math.min(width, 520);
  return (
    <ScrollView style={{ backgroundColor: color.night }} contentContainerStyle={{ alignItems: 'center', gap: space.lg, paddingBottom: space.xxl }}>
      {BACKGROUND_IDS.map((bg, i) => {
        const guest = GUESTS[i % GUESTS.length]!;
        const scene: SceneState = {
          background: bg,
          props: [],
          actors: [
            { id: 'milo', art: 'milo', x: 0.32, y: 0.89, scale: 1, facing: 'right', mood: 'happy', hidden: false },
            { id: guest, art: guest, x: 0.72, y: 0.9, scale: 1, facing: 'left', hidden: false },
          ],
        };
        return (
          <View key={bg} testID={`bg-${bg}`}>
            <Scene scene={scene} width={w} reduced />
            <Txt style={[type.label, styles.caption]}>{bg}</Txt>
          </View>
        );
      })}
      <Sheet title="milo" width={w}>
        {MILO_MOODS.map((m) => (
          <Cell key={m} label={m}>
            <Portrait art="milo" width={84} mood={m} />
          </Cell>
        ))}
      </Sheet>
      {Object.keys(ACTOR_ART)
        .filter((a) => a !== 'milo')
        .map((a) => (
          <Sheet key={a} title={a} width={w}>
            {(a === 'maren' || a === 'pip' ? ['idle'] : LEXLING_MOODS).map((m) => (
              <Cell key={m} label={m}>
                <Portrait art={a} width={a === 'maren' || a === 'pip' ? 54 : 96} mood={m} />
              </Cell>
            ))}
          </Sheet>
        ))}
      <Sheet title="props" width={w}>
        {Object.keys(PROP_ART).map((p) => (
          <Cell key={p} label={p}>
            <Portrait art={p} width={72} />
          </Cell>
        ))}
      </Sheet>
    </ScrollView>
  );
}

function Sheet({ title, width, children }: { title: string; width: number; children: React.ReactNode }) {
  return (
    <View style={{ width, paddingHorizontal: space.md }} testID={`sheet-${title}`}>
      <Txt style={[type.label, styles.caption]}>{title}</Txt>
      <View style={styles.grid}>{children}</View>
    </View>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.cell}>
      <View style={{ height: 110, justifyContent: 'flex-end', alignItems: 'center' }}>{children}</View>
      <Txt style={[type.small, { color: color.paperLine, fontSize: 11 }]}>{label}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { color: color.paperLine, textAlign: 'center', marginTop: space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  cell: { width: 104, alignItems: 'center', backgroundColor: '#C9C2B4', borderRadius: 10, padding: 4 },
});
