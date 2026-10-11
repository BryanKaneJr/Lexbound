// One import per weight, so only the weights the game uses ship with it.
import { AtkinsonHyperlegible_400Regular } from '@expo-google-fonts/atkinson-hyperlegible/400Regular';
import { AtkinsonHyperlegible_400Regular_Italic } from '@expo-google-fonts/atkinson-hyperlegible/400Regular_Italic';
import { AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible/700Bold';
import { AtkinsonHyperlegible_700Bold_Italic } from '@expo-google-fonts/atkinson-hyperlegible/700Bold_Italic';
import { Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces/400Regular_Italic';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { Fraunces_900Black } from '@expo-google-fonts/fraunces/900Black';
import { useFonts } from 'expo-font';
import { router, Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Toasts } from '@/components/Toasts';
import { useReducedMotion } from '@/components/ui';
import { useGame } from '@/state/store';
import { color } from '@/theme/tokens';

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = { initialRouteName: '(tabs)' };

/** First launch goes straight into the opening scene at the Lodge: meeting Milo. */
function FirstRun() {
  const ready = useGame((s) => s.ready);
  const introDone = useGame((s) => !!s.save.flags['intro.done']);
  const path = usePathname();
  useEffect(() => {
    if (!ready) return;
    void SplashScreen.hideAsync().catch(() => {});
    // Developer screens open as themselves, even on a fresh install.
    if (!introDone && !path.startsWith('/debug') && !path.startsWith('/artlab')) router.replace({ pathname: '/play/[id]', params: { id: 'lodge.intro' } });
    // Only on launch.
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function RootLayout() {
  const ready = useGame((s) => s.ready);
  const hydrate = useGame((s) => s.hydrate);
  const reduced = useReducedMotion();
  // The typefaces ship with the app (no network): Fraunces for display, Atkinson Hyperlegible for reading.
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_900Black,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_400Regular_Italic,
    AtkinsonHyperlegible_700Bold,
    AtkinsonHyperlegible_700Bold_Italic,
  });
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  // A font that fails to load falls back to the system face rather than blocking the game.
  if (!ready || (!fontsLoaded && !fontError)) return <View style={{ flex: 1, backgroundColor: color.night }} />;
  return (
    <View style={{ flex: 1, backgroundColor: color.night }}>
      <StatusBar style="light" />
      <FirstRun />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.paperDeep }, animation: reduced ? 'fade' : 'default' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="play/[id]" options={{ gestureEnabled: false, animation: reduced ? 'fade' : 'fade_from_bottom' }} />
        <Stack.Screen name="battle/[enemy]" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="place/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="debug" />
        <Stack.Screen name="artlab" />
      </Stack>
      <Toasts />
    </View>
  );
}
