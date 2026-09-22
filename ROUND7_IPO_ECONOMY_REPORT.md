# Empire Rush — Round 7 IPO Economy Rebalance

## Release result

Round 6 was frozen with the annotated tag `stable-round-6` at commit `b087782`. The economy work was developed on `round-7-ipo-economy`, passed the regression gates, and was merged into `main` at commit `5a97e49`.

GitHub Actions Android run [35775855320](https://github.com/noradbolus3/Empire-rush/actions/runs/35775855320) completed successfully. Offline JavaScript bundling, clean Gradle compilation, embedded-bundle verification, and APK upload all passed. The CI workflow injected build identity `5a97e49` into the generated APK.

## IPO exploit: before and after

| Metric | Before | After |
|---|---:|---:|
| Example IPO starting net worth | $1,000,000 | $1,000,000 |
| Cash injection | $22,800,000 | $3,000,000 maximum in the tested case |
| Immediate post-IPO net worth | $23,800,000 | $4,000,000 |
| Net-worth multiple | 23.8x | 4.0x |
| Public float | Existing implementation behaved as an oversized cash exploit | 20% |
| Founder ownership | Not applied to operating income | 80% |
| Future business cashflow | 100% | 80% founder share before wealth scaling |

The corrected model retains the requested minority-offering trade-off. Proceeds are capped at **3x the player’s current net worth**, which is inside the requested 2–4x range. A second defensive cap is applied in the final App launch handler, so stale or legacy listings cannot bypass the limit. Older listings without the new ownership field are migrated by inferring founder ownership from founder shares.

## Passive income versus tapping

Passive income now uses a bounded wealth multiplier:

```text
min(8, (1 + netWorth / 5,000)^0.3)
```

The ceiling prevents runaway growth while still making established businesses meaningfully more important than tapping.

| Net worth | Passive multiplier |
|---:|---:|
| $0 | 1.0000x |
| $25,000 | 1.7118x |
| $1,000,000 | 4.9086x |
| $100,000,000 | 8.0000x ceiling |

In the IPO simulation, the business’s immediate post-IPO hourly founder cashflow is lower than the pre-IPO amount because the founder share is 80%. The higher post-IPO value later comes from the explicitly bounded wealth multiplier and continued business operation, not a second IPO cash deposit.

## Tap upgrade ROI

The level-17 cost curve changed from:

```text
160 × 1.4^level = $48,786 at level 17
```

to:

```text
100 × 1.25^level = $4,441 at level 17
```

The gain remains approximately `$1.85` at level 17. At one tap per second, the estimated payback is now:

```text
$4,441 / $1.85 / 60 = 40.01 minutes
```

This is inside the requested **30–60 minute** payback window. The hard tap-value cap remains `$25`; the high-net-worth economy is intended to shift the player toward businesses and passive systems rather than endless tapping.

## IPO-inclusive simulation

The new deterministic script is `scripts/ipo-economy-round7.ts`. It includes pre-IPO operation, a normalized `$1M` IPO gate, the listing event, diluted founder cashflow, passive scaling, and post-IPO operation.

Key output:

```text
Legacy cash injection:          $22,800,000
Legacy net-worth multiple:      23.8x
Fixed cash injection:           $3,000,000
Fixed net-worth multiple:       4.0x
Public float:                   20%
Founder ownership:              80%
Level-17 tap cost:              $4,441
Level-17 gain:                  $1.85
Tap payback at 1 tap/sec:       40.01 minutes
Maximum adjacent curve step:    4.0x
Result:                         PASS
```

The simulation records the IPO transition explicitly:

| Phase | Net worth | Founder share |
|---|---:|---:|
| Pre-IPO gate | $1,000,000.00 | 100% |
| IPO close | $4,000,000.00 | 80% |
| Post-IPO minute 1 | $4,004,644.65 | 80% |
| Post-IPO minute 2 | $4,010,840.04 | 80% |
| Post-IPO minute 4 | $4,017,297.37 | 80% |
| Post-IPO minute 6 | $4,015,398.47 | 80% |

The event is now a bounded late-game capital decision rather than a 23.8x free-money exploit. The simulation’s `maxStepMultiple` guard is `4.0`; no unchecked 20x–23x spike remains.

## Existing Retail regression

The Round 6 Retail loop remains green after the economy changes:

| Checkpoint | Orders | Sales | Cash | Net worth | Minimum net worth | Result |
|---|---:|---:|---:|---:|---:|---|
| 10 minutes | 3 | 2,355 units | $2,606.65 | $7,896.65 | $5,000.00 | PASS |
| 1 hour | 15 | 14,580 units | $18,093.40 | $22,933.40 | $5,000.00 | PASS |
| 1 day | 354 | 352,680 units | $432,156.40 | $438,796.40 | $5,000.00 | PASS |

## Verification gates

All of the following passed after the final economy change:

```text
npx tsc --noEmit
 git diff --check
npx tsx scripts/regression-health.ts
npx tsx scripts/ipo-economy-round7.ts
npx tsx scripts/retail-loop-round6.ts
```

The regression matrix passed with:

```text
Round 2 baseline regression matrix passed
```

The local sandbox could not produce an APK because it has no installed Android SDK directory. That does not affect the release result: the GitHub Actions runner successfully performed the complete Android build using its configured SDK.

## Artifact

The verified CI APK is 252 MB with SHA-256:

```text
87ed66e99be7afe856bd41e33a35d9a54e6210489d5e676d89d7f119c430027b
```

Device/emulator screenshots were not rerun for this economy-only change. This report provides simulation and CI build proof; visual device proof remains **not device-verified**.
