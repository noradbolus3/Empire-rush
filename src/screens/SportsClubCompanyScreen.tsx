import React, { useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DEFAULT_SPORTS_CLUB, SportsClubState, SportsClubTab } from "../types/sportsClub";
import { expandClub, matchOutcome, projectedHourlyRevenue, signSponsor, trainTeam, upgradeFacility } from "../engine/sportsClubEngine";

const C = { ink: "#132238", muted: "#607089", blue: "#1769AA", pale: "#F3F8FD", border: "#C9DDED", green: "#16845B", gold: "#A15C00" };
const pages: Array<{ id: SportsClubTab; label: string; image: any; eyebrow: string }> = [
  { id: "dashboard", label: "Dashboard", image: require("../../assets/sports/club-headquarters.webp"), eyebrow: "CLUB HEADQUARTERS" },
  { id: "facilities", label: "Facilities", image: require("../../assets/sports/stadium-facilities.webp"), eyebrow: "STADIUM & FACILITIES" },
  { id: "teams", label: "Teams", image: require("../../assets/sports/team-management.webp"), eyebrow: "TEAMS & PLAYER MANAGEMENT" },
  { id: "matches", label: "Matches", image: require("../../assets/sports/matches-tournaments.webp"), eyebrow: "MATCHES & TOURNAMENTS" },
  { id: "revenue", label: "Revenue", image: require("../../assets/sports/sponsorship-revenue.webp"), eyebrow: "SPONSORSHIPS & REVENUE" },
  { id: "expansion", label: "Expansion", image: require("../../assets/sports/expansion-group.webp"), eyebrow: "EXPANSION & SPORTS GROUP" },
];

type Props = { company: SportsClubState | null; cash: number; onCashChange: React.Dispatch<React.SetStateAction<number>>; onChange: (next: SportsClubState) => void; onBack: () => void; onLedger?: (entry: any) => void };

export default function SportsClubCompanyScreen({ company, cash, onCashChange, onChange, onBack, onLedger }: Props) {
  const [tab, setTab] = useState<SportsClubTab>("dashboard");
  const state = company || DEFAULT_SPORTS_CLUB;
  const page = pages.find((item) => item.id === tab) || pages[0];
  const hourly = projectedHourlyRevenue(state);
  const commit = (next: SportsClubState, label: string, amount = 0) => {
    onChange(next);
    if (amount) onLedger?.({ id: `sports-${Date.now()}`, kind: amount > 0 ? "BUSINESS_REVENUE" : "PURCHASE", label, amount, timestamp: Date.now(), detail: "Sports Club gameplay event" });
  };
  const runMatch = () => commit(matchOutcome(state, state.matchesPlayed + 17), "Sports match revenue", 500);
  const train = () => commit(trainTeam(state), "Team training upgrade", -900);
  const facility = (type: "stadium" | "medical") => commit(upgradeFacility(state, type), type === "stadium" ? "Stadium expansion" : "Medical centre upgrade", -2500);
  const sponsor = () => commit(signSponsor(state), "Sponsorship revenue", 1200);
  const expand = () => {
    if (cash < 15000) return Alert.alert("EXPANSION CAPITAL", `Need $${(15000 - cash).toLocaleString()} more cash.`);
    onCashChange((value) => value - 15000);
    commit(expandClub(state), "Sports group expansion", -15000);
  };
  return (
    <View style={styles.root}>
      <View style={styles.header}><Pressable onPress={onBack}><Text style={styles.back}>‹ BACK</Text></Pressable><View><Text style={styles.eyebrow}>SPORTS CLUB & MANAGEMENT</Text><Text style={styles.title}>{state.clubName}</Text></View><Text style={styles.stage}>{state.stage}</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabContent}>
        {pages.map((item) => <Pressable key={item.id} onPress={() => setTab(item.id)} style={[styles.tab, tab === item.id && styles.activeTab]}><Text style={[styles.tabText, tab === item.id && styles.activeTabText]}>{item.label}</Text></Pressable>)}
      </ScrollView>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Image source={page.image} style={styles.hero} resizeMode="cover" />
        <Text style={styles.pageEyebrow}>{page.eyebrow}</Text>
        {tab === "dashboard" && <Dashboard state={state} hourly={hourly} />}
        {tab === "facilities" && <Facilities state={state} onFacility={facility} />}
        {tab === "teams" && <Teams state={state} onTrain={train} />}
        {tab === "matches" && <Matches state={state} onMatch={runMatch} />}
        {tab === "revenue" && <Revenue state={state} onSponsor={sponsor} />}
        {tab === "expansion" && <Expansion state={state} cash={cash} onExpand={expand} />}
        <View style={styles.event}><Text style={styles.eventLabel}>LATEST CLUB EVENT</Text><Text style={styles.eventText}>{state.lastEvent}</Text></View>
      </ScrollView>
    </View>
  );
}

