import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BusinessEntity } from "../../types/business";
import { formatCurrency } from "../../utils/formatCurrency";
import { designSystem } from "../../theme/designSystem";

type Props = {
  business: BusinessEntity;
  cash: number;
  netWorth: number;
  timestamp: number;
  finance: {
    revenue: number;
    expenses: number;
    net: number;
    breakEven: number;
    perUnit: number;
  };
};

const colors = designSystem.colors;

function unitsFor(business: BusinessEntity) {
  if (business.sector === "Retail") return business.stockUnits;
  if (business.sector === "Mobility") {
    return business.economySedans + business.electricEVs + business.luxuryLimos;
  }
  if (business.sector === "Tech_SaaS") return business.activeSubscribers;
  if (business.sector === "Construction_Mega") return business.landOwned ?? 0;
  return business.branchCount ?? 0;
}

function capacityFor(business: BusinessEntity) {
  if (business.sector === "Retail") return business.maxStockCapacity;
  if (business.sector === "Mobility") return Math.max(1, unitsFor(business));
  if (business.sector === "Tech_SaaS") return business.serverCapacity;
  if (business.sector === "Construction_Mega") return business.landCapacity ?? 1;
  return Math.max(1, (business.branchCount ?? 0) + 2);
}

function eventLabel(business: BusinessEntity) {
  if (business.sector === "Retail") return business.demandEvent ?? "None";
  if (business.sector === "Mobility") return business.surgeActive ? "Surge pricing active" : "Standard fares";
  if (business.sector === "Tech_SaaS") return business.openBugs > 0 ? `${business.openBugs} open bugs` : "No open bugs";
  if (business.sector === "Construction_Mega") return business.activeTenderName ?? "No active tender";
  return business.activeEvent ?? "No active event";
}

function nextAction(business: BusinessEntity, cash: number) {
  if (business.sector === "Retail") {
    if (business.stockUnits <= 0) return "Order stock to restart sales";
    if (!business.hasManager) return cash >= 12000 ? "Hire a store manager" : "Build cash for a store manager";
    return "Tune pricing to the current demand pulse";
  }
  if (business.sector === "Mobility") return cash >= 12000 ? "Add an economy sedan" : "Build cash for the next vehicle";
  if (business.sector === "Tech_SaaS") return business.openBugs > 0 ? "Run an engineering bug-bash" : "Scale server capacity before growth";
  if (business.sector === "Construction_Mega") return business.activeTenderName ? "Keep the active project on schedule" : "Review the next tender";
  return !business.managerHired ? "Hire a manager to automate growth" : "Open the next branch";
}

export function BusinessDashboardPanel({ business, cash, netWorth, timestamp, finance }: Props) {
  const units = unitsFor(business);
  const capacity = Math.max(1, capacityFor(business));
  const utilization = Math.min(1, Math.max(0, units / capacity));
  const runwayHours = finance.expenses > 0 ? cash / finance.expenses : Infinity;
  const lastUpdated = new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>OPERATING DASHBOARD</Text>
          <Text style={styles.title}>Run the business, not the spreadsheet.</Text>
          <Text style={styles.subtitle}>A live read on cash, capacity, demand and the next decision for {business.name}.</Text>
        </View>
        <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
      </View>

      <View style={styles.metricGrid}>
        <Metric label="NET / HR" value={formatCurrency(finance.net)} accent={colors.success} />
        <Metric label="CASH AVAILABLE" value={formatCurrency(cash)} accent={colors.primary} />
        <Metric label="NET WORTH" value={formatCurrency(netWorth)} accent={colors.gold} />
        <Metric label="BREAK-EVEN" value={`${finance.breakEven} hr`} accent={colors.cyan} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>CAPACITY & OPERATIONS</Text><Text style={styles.cardMeta}>Updated {lastUpdated}</Text></View>
        <View style={styles.capacityRow}><Text style={styles.capacityValue}>{Math.round(utilization * 100)}%</Text><Text style={styles.capacityCopy}>{units.toLocaleString()} / {capacity.toLocaleString()} active capacity</Text></View>
        <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(3, utilization * 100)}%` }]} /></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>CURRENT SIGNAL</Text><Text style={styles.detailValue}>{eventLabel(business)}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>RUNWAY</Text><Text style={styles.detailValue}>{Number.isFinite(runwayHours) ? `${runwayHours.toFixed(1)} operating hours` : "No fixed operating burn"}</Text></View>
      </View>

      <View style={styles.nextCard}>
        <Text style={styles.eyebrow}>NEXT BEST MOVE</Text>
        <Text style={styles.nextTitle}>{nextAction(business, cash)}</Text>
        <Text style={styles.nextCopy}>Keep the loop moving: revenue in, operating costs controlled, then reinvest where the constraint is visible.</Text>
      </View>
    </View>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return <View style={styles.metric}><Text style={[styles.metricLabel, { color: accent }]}>{label}</Text><Text style={styles.metricValue} numberOfLines={1}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  hero: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", backgroundColor: colors.surfaceDark, borderRadius: designSystem.radius.hero, padding: designSystem.spacing.xl, borderWidth: 1, borderColor: colors.borderDark },
  heroCopy: { flex: 1, paddingRight: 14 },
  eyebrow: { color: colors.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  title: { color: colors.textOnDark, fontSize: 20, lineHeight: 25, fontWeight: "800", marginTop: 6 },
  subtitle: { color: colors.textOnDarkSecondary, fontSize: 12, lineHeight: 18, marginTop: 7 },
  liveBadge: { flexDirection: "row", alignItems: "center", backgroundColor: colors.successDarkSoft, borderRadius: designSystem.radius.round, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.successDark, marginRight: 5 },
  liveText: { color: colors.successDark, fontSize: 10, fontWeight: "800" },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metric: { width: "48%", minHeight: 70, justifyContent: "center", backgroundColor: colors.surface, borderRadius: designSystem.radius.medium, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13 },
  metricLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  metricValue: { color: colors.textPrimary, fontSize: 17, fontWeight: "800", marginTop: 5 },
  card: { backgroundColor: colors.surface, borderRadius: designSystem.radius.large, borderWidth: 1, borderColor: colors.border, padding: designSystem.spacing.lg },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: "800", letterSpacing: 0.7 },
  cardMeta: { color: colors.textMuted, fontSize: 10 },
  capacityRow: { flexDirection: "row", alignItems: "baseline", marginTop: 15 },
  capacityValue: { color: colors.primary, fontSize: 26, fontWeight: "800" },
  capacityCopy: { color: colors.textSecondary, fontSize: 12, marginLeft: 8 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceMuted, overflow: "hidden", marginTop: 9 },
  fill: { height: "100%", borderRadius: 4, backgroundColor: colors.primary },
  detailRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 11 },
  detailLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  detailValue: { flex: 1, color: colors.textPrimary, fontSize: 12, fontWeight: "600", textAlign: "right" },
  nextCard: { backgroundColor: colors.primarySoft, borderRadius: designSystem.radius.large, borderWidth: 1, borderColor: colors.border, padding: designSystem.spacing.lg },
  nextTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: "800", marginTop: 5 },
  nextCopy: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 6 },
});
