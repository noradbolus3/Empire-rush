import fs from "node:fs";
import path from "node:path";
import {
  BUSINESS_PORTFOLIO_ROUTE_ID,
  BUSINESS_ROUTE_BACK_HANDLERS,
  BUSINESS_ROUTE_CATALOG,
  getBusinessRouteById,
  getBusinessRouteForEntity,
} from "../src/screens/business/businessRouteCatalog";

const root = process.cwd();
const app = fs.readFileSync(path.join(root, "App.tsx"), "utf8");
const businessScreen = fs.readFileSync(
  path.join(root, "src/screens/BusinessScreen.tsx"),
  "utf8",
);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(BUSINESS_ROUTE_CATALOG.length === 14, "Expected 14 canonical business route kinds");
assert(
  new Set(BUSINESS_ROUTE_CATALOG.map((entry) => entry.kind)).size ===
    BUSINESS_ROUTE_CATALOG.length,
  "Route kinds must be unique",
);
assert(
  new Set(BUSINESS_ROUTE_CATALOG.map((entry) => entry.routeId)).size ===
    BUSINESS_ROUTE_CATALOG.length,
  "Route IDs must be unique",
);
assert(
  BUSINESS_ROUTE_CATALOG.every((entry) => entry.label && entry.stateKey),
  "Every route must have display metadata and a state key",
);

const appBusinessMounts = app.match(/<RetailBusinessScreen\b/g) ?? [];
assert(
  appBusinessMounts.length === 1,
  `Expected exactly one App Business Portfolio mount, found ${appBusinessMounts.length}`,
);
assert(
  app.includes("routeId={BUSINESS_PORTFOLIO_ROUTE_ID}"),
  "App Business mount is missing the canonical portfolio route ID",
);
assert(
  (app.match(/BusinessScreen as RetailBusinessScreen/g) ?? []).length === 1,
  "App must alias the BusinessScreen component only once",
);
assert(
  businessScreen.includes("<BusinessPortfolioCard"),
  "BusinessScreen must render the shared canonical portfolio card",
);
assert(
  !businessScreen.includes("<BusinessCard"),
  "Legacy BusinessCard renderer must not remain active",
);

const specializedScreens = BUSINESS_ROUTE_CATALOG.filter(
  (entry) => entry.supportsDirectLaunch,
);
for (const entry of specializedScreens) {
  assert(
    businessScreen.includes(`case "${entry.screen}"`),
    `${entry.kind} route is missing from the canonical launch dispatcher`,
  );
  assert(
    businessScreen.includes("onPress={() => openPortfolioRecord(record)}"),
    `${entry.kind} portfolio card is not routed through the canonical portfolio dispatcher`,
  );
  assert(
    businessScreen.includes("getBusinessRouteByKind(record.kind)"),
    `${entry.kind} portfolio dispatcher does not resolve through the route catalog`,
  );
  assert(
    businessScreen.includes(BUSINESS_ROUTE_BACK_HANDLERS[entry.screen]),
    `${entry.kind} route is missing its return-to-portfolio handler`,
  );
}

for (const screen of ["construction", "software"] as const) {
  assert(
    businessScreen.includes(`selectedRoute?.screen === "${screen}"`),
    `${screen} selected-company route is not resolved through the catalog`,
  );
}
assert(
  businessScreen.includes(BUSINESS_ROUTE_BACK_HANDLERS["business-master-hub"]),
  "BusinessMasterHub route is missing its return-to-portfolio handler",
);

for (const entry of BUSINESS_ROUTE_CATALOG) {
  for (const id of entry.stableIds) {
    assert(
      getBusinessRouteById(id)?.kind === entry.kind,
      `Stable business ID ${id} does not resolve to ${entry.kind}`,
    );
  }
}

const genericRoute = getBusinessRouteForEntity({ id: "apex-retail", sector: "Retail" });
assert(genericRoute.kind === "generic", "Generic business must resolve to the master-hub route");
const constructionRoute = getBusinessRouteForEntity({
  id: "titan-infrastructure",
  sector: "Construction_Mega",
});
assert(constructionRoute.kind === "construction", "Construction must resolve to its domain route");
const softwareRoute = getBusinessRouteForEntity({
  id: "cyberpulse-saas",
  sector: "Tech_SaaS",
});
assert(softwareRoute.kind === "software", "Software must resolve to its domain route");

console.log(
  JSON.stringify(
    {
      status: "PASS",
      portfolioRoute: BUSINESS_PORTFOLIO_ROUTE_ID,
      routeKinds: BUSINESS_ROUTE_CATALOG.map((entry) => entry.kind),
      routeCount: BUSINESS_ROUTE_CATALOG.length,
      appBusinessMounts: appBusinessMounts.length,
      specializedDirectLaunchRoutes: specializedScreens.map((entry) => entry.kind),
      checkedStableIds: BUSINESS_ROUTE_CATALOG.flatMap((entry) => entry.stableIds),
      selectedRouteChecks: [genericRoute.kind, constructionRoute.kind, softwareRoute.kind],
    },
    null,
    2,
  ),
);
