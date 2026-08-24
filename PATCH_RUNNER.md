# Patch Runner v1

`patch-runner.js` is a small reusable patch orchestration layer for browser games and web applications.
It is intentionally framework-agnostic and can later be copied into another project without FeatherFury-specific code.

## Why it exists

Instead of nesting script `onload` callbacks or editing a large core file for every fix, the application keeps:

1. a small generic runner (`patch-runner.js`);
2. an app-specific manifest (`patch-manifest.js`);
3. isolated patch files.

The runner loads patches in dependency order, records their state, isolates optional failures, and stops only for critical failures.

## Patch definition

```js
{
  id: 'example-fix',
  kind: 'patch', // use 'core' for the base runtime
  src: 'example-fix.js?v=1',
  dependsOn: ['base-runtime'],
  critical: false,
  timeout: 12000,
  retries: 0,
  ready: () => !!window.app?.__exampleFixInstalled,
  readyTimeout: 2500,
  when: () => true,
  rollback: async (context, error) => {}
}
```

A patch may use `src`, an `install(context)` function, or both.

## Runtime controls

- `?patchDebug=1` — detailed Patch Runner console logs.
- `?patchSafe=1` — load core entries and only patches explicitly marked `safe: true`.
- `?patchSkip=id1,id2` — skip selected patches.
- `?patchOnly=id1,id2` — run only selected optional patches plus the core.
- `?legacyPatches=1` — FeatherFury emergency fallback to the previous loader chain.

Current state is available from:

```js
PatchRunner.status();
window.__PATCH_RUNNER__.status();
```

Persistent safe mode for the current app:

```js
PatchRunner.setSafeMode(true);
PatchRunner.setSafeMode(false);
```

## Rules for future apps and games

- Keep the runner generic. Never add app-specific gameplay/UI logic to `patch-runner.js`.
- Put project-specific ordering and checks in the manifest.
- Give every patch a unique stable `id` and version its file URL.
- A patch must be safe to load only once; ideally expose an `__...Installed` flag.
- Use `critical: true` only for code without which the app cannot boot.
- Prefer isolated patches over replacing large core files.
- Move a mature patch into the core during a planned consolidation instead of accumulating permanent overrides forever.
- Keep an emergency fallback during migrations, then remove it after the self-contained runtime is restored and verified.

## FeatherFury migration

For v1, the existing runtime URL and exact approved patch order are preserved. The only architectural change is the loader/orchestration layer. This lets the Lab validate Patch Runner without changing gameplay behavior.
