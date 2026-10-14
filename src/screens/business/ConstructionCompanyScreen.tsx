import React, { useMemo, useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConstructionData } from '../../types/business';
import { formatCurrency } from '../../utils/formatCurrency';
import { CONSTRUCTION_CONTRACTS, CONSTRUCTION_PROJECTS, CONSTRUCTION_UPGRADES, constructionAssetValue, constructionHourlyProfit, constructionStageFor, canUseStage, initializeConstruction, stageIndex } from '../../engine/constructionCompanyEngine';
import { constructionVisuals } from '../../data/constructionAssets';

const C = { bg: '#F4F8FC', ink: '#102238', muted: '#60748A', line: '#D8E4EF', blue: '#147BE8', blueSoft: '#E9F3FF', green: '#159A68', greenSoft: '#E7F7EF', gold: '#D89A1B', red: '#D95454', white: '#FFFFFF' };
type Tab = 'Overview' | 'Dashboard' | 'Land & Projects' | 'Machinery' | 'Management' | 'Contracts' | 'Expansion';
type Props = { business: ConstructionData; cash: number; netWorth: number; onBack: () => void; onCashChange: (updater: (value: number) => number) => void; onChange: (business: ConstructionData) => void };

export default function ConstructionCompanyScreen({ business: rawBusiness, cash, netWorth, onBack, onCashChange, onChange }: Props) {
  const business = useMemo(() => initializeConstruction(rawBusiness, netWorth), [rawBusiness, netWorth]);
  const [tab, setTab] = useState<Tab>('Overview');
  const spendLock = useRef(false);
  const stage = constructionStageFor(netWorth);
  const update = (patch: Partial<ConstructionData>) => onChange({ ...business, ...patch });
  const spend = (cost: number, patch: Partial<ConstructionData>, label: string) => {
    if (spendLock.current) return;
    if (cash < cost) { Alert.alert('CAPITAL REQUIRED', `You need ${formatCurrency(cost - cash)} more liquid cash.`); return; }
    spendLock.current = true;
    onCashChange(value => Math.max(0, value - cost));
    onChange({ ...business, ...patch });
    Alert.alert('OPERATION CONFIRMED', `${label} · ${formatCurrency(cost)} invested.`);
    setTimeout(() => { spendLock.current = false; }, 300);
  };
  const machinery = business.machinery ?? { excavators: 0, cranes: 0, mixers: 0, dumpTrucks: 0 };
  const activeProject = CONSTRUCTION_PROJECTS.find(project => project.id === business.activeProjectId);
  const activeContract = CONSTRUCTION_CONTRACTS.find(contract => contract.id === business.activeContractName);
  const tabItems: Tab[] = ['Dashboard', 'Land & Projects', 'Machinery', 'Management', 'Contracts', 'Expansion'];
  return <View style={styles.root}><SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Pressable onPress={onBack}><Text style={styles.back}>‹ BUSINESS REGISTRY</Text></Pressable>
    <View style={styles.header}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>CONSTRUCTION COMPANY · {stage.toUpperCase()}</Text><Text style={styles.title}>{business.name}</Text><Text style={styles.subtitle}>Build infrastructure. Complete projects. Grow your empire.</Text></View><Text style={styles.city}>US OPERATIONS</Text></View>
    {tab !== 'Overview' && <Pressable onPress={() => setTab('Overview')} style={styles.overviewLink}><Text style={styles.overviewLinkText}>‹ CONSTRUCTION COMPANY OVERVIEW</Text></Pressable>}
    {tab !== 'Overview' && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}><View style={styles.tabRail}>{tabItems.map(item => <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}><Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text></Pressable>)}</View></ScrollView>}
    {tab === 'Overview' && <ConstructionOverview onNavigate={setTab} currentStage={stage} />}
    {tab === 'Dashboard' && <Dashboard business={business} cash={cash} stage={stage} activeProject={activeProject} onNavigate={setTab} />}
    {tab === 'Land & Projects' && <LandProjects business={business} cash={cash} stage={stage} spend={spend} update={update} />}
    {tab === 'Machinery' && <Machinery business={business} cash={cash} machinery={machinery} spend={spend} />}
    {tab === 'Management' && <Management business={business} activeProject={activeProject} update={update} />}
    {tab === 'Contracts' && <Contracts business={business} cash={cash} stage={stage} spend={spend} />}
    {tab === 'Expansion' && <Expansion business={business} cash={cash} stage={stage} netWorth={netWorth} spend={spend} />}
  </ScrollView></SafeAreaView></View>;
}

