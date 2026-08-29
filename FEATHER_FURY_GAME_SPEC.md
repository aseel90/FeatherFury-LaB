# Feather Fury — Canonical Game Specification & Runtime Contract

> **Status:** CANONICAL TECHNICAL SOURCE OF TRUTH  
> **Baseline:** `main` @ `64e98d46771f1d257ea2899244d55477a5d98194`  
> **Live gate:** GitHub live verification issue `#97` closed as completed after the August 29 stabilization.  
> **Purpose:** prevent runtime ownership conflicts, accidental rollback, duplicate patches, and reintroduction of retired systems.

## 1. Authority and document hierarchy

When documents or old filenames disagree, use this priority:

1. **Actual boot loader + CI gates:** `index.html`, `game.js`, `ui-runtime-boot-v1.js`, `scripts/runtime-integrity-check.js`, `scripts/live-smoke.mjs`.
2. **This document:** `FEATHER_FURY_GAME_SPEC.md` — canonical technical/runtime architecture and contracts.
3. **`RUNTIME_ACTIVE.md`** — concise active-owner snapshot.
4. **`DEVELOPMENT_RULES.md`** — mandatory change/rollback/safety process.
5. **`GAME_PLAN.md`** — design intent, approved visual/gameplay direction and historical planning. It must not be used to infer current runtime file ownership when it conflicts with items 1–4.
6. **`README.md`** — overview only; not a runtime authority.

**Rule:** a file existing in the repository does not make it active. Only files loaded by the current boot chain are runtime owners.

---

## 2. Current product status

Feather Fury is a portrait, Canvas 2D arcade adventure with story progression, boss fights, character/skin selection, abilities, coins, Fever mode, revive, settings, local progress and an endless mode.

Current playable progression:

| Canonical world ID | Legacy index | Current identity | Boss | Guardian/reward | Progression |
|---|---:|---|---|---|---|
| `W1` | `0` | **Cursed Woods** (legacy core still contains “Ruins” naming) | Crow King | Owl Guardian | unlocks W2 |
| `W2` | `1` | **Frostbite Peaks** | Ice Emperor / Penguin legacy naming | Mountain Eagle | unlocks W3 |
| `W3` | `2` | **Storm Spire** | Lord Voltbat / Thunderbird legacy naming | Phoenix Guardian | marks W3 complete |
| `W4` | `3` | **Volcanic Valley** | not implemented | not implemented | coming soon |
| `ENDLESS` | — | Endless mode | no canonical campaign completion | — | separate run mode |

### Naming rule

Use canonical IDs (`W1`, `W2`, `W3`, `W4`) in new technical work. Do **not** rely on old display names such as `Ruins`, `Penguin`, or `Thunderbird` to identify a subsystem. Legacy names may remain inside old core code until consolidation.

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
9. `ui-end-screens-v1.css?v=2`
10. `ui-settings-leaderboard-v1.css?v=1`
11. `ui-splash-approved-v3.css?v=1`

Direct JavaScript order:

1. `js/config.js?v=2.3.4`
2. `js/audio.js?v=2.3.2`
3. `js/graphics.js?v=2.3.2`
4. `js/world1.js?v=2.3.2`
5. `js/world2.js?v=2.3.2`
6. `js/world3.js?v=2.3.2`
7. `ui-splash-approved-v3.js?v=12`
8. `game.js?v=2.4.7`
9. `ui-runtime-boot-v1.js?v=6`

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

## 4. Active gameplay patch order — DO NOT REORDER CASUALLY

The order below is executable behavior. A later patch may wrap or replace a method created by an earlier patch.

### Core + primary active patches

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

### Dynamically appended active owners

54. `w2-emperor-png-v5.js?v=7`
55. `w2-outro-eagle-skin-v3.js?v=4`
56. `w2-dialogue-ground-fix-v1.js?v=2`
57. `w3-voltbat-png-v1.js?v=3`
58. `w3-boss-tuning-v2.js?v=3`
59. `w3-enemy-png-v1.js?v=4`
60. `w3-environment-png-v1.js?v=5`

