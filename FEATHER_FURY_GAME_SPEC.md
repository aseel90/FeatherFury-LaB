# Feather Fury — Canonical Game Specification & Runtime Contract

**Repository:** `aseel90/FeatherFury-LaB`  
**Canonical branch:** `main`  
**Current audit baseline:** 2026-08-30  
**Purpose:** this is the technical source of truth used to prevent runtime ownership conflicts, accidental rollback, duplicate patches, stale documentation, and reintroduction of retired systems.

---

## 1. Authority order

When code, filenames, comments, screenshots, older plans, and documentation disagree, use this order:

1. `index.html`, `game.js`, `ui-runtime-boot-v1.js` and the deployed runtime.
2. `scripts/runtime-integrity-check.js` and `scripts/live-smoke.mjs`.
3. This file: `FEATHER_FURY_GAME_SPEC.md`.
4. `RUNTIME_ACTIVE.md`.
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
9. `ui-runtime-fixes-v1.css?v=1`
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

## 4. Core runtime architecture

`game.js` is an orchestrator, not the full historical game implementation.

Current core entry:

`stable-runtime-w3-clean-v1.js?v=4`

The current recovery core still synchronously loads a pinned historical `game.js` from jsDelivr, transforms it, and evaluates it. Pinned source commit:

`5b83840d68ad65939b8efae336afd76c47b7bdc1`

This is accepted temporary recovery debt, **not** the final offline/private/Android architecture. The long-term target is a fully materialized local core with behavior-equivalence tests before switching.

### Runtime handshake flags

- `window.game` — instantiated game object.
- `window.__FF_RUNTIME_APPROVED_STACK__ === true` — core and gameplay patch stack completed.
- `window.__FF_MENU_UI_READY__ === true` — post-runtime UI and menu contract completed.
- `window.__FF_RUNTIME_MAP__.version === 'approved-runtime-v1.3'` — runtime map identity.
- `window.__FF_CHARACTER_ROSTER_V1__` — character roster installed.

The loading splash may exit only after runtime and menu readiness are satisfied.

---

## 5. 97% loading regression rule

The August 29 loading failure was a deadlock: splash CSS hid the menu while readiness demanded painted visibility. Permanent contract:

- menu readiness validates DOM/layout geometry, not splash-obscured paint visibility;
- the menu may be prepainted behind the splash;
- WebKit receives time to paint the menu before splash fade/removal;
- no readiness condition may require the splash to disappear before `__FF_MENU_UI_READY__` can become true;
- `htmlTag` remains a required compatibility hook because the historical core changes document direction through it.

Never “simplify” these hooks without running both Chromium and WebKit live smoke tests.

---

## 6. Exact active gameplay patch order

This list is generated from the executable `ACTIVE_PATCHES` map in the current `game.js`. The order is behavior because many files wrap the same lifecycle methods.

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

If `ACTIVE_PATCHES` changes, this section must change in the same development cycle. CI is expected to reject active runtime tokens missing from this document.

### Important retired examples

These files may remain in the repository but are not production owners:

- `boss-crowking-v1.js`
- `world1-classic-enhanced-background-v1.js`
- `ruins-pillars-v3.js`
- `world1-ground-gap-polish-v1.js`
- `w2-v7-compat-v1.js`
- `w2-boss-combat-v5.js`
- `w2-boss-combat-v6.js`
- `w2-boss-tuning-v8.js`
- `w2-boss-phase2-relief-v9.js`
- `w3-critical-fix-v5.js`
- `startup-menu-guard-v1.js`

Never activate an old file merely because its name looks relevant.

---

## 7. Post-runtime UI ownership

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

`PAGE LOAD → SPLASH → RUNTIME → MENU/WORLD SELECT → PLAY → STORY/LAUNCH → PLAYING → BOSS → OUTRO/VICTORY → NEXT WORLD/MENU`

Historical/active state names include:

- `MENU`
- `STORY`
- `LAUNCH`
- `PLAYING`
- `BOSS`
- `GAME_OVER`
- `VICTORY`

Pause is an overlay/substate, not a separate game loop. While paused:

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

Regardless of document language direction, the physical top row is:

`coins on left | score/stage centered | Pause on right`

Arabic affects text direction, not the physical control placement.

### Fever

