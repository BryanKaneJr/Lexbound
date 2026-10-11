import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '@/art/icons';
import { WRITING } from '@lexbound/core';
import { speakLine } from '@/audio/voice';
import { content } from '@/game/content';
import { color, radius, space, type } from '@/theme/tokens';
import { Txt } from './ui';

/**
 * A remembered creature line in the journal: the words as heard, and a
 * button to hear them again (words found carved in stone are read, not heard). `reveal` lets the player ask what it meant
 * (the player chooses how much help they need, bible §56); strange lines
 * don't offer it, because understanding them later is the point.
 */
export function HeardLine({ lineId, reveal = true }: { lineId: string; reveal?: boolean }) {
  const line = content.line.get(lineId);
  const [open, setOpen] = useState(false);
  if (!line) return null;
  return (
    <View style={styles.row}>
      {line.speaker === WRITING ? (
        <View style={styles.play}>
          <Icon name="stone" size={18} />
        </View>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel={`Hear "${line.text}"`} onPress={() => speakLine(lineId)} style={styles.play}>
          <Icon name="speaker" size={16} color={color.inkSoft} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <Txt style={[type.heading, { fontSize: 18 }]}>{line.text}</Txt>
        {open && <Txt style={[type.small, { color: color.inkSoft }]}>{line.gloss}</Txt>}
      </View>
      {reveal && !open && (
        <Pressable accessibilityRole="button" accessibilityLabel={`What does "${line.text}" mean?`} onPress={() => setOpen(true)} hitSlop={8}>
          <Icon name="question" size={20} color={color.inkMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  play: { width: 34, height: 34, borderRadius: radius.pill, backgroundColor: color.paperDeep, alignItems: 'center', justifyContent: 'center' },
});
