import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { LimitOrder, PortfolioPoint, RivalInvestor, TradeRecord } from "../types/market";
import { Asset, Holding } from "../types/marketAsset";
import {
  PortfolioAllocation,
  PortfolioSummary,
  PortfolioRange,
  holdingInvested,
  holdingUnrealizedPnl,
  portfolioRangePoints,
} from "../engine/portfolioEngine";
import { calculateMarketPulse } from "../engine/marketEngine";
import {
  previewTrade,
  quantityFromCashPercent,
  quantityFromHoldingPercent,
  TRADE_QUANTITY_PRESETS,
  TradePreview,
} from "../engine/tradeEngine";
import { PriceAlert, PriceAlertCondition } from "../types/marketIntelligence";
import { designSystem } from "../theme/designSystem";
import { TechnicalChartModal } from "./TechnicalChartModal";

const C = {
  background: "#F4F8FC",
  card: "#FFFFFF",
  navy: "#102544",
  blue: "#087AF2",
  blueSoft: "#EAF3FF",
  green: "#18A957",
  red: "#E03A4F",
  gold: "#F4B51B",
  muted: "#61758E",
  line: "#DDE7F1",
  icon: "#58718D",
};
const money = (value: number) => `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const short = (value: number) => {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absolute >= 1e9) return `${sign}$${(absolute / 1e9).toFixed(2)}B`;
  if (absolute >= 1e6) return `${sign}$${(absolute / 1e6).toFixed(2)}M`;
  if (absolute >= 1e3) return `${sign}$${(absolute / 1e3).toFixed(2)}K`;
  return money(value);
};
const percent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

type Filter = "dividend" | "cheap" | "crypto" | "watchlist" | "all";
type Side = "BUY" | "SELL";
type MarketView = "OVERVIEW" | "STOCKS" | "CRYPTO" | "WATCHLIST" | "PORTFOLIO" | "HISTORY" | "NEWS";
type TradeFilter = "ALL" | "BUY" | "SELL" | "LIMIT";
type MarketEvent = { id: string; headline: string; tick: number; timestamp: number };

type Props = {
  playerNetWorth: number;
  cash: number;
  assets: Asset[];
  holdings: Record<string, Holding>;
  watchlist: string[];
  toggleWatchlist: (assetId: string) => void;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  executeTrade: (asset: Asset, side: Side, quantity: number) => void;
  summary: PortfolioSummary;
  tradeHistory: TradeRecord[];
  limitOrders: LimitOrder[];
  portfolioHistory: PortfolioPoint[];
  rivalInvestors: RivalInvestor[];
  allocation: PortfolioAllocation[];
  systemTimeMs: number;
  marketEventHistory?: MarketEvent[];
  priceAlerts: PriceAlert[];
  onCreatePriceAlert: (alert: PriceAlert) => void;
  onRemovePriceAlert: (id: string) => void;
  onCreateLimitOrder: (asset: Asset, side: Side, quantity: number, limitPrice: number) => void;
  onCancelLimitOrder: (id: string) => void;
};

const tabs: Array<{ id: MarketView; label: string; icon: string }> = [
  { id: "OVERVIEW", label: "Overview", icon: "▥" },
  { id: "STOCKS", label: "Stocks", icon: "↗" },
  { id: "CRYPTO", label: "Crypto", icon: "₿" },
  { id: "WATCHLIST", label: "Watchlist", icon: "★" },
  { id: "PORTFOLIO", label: "Portfolio", icon: "◕" },
  { id: "HISTORY", label: "History", icon: "◷" },
  { id: "NEWS", label: "News", icon: "▤" },
];

export default function MarketScreen({
  playerNetWorth,
  cash,
  assets,
  holdings,
  watchlist,
  toggleWatchlist,
  filter,
  setFilter,
  executeTrade,
  summary,
  tradeHistory,
  limitOrders,
  portfolioHistory,
  rivalInvestors,
  allocation,
  systemTimeMs,
  marketEventHistory = [],
  priceAlerts,
  onCreatePriceAlert,
  onRemovePriceAlert,
  onCreateLimitOrder,
  onCancelLimitOrder,
}: Props) {
  const { width } = useWindowDimensions();
  const [view, setView] = useState<MarketView>("OVERVIEW");
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("ALL");
  const [portfolioRange, setPortfolioRange] = useState<PortfolioRange>("1D");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const compact = width < 620;
  const displayKind = view === "CRYPTO" ? "CRYPTO" : view === "STOCKS" || view === "OVERVIEW" ? "STOCK" : undefined;
  const displayAssets = useMemo(() => displayKind ? assets.filter((asset) => asset.kind === displayKind) : assets, [assets, displayKind]);
  const marketPulse = useMemo(() => calculateMarketPulse(displayAssets), [displayAssets]);
  const chartAsset = displayAssets[0];
  const currentSelected = assets.find((asset) => asset.id === selectedAssetId) || displayAssets[0] || assets[0];
  const activeAlerts = priceAlerts.filter((alert) => alert.enabled);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.015, duration: 180, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [assets, pulse]);

  const tabAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesSearch = !query || `${asset.name} ${asset.symbol} ${asset.sector || ""}`.toLowerCase().includes(query);
      const matchesView = view === "STOCKS" ? asset.kind === "STOCK" : view === "CRYPTO" ? asset.kind === "CRYPTO" : view === "WATCHLIST" ? watchlist.includes(asset.id) : true;
      const matchesFilter = filter === "crypto" ? asset.kind === "CRYPTO" : filter === "cheap" ? asset.price < 1000 : filter === "dividend" ? asset.dividend > 1 : filter === "watchlist" ? watchlist.includes(asset.id) : true;
      return matchesSearch && matchesView && matchesFilter;
    });
  }, [assets, filter, search, view, watchlist]);

  const rangePoints = useMemo(() => portfolioRangePoints(portfolioHistory, portfolioRange, systemTimeMs), [portfolioHistory, portfolioRange, systemTimeMs]);
  const filteredTrades = useMemo(() => tradeHistory.filter((record) => tradeFilter === "ALL" || record.side === tradeFilter || (tradeFilter === "LIMIT" && record.source === "LIMIT")), [tradeHistory, tradeFilter]);
  const tradeTotals = useMemo(() => ({ notional: filteredTrades.reduce((sum, record) => sum + record.notional, 0), realized: filteredTrades.reduce((sum, record) => sum + record.realizedPnl, 0) }), [filteredTrades]);
  const playerRank = useMemo(() => [...rivalInvestors.map((rival, index) => ({ name: rival.name, netWorth: Math.max(1000, playerNetWorth * (0.82 - index * 0.09)), strategy: rival.strategy, weeklyReturn: rival.weeklyReturn })), { name: "YOU", netWorth: playerNetWorth, strategy: "Active operator", weeklyReturn: summary.currentValue > 0 ? (summary.unrealizedPnl / summary.currentValue) * 100 : 0 }].sort((a, b) => b.netWorth - a.netWorth), [playerNetWorth, rivalInvestors, summary.currentValue, summary.unrealizedPnl]);

  const indexCards = useMemo(() => {
    const groups: Array<{ label: string; kind?: Asset["kind"]; sector?: string }> = view === "CRYPTO"
      ? [{ label: "Crypto Average", kind: "CRYPTO" }, { label: "Digital Assets", kind: "CRYPTO" }]
      : [{ label: "Stock Average", kind: "STOCK" }, { label: "US Stocks", kind: "STOCK" }, { label: "Technology", sector: "TECH" }, { label: "Crypto Average", kind: "CRYPTO" }];
    return groups.map((group) => {
      const members = assets.filter((asset) => (!group.kind || asset.kind === group.kind) && (!group.sector || asset.sector === group.sector));
      const value = members.length ? members.reduce((sum, asset) => sum + asset.price, 0) / Math.max(1, members.length) : 0;
      const change = members.length ? members.reduce((sum, asset) => sum + asset.change, 0) / members.length : 0;
      return { ...group, value, change };
    });
  }, [assets, view]);

  return (
    <View style={styles.root}>
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: 136 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.titleRow, compact && styles.titleRowCompact]}><View style={{ flex: 1, minWidth: 0 }}><Text style={styles.pageTitle}>{view === "CRYPTO" ? "Crypto" : "Markets"}</Text><Text style={styles.pageSubtitle}>{view === "CRYPTO" ? "Track digital assets and manage your crypto portfolio." : "Track simulated markets, invest and grow your wealth."}</Text></View><View style={[styles.searchBox, compact && styles.searchBoxCompact]}><Text style={styles.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder={view === "CRYPTO" ? "Search crypto assets..." : "Search stocks and companies..."} placeholderTextColor="#8193A7" style={styles.searchInput} /></View></View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRail} contentContainerStyle={styles.tabRailContent}>
          {tabs.map((tab) => <Pressable key={tab.id} onPress={() => setView(tab.id)} style={[styles.tab, view === tab.id && styles.tabActive]}><Text style={[styles.tabIcon, view === tab.id && styles.tabTextActive]}>{tab.icon}</Text><Text style={[styles.tabText, view === tab.id && styles.tabTextActive]}>{tab.label}</Text></Pressable>)}
        </ScrollView>

        {(view === "OVERVIEW" || view === "NEWS") && <View style={[styles.indexRow, compact && styles.indexRowCompact]}>{indexCards.map((item) => <IndexCard key={item.label} {...item} compact={compact} />)}</View>}
        {view === "NEWS" && <NewsPanel events={marketEventHistory} />}
        {view === "PORTFOLIO" && <PortfolioPanel summary={summary} allocation={allocation} points={rangePoints} range={portfolioRange} setRange={setPortfolioRange} rivalInvestors={playerRank} />}
        {view === "HISTORY" && <TradeHistory trades={filteredTrades} filter={tradeFilter} setFilter={setTradeFilter} totals={tradeTotals} />}

        {view !== "HISTORY" && view !== "NEWS" && <>
          <View style={[styles.mainGrid, compact && styles.stackGrid]}>
            <Animated.View style={[styles.chartCard, { transform: [{ scale: pulse }] }]}><View style={styles.cardHeader}><View><Text style={styles.cardTitle}><Text style={styles.chartIcon}>▥</Text> {chartAsset?.name || (view === "CRYPTO" ? "Crypto Market" : "Stock Market")}</Text><View style={styles.chartValueRow}><Text style={styles.chartValue}>{short(chartAsset?.price || 0)}</Text><Text style={(chartAsset?.change || 0) >= 0 ? styles.positive : styles.negative}>{percent(chartAsset?.change || 0)}</Text></View></View><View style={styles.rangeButtons}>{(["1D", "1W", "1M"] as const).map((range) => <Pressable key={range} onPress={() => setPortfolioRange(range)} style={[styles.rangeButton, range === portfolioRange && styles.rangeActive]}><Text style={[styles.rangeText, range === portfolioRange && styles.rangeTextActive]}>{range}</Text></Pressable>)}</View></View><LiveChart asset={chartAsset} width={Math.max(240, width - 64)} /></Animated.View>
            {(view === "OVERVIEW" || view === "PORTFOLIO") && <NewsPanel events={marketEventHistory} compact />}
          </View>
          <View style={styles.filterRail}>{(["all", "watchlist", "dividend", "cheap", "crypto"] as Filter[]).map((value) => <Pressable key={value} onPress={() => setFilter(value)} style={[styles.filterButton, filter === value && styles.filterActive]}><Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{value === "all" ? "ALL STOCKS" : value === "watchlist" ? "★ WATCHLIST" : value === "dividend" ? "↗ TOP GAINERS" : value === "cheap" ? "MOST TRADED" : "₿ CRYPTO"}</Text></Pressable>)}</View>
          <View style={styles.assetHeader}><Text style={[styles.headerCell, compact ? styles.headerCellCompactCompany : { flex: 1.8 }]}>COMPANY</Text><Text style={[styles.headerCell, compact && styles.headerCellCompact]}>PRICE</Text><Text style={[styles.headerCell, compact && styles.headerCellCompact]}>24H</Text><Text style={[styles.headerCell, compact && styles.headerCellCompact]}>CHART</Text><Text style={[styles.headerCell, compact && styles.headerCellCompact]}>ACTION</Text></View>
          <View style={styles.assetList}>{tabAssets.length ? tabAssets.slice(0, view === "OVERVIEW" ? 8 : 50).map((asset) => <AssetRow key={asset.id} asset={asset} compact={compact} holding={holdings[asset.id]} cash={cash} watchlisted={watchlist.includes(asset.id)} onWatch={() => toggleWatchlist(asset.id)} onTrade={() => setSelectedAssetId(asset.id)} onLimit={onCreateLimitOrder} priceAlerts={priceAlerts} onCreateAlert={onCreatePriceAlert} />) : <View style={styles.empty}><Text style={styles.emptyTitle}>NO MATCHING ASSETS</Text><Text style={styles.muted}>Try another tab, filter or search term.</Text></View>}</View>
          {(view === "OVERVIEW" || view === "PORTFOLIO") && <View style={[styles.bottomGrid, compact && styles.stackGrid]}><PortfolioPanel summary={summary} allocation={allocation} points={rangePoints} range={portfolioRange} setRange={setPortfolioRange} rivalInvestors={playerRank} compact /><QuickTrade asset={currentSelected} cash={cash} holding={currentSelected ? holdings[currentSelected.id] : undefined} onTrade={() => currentSelected && setSelectedAssetId(currentSelected.id)} /></View>}
        </>}
        {view === "WATCHLIST" && <View style={styles.watchSummary}><Text style={styles.cardTitle}>Your Watchlist</Text><Text style={styles.muted}>{watchlist.length} tracked assets · live prices update every market tick</Text></View>}
      </ScrollView>
      {selectedAssetId && currentSelected && <TradeModal visible asset={currentSelected} cash={cash} holding={holdings[currentSelected.id]} onClose={() => setSelectedAssetId(null)} onSubmit={(side, quantity) => { executeTrade(currentSelected, side, quantity); setSelectedAssetId(null); }} />}
    </View>
  );
}

function IndexCard({ label, value, change, compact = false }: { label: string; value: number; change: number; compact?: boolean }) { return <View style={[styles.indexCard, compact && styles.indexCardCompact]}><Text style={styles.indexLabel}>{label}</Text><Text style={styles.indexValue}>{short(value)}</Text><View style={styles.indexBottom}><Text style={change >= 0 ? styles.positive : styles.negative}>{change >= 0 ? "▲" : "▼"} {percent(change)}</Text><MiniChart positive={change >= 0} /></View></View>; }
function MiniChart({ positive }: { positive: boolean }) { return <Svg width={55} height={24}><Path d={positive ? "M1 20 L10 15 L17 18 L25 10 L32 14 L41 6 L54 2" : "M1 3 L10 9 L17 6 L25 14 L32 11 L41 18 L54 22"} fill="none" stroke={positive ? C.green : C.red} strokeWidth="2.3" /></Svg>; }
function LiveChart({ asset, width }: { asset?: Asset; width: number }) { const values = asset?.history?.slice(-32) || []; const height = 190; if (!values.length) return <View style={styles.chartEmpty}><Text style={styles.muted}>Live history will appear after the next market tick.</Text></View>; const min = Math.min(...values); const max = Math.max(...values); const span = Math.max(0.0001, max - min); const line = values.map((value, index) => `${index ? "L" : "M"}${(index / Math.max(1, values.length - 1)) * width},${height - ((value - min) / span) * (height - 24) - 12}`).join(" "); const area = `${line} L${width},${height} L0,${height} Z`; const positive = (values[values.length - 1] || 0) >= (values[0] || 0); return <View style={styles.liveChart}><Svg width={width} height={height}><Defs><LinearGradient id="market-area" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={C.blue} stopOpacity=".30" /><Stop offset="1" stopColor={C.blue} stopOpacity=".02" /></LinearGradient></Defs><Path d={area} fill="url(#market-area)" /><Path d={line} fill="none" stroke={positive ? C.blue : C.red} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></Svg><View style={styles.chartAxis}><Text style={styles.axisText}>{short(min)}</Text><Text style={styles.axisText}>{short(max)}</Text></View></View>; }

function NewsPanel({ events, compact = false }: { events: MarketEvent[]; compact?: boolean }) { const news = [...events].reverse().slice(0, 3); return <View style={[styles.newsCard, compact && styles.newsCompact]}><View style={styles.cardHeader}><Text style={styles.cardTitle}>Market News</Text><Text style={styles.viewAll}>View All</Text></View>{news.length ? news.map((event) => <View key={event.id} style={styles.newsRow}><View style={styles.newsImage}><Text>▥</Text></View><View style={{ flex: 1 }}><Text style={styles.newsTitle} numberOfLines={2}>{event.headline}</Text><Text style={styles.muted}>Market event · tick {event.tick}</Text></View></View>) : <Text style={styles.muted}>New market events will appear here as the simulated market moves.</Text>}</View>; }

function AssetRow({ asset, compact = false, holding, cash, watchlisted, onWatch, onTrade, onLimit, priceAlerts, onCreateAlert }: { asset: Asset; compact?: boolean; holding?: Holding; cash: number; watchlisted: boolean; onWatch: () => void; onTrade: () => void; onLimit: (asset: Asset, side: Side, quantity: number, limitPrice: number) => void; priceAlerts: PriceAlert[]; onCreateAlert: (alert: PriceAlert) => void }) {
  const [limitOpen, setLimitOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const pnl = holdingUnrealizedPnl(holding, asset.price);
  return <>
    <View style={[styles.assetRow, compact && styles.assetRowCompact]}>
      <View style={[styles.companyCell, compact ? styles.companyCellCompact : { flex: 1.8 }]}>
        {asset.logo ? <Image source={asset.logo} style={styles.assetLogo} resizeMode="contain" /> : <View style={styles.symbolLogo}><Text style={styles.symbolText}>{asset.symbol.slice(0, 2)}</Text></View>}
        <View style={{ flex: 1, minWidth: 0 }}><Text style={styles.assetName} numberOfLines={1}>{asset.name}</Text><Text style={styles.assetMeta} numberOfLines={1}>{asset.symbol} · {asset.sector || asset.kind}</Text></View>
      </View>
      <Text style={[styles.assetPrice, compact && styles.assetValueCompact]}>{short(asset.price)}</Text>
      <Text style={[styles.assetChange, compact && styles.assetValueCompact, asset.change >= 0 ? styles.positive : styles.negative]}>{asset.change >= 0 ? "▲" : "▼"} {percent(asset.change)}</Text>
      <Pressable onPress={() => setChartOpen(true)} style={[styles.sparkCell, compact && styles.sparkCellCompact]}><MiniChart positive={asset.change >= 0} /><Text style={pnl >= 0 ? styles.miniPnl : styles.negative}>{holding ? money(pnl) : "—"}</Text></Pressable>
      <View style={[styles.actionCell, compact && styles.actionCellCompact]}><Pressable onPress={onTrade} style={[styles.tradeButton, compact && styles.tradeButtonCompact]}><Text style={styles.tradeButtonText}>Trade</Text></Pressable><Pressable onPress={() => setLimitOpen(true)} style={styles.limitIcon}><Text style={styles.limitIconText}>↔</Text></Pressable><Pressable onPress={onWatch} style={styles.starButton}><Text style={watchlisted ? styles.starOn : styles.starOff}>{watchlisted ? "★" : "☆"}</Text></Pressable></View>
    </View>
    <LimitOrderModal visible={limitOpen} asset={asset} cash={cash} holding={holding} onClose={() => setLimitOpen(false)} onSubmit={(side, quantity, price) => { onLimit(asset, side, quantity, price); setLimitOpen(false); }} />
    <TechnicalChartModal visible={chartOpen} asset={asset} priceAlerts={priceAlerts.filter((alert) => alert.assetId === asset.id)} onClose={() => setChartOpen(false)} onCreateAlert={onCreateAlert} />
  </>;
}
function PortfolioPanel({ summary, allocation, points, range, setRange, rivalInvestors, compact = false }: { summary: PortfolioSummary; allocation: PortfolioAllocation[]; points: PortfolioPoint[]; range: PortfolioRange; setRange: (range: PortfolioRange) => void; rivalInvestors: Array<{ name: string; netWorth: number; strategy: string; weeklyReturn: number }>; compact?: boolean }) { return <View style={[styles.portfolioCard, compact && styles.portfolioCompact]}><View style={styles.cardHeader}><Text style={styles.cardTitle}>◕ My Portfolio</Text><Text style={styles.viewAll}>View All ›</Text></View><View style={styles.portfolioStats}><Stat label="Total Invested" value={summary.totalInvested} /><Stat label="Current Value" value={summary.currentValue} /><Stat label="Total P/L" value={summary.unrealizedPnl} positive={summary.unrealizedPnl >= 0} /></View><View style={styles.portfolioStats}><Stat label="Stocks & Crypto" value={summary.currentValue} compactValue /><Stat label="Realized P/L" value={summary.realizedPnl} positive={summary.realizedPnl >= 0} compactValue /><Stat label="Today's P/L" value={summary.unrealizedPnl} positive={summary.unrealizedPnl >= 0} compactValue /></View>{!compact && <><Text style={styles.sectionLabel}>ALLOCATION</Text>{allocation.slice(0, 4).map((item) => <View key={item.id} style={styles.allocationRow}><View style={[styles.allocationDot, { backgroundColor: item.color }]} /><Text style={styles.allocationLabel}>{item.label}</Text><Text style={styles.muted}>{short(item.value)} · {item.percentage.toFixed(1)}%</Text></View>)}<Text style={styles.sectionLabel}>RIVALS</Text>{rivalInvestors.slice(0, 3).map((rival, index) => <View key={rival.name} style={styles.rivalRow}><Text style={styles.rank}>{index + 1}</Text><Text style={styles.allocationLabel}>{rival.name}</Text><Text style={styles.muted}>{short(rival.netWorth)}</Text></View>)}</>}</View>; }
function Stat({ label, value, positive, compactValue = false }: { label: string; value: number; positive?: boolean; compactValue?: boolean }) { return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={[compactValue ? styles.statSmallValue : styles.statValue, positive === undefined ? styles.navy : positive ? styles.positive : styles.negative]}>{short(value)}</Text></View>; }
function QuickTrade({ asset, cash, holding, onTrade }: { asset?: Asset; cash: number; holding?: Holding; onTrade: () => void }) { return <View style={styles.quickCard}><Text style={styles.cardTitle}>⚡ Quick Trade</Text>{asset ? <><View style={styles.quickAsset}><View style={styles.symbolLogo}><Text style={styles.symbolText}>{asset.symbol.slice(0, 2)}</Text></View><View style={{ flex: 1 }}><Text style={styles.assetName}>{asset.name} ({asset.symbol})</Text><Text style={styles.assetMeta}>{holding?.shares || 0} {asset.kind === "CRYPTO" ? "units" : "shares"}</Text></View><View><Text style={styles.assetPrice}>{short(asset.price)}</Text><Text style={asset.change >= 0 ? styles.positive : styles.negative}>{percent(asset.change)}</Text></View></View><View style={styles.quickInfo}><Text style={styles.muted}>Cash available</Text><Text style={styles.navy}>{money(cash)}</Text></View><Pressable onPress={onTrade} style={styles.reviewButton}><Text style={styles.reviewButtonText}>Review Buy / Sell Order</Text></Pressable></> : <Text style={styles.muted}>Select an asset to trade.</Text>}</View>; }

function TradeHistory({ trades, filter, setFilter, totals }: { trades: TradeRecord[]; filter: TradeFilter; setFilter: (filter: TradeFilter) => void; totals: { notional: number; realized: number } }) { return <View style={styles.historyCard}><View style={styles.cardHeader}><Text style={styles.cardTitle}>Trade History</Text><Text style={styles.muted}>{trades.length} entries</Text></View><View style={styles.filterRail}>{(["ALL", "BUY", "SELL", "LIMIT"] as TradeFilter[]).map((value) => <Pressable key={value} onPress={() => setFilter(value)} style={[styles.filterButton, filter === value && styles.filterActive]}><Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{value}</Text></Pressable>)}</View><View style={styles.tradeTotals}><Text style={styles.muted}>Notional {short(totals.notional)}</Text><Text style={totals.realized >= 0 ? styles.positive : styles.negative}>Realized P/L {money(totals.realized)}</Text></View>{trades.length ? trades.slice(-100).reverse().map((record) => <View key={record.id} style={styles.historyRow}><Text style={record.side === "BUY" ? styles.positive : styles.negative}>{record.side}</Text><View style={{ flex: 1 }}><Text style={styles.assetName}>{record.name} · {record.quantity} {record.symbol}</Text><Text style={styles.muted}>{new Date(record.timestamp).toLocaleString()} · {money(record.price)} × {record.quantity}</Text></View><Text style={record.realizedPnl >= 0 ? styles.positive : styles.negative}>{record.side === "SELL" ? money(record.realizedPnl) : "—"}</Text></View>) : <Text style={styles.muted}>No trades yet. Completed orders will appear here.</Text>}</View>; }

function LimitOrderModal({ visible, asset, cash, holding, onClose, onSubmit }: { visible: boolean; asset: Asset; cash: number; holding?: Holding; onClose: () => void; onSubmit: (side: Side, quantity: number, price: number) => void }) { const [side, setSide] = useState<Side>("BUY"); const [quantity, setQuantity] = useState("1"); const [price, setPrice] = useState(asset.price.toFixed(2)); const safePrice = Number(price) || 0; const safeQuantity = asset.kind === "CRYPTO" ? Number(quantity) : Math.floor(Number(quantity)); const total = Number((safePrice * Math.max(0, safeQuantity)).toFixed(2)); const valid = safeQuantity > 0 && safePrice > 0 && (side === "BUY" ? total <= cash : Boolean(holding && safeQuantity <= holding.shares)); return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalShade}><View style={styles.modal}><View style={styles.modalHeader}><View><Text style={styles.sectionLabel}>LIMIT ORDER</Text><Text style={styles.modalTitle}>{asset.name} ({asset.symbol})</Text></View><Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View><View style={styles.sideRow}><Pressable onPress={() => setSide("BUY")} style={[styles.sideButton, side === "BUY" && styles.sideBuy]}><Text style={styles.sideText}>BUY</Text></Pressable><Pressable onPress={() => setSide("SELL")} style={[styles.sideButton, side === "SELL" && styles.sideSell]}><Text style={styles.sideText}>SELL</Text></Pressable></View><Text style={styles.inputLabel}>QUANTITY</Text><TextInput value={quantity} onChangeText={setQuantity} keyboardType={asset.kind === "CRYPTO" ? "decimal-pad" : "number-pad"} style={styles.input} /><Text style={styles.inputLabel}>LIMIT PRICE</Text><TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.input} /><View style={styles.previewBox}><Text style={styles.sectionLabel}>ORDER PREVIEW</Text><Text style={styles.previewLine}>Quantity <Text style={styles.previewValue}>{safeQuantity}</Text></Text><Text style={styles.previewLine}>Limit price <Text style={styles.previewValue}>{money(safePrice)}</Text></Text><Text style={styles.previewLine}>Notional <Text style={styles.previewValue}>{money(total)}</Text></Text><Text style={styles.previewLine}>{side === "BUY" ? "Cash after fill" : "Cash after sale"} <Text style={styles.previewValue}>{money(side === "BUY" ? cash - total : cash + total)}</Text></Text></View><Pressable disabled={!valid} onPress={() => onSubmit(side, safeQuantity, safePrice)} style={[styles.reviewButton, !valid && styles.disabled]}><Text style={styles.reviewButtonText}>Place {side} Limit Order</Text></Pressable></View></View></Modal>; }

function TradeModal({ visible, asset, cash, holding, onClose, onSubmit }: { visible: boolean; asset: Asset; cash: number; holding?: Holding; onClose: () => void; onSubmit: (side: Side, quantity: number) => void }) { const [side, setSide] = useState<Side>("BUY"); const [quantity, setQuantity] = useState("1"); const preview: TradePreview = previewTrade(asset, side, Number(quantity), cash, holding); const choosePercent = (value: 0.25 | 0.5 | 0.75 | 1) => setQuantity(String(side === "BUY" ? quantityFromCashPercent(asset, cash, value) : quantityFromHoldingPercent(asset, holding, value))); const submit = () => { if (!preview.valid) return Alert.alert("ORDER REJECTED", preview.reason || "Check quantity and available funds."); const commit = () => onSubmit(side, preview.quantity); if (side === "BUY" && preview.total > cash * 0.5) Alert.alert("CONFIRM LARGE ORDER", `This uses ${((preview.total / Math.max(cash, 1)) * 100).toFixed(0)}% of available cash.`, [{ text: "CANCEL", style: "cancel" }, { text: "CONFIRM", onPress: commit }]); else commit(); }; return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalShade}><View style={styles.modal}><View style={styles.modalHeader}><View><Text style={styles.sectionLabel}>ORDER PREVIEW</Text><Text style={styles.modalTitle}>{asset.name} ({asset.symbol})</Text></View><Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View><View style={styles.sideRow}><Pressable onPress={() => setSide("BUY")} style={[styles.sideButton, side === "BUY" && styles.sideBuy]}><Text style={styles.sideText}>BUY</Text></Pressable><Pressable onPress={() => setSide("SELL")} style={[styles.sideButton, side === "SELL" && styles.sideSell]}><Text style={styles.sideText}>SELL</Text></Pressable></View><Text style={styles.inputLabel}>QUANTITY</Text><TextInput value={quantity} onChangeText={setQuantity} keyboardType={asset.kind === "CRYPTO" ? "decimal-pad" : "number-pad"} style={styles.input} /><View style={styles.quantityRail}>{TRADE_QUANTITY_PRESETS.map((value) => <Pressable key={value} onPress={() => setQuantity(String(value))} style={styles.quantityButton}><Text style={styles.quantityText}>{value}</Text></Pressable>)}{([0.25, 0.5, 0.75, 1] as const).map((value) => <Pressable key={value} onPress={() => choosePercent(value)} style={styles.quantityButton}><Text style={styles.quantityText}>{value === 1 ? (side === "BUY" ? "MAX" : "ALL") : `${value * 100}%`}</Text></Pressable>)}</View><View style={styles.previewBox}><Text style={styles.sectionLabel}>CONFIRMATION</Text><Text style={styles.previewLine}>Asset <Text style={styles.previewValue}>{asset.name}</Text></Text><Text style={styles.previewLine}>Quantity <Text style={styles.previewValue}>{preview.quantity}</Text></Text><Text style={styles.previewLine}>Price <Text style={styles.previewValue}>{money(preview.price)}</Text></Text><Text style={styles.previewLine}>Total {side === "BUY" ? "cost" : "proceeds"} <Text style={styles.previewValue}>{money(preview.total)}</Text></Text><Text style={styles.previewLine}>Cash after <Text style={styles.previewValue}>{money(preview.cashAfter)}</Text></Text><Text style={styles.previewLine}>Expected P/L <Text style={preview.expectedPnl >= 0 ? styles.positive : styles.negative}>{side === "SELL" ? money(preview.expectedPnl) : "—"}</Text></Text></View><Pressable onPress={submit} style={[styles.reviewButton, !preview.valid && styles.disabled]}><Text style={styles.reviewButtonText}>{side === "BUY" ? "Confirm Buy" : "Confirm Sell"}</Text></Pressable></View></View></Modal>; }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  screen: { flex: 1 },
  content: { padding: 16, paddingTop: 10 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48 },
  brandMark: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  brandCrown: { color: C.gold, fontSize: 35 },
  brandText: { marginRight: "auto" },
  brandName: { color: C.navy, fontSize: 22, fontWeight: "900", letterSpacing: -1 },
  brandBlue: { color: C.blue },
  brandSub: { color: C.muted, fontSize: 8, letterSpacing: 1.1, fontWeight: "800" },
  walletChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: C.line, shadowColor: "#9DB2C7", shadowOpacity: 0.12, shadowRadius: 5, elevation: 2 },
  walletIcon: { color: C.green, fontSize: 18 }, walletCash: { color: C.navy, fontWeight: "900", fontSize: 13 }, walletGain: { color: C.green, fontSize: 9, fontWeight: "800" },
  compactStat: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 8, borderWidth: 1, borderColor: C.line },
  coinIcon: { color: C.gold }, gemIcon: { color: "#3D9BFF" }, compactValue: { color: C.navy, fontWeight: "900", fontSize: 13 }, plus: { color: C.blue, fontSize: 18, fontWeight: "900" },
  headerIcon: { width: 31, height: 31, borderRadius: 16, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.line },
  badgeDot: { position: "absolute", top: -4, right: -3, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.red, alignItems: "center", justifyContent: "center" },
  avatar: { width: 39, height: 39, borderRadius: 20, backgroundColor: C.navy, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.gold }, avatarText: { color: "white", fontSize: 18, fontWeight: "900" }, level: { position: "absolute", bottom: -8, color: "white", fontSize: 8, fontWeight: "900", backgroundColor: C.navy, paddingHorizontal: 4, borderRadius: 5 },
  titleRow: { flexDirection: "row", alignItems: "flex-end", gap: 14, marginTop: 16, marginBottom: 14 }, titleRowCompact: { flexDirection: "column", alignItems: "stretch", gap: 9 }, pageTitle: { color: C.navy, fontSize: 37, lineHeight: 42, fontWeight: "900", letterSpacing: -1.5 }, pageSubtitle: { color: C.muted, fontSize: 14, fontWeight: "600", marginTop: 1 }, searchBox: { width: "43%", minWidth: 170, height: 48, flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.line, paddingHorizontal: 12 }, searchBoxCompact: { width: "100%", minWidth: 0 }, searchIcon: { color: C.icon, fontSize: 25 }, searchInput: { flex: 1, color: C.navy, fontSize: 12, marginLeft: 7 },
  tabRail: { flexGrow: 0, flexShrink: 0, marginBottom: 14 }, tabRailContent: { gap: 9, alignItems: "center" }, tab: { minWidth: 92, height: 51, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, backgroundColor: C.card, borderRadius: 11, borderWidth: 1, borderColor: C.line, shadowColor: "#9DB2C7", shadowOpacity: 0.08, shadowRadius: 5, elevation: 1 }, tabActive: { backgroundColor: C.blue, borderColor: C.blue }, tabIcon: { color: C.icon, fontSize: 19, fontWeight: "900" }, tabText: { color: C.navy, fontSize: 12, fontWeight: "800" }, tabTextActive: { color: "white" },
  indexRow: { flexDirection: "row", gap: 9, marginBottom: 14 }, indexRowCompact: { flexWrap: "wrap" }, indexCardCompact: { flexBasis: "47%" }, indexCard: { flex: 1, minWidth: 0, backgroundColor: C.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.line, shadowColor: "#9DB2C7", shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 }, indexLabel: { color: C.muted, fontSize: 11, fontWeight: "700" }, indexValue: { color: C.navy, fontSize: 20, fontWeight: "900", marginTop: 3 }, indexBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5 },
  mainGrid: { flexDirection: "row", gap: 12, alignItems: "stretch" }, stackGrid: { flexDirection: "column" }, chartCard: { flex: 1.8, minWidth: 0, backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.line, shadowColor: "#9DB2C7", shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 }, newsCard: { flex: 1, minWidth: 190, backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.line, shadowColor: "#9DB2C7", shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 }, newsCompact: { flex: 1, minWidth: 210 }, cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, cardTitle: { color: C.navy, fontSize: 17, fontWeight: "900" }, chartIcon: { color: C.blue }, chartValueRow: { flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 4 }, chartValue: { color: C.navy, fontSize: 25, fontWeight: "900" }, rangeButtons: { flexDirection: "row", borderRadius: 9, overflow: "hidden", borderWidth: 1, borderColor: C.line }, rangeButton: { paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#F8FBFE" }, rangeActive: { backgroundColor: C.blue }, rangeText: { color: C.muted, fontSize: 10, fontWeight: "800" }, rangeTextActive: { color: "white" }, liveChart: { marginTop: 11, position: "relative" }, chartAxis: { position: "absolute", left: 0, right: 0, top: 5, flexDirection: "row", justifyContent: "space-between" }, axisText: { color: C.muted, fontSize: 9 }, chartEmpty: { height: 190, alignItems: "center", justifyContent: "center" },
  newsRow: { flexDirection: "row", gap: 9, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.line }, newsImage: { width: 52, height: 52, borderRadius: 7, backgroundColor: C.blueSoft, alignItems: "center", justifyContent: "center" }, newsTitle: { color: C.navy, fontSize: 12, lineHeight: 16, fontWeight: "800" }, viewAll: { color: C.blue, fontSize: 12, fontWeight: "800" },
  filterRail: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 14, marginBottom: 8 }, filterButton: { height: 40, paddingHorizontal: 14, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: C.card, borderWidth: 1, borderColor: C.line }, filterActive: { backgroundColor: C.blueSoft, borderColor: C.blue }, filterText: { color: C.navy, fontSize: 11, fontWeight: "800" }, filterTextActive: { color: C.blue },
  assetHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.line }, headerCell: { flex: 1, color: C.muted, fontSize: 9, fontWeight: "900", textAlign: "center" }, headerCellCompactCompany: { flex: 1.25, fontSize: 8 }, headerCellCompact: { flex: 0.85, fontSize: 8 }, assetList: { backgroundColor: C.card, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: C.line }, assetRow: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: C.line }, assetRowCompact: { minHeight: 68, gap: 3, paddingHorizontal: 6 }, companyCellCompact: { flex: 1.25, gap: 4 }, assetValueCompact: { flex: 0.85, fontSize: 10 }, sparkCellCompact: { flex: 0.85 }, actionCellCompact: { flex: 1.15, gap: 1 }, tradeButtonCompact: { minWidth: 44, paddingHorizontal: 4, paddingVertical: 9 }, companyCell: { flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 }, assetLogo: { width: 34, height: 34, borderRadius: 8 }, symbolLogo: { width: 34, height: 34, borderRadius: 8, backgroundColor: C.blueSoft, alignItems: "center", justifyContent: "center" }, symbolText: { color: C.blue, fontWeight: "900", fontSize: 12 }, assetName: { color: C.navy, fontSize: 12, fontWeight: "800" }, assetMeta: { color: C.muted, fontSize: 10, marginTop: 2 }, assetPrice: { flex: 1, color: C.navy, fontSize: 12, fontWeight: "900", textAlign: "center" }, assetChange: { flex: 1, fontSize: 11, fontWeight: "900", textAlign: "center" }, sparkCell: { flex: 1, alignItems: "center" }, miniPnl: { color: C.green, fontSize: 9, fontWeight: "800" }, actionCell: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }, tradeButton: { backgroundColor: C.blue, borderRadius: 8, minWidth: 60, paddingVertical: 10, alignItems: "center" }, tradeButtonText: { color: "white", fontSize: 11, fontWeight: "900" }, limitIcon: { width: 24, height: 28, alignItems: "center", justifyContent: "center" }, limitIconText: { color: C.icon, fontSize: 17, fontWeight: "900" }, starButton: { width: 24, alignItems: "center" }, starOn: { color: C.gold, fontSize: 20 }, starOff: { color: "#8295AA", fontSize: 20 },
  bottomGrid: { flexDirection: "row", gap: 12, marginTop: 14 }, portfolioCard: { flex: 1.25, minWidth: 0, backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.line, shadowColor: "#9DB2C7", shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 }, portfolioCompact: { flex: 1 }, quickCard: { flex: 1, minWidth: 0, backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.line, shadowColor: "#9DB2C7", shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 }, portfolioStats: { flexDirection: "row", gap: 8, marginTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.line }, stat: { flex: 1, minWidth: 0 }, statLabel: { color: C.muted, fontSize: 10, fontWeight: "700" }, statValue: { color: C.navy, fontSize: 19, fontWeight: "900", marginTop: 4 }, statSmallValue: { color: C.navy, fontSize: 14, fontWeight: "900", marginTop: 4 }, navy: { color: C.navy }, sectionLabel: { color: C.muted, fontSize: 10, fontWeight: "900", letterSpacing: .6, marginTop: 13, marginBottom: 7 }, allocationRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 5 }, allocationDot: { width: 8, height: 8, borderRadius: 4 }, allocationLabel: { flex: 1, color: C.navy, fontSize: 11, fontWeight: "700" }, rivalRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 }, rank: { color: C.blue, fontSize: 12, fontWeight: "900", width: 18 },
  quickAsset: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 }, quickInfo: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line }, reviewButton: { backgroundColor: C.blue, minHeight: 42, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, marginTop: 14 }, reviewButtonText: { color: "white", fontSize: 12, fontWeight: "900" }, disabled: { opacity: .45 },
  watchSummary: { backgroundColor: C.card, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: C.line, marginBottom: 14 }, historyCard: { backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.line, marginBottom: 14 }, tradeTotals: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line }, historyRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line }, empty: { padding: 28, alignItems: "center" }, emptyTitle: { color: C.navy, fontSize: 15, fontWeight: "900", marginBottom: 6 }, muted: { color: C.muted, fontSize: 11, lineHeight: 16 }, positive: { color: C.green, fontWeight: "900" }, negative: { color: C.red, fontWeight: "900" },
  modalShade: { flex: 1, backgroundColor: "rgba(16,37,68,.42)", justifyContent: "flex-end" }, modal: { backgroundColor: C.card, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, paddingBottom: 30 }, modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, modalTitle: { color: C.navy, fontSize: 20, fontWeight: "900", marginTop: 4 }, close: { color: C.muted, fontSize: 30, lineHeight: 30 }, sideRow: { flexDirection: "row", gap: 8, marginTop: 16 }, sideButton: { flex: 1, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: "#EFF4F9" }, sideBuy: { backgroundColor: C.blue }, sideSell: { backgroundColor: "#FFECEF" }, sideText: { color: C.navy, fontWeight: "900" }, inputLabel: { color: C.muted, fontSize: 10, fontWeight: "900", marginTop: 14, marginBottom: 6 }, input: { height: 44, borderRadius: 9, borderWidth: 1, borderColor: C.line, paddingHorizontal: 12, color: C.navy, fontSize: 16, fontWeight: "800" }, quantityRail: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 9 }, quantityButton: { minWidth: 48, paddingHorizontal: 9, height: 34, borderRadius: 8, backgroundColor: C.blueSoft, alignItems: "center", justifyContent: "center" }, quantityText: { color: C.blue, fontSize: 11, fontWeight: "900" }, previewBox: { backgroundColor: "#F4F8FC", borderRadius: 11, padding: 12, marginTop: 14 }, previewLine: { color: C.muted, fontSize: 12, paddingVertical: 3 }, previewValue: { color: C.navy, fontWeight: "900" },
});
