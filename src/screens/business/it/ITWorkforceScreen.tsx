import React from 'react';
import { Text, View } from 'react-native';
import { itCompanyVisuals } from '../../../data/itCompanyAssets';
import { hireITStaff } from '../../../engine/itCompanyEngine';
import { ITPageProps } from './itTypes';
import { Action, ITC, Metric, PageFrame, Section, styles } from './ITPagePrimitives';

export function ITWorkforceScreen({ business, cash, spend }: ITPageProps) {
  const hires: Array<{ role: 'developers' | 'designers' | 'qaStaff' | 'salesStaff' | 'managers'; label: string; cost: number; copy: string }> = [
    { role: 'developers', label: 'HIRE DEVELOPER', cost: 12_000, copy: '$12,000 onboarding · expands delivery capacity' },
    { role: 'designers', label: 'HIRE PRODUCT DESIGNER', cost: 10_000, copy: '$10,000 onboarding · improves client quality' },
    { role: 'qaStaff', label: 'HIRE QA ANALYST', cost: 9_000, copy: '$9,000 onboarding · reduces defects and incidents' },
    { role: 'salesStaff', label: 'HIRE SALES EXECUTIVE', cost: 11_000, copy: '$11,000 onboarding · unlocks contract pipeline' },
    { role: 'managers', label: 'HIRE DELIVERY MANAGER', cost: 18_000, copy: '$18,000 onboarding · enables larger project teams' },
  ];
  return <PageFrame image={itCompanyVisuals.office} kicker="PEOPLE & PAYROLL" title="The team is the product." subtitle="Hire the skills your current pipeline needs. Payroll is a real operating cost, but the right mix increases quality and throughput.">
    <Section title="TEAM CAPACITY"><Text style={styles.muted}>A balanced team keeps projects moving from scope to development to QA without overloading one discipline.</Text><View style={styles.row}><Metric label="DEVELOPERS" value={`${business.developers}`} accent={ITC.blue} /><Metric label="DESIGNERS" value={`${business.designers}`} accent={ITC.gold} /><Metric label="QA" value={`${business.qaStaff}`} accent={ITC.green} /><Metric label="MANAGERS" value={`${business.managers}`} /></View></Section>
    <Section title="HIRING BOARD">{hires.map((hire) => <Action key={hire.role} title={`${hire.label} · ${business[hire.role]}`} copy={`${hire.copy} · payroll +${hire.role === 'developers' ? '$42' : hire.role === 'managers' ? '$58' : '$30-$34'}/hr`} disabled={cash < hire.cost} onPress={() => spend(hire.cost, (item) => hireITStaff(item, hire.role), `${hire.label.toLowerCase()} hired`)} />)}</Section>
    <Section title="PAYROLL CONTROL"><Text style={styles.muted}>Current payroll burn is charged through the existing business settlement pipeline.</Text><Text style={{ color: ITC.ink, fontSize: 24, fontWeight: '900' }}>{business.payrollPerHour.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}<Text style={{ color: ITC.muted, fontSize: 13 }}> / hr</Text></Text></Section>
  </PageFrame>;
}
