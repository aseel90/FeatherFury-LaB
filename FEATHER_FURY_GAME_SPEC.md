# Feather Fury — Canonical Game Specification & Runtime Contract

**Repository:** `aseel90/FeatherFury-LaB`  
**Canonical branch:** `main`  
**Audit baseline:** 2026-08-29  
**Purpose:** prevent runtime ownership conflicts, accidental rollback, duplicate patches, and reintroduction of retired systems.

---

## 1. Source-of-truth hierarchy

When documentation, filenames, comments, old plans, and behavior disagree, use this order:

1. **Actual boot loader + CI gates:** `index.html`, `game.js`, `ui-runtime-boot-v1.js`, `scripts/runtime-integrity-check.js`, `scripts/live-smoke.mjs`.
2. **This document:** `FEATHER_FURY_GAME_SPEC.md` — canonical technical/runtime architecture and contracts.
3. **`RUNTIME_ACTIVE.md`** — concise active/retired snapshot.
4. **`DEVELOPMENT_RULES.md`** — contribution/change safety rules.
5. **`GAME_PLAN.md`** — design intent, approved visual/gameplay direction and historical planning. It must not be used to infer current runtime file ownership when it conflicts with items 1–4.
6. **`README.md`** — overview only; not a runtime authority.

**Rule:** a file existing in the repository does not make it active. Only files loaded by the current boot chain are runtime owners.

---

## 2. Product identity and world map

Feather Fury is a portrait-first mobile arcade flying game. The player controls a bird through obstacle fields, collects coins, fills Fever, enters boss fights, completes story beats and unlocks later worlds/characters.

Canonical world identity:

| Canonical world ID | Legacy index | Current identity | Boss | Guardian/reward | Progression |
|---|---:|---|---|---|---|
| `W1` | `0` | Cursed Woods / الغابة الملعونة | Crow King | Owl guardian | Available from start |
| `W2` | `1` | Frozen Peaks / world of ice | Ice Emperor | Eagle outro/reward | Unlock after W1 |
| `W3` | `2` | Storm Ruins | Lord Voltbat / thunder boss | — | Unlock after W2 |
| `W4` | `3` | Future/locked world | Not production-ready | — | Locked |

Use `W1/W2/W3/W4` in technical documentation. Do not infer world identity from historical variable names such as `Ruins`, `Penguin`, or `Thunderbird` without checking current runtime ownership.

---

## 3. Boot architecture — exact current path

### 3.1 Direct document boot (`index.html`)

CSS order is significant and therefore part of the runtime contract:

1. `style.css?v=2.3.6`
2. `lab-ui.css?v=1`
3. `ui-foundation-v1.css?v=1`
4. `ui-world-select-v1.css?v=7`
5. `ui-main-menu-v2.css?v=1`
6. `ui-main-menu-v3.css?v=4`
7. `ui-store-v1.css?v=2`
8. `ui-hud-v1.css?v=6`
9. `ui-runtime-fixes-v1.css?v=1`
10. `ui-end-screens-v1.css?v=2`
11. `ui-settings-leaderboard-v1.css?v=1`
12. `ui-splash-approved-v3.css?v=1`

Direct JavaScript order:

1. `js/config.js?v=2.3.4`
2. `js/audio.js?v=2.3.2`
3. `js/graphics.js?v=2.3.2`
4. `js/world1.js?v=2.3.2`
5. `js/world2.js?v=2.3.2`
6. `js/world3.js?v=2.3.2`
7. `ui-splash-approved-v3.js?v=12`
8. `game.js?v=2.4.7`
9. `ui-runtime-boot-v1.js?v=7`

### 3.2 Core runtime loader (`game.js`)

`game.js` is an orchestrator, not the complete game implementation.

Current core entry:

```text
stable-runtime-w3-clean-v1.js?v=4
```

**Important known debt:** `stable-runtime-w3-clean-v1.js` performs a synchronous XHR to a pinned historical `game.js` through jsDelivr, transforms that source, then `eval`s it. This recovery mechanism is currently working but is **not** the desired final architecture and is incompatible with the long-term private/offline/Android goal.