function Dashboard({ state, hourly }: { state: SportsClubState; hourly: number }) { return <><Card title="CLUB COMMAND" copy="Build a winning organisation through facilities, player development, matchday choices and commercial discipline." /><Metrics items={[["REPUTATION", `${state.reputation}/100`], ["FAN SATISFACTION", `${state.fanSatisfaction}/100`], ["PROJECTED / HR", `$${hourly.toLocaleString()}`], ["MATCH RECORD", `${state.wins}-${state.matchesPlayed - state.wins}`]]} /></>; }
function Facilities({ state, onFacility }: { state: SportsClubState; onFacility: (type: "stadium" | "medical") => void }) { return <><Card title="STADIUM & FACILITIES" copy="Attendance, player development and injury resilience all improve through targeted infrastructure." /><Metrics items={[["CAPACITY", state.stadiumCapacity.toLocaleString()], ["TRAINING LEVEL", String(state.trainingLevel)], ["MEDICAL LEVEL", String(state.medicalLevel)]]} /><Action title="EXPAND STADIUM" copy="+1,500 seats · $2,500" onPress={() => onFacility("stadium")} /><Action title="UPGRADE MEDICAL CENTRE" copy="+3 fan satisfaction · $2,500" onPress={() => onFacility("medical")} /></>; }
function Teams({ state, onTrain }: { state: SportsClubState; onTrain: () => void }) { return <><Card title="TEAMS & PLAYER MANAGEMENT" copy="Recruit depth, invest in coaching and improve team form before demanding bigger competitions." /><Metrics items={[["PLAYERS", String(state.players)], ["COACHES", String(state.coaches)], ["PAYROLL / SETTLEMENT", `$${state.payrollPerSettlement.toLocaleString()}`]]} /><Action title="RUN TRAINING BLOCK" copy="+2 players · +1 training level · payroll increases" onPress={onTrain} /></>; }
function Matches({ state, onMatch }: { state: SportsClubState; onMatch: () => void }) { return <><Card title="MATCHES & TOURNAMENTS" copy="Every fixture changes reputation, ticket demand and merchandise revenue. Wins are influenced by training and club reputation." /><Metrics items={[["PLAYED", String(state.matchesPlayed)], ["WINS", String(state.wins)], ["TICKET REVENUE", `$${state.ticketRevenue.toLocaleString()}`]]} /><Action title="PLAY NEXT FIXTURE" copy="Deterministic match outcome · earn matchday revenue" onPress={onMatch} /></>; }
function Revenue({ state, onSponsor }: { state: SportsClubState; onSponsor: () => void }) { return <><Card title="SPONSORSHIPS & REVENUE" copy="Balance sponsorship cash with fan trust. Matchday revenue comes from attendance and merchandise, not a passive placeholder." /><Metrics items={[["SPONSORSHIP", `$${state.sponsorshipRevenue.toLocaleString()}`], ["TICKETS", `$${state.ticketRevenue.toLocaleString()}`], ["MERCHANDISE", `$${state.merchandiseRevenue.toLocaleString()}`]]} /><Action title="NEGOTIATE SPONSOR DEAL" copy="Revenue scales with reputation · no guaranteed profit" onPress={onSponsor} /></>; }
function Expansion({ state, cash, onExpand }: { state: SportsClubState; cash: number; onExpand: () => void }) { return <><Card title="EXPANSION & SPORTS GROUP" copy="Open new cities, add teams and build a youth academy. Expansion requires real cash and raises the club stage." /><Metrics items={[["CITIES", String(state.cityCount)], ["TEAMS", String(state.teams)], ["ACADEMY", String(state.academyLevel)], ["CASH", `$${cash.toLocaleString()}`]]} /><Action title="OPEN NEXT CITY" copy="$15,000 · adds a team and academy level" onPress={onExpand} /></>; }
function Card({ title, copy }: { title: string; copy: string }) { return <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.copy}>{copy}</Text></View>; }
function Metrics({ items }: { items: string[][] }) { return <View style={styles.metrics}>{items.map(([label, value]) => <View key={label} style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>)}</View>; }
function Action({ title, copy, onPress }: { title: string; copy: string; onPress: () => void }) { return <Pressable style={styles.action} onPress={onPress}><View style={{ flex: 1 }}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionCopy}>{copy}</Text></View><Text style={styles.chevron}>›</Text></Pressable>; }
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: C.pale }, header: { backgroundColor: "#FFF", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: C.border }, back: { color: C.blue, fontWeight: "900", fontSize: 12 }, eyebrow: { color: C.blue, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, title: { color: C.ink, fontSize: 19, fontWeight: "900" }, stage: { marginLeft: "auto", color: C.green, fontWeight: "900", fontSize: 10 }, tabs: { backgroundColor: "#FFF", flexGrow: 0, flexShrink: 0 }, tabContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 }, tab: { height: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: C.border, justifyContent: "center" }, activeTab: { backgroundColor: C.blue, borderColor: C.blue }, tabText: { color: C.muted, fontWeight: "800", fontSize: 12 }, activeTabText: { color: "#FFF" }, body: { flex: 1 }, bodyContent: { padding: 16, paddingBottom: 110 }, hero: { width: "100%", height: 170, borderRadius: 18, marginBottom: 14 }, pageEyebrow: { color: C.blue, fontSize: 10, fontWeight: "900", letterSpacing: 1, marginBottom: 8 }, card: { backgroundColor: "#FFF", borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 12 }, cardTitle: { color: C.ink, fontSize: 16, fontWeight: "900", marginBottom: 7 }, copy: { color: C.muted, fontSize: 14, lineHeight: 21 }, metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 }, metric: { backgroundColor: "#FFF", borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 13, minWidth: "47%", flex: 1 }, metricLabel: { color: C.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.6 }, metricValue: { color: C.ink, fontSize: 18, fontWeight: "900", marginTop: 5 }, action: { backgroundColor: "#FFF", borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 15, marginBottom: 10, flexDirection: "row", alignItems: "center" }, actionTitle: { color: C.blue, fontSize: 14, fontWeight: "900" }, actionCopy: { color: C.muted, fontSize: 12, marginTop: 4 }, chevron: { color: C.blue, fontSize: 28, fontWeight: "300" }, event: { backgroundColor: "#E7F4EE", borderRadius: 14, padding: 14, marginTop: 4 }, eventLabel: { color: C.green, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, eventText: { color: C.ink, fontSize: 13, marginTop: 5, lineHeight: 19 } });
