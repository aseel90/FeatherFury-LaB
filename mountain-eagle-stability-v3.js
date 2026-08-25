(() => {
  'use strict';

  if (window.__FF_MOUNTAIN_EAGLE_STABILITY_V3__) return;

  const MULTIPLIER = 0.50;
  let attempts = 0;

  function install() {
    if (!window.game || !window.__FF_CHARACTER_ABILITIES_V2__ || typeof window.game.update !== 'function') return false;
    if (window.__FF_MOUNTAIN_EAGLE_STABILITY_V3__) return true;

    const game = window.game;
    const baseUpdate = game.update.bind(game);

    game.update = function(...args) {
      if (this.activeSkin !== 'eagle') return baseUpdate(...args);

      const gravityBefore = !!this.gravityFlipped;
      const savedSkin = this.activeSkin;
      let windBefore = null;

      if (this.gravityFlipped && this.bird && this.state !== 'GAMEOVER') {
        this.bird.velocity += CONFIG.GRAVITY * (1 - MULTIPLIER);
      }

      if (typeof this.windForce === 'number' && this.windForce !== 0) {
        windBefore = this.windForce;
        this.windForce *= MULTIPLIER;
      }

      this.activeSkin = 'classic';
      let result;
      try {
        result = baseUpdate(...args);
      } finally {
        this.activeSkin = savedSkin;
      }

      if (windBefore !== null && typeof this.windForce === 'number') {
        const maxExpectedScaled = Math.abs(windBefore) * MULTIPLIER + 0.001;
        if (Math.abs(this.windForce) <= maxExpectedScaled) {
          this.windForce /= MULTIPLIER;
        }
      }

      const gravityAfter = !!this.gravityFlipped;
      if (gravityAfter !== gravityBefore) {
        try {
          this.floatingText.push({
            text: 'STABILITY 50%',
            x: this.bird.x,
            y: this.bird.y - 24,
            life: 1.15,
            color: '#a3e635'
          });
        } catch (_) {}
      }

      return result;
    };

    try {
      const info = window.__FF_CHARACTER_ABILITIES_V2__.abilities?.eagle;
      if (info) info.detail = 'Special gravity and wind effects are 50% weaker.';
      const constants = window.__FF_CHARACTER_ABILITIES_V2__.constants;
      if (constants) constants.eagleEnvironmentMultiplier = MULTIPLIER;
    } catch (_) {}

    window.__FF_MOUNTAIN_EAGLE_STABILITY_V3__ = {
      version: 'mountain-eagle-stability-v3',
      environmentMultiplier: MULTIPLIER
    };
    return true;
  }

  if (install()) return;

  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 120) clearInterval(timer);
  }, 50);
})();