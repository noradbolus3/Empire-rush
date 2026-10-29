import React from "react";
import { Text, View } from "react-native";
import type { BankingData } from "../../../types/business";
import { completeBankingLicense, BANKING_LICENSE_COST } from "../../../engine/bankingLicenseTransaction";
import { BANKING_COMPANY_ASSETS } from "../../../data/bankingCompanyAssets";
import { BankingAction, BankingCard, BankingHero, BankingMetric, BankingPage, bankingStyles } from "./BankingPagePrimitives";
import type { BankingPageProps } from "./bankingTypes";
import { tryAcquireSpendLock } from "../../../engine/walletGuard";

export default function BankingSetupScreen({ business, cash, onCashChange, onChange, onLedger }: BankingPageProps) {
  const licenseCost = BANKING_LICENSE_COST;
  const payLicense = () => {
    if (!tryAcquireSpendLock(`banking:license:${business.id}`)) return;
    const transaction = completeBankingLicense({ business, cash, timestamp: Date.now() });
    if (!transaction.accepted) return;
    onCashChange(() => transaction.cash);
    onChange(transaction.business);
    onLedger(transaction.ledgerEntry);
  };
  return <BankingPage>
    <BankingHero source={BANKING_COMPANY_ASSETS.headquarters} eyebrow="01 · FORMATION" title="Bank Setup & Licensing" copy="Choose a headquarters, fund the license, and turn a balance sheet into a trusted institution." />
    <BankingCard title="Licensing decision" detail="The license is a simulated game rule, not a real-world compliance claim.">
      <View style={bankingStyles.row}>
        <BankingMetric label="LICENSE FEE" value={`$${licenseCost.toLocaleString()}`} />
        <BankingMetric label="LIQUID CASH" value={`$${cash.toLocaleString()}`} />
      </View>
      <Text style={{ color: business.licenseApproved ? "#087F5B" : "#64748B", fontWeight: "800" }}>{business.licenseApproved ? "LICENSE APPROVED · HEADQUARTERS ACTIVE" : "PENDING APPROVAL"}</Text>
      <BankingAction disabled={business.licenseApproved || cash < licenseCost} label={business.licenseApproved ? "LICENSE ACTIVE" : cash < licenseCost ? `NEED $${(licenseCost - cash).toLocaleString()} MORE` : "PAY LICENSE & OPEN HQ"} onPress={payLicense} />
    </BankingCard>
  </BankingPage>;
}
