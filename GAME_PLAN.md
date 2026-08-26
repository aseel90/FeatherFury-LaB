# Feather Fury — Game Plan / Approved Systems

This file is the source of truth for what is approved, what is still experimental, and what should not be re-invented.

## Core rule

Once a gameplay, visual, asset, collision, or runtime technique is approved, future work should **improve that approved implementation instead of replacing it with a new technique**.

A different technique is allowed only when the project owner explicitly asks to change the technique or the approved implementation is proven unable to meet the requirement.

## Repository roles

- `aseel90/FeatherFury-LaB` — public experimental lab and GitHub Pages preview.
- `aseel90/FeatherFury` — private production repository.

## World 1 — Cursed Woods

### Status: COMPLETE / FROZEN

World 1 passed the visual acceptance gate after the final dialogue-layer correction (`world1-ground-obstacle-polish-v2.js?v=3`, merged via PR #71). World 1 is now closed for feature experimentation.

Frozen rule:
- Do not redesign, replace, or re-open World 1 background, ground, obstacles, crows, boss, story, HUD, dialogue layering, physics, or collision systems during World 2+ development.
- Re-open World 1 only for a specific reproducible regression reported after this freeze point.
- Preserve the current runtime ownership and boot ordering that eliminated mixed/late background swaps.

### Cursed Woods obstacles — APPROVED / LOCKED

Use the existing `world1-cursed-obstacles-v5.js` system.

Approved technique:
- Image-based obstacles.
- Trimmed top/bottom obstacle assets.
- Stable collision core aligned with the visible obstacle.
- Minimum obstacle height safety.
- Existing synchronized obstacle movement.

Do not:
- Replace the obstacle system with a new renderer.
- Go back to procedural experimental tree shapes.
- Introduce a second obstacle implementation beside V5.
- Replace the current collision technique unless a specific collision bug is reproduced.

Incremental asset polish inside the same V5 system is allowed when explicitly requested.

### Cursed Woods background technique — APPROVED

Use the existing Canvas 2D background path.

Primary implementation location:
- `cursed-woods-v1.js`
- `game.drawRuinsBackground`

Approved technique:
- Canvas 2D only.
- Deterministic seeded scenery.
- Layered parallax.
- The existing `drawRuinsBackground` patch chain.

Do not introduce for this task:
- WebGL.
- DOM/CSS scenery behind the canvas.
- A second background engine.
- An external scene/runtime library.
- A parallel renderer that competes with `drawRuinsBackground`.

### World 1 final visual direction — APPROVED

Final visual direction is the approved Cursed Woods forest/ground concept selected by the project owner in chat.

#### Background target

- Dense cursed forest rather than sparse `Y`-shaped silhouettes.
- Organic crooked trunks with varied branch shapes.
- Rooted visible tree bases where appropriate.
- Distant canopy wall plus far/mid/near forest depth.
- Dark violet / blue-black night palette matching the purple-cracked obstacle art.
- Moon/cloud depth.
- Layered fog and ground haze.
- Hanging vines.
- Restrained cursed particles/spores and faint eye glows.
- Clear gameplay corridor; the bird and obstacles must remain readable.
- All scenery/effects remain behind gameplay and HUD.

#### Ground target

- Replace the temporary brown/yellow warning-stripe ground visually.
- Dark cursed soil / violet-black earth.
- Irregular stone-and-soil top lip instead of a straight mechanical stripe.
- Twisted roots embedded into the ground.
- Small rocks plus restrained purple mushrooms/crystals.
- Ground art must match the forest and purple-cracked obstacle palette.
- Keep existing `GROUND_HEIGHT`, collision boundary, bird physics, and obstacle geometry unchanged; this is visual art only.

### Background implementation status

Current V4 is a final-background candidate and must be visually reviewed in the actual game before World 1 is marked complete.

The active World 1 background scope now covers the entire Cursed Woods run from score 0 through the boss transition. The enhanced Canvas 2D forest renderer should be visible from the opening of the run, with atmosphere intensity allowed to build toward the later stage.

Visual/background scope must not be tied only to `score >= STAGE1_END`; the early `Cursed Woods Outskirts` section is part of the same world and must use the approved forest visual direction too.

### World 1 final art owner — ACTIVE

- `world1-final-art-lock-v1.js` is the final visual owner for World 1 background + ground and loads after legacy/background patches.
- Earlier `world1-cursed-woods-background-v3.js` is compatibility-only and must not overwrite the final renderer.
- The final art owner follows the approved Canvas 2D runtime technique; it is not a new renderer/engine.
- Ground visual art may change, but `GROUND_HEIGHT`, collision geometry, obstacle movement, and obstacle V5 implementation remain locked.

### World 1 classic forest refinement — ACTIVE / AWAITING FINAL VISUAL APPROVAL

- The project owner requested removal of the dense full-screen violet final-art background and a return to the original stage-responsive sky/background direction.
- Approved active background owner is now `world1-classic-enhanced-background-v1.js`: it preserves the core game's stage/boss sky palette and adds only forest scenery (trees, distant ruins, eyes, fog) over it.
- Do not cover the core sky with a full-screen custom gradient for World 1; score-15 and boss palette transitions must remain visible.
- `world1-final-art-lock-v1.js` and `world1-background-scope-v1.js` are no longer in the active patch chain for this direction.
- `world1-ground-obstacle-polish-v2.js` owns the current smooth-ground pass plus early obstacle pacing. Ground scrolling uses a continuous unwrapped distance, not the modulo-only ground offset.
- Current World 1 passage opening is 144 px; obstacles keep the approved V5 images, hitboxes, collision system, and motion model.
- Early obstacle top heights use a stable varied sequence rather than starting at the same level.
- Normal World 1 obstacle cadence is slightly closer than the prior baseline while preserving the same obstacle system.
- `world1-crow-contrast-v1.js` improves crow readability only (body/rim/eye contrast); crow AI, size, and hitboxes are unchanged.
- Status remains awaiting final visual approval; do not mark World 1 complete until these active visuals are accepted in the game.

### World 1 runtime ownership — CLEAN / LOCKED

- `patch-manifest.js` is now the single boot-time owner for the approved World 1 runtime stack.
- The approved World 1 art/gameplay patches load before Start Mission is unlocked: `world1-cursed-obstacles-v5.js`, `world1-classic-enhanced-background-v1.js`, `world1-ground-obstacle-polish-v2.js`, and `world1-crow-contrast-v1.js` plus their required assets/dependencies.
- Old World 1 visual patches `cursed-woods-v1.js`, `world1-background-scope-v1.js`, `cursed-crows-v1.js`, `world1-cursed-woods-background-v3.js`, and `world1-final-art-lock-v1.js` are retained only as rollback/history and are not part of the active boot chain.
- `game.js` must not load a second duplicate World 1 patch chain after `patch-manifest.js`; duplicate late installation is prohibited.
- Start Mission stays locked until the approved manifest boot completes (or the fallback chain completes), preventing the player from entering while old/new visuals are still swapping.
- Future World 1 bug fixes must refine the active owners above rather than reactivating old background systems.

### World 1 dialogue layer ownership — LOCKED

- The custom World 1 ground must never be drawn over story/boss dialogue panels.
- `world1-ground-obstacle-polish-v2.js` uses a final dialogue pass: modern ground is drawn first, then the active dialogue panel/text is redrawn as the final canvas layer for `STORY`, `BOSS_INTRO`, and `BOSS_OUTRO`.
- Do not reintroduce the prior clipping workaround that exposed the legacy warning-stripe ground beneath the dialogue panel.

### Completion gate

World 1 is complete only after all of these are true:

1. The project owner visually approves the final background in the deployed lab build.
2. Approved V5 obstacles remain grounded and visually correct.
3. Collision behavior is unchanged from the approved obstacle build.
4. `Start Mission` and World 1 run without runtime errors.
5. `patch-manifest.js` loads the current background version without stale-cache mismatch.
6. No unrelated World 1 gameplay system was changed during the final background pass.

After this gate passes, mark World 1 as **COMPLETE** and freeze it except for reported regressions.

## World 2 — Frostbite Peaks

### Status: AUDIT / OPEN FOR DEVELOPMENT

World 2 is the active development target after the World 1 freeze. Nothing in World 2 is considered visually or gameplay-locked yet unless explicitly promoted below after review.

Initial audit scope:
- Background / stage atmosphere and score-15 transition.
- Ground / world-floor visual treatment.
- Obstacles / ice pillars and collision-readability relationship.
- Penguin minions and falling icicle hazards.
- Emperor Penguin boss visuals, combat readability, phase progression, and victory flow.
- World 2 audio / Frost ambience and attack cues.
- Patch/runtime ownership and duplicate-wrapper cleanup before final freeze.

Current runtime stack observed during the initial audit:
- `w2-visuals-v1.js` owns the current World 2 background layers, procedural pillar art, penguin-minion drawing, Emperor Penguin sprite override, falling-icicle warnings, and some boss FX.
- `w2-gameplay-v1.js` owns World 2 story/victory flow, stage-2 announcement/audio switch, icicle warning timing, and several World 2 runtime wrappers.
- `w2-audio-v1.js` owns the Frost ambience/SFX layer.
- Emperor Penguin boss is currently layered through `w2-boss-polish-v2.js`, `w2-boss-orb-v7.js`, `w2-v7-compat-v1.js`, `w2-boss-combat-v6.js`, `w2-boss-tuning-v8.js`, and `w2-boss-phase2-relief-v9.js`.
- Until the World 2 direction is approved, prefer targeted refinement over introducing additional parallel boss/background systems.

### World 2 environment art v1 — IMPLEMENTED / AWAITING VISUAL APPROVAL

Current active scope is background + ground + obstacles only. Boss/gameplay tuning remains out of scope.

- User-approved direction: generated image assets are allowed and should be used for the World 2 environment.
- Asset payload: `w2-environment-assets-v1.js` stores the generated SVG image layers locally in-repository as embedded image data; there are no external runtime asset dependencies.
- Background owner remains `w2-visuals-v1.js`, upgraded in-place rather than adding a parallel environment renderer.
- Background uses transparent generated image layers for far frost mountains, snowy pines and stage-2 avalanche debris. The core World 2 sky remains visible so score-15 and boss palette transitions are preserved.
- Ground uses a seamless generated frozen-ground image tile driven by the same continuous World 2 visual travel; `GROUND_HEIGHT` and collision are unchanged.
- Obstacles use generated top/bottom ice-cliff images while preserving the existing pillar positions, passage gap and collision widths.
- Status is **AWAITING VISUAL APPROVAL**. Do not lock these World 2 environment assets until the project owner tests them in-game.
- Screenshot review refinement v1.1: pine trees must read as planted in the snow, not floating. The pine image now includes a low snow ridge that buries the tree bases, and the layer is positioned slightly lower.
- Screenshot review refinement v1.1: the custom frozen ground visually overhangs the collision line by a small snow-only cap so the legacy striped ground decoration is fully covered. `GROUND_HEIGHT` and collisions remain unchanged.
- Ground tile v1.1 uses a wider, more irregular snow/ice/rock composition plus a 1px draw overlap to reduce obvious repetition or vertical seams.

## Next-work rule

At the start of every future task, check this file first. If the target system is marked APPROVED / LOCKED, refine its current implementation instead of testing a new technique.