import React from 'react';
import { Text, View } from 'react-native';
import { itCompanyVisuals } from '../../../data/itCompanyAssets';
import { IT_CONTRACTS, IT_PROJECTS, canUseITStage, startITProject } from '../../../engine/itCompanyEngine';
import { ITPageProps } from './itTypes';
import { Action, ITC, Metric, PageFrame, Section, styles } from './ITPagePrimitives';

export function ITProjectsContractsScreen({ business, cash, stage, spend }: ITPageProps) {
  const now = business.activeProjects[0]?.startedAt ?? 1;
  return (
    <PageFrame image={itCompanyVisuals.projects} kicker="CLIENT PIPELINE" title="Choose work that fits the team." subtitle="Projects consume budget and skills before they create cash. Contracts add recurring demand, reputation and deadline pressure.">
      <Section title="ACTIVE DELIVERY">
        <View style={styles.row}>
          <Metric label="ACTIVE PROJECTS" value={`${business.activeProjects.length} / ${business.projectSlots}`} accent={ITC.blue} />
          <Metric label="DELIVERED" value={`${business.totalProjectsDelivered}`} accent={ITC.green} />
          <Metric label="SATISFACTION" value={`${business.clientSatisfaction.toFixed(0)}%`} />
        </View>
        {business.activeProjects.length === 0 ? <Text style={styles.muted}>No active project. Start one below after formation and budget checks.</Text> : business.activeProjects.map((project) => <Text key={project.id} style={{ color: ITC.ink, fontWeight: '800' }}>{project.id} · {project.phase} · {project.progress.toFixed(0)}%</Text>)}
      </Section>
      <Section title="PROJECT MARKET">
        {IT_PROJECTS.map((project) => {
          const unlocked = canUseITStage(stage, project.minimumStage);
          const active = business.activeProjects.some((item) => item.id === project.id);
          return <Action key={project.id} title={`${project.name}${active ? ' · ACTIVE' : ''}`} copy={`${project.client} · ${project.budget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} budget · ${project.payout.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} payout`} disabled={!unlocked || active || business.activeProjects.length >= business.projectSlots || cash < project.budget} onPress={() => spend(project.budget, (item) => startITProject(item, project.id, now) ?? item, `${project.name} started`)} />;
        })}
      </Section>
      <Section title="CONTRACT OFFERS">
        {IT_CONTRACTS.map((contract) => {
          const unlocked = canUseITStage(stage, contract.minimumStage);
          const active = business.clientContracts.some((item) => item.id === contract.id && item.active);
          return <Action key={contract.id} title={`${contract.name}${active ? ' · ACTIVE' : ''}`} copy={`${contract.type} · ${contract.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} · ${Math.ceil(contract.deadlineSeconds / 60)} min deadline`} disabled={!unlocked || active} onPress={() => spend(0, (item) => ({ ...item, clientContracts: [...item.clientContracts, { id: contract.id, type: contract.type, value: contract.value, deadlineSeconds: contract.deadlineSeconds, satisfaction: item.clientSatisfaction, active: true }] }), `${contract.name} accepted`)} />;
        })}
      </Section>
    </PageFrame>
  );
}
