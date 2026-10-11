import { StyleSheet, View } from 'react-native';
import { content } from '@/game/content';
import { radius, shadow, space } from '@/theme/tokens';
import { Txt } from './ui';

/**
 * Words carved in stone (language bible §37): written Lexling, shown as it
 * was found, with no speaker and no voice. Like speech, it never carries a
 * translation; the help ladder below the scene still works.
 */
export function Inscription({ lineId, width }: { lineId: string; width: number }) {
  const line = content.line.get(lineId);
  if (!line) return null;
  return (
    <View style={[styles.slab, { maxWidth: width * 0.84 }]} accessibilityLabel={`Carved in stone: ${line.text}`} testID="inscription">
      <View style={styles.inner}>
        <Txt style={styles.letters} testID="creature-line">
          {line.text}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slab: {
    alignSelf: 'center',
    backgroundColor: '#7C8079',
    borderRadius: radius.md,
    padding: 5,
    borderWidth: 2,
    borderColor: '#5B5F59',
    ...shadow.lift,
  },
  inner: {
    backgroundColor: '#8E928A',
    borderRadius: radius.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#6A6E67',
    borderLeftColor: '#6A6E67',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: '#A9ADA4',
    borderRightColor: '#A9ADA4',
  },
  letters: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    color: '#E9E4D6',
    textShadowColor: 'rgba(30, 32, 28, 0.85)',
    textShadowOffset: { width: -1, height: -1 },
    textShadowRadius: 1,
  },
});
