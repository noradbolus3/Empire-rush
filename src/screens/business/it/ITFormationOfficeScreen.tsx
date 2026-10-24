import React from 'react';
import { Alert, Text } from 'react-native';
import { itCompanyVisuals } from '../../../data/itCompanyAssets';
import { upgradeITOffice } from '../../../engine/itCompanyEngine';
import { ITPageProps } from './itTypes';
import { Action, ITC, Metric, PageFrame, Section, styles } from './ITPagePrimitives';

export function ITFormationOfficeScreen({ business, cash, stage, spend }: ITPageProps) {
  const formationFee = 18_000;
  const officeUpgrade = 48_000 * business.officeTier;
  return <PageFrame image={itCompanyVisuals.office} kicker="FOUNDATION & OPERATIONS" title="Give the company a place to ship." subtitle="Form the studio, staff a credible office and grow capacity before taking larger client commitments.">
    <Section title="COMPANY SETUP"><Text style={styles.muted}>{business.formationComplete ? 'The company is incorporated and ready to accept client work.' : 'Your first company decision is a real capital commitment: incorporation, tools and a small operating office.'}</Text><Action title={business.formationComplete ? 'FORMATION COMPLETE' : 'FORM THE COMPANY'} copy={business.formationComplete ? 'Legal and operating setup is active.' : `${formationFee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} · activate client operations`} disabled={business.formationComplete || cash < formationFee} onPress={() => spend(formationFee, (item) => ({ ...item, formationComplete: true }), 'IT Company formation')} /></Section>
    <Section title="OFFICE CAPACITY"><Text style={styles.muted}>Every office increases team capacity and adds a recurring operating cost. Capacity is shared across projects.</Text><Text style={{ color: ITC.ink, fontWeight: '800' }}>Tier {business.officeTier} · {business.officeCapacity} seats · {business.offices.filter((office) => office.open).length} active office</Text><Action title="EXPAND OFFICE" copy={`${officeUpgrade.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} · +team seats, +project slot, +cloud capacity`} disabled={business.officeTier >= 4 || cash < officeUpgrade} onPress={() => spend(officeUpgrade, (item) => upgradeITOffice(item), 'Office expansion')} /></Section>
    <Section title="OPERATING SNAPSHOT"><Metric label="COMPANY STAGE" value={stage} /><Metric label="OFFICE CAPACITY" value={`${business.officeCapacity} seats`} accent={ITC.blue} /><Metric label="REPUTATION" value={`${(business.reputation ?? 50).toFixed(0)} / 100`} accent={ITC.green} /></Section>
    <Text style={styles.muted}>Next unlock: {stage === 'Startup Studio' ? 'reach $250K net worth for multi-project operations.' : stage === 'Growing Company' ? 'reach $1M net worth for enterprise product work.' : stage === 'Established Company' ? 'reach $10M net worth for international expansion.' : 'all enterprise systems are available.'}</Text>
  </PageFrame>;
}
