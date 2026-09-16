# Empire Rush

## Android-first repository layout

Empire Rush is being migrated from the original browser/3D prototype to an Android-first game. The repository now keeps the reusable Unity-oriented simulation core at `Assets/Scripts/Core/EmpireRushCore.cs` and moves the old browser implementation into [`legacy-web/`](legacy-web/README.md) as a reversible archive. This avoids deleting prior work while making it clear that new production gameplay should not be added to the web shell.

The repository does not yet contain a complete Unity project or exported Android Gradle project. In particular, it currently has no `ProjectSettings/`, Unity solution/project files, `android/gradlew`, React Native/Expo package manifest, or native Android source tree. The existing C# core is therefore the starting point for the native client, not a release-ready Android build.

## Build automation

[`.github/workflows/build-android.yml`](.github/workflows/build-android.yml) now performs a successful readiness check on every push and only runs APK/AAB Gradle steps when an executable `android/gradlew` exists. This prevents misleading failed Android runs while the native client is being created. Once the Android project is added, the workflow builds a debug APK and release AAB targeting SDK 34, using GitHub Actions secrets for the production keystore.

## Migration rule

The legacy browser files are retained for reference and possible logic extraction. New systems such as financial markets, real estate, IPOs, and monetization should be ported into the native client rather than extended inside `legacy-web/`.
