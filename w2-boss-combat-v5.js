(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game?.__w2BossOrbV4Installed) return false;
    if (game.__w2BossCombatV5Installed) return true;

    const C = window.CONFIG || {};
    const W = () => C.CANVAS_WIDTH || 360;
    const H = () => C.CANVAS_HEIGHT || 640;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const previousBossUpdate = game.updatePenguinBoss.bind(game);
    game.updatePenguinBoss = function() {
      const boss = this.boss;
      if (!boss || boss.type !== 'penguin') return previousBossUpdate();

      const maxHp = Math.max(4, C.W2_BOSS_HP || 8);
      const phase2Hp = Math.max(1, Math.ceil(maxHp * .25));
      const drops = this.__w2OrbBossV4?.completedDrops || 0;
      const phase2 = boss.hp <= phase2Hp || drops >= 2;

      if (phase2) {
        if (!boss.__w2V5Phase2Started) {
          boss.__w2EnrageTriggered = false;
          boss.enraged = false;
        } else {
          boss.__w2EnrageTriggered = true;
          boss.enraged = true;
        }
      } else {
        boss.__w2EnrageTriggered = true;
        boss.enraged = false;
      }

      const specialAt = boss.enraged ? 72 : 112;
      if (boss.state === 'IDLE' && boss.timer > specialAt) {
        const next = boss.__w2V5NextSpecial || 'SLIDE_PREP';
        boss.state = next;
        boss.timer = 0;
        boss.__w2V5NextSpecial = next === 'SLIDE_PREP' ? 'JUMP_PREP' : 'SLIDE_PREP';

        if (next === 'JUMP_PREP') {
          const minX = W() * .55;
          const maxX = W() - 62;
          const direction = boss.x > W() * .76 ? -1 : 1;
          boss.__w2LandingX = clamp(boss.x + direction * 56, minX, maxX);
          this.sound?.playIceWarn?.();
        } else {
          this.sound?.playPenguinSlide?.();
        }
        this.sound?.playEmperorAttack?.();
        boss.__w2VoiceCooldown = 70;
      }

      const beforeState = boss.state;
      previousBossUpdate();

      if (boss.state === 'W2_ENRAGE') boss.__w2V5Phase2Started = true;

      if (boss.state === 'SLIDING') {
        boss.slideSpeed = boss.enraged ? -13.6 : -11.2;
      }

      if (beforeState === 'SLIDING' && boss.state === 'RETURNING') {
        boss.x = W() + 108;
      }

      if (boss.state === 'LANDING') {
        boss.x = clamp(boss.x, W() * .55, W() - 54);
      }
    };

    const previousUpdate = game.update.bind(game);
    game.update = function() {
      const result = previousUpdate();
      const boss = this.boss;
      const active = this.activeWorld === 1 && boss?.active && boss.type === 'penguin';
      if (!active) return result;

      const fight = this.__w2OrbBossV4;
      const maxHp = Math.max(4, C.W2_BOSS_HP || 8);
      if (fight?.completedDrops === 2 && boss.hp > 0) {
        boss.hp = Math.min(boss.hp, Math.max(1, Math.ceil(maxHp * .25)));
      }

      this.__w2V5ShotIndex = this.__w2V5ShotIndex || 0;
      for (const shot of (this.snowballs || [])) {
        if (!shot.__w2V4BossShot) continue;

        if (!shot.__w2V5ArcTuned) {
          shot.__w2V5ArcTuned = true;
          const lane = this.__w2V5ShotIndex++ % 3;
          shot.__w2V5Lane = lane;
          shot.vx = boss.enraged ? -4.75 : -4.30;

          if (lane === 0) shot.vy -= 1.45;
          else if (lane === 1) shot.vy += 1.30;
          else shot.vy += this.bird.y < H() * .5 ? 1.75 : -1.75;

          shot.__w2V5ExtraGravity = lane === 1 ? .034 : .026;
        } else {
          shot.vx = boss.enraged ? -4.75 : -4.30;
          shot.vy += shot.__w2V5ExtraGravity || .026;
        }
      }

      return result;
    };

    game.__w2BossCombatV5Installed = true;
    console.log('[FF-LAB] w2-boss-combat-v5-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 120) clearInterval(timer);
  }, 80);
  setTimeout(install, 1300);
})();
