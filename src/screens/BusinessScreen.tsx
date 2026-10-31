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
import BusinessRegistrationModal from "../components/modals/BusinessRegistrationModal";
import { useGame } from "../context/GameContext";
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
  normalizeBusinessLevel,
} from "../engine/businessLevels";
import { designSystem } from "../theme/designSystem";
import { buildCanonicalBusinessRegistry, canonicalActiveCount } from "../engine/canonicalBusinessRegistry";
import type { CanonicalBusiness } from "../engine/canonicalBusinessRegistry";
import { getBusinessDisplayMeta } from "../data/businessDisplayCatalog";
import { BusinessPortfolioCard } from "../components/business/BusinessPortfolioCard";
import { commitBusinessAcquisition } from "../engine/businessAcquisition";
import {
  buildUnifiedBusinessPortfolio,
  portfolioStatus,
  portfolioUnlockShortfall,
  sourceBusinessForPortfolioRecord,
} from "../engine/businessPortfolio";
import {
  BUSINESS_PORTFOLIO_ROUTE_ID,
  getBusinessRouteByKind,
} from "./business/businessRouteCatalog";
import type { BusinessRouteScreen } from "./business/businessRouteCatalog";

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
  ink: designSystem.colors.heading,
};
type Props = {
  routeId?: typeof BUSINESS_PORTFOLIO_ROUTE_ID;
  state?: RetailShopState;
  cash: number;
  netWorth: number;
  netIncomePerHour: number;
  timestamp: number;
  ipoListing?: IPOListing | null;
  ipoListings?: Record<string, IPOListing>;
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
  Banking: "#1769AA",
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
  routeId = BUSINESS_PORTFOLIO_ROUTE_ID,
  cash,
  netWorth,
  netIncomePerHour,
  timestamp,
  ipoListing,
  ipoListings,
  onIPOComplete,
  onCashChange,
  onOpenBank,
  focusRetail = false,
  onRetailFocusHandled,
  onLedger,
}: Props) {
  // App mounts this component only as the canonical Business Portfolio route.
  // Keep the assertion close to the route boundary so a second business mount
  // cannot silently become an alternate navigation authority.
  if (routeId !== BUSINESS_PORTFOLIO_ROUTE_ID) {
    throw new Error(`Unsupported business route: ${String(routeId)}`);
  }
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
  const celebratedRef = useRef("");
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
  const canonicalRegistry = useMemo(
    () =>
      buildCanonicalBusinessRegistry({
        businesses,
        taxiCompany,
        shippingCompany,
        factoryCompany,
        constructionCompany,
        dealership,
        softwareCompany,
        sportsClub,
        oilGas,
        airline,
        hotel,
        blockchain,
        space,
        holding,
      }),
    [
      businesses,
      taxiCompany,
      shippingCompany,
      factoryCompany,
      constructionCompany,
      dealership,
      softwareCompany,
      sportsClub,
      oilGas,
      airline,
      hotel,
      blockchain,
      space,
      holding,
    ],
  );
  const activeCount = canonicalActiveCount(canonicalRegistry);
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
  const portfolioRows = useMemo(
    () => buildUnifiedBusinessPortfolio(canonicalRegistry, businesses),
    [businesses, canonicalRegistry],
  );
  const openSportsClub = () => {
    if (sportsClub) return setSportsOpen(true);
    const setupCost = 250000;
    if (cash < setupCost) {
      Alert.alert("SPORTS CLUB LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the club charter and first season budget.`);
      return;
    }
    const result = commitBusinessAcquisition({
      key: "sports-charter",
      businessId: DEFAULT_SPORTS_CLUB.id,
      businessName: DEFAULT_SPORTS_CLUB.clubName,
      amount: setupCost,
      detail: "Club headquarters and first-season operating reserve",
      cash,
      onCashChange,
      onLedger,
      onCommit: () => {
        setSportsClub({ ...DEFAULT_SPORTS_CLUB, cashReserve: setupCost });
        setSportsOpen(true);
      },
    });
    if (!result.accepted && result.reason === "insufficient-funds")
      Alert.alert("SPORTS CLUB LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the club charter and first season budget.`);
  };
  const openOilGas = () => {
    if (oilGas) return setOilGasOpen(true);
    const setupCost = 400000;
    if (cash < setupCost) {
      Alert.alert("OIL & GAS LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the energy charter and first field budget.`);
      return;
    }
    const result = commitBusinessAcquisition({
      key: "oilgas-charter",
      businessId: DEFAULT_OIL_GAS.id,
      businessName: DEFAULT_OIL_GAS.companyName,
      amount: setupCost,
      detail: "Energy headquarters and first-field operating reserve",
      cash,
      onCashChange,
      onLedger,
      onCommit: () => {
        setOilGas({ ...DEFAULT_OIL_GAS, cashReserve: setupCost });
        setOilGasOpen(true);
      },
    });
    if (!result.accepted && result.reason === "insufficient-funds")
      Alert.alert("OIL & GAS LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the energy charter and first field budget.`);
  };
  const openAirline = () => {
    if (airline) return setAirlineOpen(true);
    const setupCost = 600000;
    if (cash < setupCost) {
      Alert.alert("AIRLINE LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the air operator certificate and launch fleet.`);
      return;
    }
    const result = commitBusinessAcquisition({
      key: "airline-charter",
      businessId: DEFAULT_AIRLINE.id,
      businessName: DEFAULT_AIRLINE.companyName,
      amount: setupCost,
      detail: "Air operator certificate and launch fleet reserve",
      cash,
      onCashChange,
      onLedger,
      onCommit: () => {
        setAirline({ ...DEFAULT_AIRLINE, cashReserve: setupCost });
        setAirlineOpen(true);
      },
    });
    if (!result.accepted && result.reason === "insufficient-funds")
      Alert.alert("AIRLINE LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the air operator certificate and launch fleet.`);
  };
  const openHotel = () => {
    if (hotel) return setHotelOpen(true);
    const setupCost = 420000;
    if (cash < setupCost) {
      Alert.alert("HOTEL LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the property acquisition and opening team.`);
      return;
    }
    const result = commitBusinessAcquisition({
      key: "hotel-charter",
      businessId: DEFAULT_HOTEL.id,
      businessName: DEFAULT_HOTEL.companyName,
      amount: setupCost,
      detail: "Property acquisition and opening team reserve",
      cash,
      onCashChange,
      onLedger,
      onCommit: () => {
        setHotel({ ...DEFAULT_HOTEL, cashReserve: setupCost });
        setHotelOpen(true);
      },
    });
    if (!result.accepted && result.reason === "insufficient-funds")
      Alert.alert("HOTEL LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the property acquisition and opening team.`);
  };
  const openBlockchain = () => {
    if (blockchain) return setBlockchainOpen(true);
    const setupCost = 300000;
    if (cash < setupCost) {
      Alert.alert("TECHNOLOGY LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the infrastructure and research launch.`);
      return;
    }
    const result = commitBusinessAcquisition({
      key: "blockchain-charter",
      businessId: DEFAULT_BLOCKCHAIN.id,
      businessName: DEFAULT_BLOCKCHAIN.companyName,
      amount: setupCost,
      detail: "Infrastructure and research launch reserve",
      cash,
      onCashChange,
      onLedger,
      onCommit: () => {
        setBlockchain({ ...DEFAULT_BLOCKCHAIN, cashReserve: setupCost });
        setBlockchainOpen(true);
      },
    });
    if (!result.accepted && result.reason === "insufficient-funds")
      Alert.alert("TECHNOLOGY LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the infrastructure and research launch.`);
  };
  const openSpace = () => {
    if (space) return setSpaceOpen(true);
    const setupCost = 850000;
    if (cash < setupCost) {
      Alert.alert("AEROSPACE LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the launch program and engineering team.`);
      return;
    }
    const result = commitBusinessAcquisition({
      key: "space-charter",
      businessId: DEFAULT_SPACE.id,
      businessName: DEFAULT_SPACE.companyName,
      amount: setupCost,
      detail: "Launch program and engineering team reserve",
      cash,
      onCashChange,
      onLedger,
      onCommit: () => {
        setSpace({ ...DEFAULT_SPACE, cashReserve: setupCost });
        setSpaceOpen(true);
      },
    });
    if (!result.accepted && result.reason === "insufficient-funds")
      Alert.alert("AEROSPACE LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the launch program and engineering team.`);
  };
  const openHolding = () => {
    if (holding) return setHoldingOpen(true);
    const setupCost = 1200000;
    if (cash < setupCost) {
      Alert.alert("HOLDING COMPANY LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the corporate headquarters and group treasury.`);
      return;
    }
    const result = commitBusinessAcquisition({
      key: "holding-charter",
      businessId: DEFAULT_HOLDING.id,
      businessName: DEFAULT_HOLDING.companyName,
      amount: setupCost,
      detail: "Corporate headquarters and group treasury reserve",
      cash,
      onCashChange,
      onLedger,
      onCommit: () => {
        setHolding({ ...DEFAULT_HOLDING, cashReserve: setupCost });
        setHoldingOpen(true);
      },
    });
    if (!result.accepted && result.reason === "insufficient-funds")
      Alert.alert("HOLDING COMPANY LOCKED", `Need ${formatCurrency(setupCost - cash)} more for the corporate headquarters and group treasury.`);
  };
  const openSpecializedRoute = (
    screen: Exclude<BusinessRouteScreen, "portfolio" | "business-master-hub">,
  ) => {
    switch (screen) {
      case "taxi":
        setTaxiOpen(true);
        return;
      case "shipping":
        setShippingOpen(true);
        return;
      case "factory":
        setFactoryOpen(true);
        return;
      case "construction":
        setConstructionOpen(true);
        return;
      case "dealership":
        setDealershipOpen(true);
        return;
      case "software":
        setSoftwareOpen(true);
        return;
      case "sports":
        openSportsClub();
        return;
      case "oilGas":
        openOilGas();
        return;
      case "airline":
        openAirline();
        return;
      case "hotel":
        openHotel();
        return;
      case "blockchain":
        openBlockchain();
        return;
      case "space":
        openSpace();
        return;
      case "holding":
        openHolding();
        return;
      default:
        return;
    }
  };
  const openPortfolioRecord = (record: CanonicalBusiness) => {
    if (portfolioStatus(record, businesses, netWorth) === "locked") return;
    if (record.owned) {
      if (record.kind === "generic") setSelectedId(record.id);
      else openSpecializedRoute(getBusinessRouteByKind(record.kind).screen as Exclude<BusinessRouteScreen, "portfolio" | "business-master-hub">);
      return;
    }
    if (record.kind !== "generic") {
      openSpecializedRoute(getBusinessRouteByKind(record.kind).screen as Exclude<BusinessRouteScreen, "portfolio" | "business-master-hub">);
      return;
    }
    const source = sourceBusinessForPortfolioRecord(record, businesses);
    if (source) setRegistrationId(source.id);
  };
  const ownedRows = portfolioRows.filter((record) => portfolioStatus(record, businesses, netWorth) === "owned");
  const availableRows = portfolioRows.filter((record) => portfolioStatus(record, businesses, netWorth) === "available");
  const lockedRows = portfolioRows.filter((record) => portfolioStatus(record, businesses, netWorth) === "locked");
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
  const selectedCanonical = selected
    ? canonicalRegistry.find((record) => record.id === selected.id)
    : null;
  const selectedRoute = selectedCanonical?.source === "specialized-state"
    ? getBusinessRouteByKind(selectedCanonical.kind)
    : null;
  if (selectedRoute?.screen === "construction")
    return (
      <ConstructionCompanyScreen
        company={constructionCompany}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setConstructionCompany || (() => undefined)}
        onBack={() => setSelectedId(null)}
        onLedger={onLedger}
      />
    );
  if (selectedRoute?.screen === "software")
    return (
      <SoftwareCompanyScreen
        company={softwareCompany}
        cash={cash}
        onCashChange={onCashChange}
        onChange={setSoftwareCompany || (() => undefined)}
        onBack={() => setSelectedId(null)}
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
        ipoListing={ipoListings?.[selected.id] ?? (ipoListing?.companyId === selected.id ? ipoListing : null)}
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
    if (!registrationTarget) {
      return;
    }
    const target = registrationTarget;
    const total = fee + target.acquisitionCost;
    if (cash < total) {
      Alert.alert(
        "INSUFFICIENT CAPITAL",
        `This deal requires ${formatCurrency(total)} liquid cash.`,
      );
      return;
    }
    const result = commitBusinessAcquisition({
      key: `generic:${target.id}`,
      businessId: target.id,
      businessName: name,
      amount: total,
      detail: `${structure} acquisition`,
      cash,
      onCashChange,
      onLedger,
      onCommit: () => {
        setBusinesses((items) =>
          items.map((item) =>
            item.id === target.id
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
      },
    });
    if (!result.accepted && result.reason === "insufficient-funds") {
      Alert.alert(
        "INSUFFICIENT CAPITAL",
        `This deal requires ${formatCurrency(total)} liquid cash.`,
      );
    }
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
              value={`${activeCount} / ${canonicalRegistry.length}`}
            />
          </View>
          <View style={styles.sectionHead}>
            <View style={styles.sectionHeadCopy}>
              <Text style={styles.sectionEyebrow}>BUSINESS PORTFOLIO</Text>
              <Text style={styles.sectionTitle}>One empire, one source of truth</Text>
            </View>
            <Text style={styles.sectionCount}>{portfolioRows.length} ROUTES</Text>
          </View>
          <Text style={styles.portfolioIntro}>Owned, available and locked companies are sourced from the canonical registry. Specialized companies keep their own engines and open through the same portfolio route.</Text>
          <View style={styles.portfolioGroup}>
            <Text style={styles.portfolioGroupTitle}>OWNED · {ownedRows.length}</Text>
            {ownedRows.map((record) => (
              <BusinessPortfolioCard
                key={`owned-${record.id}`}
                record={record}
                display={getBusinessDisplayMeta(record.kind)}
                status="owned"
                onPress={() => openPortfolioRecord(record)}
              />
            ))}
            {ownedRows.length === 0 && <Text style={styles.emptyCompanies}>No owned companies yet. Start with an available opportunity below.</Text>}
          </View>
          <View style={styles.portfolioGroup}>
            <Text style={styles.portfolioGroupTitle}>AVAILABLE · {availableRows.length}</Text>
            {availableRows.map((record) => {
              return (
                <BusinessPortfolioCard
                  key={`available-${record.id}`}
                  record={record}
                  display={getBusinessDisplayMeta(record.kind)}
                  status="available"
                  actionLabel={record.source === "generic-state" ? "INCORPORATE" : "START"}
                  onPress={() => openPortfolioRecord(record)}
                  unlockShortfall={portfolioUnlockShortfall(record, businesses, netWorth)}
                />
              );
            })}
          </View>
          {lockedRows.length > 0 && (
            <View style={styles.portfolioGroup}>
              <Text style={styles.portfolioGroupTitle}>LOCKED · {lockedRows.length}</Text>
              {lockedRows.map((record) => {
                return (
                  <BusinessPortfolioCard
                    key={`locked-${record.id}`}
                    record={record}
                    display={getBusinessDisplayMeta(record.kind)}
                    status="locked"
                    unlockShortfall={portfolioUnlockShortfall(record, businesses, netWorth)}
                  />
                );
              })}
            </View>
          )}
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
    paddingTop: 4,
    paddingBottom: 144,
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
    backgroundColor: "#EAF3FF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#B9D2F5",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
  },
  commandEyebrow: {
    color: "#1769E0",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  commandValue: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  summaryStrip: { flexDirection: "row", gap: 8, marginBottom: 10 },
  summaryMetric: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#B9D2F5",
  },
  summaryLabel: {
    color: C.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: C.ink,
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
    backgroundColor: "#E7F5EF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.green,
    padding: 14,
    marginBottom: 12,
  },
  nextMoveText: {
    color: C.ink,
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
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sectionHeadCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
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
  portfolioIntro: { color: C.muted, fontSize: 12, lineHeight: 18, marginBottom: 14 },
  portfolioGroup: { marginBottom: 12 },
  portfolioGroupTitle: { color: C.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginBottom: 8 },
  sectionCount: {
    color: C.cyan,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    flexShrink: 1,
    maxWidth: 92,
    textAlign: "right",
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
  lockedCard: {
    backgroundColor: "#F1F4F7",
    borderColor: C.cardBorder,
  },
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
    color: C.muted,
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
