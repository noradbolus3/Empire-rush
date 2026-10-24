import { designSystem } from "../theme/designSystem";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  DEFAULT_SHIPPING_COMPANY,
  ShippingCity,
  ShippingCompanyState,
  shippingEconomics,
  shippingFleetCapacity,
  shippingLevelFor,
  shippingVehicleCount,
} from "../types/shipping";
import type { BankLedgerEntry } from "../types/bank";
import { formatCurrency } from "../utils/formatCurrency";
import { SpecializedBusinessShell } from "../components/business/SpecializedBusinessShell";

type Page =
  "overview" | "setup" | "fleet" | "shipments" | "staff" | "expansion";
type Props = {
  company: ShippingCompanyState | null;
  cash: number;
  onCashChange: React.Dispatch<React.SetStateAction<number>>;
  onChange: React.Dispatch<React.SetStateAction<ShippingCompanyState | null>>;
  onBack: () => void;
  onLedger?: (entry: BankLedgerEntry) => void;
};
const cities: ShippingCity[] = [
  "Central Hub",
  "Harbor Port",
  "Airport Logistics Zone",
];
const C = {
  bg: designSystem.colors.surfaceLight,
  card: '#FFFFFF',
  ink: designSystem.colors.textPrimary,
  blue: designSystem.colors.primaryBlue,
  pale: designSystem.colors.highlight,
  muted: designSystem.colors.textSecondary,
  green: designSystem.colors.success,
  orange: designSystem.colors.warning,
  border: designSystem.colors.border,
  red: designSystem.colors.danger,
};
const shippingDashboard = require("../../assets/shipping/shipping-dashboard.webp");
const shippingFleet = require("../../assets/shipping/shipping-fleet.webp");
const shippingShipments = require("../../assets/shipping/shipping-shipments.webp");
const shippingStaff = require("../../assets/shipping/shipping-staff.webp");
const shippingExpansion = require("../../assets/shipping/shipping-expansion.webp");

