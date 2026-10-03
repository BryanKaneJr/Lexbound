import type { Notice } from '@lexbound/core';
import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/art/icons';
import { playSfx } from '@/audio/sfx';
import { content } from '@/game/content';
import { useGame } from '@/state/store';
import { color, radius, shadow, space, type } from '@/theme/tokens';
import { Txt } from './ui';

/**
 * What just changed, shown briefly at the top: bond, XP, items, new
 * Lexlings, journal entries. Progress talk only, never about language: the
 * game doesn't announce mastery (bible §48).
 */
/** Several of the same kind at once (four items from Maren) become one toast. */
export type Toastable = Notice & { key: number; more?: number };

export function mergeNotices(notices: (Notice & { key: number })[]): Toastable[] {
  const out: Toastable[] = [];
  for (const n of notices) {
    const same = out.find((o) => o.type === n.type && (n.type === 'item' || n.type === 'journal' || n.type === 'discovered'));
    if (same) same.more = (same.more ?? 0) + 1;
    else out.push({ ...n });
  }
  return out.slice(0, 4);
}

export function noticeText(n: Notice): { icon: string; text: string } {
  switch (n.type) {
    case 'bond':
      return { icon: 'heart', text: n.amount > 0 ? `Bond +${n.amount}` : `Bond ${n.amount}` };
    case 'xp':
      return { icon: 'star', text: `+${n.amount} XP` };
    case 'levelUp':
      return { icon: 'star', text: `Milo reached level ${n.level}!` };
    case 'item':
      return { icon: content.item.get(n.item)?.icon ?? 'bag', text: `Got: ${content.item.get(n.item)?.name ?? n.item}` };
    case 'discovered':
      return { icon: 'journal', text: `New Lexling: ${content.lexling.get(n.lexling)?.name ?? n.lexling}` };
    case 'befriended':
      return { icon: 'heart', text: `${content.lexling.get(n.lexling)?.name ?? n.lexling} is your friend now` };
    case 'journal':
      return { icon: 'journal', text: `Journal: ${content.entry.get(n.entry)?.title ?? n.entry}` };
  }
}

const ND = Platform.OS !== 'web';

function Toast({ notice, onDone, index }: { notice: Toastable; onDone: () => void; index: number }) {
  const [a] = useState(() => new Animated.Value(0));
  useEffect(() => {
    playSfx(notice.type === 'bond' ? 'bond' : notice.type === 'levelUp' || notice.type === 'befriended' ? 'sparkle' : 'pop');
    const anim = Animated.sequence([
      Animated.delay(index * 220),
      Animated.spring(a, { toValue: 1, useNativeDriver: ND, friction: 7 }),
      Animated.delay(2200),
      Animated.timing(a, { toValue: 0, duration: 220, useNativeDriver: ND }),
    ]);
    anim.start(({ finished }) => finished && onDone());
    return () => anim.stop();
    // Each toast runs once.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { icon, text: base } = noticeText(notice);
  const text = notice.more ? `${base} +${notice.more} more` : base;
  return (
    <Animated.View style={[styles.toast, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] }]} accessibilityLiveRegion="polite">
      <Icon name={icon} size={20} />
      <Txt style={[type.small, { fontSize: 14 }]}>{text}</Txt>
    </Animated.View>
  );
}

export function Toasts() {
  const notices = useGame((s) => s.notices);
  const dismiss = useGame((s) => s.dismiss);
  const shown = mergeNotices(notices);
  const done = (key: number) => {
    // A merged toast stands for every notice of its kind that was waiting.
    const t = shown.find((x) => x.key === key);
    for (const n of notices) if (n.key === key || (t?.more && n.type === t.type)) dismiss(n.key);
  };
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + space.sm }]}>
      {shown.map((n, i) => (
        <Toast key={n.key} notice={n} index={i} onDone={() => done(n.key)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: space.xs, zIndex: 50 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.paper,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderWidth: 1,
    borderColor: color.paperLine,
    ...shadow.lift,
  },
});
