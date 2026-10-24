import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DEFAULT_TAXI_COMPANY,
  TaxiArea,
  TaxiCompanyState,
  taxiCapacity,
  taxiHourlyEconomics,
  taxiVehicleCount,
} from "../types/taxi";
import { formatCurrency } from "../utils/formatCurrency";
import type { BankLedgerEntry } from "../types/bank";
import { designSystem } from "../theme/designSystem";

type Page =
  "overview" | "setup" | "fleet" | "operations" | "workforce" | "expansion";
type Props = {
  company: TaxiCompanyState | null;
  cash: number;
  onCashChange: React.Dispatch<React.SetStateAction<number>>;
  onChange: React.Dispatch<React.SetStateAction<TaxiCompanyState | null>>;
  onBack: () => void;
  onLedger?: (entry: BankLedgerEntry) => void;
};
const areas: TaxiArea[] = [
  "Central City",
  "Harbor District",
  "Airport Corridor",
];
const C = {
  bg: designSystem.colors.background,
  card: designSystem.colors.card,
  ink: designSystem.colors.heading,
  navy: designSystem.colors.primaryNavy,
  blue: designSystem.colors.primaryBlue,
  sky: designSystem.colors.accentSkyBlue,
  pale: designSystem.colors.highlight,
  muted: designSystem.colors.secondary,
  green: designSystem.colors.success,
  red: designSystem.colors.danger,
  border: designSystem.colors.border,
  gold: designSystem.colors.warning,
};

