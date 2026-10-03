import { ScrollView, View } from 'react-native';
import { Icon } from '@/art/icons';
import { Card, Screen, Txt } from '@/components/ui';
import { content } from '@/game/content';
import { useGame } from '@/state/store';
import { color, space, type } from '@/theme/tokens';

/** A light bag (bible §38): a handful of things that matter, no inventory management. */
export default function Bag() {
  const items = useGame((s) => s.save.items);
  const owned = content.items.filter((i) => (items[i.id] ?? 0) > 0);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <Txt style={type.title}>Bag</Txt>
        {owned.length === 0 && <Txt style={[type.body, { color: color.inkSoft }]}>Empty, apart from crumbs.</Txt>}
        {owned.map((item) => (
          <Card key={item.id} style={{ flexDirection: 'row', gap: space.lg, alignItems: 'center' }}>
            <Icon name={item.icon} size={44} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt style={type.heading}>
                {item.name}
                {(items[item.id] ?? 0) > 1 ? ` ×${items[item.id]}` : ''}
              </Txt>
              <Txt style={[type.small, { color: color.inkSoft }]}>{item.description}</Txt>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
