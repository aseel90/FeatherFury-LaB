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
      { id:'w2-environment-assets-v1',src:'w2-environment-assets-v1.js?v=3',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.__FF_W2_ENV_ASSETS_V1_READY__ },
      { id:'w2-visuals-v1',src:'w2-visuals-v1.js?v=5',dependsOn:['w2-environment-assets-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w2VisualsV1Installed },
      { id:'w2-ice-ground-skeletons-v1',src:'w2-ice-ground-skeletons-v1.js?v=1',dependsOn:['w2-visuals-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w2IceGroundSkeletonsV1Installed },
      { id:'w2-gameplay-v1',src:'w2-gameplay-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:3000,ready:()=>!!window.game?.__w2GameplayV1Installed },
      { id:'revive-core-fix-v1',src:'revive-core-fix-v1.js?v=2',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__reviveCoreFixV1Installed },
      { id:'w2-emperor-art-v1',src:'w2-emperor-art-v1.js?v=1',dependsOn:['w2-visuals-v1'],readyTimeout:3000,ready:()=>!!window.game?.__w2EmperorArtV1Installed },
      { id:'w2-boss-polish-v2',src:'w2-boss-polish-v2.js?v=1',dependsOn:['w2-audio-v1','w2-emperor-art-v1','w2-gameplay-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w2BossPolishV2Installed },
      { id:'w2-boss-orb-v7',src:'w2-boss-orb-v7.js?v=1',dependsOn:['w2-boss-polish-v2'],readyTimeout:3500,ready:()=>!!window.game?.__w2BossOrbV7Installed },
      { id:'w2-boss-runtime-v10',src:'w2-boss-runtime-v10.js?v=1',dependsOn:['w2-boss-orb-v7','revive-core-fix-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w2BossRuntimeV10Installed },
      { id:'victory-screen-fix-v1',src:'victory-screen-fix-v1.js?v=1',dependsOn:['w2-boss-runtime-v10'],readyTimeout:2500,ready:()=>!!window.game?.__victoryScreenFixV1Installed },
      { id:'w3-foundation-v1',src:'w3-foundation-v1.js?v=1',dependsOn:['victory-screen-fix-v1'],readyTimeout:3000,ready:()=>!!window.game?.__w3FoundationV1Installed },
      { id:'w3-world-polish-v1',src:'w3-world-polish-v1.js?v=1',dependsOn:['w3-foundation-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w3WorldPolishV1Installed },
      { id:'w3-boss-v1',src:'w3-boss-v1.js?v=1',dependsOn:['w3-world-polish-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w3BossV1Installed },
      { id:'w3-final-polish-v1',src:'w3-final-polish-v1.js?v=1',dependsOn:['w3-boss-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w3FinalPolishV1Installed },
      { id:'w3-balance-visual-v2',src:'w3-balance-visual-v2.js?v=1',dependsOn:['w3-final-polish-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w3BalanceVisualV2Installed },
      { id:'w3-challenge-audio-v3',src:'w3-challenge-audio-v3.js?v=1',dependsOn:['w3-balance-visual-v2'],readyTimeout:3500,ready:()=>!!window.game?.__w3ChallengeAudioV3Installed },
      { id:'w3-final-balance-v4',src:'w3-final-balance-v4.js?v=1',dependsOn:['w3-challenge-audio-v3'],readyTimeout:4000,ready:()=>!!window.game?.__w3FinalBalanceV4Installed },
      { id:'w3-critical-fix-v6',src:'w3-critical-fix-v6.js?v=1',dependsOn:['w3-final-balance-v4'],readyTimeout:3000,ready:()=>!!window.game?.__w3CriticalFixV6Installed },
      { id:'hero-blue-ninja-v1',src:'hero-blue-ninja-v1.js?v=1',dependsOn:['w3-critical-fix-v6'],readyTimeout:2500,ready:()=>!!window.game?.__heroBlueNinjaV1Installed },
      { id:'hero-static-smooth-v2',src:'hero-static-smooth-v2.js?v=1',dependsOn:['hero-blue-ninja-v1'],readyTimeout:2500,ready:()=>!!window.game?.__heroStaticSmoothV2Installed },
      { id:'hero-blue-effects-v1-final',src:'hero-blue-effects-v1.js?v=3',dependsOn:['hero-static-smooth-v2'] },
      { id:'fierce-falcon-v1-final',src:'fierce-falcon-v1.js?v=3',dependsOn:['hero-blue-effects-v1-final'] },
      { id:'skin-routing-hardfix-v2-final',src:'skin-routing-hardfix-v2.js?v=2',dependsOn:['fierce-falcon-v1-final'] },
      { id:'character-roster-v1-final',src:'character-roster-v1.js?v=2',dependsOn:['skin-routing-hardfix-v2-final'] },
      { id:'character-abilities-v2-final',src:'character-abilities-v2.js?v=2',dependsOn:['character-roster-v1-final'] },
      { id:'mountain-eagle-stability-v3-final',src:'mountain-eagle-stability-v3.js?v=1',dependsOn:['character-abilities-v2-final'] },
      { id:'character-ability-ui-v1-final',src:'character-ability-ui-v1.js?v=1',dependsOn:['mountain-eagle-stability-v3-final'] },
      { id:'character-ability-fx-v1-final',src:'character-ability-fx-v1.js?v=1',dependsOn:['character-ability-ui-v1-final'] },
      { id:'world1-qa-fix-v2-final',src:'world1-qa-fix-v2.js?v=1',dependsOn:['character-ability-fx-v1-final'] },
      { id:'owl-guardian-v2-final',src:'owl-guardian-v2.js?v=2',dependsOn:['world1-qa-fix-v2-final'] },
      { id:'world1-phase2-owl-dialogue-v3-final',src:'world1-phase2-owl-dialogue-v3.js?v=2',dependsOn:['owl-guardian-v2-final'] },
      { id:'world1-owl-dialogue-layer-fix-v3-final',src:'world1-owl-dialogue-layer-fix-v3.js?v=1',dependsOn:['world1-phase2-owl-dialogue-v3-final'] },
      { id:'crow-king-ingame-v4-final',src:'crow-king-ingame-v4.js?v=1',dependsOn:['world1-owl-dialogue-layer-fix-v3-final'],ready:()=>!!window.game?.__ffCrowKingIngameV4Installed },
      { id:'crow-minions-ingame-v3-final',src:'crow-minions-ingame-v3.js?v=1',dependsOn:['crow-king-ingame-v4-final'],ready:()=>!!window.game?.__ffCrowMinionsIngameV3Installed },
      { id:'world1-crow-contrast-v1-final',src:'world1-crow-contrast-v1.js?v=1',dependsOn:['crow-minions-ingame-v3-final'],ready:()=>!!window.game?.__ffW1CrowContrastV1Installed },
      { id:'world1-cursed-obstacle-top-final',src:'world1-cursed-obstacle-asset-top-a.js?v=1',dependsOn:['world1-crow-contrast-v1-final'] },
      { id:'world1-cursed-obstacle-bottom-final',src:'world1-cursed-obstacle-asset-bottom-a.js?v=2',dependsOn:['world1-cursed-obstacle-top-final'] },
      { id:'world1-cursed-obstacles-v5-final',src:'world1-cursed-obstacles-v5.js?v=1',dependsOn:['world1-cursed-obstacle-bottom-final'],readyTimeout:3500,ready:()=>!!window.game?.__ffW1CursedObstaclesV5Installed },
      { id:'world1-classic-enhanced-background-v1-final',src:'world1-classic-enhanced-background-v1.js?v=1',dependsOn:['world1-cursed-obstacles-v5-final'],readyTimeout:3500,ready:()=>!!window.game?.__ffW1ClassicEnhancedBgV1Installed },
      { id:'world1-ground-obstacle-polish-v2-final',src:'world1-ground-obstacle-polish-v2.js?v=3',dependsOn:['world1-classic-enhanced-background-v1-final'],readyTimeout:3500,ready:()=>!!window.game?.__ffW1GroundObstaclePolishV2Installed }
    ],
    onCriticalError: async () => { if (typeof window.__FF_START_LEGACY_PATCH_CHAIN__ === 'function') { console.warn('[FeatherFury] Patch Runner critical failure; starting legacy loader fallback.'); await window.__FF_START_LEGACY_PATCH_CHAIN__(); } }
  };
  window.FEATHERFURY_PATCH_PLAN = plan;
  if (!window.PatchRunner) { console.error('[FeatherFury] PatchRunner is not available.'); window.__FF_START_LEGACY_PATCH_CHAIN__?.(); return; }
  window.PatchRunner.run(plan).then(()=>{releaseBootGate();}).catch(error=>{releaseBootGate();console.error('[FeatherFury] Patch Runner boot failed.',error);});
})();