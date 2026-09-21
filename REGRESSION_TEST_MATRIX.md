# Empire Rush Round 2 Regression Matrix

This matrix is the release gate for every Round 2 feature commit. A feature is not merged into `main` unless all rows pass.

| Area | Regression check | Pass condition |
|---|---|---|
| Save/load | Validate the save key, JSON parse path, latest-state snapshot, and hydration gate. | Existing saves are read before persistence writes; malformed data falls back safely. |
| Offline earnings | Test normal elapsed time, 24-hour cap, clock rollback, tampered clock, invalid profit, and restart hydration. | Rewards are bounded, deterministic, and never awarded from invalid or reversed time. |
| Retail accounting | Simulate a two-second retail tick with stock and without stock. | COGS, fixed costs, tax, units sold, hourly profit, and empty-shelf zero payout remain correct. |
| Wallet safety | Exercise purchase, passive payout, mission, trade, and negative-net settlement paths. | Liquid cash never becomes negative or non-finite. |
| Daily mission/streak | Test first login, consecutive login, missed login, tap progress, and one-time claim. | Streak and mission state persist and cannot pay twice. |
| IPO lock | Test unacquired company, below-threshold valuation, eligible company, and already-public company. | IPO is blocked until eligible and duplicate public offerings are impossible. |
| Purchase flow | Static-contract check plus source audit for request, confirmed purchase, transaction finish, and failure path. | No reward is applied without a confirmed platform purchase. |
| Safe area | Static check of root and business screen safe-area edges. | Top status area and bottom navigation are protected on compact and inset devices. |
| Timer ownership | Inspect all intervals/timeouts and cleanup functions. | Every mounted timer has cleanup; business callbacks do not reset the economy loop. |
| Standalone bundle | Run the required React Native Android bundle command. | Non-empty `index.android.bundle` is generated. |
| Android APK | Run GitHub Actions build and embedded-bundle verification. | Gradle build, APK creation, bundle verification, and artifact upload all pass. |

The baseline gate must run before Round 2 feature work. It must run again after every feature commit and before merging the branch into `main`.
