require("tsx/cjs");
const React = require("react");
const Module = require("node:module");
const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const originalLoad = Module._load;
for (const extension of [".webp", ".png", ".jpg", ".jpeg"])
  require.extensions[extension] = (module) => {
    module.exports = "mock-asset";
  };

const component = (name) => {
  const C = React.forwardRef(({ children, ...props }, ref) =>
    React.createElement(name, { ...props, ref }, children),
  );
  C.displayName = name;
  return C;
};
const nativeComponents = [
  "View",
  "Text",
  "Pressable",
  "ScrollView",
  "FlatList",
  "Image",
  "Modal",
  "TextInput",
  "Switch",
  "SafeAreaView",
  "KeyboardAvoidingView",
  "TouchableOpacity",
  "ActivityIndicator",
];
const native = Object.fromEntries(
  nativeComponents.map((name) => [name, component(name)]),
);
native.StyleSheet = { create: (styles) => styles, flatten: (style) => style };
native.Alert = { alert: () => undefined };
native.Platform = {
  OS: "android",
  select: (values) => values.android ?? values.default,
};
native.Dimensions = { get: () => ({ width: 390, height: 844 }) };
native.Easing = {
  linear: (value) => value,
  inOut: (value) => value,
  ease: (value) => value,
};
native.Animated = {
  View: component("Animated.View"),
  Text: component("Animated.Text"),
  Value: class {
    constructor(value) {
      this.value = value;
    }
    setValue(value) {
      this.value = value;
    }
    interpolate() {
      return 0;
    }
  },
  timing: () => ({ start: (callback) => callback?.() }),
  spring: () => ({ start: (callback) => callback?.() }),
  sequence: (items) => ({
    start: (callback) => {
      items.forEach((item) => item.start?.());
      callback?.();
    },
  }),
  parallel: (items) => ({
    start: (callback) => {
      items.forEach((item) => item.start?.());
      callback?.();
    },
  }),
};
const svg = {
  __esModule: true,
  default: component("Svg"),
  Svg: component("Svg"),
  Circle: component("Circle"),
  Defs: component("Defs"),
  LinearGradient: component("LinearGradient"),
  Path: component("Path"),
  Rect: component("Rect"),
  Stop: component("Stop"),
};
const asyncStorage = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};
let currentBusinesses = [];
let currentTaxiCompany = null;
let currentShippingCompany = null;
let currentFactoryCompany = null;
let currentConstructionCompany = null;
let currentDealership = null;
const gameContextMock = {
  useGame: () => ({
    businesses: currentBusinesses,
    setBusinesses: (updater) => {
      currentBusinesses =
        typeof updater === "function" ? updater(currentBusinesses) : updater;
    },
    taxiCompany: currentTaxiCompany,
    setTaxiCompany: (updater) => {
      currentTaxiCompany =
        typeof updater === "function" ? updater(currentTaxiCompany) : updater;
    },
    shippingCompany: currentShippingCompany,
    setShippingCompany: (updater) => {
      currentShippingCompany =
        typeof updater === "function"
          ? updater(currentShippingCompany)
          : updater;
    },
    factoryCompany: currentFactoryCompany,
    setFactoryCompany: (updater) => {
      currentFactoryCompany =
        typeof updater === "function"
          ? updater(currentFactoryCompany)
          : updater;
    },
    constructionCompany: currentConstructionCompany,
    setConstructionCompany: (updater) => {
      currentConstructionCompany =
        typeof updater === "function"
          ? updater(currentConstructionCompany)
          : updater;
    },
    dealership: currentDealership,
    setDealership: (updater) => {
      currentDealership =
        typeof updater === "function" ? updater(currentDealership) : updater;
    },
    resetBusinesses: () => undefined,
  }),
};