Fever remains a production gameplay mechanic and must be visible during normal gameplay. It must not be treated as retired merely because an older HUD bar was previously hidden. Duplicate boss HUD remains hidden; boss HP is owned by the world/boss renderer where currently designed.

---

## 10. Persistence contract

Current progression/settings are local `localStorage` data. Important keys include:

- `fh_active_skin`
- `fh_total_coins`
- `fh_w1_completed`
- `fh_w2_completed`
- `fh_w3_completed`
- `fh_high_score`
- world-specific high-score/star values used by core/UI;
- language/settings keys used by the historical core.

Do not rename, clear, or reinterpret these keys during unrelated visual/gameplay work. Any schema migration must be deliberate and regression-tested with existing save data.

---

## 11. Character ownership

Current character chain includes:

- legacy/classic core rendering;
- `hero-blue-ninja-v1.js`;
- `hero-static-smooth-v2.js`;
- `hero-blue-effects-v1.js`;
- `fierce-falcon-v1.js`;
- `skin-routing-hardfix-v2.js`;
- `character-roster-v1.js`;
- `character-abilities-v2.js`;
- `mountain-eagle-stability-v3.js`;
- `character-ability-ui-v1.js`;
- `character-ability-fx-v1.js`.

Character UI/FX must not redefine world physics or boss lifecycle.

---

## 12. World ownership

### W1 — Cursed Woods

Current final owners include:

- gameplay/story base: W1 final gameplay/story/fix patches;
- background: `world1-cursed-woods-background-v3.js` + `world1-final-art-lock-v1.js`;
- obstacles: asset top/bottom installers + `world1-cursed-obstacles-v5.js` + `world1-ground-obstacle-polish-v2.js`;
- Crow King visual: `crow-king-ingame-v4.js`;
- minions: `crow-minions-ingame-v3.js`;
- contrast: `world1-crow-contrast-v1.js`;
- Owl/outro: `owl-guardian-v2.js`, `world1-phase2-owl-dialogue-v3.js`, `world1-owl-dialogue-layer-fix-v3.js`;
- final QA: `world1-qa-fix-v2.js`.

The Owl dialogue must remain visually above the ground, and the approved paired fly-away/outro must survive future ground/dialogue changes.

### W2 — Frozen Peaks / Ice Emperor

Current authority includes:

- audio: `w2-audio-v1.js`;
- environment/visuals: `w2-environment-assets-v1.js`, `w2-visuals-v1.js`, `w2-ice-ground-skeletons-v1.js`;
- gameplay: `w2-gameplay-v1.js`;
- boss art/polish/orb: `w2-emperor-art-v1.js`, `w2-boss-polish-v2.js`, `w2-boss-orb-v7.js`;
- final boss behavior authority: `w2-boss-runtime-v10.js`.

Do not restore the retired V5/V6/V8/V9 compatibility combat chain.

### W3 — Storm Ruins

Current authority includes:

- `w3-foundation-v1.js`;
- `w3-world-polish-v1.js`;
- `w3-boss-v1.js`;
- `w3-final-polish-v1.js`;
- `w3-balance-visual-v2.js`;
- `w3-challenge-audio-v3.js`;
- `w3-final-balance-v4.js`;
- `w3-critical-fix-v6.js`;
- final cleanup owner: `w3-runtime-cleanup-v1.js`.

W3 asset installers referenced elsewhere in the repository remain relevant only where the active runtime actually consumes them; do not infer activation from filenames alone.

---

## 13. Asset ownership

Important production asset roots:

- `assets/ui/loading-hq/` — approved high-quality loading assets;
- `assets/ui/world-thumbnails/` — current WebP world-card art;
- `assets/ui/icons/` — pause/settings/shop/coin/stars/navigation and related vector UI icons;
- `assets/world2/ice-emperor/` — current Ice Emperor state/source and sheet parts;
- `assets/world3/enemies/` and `assets/world3/voltbat/` — W3 encoded character/enemy assets.

Do not introduce a second production art source for an existing entity without explicitly naming which owner is superseded.

---

## 14. DOM compatibility rules

`index.html` owns stable hooks required by both legacy core and modern UI. Critical examples:

