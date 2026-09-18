import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusinessEntity } from '../types/game';
import { calculateHourlyProfit, getRetailUnitEconomics } from '../engine/businessEngine';
import { formatCurrency } from '../utils/formatCurrency';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BusinessStackParamList } from './businessNavigation';

const C = { bg: '#0B0F17', panel: '#121923', green: '#00E676', red: '#FF3D71', cyan: '#00D2FF', text: '#F7FAFC', muted: '#8190A5', slate: '#1E293B' };
export function BusinessFinancialsScreen({ route }: NativeStackScreenProps<BusinessStackParamList, 'BusinessFinancials'>) {
  const { business } = route.params;
  const profit = calculateHourlyProfit(business);
  const overhead = Object.values(business.monthlyExpenses).reduce((a, b) => a + b, 0) / 720;
  const gross = business.resources.kind === 'retail' ? business.resources.customerFootfallPerHour * getRetailUnitEconomics(business.resources).sellingPrice : business.baseHourlyRevenue;
  const margin = gross > 0 ? (profit / gross) * 100 : 0;
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>FINANCIAL CONTROL</Text><Text style={styles.title}>P&L statement</Text><Text style={styles.subtitle}>Live operating performance for {business.registeredName || business.name}.</Text>
    <View style={styles.card}><Metric label="Gross revenue projection" value={`${formatCurrency(gross)}/hr`} positive /><Metric label="Operating overheads" value={`${formatCurrency(overhead)}/hr`} /><Metric label="Net operating profit" value={`${formatCurrency(profit)}/hr`} positive={profit >= 0} /><Metric label="Net profit margin" value={`${margin.toFixed(1)}%`} positive={margin >= 0} /></View>
    <View style={styles.card}><Text style={styles.cardTitle}>TRANSACTION AUDIT LEDGER</Text>{business.transactionLedger?.length ? business.transactionLedger.slice(0, 20).map((entry, index) => <View key={`${entry.id}-${index}`} style={styles.ledgerRow}><Text style={[styles.ledgerAmount, entry.amount >= 0 ? styles.positive : styles.negative]}>{entry.amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(entry.amount))}</Text><View style={styles.ledgerCopy}><Text style={styles.ledgerLabel}>{entry.label}</Text><Text style={styles.muted}>{new Date(entry.at).toLocaleString()}</Text></View></View>) : <Text style={styles.muted}>No transactions recorded yet. Restock or operate the business to create an auditable entry.</Text>}</View>
  </ScrollView></SafeAreaView>;
}
function Metric({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) { return <View style={styles.metric}><Text style={styles.muted}>{label}</Text><Text style={[styles.metricValue, positive && styles.positive]}>{value}</Text></View>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: C.bg }, content: { padding: 20, paddingBottom: 120 }, eyebrow: { color: C.cyan, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }, title: { color: C.text, fontSize: 30, fontWeight: '900', marginTop: 8 }, subtitle: { color: C.muted, lineHeight: 21, marginTop: 8, marginBottom: 20 }, card: { backgroundColor: C.panel, borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: C.slate }, cardTitle: { color: C.text, fontWeight: '900', letterSpacing: 1, marginBottom: 16 }, metric: { borderBottomWidth: 1, borderBottomColor: C.slate, paddingVertical: 13 }, metricValue: { color: C.text, fontWeight: '800', fontSize: 18, marginTop: 4 }, positive: { color: C.green }, negative: { color: C.red }, ledgerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.slate }, ledgerAmount: { width: 92, fontWeight: '900', fontSize: 15 }, ledgerCopy: { flex: 1 }, ledgerLabel: { color: C.text, fontWeight: '700' }, muted: { color: C.muted, fontSize: 12, lineHeight: 18 } });
export default BusinessFinancialsScreen;
