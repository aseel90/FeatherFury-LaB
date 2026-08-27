(() => {
  'use strict';

  function install() {
    const g = window.game;
    if (!g?.__w3CriticalFixV6Installed) return false;
    if (g.__w3RuntimeCleanupV1Installed) return true;

    const C = (typeof CONFIG !== 'undefined' && CONFIG) ? CONFIG : {};
    const W3 = 2;
    const STAGE1_END = () => Number(C.STAGE1_END || 15);
    const STAGE2_END = () => Number(C.STAGE2_END || 35);

    // Canonical World 3 tuning. These are the values the latest balance layer had already
    // converged on; keeping them here prevents older patches from fighting over the config.
    C.W3_SPEED = 2.78;
    C.W3_GAP_SIZE = 130;
    C.W3_BOSS_HP = 8;

    function isPreBoss(x) {
      return x.activeWorld === W3 && x.state === 'PLAYING' && !x.boss?.active && Number(x.score || 0) < STAGE2_END();
    }

    function parkDuplicateDirectors(x) {
      if (!isPreBoss(x)) {
        x.__w3PressureV3 = null;
        x.__w3DirectorV4 = null;
        return;
      }

      // World-polish-v1 is now the single owner of normal-stage W3 hazard births.
      // Keep the later pressure directors installed for compatibility, but permanently idle.
      const phase2 = Number(x.score || 0) >= STAGE1_END();
      const v3Serial = Number(x.__w3PressureV3?.serial || 0);
      const v4Serial = Number(x.__w3DirectorV4?.serial || 0);
      x.__w3PressureV3 = { timer: 1000000000, serial: v3Serial };
      x.__w3DirectorV4 = { timer: 1000000000, serial: v4Serial, lastPhase2: phase2 };
    }

    function pruneDuplicateHazards(x) {
      if (x.activeWorld !== W3 || x.boss?.active) return;
      if (Array.isArray(x.electricBats)) {
        x.electricBats = x.electricBats.filter(b => !b?.__w3PressureV3 && !b?.__w3V4);
      }
      if (Array.isArray(x.miniTeslas)) {
        x.miniTeslas = x.miniTeslas.filter(t => !t?.__w3PressureV3 && !t?.__w3V4);
      }
    }

    const oldActivateBoss = typeof g.activateBoss === 'function' ? g.activateBoss.bind(g) : null;
    if (oldActivateBoss) {
      g.activateBoss = function(...args) {
        const result = oldActivateBoss(...args);
        if (this.activeWorld === W3 && this.boss?.type === 'thunderbird') {
          this.boss.hp = C.W3_BOSS_HP;
          this.boss.shield = Math.max(2, Number(this.boss.shield || 0));
        }
        return result;
      };
    }

    const oldReset = typeof g.reset === 'function' ? g.reset.bind(g) : null;
    if (oldReset) {
      g.reset = function(...args) {
        const result = oldReset(...args);
        this.__w3PressureV3 = null;
        this.__w3DirectorV4 = null;
        this.__w3RuntimeOwner = 'w3-runtime-cleanup-v1';
        return result;
      };
    }

    const oldUpdate = typeof g.update === 'function' ? g.update.bind(g) : null;
    if (oldUpdate) {
      g.update = function() {
        if (this.activeWorld === W3) {
          parkDuplicateDirectors(this);
          pruneDuplicateHazards(this);
        }

        const result = oldUpdate();

        if (this.activeWorld === W3) {
          // Critical-fix-v6 owns Sonic. Remove stale V3/V4/V5 state after it has had a
          // chance to capture/convert the trigger during the nested update chain.
          this.__w3SonicV3 = null;
          this.__w3SonicV4 = null;
          this.__w3SonicV5 = null;
          parkDuplicateDirectors(this);
          pruneDuplicateHazards(this);
          this.__w3RuntimeOwner = 'w3-runtime-cleanup-v1';
        }
        return result;
      };
    }

    g.__w3RuntimeOwner = 'w3-runtime-cleanup-v1';
    g.__w3RuntimeCleanupV1Installed = true;
    console.log('[FF-LAB] w3-runtime-cleanup-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 160) clearInterval(timer);
  }, 80);
  setTimeout(install, 1600);
})();
