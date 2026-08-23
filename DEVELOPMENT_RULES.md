# FeatherFury LAB Development Rules

This file is the mandatory safety checklist for all future work in `FeatherFury-LaB`.

## 1. Purpose of LAB

- `FeatherFury-LaB` is the experimental repository.
- Do not modify the production repository `FeatherFury` unless the user explicitly approves promotion of tested changes.
- Browser testing may temporarily require the LAB repository to be public because GitHub Pages is not available for a private repository on the current plan.
- Final target is an Android game for Google Play. Browser deployment is only a temporary test environment.

## 2. Protected files

The following files are high-risk and must never be replaced from an incomplete or stale local copy:

- `index.html`
- `game.js`
- `style.css`
- `.github/workflows/*`

Before changing an existing protected file:

1. Fetch the latest version directly from GitHub.
2. Record its current SHA and file size.
3. Make the smallest possible edit.
4. Upload using the current blob SHA whenever the tool supports it.
5. Fetch the file again after the commit and verify its size/content.

If a protected file suddenly becomes dramatically smaller, STOP. Do not continue other edits. Restore it first.

## 3. UI isolation

For visual experiments, prefer LAB-only files:

- `lab-ui.css`
- `lab-ui.js`
- new LAB-specific assets

Do not edit gameplay physics or core world logic for a visual request.

If UI can be achieved with CSS or LAB JS hooks, do not edit `game.js`.

## 4. Never repeat these incidents

### Incident A — truncated `index.html`

An incomplete local copy was uploaded and replaced the full file.

Prevention:
- Always fetch current GitHub `index.html` first.
- Never use an old `/mnt/data/index.html` as the source of truth.
- If only CSS changes are required, do not touch `index.html` at all.

### Incident B — truncated `game.js`

A tool/local-file mismatch caused `game.js` to be overwritten with a tiny file.

Prevention:
- Treat `game.js` as protected.
- For UI work, do not edit it.
- If a gameplay edit is needed, fetch current GitHub content first and verify syntax + size before committing.
- Keep a known-good commit SHA before any risky edit.

### Incident C — global UI layers covering the menu

A global background/pseudo-element caused gameplay/map visuals to appear over or behind the menu.

Prevention:
- No global pseudo-element overlays without visual testing.
- World/menu backgrounds must be scoped to `#startScreen` or an equivalent screen container.
- Always check stacking context (`z-index`, `position`, pseudo-elements) before merge.

## 5. Required checks after every UI change

At minimum verify:

- main menu still opens;
- world carousel still changes worlds;
- stars, bird preview, skin badge and world status stay centered;
- Start Mission works;
- Endless Mode works;
- Shop opens/closes;
- Settings opens/closes;
- Leaderboard opens/closes;
- no unexpected page scroll;
- no double-tap zoom regression;
- mobile layout works at narrow width;
- short-height screens do not overlap;
- Smart TV keyboard focus still works;
- no old `world1_ruins.jpg` reference is reintroduced.

## 6. Responsive design rules

The UI is Android-first and must transfer naturally to Capacitor/WebView or another Android wrapper chosen later.

Use:

- responsive widths (`min()`, `max()`, `clamp()`);
- max widths to prevent tablet/TV overexpansion;
- height-aware media queries for short phones;
- `env(safe-area-inset-*)` where needed;
- touch targets large enough for phones;
- clear `:focus-visible` styles for Smart TV/keyboard navigation.

Avoid:

- hard-coded layouts that only fit one iPhone screenshot;
- fixed widths that overflow small Android devices;
- unnecessary vertical empty space;
- equal visual weight for primary and secondary actions.

## 7. Visual identity rules

- This is a mobile arcade game, not a generic app dashboard.
- Avoid emoji icons in the UI.
- Prefer custom SVG/vector icons or no icon.
- Keep Start Mission visually primary.
- Endless Mode should be visually secondary.
- Settings, Leaderboard and Shop should share the same design system as the main menu.
- Do not re-add the deleted old Ruins JPG asset. Ruins currently uses `menu-bg-ruins.svg` unless a brand-new approved asset replaces it.

## 8. Android / Google Play direction

Do not assume Capacitor is permanently the final packaging technology.

When Android packaging begins:

- benchmark the current HTML5/Canvas build on Android;
- compare the practical wrappers/runtime options;
- choose based on FPS, input latency, audio behavior, memory, fullscreen/safe areas, Android back handling and Google Play compatibility;
- produce AAB for Play Store release;
- keep permissions minimal;
- protect signing keystore and secrets; never commit them to GitHub.

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