function Dashboard({ business, cash, stage, activeProject, onNavigate }: { business: ConstructionData; cash: number; stage: NonNullable<ConstructionData['constructionStage']>; activeProject?: typeof CONSTRUCTION_PROJECTS[number]; onNavigate: (tab: Tab) => void }) {
  const machinery = business.machinery ?? { excavators: 0, cranes: 0, mixers: 0, dumpTrucks: 0 };
  return <>
    <Image source={constructionVisuals.dashboard} style={styles.heroImage} />
    <View style={styles.heroOverlay}>
      <Text style={styles.heroKicker}>OPERATING DESK</Text>
      <Text style={styles.heroTitle}>Build what the city needs next.</Text>
      <Text style={styles.heroCopy}>A live view of land, crews, equipment, projects and contract cashflow.</Text>
    </View>
    <View style={styles.metricGrid}>
      <Metric label="INCOME / HOUR" value={formatCurrency(constructionHourlyProfit(business))} accent={C.green} />
      <Metric label="AVAILABLE CASH" value={formatCurrency(cash)} />
      <Metric label="ASSET VALUE" value={formatCurrency(constructionAssetValue(business))} />
      <Metric label="PROJECTS COMPLETE" value={`${business.projectsCompleted ?? 0}`} accent={C.gold} />
    </View>
    <Section title="OPERATING STATUS">
      <InfoRow label="Company stage" value={stage} />
      <InfoRow label="Land bank" value={`${business.landOwned ?? 0} / ${business.landCapacity ?? 0} sites`} />
      <InfoRow label="Crew" value={`${business.workers ?? 0} workers`} />
      <InfoRow label="Active project" value={activeProject?.name ?? 'No project selected'} />
      <InfoRow label="Machinery fleet" value={`${machinery.excavators + machinery.cranes + machinery.mixers + machinery.dumpTrucks} units`} />
    </Section>
    <Section title="YOUR NEXT MOVE">
      <Action title="SELECT LAND & START A PROJECT" copy="Choose a market, reserve a site, then put your crew to work." onPress={() => onNavigate('Land & Projects')} />
      <Action title="BUILD YOUR EQUIPMENT FLEET" copy="Machinery raises throughput and unlocks better contracts." onPress={() => onNavigate('Machinery')} />
    </Section>
  </>;
}

const CONSTRUCTION_OVERVIEW: Array<{ number: string; title: string; copy: string; tab: Exclude<Tab, 'Overview'>; image: any }> = [
  { number: '01', title: 'Construction Dashboard', copy: 'Total income, project status, available cash, active contracts and company performance.', tab: 'Dashboard', image: constructionVisuals.dashboard },
  { number: '02', title: 'Land & Project Selection', copy: 'Purchase land, choose a location, and select residential, commercial or industrial projects.', tab: 'Land & Projects', image: constructionVisuals.land },
  { number: '03', title: 'Machinery & Equipment', copy: 'Purchase and manage excavators, cranes, dump trucks and concrete mixers.', tab: 'Machinery', image: constructionVisuals.machinery },
  { number: '04', title: 'Project Management', copy: 'Track construction progress, labor, material costs, deadlines and project delays.', tab: 'Management', image: constructionVisuals.project },
  { number: '05', title: 'Contracts & Earnings', copy: 'Manage government and private contracts, completion payments and profit tracking.', tab: 'Contracts', image: constructionVisuals.contracts },
  { number: '06', title: 'Expansion & Upgrades', copy: 'Unlock multiple project sites, larger contracts, advanced machinery and national operations.', tab: 'Expansion', image: constructionVisuals.project },
];

