(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game) return false;
    if (game.__w3FoundationV1Installed) return true;

    const C = (typeof CONFIG !== 'undefined' && CONFIG) ? CONFIG : {};
    const W3 = 2;

    const resetW3Runtime = g => {
      g.gravityFlipped = false;
      g.__w3Stage2Announced = false;
      g.__w3DirectorStep = 0;
      g.__w3CurrentSerial = 0;
      g.__w3LastDirectorPillar = null;
      g.__w3WeatherPulse = 0;
    };

    // Batch 1: make W3 reset deterministic and never carry an old gravity inversion.
    const oldReset = typeof game.reset === 'function' ? game.reset.bind(game) : null;
    if (oldReset) {
      game.reset = function() {
        const r = oldReset();
        if (this.activeWorld === W3) resetW3Runtime(this);
        return r;
      };
    }

    const oldEnterStory = typeof game.enterStoryState === 'function' ? game.enterStoryState.bind(game) : null;
    if (oldEnterStory) {
      game.enterStoryState = function() {
        const r = oldEnterStory();
        if (this.activeWorld === W3) {
          resetW3Runtime(this);
          const stage = document.getElementById('stageDisplay');
          if (stage && typeof I18N !== 'undefined') stage.textContent = I18N[this.lang]?.w3_stage1 || 'Storm Spire';
        }
        return r;
      };
    }

    // Revive is not a full reset in the stable runtime, so explicitly clear gravity state here too.
    const reviveBtn = document.getElementById('reviveBtn');
    if (reviveBtn && typeof reviveBtn.onclick === 'function') {
      const oldRevive = reviveBtn.onclick;
      reviveBtn.onclick = function(e) {
        const r = oldRevive.call(this, e);
        if (game.activeWorld === W3 && game.state === 'PLAYING') {
          game.gravityFlipped = false;
          game.__w3WeatherPulse = 0;
        }
        return r;
      };
    }

    // Fix W3 score persistence without allowing the legacy W3 path to overwrite W1 high score.
    const oldGameOver = typeof game.gameOver === 'function' ? game.gameOver.bind(game) : null;
    if (oldGameOver) {
      game.gameOver = function(isVictory = false) {
        if (this.activeWorld !== W3) return oldGameOver(isVictory);

        const runScore = Number(this.score || 0);
        const oldW1High = Number(this.highScore || 0);
        const previousW3High = Number(this.highScoreW3 || 0);
        const result = oldGameOver(isVictory);

        // Stable runtime treats every non-W2 score as W1. Restore W1, then persist W3 correctly.
        this.highScore = oldW1High;
        try { safeSet('fh_highscore', String(oldW1High)); } catch (_) {}

        if (runScore > previousW3High) {
          this.highScoreW3 = runScore;
          try { safeSet('fh_highscore_w3', String(runScore)); } catch (_) {}
        } else {
          this.highScoreW3 = previousW3High;
        }

        if (isVictory) {
          this.w3Completed = true;
          try { safeSet('fh_w3_completed', 'true'); } catch (_) {}
        }

        const refresh = () => {
          const high = document.getElementById('highScore');
          if (high) high.textContent = String(this.highScoreW3 || 0);
        };
        refresh();
        setTimeout(refresh, 40);
        setTimeout(refresh, 900);
        return result;
      };
    }

    // W3 victory should advance to the World 4 / Coming Soon card, not bounce back to W2.
    const nextWorldBtn = document.getElementById('nextWorldActionBtn');
    if (nextWorldBtn && typeof nextWorldBtn.onclick === 'function') {
      const oldNextWorld = nextWorldBtn.onclick;
      nextWorldBtn.onclick = function(e) {
        if (game.activeWorld !== W3) return oldNextWorld.call(this, e);
        document.getElementById('mainMenuBtn')?.click();
        game.currentWorldIndex = 3;
        game.updateCarousel?.();
      };
    }

    // Fix W3 speed (stable runtime only applies W2_SPEED explicitly) and Stage 2 skip at 14 -> 16.
    const oldUpdate = typeof game.update === 'function' ? game.update.bind(game) : null;
    if (oldUpdate) {
      game.update = function() {
        if (this.activeWorld !== W3) return oldUpdate();

        const originalSpeed = C.SPEED_NORMAL;
        const hasW3Speed = Number.isFinite(Number(C.W3_SPEED));
        if (hasW3Speed && !this.feverActive) C.SPEED_NORMAL = Number(C.W3_SPEED);
        this.gravityFlipped = false;

        let result;
        try {
          result = oldUpdate();
        } finally {
          C.SPEED_NORMAL = originalSpeed;
        }

        if (!this.boss?.active && Number(this.score || 0) >= Number(C.STAGE1_END || 15) && !this.__w3Stage2Announced) {
          this.__w3Stage2Announced = true;
          const stage = document.getElementById('stageDisplay');
          if (stage && typeof I18N !== 'undefined') stage.textContent = I18N[this.lang]?.w3_stage2 || 'Charged Clouds';
        }
        return result;
      };
    }

    game.__w3FoundationV1Installed = true;
    console.log('[FF-LAB] w3-foundation-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 100) clearInterval(timer);
  }, 80);
  setTimeout(install, 1200);
})();
