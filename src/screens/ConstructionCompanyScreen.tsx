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
  DEFAULT_CONSTRUCTION_COMPANY,
  ConstructionCompanyState,
  ConstructionProjectType,
  constructionLevelFor,
  constructionTick,
} from "../types/construction";
import { formatCurrency } from "../utils/formatCurrency";
import { SpecializedBusinessShell } from "../components/business/SpecializedBusinessShell";
type Page =
  "dashboard" | "land" | "machinery" | "projects" | "contracts" | "expansion";
type Props = {
  company: ConstructionCompanyState | null;
  cash: number;
  onCashChange: React.Dispatch<React.SetStateAction<number>>;
  onChange: React.Dispatch<
    React.SetStateAction<ConstructionCompanyState | null>
  >;
  onBack: () => void;
  onLedger?: (entry: BankLedgerEntry) => void;
};
const C = {
  bg: designSystem.colors.surfaceLight,
  ink: designSystem.colors.textPrimary,
  card: '#FFFFFF',
  blue: designSystem.colors.primaryBlue,
  amber: designSystem.colors.warning,
  green: designSystem.colors.success,
  muted: designSystem.colors.textSecondary,
  border: designSystem.colors.border,
};
const dashboard = require("../../assets/construction/construction-dashboard.webp");
const land = require("../../assets/construction/land-project-selection.jpg");
const machinery = require("../../assets/construction/heavy-machinery.jpg");
const projects = require("../../assets/construction/project-management.jpg");
const contracts = require("../../assets/construction/contracts-expansion.jpg");
const expansion = require("../../assets/construction/expansion-multi-site.jpg");
const types: ConstructionProjectType[] = [
  "Residential",
  "Commercial",
  "Industrial",
];
export default function ConstructionCompanyScreen({
  company,
  cash,
  onCashChange,
  onChange,
  onBack,
  onLedger,
}: Props) {
  const [page, setPage] = useState<Page>(
    company?.status === "operating" ? "dashboard" : "land",
  );
  const current = company ?? DEFAULT_CONSTRUCTION_COMPANY;
  const [projectType, setProjectType] = useState<ConstructionProjectType>(
    current.projectType,
  );
  const update = (next: ConstructionCompanyState) =>
    onChange({ ...next, level: constructionLevelFor(next) });
  const spend = (
    cost: number,
    label: string,
    next: ConstructionCompanyState,
  ) => {
    if (cash < cost)
      return Alert.alert(
        "INSUFFICIENT CAPITAL",
        `${label} requires ${formatCurrency(cost)}.`,
      );
    onCashChange((v) => v - cost);
    update(next);
    onLedger?.({
      id: `construction-${Date.now()}`,
      kind: "PURCHASE",
      label: `Construction · ${label}`,
      amount: -cost,
      timestamp: Date.now(),
      detail: current.name,
    });
  };
  const launch = () => {
    const cost = 60000;
    if (cash < cost)
      return Alert.alert(
        "SETUP CAPITAL SHORTFALL",
        `Need ${formatCurrency(cost - cash)} more.`,
      );
    const next = {
      ...DEFAULT_CONSTRUCTION_COMPANY,
      status: "operating" as const,
      projectType,
      landLocation: "Metro North District",
      landParcels: 1,
      workers: 4,
      excavators: 1,
      mixers: 1,
      materials: 300,
      cashInvested: cost,
    };
    onCashChange((v) => v - cost);
    update(next);
    onLedger?.({
      id: `construction-launch-${Date.now()}`,
      kind: "PURCHASE",
      label: "Construction company launch capital",
      amount: -cost,
      timestamp: Date.now(),
      detail: projectType,
    });
    setPage("dashboard");
  };
  return (
    <SpecializedBusinessShell
      eyebrow="DEVELOPMENT · CONSTRUCTION COMPANY"
      title={company?.status === "operating" ? "Construction Dashboard" : "Construction Company Setup"}
      monogram="C"
      onBack={onBack}
      tabs={company?.status === "operating" ? [
        { id: "dashboard", label: "DASHBOARD" },
        { id: "land", label: "LAND" },
        { id: "machinery", label: "MACHINERY" },
        { id: "projects", label: "PROJECTS" },
        { id: "contracts", label: "CONTRACTS" },
        { id: "expansion", label: "EXPANSION" },
      ] : []}
      activeTab={page}
      onTabChange={(id) => setPage(id as Page)}
    >
          {page === "land" && !company ? (
            <Setup
              type={projectType}
              setType={setProjectType}
              cash={cash}
              launch={launch}
            />
          ) : page === "dashboard" ? (
            <Dashboard c={current} setPage={setPage} />
          ) : page === "land" ? (
            <Land c={current} setPage={setPage} spend={spend} />
          ) : page === "machinery" ? (
            <Machinery c={current} cash={cash} spend={spend} />
          ) : page === "projects" ? (
            <Projects c={current} update={update} onLedger={onLedger} />
          ) : page === "contracts" ? (
            <Contracts
              c={current}
              cash={cash}
              update={update}
              onLedger={onLedger}
            />
          ) : (
            <Expansion c={current} cash={cash} spend={spend} />
          )}
    </SpecializedBusinessShell>
  );
}
function Setup({
  type,
  setType,
  cash,
  launch,
}: {
  type: ConstructionProjectType;
  setType: (x: ConstructionProjectType) => void;
  cash: number;
  launch: () => void;
}) {
  return (
    <>
      <Image source={land} style={s.cover} />
      <Section
        title="01 · LAND PURCHASE"
        copy="Acquire a parcel and choose the project type that defines your construction pipeline."
      >
        {types.map((x) => (
          <Choice
            key={x}
            title={`${x} development`}
            selected={x === type}
            onPress={() => setType(x)}
          />
        ))}
      </Section>
      <View style={s.preview}>
        <Text style={s.label}>LAND + FIRST SITE RESERVE</Text>
        <Text style={s.big}>{formatCurrency(60000)}</Text>
        <Text style={s.muted}>
          Wallet: {formatCurrency(cash)} · includes one parcel, starter
          machinery and site compliance.
        </Text>
      </View>
      <Pressable style={s.primary} onPress={launch}>
        <Text style={s.primaryText}>PURCHASE LAND & LAUNCH COMPANY</Text>
      </Pressable>
    </>
  );
}
function Dashboard({
  c,
  setPage,
}: {
  c: ConstructionCompanyState;
  setPage: (x: Page) => void;
}) {
  return (
    <>
      <Image source={dashboard} style={s.cover} />
      <View style={s.hero}>
        <Text style={s.heroEyebrow}>
          CONSTRUCTION DASHBOARD · {c.level.toUpperCase()}
        </Text>
        <Text style={s.heroTitle}>{c.name}</Text>
        <Text style={s.heroSub}>
          {c.projectType} · {c.landLocation}
        </Text>
        <Text style={s.heroValue}>
          {formatCurrency(c.revenue - c.expenses)}
        </Text>
        <Text style={s.heroSub}>Lifetime company performance</Text>
      </View>
      <View style={s.metrics}>
        <Metric label="ACTIVE PROJECTS" value={`${c.activeProjects}`} />
        <Metric label="PROJECT PROGRESS" value={`${c.progress}%`} />
        <Metric label="LAND PARCELS" value={`${c.landParcels}`} />
        <Metric label="WORKERS" value={`${c.workers}`} />
      </View>
      <Section
        title="OPERATING SNAPSHOT"
        copy="Land, machinery, labour and contracts combine into a construction cash cycle."
      >
        <Metric
          label="Contract value"
          value={formatCurrency(c.contractValue)}
        />
        <Metric label="Completed projects" value={`${c.completedProjects}`} />
        <Action
          title="LAND & PROJECT SELECTION"
          copy="Acquire sites and choose new development projects"
          image={land}
          onPress={() => setPage("land")}
        />
        <Action
          title="MACHINERY & EQUIPMENT"
          copy="Manage excavators, cranes, bulldozers and mixers"
          image={machinery}
          onPress={() => setPage("machinery")}
        />
        <Action
          title="PROJECT MANAGEMENT"
          copy="Advance progress, materials and deadlines"
          image={projects}
          onPress={() => setPage("projects")}
        />
        <Action
          title="CONTRACTS & EARNINGS"
          copy="Accept contracts, complete work and track profit"
          image={contracts}
          onPress={() => setPage("contracts")}
        />
        <Action
          title="EXPANSION & UPGRADES"
          copy="Grow into multiple sites and larger contracts"
          image={expansion}
          onPress={() => setPage("expansion")}
        />
      </Section>
    </>
  );
}
function Land({
  c,
  setPage,
  spend,
}: {
  c: ConstructionCompanyState;
  setPage: (x: Page) => void;
  spend: (cost: number, label: string, next: ConstructionCompanyState) => void;
}) {
  return (
    <Section
      title="LAND & PROJECT SELECTION"
      copy="Buy parcels and allocate the next site to residential, commercial or industrial development."
    >
      <Image source={land} style={s.sectionImage} />
      <Metric label="Owned parcels" value={`${c.landParcels}`} />
      <Metric label="Current project type" value={c.projectType} />
      <Action
        title="BUY DEVELOPMENT PARCEL"
        copy="$35,000 · +1 land parcel"
        image={land}
        onPress={() =>
          spend(35000, "Development parcel purchased", {
            ...c,
            landParcels: c.landParcels + 1,
          })
        }
      />
      <Action
        title="START RESIDENTIAL PROJECT"
        copy="$25,000 material reserve · $70,000 contract value"
        image={projects}
        onPress={() => {
          spend(25000, "Residential project started", {
            ...c,
            activeProjects: c.activeProjects + 1,
            projectType: "Residential",
            materials: c.materials + 200,
            contractValue: 70000,
          });
        }}
      />
      <Action
        title="START COMMERCIAL PROJECT"
        copy="$45,000 material reserve · $140,000 contract value"
        image={projects}
        onPress={() =>
          spend(45000, "Commercial project started", {
            ...c,
            activeProjects: c.activeProjects + 1,
            projectType: "Commercial",
            materials: c.materials + 350,
            contractValue: 140000,
          })
        }
      />
      <Action
        title="START INDUSTRIAL PROJECT"
        copy="$65,000 material reserve · $220,000 contract value"
        image={projects}
        onPress={() =>
          spend(65000, "Industrial project started", {
            ...c,
            activeProjects: c.activeProjects + 1,
            projectType: "Industrial",
            materials: c.materials + 500,
            contractValue: 220000,
          })
        }
      />
    </Section>
  );
}
function Machinery({
  c,
  cash,
  spend,
}: {
  c: ConstructionCompanyState;
  cash: number;
  spend: (cost: number, label: string, next: ConstructionCompanyState) => void;
}) {
  return (
    <Section
      title="MACHINERY & EQUIPMENT"
      copy="Heavy equipment increases site capacity and reduces project delays."
    >
      <Image source={machinery} style={s.sectionImage} />
      <Metric label="Excavators" value={`${c.excavators}`} />
      <Metric label="Cranes" value={`${c.cranes}`} />
      <Metric label="Concrete mixers" value={`${c.mixers}`} />
      <Action
        title="BUY EXCAVATOR"
        copy="$28,000 · +1 excavator"
        image={machinery}
        onPress={() =>
          spend(28000, "Excavator purchased", {
            ...c,
            excavators: c.excavators + 1,
          })
        }
        disabled={cash < 28000}
      />
      <Action
        title="BUY TOWER CRANE"
        copy="$75,000 · +1 crane"
        image={machinery}
        onPress={() =>
          spend(75000, "Tower crane purchased", { ...c, cranes: c.cranes + 1 })
        }
        disabled={cash < 75000}
      />
      <Action
        title="BUY CONCRETE MIXER"
        copy="$18,000 · +1 mixer"
        image={machinery}
        onPress={() =>
          spend(18000, "Concrete mixer purchased", {
            ...c,
            mixers: c.mixers + 1,
          })
        }
        disabled={cash < 18000}
      />
    </Section>
  );
}
function Projects({
  c,
  update,
  onLedger,
}: {
  c: ConstructionCompanyState;
  update: (x: ConstructionCompanyState) => void;
  onLedger?: (entry: BankLedgerEntry) => void;
}) {
  const tick = () => {
    const r = constructionTick(
      { ...c, materials: Math.max(c.materials - 50, 0) },
      0,
    );
    update(r.company);
    onLedger?.({
      id: `construction-progress-${Date.now()}`,
      kind: "BUSINESS_REVENUE",
      label: "Construction project progress",
      amount: r.cashDelta,
      timestamp: Date.now(),
      detail: `${r.company.progress}% complete`,
    });
  };
  return (
    <Section
      title="PROJECT MANAGEMENT"
      copy="Keep workers, materials and equipment moving before the deadline."
    >
      <Image source={projects} style={s.sectionImage} />
      <Metric label="Progress" value={`${c.progress}%`} />
      <Metric label="Materials on site" value={`${c.materials}`} />
      <Metric label="Workers" value={`${c.workers}`} />
      <Action
        title="RUN NEXT CONSTRUCTION SHIFT"
        copy="Advance labour, materials and project progress"
        image={projects}
        onPress={tick}
        disabled={c.activeProjects < 1}
      />
    </Section>
  );
}
function Contracts({
  c,
  cash,
  update,
  onLedger,
}: {
  c: ConstructionCompanyState;
  cash: number;
  update: (x: ConstructionCompanyState) => void;
  onLedger?: (entry: BankLedgerEntry) => void;
}) {
  const accept = () => {
    if (cash < 10000)
      return Alert.alert(
        "INSUFFICIENT BID RESERVE",
        "Keep $10,000 available for contract bonding.",
      );
    update({
      ...c,
      activeProjects: c.activeProjects + 1,
      contractValue: 90000,
      projectType: "Commercial",
    });
    onLedger?.({
      id: `construction-contract-${Date.now()}`,
      kind: "BUSINESS_REVENUE",
      label: "Private construction contract accepted",
      amount: 0,
      timestamp: Date.now(),
      detail: "$90,000 contract value",
    });
  };
  return (
    <Section
      title="CONTRACTS & EARNINGS"
      copy="Bid for private and government work, then collect when projects complete."
    >
      <Image source={contracts} style={s.sectionImage} />
      <Metric label="Contract value" value={formatCurrency(c.contractValue)} />
      <Metric label="Lifetime revenue" value={formatCurrency(c.revenue)} />
      <Action
        title="ACCEPT PRIVATE CONTRACT"
        copy="$90,000 commercial build · $10,000 bonding reserve"
        image={contracts}
        onPress={accept}
      />
      <Action
        title="ACCEPT GOVERNMENT CONTRACT"
        copy="$180,000 infrastructure build · larger deadline"
        image={contracts}
        onPress={() =>
          update({
            ...c,
            activeProjects: c.activeProjects + 1,
            contractValue: 180000,
            projectType: "Industrial",
          })
        }
      />
    </Section>
  );
}
function Expansion({
  c,
  cash,
  spend,
}: {
  c: ConstructionCompanyState;
  cash: number;
  spend: (cost: number, label: string, next: ConstructionCompanyState) => void;
}) {
  return (
    <Section
      title="EXPANSION & UPGRADES"
      copy="Move from a small contractor to multi-city infrastructure operations."
    >
      <Image source={expansion} style={s.sectionImage} />
      <Metric label="Company stage" value={c.level} />
      <Metric label="Sites" value={`${c.landParcels}`} />
      <Action
        title="OPEN SECOND SITE"
        copy="$80,000 · +2 land parcels"
        image={expansion}
        onPress={() =>
          spend(80000, "Second construction site opened", {
            ...c,
            landParcels: c.landParcels + 2,
          })
        }
        disabled={cash < 80000}
      />
      <Action
        title="BUILD PROJECT OFFICE"
        copy="$120,000 · +4 workers and larger bids"
        image={expansion}
        onPress={() =>
          spend(120000, "Project office built", {
            ...c,
            workers: c.workers + 4,
          })
        }
        disabled={cash < 120000}
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
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionCopy}>{copy}</Text>
      {children}
    </View>
  );
}
function Choice({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.choice, selected && s.choiceSelected]}
    >
      <Text style={s.choiceTitle}>{title}</Text>
      <Text style={selected ? s.check : s.radio}>{selected ? "✓" : "○"}</Text>
    </Pressable>
  );
}
function Action({
  title,
  copy,
  onPress,
  image,
  disabled = false,
}: {
  title: string;
  copy: string;
  onPress: () => void;
  image?: number;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[s.action, disabled && s.disabled]}
    >
      {image && <Image source={image} style={s.actionImage} />}
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
  navButton: {
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
  choice: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 11,
    padding: 13,
    marginTop: 7,
  },
  choiceSelected: { backgroundColor: designSystem.colors.highlight, borderColor: C.blue },
  choiceTitle: { color: C.ink, fontWeight: "900" },
  check: { color: C.blue, fontSize: 20, fontWeight: "900" },
  radio: { color: C.muted, fontSize: 20 },
  preview: {
    backgroundColor: "#FFF8E7",
    borderColor: "#E7C976",
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },
  label: { color: C.amber, fontSize: 9, fontWeight: "900" },
  big: { color: C.ink, fontSize: 24, fontWeight: "900", marginVertical: 5 },
  primary: {
    backgroundColor: C.blue,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
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
  disabled: { opacity: 0.45 },
  success: { color: C.green, fontWeight: "900" },
});
