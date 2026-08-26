# FeatherFury — Game Development Plan

This file is the development source of truth for approved systems and the next allowed task. The goal is to keep successful implementation methods stable instead of repeatedly testing new techniques.

## Development principle

Once a system works correctly and its visual/gameplay direction is approved, it becomes **APPROVED / LOCKED**.

- Future work improves that same system; it does not replace the technique.
- New libraries/renderers/physics approaches are not introduced for an approved system unless explicitly requested.
- Reference files and artwork are used for visual direction and ideas. Their design language is rebuilt inside FeatherFury's approved runtime rather than copy-pasted as a second system.
- Solved systems remain untouched while another system is being completed.

## World 1 — status

### Approved / locked

**Cursed Woods obstacles — APPROVED / LOCKED**

- Runtime: `world1-cursed-obstacles-v5.js`.
- Approved method: image-based trimmed obstacle assets with stable synchronized movement and a fair collision core.
- The previous floating / malformed obstacle problem is considered solved.
- Do not return to procedural obstacle experiments, alternate obstacle shapes, or a replacement collision model unless a specific regression is reported.

**World 1 gameplay systems — PRESERVE**

- Do not alter bird physics, hitboxes, scoring, boss logic, HUD, revive, audio or story while finishing the World 1 visual polish.
- Existing World 1 fixes and wrappers must continue to operate around the background renderer.

### Final remaining task

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

### World 1 completion gate

World 1 is **COMPLETE** when all of the following are true:

1. The final Cursed Woods background and ground are visually approved.
2. Approved obstacles still look grounded and move correctly.
3. Collision behavior remains aligned with the visible obstacles.
4. Start Mission and World 1 play without runtime errors.
5. The final patches load from the repository without a stale-cache mismatch.
6. No unrelated World 1 system changed during visual polish.

After this gate is passed, World 1 is frozen for feature work. Only reported bugs should reopen it.

## Next-work rule

At the start of every future task, check this file first. If the target system is marked APPROVED / LOCKED, refine its current implementation instead of testing a new technique.
