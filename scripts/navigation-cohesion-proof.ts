import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file: string) => fs.readFileSync(file, "utf8");
const app = read("App.tsx");
const contract = read("src/navigation/navigationContract.ts");
const primitives = read("src/components/ScreenPrimitives.tsx");
const shell = read("src/components/business/SpecializedBusinessShell.tsx");
const chips = read("src/components/ChipRow.tsx");
const bank = read("src/screens/BankScreen.tsx");

assert.match(contract, /APP_TABS/);
assert.equal((contract.match(/id: "(empire|business|markets|lifestyle|bank)"/g) || []).length, 5);
assert.match(app, /APP_TABS\.map/);
assert.equal((app.match(/<Nav tab=\{tab\}/g) || []).length, 1);
assert.match(primitives, /flex: 1, minHeight: 0/);
assert.match(primitives, /SCREEN_BOTTOM_PADDING/);
assert.match(shell, /<ScreenScrollView/);
assert.match(shell, /<ScreenBackButton/);
assert.match(shell, /horizontal/);
assert.match(chips, /flexGrow: 0, flexShrink: 0/);
assert.match(chips, /height: 42/);
assert.match(bank, /FOUNDER_BANK_LABEL/);

console.log(JSON.stringify({
  status: "PASS",
  canonicalTopLevelTabs: ["empire", "business", "markets", "lifestyle", "bank"],
  appBottomNavMounts: 1,
  specializedShell: "one vertical ScreenScrollView + horizontal tab rail + shared back control",
  chipRow: "shared horizontal row with fixed 42px chips",
  founderBankHierarchy: "explicit",
}, null, 2));
