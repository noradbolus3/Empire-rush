import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const business = fs.readFileSync(path.join(root, "src/screens/BusinessScreen.tsx"), "utf8");
const app = fs.readFileSync(path.join(root, "App.tsx"), "utf8");
assert.match(business, /<Text style=\{styles\.bankingEyebrow\}>FINANCIAL SERVICES<\/Text>/);
assert.match(business, /<Text style=\{styles\.factoryTitle\}>Banking Company<\/Text>/);
assert.match(business, /<Text style=\{styles\.factoryButtonText\}>OPEN BANKING<\/Text>/);
assert.match(app, /onOpenBank=\{\(\) => setTab\("bank"\)\}/);
console.log(JSON.stringify({
  test: "business-bank-entry-proof",
  registryLabel: "Banking Company",
  action: "OPEN BANKING",
  destination: "bank",
  status: "PASS",
}, null, 2));
