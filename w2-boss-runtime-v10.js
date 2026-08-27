(() => {
  'use strict';

  function install() {
    const g = window.game;
    if (!g?.__w2BossOrbV7Installed) return false;
    if (g.__w2BossRuntimeV10Installed) return true;

    const C = window.CONFIG || {};
    const W = () => +C.CANVAS_WIDTH || 360;
    const H = () => +C.CANVAS_HEIGHT || 640;
    const GROUND = () => H() - (+C.GROUND_HEIGHT || 70) - 5;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const active = x => x.activeWorld === 1 && x.boss?.active && x.boss.type === 'penguin';
    const phase2ForCombat = x => {
      const maxHp = Math.max(4, +C.W2_BOSS_HP || 8);
      const phase2Hp = Math.max(1, Math.ceil(maxHp * .35));
      const drops = +x.__w2OrbBossV6?.completedDrops || 0;
      return !!(x.boss && (x.boss.hp <= phase2Hp || drops >= 2));
    };
    const phase2ForRelief = x => phase2ForCombat(x) || !!x.boss?.__w2V6Phase2Started;

    function snapshot(x) {
      const s = x.__w2OrbBossV6;
      if (!s) return;
      x.__w2V8Resume = {
        charge: clamp(+s.charge || 0, 0, +s.required || 4),
        completedDrops: +s.completedDrops || 0,
        spentIds: (s.blocks || []).filter(b => b?.state === 'SPENT').map(b => b.id)
      };
      s.__w2V8Bound = true;
    }

    function restore(x, s) {
      const r = x.__w2V8Resume;
      if (!r || s.__w2V8Bound) return;
      s.charge = clamp(+r.charge || 0, 0, +s.required || 4);
      s.completedDrops = Math.max(0, +r.completedDrops || 0);
      const spent = new Set(r.spentIds || []);
      for (const b of (s.blocks || [])) {
        if (!b) continue;
        if (spent.has(b.id)) { b.state = 'SPENT'; continue; }
        b.state = 'READY'; b.timer = 0; b.vy = 0; b.fallY = b.y;
      }
      s.bolt = null;
      s.burstQueue = [];
      s.stun = 0;
      s.lockedBlockId = null;
      s.nextOrbIn = Math.min(Number.isFinite(s.nextOrbIn) ? s.nextOrbIn : 42, 42);
      s.__w2V8Bound = true;
    }

    const baseActivateBoss = typeof g.activateBoss === 'function' ? g.activateBoss.bind(g) : null;
    if (baseActivateBoss) {
      g.activateBoss = function(...args) {
        const result = baseActivateBoss(...args);
        if (active(this) && this.boss) {
          this.__w2V8Resume = null;
          this.boss.__w2V8FireCooldown = 58;
          this.boss.__w2V8LandingTarget = null;
          this.boss.__w2V9BurstCooldown = 0;
          this.boss.__w2V9Phase2Seen = false;
        }
        return result;
      };
    }

    const baseBossUpdate = typeof g.updatePenguinBoss === 'function' ? g.updatePenguinBoss.bind(g) : null;
    if (baseBossUpdate) {
      g.updatePenguinBoss = function() {
        const b = this.boss;
        if (!b || b.type !== 'penguin') return baseBossUpdate();

        const isActive = active(this);
        let reliefPhase2 = false;
        let snowballCountBefore = 0;
        if (isActive) {
          reliefPhase2 = phase2ForRelief(this);
          if (reliefPhase2 && !b.__w2V9Phase2Seen) {
            b.__w2V9Phase2Seen = true;
            b.__w2V9BurstCooldown = 52;
          }
          if ((b.__w2V9BurstCooldown || 0) > 0) b.__w2V9BurstCooldown--;
          snowballCountBefore = (this.snowballs || []).length;
        }

        let tuningBeforeState = b.state;
        let tuningBeforeX = +b.x || 0;
        let suppressLegacy = false;
        let savedTimer = b.timer;
        if (isActive) {
          const legacyRate = b.enraged ? 40 : 64;
          suppressLegacy = b.state === 'IDLE' && b.timer > 0 && b.timer % legacyRate === 0;
          savedTimer = b.timer;
          if (suppressLegacy) b.timer = savedTimer + 1;
        }

        const maxHp = Math.max(4, +C.W2_BOSS_HP || 8);
        const phase2Hp = Math.max(1, Math.ceil(maxHp * .35));
        const drops = this.__w2OrbBossV6?.completedDrops || 0;
        const combatPhase2 = b.hp <= phase2Hp || drops >= 2;
        if (combatPhase2) {
          if (!b.__w2V6Phase2Started) {
            b.__w2EnrageTriggered = false;
            b.enraged = false;
          } else {
            b.__w2EnrageTriggered = true;
            b.enraged = true;
          }
        } else {
          b.__w2EnrageTriggered = true;
          b.enraged = false;
        }

        const specialAt = b.enraged ? 82 : 118;
        if (b.state === 'IDLE' && b.timer > specialAt) {
          const next = b.__w2V6NextSpecial || 'SLIDE_PREP';
          b.state = next;
          b.timer = 0;
          b.__w2V6NextSpecial = next === 'SLIDE_PREP' ? 'JUMP_PREP' : 'SLIDE_PREP';
          if (next === 'JUMP_PREP') {
            const minX = W() * .55, maxX = W() - 62;
            const direction = b.x > W() * .76 ? -1 : 1;
            b.__w2LandingX = clamp(b.x + direction * 56, minX, maxX);
            this.sound?.playIceWarn?.();
          } else {
            this.sound?.playPenguinSlide?.();
          }
          this.sound?.playEmperorAttack?.();
          b.__w2VoiceCooldown = 70;
        }

        const combatBeforeState = b.state;
        const result = baseBossUpdate();

        if (b.state === 'W2_ENRAGE') b.__w2V6Phase2Started = true;
        if (b.state === 'SLIDING') b.slideSpeed = b.enraged ? -12.2 : -10.4;
        if (combatBeforeState === 'SLIDING' && b.state === 'RETURNING') b.x = W() + 108;
        if (b.state === 'LANDING') b.x = clamp(b.x, W() * .55, W() - 54);

        if (!isActive) return result;

        if (suppressLegacy && b.state === 'IDLE' && b.timer === savedTimer + 1) b.timer = savedTimer;

        if (b.state === 'LANDING') {
          if (tuningBeforeState !== 'LANDING') {
            b.__w2V8LandingTarget = clamp(Math.max(W() * .58, tuningBeforeX), W() * .55, W() - 55);
            b.x = tuningBeforeX;
            b.jumpVy = 0;
          } else {
            const target = Number.isFinite(b.__w2V8LandingTarget) ? b.__w2V8LandingTarget : clamp(W() * .62, W() * .55, W() - 55);
            b.x = tuningBeforeX + (target - tuningBeforeX) * .11;
            const p = clamp((+b.timer || 0) / 38, 0, 1);
            b.y = GROUND() - Math.sin(p * Math.PI) * 4.5 * (1 - p * .35);
          }
        } else if (tuningBeforeState === 'LANDING') {
          const target = Number.isFinite(b.__w2V8LandingTarget) ? b.__w2V8LandingTarget : W() * .62;
          b.x = clamp(tuningBeforeX + (target - tuningBeforeX) * .13, W() * .55, W() - 55);
          b.y = GROUND();
          b.__w2V8LandingTarget = null;
        }

        if (!Number.isFinite(b.__w2V8FireCooldown)) b.__w2V8FireCooldown = 58;
        if (b.__w2V8FireCooldown > 0) b.__w2V8FireCooldown--;
        if (b.state === 'IDLE' && (b.__w2Recovery || 0) <= 0 && b.__w2V8FireCooldown <= 0) {
          const aim = (this.bird.y - (b.y - 32)) * .018;
          this.snowballs.push({x:b.x-27,y:b.y-42,vx:-7,vy:aim,__w2Boss:true,__w2V8Cue:true});
          b.__w2V8FireCooldown = b.enraged ? 62 : 82;
          this.sound?.playSnowThrow?.();
          if (b.__w2VoiceCooldown <= 0) {
            this.sound?.playEmperorAttack?.();
            b.__w2VoiceCooldown = b.enraged ? 86 : 118;
          }
        }

        if (reliefPhase2) {
          const balls = this.snowballs || [];
          const created = [];
          for (let i = snowballCountBefore; i < balls.length; i++) {
            const s = balls[i];
            if (s?.__w2Boss && !s.__w2V6BossShot) created.push(s);
          }
          if (created.length) {
            if ((b.__w2V9BurstCooldown || 0) > 0) {
              this.snowballs = balls.filter(s => !created.includes(s));
            } else {
              const keep = created[0];
              this.snowballs = balls.filter(s => !created.includes(s) || s === keep);
              b.__w2V9BurstCooldown = 118;
            }
          }
        }

        return result;
      };
    }

    const baseUpdate = g.update.bind(g);
    g.update = function() {
      const wasActive = active(this);
      const bossBefore = this.boss;
      const dropsBefore = +this.__w2OrbBossV6?.completedDrops || 0;
      const stateBefore = bossBefore?.state;

      const result = baseUpdate();

      const bossNow = this.boss;
      const activeNow = active(this);
      if (activeNow) {
        for (const shot of (this.snowballs || [])) {
          if (!shot.__w2V6BossShot) continue;
          if (!shot.__w2V6FairTuned) {
            shot.__w2V6FairTuned = true;
            shot.vx = bossNow.enraged ? -5.45 : -5.05;
            shot.__w2V6ExtraGravity = .018;
          } else {
            shot.vx = bossNow.enraged ? -5.45 : -5.05;
            shot.vy += shot.__w2V6ExtraGravity;
          }
        }

        const s = this.__w2OrbBossV6;
        if (s) {
          restore(this, s);
          snapshot(this);
        }
        for (const shot of (this.snowballs || [])) {
          if (shot?.__w2V6BossShot) shot.vx = bossNow.enraged ? -4.75 : -4.45;
        }
      }

      if (wasActive && bossBefore && this.boss === bossBefore) {
        const s = this.__w2OrbBossV6;
        if (s) {
          const drops = Math.max(0, +s.completedDrops || 0);
          const maxHp = Math.max(4, +C.W2_BOSS_HP || 8);
          const expectedHp = drops >= 3 ? 0 : Math.max(1, Math.round(maxHp * ((3 - drops) / 3)));
          if (drops === dropsBefore && bossBefore.hp < expectedHp) {
            bossBefore.hp = expectedHp;
            if (bossBefore.state === 'EXPLODING' && expectedHp > 0) {
              bossBefore.state = stateBefore && stateBefore !== 'EXPLODING' ? stateBefore : 'IDLE';
              bossBefore.timer = 0;
            }
          }
        }
      }

      return result;
    };

    g.__w2BossCombatV6Installed = true;
    g.__w2BossTuningV8Installed = true;
    g.__w2BossPhase2ReliefV9Installed = true;
    g.__w2BossRuntimeV10Installed = true;
    window.__FF_W2_BOSS_RUNTIME_V10__ = {
      version: 'w2-emperor-runtime-v10',
      ownsCombatTuningRelief: true,
      orbDamageOwner: 'w2-boss-orb-v7',
      baseAiOwner: 'w2-boss-polish-v2',
      retiredActivePatches: ['w2-boss-combat-v6','w2-boss-tuning-v8','w2-boss-phase2-relief-v9']
    };
    console.log('[FF-LAB] w2-boss-runtime-v10-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 150) clearInterval(timer);
  }, 80);
  setTimeout(install, 1500);
})();