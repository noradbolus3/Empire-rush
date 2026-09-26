import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CASINO_UNLOCK_NET_WORTH } from '../engine/economyPlan';

const C = { bg: '#07130F', panel: '#0D241A', panel2: '#123726', green: '#16E98A', gold: '#FFC928', slate: '#236A45', text: '#F7FFF9', muted: '#8FB5A4' };
const money = (value: number) => `$${Math.max(0, value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Props = { cash: number; netWorth: number; setCash: React.Dispatch<React.SetStateAction<number>>; disabled?: boolean };

function BetControl({ bet, setBet }: { bet: number; setBet: (value: number) => void }) {
  return <View style={styles.bet}><Text style={styles.muted}>WAGER</Text><View style={styles.betRow}><Pressable onPress={() => setBet(Math.max(100, bet - 100))} style={styles.betBtn}><Text style={styles.betText}>−</Text></Pressable><Text style={styles.betValue}>{money(bet)}</Text><Pressable onPress={() => setBet(Math.min(10000, bet + 100))} style={styles.betBtn}><Text style={styles.betText}>+</Text></Pressable></View></View>;
}

export function CasinoScreen({ cash, netWorth, setCash, disabled = false }: Props) {
  const [bet, setBet] = useState(100);
  const [sessionWagered, setSessionWagered] = useState(0);
  const [result, setResult] = useState('Choose a table');
  const [choice, setChoice] = useState('RED');
  const maxExposure = Math.min(50000, Math.max(100, Math.floor(netWorth * 0.01)));
  const canWager = () => {
    if (netWorth < CASINO_UNLOCK_NET_WORTH) { Alert.alert('CASINO LOCKED', `Reach ${money(CASINO_UNLOCK_NET_WORTH - netWorth)} more net worth before opening the entertainment tables.`); return false; }
    if (disabled) { Alert.alert('Requires active internet', 'Casino tables are disabled while offline.'); return false; }
    if (cash < bet) { Alert.alert('Table limit', 'Insufficient cash for this wager.'); return false; }
    if (sessionWagered + bet > maxExposure) { Alert.alert('Responsible play cap', `This session is capped at ${money(maxExposure)} in wagers. Casino rewards never unlock businesses.`); return false; }
    setSessionWagered(value => value + bet);
    return true;
  };
  const spin = () => {
    if (!canWager()) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const roll = Math.random();
    const win = choice === 'GREEN' ? roll > 0.92 : roll > 0.5;
    const payout = choice === 'GREEN' ? 14 : 2;
    setCash(value => value + (win ? bet * (payout - 1) : -bet));
    setResult(win ? `WIN · ${money(bet * payout)} payout` : `LOSS · ${money(bet)} wager lost`);
  };
  const dice = () => {
    if (!canWager()) return;
    const high = Math.floor(Math.random() * 6) + 1 > 3;
    const win = (choice === 'HIGH') === high;
    setCash(value => value + (win ? bet * 0.95 : -bet));
    setResult(win ? 'DICE WIN · 1.95x payout' : 'DICE LOSS');
  };
  return <><Text style={styles.eyebrow}>HIGH-ROLLER ROOM</Text><Text style={styles.h1}>Casino</Text><Text style={styles.casinoNotice}>Entertainment simulation only · unlocks at $100,000 net worth · exposure scales with your empire · casino rewards never unlock businesses.</Text><View style={styles.casinoCard}><Text style={styles.tableTitle}>COLOR WHEEL</Text><Text style={styles.result}>{result}</Text><View style={styles.choiceRow}>{['RED', 'BLACK', 'GREEN'].map(value => <Pressable key={value} onPress={() => setChoice(value)} style={[styles.choice, choice === value && styles.choiceOn]}><Text style={styles.choiceText}>{value}</Text><Text style={styles.muted}>{value === 'GREEN' ? '14x' : '2x'}</Text></Pressable>)}</View><BetControl bet={bet} setBet={setBet} /><Pressable onPress={spin} style={styles.spin}><Text style={styles.spinText}>SPIN WHEEL</Text></Pressable></View><View style={styles.casinoCard}><Text style={styles.tableTitle}>HIGH / LOW DICE</Text><Text style={styles.muted}>Predict 4–6 or 1–3 · 1.95x payout</Text><View style={styles.choiceRow}><Pressable onPress={() => setChoice('HIGH')} style={[styles.choice, choice === 'HIGH' && styles.choiceOn]}><Text style={styles.choiceText}>HIGH</Text><Text style={styles.muted}>4 · 5 · 6</Text></Pressable><Pressable onPress={() => setChoice('LOW')} style={[styles.choice, choice === 'LOW' && styles.choiceOn]}><Text style={styles.choiceText}>LOW</Text><Text style={styles.muted}>1 · 2 · 3</Text></Pressable></View><Pressable onPress={dice} style={styles.spin}><Text style={styles.spinText}>ROLL DICE</Text></Pressable></View></>;
}

const styles = StyleSheet.create({ eyebrow: { color: '#61E8FF', fontSize: 9, fontWeight: '900', letterSpacing: 1.8 }, h1: { color: C.text, fontSize: 27, fontWeight: '900', marginTop: 5, marginBottom: 8 }, casinoNotice: { color: C.muted, fontSize: 12, marginBottom: 13 }, casinoCard: { backgroundColor: C.panel, borderRadius: 17, padding: 16, borderWidth: 1, borderColor: C.slate, marginBottom: 12 }, tableTitle: { color: C.gold, fontSize: 13, fontWeight: '900', letterSpacing: 1.4 }, result: { color: C.text, fontSize: 18, fontWeight: '900', marginVertical: 17, textAlign: 'center' }, choiceRow: { flexDirection: 'row', gap: 8, marginBottom: 14 }, choice: { flex: 1, backgroundColor: C.panel2, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.slate }, choiceOn: { borderColor: C.green, backgroundColor: '#123A30' }, choiceText: { color: C.text, fontWeight: '900', fontSize: 11 }, muted: { color: C.muted, fontSize: 11 }, bet: { alignItems: 'center', marginVertical: 8 }, betRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 8 }, betBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.slate, justifyContent: 'center', alignItems: 'center' }, betText: { color: C.text, fontSize: 20 }, betValue: { color: C.gold, fontWeight: '900', fontSize: 18 }, spin: { backgroundColor: C.green, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 11 }, spinText: { color: C.bg, fontWeight: '900', fontSize: 11 } });
