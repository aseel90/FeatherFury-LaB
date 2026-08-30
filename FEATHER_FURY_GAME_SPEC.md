# Feather Fury — Canonical Game & Runtime Specification

Status: **authoritative project reference**  
Repository: `aseel90/FeatherFury-LaB`  
Branch: `main`  
Scope: current LAB runtime, UI, worlds, bosses, save contracts, regression rules, and modernization plan.

> This file is the source of truth for the current game. When runtime ownership, active/retired files, screen flow, persistence keys, or world contracts change, update this file in the same pull request/commit.

---

## 1. Purpose

Feather Fury currently works through a historical core restored at runtime plus an ordered stack of active patches and a post-runtime UI layer. That makes the project sensitive to script ordering, duplicate wrappers, stale documentation, and DOM/CSS changes.

The purpose of this specification is to prevent the recurring failure mode where a new visual/gameplay fix silently reactivates an older implementation, overwrites a later patch, breaks boot, or changes the contract expected by another layer.

For a change to be considered safe it must preserve:

1. boot/load contract;
2. active runtime order;
3. final ownership of world/boss/UI behavior;
4. DOM IDs required by the historical core;
5. local-storage compatibility;
6. live mobile smoke-test invariants;
7. retired-file boundaries.

---

## 2. Current boot path

The browser enters through `index.html`.

### Direct document dependencies

Current order:

1. `js/config.js?v=2.3.4`
2. `js/audio.js?v=2.3.2`
3. `js/graphics.js?v=2.3.2`
4. `js/world1.js?v=2.3.2`
5. `js/world2.js?v=2.3.2`
6. `js/world3.js?v=2.3.2`
7. `ui-splash-approved-v3.js?v=12`
8. `game.js?v=2.4.9`
9. `ui-runtime-boot-v1.js?v=8`

Do not reorder these casually.

### Runtime loader

`game.js` is not the historical game engine itself. It is the approved loader/runtime map.

It performs this sequence:

1. loads `game-core-stable-v1.js?v=1` from the local application bundle;
2. waits for the historical game object;
3. applies `ACTIVE_PATCHES` in exact order;
4. records `RETIRED_PATCHES`;
5. sets `window.__FF_RUNTIME_APPROVED_STACK__ = true`;
6. the post-runtime UI boot then loads the UI stack.

### Local materialized core

`game-core-stable-v1.js` is the approved game core. It is generated reproducibly from historical commit:

`5b83840d68ad65939b8efae336afd76c47b7bdc1`

using the transforms preserved in `stable-runtime-w3-clean-v1.js`. The transformer is retained only as build history and is **not loaded by the game**. Runtime startup is therefore self-contained and does not depend on jsDelivr or any remote CDN.

Rules:

- never reintroduce a remote core fetch into startup;
- regenerate the materialized core only through the documented materialization workflow;
- any regenerated core must pass runtime integrity plus Chromium and WebKit live smoke before promotion.

---

## 3. Approved runtime map

Runtime map version: `approved-runtime-v1.3`.

The only canonical source for exact runtime order is the `ACTIVE_PATCHES` array in `game.js`. This section documents its ownership meaning; it must stay synchronized with that loader.

### Active patch order

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
30. `w3-runtime-cleanup-v1.js?v=5`
31. `hero-blue-ninja-v1.js?v=3`
32. `hero-static-smooth-v2.js?v=2`
33. `hero-blue-effects-v1.js?v=4`
34. `fierce-falcon-v1.js?v=4`
35. `skin-routing-hardfix-v2.js?v=3`
36. `character-roster-v1.js?v=3`
37. `character-abilities-v2.js?v=3`
38. `mountain-eagle-stability-v3.js?v=2`
39. `character-ability-ui-v1.js?v=2`
40. `character-ability-fx-v1.js?v=2`
41. `world1-qa-fix-v2.js?v=2`
42. `owl-guardian-v2.js?v=3`
43. `world1-phase2-owl-dialogue-v3.js?v=3`
44. `crow-king-ingame-v4.js?v=2`
45. `crow-minions-ingame-v3.js?v=2`
46. `world1-crow-contrast-v1.js?v=2`
47. `world1-cursed-woods-background-v3.js?v=4`
48. `world1-cursed-obstacle-asset-top-a.js?v=2`
49. `world1-cursed-obstacle-asset-bottom-a.js?v=3`
50. `world1-cursed-obstacles-v5.js?v=2`
51. `world1-final-art-lock-v1.js?v=4`
52. `world1-ground-obstacle-polish-v2.js?v=4`
53. `world1-owl-dialogue-layer-fix-v3.js?v=4`

