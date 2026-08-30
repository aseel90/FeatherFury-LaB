# Feather Fury — Canonical Game & Runtime Specification

> **Status:** canonical reference for the current LAB runtime.  
> **Repository:** `aseel90/FeatherFury-LaB`  
> **Rule:** when documentation disagrees with executable runtime, update this document in the same change after verifying the runtime.

---

## 1. Source-of-truth hierarchy

Use this order when deciding what is actually live:

1. `index.html` — direct CSS/script entrypoints and DOM compatibility contract.
2. `game.js` — approved gameplay patch loader and active/retired patch map.
3. `ui-runtime-boot-v1.js` — post-runtime UI load order.
4. `RUNTIME_ACTIVE.md` — quick runtime snapshot.
5. `DEVELOPMENT_RULES.md`.
6. `GAME_PLAN.md` for design intent only.
7. `README.md` for overview only.

A file merely existing in the repository does **not** make it active. Runtime ownership is determined by the current loader chain.

---

## 2. Product and world IDs

Feather Fury is a portrait-first mobile arcade flying game. The player flies a bird through obstacles, collects coins, fills Fever, fights bosses, completes story beats, and unlocks later worlds/characters.

| Technical ID | Legacy index | Current identity | Boss | Story/reward |
|---|---:|---|---|---|
| `W1` | `0` | Cursed Woods / الغابة الملعونة | Crow King | Owl guardian/outro |
| `W2` | `1` | Frozen Peaks / Ice world | Ice Emperor | Eagle outro/reward |
| `W3` | `2` | Storm Ruins | Lord Voltbat | final W3 progression |
| `W4` | `3` | future/locked world | not production-ready | locked |

Use `W1/W2/W3/W4` in technical work. Historical names such as Ruins, Penguin, Thunderbird, etc. are not authoritative by themselves.

---

## 3. Direct boot contract

### CSS order in `index.html`

Order matters because older and newer UI generations overlap:

1. `style.css?v=2.3.6`
2. `lab-ui.css?v=1`
3. `ui-foundation-v1.css?v=1`
4. `ui-world-select-v1.css?v=7`
5. `ui-main-menu-v2.css?v=1`
6. `ui-main-menu-v3.css?v=4`
7. `ui-store-v1.css?v=2`
8. `ui-hud-v1.css?v=6`
9. `ui-runtime-fixes-v1.css?v=2`
10. `ui-end-screens-v1.css?v=2`
11. `ui-settings-leaderboard-v1.css?v=1`
12. `ui-splash-approved-v3.css?v=1`

### Direct JavaScript order

1. `js/config.js?v=2.3.4`
2. `js/audio.js?v=2.3.2`
3. `js/graphics.js?v=2.3.2`
4. `js/world1.js?v=2.3.2`
5. `js/world2.js?v=2.3.2`
6. `js/world3.js?v=2.3.2`
7. `ui-splash-approved-v3.js?v=12`
8. `game.js?v=2.4.7`
9. `ui-runtime-boot-v1.js?v=7`

Do not reorder these casually. Cache query versions are part of the deployment contract.

---

## 4. Core/runtime boot model

`game.js` is a loader, not the historical gameplay core itself.

Current flow:

`index.html`
→ direct core dependencies
→ loading splash
→ `game.js`
→ `stable-runtime-w3-clean-v1.js`
→ approved historical core extraction/launch
→ `ACTIVE_PATCHES` in exact order
→ `window.__FF_RUNTIME_APPROVED_STACK__ = true`
→ `ui-runtime-boot-v1.js`
→ modern post-runtime UI

### Important architectural debt

`stable-runtime-w3-clean-v1.js` currently restores the gameplay core from a pinned historical repository artifact. This works for LAB recovery but is **not** the desired final architecture for offline Android/Capacitor or a future private production repository.

Do not remove or replace this mechanism casually while gameplay behavior is still patch-dependent. The safe migration is:

1. freeze current behavior with broader automated coverage;
2. materialize the complete core locally;
3. prove parity;
4. then remove historical remote-core dependency.

---

## 5. Runtime patch rules

### `ACTIVE_PATCHES`

The following list is generated from the executable `ACTIVE_PATCHES` map in the current `game.js`. The order is behavior because many files wrap the same lifecycle methods.

