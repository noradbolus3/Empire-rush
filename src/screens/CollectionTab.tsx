import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChipRow } from '../components/ChipRow';
import type { CollectionItem } from '../data/collectionTypes';
import { AssetCard } from './AssetCard';

const C = { bg: '#07130F', panel: '#0D241A', panel2: '#123726', green: '#16E98A', cyan: '#61E8FF', gold: '#FFC928', slate: '#236A45', text: '#F7FFF9', muted: '#8FB5A4' };

type SortMode = 'PRICE_ASC' | 'PRICE_DESC' | 'PRESTIGE_DESC';
export type CollectionTabProps = { data: CollectionItem[]; owned: string[]; cash: number; onAcquire: (item: CollectionItem) => void };

export function CollectionTab({ data, owned, cash, onAcquire }: CollectionTabProps) {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('PRICE_ASC');
  const types = useMemo(() => ['ALL', ...Array.from(new Set(data.map(item => item.type)))], [data]);
  const visible = useMemo(() => data
    .filter(item => typeFilter === 'ALL' || item.type === typeFilter)
    .sort((a, b) => sortMode === 'PRICE_ASC' ? a.price - b.price : sortMode === 'PRICE_DESC' ? b.price - a.price : b.prestige - a.prestige), [data, sortMode, typeFilter]);
  return <View>
    <ChipRow items={types.map(type => ({ id: type, label: type }))} selectedId={typeFilter} onSelect={setTypeFilter} chipStyle={styles.chip} activeStyle={styles.chipOn} textStyle={styles.chipText} activeTextStyle={styles.chipTextOn} accessibilityLabel="Lifestyle category filters" />
    <ChipRow items={[{ id: 'PRICE_ASC', label: 'PRICE ↑' }, { id: 'PRICE_DESC', label: 'PRICE ↓' }, { id: 'PRESTIGE_DESC', label: 'PRESTIGE ↓' }]} selectedId={sortMode} onSelect={value => setSortMode(value as SortMode)} chipStyle={styles.sortChip} activeStyle={styles.sortChipOn} textStyle={styles.chipText} activeTextStyle={styles.chipTextOn} accessibilityLabel="Lifestyle sort filters" />
    <Text style={styles.resultCount}>{visible.length} ASSETS · SORTED LIVE</Text>
    {visible.map(item => <AssetCard key={item.id} item={item} owned={owned.includes(item.id)} canAfford={cash >= item.price} onAcquire={onAcquire} />)}
  </View>;
}

const styles = StyleSheet.create({
  chips: { gap: 8, paddingBottom: 8 },
  chip: { height: 42, backgroundColor: C.panel, borderRadius: 10, borderWidth: 1, borderColor: C.slate, paddingHorizontal: 11, justifyContent: 'center' },
  chipOn: { backgroundColor: '#123D34', borderColor: C.green },
  sortChip: { height: 42, backgroundColor: C.panel2, borderRadius: 10, borderWidth: 1, borderColor: C.slate, paddingHorizontal: 12, justifyContent: 'center' },
  sortChipOn: { backgroundColor: '#203C3A', borderColor: C.cyan },
  chipText: { color: C.muted, fontSize: 9, fontWeight: '900' },
  chipTextOn: { color: C.green },
  resultCount: { color: C.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: 3, marginBottom: 10 },
});