### Retired — must not return to active boot

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

Then it refreshes carousel/preview/store and validates the main menu contract before setting `__FF_MENU_UI_READY__`.

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

From `js/config.js`:

- canvas: `360 × 640`
- gravity: `0.26`
- jump force: `-5.8`
- max velocity: `8.0`
- normal speed: `2.0`
- Fever speed: `6.0`
- normal spawn interval: `125`
- Fever spawn interval: `45`
- baseline gap: `154`
- ground height: `95`
- bird radius: `14`
- Fever max: `100`
- Fever per coin: `25`
- Fever duration: `300`
- stage thresholds: `15`, `35`
- W1 boss HP baseline: `5`
- revive cost: `1` coin
- W2 boss HP baseline: `8`, gap `146`, speed `2.2`
- W3 boss HP baseline: `9`, gap `142`, speed `2.4`

Any tuning change must name the world/subsystem it owns. Do not change shared constants to fix a single world unless the effect on all worlds is explicitly intended.

### Game-level state flow

Canonical high-level flow:

```text
MENU
  → STORY
  → LAUNCH
  → PLAYING
  → boss warning/introduction
  → boss combat
  → boss outro / guardian dialogue
  → FLY_AWAY / victory
  → GAMEOVER or next world
```

World/boss patches contain additional internal substates. Treat them as subsystem implementation details unless promoted into this document.

### Campaign progression

- W1 completion persists and unlocks W2.
- W2 completion persists and unlocks W3.
- W3 completion persists.
- W4 remains coming soon.
- star scoring is historically tied to stage thresholds (`15`, `35`) and completion.

---

## 7. Persistence schema

Current stable localStorage keys inherited by the active core:

- `fh_active_skin`
- `fh_highscore`
- `fh_highscore_w2`
- `fh_highscore_w3`
- `fh_lang`
- `fh_total_coins`
- `fh_unlocked_skins`
- `fh_w1_completed`
- `fh_w2_completed`
- `fh_w3_completed`

**Persistence rule:** do not rename or clear these keys during unrelated work. Any schema migration must be explicit, backward-compatible where possible, and covered by a migration test.

---

## 8. Character and ability ownership

Legacy core skin IDs currently include:

- `classic`
- `pigeon`
- `falcon`
- `phoenix`
- `cyber`
- `ghost`
- `king`
- `eagle`

Current character stack ownership:

- visual/legacy character layers: `hero-blue-ninja-v1.js`, `hero-static-smooth-v2.js`, `hero-blue-effects-v1.js`, `fierce-falcon-v1.js`, `skin-routing-hardfix-v2.js`
- roster authority: `character-roster-v1.js`
- gameplay abilities: `character-abilities-v2.js`
- stability: `mountain-eagle-stability-v3.js`
- ability UI: `character-ability-ui-v1.js`
- ability VFX: `character-ability-fx-v1.js`

**Rule:** new character work must extend the roster/ability contract; do not create a separate parallel character router.

---

## 9. World ownership map

### W1 — Cursed Woods

> **Legacy naming warning:** `js/world1.js` is not a pure W1 module. The inherited core file contains shared boss activation/update logic for multiple campaign worlds. Do not move or delete it based on its filename alone. The same caution applies to old world/boss names inside the historical core.

Final runtime owners:

- background: `world1-cursed-woods-background-v3.js` + `world1-final-art-lock-v1.js`
- obstacle art/collision approach: `world1-cursed-obstacles-v5.js`
- obstacle source assets: `world1-cursed-obstacle-asset-top-a.js`, `world1-cursed-obstacle-asset-bottom-a.js`
- ground: `world1-ground-obstacle-polish-v2.js`
- boss art: `crow-king-ingame-v4.js`
- minions: `crow-minions-ingame-v3.js`
- contrast/readability: `world1-crow-contrast-v1.js`
- Owl: `owl-guardian-v2.js`
- final outro/dialogue layering: `world1-owl-dialogue-layer-fix-v3.js`