1. `runtime-config-bridge-v1.js?v=1`
2. `boss-fight-core-v1.js?v=2`
3. `w1-fixes-batch-v1.js?v=2`
4. `boss-audio-fix-v2.js?v=3`
5. `w1-final-audio-v1.js?v=2`
6. `w1-final-gameplay-v1.js?v=2`
7. `w1-final-story-v1.js?v=2`
8. `core-gameplay-ux-v1.js?v=5`
9. `pause-hud-polish-v2.js?v=3`
10. `world1-final-polish-v1.js?v=2`
11. `w2-audio-v1.js?v=2`
12. `w2-environment-assets-v1.js?v=4`
13. `w2-visuals-v1.js?v=6`
14. `w2-ice-ground-skeletons-v1.js?v=4`
15. `w2-gameplay-v1.js?v=2`
16. `revive-core-fix-v1.js?v=3`
17. `w2-emperor-art-v1.js?v=4`
18. `w2-boss-polish-v2.js?v=2`
19. `w2-boss-orb-v7.js?v=2`
20. `w2-boss-runtime-v10.js?v=2`
21. `victory-screen-fix-v1.js?v=2`
22. `w3-foundation-v1.js?v=2`
23. `w3-world-polish-v1.js?v=7`
24. `w3-boss-v1.js?v=3`
25. `w3-final-polish-v1.js?v=2`
26. `w3-balance-visual-v2.js?v=2`
27. `w3-challenge-audio-v3.js?v=3`
28. `w3-final-balance-v4.js?v=3`
29. `w3-critical-fix-v6.js?v=3`
30. `w3-world-fix-v5.js?v=4`
31. `w3-runtime-cleanup-v1.js?v=4`
32. `w3-environment-png-v1.js?v=1`
33. `w3-enemy-png-v1.js?v=1`
34. `w3-voltbat-png-v1.js?v=1`
35. `character-roster-v1.js?v=3`
36. `skin-routing-hardfix-v2.js?v=3`
37. `hero-static-smooth-v2.js?v=4`
38. `hero-blue-effects-v1.js?v=2`
39. `character-abilities-v2.js?v=2`
40. `character-ability-fx-v1.js?v=1`
41. `character-ability-ui-v1.js?v=2`
42. `fierce-falcon-v1.js?v=2`
43. `mountain-eagle-stability-v3.js?v=1`
44. `world1-background-scope-v1.js?v=2`
45. `world1-cursed-woods-background-v3.js?v=3`
46. `world1-final-art-lock-v1.js?v=3`
47. `world1-cursed-obstacles-v5.js?v=5`
48. `world1-ground-obstacle-polish-v2.js?v=2`
49. `world1-crow-contrast-v1.js?v=2`
50. `world1-phase2-owl-dialogue-v3.js?v=2`
51. `world1-owl-dialogue-layer-fix-v3.js?v=3`
52. `w2-emperor-png-v5.js?v=2`
53. `w2-outro-eagle-skin-v3.js?v=2`

### `RETIRED_PATCHES`

The retired map is authoritative. A retired file may remain in the repository for history/comparison but must not return to the active loader unless the runtime map, tests, and this spec are deliberately updated together.

Important retired examples include legacy Crow King, old W1 classic background, old ground-gap renderer, W2 V2–V9 world stacks, and older W3 critical fixes.

---

## 6. Why regression risk is high

The current project is behaviorally stable but historically patch-heavy. Many active files wrap the same methods such as:

- `update()`
- `draw()`
- `gameOver()`
- `reset()`
- `activateBoss()`

Therefore:

- load order is behavior;
- a “small” wrapper appended late can override earlier fixes;
- replacing a function instead of chaining it can silently remove another feature;
- adding one more patch is not automatically safer than modifying the current owner.

### Development rule

Before changing a lifecycle method, search every active wrapper of that method and identify the **final owner** after loader order. Prefer editing/consolidating the current owner instead of adding another wrapper.

---

## 7. Post-runtime UI boot

`ui-runtime-boot-v1.js` waits for the approved gameplay runtime, then loads:

1. `lab-ui.js?v=6`
2. `ui-foundation-v1.js?v=1`
3. `ui-settings-leaderboard-v1.js?v=2`
4. `ui-store-v1.js?v=1`
5. `ui-world-select-v1.js?v=8`
6. `ui-main-menu-v3.js?v=5`
7. `ui-end-screens-v1.js?v=1`
8. `ui-hud-v1.js?v=5`
9. `ui-runtime-fixes-v1.js?v=1`

### `ui-runtime-fixes-v1` ownership

This is a deliberately late compatibility/repair owner. It exists because the historical core still writes to compatibility DOM while the modern visible HUD uses different elements.

It currently owns only these contracts:

- final Pause simulation freeze by guarding the **final** `game.update()` chain after all gameplay/world wrappers have loaded;
- visible HUD data bridge: `game.sessionCoins → #runCoins`, `game.score → #scoreValue`, stage compatibility text → `#stageName`;
- visible Fever presentation and percentage bridge;
- physical HUD direction so Arabic RTL does not move Pause to the left;
- current World-card/PLAY vertical spacing override;
- current store coin-balance visual identity.

It must not become a general dumping ground. When the core/HUD are consolidated later, these responsibilities should move into their final explicit owners and this repair layer should shrink or disappear.