### Explicitly retired runtime files

`game.js` declares these retired and they must not be reintroduced into `ACTIVE_PATCHES`:

- `boss-crowking-v1.js`
- `world1-classic-enhanced-background-v1.js`
- `ruins-pillars-v3.js`
- `w2-v7-compat-v1.js`
- `w2-boss-combat-v5.js`
- `w2-boss-combat-v6.js`
- `w2-boss-tuning-v8.js`
- `w2-boss-phase2-relief-v9.js`
- `w3-critical-fix-v5.js`
- `world1-ground-gap-polish-v1.js`

Also treat old generation files such as `world2-ice-world-v2.js` through `world2-ice-world-v9.js`, old cursed-obstacle iterations, preview/lab scripts, and old splash generations as historical/lab assets unless they are explicitly added to the approved loader.

**Rule:** file presence in the repository does not mean runtime ownership.

---

## 4. Why the runtime is regression-prone

The live game is currently a wrapper stack. Many active files wrap the same historical methods instead of replacing the engine with isolated systems.

Current audit found heavy repeated ownership around methods including:

- `update()` — approximately 22 active wrappers/owners;
- `draw()` — approximately 11;
- `gameOver()` — approximately 12;
- `reset()` — approximately 10;
- `activateBoss()` — approximately 10.

This is why adding “one small patch” can regress a later fix.

### Wrapper rule

Before modifying a wrapped lifecycle method:

1. find every active owner in `ACTIVE_PATCHES`;
2. identify which layer is loaded last;
3. modify the final owner if possible;
4. preserve delegation to the previous implementation unless intentionally replacing it;
5. do not add another wrapper merely to avoid understanding the chain.

Long term, these wrappers should be consolidated only after full behavior tests exist.

---

## 5. World model

Use stable technical IDs in code/documentation:

| ID | Current display identity | Runtime index |
| --- | --- | ---: |
| W1 | Cursed Woods | `0` |
| W2 | Frostbite Peaks | `1` |
| W3 | Storm Spire | `2` |
| W4 | Volcanic / Coming Soon | `3` |

Historical core names are not authoritative. Some internal legacy fields still call W1 “Ruins” or use older boss terminology.

### Unlock progression

- W1 is available by default.
- W2 requires `fh_w1_completed`.
- W3 requires `fh_w2_completed`.
- W4 is currently coming soon / locked.

---

## 6. World 1 — Cursed Woods

### Final active visual/gameplay ownership

- background: `world1-cursed-woods-background-v3.js`
- obstacle source assets:
  - `world1-cursed-obstacle-asset-top-a.js`
  - `world1-cursed-obstacle-asset-bottom-a.js`
- obstacle runtime: `world1-cursed-obstacles-v5.js`
- final art lock: `world1-final-art-lock-v1.js`
- ground/obstacle seam polish: `world1-ground-obstacle-polish-v2.js`
- Crow King gameplay art: `crow-king-ingame-v4.js`
- crow minions: `crow-minions-ingame-v3.js`
- Owl Guardian: `owl-guardian-v2.js`
- Owl/Crow dialogue/layering:
  - `world1-phase2-owl-dialogue-v3.js`
  - `world1-owl-dialogue-layer-fix-v3.js`

### Important W1 regression boundaries

Do not reactivate:

