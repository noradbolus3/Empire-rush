import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LIFESTYLE_CATALOG, LifestyleAsset, LifestyleCategory } from '../data/lifestyleCatalog';

type Props = {
  owned: string[];
  cash: number;
  setCash: React.Dispatch<React.SetStateAction<number>>;
  setOwned: React.Dispatch<React.SetStateAction<string[]>>;
};

const C = { bg: '#07130F', panel: '#0D241A', panel2: '#123726', green: '#16E98A', cyan: '#61E8FF', gold: '#FFC928', slate: '#236A45', text: '#F7FFF9', muted: '#8FB5A4' };
const money = (value: number) => `$${Math.max(0, value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const short = (value: number) => Math.abs(value) >= 1e6 ? `$${(value / 1e6).toFixed(2)}M` : Math.abs(value) >= 1e3 ? `$${(value / 1e3).toFixed(2)}K` : money(value);
const categories: Array<'ALL' | LifestyleCategory> = ['ALL', 'SUPERCARS', 'PRIVATE AVIATION', 'YACHTS & MARINE', 'PENTHOUSES'];

function LifestyleVisual({ item }: { item: LifestyleAsset }) { return <View style={styles.lifeImage}><Image source={item.image} resizeMode="cover" style={styles.lifeImageAsset} /><View style={styles.imageShade}><Text style={styles.imageBrand}>{item.brand}</Text></View></View>; }

export function LifestyleScreen({ owned, cash, setCash, setOwned }: Props) {
  const [category, setCategory] = useState<'ALL' | LifestyleCategory>('ALL');
  const items = useMemo(() => LIFESTYLE_CATALOG.filter(item => category === 'ALL' || item.category === category), [category]);
  const buy = (item: LifestyleAsset) => {
    if (owned.includes(item.id)) return;
    if (cash < item.price) { Alert.alert('Prestige locked', `Need ${money(item.price)} liquid cash.`); return; }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCash(value => Math.max(0, value - item.price));
    setOwned(value => value.includes(item.id) ? value : [...value, item.id]);
  };
  return <><View style={styles.hero}><View style={styles.heroCopyWrap}><Text style={styles.eyebrow}>FOUNDER LIFESTYLE DESK</Text><Text style={styles.h1}>Prestige marketplace</Text><Text style={styles.heroCopy}>Turn operating wins into visible status, mobility, and long-term identity.</Text></View><View style={styles.heroBadge}><Text style={styles.heroBadgeValue}>{owned.length}</Text><Text style={styles.heroBadgeLabel}>OWNED</Text></View></View><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>{categories.map(value => <Pressable key={value} onPress={() => setCategory(value)} style={[styles.filter, category === value && styles.filterOn]}><Text style={[styles.filterText, category === value && styles.filterTextOn]}>{value}</Text></Pressable>)}</ScrollView>{items.map(item => <View key={item.id} style={styles.lifeCard}><LifestyleVisual item={item} /><View style={styles.lifeBody}><Text style={styles.lifeCategory}>{item.category}</Text><Text style={styles.lifeName}>{item.brand} {item.name}</Text><Text style={styles.lifePrice}>{short(item.price)}</Text><View style={styles.upkeepRow}><Text style={styles.muted}>UPKEEP</Text><Text style={styles.upkeepValue}>{money(item.upkeep)} / MO</Text><Text style={styles.prestigeValue}>PRESTIGE +{item.prestige}</Text></View>{owned.includes(item.id) ? <Text style={styles.owned}>OWNED · GARAGE / HANGAR</Text> : <Pressable onPress={() => buy(item)} style={styles.buyBtn}><Text style={styles.buyText}>ACQUIRE ASSET</Text></Pressable>}</View></View>)}</>;
}

const styles = StyleSheet.create({ hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: C.panel2, borderRadius: 20, borderWidth: 1, borderColor: C.slate, padding: 15, marginBottom: 10 }, heroCopyWrap: { flex: 1, paddingRight: 8 }, heroCopy: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 4 }, heroBadge: { alignItems: 'center', backgroundColor: '#0D3A26', borderRadius: 13, borderWidth: 1, borderColor: C.green, paddingHorizontal: 10, paddingVertical: 8 }, heroBadgeValue: { color: '#B8F34A', fontSize: 20, fontWeight: '900' }, heroBadgeLabel: { color: C.muted, fontSize: 7, fontWeight: '900', marginTop: 2 }, eyebrow: { color: C.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.8 }, h1: { color: C.text, fontSize: 27, fontWeight: '900', marginTop: 5, marginBottom: 8 },  filters: { gap: 8, paddingBottom: 10 }, filter: { backgroundColor: C.panel, borderRadius: 10, borderWidth: 1, borderColor: C.slate, paddingHorizontal: 12, paddingVertical: 9 }, filterOn: { backgroundColor: '#123D34', borderColor: C.green }, filterText: { color: C.muted, fontSize: 8, fontWeight: '900' }, filterTextOn: { color: C.green }, lifeCard: { backgroundColor: C.panel, borderRadius: 16, borderWidth: 1, borderColor: C.slate, overflow: 'hidden', marginBottom: 12 }, lifeImage: { width: '100%', height: 145, backgroundColor: C.slate, overflow: 'hidden' }, lifeImageAsset: { width: '100%', height: '100%' }, imageShade: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(4,16,11,.64)' }, imageBrand: { color: C.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 }, lifeBody: { padding: 14 }, lifeCategory: { color: C.cyan, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 }, lifeName: { color: C.text, fontSize: 18, fontWeight: '900', marginTop: 5 }, lifePrice: { color: C.gold, fontSize: 18, fontWeight: '900', marginVertical: 5 }, upkeepRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 10, marginBottom: 9 }, muted: { color: C.muted, fontSize: 10 }, upkeepValue: { color: C.text, fontSize: 11, fontWeight: '800' }, prestigeValue: { color: C.gold, fontSize: 10, fontWeight: '800' }, owned: { color: C.green, fontSize: 9, fontWeight: '900', marginTop: 12 }, buyBtn: { backgroundColor: C.green, borderRadius: 10, paddingVertical: 12, alignItems: 'center' }, buyText: { color: C.bg, fontSize: 10, fontWeight: '900' } });
