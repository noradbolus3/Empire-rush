require("tsx/cjs");
const assert = require("node:assert/strict");
const React = require("react");
const Module = require("node:module");
const TestRenderer = require("react-test-renderer");
const originalLoad = Module._load;

const component = (name) => (props) => React.createElement(name, props, props?.children);
const native = Object.fromEntries(["View", "Text", "ScrollView", "SafeAreaView"].map((name) => [name, component(name)]));
native.StyleSheet = { create: (styles) => styles };
const nativeModules = {
  "react-native": { ...native, default: native },
  "react-native-safe-area-context": { SafeAreaView: native.SafeAreaView },
};
Module._load = function (request, parent, isMain) {
  return nativeModules[request] || originalLoad.apply(this, arguments);
};

const { DEFAULT_BUSINESSES } = require("../src/engine/businessSimulation");
const BusinessFinancialsScreen = require("../src/screens/BusinessFinancialsScreen").default;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const base = DEFAULT_BUSINESSES.find((item) => item.sector === "Retail") || DEFAULT_BUSINESSES[0];
const transactions = Array.from({ length: 25 }, (_, index) => {
  const sequence = index + 1;
  return {
    id: `tx-${sequence}`,
    at: 1_700_000_000_000 + sequence * 1000,
    timestamp: 1_700_000_000_000 + sequence * 1000,
    type: sequence % 2 ? "sale" : "restock",
    amount: sequence % 2 ? 125 : -80,
    revenue: sequence % 2 ? 125 : 0,
    units: sequence % 2 ? 5 : 0,
    label: `TX-${String(sequence).padStart(2, "0")}`,
  };
});
const business = {
  ...base,
  registeredName: "Ledger Test Market",
  baseHourlyRevenue: 1000,
  operatingMode: "Standard",
  stabilityIndex: 90,
  monthlyExpenses: { rent: 800, payroll: 1200, maintenance: 300, inventoryOrCloudCOGS: 500 },
  resources: { kind: "retail", stockUnits: 1000, floorStage: "Corner Kiosk", profitMarginPercent: 30, customerFootfallPerHour: 100, unitSellingPrice: 12 },
  transactionLedger: transactions,
  operationalLog: [],
  workforce: { ...base.workforce, morale: 100 },
};
let renderer;
TestRenderer.act(() => {
  renderer = TestRenderer.create(
    React.createElement(BusinessFinancialsScreen, {
      route: { params: { business } },
    }),
  );
});
const visibleLabels = renderer.root
  .findAll((node) => node.type === "Text" && typeof node.props.children === "string" && /^TX-\d{2}$/.test(node.props.children))
  .map((node) => node.props.children);
assert.equal(visibleLabels.length, 20, `expected 20 visible ledger rows, got ${visibleLabels.length}`);
assert.deepEqual(visibleLabels, Array.from({ length: 20 }, (_, index) => `TX-${String(25 - index).padStart(2, "0")}`));
assert.equal(visibleLabels.includes("TX-05"), false, "21st-oldest entry must be excluded");
assert.equal(visibleLabels.includes("TX-01"), false, "oldest entry must be excluded");
TestRenderer.act(() => renderer.unmount());
console.log(JSON.stringify({
  test: "transaction-ledger-ui-test",
  status: "PASS",
  seededEntries: transactions.length,
  visibleEntries: visibleLabels.length,
  firstVisible: visibleLabels[0],
  lastVisible: visibleLabels[visibleLabels.length - 1],
  excludedOldest: ["TX-05", "TX-01"],
}, null, 2));