Current pinned source commit used by the transformer:

```text
5b83840d68ad65939b8efae336afd76c47b7bdc1
```

### 3.3 Runtime handshake flags

The boot chain depends on these contracts:

- `window.game` — instantiated core game.
- `window.__FF_RUNTIME_APPROVED_STACK__ === true` — core + active gameplay patches completed.
- `window.__FF_MENU_UI_READY__ === true` — post-runtime UI completed and menu contract passed.
- `window.__FF_RUNTIME_MAP__.version === 'approved-runtime-v1.3'` — active runtime map identity.
- `window.__FF_CHARACTER_ROSTER_V1__` — character roster available.

The loading screen must not disappear until runtime and menu readiness are both satisfied.

### 3.4 Splash / 97% regression contract

The August 29 failure was caused by a deadlock: splash CSS hid the menu while menu readiness required visually painted elements. The permanent rule is:

- boot readiness checks **layout/DOM readiness**, not splash-obscured paint visibility;
- menu is prepainted behind the splash before WebKit fade/removal;
- splash may visually cover the menu, but it must not prevent the menu from becoming logically ready;
- never reintroduce a readiness condition that requires the splash to be gone before `__FF_MENU_UI_READY__` can become true.

Current progress milestones are approximately: assets 22%, foundation 38%, game 57%, roster 75%, worlds 89%, ready 98.5%, then 100% and exit.

---

## 4. Active gameplay patch order

`game.js` owns the executable list. At this audit baseline, the current active chain is:

1. `runtime-config-bridge-v1.js?v=1`
2. `boss-fight-core-v1.js?v=1`
3. `boss-audio-fix-v2.js?v=2`
4. `w1-final-audio-v1.js?v=1`
5. `w1-final-gameplay-v1.js?v=1`
6. `w1-final-story-v1.js?v=1`
7. `world1-cursed-woods-background-v3.js?v=3`
8. `world1-final-art-lock-v1.js?v=1`
9. `world1-cursed-obstacles-v5.js?v=5`
10. `world1-ground-obstacle-polish-v2.js?v=2`
11. `crow-king-ingame-v4.js?v=4`
12. `crow-minions-ingame-v3.js?v=3`
13. `world1-crow-contrast-v1.js?v=1`
14. `owl-guardian-v2.js?v=2`
15. `world1-phase2-owl-dialogue-v3.js?v=3`
16. `world1-owl-dialogue-layer-fix-v3.js?v=3`
17. `world1-qa-fix-v2.js?v=2`
18. `w2-audio-v1.js?v=1`
19. `w2-gameplay-v1.js?v=1`
20. `w2-boss-runtime-v10.js?v=2`
21. `w2-environment-assets-v1.js?v=1`
22. `w2-visuals-v1.js?v=1`
23. `w2-ice-ground-skeletons-v1.js?v=1`
24. `w2-emperor-art-v1.js?v=1`
25. `w2-emperor-png-v5.js?v=5`
26. `w2-boss-polish-v2.js?v=2`
27. `w2-boss-orb-v7.js?v=7`
28. `w2-dialogue-ground-fix-v1.js?v=1`
29. `w2-outro-eagle-skin-v3.js?v=3`
30. `w3-runtime-cleanup-v1.js?v=5`
31. `w3-foundation-v1.js?v=1`
32. `w3-world-polish-v1.js?v=1`
33. `w3-final-polish-v1.js?v=1`
34. `w3-balance-visual-v2.js?v=2`
35. `w3-boss-v1.js?v=1`
36. `w3-boss-tuning-v2.js?v=2`
37. `w3-enemy-png-v1.js?v=1`
38. `w3-voltbat-png-v1.js?v=1`
39. `w3-environment-png-v1.js?v=1`
40. `w3-challenge-audio-v3.js?v=3`
41. `w3-final-balance-v4.js?v=4`
42. `w3-critical-fix-v6.js?v=6`
43. `hero-blue-ninja-v1.js?v=1`
44. `hero-static-smooth-v2.js?v=2`
45. `hero-blue-effects-v1.js?v=1`
46. `fierce-falcon-v1.js?v=1`
47. `skin-routing-hardfix-v2.js?v=2`
48. `mountain-eagle-stability-v3.js?v=3`
49. `character-roster-v1.js?v=1`
50. `character-abilities-v2.js?v=2`
51. `character-ability-ui-v1.js?v=1`
52. `character-ability-fx-v1.js?v=1`
53. `revive-core-fix-v1.js?v=1`
54. `victory-screen-fix-v1.js?v=1`
55. `core-gameplay-ux-v1.js?v=2`
56. `pause-hud-polish-v2.js?v=2`

