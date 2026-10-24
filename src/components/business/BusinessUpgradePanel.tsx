import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BusinessEntity, ExpansionData, MobilityData, RetailData, SaaSData } from "../../types/business";
import { formatCurrency } from "../../utils/formatCurrency";
import { designSystem } from "../../theme/designSystem";

type Props = {
  business: BusinessEntity;
  cash: number;
  spend: (cost: number, update: () => BusinessEntity) => void;
};

type Upgrade = { id: string; title: string; description: string; cost: number; locked?: boolean; lockedReason?: string; apply: () => BusinessEntity };
const colors = designSystem.colors;

function upgradesFor(business: BusinessEntity, cash: number): Upgrade[] {
  if (business.sector === "Retail") {
    const retail = business as RetailData;
    return [
      { id: "warehouse", title: "Expand warehouse", description: "+15,000 stock capacity", cost: 20000, lockedReason: cash < 20000 ? `Need ${formatCurrency(20000 - cash)} more` : undefined, apply: () => ({ ...retail, maxStockCapacity: retail.maxStockCapacity + 15000 }) },
      { id: "security", title: retail.hasSecurity ? "Security squad active" : "Hire security squad", description: "Eliminates shoplifting risk", cost: 5000, locked: retail.hasSecurity, lockedReason: retail.hasSecurity ? "Already installed" : cash < 5000 ? `Need ${formatCurrency(5000 - cash)} more` : undefined, apply: () => ({ ...retail, hasSecurity: true }) },
      { id: "manager", title: retail.hasManager ? "Store manager active" : "Hire store manager", description: "Unlocks advanced auto-order decisions", cost: 12000, locked: retail.hasManager, lockedReason: retail.hasManager ? "Already installed" : cash < 12000 ? `Need ${formatCurrency(12000 - cash)} more` : undefined, apply: () => ({ ...retail, hasManager: true }) },
    ];
  }
  if (business.sector === "Mobility") {
    const mobility = business as MobilityData;
    return [
      { id: "sedan", title: "Add economy sedan", description: "+$50/hr base fleet income", cost: 12000, lockedReason: cash < 12000 ? `Need ${formatCurrency(12000 - cash)} more` : undefined, apply: () => ({ ...mobility, economySedans: mobility.economySedans + 1 }) },
      { id: "ev", title: "Add electric EV", description: "+$150/hr and stronger fleet positioning", cost: 32000, lockedReason: cash < 32000 ? `Need ${formatCurrency(32000 - cash)} more` : undefined, apply: () => ({ ...mobility, electricEVs: mobility.electricEVs + 1 }) },
      { id: "service", title: "Fleet service overhaul", description: "Restore fleet health to 100%", cost: 1500, locked: mobility.fleetHealth >= 100, lockedReason: mobility.fleetHealth >= 100 ? "Fleet already serviced" : cash < 1500 ? `Need ${formatCurrency(1500 - cash)} more` : undefined, apply: () => ({ ...mobility, fleetHealth: 100 }) },
    ];
  }
  if (business.sector === "Tech_SaaS") {
    const saas = business as SaaSData;
    return [
      { id: "servers", title: "Scale server nodes", description: "+25,000 subscriber capacity", cost: 6000, lockedReason: cash < 6000 ? `Need ${formatCurrency(6000 - cash)} more` : undefined, apply: () => ({ ...saas, serverCapacity: saas.serverCapacity + 25000 }) },
      { id: "bugs", title: "Run bug-bash sprint", description: "Clear 25 open bugs", cost: 2500, locked: saas.openBugs === 0, lockedReason: saas.openBugs === 0 ? "No open bugs" : cash < 2500 ? `Need ${formatCurrency(2500 - cash)} more` : undefined, apply: () => ({ ...saas, openBugs: Math.max(0, saas.openBugs - 25) }) },
      { id: "campaign", title: "Global acquisition campaign", description: "+2,500 active subscribers", cost: 5000, lockedReason: cash < 5000 ? `Need ${formatCurrency(5000 - cash)} more` : undefined, apply: () => ({ ...saas, activeSubscribers: saas.activeSubscribers + 2500 }) },
    ];
  }
  const expansion = business as ExpansionData;
  const branchCost = 25000 * Math.max(1, expansion.branchCount);
  const staffCost = 5000 * Math.max(1, expansion.staffCount);
  const levelCost = 30000 * (expansion.upgradeLevel + 1);
  return [
    { id: "staff", title: `Hire staff · ${expansion.staffCount} on roster`, description: "+4 staff and improved satisfaction", cost: staffCost, lockedReason: cash < staffCost ? `Need ${formatCurrency(staffCost - cash)} more` : undefined, apply: () => ({ ...expansion, staffCount: expansion.staffCount + 4 }) },
    { id: "manager", title: expansion.managerHired ? "General manager active" : "Hire general manager", description: "Automates reputation and contract decisions", cost: 15000, locked: expansion.managerHired, lockedReason: expansion.managerHired ? "Already installed" : cash < 15000 ? `Need ${formatCurrency(15000 - cash)} more` : undefined, apply: () => ({ ...expansion, managerHired: true }) },
    { id: "branch", title: `Open branch · ${expansion.branchCount} live`, description: "+1 branch and more contract capacity", cost: branchCost, lockedReason: cash < branchCost ? `Need ${formatCurrency(branchCost - cash)} more` : undefined, apply: () => ({ ...expansion, branchCount: expansion.branchCount + 1 }) },
    { id: "level", title: `Upgrade level ${expansion.upgradeLevel + 1}`, description: "+18% base yield", cost: levelCost, lockedReason: cash < levelCost ? `Need ${formatCurrency(levelCost - cash)} more` : undefined, apply: () => ({ ...expansion, upgradeLevel: expansion.upgradeLevel + 1 }) },
  ];
}

