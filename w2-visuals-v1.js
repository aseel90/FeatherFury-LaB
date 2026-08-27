(() => {
  'use strict';

  const ENV_ASSET_KEYS = ['mountains','pines','avalanche','ground','obstacleTop','obstacleBottom'];
  const envAssetState = { started: false, ready: false, images: Object.create(null), failed: [] };

  function ensureEnvironmentAssets() {
    if (envAssetState.ready) return true;
    const data = window.__FF_W2_ENV_ASSET_DATA_V1__;
    if (!data) return false;
    if (envAssetState.started) return false;
    envAssetState.started = true;
    let pending = ENV_ASSET_KEYS.length;
    const finish = () => {
      pending--;
      if (pending <= 0) {
        envAssetState.ready = true;
        window.__FF_W2_ENV_IMAGES_V1__ = envAssetState.images;
      }
    };
    ENV_ASSET_KEYS.forEach(key => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = finish;
      img.onerror = () => { envAssetState.failed.push(key); finish(); };
      img.src = data[key];
      envAssetState.images[key] = img;
    });
    return false;
  }

  function install() {
    const game = window.game;
    if (!game) return false;
    if (game.__w2VisualsV1Installed) return true;
    if (!ensureEnvironmentAssets()) return false;

    const C = window.CONFIG || {};
    const W = () => C.CANVAS_WIDTH || 360;
    const H = () => C.CANVAS_HEIGHT || 640;
    const groundY = () => H() - (C.GROUND_HEIGHT || 70);
    const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
    const mod = (v,m) => ((v % m) + m) % m;

    const bg = {
      travel: 0,
      stageBlend: 0,
      bossBlend: 0,
      lastFrame: null,
      flakes: Array.from({length:72}, (_,i) => ({
        x: (i * 71.13) % 421,
        y: (i * 97.73) % 653,
        s: 0.65 + ((i * 17) % 13) / 10,
        d: 0.8 + ((i * 11) % 9) / 8,
        a: 0.28 + ((i * 7) % 8) / 12
      }))
    };
    const assets = envAssetState.images;

    function advanceEnvironment() {
      const frame = Number(game.frame) || 0;
      if (bg.lastFrame === frame) return;
      bg.lastFrame = frame;
      const targetStage = game.score >= (C.STAGE1_END || 15) ? 1 : 0;
      const targetBoss = game.boss?.active || ['BOSS_WARNING','BOSS_INTRO','BOSS_OUTRO','FLY_AWAY'].includes(game.state) ? 1 : 0;
      bg.stageBlend += (targetStage - bg.stageBlend) * 0.025;
      bg.bossBlend += (targetBoss - bg.bossBlend) * 0.035;
      if (!game.__ffPaused) {
        const speed = game.state === 'STORY' ? 1.05 : (game.feverActive ? (C.SPEED_FEVER || 4.5) : (C.W2_SPEED || 2.2));
        bg.travel += speed;
      }
    }

    function drawTiledImage(ctx, img, travel, y, drawH, alpha, speedFactor, xShift = 0) {
      if (!img || !img.complete || !img.naturalWidth) return;
      const scale = drawH / img.naturalHeight;
      const drawW = img.naturalWidth * scale;
      const off = mod(travel * speedFactor + xShift, drawW);
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let x = -off - drawW; x < W() + drawW; x += drawW) ctx.drawImage(img, x, y, drawW, drawH);
      ctx.restore();
    }

    function drawAurora(ctx, alpha) {
      if (alpha <= 0.01) return;
      const t = game.frame * 0.012;
      ctx.save();
      ctx.globalAlpha = alpha * 0.44;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      const grad = ctx.createLinearGradient(0, 0, W(), 0);
      grad.addColorStop(0, '#22d3ee');
      grad.addColorStop(.45, '#67e8f9');
      grad.addColorStop(.72, '#a78bfa');
      grad.addColorStop(1, '#38bdf8');
      ctx.strokeStyle = grad;
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#22d3ee';
      ctx.beginPath();
      for (let x = -20; x <= W()+20; x += 16) {
        const y = 86 + Math.sin(x * 0.018 + t) * 16 + Math.sin(x * 0.007 - t * 1.4) * 10;
        if (x === -20) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function drawNearIceCliffs(ctx, alpha) {
      const spacing = 150;
      const off = mod(bg.travel * .24, spacing);
      const baseY = groundY() - 4;
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let i = -1; i < Math.ceil(W()/spacing)+2; i++) {
        const idx = i + Math.floor((bg.travel * .24) / spacing);
        const x = i * spacing - off;
        const h = 58 + (Math.sin(idx * 1.9) + 1) * 20;
        ctx.fillStyle = idx % 2 ? '#20394a' : '#28485b';
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x + 22, baseY - h * .65);
        ctx.lineTo(x + 48, baseY - h);
        ctx.lineTo(x + 82, baseY - h * .58);
        ctx.lineTo(x + 112, baseY - h * .82);
        ctx.lineTo(x + spacing, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(218,242,250,.28)';
        ctx.beginPath();
        ctx.moveTo(x + 48, baseY - h);
        ctx.lineTo(x + 31, baseY - h * .62);
        ctx.lineTo(x + 59, baseY - h * .72);
        ctx.lineTo(x + 73, baseY - h * .53);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    function drawFrostBackground(ctx) {
      advanceEnvironment();
      drawAurora(ctx, 0.06 + bg.stageBlend * 0.08 + bg.bossBlend * 0.92);
      drawTiledImage(ctx, assets.mountains, bg.travel, groundY() - 300, 300, .56 + bg.bossBlend*.06, .045);
      drawTiledImage(ctx, assets.pines, bg.travel, groundY() - 242, 242, .50 * (1 - bg.stageBlend*.14) * (1 - bg.bossBlend*.18), .105, 170);
      drawTiledImage(ctx, assets.avalanche, bg.travel, groundY() - 180, 180, bg.stageBlend * (.44 + bg.bossBlend*.10), .16, 90);
      drawNearIceCliffs(ctx, .12 + bg.stageBlend * .38);

      const fogAlpha = 0.065 + bg.stageBlend * 0.12 + bg.bossBlend * .025;
      ctx.save();
      const fog = ctx.createLinearGradient(0, groundY()-155, 0, groundY()+4);
      fog.addColorStop(0, 'rgba(226,242,248,0)');
      fog.addColorStop(.58, `rgba(226,242,248,${fogAlpha * .38})`);
      fog.addColorStop(1, `rgba(226,242,248,${fogAlpha})`);
      ctx.fillStyle = fog;
      ctx.fillRect(0, groundY()-160, W(), 165);

      // Thin horizon mist glues the pines and mountain bases into the snow without filling the gameplay corridor.
      const mistShift = mod(bg.travel * .028, W() + 180);
      ctx.fillStyle = `rgba(232,246,250,${0.025 + bg.stageBlend * .028})`;
      for (let i = -1; i < 4; i++) {
        const mx = i * 170 - mistShift + 40;
        ctx.beginPath();
        ctx.ellipse(mx, groundY() - 92 - (i % 2) * 18, 112, 16, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const snowCount = Math.round(28 + bg.stageBlend * 30 - bg.bossBlend * 12);
      ctx.save();
      for (let i = 0; i < snowCount; i++) {
        const f = bg.flakes[i];
        const x = mod(f.x - bg.travel * f.d * (1 + bg.stageBlend*.42), W()+60) - 30;
        const y = mod(f.y + game.frame * (0.72 + f.s * (.38 + bg.stageBlend*.14)), groundY()-10);
        ctx.globalAlpha = f.a * (0.72 + bg.stageBlend*.24);
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(x, y, clamp(f.s, .8, 2.4), 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawObstacleImage(ctx, img, x, y, w, h, kind) {
      if (!img || !img.complete || !img.naturalWidth || h <= 1) return;
      const srcW = img.naturalWidth, srcH = img.naturalHeight;
      const capSrc = Math.min(140, srcH * .22);
      const capDraw = Math.min(92, Math.max(46, h * .28));
      if (h <= capDraw + 8) {
        ctx.drawImage(img, 0, 0, srcW, srcH, x, y, w, h);
        return;
      }
      if (kind === 'top') {
        const bodySrcH = srcH - capSrc;
        ctx.drawImage(img, 0, 0, srcW, bodySrcH, x, y, w, h - capDraw);
        ctx.drawImage(img, 0, bodySrcH, srcW, capSrc, x, y + h - capDraw, w, capDraw);
      } else {
        ctx.drawImage(img, 0, 0, srcW, capSrc, x, y, w, capDraw);
        ctx.drawImage(img, 0, capSrc, srcW, srcH - capSrc, x, y + capDraw, w, h - capDraw);
      }
    }

    const originalDrawPillars = typeof game.drawPillars === 'function' ? game.drawPillars.bind(game) : null;
    if (originalDrawPillars) {
      game.drawPillars = function() {
        if (this.activeWorld !== 1) return originalDrawPillars();
        drawFrostBackground(this.ctx);
        const gap = C.W2_GAP_SIZE || 146;
        const visualW = 112;
        this.pillars.forEach(p => {
          if (p.smashed) return;
          const botY = p.topHeight + gap;
          const botH = H() - (C.GROUND_HEIGHT || 70) - botY;
          const drawX = p.x - (visualW - p.width) / 2;
          drawObstacleImage(this.ctx, assets.obstacleTop, drawX, 0, visualW, Math.max(1,p.topHeight), 'top');
          drawObstacleImage(this.ctx, assets.obstacleBottom, drawX, botY, visualW, Math.max(1,botH), 'bottom');
        });
      };
    }

    const groundTileCache = { canvas: null, pattern: null, width: 0, height: 0 };

    function ensureGroundTile(ctx, img, drawH) {
      const scale = drawH / img.naturalHeight;
      const tileW = Math.max(1, Math.round(img.naturalWidth * scale));
      const tileH = Math.max(1, Math.round(drawH));
      if (groundTileCache.canvas && groundTileCache.width === tileW && groundTileCache.height === tileH) return groundTileCache;
      const canvas = document.createElement('canvas');
      canvas.width = tileW;
      canvas.height = tileH;
      const tileCtx = canvas.getContext('2d');
      tileCtx.imageSmoothingEnabled = true;
      tileCtx.drawImage(img, 0, 0, tileW, tileH);
      groundTileCache.canvas = canvas;
      groundTileCache.pattern = ctx.createPattern(canvas, 'repeat');
      groundTileCache.width = tileW;
      groundTileCache.height = tileH;
      return groundTileCache;
    }

    function drawFrozenGround(g) {
      const img = assets.ground;
      if (!img || !img.complete || !img.naturalWidth) return;
      advanceEnvironment();
      const ctx = g.ctx;
      const gh = Number(C.GROUND_HEIGHT) || 70;
      const gy = H() - gh;
      const overhang = 12;
      const drawH = gh + overhang;
      const drawY = gy - overhang;
      const tile = ensureGroundTile(ctx, img, drawH);
      if (!tile.pattern || !tile.width) return;
      const phase = mod(bg.travel * .96, tile.width);
      ctx.save();
      ctx.translate(-phase, drawY);
      ctx.fillStyle = tile.pattern;
      ctx.fillRect(0, 0, W() + tile.width + phase, tile.height);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = .32;
      ctx.strokeStyle = '#eefcff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0,gy+.5); ctx.lineTo(W(),gy+.5); ctx.stroke();
      ctx.restore();
    }

    window.drawPenguinMinion = function(ctx,x,y,frame) {
      const wobble = Math.sin(frame*.16 + x*.018)*1.6;
      const throwPose = (Math.floor(frame/18)%5===4) ? 1 : 0;
      ctx.save(); ctx.translate(x+wobble,y);
      ctx.fillStyle='rgba(15,23,42,.24)'; ctx.beginPath(); ctx.ellipse(0,14,12,4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#172033'; ctx.beginPath(); ctx.ellipse(0,0,10.5,14,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#eef6ff'; ctx.beginPath(); ctx.ellipse(0,3,6.5,9.5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#263b55'; ctx.beginPath(); ctx.arc(0,-7,8.8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-3.4,-8,2.6,0,Math.PI*2);ctx.arc(3.4,-8,2.6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#0f172a'; ctx.beginPath();ctx.arc(-3.1,-8,1.2,0,Math.PI*2);ctx.arc(3.7,-8,1.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.moveTo(-3,-3);ctx.lineTo(0,1);ctx.lineTo(4,-3);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#7dd3fc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-8,10.5,Math.PI*1.08,Math.PI*1.92);ctx.stroke();
      ctx.save();ctx.translate(-8,0);ctx.rotate(-.35-throwPose*.42);ctx.fillStyle='#1e2d43';ctx.beginPath();ctx.ellipse(0,0,3.2,8,0,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.save();ctx.translate(8,0);ctx.rotate(.35+throwPose*.72);ctx.fillStyle='#1e2d43';ctx.beginPath();ctx.ellipse(0,0,3.2,8,0,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.fillStyle='#f59e0b';ctx.fillRect(-7,12,5,2.6);ctx.fillRect(2,12,5,2.6);
      ctx.restore();
    };

    game.drawPenguinBossSprite = function(ctx,x,y,frame,enraged) {
      ctx.save(); ctx.translate(x,y);
      const pulse = 1 + Math.sin(frame*.11)*.018;
      ctx.scale(pulse,pulse);
      ctx.fillStyle='rgba(2,6,23,.34)';ctx.beginPath();ctx.ellipse(0,5,39,9,0,0,Math.PI*2);ctx.fill();
      if (enraged) {ctx.shadowBlur=22;ctx.shadowColor='#ef4444';}
      ctx.fillStyle=enraged?'#3f1118':'#111c2e';ctx.beginPath();ctx.ellipse(0,-27,31,38,0,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
      const belly=ctx.createLinearGradient(0,-45,0,0);belly.addColorStop(0,'#f8fafc');belly.addColorStop(1,'#cbd5e1');ctx.fillStyle=belly;ctx.beginPath();ctx.ellipse(0,-18,20,28,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=enraged?'#b91c1c':'#1d4ed8';ctx.beginPath();ctx.moveTo(-25,-29);ctx.lineTo(-37,-2);ctx.lineTo(-18,-10);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(25,-29);ctx.lineTo(37,-2);ctx.lineTo(18,-10);ctx.closePath();ctx.fill();
      ctx.fillStyle=enraged?'#4c1018':'#101b2b';ctx.beginPath();ctx.arc(0,-59,20,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f8fafc';ctx.beginPath();ctx.ellipse(-8,-60,6,5,-.15,0,Math.PI*2);ctx.ellipse(8,-60,6,5,.15,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=enraged?'#ef4444':'#1e3a5f';ctx.beginPath();ctx.arc(-7.3,-60,2.5,0,Math.PI*2);ctx.arc(7.3,-60,2.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.moveTo(-7,-51);ctx.lineTo(0,-43);ctx.lineTo(8,-51);ctx.closePath();ctx.fill();
      const crown=ctx.createLinearGradient(-16,-88,16,-70);crown.addColorStop(0,'#60a5fa');crown.addColorStop(.5,'#e0f2fe');crown.addColorStop(1,'#3b82f6');ctx.fillStyle=crown;ctx.shadowBlur=10;ctx.shadowColor='#38bdf8';ctx.beginPath();ctx.moveTo(-16,-72);ctx.lineTo(-13,-86);ctx.lineTo(-6,-76);ctx.lineTo(0,-91);ctx.lineTo(6,-76);ctx.lineTo(13,-86);ctx.lineTo(16,-72);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(125,211,252,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-31,25,0.18,Math.PI-.18);ctx.stroke();
      ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.ellipse(-15,1,8,3,-.06,0,Math.PI*2);ctx.ellipse(15,1,8,3,.06,0,Math.PI*2);ctx.fill();
      ctx.restore();
    };

    game.drawBlizzardIntro = function() {
      const ctx=this.ctx;
      ctx.save();
      const count=42;
      for(let i=0;i<count;i++){
        const seed=i*37.71;
        const x=mod(W()+70-((this.frame*(8.5+(i%5)*.65)+seed*5.1)%(W()+140)),W()+140)-70;
        const y=mod(seed*11.3+this.frame*(2.2+(i%4)*.3),H());
        const len=18+(i%7)*4;
        ctx.globalAlpha=.28+(i%5)*.08;
        ctx.strokeStyle='#f8fafc';ctx.lineWidth=1+(i%3)*.45;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-len,y+len*.18);ctx.stroke();
      }
      ctx.restore();
    };

    game.drawEagle = function(ctx,x,y,frame) {
      const flap = Math.sin(frame*.2)*.42;
      ctx.save();ctx.translate(x,y);
      ctx.save();ctx.translate(-14,-2);ctx.rotate(-.45-flap);ctx.fillStyle='#5b3219';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-28,5,-43,26);ctx.quadraticCurveTo(-18,18,4,12);ctx.closePath();ctx.fill();ctx.restore();
      ctx.save();ctx.translate(14,-2);ctx.rotate(.45+flap);ctx.fillStyle='#6b3b1e';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(28,5,43,26);ctx.quadraticCurveTo(18,18,-4,12);ctx.closePath();ctx.fill();ctx.restore();
      ctx.fillStyle='#4a2816';ctx.beginPath();ctx.ellipse(0,7,18,25,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f8fafc';ctx.beginPath();ctx.arc(0,-16,13,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#dbeafe';for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*5-2,-7);ctx.lineTo(i*5+2,2);ctx.lineTo(i*5+5,-7);ctx.closePath();ctx.fill();}
      ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.moveTo(-4,-13);ctx.lineTo(9,-10);ctx.lineTo(-3,-6);ctx.closePath();ctx.fill();
      ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(-4,-18,2.1,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(-3.5,-18,0.9,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,28);ctx.lineTo(-10,33);ctx.moveTo(7,28);ctx.lineTo(10,33);ctx.stroke();
      ctx.restore();
    };

    const originalDraw = typeof game.draw === 'function' ? game.draw.bind(game) : null;
    if (originalDraw) {
      game.draw = function() {
        const result = originalDraw();
        if (this.activeWorld !== 1) return result;
        const dialogueScene = ['STORY','BOSS_INTRO','BOSS_OUTRO'].includes(this.state);
        if (!dialogueScene) drawFrozenGround(this);
        const ctx = this.ctx;
        this.icicles.forEach(ice => {
          if (ice.state === 'WARN' || ice.__w2WarnTimer > 0) {
            const p = clamp((ice.__w2WarnTimer || 1) / 28,0,1);
            ctx.save();ctx.globalAlpha=.35+.35*Math.sin(this.frame*.45)**2;ctx.fillStyle='#f8fafc';ctx.beginPath();ctx.arc(ice.x,18,10+(1-p)*5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ice.x,28);ctx.lineTo(ice.x,45);ctx.stroke();ctx.restore();
          }
          if (ice.state === 'FALL') {
            ctx.save();ctx.translate(ice.x,ice.y);ctx.fillStyle='#dff6ff';ctx.shadowBlur=8;ctx.shadowColor='#38bdf8';ctx.beginPath();ctx.moveTo(-9,-18);ctx.lineTo(9,-18);ctx.lineTo(1,18);ctx.lineTo(-3,8);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.restore();
          }
        });
        const boss = this.boss;
        if (boss?.active && boss.type === 'penguin') {
          if (boss.state === 'JUMP_PREP' && Number.isFinite(boss.__w2LandingX)) {
            const pulse=.55+.25*Math.sin(this.frame*.45);
            ctx.save();ctx.globalAlpha=pulse;ctx.strokeStyle='#ef4444';ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.beginPath();ctx.ellipse(boss.__w2LandingX,groundY()-3,34,9,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
          }
          if (boss.enraged && boss.state !== 'EXPLODING') {
            ctx.save();ctx.globalAlpha=.18+.08*Math.sin(this.frame*.2);ctx.strokeStyle='#ef4444';ctx.lineWidth=3;ctx.beginPath();ctx.arc(boss.x,boss.y-30,43,0,Math.PI*2);ctx.stroke();ctx.restore();
          }
        }
        this.powerOrbs.forEach(orb => {
          if (boss?.active && boss.type==='penguin' && Math.abs(orb.x-boss.x)<48 && Math.abs(orb.y-(boss.y-28))<70) return;
          ctx.save();ctx.globalAlpha=.82;ctx.strokeStyle='#fef08a';ctx.lineWidth=2;ctx.shadowBlur=10;ctx.shadowColor='#22d3ee';ctx.beginPath();ctx.arc(orb.x,orb.y,14+Math.sin(this.frame*.18)*2,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.restore();
        });
        return result;
      };
    }

    game.__w2VisualsV1Installed = true;
    window.__FF_W2_ENVIRONMENT_ART_V1__ = {
      version: 'world2-environment-art-v1.2-smooth-ground-background-polish',
      imageAssets: true,
      backgroundImageLayers: 3,
      groundImageTile: true,
      obstacleImageAssets: true,
      gameplayGeometryChanged: false,
      hitboxesChanged: false,
      gapChanged: false,
      groundHeightChanged: false,
      pineBasesGrounded: true,
      legacyGroundCapCovered: true,
      groundTileSeamOverlap: true,
      groundPatternRepeat: true,
      darkGroundBandRemoved: true,
      horizonMistPolish: true,
      failedAssets: envAssetState.failed.slice()
    };
    console.log('[FF-LAB] w2-visuals-v1-environment-art-installed');
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{tries++;if(install()||tries>100)clearInterval(timer);},80);
  setTimeout(install,1100);
})();