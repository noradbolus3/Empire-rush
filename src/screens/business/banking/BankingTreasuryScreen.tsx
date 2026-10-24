import React from "react";
import { Text, View } from "react-native";
import { BANKING_COMPANY_ASSETS } from "../../../data/bankingCompanyAssets";
import { BankingAction, BankingCard, BankingHero, BankingMetric, BankingPage, bankingStyles } from "./BankingPagePrimitives";
import type { BankingPageProps } from "./bankingTypes";

export default function BankingTreasuryScreen({ business, onChange }: BankingPageProps) {
  const strengthen = () => onChange({ ...business, liquidityReserve: business.liquidityReserve + 50_000, reserveRatio: Math.min(0.4, business.reserveRatio + 0.02), riskLevel: Math.max(0, business.riskLevel - 5), lastDecision: "Treasury reserve strengthened." });
  const improveRisk = () => onChange({ ...business, badLoanRate: Math.max(0, business.badLoanRate - 0.5), riskLevel: Math.max(0, business.riskLevel - 8), lastDecision: "Risk review completed." });
  return <BankingPage>
    <BankingHero source={BANKING_COMPANY_ASSETS.treasury} eyebrow="04 · TREASURY" title="Treasury & Risk Management" copy="Balance lending appetite against liquidity reserves, rate pressure, and the cost of bad loans." />
    <BankingCard title="Risk cockpit" detail="A healthy bank keeps a reserve cushion while its loan book compounds." ><View style={bankingStyles.row}><BankingMetric label="LIQUIDITY RESERVE" value={`$${business.liquidityReserve.toLocaleString()}`} /><BankingMetric label="RESERVE RATIO" value={`${(business.reserveRatio * 100).toFixed(1)}%`} /><BankingMetric label="RISK LEVEL" value={`${business.riskLevel.toFixed(1)}/100`} tone={business.riskLevel > 70 ? "#B42318" : "#087F5B"} /><BankingMetric label="INTEREST INCOME" value={`$${business.hourlyInterestIncome.toLocaleString()}/hr`} /></View></BankingCard>
    <BankingCard title="Treasury decisions" detail="These actions change the bank's operating risk profile."><View style={bankingStyles.row}><BankingAction label="ADD $50K RESERVE" onPress={strengthen} /><BankingAction label="RUN RISK REVIEW" onPress={improveRisk} /></View><Text style={{ color: "#64748B", fontSize: 13 }}>{business.lastDecision}</Text></BankingCard>
  </BankingPage>;
}
