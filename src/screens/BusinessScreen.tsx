import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import BusinessRegistrationModal from "../components/modals/BusinessRegistrationModal";
import { useGame } from "../context/GameContext";
import { simulateBusinessOperations } from "../engine/businessSimulation";
import { founderOwnershipFraction } from "../engine/ipoEngine";
import {
  BusinessEntity,
  OperatingStructure,
  RetailBusinessState,
} from "../types/business";
import { IPOListing } from "../types/ipo";
import type { BankLedgerEntry } from "../types/bank";
import { RetailShopState } from "../types/retail";
import { DEFAULT_SPORTS_CLUB } from "../types/sportsClub";
import { DEFAULT_OIL_GAS } from "../types/oilGas";
import { DEFAULT_AIRLINE } from "../types/airline";
import { DEFAULT_HOTEL } from "../types/hotel";
import { DEFAULT_BLOCKCHAIN } from "../types/blockchain";
import { DEFAULT_SPACE } from "../types/space";
import { DEFAULT_HOLDING } from "../types/holding";
import { formatCurrency } from "../utils/formatCurrency";
import BusinessMasterHubScreen from "./business/BusinessMasterHubScreen";
import TaxiCompanyScreen from "./TaxiCompanyScreen";
import ShippingCompanyScreen from "./ShippingCompanyScreen";
import FactoryCompanyScreen from "./FactoryCompanyScreen";
import ConstructionCompanyScreen from "./ConstructionCompanyScreen";
import CarDealershipScreen from "./CarDealershipScreen";
import SoftwareCompanyScreen from "./SoftwareCompanyScreen";
import SportsClubCompanyScreen from "./SportsClubCompanyScreen";
import OilGasCompanyScreen from "./OilGasCompanyScreen";
import AirlineCompanyScreen from "./AirlineCompanyScreen";
import HotelCompanyScreen from "./HotelCompanyScreen";
import BlockchainCompanyScreen from "./BlockchainCompanyScreen";
import SpaceCompanyScreen from "./SpaceCompanyScreen";
import HoldingCompanyScreen from "./HoldingCompanyScreen";
import {
  clearLevelUpNotice,
  levelConfig,
  normalizeBusinessLevel,
} from "../engine/businessLevels";
import { designSystem } from "../theme/designSystem";

const C = {
  bg: designSystem.colors.background,
  surface: designSystem.colors.card,
  card: designSystem.colors.card,
  cardBorder: designSystem.colors.border,
  white: designSystem.colors.heading,
  muted: designSystem.colors.secondary,
  green: designSystem.colors.primary,
  cyan: designSystem.colors.cyan,
  red: designSystem.colors.negative,
  gold: designSystem.colors.gold,
  violet: designSystem.colors.violet,
  ink: "#08110E",
};
type Props = {
  state?: RetailShopState;
  cash: number;
  netWorth: number;
  netIncomePerHour: number;
  timestamp: number;
  ipoListing?: IPOListing | null;
  onIPOComplete: (listing: IPOListing) => void;
  onStateChange?: React.Dispatch<React.SetStateAction<RetailShopState>>;
  onCashChange: React.Dispatch<React.SetStateAction<number>>;
  onOpenBank?: () => void;
  focusRetail?: boolean;
  onRetailFocusHandled?: () => void;
  onLedger?: (entry: BankLedgerEntry) => void;
};
const accent: Record<BusinessEntity["sector"], string> = {
  Retail: C.green,
  Mobility: C.gold,
  Tech_SaaS: C.violet,
  Construction_Mega: C.cyan,
  Real_Estate: "#38BDF8",
  Energy: "#FACC15",
  Pharma: "#FB7185",
  Media: "#C084FC",
  Sports: "#FB923C",
  Airline: "#60A5FA",
};
const iconAccent: Record<BusinessEntity["sector"], string> = {
  Retail: "#28E39A",
  Mobility: "#FFC857",
  Tech_SaaS: "#B59CFF",
  Construction_Mega: "#49C8FF",
  Real_Estate: "#38BDF8",
  Energy: "#FACC15",
  Pharma: "#FB7185",
  Media: "#C084FC",
  Sports: "#FB923C",
  Airline: "#60A5FA",
};
const sectorLabel: Record<BusinessEntity["sector"], string> = {
  Retail: "RETAIL",
  Mobility: "MOBILITY",
  Tech_SaaS: "TECH",
  Construction_Mega: "INFRASTRUCTURE",
  Real_Estate: "REAL ESTATE",
  Energy: "ENERGY",
  Pharma: "PHARMA",
  Media: "MEDIA",
  Sports: "SPORTS",
  Airline: "AIRLINE",
};
const tierLabel: Record<BusinessEntity["sector"], string> = {
  Retail: "STARTER",
  Mobility: "GROWTH",
  Tech_SaaS: "SCALE",
  Construction_Mega: "TITAN",
  Real_Estate: "ASSET",
  Energy: "UTILITY",
  Pharma: "SCIENCE",
  Media: "CULTURE",
  Sports: "MOMENTUM",
  Airline: "GLOBAL",
};
const sectorDescription: Record<BusinessEntity["sector"], string> = {
  Retail: "Stock shelves, price smart, and compound daily footfall.",
  Mobility: "Build a city fleet where surge pricing meets reliability.",
  Tech_SaaS: "Turn subscribers and uptime into recurring software cashflow.",
  Construction_Mega: "Win tenders, manage phases, and release escrow payouts.",
  Real_Estate: "Own property branches and capture dependable rental demand.",
  Energy: "Sell grid capacity as American infrastructure modernizes.",
  Pharma: "Fund trials, protect trust, and commercialize breakthroughs.",
  Media: "Convert attention, contracts, and viral reach into revenue.",
  Sports: "Monetize fans, events, and championship momentum.",
  Airline: "Operate a national route network with premium demand.",
};
const unlockMilestones = [
  {
    amount: 5000,
    label: "Founder runway",
    copy: "Unlocks the first upgrade rhythm.",
  },
  {
    amount: 10000,
    label: "Local operator",
    copy: "A second branch becomes realistic.",
  },
  {
    amount: 50000,
    label: "Regional scale",
    copy: "Mobility and construction decisions open up.",
  },
  {
    amount: 250000,
    label: "Growth company",
    copy: "SaaS and real-estate capital become reachable.",
  },
  {
    amount: 750000,
    label: "Institutional capital",
    copy: "Prepare for the first public-company valuation.",
  },
];

class BusinessErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorBoundary}>
          <Text
            style={styles.errorBoundaryTitle}
            onPress={() => this.setState({ hasError: false })}
          >
            Business hit an error · Tap to retry
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export function BusinessScreen(props: Props) {
  return (
    <BusinessErrorBoundary>
      <BusinessScreenContent {...props} />
    </BusinessErrorBoundary>
  );
}

