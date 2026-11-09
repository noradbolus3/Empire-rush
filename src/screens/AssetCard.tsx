import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CollectionItem } from '../data/collectionTypes';
import { designSystem } from '../theme/designSystem';

const C = { bg: designSystem.colors.background, panel: designSystem.colors.card, panel2: designSystem.colors.highlight, green: designSystem.colors.primary, cyan: designSystem.colors.cyan, gold: designSystem.colors.gold, slate: designSystem.colors.border, text: designSystem.colors.heading, muted: designSystem.colors.secondary };
const money = (value: number) => `$${value.toLocaleString('en-US')}`;

export type AssetCardProps = {
  item: CollectionItem;
  owned: boolean;
  canAfford: boolean;
  shortBy?: number;
  onAcquire: (item: CollectionItem) => void;
};

export function AssetCard({ item, owned, canAfford, shortBy = 0, onAcquire }: AssetCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        {item.image && !imageFailed ? (
          <Image source={item.image} resizeMode="cover" style={styles.image} onError={() => setImageFailed(true)} />
        ) : (
          <View style={[styles.image, styles.imageUnavailable]}>
            <Text style={styles.unavailableText}>IMAGE LOAD FAILED</Text>
            <Text style={styles.assetError}>asset: {item.id}</Text>
          </View>
        )}
        <View style={styles.imageShade}>
          <Text style={styles.type}>{item.type.toUpperCase()}</Text>
          <Text style={styles.prestige}>PRESTIGE +{item.prestige}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.price}>{money(item.price)}</Text>
        </View>
        <View style={styles.actionRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.metaLabel}>UPKEEP</Text>
            <Text style={styles.metaValue}>{money(item.upkeep)} / mo</Text>
          </View>
          {owned ? (
            <View style={[styles.button, styles.ownedPill]}><Text style={styles.ownedText}>OWNED</Text></View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Acquire ${item.name}`}
              disabled={!canAfford}
              onPress={() => onAcquire(item)}
              style={({ pressed }) => [styles.button, styles.acquire, !canAfford && styles.locked, pressed && styles.pressed]}
            >
              <Text style={[styles.acquireText, !canAfford && styles.lockedText]} numberOfLines={1}>{canAfford ? 'ACQUIRE' : shortBy > 0 ? `NEED ${money(shortBy)} MORE` : 'LOCKED'}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.panel, borderRadius: 16, borderWidth: 1, borderColor: C.slate, overflow: 'hidden', marginBottom: 10 },
  imageFrame: { height: 128, overflow: 'hidden', backgroundColor: C.panel2 },
  image: { width: '100%', height: 128, backgroundColor: C.panel2, transform: [{ scale: 1.1 }] },
  imageUnavailable: { alignItems: 'center', justifyContent: 'center' },
  unavailableText: { color: C.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  assetError: { color: C.muted, fontSize: 9, marginTop: 6 },
  imageShade: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 26, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(16,37,68,.72)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { color: '#BFE9FF', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  prestige: { color: '#FFD76A', fontSize: 9, fontWeight: '900' },
  body: { paddingHorizontal: 12, paddingVertical: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, color: C.text, fontSize: 16, fontWeight: '900' },
  price: { color: '#9A7415', fontSize: 16, fontWeight: '900' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  metaLabel: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  metaValue: { color: C.text, fontSize: 12, fontWeight: '800', marginTop: 1 },
  button: { minWidth: 138, minHeight: 40, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ownedPill: { backgroundColor: '#E7F5EF', borderWidth: 1, borderColor: C.green },
  ownedText: { color: C.green, fontSize: 11, fontWeight: '900', letterSpacing: .7 },
  acquire: { backgroundColor: '#2563C9' },
  locked: { backgroundColor: '#EEF1F4', borderWidth: 1, borderColor: '#CBD6E2' },
  pressed: { opacity: .78, transform: [{ scale: .985 }] },
  acquireText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  lockedText: { color: '#61758E' },
});
