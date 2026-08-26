(() => {
  'use strict';

  const pin = '5b83840b64b2609167997a10f27abfa8ccb0e452';
  const stableGame = `https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@${pin}/game.js`;

  window.__FF_PATCH_MANIFEST__ = {
    version: '2026-08-26.world1-clean-runtime.v1',
    timeoutMs: 3500,
    patches: [
      {
        id: 'stable-runtime',
        src: stableGame,
        timeoutMs: 7000,
        readyTimeout: 7000,
        ready: () => !!window.game && typeof window.game.draw === 'function' && typeof window.game.update === 'function' && typeof window.game.startGame === 'function'
      },
      { id:'ruins-pillars-v3',src:'ruins-pillars-v3.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__ruinsPillarsV3Installed },
      { id:'boss-crowking-v1',src:'boss-crowking-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__crowKingV1Installed },
      { id:'boss-fight-core-v1',src:'boss-fight-core-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__bossFightCoreV1Installed },
      { id:'w1-fixes-batch-v1',src:'w1-fixes-batch-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__w1FixesBatchV1Installed },
      { id:'boss-audio-fix-v2',src:'boss-audio-fix-v2.js?v=2',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__bossAudioFixV2Installed },
      { id:'w1-final-audio-v1',src:'w1-final-audio-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__w1FinalAudioV1Installed },
      { id:'w1-final-gameplay-v1',src:'w1-final-gameplay-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__w1FinalGameplayV1Installed },
      { id:'w1-final-story-v1',src:'w1-final-story-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__w1FinalStoryV1Installed },
      { id:'core-gameplay-ux-v1',src:'core-gameplay-ux-v1.js?v=3',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__coreGameplayUxV1Installed },
      { id:'pause-hud-polish-v2',src:'pause-hud-polish-v2.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__pauseHudPolishV2Installed },
      { id:'world1-final-polish-v1',src:'world1-final-polish-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__world1FinalPolishV1Installed },
      { id:'w2-audio-v1',src:'w2-audio-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__w2AudioV1Installed },
      { id:'w2-environment-assets-v1',src:'w2-environment-assets-v1.js?v=2',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.__FF_W2_ENV_ASSETS_V1_READY__ },
      { id:'w2-visuals-v1',src:'w2-visuals-v1.js?v=3',dependsOn:['w2-environment-assets-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w2VisualsV1Installed },
      { id:'w2-gameplay-v1',src:'w2-gameplay-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:3000,ready:()=>!!window.game?.__w2GameplayV1Installed },
      { id:'revive-core-fix-v1',src:'revive-core-fix-v1.js?v=2',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__reviveCoreFixV1Installed },
      { id:'w2-boss-polish-v2',src:'w2-boss-polish-v2.js?v=1',dependsOn:['w2-audio-v1','w2-visuals-v1','w2-gameplay-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w2BossPolishV2Installed },
      { id:'w2-boss-orb-v7',src:'w2-boss-orb-v7.js?v=1',dependsOn:['w2-boss-polish-v2'],readyTimeout:3000,ready:()=>!!window.game?.__w2BossOrbV7Installed },
      { id:'w2-v7-compat-v1',src:'w2-v7-compat-v1.js?v=1',dependsOn:['w2-boss-orb-v7'],readyTimeout:2500,ready:()=>!!window.game?.__w2V7CompatV1Installed },
      { id:'w2-boss-combat-v6',src:'w2-boss-combat-v6.js?v=1',dependsOn:['w2-v7-compat-v1'],readyTimeout:3000,ready:()=>!!window.game?.__w2BossCombatV6Installed },
      { id:'w2-boss-tuning-v8',src:'w2-boss-tuning-v8.js?v=1',dependsOn:['w2-boss-combat-v6'],readyTimeout:3000,ready:()=>!!window.game?.__w2BossTuningV8Installed },
      { id:'w2-boss-phase2-relief-v9',src:'w2-boss-phase2-relief-v9.js?v=1',dependsOn:['w2-boss-tuning-v8'],readyTimeout:3000,ready:()=>!!window.game?.__w2BossPhase2ReliefV9Installed },
      { id:'victory-screen-fix-v1',src:'victory-screen-fix-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__victoryScreenFixV1Installed },
      { id:'w3-foundation-v1',src:'w3-foundation-v1.js?v=1',dependsOn:['stable-runtime'],readyTimeout:3000,ready:()=>!!window.game?.__w3FoundationV1Installed },
      { id:'w3-world-polish-v1',src:'w3-world-polish-v1.js?v=1',dependsOn:['w3-foundation-v1'],readyTimeout:3000,ready:()=>!!window.game?.__w3WorldPolishV1Installed },
      { id:'w3-boss-v1',src:'w3-boss-v1.js?v=1',dependsOn:['w3-foundation-v1'],readyTimeout:3000,ready:()=>!!window.game?.__w3BossV1Installed },
      { id:'w3-final-polish-v1',src:'w3-final-polish-v1.js?v=1',dependsOn:['w3-foundation-v1','w3-world-polish-v1','w3-boss-v1'],readyTimeout:3500,ready:()=>!!window.game?.__w3FinalPolishV1Installed },
      { id:'w3-balance-visual-v2',src:'w3-balance-visual-v2.js?v=1',dependsOn:['w3-final-polish-v1'],readyTimeout:3000,ready:()=>!!window.game?.__w3BalanceVisualV2Installed },
      { id:'w3-challenge-audio-v3',src:'w3-challenge-audio-v3.js?v=1',dependsOn:['w3-balance-visual-v2'],readyTimeout:3000,ready:()=>!!window.game?.__w3ChallengeAudioV3Installed },
      { id:'w3-final-balance-v4',src:'w3-final-balance-v4.js?v=1',dependsOn:['w3-challenge-audio-v3'],readyTimeout:3000,ready:()=>!!window.game?.__w3FinalBalanceV4Installed },
      { id:'w3-critical-fix-v6',src:'w3-critical-fix-v6.js?v=1',dependsOn:['w3-final-balance-v4'],readyTimeout:3000,ready:()=>!!window.game?.__w3CriticalFixV6Installed },
      { id:'hero-blue-ninja-v1',src:'hero-blue-ninja-v1.js?v=2',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__heroBlueNinjaV1Installed },
      { id:'hero-static-smooth-v2',src:'hero-static-smooth-v2.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__heroStaticSmoothV2Installed },
      { id:'hero-blue-effects-v1',src:'hero-blue-effects-v1.js?v=3',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__heroBlueEffectsV1Installed },
      { id:'fierce-falcon-v1',src:'fierce-falcon-v1.js?v=3',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__fierceFalconV1Installed },
      { id:'skin-routing-hardfix-v2',src:'skin-routing-hardfix-v2.js?v=2',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__skinRoutingHardfixV2Installed },
      { id:'character-roster-v1',src:'character-roster-v1.js?v=2',dependsOn:['stable-runtime'],readyTimeout:3000,ready:()=>!!window.game?.__characterRosterV1Installed },
      { id:'character-abilities-v2',src:'character-abilities-v2.js?v=2',dependsOn:['character-roster-v1'],readyTimeout:3000,ready:()=>!!window.game?.__characterAbilitiesV2Installed },
      { id:'mountain-eagle-stability-v3',src:'mountain-eagle-stability-v3.js?v=1',dependsOn:['character-roster-v1'],readyTimeout:3000,ready:()=>!!window.game?.__mountainEagleStabilityV3Installed },
      { id:'character-ability-ui-v1',src:'character-ability-ui-v1.js?v=1',dependsOn:['character-abilities-v2'],readyTimeout:3000,ready:()=>!!window.game?.__characterAbilityUiV1Installed },
      { id:'character-ability-fx-v1',src:'character-ability-fx-v1.js?v=1',dependsOn:['character-abilities-v2','character-ability-ui-v1'],readyTimeout:3000,ready:()=>!!window.game?.__characterAbilityFxV1Installed },
      { id:'world1-qa-fix-v2',src:'world1-qa-fix-v2.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__world1QaFixV2Installed },
      { id:'owl-guardian-v2',src:'owl-guardian-v2.js?v=2',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__owlGuardianV2Installed },
      { id:'world1-phase2-owl-dialogue-v3',src:'world1-phase2-owl-dialogue-v3.js?v=2',dependsOn:['owl-guardian-v2'],readyTimeout:2500,ready:()=>!!window.game?.__world1Phase2OwlDialogueV3Installed },
      { id:'world1-owl-dialogue-layer-fix-v3',src:'world1-owl-dialogue-layer-fix-v3.js?v=1',dependsOn:['world1-phase2-owl-dialogue-v3'],readyTimeout:2500,ready:()=>!!window.game?.__world1OwlDialogueLayerFixV3Installed },
      { id:'crow-king-ingame-v4',src:'crow-king-ingame-v4.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__crowKingIngameV4Installed },
      { id:'crow-minions-ingame-v3',src:'crow-minions-ingame-v3.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.game?.__crowMinionsIngameV3Installed },
      { id:'world1-crow-contrast-v1',src:'world1-crow-contrast-v1.js?v=1',dependsOn:['crow-minions-ingame-v3'],readyTimeout:2500,ready:()=>!!window.game?.__world1CrowContrastV1Installed },
      { id:'world1-cursed-obstacle-asset-top-a',src:'world1-cursed-obstacle-asset-top-a.js?v=1',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.__FF_W1_CURSED_OBSTACLE_TOP_A__ },
      { id:'world1-cursed-obstacle-asset-bottom-a',src:'world1-cursed-obstacle-asset-bottom-a.js?v=2',dependsOn:['stable-runtime'],readyTimeout:2500,ready:()=>!!window.__FF_W1_CURSED_OBSTACLE_BOTTOM_A__ },
      { id:'world1-cursed-obstacles-v5',src:'world1-cursed-obstacles-v5.js?v=1',dependsOn:['world1-cursed-obstacle-asset-top-a','world1-cursed-obstacle-asset-bottom-a'],readyTimeout:3500,ready:()=>!!window.game?.__world1CursedObstaclesV5Installed },
      { id:'world1-classic-enhanced-background-v1',src:'world1-classic-enhanced-background-v1.js?v=1',dependsOn:['world1-cursed-obstacles-v5'],readyTimeout:3000,ready:()=>!!window.game?.__world1ClassicEnhancedBackgroundV1Installed },
      { id:'world1-ground-obstacle-polish-v2',src:'world1-ground-obstacle-polish-v2.js?v=3',dependsOn:['world1-classic-enhanced-background-v1'],readyTimeout:3000,ready:()=>!!window.game?.__world1GroundObstaclePolishV2Installed }
    ]
  };
})();