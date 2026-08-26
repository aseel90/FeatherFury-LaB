# FeatherFury — Game Development Plan

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

- Authoritative background: `world1-classic-enhanced-background-v1.js`.
- Authoritative ground + obstacle layout polish: `world1-ground-obstacle-polish-v2.js`.
- Authoritative obstacle renderer/art: `world1-cursed-obstacles-v5.js` + the approved top/bottom assets.
- Authoritative small-crow art: `crow-minions-ingame-v3.js` followed by `world1-crow-contrast-v1.js`.
- `cursed-woods-v1.js`, `world1-background-scope-v1.js`, `cursed-crows-v1.js`, `world1-final-art-lock-v1.js`, and `world1-ground-gap-polish-v1.js` are **RETIRED from runtime loading**. They may remain in Git history/repository for rollback only.
- Final World 1 visual patches belong in `patch-manifest.js`; do not load a second World 1 visual stack after the patch runner releases its boot gate.
- Both normal boot and legacy fallback must keep input blocked until the authoritative stack is fully loaded. No visible old-background → new-background swap is acceptable.

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

## World 2 — AUDIT / OPEN

World 2 is now the active development target. No World 2 visual system is locked yet; first changes should follow an audit-and-approve cycle similar to World 1.

Current runtime stack observed during the initial audit:

- Core World 2 boss module: `js/world2.js`.
- Environment visuals: `w2-visuals-v1.js`.
- World 2 gameplay/story flow: `w2-gameplay-v1.js`.
- Frost audio identity: `w2-audio-v1.js`.
- Emperor Penguin boss is currently layered through `w2-boss-polish-v2.js`, `w2-boss-orb-v7.js`, `w2-v7-compat-v1.js`, `w2-boss-combat-v6.js`, `w2-boss-tuning-v8.js`, and `w2-boss-phase2-relief-v9.js`.
- Until the World 2 direction is approved, prefer targeted refinement over introducing additional parallel boss/background systems.

## Next-work rule

At the start of every future task, check this file first. If the target system is marked APPROVED / LOCKED, refine its current implementation instead of testing a new technique.
