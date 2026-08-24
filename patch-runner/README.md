# PatchRunner v1

PatchRunner is a small dependency-free browser patch loader designed for games and apps that need safe, ordered hotfixes without repeatedly rewriting a large runtime file.

## Design goals

- Generic: the core contains no FeatherFury-specific code.
- Deterministic: patches load sequentially in manifest order.
- Safe: critical and optional patches are treated differently.
- Recoverable: Safe Mode can boot only critical runtime patches.
- Debuggable: every patch exposes loading, loaded, skipped, or failed status.
- Reusable: each project owns only its manifest; the core can be copied unchanged.
- No eval, no external dependency, no telemetry.

## Patch manifest

```js
window.MY_APP_PATCH_PLAN = {
  appId: 'my-app',
  patches: [
    {
      id: 'runtime',
      src: 'app-runtime.js',
      critical: true,
      retries: 2,
      timeoutMs: 15000,
      verify: () => !!window.app,
      verifyTimeoutMs: 1500
    },
    {
      id: 'ui-fix-v1',
      src: 'patches/ui-fix-v1.js',
      dependsOn: ['runtime']
    }
  ]
};
```

Then call:

```js
PatchRunner.run(window.MY_APP_PATCH_PLAN);
```

## Runtime controls

- `?patchDebug=1` enables PatchRunner console logs.
- `?patchSafe=1` loads only patches marked `critical: true`.
- `?patchDisable=patch-a,patch-b` skips selected patches for that page load.
- `PatchRunner.setDisabled('my-app', ['patch-a'])` persists a kill switch in localStorage.
- `PatchRunner.clearDisabled('my-app')` clears the persisted kill switch.
- `PatchRunner.getRun('my-app')` returns the current status report.

## Patch fields

- `id` required unique patch name.
- `src` required script URL/path.
- `critical` stops the run if the patch cannot load.
- `dependsOn` requires listed patches to have loaded successfully first.
- `retries` number of retries after the first attempt.
- `retryDelayMs` delay between retries.
- `timeoutMs` load timeout.
- `settleMs` optional delay after successful load.
- `when(ctx)` optional condition.
- `verify(ctx)` optional health check.
- `verifyTimeoutMs` optional polling window for the health check.
- `attributes` optional script tag attributes such as integrity/crossorigin.

## Recommended workflow

Keep the real application/game runtime stable. Put risky fixes in small named patch files. Add each patch to the project manifest only after review. If a new patch causes trouble in production, disable only that patch using the query flag or persisted kill switch, then fix it separately. Do not use patches as a permanent substitute for cleaning up the base runtime; periodically consolidate proven patches into a new stable release.

## FeatherFury LAB

FeatherFury uses `featherfury-patches.js` as its project manifest. The previous deeply nested loader chain has been replaced by PatchRunner while preserving the same patch order. If PatchRunner itself cannot start, `game.js` falls back to the pinned stable LAB runtime so the game can still boot.
