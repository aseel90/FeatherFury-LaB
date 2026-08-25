(() => {
  'use strict';

  if (window.__FF_CHARACTER_ABILITIES_V2__) return;
  if (!window.game) return;

  const game = window.game;
  const VERSION = 'character-abilities-v2';
  const PIGEON_PERFECT_RADIUS = 24; // Base is 20: +20% precision window.
  const FALCON_FEVER_MULTIPLIER = 1.25;
  const PHOENIX_CHARGE_MULTIPLIER = 1.20;
  const GHOST_PHASE_FRAMES = 75;
  const CYBER_SHIELD_FRAMES = 60;
  const EAGLE_GRAVITY_RECOVERY_FRAMES = 90;
  const KING_BONUS_EVERY = 3;

  const abilityInfo = Object.freeze({
    classic: { name: 'Balanced', detail: 'No gameplay modifier.' },
    pigeon: { name: 'Precision', detail: 'Perfect Pass window is 20% wider.' },
    falcon: { name: 'Predator Fever', detail: 'Fever lasts 25% longer.' },
    phoenix: { name: 'Ember Charge', detail: 'Fever charge gains are 20% stronger.' },
    cyber: { name: 'Energy Shield', detail: 'Blocks the first fatal hit each run.' },
    ghost: { name: 'Phase', detail: 'Phases through the first fatal collision each run.' },
    king: { name: 'Royal Fortune', detail: 'Medium coin magnet and +1 bonus coin every 3 collected coins.' },
    eagle: { name: 'Stability', detail: 'Recovers quickly from gravity/environmental disruption.' }
  });

  function hudText(text, color) {
    try {
      game.floatingText.push({
        text,
        x: game.bird.x,
        y: game.bird.y - 24,
        life: 1.15,
        color
      });
    } catch (_) {}
  }

  function burst(color, count = 14) {
    try {
      for (let i = 0; i < count; i++) {
        game.particles.push({
          x: game.bird.x,
          y: game.bird.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          size: 2 + Math.random() * 2,
          color,
          life: 0.75
        });
      }
    } catch (_) {}
  }

  function maxFeverFor(g) {
    return g.activeWorld === 2 ? 150 : (g.activeWorld === 1 ? 120 : CONFIG.FEVER_MAX);
  }

  if (typeof game.reset === 'function') {
    const baseReset = game.reset.bind(game);
    game.reset = function(...args) {
      const result = baseReset(...args);
      this.ghostPhaseUsed = false;
      this.kingCoinsCollected = 0;
      this.eagleGravityRecoveryTimer = 0;
      this.__ffLastGravityFlipped = !!this.gravityFlipped;
      this.cyberShieldUsed = false;

      if (this.activeSkin === 'phoenix') {
        this.fever = 0;
        try { document.getElementById('feverBarFill').style.width = '0%'; } catch (_) {}
      }
      return result;
    };
  }

  if (typeof game.birdJump === 'function') {
    const baseBirdJump = game.birdJump.bind(game);
    game.birdJump = function(...args) {
      const result = baseBirdJump(...args);
      if (this.activeSkin === 'pigeon' && this.bird) {
        const jumpPower = CONFIG.JUMP_FORCE;
        this.bird.velocity = this.gravityFlipped ? -jumpPower : jumpPower;
      }
      return result;
    };
  }

  if (typeof game.gameOver === 'function') {
    const baseGameOver = game.gameOver.bind(game);
    game.gameOver = function(isVictory = false, ...args) {
      if (!isVictory && this.state !== 'GAMEOVER') {
        if (this.activeSkin === 'cyber' && !this.cyberShieldUsed && this.invincibleTimer <= 0) {
          this.cyberShieldUsed = true;
          this.invincibleTimer = CYBER_SHIELD_FRAMES;
          if (this.bird) this.bird.velocity = this.gravityFlipped ? 5.2 : -5.2;
          try { this.sound.playLaser(); } catch (_) {}
          this.screenShake = Math.max(this.screenShake || 0, 5);
          hudText('ENERGY SHIELD! 🛡️', '#22d3ee');
          burst('#22d3ee', 16);
          return;
        }

        if (this.activeSkin === 'ghost') {
          if (!this.ghostPhaseUsed && this.invincibleTimer <= 0) {
            this.ghostPhaseUsed = true;
            this.invincibleTimer = GHOST_PHASE_FRAMES;
            try { this.sound.playLaser(); } catch (_) {}
            hudText('PHASE! ✦', '#c4b5fd');
            burst('#c4b5fd', 15);
            return;
          }

          const savedSkin = this.activeSkin;
          this.activeSkin = 'classic';
          try {
            return baseGameOver(isVictory, ...args);
          } finally {
            this.activeSkin = savedSkin;
          }
        }
      }
      return baseGameOver(isVictory, ...args);
    };
  }

  if (typeof game.update === 'function') {
    const baseUpdate = game.update.bind(game);

    game.update = function(...args) {
      const skin = this.activeSkin;
      const pigeonSnapshot = skin === 'pigeon' && Array.isArray(this.pillars)
        ? this.pillars.map(p => ({ p, scored: !!p.scored }))
        : null;
      const kingCoinsBefore = skin === 'king' ? (this.sessionCoins || 0) : 0;
      const gravityBefore = !!this.gravityFlipped;
      const feverBefore = this.fever || 0;
      const feverActiveBefore = !!this.feverActive;

      const result = baseUpdate(...args);

      if (skin === 'pigeon' && pigeonSnapshot && this.state !== 'GAMEOVER') {
        for (const entry of pigeonSnapshot) {
          const p = entry.p;
          if (!entry.scored && p && p.scored) {
            const d = Math.abs(this.bird.y - p.gapY);
            if (d >= 20 && d < PIGEON_PERFECT_RADIUS) {
              this.score += 1;
              try { document.getElementById('currentScoreDisplay').textContent = this.score; } catch (_) {}
              const perfectTxt = (window.I18N && I18N[this.lang] && I18N[this.lang].perfectPass) || 'PERFECT +2';
              this.floatingText.push({ text: perfectTxt, x: this.bird.x, y: this.bird.y - 20, life: 1, color: '#cbd5e1' });
              try { this.sound.playScore(); } catch (_) {}
            }
          }
        }
      }

      if (skin === 'falcon' && this.feverActive) {
        const full = Math.round(CONFIG.FEVER_DURATION * FALCON_FEVER_MULTIPLIER);
        try {
          document.getElementById('feverBarFill').style.width =
            `${Math.max(0, Math.min(100, (this.feverTimer / full) * 100))}%`;
        } catch (_) {}
      }

      if (skin === 'phoenix' && !feverActiveBefore && !this.feverActive && this.fever > feverBefore) {
        const rawGain = this.fever - feverBefore;
        const expected = rawGain * PHOENIX_CHARGE_MULTIPLIER;
        const alreadyBoosted = rawGain >= (CONFIG.FEVER_PER_COIN * PHOENIX_CHARGE_MULTIPLIER - 0.01);
        if (!alreadyBoosted) {
          const maxFever = maxFeverFor(this);
          this.fever = Math.min(maxFever, feverBefore + expected);
          try {
            document.getElementById('feverBarFill').style.width =
              `${Math.min(100, (this.fever / maxFever) * 100)}%`;
          } catch (_) {}
          if (this.fever >= maxFever) {
            this.feverActive = true;
            this.feverTimer = CONFIG.FEVER_DURATION;
            try { document.getElementById('feverBarFill').classList.add('max'); } catch (_) {}
            try { this.sound.playLaunch(); } catch (_) {}
            this.screenShake = Math.max(this.screenShake || 0, 8);
          }
        }
      }

      if (skin === 'king') {
        const coreDelta = (this.sessionCoins || 0) - kingCoinsBefore;
        if (coreDelta > 0) {
          const collected = Math.max(1, Math.round(coreDelta / 2));
          let correctedDelta = 0;
          for (let i = 0; i < collected; i++) {
            this.kingCoinsCollected = (this.kingCoinsCollected || 0) + 1;
            correctedDelta += 1;
            if (this.kingCoinsCollected % KING_BONUS_EVERY === 0) correctedDelta += 1;
          }
          this.sessionCoins = kingCoinsBefore + correctedDelta;
          try { document.getElementById('sessionCoinDisplay').textContent = this.sessionCoins; } catch (_) {}
          if (correctedDelta > collected) hudText('ROYAL BONUS +1 👑', '#fbbf24');
        }
      }

      if (skin === 'eagle') {
        const gravityAfter = !!this.gravityFlipped;
        if (!gravityBefore && gravityAfter) {
          this.eagleGravityRecoveryTimer = EAGLE_GRAVITY_RECOVERY_FRAMES;
          hudText('STABILITY', '#a3e635');
        } else if (gravityBefore && !gravityAfter) {
          this.eagleGravityRecoveryTimer = 0;
        } else if (this.eagleGravityRecoveryTimer > 0) {
          this.eagleGravityRecoveryTimer--;
          if (this.eagleGravityRecoveryTimer <= 0 && this.gravityFlipped) {
            this.gravityFlipped = false;
            this.eagleGravityRecoveryTimer = 0;
            hudText('STABLE ✓', '#a3e635');
          }
        }

        if (typeof this.windForce === 'number' && this.windForce !== 0) this.windForce *= 0.45;
      }

      return result;
    };
  }

  game.__characterAbilitiesV2Installed = true;
  window.__FF_CHARACTER_ABILITIES_V2__ = {
    version: VERSION,
    abilities: abilityInfo,
    constants: {
      pigeonPerfectRadius: PIGEON_PERFECT_RADIUS,
      falconFeverMultiplier: FALCON_FEVER_MULTIPLIER,
      phoenixChargeMultiplier: PHOENIX_CHARGE_MULTIPLIER,
      cyberShieldFrames: CYBER_SHIELD_FRAMES,
      ghostPhaseFrames: GHOST_PHASE_FRAMES,
      kingBonusEvery: KING_BONUS_EVERY,
      eagleGravityRecoveryFrames: EAGLE_GRAVITY_RECOVERY_FRAMES
    }
  };
})();