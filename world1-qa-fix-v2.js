(() => {
  'use strict';

  if (window.__FF_WORLD1_QA_FIX_V2__) return;

  function install() {
    const game = window.game;
    if (!game || typeof game.update !== 'function') return false;
    if (game.__ffWorld1QaFixV2Installed) return true;

    const stage1End = () => Number(window.CONFIG?.STAGE1_END || 15);

    function setStage2Label(g) {
      if (g.activeWorld !== 0 || g.boss?.active || g.state !== 'PLAYING' || Number(g.score || 0) < stage1End()) return;
      const label = document.getElementById('stageDisplay');
      const text = window.I18N?.[g.lang]?.stage2;
      if (label && text) label.textContent = text;
    }

    function enforceVictoryUi(g) {
      if (g.activeWorld !== 0 || g.state !== 'GAMEOVER' || !g.__ffVictoryAllowFinish) return;
      const revive = document.getElementById('reviveBtn');
      if (revive) {
        revive.classList.add('hidden');
        revive.style.display = 'none';
        revive.setAttribute('aria-hidden', 'true');
      }
      const next = document.getElementById('nextWorldActionBtn');
      next?.classList.remove('hidden');
      const title = document.getElementById('endGameTitle');
      if (title) {
        const winText = window.I18N?.[g.lang]?.winText;
        if (winText) title.textContent = winText;
        title.style.color = '#f1c40f';
      }
      document.getElementById('gameHud')?.classList.add('hidden');
      try { g.sound?.stopBossAmbiance?.(); } catch (_) {}
    }

    function restoreWorld1AudioAfterRevive(g) {
      if (g.activeWorld !== 0 || g.state !== 'PLAYING') return;
      try { g.sound?.stopAmbiance?.(); } catch (_) {}
      try { g.sound?.stopBossAmbiance?.(); } catch (_) {}

      if (g.boss?.active && g.boss.type === 'crow') {
        if (Array.isArray(g.bossFeathers)) g.bossFeathers.length = 0;
        g.boss.__ffAttackQueue = [];
        g.boss.__ffTelegraph = null;
        g.boss.timer = 0;
        if (g.boss.state !== 'EXPLODING') g.boss.state = 'IDLE';
        try { g.sound?.startBossAmbiance?.(); } catch (_) {}
        return;
      }

      const stage2 = Number(g.score || 0) >= stage1End();
      g.__ffCursedAudioStarted = stage2;
      try {
        if (stage2) g.sound?.startCursedAmbiance?.();
        else g.sound?.startRuinsAmbiance?.();
      } catch (_) {}
      setStage2Label(g);
    }

    const baseUpdate = game.update.bind(game);
    game.update = function(...args) {
      const result = baseUpdate(...args);
      if (this.activeWorld === 0) {
        setStage2Label(this);
        enforceVictoryUi(this);
      }
      return result;
    };

    if (typeof game.gameOver === 'function') {
      const baseGameOver = game.gameOver.bind(game);
      game.gameOver = function(isVictory = false, ...args) {
        const result = baseGameOver(isVictory, ...args);
        if (this.activeWorld === 0 && isVictory) {
          queueMicrotask(() => enforceVictoryUi(this));
          setTimeout(() => enforceVictoryUi(this), 40);
          setTimeout(() => enforceVictoryUi(this), 1150);
        }
        return result;
      };
    }

    const reviveBtn = document.getElementById('reviveBtn');
    if (reviveBtn?.onclick && !reviveBtn.__ffWorld1QaWrapped) {
      const baseRevive = reviveBtn.onclick;
      reviveBtn.onclick = function(e) {
        const wasWorld1 = game.activeWorld === 0;
        const result = baseRevive.call(this, e);
        if (wasWorld1) {
          setTimeout(() => {
            if (game.state === 'PLAYING') restoreWorld1AudioAfterRevive(game);
          }, 0);
        }
        return result;
      };
      reviveBtn.__ffWorld1QaWrapped = true;
    }

    game.__ffWorld1QaFixV2Installed = true;
    window.__FF_WORLD1_QA_FIX_V2__ = {
      version: 'world1-qa-fix-v2',
      restoreAudio: () => restoreWorld1AudioAfterRevive(game),
      enforceVictoryUi: () => enforceVictoryUi(game)
    };
    console.log('[FF-LAB] world1-qa-fix-v2-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 160) clearInterval(timer);
  }, 50);
})();
