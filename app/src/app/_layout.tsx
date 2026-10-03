import { router, Stack } from 'expo-router';
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
  useEffect(() => {
    if (!ready) return;
    void SplashScreen.hideAsync().catch(() => {});
    if (!introDone) router.replace({ pathname: '/play/[id]', params: { id: 'lodge.intro' } });
    // Only on launch.
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function RootLayout() {
  const ready = useGame((s) => s.ready);
  const hydrate = useGame((s) => s.hydrate);
  const reduced = useReducedMotion();
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  if (!ready) return <View style={{ flex: 1, backgroundColor: color.night }} />;
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
      </Stack>
      <Toasts />
    </View>
  );
}
