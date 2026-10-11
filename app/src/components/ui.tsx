import * as Haptics from 'expo-haptics';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import { Icon } from '@/art/icons';
import { Grain, Vignette } from '@/art/paint';
import { playSfx } from '@/audio/sfx';
import { useGame } from '@/state/store';
import { color, font, radius, shadow, space } from '@/theme/tokens';

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

const CUSTOM = new Set<string>(Object.values(font));

/**
 * Text that follows the player's text-size setting, in the game's typefaces.
 * Custom fonts carry their weight in the family name, so a bare `fontWeight`
 * picks the right Atkinson file and is then dropped (a synthetic bold looks
 * smeared, and Android ignores weights on custom families).
 */
export function Txt({ style, children, ...rest }: TextProps & { style?: StyleProp<TextStyle> }) {
  const scale = useGame((s) => s.save.settings.textScale);
  const flat = StyleSheet.flatten(style) ?? {};
  const { fontWeight, fontStyle, ...scaled }: TextStyle = { ...flat };
  if (!scaled.fontFamily || !CUSTOM.has(scaled.fontFamily)) {
    const bold = Number(fontWeight ?? 400) >= 600;
    const italic = fontStyle === 'italic';
    scaled.fontFamily = bold ? (italic ? font.uiBoldItalic : font.uiBold) : italic ? font.uiItalic : font.ui;
  }
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
  const border = kind === 'primary' ? color.amberDeep : kind === 'secondary' ? color.edge : 'transparent';
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
        { backgroundColor: pressed && kind !== 'quiet' ? (kind === 'primary' ? color.amberDeep : color.paperDeep) : bg, borderColor: border, opacity: disabled ? 0.5 : 1, transform: [{ translateY: pressed ? 1 : 0 }] },
        kind !== 'quiet' && styles.buttonDepth,
        style,
      ]}>
      {icon && <Icon name={icon} size={20} color={kind === 'primary' ? color.ink : color.inkSoft} />}
      <Txt style={{ fontFamily: font.uiBold, fontSize: 17, color: kind === 'quiet' ? color.inkSoft : color.ink }}>{label}</Txt>
    </Pressable>
  );
}

/** An option the player picks in a scene: an action, never an answer (bible §32). */
export function Choice({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [styles.choice, pressed && { backgroundColor: color.amberSoft, transform: [{ translateY: 1 }] }]}>
      <View style={styles.choiceMark} />
      <Txt style={{ fontFamily: font.uiBold, fontSize: 17, color: color.ink, flex: 1 }}>{label}</Txt>
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

/** Fine grain and a warm vignette, so a paper surface reads as paper. Fills its parent. */
export function PaperTexture({ strength = 0.22 }: { strength?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = (n: string) => `${n}${uid}`;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 400 460" preserveAspectRatio="none">
        <Vignette g={g} color="#6B4A22" strength={strength} cy={0.4} />
        <Grain g={g} />
      </Svg>
    </View>
  );
}

/**
 * The parchment box dialogue and choices sit in, on a scene's ground: an
 * inked edge, a faint inner rule, paper grain. `name` puts a name plate on
 * its top edge for whoever is speaking.
 */
export function Panel({ children, name, nameColor, style }: { children: ReactNode; name?: string; nameColor?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.panel, style]}>
      <View style={styles.panelInner}>
        <PaperTexture strength={0.16} />
        {children}
      </View>
      {name ? (
        <View style={[styles.namePlate, { backgroundColor: nameColor ?? color.ink }]}>
          <Txt style={{ fontFamily: font.displaySemi, fontSize: 15, color: color.paper, letterSpacing: 0.3 }}>{name}</Txt>
        </View>
      ) : null}
    </View>
  );
}

/** A paper screen with safe-area padding (for tabs and menus). */
export function Screen({ children, style, padTop = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padTop?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: color.paperDeep, paddingTop: padTop ? insets.top : 0 }, style]}>
      <PaperTexture />
      {children}
    </View>
  );
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
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderWidth: 2,
  },
  buttonDepth: { borderBottomWidth: 4, ...shadow.card },
  choice: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: color.paper,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: color.edge,
  },
  choiceMark: { width: 10, height: 10, backgroundColor: color.amberDeep, transform: [{ rotate: '45deg' }], borderRadius: 2 },
  iconButton: { padding: space.sm, borderRadius: radius.pill },
  card: { backgroundColor: color.paper, borderRadius: radius.lg, padding: space.lg, borderWidth: 1.5, borderColor: color.paperLine, ...shadow.card },
  panel: { borderRadius: radius.lg + 2, borderWidth: 2.5, borderColor: color.edgeDark, backgroundColor: color.paper, ...shadow.lift },
  panelInner: { margin: 3, borderRadius: radius.lg - 1, borderWidth: 1, borderColor: color.paperLine, padding: space.lg, paddingTop: space.lg + 4, overflow: 'hidden', gap: space.md },
  namePlate: { position: 'absolute', top: -15, left: space.lg, paddingHorizontal: space.md, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 2, borderColor: color.paper, ...shadow.card },
});