Do not restore `world1-classic-enhanced-background-v1.js`, `ruins-pillars-v3.js`, or `world1-ground-gap-polish-v1.js` into runtime.

### W2 — Frostbite Peaks

- environment assets: `w2-environment-assets-v1.js`
- visuals: `w2-visuals-v1.js`
- gameplay: `w2-gameplay-v1.js`
- ice/ground/skeleton visual layer: `w2-ice-ground-skeletons-v1.js`
- boss behavior authority: `w2-boss-runtime-v10.js`
- boss support layers: `w2-boss-polish-v2.js`, `w2-boss-orb-v7.js`
- final boss art: `w2-emperor-png-v5.js`
- final dialogue/ground integration: `w2-dialogue-ground-fix-v1.js`
- outro Eagle skin: `w2-outro-eagle-skin-v3.js`
- audio: `w2-audio-v1.js`

Old V5/V6/V8/V9 boss compatibility/tuning files are retired.

### W3 — Storm Spire

- foundation: `w3-foundation-v1.js`
- world visuals: `w3-world-polish-v1.js`
- boss foundation: `w3-boss-v1.js`
- final polish/balance: `w3-final-polish-v1.js`, `w3-balance-visual-v2.js`, `w3-final-balance-v4.js`
- critical fixes: `w3-critical-fix-v6.js`
- final cleanup owner: `w3-runtime-cleanup-v1.js`
- boss tuning: `w3-boss-tuning-v2.js`
- final boss art: `w3-voltbat-png-v1.js`
- final enemy art: `w3-enemy-png-v1.js`
- final environment art: `w3-environment-png-v1.js`
- challenge audio: `w3-challenge-audio-v3.js`

---

## 10. Asset map

### UI

- `assets/ui/loading-hq/` — approved loading background/heroes/logo. Optimized background WebP exists alongside source PNG.
- `assets/ui/world-thumbnails/world-1.webp` … `world-4.webp`
- `assets/ui/icons/` — vector UI icons including pause, settings, shop, trophy, coin, stars, sound and navigation.

### W2

- `assets/world2/ice-emperor/` — state SVGs plus split PNG-sheet base64 parts.

### W3

- `assets/world3/voltbat/` — split boss PNG-sheet base64 parts.
- `assets/world3/enemies/` — split enemy PNG-sheet base64 parts.

### Asset-pipeline rule

The repository currently mixes ordinary image files, SVG, JS-embedded artwork and split `.b64` assets. Do not invent a fifth asset path. A future consolidation should standardize this, but until then each existing world keeps its approved pipeline unless a planned migration is approved.

---

## 11. UI and DOM ownership

Primary screens:

- `#startScreen` — main menu/world selection
- `#gameHud` — in-run HUD
- `#gameOverScreen` — death/victory/actions
- `#settingsScreen`
- `#shopScreen`
- `#leaderboardScreen`
- `#gameToast`

Legacy compatibility hooks are intentionally retained under `#ffCoreDomCompat`; removing them may break inherited core bindings even though they are hidden.

### Current UI debt

- `ui-main-menu-v2.css` and `ui-main-menu-v3.css` are both loaded, while only V3 JS is active.
- baseline `style.css`, `lab-ui.css` and specialized UI CSS share selectors such as `#startScreen`, `.world-card`, `.worlds-carousel`, `.arcade-btn`, settings/shop/leaderboard structures.
- this multi-generation cascade is a regression risk.
- `index.html` still contains emoji for leaderboard/shop/settings despite SVG icons existing and the production UI rule banning emoji icons.

**Rule:** new UI work must identify one final visual owner. Do not add another global selector layer to “win” the cascade.

---

## 12. The biggest current regression risk: wrapper depth

