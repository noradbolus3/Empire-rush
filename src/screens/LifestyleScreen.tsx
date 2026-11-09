import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CarsTab } from './CarsTab';
import { YachtsTab } from './YachtsTab';
import { JetsTab } from './JetsTab';
import { PropertiesTab } from './PropertiesTab';
import type { CollectionItem } from '../data/collectionTypes';
import type { BankLedgerEntry } from '../types/bank';
import { designSystem } from '../theme/designSystem';
import { commitCashTransaction } from '../engine/transactionGateway';

const C = { bg: designSystem.colors.background, panel: designSystem.colors.card, panel2: designSystem.colors.highlight, green: designSystem.colors.primary, cyan: designSystem.colors.cyan, gold: designSystem.colors.gold, slate: designSystem.colors.border, text: designSystem.colors.heading, muted: designSystem.colors.secondary };
type LifestyleTab = 'CARS' | 'YACHTS' | 'JETS' | 'PROPERTIES';
const TABS: { id: LifestyleTab; label: string; caption: string }[] = [
  { id: 'CARS', label: 'Cars', caption: 'Road icons from daily drivers to hypercars.' },
  { id: 'YACHTS', label: 'Yachts', caption: 'Watercraft, explorers, and floating estates.' },
  { id: 'JETS', label: 'Jets', caption: 'Private flight from turboprop to VIP airliner.' },
  { id: 'PROPERTIES', label: 'Properties', caption: 'Address, architecture, and permanent prestige.' },
];
type Props = { owned: string[]; cash: number; setCash: React.Dispatch<React.SetStateAction<number>>; setOwned: React.Dispatch<React.SetStateAction<string[]>>; onLedger?: (entry: BankLedgerEntry) => void };

export function LifestyleScreen({ owned, cash, setCash, setOwned, onLedger }: Props) {
  const [activeTab, setActiveTab] = useState<LifestyleTab>('CARS');
  const active = useMemo(() => TABS.find(tab => tab.id === activeTab) || TABS[0], [activeTab]);
  const acquire = (item: CollectionItem) => {
    if (owned.includes(item.id)) return;
    const timestamp = Date.now();
    const result = commitCashTransaction({
      key: `lifestyle:${item.id}`,
      cash,
      amount: item.price,
      onCashChange: setCash,
      onLedger,
      ledgerEntry: { id: `ledger-purchase-${item.id}-${timestamp}`, kind: 'PURCHASE', label: `Lifestyle purchase · ${item.name}`, amount: -item.price, timestamp, detail: `${item.category} asset acquired` },
      onCommit: () => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setOwned(value => value.includes(item.id) ? value : [...value, item.id]);
      },
      now: timestamp,
    });
    if (!result.accepted && result.reason === 'insufficient-funds') {
      Alert.alert('Prestige locked', `Need $${(item.price - cash).toLocaleString('en-US')} more liquid cash.`);
    }
  };
  const tabProps = { owned, cash, onAcquire: acquire };
  return <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.topRow}><View style={{ flex: 1, minWidth: 0 }}><Text style={styles.title}>Lifestyle</Text><Text style={styles.caption} numberOfLines={1}>{active.caption}</Text></View><View style={styles.badge}><Text style={styles.badgeValue}>{owned.length}</Text><Text style={styles.badgeLabel}>OWNED</Text></View></View>
    <View style={styles.tabRow} accessibilityLabel="Lifestyle collection tabs">{TABS.map(tab => <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={[styles.tab, activeTab === tab.id && styles.tabOn]}><Text style={[styles.tabText, activeTab === tab.id && styles.tabTextOn]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{tab.label}</Text></Pressable>)}</View>
    {activeTab === 'CARS' && <CarsTab {...tabProps} />}
    {activeTab === 'YACHTS' && <YachtsTab {...tabProps} />}
    {activeTab === 'JETS' && <JetsTab {...tabProps} />}
    {activeTab === 'PROPERTIES' && <PropertiesTab {...tabProps} />}
  </ScrollView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 }, content: { padding: 14, paddingTop: 10, paddingBottom: 78 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  title: { color: C.text, fontSize: 22, fontWeight: '900' }, caption: { color: C.muted, fontSize: 11, marginTop: 1 },
  badge: { alignItems: 'center', backgroundColor: '#E3EDFC', borderRadius: 12, borderWidth: 1, borderColor: '#2563C9', paddingHorizontal: 12, paddingVertical: 5 }, badgeValue: { color: '#2563C9', fontSize: 18, fontWeight: '900' }, badgeLabel: { color: C.muted, fontSize: 8, fontWeight: '900', marginTop: 1 },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 10 }, tab: { flex: 1, minWidth: 0, height: 38, backgroundColor: C.panel, borderRadius: 10, borderWidth: 1, borderColor: C.slate, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }, tabOn: { backgroundColor: '#E3EDFC', borderColor: '#2563C9' }, tabText: { color: C.muted, fontSize: 12, fontWeight: '800' }, tabTextOn: { color: '#2563C9' },
});
