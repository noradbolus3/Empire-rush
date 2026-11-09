import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChipRow } from '../components/ChipRow';
import type { CollectionItem } from '../data/collectionTypes';
import { AssetCard } from './AssetCard';

const C = { bg: '#F4F8FC', panel: '#FFFFFF', panel2: '#EEF3F9', green: '#2563C9', cyan: '#2563C9', gold: '#9A7415', slate: '#D5E0EC', text: '#102544', muted: '#61758E' };

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
    <ChipRow items={types.map(type => ({ id: type, label: type }))} flush selectedId={typeFilter} onSelect={setTypeFilter} chipStyle={styles.chip} activeStyle={styles.chipOn} textStyle={styles.chipText} activeTextStyle={styles.chipTextOn} accessibilityLabel="Lifestyle category filters" />
    <ChipRow items={[{ id: 'PRICE_ASC', label: 'PRICE ↑' }, { id: 'PRICE_DESC', label: 'PRICE ↓' }, { id: 'PRESTIGE_DESC', label: 'PRESTIGE ↓' }]} flush selectedId={sortMode} onSelect={value => setSortMode(value as SortMode)} chipStyle={styles.sortChip} activeStyle={styles.sortChipOn} textStyle={styles.chipText} activeTextStyle={styles.chipTextOn} accessibilityLabel="Lifestyle sort filters" />
    <Text style={styles.resultCount}>{visible.length} ASSETS · SORTED LIVE</Text>
    {visible.map(item => <AssetCard key={item.id} item={item} owned={owned.includes(item.id)} canAfford={cash >= item.price} shortBy={Math.max(0, item.price - cash)} onAcquire={onAcquire} />)}
  </View>;
}

const styles = StyleSheet.create({
  chips: { gap: 8, paddingBottom: 6 },
  chip: { height: 36, minWidth: 0, backgroundColor: C.panel, borderRadius: 18, borderWidth: 1, borderColor: C.slate, paddingHorizontal: 13, justifyContent: 'center' },
  chipOn: { backgroundColor: '#E3EDFC', borderColor: C.green },
  sortChip: { height: 30, minWidth: 0, backgroundColor: 'transparent', borderRadius: 15, borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 10, justifyContent: 'center' },
  sortChipOn: { backgroundColor: C.panel2, borderColor: C.slate },
  chipText: { color: C.muted, fontSize: 11, fontWeight: '800' },
  chipTextOn: { color: C.green },
  resultCount: { color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: .8, marginTop: 2, marginBottom: 8 },
});
