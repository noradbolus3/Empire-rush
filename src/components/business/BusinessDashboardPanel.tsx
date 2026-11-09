import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  onStarterOrder?: () => void;
  starterLabel?: string;
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

function loopSteps(business: BusinessEntity): [string, string, string] {
  if (business.sector === "Retail") return ["1 Order stock", "2 Customers buy", "3 Profit every hour"];
  if (business.sector === "Mobility") return ["1 Buy vehicles", "2 Rides earn fares", "3 Profit every hour"];
  if (business.sector === "Tech_SaaS") return ["1 Add servers", "2 Gain subscribers", "3 Revenue every hour"];
  if (business.sector === "Construction_Mega") return ["1 Win a tender", "2 Build phases", "3 Paid on delivery"];
  return ["1 Hire staff", "2 Open branches", "3 Profit every hour"];
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

export function BusinessDashboardPanel({ business, cash, netWorth, timestamp, finance, onStarterOrder, starterLabel }: Props) {
  const units = unitsFor(business);
  const capacity = Math.max(1, capacityFor(business));
  const utilization = Math.min(1, Math.max(0, units / capacity));
  const lastUpdated = new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const steps = loopSteps(business);
  const idleRetail = business.sector === "Retail" && business.stockUnits <= 0;

  return (
    <View style={styles.root}>
      <View style={styles.loopRow}>
        {steps.map((label, index) => (
          <View key={label} style={[styles.loopChip, idleRetail && index === 0 && styles.loopChipActive]}>
            <Text style={[styles.loopText, idleRetail && index === 0 && styles.loopTextActive]} numberOfLines={2}>{label}</Text>
          </View>
        ))}
      </View>

      {idleRetail && onStarterOrder ? (
        <View style={styles.startCard}>
          <Text style={styles.startTitle}>Shelves are empty - nothing to sell</Text>
          <Text style={styles.startCopy}>Buy stock once. Customers then buy it automatically and cash lands in your wallet every hour.</Text>
          <Pressable onPress={onStarterOrder} accessibilityRole="button" accessibilityLabel={starterLabel} style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
            <Text style={styles.startButtonText}>{starterLabel}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.nextCard}>
          <Text style={styles.eyebrow}>NEXT MOVE</Text>
          <Text style={styles.nextTitle}>{nextAction(business, cash)}</Text>
        </View>
      )}

      <View style={styles.metricGrid}>
        <Metric label="PROFIT / HR" value={formatCurrency(finance.net)} accent={colors.success} />
        <Metric label="CASH" value={formatCurrency(cash)} accent={colors.primary} />
        <Metric label="NET WORTH" value={formatCurrency(netWorth)} accent={colors.gold} />
        <Metric label="PAYS BACK IN" value={finance.breakEven > 0 ? `${finance.breakEven} hr` : "-"} accent={colors.cyan} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>{business.sector === "Retail" ? "STOCK ON SHELVES" : "CAPACITY"}</Text><Text style={styles.cardMeta}>Updated {lastUpdated}</Text></View>
        <View style={styles.capacityRow}><Text style={styles.capacityValue}>{Math.round(utilization * 100)}%</Text><Text style={styles.capacityCopy}>{units.toLocaleString()} / {capacity.toLocaleString()}</Text></View>
        <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(3, utilization * 100)}%` }]} /></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>CURRENT SIGNAL</Text><Text style={styles.detailValue}>{eventLabel(business)}</Text></View>
      </View>
    </View>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return <View style={styles.metric}><Text style={[styles.metricLabel, { color: accent }]}>{label}</Text><Text style={styles.metricValue} numberOfLines={1}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  root: { gap: 10 },
  loopRow: { flexDirection: "row", gap: 6 },
  loopChip: { flex: 1, minHeight: 38, paddingHorizontal: 8, paddingVertical: 6, borderRadius: designSystem.radius.medium, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
  loopChipActive: { backgroundColor: colors.primary },
  loopText: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", textAlign: "center" },
  loopTextActive: { color: "#FFFFFF" },
  startCard: { backgroundColor: colors.surfaceDark, borderRadius: designSystem.radius.large, padding: 14, borderWidth: 1, borderColor: colors.borderDark },
  startTitle: { color: colors.textOnDark, fontSize: 16, fontWeight: "800" },
  startCopy: { color: colors.textOnDarkSecondary, fontSize: 12, lineHeight: 17, marginTop: 5 },
  startButton: { marginTop: 11, minHeight: 48, borderRadius: designSystem.radius.medium, backgroundColor: colors.successDark, alignItems: "center", justifyContent: "center" },
  startButtonText: { color: "#04120D", fontSize: 13, fontWeight: "900", letterSpacing: 0.4 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metric: { width: "48.5%", minHeight: 58, justifyContent: "center", backgroundColor: colors.surface, borderRadius: designSystem.radius.medium, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
  metricLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  metricValue: { color: colors.textPrimary, fontSize: 16, fontWeight: "800", marginTop: 3 },
  card: { backgroundColor: colors.surface, borderRadius: designSystem.radius.large, borderWidth: 1, borderColor: colors.border, padding: 13 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: "800", letterSpacing: 0.7 },
  cardMeta: { color: colors.textMuted, fontSize: 10 },
  capacityRow: { flexDirection: "row", alignItems: "baseline", marginTop: 8 },
  capacityValue: { color: colors.primary, fontSize: 24, fontWeight: "800" },
  capacityCopy: { color: colors.textSecondary, fontSize: 12, marginLeft: 8 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceMuted, overflow: "hidden", marginTop: 8 },
  fill: { height: "100%", borderRadius: 4, backgroundColor: colors.primary },
  detailRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 9, marginTop: 10 },
  detailLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  detailValue: { flex: 1, color: colors.textPrimary, fontSize: 12, fontWeight: "600", textAlign: "right" },
  nextCard: { backgroundColor: colors.primarySoft, borderRadius: designSystem.radius.large, borderWidth: 1, borderColor: colors.border, padding: 13 },
  nextTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "800", marginTop: 4 },
});
