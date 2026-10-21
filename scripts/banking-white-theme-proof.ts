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
for (const key of ["home", "accounts", "loans", "investors", "credit", "deposits", "insurance", "tax", "history", "inspector"]) {
  assert.match(screen, new RegExp(`${key}: \\{ source: require`), `missing visual mapping for ${key}`);
}
assert.match(screen, /bg: "#FFFFFF"/);
assert.match(screen, /panel2: "#EAF2FA"/);
assert.match(screen, /text: "#172B4D"/);
assert.match(screen, /<BankVisual tab=\{tab\} \/>/);
console.log(JSON.stringify({
  test: "banking-white-theme-proof",
  assets: requiredAssets.length,
  allAssetsPresent: true,
  maxAssetBytes: Math.max(...requiredAssets.map((asset) => fs.statSync(path.join(root, "assets/banking", asset)).size)),
  mappedTabs: 10,
  whiteTheme: true,
  sectionVisuals: true,
  status: "PASS",
}, null, 2));
