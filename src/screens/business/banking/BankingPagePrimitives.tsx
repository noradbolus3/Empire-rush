import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export const BANKING_COLORS = {
  white: "#FFFFFF",
  blue: "#1769AA",
  lightBlue: "#EAF2FA",
  navy: "#172B4D",
  muted: "#64748B",
  border: "#CFE0EF",
  success: "#087F5B",
  danger: "#B42318",
};

export function BankingPage({ children }: { children: React.ReactNode }) {
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>{children}</ScrollView>;
}

export function BankingHero({ source, eyebrow, title, copy }: { source: any; eyebrow: string; title: string; copy: string }) {
  return (
    <View style={styles.hero}>
      <Image source={source} style={styles.heroImage} />
      <View style={styles.heroCopy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.copy}>{copy}</Text>
      </View>
    </View>
  );
}

export function BankingCard({ children, title, detail }: { children?: React.ReactNode; title: string; detail?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {detail ? <Text style={styles.cardDetail}>{detail}</Text> : null}
      {children}
    </View>
  );
}

export function BankingMetric({ label, value, tone = BANKING_COLORS.navy }: { label: string; value: string; tone?: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, { color: tone }]}>{value}</Text></View>;
}

export function BankingAction({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.action, disabled && styles.actionDisabled]}><Text style={styles.actionText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BANKING_COLORS.white },
  content: { padding: 16, paddingBottom: 128, gap: 14 },
  hero: { borderRadius: 24, overflow: "hidden", backgroundColor: BANKING_COLORS.lightBlue, borderWidth: 1, borderColor: BANKING_COLORS.border },
  heroImage: { width: "100%", height: 210 },
  heroCopy: { padding: 16, gap: 6 },
  eyebrow: { color: BANKING_COLORS.blue, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: BANKING_COLORS.navy, fontSize: 28, fontWeight: "900" },
  copy: { color: BANKING_COLORS.muted, fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: BANKING_COLORS.lightBlue, borderRadius: 18, borderWidth: 1, borderColor: BANKING_COLORS.border, padding: 16, gap: 10 },
  cardTitle: { color: BANKING_COLORS.navy, fontSize: 18, fontWeight: "800" },
  cardDetail: { color: BANKING_COLORS.muted, fontSize: 13, lineHeight: 19 },
  metric: { backgroundColor: BANKING_COLORS.white, borderRadius: 14, padding: 12, gap: 4, minWidth: "46%" },
  metricLabel: { color: BANKING_COLORS.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  metricValue: { fontSize: 19, fontWeight: "900" },
  action: { backgroundColor: BANKING_COLORS.blue, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: "center" },
  actionDisabled: { opacity: 0.45 },
  actionText: { color: BANKING_COLORS.white, fontWeight: "800", fontSize: 12, letterSpacing: 0.5 },
  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
});

export const bankingStyles = styles;
