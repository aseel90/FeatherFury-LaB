# Feather Fury active runtime map

This file records the single active runtime chain used by `main` after the August 29 stabilization.

## Boot ownership
- `index.html` is now a full local document. It does **not** fetch a historical HTML commit.
- `game.js` is the only runtime loader and contains the executable `ACTIVE_PATCHES` / `RETIRED_PATCHES` map.
- `lab-ui.js` is a local LAB helper only. It does **not** fetch or inject any remote UI/runtime script.
- `patch-runner.js`, `patch-manifest.js`, and `startup-menu-guard-v1.js` are not part of boot.

## Active owners
- Core runtime: `stable-runtime-w3-clean-v1.js`
- Playable characters: `character-roster-v1.js` after `hero-blue-ninja-v1.js`, `hero-static-smooth-v2.js`, `hero-blue-effects-v1.js`, `fierce-falcon-v1.js`, and `skin-routing-hardfix-v2.js`
- World 1 background: `world1-cursed-woods-background-v3.js` + `world1-final-art-lock-v1.js`
- World 1 boss art: `crow-king-ingame-v4.js`
- World 1 obstacle art: `world1-cursed-obstacles-v5.js`
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

## Permanent integrity gate
`.github/workflows/repo-safety.yml` runs `scripts/runtime-integrity-check.js` on every push/PR to `main`. The gate rejects missing active owners, active/retired overlap, historical HTML/UI bootstrap loaders, invalid pause visibility ownership, and regressions that restore the fever bar or duplicate top boss HUD.