The runtime grew through patch wrapping. Many active files reassign the same methods. This means load order is behavior.

High-risk methods currently have approximately these active wrapper depths:

- `update` — **22** layers
- `gameOver` — **12** layers
- `draw` — **11** layers
- `activateBoss` — **10** layers
- `reset` — **10** layers
- `drawRuinsBackground` — **5** layers
- `launchDash` — **5** layers
- `updateBoss` — **5** layers
- `drawPenguinBossSprite` — **3** layers
- `enterStoryState` — **3** layers
- `updateCarousel` — **3** layers
- `updatePenguinBoss` — **3** layers

This is a maintenance smell, not a reason to rewrite everything immediately.

### High-risk wrapper chains (load order)

These chains explain many “fix one thing, break another” regressions. The rightmost/later owner executes around or instead of earlier behavior depending on its wrapper implementation.

**`update` (22 layers):**

```text
w1-fixes-batch-v1
→ boss-audio-fix-v2
→ w1-final-gameplay-v1
→ w2-gameplay-v1
→ w2-boss-polish-v2
→ w2-boss-orb-v7
→ w2-boss-runtime-v10
→ w3-foundation-v1
→ w3-world-polish-v1
→ w3-boss-v1
→ w3-final-polish-v1
→ w3-balance-visual-v2
→ w3-runtime-cleanup-v1
→ character-roster-v1
→ character-abilities-v2
→ mountain-eagle-stability-v3
→ character-ability-fx-v1
→ world1-qa-fix-v2
→ world1-cursed-obstacles-v5
→ world1-ground-obstacle-polish-v2
→ world1-owl-dialogue-layer-fix-v3
→ w3-boss-tuning-v2
```

**`gameOver` (12 layers):**

```text
w1-fixes-batch-v1
→ w1-final-gameplay-v1
→ world1-final-polish-v1
→ w2-gameplay-v1
→ revive-core-fix-v1
→ victory-screen-fix-v1
→ w3-foundation-v1
→ character-abilities-v2
→ character-ability-fx-v1
→ world1-qa-fix-v2
→ world1-owl-dialogue-layer-fix-v3
→ ui-end-screens-v1
```

**`draw` (11 layers):**

```text
boss-fight-core-v1
→ w1-fixes-batch-v1
→ w2-ice-ground-skeletons-v1
→ w2-boss-orb-v7
→ w3-boss-v1
→ w3-balance-visual-v2
→ w3-runtime-cleanup-v1
→ world1-final-art-lock-v1
→ world1-ground-obstacle-polish-v2
→ world1-owl-dialogue-layer-fix-v3
→ w2-dialogue-ground-fix-v1
```

**`activateBoss` (10 layers):**

```text
boss-fight-core-v1
→ w1-final-audio-v1
→ w2-gameplay-v1
→ w2-boss-polish-v2
→ w2-boss-orb-v7
→ w2-boss-runtime-v10
→ w3-boss-v1
→ w3-final-polish-v1
→ w3-runtime-cleanup-v1
→ w3-boss-tuning-v2
```

**`reset` (10 layers):**

```text
victory-screen-fix-v1
→ w3-foundation-v1
→ w3-world-polish-v1
→ w3-runtime-cleanup-v1
→ character-roster-v1
→ character-abilities-v2
→ world1-phase2-owl-dialogue-v3
→ world1-owl-dialogue-layer-fix-v3
→ w3-boss-tuning-v2
→ ui-end-screens-v1
```

Other repeated owners worth checking before edits: `drawRuinsBackground`, `launchDash`, `updateBoss`, `updatePenguinBoss`, `updateCarousel`, `drawPenguinBossSprite`, `birdJump`, `renderShop`, and `updateCoinDisplays`.

### Mandatory rule for future development

**Do not add another wrapper to `update`, `draw`, `gameOver`, `reset` or `activateBoss` for a new feature unless the task explicitly documents why no existing owner can absorb the change.**

