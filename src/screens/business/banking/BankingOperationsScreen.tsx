import React from "react";
import { Text, View } from "react-native";
import { hireBankingStaff } from "../../../engine/bankingCompanyEngine";
import { BANKING_COMPANY_ASSETS } from "../../../data/bankingCompanyAssets";
import { BankingAction, BankingCard, BankingHero, BankingMetric, BankingPage, bankingStyles } from "./BankingPagePrimitives";
import type { BankingPageProps } from "./bankingTypes";

export default function BankingOperationsScreen({ business, onChange }: BankingPageProps) {
  const hire = (role: "branchManagers" | "tellers" | "loanOfficers" | "riskAnalysts" | "securityStaff") => onChange(hireBankingStaff(business, role));
  const secure = () => onChange({ ...business, cybersecurityLevel: Math.min(5, business.cybersecurityLevel + 1), fraudAlerts: Math.max(0, business.fraudAlerts - 1), riskLevel: Math.max(0, business.riskLevel - 4), lastDecision: "Cybersecurity controls hardened." });
  return <BankingPage>
    <BankingHero source={BANKING_COMPANY_ASSETS.operations} eyebrow="05 · OPERATIONS" title="Operations & Employees" copy="Hire the people who keep the bank fast, trusted, and resilient when volume and risk rise." />
    <BankingCard title="Operating health"><View style={bankingStyles.row}><BankingMetric label="SERVICE QUALITY" value={`${business.serviceQuality.toFixed(0)}%`} /><BankingMetric label="PAYROLL" value={`$${business.staff.payrollPerHour.toLocaleString()}/hr`} /><BankingMetric label="FRAUD ALERTS" value={String(business.fraudAlerts)} tone={business.fraudAlerts > 0 ? "#B42318" : "#087F5B"} /><BankingMetric label="CYBER LEVEL" value={`${business.cybersecurityLevel}/5`} /></View></BankingCard>
    <BankingCard title="Build the team" detail="Staff improves service and risk control, but payroll is a real operating cost."><View style={bankingStyles.row}><BankingAction label="HIRE TELLER" onPress={() => hire("tellers")} /><BankingAction label="HIRE LOAN OFFICER" onPress={() => hire("loanOfficers")} /><BankingAction label="HIRE RISK ANALYST" onPress={() => hire("riskAnalysts")} /><BankingAction label="HIRE SECURITY" onPress={() => hire("securityStaff")} /></View></BankingCard>
    <BankingCard title="Security response"><Text style={{ color: "#64748B", lineHeight: 20 }}>Cybersecurity reduces simulated fraud and risk alerts. It does not represent real-world security guarantees.</Text><BankingAction label="HARDEN CYBERSECURITY" onPress={secure} /></BankingCard>
  </BankingPage>;
}
