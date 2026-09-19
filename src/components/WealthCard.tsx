import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { formatCurrency } from '../utils/formatCurrency';

type Tier = { title: string; colors: string[]; border: string; accent: string };
const tiers: Array<{ minimum: number; tier: Tier }> = [
  { minimum: 10000000, tier: { title: 'SOVEREIGN • DIAMOND PALLADIUM', colors: ['#1E293B', '#475569', '#CBD5E1'], border: '#38BDF8', accent: '#FFFFFF' } },
  { minimum: 1000000, tier: { title: 'VIZA • OBSIDIAN CENTURION', colors: ['#0B0F19', '#020617'], border: '#D97706', accent: '#F59E0B' } },
  { minimum: 100000, tier: { title: 'VIZA • PLATINUM EMERALD', colors: ['#064E3B', '#047857'], border: '#10B981', accent: '#6EE7B7' } },
  { minimum: 25000, tier: { title: 'VIZA • GOLD PRIVILEGE', colors: ['#78350F', '#B45309'], border: '#F59E0B', accent: '#FDE68A' } },
  { minimum: 0, tier: { title: 'VIZA • CLASSIC SLATE', colors: ['#1E293B', '#0F172A'], border: '#334155', accent: '#94A3B8' } },
];

function tierFor(netWorth: number): Tier { return tiers.find(item => netWorth >= item.minimum)?.tier || tiers[tiers.length - 1].tier; }

export function WealthCard({ cash, netWorth }: { cash: number; netWorth: number }) {
  const tier = tierFor(netWorth);
  const gradientId = `wealth-${tier.title.replace(/[^a-z0-9]/gi, '')}`;
  return <View style={[styles.card, { borderColor: tier.border }]}>
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="none">
      <Defs><LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">{tier.colors.map((color, index) => <Stop key={color} offset={`${(index / Math.max(1, tier.colors.length - 1)) * 100}%`} stopColor={color} />)}</LinearGradient></Defs>
      <Rect x="0" y="0" width="400" height="220" rx="22" fill={`url(#${gradientId})`} />
      <Path d="M260 0 C340 30 370 80 400 125 L400 0 Z" fill={tier.accent} opacity=".08" />
    </Svg>
    <View style={styles.content}>
      <View style={styles.top}><Text style={[styles.title, { color: tier.accent }]}>{tier.title}</Text><Chip accent={tier.accent} /></View>
      <Text style={styles.label}>LIVE CASH BALANCE</Text>
      <Text style={styles.balance}>{formatCurrency(cash)}</Text>
      <Text style={[styles.netWorth, { color: tier.accent }]}>NET WORTH · {formatCurrency(netWorth)}</Text>
      <View style={styles.bottom}><Text style={styles.number}>••••  ••••  ••••  8256</Text><Text style={styles.expiry}>07/29</Text></View>
    </View>
  </View>;
}

function Chip({ accent }: { accent: string }) {
  return <Svg width={38} height={28} viewBox="0 0 38 28"><Rect x="1" y="1" width="36" height="26" rx="5" fill="none" stroke={accent} strokeWidth="1.5" /><Path d="M13 1v26M25 1v26M1 9h36M1 19h36" stroke={accent} strokeWidth="1" opacity=".75" /><Circle cx="19" cy="14" r="3" fill={accent} opacity=".6" /></Svg>;
}

const styles = StyleSheet.create({ card: { height: 220, maxHeight: 220, borderRadius: 22, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOpacity: .5, shadowRadius: 16, elevation: 8 }, content: { flex: 1, padding: 18, justifyContent: 'space-between' }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 12, fontWeight: '900', letterSpacing: 1.1, flex: 1, marginRight: 12 }, label: { color: '#CBD5E1', fontSize: 9, letterSpacing: 1.2, marginTop: 6 }, balance: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', marginTop: 2 }, netWorth: { fontSize: 11, fontWeight: '900', letterSpacing: .8 }, bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, number: { color: '#E2E8F0', fontSize: 13, letterSpacing: 1.5 }, expiry: { color: '#E2E8F0', fontSize: 12, fontWeight: '800' } });
export default WealthCard;
