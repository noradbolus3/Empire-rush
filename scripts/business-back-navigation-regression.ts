import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = [
  "src/screens/business/BankingCompanyScreen.tsx",
  "src/screens/business/BusinessMasterHubScreen.tsx",
  "src/screens/business/ConstructionCompanyScreen.tsx",
  "src/screens/business/ITSoftwareCompanyScreen.tsx",
  "src/screens/business/RetailHubScreen.tsx",
];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  assert.match(source, /BUSINESS_BACK_LABEL/,
    `${file} must use the shared Business Portfolio back label`);
  assert.doesNotMatch(source, /‹ BUSINESS REGISTRY/,
    `${file} still contains the stale registry label`);
}

console.log(JSON.stringify({
  test: "business-back-navigation-regression",
  activeScreens: files.length,
  label: "‹ BUSINESS PORTFOLIO",
  staleRegistryLabels: 0,
  result: "PASS",
}, null, 2));
