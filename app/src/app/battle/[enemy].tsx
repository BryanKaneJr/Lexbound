import { router, useLocalSearchParams } from 'expo-router';
import { Battle } from '@/components/Battle';
import { content } from '@/game/content';

/** A battle outside any encounter, for the developer tools ("force battle", bible §72). */
export default function BattleRoute() {
  const { enemy } = useLocalSearchParams<{ enemy: string }>();
  if (!content.lexling.get(enemy)?.battle) return null;
  return <Battle enemy={enemy} background="forest_stream" context={`debug.${enemy}`} onEnd={() => (router.canGoBack() ? router.back() : router.replace('/'))} />;
}