- `world1-classic-enhanced-background-v1.js`;
- `ruins-pillars-v3.js`;
- `world1-ground-gap-polish-v1.js`;
- `boss-crowking-v1.js`.

Those files represent old visual/runtime paths and conflict with the current Cursed Woods lock.

### Boss

Canonical W1 boss identity is **Crow King**. The active in-game boss art/runtime owner is `crow-king-ingame-v4.js`, supported by the shared boss core and W1 gameplay/story/audio layers.

---

## 7. World 2 — Frostbite Peaks

### Final active ownership

- environment assets: `w2-environment-assets-v1.js`
- environment visuals: `w2-visuals-v1.js`
- ice ground/skeletons: `w2-ice-ground-skeletons-v1.js`
- gameplay: `w2-gameplay-v1.js`
- boss art base: `w2-emperor-art-v1.js`
- boss polish: `w2-boss-polish-v2.js`
- orb mechanics: `w2-boss-orb-v7.js`
- final boss combat/runtime: `w2-boss-runtime-v10.js`
- final boss PNG sprite set: `w2-emperor-png-v5.js`
- dialogue-ground cleanup is installed through the W2 boss/visual stack
- outro active-hero behavior is installed by the approved W2 runtime stack

### Boss

Canonical identity: **Ice Emperor**.

Legacy names such as Penguin/Emperor SVG references may still appear in historical source or logs. They are not the art authority.

### Retired W2 boss layers

Do not restore:

- V5 combat;
- V6 combat;
- V8 tuning;
- V9 phase-2 relief;
- V7 compatibility patch.

The final runtime authority is V10 plus the current art/orb layers.

---

## 8. World 3 — Storm Spire

### Final active ownership

- foundation: `w3-foundation-v1.js`
- world polish: `w3-world-polish-v1.js`
- boss base: `w3-boss-v1.js`
- final polish: `w3-final-polish-v1.js`
- balance/visuals: `w3-balance-visual-v2.js`
- challenge audio: `w3-challenge-audio-v3.js`
- final balance: `w3-final-balance-v4.js`
- critical fix: `w3-critical-fix-v6.js`
- final lifecycle/environment cleanup: `w3-runtime-cleanup-v1.js`
- final boss PNG: `w3-voltbat-png-v1.js`
- final enemy PNG: current W3 enemy PNG V3 runtime installed by the active W3 stack
- final environment PNG: current W3 environment PNG V3 runtime installed by the active W3 stack

### Boss

Canonical identity: **Lord Voltbat**.

Do not restore old `w3-critical-fix-v5.js`.

### Completion

Current W3 cleanup returns the game to menu/W1 after final completion and owns the current end-of-W3 lifecycle cleanup. Changes here require full W3 outro testing.

---

## 9. Post-runtime UI architecture

The UI is intentionally loaded only after the approved gameplay runtime reports ready.

Current UI order in `ui-runtime-boot-v1.js`:

1. `lab-ui.js?v=6`
2. `ui-foundation-v1.js?v=1`
3. `ui-settings-leaderboard-v1.js?v=2`
4. `ui-store-v1.js?v=1`
5. `ui-world-select-v1.js?v=8`
6. `ui-main-menu-v3.js?v=5`
7. `ui-end-screens-v1.js?v=1`
8. `ui-hud-v1.js?v=5`
9. `ui-runtime-fixes-v1.js?v=2`

### Menu readiness contract

The loading splash must not finish until the UI is structurally ready.

Important detail: the splash intentionally hides the menu while loading. Therefore readiness checks must validate **layout/geometry**, not painted `visibility`, otherwise a circular deadlock occurs:

`splash hides menu -> menu readiness waits for visibility -> splash waits for menu readiness`.

`ui-runtime-boot-v1.js` uses `laidOutInViewport()` for this reason.

### Required menu readiness pieces

At minimum:

- Start screen active;
- final logo structurally present;
- world card laid out;
- PLAY button laid out and enabled;
- W1 thumbnail applied;
- coin icon applied;
- bird avatar button applied;
- preview canvas has rendered content;
- foundation/world-select/main-menu readiness flags are present.