export default function TaxiCompanyScreen({
  company,
  cash,
  onCashChange,
  onChange,
  onBack,
  onLedger,
}: Props) {
  const [page, setPage] = useState<Page>(
    company?.status === "operating" ? "overview" : "setup",
  );
  const [setupArea, setSetupArea] = useState<TaxiArea>(
    company?.area ?? "Central City",
  );
  const [setupVehicle, setSetupVehicle] = useState<
    "economyTaxis" | "electricTaxis" | "luxuryTaxis"
  >("economyTaxis");
  const current = company ?? { ...DEFAULT_TAXI_COMPANY, area: setupArea };
  const economics = taxiHourlyEconomics(current);
  const update = (next: TaxiCompanyState) => onChange(next);
  const charge = (cost: number, label: string, next: TaxiCompanyState) => {
    if (cash < cost)
      return Alert.alert(
        "INSUFFICIENT CASH",
        `${label} requires ${formatCurrency(cost)}.`,
      );
    onCashChange((value) => value - cost);
    update(next);
    onLedger?.({
      id: `taxi-${Date.now()}`,
      kind: "UPKEEP",
      label: `Taxi · ${label}`,
      amount: -cost,
      timestamp: Date.now(),
      detail: current.name,
    });
  };
  const launch = () => {
    const vehicleKey = setupVehicle;
    const vehicleCost =
      vehicleKey === "economyTaxis"
        ? 8000
        : vehicleKey === "electricTaxis"
          ? 18000
          : 35000;
    if (cash < vehicleCost + 5000)
      return Alert.alert(
        "LAUNCH CAPITAL SHORTFALL",
        `Need ${formatCurrency(vehicleCost + 5000 - cash)} more for the first vehicle and depot license.`,
      );
    const next = {
      ...DEFAULT_TAXI_COMPANY,
      status: "operating" as const,
      area: setupArea,
      [vehicleKey]: 1,
      drivers: 1,
      cashInvested: vehicleCost + 5000,
      lastShiftAt: Date.now(),
    };
    onCashChange((value) => value - vehicleCost - 5000);
    update(next);
    onLedger?.({
      id: `taxi-launch-${Date.now()}`,
      kind: "PURCHASE",
      label: "Taxi company launch capital",
      amount: -(vehicleCost + 5000),
      timestamp: Date.now(),
      detail: `${setupArea} · first vehicle + depot license`,
    });
    setPage("overview");
  };
  const pageTitle =
    page === "setup"
      ? "Taxi Company Setup"
      : page === "fleet"
        ? "Fleet Management"
        : page === "operations"
          ? "Taxi Operations"
          : page === "workforce"
            ? "Drivers & Workforce"
            : page === "expansion"
              ? "Expansion & Areas"
              : "My Taxi Company";
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={onBack}>
            <Text style={styles.back}>‹ BUSINESS DASHBOARD</Text>
          </Pressable>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>T</Text>
            </View>
            <View>
              <Text style={styles.eyebrow}>MOBILITY · TAXI COMPANY</Text>
              <Text style={styles.title}>{pageTitle}</Text>
            </View>
          </View>
          {company?.status === "operating" && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.navScroller}
              contentContainerStyle={styles.navRow}
            >
              {(
                [
                  "overview",
                  "fleet",
                  "operations",
                  "workforce",
                  "expansion",
                ] as Page[]
              ).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setPage(item)}
                  style={[styles.navButton, page === item && styles.navActive]}
                >
                  <Text
                    style={[
                      styles.navText,
                      page === item && styles.navTextActive,
                    ]}
                  >
                    {item.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          {page === "setup" ? (
            <SetupPage
              area={setupArea}
              setArea={setSetupArea}
              vehicle={setupVehicle}
              setVehicle={setSetupVehicle}
              cash={cash}
              onLaunch={launch}
            />
          ) : page === "overview" ? (
            <OverviewPage
              company={current}
              economics={economics}
              setPage={setPage}
            />
          ) : page === "fleet" ? (
            <FleetPage
              company={current}
              cash={cash}
              charge={charge}
              update={update}
            />
          ) : page === "operations" ? (
            <OperationsPage
              company={current}
              economics={economics}
              cash={cash}
              update={update}
              onLedger={onLedger}
            />
          ) : page === "workforce" ? (
            <WorkforcePage company={current} cash={cash} charge={charge} />
          ) : (
            <ExpansionPage company={current} cash={cash} charge={charge} />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
function SetupPage({
  area,
  setArea,
  vehicle,
  setVehicle,
  cash,
  onLaunch,
}: {
  area: TaxiArea;
  setArea: (a: TaxiArea) => void;
  vehicle: "economyTaxis" | "electricTaxis" | "luxuryTaxis";
  setVehicle: (v: "economyTaxis" | "electricTaxis" | "luxuryTaxis") => void;
  cash: number;
  onLaunch: () => void;
}) {
  const costs = {
    economyTaxis: 8000,
    electricTaxis: 18000,
    luxuryTaxis: 35000,
  };
  return (
    <>
      <Section
        title="01 · CHOOSE OPERATING AREA"
        copy="Location controls demand quality and the route network available to your first fleet."
      >
        <View style={styles.choiceGrid}>
          {areas.map((item) => (
            <Choice
              key={item}
              title={item}
              selected={area === item}
              onPress={() => setArea(item)}
            />
          ))}
        </View>
      </Section>
      <Section
        title="02 · BUILD YOUR FIRST FLEET"
        copy="Choose one launch vehicle. You can mix vehicle classes after the company opens."
      >
        <Choice
          title="Economy Taxi"
          copy="$8,000 · 7 rides / shift"
          selected={vehicle === "economyTaxis"}
          onPress={() => setVehicle("economyTaxis")}
        />
        <Choice
          title="Electric Taxi"
          copy="$18,000 · 9 rides / shift · premium demand"
          selected={vehicle === "electricTaxis"}
          onPress={() => setVehicle("electricTaxis")}
        />
        <Choice
          title="Luxury Cab"
          copy="$35,000 · 12 rides / shift · executive demand"
          selected={vehicle === "luxuryTaxis"}
          onPress={() => setVehicle("luxuryTaxis")}
        />
      </Section>
      <View style={styles.preview}>
        <Text style={styles.previewEyebrow}>FINANCIAL PREVIEW</Text>
        <Text style={styles.previewValue}>
          {formatCurrency(costs[vehicle] + 5000)} launch capital
        </Text>
        <Text style={styles.muted}>
          Includes selected vehicle, depot license and launch compliance.
          Wallet: {formatCurrency(cash)}
        </Text>
      </View>
      <Pressable style={styles.primary} onPress={onLaunch}>
        <Text style={styles.primaryText}>CONFIRM & LAUNCH TAXI COMPANY</Text>
      </Pressable>
    </>
  );
}
function OverviewPage({
  company,
  economics,
  setPage,
}: {
  company: TaxiCompanyState;
  economics: ReturnType<typeof taxiHourlyEconomics>;
  setPage: (p: Page) => void;
}) {
  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>LIVE COMPANY OVERVIEW</Text>
        <Text style={styles.heroTitle}>{company.name}</Text>
        <Text style={styles.heroSub}>
          {company.area} · Depot level {company.depotLevel} · Operating
        </Text>
        <Text style={styles.heroProfit}>
          {formatCurrency(economics.net)}/hr
        </Text>
        <Text style={styles.heroSub}>Projected net operating income</Text>
      </View>
      <View style={styles.metricGrid}>
        <Metric
          label="FLEET"
          value={`${taxiVehicleCount(company)} / ${taxiCapacity(company)}`}
        />
        <Metric label="DRIVERS" value={`${company.drivers}`} />
        <Metric label="RIDES COMPLETED" value={`${company.completedRides}`} />
        <Metric
          label="DEMAND INDEX"
          value={`${company.demandIndex.toFixed(2)}x`}
        />
      </View>
      <Section
        title="COMPANY CONTROL CENTER"
        copy="Every department has its own working page. Open a page to take an action, spend cash or change the operating state."
      >
        <Action
          title="FLEET MANAGEMENT"
          copy="Vehicles, condition, maintenance and fleet mix"
          onPress={() => setPage("fleet")}
        />
        <Action
          title="TAXI OPERATIONS"
          copy="Run the next shift, demand and completed rides"
          onPress={() => setPage("operations")}
        />
        <Action
          title="DRIVERS & WORKFORCE"
          copy="Hire drivers and staff the dispatch desk"
          onPress={() => setPage("workforce")}
        />
        <Action
          title="EXPANSION & AREAS"
          copy="Upgrade depot capacity and unlock routes"
          onPress={() => setPage("expansion")}
        />
      </Section>
    </>
  );
}
function FleetPage({
  company,
  cash,
  charge,
  update,
}: {
  company: TaxiCompanyState;
  cash: number;
  charge: (cost: number, label: string, next: TaxiCompanyState) => void;
  update: (next: TaxiCompanyState) => void;
}) {
  const buy = (
    key: "economyTaxis" | "electricTaxis" | "luxuryTaxis",
    cost: number,
    label: string,
  ) => {
    if (taxiVehicleCount(company) >= taxiCapacity(company))
      return Alert.alert(
        "DEPOT FULL",
        "Upgrade the depot before adding more vehicles.",
      );
    charge(cost, label, {
      ...company,
      [key]: company[key] + 1,
      cashInvested: company.cashInvested + cost,
    });
  };
  return (
    <>
      <Section
        title="FLEET MANAGEMENT"
        copy={`${taxiVehicleCount(company)} vehicles active · ${company.fleetCondition.toFixed(0)}% average condition`}
      >
        <Metric
          label="Depot capacity"
          value={`${taxiVehicleCount(company)} / ${taxiCapacity(company)} vehicles`}
        />
        <Metric
          label="Vehicle condition"
          value={`${company.fleetCondition.toFixed(0)}%`}
        />
        <Action
          title="BUY ECONOMY TAXI"
          copy="$8,000 · reliable city routes"
          onPress={() => buy("economyTaxis", 8000, "Economy taxi purchased")}
        />
        <Action
          title="BUY ELECTRIC TAXI"
          copy="$18,000 · premium demand · lower wear"
          onPress={() => buy("electricTaxis", 18000, "Electric taxi purchased")}
        />
        <Action
          title="BUY LUXURY CAB"
          copy="$35,000 · executive routes"
          onPress={() => buy("luxuryTaxis", 35000, "Luxury cab purchased")}
        />
        <Action
          title="SERVICE FULL FLEET"
          copy="$1,500 · restore condition to 100%"
          onPress={() =>
            charge(1500, "Fleet maintenance", {
              ...company,
              fleetCondition: 100,
            })
          }
          disabled={company.fleetCondition >= 100 || cash < 1500}
        />
      </Section>
    </>
  );
}
function OperationsPage({
  company,
  economics,
  cash,
  update,
  onLedger,
}: {
  company: TaxiCompanyState;
  economics: ReturnType<typeof taxiHourlyEconomics>;
  cash: number;
  update: (next: TaxiCompanyState) => void;
  onLedger?: (entry: BankLedgerEntry) => void;
}) {
  const runShift = () => {
    if (!company.drivers)
      return Alert.alert(
        "NO DRIVERS",
        "Hire at least one driver before running a shift.",
      );
    const revenue = Math.round(economics.revenue);
    const expenses = Math.round(economics.expenses);
    update({
      ...company,
      completedRides: company.completedRides + economics.rides,
      fleetCondition: Math.max(
        0,
        company.fleetCondition - Math.max(1, taxiVehicleCount(company) * 0.4),
      ),
      lastShiftAt: Date.now(),
      lastShiftRevenue: revenue,
      lastShiftExpenses: expenses,
    });
    onLedger?.({
      id: `taxi-shift-${Date.now()}`,
      kind: "BUSINESS_REVENUE",
      label: "Taxi shift settlement",
      amount: revenue - expenses,
      timestamp: Date.now(),
      detail: `${economics.rides} rides · revenue ${formatCurrency(revenue)} · expenses ${formatCurrency(expenses)}`,
    });
  };
  return (
    <>
      <Section
        title="TAXI OPERATIONS"
        copy="A shift is a real settlement: rides create revenue, drivers and vehicles create expenses, and fleet condition changes."
      >
        <View style={styles.demand}>
          <Text style={styles.demandValue}>
            {company.demandIndex.toFixed(2)}x
          </Text>
          <Text style={styles.demandText}>
            CURRENT DEMAND INDEX · {company.area}
          </Text>
        </View>
        <Metric
          label="Projected shift revenue"
          value={formatCurrency(economics.revenue)}
        />
        <Metric
          label="Projected shift expenses"
          value={formatCurrency(economics.expenses)}
        />
        <Metric
          label="Net shift result"
          value={formatCurrency(economics.net)}
        />
        <Metric label="Wallet before shift" value={formatCurrency(cash)} />
      </Section>
      <Action
        title="RUN NEXT TAXI SHIFT"
        copy="Complete rides, record revenue and apply operating wear"
        onPress={runShift}
      />
    </>
  );
}
function WorkforcePage({
  company,
  cash,
  charge,
}: {
  company: TaxiCompanyState;
  cash: number;
  charge: (cost: number, label: string, next: TaxiCompanyState) => void;
}) {
  return (
    <Section
      title="DRIVERS & WORKFORCE"
      copy="Drivers convert fleet capacity into completed rides. Payroll is included in every shift expense."
    >
      <Metric label="Active drivers" value={`${company.drivers}`} />
      <Metric
        label="Recommended drivers"
        value={`${taxiVehicleCount(company)}`}
      />
      <Action
        title="HIRE DRIVER"
        copy="$2,500 onboarding · adds one active driver"
        onPress={() =>
          charge(2500, "Taxi driver hired", {
            ...company,
            drivers: company.drivers + 1,
            cashInvested: company.cashInvested + 2500,
          })
        }
        disabled={cash < 2500 || company.drivers >= taxiCapacity(company)}
      />
      <Action
        title="HIRE DISPATCH COORDINATOR"
        copy="$6,000 · demand index +0.10"
        onPress={() =>
          charge(6000, "Dispatch coordinator hired", {
            ...company,
            demandIndex: Math.min(1.5, company.demandIndex + 0.1),
            cashInvested: company.cashInvested + 6000,
          })
        }
        disabled={cash < 6000}
      />
    </Section>
  );
}
function ExpansionPage({
  company,
  cash,
  charge,
}: {
  company: TaxiCompanyState;
  cash: number;
  charge: (cost: number, label: string, next: TaxiCompanyState) => void;
}) {
  const next =
    company.depotLevel === 1
      ? { level: 2 as const, cost: 25000, area: "Harbor District" as TaxiArea }
      : company.depotLevel === 2
        ? {
            level: 3 as const,
            cost: 75000,
            area: "Airport Corridor" as TaxiArea,
          }
        : null;
  return (
    <Section
      title="EXPANSION & AREAS"
      copy="Scale the depot, increase fleet capacity and unlock a larger service area."
    >
      <Metric label="Current area" value={company.area} />
      <Metric
        label="Depot level"
        value={`${company.depotLevel} · capacity ${taxiCapacity(company)}`}
      />
      {next ? (
        <Action
          title={`EXPAND TO DEPOT LEVEL ${next.level}`}
          copy={`${formatCurrency(next.cost)} · unlocks ${next.area} routes`}
          onPress={() =>
            charge(next.cost, `Depot expanded to level ${next.level}`, {
              ...company,
              depotLevel: next.level,
              expansionLevel: next.level,
              area: next.area,
            })
          }
          disabled={cash < next.cost}
        />
      ) : (
        <Text style={styles.success}>MAXIMUM DEPOT LEVEL REACHED</Text>
      )}
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
  disabled = false,
}: {
  title: string;
  copy: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.action, disabled && styles.disabled]}
    >
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
  safe: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 140 },
  back: { color: C.blue, fontWeight: "900", marginBottom: 12 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  eyebrow: {
    color: C.blue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: { color: C.ink, fontSize: 25, fontWeight: "900", marginTop: 3 },
  hero: {
    backgroundColor: C.navy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  heroEyebrow: {
    color: C.sky,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroTitle: { color: "#FFFFFF", fontSize: 23, fontWeight: "900", marginTop: 8 },
  heroSub: { color: "#E2E8F0", marginTop: 5 },
  heroProfit: { color: "#FFFFFF", fontSize: 29, fontWeight: "900", marginTop: 18 },
  navScroller: { flexGrow: 0, flexShrink: 0, marginBottom: 12 },
  navRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 2 },
  navButton: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 9,
    minHeight: 40,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  navActive: { backgroundColor: C.blue, borderColor: C.blue },
  navText: { color: C.muted, fontSize: 9, fontWeight: "900" },
  navTextActive: { color: "#FFFFFF" },
  section: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 17,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  sectionCopy: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 8,
  },
  choiceGrid: { gap: 8 },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    marginTop: 8,
  },
  choiceSelected: { backgroundColor: C.pale, borderColor: C.blue },
  choiceTitle: { color: C.ink, fontWeight: "800" },
  check: { color: C.blue, fontSize: 20, fontWeight: "900" },
  radio: { color: C.muted, fontSize: 20 },
  preview: {
    backgroundColor: "#FFF8E8",
    borderColor: "#EACB77",
    borderWidth: 1,
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
  },
  previewEyebrow: {
    color: C.gold,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  previewValue: {
    color: C.ink,
    fontSize: 22,
    fontWeight: "900",
    marginVertical: 5,
  },
  primary: {
    backgroundColor: C.blue,
    borderRadius: 13,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  primaryText: { color: "#FFF", fontWeight: "900", fontSize: 12 },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  metric: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
  },
  metricLabel: { color: C.muted, fontSize: 9, fontWeight: "900" },
  metricValue: { color: C.ink, fontSize: 16, fontWeight: "900", marginTop: 5, flexShrink: 1 },
  action: {
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  actionTitle: { color: C.blue, fontWeight: "900", fontSize: 12 },
  muted: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 3 },
  disabled: { opacity: 0.45 },
  demand: {
    backgroundColor: C.pale,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  demandValue: { color: C.blue, fontSize: 27, fontWeight: "900" },
  demandText: { color: C.muted, fontSize: 10, fontWeight: "900", marginTop: 3 },
  success: { color: C.green, fontWeight: "900", paddingVertical: 15 },
});
