import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type CommandDeckPulseProps = {
  label: string;
  value: string;
  detail: string;
  accent?: '#16E98A' | '#61E8FF' | '#FFC928' | '#FF6D62';
};

export function CommandDeckPulse({ label, value, detail, accent = '#16E98A' }: CommandDeckPulseProps) {
  return <View style={[styles.card, { borderColor: `${accent}66` }]}>
    <View style={[styles.dot, { backgroundColor: accent }]} />
    <View style={styles.copy}>
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
    <Text style={[styles.signal, { color: accent }]}>LIVE</Text>
  </View>;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D241A', borderRadius: 14, borderWidth: 1, padding: 11, marginBottom: 12 },
  dot: { width: 9, height: 9, borderRadius: 5, marginRight: 10 },
  copy: { flex: 1 },
  label: { fontSize: 8, fontWeight: '900', letterSpacing: 1.3 },
  value: { color: '#F7FFF9', fontSize: 14, fontWeight: '900', marginTop: 3 },
  detail: { color: '#8FB5A4', fontSize: 9, marginTop: 3 },
  signal: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
});