export function BusinessUpgradePanel({ business, cash, spend }: Props) {
  const upgrades = upgradesFor(business, cash);
  return (
    <View style={styles.root}>
      <View style={styles.header}><View><Text style={styles.eyebrow}>CAPITAL ALLOCATION</Text><Text style={styles.title}>Upgrade what is holding you back.</Text></View><Text style={styles.cash}>{formatCurrency(cash)}</Text></View>
      <Text style={styles.intro}>Every upgrade has a visible operating effect. Spend only when the next constraint is clear.</Text>
      {upgrades.map((upgrade) => {
        const disabled = Boolean(upgrade.locked || upgrade.lockedReason);
        return <Pressable key={upgrade.id} disabled={disabled} onPress={() => spend(upgrade.cost, upgrade.apply)} accessibilityRole="button" accessibilityState={{ disabled }} accessibilityLabel={`${upgrade.title}, ${disabled ? upgrade.lockedReason ?? "unavailable" : `install for ${formatCurrency(upgrade.cost)}`}`} style={({ pressed }) => [styles.card, disabled && styles.disabled, pressed && styles.pressed]}>
          <View style={styles.copy}><Text style={styles.cardTitle}>{upgrade.title}</Text><Text style={styles.cardDescription}>{upgrade.description}</Text><Text style={[styles.cardReason, disabled && styles.lockedReason]}>{disabled ? upgrade.lockedReason : `Ready · ${formatCurrency(upgrade.cost)}`}</Text></View>
          <View style={[styles.cost, disabled && styles.costDisabled]}><Text style={styles.costValue}>{formatCurrency(upgrade.cost)}</Text><Text style={styles.costLabel}>{upgrade.locked ? "ACTIVE" : disabled ? "LOCKED" : "INSTALL"}</Text></View>
        </Pressable>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", backgroundColor: colors.surfaceDark, borderRadius: designSystem.radius.hero, borderWidth: 1, borderColor: colors.borderDark, padding: designSystem.spacing.xl },
  eyebrow: { color: colors.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  title: { color: colors.textOnDark, fontSize: 20, lineHeight: 25, fontWeight: "800", marginTop: 6, maxWidth: 220 },
  cash: { color: colors.successDark, fontSize: 16, fontWeight: "800" },
  intro: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, paddingHorizontal: 2 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: designSystem.radius.large, padding: designSystem.spacing.lg, minHeight: 88 },
  copy: { flex: 1, paddingRight: 10 },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "800" },
  cardDescription: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 4 },
  cardReason: { color: colors.success, fontSize: 10, fontWeight: "800", marginTop: 7 },
  lockedReason: { color: colors.textMuted },
  cost: { minWidth: 78, minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: designSystem.radius.medium, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
  costDisabled: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  costValue: { color: colors.textPrimary, fontSize: 12, fontWeight: "800" },
  costLabel: { color: colors.primary, fontSize: 9, fontWeight: "800", marginTop: 3 },
  disabled: { opacity: 0.68 },
  pressed: { transform: [{ scale: 0.985 }] },
});
