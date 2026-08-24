(() => {
  'use strict';
  window.__FF_PATCH_BOOTING__ = true;
  const bootGate = e => {
    if (!window.__FF_PATCH_BOOTING__) return;
    if (e && e.cancelable) e.preventDefault();
    e?.stopImmediatePropagation?.();
  };
  document.addEventListener('pointerdown', bootGate, true);
  document.addEventListener('click', bootGate, true);
  document.addEventListener('keydown', bootGate, true);
  document.addEventListener('touchstart', bootGate, { capture: true, passive: false });
  const releaseBootGate = () => {
    window.__FF_PATCH_BOOTING__ = false;
    document.removeEventListener('pointerdown', bootGate, true);
    document.removeEventListener('click', bootGate, true);
    document.removeEventListener('keydown', bootGate, true);
    document.removeEventListener('touchstart', bootGate, true);
  };
  const plan = {
    appId: 'featherfury-lab',
    entries: [
      { id:'stable-runtime',kind:'core',critical:true,src:'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@5b83840d68ad65939b8efae336afd76c47b7bdc1/game.js',timeout:16000,readyTimeout:4000,ready:()=>!!window.game },
      { id:'ruins-pillars-v3',src:'ruins-pillars-v3.js?v=1',dependsOn:['stable-runtime'] },
      { id:'cursed-woods-v1',src:'cursed-woods-v1.js?v=2',dependsOn:['stable-runtime'] },
      { id:'cursed-crows-v1',src:'cursed-crows-v1.js?v=1',dependsOn:['stable-runtime'],ready:()=>!!window.game?.__cursedCrowArtV2Installed },
      { id:'boss-crowking-v1',src:'boss-crowking-v1.js?v=1',dependsOn:['stable-runtime'],ready:()=>!!window.game?.__crowKingVisualV2Installed },
      { id:'boss-fight-core-v1',src:'boss-fight-core-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:3500,ready:()=>!!window.game?.__bossFightCoreV1Installed },
      { id:'w1-fixes-batch-v1',src:'w1-fixes-batch-v1.js?v=1',dependsOn:['stable-runtime'],ready:()=>!!window.game?.__w1FixesBatchV1Installed },
      { id:'boss-audio-fix-v2',src:'boss-audio-fix-v2.js?v=2',dependsOn:['stable-runtime'],ready:()=>!!window.game?.__bossAudioFixV2Installed },
      { id:'w1-final-audio-v1',src:'w1-final-audio-v1.js?v=1',dependsOn:['stable-runtime'],ready:()=>!!window.game?.__w1FinalAudioV1Installed },
      { id:'w1-final-gameplay-v1',src:'w1-final-gameplay-v1.js?v=1',dependsOn:['stable-runtime'],ready:()=>!!window.game?.__w1FinalGameplayV1Installed },
      { id:'w1-final-story-v1',src:'w1-final-story-v1.js?v=1',dependsOn:['stable-runtime'],ready:()=>!!window.game?.__w1FinalStoryV1Installed },
      { id:'core-gameplay-ux-v1',src:'core-gameplay-ux-v1.js?v=3',dependsOn:['stable-runtime'],readyTimeout:3500,ready:()=>!!window.game?.__coreGameplayUxV1Installed },
      { id:'pause-hud-polish-v2',src:'pause-hud-polish-v2.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__pauseHudPolishV2Installed },
      { id:'world1-final-polish-v1',src:'world1-final-polish-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__world1FinalPolishV1Installed },
      { id:'w2-audio-v1',src:'w2-audio-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__w2AudioV1Installed },
      { id:'w2-visuals-v1',src:'w2-visuals-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:3000,ready:()=>!!window.game?.__w2VisualsV1Installed },
      { id:'w2-gameplay-v1',src:'w2-gameplay-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:3000,ready:()=>!!window.game?.__w2GameplayV1Installed },
      { id:'revive-core-fix-v1',src:'revive-core-fix-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__reviveCoreFixV1Installed },
      { id:'w2-boss-polish-v2',src:'w2-boss-polish-v2.js?v=1',dependsOn:['w2-audio-v1','w2-visuals-v1','w2-gameplay-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w2BossPolishV2Installed },
      { id:'w2-boss-orb-v6',src:'w2-boss-orb-v6.js?v=1',dependsOn:['w2-boss-polish-v2'],readyTimeout:3500,ready:()=>!!window.game?.__w2BossOrbV6Installed },
      { id:'w2-boss-combat-v6',src:'w2-boss-combat-v6.js?v=1',dependsOn:['w2-boss-orb-v6'],readyTimeout:3500,ready:()=>!!window.game?.__w2BossCombatV6Installed },
      { id:'victory-screen-fix-v1',src:'victory-screen-fix-v1.js?v=1',dependsOn:['w2-boss-combat-v6','revive-core-fix-v1'],readyTimeout:2500,ready:()=>!!window.game?.__victoryScreenFixV1Installed },
      { id:'w3-foundation-v1',src:'w3-foundation-v1.js?v=1',dependsOn:['victory-screen-fix-v1'],readyTimeout:3000,ready:()=>!!window.game?.__w3FoundationV1Installed },
      { id:'w3-world-polish-v1',src:'w3-world-polish-v1.js?v=1',dependsOn:['w3-foundation-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w3WorldPolishV1Installed },
      { id:'w3-boss-v1',src:'w3-boss-v1.js?v=1',dependsOn:['w3-world-polish-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w3BossV1Installed },
      { id:'w3-final-polish-v1',src:'w3-final-polish-v1.js?v=1',dependsOn:['w3-boss-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w3FinalPolishV1Installed },
      { id:'w3-balance-visual-v2',src:'w3-balance-visual-v2.js?v=1',dependsOn:['w3-final-polish-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w3BalanceVisualV2Installed },
      { id:'w3-challenge-audio-v3',src:'w3-challenge-audio-v3.js?v=1',dependsOn:['w3-balance-visual-v2'],readyTimeout:3500,ready:()=>!!window.game?.__w3ChallengeAudioV3Installed },
      { id:'w3-final-balance-v4',src:'w3-final-balance-v4.js?v=1',dependsOn:['w3-challenge-audio-v3'],readyTimeout:4000,ready:()=>!!window.game?.__w3FinalBalanceV4Installed }
    ],
    onCriticalError: async () => { if (typeof window.__FF_START_LEGACY_PATCH_CHAIN__ === 'function') { console.warn('[FeatherFury] Patch Runner critical failure; starting legacy loader fallback.'); window.__FF_START_LEGACY_PATCH_CHAIN__(); } }
  };
  window.FEATHERFURY_PATCH_PLAN = plan;
  if (!window.PatchRunner) { console.error('[FeatherFury] PatchRunner is not available.'); window.__FF_START_LEGACY_PATCH_CHAIN__?.(); return; }
  window.PatchRunner.run(plan).then(()=>{releaseBootGate();}).catch(error=>{releaseBootGate();console.error('[FeatherFury] Patch Runner boot failed.',error);});
})();