The loader may evolve after this baseline. **The executable list in `game.js` is authoritative.** When that list changes, update this document in the same change.

### Retired/not active examples

Important retired files include:

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

**Never activate an old file because its filename looks relevant. Check this list and `game.js` first.**

---

## 5. Post-runtime UI ownership

`ui-runtime-boot-v1.js` loads UI behavior only after the gameplay runtime is approved:

1. `lab-ui.js?v=6`
2. `ui-foundation-v1.js?v=1`
3. `ui-settings-leaderboard-v1.js?v=2`
4. `ui-store-v1.js?v=1`
5. `ui-world-select-v1.js?v=8`
6. `ui-main-menu-v3.js?v=5`
7. `ui-end-screens-v1.js?v=1`
8. `ui-hud-v1.js?v=5`
9. `ui-runtime-fixes-v1.js?v=1`

`ui-runtime-fixes-v1.js` is a deliberately late compatibility/repair owner. It runs after the complete gameplay patch stack and final HUD owner, so it can freeze the **final** `game.update()` chain during Pause and bridge legacy core state (`score`, `sessionCoins`, fever) into the visible HUD without changing world/boss ownership. Its companion CSS pins the physical HUD direction, restores the fever meter, and owns the current World/PLAY spacing and store-balance identity overrides.

Then the boot loader refreshes carousel/preview/store and validates the main menu contract before setting `__FF_MENU_UI_READY__`.

### Main menu contract

A valid menu requires, at minimum:

- `#startScreen` active;
- Feather Fury logo laid out in viewport;
- world card laid out in viewport;
- PLAY button laid out, enabled and in viewport;
- world-1 thumbnail applied;
- world kicker present;
- coin icon present;
- bird/avatar button present;
- preview canvas contains rendered pixels;
- foundation/world-select/main-menu flags are ready.

Do not weaken this contract without replacing it with an equivalent regression test.

---

## 6. Core gameplay model

### Canvas and baseline tuning

The game is portrait-first and currently tested at a logical mobile viewport around `390 × 844` while the canvas itself originates from the legacy `450 × 800` game model.

Core baseline concepts include:

- gravity-driven bird vertical motion;
- tap/pointer flap input;
- horizontal obstacle movement;
- obstacle pass scoring;
- coin collection;
- Fever meter and Fever active timer;
- Story/Launch/Playing/Boss/Game Over/Victory state transitions;
- per-world stage/boss progression.

Do not tune baseline physics as part of UI/layout work.

---

## 7. State and flow contracts

Canonical high-level flow:

```text
PAGE LOAD
  → loading splash
  → approved core runtime
  → post-runtime UI
  → MAIN MENU / WORLD SELECT
  → PLAY
  → STORY (when applicable)
  → LAUNCH / PLAYING
  → BOSS
  → OUTRO / VICTORY
  → NEXT WORLD / MENU
```

Pause is an overlay/substate during gameplay. It must not create a second gameplay loop.

### Critical gameplay states

The historical core and patches use state labels such as:

- `MENU`
- `STORY`
- `LAUNCH`
- `PLAYING`
- `BOSS`
- `GAME_OVER`
- `VICTORY`

