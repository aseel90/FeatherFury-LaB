# Feather Fury — Development Rules

> Canonical game/runtime architecture: `FEATHER_FURY_GAME_SPEC.md`. If this file and the runtime differ, stop and reconcile them before changing gameplay/UI ownership.

## 1. Golden rule

Do not fix a visible issue by reactivating an older patch, old world renderer, old boss implementation, or old splash generation.

File presence in the repository is not proof that a file is active.

Before editing behavior, check `game.js` and `FEATHER_FURY_GAME_SPEC.md`.

## 2. Branch/repository rule

Development and verification happen in `aseel90/FeatherFury-LaB`.

Do not promote LAB changes into the production repository unless explicitly approved.

## 3. Active runtime rule

`game.js` owns the approved runtime order.

Never:

- reorder `ACTIVE_PATCHES` casually;
- add a retired file to `ACTIVE_PATCHES` to restore an old behavior;
- remove a patch without identifying what later wrappers depend on it;
- change the historical core pin without full live regression testing.

## 4. Core rule

The current core is restored by `stable-runtime-w3-clean-v1.js` from a pinned historical commit.

This is a known architectural debt. Until the localization migration is complete, preserve the pin and transformation contract.

Do not assume the game can run offline merely because all visible assets are local.

## 5. Wrapped-method rule

Many runtime layers wrap shared methods such as `update`, `draw`, `reset`, `gameOver`, and `activateBoss`.

Before modifying one of these methods:

1. find every active wrapper;
2. identify the final owner;
3. prefer editing the final owner;
4. keep delegation to previous implementation unless replacement is deliberate;
5. add regression coverage for the behavior being changed.

Do not add another wrapper just to avoid understanding the current chain.

## 6. UI/DOM rule

The historical core requires compatibility IDs at constructor time.

Do not remove DOM elements such as `skinsGrid`, score/coin compatibility fields, or settings/shop/end-screen IDs just because modern UI visually replaces them.

If a modern screen needs different markup, preserve the core hook or create an explicit adapter.

## 7. Loading rule

Loading and menu readiness are separate contracts.

The approved splash intentionally hides the menu while runtime/UI initialize. Menu readiness must validate structure/geometry, not painted `visibility`, or it can recreate the 97% deadlock.

Do not change splash/menu readiness without running both Chromium and WebKit live checks.

## 8. HUD/Pause rule

Pause means simulation freeze.

A visible pause overlay is not sufficient. `game.__ffPaused` must stop the final wrapped `update()` chain.

Visible HUD data must reflect real game values, not only legacy hidden DOM values.

Fever is active gameplay and must not be retired as visual clutter.

## 9. World ownership

Use technical IDs W1/W2/W3/W4 when discussing runtime logic.

Display names can evolve; technical IDs should remain stable.

Do not reintroduce old W1 “Ruins” visual implementations over Cursed Woods ownership.

Do not reintroduce retired W2 V5/V6/V8/V9 boss layers over V10.

Do not reintroduce W3 critical V5 over V6/current cleanup.

## 10. Save compatibility

Local-storage keys are part of the player contract.

Do not rename or repurpose `fh_*` keys without migration logic.

Changes to character ownership, selected skin, world completion, or coin storage must be tested with pre-existing saves.

## 11. Cache/version rule

Cache query versions are not product versions.

When changing a browser-loaded JS/CSS file, bump its cache query only when required and update integrity tests in the same commit.

When reporting an issue, use the commit SHA as the primary identifier.

## 12. Testing rule

A change is not complete because it works in one browser.

For runtime/UI changes:

- repo-safety checks must pass;
- Chromium live smoke must pass;
- WebKit/iPhone live smoke must pass;
- the exact path changed should have a regression assertion whenever practical.

## 13. Documentation rule

Update `FEATHER_FURY_GAME_SPEC.md` in the same change whenever you change:

- runtime ownership;
- active/retired patch boundaries;
- boot order;
- DOM compatibility contract;
- save keys;
- major world/boss ownership;
- browser regression expectations.

## UI navigation ownership

The canonical navigation map is in `FEATHER_FURY_GAME_SPEC.md` under **UI Navigation Contract**. After UI boot, `window.__FF_UI_NAV__` / `ui-runtime-fixes-v1.js` is the final owner of cross-screen navigation.

Do not add new screen buttons that directly mix `classList.add/remove('active'/'hidden')` with `game.state` changes. Route multi-origin screens through the navigation contract so Back preserves origin (for example Pause -> Settings -> Back -> Pause and End -> Store -> Back -> End). Any intentional navigation change must update the canonical map and live regression test in the same change.
