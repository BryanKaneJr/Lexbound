import { bondTier, levelForXp, levelProgress, miloMaxHp, xpForLevel } from '@lexbound/core';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Actor } from '@/art/Actor';
import { Icon } from '@/art/icons';
import { HeardLine } from '@/components/HeardLine';
import { Bar, Card, Screen, tapFeedback, Txt, useReducedMotion } from '@/components/ui';
import { content, elementColor } from '@/game/content';
import { useGame } from '@/state/store';
import { color, space, type } from '@/theme/tokens';

/** Milo's page: who he is to you, what he can do, and the things he says. */
export default function MiloScreen() {
  const save = useGame((s) => s.save);
  const reduced = useReducedMotion();
  const [anim, setAnim] = useState<{ name: string; key: number }>({ name: 'hop', key: 0 });
  const key = useRef(0);
  const level = levelForXp(save.milo.xp);
  const tier = bondTier(save.milo.bond);
  const said = Object.keys(save.journal.heard).filter((id) => content.line.get(id)?.speaker === 'milo' && (content.line.get(id)?.concepts.length ?? 0) > 0);
  const met = !!save.flags['intro.done'];
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }}>
        <View style={{ alignItems: 'center', gap: space.sm }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Milo"
            onPress={() => {
              tapFeedback();
              setAnim({ name: ['hop', 'spin', 'bounce', 'wave'][key.current % 4]!, key: ++key.current });
            }}>
            <Actor art="milo" height={180} mood={met ? 'happy' : 'curious'} anim={anim.name} animKey={anim.key} reduced={reduced} />
          </Pressable>
          <Txt style={type.title}>Milo</Txt>
          <Txt style={[type.small, { color: color.inkSoft }]}>A Lexling of unknown kind. Found at the edge of Whisperwood.</Txt>
        </View>
        <Card style={{ gap: space.md }}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt style={type.heading}>Level {level}</Txt>
              <Txt style={[type.small, { color: color.inkSoft }]}>
                {save.milo.xp} / {xpForLevel(level + 1)} XP
              </Txt>
            </View>
            <Bar value={levelProgress(save.milo.xp)} max={1} tint={color.amber} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={type.body}>Health</Txt>
            <Txt style={[type.body, { fontWeight: '800' }]}>{miloMaxHp(content, level)}</Txt>
          </View>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Icon name="heart" size={16} />
                <Txt style={type.body}>Bond</Txt>
              </View>
              <Txt style={[type.body, { color: color.heart, fontWeight: '800' }]}>{tier.name}</Txt>
            </View>
            <Bar value={save.milo.bond} max={100} tint={color.heart} />
          </View>
        </Card>
        <Card style={{ gap: space.md }}>
          <Txt style={[type.label, { color: color.inkMuted }]}>Magic</Txt>
          <Txt style={[type.body, { color: color.inkSoft }]}>{"Milo can use water, fire, earth and wind. Maren says that shouldn't be possible."}</Txt>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {content.elements.elements.map((e) => (
              <View key={e.id} style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: elementColor(e.id) + '22', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={e.id} size={30} />
              </View>
            ))}
          </View>
          {save.flags['milo.defend'] && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Icon name="burst" size={22} />
              <Icon name="shield" size={22} />
              <Txt style={[type.body, { color: color.inkSoft, flex: 1 }]}>He can throw any of them, or hold one up as a shield. He likes you to say which.</Txt>
            </View>
          )}
        </Card>
        <Card style={{ gap: space.xs }}>
          <Txt style={[type.label, { color: color.inkMuted, marginBottom: space.xs }]}>Things Milo says</Txt>
          {said.length === 0 ? <Txt style={[type.body, { color: color.inkSoft }]}>Nothing yet. Go say hello.</Txt> : said.map((id) => <HeardLine key={id} lineId={id} />)}
        </Card>
      </ScrollView>
    </Screen>
  );
}
