# Feather Fury — Telemetry & Firebase Analytics Contract

Status: **approved additive release instrumentation**  
Runtime owner: `telemetry-v1.js`  
Android transport: `@capacitor-firebase/analytics`

Telemetry exists to measure balance and release health without changing the game. It does not own physics, collisions, worlds, bosses, progression, economy, UI navigation, purchases, Revive behavior, rendering, or saves.

## Runtime rules

- `telemetry-v1.js` loads after `ui-runtime-boot-v1.js` and `android-native-v1.js`.
- It waits until the final menu/runtime stack is ready before installing observation hooks.
- Android sends events through the native `FirebaseAnalytics` plugin.
- Web/PWA execution is **fail-open**: if native Firebase does not exist, gameplay must continue normally and QA can still observe local `ff:telemetry` events.
- Analytics errors must never block PLAY, Pause, Revive, Store, navigation, boss transitions, or save operations.
- Telemetry must not create or repurpose any `fh_*` save key.
- Telemetry does not assign a Firebase user ID and does not intentionally add custom PII fields.

## Event vocabulary v1

- `telemetry_ready`
- `run_start`
- `boss_start`
- `death`
- `coins_earned`
- `revive_used`
- `hero_purchase`
- `hero_unlock`
- `hero_selected`
- `boss_complete`
- `world_complete`
- `run_end`

Coin income is **aggregated at death/victory checkpoints** instead of emitting one Analytics event for every coin pickup.

## Run accounting

- Each run gets a temporary in-memory `run_id`; it is not a persistent player identifier.
- A fatal hit cancelled by a defensive hero ability is not a `death`; death is logged only after the engine actually reaches `GAMEOVER`.
- A successful Revive continues the same run and accumulates its Revive count/cost.
- Restart or returning to the menu closes the old telemetry run before another begins.
- Victory records boss/world completion and closes the run.
- Hero purchase/unlock events observe authoritative game/economy state after the fact; telemetry is never a second purchase/unlock owner.

## Android/Firebase build contract

- Android application id remains `com.aseel.featherfury`.
- Source Firebase config is `android-assets/google-services.json` and must match that package.
- CI generates `android/`, copies Firebase config into `android/app/google-services.json`, then runs `npx cap sync android`.
- The Android RC must contain the Capacitor Firebase Analytics plugin.
- CI syntax-checks `telemetry-v1.js`, verifies it exists in the offline `www/` bundle, and runs `scripts/telemetry-integrity-check.js`.

## Release/privacy rule

Before public production release, Google Play Data safety and the published privacy policy must describe the data actually collected by the shipped SDKs. AdMob/rewarded ads are a separate future change and must not be silently introduced through telemetry.
