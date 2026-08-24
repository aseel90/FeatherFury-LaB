(() => {
  'use strict';

  const runtimeUrl = 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@5b83840d68ad65939b8efae336afd76c47b7bdc1/game.js';

  window.FEATHERFURY_PATCH_PLAN = {
    appId: 'featherfury-lab',
    patches: [
      {
        id: 'runtime',
        src: runtimeUrl,
        critical: true,
        retries: 2,
        retryDelayMs: 600,
        timeoutMs: 15000,
        verify: () => !!window.game,
        verifyTimeoutMs: 1800
      },
      { id: 'ruins-pillars-v3', src: 'ruins-pillars-v3.js?v=1', dependsOn: ['runtime'] },
      { id: 'cursed-woods-v1', src: 'cursed-woods-v1.js?v=1', dependsOn: ['ruins-pillars-v3'] },
      { id: 'cursed-crows-v1', src: 'cursed-crows-v1.js?v=1', dependsOn: ['cursed-woods-v1'] },
      { id: 'boss-crowking-v1', src: 'boss-crowking-v1.js?v=1', dependsOn: ['cursed-crows-v1'] },
      { id: 'boss-fight-core-v1', src: 'boss-fight-core-v1.js?v=1', dependsOn: ['boss-crowking-v1'] },
      { id: 'w1-fixes-batch-v1', src: 'w1-fixes-batch-v1.js?v=1', dependsOn: ['boss-fight-core-v1'] },
      { id: 'boss-audio-fix-v2', src: 'boss-audio-fix-v2.js?v=2', dependsOn: ['w1-fixes-batch-v1'] },
      { id: 'w1-final-audio-v1', src: 'w1-final-audio-v1.js?v=1', dependsOn: ['boss-audio-fix-v2'] },
      { id: 'w1-final-gameplay-v1', src: 'w1-final-gameplay-v1.js?v=1', dependsOn: ['w1-final-audio-v1'] },
      { id: 'w1-final-story-v1', src: 'w1-final-story-v1.js?v=1', dependsOn: ['w1-final-gameplay-v1'] }
    ]
  };
})();