function ConstructionOverview({ onNavigate, currentStage }: { onNavigate: (tab: Tab) => void; currentStage: NonNullable<ConstructionData['constructionStage']> }) {
  return <>
    <View style={styles.overviewHero}>
      <Image source={constructionVisuals.dashboard} style={styles.overviewHeroImage} />
      <View style={styles.overviewHeroCopy}><Text style={styles.overviewKicker}>NEXT BUSINESS · CONSTRUCTION COMPANY</Text><Text style={styles.overviewTitle}>Build the city. Own the pipeline.</Text><Text style={styles.overviewSubtitle}>A complete construction gameplay flow with real land, machinery, projects, contracts and expansion decisions.</Text></View>
    </View>
    <Section title="CONSTRUCTION COMPANY · COMPLETE GAMEPLAY FLOW">
      <Text style={styles.muted}>Choose a dedicated page below. Every section opens the real operating controls, not a static preview.</Text>
      <View style={styles.overviewList}>{CONSTRUCTION_OVERVIEW.map(item => <Pressable key={item.number} onPress={() => onNavigate(item.tab)} style={styles.overviewCard}>
        <Image source={item.image} style={styles.overviewImage} />
        <View style={styles.overviewCardCopy}><Text style={styles.overviewNumber}>{item.number}</Text><Text style={styles.overviewCardTitle}>{item.title}</Text><Text style={styles.muted}>{item.copy}</Text><Text style={styles.openPage}>OPEN PAGE ›</Text></View>
      </Pressable>)}</View>
    </Section>
    <GrowthStageTable currentStage={currentStage} />
  </>;
}

const CONSTRUCTION_PLAYBOOK: Array<{ number: string; title: string; copy: string; tab: Tab }> = [
  { number: '01', title: 'Construction Dashboard', copy: 'Total income, project status, available cash, active contracts and company performance.', tab: 'Dashboard' },
  { number: '02', title: 'Land & Project Selection', copy: 'Purchase land, choose a market, and select residential, commercial or industrial projects.', tab: 'Land & Projects' },
  { number: '03', title: 'Machinery & Equipment', copy: 'Purchase and manage excavators, cranes, mixers and dump trucks to increase throughput.', tab: 'Machinery' },
  { number: '04', title: 'Project Management', copy: 'Track construction progress, labor, materials, deadlines and project delays.', tab: 'Management' },
  { number: '05', title: 'Contracts & Earnings', copy: 'Accept government and private contracts, then track completion payments and profit.', tab: 'Contracts' },
  { number: '06', title: 'Expansion & Upgrades', copy: 'Grow into multiple project sites, larger contracts, advanced machinery and national operations.', tab: 'Expansion' },
];

function ConstructionPlaybook({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  return <Section title="CONSTRUCTION COMPANY · COMPLETE GAMEPLAY FLOW">
    <Text style={styles.muted}>Every section below is connected to a playable tab. Tap any card to open that operating desk.</Text>
    <View style={styles.playbookGrid}>
      {CONSTRUCTION_PLAYBOOK.map(item => <Pressable key={item.number} onPress={() => onNavigate(item.tab)} style={styles.playbookCard}>
        <View style={styles.playbookNumber}><Text style={styles.playbookNumberText}>{item.number}</Text></View>
        <View style={styles.playbookCopy}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.muted}>{item.copy}</Text></View>
        <Text style={styles.actionArrow}>›</Text>
      </Pressable>)}
    </View>
  </Section>;
}

const CONSTRUCTION_STAGES: Array<{ stage: NonNullable<ConstructionData['constructionStage']>; unlocks: string }> = [
  { stage: 'Small contractor', unlocks: 'Small buildings, limited workers' },
  { stage: 'Growing company', unlocks: 'Multiple projects, machinery fleet' },
  { stage: 'Large company', unlocks: 'High-rise buildings, commercial contracts' },
  { stage: 'Enterprise', unlocks: 'Mega-projects, multiple cities, infrastructure contracts' },
];

