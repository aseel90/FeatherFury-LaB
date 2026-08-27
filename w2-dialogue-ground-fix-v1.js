(() => {
  'use strict';

  function install() {
    const game = window.game;
    const C = window.CONFIG || {};
    if (!game || typeof game.draw !== 'function') return false;
    if (game.__w2DialogueGroundFixV1Installed) return true;

    const priorDraw = game.draw.bind(game);

    function drawCleanIceGround(g) {
      const ctx = g.ctx;
      if (!ctx) return;
      const W = Number(C.CANVAS_WIDTH) || 360;
      const H = Number(C.CANVAS_HEIGHT) || 640;
      const gh = Number(C.GROUND_HEIGHT) || 70;
      const gy = H - gh;
      const img = window.__FF_W2_ENV_IMAGES_V1__?.ground;

      ctx.save();
      if (img && img.complete && img.naturalWidth && img.naturalHeight) {
        const drawH = gh + 12;
        const drawY = gy - 12;
        const scale = drawH / img.naturalHeight;
        const tileW = Math.max(1, img.naturalWidth * scale);
        const phase = ((Number(g.groundOffset) || 0) * 0.96) % tileW;
        for (let x = -phase - tileW; x < W + tileW; x += tileW) {
          ctx.drawImage(img, x, drawY, tileW, drawH);
        }
      } else {
        const grd = ctx.createLinearGradient(0, gy - 12, 0, H);
        grd.addColorStop(0, '#bfeef7');
        grd.addColorStop(.22, '#8fd8e8');
        grd.addColorStop(1, '#2f7897');
        ctx.fillStyle = grd;
        ctx.fillRect(0, gy - 12, W, gh + 12);
      }
      ctx.globalAlpha = .24;
      ctx.strokeStyle = '#eefcff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, gy + .5);
      ctx.lineTo(W, gy + .5);
      ctx.stroke();
      ctx.restore();
    }

    function redrawDialogue(g) {
      const ctx = g.ctx;
      if (!ctx) return;
      const W = Number(C.CANVAS_WIDTH) || 360;
      const H = Number(C.CANVAS_HEIGHT) || 640;
      const boxW = W - 24;
      const boxH = 145;
      const boxX = 12;
      const boxY = H - boxH - 15;
      const r = 14;

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxW, boxH, r);
      else ctx.rect(boxX, boxY, boxW, boxH);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8, r - 3);
      else ctx.rect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);
      ctx.stroke();

      ctx.font = 'bold 13.5px "Tajawal", "Changa", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      let curY = boxY + 28;
      if (g.storyText1) curY = g.drawWrappedDialogueText(ctx, g.storyText1, W / 2, curY, boxW - 20, 20);
      if (g.storyText2) {
        curY += 4;
        curY = g.drawWrappedDialogueText(ctx, g.storyText2, W / 2, curY, boxW - 20, 20);
      }

      if (g.storyCompleted) {
        let actionText = '';
        try {
          const tr = I18N?.[g.lang];
          actionText = g.state === 'STORY' ? tr?.tapToLaunch : tr?.tapToContinue;
        } catch (_) {}
        if (actionText && Math.sin((Number(g.frame) || 0) * .1) > 0) {
          ctx.font = 'bold 12.5px "Tajawal", "Changa", sans-serif';
          ctx.fillStyle = '#f1c40f';
          ctx.fillText(actionText, W / 2, boxY + boxH - 12);
        }
      }
      ctx.restore();
    }

    game.draw = function(...args) {
      const result = priorDraw(...args);
      if (this.activeWorld !== 1) return result;
      if (!['STORY', 'BOSS_INTRO', 'BOSS_OUTRO'].includes(this.state)) return result;
      drawCleanIceGround(this);
      redrawDialogue(this);
      return result;
    };

    game.__w2DialogueGroundFixV1Installed = true;
    window.__FF_W2_DIALOGUE_GROUND_FIX_V1__ = {
      version: 'w2-dialogue-ground-cleanup-v1',
      removesLegacyStripedGroundInDialogueScenes: true,
      affectsGameplayGeometry: false
    };
    console.log('[FF-LAB] World 2 dialogue ground cleanup installed');
    return true;
  }

  if (!install()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (install() || tries > 120) clearInterval(timer);
    }, 50);
  }
})();
