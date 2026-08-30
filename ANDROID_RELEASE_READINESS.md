# Feather Fury — Android Release Readiness

This document is the release gate for Android work in `FeatherFury-LaB`.
Production `FeatherFury` must receive only a clean, verified update after every mandatory gate below passes.

## RC baseline

- Web/gameplay source: Lab `main` only.
- Android runtime: Capacitor 8.5.x, Node 22+, Android compile/target SDK 36.
- Native app id: `com.aseel.featherfury`.
- Native app name: `Feather Fury`.

## Mandatory gates

1. **Self-contained startup**
   - The packaged game core must be local.
   - No runtime code may be fetched from jsDelivr or another CDN.
   - Android must start with networking disabled.

2. **Web regression gate**
   - Chromium mobile smoke passes.
   - WebKit/iPhone smoke passes.
   - Splash -> Main -> World Select -> PLAY remains intact.

3. **Navigation/lifecycle gate**
   - Android Back from gameplay opens Pause.
   - Android Back from Pause resumes gameplay.
   - Android Back from Settings/Store returns to the correct origin.
   - Backgrounding a live run pauses simulation and audio.
   - Returning to foreground never auto-resumes gameplay.

4. **Responsive UI gate**
   - 320, 360, 390 and 412 CSS-pixel widths checked.
   - Short viewport and tall viewport checked.
   - Store Buy buttons remain inside every character card.
   - Safe areas/notches do not cover HUD or controls.

5. **Android build gate**
   - Debug APK builds and installs.
   - Release AAB builds.
   - `compileSdk = 36` and `targetSdk = 36` are verified in CI.
   - Capacitor App plugin is present in the native build.

6. **Release signing gate**
   - Upload keystore is stored only as GitHub Actions secrets.
   - Signed AAB is produced only in the production release workflow.
   - No key, password or credential is committed to the repository.

7. **Full game regression**
   - World 1 through boss/victory.
   - World 2 through boss/outro.
   - World 3 through boss/outro.
   - Defeat, Revive, Restart, Pause, Settings, Store and Main routes.
   - Coins, purchases, selected bird, language and progress persist after app restart.

## Current hardening work

- `android-native-v1.js` owns Android lifecycle/back integration and delegates UI transitions to `window.__FF_UI_NAV__`.
- `.github/workflows/build-android-rc.yml` owns unsigned RC APK/AAB generation in Lab.
- `scripts/materialize-core.js` owns reproducible generation of the local game core from the pinned historical source and approved W3 transforms.

Do not promote the Android RC to production until every mandatory gate is green.
