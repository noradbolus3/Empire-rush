import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IncomeSource } from '../../types/income';
import { formatCurrency } from '../../utils/formatCurrency';

type Props = { visible: boolean; onClose: () => void; sources: IncomeSource[] };

export function EarningsBreakdownModal({ visible, onClose, sources }: Props) {
  const total = sources.reduce((sum, source) => sum + source.perSecond, 0);
  const positiveTotal = sources.filter(source => source.perSecond > 0).reduce((sum, source) => sum + source.perSecond, 0);
  const hour = total * 3600;
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.shade}><SafeAreaView edges={['bottom', 'left', 'right']} style={styles.sheet}>
      <View style={styles.grabber} /><View style={styles.header}><View><Text style={styles.eyebrow}>LIVE LEDGER / CASHFLOW</Text><Text style={styles.title}>REAL-TIME EARNINGS BREAKDOWN</Text></View><Pressable onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
      <View style={styles.total}><Text style={styles.totalLabel}>TOTAL AGGREGATE NET YIELD</Text><Text style={[styles.totalValue, total < 0 && styles.negative]}>⚡ {total >= 0 ? '+' : ''}{formatCurrency(total)} / sec</Text><Text style={styles.hour}>{total >= 0 ? '+' : ''}{formatCurrency(hour)} / hour</Text></View>
      <Text style={styles.section}>ACTIVE INCOME SOURCES</Text>
      {sources.length ? sources.map(source => { const share = positiveTotal > 0 && source.perSecond > 0 ? Math.round(source.perSecond / positiveTotal * 100) : 0; return <View key={source.label} style={styles.row}><View style={styles.rowTop}><View style={styles.sourceWrap}><Text style={styles.source}>{source.label}</Text>{source.note && <Text style={styles.note}>{source.note}</Text>}</View><Text style={[styles.amount, source.perSecond < 0 && styles.negative]}>{source.perSecond >= 0 ? '+' : ''}{formatCurrency(source.perSecond)} / sec</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, share)}%`, backgroundColor: source.color }]} /></View><Text style={styles.share}>{share}% of positive cashflow</Text></View>; }) : <Text style={styles.empty}>No active income source is currently being generated.</Text>}
      <Pressable onPress={onClose} style={styles.done}><Text style={styles.doneText}>CLOSE BREAKDOWN</Text></Pressable>
    </SafeAreaView></View>
  </Modal>;
}

const styles = StyleSheet.create({ shade: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2,12,8,.78)' }, sheet: { backgroundColor: '#0D241A', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, borderTopWidth: 1, borderColor: '#16E98A' }, grabber: { alignSelf: 'center', width: 42, height: 4, borderRadius: 4, backgroundColor: '#3F7557', marginBottom: 18 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, eyebrow: { color: '#61E8FF', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 }, title: { color: '#F7FFF9', fontSize: 18, fontWeight: '900', marginTop: 6, maxWidth: 300 }, close: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#163A2A', alignItems: 'center', justifyContent: 'center' }, closeText: { color: '#B8D8C5', fontSize: 26, lineHeight: 28 }, total: { backgroundColor: '#07130F', borderRadius: 16, padding: 16, marginTop: 18, borderWidth: 1, borderColor: '#2B774D' }, totalLabel: { color: '#8FB5A4', fontSize: 10, fontWeight: '800', letterSpacing: 1 }, totalValue: { color: '#16E98A', fontSize: 25, fontWeight: '900', marginTop: 6 }, hour: { color: '#C2E1CF', fontSize: 12, marginTop: 4 }, negative: { color: '#FF6D62' }, section: { color: '#8FB5A4', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 22, marginBottom: 10 }, row: { marginBottom: 16 }, rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sourceWrap: { flex: 1, paddingRight: 8 }, source: { color: '#F7FFF9', fontSize: 13, fontWeight: '800' }, note: { color: '#8FB5A4', fontSize: 9, marginTop: 3 }, amount: { color: '#16E98A', fontSize: 13, fontWeight: '900' }, track: { height: 7, borderRadius: 7, backgroundColor: '#173F2C', overflow: 'hidden', marginTop: 8 }, fill: { height: '100%', borderRadius: 7 }, share: { color: '#6D9A80', fontSize: 10, marginTop: 4 }, empty: { color: '#8FB5A4', fontSize: 13, paddingVertical: 18 }, done: { backgroundColor: '#16E98A', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 }, doneText: { color: '#08110E', fontWeight: '900', fontSize: 12, letterSpacing: .8 } });
export default EarningsBreakdownModal;
