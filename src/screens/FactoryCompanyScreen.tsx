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
  DEFAULT_FACTORY_COMPANY,
  FACTORY_TYPE_INFO,
  FactoryCompanyState,
  FactoryLocation,
  FactoryType,
  factoryEconomics,
  factoryLevelFor,
  factoryProductionCapacity,
  factoryUnitsLabel,
} from "../types/factory";
import { formatCurrency } from "../utils/formatCurrency";
import { SpecializedBusinessShell } from "../components/business/SpecializedBusinessShell";

type Page =
  "dashboard" | "setup" | "machinery" | "employees" | "inventory" | "expansion";
type Props = {
  company: FactoryCompanyState | null;
  cash: number;
  onCashChange: React.Dispatch<React.SetStateAction<number>>;
  onChange: React.Dispatch<React.SetStateAction<FactoryCompanyState | null>>;
  onBack: () => void;
  onLedger?: (entry: BankLedgerEntry) => void;
};
const C = {
  bg: designSystem.colors.surfaceLight,
  card: '#FFFFFF',
  ink: designSystem.colors.textPrimary,
  blue: designSystem.colors.primaryBlue,
  steel: designSystem.colors.textSecondary,
  muted: designSystem.colors.textSecondary,
  border: designSystem.colors.border,
  amber: designSystem.colors.warning,
  green: designSystem.colors.success,
  red: designSystem.colors.danger,
};
const building = require("../../assets/factory/factory-building.jpg");
const line = require("../../assets/factory/production-line.jpg");
const machines = require("../../assets/factory/machinery.jpg");
const warehouse = require("../../assets/factory/warehouse-inventory.jpg");
const workers = require("../../assets/factory/factory-workers.jpg");
const types: FactoryType[] = [
  "Consumer Goods",
  "Industrial Parts",
  "Electronics",
];
const locations: FactoryLocation[] = [
  "Central Industrial Park",
  "Harbor Manufacturing Zone",
  "Tech Corridor",
];

