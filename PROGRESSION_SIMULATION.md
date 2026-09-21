# Empire Rush Progression Simulation

The simulation starts with **$5,000** and models an active player who taps 20 times per minute for the first 15 minutes and 5 times per minute afterward. Tap value increases by $0.50 every 100 taps, up to the in-game cap of $10. Business operations run in 60-second deterministic steps. Businesses unlock when simulated net worth reaches their threshold, and the simulator purchases eligible businesses when liquid cash covers the acquisition cost.

| Horizon | Liquid cash | Simulated net worth | Businesses acquired | Taps | Next unlock |
|---|---:|---:|---:|---:|---|
| 1 hour | $3,988.50 | $6,488.50 | 1 | 525 | Metro Mobility Taxi Fleet |
| 1 day | $45,358.40 | $72,858.40 | 2 | 7,425 | CyberPulse SaaS Studio |
| 1 week | $339,401.16 | $516,901.16 | 4 | 50,625 | Harborline Real Estate |
| 1 month | $2,638,422,210.86 | $2,668,999,710.86 | 10 | 216,225 | All sectors acquired |

The result confirms that the game does **not finish during the first hour**. The one-month result is intentionally a stress signal for the next balancing pass: construction contract bonuses and compounding expansion cashflow are strong enough to unlock the full catalog in the simulated month. This is not treated as a guaranteed player outcome because the script models consistently active tapping, automatic business purchases, and favorable contract completion.

The executable source is `scripts/progression-simulation.ts`. It is run with `npx tsx scripts/progression-simulation.ts`.

## References

[1]: https://github.com/noradbolus3/Empire-rush "Empire Rush source repository"