### Main menu ready contract

At minimum the ready menu requires:

- `#startScreen` active;
- logo, world card and PLAY laid out inside the mobile visual viewport;
- PLAY enabled;
- W1 thumbnail applied;
- world kicker present;
- coin icon and bird/avatar button present;
- preview canvas contains rendered pixels;
- foundation/world-select/main-menu flags ready.

---

## 8. Gameplay state and flow

Canonical high-level flow:

`Loading`
→ `MENU`
→ optional world/skin/shop/settings selection
→ `STORY` / world intro where applicable
→ `LAUNCH`
→ `PLAYING`
→ boss flow when threshold reached
→ victory/story outro or `GAME_OVER`
→ next world / restart / menu / revive according to state.

### Pause contract

Pause must be a real simulation pause, not merely a visual overlay:

- `game.__ffPaused === true` while Pause overlay is open;
- the final `game.update()` chain must not execute;
- simulation physics must stop;
- bird Y/velocity must remain unchanged;
- obstacle/boss progression and score must not advance;
- UI may continue lightweight rendering/synchronization;
- resume returns to the same simulation state.

Do not introduce a parallel state machine in a UI patch.

---

## 9. Visible HUD contract

The modern visible HUD uses:

- `#runCoins` — run/session coins;
- `#scoreValue` — current run score (not a separate true-distance metric yet);
- `#stageName` — current stage label;
- `#ffPauseBtn` — Pause;
- `.fever-bar-container` / `#feverFill` — Fever.

The historical core still updates hidden compatibility hooks:

- `#sessionCoinDisplay`
- `#currentScoreDisplay`
- `#stageDisplay`
- `#feverBarFill`

Do not delete those compatibility hooks until the local core is fully migrated.

### Physical HUD layout

Regardless of document language direction, the approved compact HUD is:

`coins on left | score/stage centered | Pause on right`

Then the centered vertical stack is:

`Fever bar | character ability / Royal Fortune`

The approved visual identity is restrained royal violet/navy with thin antique-gold edging, light-blue stage text, a gold coin accent, and compact rounded forms. It must remain translucent/compact enough that gameplay stays dominant. Fever is wider than the ability chip; the ability chip must never sit above Fever or overlap the top row.

Arabic affects text direction, not the physical control placement.

### Fever

Fever remains a production gameplay mechanic and must be visible during normal gameplay. It must not be treated as retired merely because an older HUD bar was previously hidden. Duplicate boss HUD remains hidden; boss HP is owned by the world/boss renderer where currently designed.

---

## 10. Save/progression compatibility

Existing local-storage keys are part of player compatibility. Do not rename/reset them casually.

Known important keys include:

- `fh_active_skin`
- `fh_total_coins`
- `fh_w1_completed`
- `fh_w2_completed`
- `fh_w3_completed`
- world high-score/progression keys used by the current core
- purchased/unlocked skin state used by current roster/store patches.

Any save schema migration must preserve existing players or include an explicit migration path.

---

## 11. World ownership map

### W1 — Cursed Woods

Current final ownership is distributed, but the approved current visual/gameplay stack includes:

- environment scope/background: `world1-background-scope-v1.js`, `world1-cursed-woods-background-v3.js`;
- final W1 art lock: `world1-final-art-lock-v1.js`;
- obstacle owner: `world1-cursed-obstacles-v5.js` plus current ground/contrast polish;
- boss core: shared boss system + Crow King in-game owner;
- story/dialogue: W1 final story + phase 2 owl/outro layers.

Do not reactivate `world1-classic-enhanced-background-v1.js` or `world1-ground-gap-polish-v1.js` to solve a visual problem; both belong to superseded approaches.

### W2 — Frozen Peaks

Current final ownership includes:

- W2 audio/environment/visual/gameplay layers;
- Ice Emperor PNG final art: `w2-emperor-png-v5.js`;
- boss behavior/runtime: `w2-boss-runtime-v10.js`;
- current eagle reward/outro owner.

Do not restore old V2–V9 W2 world/runtime layers as shortcuts.

### W3 — Storm Ruins

Current final ownership includes:

- W3 foundation/world/boss/final-polish/balance chain;
- `w3-runtime-cleanup-v1.js` as late cleanup owner;
- final PNG environment/enemy/Voltbat layers.

Historical W3 critical/world fix files may still exist but active status comes only from `game.js`.

---

## 12. Character/ability ownership

Current roster/skin pipeline is controlled by the active character files in `game.js`, including:

- `character-roster-v1.js`
- `skin-routing-hardfix-v2.js`
- hero motion/effects files
- `character-abilities-v2.js`
- `character-ability-fx-v1.js`
- `character-ability-ui-v1.js`
- Falcon/Eagle specialization files.

When changing a skin, inspect both rendering and ability behavior. A skin is not only a sprite choice.

