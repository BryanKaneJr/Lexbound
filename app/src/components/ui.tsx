import * as Haptics from 'expo-haptics';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/art/icons';
import { playSfx } from '@/audio/sfx';
import { useGame } from '@/state/store';
import { color, radius, shadow, space, type } from '@/theme/tokens';

/** Reduce Motion: the player's own setting, or the system's. */
export function useReducedMotion(): boolean {
  const setting = useGame((s) => s.save.settings.reducedMotion);
  const [system, setSystem] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setSystem(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystem);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return setting || system;
}

export function tapFeedback(): void {
  playSfx('tap');
  if (Platform.OS !== 'web' && useGame.getState().save.settings.haptics) void Haptics.selectionAsync().catch(() => {});
}

/** Text that follows the player's text-size setting. */
export function Txt({ style, children, ...rest }: TextProps & { style?: StyleProp<TextStyle> }) {
  const scale = useGame((s) => s.save.settings.textScale);
  const flat = StyleSheet.flatten(style) ?? {};
  const scaled: TextStyle = { ...flat };
  if (typeof flat.fontSize === 'number') scaled.fontSize = flat.fontSize * scale;
  if (typeof flat.lineHeight === 'number') scaled.lineHeight = flat.lineHeight * scale;
  return (
    <Text {...rest} style={[{ color: color.ink }, scaled]}>
      {children}
    </Text>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'quiet';
  icon?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  a11y?: string;
};

export function Button({ label, onPress, kind = 'primary', icon, disabled, style, a11y }: ButtonProps) {
  const bg = kind === 'primary' ? color.amber : kind === 'secondary' ? color.paper : 'transparent';
  const border = kind === 'secondary' ? color.paperLine : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y ?? label}
      disabled={disabled}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        kind === 'primary' && shadow.card,
        style,
      ]}>
      {icon && <Icon name={icon} size={20} color={kind === 'primary' ? color.ink : color.inkSoft} />}
      <Txt style={[type.heading, { fontSize: 17, color: kind === 'quiet' ? color.inkSoft : color.ink }]}>{label}</Txt>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label, size = 22, tint = color.ink, style }: { icon: string; onPress: () => void; label: string; size?: number; tint?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }, style]}>
      <Icon name={icon} size={size} color={tint} />
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** A plain paper screen with safe-area padding (for tabs and menus). */
export function Screen({ children, style, padTop = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padTop?: boolean }) {
  const insets = useSafeAreaInsets();
  return <View style={[{ flex: 1, backgroundColor: color.paperDeep, paddingTop: padTop ? insets.top : 0 }, style]}>{children}</View>;
}

export function Bar({ value, max, tint, height = 10, track = 'rgba(0,0,0,0.12)' }: { value: number; max: number; tint: string; height?: number; track?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: height, backgroundColor: tint }} />
    </View>
  );
}

export const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderWidth: 2,
  },
  iconButton: { padding: space.sm, borderRadius: radius.pill },
  card: { backgroundColor: color.paper, borderRadius: radius.lg, padding: space.lg, borderWidth: 1, borderColor: color.paperLine, ...shadow.card },
});