Do not invent a parallel state machine in a UI patch. Extend the existing state contract explicitly if a new production state is required.

---

## 8. Persistence contract

Current local persistence is based on `localStorage`. Important keys observed in the current runtime include:

- `fh_active_skin`
- `fh_total_coins`
- `fh_w1_completed`
- `fh_w2_completed`
- `fh_w3_completed`
- `fh_high_score`
- world-specific high-score/star values used by the current core/UI
- language/settings keys used by the current core

Exact historical key usage can exist in both the pinned core and active patches.

**Persistence rule:** do not rename or clear these keys during unrelated work. Any schema migration must be explicit, backward-compatible where possible, and covered by a migration test.

---

## 9. Character system

Current character ownership is layered:

- base/classic rendering from the legacy core;
- blue ninja art: `hero-blue-ninja-v1.js`;
- smooth static hero behavior: `hero-static-smooth-v2.js`;
- blue effects: `hero-blue-effects-v1.js`;
- falcon: `fierce-falcon-v1.js`;
- routing correction: `skin-routing-hardfix-v2.js`;
- mountain eagle stability: `mountain-eagle-stability-v3.js`;
- roster: `character-roster-v1.js`;
- abilities: `character-abilities-v2.js`;
- ability UI: `character-ability-ui-v1.js`;
- ability FX: `character-ability-fx-v1.js`.

The roster/UI should not redefine world physics or boss behavior.

---

## 10. World ownership

### W1 — Cursed Woods

Final runtime owners:

- background: `world1-cursed-woods-background-v3.js` + `world1-final-art-lock-v1.js`;
- obstacles: `world1-cursed-obstacles-v5.js` + `world1-ground-obstacle-polish-v2.js`;
- boss visual: `crow-king-ingame-v4.js`;
- boss/core fight: `boss-fight-core-v1.js` plus final W1 gameplay/story wrappers;
- minions: `crow-minions-ingame-v3.js`;
- guardian/outro: `owl-guardian-v2.js`, `world1-phase2-owl-dialogue-v3.js`, `world1-owl-dialogue-layer-fix-v3.js`;
- final QA corrections: `world1-qa-fix-v2.js`.

Do not restore `world1-classic-enhanced-background-v1.js`, `ruins-pillars-v3.js`, or `world1-ground-gap-polish-v1.js` into runtime.

### W2 — Frozen Peaks / Ice Emperor

Final ownership:

- gameplay: `w2-gameplay-v1.js`;
- audio: `w2-audio-v1.js`;
- environment: `w2-environment-assets-v1.js`, `w2-visuals-v1.js`, `w2-ice-ground-skeletons-v1.js`;
- boss behavior authority: `w2-boss-runtime-v10.js`;
- boss art: `w2-emperor-png-v5.js` plus selected art/polish layers;
- boss polish/orb: `w2-boss-polish-v2.js`, `w2-boss-orb-v7.js`;
- outro: `w2-dialogue-ground-fix-v1.js`, `w2-outro-eagle-skin-v3.js`.

The V5/V6/V8/V9 compatibility/combat chain is retired. Do not use it as the active W2 design reference.

### W3 — Storm Ruins

Final ownership:

- final cleanup owner: `w3-runtime-cleanup-v1.js`;
- foundation/world polish: `w3-foundation-v1.js`, `w3-world-polish-v1.js`, `w3-final-polish-v1.js`;
- balance/visual: `w3-balance-visual-v2.js`, `w3-final-balance-v4.js`;
- boss: `w3-boss-v1.js` + `w3-boss-tuning-v2.js`;
- final enemy art: `w3-enemy-png-v1.js`, `w3-voltbat-png-v1.js`;
- final environment art: `w3-environment-png-v1.js`;
- challenge audio: `w3-challenge-audio-v3.js`;
- final critical compatibility: `w3-critical-fix-v6.js`.

---

## 11. Asset ownership

### UI

