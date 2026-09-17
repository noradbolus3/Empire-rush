import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated as RNAnimated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '../utils/formatCurrency';

type BadgeItem = { id: number; amount: number };

type HomeScreenProps = {
  cash: number;
  clickValue: number;
  clickLevel: number;
  clickUpgradeCost: number;
  onEarn: (amount: number) => void;
  onUpgrade: () => void;
  onOpenBusiness: () => void;
  onOpenStore: () => void;
};

export function HomeScreen({ cash, clickValue, clickLevel, clickUpgradeCost, onEarn, onUpgrade, onOpenBusiness, onOpenStore }: HomeScreenProps) {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const nextId = useRef(0);
  const tap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const id = nextId.current++;
    setBadges(current => [...current.slice(-5), { id, amount: clickValue }]);
    onEarn(clickValue);
  }, [clickValue, onEarn]);

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
    <Text style={styles.eyebrow}>HOME / CLICKER</Text>
    <Text style={styles.title}>Build your fortune.</Text>
    <View style={styles.card}>
      <View style={styles.cardTop}><Text style={styles.logo}>VIZA · BLACK LABEL</Text><Text style={styles.chip}>▦</Text></View>
      <Text style={styles.cardLabel}>LIVE CASH BALANCE</Text>
      <Text style={styles.balance}>{formatCurrency(cash)}</Text>
      <View style={styles.cardBottom}><Text style={styles.cardNumber}>••••  ••••  ••••  8256</Text><Text style={styles.expiry}>07/29</Text></View>
    </View>
    <View style={styles.upgradeRow}>
      <View><Text style={styles.muted}>CURRENT PER CLICK</Text><Text style={styles.current}>{formatCurrency(clickValue)}</Text><Text style={styles.muted}>LEVEL {clickLevel} · NEXT STEP +$0.50</Text></View>
      <Pressable disabled={clickValue >= 10} onPress={onUpgrade} style={({ pressed }) => [styles.upgrade, pressed && styles.pressed, clickValue >= 10 && styles.disabled]}><Text style={styles.upgradeText}>{clickValue >= 10 ? 'MAX $10.00' : `UPGRADE ${formatCurrency(clickUpgradeCost)}`}</Text></Pressable>
    </View>
    <View style={styles.progress}><View style={[styles.progressFill, { width: `${(clickValue / 10) * 100}%` }]} /></View>
    <View style={styles.tapSection}>
      <Text style={styles.tapTitle}>CLICK IN THIS AREA TO EARN</Text>
      <Text style={styles.tapSub}>Each tap adds {formatCurrency(clickValue)} to liquid cash.</Text>
      <View style={styles.badges}>{badges.map(item => <FloatingBadge key={item.id} amount={item.amount} onDone={() => setBadges(current => current.filter(badge => badge.id !== item.id))} />)}</View>
      <Pressable onPress={tap} style={({ pressed }) => [styles.tap, pressed && styles.tapPressed]}><Text style={styles.tapAmount}>+{formatCurrency(clickValue)}</Text><Text style={styles.tapLabel}>TAP</Text></Pressable>
    </View>
    <View style={styles.links}>
      <Pressable onPress={onOpenBusiness} style={styles.link}><Text style={styles.linkTitle}>RETAIL SHOP</Text><Text style={styles.muted}>$5,000 setup · inventory ledger</Text></Pressable>
      <Pressable onPress={onOpenStore} style={styles.link}><Text style={styles.linkTitle}>BANK / STORE</Text><Text style={styles.muted}>Founder packs and upgrades</Text></Pressable>
    </View>
  </SafeAreaView>;
}

function FloatingBadge({ amount, onDone }: { amount: number; onDone: () => void }) {
  const translateY = useRef(new RNAnimated.Value(0)).current;
  const opacity = useRef(new RNAnimated.Value(1)).current;
  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(translateY, { toValue: -60, duration: 700, useNativeDriver: true }),
      RNAnimated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onDone(); });
  }, [onDone, opacity, translateY]);
  return <RNAnimated.Text style={[styles.badge, { transform: [{ translateY }], opacity }]}>+{formatCurrency(amount)}</RNAnimated.Text>;
}

const styles = StyleSheet.create({ safe: { flex: 1 }, eyebrow: { color: '#00D2FF', fontSize: 10, fontWeight: '900', letterSpacing: 2 }, title: { color: '#F7FAFC', fontSize: 30, fontWeight: '900', marginVertical: 10 }, card: { backgroundColor: '#111722', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#8A7348', minHeight: 190, shadowColor: '#000', shadowOpacity: .45, shadowRadius: 18, elevation: 8 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between' }, logo: { color: '#E6B86A', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 }, chip: { color: '#E6B86A', fontSize: 26 }, cardLabel: { color: '#8190A5', fontSize: 10, marginTop: 25, letterSpacing: 1 }, balance: { color: '#F7FAFC', fontSize: 32, fontWeight: '900', marginTop: 4 }, cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 }, cardNumber: { color: '#A9B4C4', letterSpacing: 2 }, expiry: { color: '#A9B4C4' }, upgradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#121923', borderRadius: 14, padding: 14, marginTop: 14 }, muted: { color: '#8190A5', fontSize: 12 }, current: { color: '#00E676', fontSize: 22, fontWeight: '900', marginVertical: 2 }, upgrade: { backgroundColor: '#00E676', borderRadius: 10, padding: 12, maxWidth: 145 }, upgradeText: { color: '#0B0F17', fontSize: 11, fontWeight: '900', textAlign: 'center' }, disabled: { backgroundColor: '#334155' }, pressed: { opacity: .75 }, progress: { height: 7, backgroundColor: '#1E293B', borderRadius: 8, overflow: 'hidden', marginTop: 10 }, progressFill: { height: '100%', backgroundColor: '#00E676' }, tapSection: { backgroundColor: '#121923', borderRadius: 18, padding: 18, alignItems: 'center', marginTop: 14 }, tapTitle: { color: '#F7FAFC', fontSize: 13, fontWeight: '900', letterSpacing: 1 }, tapSub: { color: '#8190A5', marginTop: 5 }, tap: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#00E676', justifyContent: 'center', alignItems: 'center', marginTop: 18, shadowColor: '#00E676', shadowOpacity: .35, shadowRadius: 20, elevation: 8 }, tapPressed: { transform: [{ scale: .96 }] }, tapAmount: { color: '#0B0F17', fontSize: 25, fontWeight: '900' }, tapLabel: { color: '#0B0F17', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginTop: 4 }, badges: { height: 0, position: 'relative', zIndex: 2 }, badge: { color: '#00E676', fontSize: 18, fontWeight: '900', position: 'absolute', width: 180, textAlign: 'center', top: 25 }, links: { flexDirection: 'row', gap: 10, marginTop: 14 }, link: { flex: 1, backgroundColor: '#182231', borderRadius: 12, padding: 13 }, linkTitle: { color: '#E6B86A', fontSize: 11, fontWeight: '900', marginBottom: 5 } });
