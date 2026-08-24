# Patch Runner

A dependency-free Node.js patch engine for making small, auditable source changes without uploading or rewriting whole files.

Designed for FeatherFury LAB first, but the tool itself is repository-agnostic and can be copied to future apps/games.

## Why it exists

Patch Runner is built to prevent the failures that are most dangerous in AI-assisted development:

- applying a patch to a stale version of a file;
- replacing the wrong occurrence of a code fragment;
- truncating or massively growing a protected file;
- writing some files before a later validation fails;
- losing the exact pre-patch content;
- silently introducing invalid JavaScript.

## Safety model

1. **Dry-run by default.** Nothing is written unless `--apply` is supplied.
2. **Exact-match operations.** Every edit has an expected match count (default `1`). Any mismatch aborts the whole plan.
3. **Optional SHA-256 lock.** `expectedSha256` can pin a patch to the exact file revision it was designed for.
4. **Path sandbox.** Absolute paths and `../` traversal are blocked.
5. **Size guard.** By default, a candidate file cannot shrink by more than 40% or grow by more than 400%.
6. **Pre-write validation.** All files and postconditions are validated before the first write.
7. **JS syntax check.** Set `"syntax": "js"` to run `node --check` against the candidate before writing.
8. **Backups + journal.** Applied runs are backed up under `.git/patch-runner/` when run inside a Git checkout.
9. **Safe rollback.** Rollback refuses to overwrite a file that changed after the patch was applied.
10. **Write-failure recovery.** If a multi-file write fails midway, files already written by that run are restored immediately.

## Usage

From the repository root:

```bash
# Preview only — no writes
node tools/patch-runner/patch-runner.mjs path/to/fix.patch.json

# Apply after the preview passes
node tools/patch-runner/patch-runner.mjs path/to/fix.patch.json --apply

# Roll back the latest Patch Runner change
node tools/patch-runner/patch-runner.mjs --rollback latest

# Target another project/repository
node tools/patch-runner/patch-runner.mjs patches/fix.patch.json --root ../another-project
```

Run the built-in test:

```bash
node tools/patch-runner/self-test.mjs
```

## Patch format

```json
{
  "version": 1,
  "id": "bird-flight-smoothing-v1",
  "description": "Small isolated gameplay adjustment",
  "safety": {
    "maxFileShrinkPercent": 20,
    "maxFileGrowthPercent": 100
  },
  "files": [
    {
      "path": "js/world1.js",
      "expectedSha256": "OPTIONAL_64_HEX_SHA256",
      "syntax": "js",
      "operations": [
        {
          "type": "replace",
          "find": "const oldValue = 4;",
          "replace": "const oldValue = 5;",
          "expected": 1
        }
      ],
      "postconditions": [
        {
          "contains": "const oldValue = 5;",
          "expected": 1
        },
        {
          "notContains": "const oldValue = 4;"
        }
      ]
    }
  ]
}
```

### Supported operations

- `replace`: replace an exact string.
- `insertAfter`: append content after an exact anchor.
- `insertBefore`: prepend content before an exact anchor.
- `delete`: remove an exact string.
- `assert`: verify exact content/count without changing it.

Every operation defaults to `"expected": 1`. Keep this explicit for protected/core files.

## Recommended workflow for FeatherFury

1. Create one branch per problem from the latest LAB `main`.
2. Read the latest target file from GitHub.
3. Build a patch manifest with exact anchors and, for protected files, `expectedSha256`.
4. Run Patch Runner without `--apply` first.
5. Review the size/hash summary.
6. Apply with `--apply` only after dry-run succeeds.
7. Run the game-specific checks/browser test.
8. Review the Git diff before merge.
9. Merge only after verification.

Patch Runner reduces edit risk; it does **not** replace Git branches, code review, or gameplay/browser testing.