- `assets/ui/loading-hq/` — approved high-quality loading assets.
- `assets/ui/world-thumbnails/` — current WebP world cards.
- `assets/ui/icons/` — vector UI icons including pause, settings, shop, trophy, coin, stars, sound and navigation.

### W2

`assets/world2/ice-emperor/` contains the current Ice Emperor source/derived art including state SVGs and the PNG sheet parts used by `w2-emperor-png-v5.js`.

### W3

`assets/world3/enemies/` and `assets/world3/voltbat/` contain the current encoded PNG sheets used by the W3 asset installers.

Do not introduce a new art source for an existing production entity without naming which current owner it supersedes.

---

## 12. UI and DOM ownership

`index.html` owns stable DOM hooks that both legacy core and current UI depend on. Important examples include:

- `#startScreen` — main menu/world select overlay;
- `#startStoryBtn` — Play;
- `#worldCard` — current world card;
- `#previewBirdCanvas` — character preview;
- `#gameHud` — in-run HUD;
- `#settingsScreen`, `#shopScreen`, `#leaderboardScreen`;
- end-screen hooks such as `#endGameTitle`, `#finalScore`, `#highScore`, `#earnedCoins`;
- compatibility hooks inside `#ffCoreDomCompat` for the historical core.

The hidden compatibility DOM is intentional. Do not remove an apparently invisible hook until the pinned core and every active patch have been searched for it.

### Current UI debt

There are multiple CSS generations in the page:

- baseline `style.css`, `lab-ui.css` and specialized UI CSS share selectors such as `#startScreen`, `.world-card`, `.worlds-carousel`, `.arcade-btn`, settings/shop/leaderboard structures.
- both `ui-main-menu-v2.css` and `ui-main-menu-v3.css` are loaded; current JS behavior is V3.
- `index.html` still contains emoji for leaderboard/shop/settings despite SVG icons existing and the production UI rule banning emoji icons.

**Rule:** new UI work must identify one final visual owner. Do not add another global selector layer to “win” the cascade.

---

## 13. Patch wrapping and lifecycle risk

The runtime grew through patch wrapping. Many active files reassign the same methods. This means load order is behavior.

Observed high-risk lifecycle methods include:

- `update()` — roughly 20+ wrappers;
- `draw()` — roughly 10+ wrappers;
- `gameOver()` — roughly 10+ wrappers;
- `reset()` — roughly 10 wrappers;
- `activateBoss()` — roughly 10 wrappers.

Representative ownership chains are intentionally long. Example conceptually:

```text
legacy core update
→ boss core
→ W1 final gameplay
→ W1 story
→ W1 art/obstacle wrappers
→ W2 gameplay
→ W2 boss runtime
→ W3 cleanup/polish/boss wrappers
→ character/ability/UX wrappers
```

### Change rule for wrapped methods

Before modifying any of these methods:

1. Search all active patches for assignments/wrappers of that method.
2. Identify the final owner in load order.
3. State whether the change belongs in the original owner or a later consolidation owner.
4. Do not add a new patch merely because it is easier than understanding the chain.
5. Add a regression check for the behavioral contract being changed.

The preferred direction is **fewer final owners**, not more wrappers.

---

## 14. Audio ownership

Audio is split between:

- core `js/audio.js`;
- `boss-audio-fix-v2.js`;
- `w1-final-audio-v1.js`;
- `w2-audio-v1.js`;
- W3 challenge audio;
- pause/UX layers that may suspend/resume environment sound.

Do not start/stop audio from a visual renderer unless that renderer is explicitly the current audio lifecycle owner.

---

## 15. Leaderboard/network contract

The current leaderboard is local/demo behavior. There is no production global backend authority in the current repository.

Therefore:

- do not represent the leaderboard as globally synchronized;
- do not add network dependency merely to preserve current UI behavior;
- UI wording may be polished separately, but architecture must not assume a server exists.

---

## 16. Versioning status

Multiple version identities currently coexist:

- package version: `2.2.0`;
- in-game/version text around `2.2.6` in historical core/UI;
- query/cache version around `game.js?v=2.4.7`;
- runtime map: `approved-runtime-v1.3`.

