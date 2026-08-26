# FeatherFury LAB — Mandatory Development Rules

This file is the first reference for any future change in `FeatherFury-LaB`.

## 1. Repository roles

- `FeatherFury` = stable/production source. Do not modify unless explicitly approved.
- `FeatherFury-LaB` = all experiments, UI work, testing and risky changes.
- Never copy experimental LAB changes back to production without user approval.

## 2. Protected core files

Treat these as protected files:

- `game.js`
- `index.html`
- `style.css`
- `js/config.js`
- `js/world1.js`
- `js/world2.js`
- `js/world3.js`
- `js/graphics.js`
- `js/audio.js`

Rules:

1. Never replace a protected file from a stale local copy.
2. Always read the latest GitHub version immediately before editing.
3. Prefer isolated LAB files (`lab-ui.css`, `lab-ui.js`) for UI-only changes.
4. If a protected file must change, make the smallest possible edit.
5. Do not minify, reformat, or rewrite the whole protected file unless explicitly required.
6. After editing a protected file, verify its size and diff before considering the change complete.
7. If file size unexpectedly drops substantially, stop and restore before doing anything else.

## 3. Branch / rollback policy

For changes that touch gameplay, core files, Android build files, or multiple major systems:

1. Create a dedicated branch from the current stable LAB `main`.
2. Make changes there.
3. Review changed-file list and diff.
4. Run syntax checks where applicable.
5. Merge only after verification.

Small isolated CSS/UI changes may go directly to LAB `main` only when they do not modify protected core files.

## 4. Pre-change checklist

Before every change:

- Confirm repository is `FeatherFury-LaB`.
- Read this file.
- Read the latest versions of every target file from GitHub.
- Identify whether the task is UI-only or changes gameplay logic.
- Preserve the current working state and commit SHA.

## 5. Post-change verification

After every change:

- Confirm `index.html` still has the expected full size/content.
- Confirm `game.js` is not truncated.
- Run JavaScript syntax checks for changed JS.
- Verify only intended files changed.
- Confirm no screen is accidentally active/visible on top of the start screen.
- Verify mobile responsiveness.
- Verify keyboard/remote focus behavior when UI controls are changed.
- Do not claim visual browser testing succeeded if it was not actually performed.

## 6. UI rules

- Mobile-first responsive design.
- Must scale to phones, tablets and Smart TV / Android TV.
- Use `clamp()`, relative units and max-width constraints where useful.
- Avoid fixed layouts that only fit one phone size.
- No emoji icons in production UI. Use clean SVG/vector artwork or text instead.
- World-specific backgrounds must not cover or overlay UI controls.
- Avoid negative z-index / pseudo-element background tricks that can expose gameplay canvas or other screens.
- Keep primary and secondary actions visually distinct.

## 7. Android / Google Play direction

The final product is intended for Android / Google Play.

- Web preview is only a development/testing method.
- Do not make architectural decisions solely to suit GitHub Pages.
- Preserve compatibility with a future Android packaging approach chosen after performance testing.
- Final Android build should consider AAB, signing, target SDK, fullscreen, safe areas, back button, lifecycle/audio behavior and Android TV where appropriate.

## 8. Source/privacy rules

- Production and LAB should normally remain private.
- LAB may be made public temporarily only for web preview/testing when necessary.
- Do not rely on public GitHub-hosted source files as a permanent runtime dependency.
- Before returning LAB to private, all runtime code/assets must exist inside the repository/build itself.

## 9. Current recovery note

A previous accidental overwrite truncated `game.js`. The LAB runtime was temporarily changed to load a pinned stable build from an earlier commit. This is a temporary recovery mechanism, not the desired final architecture.

Before declaring the LAB ready for private/offline/Android use:

- restore the complete stable `game.js` into the repository itself;
- remove any temporary external/pinned runtime loader;
- verify the game works with no dependency on a public historical GitHub raw file.

## 10. Golden rule

If a requested change is only visual, do not touch gameplay/core files.
If a core-file edit is required, protect the working version first and verify the diff before merging.

## 11. Regression-prevention workflow (mandatory from 2026-08-24)

1. **No direct UI changes on `main`.** Every UI or behavior fix must start on a dedicated branch created from the latest `main`.
2. **One problem per branch.** Do not combine unrelated fixes (for example Shop + Leaderboard + world navigation) in the same change set.
3. **Protected surfaces:** `index.html`, `game.js`, `lab-ui.js`, and `lab-ui.css` must be fetched fresh from GitHub before modification.
4. **Never upload a partial local copy.** If a modified file is unexpectedly smaller than the fetched source, stop immediately and restore before any further work.
5. **Pre-merge verification checklist:** compare file sizes before/after; inspect the diff for only intended selectors/functions; verify Main, Settings, Leaderboard, Shop, and world navigation still render/function; preserve existing approved fixes unless the branch explicitly targets them.
6. **No merge until validation.** Keep the change isolated until the target behavior is verified; if browser preview limitations require merge for testing, the branch must contain only one isolated change and the pre-change commit SHA must be retained as the immediate rollback point.
7. **Rollback point first.** Record the source commit SHA used to create the branch so the exact previous state can be restored.
8. **Do not fix forward across multiple screens.** If a new regression appears, stop the current change, restore the last good state for the affected file/screen, then address the regression in its own branch.

## 12. Approved-system lock / no re-experimenting

`GAME_PLAN.md` is the product-development source of truth for systems that have already been approved.

When a visual/gameplay system is marked **APPROVED / LOCKED**:

1. Keep the same implementation approach for future refinement of that system.
2. Do not replace it with a new rendering technique, library, asset pipeline, physics model, or experimental architecture merely to try another approach.
3. Improve the approved system incrementally: proportions, art quality, tuning, layering, animation polish, performance and bug fixes are allowed inside the same approach.
4. A technique change requires explicit user approval before implementation.
5. Never reopen a solved system while completing an unrelated item. Preserve approved obstacles, collisions, character behavior and UI unless the task explicitly targets them.
6. Reference artwork/code supplied for visual direction is a design reference: adapt its visual language into the approved FeatherFury system rather than copy-pasting it as a parallel runtime.

### World 1 current lock

- **Cursed Woods obstacles: APPROVED / LOCKED.** Keep `world1-cursed-obstacles-v5.js` and its image-based trimmed-asset + stable collision/movement approach. Do not redesign or replace it while polishing the background.
- **Cursed Woods background renderer: APPROVED TECHNIQUE.** Continue using the existing Canvas 2D `drawRuinsBackground` patch path in `cursed-woods-v1.js`; no WebGL, DOM/CSS background layer, new engine, or parallel renderer for this task.
- **Current final task for World 1:** background visual polish only. Gameplay geometry, obstacles, collisions, bird behavior, HUD and boss systems are out of scope.
- After the background is visually approved and regression-checked, mark **World 1 complete** and stop feature experimentation on it unless a specific bug is reported.
