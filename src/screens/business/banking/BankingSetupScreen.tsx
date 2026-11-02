import React from "react";
import { Text, View } from "react-native";
import type { BankingData } from "../../../types/business";
import { completeBankingLicense, BANKING_LICENSE_COST } from "../../../engine/bankingLicenseTransaction";
import { BANKING_COMPANY_ASSETS } from "../../../data/bankingCompanyAssets";
import { BankingAction, BankingCard, BankingHero, BankingMetric, BankingPage, bankingStyles } from "./BankingPagePrimitives";
import type { BankingPageProps } from "./bankingTypes";
import { commitCashTransaction } from "../../../engine/transactionGateway";

export default function BankingSetupScreen({ business, cash, onCashChange, onChange, onLedger }: BankingPageProps) {
  const licenseCost = BANKING_LICENSE_COST;
  const payLicense = () => {
    const timestamp = Date.now();
    const transaction = completeBankingLicense({ business, cash, timestamp });
    if (!transaction.accepted) return;
    commitCashTransaction({
      key: `banking:license:${business.id}`,
      cash,
      amount: licenseCost,
      onCashChange,
      onLedger,
      ledgerEntry: transaction.ledgerEntry,
      onCommit: () => onChange(transaction.business),
      now: timestamp,
    });
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
