(() => {
  'use strict';

  const plan = {
    appId: 'featherfury-lab',
    entries: [
      {
        id: 'stable-runtime',
        kind: 'core',
        critical: true,
        src: 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@5b83840d68ad65939b8efae336afd76c47b7bdc1/game.js',
        timeout: 16000,
        readyTimeout: 4000,
        ready: () => !!window.game
      },
      { id: 'ruins-pillars-v3', src: 'ruins-pillars-v3.js?v=1', dependsOn: ['stable-runtime'] },
      { id: 'cursed-woods-v1', src: 'cursed-woods-v1.js?v=2', dependsOn: ['stable-runtime'] },
      {
        id: 'cursed-crows-v1',
        src: 'cursed-crows-v1.js?v=1',
        dependsOn: ['stable-runtime'],
        ready: () => !!window.game?.__cursedCrowArtV2Installed
      },
      {
        id: 'boss-crowking-v1',
        src: 'boss-crowking-v1.js?v=1',
        dependsOn: ['stable-runtime'],
        ready: () => !!window.game?.__crowKingVisualV2Installed
      },
      {
        id: 'boss-fight-core-v1',
        src: 'boss-fight-core-v1.js?v=1',
        dependsOn: ['stable-runtime'],
        readyTimeout: 3500,
        ready: () => !!window.game?.__bossFightCoreV1Installed
      },
      {
        id: 'w1-fixes-batch-v1',
        src: 'w1-fixes-batch-v1.js?v=1',
        dependsOn: ['stable-runtime'],
        ready: () => !!window.game?.__w1FixesBatchV1Installed
      },
      {
        id: 'boss-audio-fix-v2',
        src: 'boss-audio-fix-v2.js?v=2',
        dependsOn: ['stable-runtime'],
        ready: () => !!window.game?.__bossAudioFixV2Installed
      },
      {
        id: 'w1-final-audio-v1',
        src: 'w1-final-audio-v1.js?v=1',
        dependsOn: ['stable-runtime'],
        ready: () => !!window.game?.__w1FinalAudioV1Installed
      },
      {
        id: 'w1-final-gameplay-v1',
        src: 'w1-final-gameplay-v1.js?v=1',
        dependsOn: ['stable-runtime'],
        ready: () => !!window.game?.__w1FinalGameplayV1Installed
      },
      {
        id: 'w1-final-story-v1',
        src: 'w1-final-story-v1.js?v=1',
        dependsOn: ['stable-runtime'],
        ready: () => !!window.game?.__w1FinalStoryV1Installed
      }
    ],
    onCriticalError: async () => {
      if (typeof window.__FF_START_LEGACY_PATCH_CHAIN__ === 'function') {
        console.warn('[FeatherFury] Patch Runner critical failure; starting legacy loader fallback.');
        window.__FF_START_LEGACY_PATCH_CHAIN__();
      }
    }
  };

  window.FEATHERFURY_PATCH_PLAN = plan;

  if (!window.PatchRunner) {
    console.error('[FeatherFury] PatchRunner is not available.');
    window.__FF_START_LEGACY_PATCH_CHAIN__?.();
    return;
  }

  window.PatchRunner.run(plan).catch(error => {
    console.error('[FeatherFury] Patch Runner boot failed.', error);
  });
})();
