import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ITSoftwareData } from '../../types/business';
import { itStageFor, initializeITCompany, itHourlyProfit } from '../../engine/itCompanyEngine';
import { itCompanyVisuals } from '../../data/itCompanyAssets';
import { ITFormationOfficeScreen } from './it/ITFormationOfficeScreen';
import { ITWorkforceScreen } from './it/ITWorkforceScreen';
import { ITProjectsContractsScreen } from './it/ITProjectsContractsScreen';
import { ITProductsSecurityScreen } from './it/ITProductsSecurityScreen';
import { ITEnterpriseScreen } from './it/ITEnterpriseScreen';
import { ITC, Metric, Section } from './it/ITPagePrimitives';
import type { BankLedgerEntry } from '../../types/bank';
import { commitCashTransaction } from '../../engine/transactionGateway';

type ITTab = 'Formation & Office' | 'Workforce' | 'Projects & Contracts' | 'Products & Security' | 'Enterprise';
type Props = { business: ITSoftwareData; cash: number; netWorth: number; onBack: () => void; onCashChange: (updater: (value: number) => number) => void; onLedger?: (entry: BankLedgerEntry) => void; onChange: (business: ITSoftwareData) => void };

export default function ITSoftwareCompanyScreen({ business: rawBusiness, cash, netWorth, onBack, onCashChange, onLedger, onChange }: Props) {
  const business = useMemo(() => initializeITCompany(rawBusiness, netWorth), [rawBusiness, netWorth]);
  const [tab, setTab] = useState<ITTab>('Formation & Office');
  const stage = itStageFor(netWorth);
  const spend = (cost: number, update: (item: ITSoftwareData) => ITSoftwareData, label: string) => {
    const timestamp = Date.now();
    const result = commitCashTransaction({
      key: `it-software:${business.id}:${label}`,
      cash,
      amount: cost,
      onCashChange,
      onLedger,
      ledgerEntry: cost > 0 ? {
        id: `ledger-it-software-${business.id}-${timestamp}`,
        kind: 'PURCHASE',
        label: `IT & Software investment · ${label}`,
        amount: -cost,
        timestamp,
        detail: `${business.name} operating investment`,
      } : undefined,
      onCommit: () => {
        onChange(update(business));
        Alert.alert('IT COMPANY UPDATED', label);
      },
      now: timestamp,
      lockDurationMs: 250,
    });
    if (!result.accepted && result.reason === 'insufficient-funds') {
      Alert.alert('CAPITAL REQUIRED', `You need ${(cost - cash).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} more liquid cash.`);
    }
  };
  const pageProps = { business, cash, netWorth, stage, onCashChange, onChange, spend };
  return <View style={styles.root}><SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Pressable onPress={onBack}><Text style={styles.back}>‹ BUSINESS REGISTRY</Text></Pressable>
    <View style={styles.hero}><Text style={styles.kicker}>IT & SOFTWARE COMPANY · {stage.toUpperCase()}</Text><Text style={styles.title}>Build products people depend on.</Text><Text style={styles.subtitle}>Projects, people, products and trust—one operating system for the next company in your empire.</Text><View style={styles.metrics}><Metric label="NET / HOUR" value={itHourlyProfit(business).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} accent={ITC.green} /><Metric label="PROJECTS" value={`${business.activeProjects.length}/${business.projectSlots}`} accent={ITC.blue} /><Metric label="PRODUCT USERS" value={business.activeSubscribers.toLocaleString()} /></View></View>
    <ScrollView horizontal style={styles.tabScroller} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}><View style={styles.tabRail}>{(['Formation & Office', 'Workforce', 'Projects & Contracts', 'Products & Security', 'Enterprise'] as ITTab[]).map((item) => <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}><Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text></Pressable>)}</View></ScrollView>
    {tab === 'Formation & Office' && <ITFormationOfficeScreen {...pageProps} />}
    {tab === 'Workforce' && <ITWorkforceScreen {...pageProps} />}
    {tab === 'Projects & Contracts' && <ITProjectsContractsScreen {...pageProps} />}
    {tab === 'Products & Security' && <ITProductsSecurityScreen {...pageProps} />}
    {tab === 'Enterprise' && <ITEnterpriseScreen {...pageProps} />}
    <Section title="SETTLEMENT TRANSPARENCY"><Text style={styles.muted}>The IT Company uses the existing business settlement pipeline. Payroll, office cost, cloud cost and R&D are expenses; project and product operations contribute to the shared hourly cashflow.</Text></Section>
  </ScrollView></SafeAreaView></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F8FC' },
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 120, gap: 14 },
  back: { color: '#147BE8', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  hero: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, gap: 8, borderWidth: 1, borderColor: '#D8E5F0' },
  kicker: { color: '#147BE8', fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: '#10243B', fontSize: 29, lineHeight: 33, fontWeight: '900' },
  subtitle: { color: '#60758B', fontSize: 14, lineHeight: 20 },
  metrics: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  tabScroller: { flexGrow: 0, flexShrink: 0 },
  tabs: { flexGrow: 0, flexShrink: 0, alignItems: 'center', paddingVertical: 2 },
  tabRail: { flexDirection: 'row', flexGrow: 0, flexShrink: 0, gap: 8 },
  tab: { minHeight: 42, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: '#D8E5F0', backgroundColor: '#FFFFFF', justifyContent: 'center' },
  tabActive: { backgroundColor: '#E8F2FF', borderColor: '#147BE8' },
  tabText: { color: '#60758B', fontSize: 11, fontWeight: '800' },
  tabTextActive: { color: '#147BE8' },
  muted: { color: '#60758B', fontSize: 13, lineHeight: 19 },
});
