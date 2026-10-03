import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/art/icons';
import { color } from '@/theme/tokens';

/**
 * An RPG's navigation, never a course's (bible §55): Camp, Map, Milo,
 * Journal, Bag. No Lessons, Practice or Review tabs, ever.
 */
function tab(icon: string) {
  return function TabIcon({ focused }: { focused: boolean }) {
    return <Icon name={icon} size={24} color={focused ? color.amberDeep : color.inkMuted} />;
  };
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.ink,
        tabBarInactiveTintColor: color.inkMuted,
        tabBarStyle: { backgroundColor: color.paper, borderTopColor: color.paperLine, height: 62 + insets.bottom, paddingTop: 6 },
        tabBarLabel: ({ color: tint, children }) => <Text style={{ color: tint, fontSize: 11, fontWeight: '800' }}>{children}</Text>,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Camp', tabBarIcon: tab('tent') }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: tab('map') }} />
      <Tabs.Screen name="milo" options={{ title: 'Milo', tabBarIcon: tab('milo') }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal', tabBarIcon: tab('journal') }} />
      <Tabs.Screen name="bag" options={{ title: 'Bag', tabBarIcon: tab('bag') }} />
    </Tabs>
  );
}
