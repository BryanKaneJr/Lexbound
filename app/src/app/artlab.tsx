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
      {/* AGENT-PROPS PREVIEW START */}
      <View testID="ap-people" style={{ width: w, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', backgroundColor: '#C9C2B4', gap: 6, padding: 6 }}>
        <Portrait art="maren" width={125} />
        <Portrait art="pip" width={112} />
        <Portrait art="milo" width={110} mood="happy" />
      </View>
      <View testID="ap-moods" style={{ width: w, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', backgroundColor: '#C9C2B4', gap: 4, padding: 6 }}>
        {['idle', 'happy', 'surprised', 'curious', 'annoyed', 'sad', 'proud'].map((m) => (
          <View key={m} style={{ alignItems: 'center' }}>
            <Portrait art="maren" width={52} mood={m} />
            <Portrait art="pip" width={48} mood={m} />
          </View>
        ))}
      </View>
      {[Object.keys(PROP_ART).slice(0, 10), Object.keys(PROP_ART).slice(10)].map((list, k) => (
        <View key={k} testID={`ap-props${k + 1}`} style={{ width: w, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: '#C9C2B4', gap: 4, padding: 4 }}>
          {list.map((p) => (
            <View key={p} style={{ width: 120, height: 150, alignItems: 'center', justifyContent: 'flex-end' }}>
              <Portrait art={p} width={['shiny_stone', 'pouch', 'pinecone'].includes(p) ? 70 : p === 'standing_stone' ? 64 : 116} />
              <Txt style={{ fontSize: 10, color: '#333' }}>{p}</Txt>
            </View>
          ))}
        </View>
      ))}
      {(
        [
          ['forest_stream', [['bush', 0.78, 0.86, 1], ['rock_big', 0.14, 0.9, 0.9], ['rock_small', 0.6, 0.93, 1], ['shiny_stone', 0.68, 0.92, 1], ['mushroom', 0.5, 0.93, 0.8], ['ripple', 0.5, 0.8, 1], ['pinecone', 0.42, 0.92, 1], ['pouch', 0.2, 0.94, 1]], [['milo', 0.3, 0.9], ['maren', 0.9, 0.93]]],
          ['lodge', [['basket', 0.36, 0.9, 1], ['bowl', 0.12, 0.92, 1]], [['milo', 0.36, 0.86], ['pip', 0.58, 0.92], ['maren', 0.78, 0.92]]],
          ['camp_night', [['log', 0.2, 0.93, 0.8], ['campfire', 0.74, 0.92, 0.85], ['pouch', 0.32, 0.92, 1]], [['milo', 0.46, 0.88]]],
          ['camp', [['log', 0.7, 0.93, 1.1], ['pinecone', 0.6, 0.86, 1], ['pinecone', 0.7, 0.86, 1], ['pinecone', 0.8, 0.86, 1], ['dirtwall', 0.42, 0.93, 1], ['well', 0.88, 0.9, 1]], [['milo', 0.18, 0.88]]],
          ['hollow', [['standing_stone', 0.86, 0.86, 0.8], ['leafpile', 0.58, 0.92, 1], ['glowshroom', 0.14, 0.93, 0.8], ['glowshroom', 0.72, 0.95, 1.2]], [['milo', 0.32, 0.86]]],
          ['hollow', [['standing_stone', 0.68, 0.88, 1.3], ['pit', 0.3, 0.95, 1], ['rock_big', 0.12, 0.9, 1], ['rock_small', 0.9, 0.93, 1]], [['milo', 0.3, 0.86]]],
          ['forest_path', [['log', 0.18, 0.92, 0.9], ['bush', 0.76, 0.86, 1], ['shiny_stone', 0.66, 0.9, 1], ['mushroom', 0.5, 0.93, 0.8], ['puddle', 0.62, 0.95, 1]], [['milo', 0.34, 0.86]]],
        ] as [string, [string, number, number, number][], [string, number, number][]][]
      ).map(([bg, props, actors], i) => (
        <View key={i} testID={`ap-scene${i + 1}`}>
          <Scene
            scene={{
              background: bg,
              props: props.map(([art, x, y, scale], j) => ({ id: `${art}${j}`, art, x, y, scale, facing: 'right', hidden: false })),
              actors: actors.map(([art, x, y]) => ({ id: art, art, x, y, scale: 1, facing: art === 'milo' ? 'right' : 'left', mood: art === 'milo' ? 'happy' : undefined, hidden: false })),
            }}
            width={w}
            reduced
          />
        </View>
      ))}
      <View testID="ap-zoom1" style={{ width: w, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', backgroundColor: '#C9C2B4', gap: 4, padding: 4 }}>
        <Portrait art="basket" width={180} />
        <Portrait art="campfire" width={180} />
        <Portrait art="leafpile" width={180} />
        <Portrait art="pit" width={180} />
        <Portrait art="pouch" width={110} />
        <Portrait art="shiny_stone" width={110} />
        <Portrait art="pinecone" width={100} />
      </View>
      <View testID="ap-zoom4" style={{ width: w, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', backgroundColor: '#C9C2B4', gap: 4, padding: 4 }}>
        <Portrait art="bowl" width={170} />
        <Portrait art="well" width={170} />
        <Portrait art="glowshroom" width={170} />
        <Portrait art="mushroom" width={130} />
        <View style={{ backgroundColor: '#6DA8B4', padding: 6 }}>
          <Portrait art="ripple" width={220} />
        </View>
        <Portrait art="puddle" width={220} />
      </View>
      <View testID="ap-zoom2" style={{ width: w, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', backgroundColor: '#C9C2B4', overflow: 'hidden', height: 420 }}>
        <View style={{ marginBottom: -260 }}>
          <Portrait art="maren" width={300} />
        </View>
      </View>
      <View testID="ap-zoom3" style={{ width: w, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', backgroundColor: '#C9C2B4', overflow: 'hidden', height: 420 }}>
        <View style={{ marginBottom: -200 }}>
          <Portrait art="pip" width={300} />
        </View>
      </View>
      {/* AGENT-PROPS PREVIEW END */}
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
