import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

type Chip = { id: string; label: string };

type Props = {
  items: Chip[];
  selectedId?: string;
  onSelect: (id: string) => void;
  activeStyle?: StyleProp<ViewStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
  chipStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  scrollRef?: React.RefObject<ScrollView | null>;
};

export function ChipRow({ items, selectedId, onSelect, activeStyle, activeTextStyle, chipStyle, textStyle, accessibilityLabel, scrollRef }: Props) {
  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.content}
      accessibilityLabel={accessibilityLabel}
    >
      {items.map(item => (
        <Pressable
          key={item.id}
          onPress={() => onSelect(item.id)}
          style={[styles.chip, chipStyle, selectedId === item.id && activeStyle]}
        >
          <Text style={[styles.text, textStyle, selectedId === item.id && activeTextStyle]} numberOfLines={1}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexGrow: 0, flexShrink: 0 },
  content: { alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  chip: { height: 42, minWidth: 72, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 10, fontWeight: '900', textAlign: 'center' },
});