Prefer:

1. editing the current subsystem owner on an isolated branch;
2. adding a narrowly named helper that is called by that owner;
3. planned consolidation after behavior tests exist.

Never copy a whole older method implementation into a new patch to fix one line.

---

## 13. Audio ownership

Base audio lives in `js/audio.js` and is augmented by world/boss patches such as:

- `boss-audio-fix-v2.js`
- `w1-final-audio-v1.js`
- `w2-audio-v1.js`
- `w3-challenge-audio-v3.js`

Audio changes must respect browser/mobile gesture restrictions and future Android lifecycle behavior. Do not make audio initialization a boot-critical dependency unless necessary.

---

## 14. Leaderboard status

The inherited core leaderboard is **local/demo behavior**, not a real global backend. It mixes the player score with generated dummy entries.

Therefore:

- do not describe it technically as a production “live global ranking” system;
- a real leaderboard requires an explicit backend/auth/abuse-resistance design;
- UI wording may be polished separately, but architecture must not assume a server exists.

---

## 15. Version identity debt

Several version identities coexist:

- `package.json`: `2.2.0`
- I18N display label: `2.2.6`
- `game.js` URL: `v=2.4.7`
- runtime map: `approved-runtime-v1.3`

These currently mean different things, but the distinction is undocumented. Future release work should define one product version and separate cache/runtime schema versions explicitly.

**Until then:** never infer release compatibility from a single `?v=` query string.

---

