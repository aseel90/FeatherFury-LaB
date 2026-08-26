(() => {
  'use strict';

  if (window.__FF_W1_OWL_DIALOGUE_LAYER_FIX_V2__) return;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function getLayout(w, h) {
    // Match the stable runtime dialogue box exactly, then derive every owl position from it.
    const boxH = 145;
    const box = {
      x: 12,
      y: h - boxH - 15,
      w: w - 24,
      h: boxH,
      r: 14
    };

    const widthScale = clamp(w / 360, 0.88, 1.18);
    const speakerScale = clamp(0.90 * widthScale, 0.79, 1.02);
    const backgroundScale = clamp(0.64 * widthScale, 0.56, 0.76);

    const speaker = {
      x: clamp(box.x + box.w * 0.80, 52, w - 46),
      // The lower edge sits a few logical pixels behind the box border, not half the owl.
      y: box.y - 35 * speakerScale,
      scale: speakerScale
    };

    const background = {
      x: clamp(w * 0.68, 86, w - 72),
      y: clamp(h * 0.45, 160, box.y - 118),
      scale: backgroundScale
    };

    return { box, speaker, background };
  }

  function clipAboveDialogue(ctx, box, w) {
    ctx.beginPath();
    ctx.rect(0, 0, w, Math.max(0, box.y - 2));
    ctx.clip();
  }

  function dimWorldAroundDialogue(ctx, box, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.16)';
    // Four rectangles avoid even-odd clipping inconsistencies on older mobile Safari builds.
    ctx.fillRect(0, 0, w, Math.max(0, box.y));
    ctx.fillRect(0, box.y, box.x, box.h);
    ctx.fillRect(box.x + box.w, box.y, Math.max(0, w - box.x - box.w), box.h);
    ctx.fillRect(0, box.y + box.h, w, Math.max(0, h - box.y - box.h));
    ctx.restore();
  }

  function hideCinematicHud() {
    document.getElementById('gameHud')?.classList.add('hidden');
    document.getElementById('gameHint')?.classList.add('hidden');
    document.getElementById('bossWarning')?.classList.add('hidden');
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.update !== 'function' || typeof game.draw !== 'function' || typeof game.drawOwl !== 'function') return false;
    if (game.__ffW1OwlDialogueLayerFixV2Installed) return true;

    const priorUpdate = game.update.bind(game);
    game.update = function(...args) {
      const result = priorUpdate(...args);
      const cfg = window.CONFIG || {};
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const w1Outro = this.activeWorld === 0 && (this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY');
      const dialogue = this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && this.__ffVictoryCine?.phase === 'dialogue';

      if (w1Outro) hideCinematicHud();

      if (dialogue && this.owl) {
        const layout = getLayout(w, h);
        if (!this.__ffW1OwlDialogueSceneV2) {
          this.__ffW1OwlDialogueSceneV2 = {
            speaker: {
              x: Math.min(w + 24, layout.speaker.x + 54),
              y: layout.speaker.y,
              scale: layout.speaker.scale
            },
            layout
          };
        }

        const scene = this.__ffW1OwlDialogueSceneV2;
        scene.layout = layout;

        // Real/background owl is deliberately smaller and farther from the dialogue portrait.
        // This is the same owl object that survives the dialogue and later flies away with the hero.
        this.owl.x += (layout.background.x - this.owl.x) * 0.16;
        this.owl.y += (layout.background.y - this.owl.y) * 0.16;

        const speaker = scene.speaker;
        speaker.x += (layout.speaker.x - speaker.x) * 0.20;
        speaker.y += (layout.speaker.y - speaker.y) * 0.20;
        speaker.scale += (layout.speaker.scale - speaker.scale) * 0.14;
      } else if (this.__ffW1OwlDialogueSceneV2) {
        // Dialogue portrait disappears only; real/background owl remains for FLY_AWAY.
        this.__ffW1OwlDialogueSceneV2 = null;
      }

      return result;
    };

    const priorDraw = game.draw.bind(game);
    game.draw = function(...args) {
      const dialogue = this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && this.__ffVictoryCine?.phase === 'dialogue';
      let realOwlPosition = null;

      // Suppress the runtime's normal owl draw during dialogue so the two layers are fully independent.
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

      const scene = this.__ffW1OwlDialogueSceneV2;
      if (!dialogue || !scene?.speaker || !scene.layout || !this.ctx) return result;

      const cfg = window.CONFIG || {};
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const ctx = this.ctx;
      const { box, background } = scene.layout;
      const speaker = scene.speaker;

      // De-emphasize the world during dialogue, but leave the dialogue box itself untouched.
      dimWorldAroundDialogue(ctx, box, w, h);

      // Background owl: clearly secondary and spatially separated from the speaking portrait.
      if (this.owl) {
        ctx.save();
        clipAboveDialogue(ctx, box, w);
        ctx.globalAlpha = 0.30;
        const oldPhase = this.__ffVictoryCine?.phase;
        if (this.__ffVictoryCine) this.__ffVictoryCine.phase = 'background-owl';
        ctx.save();
        ctx.translate(this.owl.x, this.owl.y + Math.sin((this.frame || 0) * 0.070) * 0.9);
        ctx.scale(background.scale, background.scale);
        this.drawOwl(ctx, 0, 0, this.frame || 0);
        ctx.restore();
        if (this.__ffVictoryCine) this.__ffVictoryCine.phase = oldPhase;
        ctx.restore();
      }

      // Speaking owl: compact, readable, and anchored to the actual box rather than the viewport.
      ctx.save();
      clipAboveDialogue(ctx, box, w);
      const glow = ctx.createRadialGradient(speaker.x, speaker.y - 7, 9, speaker.x, speaker.y - 7, 60 * speaker.scale);
      glow.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
      glow.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(speaker.x, speaker.y - 7, 60 * speaker.scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(speaker.x, speaker.y + Math.sin((this.frame || 0) * 0.105) * 1.2);
      ctx.rotate(Math.sin((this.frame || 0) * 0.043) * 0.028);
      ctx.scale(speaker.scale, speaker.scale);
      this.drawOwl(ctx, 0, 0, (this.frame || 0) + 9);
      ctx.restore();
      ctx.restore();

      return result;
    };

    const priorReset = typeof game.reset === 'function' ? game.reset.bind(game) : null;
    if (priorReset) {
      game.reset = function(...args) {
        this.__ffW1OwlDialogueSceneV2 = null;
        return priorReset(...args);
      };
    }

    game.__ffW1OwlDialogueLayerFixV2Installed = true;
    window.__FF_W1_OWL_DIALOGUE_LAYER_FIX_V2__ = {
      version: 'world1-owl-dialogue-layer-fix-v2',
      speakerOwl: 'responsive-separate-layer',
      backgroundOwl: 'secondary-and-preserved',
      backgroundDim: 0.16,
      hudHiddenDuringOutro: true,
      layoutFor: getLayout
    };
    console.log('[FF-LAB] world1-owl-dialogue-layer-fix-v2-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();
