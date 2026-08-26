(() => {
  'use strict';

  if (window.__FF_W1_OWL_DIALOGUE_LAYER_FIX_V1__) return;

  function roundedRect(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
  }

  function clipOutsideBox(ctx, box, canvasW, canvasH) {
    // Expand by two pixels so the dialogue border always stays visually in front.
    const guard = { x: box.x - 2, y: box.y - 2, w: box.w + 4, h: box.h + 4, r: box.r + 2 };
    ctx.beginPath();
    ctx.rect(0, 0, canvasW, canvasH);
    roundedRect(ctx, guard.x, guard.y, guard.w, guard.h, guard.r);
    ctx.closePath();
    ctx.clip('evenodd');
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.update !== 'function' || typeof game.draw !== 'function' || typeof game.drawOwl !== 'function') return false;
    if (game.__ffW1OwlDialogueLayerFixV1Installed) return true;

    const priorUpdate = game.update.bind(game);
    game.update = function(...args) {
      const result = priorUpdate(...args);
      const cfg = window.CONFIG || {};
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const dialogue = this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && this.__ffVictoryCine?.phase === 'dialogue';

      if (dialogue && this.owl) {
        const box = {
          x: 12,
          y: h - 160,
          w: w - 24,
          h: 145,
          r: 14
        };

        if (!this.__ffW1OwlDialogueScene) {
          this.__ffW1OwlDialogueScene = {
            speaker: { x: w + 64, y: box.y - 12, scale: 1.02 },
            box
          };
        }

        const scene = this.__ffW1OwlDialogueScene;
        scene.box = box;

        // Real/background owl stays separate from the speaking portrait.
        // This is the owl that remains after dialogue and flies away with the hero.
        const bgX = w / 2 + 52;
        const bgY = h / 2 - 32;
        this.owl.x += (bgX - this.owl.x) * 0.18;
        this.owl.y += (bgY - this.owl.y) * 0.18;

        // Separate dialogue owl: fixed just above the right side of the box.
        const speaker = scene.speaker;
        const speakerX = w - 74;
        const speakerY = box.y - 7;
        speaker.x += (speakerX - speaker.x) * 0.18;
        speaker.y += (speakerY - speaker.y) * 0.18;
        speaker.scale += (1.04 - speaker.scale) * 0.10;
      } else if (this.__ffW1OwlDialogueScene) {
        // Once dialogue ends, remove only the speaking owl. The real owl is untouched.
        this.__ffW1OwlDialogueScene = null;
      }

      return result;
    };

    const priorDraw = game.draw.bind(game);
    game.draw = function(...args) {
      const dialogue = this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && this.__ffVictoryCine?.phase === 'dialogue';
      let realOwlPosition = null;

      // Prevent the normal draw pass from rendering the real owl during dialogue.
      // It will be drawn deliberately as the dimmer background owl after the scene darkening.
      if (dialogue && this.owl) {
        realOwlPosition = { x: this.owl.x, y: this.owl.y };
        this.owl.x = -10000;
        this.owl.y = -10000;
      }

      const result = priorDraw(...args);

      if (realOwlPosition && this.owl) {
        this.owl.x = realOwlPosition.x;
        this.owl.y = realOwlPosition.y;
      }

      const scene = this.__ffW1OwlDialogueScene;
      if (!dialogue || !scene?.speaker || !scene.box || !this.ctx) return result;

      const cfg = window.CONFIG || {};
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const ctx = this.ctx;
      const box = scene.box;

      // Slightly dim only the world behind the dialogue presentation.
      // The dialogue box itself remains untouched/readable.
      ctx.save();
      clipOutsideBox(ctx, box, w, h);
      ctx.fillStyle = 'rgba(2, 6, 23, 0.18)';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Background owl: quieter and dimmer, preserved for the post-dialogue fly-away.
      if (this.owl) {
        ctx.save();
        clipOutsideBox(ctx, box, w, h);
        ctx.globalAlpha = 0.50;
        const oldPhase = this.__ffVictoryCine?.phase;
        if (this.__ffVictoryCine) this.__ffVictoryCine.phase = 'background-owl';
        ctx.save();
        ctx.translate(this.owl.x, this.owl.y + Math.sin((this.frame || 0) * 0.075) * 1.1);
        ctx.scale(0.88, 0.88);
        this.drawOwl(ctx, 0, 0, this.frame || 0);
        ctx.restore();
        if (this.__ffVictoryCine) this.__ffVictoryCine.phase = oldPhase;
        ctx.restore();
      }

      // Speaking owl: independent visual layer, clipped by the box so it looks behind it.
      const speaker = scene.speaker;
      ctx.save();
      clipOutsideBox(ctx, box, w, h);
      const glow = ctx.createRadialGradient(speaker.x, speaker.y - 8, 8, speaker.x, speaker.y - 8, 72);
      glow.addColorStop(0, 'rgba(168, 85, 247, 0.14)');
      glow.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(speaker.x, speaker.y - 8, 72, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(speaker.x, speaker.y + Math.sin((this.frame || 0) * 0.11) * 1.6);
      ctx.rotate(Math.sin((this.frame || 0) * 0.045) * 0.035);
      ctx.scale(speaker.scale, speaker.scale);
      this.drawOwl(ctx, 0, 0, (this.frame || 0) + 9);
      ctx.restore();
      ctx.restore();

      return result;
    };

    const priorReset = typeof game.reset === 'function' ? game.reset.bind(game) : null;
    if (priorReset) {
      game.reset = function(...args) {
        this.__ffW1OwlDialogueScene = null;
        return priorReset(...args);
      };
    }

    game.__ffW1OwlDialogueLayerFixV1Installed = true;
    window.__FF_W1_OWL_DIALOGUE_LAYER_FIX_V1__ = {
      version: 'world1-owl-dialogue-layer-fix-v1',
      speakerOwl: 'separate',
      backgroundOwl: 'preserved',
      backgroundDim: 0.18
    };
    console.log('[FF-LAB] world1-owl-dialogue-layer-fix-v1-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();
