require("tsx/cjs");
const React = require("react");
const Module = require("node:module");
const TestRenderer = require("react-test-renderer");
const originalLoad = Module._load;
for (const extension of [".webp", ".png", ".jpg", ".jpeg"]) require.extensions[extension] = (module) => { module.exports = "mock-asset"; };

const component = (name) => {
  const C = React.forwardRef(({ children, ...props }, ref) => React.createElement(name, { ...props, ref }, children));
  C.displayName = name;
  return C;
};
const nativeComponents = [
  "View", "Text", "Pressable", "ScrollView", "FlatList", "Image", "Modal", "TextInput",
  "Switch", "SafeAreaView", "KeyboardAvoidingView", "TouchableOpacity", "ActivityIndicator",
];
const native = Object.fromEntries(nativeComponents.map((name) => [name, component(name)]));
native.StyleSheet = { create: (styles) => styles, flatten: (style) => style };
native.Alert = { alert: () => undefined };
native.Platform = { OS: "android", select: (values) => values.android ?? values.default };
native.Dimensions = { get: () => ({ width: 390, height: 844 }) };
native.Easing = { linear: (value) => value, inOut: (value) => value, ease: (value) => value };
native.Animated = {
  View: component("Animated.View"), Text: component("Animated.Text"), Value: class { constructor(value) { this.value = value; } setValue(value) { this.value = value; } interpolate() { return 0; } },
  timing: () => ({ start: (callback) => callback?.() }), spring: () => ({ start: (callback) => callback?.() }), sequence: (items) => ({ start: (callback) => { items.forEach((item) => item.start?.()); callback?.(); } }), parallel: (items) => ({ start: (callback) => { items.forEach((item) => item.start?.()); callback?.(); } }),
};
const svg = new Proxy({ __esModule: true, default: component("Svg") }, { get: (target, key) => target[key] || component(`Svg.${String(key)}`) });
const asyncStorage = { getItem: async () => null, setItem: async () => undefined, removeItem: async () => undefined };
let currentBusinesses = [];
const gameContextMock = { useGame: () => ({ businesses: currentBusinesses, setBusinesses: (updater) => { currentBusinesses = typeof updater === "function" ? updater(currentBusinesses) : updater; }, resetBusinesses: () => undefined }) };

Module._load = function(request, parent, isMain) {
  if (request === "react-native") return { ...native, default: native };
  if (request === "react-native-svg") return svg;
  if (request === "react-native-safe-area-context") return { SafeAreaView: native.SafeAreaView, useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }), SafeAreaProvider: native.View };
  if (request === "@react-native-async-storage/async-storage") return { __esModule: true, default: asyncStorage };
  if (request === "expo-haptics") return { notificationAsync: async () => undefined, NotificationFeedbackType: { Success: "success" } };
  if (request === "expo-status-bar") return { StatusBar: native.View };
  if (typeof request === "string" && (request.endsWith("/src/context/GameContext") || request.endsWith("/src/context/GameContext.tsx"))) return gameContextMock;
  return originalLoad.apply(this, arguments);
};

const { DEFAULT_BUSINESSES } = require("../src/engine/businessSimulation");
const { defaultBankState } = require("../src/types/bank");
const { BusinessScreen } = require("../src/screens/BusinessScreen");
const BankScreen = require("../src/screens/BankScreen").default;
const MarketScreen = require("../src/screens/markets/MarketsModuleScreen").default;
const { LifestyleScreen } = require("../src/screens/LifestyleScreen");

