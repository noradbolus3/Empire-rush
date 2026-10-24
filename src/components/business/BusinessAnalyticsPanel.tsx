import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BusinessEntity } from "../../types/business";
import { formatCurrency } from "../../utils/formatCurrency";
import { designSystem } from "../../theme/designSystem";

type Props = {
  business: BusinessEntity;
  finance: { revenue: number; expenses: number; net: number; breakEven: number; perUnit: number };
};
type Horizon = 1 | 24 | 168 | 720;
const colors = designSystem.colors;
const horizons: Array<{ id: Horizon; label: string }> = [
  { id: 1, label: "1 HR" },
  { id: 24, label: "1 DAY" },
  { id: 168, label: "1 WEEK" },
  { id: 720, label: "30 DAYS" },
];

function scaleLabel(hours: Horizon) {
  if (hours === 1) return "hourly run-rate";
  if (hours === 24) return "daily run-rate";
  if (hours === 168) return "weekly run-rate";
  return "30-day run-rate";
}

function unitLabel(business: BusinessEntity) {
  if (business.sector === "Retail") return "stock unit";
  if (business.sector === "Mobility") return "vehicle";
  if (business.sector === "Tech_SaaS") return "subscriber";
  if (business.sector === "Construction_Mega") return "land unit";
  return "branch";
}

export function BusinessAnalyticsPanel({ business, finance }: Props) {
  const [horizon, setHorizon] = useState<Horizon>(24);
  const projection = useMemo(() => ({
    revenue: finance.revenue * horizon,
    expenses: finance.expenses * horizon,
    net: finance.net * horizon,
  }), [finance.expenses, finance.net, finance.revenue, horizon]);
  const margin = finance.revenue > 0 ? Math.max(0, Math.min(100, (finance.net / finance.revenue) * 100)) : 0;
  const expenseRatio = finance.revenue > 0 ? Math.max(0, Math.min(100, (finance.expenses / finance.revenue) * 100)) : 0;
  const efficiency = Math.max(0, Math.min(100, 100 - expenseRatio));

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>DECISION ANALYTICS</Text>
        <Text style={styles.title}>Know what the next reinvestment buys.</Text>
        <Text style={styles.subtitle}>Transparent projections from the current settlement rate. This is a run-rate view, not fabricated historical performance.</Text>
      </View>
      <View style={styles.rangeRow} accessibilityRole="tablist">
        {horizons.map((item) => <Pressable key={item.id} onPress={() => setHorizon(item.id)} accessibilityRole="tab" accessibilityState={{ selected: horizon === item.id }} style={({ pressed }) => [styles.range, horizon === item.id && styles.rangeActive, pressed && styles.pressed]}><Text style={[styles.rangeText, horizon === item.id && styles.rangeTextActive]}>{item.label}</Text></Pressable>)}
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>{scaleLabel(horizon).toUpperCase()}</Text><Text style={styles.cardMeta}>CURRENT ENGINE</Text></View>
        <Row label="Revenue" value={formatCurrency(projection.revenue)} tone="positive" />
        <Row label="Operating costs" value={`-${formatCurrency(projection.expenses)}`} tone="negative" />
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Projected net</Text><Text style={styles.totalValue}>{formatCurrency(projection.net)}</Text></View>
      </View>
      <View style={styles.grid}>
        <Score label="NET MARGIN" value={`${margin.toFixed(1)}%`} fill={margin} color={colors.success} />
        <Score label="COST EFFICIENCY" value={`${efficiency.toFixed(1)}%`} fill={efficiency} color={colors.primary} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>UNIT ECONOMICS</Text>
        <View style={styles.unitRow}><Text style={styles.unitValue}>{formatCurrency(finance.perUnit)}</Text><Text style={styles.unitCopy}>net / active {unitLabel(business)}</Text></View>
        <Text style={styles.explain}>Improve this number by raising productive capacity or reducing operating cost—not by spending ahead of demand.</Text>
      </View>
    </View>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "positive" | "negative" }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={[styles.rowValue, { color: tone === "positive" ? colors.success : colors.danger }]}>{value}</Text></View>;
}
function Score({ label, value, fill, color }: { label: string; value: string; fill: number; color: string }) {
  return <View style={styles.score}><View style={styles.scoreHeader}><Text style={styles.scoreLabel}>{label}</Text><Text style={[styles.scoreValue, { color }]}>{value}</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${Math.max(3, fill)}%`, backgroundColor: color }]} /></View></View>;
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  hero: { backgroundColor: colors.surfaceDark, borderRadius: designSystem.radius.hero, borderWidth: 1, borderColor: colors.borderDark, padding: designSystem.spacing.xl },
  eyebrow: { color: colors.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  title: { color: colors.textOnDark, fontSize: 20, lineHeight: 25, fontWeight: "800", marginTop: 6 },
  subtitle: { color: colors.textOnDarkSecondary, fontSize: 12, lineHeight: 18, marginTop: 7 },
  rangeRow: { flexDirection: "row", gap: 7 },
  range: { flex: 1, minHeight: 38, alignItems: "center", justifyContent: "center", borderRadius: designSystem.radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  rangeActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  rangeText: { color: colors.textSecondary, fontSize: 9, fontWeight: "800", letterSpacing: 0.4 },
  rangeTextActive: { color: colors.primary },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  card: { backgroundColor: colors.surface, borderRadius: designSystem.radius.large, borderWidth: 1, borderColor: colors.border, padding: designSystem.spacing.lg },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: "800", letterSpacing: 0.7 },
  cardMeta: { color: colors.textMuted, fontSize: 9, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.surfaceMuted },
  rowLabel: { color: colors.textSecondary, fontSize: 13 },
  rowValue: { fontSize: 13, fontWeight: "800" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 13 },
  totalLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: "800" },
  totalValue: { color: colors.success, fontSize: 16, fontWeight: "800" },
  grid: { flexDirection: "row", gap: 8 },
  score: { flex: 1, backgroundColor: colors.surface, borderRadius: designSystem.radius.medium, borderWidth: 1, borderColor: colors.border, padding: 12 },
  scoreHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scoreLabel: { color: colors.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  scoreValue: { fontSize: 14, fontWeight: "800" },
  track: { height: 7, borderRadius: 4, backgroundColor: colors.surfaceMuted, overflow: "hidden", marginTop: 10 },
  fill: { height: "100%", borderRadius: 4 },
  unitRow: { flexDirection: "row", alignItems: "baseline", marginTop: 12 },
  unitValue: { color: colors.textPrimary, fontSize: 24, fontWeight: "800" },
  unitCopy: { color: colors.textSecondary, fontSize: 12, marginLeft: 7 },
  explain: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 8 },
});
