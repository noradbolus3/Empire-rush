import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export const ITC = { bg: '#F5F8FC', ink: '#10243B', muted: '#60758B', line: '#D8E5F0', blue: '#147BE8', blueSoft: '#E8F2FF', green: '#159A68', red: '#C84B5A', white: '#FFFFFF', gold: '#C68C19' };

export function PageFrame({ image, kicker, title, subtitle, children }: { image: any; kicker: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <View style={styles.page}><Image source={image} style={styles.pageImage} /><View style={styles.pageCopy}><Text style={styles.kicker}>{kicker}</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>{children}</View>;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

export function Action({ title, copy, onPress, disabled = false }: { title: string; copy: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.action, disabled && styles.actionDisabled]}><View style={{ flex: 1 }}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionCopy}>{copy}</Text></View><Text style={styles.actionArrow}>{disabled ? 'LOCKED' : '›'}</Text></Pressable>;
}

export function Metric({ label, value, accent = ITC.ink }: { label: string; value: string; accent?: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, { color: accent }]}>{value}</Text></View>;
}

export const styles = StyleSheet.create({
  page: { gap: 14 },
  pageImage: { width: '100%', height: 178, borderRadius: 20, backgroundColor: ITC.blueSoft },
  pageCopy: { gap: 5 },
  kicker: { color: ITC.blue, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: ITC.ink, fontSize: 27, lineHeight: 31, fontWeight: '900' },
  subtitle: { color: ITC.muted, fontSize: 14, lineHeight: 20 },
  section: { backgroundColor: ITC.white, borderRadius: 18, borderWidth: 1, borderColor: ITC.line, padding: 15, gap: 10 },
  sectionTitle: { color: ITC.ink, fontSize: 13, fontWeight: '900', letterSpacing: 0.7 },
  action: { minHeight: 64, borderRadius: 14, borderWidth: 1, borderColor: ITC.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FBFDFF' },
  actionDisabled: { opacity: 0.48 },
  actionTitle: { color: ITC.ink, fontSize: 13, fontWeight: '800' },
  actionCopy: { color: ITC.muted, fontSize: 12, marginTop: 3 },
  actionArrow: { color: ITC.blue, fontSize: 12, fontWeight: '900' },
  metric: { flex: 1, minWidth: 110, backgroundColor: '#F7FAFD', borderRadius: 12, padding: 11 },
  metricLabel: { color: ITC.muted, fontSize: 10, fontWeight: '800' },
  metricValue: { marginTop: 5, fontSize: 17, fontWeight: '900' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  muted: { color: ITC.muted, fontSize: 13, lineHeight: 19 },
  pill: { backgroundColor: ITC.blueSoft, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7 },
  pillText: { color: ITC.blue, fontSize: 11, fontWeight: '800' },
});
