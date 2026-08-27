# Feather Fury — Game Plan / Approved Systems

This document is the product-development source of truth for systems that have been approved or explicitly locked by the project owner.

## Project rule

- If a system is marked **APPROVED / LOCKED**, keep the same implementation technique and improve only inside that technique unless the project owner explicitly approves a change.
- Reference artwork/code is visual direction, not permission to install a separate renderer or gameplay system.
- All World 1/World 2/World 3 environment work should stay inside the current Canvas 2D runtime unless a technique change is explicitly approved.

## World 1 — COMPLETE / FROZEN

World 1 has passed visual/gameplay review and is now frozen for feature work.

### Approved World 1 runtime

- `world1-cursed-obstacles-v5.js`: approved image-based cursed obstacles with trimmed assets and stable collision/movement ownership.
- `world1-classic-enhanced-background-v1.js`: approved classic-enhanced Cursed Woods background. Preserves the original stage-responsive sky and adds ruins/trees/eyes/fog without replacing the core palette system.
- `world1-ground-obstacle-polish-v2.js`: approved ground/obstacle layout polish with continuous unwrapped scroll.
- `world1-crow-contrast-v1.js`: approved crow readability/contrast treatment.
- World 1 dialogue layering: modern ground/environment is drawn first and dialogue characters/text are redrawn last so dialogue owns the foreground.

### World 1 lock

- Do not change World 1 obstacle geometry, collisions, background technique, character behavior, boss mechanics or approved visual stack unless a concrete regression is reported.
- Retired World 1 visual experiments remain out of the active boot chain.

**Completion record — 2026-08-27**

- Visual direction approved by the project owner.
- Final dialogue/ground layering fix is included in the approved World 1 runtime.
- World 1 completion gate is considered PASSED.
- Status: **COMPLETE / FROZEN**. Reopen only for a concrete regression or bug report.

## World 2 — AUDIT / OPEN

World 2 is now the active development target. No World 2 visual system is locked yet; first changes should follow an audit-and-approve cycle similar to World 1.

Current runtime stack observed during the initial audit:

- Core World 2 boss module: `js/world2.js`.
- Environment visuals: `w2-visuals-v1.js`.
- World 2 gameplay/story flow: `w2-gameplay-v1.js`.
- Frost audio identity: `w2-audio-v1.js`.
- Emperor Penguin boss is currently layered through `w2-boss-polish-v2.js`, `w2-boss-orb-v7.js`, `w2-v7-compat-v1.js`, `w2-boss-combat-v6.js`, `w2-boss-tuning-v8.js`, and `w2-boss-phase2-relief-v9.js`.
- Until the World 2 direction is approved, prefer targeted refinement over introducing additional parallel boss/background systems.

### World 2 boss audit — PHASE 1 CLEANUP

Audit result before Emperor visual redesign:

- `w2-boss-polish-v2.js` owns Emperor audio identity, visual lift/eagle art, and the base patched penguin state machine. Its manual orb projectile path is now transport/render only and cannot damage the boss directly.
- `w2-boss-orb-v7.js` is the authoritative World 2 boss damage mechanic: collected orbs build charge and three successful falling-ice strikes defeat the Emperor.
- `w2-boss-combat-v6.js` owns special-attack cadence and baseline boss-shot tuning and now depends directly on V7.
- `w2-boss-tuning-v8.js` owns the final landing settle, deliberate fire cooldown, projectile speed override, and revive/resume state preservation.
- `w2-boss-phase2-relief-v9.js` owns the final phase-2 burst throttle.
- `w2-v7-compat-v1.js` is retired from the active boot chain; it only aliased the obsolete `__w2BossOrbV6Installed` flag to V7.
- Conflict removed: the pre-V7 manual projectile bridge could previously damage the boss before V7 converted the same collected orb into charge, contradicting the ice-only damage rule and allowing effective double progress.
- No boss HP values, attack timings, projectile speeds, phase thresholds, collision sizes, or visual design were intentionally changed by this audit cleanup.
- Remaining cleanup after runtime verification: consolidate the stacked `updatePenguinBoss` / `game.update` wrappers into a single authoritative Emperor runtime before final boss art is locked.

### World 2 environment art v1 — IMPLEMENTED / AWAITING VISUAL APPROVAL

Current active scope is background + ground + obstacles only. Boss/gameplay tuning remains out of scope.

- User-approved direction: generated image assets are allowed and should be used for the World 2 environment.
- Asset payload: `w2-environment-assets-v1.js` stores the generated SVG image layers locally in-repository as embedded image data; there are no external runtime asset dependencies.
- Background owner remains `w2-visuals-v1.js`, upgraded in-place rather than adding a parallel environment renderer.
- Background uses transparent generated image layers for far frost mountains, snowy pines and stage-2 avalanche debris. The core World 2 sky remains visible so score-15 and boss palette transitions are preserved.
- Ground uses a seamless generated frozen-ground image tile driven by the same continuous World 2 visual travel; `GROUND_HEIGHT` and collision are unchanged.
- Obstacles use generated top/bottom ice-cliff images while preserving the existing pillar positions, passage gap and collision widths.
- Status is **AWAITING VISUAL APPROVAL**. Do not lock these World 2 environment assets until the project owner tests them in-game.

## Next-work rule

At the start of every future task, check this file first. If the target system is marked APPROVED / LOCKED, refine its current implementation instead of testing a new technique.
