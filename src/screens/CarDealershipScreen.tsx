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
  DEFAULT_DEALERSHIP,
  DealershipState,
  dealershipLevelFor,
  dealershipSellTick,
} from "../types/dealership";
import { formatCurrency } from "../utils/formatCurrency";
import { SpecializedBusinessShell } from "../components/business/SpecializedBusinessShell";

type Page =
  "dashboard" | "showroom" | "inventory" | "sales" | "finance" | "expansion";
type Props = {
  company: DealershipState | null;
  cash: number;
  onCashChange: React.Dispatch<React.SetStateAction<number>>;
  onChange: React.Dispatch<React.SetStateAction<DealershipState | null>>;
  onBack: () => void;
  onLedger?: (entry: BankLedgerEntry) => void;
};
const dashboard = require("../../assets/dealership/dealership-dashboard.jpg");
const showroom = require("../../assets/dealership/showroom-setup.jpg");
const inventory = require("../../assets/dealership/vehicle-inventory.jpg");
const sales = require("../../assets/dealership/sales-customers.jpg");
const finance = require("../../assets/dealership/employees-finance.jpg");
const expansion = require("../../assets/dealership/expansion-network.jpg");
const C = {
  bg: designSystem.colors.surfaceLight,
  ink: designSystem.colors.textPrimary,
  blue: designSystem.colors.primaryBlue,
  muted: designSystem.colors.textSecondary,
  border: designSystem.colors.border,
  card: '#FFFFFF',
  green: designSystem.colors.success,
};
export default function CarDealershipScreen({
  company,
  cash,
  onCashChange,
  onChange,
  onBack,
  onLedger,
}: Props) {
  const [page, setPage] = useState<Page>(
    company?.status === "operating" ? "dashboard" : "showroom",
  );
  const current = company ?? DEFAULT_DEALERSHIP;
  const update = (next: DealershipState) =>
    onChange({ ...next, level: dealershipLevelFor(next) });
  const spend = (cost: number, label: string, next: DealershipState) => {
    if (cash < cost)
      return Alert.alert(
        "INSUFFICIENT CAPITAL",
        `${label} requires ${formatCurrency(cost)}.`,
      );
    onCashChange((v) => v - cost);
    update(next);
    onLedger?.({
      id: `dealership-${Date.now()}`,
      kind: "PURCHASE",
      label: `Dealership · ${label}`,
      amount: -cost,
      timestamp: Date.now(),
      detail: current.name,
    });
  };
  const launch = () => {
    const cost = 75000;
    if (cash < cost)
      return Alert.alert(
        "SHOWROOM CAPITAL SHORTFALL",
        `Need ${formatCurrency(cost - cash)} more.`,
      );
    onCashChange((v) => v - cost);
    update({
      ...DEFAULT_DEALERSHIP,
      status: "operating",
      showroomSize: 1,
      salesStaff: 2,
      cashInvested: cost,
      showroomCapacity: 4,
    });
    setPage("dashboard");
  };
  const buyVehicle = (premium = false) =>
    spend(
      premium ? 42000 : 18000,
      premium ? "Premium vehicle purchased" : "Starter vehicle purchased",
      {
        ...current,
        inventory: current.inventory + 1,
        premiumVehicles: current.premiumVehicles + (premium ? 1 : 0),
      },
    );
  const sellVehicle = () => {
    const r = dealershipSellTick(current);
    if (!r.sold)
      return Alert.alert(
        "NO VEHICLE READY",
        "Purchase inventory before serving the next customer.",
      );
    update(r.dealership);
    onCashChange((v) => v + r.profit);
    onLedger?.({
      id: `dealership-sale-${Date.now()}`,
      kind: "BUSINESS_REVENUE",
      label: "Dealership vehicle sale",
      amount: r.profit,
      timestamp: Date.now(),
      detail: `Revenue ${formatCurrency(r.revenue)}`,
    });
  };
  return (
    <SpecializedBusinessShell
      eyebrow="AUTOMOTIVE · CAR DEALERSHIP"
      title={company ? "Dealership Dashboard" : "Dealership Setup"}
      monogram="M"
      onBack={onBack}
      tabs={company ? [
        { id: "dashboard", label: "DASHBOARD" },
        { id: "showroom", label: "SHOWROOM" },
        { id: "inventory", label: "INVENTORY" },
        { id: "sales", label: "SALES" },
        { id: "finance", label: "FINANCE" },
        { id: "expansion", label: "EXPANSION" },
      ] : []}
      activeTab={page}
      onTabChange={(id) => setPage(id as Page)}
    >
          {!company ? (
            <Setup cash={cash} launch={launch} />
          ) : page === "dashboard" ? (
            <Dashboard c={current} setPage={setPage} />
          ) : page === "showroom" ? (
            <Showroom c={current} spend={spend} />
          ) : page === "inventory" ? (
            <Inventory c={current} buy={buyVehicle} />
          ) : page === "sales" ? (
            <Sales c={current} sell={sellVehicle} />
          ) : page === "finance" ? (
            <Finance c={current} cash={cash} spend={spend} />
          ) : (
            <Expansion c={current} cash={cash} spend={spend} />
          )}
    </SpecializedBusinessShell>
  );
}
function Setup({ cash, launch }: { cash: number; launch: () => void }) {
  return (
    <>
      <Image source={showroom} style={s.cover} />
      <Section
        title="01 · SHOWROOM LAUNCH"
        copy="Choose a location, secure the first floor and open your dealership."
      />
      <Metric label="LAUNCH RESERVE" value={formatCurrency(75000)} />
      <Text style={s.muted}>
        Wallet: {formatCurrency(cash)} · includes showroom fit-out, staff
        onboarding and compliance.
      </Text>
      <Pressable style={s.primary} onPress={launch}>
        <Text style={s.primaryText}>BUILD SHOWROOM & LAUNCH DEALERSHIP</Text>
      </Pressable>
    </>
  );
}
function Dashboard({
  c,
  setPage,
}: {
  c: DealershipState;
  setPage: (p: Page) => void;
}) {
  return (
    <>
      <Image source={dashboard} style={s.cover} />
      <View style={s.hero}>
        <Text style={s.heroEyebrow}>
          DEALERSHIP DASHBOARD · {c.level.toUpperCase()}
        </Text>
        <Text style={s.heroTitle}>{c.name}</Text>
        <Text style={s.heroSub}>
          {c.location} · {c.branches} branches
        </Text>
        <Text style={s.heroValue}>{formatCurrency(c.profit)}</Text>
        <Text style={s.heroSub}>Lifetime dealership profit</Text>
      </View>
      <View style={s.metrics}>
        <Metric label="INVENTORY" value={`${c.inventory}`} />
        <Metric label="TOTAL SALES" value={`${c.totalSales}`} />
        <Metric label="REVENUE" value={formatCurrency(c.revenue)} />
        <Metric
          label="CUSTOMER SATISFACTION"
          value={`${c.customerSatisfaction}%`}
        />
      </View>
      <Section
        title="OPERATING SNAPSHOT"
        copy="Stock vehicles, serve customers and compound showroom profit."
      >
        <Action
          title="SHOWROOM SETUP"
          copy="Grow floor space and display capacity"
          image={showroom}
          onPress={() => setPage("showroom")}
        />
        <Action
          title="VEHICLE INVENTORY"
          copy="Buy cars and manage stock"
          image={inventory}
          onPress={() => setPage("inventory")}
        />
        <Action
          title="SALES & CUSTOMERS"
          copy="Convert enquiries into profitable sales"
          image={sales}
          onPress={() => setPage("sales")}
        />
        <Action
          title="EMPLOYEES & FINANCE"
          copy="Hire sales staff and control finance"
          image={finance}
          onPress={() => setPage("finance")}
        />
        <Action
          title="EXPANSION & UPGRADES"
          copy="Open branches and enter premium markets"
          image={expansion}
          onPress={() => setPage("expansion")}
        />
      </Section>
    </>
  );
}
function Showroom({
  c,
  spend,
}: {
  c: DealershipState;
  spend: (cost: number, label: string, next: DealershipState) => void;
}) {
  return (
    <Section
      title="SHOWROOM SETUP"
      copy="Expand display space so more customers can browse at once."
    >
      <Image source={showroom} style={s.sectionImage} />
      <Metric label="Showroom size" value={`${c.showroomSize}`} />
      <Metric label="Display capacity" value={`${c.showroomCapacity} cars`} />
      <Action
        title="EXPAND SHOWROOM"
        copy="$45,000 · +4 display spaces"
        image={showroom}
        onPress={() =>
          spend(45000, "Showroom expanded", {
            ...c,
            showroomSize: c.showroomSize + 1,
            showroomCapacity: c.showroomCapacity + 4,
          })
        }
      />
    </Section>
  );
}
function Inventory({
  c,
  buy,
}: {
  c: DealershipState;
  buy: (premium?: boolean) => void;
}) {
  return (
    <Section
      title="VEHICLE INVENTORY"
      copy="Acquire cars, protect margin and keep the showroom fresh."
    >
      <Image source={inventory} style={s.sectionImage} />
      <Metric label="Cars in stock" value={`${c.inventory}`} />
      <Metric label="Premium vehicles" value={`${c.premiumVehicles}`} />
      <Action
        title="BUY STARTER VEHICLE"
        copy="$18,000 · +1 inventory car"
        image={inventory}
        onPress={() => buy(false)}
      />
      <Action
        title="BUY PREMIUM VEHICLE"
        copy="$42,000 · +1 premium car"
        image={inventory}
        onPress={() => buy(true)}
      />
    </Section>
  );
}
function Sales({ c, sell }: { c: DealershipState; sell: () => void }) {
  return (
    <Section
      title="SALES & CUSTOMERS"
      copy="Handle enquiries, negotiate cleanly and protect satisfaction."
    >
      <Image source={sales} style={s.sectionImage} />
      <Metric
        label="Customer satisfaction"
        value={`${c.customerSatisfaction}%`}
      />
      <Metric label="Total vehicles sold" value={`${c.totalSales}`} />
      <Action
        title="SERVE NEXT CUSTOMER"
        copy="Sell one ready vehicle and collect dealership margin"
        image={sales}
        onPress={sell}
      />
    </Section>
  );
}
function Finance({
  c,
  cash,
  spend,
}: {
  c: DealershipState;
  cash: number;
  spend: (cost: number, label: string, next: DealershipState) => void;
}) {
  return (
    <Section
      title="EMPLOYEES & FINANCE"
      copy="Hire staff, manage operating cash and improve conversion capacity."
    >
      <Image source={finance} style={s.sectionImage} />
      <Metric label="Sales staff" value={`${c.salesStaff}`} />
      <Metric label="Available cash" value={formatCurrency(cash)} />
      <Action
        title="HIRE SALES SPECIALIST"
        copy="$22,000 · +2 staff"
        image={finance}
        onPress={() =>
          spend(22000, "Sales specialist hired", {
            ...c,
            salesStaff: c.salesStaff + 2,
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
  c: DealershipState;
  cash: number;
  spend: (cost: number, label: string, next: DealershipState) => void;
}) {
  return (
    <Section
      title="EXPANSION & UPGRADES"
      copy="Move from a small dealer to a multi-city automobile group."
    >
      <Image source={expansion} style={s.sectionImage} />
      <Metric label="Company stage" value={c.level} />
      <Metric label="Branches" value={`${c.branches}`} />
      <Action
        title="OPEN SECOND BRANCH"
        copy="$100,000 · +1 dealership branch"
        image={expansion}
        onPress={() =>
          spend(100000, "Second branch opened", {
            ...c,
            branches: c.branches + 1,
          })
        }
      />
      <Action
        title="ENTER PREMIUM MARKET"
        copy="$80,000 · +1 premium vehicle capacity"
        image={expansion}
        onPress={() =>
          spend(80000, "Premium market opened", {
            ...c,
            premiumVehicles: c.premiumVehicles + 1,
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
