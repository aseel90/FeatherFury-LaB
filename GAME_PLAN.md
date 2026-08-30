# FeatherFury — Game Development Plan

> **Scope:** design direction, approval locks, and historical planning. For the **current executable runtime**, active/retired files, boot order, ownership, and regression contracts, use `FEATHER_FURY_GAME_SPEC.md`. Some runtime filenames below are historical and may no longer be active; never reactivate a file from this plan without checking the canonical runtime spec and `game.js`.

This file is the development source of truth for approved systems and the next allowed task. The goal is to keep successful implementation methods stable instead of repeatedly testing new techniques.

## Development principle

Once a system works correctly and its visual/gameplay direction is approved, it becomes **APPROVED / LOCKED**.

- Future work improves that same system; it does not replace the technique.
- New libraries/renderers/physics approaches are not introduced for an approved system unless explicitly requested.
- Reference files and artwork are used for visual direction and ideas. Their design language is rebuilt inside FeatherFury's approved runtime rather than copy-pasted as a second system.
- Solved systems remain untouched while another system is being completed.

## World 1 — COMPLETE / FROZEN

### Approved / locked

**Cursed Woods obstacles — APPROVED / LOCKED**

- Runtime: `world1-cursed-obstacles-v5.js`.
- Approved method: image-based trimmed obstacle assets with stable synchronized movement and a fair collision core.
- The previous floating / malformed obstacle problem is considered solved.
- Do not return to procedural obstacle experiments, alternate obstacle shapes, or a replacement collision model unless a specific regression is reported.

**World 1 gameplay systems — PRESERVE**

- Do not alter bird physics, hitboxes, scoring, boss logic, HUD, revive, audio or story while finishing the World 1 visual polish.
- Existing World 1 fixes and wrappers must continue to operate around the background renderer.

### Final approved visual direction

**World 1 classic background restoration + final polish — APPROVED DIRECTION**

Approved implementation path:

- Canvas 2D only; keep the existing Feather Fury renderer and patch architecture.
- Restore the stable runtime sky gradient as the visible background owner. Do **not** paint an opaque replacement sky over it.
- This restores the built-in World 1 palette transitions: opening stage, the score-15 stage transition, and the boss palette.
- The discarded dense full-screen violet background is no longer the authoritative World 1 visual.
- Add only lightweight forest atmosphere over the original changing sky: classic ruins, layered trees, watching eyes and rolling fog.
- Keep the gameplay corridor readable and keep atmosphere behind gameplay objects/HUD.
- No WebGL, DOM/CSS background, new engine or external runtime.

**Ground — APPROVED**

- Keep the approved dark organic soil / roots / stones / restrained purple flora design.
- Ground art must scroll from an **unwrapped cumulative distance** reconstructed from the engine's wrapped `groundOffset`.
- Never seed ground identities from frame buckets or directly treat the 0..23 wrapped offset as total travel.
- `GROUND_HEIGHT`, floor collision and bird physics remain unchanged.

**Cursed Woods obstacles — APPROVED / LOCKED ART + TUNED LAYOUT**

- Keep `world1-cursed-obstacles-v5.js`, its image assets, stable movement method and hitbox width.
- Keep the currently approved passage opening at `144` logical px; this refinement targets spacing **between obstacle pairs** rather than narrowing the vertical passage again.
- World 1 normal obstacle cadence target: `112` frames (World 1 only; other worlds remain unchanged).
- The first-stage obstacle openings must use a deterministic varied-height sequence so the opening does not repeatedly appear at the same vertical level.
- After the opening stage, existing movement/randomization rules continue normally.

**Crow minions — VISIBILITY POLISH**

- Keep the current crow size, AI and hitbox.
- Increase separation from the forest with a slightly lighter blue-gray charcoal body, a thin cool rim light and a clearer red enemy eye.
- Do not add a large halo or bright white outline.

### World 1 runtime ownership — CLEAN / LOCKED

The modern World 1 stack must be installed **before gameplay is unlocked**. The player must never enter while an older visual patch is still active.

- Authoritative background: `world1-cursed-woods-background-v3.js` + `world1-final-art-lock-v1.js`.
- Authoritative ground + obstacle layout polish: `world1-ground-obstacle-polish-v2.js`.
- Authoritative obstacle renderer/art: `world1-cursed-obstacles-v5.js` + the approved top/bottom assets.
- Authoritative small-crow art: `crow-minions-ingame-v3.js` followed by `world1-crow-contrast-v1.js`.
- Explicit runtime-retired W1 visual owners include `world1-classic-enhanced-background-v1.js`, `ruins-pillars-v3.js`, and `world1-ground-gap-polish-v1.js`. `cursed-woods-v1.js`, `world1-background-scope-v1.js`, and `cursed-crows-v1.js` are legacy/not loaded by the current boot chain.
- Final World 1 runtime order belongs to the active map in `game.js`; `patch-runner.js` / `patch-manifest.js` are not part of current boot.
- Boot input must remain blocked until the approved runtime and menu UI contracts are ready. No visible old-background → new-background swap is acceptable.

