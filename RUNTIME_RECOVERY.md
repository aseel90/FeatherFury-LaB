# FeatherFury LAB Runtime Recovery

Rollback checkpoint: `checkpoint/w2-v9-before-runtime-local-2026-08-25`

Protected source commit: `530858a2c12128dc70abf0e667d09f34296a63e4`

Stable runtime source commit: `5b83840d68ad65939b8efae336afd76c47b7bdc1`

Historical complete `game.js` Git blob: `43fd021b3e6ca6ffd0af9fc3a5953b8fcf263415`

Historical runtime size: `90312` bytes

Verified SHA-256: `ab7bc31cc53880dafc482ecd3974ac3a9123e5e2df8513d2903e18793c9b1d05`

The fetched historical runtime passes `node --check`.

Recovery rules:

1. Restore the exact complete runtime inside the LAB repository.
2. Remove the permanent pinned jsDelivr/GitHub runtime dependency only after the local copy exists.
3. Preserve Patch Runner ordering and all W1/W2/W3 patches from the protected source commit.
4. Do not reformat protected files.
5. Verify protected-file size and diff before merge.
6. Keep `main` untouched until smoke testing passes.