function GrowthStageTable({ currentStage }: { currentStage: NonNullable<ConstructionData['constructionStage']> }) {
  return <Section title="COMPANY GROWTH & GAMEPLAY UNLOCKS">
    <View style={styles.stageHeader}><Text style={styles.stageHeaderText}>STAGE</Text><Text style={styles.stageHeaderText}>GAMEPLAY UNLOCKS</Text></View>
    {CONSTRUCTION_STAGES.map(item => <View key={item.stage} style={[styles.stageRow, item.stage === currentStage && styles.stageRowActive]}><Text style={[styles.stageName, item.stage === currentStage && styles.stageNameActive]}>{item.stage}</Text><Text style={styles.stageUnlocks}>{item.unlocks}</Text></View>)}
  </Section>;
}

function LandProjects({ business, cash, stage, spend, update }: { business: ConstructionData; cash: number; stage: NonNullable<ConstructionData['constructionStage']>; spend: (cost: number, patch: Partial<ConstructionData>, label: string) => void; update: (patch: Partial<ConstructionData>) => void }) {
  const market = business.selectedMarket ?? 'Residential';
  return <><Image source={constructionVisuals.land} style={styles.sectionImage} /><Section title="LAND BANK"><Text style={styles.muted}>Buy sites before committing capital. Each site holds one active build.</Text><View style={styles.marketRow}>{(['Residential', 'Commercial', 'Industrial'] as const).map(item => <Pressable key={item} onPress={() => update({ selectedMarket: item })} style={[styles.marketChip, market === item && styles.marketChipActive]}><Text style={[styles.marketText, market === item && styles.marketTextActive]}>{item}</Text></Pressable>)}</View><Action title="PURCHASE DEVELOPMENT SITE" copy={`$45,000 · ${market} land · +1 site capacity`} onPress={() => spend(45000, { landOwned: (business.landOwned ?? 0) + 1, landCapacity: (business.landCapacity ?? 1) + 1 }, 'Development site acquired')} disabled={cash < 45000} lockedReason={`Need ${formatCurrency(Math.max(0, 45000 - cash))} more`} /></Section><Section title="PROJECT PIPELINE">{CONSTRUCTION_PROJECTS.filter(project => project.market === market && canUseStage(stage, project.minimumStage)).map(project => <View key={project.id} style={styles.projectCard}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{project.name}</Text><Text style={styles.muted}>{project.market} · {project.description}</Text><Text style={styles.projectMeta}>Budget {formatCurrency(project.budget)} · Payout {formatCurrency(project.payout)}</Text></View><Action title={business.activeProjectId === project.id ? 'ACTIVE' : 'START'} copy={`${Math.ceil(project.durationSeconds / 60)} min`} onPress={() => { if ((business.landOwned ?? 0) < project.landRequired) { Alert.alert('LAND REQUIRED', `This project needs ${project.landRequired} site(s).`); return; } if (cash < project.budget) { Alert.alert('CAPITAL REQUIRED', `You need ${formatCurrency(project.budget - cash)} more for materials and labor.`); return; } spend(project.budget, { activeProjectId: project.id, activeTenderName: project.name, projectBudget: project.budget, projectCostSpent: project.budget, projectDeadlineSeconds: project.durationSeconds, projectDurationSeconds: project.durationSeconds, projectPhase: 0, phaseProgressPercent: 0 }, `${project.name} started`); }} disabled={Boolean(business.activeProjectId) || cash < project.budget || (business.landOwned ?? 0) < project.landRequired} lockedReason={business.activeProjectId ? 'Finish the active project first' : (business.landOwned ?? 0) < project.landRequired ? `Need ${project.landRequired} site(s)` : `Need ${formatCurrency(project.budget - cash)} more`} /></View>)}</Section></>;
}

