import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
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

function LifestyleVisual({ item }: { item: LifestyleAsset }) {
  const icon = item.category === 'PRIVATE AVIATION' ? 'jet' : item.category === 'YACHTS & MARINE' ? 'yacht' : item.category === 'PENTHOUSES' ? 'penthouse' : 'car';
  const color = icon === 'jet' ? '#60A5FA' : icon === 'yacht' ? '#22D3EE' : icon === 'penthouse' ? '#C084FC' : '#F59E0B';
  return <View style={[styles.lifeImage, { backgroundColor: `${color}18` }]}><Svg width={180} height={120} viewBox="0 0 180 120"><Circle cx="142" cy="28" r="20" fill={color} opacity=".12" />{icon === 'car' && <><Path d="M28 82h124l-10 15H40L28 82Zm16 0 13-31h58l27 31M58 51l10-16h37l18 16M72 39h12m10 0h12" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" /><Path d="M70 56h20m8 0h20" stroke={color} strokeWidth="3" strokeLinecap="round" /><Circle cx="55" cy="97" r="10" fill={color} opacity=".16" stroke={color} strokeWidth="4" /><Circle cx="127" cy="97" r="10" fill={color} opacity=".16" stroke={color} strokeWidth="4" /></>}{icon === 'jet' && <><Path d="M18 77 80 58l38-34 12 7-20 31 43 11-4 11-49-4-25 25-8-4 9-25-48 5Z" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" /><Path d="M92 54 73 35m48 28 17 15" stroke={color} strokeWidth="4" strokeLinecap="round" /></>}{icon === 'yacht' && <><Path d="M25 78h130l-20 20H52L25 78Zm61 0V36l39 42M86 42h31" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" /><Path d="M20 103h140" stroke={color} strokeWidth="3" opacity=".5" /></>}{icon === 'penthouse' && <><Path d="M38 96V55l52-31 52 31v41M60 96V70h22v26m16 0V70h22v26M28 96h124" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" /><Path d="M90 24v18" stroke={color} strokeWidth="4" /></>}<Path d="M22 106h136" stroke={color} strokeWidth="3" opacity=".45" /></Svg></View>;
}

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
  return <><Text style={styles.eyebrow}>LIFESTYLE & FLEET</Text><Text style={styles.h1}>Prestige marketplace</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>{categories.map(value => <Pressable key={value} onPress={() => setCategory(value)} style={[styles.filter, category === value && styles.filterOn]}><Text style={[styles.filterText, category === value && styles.filterTextOn]}>{value}</Text></Pressable>)}</ScrollView>{items.map(item => <View key={item.id} style={styles.lifeCard}><LifestyleVisual item={item} /><View style={styles.lifeBody}><Text style={styles.lifeCategory}>{item.category}</Text><Text style={styles.lifeName}>{item.name}</Text><Text style={styles.lifePrice}>{short(item.price)}</Text><View style={styles.upkeepRow}><Text style={styles.muted}>UPKEEP</Text><Text style={styles.upkeepValue}>{money(item.upkeep)} / MO</Text><Text style={styles.prestigeValue}>PRESTIGE +{item.prestige}</Text></View>{owned.includes(item.id) ? <Text style={styles.owned}>OWNED · GARAGE / HANGAR</Text> : <Pressable onPress={() => buy(item)} style={styles.buyBtn}><Text style={styles.buyText}>ACQUIRE ASSET</Text></Pressable>}</View></View>)}</>;
}

const styles = StyleSheet.create({ hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: C.panel2, borderRadius: 20, borderWidth: 1, borderColor: C.slate, padding: 15, marginBottom: 10 }, eyebrow: { color: C.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.8 }, h1: { color: C.text, fontSize: 27, fontWeight: '900', marginTop: 5, marginBottom: 8 },  filters: { gap: 8, paddingBottom: 10 }, filter: { backgroundColor: C.panel, borderRadius: 10, borderWidth: 1, borderColor: C.slate, paddingHorizontal: 12, paddingVertical: 9 }, filterOn: { backgroundColor: '#123D34', borderColor: C.green }, filterText: { color: C.muted, fontSize: 8, fontWeight: '900' }, filterTextOn: { color: C.green }, lifeCard: { backgroundColor: C.panel, borderRadius: 16, borderWidth: 1, borderColor: C.slate, overflow: 'hidden', marginBottom: 12 }, lifeImage: { width: '100%', height: 145, alignItems: 'center', justifyContent: 'center' }, lifeBody: { padding: 14 }, lifeCategory: { color: C.cyan, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 }, lifeName: { color: C.text, fontSize: 18, fontWeight: '900', marginTop: 5 }, lifePrice: { color: C.gold, fontSize: 18, fontWeight: '900', marginVertical: 5 }, upkeepRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 10, marginBottom: 9 }, muted: { color: C.muted, fontSize: 10 }, upkeepValue: { color: C.text, fontSize: 11, fontWeight: '800' }, prestigeValue: { color: C.gold, fontSize: 10, fontWeight: '800' }, owned: { color: C.green, fontSize: 9, fontWeight: '900', marginTop: 12 }, buyBtn: { backgroundColor: C.green, borderRadius: 10, paddingVertical: 12, alignItems: 'center' }, buyText: { color: C.bg, fontSize: 10, fontWeight: '900' } });