function BusinessScreenContent({
  cash,
  netWorth,
  netIncomePerHour,
  timestamp,
  ipoListing,
  onIPOComplete,
  onCashChange,
  onOpenBank,
  focusRetail = false,
  onRetailFocusHandled,
  onLedger,
}: Props) {
  const {
    businesses,
    setBusinesses,
    taxiCompany,
    setTaxiCompany,
    shippingCompany,
    setShippingCompany,
    factoryCompany,
    setFactoryCompany,
    constructionCompany,
    setConstructionCompany,
    dealership,
    setDealership,
    softwareCompany,
    setSoftwareCompany,
    sportsClub,
    setSportsClub,
    oilGas,
    setOilGas,
    airline,
    setAirline,
    hotel,
    setHotel,
    blockchain,
    setBlockchain,
    space,
    setSpace,
    holding,
    setHolding,
  } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [taxiOpen, setTaxiOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [factoryOpen, setFactoryOpen] = useState(false);
  const [constructionOpen, setConstructionOpen] = useState(false);
  const [dealershipOpen, setDealershipOpen] = useState(false);
  const [softwareOpen, setSoftwareOpen] = useState(false);
  const [sportsOpen, setSportsOpen] = useState(false);
  const [oilGasOpen, setOilGasOpen] = useState(false);
  const [airlineOpen, setAirlineOpen] = useState(false);
  const [hotelOpen, setHotelOpen] = useState(false);
  const [blockchainOpen, setBlockchainOpen] = useState(false);
  const [spaceOpen, setSpaceOpen] = useState(false);
  const [holdingOpen, setHoldingOpen] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"start" | "companies">("start");
  const celebratedRef = useRef("");
  const constructionElapsed = useRef(0);
  useEffect(() => {
    const timer = setInterval(() => {
      constructionElapsed.current += 2;
      const constructionSeconds = constructionElapsed.current >= 3 ? 3 : 0;
      if (constructionSeconds) constructionElapsed.current -= 3;
      const ownershipFractions = ipoListing
        ? { [ipoListing.companyId]: founderOwnershipFraction(ipoListing) }
        : {};
      const result = simulateBusinessOperations(
        businesses,
        2,
        constructionSeconds,
        cash,
        ownershipFractions,
        netWorth,
      );
      if (result.businesses !== businesses) setBusinesses(result.businesses);
    }, 2000);
    return () => clearInterval(timer);
  }, [businesses, cash, ipoListing, netWorth, setBusinesses]);
  const selected = useMemo(
    () =>
      businesses.find((item) => item.id === selectedId && item.isAcquired) ||
      null,
    [businesses, selectedId],
  );
  const registrationTarget =
    businesses.find((item) => item.id === registrationId) || null;
  useEffect(() => {
    if (!focusRetail) return;
    const retail = businesses.find((item) => item.sector === "Retail");
    if (retail?.isAcquired) setSelectedId(retail.id);
    else if (retail) setRegistrationId(retail.id);
    onRetailFocusHandled?.();
  }, [businesses, focusRetail, onRetailFocusHandled]);
  const activeCount = businesses.filter((item) => item.isAcquired).length;
  const levelNotice = businesses.find((item) => item.levelUpNotice);
  useEffect(() => {
    if (!levelNotice?.levelUpNotice) return;
    const key = `${levelNotice.id}:${levelNotice.levelUpNotice.level}`;
    if (celebratedRef.current === key) return;
    celebratedRef.current = key;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [levelNotice]);
  const nextUnlock = businesses
    .filter(
      (item) => !item.isAcquired && item.unlockNetWorthRequired > netWorth,
    )
    .sort((a, b) => a.unlockNetWorthRequired - b.unlockNetWorthRequired)[0];
  const nextGoal =
    nextUnlock?.unlockNetWorthRequired || Math.max(netWorth * 1.5, 100000);
  const progress = Math.min(1, netWorth / Math.max(nextGoal, 1));
  const ownedBusinesses = businesses.filter((item) => item.isAcquired);
  const businessCost = (item: BusinessEntity) =>
    Math.max(0, item.acquisitionCost);
  const estimatedHourly = (item: BusinessEntity) => {
    if (item.sector === "Retail") {
      const units = 1800 * 1.55;
      const revenue = units * 4;
      const cogs = units * (item.unitWholesaleCost ?? 2);
      const fixed =
        ((item.monthlyRent ?? 800) + (item.monthlyPayroll ?? 1200)) / (30 * 24);
      return Math.max(0, revenue - cogs - fixed - revenue * 0.15);
    }
    if (item.sector === "Mobility")
      return Math.max(
        0,
        item.economySedans * 2200 +
          item.electricEVs * 6000 +
          item.luxuryLimos * 12000,
      );
    return Math.max(0, Number(item.hourlyNetProfit) || 0);
  };
  const opportunities = businesses
    .filter((item) => !item.isAcquired)
    .map((item) => ({
      item,
      cost: businessCost(item),
      hourly: estimatedHourly(item),
    }))
    .filter((entry) => entry.hourly > 0)
    .sort((a, b) => a.cost / a.hourly - b.cost / b.hourly);
  const bestAffordable = opportunities.find((entry) => entry.cost <= cash);
  const openSportsClub = () => {
    if (sportsClub) return setSportsOpen(true);
    const setupCost = 250000;
    if (cash < setupCost) {
      Alert.alert("SPORTS CLUB LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the club charter and first season budget.`);
      return;
    }
    onCashChange((value) => value - setupCost);
    setSportsClub({ ...DEFAULT_SPORTS_CLUB, cashReserve: setupCost });
    onLedger?.({ id: `sports-charter-${Date.now()}`, kind: "PURCHASE", label: "Sports Club charter", amount: -setupCost, timestamp: Date.now(), detail: "Club headquarters and first-season operating reserve" });
    setSportsOpen(true);
  };
  const openOilGas = () => {
    if (oilGas) return setOilGasOpen(true);
    const setupCost = 400000;
    if (cash < setupCost) {
      Alert.alert("OIL & GAS LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the energy charter and first field budget.`);
      return;
    }
    onCashChange((value) => value - setupCost);
    setOilGas({ ...DEFAULT_OIL_GAS, cashReserve: setupCost });
    onLedger?.({ id: `oilgas-charter-${Date.now()}`, kind: "PURCHASE", label: "Oil & Gas charter", amount: -setupCost, timestamp: Date.now(), detail: "Energy headquarters and first-field operating reserve" });
    setOilGasOpen(true);
  };
  const openAirline = () => {
    if (airline) return setAirlineOpen(true);
    const setupCost = 600000;
    if (cash < setupCost) {
      Alert.alert("AIRLINE LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the air operator certificate and launch fleet.`);
      return;
    }
    onCashChange((value) => value - setupCost);
    setAirline({ ...DEFAULT_AIRLINE, cashReserve: setupCost });
    onLedger?.({ id: `airline-charter-${Date.now()}`, kind: "PURCHASE", label: "Airline charter", amount: -setupCost, timestamp: Date.now(), detail: "Air operator certificate and launch fleet reserve" });
    setAirlineOpen(true);
  };
  const openHotel = () => {
    if (hotel) return setHotelOpen(true);
    const setupCost = 420000;
    if (cash < setupCost) {
      Alert.alert("HOTEL LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the property acquisition and opening team.`);
      return;
    }
    onCashChange((value) => value - setupCost);
    setHotel({ ...DEFAULT_HOTEL, cashReserve: setupCost });
    onLedger?.({ id: `hotel-charter-${Date.now()}`, kind: "PURCHASE", label: "Hotel property charter", amount: -setupCost, timestamp: Date.now(), detail: "Property acquisition and opening team reserve" });
    setHotelOpen(true);
  };
  const openBlockchain = () => {
    if (blockchain) return setBlockchainOpen(true);
    const setupCost = 300000;
    if (cash < setupCost) {
      Alert.alert("TECHNOLOGY LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the infrastructure and research launch.`);
      return;
    }
    onCashChange((value) => value - setupCost);
    setBlockchain({ ...DEFAULT_BLOCKCHAIN, cashReserve: setupCost });
    onLedger?.({ id: `blockchain-charter-${Date.now()}`, kind: "PURCHASE", label: "Technology company charter", amount: -setupCost, timestamp: Date.now(), detail: "Infrastructure and research launch reserve" });
    setBlockchainOpen(true);
  };
  const openSpace = () => {
    if (space) return setSpaceOpen(true);
    const setupCost = 850000;
    if (cash < setupCost) {
      Alert.alert("AEROSPACE LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the launch program and engineering team.`);
      return;
    }
    onCashChange((value) => value - setupCost);
    setSpace({ ...DEFAULT_SPACE, cashReserve: setupCost });
    onLedger?.({ id: `space-charter-${Date.now()}`, kind: "PURCHASE", label: "Aerospace company charter", amount: -setupCost, timestamp: Date.now(), detail: "Launch program and engineering team reserve" });
    setSpaceOpen(true);
  };
  const openHolding = () => {
    if (holding) return setHoldingOpen(true);
    const setupCost = 1200000;
    if (cash < setupCost) {
      Alert.alert("HOLDING COMPANY LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the corporate headquarters and group treasury.`);
      return;
    }
    onCashChange((value) => value - setupCost);
    setHolding({ ...DEFAULT_HOLDING, cashReserve: setupCost });
    onLedger?.({ id: `holding-charter-${Date.now()}`, kind: "PURCHASE", label: "Holding Company charter", amount: -setupCost, timestamp: Date.now(), detail: "Corporate headquarters and group treasury reserve" });
    setHoldingOpen(true);
  };
  const nextMove = bestAffordable
    ? `Start ${bestAffordable.item.name} · ~${Math.max(1, Math.ceil(bestAffordable.cost / bestAffordable.hourly))} settlements to pay back at +${formatCurrency(bestAffordable.hourly)}/hr`
    : (() => {
        const next = opportunities[0];
        const shortfall = next ? Math.max(0, next.cost - cash) : 0;
        const rate = Math.max(0, netIncomePerHour);
        const settlements =
          rate > 0 ? Math.max(1, Math.ceil(shortfall / rate)) : "—";
        return `affordable in ~${settlements} settlements at +${formatCurrency(rate)}/hr`;
      })();
  if (factoryOpen)
    return (
      <FactoryCompanyScreen
        company={factoryCompany}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setFactoryCompany || (() => undefined)}
        onBack={() => setFactoryOpen(false)}
        onLedger={onLedger}
      />
    );
  if (constructionOpen)
    return (
      <ConstructionCompanyScreen
        company={constructionCompany}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setConstructionCompany || (() => undefined)}
        onBack={() => setConstructionOpen(false)}
        onLedger={onLedger}
      />
    );
  if (dealershipOpen)
    return (
      <CarDealershipScreen
        company={dealership}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setDealership || (() => undefined)}
        onBack={() => setDealershipOpen(false)}
        onLedger={onLedger}
      />
    );
  if (softwareOpen)
    return (
      <SoftwareCompanyScreen
        company={softwareCompany}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setSoftwareCompany || (() => undefined)}
        onBack={() => setSoftwareOpen(false)}
        onLedger={onLedger}
      />
    );
  if (sportsOpen)
    return (
      <SportsClubCompanyScreen
        company={sportsClub}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setSportsClub}
        onBack={() => setSportsOpen(false)}
        onLedger={onLedger}
      />
    );
  if (oilGasOpen)
    return (
      <OilGasCompanyScreen
        company={oilGas}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setOilGas}
        onBack={() => setOilGasOpen(false)}
        onLedger={onLedger}
      />
    );
  if (airlineOpen)
    return (
      <AirlineCompanyScreen
        company={airline}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setAirline}
        onBack={() => setAirlineOpen(false)}
        onLedger={onLedger}
      />
    );
  if (hotelOpen)
    return (
      <HotelCompanyScreen
        company={hotel}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setHotel}
        onBack={() => setHotelOpen(false)}
        onLedger={onLedger}
      />
    );
  if (blockchainOpen)
    return (
      <BlockchainCompanyScreen
        company={blockchain}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setBlockchain}
        onBack={() => setBlockchainOpen(false)}
        onLedger={onLedger}
      />
    );
  if (spaceOpen)
    return (
      <SpaceCompanyScreen
        company={space}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setSpace}
        onBack={() => setSpaceOpen(false)}
        onLedger={onLedger}
      />
    );
  if (holdingOpen)
    return (
      <HoldingCompanyScreen
        holding={holding}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setHolding}
        onBack={() => setHoldingOpen(false)}
        onLedger={onLedger}
      />
    );
  if (shippingOpen)
    return (
      <ShippingCompanyScreen
        company={shippingCompany}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setShippingCompany || (() => undefined)}
        onBack={() => setShippingOpen(false)}
        onLedger={onLedger}
      />
    );
  if (taxiOpen)
    return (
      <TaxiCompanyScreen
        company={taxiCompany}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setTaxiCompany || (() => undefined)}
        onBack={() => setTaxiOpen(false)}
        onLedger={onLedger}
      />
    );
  if (selected)
    return (
      <BusinessMasterHubScreen
        business={selected}
        cash={cash}
        netWorth={netWorth}
        timestamp={timestamp}
        ipoListing={ipoListing}
        focusRetail={focusRetail}
        onBack={() => setSelectedId(null)}
        onCashChange={onCashChange}
        onLedger={onLedger}
        onChange={(next) =>
          setBusinesses((items) =>
            items.map((item) => (item.id === next.id ? next : item)),
          )
        }
        onIPOComplete={onIPOComplete}
      />
    );
  const incorporate = (
    name: string,
    structure: OperatingStructure,
    fee: number,
  ) => {
    if (
      !registrationTarget ||
      cash < fee + registrationTarget.acquisitionCost
    ) {
      Alert.alert(
        "INSUFFICIENT CAPITAL",
        `This deal requires ${formatCurrency((registrationTarget?.acquisitionCost || 0) + fee)} liquid cash.`,
      );
      return;
    }
    const total = fee + registrationTarget.acquisitionCost;
    onCashChange((value) => value - total);
    onLedger?.({
      id: `ledger-business-${registrationTarget.id}-${Date.now()}`,
      kind: "PURCHASE",
      label: `Business purchase · ${name}`,
      amount: -total,
      timestamp: Date.now(),
      detail: `${structure} acquisition`,
    });
    setBusinesses((items) =>
      items.map((item) =>
        item.id === registrationTarget.id
          ? {
              ...item,
              name,
              isAcquired: true,
              operatingRampSeconds: 0,
              legalStatus: structure,
              policeHeat: structure === "Shadow_Underground" ? 2 : 0,
              stability: structure === "Shadow_Underground" ? 70 : 95,
            }
          : item,
      ),
    );
    setRegistrationId(null);
  };
  const quickAction = (item: BusinessEntity) => {
    if (!item.isAcquired) return setRegistrationId(item.id);
    const current = normalizeBusinessLevel(item);
    if ((current.level ?? 1) > 1) return setSelectedId(item.id);
    const cost = item.sector === "Retail" ? 2000 : 12000;
    if (cash < cost)
      return Alert.alert(
        "INSUFFICIENT CASH",
        `Need ${formatCurrency(cost - cash)} more.`,
      );
    onCashChange((value) => value - cost);
    const next =
      item.sector === "Retail"
        ? {
            ...item,
            stockUnits: Math.min(item.maxStockCapacity, item.stockUnits + 1000),
          }
        : { ...item, economySedans: (item as any).economySedans + 1 };
    setBusinesses((items) =>
      items.map((existing) =>
        existing.id === item.id ? normalizeBusinessLevel(next, true) : existing,
      ),
    );
    onLedger?.({
      id: `ledger-business-level1-${item.id}-${Date.now()}`,
      kind: "UPKEEP",
      label: `${item.name} Level 1 operation`,
      amount: -cost,
      timestamp: Date.now(),
      detail:
        item.sector === "Retail"
          ? "One-tap restock · 1,000 units"
          : "One-tap economy vehicle",
    });
  };
  return (
    <View style={styles.root}>
      <SafeAreaView edges={["left", "right"]} style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.commandLine}>
            <Text style={styles.commandEyebrow}>FOUNDER COMMAND DECK</Text>
            <Text style={styles.commandValue}>
              Net worth {formatCurrency(netWorth)} · {activeCount} active
            </Text>
          </View>
          <View style={styles.summaryStrip}>
            <SummaryMetric label="CASH" value={formatCurrency(cash)} />
            <SummaryMetric
              label="NET / HR"
              value={formatCurrency(netIncomePerHour)}
            />
            <SummaryMetric
              label="COMPANIES"
              value={`${activeCount} / ${businesses.length}`}
            />
          </View>
          <View style={styles.taxiCard}>
            <View style={styles.taxiCardCopy}>
              <Text style={styles.taxiEyebrow}>FIRST SPECIALIZED BUSINESS</Text>
              <Text style={styles.taxiTitle}>
                {taxiCompany ? "My Taxi Company" : "Start a Taxi Company"}
              </Text>
              <Text style={styles.taxiCopy}>
                {taxiCompany
                  ? `${taxiCompany.area} · ${taxiCompany.status === "operating" ? "Operating" : "Setup in progress"} · ${taxiCompany.economyTaxis + taxiCompany.electricTaxis + taxiCompany.luxuryTaxis} vehicles`
                  : "Choose a service area, fund a first vehicle and launch a real operating company."}
              </Text>
            </View>
            <Pressable
              style={styles.taxiButton}
              onPress={() => setTaxiOpen(true)}
            >
              <Text style={styles.taxiButtonText}>
                {taxiCompany ? "MANAGE TAXI" : "START TAXI"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.shippingCard}>
            <View style={styles.shippingCardCopy}>
              <Text style={styles.shippingEyebrow}>LOGISTICS COMPANY</Text>
              <Text style={styles.shippingTitle}>
                {shippingCompany
                  ? "My Shipping Company"
                  : "Start a Shipping Company"}
              </Text>
              <Text style={styles.shippingCopy}>
                {shippingCompany
                  ? `${shippingCompany.city} · ${shippingCompany.level} · ${shippingCompany.shipments.filter((item) => item.status !== "delivered").length} active shipments · ${shippingCompany.warehouseCapacity.toLocaleString()} cargo units`
                  : "Build warehouses, manage cargo, assign vehicles and complete delivery orders."}
              </Text>
            </View>
            <Pressable
              style={styles.shippingButton}
              onPress={() => setShippingOpen(true)}
            >
              <Text style={styles.shippingButtonText}>
                {shippingCompany ? "MANAGE SHIPPING" : "START SHIPPING"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.factoryCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.factoryEyebrow}>MANUFACTURING COMPANY</Text>
              <Text style={styles.factoryTitle}>
                {factoryCompany
                  ? "My Factory Company"
                  : "Start a Factory Company"}
              </Text>
              <Text style={styles.factoryCopy}>
                {factoryCompany
                  ? `${factoryCompany.factoryType} · ${factoryCompany.level} · ${factoryCompany.machineLines} production lines · ${factoryCompany.finishedGoods.toLocaleString()} finished goods`
                  : "Turn raw materials into products with machines, workers, inventory and sales."}
              </Text>
            </View>
            <Pressable
              style={styles.factoryButton}
              onPress={() => setFactoryOpen(true)}
            >
              <Text style={styles.factoryButtonText}>
                {factoryCompany ? "MANAGE FACTORY" : "START FACTORY"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.constructionCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.constructionEyebrow}>
                DEVELOPMENT COMPANY
              </Text>
              <Text style={styles.factoryTitle}>
                {constructionCompany
                  ? "My Construction Company"
                  : "Start a Construction Company"}
              </Text>
              <Text style={styles.factoryCopy}>
                {constructionCompany
                  ? `${constructionCompany.level} · ${constructionCompany.activeProjects} active projects · ${constructionCompany.landParcels} parcels`
                  : "Buy land, manage machinery, build projects and win construction contracts."}
              </Text>
            </View>
            <Pressable
              style={styles.constructionButton}
              onPress={() => setConstructionOpen(true)}
            >
              <Text style={styles.factoryButtonText}>
                {constructionCompany
                  ? "MANAGE CONSTRUCTION"
                  : "START CONSTRUCTION"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.dealershipCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.dealershipEyebrow}>AUTOMOTIVE COMPANY</Text>
              <Text style={styles.factoryTitle}>
                {dealership ? "My Car Dealership" : "Start a Car Dealership"}
              </Text>
              <Text style={styles.factoryCopy}>
                {dealership
                  ? `${dealership.level} · ${dealership.inventory} cars in stock · ${dealership.totalSales} sales · ${dealership.branches} branches`
                  : "Buy vehicles, build a showroom, serve customers and expand into an automobile group."}
              </Text>
            </View>
            <Pressable
              style={styles.dealershipButton}
              onPress={() => setDealershipOpen(true)}
            >
              <Text style={styles.factoryButtonText}>
                {dealership ? "MANAGE DEALERSHIP" : "START DEALERSHIP"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.softwareCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.softwareEyebrow}>TECHNOLOGY COMPANY</Text>
              <Text style={styles.factoryTitle}>
                {softwareCompany
                  ? "My Software Company"
                  : "Start an IT & Software Company"}
              </Text>
              <Text style={styles.factoryCopy}>
                {softwareCompany
                  ? `${softwareCompany.stage} · ${softwareCompany.developers} developers · ${softwareCompany.activeProjects} active projects · ${softwareCompany.saasProducts} SaaS products`
                  : "Hire developers, win client contracts, deliver software and grow into a technology enterprise."}
              </Text>
            </View>
            <Pressable
              style={styles.softwareButton}
              onPress={() => setSoftwareOpen(true)}
            >
              <Text style={styles.factoryButtonText}>
                {softwareCompany ? "MANAGE SOFTWARE" : "START SOFTWARE"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.sportsCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.sportsEyebrow}>SPORTS & ENTERTAINMENT</Text>
              <Text style={styles.factoryTitle}>{sportsClub ? sportsClub.clubName : "Sports Club Company"}</Text>
              <Text style={styles.factoryCopy}>
                {sportsClub
                  ? `${sportsClub.stage} · ${sportsClub.teams} teams · ${sportsClub.stadiumCapacity.toLocaleString()} seats`
                  : "Build teams, stadiums, tournaments, sponsorships and a multi-city sports group."}
              </Text>
            </View>
            <Pressable style={styles.sportsButton} onPress={openSportsClub}>
              <Text style={styles.factoryButtonText}>{sportsClub ? "MANAGE SPORTS" : "START SPORTS"}</Text>
            </Pressable>
          </View>
          <View style={styles.oilGasCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.oilGasEyebrow}>ENERGY & INFRASTRUCTURE</Text>
              <Text style={styles.factoryTitle}>{oilGas ? oilGas.companyName : "Oil & Gas Company"}</Text>
              <Text style={styles.factoryCopy}>
                {oilGas ? `${oilGas.stage} · ${oilGas.fields} fields · ${oilGas.fuelStations} stations` : "Build fields, refineries, terminals, fuel stations and global energy operations."}
              </Text>
            </View>
            <Pressable style={styles.oilGasButton} onPress={openOilGas}>
              <Text style={styles.factoryButtonText}>{oilGas ? "MANAGE ENERGY" : "START ENERGY"}</Text>
            </Pressable>
          </View>
          <View style={styles.bankingCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.bankingEyebrow}>FINANCIAL SERVICES</Text>
              <Text style={styles.factoryTitle}>Banking Company</Text>
              <Text style={styles.factoryCopy}>
                Manage credit, deposits, insurance, tax, treasury risk and investor capital in the dedicated Bank module.
              </Text>
            </View>
            <Pressable style={styles.bankingButton} onPress={onOpenBank}>
              <Text style={styles.factoryButtonText}>OPEN BANKING</Text>
            </Pressable>
          </View>
          <View style={styles.airlineCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.airlineEyebrow}>AVIATION & TRAVEL</Text>
              <Text style={styles.factoryTitle}>{airline ? airline.companyName : "Airline Company"}</Text>
              <Text style={styles.factoryCopy}>
                {airline ? `${airline.stage} · ${airline.aircraft} aircraft · ${airline.routes} routes` : "Build a regional carrier, schedule routes, fill seats and expand into a global airline group."}
              </Text>
            </View>
            <Pressable style={styles.airlineButton} onPress={openAirline}>
              <Text style={styles.factoryButtonText}>{airline ? "MANAGE AIRLINE" : "START AIRLINE"}</Text>
            </Pressable>
          </View>
          <View style={styles.hotelCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.hotelEyebrow}>HOSPITALITY & TRAVEL</Text>
              <Text style={styles.factoryTitle}>{hotel ? hotel.companyName : "Hotel & Hospitality Company"}</Text>
              <Text style={styles.factoryCopy}>
                {hotel ? `${hotel.stage} · ${hotel.properties} properties · ${hotel.rooms} rooms` : "Acquire properties, fill rooms, build guest services and grow an international hospitality group."}
              </Text>
            </View>
            <Pressable style={styles.hotelButton} onPress={openHotel}>
              <Text style={styles.factoryButtonText}>{hotel ? "MANAGE HOTEL" : "START HOTEL"}</Text>
            </Pressable>
          </View>
          <View style={styles.blockchainCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.blockchainEyebrow}>DIGITAL INFRASTRUCTURE</Text>
              <Text style={styles.factoryTitle}>{blockchain ? blockchain.companyName : "Blockchain & Digital Technology"}</Text>
              <Text style={styles.factoryCopy}>
                {blockchain ? `${blockchain.stage} · ${blockchain.servers} servers · ${blockchain.clients} clients` : "Build infrastructure, research products, launch a reliable platform and win enterprise technology clients."}
              </Text>
            </View>
            <Pressable style={styles.blockchainButton} onPress={openBlockchain}>
              <Text style={styles.factoryButtonText}>{blockchain ? "MANAGE TECHNOLOGY" : "START TECHNOLOGY"}</Text>
            </Pressable>
          </View>
          <View style={styles.spaceCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.spaceEyebrow}>AEROSPACE & EXPLORATION</Text>
              <Text style={styles.factoryTitle}>{space ? space.companyName : "Space & Aerospace Company"}</Text>
              <Text style={styles.factoryCopy}>
                {space ? `${space.stage} · ${space.launches} launches · ${space.satellites} satellites` : "Fund research, build rockets, schedule missions and grow an advanced space enterprise."}
              </Text>
            </View>
            <Pressable style={styles.spaceButton} onPress={openSpace}>
              <Text style={styles.factoryButtonText}>{space ? "MANAGE AEROSPACE" : "START AEROSPACE"}</Text>
            </Pressable>
          </View>
          <View style={styles.holdingCard}>
            <View style={styles.factoryCardCopy}>
              <Text style={styles.holdingEyebrow}>GROUP MANAGEMENT LAYER</Text>
              <Text style={styles.factoryTitle}>{holding ? holding.companyName : "Holding Company & Mergers"}</Text>
              <Text style={styles.factoryCopy}>
                {holding ? `${holding.stage} · ${holding.subsidiaries.length} subsidiaries · ${Math.round(holding.synergyRate * 100)}% synergy` : "Consolidate profitable businesses, acquire targets and manage group-wide treasury above the operating companies."}
              </Text>
            </View>
            <Pressable style={styles.holdingButton} onPress={openHolding}>
              <Text style={styles.factoryButtonText}>{holding ? "MANAGE GROUP" : "FORM HOLDING"}</Text>
            </Pressable>
          </View>
          <View style={styles.primaryActions}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => setViewMode("start")}
            >
              <Text style={styles.primaryButtonText}>START A BUSINESS</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setViewMode("companies")}
            >
              <Text style={styles.secondaryButtonText}>MY COMPANIES</Text>
            </Pressable>
          </View>
          {levelNotice?.levelUpNotice && (
            <View style={styles.levelUpCard}>
              <Text style={styles.levelUpEyebrow}>NEW CONTROLS UNLOCKED</Text>
              <Text style={styles.levelUpTitle}>
                {levelNotice.name} reached Level {levelNotice.level}
              </Text>
              <Text style={styles.levelUpCopy}>
                {levelNotice.levelUpNotice.teaser}
              </Text>
              <Pressable
                onPress={() =>
                  setBusinesses((items) =>
                    items.map((item) =>
                      item.id === levelNotice.id
                        ? clearLevelUpNotice(item)
                        : item,
                    ),
                  )
                }
              >
                <Text style={styles.dismissText}>DISMISS</Text>
              </Pressable>
            </View>
          )}
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionEyebrow}>YOUR COMPANIES</Text>
              <Text style={styles.sectionTitle}>Owned and operating</Text>
            </View>
            <Text style={styles.sectionCount}>
              {ownedBusinesses.length} ACTIVE
            </Text>
          </View>
          <View style={styles.grid}>
            {ownedBusinesses.map((item) => (
              <BusinessCard
                key={`owned-${item.id}`}
                business={item}
                netWorth={netWorth}
                onAcquire={() => setRegistrationId(item.id)}
                onManage={() => setSelectedId(item.id)}
                onQuickAction={() => quickAction(item)}
              />
            ))}
            {ownedBusinesses.length === 0 && (
              <Text style={styles.emptyCompanies}>
                No companies yet. Start with the most affordable
                positive-cashflow opportunity below.
              </Text>
            )}
          </View>
          <View style={styles.nextMoveCard}>
            <Text style={styles.goalEyebrow}>NEXT BEST MOVE</Text>
            <Text style={styles.nextMoveText}>{nextMove}</Text>
          </View>
          <View style={styles.goalCard}>
            <View style={styles.goalTop}>
              <View>
                <Text style={styles.goalEyebrow}>NEXT MILESTONE</Text>
                <Text style={styles.goalTitle}>
                  {nextUnlock
                    ? `Unlock ${nextUnlock.name}`
                    : "Become a national conglomerate"}
                </Text>
              </View>
              <Text style={styles.goalPercent}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={styles.goalTrack}>
              <View
                style={[styles.goalFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <View style={styles.goalBottom}>
              <Text style={styles.goalText}>
                {formatCurrency(netWorth)} current
              </Text>
              <Text style={styles.goalText}>
                Goal {formatCurrency(nextGoal)}
              </Text>
            </View>
          </View>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionEyebrow}>START A NEW BUSINESS</Text>
              <Text style={styles.sectionTitle}>Choose your next company</Text>
            </View>
            <Text style={styles.sectionCount}>
              {businesses.filter((item) => !item.isAcquired).length}{" "}
              OPPORTUNITIES
            </Text>
          </View>
          <View style={styles.grid}>
            {businesses
              .filter((item) => !item.isAcquired)
              .map((item) => (
                <BusinessCard
                  key={`start-${item.id}`}
                  business={item}
                  netWorth={netWorth}
                  onAcquire={() => setRegistrationId(item.id)}
                  onManage={() => setSelectedId(item.id)}
                  onQuickAction={() => quickAction(item)}
                />
              ))}
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>✦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>PLAY THE LONG GAME</Text>
              <Text style={styles.tipCopy}>
                Every business unlocks a new cashflow loop. Reinvest earnings to
                reach the next tier faster.
              </Text>
            </View>
          </View>
        </ScrollView>
        <BusinessRegistrationModal
          visible={Boolean(registrationTarget)}
          cash={cash}
          suggestedName={registrationTarget?.name || "New Enterprise"}
          onClose={() => setRegistrationId(null)}
          onIncorporate={incorporate}
        />
      </SafeAreaView>
    </View>
  );
}
function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryMetric}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}
function BusinessCard({
  business,
  netWorth,
  onAcquire,
  onManage,
  onQuickAction,
}: {
  business: BusinessEntity;
  netWorth: number;
  onAcquire: () => void;
  onManage: () => void;
  onQuickAction: () => void;
}) {
  const unlocked =
    business.isUnlocked || netWorth >= business.unlockNetWorthRequired;
  const color = iconAccent[business.sector];
  const level = normalizeBusinessLevel(business).level || 1;
  const progressive =
    business.sector === "Retail" || business.sector === "Mobility";
  const metric =
    business.sector === "Retail"
      ? `${business.stockUnits.toLocaleString()} units in stock`
      : business.sector === "Mobility"
        ? `${business.economySedans + business.electricEVs + business.luxuryLimos} vehicles in fleet`
        : business.sector === "Tech_SaaS"
          ? `${business.activeSubscribers.toLocaleString()} active subscribers`
          : business.sector === "Construction_Mega"
            ? business.projectPhase === 0
              ? "$1.2M tender opportunity"
              : `Phase ${business.projectPhase} · ${business.phaseProgressPercent}% complete`
            : `${business.branchCount} branch${business.branchCount === 1 ? "" : "es"} · ${business.reputation.toFixed(0)} reputation`;
  return (
    <Pressable
      disabled={!business.isAcquired && !unlocked}
      onPress={
        business.isAcquired &&
        level === 1 &&
        (business.sector === "Retail" || business.sector === "Mobility")
          ? onQuickAction
          : business.isAcquired
            ? onManage
            : onAcquire
      }
      style={({ pressed }) => [
        styles.businessCard,
        { borderColor: `${color}55` },
        !unlocked && styles.lockedCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.cardGlow, { backgroundColor: color }]} />
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconBubble,
            { backgroundColor: `${color}22`, borderColor: `${color}66` },
          ]}
        >
          <BusinessIcon sector={business.sector} color={color} />
        </View>
        <View style={styles.cardPills}>
          <Text style={[styles.tierPill, { color, borderColor: `${color}66` }]}>
            {tierLabel[business.sector]}
          </Text>
          {!unlocked && <Text style={styles.lockPill}>LOCKED</Text>}
          {business.isAcquired && <Text style={styles.livePill}>LIVE</Text>}
        </View>
      </View>
      <Text style={styles.cardSector}>{sectorLabel[business.sector]}</Text>
      <Text numberOfLines={2} style={styles.cardTitle}>
        {business.name}
      </Text>
      <Text style={styles.cardMetric}>{metric}</Text>
      {business.isAcquired &&
        (business.sector === "Retail" || business.sector === "Mobility") &&
        level === 1 && (
          <Text style={styles.levelTeaser}>
            {levelConfig(business).milestones[2].teaser}
          </Text>
        )}
      <Text style={styles.cardDescription}>
        {sectorDescription[business.sector]}
      </Text>
      <View style={styles.cardFooter}>
        {business.isAcquired ? (
          progressive ? (
            <View style={{ flex: 1 }}>
              <View style={styles.cardStatsRow}>
                <View>
                  <Text style={styles.earnLabel}>STATUS</Text>
                  <Text style={styles.cardStatValue}>
                    {level === 1 ? "OPERATING" : `LEVEL ${level}`}
                  </Text>
                </View>
                <View>
                  <Text style={styles.earnLabel}>REVENUE / HR</Text>
                  <Text style={styles.cardStatValue}>
                    {formatCurrency(Math.max(0, business.hourlyNetProfit))}
                  </Text>
                </View>
                <View>
                  <Text style={styles.earnLabel}>NET / HR</Text>
                  <Text style={[styles.cardStatValue, { color }]}>
                    {formatCurrency(Math.max(0, business.hourlyNetProfit))}
                  </Text>
                </View>
              </View>
              {level === 1 &&
              (business.sector === "Retail" ||
                business.sector === "Mobility") ? (
                <Pressable
                  style={[styles.cardAction, { borderColor: `${color}66` }]}
                  onPress={onQuickAction}
                >
                  <Text style={[styles.cardActionText, { color }]}>
                    {business.sector === "Retail"
                      ? "RESTOCK 1,000"
                      : "BUY VEHICLE"}
                  </Text>
                </Pressable>
              ) : (
                <Text style={[styles.arrow, { color, alignSelf: "flex-end" }]}>
                  ›
                </Text>
              )}
            </View>
          ) : (
            <>
              <View>
                <Text style={styles.earnLabel}>NET CASHFLOW</Text>
                <Text style={[styles.earnValue, { color }]}>
                  {formatCurrency(business.hourlyNetProfit)}
                  <Text style={styles.perHour}> / HR</Text>
                </Text>
              </View>
              <Text style={[styles.arrow, { color }]}>›</Text>
            </>
          )
        ) : unlocked ? (
          <>
            <View>
              <Text style={styles.earnLabel}>ENTRY CAPITAL</Text>
              <Text style={styles.entryValue}>
                {formatCurrency(business.acquisitionCost)}
              </Text>
            </View>
            <Text style={[styles.startText, { color }]}>START ›</Text>
          </>
        ) : (
          <>
            <View>
              <Text style={styles.earnLabel}>UNLOCK AT</Text>
              <Text style={styles.entryValue}>
                Need{" "}
                {formatCurrency(
                  Math.max(0, business.unlockNetWorthRequired - netWorth),
                )}{" "}
                more
              </Text>
            </View>
            <Text style={styles.lockIcon}>⌁</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}
function BusinessIcon({
  sector,
  color,
}: {
  sector: BusinessEntity["sector"];
  color: string;
}) {
  return (
    <Svg width={37} height={37} viewBox="0 0 40 40">
      <Circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        opacity=".9"
      />
      {sector === "Retail" && (
        <>
          <Path d="M10 17h20l-2-6H12l-2 6Z" fill={color} opacity=".9" />
          <Path
            d="M12 18v11h16V18M17 22h6v7h-6"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </>
      )}
      {sector === "Mobility" && (
        <>
          <Path
            d="M11 24l2-8c.3-1.2 1.2-2 2.4-2h9.2c1.2 0 2.1.8 2.4 2l2 8"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Path
            d="M10 24h20v4H10zM14 28v2M26 28v2M14 18h12"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Circle cx="15" cy="25" r="1.5" fill={color} />
          <Circle cx="25" cy="25" r="1.5" fill={color} />
        </>
      )}
      {sector === "Tech_SaaS" && (
        <>
          <Rect
            x="11"
            y="12"
            width="18"
            height="16"
            rx="2"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Path
            d="M15 17h10M15 21h6M16 12v-3M24 12v-3"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      {sector === "Construction_Mega" && (
        <>
          <Path
            d="M12 29V17l8-7 8 7v12"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Path d="M9 29h22M16 29v-7h8v7" stroke={color} strokeWidth="2" />
          <Path
            d="M20 10V7h8"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      {sector === "Real_Estate" && (
        <>
          <Path
            d="M11 29V14l9-6 9 6v15M16 29V20h8v9M8 29h24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </>
      )}
      {sector === "Energy" && (
        <>
          <Path
            d="M23 7 12 22h8l-3 11 11-16h-8l3-10Z"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </>
      )}
      {sector === "Pharma" && (
        <>
          <Path
            d="M14 10a5 5 0 0 1 7.1 0l4.9 4.9a5 5 0 0 1-7.1 7.1L14 17.1A5 5 0 0 1 14 10Z"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Path d="M16 12l8 8" stroke={color} strokeWidth="2" />
        </>
      )}
      {sector === "Media" && (
        <>
          <Path
            d="M12 12h16v16H12z"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Path d="M16 16l8 4-8 4v-8Z" fill={color} />
        </>
      )}
      {sector === "Sports" && (
        <>
          <Circle
            cx="20"
            cy="20"
            r="9"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Path
            d="M14 14l12 12M26 14 14 26M11 20h18"
            stroke={color}
            strokeWidth="1.5"
          />
        </>
      )}
      {sector === "Airline" && (
        <>
          <Path
            d="M8 22 32 18 21 15l-3-7-3 1 1 7-8 3Z"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  errorBoundary: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorBoundaryTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  errorBoundaryAction: {
    color: C.cyan,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
  },
  safe: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 120,
  },
  factoryCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#B9C7D0",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  factoryCardCopy: { flex: 1 },
  factoryEyebrow: {
    color: "#49677C",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  factoryTitle: {
    color: "#132334",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
  factoryCopy: { color: "#708293", fontSize: 10, lineHeight: 15, marginTop: 4 },
  factoryButton: {
    backgroundColor: "#132334",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  factoryButtonText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  constructionCard: {
    backgroundColor: "#FFF8E7",
    borderColor: "#E7C976",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  constructionEyebrow: {
    color: "#B26E0D",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  constructionButton: {
    backgroundColor: "#B26E0D",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  dealershipCard: {
    backgroundColor: "#EEF6FF",
    borderColor: "#A9C8F2",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dealershipEyebrow: {
    color: "#1769D3",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  dealershipButton: {
    backgroundColor: "#1769D3",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  softwareCard: {
    backgroundColor: "#F1EEFF",
    borderColor: "#C7B8F6",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  softwareEyebrow: {
    color: "#7250C7",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  softwareButton: {
    backgroundColor: "#7250C7",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  sportsCard: {
    backgroundColor: "#F1F8FF",
    borderColor: "#A9C8F2",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sportsEyebrow: {
    color: "#1769AA",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sportsButton: {
    backgroundColor: "#1769AA",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  oilGasCard: {
    backgroundColor: "#F4FAFF",
    borderColor: "#8CC7E8",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  oilGasEyebrow: {
    color: "#087E9E",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  oilGasButton: {
    backgroundColor: "#087E9E",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  airlineCard: {
    backgroundColor: "#F2F7FF",
    borderColor: "#9BBCE8",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  airlineEyebrow: {
    color: "#2C63B6",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  airlineButton: {
    backgroundColor: "#2C63B6",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  hotelCard: {
    backgroundColor: "#FFF8EA",
    borderColor: "#E6C982",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hotelEyebrow: {
    color: "#9B6B18",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  hotelButton: {
    backgroundColor: "#B37A1B",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  blockchainCard: {
    backgroundColor: "#EEF7FF",
    borderColor: "#8CC8EA",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  blockchainEyebrow: {
    color: "#087E9E",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  blockchainButton: {
    backgroundColor: "#087E9E",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  spaceCard: {
    backgroundColor: "#EEF3FF",
    borderColor: "#9BAFE5",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  spaceEyebrow: {
    color: "#3856A7",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  spaceButton: {
    backgroundColor: "#3856A7",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  holdingCard: {
    backgroundColor: "#F1F7FF",
    borderColor: "#78A8D8",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  holdingEyebrow: {
    color: "#245B91",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  holdingButton: {
    backgroundColor: "#245B91",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  bankingCard: {
    backgroundColor: "#F4F9FF",
    borderColor: "#A9C8F2",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bankingEyebrow: {
    color: "#1769AA",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  bankingButton: {
    backgroundColor: "#1769AA",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  shippingCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#B9D2F5",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shippingCardCopy: { flex: 1 },
  shippingEyebrow: {
    color: "#1769E0",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  shippingTitle: {
    color: "#10233F",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
  shippingCopy: {
    color: "#64748B",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  shippingButton: {
    backgroundColor: "#1769E0",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  shippingButtonText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  taxiCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#B9D2F5",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taxiCardCopy: { flex: 1 },
  taxiEyebrow: {
    color: "#1769E0",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  taxiTitle: {
    color: "#10233F",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
  taxiCopy: { color: "#64748B", fontSize: 10, lineHeight: 15, marginTop: 4 },
  taxiButton: {
    backgroundColor: "#1769E0",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  taxiButtonText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  commandLine: {
    backgroundColor: "#102438",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#24506B",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
  },
  commandEyebrow: {
    color: C.cyan,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  commandValue: {
    color: C.white,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  summaryStrip: { flexDirection: "row", gap: 8, marginBottom: 10 },
  summaryMetric: {
    flex: 1,
    backgroundColor: "#102438",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#24506B",
  },
  summaryLabel: {
    color: C.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: C.white,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 5,
  },
  primaryActions: { flexDirection: "row", gap: 8, marginBottom: 12 },
  primaryButton: {
    flex: 1,
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: C.ink,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.cyan,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: C.cyan,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  nextMoveCard: {
    backgroundColor: "#112D26",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.green,
    padding: 14,
    marginBottom: 12,
  },
  nextMoveText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 5,
  },
  emptyCompanies: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    padding: 14,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    marginBottom: 12,
  },
  levelUpCard: {
    backgroundColor: "#173B35",
    borderWidth: 1,
    borderColor: C.green,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  levelUpEyebrow: {
    color: C.green,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  levelUpTitle: {
    color: C.white,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 5,
  },
  levelUpCopy: { color: "#C8F7E5", fontSize: 11, lineHeight: 16, marginTop: 5 },
  dismissText: { color: C.cyan, fontSize: 9, fontWeight: "900", marginTop: 10 },
  hero: {
    minHeight: 164,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2B6780",
    marginBottom: 12,
  },
  heroContent: { flex: 1, padding: 16, justifyContent: "flex-start" },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  eyebrow: {
    color: C.green,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  heroTitle: {
    color: C.white,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    marginTop: 6,
    maxWidth: "100%",
  },
  heroCopy: { color: "#B5D7E8", fontSize: 12, fontWeight: "700", marginTop: 8 },
  activeBadge: {
    width: 56,
    flexShrink: 0,
    minHeight: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#081522AA",
    borderWidth: 1,
    borderColor: "#48D6FF66",
    alignItems: "center",
    justifyContent: "center",
  },
  activeNumber: { color: C.white, fontSize: 20, fontWeight: "900" },
  activeLabel: {
    color: C.cyan,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroStats: { flexDirection: "row", gap: 30, marginTop: 14 },
  statLabel: {
    color: "#7EAAC0",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  statValue: { color: C.white, fontSize: 16, fontWeight: "900", marginTop: 4 },
  goalCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    marginBottom: 12,
  },
  goalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  goalEyebrow: {
    color: C.cyan,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  goalTitle: {
    color: C.white,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 5,
    maxWidth: 260,
  },
  goalPercent: { color: C.green, fontSize: 18, fontWeight: "900" },
  goalTrack: {
    height: 8,
    backgroundColor: "#20354B",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 13,
  },
  goalFill: { height: "100%", borderRadius: 8, backgroundColor: C.green },
  goalBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },
  goalText: { color: C.muted, fontSize: 9, fontWeight: "700" },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  sectionEyebrow: {
    color: C.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  sectionTitle: {
    color: C.white,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },
  sectionCount: {
    color: C.cyan,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  businessCard: {
    width: "48.4%",
    minHeight: 214,
    backgroundColor: C.card,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    overflow: "hidden",
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    right: -42,
    top: -34,
    opacity: 0.08,
  },
  lockedCard: { opacity: 0.58 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconBubble: {
    width: 51,
    height: 51,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cardPills: { alignItems: "flex-end", gap: 5 },
  tierPill: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.7,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  livePill: {
    color: C.green,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  lockPill: {
    color: C.red,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  cardSector: {
    color: C.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 12,
  },
  cardTitle: {
    color: C.white,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
    marginTop: 4,
    minHeight: 36,
  },
  cardMetric: { color: C.muted, fontSize: 10, lineHeight: 14, marginTop: 4 },
  levelTeaser: {
    color: C.gold,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 4,
    fontWeight: "800",
  },
  cardStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
    marginTop: 8,
  },
  cardStatValue: {
    color: C.white,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
  },
  cardAction: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: "center",
    marginTop: 8,
  },
  cardActionText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  cardDescription: {
    color: "#B7C9D8",
    fontSize: 9,
    lineHeight: 13,
    marginTop: 5,
    minHeight: 26,
  },
  milestoneRail: { gap: 8, paddingBottom: 12 },
  milestone: {
    width: 142,
    minHeight: 82,
    backgroundColor: "#101D2D",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  milestoneDone: { backgroundColor: "#102F2A", borderColor: C.green },
  milestoneAmount: { color: C.cyan, fontSize: 10, fontWeight: "900" },
  milestoneLabel: {
    color: C.white,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 4,
  },
  milestoneCopy: { color: C.muted, fontSize: 8, lineHeight: 11, marginTop: 3 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 12,
  },
  earnLabel: {
    color: "#6E879E",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  earnValue: { fontSize: 14, fontWeight: "900", marginTop: 3 },
  perHour: { color: C.muted, fontSize: 8, fontWeight: "700" },
  entryValue: { color: C.white, fontSize: 12, fontWeight: "900", marginTop: 3 },
  startText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  arrow: { fontSize: 26, fontWeight: "300", lineHeight: 25 },
  lockIcon: { color: C.muted, fontSize: 20 },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#102438",
    borderRadius: 14,
    padding: 13,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#24506B",
  },
  tipIcon: { color: C.gold, fontSize: 19, marginRight: 10 },
  tipTitle: { color: C.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  tipCopy: { color: "#9FB7CA", fontSize: 10, lineHeight: 15, marginTop: 4 },
});
export default BusinessScreen;
