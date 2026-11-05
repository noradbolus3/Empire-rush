import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const screen = fs.readFileSync(path.join(root, "src/screens/BankScreen.tsx"), "utf8");
const requiredAssets = [
  "headquarters.webp",
  "banking-hall.webp",
  "loans-credit.webp",
  "treasury-risk.webp",
  "digital-branches.webp",
];
for (const asset of requiredAssets) {
  const file = path.join(root, "assets/banking", asset);
  assert.equal(fs.existsSync(file), true, `missing ${asset}`);
  assert.ok(fs.statSync(file).size < 160_000, `${asset} is too large`);
}
for (const key of ["home", "setup", "accounts", "loans", "operations", "branches", "investors", "enterprise", "credit", "deposits", "insurance", "tax", "history", "inspector"]) {
  assert.match(screen, new RegExp(`${key}: \\{ source: require`), `missing visual mapping for ${key}`);
}
const designSystem = fs.readFileSync(path.join(root, "src/theme/designSystem.ts"), "utf8");
assert.match(screen, /from "\.\.\/theme\/designSystem"/);
assert.match(screen, /bg: designSystem\.colors\.background/);
assert.match(screen, /panel: designSystem\.colors\.card/);
assert.match(screen, /text: designSystem\.colors\.heading/);
assert.match(screen, /<BankVisual tab=\{tab\} \/>/);
assert.match(designSystem, /surface: '#FFFFFF'/);
console.log(JSON.stringify({
  test: "banking-white-theme-proof",
  assets: requiredAssets.length,
  allAssetsPresent: true,
  maxAssetBytes: Math.max(...requiredAssets.map((asset) => fs.statSync(path.join(root, "assets/banking", asset)).size)),
  mappedTabs: 14,
  whiteTheme: true,
  sectionVisuals: true,
  status: "PASS",
}, null, 2));