### Splash/WebKit contract

Safari/WebKit can commit style changes one frame later than Chromium. The splash reveal must not remove DOM/readiness gates in the same paint operation that reveals menu content.

Do not “fix” this by requiring painted visibility inside `menuContractReady()`; that recreates the 97% deadlock.

---

## 10. HUD and Pause contract

### HUD ownership

Current HUD visual shell:

- `ui-hud-v1.css`
- `ui-hud-v1.js`

Final behavioral/data repair:

- `ui-runtime-fixes-v1.css`
- `ui-runtime-fixes-v1.js`

### Visible HUD data bridge

Historical core updates hidden compatibility IDs:

- `currentScoreDisplay`
- `sessionCoinDisplay`
- `stageDisplay`
- `feverBarFill`

Modern visible HUD uses:

- `scoreValue`
- `runCoins`
- `stageName`
- `feverFill`

`ui-runtime-fixes-v1.js` bridges the real game values into the modern HUD. Do not assume the visible DOM is updated by the historical core.

### Fever

Fever is an active gameplay system and must remain visible. It was previously hidden by the HUD cleanup layer and restored by the runtime repair layer.

### Pause

Pause is a **simulation pause**, not merely an overlay.

Required invariant:

`game.__ffPaused === true` must stop the final wrapped `update()` chain.

Current final pause guard lives in `ui-runtime-fixes-v1.js` after all gameplay patches have loaded.

Pause button physical order must be stable under Arabic RTL. HUD structural direction is pinned independently of language direction.

---

## 11. Store and character contracts

### Character roster

Current approved character system is owned by:

- `character-roster-v1.js`
- `character-abilities-v2.js`
- `character-ability-ui-v1.js`
- `character-ability-fx-v1.js`
- character-specific stability/effect layers.

Current known roster keys include:

- `classic`
- `pigeon`
- `falcon`
- `phoenix`
- `cyber`
- `ghost`
- `king`
- `eagle`

### Store

Modern store owner:

- `ui-store-v1.js`
- `ui-store-v1.css`

The historical `skinsGrid` ID must remain in DOM because the old core still renders into it during initialization. The modern store hides/reuses legacy content after runtime boot.

Do not remove legacy core DOM hooks simply because modern UI does not display them.

### Character save contract

Relevant keys:

- `fh_active_skin`
- `fh_unlocked_skins`
- `fh_total_coins`

Do not rename without migration logic.

---

## 12. Persistence contract

Known active local-storage keys include:

| Key | Purpose |
| --- | --- |
| `fh_total_coins` | total currency |
| `fh_active_skin` | selected character |
| `fh_unlocked_skins` | owned/unlocked characters |
| `fh_highscore` | W1 high score |
| `fh_highscore_w2` | W2 high score |
| `fh_highscore_w3` | W3 high score |
| `fh_w1_completed` | W1 completion |
| `fh_w2_completed` | W2 completion |
| `fh_w3_completed` | W3 completion |
| `fh_lang` | language preference |
| `fh_sfx` / audio-related keys | sound preferences, depending on historical core/audio layer |

The repository should treat saves as a compatibility surface. New versions must not silently invalidate player progress.

---

## 13. Required DOM compatibility hooks

The historical core still assumes several IDs exist synchronously when it initializes.

Important examples include:

- `htmlTag`
- `startScreen`
- `gameCanvas`
- `worldCard`
- `worldTitle`
- `worldStars`
- `worldStatus`
- `startStoryBtn`
- `startEndlessBtn`
- `settingsBtn`
- `settingsScreen`
- `closeSettingsBtn`
- `shopBtnStart`
- `shopBtnGameOver`
- `shopScreen`
- `closeShopBtn`
- `skinsGrid`
- `leaderboardScreen`
- `leaderboardList`
- `gameOverScreen`
- `restartBtn`
- `reviveBtn`
- `mainMenuBtn`
- `nextWorldActionBtn`
- `gameHud`
- compatibility display IDs inside `ffCoreDomCompat`.

