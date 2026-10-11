import { WRITING } from '@lexbound/core';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '@/art/icons';
import { content, lineIcons, speakerName } from '@/game/content';
import { color, radius, shadow, space, type } from '@/theme/tokens';
import { tapFeedback, Txt } from './ui';

/**
 * A creature's words. The text is the creature language exactly as spoken,
 * never with a translation beside it (bible §7). While a word is new, its
 * icon may sit beside it; once the player knows the line well enough, it can
 * play as sound first, with the words a tap away.
 */
export function SpeechBubble({ lineId, icons, audioFirst, onReveal }: { lineId: string; icons: boolean; audioFirst: boolean; onReveal?: () => void }) {
  const line = content.line.get(lineId);
  if (!line) return null;
  const marks = icons ? lineIcons(lineId) : [];
  return (
    <View style={styles.bubble} accessibilityLabel={`${speakerName(line.speaker)} says: ${line.text}`}>
      {audioFirst ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show the words"
          onPress={() => {
            tapFeedback();
            onReveal?.();
          }}
          style={styles.row}>
          <Icon name="speaker" size={22} color={color.inkSoft} />
          <Txt style={[type.creature, { color: color.inkMuted }]}>· · ·</Txt>
        </Pressable>
      ) : (
        <View style={styles.row}>
          <Txt style={type.creature} testID="creature-line">
            {line.text}
          </Txt>
          {marks.map((m, i) => (
            <Icon key={`${m}${i}`} name={m} size={24} />
          ))}
        </View>
      )}
      <View style={styles.tail} />
    </View>
  );
}

/** "Hear it again" and the help ladder, under the scene while a creature is talking. */
export function SpeechHelp({ lineId, rung, onReplay, onHelp }: { lineId: string; rung: 0 | 1 | 2 | 3; onReplay: () => void; onHelp: () => void }) {
  const line = content.line.get(lineId);
  if (!line) return null;
  const written = line.speaker === WRITING;
  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.helpRow}>
        {!written && (
          <Pressable accessibilityRole="button" accessibilityLabel="Hear it again" onPress={onReplay} style={styles.chip}>
            <Icon name="speaker" size={16} color={color.inkSoft} />
            <Txt style={[type.small, { color: color.inkSoft }]}>Again</Txt>
          </Pressable>
        )}
        {rung < 3 && (
          <Pressable accessibilityRole="button" accessibilityLabel={rung === 0 ? 'Help' : 'More help'} onPress={onHelp} style={styles.chip}>
            <Icon name="question" size={16} color={color.inkSoft} />
            <Txt style={[type.small, { color: color.inkSoft }]}>{rung === 0 ? 'Help' : 'More help'}</Txt>
          </Pressable>
        )}
      </View>
      {rung >= 1 && rung < 2 && <Txt style={[type.small, styles.hint]}>{written ? 'You trace the letters again, one by one.' : `${speakerName(line.speaker)} says it again, slowly.`}</Txt>}
      {rung >= 2 && line.clue && <Txt style={[type.body, styles.hint]}>{line.clue}</Txt>}
      {rung >= 3 && (
        <Txt style={[type.body, styles.gloss]} testID="gloss">
          It means: {line.gloss}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: color.creature,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderWidth: 2,
    borderColor: color.creatureLine,
    ...shadow.lift,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  tail: {
    position: 'absolute',
    bottom: -9,
    alignSelf: 'center',
    width: 16,
    height: 16,
    backgroundColor: color.creature,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: color.creatureLine,
    transform: [{ rotate: '45deg' }],
  },
  helpRow: { flexDirection: 'row', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: color.paper,
    borderWidth: 1,
    borderColor: color.paperLine,
  },
  hint: { color: color.inkSoft, fontStyle: 'italic' },
  gloss: { color: color.ink, fontWeight: '700' },
});
