import React from "react";
import { Text, View } from "react-native";
import { BANKING_COMPANY_ASSETS } from "../../../data/bankingCompanyAssets";
import { BANKING_STAGE_THRESHOLDS } from "../../../types/bankingCompany";
import { BankingAction, BankingCard, BankingHero, BankingMetric, BankingPage, bankingStyles } from "./BankingPagePrimitives";
import type { BankingPageProps } from "./bankingTypes";

export default function BankingEnterpriseScreen({ business, onChange }: BankingPageProps) {
  const unlocked = business.companyStage === "Banking group";
  const addClient = () => onChange({ ...business, enterpriseClients: business.enterpriseClients + 1, totalLoansIssued: business.totalLoansIssued + 500_000, lastDecision: "Institutional client mandate won." });
  const addRegion = () => onChange({ ...business, regions: business.regions + 1, lastDecision: "Regional banking license simulated and approved." });
  const acquire = () => onChange({ ...business, acquisitions: business.acquisitions + 1, lastDecision: "Community bank acquisition integrated into the group." });
  return <BankingPage>
    <BankingHero source={BANKING_COMPANY_ASSETS.enterprise} eyebrow="07 · BANKING GROUP" title="Enterprise Banking & Expansion" copy="Move from a local balance sheet to corporate mandates, multiple regions, and consolidated group risk." />
    <BankingCard title="Group dashboard" detail="Enterprise controls unlock as the player's shared net worth reaches the Banking Group threshold."><View style={bankingStyles.row}><BankingMetric label="ENTERPRISE CLIENTS" value={String(business.enterpriseClients)} /><BankingMetric label="REGIONS" value={String(business.regions)} /><BankingMetric label="ACQUISITIONS" value={String(business.acquisitions)} /><BankingMetric label="REQUIRED NET WORTH" value={`$${BANKING_STAGE_THRESHOLDS["Banking group"].toLocaleString()}`} /></View></BankingCard>
    <BankingCard title="Institutional growth"><View style={bankingStyles.row}><BankingAction label="WIN CORPORATE MANDATE" onPress={addClient} /><BankingAction label="OPEN NEW REGION" onPress={addRegion} /><BankingAction disabled={!unlocked} label={unlocked ? "ACQUIRE COMMUNITY BANK" : "LOCKED · REACH BANKING GROUP"} onPress={acquire} /></View><Text style={{ color: "#64748B", fontSize: 13 }}>{business.lastDecision}</Text></BankingCard>
  </BankingPage>;
}
