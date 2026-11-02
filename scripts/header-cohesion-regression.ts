import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

assert.match(source, /const \[headline, setHeadline\] = useState<string \| null>\(null\)/);
assert.match(source, /\{headline && \(\s*<View style=\{styles\.news\}>/s);
assert.doesNotMatch(source, /useState\(headlines\[0\]\)/);
assert.doesNotMatch(source, /<Text style=\{styles\.micro\}>REAL-TIME TYCOON · LIVE<\/Text>/);
assert.match(source, /paddingTop: 5,/);
assert.match(source, /paddingBottom: 3,/);

console.log(JSON.stringify({
  test: "header-cohesion-regression",
  defaultHeadline: "absent",
  newsRow: "conditional-on-headline",
  identityMicroRow: "removed",
  compactPadding: "5px-top/3px-bottom",
  result: "PASS",
}, null, 2));
