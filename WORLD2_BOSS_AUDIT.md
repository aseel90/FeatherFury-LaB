# World 2 Boss Audit — Emperor Penguin

Audit target: current Emperor Penguin runtime before visual redesign.

## Current ownership

- `js/world2.js`: original World 2 boss implementation and sprite source.
- `w2-gameplay-v1.js`: early World 2 gameplay/story boss override.
- `w2-boss-polish-v2.js`: Emperor audio identity, visual lift/eagle polish, patched penguin state machine, and the legacy manual-orb bridge.
- `w2-boss-orb-v7.js`: authoritative boss-damage mechanic. Orbs are charge tokens; three falling-ice strikes defeat the Emperor. It also owns the ice blocks, charge gauge, and burst conversion.
- `w2-v7-compat-v1.js`: retired from active boot in Phase 2. It remains only as rollback history and is no longer required by Combat V6.
- `w2-boss-combat-v6.js`: special-attack cadence and baseline boss-shot tuning.
- `w2-boss-tuning-v8.js`: final landing settle, fire cooldown, projectile-speed override, and revive/resume preservation.
- `w2-boss-phase2-relief-v9.js`: final phase-2 burst throttle and, after this audit, the final ice-only damage integrity guard.

## Conflict found and fixed in Phase 1

The legacy manual projectile bridge in `w2-boss-polish-v2.js` can reduce boss HP during the wrapped update before `w2-boss-orb-v7.js` consumes the same collected orb as charge. That contradicts V7's explicit rule that falling ice is the only boss damage source and can create effective double progress.

Phase 1 adds a final integrity guard in `w2-boss-phase2-relief-v9.js`. The guard derives the minimum valid Emperor HP from V7's `completedDrops` state and restores any lower HP that appears without a new completed ice drop. A legitimate V7 ice impact is preserved because `completedDrops` advances in the same update.

## Intentionally unchanged

This audit does not intentionally change:

- `W2_BOSS_HP`
- phase thresholds
- attack timers/cadence
- projectile speeds or gravity
- slide/jump movement
- collision sizes
- orb count per ice drop
- required number of ice drops
- Emperor art

## Remaining cleanup before final Emperor design

1. Verify the current fight still completes through exactly three ice drops and that direct orb projectiles no longer reduce HP.
2. **DONE — Phase 2:** `w2-v7-compat-v1.js` is retired from normal and legacy boot; Combat V6 now depends directly on V7.
3. Consolidate the stacked `updatePenguinBoss` wrappers into one authoritative Emperor runtime while preserving current approved mechanics.
4. Consolidate the stacked `game.update` boss wrappers and make damage/projectile ownership explicit.
5. Only after the runtime is clean, redesign the Emperor visually and use that approved design language to derive the smaller penguin enemies.