export default function ShippingCompanyScreen({
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
  const [setupCity, setSetupCity] = useState<ShippingCity>(
    company?.city ?? "Central Hub",
  );
  const [setupFleet, setSetupFleet] = useState<"van" | "truck">("van");
  const current = company ?? { ...DEFAULT_SHIPPING_COMPANY, city: setupCity };
  const economy = shippingEconomics(current);
  const update = (next: ShippingCompanyState) =>
    onChange({ ...next, level: shippingLevelFor(next) });
  const charge = (cost: number, label: string, next: ShippingCompanyState) => {
    if (cash < cost)
      return Alert.alert(
        "INSUFFICIENT CASH",
        `${label} requires ${formatCurrency(cost)}.`,
      );
    onCashChange((value) => value - cost);
    update(next);
    onLedger?.({
      id: `shipping-${Date.now()}`,
      kind: "UPKEEP",
      label: `Shipping · ${label}`,
      amount: -cost,
      timestamp: Date.now(),
      detail: current.name,
    });
  };
  const launch = () => {
    const vehicleCost = setupFleet === "van" ? 12000 : 38000;
    const total = vehicleCost + 10000;
    if (cash < total)
      return Alert.alert(
        "LAUNCH CAPITAL SHORTFALL",
        `Need ${formatCurrency(total - cash)} more for warehouse registration and the first vehicle.`,
      );
    const next = {
      ...DEFAULT_SHIPPING_COMPANY,
      status: "operating" as const,
      city: setupCity,
      vans: setupFleet === "van" ? 1 : 0,
      trucks: setupFleet === "truck" ? 1 : 0,
      drivers: 1,
      cashInvested: total,
      lastShiftAt: Date.now(),
    };
    onCashChange((value) => value - total);
    update(next);
    onLedger?.({
      id: `shipping-launch-${Date.now()}`,
      kind: "PURCHASE",
      label: "Shipping company launch capital",
      amount: -total,
      timestamp: Date.now(),
      detail: `${setupCity} · warehouse registration + first ${setupFleet}`,
    });
    setPage("overview");
  };
  return (
    <SpecializedBusinessShell
      eyebrow="LOGISTICS · SHIPPING COMPANY"
      title={company?.status === "operating" ? "Shipping Dashboard" : "Shipping Company Setup"}
      monogram="S"
      onBack={onBack}
      tabs={company?.status === "operating" ? [
        { id: "overview", label: "DASHBOARD" },
        { id: "fleet", label: "FLEET" },
        { id: "shipments", label: "SHIPMENTS" },
        { id: "staff", label: "STAFF" },
        { id: "expansion", label: "EXPANSION" },
      ] : []}
      activeTab={page}
      onTabChange={(id) => setPage(id as Page)}
    >
          {page === "setup" ? (
            <SetupPage
              city={setupCity}
              setCity={setSetupCity}
              fleet={setupFleet}
              setFleet={setSetupFleet}
              cash={cash}
              launch={launch}
            />
          ) : page === "overview" ? (
            <OverviewPage
              company={current}
              economy={economy}
              setPage={setPage}
            />
          ) : page === "fleet" ? (
            <FleetPage company={current} cash={cash} charge={charge} />
          ) : page === "shipments" ? (
            <ShipmentsPage
              company={current}
              cash={cash}
              update={update}
              onLedger={onLedger}
            />
          ) : page === "staff" ? (
            <StaffPage company={current} cash={cash} charge={charge} />
          ) : (
            <ExpansionPage company={current} cash={cash} charge={charge} />
          )}
    </SpecializedBusinessShell>
  );
}
function SetupPage({
  city,
  setCity,
  fleet,
  setFleet,
  cash,
  launch,
}: {
  city: ShippingCity;
  setCity: (value: ShippingCity) => void;
  fleet: "van" | "truck";
  setFleet: (value: "van" | "truck") => void;
  cash: number;
  launch: () => void;
}) {
  const total = fleet === "van" ? 22000 : 48000;
  return (
    <>
      <Section
        title="01 · CHOOSE OPERATING CITY"
        copy="The city determines your first-mile network and the warehouse routes you can unlock."
      >
        <View style={styles.grid}>
          {cities.map((item) => (
            <Choice
              key={item}
              title={item}
              selected={item === city}
              onPress={() => setCity(item)}
            />
          ))}
        </View>
      </Section>
      <Section
        title="02 · CHOOSE FIRST DELIVERY ASSET"
        copy="Shipping is driven by cargo capacity, warehouse throughput and delivery reliability."
      >
        <Choice
          title="Delivery Van"
          copy="$12,000 · 120 cargo units · local routes"
          selected={fleet === "van"}
          onPress={() => setFleet("van")}
        />
        <Choice
          title="Medium Truck"
          copy="$38,000 · 500 cargo units · bulk routes"
          selected={fleet === "truck"}
          onPress={() => setFleet("truck")}
        />
      </Section>
      <View style={styles.preview}>
        <Text style={styles.previewEyebrow}>LAUNCH CAPITAL</Text>
        <Text style={styles.previewValue}>{formatCurrency(total)}</Text>
        <Text style={styles.muted}>
          Includes first vehicle, warehouse registration and compliance reserve.
          Wallet: {formatCurrency(cash)}
        </Text>
      </View>
      <Pressable style={styles.primary} onPress={launch}>
        <Text style={styles.primaryText}>
          CONFIRM & LAUNCH SHIPPING COMPANY
        </Text>
      </Pressable>
    </>
  );
}
function OverviewPage({
  company,
  economy,
  setPage,
}: {
  company: ShippingCompanyState;
  economy: ReturnType<typeof shippingEconomics>;
  setPage: (page: Page) => void;
}) {
  return (
    <>
      <Image source={shippingDashboard} style={styles.pageImage} />
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>
          SHIPPING DASHBOARD · {company.level.toUpperCase()}
        </Text>
        <Text style={styles.heroTitle}>{company.name}</Text>
        <Text style={styles.heroSub}>
          {company.city} · Warehouse L{company.warehouseLevel} · {company.level}
        </Text>
        <Text style={styles.heroProfit}>
          {formatCurrency(company.totalIncome)}
        </Text>
        <Text style={styles.heroSub}>Total delivery income</Text>
      </View>
      <View style={styles.metrics}>
        <Metric label="AVAILABLE CASH" value="See wallet" />
        <Metric label="ACTIVE SHIPMENTS" value={`${economy.active}`} />
        <Metric
          label="FLEET STATUS"
          value={`${company.fleetCondition.toFixed(0)}%`}
        />
        <Metric
          label="PENDING CARGO"
          value={`${company.cargoStored.toLocaleString()} units`}
        />
      </View>
      <Section
        title="OPERATING SNAPSHOT"
        copy="Shipments, warehouses and cargo—not taxi rides—drive this company."
      >
        <Metric
          label="Delivery net / shift"
          value={formatCurrency(economy.net)}
        />
        <Metric
          label="Fleet capacity"
          value={`${shippingFleetCapacity(company).toLocaleString()} cargo units`}
        />
        <Metric
          label="Completed deliveries"
          value={`${company.completedDeliveries}`}
        />
        <Action
          title="OPEN SHIPMENT OPERATIONS"
          copy="Accept orders, assign vehicles and deliver cargo"
          onPress={() => setPage("shipments")}
        />
        <Action
          title="OPEN FLEET MANAGEMENT"
          copy="Vehicles, capacity, fuel and maintenance"
          onPress={() => setPage("fleet")}
        />
        <Action
          title="OPEN EMPLOYEES & MANAGEMENT"
          copy="Drivers, warehouse staff and dispatchers"
          onPress={() => setPage("staff")}
        />
        <Action
          title="OPEN EXPANSION & UPGRADES"
          copy="Warehouse levels, routes and city network"
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
}: {
  company: ShippingCompanyState;
  cash: number;
  charge: (cost: number, label: string, next: ShippingCompanyState) => void;
}) {
  const buy = (kind: "vans" | "trucks", cost: number, label: string) =>
    charge(cost, label, {
      ...company,
      [kind]: company[kind] + 1,
      cashInvested: company.cashInvested + cost,
    });
  return (
    <Section
      title="FLEET MANAGEMENT"
      copy="Delivery vans and trucks define cargo capacity, routes and operating cost."
    >
      <Image source={shippingFleet} style={styles.pageImage} />
      <Metric
        label="Vehicle availability"
        value={`${shippingVehicleCount(company)} vehicles`}
      />
      <Metric
        label="Cargo capacity"
        value={`${shippingFleetCapacity(company).toLocaleString()} units`}
      />
      <Metric
        label="Fuel / maintenance condition"
        value={`${company.fleetCondition.toFixed(0)}%`}
      />
      <Action
        title="BUY DELIVERY VAN"
        copy="$12,000 · +120 cargo units · local delivery"
        onPress={() => buy("vans", 12000, "Delivery van purchased")}
      />
      <Action
        title="BUY MEDIUM TRUCK"
        copy="$38,000 · +500 cargo units · bulk delivery"
        onPress={() => buy("trucks", 38000, "Medium truck purchased")}
      />
      <Action
        title="SERVICE FLEET"
        copy="$2,500 · restore fleet condition to 100%"
        onPress={() =>
          charge(2500, "Fleet service", { ...company, fleetCondition: 100 })
        }
        disabled={cash < 2500 || company.fleetCondition >= 100}
      />
    </Section>
  );
}
function ShipmentsPage({
  company,
  cash,
  update,
  onLedger,
}: {
  company: ShippingCompanyState;
  cash: number;
  update: (next: ShippingCompanyState) => void;
  onLedger?: (entry: BankLedgerEntry) => void;
}) {
  const accept = () => {
    const cargo = 80;
    if (company.cargoStored + cargo > company.warehouseCapacity)
      return Alert.alert(
        "WAREHOUSE FULL",
        "Upgrade the warehouse before accepting more cargo.",
      );
    const shipment = {
      id: `shipment-${Date.now()}`,
      customer: "Northstar Retail Network",
      cargoUnits: cargo,
      reward: 420,
      status: "pending" as const,
      route: company.city,
      createdAt: Date.now(),
    };
    update({
      ...company,
      cargoStored: company.cargoStored + cargo,
      shipments: [shipment, ...company.shipments],
    });
  };
  const assign = () => {
    const pending = company.shipments.find((item) => item.status === "pending");
    if (!pending)
      return Alert.alert(
        "NO PENDING SHIPMENT",
        "Accept a delivery order first.",
      );
    if (!company.drivers || !shippingVehicleCount(company))
      return Alert.alert(
        "NO DELIVERY CAPACITY",
        "Hire a driver and own a vehicle before assigning cargo.",
      );
    update({
      ...company,
      shipments: company.shipments.map((item) =>
        item.id === pending.id
          ? {
              ...item,
              status: "in_transit",
              assignedVehicle: company.trucks ? "Medium truck" : "Delivery van",
            }
          : item,
      ),
    });
  };
  const deliver = () => {
    const active = company.shipments.find(
      (item) => item.status === "in_transit",
    );
    if (!active)
      return Alert.alert(
        "NO SHIPMENT IN TRANSIT",
        "Assign a pending shipment first.",
      );
    const revenue = active.reward;
    const next = {
      ...company,
      cargoStored: Math.max(0, company.cargoStored - active.cargoUnits),
      completedDeliveries: company.completedDeliveries + 1,
      totalIncome: company.totalIncome + revenue,
      shipments: company.shipments.map((item) =>
        item.id === active.id
          ? { ...item, status: "delivered" as const }
          : item,
      ),
      lastShiftRevenue: revenue,
      lastShiftAt: Date.now(),
    };
    update(next);
    onLedger?.({
      id: `shipping-delivery-${Date.now()}`,
      kind: "BUSINESS_REVENUE",
      label: "Shipment delivered",
      amount: revenue,
      timestamp: Date.now(),
      detail: `${active.customer} · ${active.cargoUnits} cargo units`,
    });
  };
  const active = company.shipments.filter(
    (item) => item.status !== "delivered",
  );
  return (
    <Section
      title="SHIPMENT OPERATIONS"
      copy="Accept delivery orders, stage cargo, assign a vehicle and complete delivery. Every shipment has a visible status."
    >
      <Image source={shippingShipments} style={styles.pageImage} />
      <Metric
        label="Warehouse cargo"
        value={`${company.cargoStored.toLocaleString()} / ${company.warehouseCapacity.toLocaleString()} units`}
      />
      <Metric label="Open shipments" value={`${active.length}`} />
      {active.slice(0, 3).map((shipment) => (
        <View key={shipment.id} style={styles.shipment}>
          <View style={{ flex: 1 }}>
            <Text style={styles.shipmentTitle}>{shipment.customer}</Text>
            <Text style={styles.muted}>
              {shipment.route} · {shipment.cargoUnits} cargo units ·{" "}
              {formatCurrency(shipment.reward)}
            </Text>
          </View>
          <Text style={styles.status}>{shipment.status.toUpperCase()}</Text>
        </View>
      ))}
      <Action
        title="ACCEPT DELIVERY ORDER"
        copy="+80 cargo units · $420 delivery reward"
        onPress={accept}
      />
      <Action
        title="ASSIGN SHIPMENT TO FLEET"
        copy="Move pending cargo into transit"
        onPress={assign}
      />
      <Action
        title="COMPLETE DELIVERY"
        copy="Deliver the active route and collect reward"
        onPress={deliver}
      />
    </Section>
  );
}
function StaffPage({
  company,
  cash,
  charge,
}: {
  company: ShippingCompanyState;
  cash: number;
  charge: (cost: number, label: string, next: ShippingCompanyState) => void;
}) {
  return (
    <Section
      title="EMPLOYEES & MANAGEMENT"
      copy="Shipping depends on drivers, warehouse staff and dispatch coordination."
    >
      <Image source={shippingStaff} style={styles.pageImage} />
      <Metric label="Drivers" value={`${company.drivers}`} />
      <Metric label="Warehouse staff" value={`${company.warehouseStaff}`} />
      <Metric label="Dispatchers" value={`${company.dispatchers}`} />
      <Action
        title="HIRE DRIVER"
        copy="$2,500 onboarding · enables assigned deliveries"
        onPress={() =>
          charge(2500, "Driver hired", {
            ...company,
            drivers: company.drivers + 1,
          })
        }
        disabled={cash < 2500}
      />
      <Action
        title="HIRE WAREHOUSE STAFF"
        copy="$2,000 onboarding · improves cargo throughput"
        onPress={() =>
          charge(2000, "Warehouse staff hired", {
            ...company,
            warehouseStaff: company.warehouseStaff + 1,
          })
        }
        disabled={cash < 2000}
      />
      <Action
        title="HIRE DISPATCHER"
        copy="$5,000 onboarding · improves route reliability"
        onPress={() =>
          charge(5000, "Dispatcher hired", {
            ...company,
            dispatchers: company.dispatchers + 1,
            demandIndex: Math.min(1.5, company.demandIndex + 0.08),
          })
        }
        disabled={cash < 5000}
      />
    </Section>
  );
}
function ExpansionPage({
  company,
  cash,
  charge,
}: {
  company: ShippingCompanyState;
  cash: number;
  charge: (cost: number, label: string, next: ShippingCompanyState) => void;
}) {
  const next =
    company.warehouseLevel === 1
      ? { level: 2 as const, capacity: 3000, cost: 25000 }
      : company.warehouseLevel === 2
        ? { level: 3 as const, capacity: 10000, cost: 75000 }
        : company.warehouseLevel === 3
          ? { level: 4 as const, capacity: 30000, cost: 200000 }
          : null;
  return (
    <Section
      title="EXPANSION & UPGRADES"
      copy="Grow from local deliveries to a regional distribution network."
    >
      <Image source={shippingExpansion} style={styles.pageImage} />
      <Metric label="Business level" value={company.level} />
      <Metric
        label="Warehouse"
        value={`Level ${company.warehouseLevel} · ${company.warehouseCapacity.toLocaleString()} units`}
      />
      {next ? (
        <Action
          title={`UPGRADE WAREHOUSE TO LEVEL ${next.level}`}
          copy={`${formatCurrency(next.cost)} · capacity becomes ${next.capacity.toLocaleString()} cargo units`}
          onPress={() =>
            charge(next.cost, `Warehouse upgraded to level ${next.level}`, {
              ...company,
              warehouseLevel: next.level,
              warehouseCapacity: next.capacity,
            })
          }
          disabled={cash < next.cost}
        />
      ) : (
        <Text style={styles.success}>
          ENTERPRISE WAREHOUSE NETWORK COMPLETE
        </Text>
      )}
      <Action
        title="UNLOCK NEW CITY ROUTE"
        copy="$45,000 · activate a second regional route"
        onPress={() =>
          charge(45000, "New city route unlocked", {
            ...company,
            demandIndex: Math.min(1.5, company.demandIndex + 0.12),
          })
        }
        disabled={cash < 45000}
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
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 120 },
  back: { color: C.blue, fontWeight: "900", marginBottom: 20 },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
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
  nav: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 14 },
  navButton: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  navSelected: { backgroundColor: C.pale, borderColor: C.blue },
  navText: { color: C.muted, fontSize: 9, fontWeight: "900" },
  navTextSelected: { color: C.blue },
  hero: {
    backgroundColor: C.blue,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  heroEyebrow: {
    color: "#DCEAFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroTitle: { color: "#FFF", fontSize: 26, fontWeight: "900", marginTop: 8 },
  heroSub: { color: "#DCEAFF", marginTop: 5 },
  heroProfit: { color: "#FFF", fontSize: 30, fontWeight: "900", marginTop: 20 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
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
  metricValue: { color: C.ink, fontSize: 17, fontWeight: "900", marginTop: 5 },
  section: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 17,
    padding: 16,
    marginBottom: 14,
  },
  pageImage: {
    width: "100%",
    height: 148,
    borderRadius: 14,
    marginBottom: 12,
    resizeMode: "cover",
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
  grid: { gap: 8 },
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
    color: C.orange,
    fontSize: 10,
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
    borderRadius: 13,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  primaryText: { color: "#FFF", fontWeight: "900", fontSize: 12 },
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
  shipment: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  shipmentTitle: { color: C.ink, fontWeight: "900" },
  status: { color: C.blue, fontSize: 9, fontWeight: "900" },
  success: { color: C.green, fontWeight: "900", paddingVertical: 15 },
});