export default function FactoryCompanyScreen({
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
  const [setupType, setSetupType] = useState<FactoryType>(
    company?.factoryType ?? "Consumer Goods",
  );
  const [setupLocation, setSetupLocation] = useState<FactoryLocation>(
    company?.location ?? "Central Industrial Park",
  );
  const current = company ?? {
    ...DEFAULT_FACTORY_COMPANY,
    factoryType: setupType,
    location: setupLocation,
  };
  const economics = factoryEconomics(current);
  const update = (next: FactoryCompanyState) =>
    onChange({ ...next, level: factoryLevelFor(next) });
  const spend = (cost: number, label: string, next: FactoryCompanyState) => {
    if (cash < cost)
      return Alert.alert(
        "INSUFFICIENT CAPITAL",
        `${label} requires ${formatCurrency(cost)}.`,
      );
    onCashChange((value) => value - cost);
    update(next);
    onLedger?.({
      id: `factory-${Date.now()}`,
      kind: "UPKEEP",
      label: `Factory · ${label}`,
      amount: -cost,
      timestamp: Date.now(),
      detail: current.name,
    });
  };
  const launchCost =
    setupType === "Electronics"
      ? 95000
      : setupType === "Industrial Parts"
        ? 70000
        : 45000;
  const launch = () => {
    if (cash < launchCost)
      return Alert.alert(
        "SETUP CAPITAL SHORTFALL",
        `Need ${formatCurrency(launchCost - cash)} more for the building, first line and compliance reserve.`,
      );
    const next = {
      ...DEFAULT_FACTORY_COMPANY,
      status: "operating" as const,
      factoryType: setupType,
      location: setupLocation,
      machineLines: 1,
      workers: 2,
      rawMaterials: 300,
      cashInvested: launchCost,
      lastProductionAt: Date.now(),
    };
    onCashChange((value) => value - launchCost);
    update(next);
    onLedger?.({
      id: `factory-launch-${Date.now()}`,
      kind: "PURCHASE",
      label: "Factory company launch capital",
      amount: -launchCost,
      timestamp: Date.now(),
      detail: `${setupType} · ${setupLocation}`,
    });
    setPage("dashboard");
  };
  return (
    <SpecializedBusinessShell
      eyebrow="MANUFACTURING · FACTORY COMPANY"
      title={company?.status === "operating" ? "Factory Dashboard" : "Factory Selection & Setup"}
      monogram="F"
      onBack={onBack}
      tabs={company?.status === "operating" ? [
        { id: "dashboard", label: "DASHBOARD" },
        { id: "machinery", label: "MACHINERY" },
        { id: "employees", label: "STAFF" },
        { id: "inventory", label: "INVENTORY" },
        { id: "expansion", label: "EXPANSION" },
      ] : []}
      activeTab={page}
      onTabChange={(id) => setPage(id as Page)}
    >
          {page === "setup" ? (
            <Setup
              type={setupType}
              setType={setSetupType}
              location={setupLocation}
              setLocation={setSetupLocation}
              cash={cash}
              cost={launchCost}
              launch={launch}
            />
          ) : page === "dashboard" ? (
            <Dashboard
              factory={current}
              economics={economics}
              setPage={setPage}
            />
          ) : page === "machinery" ? (
            <Machinery factory={current} cash={cash} spend={spend} />
          ) : page === "employees" ? (
            <Employees factory={current} cash={cash} spend={spend} />
          ) : page === "inventory" ? (
            <Inventory
              factory={current}
              cash={cash}
              update={update}
              onLedger={onLedger}
            />
          ) : (
            <Expansion factory={current} cash={cash} spend={spend} />
          )}
    </SpecializedBusinessShell>
  );
}
function Setup({
  type,
  setType,
  location,
  setLocation,
  cash,
  cost,
  launch,
}: {
  type: FactoryType;
  setType: (v: FactoryType) => void;
  location: FactoryLocation;
  setLocation: (v: FactoryLocation) => void;
  cash: number;
  cost: number;
  launch: () => void;
}) {
  return (
    <>
      <Image source={building} style={styles.cover} />
      <Section
        title="01 · FACTORY TYPE"
        copy="Choose the product category that determines raw-material needs, unit value and demand."
      >
        {types.map((item) => (
          <Choice
            key={item}
            title={item}
            copy={`${FACTORY_TYPE_INFO[item].product} · $${FACTORY_TYPE_INFO[item].unitValue} per unit`}
            selected={item === type}
            onPress={() => setType(item)}
          />
        ))}
      </Section>
      <Section
        title="02 · LOCATION"
        copy="Location affects the industrial network and future expansion routes."
      >
        {locations.map((item) => (
          <Choice
            key={item}
            title={item}
            selected={item === location}
            onPress={() => setLocation(item)}
          />
        ))}
      </Section>
      <View style={styles.preview}>
        <Text style={styles.previewLabel}>SETUP INVESTMENT</Text>
        <Text style={styles.previewValue}>{formatCurrency(cost)}</Text>
        <Text style={styles.muted}>
          First building, production line and compliance reserve. Wallet:{" "}
          {formatCurrency(cash)}
        </Text>
      </View>
      <Pressable style={styles.primary} onPress={launch}>
        <Text style={styles.primaryText}>CONFIRM & LAUNCH FACTORY</Text>
      </Pressable>
    </>
  );
}
function Dashboard({
  factory,
  economics,
  setPage,
}: {
  factory: FactoryCompanyState;
  economics: ReturnType<typeof factoryEconomics>;
  setPage: (p: Page) => void;
}) {
  return (
    <>
      <Image source={building} style={styles.cover} />
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>
          FACTORY DASHBOARD · {factory.level.toUpperCase()}
        </Text>
        <Text style={styles.heroTitle}>{factory.name}</Text>
        <Text style={styles.heroSub}>
          {factory.factoryType} · {factory.location} · Building L
          {factory.buildingLevel}
        </Text>
        <Text style={styles.heroValue}>{formatCurrency(economics.net)}</Text>
        <Text style={styles.heroSub}>Estimated net / production shift</Text>
      </View>
      <View style={styles.metrics}>
        <Metric
          label="PRODUCTION CAPACITY"
          value={`${Math.floor(factoryProductionCapacity(factory)).toLocaleString()} units`}
        />
        <Metric label="INVENTORY" value={factoryUnitsLabel(factory)} />
        <Metric
          label="MACHINE CONDITION"
          value={`${factory.machineCondition.toFixed(0)}%`}
        />
        <Metric label="WORKFORCE" value={`${factory.workers} workers`} />
      </View>
      <Section
        title="OPERATING SNAPSHOT"
        copy="Production lines convert raw materials into finished goods; inventory and sales create the cash cycle."
      >
        <Metric
          label="Shift revenue"
          value={formatCurrency(economics.revenue)}
        />
        <Metric
          label="Shift expenses"
          value={formatCurrency(economics.expenses)}
        />
        <Metric
          label="Total units made"
          value={`${factory.totalProduction.toLocaleString()}`}
        />
        <Action
          title="MACHINERY & PRODUCTION LINES"
          copy="Buy machines and increase manufacturing capacity"
          onPress={() => setPage("machinery")}
          image={machines}
        />
        <Action
          title="EMPLOYEES & PRODUCTION"
          copy="Hire workers, supervisors and maintenance"
          onPress={() => setPage("employees")}
          image={workers}
        />
        <Action
          title="INVENTORY & SALES"
          copy="Buy raw materials, manufacture and sell products"
          onPress={() => setPage("inventory")}
          image={warehouse}
        />
        <Action
          title="EXPANSION & UPGRADES"
          copy="Larger buildings, automation and multiple lines"
          onPress={() => setPage("expansion")}
          image={line}
        />
      </Section>
    </>
  );
}
function Machinery({
  factory,
  cash,
  spend,
}: {
  factory: FactoryCompanyState;
  cash: number;
  spend: (cost: number, label: string, next: FactoryCompanyState) => void;
}) {
  return (
    <Section
      title="MACHINERY & PRODUCTION LINES"
      copy="Machines define production capacity. Maintenance keeps the line available."
    >
      <Image source={machines} style={styles.sectionImage} />
      <Metric label="Active machine lines" value={`${factory.machineLines}`} />
      <Metric
        label="Capacity / line"
        value={`${factory.machineCapacity} units`}
      />
      <Metric
        label="Total capacity"
        value={`${Math.floor(factoryProductionCapacity(factory)).toLocaleString()} units`}
      />
      <Action
        title="BUY ASSEMBLY LINE"
        copy="$28,000 · +500 production capacity"
        onPress={() =>
          spend(28000, "Assembly line purchased", {
            ...factory,
            machineLines: factory.machineLines + 1,
            cashInvested: factory.cashInvested + 28000,
          })
        }
        disabled={cash < 28000}
      />
      <Action
        title="UPGRADE LINE CONTROLS"
        copy="$45,000 · +25% factory efficiency"
        onPress={() =>
          spend(45000, "Line controls upgraded", {
            ...factory,
            efficiency: Math.min(1.8, factory.efficiency + 0.25),
            cashInvested: factory.cashInvested + 45000,
          })
        }
        disabled={cash < 45000 || factory.efficiency >= 1.8}
      />
      <Action
        title="MAINTAIN MACHINERY"
        copy="$4,500 · restore machine condition"
        onPress={() =>
          spend(4500, "Machinery maintenance", {
            ...factory,
            machineCondition: 100,
          })
        }
        disabled={cash < 4500 || factory.machineCondition >= 100}
      />
    </Section>
  );
}
function Employees({
  factory,
  cash,
  spend,
}: {
  factory: FactoryCompanyState;
  cash: number;
  spend: (cost: number, label: string, next: FactoryCompanyState) => void;
}) {
  return (
    <Section
      title="EMPLOYEES & PRODUCTION"
      copy="People operate the lines, protect uptime and convert capacity into reliable output."
    >
      <Image source={workers} style={styles.sectionImage} />
      <Metric label="Workers" value={`${factory.workers}`} />
      <Metric label="Supervisors" value={`${factory.supervisors}`} />
      <Metric label="Maintenance team" value={`${factory.maintenanceTeam}`} />
      <Action
        title="HIRE PRODUCTION WORKER"
        copy="$2,200 onboarding · +1 production worker"
        onPress={() =>
          spend(2200, "Production worker hired", {
            ...factory,
            workers: factory.workers + 1,
          })
        }
        disabled={cash < 2200}
      />
      <Action
        title="HIRE SUPERVISOR"
        copy="$5,000 onboarding · +1 production supervisor"
        onPress={() =>
          spend(5000, "Production supervisor hired", {
            ...factory,
            supervisors: factory.supervisors + 1,
          })
        }
        disabled={cash < 5000}
      />
      <Action
        title="HIRE MAINTENANCE TEAM"
        copy="$4,000 onboarding · +1 maintenance team"
        onPress={() =>
          spend(4000, "Maintenance team hired", {
            ...factory,
            maintenanceTeam: factory.maintenanceTeam + 1,
          })
        }
        disabled={cash < 4000}
      />
    </Section>
  );
}
function Inventory({
  factory,
  cash,
  update,
  onLedger,
}: {
  factory: FactoryCompanyState;
  cash: number;
  update: (next: FactoryCompanyState) => void;
  onLedger?: (entry: BankLedgerEntry) => void;
}) {
  const info = FACTORY_TYPE_INFO[factory.factoryType];
  const buyRaw = () => {
    const cost = 6000;
    if (cash < cost)
      return Alert.alert("INSUFFICIENT CASH", "Raw materials require $6,000.");
    update({ ...factory, rawMaterials: factory.rawMaterials + 500 });
    onLedger?.({
      id: `factory-raw-${Date.now()}`,
      kind: "PURCHASE",
      label: "Factory raw materials",
      amount: -cost,
      timestamp: Date.now(),
      detail: "+500 raw material units",
    });
  };
  const produce = () => {
    const units = Math.min(
      factory.rawMaterials / info.rawPerUnit,
      factoryProductionCapacity(factory),
      factory.inventoryCapacity - factory.finishedGoods,
    );
    if (units < 1)
      return Alert.alert(
        "LINE CANNOT RUN",
        "Buy raw materials, add machines or clear finished inventory.",
      );
    update({
      ...factory,
      rawMaterials: factory.rawMaterials - units * info.rawPerUnit,
      finishedGoods: factory.finishedGoods + Math.floor(units),
      totalProduction: factory.totalProduction + Math.floor(units),
      lastProductionAt: Date.now(),
    });
  };
  const sell = () => {
    const units = Math.min(factory.finishedGoods, 100);
    if (units < 1)
      return Alert.alert("NO FINISHED GOODS", "Run a production batch first.");
    const revenue = units * info.unitValue * factory.demandIndex;
    update({
      ...factory,
      finishedGoods: factory.finishedGoods - units,
      totalSales: factory.totalSales + revenue,
      lastRevenue: revenue,
    });
    onLedger?.({
      id: `factory-sale-${Date.now()}`,
      kind: "BUSINESS_REVENUE",
      label: "Factory products sold",
      amount: revenue,
      timestamp: Date.now(),
      detail: `${Math.floor(units)} ${info.product}`,
    });
  };
  return (
    <Section
      title="INVENTORY & SALES"
      copy="Raw materials enter the warehouse, production creates finished goods, and sales release cash into the company."
    >
      <Image source={warehouse} style={styles.sectionImage} />
      <Metric
        label="Raw materials"
        value={`${factory.rawMaterials.toFixed(0)} units`}
      />
      <Metric
        label="Finished goods"
        value={`${factory.finishedGoods.toFixed(0)} / ${factory.inventoryCapacity}`}
      />
      <Metric label="Product" value={info.product} />
      <Action
        title="BUY RAW MATERIALS"
        copy="$6,000 · +500 raw material units"
        onPress={buyRaw}
        disabled={cash < 6000}
      />
      <Action
        title="RUN PRODUCTION BATCH"
        copy={`Use available material to make ${info.product}`}
        onPress={produce}
      />
      <Action
        title="SELL FINISHED GOODS"
        copy={`Sell up to 100 units at ${formatCurrency(info.unitValue)} each`}
        onPress={sell}
      />
    </Section>
  );
}
function Expansion({
  factory,
  cash,
  spend,
}: {
  factory: FactoryCompanyState;
  cash: number;
  spend: (cost: number, label: string, next: FactoryCompanyState) => void;
}) {
  const next =
    factory.buildingLevel < 4
      ? {
          level: (factory.buildingLevel + 1) as 2 | 3 | 4,
          capacity: [0, 1000, 3000, 10000, 30000][factory.buildingLevel + 1],
          cost: [0, 0, 35000, 90000, 250000][factory.buildingLevel + 1],
        }
      : null;
  return (
    <Section
      title="EXPANSION & UPGRADES"
      copy="Scale from a workshop to a multi-line industrial manufacturing network."
    >
      <Image source={line} style={styles.sectionImage} />
      <Metric label="Factory level" value={factory.level} />
      <Metric
        label="Building"
        value={`L${factory.buildingLevel} · ${factory.inventoryCapacity.toLocaleString()} inventory capacity`}
      />
      {next ? (
        <Action
          title={`UPGRADE BUILDING TO LEVEL ${next.level}`}
          copy={`${formatCurrency(next.cost)} · inventory capacity becomes ${next.capacity.toLocaleString()}`}
          onPress={() =>
            spend(next.cost, `Factory building upgraded to L${next.level}`, {
              ...factory,
              buildingLevel: next.level,
              inventoryCapacity: next.capacity,
            })
          }
          disabled={cash < next.cost}
        />
      ) : (
        <Text style={styles.success}>MANUFACTURING CONGLOMERATE COMPLETE</Text>
      )}
      <Action
        title="AUTOMATE QUALITY CONTROL"
        copy="$75,000 · +20% efficiency and demand"
        onPress={() =>
          spend(75000, "Quality control automation", {
            ...factory,
            efficiency: Math.min(1.8, factory.efficiency + 0.2),
            demandIndex: Math.min(1.5, factory.demandIndex + 0.1),
          })
        }
        disabled={cash < 75000}
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCopy}>{copy}</Text>
      {children}
    </View>
  );
}
function Choice({
  title,
  copy,
  selected,
  onPress,
}: {
  title: string;
  copy?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.choiceTitle}>{title}</Text>
        {copy && <Text style={styles.muted}>{copy}</Text>}
      </View>
      <Text style={selected ? styles.check : styles.radio}>
        {selected ? "✓" : "○"}
      </Text>
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
      style={[styles.action, disabled && styles.disabled]}
    >
      {image && <Image source={image} style={styles.actionImage} />}
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.muted}>{copy}</Text>
    </Pressable>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 120 },
  back: { color: C.blue, fontWeight: "900", marginBottom: 18 },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#FFF", fontSize: 25, fontWeight: "900" },
  eyebrow: { color: C.blue, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  title: { color: C.ink, fontSize: 24, fontWeight: "900", marginTop: 3 },
  nav: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 12 },
  navButton: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  navSelected: { backgroundColor: "#E7F0FF", borderColor: C.blue },
  navText: { color: C.muted, fontSize: 8, fontWeight: "900" },
  navTextSelected: { color: C.blue },
  cover: { width: "100%", height: 150, borderRadius: 18, marginBottom: 12 },
  hero: {
    backgroundColor: C.ink,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  heroEyebrow: {
    color: "#A5C5D8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroTitle: { color: "#FFF", fontSize: 24, fontWeight: "900", marginTop: 7 },
  heroSub: { color: "#BFD2DF", fontSize: 11, marginTop: 4 },
  heroValue: {
    color: "#55E5B0",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 17,
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
  sectionTitle: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
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
    alignItems: "center",
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 11,
    padding: 12,
    marginTop: 7,
  },
  choiceSelected: { backgroundColor: "#E7F0FF", borderColor: C.blue },
  choiceTitle: { color: C.ink, fontWeight: "800" },
  check: { color: C.blue, fontSize: 20, fontWeight: "900" },
  radio: { color: C.muted, fontSize: 20 },
  preview: {
    backgroundColor: "#FFF8E7",
    borderColor: "#E9CB7A",
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },
  previewLabel: {
    color: C.amber,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  previewValue: {
    color: C.ink,
    fontSize: 23,
    fontWeight: "900",
    marginVertical: 5,
  },
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
  actionImage: { width: "100%", height: 68, borderRadius: 8, marginBottom: 9 },
  actionTitle: { color: C.blue, fontWeight: "900", fontSize: 11 },
  muted: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 3 },
  disabled: { opacity: 0.45 },
  success: { color: C.green, fontWeight: "900", paddingVertical: 14 },
});
