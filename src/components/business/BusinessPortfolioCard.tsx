import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { CanonicalBusiness } from "../../engine/canonicalBusinessRegistry";
import type { BusinessDisplayMeta } from "../../data/businessDisplayCatalog";
import { BUSINESS_PHOTOS } from "../../data/businessPhotos";
import { formatCurrency } from "../../utils/formatCurrency";

export type PortfolioCardStatus = "owned" | "available" | "locked";

type Props = {
  record: CanonicalBusiness;
  display: BusinessDisplayMeta;
  status: PortfolioCardStatus;
  unlockShortfall?: number;
  /** Player's current cash. Used to show whether an available business can be started right now. */
  cash?: number;
  /** Player's current net worth. Used to show unlock progress on locked rows. */
  netWorth?: number;
  /** Display-only overrides for generic starter businesses. */
  categoryLabel?: string;
  tagline?: string;
  onPress?: () => void;
  actionLabel?: string;
};

const FONT_CAP = 1.15;

export function BusinessPortfolioCard({
  record,
  display,
  status,
  unlockShortfall = 0,
  cash,
  netWorth,
  categoryLabel,
  tagline,
  onPress,
  actionLabel,
}: Props) {
  const interactive = Boolean(onPress) && status !== "locked";
  const statusLabel = status === "owned" ? "OWNED" : status === "available" ? "AVAILABLE" : "LOCKED";
  const category = categoryLabel ?? display.categoryLabel;
  const copy = tagline ?? display.tagline;
  const title = record.name || display.shortLabel;
  const entryCost = Math.max(0, display.charterCost || record.assetValue);
  const cashShortfall = cash === undefined ? 0 : Math.max(0, entryCost - cash);
  const canAfford = cashShortfall <= 0;

  if (status === "locked") {
    const target = (netWorth ?? 0) + Math.max(0, unlockShortfall);
    const progress = target > 0 ? Math.max(0, Math.min(1, (netWorth ?? 0) / target)) : 0;
    return (
      <View
        accessibilityLabel={`${title} · locked · needs ${formatCurrency(Math.max(0, unlockShortfall))} more net worth`}
        style={[styles.lockedRow, { borderColor: `${display.accent}33` }]}
      >
        <View style={[styles.lockedTile, { backgroundColor: `${display.accent}18` }]}>
          {BUSINESS_PHOTOS[display.visualKey] ? (
            <Image source={BUSINESS_PHOTOS[display.visualKey]} style={styles.lockedPhoto} resizeMode="cover" accessibilityIgnoresInvertColors />
          ) : (
            <Text maxFontSizeMultiplier={FONT_CAP} style={styles.lockedGlyph}>◌</Text>
          )}
          <View style={styles.lockedVeil} />
        </View>
        <View style={styles.lockedBody}>
          <Text maxFontSizeMultiplier={FONT_CAP} style={styles.lockedTitle} numberOfLines={1}>{title}</Text>
          <Text maxFontSizeMultiplier={FONT_CAP} style={styles.lockedMeta} numberOfLines={1}>
            {category} · needs {formatCurrency(Math.max(0, unlockShortfall))} more net worth
          </Text>
          <View style={styles.lockedTrack}>
            <View style={[styles.lockedFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: display.accent }]} />
          </View>
        </View>
      </View>
    );
  }

  const action = actionLabel ?? (status === "owned" ? "MANAGE" : "START");
  const actionText = status === "available" && !canAfford ? `NEED ${formatCurrency(cashShortfall)}` : `${action} ›`;

  return (
    <Pressable
      accessibilityRole={interactive ? "button" : undefined}
      accessibilityLabel={`${title} · ${statusLabel.toLowerCase()}${status === "available" ? ` · entry ${formatCurrency(entryCost)}` : ""}`}
      disabled={!interactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: `${display.accent}66` },
        status === "available" && !canAfford && styles.cardNeedsCash,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.tile, { backgroundColor: `${display.accent}1F`, borderColor: `${display.accent}55` }]}>
          {BUSINESS_PHOTOS[display.visualKey] ? (
            <Image source={BUSINESS_PHOTOS[display.visualKey]} style={styles.photo} resizeMode="cover" accessibilityIgnoresInvertColors />
          ) : (
            <Text maxFontSizeMultiplier={FONT_CAP} style={[styles.tileMark, { color: display.accent }]}>{visualMark(display.visualKey)}</Text>
          )}
        </View>
        <View style={styles.body}>
          <Text maxFontSizeMultiplier={FONT_CAP} style={[styles.category, { color: display.accent }]} numberOfLines={1}>{category}</Text>
          <Text maxFontSizeMultiplier={FONT_CAP} style={styles.title} numberOfLines={2}>{title}</Text>
          <Text maxFontSizeMultiplier={FONT_CAP} style={styles.tagline} numberOfLines={1}>{copy}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        {status === "owned" ? (
          <View style={styles.metrics}>
            <Metric label="NET / HR" value={formatCurrency(record.hourlyNet)} />
            <Metric label="ASSET VALUE" value={formatCurrency(record.assetValue)} />
            <Metric label="STATUS" value={record.operating ? "Operating" : "Setting up"} />
          </View>
        ) : (
          <View style={styles.entry}>
            <Text maxFontSizeMultiplier={FONT_CAP} style={styles.footerLabel}>ENTRY CAPITAL</Text>
            <Text maxFontSizeMultiplier={FONT_CAP} style={[styles.footerValue, !canAfford && styles.footerValueShort]} numberOfLines={1}>{formatCurrency(entryCost)}</Text>
          </View>
        )}
        <View style={[styles.actionPill, { backgroundColor: status === "available" && !canAfford ? "#EEF2F6" : `${display.accent}22`, borderColor: status === "available" && !canAfford ? "#D3DBE4" : `${display.accent}88` }]}>
          <Text maxFontSizeMultiplier={FONT_CAP} style={[styles.actionText, { color: status === "available" && !canAfford ? "#6B7A8A" : display.accent }]} numberOfLines={1}>{actionText}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text maxFontSizeMultiplier={FONT_CAP} style={styles.metricLabel}>{label}</Text>
      <Text maxFontSizeMultiplier={FONT_CAP} style={styles.metricValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// Text-presentation selectors (U+FE0E) stop Android from swapping these for colour emoji.
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
    "energy-infrastructure": "↯\uFE0E",
    "airline-hangar": "✈\uFE0E",
    "hotel-property": "▥",
    "digital-infrastructure": "◎",
    aerospace: "✦",
    "holding-group": "⬡",
  };
  return marks[key] ?? "•";
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderRadius: 16, marginBottom: 10, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10, shadowColor: "#29435E", shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cardNeedsCash: { backgroundColor: "#FBFCFD" },
  pressed: { transform: [{ scale: 0.985 }] },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  tile: { width: 72, height: 72, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  photo: { width: "100%", height: "100%" },
  lockedPhoto: { width: "100%", height: "100%" },
  lockedVeil: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(241,245,249,0.62)" },
  tileMark: { fontSize: 26, fontWeight: "800" },
  body: { flex: 1, minWidth: 0 },
  category: { fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
  title: { color: "#1C2B3A", fontSize: 16, lineHeight: 20, fontWeight: "900", marginTop: 1 },
  tagline: { color: "#6B7A8A", fontSize: 12, lineHeight: 16, marginTop: 2 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#D9E1EA" },
  entry: { flexShrink: 1 },
  footerLabel: { color: "#7B8998", fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  footerValue: { color: "#1C2B3A", fontSize: 16, fontWeight: "900", marginTop: 1 },
  footerValueShort: { color: "#425466" },
  metrics: { flex: 1, flexDirection: "row", gap: 14, flexWrap: "wrap" },
  metric: { minWidth: 64 },
  metricLabel: { color: "#7B8998", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  metricValue: { color: "#1C2B3A", fontSize: 13, fontWeight: "800", marginTop: 1 },
  actionPill: { minHeight: 40, minWidth: 96, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  actionText: { fontSize: 12, fontWeight: "900", letterSpacing: 0.4 },
  lockedRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F4F7FA", borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  lockedTile: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  lockedGlyph: { fontSize: 17, color: "#6B7A8A" },
  lockedBody: { flex: 1, minWidth: 0 },
  lockedTitle: { color: "#4A5968", fontSize: 14, fontWeight: "800" },
  lockedMeta: { color: "#6B7A8A", fontSize: 11, marginTop: 1 },
  lockedTrack: { height: 4, borderRadius: 2, backgroundColor: "#DDE5EE", overflow: "hidden", marginTop: 6 },
  lockedFill: { height: "100%", borderRadius: 2, minWidth: 3 },
});