Module._load = function (request, parent, isMain) {
  if (request === "react-native") return { ...native, default: native };
  if (request === "react-native-svg") return svg;
  if (request === "react-native-safe-area-context")
    return {
      SafeAreaView: native.SafeAreaView,
      useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
      SafeAreaProvider: native.View,
    };
  if (request === "@react-native-async-storage/async-storage")
    return { __esModule: true, default: asyncStorage };
  if (request === "expo-haptics")
    return {
      notificationAsync: async () => undefined,
      NotificationFeedbackType: { Success: "success" },
    };
  if (request === "expo-status-bar") return { StatusBar: native.View };
  if (typeof request === "string" && request.includes("context/GameContext"))
    return gameContextMock;
  return originalLoad.apply(this, arguments);
};

const { DEFAULT_BUSINESSES } = require("../src/engine/businessSimulation");
const { defaultBankState } = require("../src/types/bank");
const { BusinessScreen } = require("../src/screens/BusinessScreen");
const BankScreen = require("../src/screens/BankScreen").default;
const MarketScreen =
  require("../src/screens/markets/MarketsModuleScreen").default;
const { LifestyleScreen } = require("../src/screens/LifestyleScreen");
const TaxiCompanyScreen = require("../src/screens/TaxiCompanyScreen").default;
const { DEFAULT_TAXI_COMPANY } = require("../src/types/taxi");
const ShippingCompanyScreen =
  require("../src/screens/ShippingCompanyScreen").default;
const { DEFAULT_SHIPPING_COMPANY } = require("../src/types/shipping");
const FactoryCompanyScreen =
  require("../src/screens/FactoryCompanyScreen").default;
const { DEFAULT_FACTORY_COMPANY } = require("../src/types/factory");
const ConstructionCompanyScreen =
  require("../src/screens/ConstructionCompanyScreen").default;
const { DEFAULT_CONSTRUCTION_COMPANY } = require("../src/types/construction");
const CarDealershipScreen =
  require("../src/screens/CarDealershipScreen").default;
const { DEFAULT_DEALERSHIP } = require("../src/types/dealership");
const SoftwareCompanyScreen =
  require("../src/screens/SoftwareCompanyScreen").default;
const { DEFAULT_SOFTWARE_COMPANY } = require("../src/types/software");

