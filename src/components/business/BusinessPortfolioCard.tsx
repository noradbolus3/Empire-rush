import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CanonicalBusiness } from "../../engine/canonicalBusinessRegistry";
import type { BusinessDisplayMeta } from "../../data/businessDisplayCatalog";
import { formatCurrency } from "../../utils/formatCurrency";

export type PortfolioCardStatus = "owned" | "available" | "locked";

type Props = {
  record: CanonicalBusiness;
  display: BusinessDisplayMeta;
  status: PortfolioCardStatus;
  unlockShortfall?: number;
  onPress?: () => void;
  actionLabel?: string;
};

export function BusinessPortfolioCard({
  record,
  display,
  status,
  unlockShortfall = 0,
  onPress,
  actionLabel,
}: Props) {
  const interactive = Boolean(onPress) && status !== "locked";
  const statusLabel = status === "owned" ? "OWNED" : status === "available" ? "AVAILABLE" : "LOCKED";
  const action = actionLabel ?? (status === "owned" ? "MANAGE" : status === "available" ? "START" : "LOCKED");

  return (
    <Pressable
      accessibilityRole={interactive ? "button" : undefined}
      accessibilityLabel={`${display.shortLabel} · ${statusLabel.toLowerCase()}`}
      disabled={!interactive}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderColor: `${display.accent}55` }, status === "locked" && styles.locked, pressed && styles.pressed]}
    >
      <View style={[styles.visual, { backgroundColor: `${display.accent}18`, borderColor: `${display.accent}55` }]}>
        <Text style={styles.visualMark}>{visualMark(display.visualKey)}</Text>
        <Text style={[styles.visualKey, { color: display.accent }]}>{display.visualKey.replace(/-/g, " ").toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.category, { color: display.accent }]} numberOfLines={1}>{display.categoryLabel}</Text>
          <Text style={[styles.status, status === "owned" ? styles.statusOwned : status === "available" ? styles.statusAvailable : styles.statusLocked]}>{statusLabel}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{record.name || display.shortLabel}</Text>
        <Text style={styles.tagline} numberOfLines={2}>{display.tagline}</Text>
        <View style={styles.metrics}>
          <Metric label="NET / HR" value={status === "owned" ? formatCurrency(record.hourlyNet) : "—"} />
          <Metric label="ASSET VALUE" value={status === "owned" ? formatCurrency(record.assetValue) : "—"} />
        </View>
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerLabel}>{status === "owned" ? "OPERATING STATE" : status === "available" ? "ENTRY CAPITAL" : "UNLOCK GAP"}</Text>
            <Text style={styles.footerValue} numberOfLines={1}>
              {status === "owned" ? (record.operating ? "Operating" : "Setup in progress") : status === "available" ? formatCurrency(Math.max(0, display.charterCost || record.assetValue)) : `${formatCurrency(Math.max(0, unlockShortfall))} more net worth`}
            </Text>
          </View>
          <Text style={[styles.action, { color: display.accent }]}>{action} ›</Text>
        </View>
      </View>
    </Pressable>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function visualMark(key: string): string {
  const marks: Record<string, string> = {
    "operating-company": "⌂",
    "taxi-fleet": "▣",
    "shipping-logistics": "◆",
    "factory-floor": "▤",
    "construction-site": "△",
    "dealership-showroom": "◇",
    "software-studio": "◈",
    "sports-arena": "○",
    "energy-infrastructure": "⚡",
    "airline-hangar": "✈",
    "hotel-property": "▥",
    "digital-infrastructure": "◎",
    aerospace: "✦",
    "holding-group": "⬡",
  };
  return marks[key] ?? "•";
}

const styles = StyleSheet.create({
  card: { overflow: "hidden", flexDirection: "row", backgroundColor: "#FFFFFF", borderWidth: 1, borderRadius: 20, marginBottom: 12, minHeight: 168, shadowColor: "#29435E", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  locked: { opacity: 0.62 },
  pressed: { transform: [{ scale: 0.985 }] },
  visual: { width: 92, margin: 10, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", padding: 8 },
  visualMark: { color: "#29435E", fontSize: 32, fontWeight: "800", marginBottom: 12 },
  visualKey: { fontSize: 8, fontWeight: "800", letterSpacing: 0.6, textAlign: "center" },
  body: { flex: 1, minWidth: 0, paddingVertical: 14, paddingRight: 14 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  category: { flex: 1, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  status: { fontSize: 9, fontWeight: "900", letterSpacing: 0.6 },
  statusOwned: { color: "#23845B" },
  statusAvailable: { color: "#456D96" },
  statusLocked: { color: "#8B96A3" },
  title: { color: "#1C2B3A", fontSize: 17, fontWeight: "900", marginTop: 5 },
  tagline: { color: "#718091", fontSize: 11, lineHeight: 16, marginTop: 4 },
  metrics: { flexDirection: "row", gap: 18, marginTop: 9 },
  metric: { minWidth: 76 },
  metricLabel: { color: "#8A98A7", fontSize: 8, fontWeight: "800", letterSpacing: 0.6 },
  metricValue: { color: "#29435E", fontSize: 12, fontWeight: "800", marginTop: 2 },
  footer: { flexDirection: "row", alignItems: "flex-end", marginTop: 10 },
  footerLabel: { color: "#9AA5B1", fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  footerValue: { color: "#425466", fontSize: 11, fontWeight: "700", marginTop: 2 },
  action: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5, paddingLeft: 8 },
});
