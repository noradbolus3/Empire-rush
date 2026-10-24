import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const modules = [
  "TaxiCompanyScreen.tsx", "ShippingCompanyScreen.tsx", "FactoryCompanyScreen.tsx",
  "ConstructionCompanyScreen.tsx", "CarDealershipScreen.tsx", "SoftwareCompanyScreen.tsx",
  "SportsClubCompanyScreen.tsx", "OilGasCompanyScreen.tsx", "AirlineCompanyScreen.tsx",
  "HotelCompanyScreen.tsx", "BlockchainCompanyScreen.tsx", "SpaceCompanyScreen.tsx",
  "HoldingCompanyScreen.tsx",
];
const checks: Array<Record<string, unknown>> = [];
const add = (name: string, passed: boolean, details: Record<string, unknown> = {}) => {
  checks.push({ name, status: passed ? "PASS" : "FAIL", ...details });
};
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

const shell = read("src/components/business/SpecializedBusinessShell.tsx");
const hub = read("src/screens/business/BusinessMasterHubScreen.tsx");
add("shared shell uses flex root", /root:\s*\{[^}]*flex:\s*1/.test(shell), { file: "SpecializedBusinessShell.tsx" });
add("shared shell uses safe-area top/left/right", /edges=\{\["top", "left", "right"\]\}/.test(shell), {});
add("shared shell has bottom-nav clearance", /paddingBottom:\s*124/.test(shell), {});
add("shared tabs are compact and non-flexing", /tabScroller:\s*\{[^}]*flexGrow:\s*0[^}]*flexShrink:\s*0/.test(shell) && /tab:\s*\{[^}]*minHeight:\s*40[^}]*justifyContent:\s*"center"/.test(shell), {});
add("hub imports shared design tokens", /from ['"]\.\.\/\.\.\/theme\/designSystem['"]/.test(hub), { file: "BusinessMasterHubScreen.tsx" });
add("hub uses flex root", /root:\s*\{[^}]*flex:\s*1/.test(hub), {});
add("hub has bottom-nav clearance", /content:\s*\{[^}]*paddingBottom:\s*120/.test(hub), {});
add("hub has top safe-area edge", /<SafeAreaView[^>]*edges=\{\["top",\s*"left",\s*"right"\]\}/.test(hub), {});
add("hub sub-tabs are compact", /hubTab:\s*\{[^}]*minHeight:\s*40[^}]*justifyContent:\s*"center"/.test(hub), {});
add("hub sub-tabs avoid flex growth", !/hubTab:\s*\{[^}]*flex:\s*1/.test(hub), { note: "flex:1 can create uneven large controls on narrow screens" });

for (const file of modules) {
  const source = read(`src/screens/${file}`);
  const assets = (source.match(/require\(/g) || []).length;
  const nestedVerticalScroll = (source.match(/<ScrollView(?![^>]*horizontal)/g) || []).length > 0;
  add(`${file}: shared shell`, /SpecializedBusinessShell/.test(source), { file });
  add(`${file}: shared design tokens`, /designSystem/.test(source), { file });
  add(`${file}: ledger callback`, /onLedger\?\./.test(source), { file });
  add(`${file}: no nested vertical ScrollView`, !nestedVerticalScroll, { file, verticalScrollViews: nestedVerticalScroll ? 1 : 0 });
  add(`${file}: page-specific visual assets`, assets >= 5, { file, requireCount: assets, threshold: 5 });
  add(`${file}: no legacy black surface`, !/(#000000|#0B0F17|black)/i.test(source), { file });
  add(`${file}: explicit white/light surface palette`, /surfaceLight|backgroundColor:\s*['"]#FFF/.test(source), { file });
}

const failed = checks.filter((item) => item.status === "FAIL");
const passed = checks.length - failed.length;
console.log(JSON.stringify({ test: "business-visual-consistency-audit", modules: modules.length, checkCount: checks.length, passed, failed: failed.length, results: checks }, null, 2));
if (failed.length) process.exitCode = 1;