These currently mean different things, but the distinction is undocumented. Future release work should define one product version and separate cache/runtime schema versions explicitly.

---

## 17. CI / deployment safety net

### Repository safety

`.github/workflows/repo-safety.yml` runs syntax/integrity/truncation checks, including `scripts/runtime-integrity-check.js`.

The integrity gate protects:

- required active owners;
- retired/active overlap;
- boot ownership;
- pause/HUD contracts;
- selected UI/runtime invariants.

### Live deployment smoke

`.github/workflows/live-runtime-verify.yml` uses Playwright on mobile-sized Chromium and WebKit (`390 × 844`). Current smoke covers:

```text
page load
→ runtime approved
→ menu ready
→ splash removed
→ menu visual contract
→ PLAY
→ STORY/LAUNCH transition
→ PLAYING
→ HUD layout in forced RTL (coins left / score center / Pause right)
→ fever bar visible and below the top HUD
→ Pause open
→ bird position/velocity remain frozen while paused
→ visible coins/score/fever bridge reflects live game state
→ Pause resume
→ World-card/PLAY spacing contract
→ store coin-balance visual contract
```

Failures are bridged to the live-deployment issue and success closes it.

### What CI does NOT yet prove

Current smoke does not fully test:

- W1 complete run + Crow King + Owl outro;
- W2 complete run + Ice Emperor + Eagle outro;
- W3 complete run + Voltbat + final outro;
- revive lifecycle;
- store purchase/equip persistence;
- full settings persistence/language switching (the smoke now forces RTL geometry, but does not yet complete an in-game language toggle lifecycle);
- endless mode;
- victory → next-world progression;
- cold start with existing old save data;
- offline/no-CDN boot;
- Capacitor/Android lifecycle and back-button behavior.

These are the next regression tests to add before architectural consolidation.

---

## 18. Known technical debt — priority order

1. **Remote synchronous historical core loader.** Materialize the transformed core locally and remove runtime CDN/XHR/eval dependency after equivalence testing.
2. **Patch-wrapper depth.** The same lifecycle methods have many wrappers; create behavior tests before consolidation.
3. **Documentation drift.** Older `GAME_PLAN.md` runtime file ownership is stale in places (for example it can name retired W1/W2 owners). Runtime facts must defer to this document/current loader.
4. **CSS cascade overlap.** Multiple generations own overlapping selectors.
5. **Version identity split.** Product/cache/runtime versions are not cleanly separated.
6. **W4 is UI/roadmap presence, not a production world implementation.**
7. **Leaderboard has no production backend.**
8. **Public CDN core dependency blocks fully private/offline operation.**

---

## 19. Safe modernization roadmap

### Phase A — freeze and characterize

- keep current working runtime behavior stable;
- add targeted regression tests when fixing each remaining visible bug;
- document any corrected owner immediately.

### Phase B — materialize core locally

- generate a local `game-core-stable-v1.js` from the exact transformed runtime;
- compare behavior against the current transformer output;
- run Chromium + WebKit + world-path tests;
- switch loader to local core only after equivalence is demonstrated;
- remove runtime jsDelivr/XHR/eval dependency.

### Phase C — consolidate wrappers

After tests exist, combine mature wrappers into explicit owners:

- W1 world module;
- W2 world module;
- W3 world module;
- character module;
- UI/pause/end screens.

Consolidation must preserve behavior first; cleanup is secondary.

### Phase D — CSS consolidation

After behavior is stable:

- establish token/design system in foundation;
- one owner each for main menu, store, HUD, end screens, settings/leaderboard;
- remove obsolete CSS generations rather than stacking overrides forever.

### Phase E — Android/private readiness

Before making the repository private or depending on packaged mobile assets:

- no runtime CDN code dependency;
- all production assets local;
- Capacitor build verification;
- persistence migration tests;
- lifecycle/audio/back-button tests;
- offline cold-start smoke test.

---

## 20. Regression invariants

