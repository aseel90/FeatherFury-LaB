# Feather Fury active runtime map

> **Snapshot companion:** the canonical architecture, boot contracts, full patch order, known debt and change protocol live in `FEATHER_FURY_GAME_SPEC.md`. If this snapshot drifts, update it from the actual loader/spec rather than restoring older patches.

This file records the single active runtime chain used by `main` after the August 29 stabilization.

## Boot ownership
- `index.html` is now a full local document. It does **not** fetch a historical HTML commit.
- `game.js` is the only gameplay runtime loader and contains the executable `ACTIVE_PATCHES` / `RETIRED_PATCHES` map.
- `ui-runtime-boot-v1.js` owns post-runtime UI loading after `window.__FF_RUNTIME_APPROVED_STACK__` becomes ready.
- `ui-runtime-fixes-v1.js` + `ui-runtime-fixes-v1.css` are the current post-runtime repair layer for the pause simulation freeze, visible HUD data bridge, fever bar, physical RTL/LTR HUD placement, World/PLAY spacing, and store coin-balance identity. They must load **after** `ui-hud-v1` so they can bridge the legacy core without modifying world/boss ownership.
- `lab-ui.js` is a local LAB helper only. It does **not** fetch or inject any remote UI/runtime script.
- `patch-runner.js`, `patch-manifest.js`, and `startup-menu-guard-v1.js` are not part of boot.

## Active owners
- Core runtime: `stable-runtime-w3-clean-v1.js` — **temporary recovery transformer**; it currently fetches a pinned historical `game.js` from jsDelivr at runtime, transforms it, and evaluates it. The final private/offline/Android architecture must materialize this core locally.
- Runtime compatibility bridge: `runtime-config-bridge-v1.js` exposes the legacy lexical `CONFIG` object as `window.CONFIG` for runtime patches that require it. It owns no renderer or visual UI.
- Gameplay pause UI: `core-gameplay-ux-v1.js`; the final simulation freeze is applied post-runtime by `ui-runtime-fixes-v1.js` so every later world/boss `update()` wrapper is frozen as well.
- Gameplay HUD layout: `ui-hud-v1.js` / `ui-hud-v1.css`; live score, session coins and fever values are bridged by `ui-runtime-fixes-v1.js` from the real game state to the visible HUD DOM.
- Playable characters: `character-roster-v1.js` after `hero-blue-ninja-v1.js`, `hero-static-smooth-v2.js`, `hero-blue-effects-v1.js`, `fierce-falcon-v1.js`, and `skin-routing-hardfix-v2.js`
- World 1 background: `world1-cursed-woods-background-v3.js` + `world1-final-art-lock-v1.js`
- World 1 boss art: `crow-king-ingame-v4.js`
- World 1 obstacle art: `world1-cursed-obstacles-v5.js`
- World 1 final ground/dialogue ownership: `world1-ground-obstacle-polish-v2.js` + `world1-owl-dialogue-layer-fix-v3.js`; the dialogue layer owns the final `approach → dialogue → paired FLY_AWAY → victory` cinematic
- World 2 boss behavior: `w2-boss-runtime-v10.js`
- World 2 boss final art: `w2-emperor-png-v5.js`
- World 3 runtime cleanup: `w3-runtime-cleanup-v1.js`
- World 3 final enemies/environment: `w3-enemy-png-v1.js`, `w3-voltbat-png-v1.js`, `w3-environment-png-v1.js`

## Retired / not loaded
- `boss-crowking-v1.js` — superseded by Crow King V4
- `world1-classic-enhanced-background-v1.js` — superseded by the approved Cursed Woods art lock
- `ruins-pillars-v3.js` — superseded by Cursed Woods obstacles
- `w2-v7-compat-v1.js`, `w2-boss-combat-v5.js`, `w2-boss-combat-v6.js`, `w2-boss-tuning-v8.js`, `w2-boss-phase2-relief-v9.js` — superseded by World 2 Runtime V10
- `w3-critical-fix-v5.js` — superseded by V6 and the cleaned World 3 runtime
- `startup-menu-guard-v1.js` — deleted; startup state is owned by `game.js`
- `world1-ground-gap-polish-v1.js` — retired; its ground renderer duplicated `world1-ground-obstacle-polish-v2.js` and could repaint ground above the World 1 outro dialogue

## Permanent integrity gate
`.github/workflows/repo-safety.yml` runs `scripts/runtime-integrity-check.js` on every push/PR to `main`. The gate rejects missing active owners, active/retired overlap, historical HTML/UI bootstrap loaders, invalid pause visibility ownership, loss of the post-runtime pause/HUD repair layer, and regressions that hide the gameplay fever bar or restore the duplicate top boss HUD.
