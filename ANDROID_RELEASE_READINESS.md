# Feather Fury — Android Release Readiness

This document is the release gate for Android work in `FeatherFury-LaB`.
Production `FeatherFury` must receive only a clean, verified update after every mandatory gate below passes.

## RC baseline

- Web/gameplay source: Lab `main` only.
- Android runtime: Capacitor 8.5.x, Node 22+, Android compile/target SDK 36.
- Native app id: `com.aseel.featherfury`.
- Native app name: `Feather Fury`.

## Official Android / Google Play icon identity

Status: **APPROVED / LOCKED**.

The official app icon identity is the blue Feather Fury ninja bird with:

- a black ninja headband / eye mask;
- two sharp solid-white eyes with no colored iris;
- a yellow/orange beak;
- electric blue plumage;
- a dark blue / violet magical background with restrained orange fire energy;
- no text inside the actual launcher or Google Play icon;
- the main face and eyes kept inside the Android adaptive-icon safe area.

Required deliverables for the Android release pipeline:

- Google Play store icon: `512x512`, 32-bit PNG, <= 1024 KB;
- adaptive foreground with transparency;
- adaptive background as a separate layer;
- monochrome/themed icon for supported Android versions;
- generated launcher densities must all derive from this same approved identity.

Do not restore the previous Feather Fury icon, generic bird icon, or any icon variant with colored irises. Any future icon redesign requires explicit approval before replacing this identity.

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
   - Android launcher/adaptive/themed icons use the approved Feather Fury ninja-bird identity above.

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
