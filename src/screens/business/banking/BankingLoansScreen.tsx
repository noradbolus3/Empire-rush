import React from "react";
import { Text, View } from "react-native";
import { issueBankLoan } from "../../../engine/bankingCompanyEngine";
import { BANKING_COMPANY_ASSETS } from "../../../data/bankingCompanyAssets";
import { BankingAction, BankingCard, BankingHero, BankingMetric, BankingPage, bankingStyles } from "./BankingPagePrimitives";
import type { BankingPageProps } from "./bankingTypes";

export default function BankingLoansScreen({ business, onChange }: BankingPageProps) {
  const issue = (kind: "Personal" | "Business" | "Institutional", principal: number) => { const next = issueBankLoan(business, kind, principal); if (next) onChange(next); };
  const outstanding = business.loanBook.reduce((sum, loan) => sum + loan.outstanding, 0);
  return <BankingPage>
    <BankingHero source={BANKING_COMPANY_ASSETS.loans} eyebrow="03 · CREDIT DEPARTMENT" title="Loan & Credit Department" copy="Price risk, lend against liquidity, and grow the performing loan book without ignoring defaults." />
    <BankingCard title="Credit capacity" detail="The page uses reserve liquidity and simulated risk—not real credit underwriting."><View style={bankingStyles.row}><BankingMetric label="RESERVE LIQUIDITY" value={`$${business.liquidityReserve.toLocaleString()}`} /><BankingMetric label="OUTSTANDING" value={`$${outstanding.toLocaleString()}`} /><BankingMetric label="BAD LOAN RATE" value={`${business.badLoanRate.toFixed(1)}%`} tone={business.badLoanRate > 8 ? "#B42318" : "#087F5B"} /></View></BankingCard>
    <BankingCard title="Issue a loan" detail="Loan sizes are intentionally bounded by reserve liquidity."><View style={bankingStyles.row}><BankingAction label="PERSONAL · $25K · 9.5% APR" onPress={() => issue("Personal", 25_000)} /><BankingAction label="BUSINESS · $100K · 8.2% APR" onPress={() => issue("Business", 100_000)} /><BankingAction label="INSTITUTIONAL · $250K · 6.8% APR" onPress={() => issue("Institutional", 250_000)} /></View></BankingCard>
    {business.loanBook.map((loan) => <BankingCard key={loan.id} title={`${loan.kind} loan · ${loan.status}`} detail={`APR ${(loan.apr * 100).toFixed(1)}% · Risk score ${loan.riskScore.toFixed(0)} · ${loan.remainingHours.toLocaleString()}h remaining`}><Text style={{ color: "#172B4D", fontSize: 20, fontWeight: "900" }}>${loan.outstanding.toLocaleString()}</Text></BankingCard>)}
  </BankingPage>;
}
