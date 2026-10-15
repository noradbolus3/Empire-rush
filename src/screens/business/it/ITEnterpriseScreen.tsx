import React from 'react';
import { Text, View } from 'react-native';
import { itCompanyVisuals } from '../../../data/itCompanyAssets';
import { canUseITStage } from '../../../engine/itCompanyEngine';
import { ITPageProps } from './itTypes';
import { Action, ITC, Metric, PageFrame, Section, styles } from './ITPagePrimitives';

export function ITEnterpriseScreen({ business, cash, stage, spend }: ITPageProps) {
  const enterpriseReady = canUseITStage(stage, 'Technology Enterprise');
  const researchUpgrade = Math.max(50_000, business.researchBudgetPerHour * 1000 + 50_000);
  return <PageFrame image={itCompanyVisuals.enterprise} kicker="ENTERPRISE CONTROL ROOM" title="Operate beyond one office." subtitle="International offices, research and subsidiaries are long-horizon decisions. They expand opportunity and add permanent operating complexity.">
    <Section title="ENTERPRISE METRICS"><View style={styles.row}><Metric label="OFFICES" value={`${business.offices.filter((office) => office.open).length + business.internationalOffices}`} accent={ITC.blue} /><Metric label="R&D / HR" value={`${business.researchBudgetPerHour.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`} accent={ITC.gold} /><Metric label="REPUTATION" value={`${(business.reputation ?? 50).toFixed(0)} / 100`} accent={ITC.green} /></View></Section>
    <Section title="GLOBAL EXPANSION"><Text style={styles.muted}>International operations unlock only after the company has proved its delivery quality and balance sheet.</Text><Action title="OPEN INTERNATIONAL OFFICE" copy={enterpriseReady ? '$250,000 · +1 international office · global client demand' : 'Locked · reach Technology Enterprise stage'} disabled={!enterpriseReady || cash < 250_000} onPress={() => spend(250_000, (item) => ({ ...item, internationalOffices: item.internationalOffices + 1, offices: [...item.offices, { id: `global-${item.internationalOffices + 1}`, city: `Global Hub ${item.internationalOffices + 1}`, capacity: 24, operatingCostPerHour: 180, open: true }] }), 'International office opened')} /></Section>
    <Section title="RESEARCH & PRODUCT MOAT"><Text style={styles.muted}>R&D increases long-term product quality, but the spend is deducted hourly through the shared settlement pipeline.</Text><Action title="INCREASE R&D PROGRAM" copy={`${researchUpgrade.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} · +$40/hr research burn · stronger enterprise product moat`} disabled={!enterpriseReady || cash < researchUpgrade} onPress={() => spend(researchUpgrade, (item) => ({ ...item, researchBudgetPerHour: item.researchBudgetPerHour + 40, reputation: Math.min(100, (item.reputation ?? 50) + 2) }), 'R&D program expanded')} /></Section>
    <Section title="SUBSIDIARY READINESS"><Text style={styles.muted}>Subsidiary and acquisition controls are deliberately gated behind the enterprise stage so IT growth does not bypass the zero-to-billionaire progression.</Text><Text style={{ color: enterpriseReady ? ITC.green : ITC.muted, fontWeight: '900' }}>{enterpriseReady ? 'ENTERPRISE CONTROLS AVAILABLE' : 'ENTERPRISE CONTROLS LOCKED'}</Text></Section>
  </PageFrame>;
}