function Machinery({ business, cash, machinery, spend }: { business: ConstructionData; cash: number; machinery: NonNullable<ConstructionData['machinery']>; spend: (cost: number, patch: Partial<ConstructionData>, label: string) => void }) {
  const items = [{ key: 'excavators', name: 'Excavator', price: 80000, copy: '+75 project throughput', image: constructionVisuals.machinery }, { key: 'cranes', name: 'Tower Crane', price: 150000, copy: '+30% build efficiency', image: constructionVisuals.machinery }, { key: 'mixers', name: 'Concrete Mixer', price: 60000, copy: '+55 project throughput', image: constructionVisuals.machinery }, { key: 'dumpTrucks', name: 'Dump Truck', price: 90000, copy: '+65 project throughput', image: constructionVisuals.machinery }] as const;
  return <><Image source={constructionVisuals.machinery} style={styles.sectionImage} /><Section title="EQUIPMENT YARD"><Text style={styles.muted}>Purchase the machines that make your crew faster and your tender capacity larger.</Text>{items.map(item => <View key={item.key} style={styles.equipmentRow}><Image source={item.image} style={styles.thumb} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{machinery[item.key]} owned · {item.copy}</Text></View><Action title="BUY" copy={formatCurrency(item.price)} onPress={() => spend(item.price, { machinery: { ...machinery, [item.key]: machinery[item.key] + 1 } }, `${item.name} added`)} disabled={cash < item.price} lockedReason={`Need ${formatCurrency(item.price - cash)} more`} /></View>)}</Section></>;
}

function Management({ business, activeProject, update }: { business: ConstructionData; activeProject?: typeof CONSTRUCTION_PROJECTS[number]; update: (patch: Partial<ConstructionData>) => void }) {
  const remaining = business.projectDeadlineSeconds ?? 0;
  const total = Math.max(1, business.projectDurationSeconds ?? 1);
  const progress = activeProject ? Math.max(0, Math.min(100, Math.round((1 - remaining / total) * 100))) : 0;
  return <><Image source={constructionVisuals.project} style={styles.sectionImage} /><Section title="PROJECT MANAGEMENT">{activeProject ? <><Text style={styles.cardTitle}>{activeProject.name}</Text><Text style={styles.muted}>{activeProject.description}</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><View style={styles.progressMeta}><Text style={styles.muted}>{progress}% complete</Text><Text style={styles.muted}>{Math.ceil(remaining / 60)} min remaining</Text></View><InfoRow label="Materials committed" value={formatCurrency(business.projectCostSpent ?? 0)} /><InfoRow label="Workers assigned" value={`${business.workers ?? 0}`} /><InfoRow label="Phase" value={`${business.projectPhase ?? 0} / 3`} /><Action title="ASSIGN TWO MORE WORKERS" copy="Improves delivery speed · no cash cost" onPress={() => update({ workers: (business.workers ?? 0) + 2 })} /></> : <Empty title="No active project" copy="Choose a site and project from Land & Projects to begin construction." />}</Section><Section title="LABOR CONTROL"><InfoRow label="Current crew" value={`${business.workers ?? 0} workers`} /><InfoRow label="Safety clearance" value={business.safetyCleared ? 'Cleared' : 'Pending inspection'} /><Action title={business.safetyCleared ? 'SAFETY CLEARED' : 'CLEAR SITE SAFETY'} copy="Reduce delay risk and unlock government work." onPress={() => update({ safetyCleared: true })} disabled={business.safetyCleared} lockedReason="Already cleared" /></Section></>;
}

function Contracts({ business, cash, stage, spend }: { business: ConstructionData; cash: number; stage: NonNullable<ConstructionData['constructionStage']>; spend: (cost: number, patch: Partial<ConstructionData>, label: string) => void }) {
  return <><Image source={constructionVisuals.contracts} style={styles.sectionImage} /><Section title="CONTRACTS & EARNINGS"><Text style={styles.muted}>Private contracts pay faster; government contracts pay more reputation and unlock the next tier.</Text>{CONSTRUCTION_CONTRACTS.filter(contract => canUseStage(stage, contract.minimumStage)).map(contract => <View key={contract.id} style={styles.projectCard}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{contract.name}</Text><Text style={styles.contractType}>{contract.type.toUpperCase()} · {Math.ceil(contract.deadlineSeconds / 60)} MIN</Text><Text style={styles.muted}>{contract.description}</Text><Text style={styles.projectMeta}>Payout {formatCurrency(contract.payout)} · +{contract.reputation} reputation</Text></View><Action title={business.activeContractType ? 'ACTIVE' : 'ACCEPT'} copy={formatCurrency(contract.payout)} onPress={() => spend(0, { activeContractType: contract.type, activeContractName: contract.id, contractPayout: contract.payout, contractDeadlineSeconds: contract.deadlineSeconds }, `${contract.name} accepted`)} disabled={Boolean(business.activeContractType)} lockedReason="Finish the active contract first" /></View>)}</Section></>;
}