const retail = {
  ...DEFAULT_BUSINESSES.find((item) => item.sector === "Retail"),
  isAcquired: true,
  stockUnits: 1000,
  level: 1,
  lastCelebratedLevel: 1,
};
const retailL2 = {
  ...retail,
  stockUnits: 2500,
  level: 2,
  peakUnitsOrAssets: 2500,
  lastCelebratedLevel: 2,
};
const mobility = {
  ...DEFAULT_BUSINESSES.find((item) => item.sector === "Mobility"),
  isAcquired: true,
  economySedans: 10,
  level: 1,
  lastCelebratedLevel: 1,
};
const mobilityL2 = {
  ...mobility,
  economySedans: 20,
  level: 2,
  peakUnitsOrAssets: 20,
  lastCelebratedLevel: 2,
};
const props = {
  cash: 10000,
  netWorth: 15000,
  netIncomePerHour: 0,
  timestamp: Date.now(),
  onIPOComplete: () => undefined,
  onCashChange: () => undefined,
  onStateChange: () => undefined,
  onLedger: () => undefined,
};
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
  ["business-empty-save", []],
  ["business-retail-l1", [retail]],
  ["business-retail-l2", [retailL2]],
  ["business-mobility-l1", [mobility]],
  ["business-mobility-l2", [mobilityL2]],
  [
    "business-unaffordable-category",
    [
      {
        ...DEFAULT_BUSINESSES.find((item) => item.sector === "Airline"),
        isAcquired: false,
      },
    ],
  ],
  [
    "business-tech",
    [DEFAULT_BUSINESSES.find((item) => item.sector === "Tech_SaaS")],
  ],
  [
    "business-construction",
    [DEFAULT_BUSINESSES.find((item) => item.sector === "Construction_Mega")],
  ],
  [
    "business-real-estate",
    [DEFAULT_BUSINESSES.find((item) => item.sector === "Real_Estate")],
  ],
  [
    "business-energy",
    [DEFAULT_BUSINESSES.find((item) => item.sector === "Energy")],
  ],
  [
    "business-pharma",
    [DEFAULT_BUSINESSES.find((item) => item.sector === "Pharma")],
  ],
  [
    "business-media",
    [DEFAULT_BUSINESSES.find((item) => item.sector === "Media")],
  ],
  [
    "business-sports",
    [DEFAULT_BUSINESSES.find((item) => item.sector === "Sports")],
  ],
  [
    "business-airline",
    [DEFAULT_BUSINESSES.find((item) => item.sector === "Airline")],
  ],
]) {
  currentBusinesses = businesses.filter(Boolean);
  results.push(render(label, React.createElement(BusinessScreen, props)));
}
const bank = defaultBankState();
results.push(
  render(
    "bank-mount",
    React.createElement(BankScreen, {
      cash: 10000,
      netWorth: 10000,
      hourlyIncome: 0,
      financialState: {
        cash: 10000,
        bank,
        assets: [],
        holdings: {},
        owned: [],
        lifestyleAssets: [],
        businesses: [],
        systemTimeMs: Date.now(),
        multiplier: 1,
      },
      ledger: [],
      state: bank,
      businesses: [],
      collateralAssets: [],
      onStateChange: () => undefined,
      onCashChange: () => undefined,
      onBreaking: () => undefined,
    }),
  ),
);
results.push(
  render(
    "markets-mount",
    React.createElement(MarketScreen, {
      playerNetWorth: 10000,
      cash: 10000,
      assets: [],
      holdings: {},
      watchlist: [],
      toggleWatchlist: () => undefined,
      filter: "all",
      setFilter: () => undefined,
      executeTrade: () => undefined,
      summary: {
        currentValue: 0,
        invested: 0,
        unrealizedPnl: 0,
        realizedPnl: 0,
        dayChange: 0,
      },
      tradeHistory: [],
      limitOrders: [],
      portfolioHistory: [],
      rivalInvestors: [],
      allocation: [],
      systemTimeMs: Date.now(),
      priceAlerts: [],
      onCreatePriceAlert: () => undefined,
      onRemovePriceAlert: () => undefined,
      onCreateLimitOrder: () => undefined,
      onCancelLimitOrder: () => undefined,
    }),
  ),
);
results.push(
  render(
    "lifestyle-mount",
    React.createElement(LifestyleScreen, {
      owned: [],
      cash: 10000,
      setCash: () => undefined,
      setOwned: () => undefined,
    }),
  ),
);
results.push(
  render(
    "taxi-setup-mount",
    React.createElement(TaxiCompanyScreen, {
      company: null,
      cash: 50000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "taxi-operating-mount",
    React.createElement(TaxiCompanyScreen, {
      company: {
        ...DEFAULT_TAXI_COMPANY,
        status: "operating",
        economyTaxis: 1,
        drivers: 1,
        area: "Central City",
      },
      cash: 50000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "shipping-setup-mount",
    React.createElement(ShippingCompanyScreen, {
      company: null,
      cash: 80000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "shipping-operating-mount",
    React.createElement(ShippingCompanyScreen, {
      company: {
        ...DEFAULT_SHIPPING_COMPANY,
        status: "operating",
        vans: 1,
        drivers: 1,
      },
      cash: 80000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "factory-setup-mount",
    React.createElement(FactoryCompanyScreen, {
      company: null,
      cash: 120000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "factory-operating-mount",
    React.createElement(FactoryCompanyScreen, {
      company: {
        ...DEFAULT_FACTORY_COMPANY,
        status: "operating",
        machineLines: 1,
        workers: 2,
      },
      cash: 120000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "construction-setup-mount",
    React.createElement(ConstructionCompanyScreen, {
      company: null,
      cash: 120000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "construction-operating-mount",
    React.createElement(ConstructionCompanyScreen, {
      company: {
        ...DEFAULT_CONSTRUCTION_COMPANY,
        status: "operating",
        landParcels: 1,
        workers: 4,
        excavators: 1,
        mixers: 1,
      },
      cash: 120000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "dealership-setup-mount",
    React.createElement(CarDealershipScreen, {
      company: null,
      cash: 120000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "dealership-operating-mount",
    React.createElement(CarDealershipScreen, {
      company: {
        ...DEFAULT_DEALERSHIP,
        status: "operating",
        showroomSize: 1,
        inventory: 2,
        salesStaff: 2,
      },
      cash: 120000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "software-setup-mount",
    React.createElement(SoftwareCompanyScreen, {
      company: null,
      cash: 100000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
results.push(
  render(
    "software-operating-mount",
    React.createElement(SoftwareCompanyScreen, {
      company: {
        ...DEFAULT_SOFTWARE_COMPANY,
        status: "operating",
        developers: 1,
        activeProjects: 1,
        clientContracts: 1,
      },
      cash: 100000,
      onCashChange: () => undefined,
      onChange: () => undefined,
      onBack: () => undefined,
      onLedger: () => undefined,
    }),
  ),
);
const textContent = (node) => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  const children = node?.props?.children;
  if (Array.isArray(children)) return children.map(textContent).join("");
  return textContent(children);
};
const pressLabel = (renderer, label) => {
  const matches = renderer.root.findAll(
    (node) =>
      typeof node.props?.onPress === "function" &&
      textContent(node).includes(label),
  );
  if (!matches.length) {
    const available = renderer.root
      .findAll((node) => typeof node.props?.onPress === "function")
      .map(textContent)
      .filter(Boolean);
    throw new Error(
      `No pressable found for: ${label}; available=${JSON.stringify(available.slice(0, 30))}`,
    );
  }
  act(() => matches[0].props.onPress());
};
const interactionResults = [];
const interaction = async (label, businesses, cash, actions) => {
  try {
    currentBusinesses = businesses;
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(
        React.createElement(BusinessScreen, { ...props, cash }),
      );
    });
    for (const action of actions) {
      await act(async () => {
        pressLabel(renderer, action);
        await new Promise((resolve) =>
          setTimeout(resolve, action === "LAUNCH COMPANY" ? 500 : 0),
        );
      });
    }
    renderer.unmount();
    interactionResults.push({ label, ok: true });
  } catch (error) {
    interactionResults.push({
      label,
      ok: false,
      error: String(error?.stack || error),
    });
  }
};
const taxiInteraction = async (label, company, cash, actions) => {
  try {
    let state = company;
    let renderer;
    const onChange = (updater) => {
      state = typeof updater === "function" ? updater(state) : updater;
    };
    await act(async () => {
      renderer = TestRenderer.create(
        React.createElement(TaxiCompanyScreen, {
          company: state,
          cash,
          onCashChange: () => undefined,
          onChange,
          onBack: () => undefined,
          onLedger: () => undefined,
        }),
      );
    });
    for (const action of actions)
      await act(async () => {
        pressLabel(renderer, action);
      });
    renderer.unmount();
    interactionResults.push({ label, ok: true });
  } catch (error) {
    interactionResults.push({
      label,
      ok: false,
      error: String(error?.stack || error),
    });
  }
};
const shippingInteraction = async (label, company, cash, actions) => {
  try {
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(
        React.createElement(ShippingCompanyScreen, {
          company,
          cash,
          onCashChange: () => undefined,
          onChange: () => undefined,
          onBack: () => undefined,
          onLedger: () => undefined,
        }),
      );
    });
    for (const action of actions)
      await act(async () => {
        pressLabel(renderer, action);
      });
    renderer.unmount();
    interactionResults.push({ label, ok: true });
  } catch (error) {
    interactionResults.push({
      label,
      ok: false,
      error: String(error?.stack || error),
    });
  }
};
const constructionInteraction = async (label, company, cash, actions) => {
  try {
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(
        React.createElement(ConstructionCompanyScreen, {
          company,
          cash,
          onCashChange: () => undefined,
          onChange: () => undefined,
          onBack: () => undefined,
          onLedger: () => undefined,
        }),
      );
    });
    for (const action of actions)
      await act(async () => {
        pressLabel(renderer, action);
      });
    renderer.unmount();
    interactionResults.push({ label, ok: true });
  } catch (error) {
    interactionResults.push({
      label,
      ok: false,
      error: String(error?.stack || error),
    });
  }
};
const softwareInteraction = async (label, company, cash, actions) => {
  try {
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(
        React.createElement(SoftwareCompanyScreen, {
          company,
          cash,
          onCashChange: () => undefined,
          onChange: () => undefined,
          onBack: () => undefined,
          onLedger: () => undefined,
        }),
      );
    });
    for (const action of actions)
      await act(async () => {
        pressLabel(renderer, action);
      });
    renderer.unmount();
    interactionResults.push({ label, ok: true });
  } catch (error) {
    interactionResults.push({
      label,
      ok: false,
      error: String(error?.stack || error),
    });
  }
};
const dealershipInteraction = async (label, company, cash, actions) => {
  try {
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(
        React.createElement(CarDealershipScreen, {
          company,
          cash,
          onCashChange: () => undefined,
          onChange: () => undefined,
          onBack: () => undefined,
          onLedger: () => undefined,
        }),
      );
    });
    for (const action of actions)
      await act(async () => {
        pressLabel(renderer, action);
      });
    renderer.unmount();
    interactionResults.push({ label, ok: true });
  } catch (error) {
    interactionResults.push({
      label,
      ok: false,
      error: String(error?.stack || error),
    });
  }
};
const factoryInteraction = async (label, company, cash, actions) => {
  try {
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(
        React.createElement(FactoryCompanyScreen, {
          company,
          cash,
          onCashChange: () => undefined,
          onChange: () => undefined,
          onBack: () => undefined,
          onLedger: () => undefined,
        }),
      );
    });
    for (const action of actions)
      await act(async () => {
        pressLabel(renderer, action);
      });
    renderer.unmount();
    interactionResults.push({ label, ok: true });
  } catch (error) {
    interactionResults.push({
      label,
      ok: false,
      error: String(error?.stack || error),
    });
  }
};
(async () => {
  await interaction("interaction-retail-l1-quick-action", [retail], 10000, [
    "RESTOCK 1,000",
  ]);
  await interaction("interaction-mobility-l1-quick-action", [mobility], 20000, [
    "BUY VEHICLE",
  ]);
  await interaction("interaction-my-companies", [retail], 10000, [
    "MY COMPANIES",
  ]);
  await interaction("interaction-start-a-business", [retail], 10000, [
    "START A BUSINESS",
  ]);
  await interaction(
    "interaction-insufficient-funds-purchase",
    [{ ...retail, isAcquired: false, isUnlocked: true }],
    0,
    [retail.name, "LAUNCH COMPANY"],
  );
  await taxiInteraction("interaction-taxi-launch", null, 50000, [
    "CONFIRM & LAUNCH TAXI COMPANY",
  ]);
  const operatingTaxi = {
    ...DEFAULT_TAXI_COMPANY,
    status: "operating",
    economyTaxis: 1,
    drivers: 1,
    area: "Central City",
  };
  await taxiInteraction("taxi-screen-overview", operatingTaxi, 50000, []);
  await taxiInteraction("taxi-screen-fleet", operatingTaxi, 50000, [
    "FLEET",
    "BUY ECONOMY TAXI",
  ]);
  await taxiInteraction("taxi-screen-operations", operatingTaxi, 50000, [
    "OPERATIONS",
    "RUN NEXT TAXI SHIFT",
  ]);
  await taxiInteraction("taxi-screen-workforce", operatingTaxi, 50000, [
    "WORKFORCE",
    "HIRE DRIVER",
  ]);
  await taxiInteraction("taxi-screen-expansion", operatingTaxi, 50000, [
    "EXPANSION",
    "EXPAND TO DEPOT LEVEL 2",
  ]);
  const shippingBase = {
    ...DEFAULT_SHIPPING_COMPANY,
    status: "operating",
    vans: 1,
    drivers: 1,
  };
  await shippingInteraction(
    "shipping-screen-dashboard",
    shippingBase,
    80000,
    [],
  );
  await shippingInteraction("shipping-screen-fleet", shippingBase, 80000, [
    "FLEET",
    "BUY DELIVERY VAN",
  ]);
  await shippingInteraction(
    "shipping-screen-shipments-accept",
    shippingBase,
    80000,
    ["SHIPMENTS", "ACCEPT DELIVERY ORDER"],
  );
  const pendingShipment = {
    ...shippingBase,
    cargoStored: 80,
    shipments: [
      {
        id: "smoke",
        customer: "Smoke Test Client",
        cargoUnits: 80,
        reward: 420,
        status: "pending",
        route: shippingBase.city,
        createdAt: Date.now(),
      },
    ],
  };
  await shippingInteraction(
    "shipping-screen-shipments-assign",
    pendingShipment,
    80000,
    ["SHIPMENTS", "ASSIGN SHIPMENT TO FLEET"],
  );
  const transitShipment = {
    ...shippingBase,
    cargoStored: 80,
    shipments: [
      {
        id: "smoke",
        customer: "Smoke Test Client",
        cargoUnits: 80,
        reward: 420,
        status: "in_transit",
        route: shippingBase.city,
        assignedVehicle: "Delivery van",
        createdAt: Date.now(),
      },
    ],
  };
  await shippingInteraction(
    "shipping-screen-shipments-deliver",
    transitShipment,
    80000,
    ["SHIPMENTS", "COMPLETE DELIVERY"],
  );
  await shippingInteraction("shipping-screen-staff", shippingBase, 80000, [
    "STAFF",
    "HIRE WAREHOUSE STAFF",
  ]);
  await shippingInteraction("shipping-screen-expansion", shippingBase, 80000, [
    "EXPANSION",
    "UPGRADE WAREHOUSE TO LEVEL 2",
  ]);
  const factoryBase = {
    ...DEFAULT_FACTORY_COMPANY,
    status: "operating",
    machineLines: 1,
    workers: 2,
    rawMaterials: 300,
  };
  await factoryInteraction("factory-screen-setup", null, 120000, [
    "CONFIRM & LAUNCH FACTORY",
  ]);
  await factoryInteraction("factory-screen-dashboard", factoryBase, 120000, []);
  await factoryInteraction("factory-screen-machinery", factoryBase, 120000, [
    "MACHINERY",
    "BUY ASSEMBLY LINE",
  ]);
  await factoryInteraction("factory-screen-employees", factoryBase, 120000, [
    "EMPLOYEES",
    "HIRE PRODUCTION WORKER",
  ]);
  await factoryInteraction("factory-screen-inventory", factoryBase, 120000, [
    "INVENTORY",
    "BUY RAW MATERIALS",
    "RUN PRODUCTION BATCH",
  ]);
  await factoryInteraction("factory-screen-expansion", factoryBase, 120000, [
    "EXPANSION",
    "UPGRADE BUILDING TO LEVEL 2",
  ]);
  const constructionBase = {
    ...DEFAULT_CONSTRUCTION_COMPANY,
    status: "operating",
    landParcels: 1,
    workers: 4,
    excavators: 1,
    mixers: 1,
    activeProjects: 1,
    contractValue: 90000,
  };
  await constructionInteraction("construction-screen-setup", null, 120000, [
    "PURCHASE LAND & LAUNCH COMPANY",
  ]);
  await constructionInteraction(
    "construction-screen-dashboard",
    constructionBase,
    120000,
    [],
  );
  await constructionInteraction(
    "construction-screen-land",
    constructionBase,
    120000,
    ["LAND", "BUY DEVELOPMENT PARCEL"],
  );
  await constructionInteraction(
    "construction-screen-machinery",
    constructionBase,
    120000,
    ["MACHINERY", "BUY EXCAVATOR"],
  );
  await constructionInteraction(
    "construction-screen-projects",
    constructionBase,
    120000,
    ["PROJECTS", "RUN NEXT CONSTRUCTION SHIFT"],
  );
  await constructionInteraction(
    "construction-screen-contracts",
    constructionBase,
    120000,
    ["CONTRACTS", "ACCEPT PRIVATE CONTRACT"],
  );
  await constructionInteraction(
    "construction-screen-expansion",
    constructionBase,
    120000,
    ["EXPANSION", "OPEN SECOND SITE"],
  );
  const dealershipBase = {
    ...DEFAULT_DEALERSHIP,
    status: "operating",
    showroomSize: 1,
    inventory: 2,
    salesStaff: 2,
    showroomCapacity: 4,
  };
  await dealershipInteraction("dealership-screen-setup", null, 120000, [
    "BUILD SHOWROOM & LAUNCH DEALERSHIP",
  ]);
  await dealershipInteraction(
    "dealership-screen-dashboard",
    dealershipBase,
    120000,
    [],
  );
  await dealershipInteraction(
    "dealership-screen-showroom",
    dealershipBase,
    120000,
    ["SHOWROOM", "EXPAND SHOWROOM"],
  );
  await dealershipInteraction(
    "dealership-screen-inventory",
    dealershipBase,
    120000,
    ["INVENTORY", "BUY STARTER VEHICLE"],
  );
  await dealershipInteraction(
    "dealership-screen-sales",
    dealershipBase,
    120000,
    ["SALES", "SERVE NEXT CUSTOMER"],
  );
  await dealershipInteraction(
    "dealership-screen-finance",
    dealershipBase,
    120000,
    ["FINANCE", "HIRE SALES SPECIALIST"],
  );
  await dealershipInteraction(
    "dealership-screen-expansion",
    dealershipBase,
    120000,
    ["EXPANSION", "OPEN SECOND BRANCH"],
  );
  const softwareBase = {
    ...DEFAULT_SOFTWARE_COMPANY,
    status: "operating",
    developers: 2,
    activeProjects: 1,
    clientContracts: 1,
    offices: 1,
  };
  await softwareInteraction("software-screen-setup", null, 100000, [
    "REGISTER SOFTWARE COMPANY",
  ]);
  await softwareInteraction(
    "software-screen-dashboard",
    softwareBase,
    100000,
    [],
  );
  await softwareInteraction("software-screen-setup-ops", softwareBase, 100000, [
    "SETUP",
    "RENT SMALL OFFICE",
  ]);
  await softwareInteraction("software-screen-pipeline", softwareBase, 100000, [
    "PIPELINE",
    "DELIVER CLIENT PROJECT",
  ]);
  await softwareInteraction("software-screen-teams", softwareBase, 100000, [
    "TEAMS",
    "HIRE DEVELOPER",
  ]);
  await softwareInteraction("software-screen-cloud", softwareBase, 100000, [
    "CLOUD",
    "HARDEN CLOUD SECURITY",
  ]);
  await softwareInteraction(
    "software-screen-enterprise",
    softwareBase,
    200000,
    ["ENTERPRISE", "LAUNCH SAAS PRODUCT"],
  );
  const failed = results.filter((item) => !item.ok);
  const interactionFailed = interactionResults.filter((item) => !item.ok);
  console.log(
    JSON.stringify(
      {
        test: "round36-render-and-interaction-smoke",
        renderTotal: results.length,
        renderFailed: failed.length,
        interactionTotal: interactionResults.length,
        interactionFailed: interactionFailed.length,
        results,
        interactionResults,
      },
      null,
      2,
    ),
  );
  process.exit(failed.length || interactionFailed.length ? 1 : 0);
})();
