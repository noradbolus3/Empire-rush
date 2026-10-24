import React from "react";
import { Text, View } from "react-native";
import { createBankBranch, upgradeDigitalBanking } from "../../../engine/bankingCompanyEngine";
import { BANKING_COMPANY_ASSETS } from "../../../data/bankingCompanyAssets";
import { BankingAction, BankingCard, BankingHero, BankingMetric, BankingPage, bankingStyles } from "./BankingPagePrimitives";
import type { BankingPageProps } from "./bankingTypes";

export default function BankingDigitalScreen({ business, onChange }: BankingPageProps) {
  const openBranch = (city: string) => { const next = createBankBranch(business, city); if (next) onChange(next); };
  const upgrade = () => { const next = upgradeDigitalBanking(business); if (next) onChange(next); };
  return <BankingPage>
    <BankingHero source={BANKING_COMPANY_ASSETS.digital} eyebrow="06 · NETWORK & DIGITAL" title="Branches & Digital Banking" copy="Expand physical reach, add ATMs, and turn digital convenience into recurring customer activity." />
    <BankingCard title="Network footprint"><View style={bankingStyles.row}><BankingMetric label="BRANCHES" value={String(business.branches.length)} /><BankingMetric label="ATMS" value={String(business.atmCount)} /><BankingMetric label="DIGITAL USERS" value={business.digitalUsers.toLocaleString()} /><BankingMetric label="DIGITAL LEVEL" value={`${business.digitalLevel}/4`} /></View></BankingCard>
    <BankingCard title="Expand the network" detail="Each branch brings customers and deposits, but also adds operating complexity."><View style={bankingStyles.row}><BankingAction label="OPEN AUSTIN BRANCH" onPress={() => openBranch("Austin")} /><BankingAction label="OPEN CHICAGO BRANCH" onPress={() => openBranch("Chicago")} /><BankingAction label="OPEN SEATTLE BRANCH" onPress={() => openBranch("Seattle")} /></View></BankingCard>
    <BankingCard title="Digital investment" detail="Digital upgrades increase users and improve cybersecurity resilience."><BankingAction disabled={business.digitalLevel >= 4} label={business.digitalLevel >= 4 ? "DIGITAL PLATFORM MAXED" : `UPGRADE DIGITAL BANKING · LEVEL ${business.digitalLevel + 1}`} onPress={upgrade} /><Text style={{ color: "#64748B", fontSize: 13 }}>Invested: ${business.digitalInvestment.toLocaleString()}</Text></BankingCard>
  </BankingPage>;
}