const retail = { ...DEFAULT_BUSINESSES.find((item) => item.sector === "Retail"), isAcquired: true, stockUnits: 1000, level: 1, lastCelebratedLevel: 1 };
const retailL2 = { ...retail, stockUnits: 2500, level: 2, peakUnitsOrAssets: 2500, lastCelebratedLevel: 2 };
const mobility = { ...DEFAULT_BUSINESSES.find((item) => item.sector === "Mobility"), isAcquired: true, economySedans: 10, level: 1, lastCelebratedLevel: 1 };
const mobilityL2 = { ...mobility, economySedans: 20, level: 2, peakUnitsOrAssets: 20, lastCelebratedLevel: 2 };
const props = { cash: 10000, netWorth: 15000, netIncomePerHour: 0, timestamp: Date.now(), onIPOComplete: () => undefined, onCashChange: () => undefined, onStateChange: () => undefined, onLedger: () => undefined };
const render = (label, element) => {
  let renderer;
  try {
    renderer = TestRenderer.create(element);
    renderer.toJSON();
    renderer.unmount();
    return { label, ok: true };
  } catch (error) {
    return { label, ok: false, error: String(error?.stack || error) };
  }
};
const results = [];
for (const [label, businesses] of [
  ["business-empty-save", []], ["business-retail-l1", [retail]], ["business-retail-l2", [retailL2]],
  ["business-mobility-l1", [mobility]], ["business-mobility-l2", [mobilityL2]],
  ["business-unaffordable-category", [{ ...DEFAULT_BUSINESSES.find((item) => item.sector === "Airline"), isAcquired: false }]],
  ["business-tech", [DEFAULT_BUSINESSES.find((item) => item.sector === "Tech_SaaS")]],
  ["business-construction", [DEFAULT_BUSINESSES.find((item) => item.sector === "Construction_Mega")]],
  ["business-real-estate", [DEFAULT_BUSINESSES.find((item) => item.sector === "Real_Estate")]],
  ["business-energy", [DEFAULT_BUSINESSES.find((item) => item.sector === "Energy")]],
  ["business-pharma", [DEFAULT_BUSINESSES.find((item) => item.sector === "Pharma")]],
  ["business-media", [DEFAULT_BUSINESSES.find((item) => item.sector === "Media")]],
  ["business-sports", [DEFAULT_BUSINESSES.find((item) => item.sector === "Sports")]],
  ["business-airline", [DEFAULT_BUSINESSES.find((item) => item.sector === "Airline")]],
]) {
  currentBusinesses = businesses.filter(Boolean);
  results.push(render(label, React.createElement(BusinessScreen, props)));
}
const bank = defaultBankState();
results.push(render("bank-mount", React.createElement(BankScreen, { cash: 10000, netWorth: 10000, hourlyIncome: 0, financialState: { cash: 10000, bank, assets: [], holdings: {}, owned: [], lifestyleAssets: [], businesses: [], systemTimeMs: Date.now(), multiplier: 1 }, ledger: [], state: bank, businesses: [], collateralAssets: [], onStateChange: () => undefined, onCashChange: () => undefined, onBreaking: () => undefined }))); 
results.push(render("markets-mount", React.createElement(MarketScreen, { playerNetWorth: 10000, cash: 10000, assets: [], holdings: {}, watchlist: [], toggleWatchlist: () => undefined, filter: "all", setFilter: () => undefined, executeTrade: () => undefined, summary: { currentValue: 0, invested: 0, unrealizedPnl: 0, realizedPnl: 0, dayChange: 0 }, tradeHistory: [], limitOrders: [], portfolioHistory: [], rivalInvestors: [], allocation: [], systemTimeMs: Date.now(), priceAlerts: [], onCreatePriceAlert: () => undefined, onRemovePriceAlert: () => undefined, onCreateLimitOrder: () => undefined, onCancelLimitOrder: () => undefined })));
results.push(render("lifestyle-mount", React.createElement(LifestyleScreen, { owned: [], cash: 10000, setCash: () => undefined, setOwned: () => undefined })));
const failed = results.filter((item) => !item.ok);
console.log(JSON.stringify({ test: "round36-render-smoke", total: results.length, failed: failed.length, results }, null, 2));
if (failed.length) process.exitCode = 1;
