(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game) return false;
    if (game.__w2VisualsV1Installed) return true;

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
      flakes: Array.from({length:64}, (_,i) => ({
        x: (i * 71.13) % 421,
        y: (i * 97.73) % 653,
        s: 0.65 + ((i * 17) % 13) / 10,
        d: 0.8 + ((i * 11) % 9) / 8,
        a: 0.28 + ((i * 7) % 8) / 12
      }))
    };

    function drawMountainBand(ctx, travel, baseY, spacing, height, alpha, fill, speedFactor, jagged = 0.22) {
      const off = mod(travel * speedFactor, spacing);
      const count = Math.ceil(W() / spacing) + 3;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(-spacing, H());
      for (let i = -1; i < count; i++) {
        const idx = i + Math.floor((travel * speedFactor) / spacing);
        const x = i * spacing - off;
        const wave = Math.sin(idx * 1.73) * jagged + Math.sin(idx * 0.61) * 0.08;
        const peak = baseY - height * (0.72 + wave);
        ctx.lineTo(x, baseY);
        ctx.lineTo(x + spacing * 0.48, peak);
        ctx.lineTo(x + spacing, baseY);
      }
      ctx.lineTo(W() + spacing, H());
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawCliffs(ctx, travel, alpha) {
      const spacing = 118;
      const off = mod(travel * 0.28, spacing);
      const baseY = groundY() - 16;
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let i = -1; i < Math.ceil(W()/spacing)+2; i++) {
        const idx = i + Math.floor((travel * 0.28) / spacing);
        const x = i * spacing - off;
        const h = 78 + (Math.sin(idx * 2.2) + 1) * 25;
        ctx.fillStyle = idx % 2 ? '#26384c' : '#31465c';
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x + 14, baseY - h * 0.72);
        ctx.lineTo(x + 38, baseY - h);
        ctx.lineTo(x + 62, baseY - h * 0.66);
        ctx.lineTo(x + 89, baseY - h * 0.9);
        ctx.lineTo(x + spacing, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(226,232,240,.38)';
        ctx.beginPath();
        ctx.moveTo(x + 38, baseY - h);
        ctx.lineTo(x + 24, baseY - h * .68);
        ctx.lineTo(x + 47, baseY - h * .76);
        ctx.lineTo(x + 59, baseY - h * .58);
        ctx.closePath();
        ctx.fill();
      }
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

    function drawFrostBackground(ctx) {
      const targetStage = game.score >= (C.STAGE1_END || 15) ? 1 : 0;
      const targetBoss = game.boss?.active || ['BOSS_WARNING','BOSS_INTRO','BOSS_OUTRO','FLY_AWAY'].includes(game.state) ? 1 : 0;
      bg.stageBlend += (targetStage - bg.stageBlend) * 0.025;
      bg.bossBlend += (targetBoss - bg.bossBlend) * 0.035;
      if (!game.__ffPaused) {
        const speed = game.state === 'STORY' ? 1.05 : (game.feverActive ? (C.SPEED_FEVER || 4.5) : (C.W2_SPEED || 2.2));
        bg.travel += speed;
      }

      drawAurora(ctx, 0.12 + bg.bossBlend * 0.9);
      drawMountainBand(ctx, bg.travel, groundY()-34, 164, 180, 0.30 + bg.bossBlend*.1, '#0b1f3a', 0.055, .18);
      drawMountainBand(ctx, bg.travel, groundY()-22, 126, 132, 0.42, '#17345a', 0.11, .22);
      drawMountainBand(ctx, bg.travel, groundY()-10, 94, 92, 0.46 * (1-bg.stageBlend*.35), '#315a7a', 0.18, .18);
      drawCliffs(ctx, bg.travel, 0.18 + bg.stageBlend * 0.72);

      const fogAlpha = 0.08 + bg.stageBlend * 0.16;
      ctx.save();
      const fog = ctx.createLinearGradient(0, groundY()-105, 0, groundY()+5);
      fog.addColorStop(0, 'rgba(226,232,240,0)');
      fog.addColorStop(1, `rgba(226,232,240,${fogAlpha})`);
      ctx.fillStyle = fog;
      ctx.fillRect(0, groundY()-110, W(), 120);
      ctx.restore();

      const snowCount = Math.round(28 + bg.stageBlend * 24 - bg.bossBlend * 16);
      ctx.save();
      for (let i = 0; i < snowCount; i++) {
        const f = bg.flakes[i];
        const x = mod(f.x - bg.travel * f.d * (1 + bg.stageBlend*.35), W()+60) - 30;
        const y = mod(f.y + game.frame * (0.75 + f.s * .38), groundY()-10);
        ctx.globalAlpha = f.a * (0.75 + bg.stageBlend*.2);
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(x, y, clamp(f.s, .8, 2.3), 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }

    function makePillarVariant(kind) {
      const c = document.createElement('canvas');
      c.width = 80; c.height = 600;
      const ctx = c.getContext('2d');
      const palettes = [
        ['#14324f','#2563a6','#9bd8ff','#214f7a'],
        ['#23344a','#4b6a86','#dbeafe','#31495f'],
        ['#111827','#24425e','#72b6d8','#16293b'],
        ['#263445','#456179','#bfe7ff','#2c526e']
      ];
      const p = palettes[kind % palettes.length];
      const grad = ctx.createLinearGradient(8,0,72,0);
      grad.addColorStop(0,p[0]); grad.addColorStop(.28,p[1]); grad.addColorStop(.52,p[2]); grad.addColorStop(.72,p[1]); grad.addColorStop(1,p[0]);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(12,0); ctx.lineTo(68,0); ctx.lineTo(72,600); ctx.lineTo(8,600); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(24,0,10,600);
      ctx.strokeStyle = kind===2 ? 'rgba(96,165,250,.55)' : 'rgba(255,255,255,.34)';
      ctx.lineWidth = 1.4;
      for (let i=0;i<11;i++) {
        const y = 38 + i*49 + ((kind*17+i*23)%29);
        const x = 18 + ((i*13+kind*9)%39);
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x + ((i%2)?16:-13), y+18); ctx.lineTo(x+((i%3)-1)*9,y+32); ctx.stroke();
      }
      if (kind === 1) {
        ctx.fillStyle = 'rgba(241,245,249,.72)';
        for (let y=52;y<590;y+=84) ctx.beginPath(),ctx.ellipse(42,y,28,7,.05,0,Math.PI*2),ctx.fill();
      }
      if (kind === 2) {
        ctx.shadowBlur=9; ctx.shadowColor='#38bdf8'; ctx.strokeStyle='rgba(56,189,248,.5)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(36,20); ctx.lineTo(46,110); ctx.lineTo(32,190); ctx.lineTo(48,270); ctx.lineTo(35,360); ctx.lineTo(44,450); ctx.stroke(); ctx.shadowBlur=0;
      }
      if (kind === 3) {
        ctx.fillStyle='rgba(15,23,42,.28)';
        for (let y=70;y<580;y+=120) { ctx.fillRect(10,y,60,12); ctx.fillStyle='rgba(219,234,254,.32)'; ctx.fillRect(13,y+2,54,3); ctx.fillStyle='rgba(15,23,42,.28)'; }
      }
      ctx.fillStyle = p[2];
      ctx.shadowBlur = 8; ctx.shadowColor = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(0,27); ctx.lineTo(7,2); ctx.lineTo(17,20); ctx.lineTo(28,-4); ctx.lineTo(38,18); ctx.lineTo(44,-7); ctx.lineTo(51,18); ctx.lineTo(62,0); ctx.lineTo(71,21); ctx.lineTo(80,5); ctx.lineTo(80,28); ctx.closePath(); ctx.fill();
      ctx.shadowBlur=0;
      ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(5,21,70,3);
      return c;
    }

    game.__w2PillarVariants = [0,1,2,3].map(makePillarVariant);
    game.__w2PillarSeq = 0;
    const originalDrawPillars = typeof game.drawPillars === 'function' ? game.drawPillars.bind(game) : null;
    if (originalDrawPillars) {
      game.drawPillars = function() {
        if (this.activeWorld !== 1) return originalDrawPillars();
        drawFrostBackground(this.ctx);
        const gap = C.W2_GAP_SIZE || 146;
        this.pillars.forEach(p => {
          if (p.smashed) return;
          if (p.__w2Variant == null) p.__w2Variant = (this.__w2PillarSeq++) % this.__w2PillarVariants.length;
          const canvas = this.__w2PillarVariants[p.__w2Variant];
          const botY = p.topHeight + gap;
          const botH = H() - (C.GROUND_HEIGHT || 70) - botY;
          const drawW = 80;
          const drawX = p.x - (drawW - p.width) / 2;
          this.ctx.save();
          this.ctx.translate(drawX, p.topHeight);
          this.ctx.scale(1,-1);
          this.ctx.drawImage(canvas,0,0,80,Math.min(600,p.topHeight),0,0,drawW,p.topHeight);
          this.ctx.restore();
          this.ctx.drawImage(canvas,0,0,80,Math.min(600,botH),drawX,botY,drawW,botH);
        });
      };
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
    console.log('[FF-LAB] w2-visuals-v1-installed');
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{tries++;if(install()||tries>100)clearInterval(timer);},80);
  setTimeout(install,1100);
})();
