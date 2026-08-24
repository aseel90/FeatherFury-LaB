(() => {
  const SPRITE_W = 80;
  const SPRITE_H = 600;
  const VARIANTS = 4;

  function buildVariantCanvas(variant) {
    const c = document.createElement('canvas');
    c.width = SPRITE_W;
    c.height = SPRITE_H;
    const ctx = c.getContext('2d');
    if (!ctx) return null;

    const bodyX = 10;
    const bodyW = 60; // exactly matches gameplay collision width

    const palettes = [
      ['#756b5d', '#c4b69f', '#e6dac5', '#918571', '#675f53'],
      ['#6c6357', '#b6aa97', '#d8ccb9', '#887e6d', '#60594f'],
      ['#786f61', '#c9bca6', '#eadfca', '#978b78', '#6b6357'],
      ['#6f675a', '#bcae98', '#ded2bd', '#8c8170', '#625b50']
    ];
    const p = palettes[variant];
    const stone = ctx.createLinearGradient(bodyX, 0, bodyX + bodyW, 0);
    stone.addColorStop(0, p[0]);
    stone.addColorStop(.22, p[1]);
    stone.addColorStop(.52, p[2]);
    stone.addColorStop(.82, p[3]);
    stone.addColorStop(1, p[4]);
    ctx.fillStyle = stone;
    ctx.fillRect(bodyX, 0, bodyW, SPRITE_H);

    // Stone block courses. Position changes per variant so the shafts do not repeat.
    ctx.strokeStyle = 'rgba(69,61,51,.26)';
    ctx.lineWidth = 1.15;
    let y = 58 + variant * 5;
    let row = 0;
    while (y < SPRITE_H) {
      const rowH = [55, 63, 59, 68][(row + variant) % 4];
      ctx.beginPath();
      ctx.moveTo(bodyX + 2, y);
      ctx.lineTo(bodyX + bodyW - 2, y);
      ctx.stroke();
      const joints = [bodyX + 17, bodyX + 31, bodyX + 45];
      const joint = joints[(row + variant) % joints.length];
      ctx.beginPath();
      ctx.moveTo(joint, Math.max(0, y - rowH));
      ctx.lineTo(joint, y);
      ctx.stroke();
      y += rowH;
      row++;
    }

    // Soft centre highlight keeps the pillar readable on small phones.
    const shine = ctx.createLinearGradient(bodyX, 0, bodyX + bodyW, 0);
    shine.addColorStop(0, 'rgba(255,255,255,0)');
    shine.addColorStop(.48, 'rgba(255,255,255,.12)');
    shine.addColorStop(.58, 'rgba(255,255,255,.05)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(bodyX, 0, bodyW, SPRITE_H);

    const crackSets = [
      [ [[31,122],[39,151],[34,183]], [[48,302],[39,335],[45,369]], [[30,480],[38,512],[32,548]] ],
      [ [[46,92],[37,126],[43,160],[35,194]], [[30,258],[37,291],[31,326]], [[47,421],[39,456],[45,492],[37,532]] ],
      [ [[32,150],[40,179],[35,211]], [[49,338],[40,369],[46,402]], [[33,510],[41,541],[35,574]] ],
      [ [[45,116],[36,149],[42,181]], [[31,278],[39,312],[34,350]], [[48,448],[40,482],[46,520],[38,557]] ]
    ];
    crackSets[variant].forEach((pts) => {
      ctx.beginPath();
      pts.forEach(([x, py], i) => i ? ctx.lineTo(x, py) : ctx.moveTo(x, py));
      ctx.strokeStyle = 'rgba(48,42,36,.78)';
      ctx.lineWidth = variant === 3 ? 2.8 : 2.4;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // Distinct capital silhouettes. Body remains 60px for honest collision readability.
    if (variant === 0) {
      // Classic intact temple capital.
      const capX = 3, capW = 74;
      ctx.fillStyle = '#a99b84';
      ctx.fillRect(capX, 0, capW, 22);
      ctx.fillStyle = '#d5c7b0';
      ctx.fillRect(7, 2, 66, 7);
      ctx.fillStyle = 'rgba(73,64,53,.28)';
      ctx.fillRect(5, 17, 70, 5);
      ctx.fillStyle = '#92846f';
      ctx.fillRect(8, 26, 64, 6);
    } else if (variant === 1) {
      // Clearly broken left corner and thick stepped capital.
      ctx.fillStyle = '#a0927c';
      ctx.beginPath();
      ctx.moveTo(12, 0); ctx.lineTo(78, 0); ctx.lineTo(78, 25); ctx.lineTo(2, 25);
      ctx.lineTo(2, 12); ctx.lineTo(7, 12); ctx.lineTo(7, 7); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d2c4ac';
      ctx.fillRect(16, 3, 56, 7);
      ctx.fillStyle = 'rgba(73,64,53,.30)';
      ctx.fillRect(5, 20, 71, 5);
      ctx.fillStyle = '#8f816c';
      ctx.fillRect(10, 31, 60, 8);
      // Visible chipped edge on shaft, decorative only.
      ctx.fillStyle = 'rgba(73,66,57,.42)';
      ctx.beginPath();
      ctx.moveTo(bodyX, 248); ctx.lineTo(bodyX + 8, 255); ctx.lineTo(bodyX + 8, 286); ctx.lineTo(bodyX, 294); ctx.closePath(); ctx.fill();
    } else if (variant === 2) {
      // Double-ring ceremonial capital, instantly different on mobile.
      ctx.fillStyle = '#a99b84';
      ctx.fillRect(5, 0, 70, 18);
      ctx.fillStyle = '#d9ccb5';
      ctx.fillRect(9, 3, 62, 6);
      ctx.fillStyle = '#8e806b';
      ctx.fillRect(7, 23, 66, 6);
      ctx.fillStyle = '#b9aa91';
      ctx.fillRect(11, 32, 58, 8);
      ctx.fillStyle = 'rgba(75,65,54,.25)';
      ctx.fillRect(13, 41, 54, 4);
      // Shallow vertical fluting gives a different shaft texture.
      ctx.strokeStyle = 'rgba(102,91,75,.23)';
      ctx.lineWidth = 1;
      [23, 35, 47, 59].forEach((x) => {
        ctx.beginPath(); ctx.moveTo(x, 55); ctx.lineTo(x, 590); ctx.stroke();
      });
    } else {
      // Ruined capital: both corners chipped + heavier moss.
      ctx.fillStyle = '#9d8f79';
      ctx.beginPath();
      ctx.moveTo(11, 0); ctx.lineTo(68, 0); ctx.lineTo(77, 8); ctx.lineTo(77, 24);
      ctx.lineTo(3, 24); ctx.lineTo(3, 9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d0c2aa';
      ctx.fillRect(15, 4, 50, 7);
      ctx.fillStyle = 'rgba(71,62,52,.32)';
      ctx.fillRect(6, 19, 68, 5);
      ctx.fillStyle = '#8d806c';
      ctx.fillRect(9, 30, 62, 7);
      ctx.fillStyle = 'rgba(82,112,67,.46)';
      ctx.fillRect(12, 41, 17, 5);
      ctx.fillRect(48, 162, 15, 5);
      ctx.fillRect(15, 346, 13, 5);
      ctx.fillRect(43, 505, 16, 5);
    }

    const mossSets = [
      [[16,214,10,4],[47,416,8,3]],
      [[45,118,9,3],[17,362,13,5]],
      [[18,268,8,3],[46,534,9,4]],
      [[15,126,11,4],[42,316,14,5],[18,520,10,4]]
    ];
    ctx.fillStyle = variant === 3 ? 'rgba(81,116,67,.45)' : 'rgba(83,112,68,.28)';
    mossSets[variant].forEach(([x, py, w, h]) => ctx.fillRect(x, py, w, h));

    return c;
  }

  function install() {
    const game = window.game;
    if (!game?.assets || typeof game.drawPillars !== 'function') return false;
    if (game.__ruinsPillarVariantsV5Installed) return true;

    const variants = Array.from({ length: VARIANTS }, (_, i) => buildVariantCanvas(i));
    if (variants.some(v => !v)) return false;
    game.assets.ruinsPillarVariants = variants;

    const originalDrawPillars = game.drawPillars.bind(game);
    game.drawPillars = function () {
      if (this.activeWorld !== 0 || !this.assets?.ruinsPillarVariants) {
        return originalDrawPillars();
      }

      const gap = CONFIG.GAP_SIZE;
      this.pillars.forEach((pillar) => {
        if (pillar.smashed) return;
        if (pillar.__ruinsVariantV5 == null) pillar.__ruinsVariantV5 = Math.floor(Math.random() * VARIANTS);

        const canvas = this.assets.ruinsPillarVariants[pillar.__ruinsVariantV5 % VARIANTS];
        const botY = pillar.topHeight + gap;
        const botH = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - botY;
        const drawW = 80;
        const drawX = pillar.x - (drawW - pillar.width) / 2;

        this.ctx.save();
        this.ctx.translate(drawX, pillar.topHeight);
        this.ctx.scale(1, -1);
        this.ctx.drawImage(canvas, 0, 0, SPRITE_W, Math.min(SPRITE_H, pillar.topHeight), 0, 0, drawW, pillar.topHeight);
        this.ctx.restore();

        this.ctx.drawImage(canvas, 0, 0, SPRITE_W, Math.min(SPRITE_H, botH), drawX, botY, drawW, botH);
      });
    };

    game.assets.pillarCanvas = variants[0];
    game.__ruinsPillarVariantsV5Installed = true;
    console.log('[FF-LAB] ruins-pillar-variants-v5-installed');
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 50) clearInterval(timer);
  }, 100);

  setTimeout(install, 700);
  setTimeout(install, 1500);
})();