function Expansion({ business, cash, stage, netWorth, spend }: { business: ConstructionData; cash: number; stage: NonNullable<ConstructionData['constructionStage']>; netWorth: number; spend: (cost: number, patch: Partial<ConstructionData>, label: string) => void }) {
  return <><Image source={constructionVisuals.dashboard} style={styles.sectionImage} /><Section title="EXPANSION & UPGRADES"><Text style={styles.muted}>Stage unlocks are tied to net worth, not a hidden purchase gate.</Text><InfoRow label="Current net worth" value={formatCurrency(netWorth)} /><InfoRow label="Current stage" value={stage} />{CONSTRUCTION_UPGRADES.map(upgrade => { const locked = !canUseStage(stage, upgrade.minimumStage); return <Action key={upgrade.id} title={upgrade.name} copy={`${formatCurrency(upgrade.cost)} · ${upgrade.description}`} onPress={() => spend(upgrade.cost, { landCapacity: (business.landCapacity ?? 1) + (upgrade.id === 'storage-yard' ? 1 : 0), machinery: upgrade.id === 'advanced-machinery' ? { ...(business.machinery ?? { excavators: 0, cranes: 0, mixers: 0, dumpTrucks: 0 }), cranes: (business.machinery?.cranes ?? 0) + 1 } : business.machinery }, `${upgrade.name} installed`)} disabled={locked || cash < upgrade.cost} lockedReason={locked ? `Unlocks at ${upgrade.minimumStage}` : `Need ${formatCurrency(Math.max(0, upgrade.cost - cash))} more`} />; })}</Section></>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }
