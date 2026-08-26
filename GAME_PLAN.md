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

- Do not alter bird physics, hitboxes, obstacle gaps, scoring, boss logic, HUD, revive, audio or story while finishing the background.
- Existing World 1 fixes and wrappers must continue to operate around the background renderer.

### Final remaining task

**Cursed Woods background — FINAL POLISH ONLY**

Approved implementation path:

- Canvas 2D only.
- Existing `game.drawRuinsBackground` patch chain.
- Main file: `cursed-woods-v1.js`.
- Deterministic seeded scenery for stable tree identities.
- Layered parallax inside the existing renderer.
- No DOM/CSS background, WebGL, external runtime, new game engine or parallel rendering system.
- The supplied forest reference is a visual-design reference only; build the FeatherFury version inside the existing renderer.
- Background scope covers **all playable World 1 forest sections from score 0 onward**; the outer forest starts lighter/readable and progressively becomes denser and more cursed toward the deep forest.

Target visual result:

- A dense cursed forest rather than sparse Y-shaped silhouettes.
- Organic crooked trunks with varied branch structures and rooted bases.
- Multiple depth layers with a distant canopy wall, far/mid/near trees and controlled parallax.
- Dark violet night palette matching the approved purple-cracked obstacle art.
- Moon/cloud depth, layered fog, ground haze, hanging vines and restrained cursed particles.
- Keep the gameplay corridor readable and keep atmospheric effects behind gameplay objects/HUD.
- Mobile performance remains a priority: fixed small scene counts, Canvas primitives, no heavy filters or new dependencies.

### World 1 completion gate

World 1 is **COMPLETE** when all of the following are true:

1. The final Cursed Woods background is visually approved.
2. Approved obstacles still look grounded and move correctly.
3. Collision behavior is unchanged.
4. Start Mission and World 1 play without runtime errors.
5. The background patch loads from the repository without a stale-cache mismatch.
6. No unrelated World 1 system changed during background polish.

After this gate is passed, World 1 is frozen for feature work. Only reported bugs should reopen it.

## Next-work rule

At the start of every future task, check this file first. If the target system is marked APPROVED / LOCKED, refine its current implementation instead of testing a new technique.
