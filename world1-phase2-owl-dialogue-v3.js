(() => {
  'use strict';

  if (window.__FF_WORLD1_PHASE2_OWL_DIALOGUE_V3__) return;

  function install() {
    const game = window.game;
    if (!game || typeof game.updateBoss !== 'function') return false;
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

    // Dialogue positioning is intentionally delegated to the final responsive owl layer.
    // Keeping it here caused two systems to pull the same real owl toward different targets.

    const priorReset = typeof game.reset === 'function' ? game.reset.bind(game) : null;
    if (priorReset) {
      game.reset = function(...args) {
        this.__ffW1Phase2ReliefTick = 0;
        return priorReset(...args);
      };
    }

    game.__ffWorld1Phase2OwlDialogueV3Installed = true;
    window.__FF_WORLD1_PHASE2_OWL_DIALOGUE_V3__ = {
      version: 'world1-phase2-owl-dialogue-v3.1',
      phase2Relief: 1 / 9,
      owlDialoguePlacement: 'delegated-to-responsive-layer'
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
