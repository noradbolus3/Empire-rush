import React from "react";
import { Text, View } from "react-native";
import { BANKING_COMPANY_ASSETS } from "../../../data/bankingCompanyAssets";
import { BankingAction, BankingCard, BankingHero, BankingMetric, BankingPage, bankingStyles } from "./BankingPagePrimitives";
import type { BankingPageProps } from "./bankingTypes";

export default function BankingDepositsScreen({ business, onChange }: BankingPageProps) {
  const savings = business.customerAccounts.filter((item) => item.kind === "Savings").reduce((sum, item) => sum + item.balance, 0);
  const current = business.customerAccounts.filter((item) => item.kind === "Current").reduce((sum, item) => sum + item.balance, 0);
  const addAccount = (kind: "Savings" | "Current") => onChange({ ...business, customerAccounts: [...business.customerAccounts, { id: `account-${business.customerAccounts.length + 1}`, kind, balance: kind === "Savings" ? 25_000 : 12_000, apy: kind === "Savings" ? 0.032 : 0.008, active: true }], lastDecision: `${kind} account desk opened.` });
  return <BankingPage>
    <BankingHero source={BANKING_COMPANY_ASSETS.bankingHall} eyebrow="02 · CUSTOMER ACCOUNTS" title="Deposits & Customer Accounts" copy="Build a stable deposit base, pay interest responsibly, and keep liquidity visible." />
    <BankingCard title="Deposit book" detail="Savings accounts pay more interest; current accounts improve transaction volume."><View style={bankingStyles.row}><BankingMetric label="TOTAL DEPOSITS" value={`$${business.totalDepositsRaised.toLocaleString()}`} /><BankingMetric label="SAVINGS" value={`$${savings.toLocaleString()}`} /><BankingMetric label="CURRENT" value={`$${current.toLocaleString()}`} /><BankingMetric label="CUSTOMER ACCOUNTS" value={String(business.customerAccounts.length)} /></View></BankingCard>
    <BankingCard title="Acquire accounts" detail="Each new account increases fee income and future lending capacity."><View style={bankingStyles.row}><BankingAction label="OPEN SAVINGS DESK" onPress={() => addAccount("Savings")} /><BankingAction label="OPEN CURRENT DESK" onPress={() => addAccount("Current")} /></View></BankingCard>
  </BankingPage>;
}