function Metric({ label, value, accent = C.ink }: { label: string; value: string; accent?: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, { color: accent }]}>{value}</Text></View>; }
function InfoRow({ label, value }: { label: string; value: string }) { return <View style={styles.infoRow}><Text style={styles.muted}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }
function Action({ title, copy, onPress, disabled = false, lockedReason }: { title: string; copy: string; onPress: () => void; disabled?: boolean; lockedReason?: string }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.action, disabled && styles.actionDisabled]}><View style={{ flex: 1 }}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.muted}>{disabled && lockedReason ? lockedReason : copy}</Text></View><Text style={styles.actionArrow}>{disabled ? 'LOCKED' : '›'}</Text></Pressable>; }
function Empty({ title, copy }: { title: string; copy: string }) { return <View style={styles.empty}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{copy}</Text></View>; }

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: C.bg }, safe: { flex: 1 }, content: { flexGrow: 1, padding: 16, paddingBottom: 120 }, back: { color: C.blue, fontWeight: '800', fontSize: 12, marginBottom: 12 }, header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 }, eyebrow: { color: C.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }, title: { color: C.ink, fontSize: 29, fontWeight: '900', marginTop: 4 }, subtitle: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 5 }, city: { color: C.green, fontSize: 9, fontWeight: '900', marginTop: 5 }, overviewLink: { alignSelf: 'flex-start', marginBottom: 10 }, overviewLinkText: { color: C.blue, fontSize: 10, fontWeight: '900' }, tabs: { paddingBottom: 12 }, tabRail: { flexDirection: 'row', gap: 8 }, tab: { height: 40, paddingHorizontal: 14, borderRadius: 20, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, justifyContent: 'center' }, tabActive: { backgroundColor: C.blue, borderColor: C.blue }, tabText: { color: C.muted, fontSize: 10, fontWeight: '800' }, tabTextActive: { color: C.white }, overviewHero: { backgroundColor: C.white, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.line, marginBottom: 12 }, overviewHeroImage: { width: '100%', height: 190 }, overviewHeroCopy: { padding: 16 }, overviewKicker: { color: C.blue, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 }, overviewTitle: { color: C.ink, fontSize: 24, fontWeight: '900', marginTop: 5 }, overviewSubtitle: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }, overviewList: { marginTop: 10 }, overviewCard: { flexDirection: 'row', alignItems: 'stretch', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.line }, overviewImage: { width: 116, height: 132, borderRadius: 14, backgroundColor: C.blueSoft }, overviewCardCopy: { flex: 1, justifyContent: 'center' }, overviewNumber: { color: C.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1 }, overviewCardTitle: { color: C.ink, fontSize: 16, lineHeight: 20, fontWeight: '900', marginTop: 3, marginBottom: 5 }, openPage: { color: C.green, fontSize: 10, fontWeight: '900', marginTop: 10 }, heroImage: { height: 178, width: '100%', borderRadius: 20, marginBottom: -46 }, heroOverlay: { backgroundColor: 'rgba(10,33,56,.82)', borderRadius: 18, padding: 16, marginHorizontal: 10, marginBottom: 14 }, heroKicker: { color: '#A9D5FF', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }, heroTitle: { color: C.white, fontSize: 21, fontWeight: '900', marginTop: 5 }, heroCopy: { color: '#D9ECFF', fontSize: 11, lineHeight: 15, marginTop: 5 }, metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }, metric: { width: '48.7%', backgroundColor: C.white, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.line }, metricLabel: { color: C.muted, fontSize: 8, fontWeight: '900', letterSpacing: .7 }, metricValue: { fontSize: 18, fontWeight: '900', marginTop: 5 }, section: { backgroundColor: C.white, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.line }, sectionTitle: { color: C.ink, fontSize: 12, fontWeight: '900', letterSpacing: 1.1, marginBottom: 10 }, sectionImage: { width: '100%', height: 142, borderRadius: 16, marginBottom: 12 }, muted: { color: C.muted, fontSize: 11, lineHeight: 16 }, infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.line }, infoValue: { color: C.ink, fontSize: 11, fontWeight: '900', textAlign: 'right' }, action: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.blueSoft, borderRadius: 12, padding: 12, marginTop: 9, borderWidth: 1, borderColor: '#BFDDF8' }, actionDisabled: { opacity: .48 }, actionTitle: { color: C.ink, fontSize: 11, fontWeight: '900' }, actionArrow: { color: C.blue, fontSize: 10, fontWeight: '900' }, marketRow: { flexDirection: 'row', gap: 7, marginTop: 12 }, marketChip: { flex: 1, height: 38, borderRadius: 10, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }, marketChipActive: { backgroundColor: C.blue, borderColor: C.blue }, marketText: { color: C.muted, fontSize: 9, fontWeight: '900' }, marketTextActive: { color: C.white }, projectCard: { flexDirection: 'row', gap: 10, paddingVertical: 11, borderTopWidth: 1, borderTopColor: C.line }, cardTitle: { color: C.ink, fontSize: 13, fontWeight: '900', marginBottom: 4 }, projectMeta: { color: C.green, fontSize: 10, fontWeight: '900', marginTop: 6 }, contractType: { color: C.gold, fontSize: 9, fontWeight: '900', marginBottom: 4 }, equipmentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line }, thumb: { width: 58, height: 58, borderRadius: 12 }, playbookGrid: { marginTop: 10 }, playbookCard: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderTopWidth: 1, borderTopColor: C.line }, playbookNumber: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' }, playbookNumberText: { color: C.blue, fontSize: 11, fontWeight: '900' }, playbookCopy: { flex: 1 }, stageHeader: { flexDirection: 'row', gap: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.line }, stageHeaderText: { flex: 1, color: C.muted, fontSize: 9, fontWeight: '900', letterSpacing: .8 }, stageRow: { flexDirection: 'row', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.line }, stageRowActive: { backgroundColor: C.greenSoft, marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 8 }, stageName: { flex: 1, color: C.ink, fontSize: 11, fontWeight: '700' }, stageNameActive: { color: C.green, fontWeight: '900' }, stageUnlocks: { flex: 1, color: C.muted, fontSize: 11, lineHeight: 16 }, progressTrack: { height: 9, backgroundColor: C.line, borderRadius: 9, marginTop: 14, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: C.blue, borderRadius: 9 }, progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }, empty: { paddingVertical: 18, alignItems: 'center' } });