These are non-negotiable unless a deliberate product change updates this document and tests:

1. Loading splash reaches completion and exits.
2. No 97% deadlock.
3. `window.__FF_RUNTIME_APPROVED_STACK__` becomes true.
4. `window.__FF_MENU_UI_READY__` becomes true.
5. Main menu logo/world card/PLAY fit inside mobile visual viewport.
6. PLAY leaves MENU and reaches gameplay/story correctly.
7. Pause button remains inside viewport and opens/resumes correctly.
8. W1 retains approved Cursed Woods environment and Crow King V4 art.
9. W1 Owl dialogue remains above ground and the paired fly-away cinematic survives.
10. W2 uses Runtime V10 behavior and current Ice Emperor PNG owner.
11. W3 uses cleaned runtime and current final PNG enemy/environment owners.
12. Retired W1/W2/W3 patches do not silently return.
13. Persistent player keys are not renamed/cleared by unrelated changes.
14. Runtime/UI errors in Chromium or WebKit fail live verification.
15. No new runtime dependency on a public external repository/CDN is introduced.

---

## 21. Development protocol

For every production change:

1. Read this document and `RUNTIME_ACTIVE.md`.
2. Identify the current runtime owner(s) for the requested behavior.
3. Search current `game.js` active/retired list before touching any historical patch.
4. Search wrappers of any lifecycle method you will modify.
5. Fetch the latest target file from GitHub immediately before editing.
6. Make the smallest coherent change.
7. Do not combine unrelated visual/gameplay/audio/persistence changes in one patch.
8. Do not change boot ordering casually.
9. Do not remove compatibility DOM hooks because they look unused.
10. Update this document if runtime ownership/boot contracts change.
11. Update `RUNTIME_ACTIVE.md` if the active/retired snapshot changes.
12. Run runtime integrity check.
13. Deploy.
14. Run live Chromium + WebKit smoke verification.
15. Inspect the deployed URL, not only repository files.

---

## 22. File status taxonomy

Use these labels in future reviews:

- **ACTIVE CORE** — required to construct core runtime.
- **ACTIVE PATCH** — in current `ACTIVE_PATCHES` or equivalent final load chain.
- **ACTIVE UI** — loaded directly or post-runtime.
- **ACTIVE ASSET** — referenced by an active owner.
- **COMPATIBILITY** — needed by historical core/bridge but not visual owner.
- **RETIRED** — intentionally excluded from production runtime.
- **LAB/PREVIEW** — development-only artifact.
- **UNKNOWN** — not yet proven active or retired; must not be activated by assumption.

---

## 23. Broad-change checklist

Before a broad change, the developer/assistant must:

- report the exact files and runtime owners it intends to touch before a broad change;
- explain why that owner is correct;
- state which regression invariants are at risk;
- preserve a rollback commit/known-good baseline;
- keep the change separable from unrelated work;
- avoid new wrappers if an existing final owner can safely hold the change;
- add/extend tests for any bug being fixed.

---

## 24. Canonical decision log

### 2026-08-29 — Stable boot recovery

- Historical full HTML bootstrap was removed.
- Local `index.html` became the production document.
- `game.js` became the approved runtime orchestrator.
- `stable-runtime-w3-clean-v1.js` remains a temporary remote-core transformer.
- UI boot moved behind approved runtime readiness.

### 2026-08-29 — 97% splash deadlock

- Menu readiness was changed to validate layout instead of splash-hidden paint visibility.
- WebKit menu prepaint was added before splash fade.
- Mobile HUD Pause was constrained inside the viewport.

### 2026-08-30 — Post-runtime HUD/Pause repair

- `ui-runtime-fixes-v1.js/css` became the late compatibility owner for final Pause simulation freeze, visible HUD score/coin/Fever bridging, physical RTL HUD ordering, Fever presentation, World/PLAY spacing, and store coin-balance identity.
- The live Playwright smoke was expanded to prove those contracts on Chromium and WebKit.

---

A code change that changes runtime ownership without updating this document is incomplete.
