import { designSystem } from "../theme/designSystem";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { BankLedgerEntry } from "../types/bank";
import {
  DEFAULT_SOFTWARE_COMPANY,
  SoftwareCompanyState,
  softwareSettlementTick,
  softwareStageFor,
} from "../types/software";
import { formatCurrency } from "../utils/formatCurrency";
import { SpecializedBusinessShell } from "../components/business/SpecializedBusinessShell";
type Page =
  "dashboard" | "setup" | "pipeline" | "teams" | "cloud" | "enterprise";
type Props = {
  company: SoftwareCompanyState | null;
  cash: number;
  onCashChange: React.Dispatch<React.SetStateAction<number>>;
  onChange: React.Dispatch<React.SetStateAction<SoftwareCompanyState | null>>;
  onBack: () => void;
  onLedger?: (entry: BankLedgerEntry) => void;
};
const startup = require("../../assets/software/startup-office.jpg");
const growing = require("../../assets/software/growing-company.jpg");
const established = require("../../assets/software/established-firm.jpg");
const enterprise = require("../../assets/software/technology-enterprise.jpg");
const pipeline = require("../../assets/software/development-pipeline.jpg");
const cloud = require("../../assets/software/cloud-security.jpg");
const C = {
  bg: designSystem.colors.surfaceLight,
  ink: designSystem.colors.textPrimary,
  blue: designSystem.colors.primaryBlue,
  muted: designSystem.colors.textSecondary,
  border: designSystem.colors.border,
  card: '#FFFFFF',
  green: designSystem.colors.success,
};
export default function SoftwareCompanyScreen({
  company,
  cash,
  onCashChange,
  onChange,
  onBack,
  onLedger,
}: Props) {
  const [page, setPage] = useState<Page>(
    company?.status === "operating" ? "dashboard" : "setup",
  );
  const c = company ?? DEFAULT_SOFTWARE_COMPANY;
  const update = (n: SoftwareCompanyState) =>
    onChange({ ...n, stage: softwareStageFor(n) });
  const spend = (cost: number, label: string, n: SoftwareCompanyState) => {
    if (cash < cost)
      return Alert.alert(
        "INSUFFICIENT CAPITAL",
        `${label} requires ${formatCurrency(cost)}.`,
      );
    onCashChange((v) => v - cost);
    update(n);
    onLedger?.({
      id: `software-${Date.now()}`,
      kind: "PURCHASE",
      label: `Software · ${label}`,
      amount: -cost,
      timestamp: Date.now(),
      detail: c.name,
    });
  };
  const launch = () => {
    if (cash < 50000)
      return Alert.alert(
        "STARTUP CAPITAL SHORTFALL",
        `Need ${formatCurrency(50000 - cash)} more.`,
      );
    onCashChange((v) => v - 50000);
    update({
      ...DEFAULT_SOFTWARE_COMPANY,
      status: "operating",
      developers: 1,
      clientContracts: 1,
      activeProjects: 1,
      cashInvested: 50000,
    });
    setPage("dashboard");
  };
  const settle = () => {
    const r = softwareSettlementTick(c);
    if (!r.delivered)
      return Alert.alert(
        "PIPELINE NOT READY",
        "Hire a developer and accept a project before delivery.",
      );
    update(r.company);
    onCashChange((v) => v + r.profit);
    onLedger?.({
      id: `software-revenue-${Date.now()}`,
      kind: "BUSINESS_REVENUE",
      label: "Software project delivery",
      amount: r.profit,
      timestamp: Date.now(),
      detail: `Revenue ${formatCurrency(r.revenue)}`,
    });
  };
  return (
    <SpecializedBusinessShell
      eyebrow="TECHNOLOGY · SOFTWARE COMPANY"
      title={company ? "Software Dashboard" : "Software Company Setup"}
      monogram="⌘"
      onBack={onBack}
      tabs={company ? [
        { id: "dashboard", label: "DASHBOARD" },
        { id: "setup", label: "SETUP" },
        { id: "pipeline", label: "PIPELINE" },
        { id: "teams", label: "TEAMS" },
        { id: "cloud", label: "CLOUD" },
        { id: "enterprise", label: "ENTERPRISE" },
      ] : []}
      activeTab={page}
      onTabChange={(id) => setPage(id as Page)}
    >
          {!company ? (
            <Setup cash={cash} launch={launch} />
          ) : page === "dashboard" ? (
            <Dashboard c={c} setPage={setPage} settle={settle} />
          ) : page === "setup" ? (
            <SetupOps c={c} spend={spend} />
          ) : page === "pipeline" ? (
            <Pipeline c={c} deliver={settle} />
          ) : page === "teams" ? (
            <Teams c={c} spend={spend} />
          ) : page === "cloud" ? (
            <Cloud c={c} spend={spend} />
          ) : (
            <Enterprise c={c} spend={spend} />
          )}
    </SpecializedBusinessShell>
  );
}
function Setup({ cash, launch }: { cash: number; launch: () => void }) {
  return (
    <>
      <Image source={startup} style={s.cover} />
      <Section
        title="01 · STARTUP FOUNDATION"
        copy="Register the company, fund the first office, hire a developer and win the first client contract."
      />
      <Metric label="INITIAL CAPITAL" value={formatCurrency(50000)} />
      <Text style={s.muted}>
        Wallet: {formatCurrency(cash)} · home-based setup, first developer and
        first project budget.
      </Text>
      <Pressable style={s.primary} onPress={launch}>
        <Text style={s.primaryText}>REGISTER SOFTWARE COMPANY</Text>
      </Pressable>
    </>
  );
}
function Dashboard({
  c,
  setPage,
  settle,
}: {
  c: SoftwareCompanyState;
  setPage: (p: Page) => void;
  settle: () => void;
}) {
  const img =
    c.stage === "Startup"
      ? startup
      : c.stage === "Growing Company"
        ? growing
        : c.stage === "Established Firm"
          ? established
          : enterprise;
  return (
    <>
      <Image source={img} style={s.cover} />
      <View style={s.hero}>
        <Text style={s.heroEyebrow}>
          {c.stage.toUpperCase()} · OPERATING SYSTEMS ACTIVE
        </Text>
        <Text style={s.heroTitle}>{c.name}</Text>
        <Text style={s.heroSub}>
          {c.officeType} · {c.offices} offices · satisfaction{" "}
          {c.clientSatisfaction}%
        </Text>
        <Text style={s.heroValue}>
          {formatCurrency(c.revenue - c.expenses)}
        </Text>
        <Text style={s.heroSub}>Cumulative operating result</Text>
      </View>
      <View style={s.metrics}>
        <Metric label="ACTIVE PROJECTS" value={`${c.activeProjects}`} />
        <Metric label="DEVELOPERS" value={`${c.developers}`} />
        <Metric label="CLIENT CONTRACTS" value={`${c.clientContracts}`} />
        <Metric label="SAAS SUBSCRIBERS" value={`${c.subscribers}`} />
      </View>
      <Section
        title="NEXT BEST MOVE"
        copy={
          c.stage === "Startup"
            ? "Build the delivery pipeline before taking on more clients."
            : c.stage === "Growing Company"
              ? "Add design and QA capacity to protect deadlines."
              : c.stage === "Established Firm"
                ? "Invest in SaaS and cloud resilience for recurring revenue."
                : "Allocate enterprise capital across R&D, compliance and acquisitions."
        }
      >
        <Action
          title="DEVELOPMENT PIPELINE"
          copy="Code, test, deliver and collect project revenue"
          image={pipeline}
          onPress={() => setPage("pipeline")}
        />
        <Action
          title="TEAMS & PROJECTS"
          copy="Hire specialists and manage workload"
          image={c.stage === "Startup" ? startup : growing}
          onPress={() => setPage("teams")}
        />
        <Action
          title="CLOUD & SECURITY"
          copy="Control servers, cloud cost and incidents"
          image={cloud}
          onPress={() => setPage("cloud")}
        />
        <Action
          title="ENTERPRISE STRATEGY"
          copy="SaaS, R&D, legal contracts and M&A"
          image={enterprise}
          onPress={() => setPage("enterprise")}
        />
        <Pressable style={s.primary} onPress={settle}>
          <Text style={s.primaryText}>RUN NEXT DELIVERY SETTLEMENT</Text>
        </Pressable>
      </Section>
    </>
  );
}
function SetupOps({
  c,
  spend,
}: {
  c: SoftwareCompanyState;
  spend: (cost: number, label: string, n: SoftwareCompanyState) => void;
}) {
  return (
    <Section
      title="STARTUP OPERATIONS"
      copy="The founder manages capital, hiring and the first client relationship."
    >
      <Image source={startup} style={s.sectionImage} />
      <Metric label="Office" value={c.officeType} />
      <Metric label="Developers" value={`${c.developers}`} />
      <Action
        title="RENT SMALL OFFICE"
        copy="$35,000 · startup workspace"
        image={startup}
        onPress={() =>
          spend(35000, "Small office rented", {
            ...c,
            officeType: "Small startup office",
            offices: 1,
          })
        }
      />
    </Section>
  );
}
function Pipeline({
  c,
  deliver,
}: {
  c: SoftwareCompanyState;
  deliver: () => void;
}) {
  return (
    <Section
      title="DEVELOPMENT PIPELINE"
      copy="Coding → testing → delivery → payment. A weak team causes project delay and lost cash flow."
    >
      <Image source={pipeline} style={s.sectionImage} />
      <Metric label="Active projects" value={`${c.activeProjects}`} />
      <Metric label="Delivered projects" value={`${c.deliveredProjects}`} />
      <Action
        title="DELIVER CLIENT PROJECT"
        copy="Complete the current sprint and invoice the client"
        image={pipeline}
        onPress={deliver}
      />
    </Section>
  );
}
function Teams({
  c,
  spend,
}: {
  c: SoftwareCompanyState;
  spend: (cost: number, label: string, n: SoftwareCompanyState) => void;
}) {
  return (
    <Section
      title="TEAMS & PROJECTS"
      copy="Growing companies add design, QA and workload management before accepting more deadlines."
    >
      <Image
        source={c.stage === "Startup" ? startup : growing}
        style={s.sectionImage}
      />
      <Metric label="Developers" value={`${c.developers}`} />
      <Metric
        label="Designers / QA"
        value={`${c.designers} / ${c.qaEngineers}`}
      />
      <Action
        title="HIRE DEVELOPER"
        copy="$24,000 · +1 developer and +1 project capacity"
        image={growing}
        onPress={() =>
          spend(24000, "Developer hired", {
            ...c,
            developers: c.developers + 1,
            activeProjects: c.activeProjects + 1,
          })
        }
      />
      <Action
        title="BUILD DESIGN & QA POD"
        copy="$38,000 · +1 designer and +1 QA engineer"
        image={growing}
        onPress={() =>
          spend(38000, "Design and QA pod built", {
            ...c,
            designers: c.designers + 1,
            qaEngineers: c.qaEngineers + 1,
          })
        }
      />
    </Section>
  );
}
function Cloud({
  c,
  spend,
}: {
  c: SoftwareCompanyState;
  spend: (cost: number, label: string, n: SoftwareCompanyState) => void;
}) {
  return (
    <Section
      title="CLOUD, SERVERS & SECURITY"
      copy="Established firms face cloud bills, cybersecurity incidents and reliability consequences."
    >
      <Image source={cloud} style={s.sectionImage} />
      <Metric
        label="Recurring cloud spend"
        value={formatCurrency(c.cloudSpend)}
      />
      <Action
        title="HARDEN CLOUD SECURITY"
        copy="$45,000 · +$900 recurring cloud cost, fewer incidents"
        image={cloud}
        onPress={() =>
          spend(45000, "Cloud security hardened", {
            ...c,
            cloudSpend: c.cloudSpend + 900,
            clientSatisfaction: Math.min(100, c.clientSatisfaction + 5),
          })
        }
      />
    </Section>
  );
}
function Enterprise({
  c,
  spend,
}: {
  c: SoftwareCompanyState;
  spend: (cost: number, label: string, n: SoftwareCompanyState) => void;
}) {
  return (
    <Section
      title="ENTERPRISE STRATEGY"
      copy="Technology enterprise systems unlock only after teams, projects and offices mature."
    >
      <Image
        source={c.stage === "Technology Enterprise" ? enterprise : established}
        style={s.sectionImage}
      />
      <Metric label="SaaS products" value={`${c.saasProducts}`} />
      <Metric label="Offices" value={`${c.offices}`} />
      <Action
        title="LAUNCH SAAS PRODUCT"
        copy="$120,000 · recurring subscriber revenue"
        image={enterprise}
        onPress={() =>
          spend(120000, "SaaS product launched", {
            ...c,
            saasProducts: c.saasProducts + 1,
            subscribers: c.subscribers + 100,
          })
        }
      />
      <Action
        title="OPEN REGIONAL OFFICE"
        copy="$150,000 · +1 office and management layer"
        image={established}
        onPress={() =>
          spend(150000, "Regional office opened", {
            ...c,
            offices: c.offices + 1,
            managers: c.managers + 1,
          })
        }
      />
    </Section>
  );
}
function Section({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionCopy}>{copy}</Text>
      {children}
    </View>
  );
}
function Action({
  title,
  copy,
  image,
  onPress,
}: {
  title: string;
  copy: string;
  image: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.action} onPress={onPress}>
      <Image source={image} style={s.actionImage} />
      <Text style={s.actionTitle}>{title}</Text>
      <Text style={s.muted}>{copy}</Text>
    </Pressable>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.metric}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={s.metricValue}>{value}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 100 },
  back: { color: C.blue, fontWeight: "900", marginBottom: 16 },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  eyebrow: { color: C.blue, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  title: { color: C.ink, fontSize: 23, fontWeight: "900", marginTop: 3 },
  nav: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 12 },
  navBtn: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  navSelected: { backgroundColor: designSystem.colors.highlight, borderColor: C.blue },
  navText: { color: C.muted, fontSize: 8, fontWeight: "900" },
  navTextSelected: { color: C.blue },
  cover: { width: "100%", height: 150, borderRadius: 18, marginBottom: 12 },
  hero: {
    backgroundColor: C.ink,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  heroEyebrow: { color: "#BFD3DE", fontSize: 9, fontWeight: "900" },
  heroTitle: { color: "#FFF", fontSize: 23, fontWeight: "900", marginTop: 6 },
  heroSub: { color: "#C6D7E0", fontSize: 11, marginTop: 4 },
  heroValue: {
    color: designSystem.colors.success,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 15,
  },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  metric: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 11,
    padding: 12,
    marginTop: 8,
  },
  metricLabel: { color: C.muted, fontSize: 8, fontWeight: "900" },
  metricValue: { color: C.ink, fontSize: 16, fontWeight: "900", marginTop: 4 },
  section: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 13,
  },
  sectionTitle: { color: C.ink, fontSize: 14, fontWeight: "900" },
  sectionCopy: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    marginBottom: 7,
  },
  sectionImage: {
    width: "100%",
    height: 130,
    borderRadius: 12,
    marginVertical: 8,
  },
  primary: {
    backgroundColor: C.blue,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 14,
  },
  primaryText: { color: "#FFF", fontSize: 11, fontWeight: "900" },
  action: {
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 11,
    padding: 13,
    marginTop: 8,
  },
  actionImage: { width: "100%", height: 68, borderRadius: 8, marginBottom: 8 },
  actionTitle: { color: C.blue, fontWeight: "900", fontSize: 11 },
  muted: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 3 },
});