- `#htmlTag`
- `#startScreen`
- `#startStoryBtn`
- `#worldCard`
- `#previewBirdCanvas`
- `#gameHud`
- settings/store/leaderboard overlays;
- end-screen score/coin hooks;
- hidden `#ffCoreDomCompat` hooks.

The hidden compatibility DOM is intentional. “Not visible” does not mean “unused.” Search the pinned core and active patches before removing any hook.

---

## 15. CSS ownership debt

The page still contains overlapping CSS generations. For example, baseline `style.css`, `lab-ui.css`, V2/V3 menu CSS and specialized screens can target the same structures.

Current rule:

- identify the final visual owner before editing;
- prefer editing/consolidating an existing owner;
- do not add another global selector layer solely to win specificity;
- post-runtime fix CSS is acceptable only for documented compatibility gaps and must remain narrow.

Long-term goal: one explicit CSS owner for menu, store, HUD, end screens and settings/leaderboard.

---

## 16. Lifecycle wrapper risk

The runtime grew through method wrapping. High-risk methods include `update`, `draw`, `gameOver`, `reset`, `activateBoss`, audio lifecycle and boss activation methods.

Before changing any wrapped lifecycle method:

1. inspect the executable active list;
2. search every active wrapper of that method;
3. identify the final owner in load order;
4. make the smallest coherent change;
5. add a regression test for the behavior being changed;
6. avoid a new patch when an existing final owner can safely contain the change.

The preferred direction is fewer final owners, not more wrappers.

---

## 17. Audio contract

Audio ownership is distributed across core audio plus W1/W2/W3 and boss/UX layers. Pause may suspend/resume environment audio, but a visual-only renderer must not become an audio lifecycle owner accidentally.

Any future Pause consolidation must preserve both simulation freeze and correct audio resume behavior.

---

## 18. Store and leaderboard

The store is local-game economy UI. Coin totals must use the same visual identity as the rest of Feather Fury and must remain backed by the existing persistence contract.

The current leaderboard is local/demo behavior; there is no production global backend authority in this repository. Do not present it as globally synchronized or introduce network dependency merely to preserve current UI.

---

## 19. Version identities

Several version concepts coexist:

- package version around `2.2.0`;
- historical in-game version text around `2.2.x`;
- cache query versions such as `game.js?v=2.4.7`;
- runtime map `approved-runtime-v1.3`.

Do not assume these are the same semantic version. Future release work should define one product version and separate cache/runtime schema versions.

---

## 20. CI and deployment safety

### Repository integrity

`.github/workflows/repo-safety.yml` runs `scripts/runtime-integrity-check.js` and related checks.

The integrity gate must protect at minimum:

- existence of every active patch;
- no active/retired overlap;
- direct boot versions/order;
- required compatibility DOM;
- post-runtime UI stack order;
- Pause/HUD/Fever repair contracts;
- canonical documentation references;
- every executable active patch token represented in this specification.

### Live browser verification

`.github/workflows/live-runtime-verify.yml` runs Playwright at mobile viewport `390 × 844` on Chromium and WebKit.

Current smoke contract includes:

`load → runtime approved → menu ready → splash exits → menu visible → World/PLAY gap valid → store coin-balance style valid → PLAY → PLAYING → forced RTL HUD physical order → Fever visible → Pause opens → bird Y/velocity remain frozen → visible coin/score/Fever bridge reflects game state → resume`

A failure opens/updates the live deployment issue; recovery closes it.

### Still missing from full automated coverage

- complete W1 run, Crow King and Owl outro;
- complete W2 run, Ice Emperor and outro;
- complete W3 run/boss/outro;
- revive lifecycle;
- real store purchase/equip persistence;
- full language toggle lifecycle;
- endless mode;
- victory → next-world progression;
- cold start with old saves;
- offline/no-CDN boot;
- Capacitor/Android lifecycle/back button.

These should be added before major runtime consolidation.

---

## 21. Non-negotiable regression invariants

Unless a deliberate product change updates both tests and this spec:

