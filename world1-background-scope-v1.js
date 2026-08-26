(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game || typeof game.drawRuinsBackground !== 'function') return false;
    if (!game.__cursedWoodsAtmosphereV4Installed) return false;
    if (game.__world1BackgroundScopeV1Installed) return true;

    const prior = game.drawRuinsBackground.bind(game);

    game.drawRuinsBackground = function (...args) {
      const cfg = window.CONFIG || {};
      const stage1End = Number(cfg.STAGE1_END) || 15;
      const score = Number(this.score) || 0;
      const bossScene = !!this.boss?.active || ['BOSS_WARNING', 'BOSS_INTRO', 'BOSS_OUTRO', 'STORY', 'FLY_AWAY'].includes(this.state);

      // V4 already contains the approved full forest renderer, but it originally
      // gated that renderer to the deep-forest section (score >= STAGE1_END).
      // For the outer forest we invoke the exact same renderer at its depth-zero
      // profile. No obstacle, collision, physics or rendering technique changes.
      if (this.activeWorld === 0 && score < stage1End && !bossScene && this.ctx) {
        const realScore = this.score;
        this.score = stage1End;
        try {
          return prior(...args);
        } finally {
          this.score = realScore;
        }
      }

      return prior(...args);
    };

    game.__world1BackgroundScopeV1Installed = true;
    window.__FF_WORLD1_BACKGROUND_SCOPE_V1__ = {
      version: 'world1-background-scope-v1',
      renderer: 'cursed-woods-v4',
      appliesFromScore: 0,
      obstacleSystemChanged: false,
      collisionChanged: false,
      techniqueChanged: false,
    };
    console.log('[FF-LAB] world1-background-scope-v1-installed');
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 60) clearInterval(timer);
  }, 100);
  setTimeout(install, 900);
  setTimeout(install, 1800);
})();
