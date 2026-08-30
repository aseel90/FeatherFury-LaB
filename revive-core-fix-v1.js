(() => {
  'use strict';

  function install() {
    const game = window.game;
    const btn = document.getElementById('reviveBtn');
    if (!game || !btn) return false;
    if (game.__reviveCoreFixV1Installed) return true;

    const ECONOMY = window.FFEconomy;
    const FALLBACK_COSTS = [8, 18];
    const costs = Array.isArray(ECONOMY?.revive?.coinCosts) ? ECONOMY.revive.coinCosts : FALLBACK_COSTS;
    const maxPerRun = Number(ECONOMY?.revive?.maxPerRun || costs.length || 2);
    const reviveCount = () => Math.max(0, Number(game.__ffReviveCount || 0));
    const currentCost = () => {
      const count = reviveCount();
      if (count >= maxPerRun) return null;
      const cost = Number(costs[count]);
      return Number.isFinite(cost) ? cost : null;
    };
    const applyCost = () => {
      const cost = currentCost();
      try { if (window.CONFIG && Number.isFinite(cost)) window.CONFIG.REVIVE_COST = cost; } catch (_) {}
      return cost;
    };
    const hideGameOver = () => {
      const screen = document.getElementById('gameOverScreen');
      screen?.classList.remove('active');
      screen?.classList.add('hidden');
    };
    const hideStart = () => {
      const start = document.getElementById('startScreen');
      start?.classList.remove('active');
      start?.classList.add('hidden');
    };
    const showHud = () => document.getElementById('gameHud')?.classList.remove('hidden');

    const oldReset = typeof game.reset === 'function' ? game.reset.bind(game) : null;
    if (oldReset) {
      game.reset = function(...args) {
        const r = oldReset(...args);
        this.__ffReviveCount = 0;
        return r;
      };
    }

    const oldUpdateCoins = typeof game.updateCoinDisplays === 'function' ? game.updateCoinDisplays.bind(game) : null;
    if (oldUpdateCoins) {
      game.updateCoinDisplays = function() {
        const cost = applyCost();
        const r = oldUpdateCoins();
        const revive = document.getElementById('reviveBtn');
        if (revive) {
          const can = Number.isFinite(cost) && Number(this.totalCoins || 0) >= cost;
          revive.disabled = !can;
          revive.style.opacity = can ? '1' : '.45';
          revive.style.cursor = can ? 'pointer' : 'not-allowed';
          const price = revive.querySelector('.revive-price');
          if (price) {
            const svg = price.querySelector('svg')?.outerHTML || '<svg width="14" height="14" viewBox="0 0 24 24"><use href="#coin-svg"></use></svg>';
            price.innerHTML = Number.isFinite(cost) ? `${svg} ${cost}` : `${svg} MAX`;
          }
        }
        return r;
      };
    }

    const oldGameOver = typeof game.gameOver === 'function' ? game.gameOver.bind(game) : null;
    if (oldGameOver) {
      game.gameOver = function(...args) {
        applyCost();
        this.__ffPaused = false;
        document.getElementById('ffPauseOverlay')?.classList.remove('show');
        const r = oldGameOver(...args);
        setTimeout(() => { if (this.state === 'GAMEOVER') this.updateCoinDisplays?.(); }, 20);
        setTimeout(() => { if (this.state === 'GAMEOVER') this.updateCoinDisplays?.(); }, 1040);
        return r;
      };
    }

    btn.onclick = (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (game.__ffReviveInProgress || game.state !== 'GAMEOVER') return;
      const cost = applyCost();
      const coins = Number(game.totalCoins || 0);
      if (!Number.isFinite(cost) || coins < cost) {
        game.sound?.playHit?.();
        game.updateCoinDisplays?.();
        return;
      }

      game.__ffReviveInProgress = true;
      game.totalCoins = Math.max(0, coins - cost);
      game.__ffReviveCount = reviveCount() + 1;
      game.sound?.playCoin?.();
      game.__ffPaused = false;
      document.getElementById('ffPauseOverlay')?.classList.remove('show');

      hideGameOver();
      hideStart();
      showHud();

      game.state = 'PLAYING';
      game.bird.y = (window.CONFIG?.CANVAS_HEIGHT || 640) / 2 - 50;
      game.bird.x = 80;
      game.bird.velocity = -3.8;
      game.bird.rotation = 0;
      game.invincibleTimer = 180;
      game.screenShake = 0;
      game.spawnTimer = 72;

      game.pillars = [];
      game.coins = [];
      game.minions = [];
      game.snowballs = [];
      game.icicles = [];
      game.penguinMinions = [];
      game.miniTeslas = [];
      game.electricBats = [];
      game.gravityGates = [];
      game.bossFeathers = [];
      game.powerOrbs = [];
      game.heroProjectiles = [];
      game.rain = [];

      // Clear transient boss-attack state so revive always resumes from a safe frame.
      // Boss HP/progression are intentionally preserved.
      game.__w2ManualProjectiles = [];
      game.__w2OrbBossV6 = null;
      game.__w3PressureV3 = null;
      game.__w3SonicV3 = null;
      game.__w3SonicV4 = null;
      game.__w3SonicV5 = null;
      game.__w3SonicV6 = null;
      game.__w3DodgeV4 = null;
      game.__w3DodgeCooldownV4 = 0;

      if (game.boss?.active) {
        if (game.boss.state !== 'EXPLODING') {
          game.boss.timer = 0;
          if (game.boss.type === 'penguin') {
            game.boss.state = 'IDLE';
            game.boss.x = Math.max((window.CONFIG?.CANVAS_WIDTH || 360) * .65, game.boss.x || 0);
            game.boss.y = (window.CONFIG?.CANVAS_HEIGHT || 640) - (window.CONFIG?.GROUND_HEIGHT || 70) - 5;
          } else if (game.boss.type === 'crow') {
            game.boss.state = 'IDLE';
            game.boss.x = (window.CONFIG?.CANVAS_WIDTH || 360) - 60;
          } else if (game.boss.type === 'thunderbird') {
            game.boss.state = 'IDLE';
            game.boss.x = (window.CONFIG?.CANVAS_WIDTH || 360) - 80;
          }
        }
      }

      game.updateCoinDisplays?.();
      try {
        if (game.activeWorld === 1) game.sound?.startFrostAmbiance?.(game.boss?.active ? 3 : (game.score >= (window.CONFIG?.STAGE1_END || 15) ? 2 : 1));
        else if (game.activeWorld === 0) game.sound?.startRuinsAmbiance?.();
      } catch (_) {}

      [80, 350, 1150, 1450].forEach(ms => setTimeout(() => {
        if (game.state === 'PLAYING') {
          hideGameOver(); hideStart(); showHud();
        }
      }, ms));

      setTimeout(() => { game.__ffReviveInProgress = false; }, 400);
    };

    applyCost();
    game.updateCoinDisplays?.();
    game.__reviveCoreFixV1Installed = true;
    console.log('[FF-LAB] revive-core-fix-v1-installed');
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{tries++;if(install()||tries>100)clearInterval(timer);},80);
  setTimeout(install,1400);
})();