1. Loading reaches 100% and exits; no 97% deadlock.
2. Runtime and menu readiness flags become true.
3. Logo, world card and PLAY fit the mobile viewport.
4. World card and PLAY retain readable vertical spacing.
5. PLAY reaches the intended story/gameplay state.
6. Coins remain physically left, score centered, Pause physically right even in Arabic RTL.
7. Pause freezes simulation; the bird must not fall/die while paused.
8. Resume continues from the same simulation state.
9. Visible run coins and score reflect live game state instead of remaining zero.
10. Fever is visible and reflects game state.
11. Store coin balance uses the approved game identity and layout.
12. W1 Cursed Woods/Crow King/Owl outro ownership is preserved.
13. W2 Runtime V10 behavior remains authoritative.
14. W3 cleaned runtime remains authoritative.
15. Retired patches do not silently return.
16. Existing persistence keys are not broken by unrelated work.
17. Chromium or WebKit critical runtime/UI errors fail deployment verification.
18. No new public runtime code dependency is introduced.

---

## 22. Known technical debt — priority

1. Materialize the historical transformed core locally; remove runtime CDN/XHR/eval dependency after equivalence testing.
2. Expand world-path tests before consolidating method wrappers.
3. Reduce wrapper depth and establish explicit final owners.
4. Consolidate overlapping CSS generations.
5. Unify version semantics.
6. Add full persistence/store/revive/language tests.
7. Complete Android/offline lifecycle verification.
8. Keep W4 explicitly locked until it has real production implementation.

---

## 23. Safe modernization roadmap

### Phase A — characterize and protect

Keep working behavior stable, fix visible bugs in their current owners, and add a regression test for each fixed contract.

### Phase B — local core

Generate a local stable core from the exact current transformed runtime, compare behavior, run browser/world tests, then remove the runtime remote code dependency.

### Phase C — consolidate gameplay owners

After tests exist, merge mature wrappers into explicit W1/W2/W3, character, Pause/HUD and end-screen owners.

### Phase D — consolidate UI/CSS

Define shared tokens in foundation and one final CSS/JS owner per surface. Retire superseded generations rather than stacking overrides forever.

### Phase E — mobile/private readiness

Require local production assets/code, offline cold start, persistence migration coverage, Capacitor build verification, audio lifecycle and Android back-button behavior.

---

## 24. Development protocol

For every production change:

1. Read this file and `RUNTIME_ACTIVE.md`.
2. Inspect current `game.js` active/retired map.
3. Identify the final owner(s) of the requested behavior.
4. Search all wrappers of any lifecycle method being touched.
5. Fetch the latest target file immediately before editing.
6. Make the smallest coherent change.
7. Separate unrelated visual/gameplay/audio/persistence changes.
8. Do not casually change boot order or compatibility DOM.
9. Update this spec when boot/runtime/UI ownership changes.
10. Update `RUNTIME_ACTIVE.md` when the snapshot changes.
11. Run repository integrity checks.
12. Deploy.
13. Run Chromium + WebKit live smoke.
14. Inspect the deployed runtime, not only repository source.

---

## 25. File-status taxonomy

Use these labels in future reviews:

- **ACTIVE CORE** — constructs the core runtime.
- **ACTIVE PATCH** — in the executable active patch chain.
- **ACTIVE UI** — directly or post-runtime loaded UI owner.
- **ACTIVE ASSET** — consumed by an active owner.
- **COMPATIBILITY** — required by historical core/bridges but not final visual owner.
- **RETIRED** — intentionally excluded from production runtime.
- **LAB/PREVIEW** — development-only artifact.
- **UNKNOWN** — not proven active or retired; never activate by assumption.

---

## 26. Decision log

### 2026-08-29 — Stable boot recovery

- Local `index.html` became the production document.
- `game.js` became the approved runtime orchestrator.
- UI boot was moved behind approved runtime readiness.
- the historical remote-core transformer remains temporary debt.

### 2026-08-29 — 97% splash deadlock

- menu readiness changed from painted visibility to layout readiness;
- WebKit menu prepaint was added before splash fade;
- `htmlTag` compatibility was restored;
- Pause was constrained inside the mobile viewport.

### 2026-08-30 — HUD/Pause repair

- `ui-runtime-fixes-v1.js/css` became the narrow post-runtime repair owner for final Pause simulation freeze, visible HUD coin/score/Fever bridging, physical RTL HUD ordering, Fever presentation, World/PLAY spacing and store coin-balance identity.
- live browser smoke was expanded to prove these contracts on Chromium and WebKit.

---

A code change that changes runtime/boot/UI ownership without updating this document is incomplete.
