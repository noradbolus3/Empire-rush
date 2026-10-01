import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CollectionItem } from '../data/collectionTypes';

const C = { bg: '#07130F', panel: '#0D241A', panel2: '#123726', green: '#16E98A', cyan: '#61E8FF', gold: '#FFC928', slate: '#236A45', text: '#F7FFF9', muted: '#8FB5A4' };
const money = (value: number) => `$${value.toLocaleString('en-US')}`;

export type AssetCardProps = {
  item: CollectionItem;
  owned: boolean;
  canAfford: boolean;
  onAcquire: (item: CollectionItem) => void;
};

export function AssetCard({ item, owned, canAfford, onAcquire }: AssetCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <View style={styles.card}>
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
      <View style={styles.body}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{money(item.price)}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>UPKEEP</Text>
          <Text style={styles.metaValue}>{money(item.upkeep)} / MO</Text>
        </View>
        {owned ? (
          <View style={styles.ownedPill}><Text style={styles.ownedText}>OWNED · ACTIVE PRESTIGE</Text></View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Acquire ${item.name}`}
            disabled={!canAfford}
            onPress={() => onAcquire(item)}
            style={({ pressed }) => [styles.acquire, !canAfford && styles.locked, pressed && styles.pressed]}
          >
            <Text style={styles.acquireText}>{canAfford ? 'ACQUIRE ASSET' : 'LOCKED · NEED MORE CASH'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.panel, borderRadius: 18, borderWidth: 1, borderColor: C.slate, overflow: 'hidden', marginBottom: 14 },
  image: { width: '100%', height: 154, backgroundColor: C.panel2 },
  imageUnavailable: { alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: C.slate },
  unavailableText: { color: C.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  assetError: { color: C.muted, fontSize: 9, marginTop: 6 },
  imageShade: { position: 'absolute', left: 0, right: 0, top: 124, minHeight: 30, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(4,16,11,.72)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { color: C.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  prestige: { color: C.gold, fontSize: 9, fontWeight: '900' },
  body: { padding: 14 },
  name: { color: C.text, fontSize: 18, fontWeight: '900' },
  price: { color: C.gold, fontSize: 19, fontWeight: '900', marginTop: 5, marginBottom: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 11, marginBottom: 11, borderBottomWidth: 1, borderBottomColor: '#1E5139' },
  metaLabel: { color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  metaValue: { color: C.text, fontSize: 11, fontWeight: '800' },
  ownedPill: { borderRadius: 10, paddingVertical: 11, alignItems: 'center', backgroundColor: '#123D2C', borderWidth: 1, borderColor: C.green },
  ownedText: { color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: .7 },
  acquire: { backgroundColor: C.green, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  locked: { backgroundColor: '#253B32', borderWidth: 1, borderColor: '#3A6250' },
  pressed: { opacity: .78, transform: [{ scale: .985 }] },
  acquireText: { color: C.bg, fontSize: 10, fontWeight: '900' },
});
