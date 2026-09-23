# Round 10 — Interactive Command Deck UI

## Visual direction

The Home tab now uses a cinematic green-and-gold founder command deck inspired by the supplied reference screens. It is intentionally implemented as live React Native UI rather than a static mockup: every major visual card has a real action or live value behind it.

## Delivered interactions

The Home screen now has a layered hero panel with live level, rank, cashflow, and streak chips; an animated cash pulse around the WealthCard; a raised central tap control with two orbit rings and a pulsing glow; multi-lane floating `+$` feedback; press-scale and spring feedback; haptic and click audio preservation; an energy-budget progress track; an upgrade card showing current value, next value, level, and exact cost; a tappable next-move card that routes directly to Retail; mission claim feedback; a founder identity panel; weekly event and prestige action; business/store quick actions; and milestone sharing.

The bottom navigation now has tactile press scaling and a raised central Empire button to make the primary loop visually obvious, matching the requested Earn-centered interaction pattern without changing tab behavior.

## Economy safety

No economy formulas were changed in this UI round. The Round 9 structural IPO fix remains intact. The IPO-inclusive proof still reports a $500,000 raise from a $1,000,000 pre-IPO checkpoint, 1.5x immediate net-worth step, 20% public float, 80% founder ownership, and `PASS`.

## Verification

Passed:

```text
npx tsc --noEmit
git diff --check
npx tsx scripts/regression-health.ts
npx tsx scripts/ipo-economy-round7.ts
```

The regression gate reports `Round 2 baseline regression matrix passed`.

This round is source-verified and CI-build pending at the time of writing. Device screenshot verification is not claimed until the new APK is installed or the emulator screenshot workflow completes.
