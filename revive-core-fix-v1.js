(() => {
  'use strict';

  function install() {
    const game = window.game;
    const btn = document.getElementById('reviveBtn');
    const langIconPath = document.querySelector('#lang-svg path');
    if (langIconPath) langIconPath.setAttribute('d', 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z');
    if (!game || !btn) return false;
    if (game.__reviveCoreFixV1Installed) return true;

    const COST = 1;
    const applyCost = () => {
      try { if (window.CONFIG) window.CONFIG.REVIVE_COST = COST; } catch (_) {}
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

    const oldUpdateCoins = typeof game.updateCoinDisplays === 'function' ? game.updateCoinDisplays.bind(game) : null;
    if (oldUpdateCoins) {
      game.updateCoinDisplays = function() {
        applyCost();
        const r = oldUpdateCoins();
        const revive = document.getElementById('reviveBtn');
        if (revive) {
          const can = Number(this.totalCoins || 0) >= COST;
          revive.disabled = !can;
          revive.style.opacity = can ? '1' : '.45';
          revive.style.cursor = can ? 'pointer' : 'not-allowed';
          const price = revive.querySelector('.revive-price');
          if (price) {
            const svg = price.querySelector('svg')?.outerHTML || '<svg width="14" height="14" viewBox="0 0 24 24"><use href="#coin-svg"></use></svg>';
            price.innerHTML = `${svg} ${COST}`;
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
      applyCost();
      const coins = Number(game.totalCoins || 0);
      if (coins < COST) {
        game.sound?.playHit?.();
        game.updateCoinDisplays?.();
        return;
      }

      game.__ffReviveInProgress = true;
      game.totalCoins = Math.max(0, coins - COST);
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