### World 1 completion gate

World 1 is **COMPLETE** when all of the following are true:

1. The final Cursed Woods background and ground are visually approved.
2. Approved obstacles still look grounded and move correctly.
3. Collision behavior remains aligned with the visible obstacles.
4. Start Mission and World 1 play without runtime errors.
5. The final patches load from the repository without a stale-cache mismatch.
6. No unrelated World 1 system changed during visual polish.

After this gate is passed, World 1 is frozen for feature work. Only reported bugs should reopen it.

**Completion record — 2026-08-27**

- Visual direction approved by the project owner.
- Final dialogue/ground layering fix is included in the approved World 1 runtime.
- World 1 completion gate is considered PASSED.
- Status: **COMPLETE / FROZEN**. Reopen only for a concrete regression or bug report.

## World 2 — IMPLEMENTED / POLISH OPEN

World 2 is implemented in the current runtime. Remaining work should be treated as targeted bug/visual polish unless a new feature is explicitly requested. Current executable ownership is defined in `FEATHER_FURY_GAME_SPEC.md`.

Current runtime stack observed during the initial audit:

- Core World 2 boss module: `js/world2.js`.
- Environment visuals: `w2-visuals-v1.js`.
- World 2 gameplay/story flow: `w2-gameplay-v1.js`.
- Frost audio identity: `w2-audio-v1.js`.
- Ice Emperor boss behavior authority is `w2-boss-runtime-v10.js`, with support from `w2-boss-polish-v2.js` and `w2-boss-orb-v7.js`; final boss art is `w2-emperor-png-v5.js`.
- `w2-v7-compat-v1.js`, `w2-boss-combat-v5.js`, `w2-boss-combat-v6.js`, `w2-boss-tuning-v8.js`, and `w2-boss-phase2-relief-v9.js` are retired and must not be restored.
- Prefer targeted refinement over introducing additional parallel boss/background systems.

### World 2 environment art v1 — IMPLEMENTED / AWAITING VISUAL APPROVAL

Current active scope is background + ground + obstacles only. Boss/gameplay tuning remains out of scope.

- User-approved direction: generated image assets are allowed and should be used for the World 2 environment.
- Asset payload: `w2-environment-assets-v1.js` stores the generated SVG image layers locally in-repository as embedded image data; there are no external runtime asset dependencies.
- Background owner remains `w2-visuals-v1.js`, upgraded in-place rather than adding a parallel environment renderer.
- Background uses transparent generated image layers for far frost mountains, snowy pines and stage-2 avalanche debris. The core World 2 sky remains visible so score-15 and boss palette transitions are preserved.
- Ground uses a seamless generated frozen-ground image tile driven by the same continuous World 2 visual travel; `GROUND_HEIGHT` and collision are unchanged.
- Obstacles use generated top/bottom ice-cliff images while preserving the existing pillar positions, passage gap and collision widths.
- Status is **AWAITING VISUAL APPROVAL**. Do not lock these World 2 environment assets until the project owner tests them in-game.

## Future systems roadmap — APPROVED PLANNING DIRECTION

Long-term retention/economy/mode planning is maintained in `FEATHER_FURY_FUTURE_ROADMAP.md`.

Key lock: the current working Adventure/Campaign runtime is the release baseline. New systems (extended special-mode carousel cards, Fury Run, Boss Rush, Daily Flight, Hero Mastery, Consumables, Rewarded Revive, cosmetics) must be added as isolated layers and must not replace or destabilize approved worlds, bosses, physics, navigation, save contracts, HUD or Store behavior.

Approved navigation direction for future modes: keep **one existing carousel and one card size**. `World 1` is the boundary: numbered worlds continue to its right (`World 2 → World 3 → ...`), while same-size special-mode cards live to its left outside the numbered-world order. `World 1` remains the default selected card for new players. Major special modes may remain visibly locked until the player completes the final available campaign world; once legitimately unlocked, a later world update must not re-lock them.

Implementation proceeds one phase at a time; an old green release baseline plus the new feature must pass before the feature becomes active.

## Next-work rule

At the start of every future task, check this file first for design locks and `FEATHER_FURY_GAME_SPEC.md` for executable ownership. If the target system is marked APPROVED / LOCKED, refine its current implementation instead of testing a new technique.