(() => {
  'use strict';

  if (window.__FF_WORLD1_PHASE2_OWL_DIALOGUE_V3__) return;

  function install() {
    const game = window.game;
    if (!game || typeof game.updateBoss !== 'function' || typeof game.update !== 'function') return false;
    if (game.__ffWorld1Phase2OwlDialogueV3Installed) return true;

    const priorUpdateBoss = game.updateBoss.bind(game);
    game.updateBoss = function(...args) {
      const easedPhase2 = this.activeWorld === 0 && this.state === 'PLAYING' && this.boss?.active && this.boss.type === 'crow' && this.boss.enraged && this.boss.state !== 'EXPLODING';

      if (easedPhase2) {
        this.__ffW1Phase2ReliefTick = ((this.__ffW1Phase2ReliefTick || 0) + 1) % 9;
        // Skip one boss-AI tick out of nine: ~11% less aggression without changing HP or phase identity.
        if (this.__ffW1Phase2ReliefTick === 0) return;
      } else {
        this.__ffW1Phase2ReliefTick = 0;
      }

      return priorUpdateBoss(...args);
    };

    const priorUpdate = game.update.bind(game);
    game.update = function(...args) {
      const result = priorUpdate(...args);

      const dialogue = this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && this.__ffVictoryCine?.phase === 'dialogue';
      if (dialogue && this.owl) {
        const cfg = window.CONFIG || {};
        const w = Number(cfg.CANVAS_WIDTH) || 480;
        const h = Number(cfg.CANVAS_HEIGHT) || 640;
        const boxTop = h - 160;
        const targetX = w - 70;
        const targetY = boxTop - 5;

        this.owl.x += (targetX - this.owl.x) * 0.14;
        this.owl.y += (targetY - this.owl.y) * 0.14;
      }

      return result;
    };

    const priorReset = typeof game.reset === 'function' ? game.reset.bind(game) : null;
    if (priorReset) {
      game.reset = function(...args) {
        this.__ffW1Phase2ReliefTick = 0;
        return priorReset(...args);
      };
    }

    game.__ffWorld1Phase2OwlDialogueV3Installed = true;
    window.__FF_WORLD1_PHASE2_OWL_DIALOGUE_V3__ = {
      version: 'world1-phase2-owl-dialogue-v3',
      phase2Relief: 1 / 9,
      owlDialoguePlacement: 'behind-dialogue-right'
    };
    console.log('[FF-LAB] world1-phase2-owl-dialogue-v3-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 160) clearInterval(timer);
  }, 50);
})();