## 16. CI / deployment safety net

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
→ HUD layout
→ Pause open/resume
```

Failures are bridged to the live-deployment issue and success closes it.

### What CI does NOT yet prove

Current smoke does not fully test:

- W1 complete run + Crow King + Owl outro;
- W2 complete run + Ice Emperor + Eagle outro;
- W3 complete run + Voltbat + final outro;
- revive lifecycle;
- store purchase/equip persistence;
- settings persistence/language switching;
- endless mode;
- victory → next-world progression;
- cold start with existing old save data;
- offline/no-CDN boot;
- Capacitor/Android lifecycle and back-button behavior.

These are the next regression tests to add before architectural consolidation.

---

## 17. Known technical debt — priority order

### P0 — architectural

1. **Remote synchronous historical core loader.** Materialize the transformed core locally and remove runtime CDN/XHR/eval dependency after equivalence testing.
2. **Patch-wrapper depth.** The same lifecycle methods have many wrappers; create behavior tests before consolidation.
3. **Documentation drift.** Older `GAME_PLAN.md` runtime file ownership is stale in places (for example it can name retired W1/W2 owners). Runtime facts must defer to this document/current loader.

### P1 — regression/maintainability

4. Multiple CSS generations own the same screens/selectors.
5. Cache query versions are manual; changing a JS/CSS file without bumping its URL can serve stale code.
6. Asset pipelines are mixed (normal files, JS embedding, split base64).
7. World naming is inconsistent between legacy core and current approved art.
8. Version numbers are not unified.
9. External Google Fonts are another online dependency for presentation.

### P2 — product completeness

10. Leaderboard is local/demo, not global.
11. W4 is a placeholder/coming soon.
12. Android/Capacitor package configuration still carries legacy product naming (`Feather Hero`) and needs a final release pass.

---

## 18. Planned consolidation path — preserve behavior first

### Phase A — documentation and gates (NOW)

- keep this document current;
- treat current main as a known-good baseline;
- no gameplay rewrite;
- add targeted regression tests when fixing each remaining visible bug.

### Phase B — localize core

- update/fix `scripts/materialize-core.js` (it currently contains stale version replacements);
- generate a local `game-core-stable-v1.js` from the exact transformed runtime;
- verify byte/behavior equivalence;
- run Chromium + WebKit + world-path tests;
- switch `CORE_RUNTIME` only after green verification;
- retire the remote transformer.

### Phase C — consolidate patch wrappers by subsystem

After tests exist, combine mature wrappers into explicit owners:

- core movement/run lifecycle;
- W1;
- W2;
- W3;
- characters/abilities;
- UI/pause/end screens.

Consolidation must be behavior-preserving; no redesign during migration.

### Phase D — consolidate CSS ownership

- one base/foundation layer;
- one final stylesheet per screen/system;
- remove old major-version CSS from `index.html` once verified;
- preserve responsive/Safari/Android safe-area behavior.

### Phase E — Android/offline hardening

- no runtime CDN code dependency;
- local fonts/assets where required;
- final Capacitor/AAB settings;
- lifecycle/audio/back-button tests;
- safe-area and multiple device-size checks.

---

## 19. “Never regress” invariants

Every future change must preserve all unrelated items below:

1. Loading completes; no 97% deadlock.
2. `window.__FF_RUNTIME_APPROVED_STACK__` becomes true.
3. `window.__FF_MENU_UI_READY__` becomes true.
4. Main menu logo/world card/PLAY are visible and usable on mobile WebKit and Chromium.
5. PLAY leaves MENU and reaches PLAYING.
6. Pause button remains inside viewport and opens/resumes correctly.
7. W1 approved Cursed Woods art, obstacles, ground, Crow King and Owl outro are not replaced by retired owners.
8. W2 uses Runtime V10 behavior and PNG V5 boss art; retired V5/V6/V8/V9 stack does not return.
9. W3 final cleanup + PNG enemy/boss/environment owners remain active.
10. Existing localStorage progress keys are preserved.
11. A visual-only task does not change physics/gameplay.
12. A world-specific bug does not alter shared/global behavior unless explicitly intended.
13. No protected file is replaced from a stale local copy.
14. No active file is silently changed without a cache-bust/version strategy.
15. No new runtime dependency on a public external repository/CDN is introduced.

---

## 20. Mandatory change protocol

For every future task:

### Before editing

1. Record current good `main` SHA.
2. Read this document and `DEVELOPMENT_RULES.md`.
3. Identify the subsystem owner.
4. Check whether the target filename is active or retired in `game.js`.
5. Fetch the latest target file from GitHub immediately before editing.
6. Create one dedicated branch for one problem unless the change is documentation-only.

### During editing

7. Make the smallest owner-local change.
8. Do not add unrelated cleanup.
9. Do not add a new wrapper to high-risk lifecycle methods without justification.
10. If JS/CSS behavior changes, bump its loaded cache version or otherwise guarantee fresh delivery.

### Before merge

11. Run JS syntax checks.
12. Run runtime integrity check.
13. Inspect changed-file list and diff.
14. Confirm protected files did not shrink unexpectedly.
15. Run live Chromium + WebKit smoke.
16. Run the subsystem-specific regression path being changed.
17. Merge only when green; retain rollback SHA.

### After merge

18. Verify deployed Pages build, not only repository source.
19. If active ownership/order changed, update this document in the same change.
20. If a file is retired/replaced, add it to the retired list/gate so it cannot silently return.

---

## 21. Rules for AI-assisted development

Any assistant/agent working on Feather Fury must:

- inspect the current GitHub `main`, not rely on remembered filenames;
- treat this document as the architecture map;
- never assume “higher version number” means active owner;
- never reactivate a retired patch to recover an old visual;
- never replace a working subsystem with Canvas/DOM/SVG/PNG/WebGL experimentation without explicit approval;
- report the exact files and runtime owners it intends to touch before a broad change;
- use the live verification workflow as evidence, not visual guessing;
- stop and isolate a regression instead of stacking another emergency patch over it.

---

## 22. Document maintenance contract

Update this file whenever any of these change:

- boot script order;
- active/retired patch list;
- world/boss/character owner;
- persistence key/schema;
- game-state transition contract;
- cache/version strategy;
- CI smoke coverage;
- core localization/consolidation status.

A code change that changes runtime ownership without updating this document is incomplete.
