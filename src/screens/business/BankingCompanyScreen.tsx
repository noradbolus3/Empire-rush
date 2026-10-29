import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BankingData } from "../../types/business";
import BankingDepositsScreen from "./banking/BankingDepositsScreen";
import BankingLoansScreen from "./banking/BankingLoansScreen";
import BankingOperationsScreen from "./banking/BankingOperationsScreen";
import BankingSetupScreen from "./banking/BankingSetupScreen";
import BankingTreasuryScreen from "./banking/BankingTreasuryScreen";
import BankingDigitalScreen from "./banking/BankingDigitalScreen";
import BankingEnterpriseScreen from "./banking/BankingEnterpriseScreen";
import { BANKING_COLORS } from "./banking/BankingPagePrimitives";
import type { BankingPageProps } from "./banking/bankingTypes";

export default function BankingCompanyScreen({ business, cash, onCashChange, onChange, onLedger, onBack }: BankingPageProps & { onBack: () => void }) {
  const [page, setPage] = React.useState<"setup" | "deposits" | "loans" | "treasury" | "operations" | "digital" | "enterprise">("setup");
  const shared = { business, cash, onCashChange, onChange, onLedger };
  return <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
    <View style={styles.header}><Pressable onPress={onBack}><Text style={styles.back}>‹ BUSINESS REGISTRY</Text></Pressable><Text style={styles.eyebrow}>BANKING COMPANY · LIVE OPERATIONS</Text><Text style={styles.title}>{business.name}</Text><Text style={styles.profit}>${business.hourlyNetProfit.toLocaleString()}/hr net banking profit</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rail} contentContainerStyle={styles.railContent}>{([
      ["setup", "SETUP"], ["deposits", "DEPOSITS"], ["loans", "LOANS"], ["treasury", "TREASURY"], ["operations", "OPERATIONS"], ["digital", "DIGITAL"], ["enterprise", "ENTERPRISE"],
    ] as const).map(([id, label]) => <Pressable key={id} onPress={() => setPage(id)} style={[styles.tab, page === id && styles.tabActive]}><Text style={[styles.tabText, page === id && styles.tabTextActive]}>{label}</Text></Pressable>)}</ScrollView>
    <View style={styles.body}>{page === "setup" && <BankingSetupScreen {...shared} />}{page === "deposits" && <BankingDepositsScreen {...shared} />}{page === "loans" && <BankingLoansScreen {...shared} />}{page === "treasury" && <BankingTreasuryScreen {...shared} />}{page === "operations" && <BankingOperationsScreen {...shared} />}{page === "digital" && <BankingDigitalScreen {...shared} />}{page === "enterprise" && <BankingEnterpriseScreen {...shared} />}</View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BANKING_COLORS.white },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  back: { color: BANKING_COLORS.blue, fontSize: 12, fontWeight: "800", marginBottom: 12 },
  eyebrow: { color: BANKING_COLORS.blue, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  title: { color: BANKING_COLORS.navy, fontSize: 26, fontWeight: "900", marginTop: 4 },
  profit: { color: BANKING_COLORS.success, fontSize: 13, fontWeight: "800", marginTop: 5 },
  rail: { flexGrow: 0, flexShrink: 0, borderBottomWidth: 1, borderBottomColor: BANKING_COLORS.border },
  railContent: { gap: 8, paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" },
  tab: { height: 40, paddingHorizontal: 14, borderRadius: 12, justifyContent: "center", borderWidth: 1, borderColor: BANKING_COLORS.border, backgroundColor: BANKING_COLORS.white },
  tabActive: { backgroundColor: BANKING_COLORS.blue, borderColor: BANKING_COLORS.blue },
  tabText: { color: BANKING_COLORS.blue, fontSize: 11, fontWeight: "900" },
  tabTextActive: { color: BANKING_COLORS.white },
  body: { flex: 1, minHeight: 0 },
});
