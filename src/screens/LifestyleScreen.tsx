import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChipRow } from '../components/ChipRow';
import { CarsTab } from './CarsTab';
import { YachtsTab } from './YachtsTab';
import { JetsTab } from './JetsTab';
import { PropertiesTab } from './PropertiesTab';
import type { CollectionItem } from '../data/collectionTypes';

const C = { bg: '#07130F', panel: '#0D241A', panel2: '#123726', green: '#16E98A', cyan: '#61E8FF', gold: '#FFC928', slate: '#236A45', text: '#F7FFF9', muted: '#8FB5A4' };
type LifestyleTab = 'CARS' | 'YACHTS' | 'JETS' | 'PROPERTIES';
const TABS: { id: LifestyleTab; label: string; caption: string }[] = [
  { id: 'CARS', label: 'Cars', caption: 'Road icons from daily drivers to hypercars.' },
  { id: 'YACHTS', label: 'Yachts', caption: 'Watercraft, explorers, and floating estates.' },
  { id: 'JETS', label: 'Jets', caption: 'Private flight from turboprop to VIP airliner.' },
  { id: 'PROPERTIES', label: 'Properties', caption: 'Address, architecture, and permanent prestige.' },
];
type Props = { owned: string[]; cash: number; setCash: React.Dispatch<React.SetStateAction<number>>; setOwned: React.Dispatch<React.SetStateAction<string[]>> };

export function LifestyleScreen({ owned, cash, setCash, setOwned }: Props) {
  const [activeTab, setActiveTab] = useState<LifestyleTab>('CARS');
  const active = useMemo(() => TABS.find(tab => tab.id === activeTab) || TABS[0], [activeTab]);
  const acquire = (item: CollectionItem) => {
    if (owned.includes(item.id)) return;
    if (cash < item.price) { Alert.alert('Prestige locked', `Need $${(item.price - cash).toLocaleString('en-US')} more liquid cash.`); return; }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCash(value => Math.max(0, value - item.price));
    setOwned(value => value.includes(item.id) ? value : [...value, item.id]);
  };
  const tabProps = { owned, cash, onAcquire: acquire };
  return <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.hero}><View style={styles.heroCopy}><Text style={styles.eyebrow}>FOUNDER LIFESTYLE DESK · FOUR COLLECTIONS</Text><Text style={styles.title}>Build your signature.</Text><Text style={styles.subtitle}>Acquire original road, sea, air, and property assets. Every item has its own upkeep and prestige footprint.</Text></View><View style={styles.badge}><Text style={styles.badgeValue}>{owned.length}</Text><Text style={styles.badgeLabel}>OWNED</Text></View></View>
    <ChipRow items={TABS.map(tab => ({ id: tab.id, label: tab.label.toUpperCase() }))} selectedId={activeTab} onSelect={id => setActiveTab(id as LifestyleTab)} chipStyle={styles.tab} activeStyle={styles.tabOn} textStyle={styles.tabText} activeTextStyle={styles.tabTextOn} accessibilityLabel="Lifestyle collection tabs" />
    <Text style={styles.caption}>{active.caption}</Text>
    {activeTab === 'CARS' && <CarsTab {...tabProps} />}
    {activeTab === 'YACHTS' && <YachtsTab {...tabProps} />}
    {activeTab === 'JETS' && <JetsTab {...tabProps} />}
    {activeTab === 'PROPERTIES' && <PropertiesTab {...tabProps} />}
  </ScrollView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 }, content: { padding: 16, paddingBottom: 78 },
  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: C.panel2, borderRadius: 20, borderWidth: 1, borderColor: C.slate, padding: 15, marginBottom: 10 },
  heroCopy: { flex: 1, paddingRight: 10 }, eyebrow: { color: C.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }, title: { color: C.text, fontSize: 27, fontWeight: '900', marginTop: 5 }, subtitle: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 6 },
  badge: { alignItems: 'center', backgroundColor: '#0D3A26', borderRadius: 13, borderWidth: 1, borderColor: C.green, paddingHorizontal: 11, paddingVertical: 8 }, badgeValue: { color: '#B8F34A', fontSize: 20, fontWeight: '900' }, badgeLabel: { color: C.muted, fontSize: 7, fontWeight: '900', marginTop: 2 },
  tabRow: { flexDirection: 'row', gap: 7, marginBottom: 6 }, tab: { height: 42, backgroundColor: C.panel, borderRadius: 11, borderWidth: 1, borderColor: C.slate, alignItems: 'center', justifyContent: 'center' }, tabOn: { backgroundColor: '#123D34', borderColor: C.green }, tabText: { color: C.muted, fontSize: 9, fontWeight: '900', letterSpacing: .6 }, tabTextOn: { color: C.green }, caption: { color: C.muted, fontSize: 10, marginBottom: 10 }, pressed: { opacity: .78, transform: [{ scale: .985 }] },
});
