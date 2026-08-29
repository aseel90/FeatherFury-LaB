(() => {
  'use strict';

  if (window.__FF_W1_OWL_DIALOGUE_LAYER_FIX_V3__) return;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function getLayout(w, h) {
    const boxH = 145;
    const box = {
      x: 12,
      y: h - boxH - 15,
      w: w - 24,
      h: boxH
    };

    const widthScale = clamp(w / 360, 0.88, 1.18);
    const speakerScale = clamp(0.90 * widthScale, 0.79, 1.02);
    const backgroundScale = clamp(0.64 * widthScale, 0.56, 0.76);

    return {
      box,
      speaker: {
        x: clamp(box.x + box.w * 0.80, 52, w - 46),
        y: box.y - 35 * speakerScale,
        scale: speakerScale
      },
      background: {
        x: clamp(w * 0.68, 86, w - 72),
        y: clamp(h * 0.45, 160, box.y - 118),
        scale: backgroundScale
      }
    };
  }

  function hideCinematicHud() {
    document.getElementById('gameHud')?.classList.add('hidden');
    document.getElementById('gameHint')?.classList.add('hidden');
    document.getElementById('bossWarning')?.classList.add('hidden');
  }

  function dimDialogueWorld(ctx, box, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.16)';
    ctx.fillRect(0, 0, w, Math.max(0, box.y));
    ctx.fillRect(0, box.y, box.x, box.h);
    ctx.fillRect(box.x + box.w, box.y, Math.max(0, w - box.x - box.w), box.h);
    ctx.fillRect(0, box.y + box.h, w, Math.max(0, h - box.y - box.h));
    ctx.restore();
  }

  function clipAboveDialogue(ctx, box, w) {
    ctx.beginPath();
    ctx.rect(0, 0, w, Math.max(0, box.y - 2));
    ctx.clip();
  }

  function drawTalkEffects(ctx, x, y, scale, frame, talking) {
    const pulse = 0.5 + Math.sin(frame * 0.12) * 0.5;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const glow = ctx.createRadialGradient(x, y - 8, 10, x, y - 8, 62 * scale);
    glow.addColorStop(0, `rgba(168,85,247,${0.07 + pulse * 0.07})`);
    glow.addColorStop(1, 'rgba(88,28,135,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - 8, 62 * scale, 0, Math.PI * 2);
    ctx.fill();

    if (talking) {
      ctx.strokeStyle = `rgba(216,180,254,${0.18 + pulse * 0.24})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y - 9, (42 + pulse * 5) * scale, -0.75, 0.75);
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const a = frame * 0.035 + i * 2.1;
        const r = (47 + i * 4) * scale;
        const px = x + Math.cos(a) * r;
        const py = y - 7 + Math.sin(a) * r * 0.42;
        ctx.fillStyle = `rgba(192,132,252,${0.28 + pulse * 0.25})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.2 + pulse * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function beginWorld1FlyAway(game) {
    if (!game || game.activeWorld !== 0 || game.state !== 'BOSS_OUTRO' || !game.storyCompleted) return false;

    const cfg = window.CONFIG || {};
    const w = Number(cfg.CANVAS_WIDTH) || 360;
    game.__ffVictoryCine = {
      phase: 'depart',
      frame: 0,
      birdX: game.bird?.x || 0,
      birdY: game.bird?.y || 0,
      owlX: game.owl?.x || 0,
      owlY: game.owl?.y || 0,
      endX: w + 120
    };
    game.__ffVictoryAllowFinish = false;
    game.state = 'FLY_AWAY';
    game.storyCompleted = true;
    game.__ffW1FlyAwayStarted = true;
    game.__ffW1OwlDialogueSceneV3 = null;
    if (Array.isArray(game.bossFeathers)) game.bossFeathers.length = 0;
    if (Array.isArray(game.powerOrbs)) game.powerOrbs.length = 0;
    hideCinematicHud();
    try { game.sound?.playWhoosh?.(); } catch (_) {}
    return true;
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.update !== 'function' || typeof game.draw !== 'function' || typeof game.drawOwl !== 'function') return false;
    if (game.__ffW1OwlDialogueLayerFixV3Installed) return true;

    const priorGameOver = typeof game.gameOver === 'function' ? game.gameOver.bind(game) : null;
    if (priorGameOver) {
      game.gameOver = function(isVictory = false, ...args) {
        const departing = isVictory && this.activeWorld === 0 && this.state === 'FLY_AWAY' && this.__ffVictoryCine?.phase === 'depart';
        if (departing && !this.__ffVictoryAllowFinish) return;
        return priorGameOver(isVictory, ...args);
      };
    }

    const priorUpdate = game.update.bind(game);
    game.update = function(...args) {
      const cfg = window.CONFIG || {};
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;

      const enteringOutro = this.activeWorld === 0 && this.state === 'BOSS_OUTRO' &&
        (!this.__ffVictoryCine || !['approach', 'dialogue'].includes(this.__ffVictoryCine.phase));
      if (enteringOutro) {
        this.__ffVictoryCine = { phase: 'approach', frame: 0 };
        this.__ffVictoryAllowFinish = false;
        if (Array.isArray(this.bossFeathers)) this.bossFeathers.length = 0;
        if (Array.isArray(this.powerOrbs)) this.powerOrbs.length = 0;
        try { this.sound?.stopBossAmbiance?.(); } catch (_) {}
      }

      const cine = this.__ffVictoryCine;
      if (this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && cine?.phase === 'approach') {
        // Let both characters meet first; dialogue starts only after they are staged face-to-face.
        const completed = this.storyCompleted;
        this.storyCompleted = true;
        const result = priorUpdate(...args);
        this.storyCompleted = completed;

        cine.frame += 1;
        const targetBirdX = w / 2 - 52;
        const targetOwlX = w / 2 + 52;
        const targetY = h / 2 - 32;
        this.bird.x += (targetBirdX - this.bird.x) * 0.075;
        this.bird.y += (targetY - this.bird.y) * 0.065;
        this.owl.x += (targetOwlX - this.owl.x) * 0.07;
        this.owl.y += (targetY - this.owl.y) * 0.06;
        this.bird.rotation += (0 - this.bird.rotation) * 0.15;
        this.bird.wingCycle = Math.sin((this.frame || 0) * 0.45);

        if ((Math.abs(this.bird.x - targetBirdX) < 2.5 && Math.abs(this.owl.x - targetOwlX) < 3) || cine.frame > 105) {
          this.bird.x = targetBirdX;
          this.owl.x = targetOwlX;
          this.bird.y = targetY;
          this.owl.y = targetY;
          cine.phase = 'dialogue';
        }
        hideCinematicHud();
        return result;
      }

      if (this.activeWorld === 0 && this.state === 'FLY_AWAY' && cine?.phase === 'depart') {
        // Core keeps particles/background alive; this owner controls the paired exit trajectory.
        const result = priorUpdate(...args);
        cine.frame += 1;
        const t = clamp(cine.frame / 90, 0, 1);
        const easeOut = t * t;
        const lift = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        this.bird.x = cine.birdX + (cine.endX - cine.birdX) * easeOut;
        this.owl.x = cine.owlX + (cine.endX + 42 - cine.owlX) * easeOut;
        this.bird.y = cine.birdY - 58 * lift;
        this.owl.y = cine.owlY - 62 * lift;
        this.bird.rotation = -0.08 - 0.20 * easeOut;
        this.bird.wingCycle = Math.sin((this.frame || 0) * 0.72);
        hideCinematicHud();

        if (t >= 1 && !this.__ffVictoryAllowFinish) {
          this.__ffVictoryAllowFinish = true;
          priorGameOver?.(true);
        }
        return result;
      }

      const result = priorUpdate(...args);
      const w1Outro = this.activeWorld === 0 && (this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY');
      const dialogue = this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && this.__ffVictoryCine?.phase === 'dialogue';

      if (w1Outro) hideCinematicHud();

      if (dialogue && this.owl) {
        const layout = getLayout(w, h);
        this.__ffW1OwlDialogueSceneV3 = { layout };
        this.owl.x += (layout.background.x - this.owl.x) * 0.16;
        this.owl.y += (layout.background.y - this.owl.y) * 0.16;
      } else if (this.__ffW1OwlDialogueSceneV3) {
        this.__ffW1OwlDialogueSceneV3 = null;
      }

      return result;
    };

    const interceptOutroContinue = e => {
      if (game.activeWorld !== 0 || game.state !== 'BOSS_OUTRO' || !game.storyCompleted) return;
      e?.preventDefault?.();
      e?.stopPropagation?.();
      e?.stopImmediatePropagation?.();
      beginWorld1FlyAway(game);
    };
    const interceptOutroKey = e => {
      if (!['Space', 'ArrowUp', 'KeyW', 'Enter'].includes(e?.code)) return;
      interceptOutroContinue(e);
    };
    document.addEventListener('pointerdown', interceptOutroContinue, true);
    document.addEventListener('keydown', interceptOutroKey, true);

    const priorDraw = game.draw.bind(game);
    game.draw = function(...args) {
      const w1OwlScene = this.activeWorld === 0 && (this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY');
      const dialogue = this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && this.__ffVictoryCine?.phase === 'dialogue';
      let realOwlPosition = null;

      // Hide the runtime owl for the whole outro, not only during dialogue.
      // This removes the full-size owl that used to flash in, and prevents a size jump at FLY_AWAY.
      if (w1OwlScene && this.owl) {
        realOwlPosition = { x: this.owl.x, y: this.owl.y };
        this.owl.x = -10000;
        this.owl.y = -10000;
      }

      const result = priorDraw(...args);

      if (realOwlPosition && this.owl) {
        this.owl.x = realOwlPosition.x;
        this.owl.y = realOwlPosition.y;
      }

      if (!w1OwlScene || !this.owl || !this.ctx) return result;

      const cfg = window.CONFIG || {};
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const ctx = this.ctx;
      const layout = getLayout(w, h);
      const { box, speaker, background } = layout;

      if (dialogue) dimDialogueWorld(ctx, box, w, h);

      // One real/background owl from first appearance through the entire fly-away.
      // The wrapper scale is constant, so it cannot grow when the dialogue closes.
      ctx.save();
      if (dialogue) {
        clipAboveDialogue(ctx, box, w);
        ctx.globalAlpha = 0.30;
      } else {
        ctx.globalAlpha = 0.72;
      }
      ctx.translate(this.owl.x, this.owl.y);
      ctx.scale(background.scale, background.scale);
      this.drawOwl(ctx, 0, 0, this.frame || 0);
      ctx.restore();

      if (dialogue) {
        // One fixed dialogue portrait: no entry tween, no scale animation, no bob or tilt.
        // Freeze the owl artwork itself and animate only the talking effects around it.
        const talking = !this.storyCompleted;
        ctx.save();
        clipAboveDialogue(ctx, box, w);
        drawTalkEffects(ctx, speaker.x, speaker.y, speaker.scale, this.frame || 0, talking);
        ctx.save();
        ctx.translate(speaker.x, speaker.y);
        ctx.scale(speaker.scale, speaker.scale);
        this.drawOwl(ctx, 0, 0, 0);
        ctx.restore();
        ctx.restore();
      }

      return result;
    };

    const priorReset = typeof game.reset === 'function' ? game.reset.bind(game) : null;
    if (priorReset) {
      game.reset = function(...args) {
        this.__ffW1OwlDialogueSceneV3 = null;
        this.__ffW1FlyAwayStarted = false;
        this.__ffVictoryAllowFinish = false;
        return priorReset(...args);
      };
    }

    game.__ffW1OwlDialogueLayerFixV3Installed = true;
    window.__FF_W1_OWL_DIALOGUE_LAYER_FIX_V3__ = {
      version: 'world1-owl-dialogue-layer-fix-v3.3',
      fullSizeIntroRemoved: true,
      speakerScaleMode: 'fixed',
      backgroundScaleMode: 'fixed-through-fly-away',
      talkingAnimation: 'effects-only',
      outroTransition: 'approach-dialogue-paired-fly-away',
      layoutFor: getLayout
    };
    console.log('[FF-LAB] world1-owl-dialogue-layer-fix-v3-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();