---

## 13. UI ownership

### Loading

Approved loading owner:

- `ui-splash-approved-v3.css`
- `ui-splash-approved-v3.js`

Loading readiness must not depend on menu **painted visibility** while the splash intentionally hides the menu. Geometry/readiness and visual reveal are separate contracts.

### Main menu/world select

Final visual behavior comes from the combination of:

- base DOM in `index.html`;
- `ui-world-select-v1.css/js`;
- `ui-main-menu-v3.css/js`;
- foundation styles;
- late runtime UI fixes for proven compatibility issues.

There is still CSS generation overlap; future cleanup should consolidate ownership only after visual regression coverage exists.

### Store

The modern visible store is owned by `ui-store-v1.css/js` plus late compatibility styling. Purchase/save logic still depends on the gameplay/roster runtime.

### Pause/end screens

Overlay presentation belongs to current end-screen/Pause UI layers; simulation freeze belongs to the final runtime pause guard. Do not merge visual visibility state with gameplay simulation state accidentally.

---

## 14. Testing and deployment gates

### Repository safety gate

`.github/workflows/repo-safety.yml` runs syntax/integrity checks.

`scripts/runtime-integrity-check.js` protects critical contracts including:

- direct boot versions/order;
- active/retired patch map sanity;
- required DOM hooks;
- post-runtime UI ownership;
- Pause visibility rules;
- HUD/Fever/RTL repair layer;
- documentation/source-of-truth references.

The integrity gate must be updated when a deliberately approved runtime contract changes.

### Live browser verification

`.github/workflows/live-runtime-verify.yml` deploys/checks GitHub Pages and runs `scripts/live-smoke.mjs` on:

- Chromium mobile;
- WebKit/iPhone emulation.

Current live regression coverage includes:

- loading completes;
- main menu/world card/PLAY visible and inside viewport;
- PLAY reaches gameplay;
- Pause button visible;
- top HUD physical order survives RTL;
- Fever is visible;
- Pause freezes bird position and velocity;
- visible coin/score/Fever data bridge is functional;
- menu World/PLAY spacing remains open;
- store balance keeps its intended identity;
- critical browser/runtime errors fail the check.

Still missing from automated end-to-end coverage:

- full W1 run to boss/victory;
- W2 boss and outro;
- W3 boss/outro;
- revive end-to-end;
- real coin purchase persistence;
- language switching through UI;
- Endless mode;
- next-world progression and save restore.

These are the next major regression gates to add before architectural consolidation.

---

## 15. Version vocabulary

Do not treat all visible version numbers as the same thing. Current repository contains several different version concepts:

- package/app metadata version;
- UI/cache query versions;
- runtime map version;
- individual patch versions;
- historical core artifact version.

When reporting a regression, always name the **commit SHA** first. Cache versions are secondary identifiers.

---

## 16. Safe change procedure

For every non-trivial gameplay/UI change:

1. identify the current owner from `game.js`, `ui-runtime-boot-v1.js`, and this spec;
2. inspect wrappers of any lifecycle method being changed;
3. change the smallest final owner possible;
4. do not reactivate a retired file as a shortcut;
5. preserve required DOM/local-storage contracts;
6. update tests for the regression being fixed;
7. update this spec if ownership/runtime contract changed;
8. let repo safety and live Chromium/WebKit checks pass;
9. verify LAB preview manually for visual quality;
10. only promote to production when explicitly approved.

---

## 17. Architectural roadmap

Do **not** perform this as a single rewrite. Recommended sequence:

### Phase A — regression coverage

Expand Playwright coverage through W1/W2/W3, bosses, victory, revive, purchase/save, languages, and Endless.

### Phase B — localize the core

Replace historical remote core restoration with a complete local core while preserving exact observed behavior.

### Phase C — consolidate method ownership

Use active wrapper maps to merge repeated `update/draw/reset/gameOver/activateBoss` responsibilities into clear modules one subsystem at a time.

### Phase D — CSS/UI consolidation

After screenshot/geometry coverage exists, retire overlapping UI generations and establish one stylesheet owner per screen/component.

### Phase E — production/mobile hardening

Validate Capacitor/offline asset loading, safe areas, performance, resume/background behavior, and private-repository deployment.

---

## 18. Definition of “do not regress”

A future change is not accepted merely because the game opens. It must preserve, unless explicitly redesigned:

- Loading → menu boot;
- all visible menu controls;
- W1/W2/W3 progression contracts;
- active character rendering/abilities;
- visible HUD data;
- Fever;
- real Pause simulation freeze;
- boss behavior/art ownership;
- save/purchase compatibility;
- RTL and iPhone/WebKit geometry;
- no return of retired patches.

When a behavior is intentionally changed, update its automated contract and this specification in the **same development step**.
