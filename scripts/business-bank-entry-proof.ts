import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const business = fs.readFileSync(path.join(root, "src/screens/BusinessScreen.tsx"), "utf8");
const catalog = fs.readFileSync(path.join(root, "src/screens/business/businessRouteCatalog.ts"), "utf8");
const display = fs.readFileSync(path.join(root, "src/data/businessDisplayCatalog.ts"), "utf8");
assert.match(business, /buildUnifiedBusinessPortfolio/);
assert.match(catalog, /kind: "generic"[\s\S]*?screen: "business-master-hub"/);
assert.match(catalog, /case "Banking"[\s\S]*?getBusinessRouteByKind\("generic"\)/);
assert.match(display, /categoryLabel: "OPERATING COMPANY"/);
assert.match(business, /onOpenBank\?:/);
console.log(JSON.stringify({
  test: "business-bank-entry-proof",
  registryLabel: "Banking sector remains in canonical generic portfolio route",
  action: "Manage via BusinessMasterHub",
  destination: "business-master-hub",
  status: "PASS",
}, null, 2));