Removing or renaming these can prevent the game constructor from completing, which cascades into runtime timeout and a loading-screen failure.

When redesigning UI, preserve compatibility IDs or add a documented adapter first.

---

## 14. Regression protection

### Repository safety gate

`scripts/runtime-integrity-check.js` validates critical static contracts including:

- approved `game.js` / UI boot versions;
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

## 19. UI Navigation Contract

This section is the canonical screen/navigation map. UI code must not invent a different return target locally. The final runtime owner is `ui-runtime-fixes-v1.js` through `window.__FF_UI_NAV__`.

### State model

Navigation has three independent but coordinated layers:

- gameplay engine state: `game.state` (`MENU`, `STORY`, `LAUNCH`, `PLAYING`, boss states, `GAMEOVER`);
- simulation pause flag: `game.__ffPaused`;
- visible UI route: `MAIN`, `GAMEPLAY`, `PAUSE`, `SETTINGS`, `STORE`, `END`, or `LEADERBOARD`.

These layers must never contradict each other. In particular, `startScreen` visible while `game.state === 'PLAYING'` is invalid.

### Canonical route map

```text
LOADING
  -> MAIN

MAIN
  -> Settings -> Back -> MAIN
  -> Store -> Back -> MAIN
  -> Leaderboard -> Back -> MAIN
  -> PLAY -> STORY/LAUNCH -> PLAYING

PLAYING
  -> Pause -> Resume -> PLAYING
           -> Restart -> SAME WORLD STORY (or Endless restart)
           -> Settings -> Back -> PAUSE
           -> Main Menu -> MAIN

DEFEAT
  -> Revive -> PLAYING
  -> Restart -> SAME WORLD STORY
  -> Store -> Back -> DEFEAT
  -> Main Menu -> MAIN

VICTORY
  -> Restart -> SAME WORLD STORY
  -> Store -> Back -> VICTORY
  -> Main Menu -> MAIN
  -> Next World -> MAIN with next world selected
       W1 -> W2
       W2 -> W3
       W3 -> W4 / Coming Soon
```

### Required invariants

| Visible route | Required engine/pause contract |
| --- | --- |
| MAIN | `game.state === 'MENU'`, `game.__ffPaused === false` |
| GAMEPLAY | gameplay state, HUD visible, `game.__ffPaused === false` |
| PAUSE | gameplay state preserved, `game.__ffPaused === true` |
| SETTINGS from MAIN | return target MAIN |
| SETTINGS from PAUSE | gameplay state preserved, `game.__ffPaused === true`, return target PAUSE |
| STORE from MAIN | return target MAIN |
| STORE from END | `game.state === 'GAMEOVER'`, return target END |
| END | `game.state === 'GAMEOVER'`, HUD hidden |

### Ownership rules

1. `window.__FF_UI_NAV__` is the final navigation owner after UI boot.
2. Pause/Main/Restart/Settings/Store/End buttons must route through the navigation contract rather than independently toggling `active`/`hidden` and `game.state`.
3. `game.returnToMenu()` and `game.restartCurrentRun()` are compatibility entry points owned by the navigation layer.
4. Modal return context is explicit. Settings opened from Pause must return to Pause; Store opened from End must return to End.
5. `nextWorldActionBtn` selects `activeWorld + 1` (clamped to W4/Coming Soon), never a hard-coded World 2.
6. Any new screen that can be opened from more than one origin must declare its return-route behavior here and in live regression tests.

### Required navigation regression coverage

Live verification must include at minimum:

- Pause -> Settings -> Back -> Pause while simulation remains paused;
- Pause -> Main Menu -> MAIN with `game.state === 'MENU'`;
- End -> Store -> Back -> End with `game.state === 'GAMEOVER'`;
- Next World mapping W1->W2, W2->W3, W3->W4/Coming Soon;
- no route may leave `startScreen` visible while the engine remains in a gameplay state.
