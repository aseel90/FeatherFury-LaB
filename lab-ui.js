/* Feather Fury LAB local helper. No remote UI/runtime loaders. */
(() => {
  'use strict';
  if (window.__FF_LAB_RUNTIME_SAFE__) return;
  window.__FF_LAB_RUNTIME_SAFE__ = 'FF_LAB_RUNTIME_SAFE';

  const labWorldUnlockEnabled = (() => {
    try { return new URLSearchParams(window.location.search).get('fflab') === '1'; }
    catch (_) { return false; }
  })();
  window.__FF_LAB_WORLD_UNLOCK__ = labWorldUnlockEnabled;

  function unlockLabWorlds() {
    const game = window.game;
    if (!game) return false;
    game.w1Completed = true;
    game.w2Completed = true;
    if (Array.isArray(game.worlds)) {
      game.worlds.forEach((world, index) => {
        if (world && index <= 2) world.unlocked = true;
      });
    }
    try { game.updateCarousel?.(); } catch (_) {}
    return true;
  }

  // Final World 1 art already owns the strong Cursed Woods gameplay background,
  // but the historical renderer intentionally fell back during STORY/boss/outro.
  // Keep those scenes on the exact same approved forest renderer without changing
  // gameplay state outside the synchronous background draw call.
  function installWorld1SceneBackgroundLock() {
    const game = window.game;
    if (!game?.__world1FinalArtLockV1Installed || typeof game.drawRuinsBackground !== 'function') return false;
    if (game.__ffWorld1SceneBackgroundLockInstalled) return true;

    const approvedBackground = game.drawRuinsBackground.bind(game);
    const sceneStates = new Set(['STORY', 'BOSS_WARNING', 'BOSS_INTRO', 'BOSS_OUTRO', 'FLY_AWAY']);

    game.drawRuinsBackground = function(...args) {
      const world1 = this.activeWorld === 0;
      const specialScene = sceneStates.has(this.state) || !!this.boss?.active;
      if (!world1 || !specialScene) return approvedBackground(...args);

      const savedState = this.state;
      const savedScore = this.score;
      const savedBossActive = this.boss?.active;
      try {
        // The final art lock selects the strong forest in PLAYING. Story receives
        // a mid-depth forest; boss/outro keep their natural late-world score depth.
        this.state = 'PLAYING';
        if (this.boss) this.boss.active = false;
        if (savedState === 'STORY') this.score = Math.max(Number(savedScore) || 0, 12);
        return approvedBackground(...args);
      } finally {
        this.state = savedState;
        this.score = savedScore;
        if (this.boss) this.boss.active = savedBossActive;
      }
    };

    game.__ffWorld1SceneBackgroundLockInstalled = true;
    window.__FF_W1_SCENE_BACKGROUND_LOCK__ = {
      version: 'world1-scene-background-lock-v1',
      owner: 'approved-final-art-lock',
      scenes: ['story', 'boss', 'outro', 'fly-away']
    };
    console.log('[FF-LAB] World 1 scene background lock installed');
    return true;
  }

  if (labWorldUnlockEnabled) {
    let unlockTries = 0;
    const unlockTimer = setInterval(() => {
      if (unlockLabWorlds() || ++unlockTries > 200) clearInterval(unlockTimer);
    }, 50);
  }

  let backgroundTries = 0;
  const backgroundTimer = setInterval(() => {
    if (installWorld1SceneBackgroundLock() || ++backgroundTries > 300) {
      clearInterval(backgroundTimer);
      console.log('[FF-LAB] local helper ready', window.__FF_RUNTIME_MAP__?.version || 'runtime-pending');
    }
  }, 50);
})();
