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
    const bodyW = 60;
    const capH = 22;

    const palettes = [
      ['#71685a', '#b8aa95', '#ded2bd', '#9f927e', '#665e52'],
      ['#6b6458', '#aa9e8d', '#d1c5b2', '#948979', '#625b50'],
      ['#776d5e', '#c0b29b', '#e0d5c0', '#a49783', '#6a6154'],
      ['#6d6558', '#b2a58f', '#d7ccb6', '#978b78', '#625a4f']
    ];
    const p = palettes[variant];
    const stone = ctx.createLinearGradient(bodyX, 0, bodyX + bodyW, 0);
    stone.addColorStop(0, p[0]);
    stone.addColorStop(.2, p[1]);
    stone.addColorStop(.52, p[2]);
    stone.addColorStop(.82, p[3]);
    stone.addColorStop(1, p[4]);
    ctx.fillStyle = stone;
    ctx.fillRect(bodyX, 0, bodyW, SPRITE_H);

    // Slight irregular block courses so each column reads as ancient masonry.
    ctx.strokeStyle = 'rgba(67,59,49,.30)';
    ctx.lineWidth = 1.1;
    let y = 42 + variant * 3;
    let row = 0;
    while (y < SPRITE_H) {
      const rowH = [50, 58, 54, 62][(row + variant) % 4];
      ctx.beginPath();
      ctx.moveTo(bodyX + 2, y);
      ctx.lineTo(bodyX + bodyW - 2, y);
      ctx.stroke();
      const joints = [bodyX + 18, bodyX + 31, bodyX + 43];
      const joint = joints[(row + variant) % joints.length];
      ctx.beginPath();
      ctx.moveTo(joint, Math.max(0, y - rowH));
      ctx.lineTo(joint, y);
      ctx.stroke();
      y += rowH;
      row++;
    }

    const crackSets = [
      [[[34,92],[42,112],[36,140]], [[49,266],[41,292],[47,323]], [[30,450],[38,476],[32,508]]],
      [[[45,74],[37,105],[43,132],[35,162]], [[29,238],[36,266],[31,294]], [[47,392],[39,421],[45,455],[37,486]]],
      [[[31,125],[39,150],[34,180]], [[48,307],[40,333],[46,362]], [[32,510],[40,536],[35,566]]],
      [[[44,102],[36,130],[42,158]], [[31,252],[39,281],[34,315]], [[48,438],[40,468],[46,500],[38,535]]]
    ];
    crackSets[variant].forEach((pts) => {
      ctx.beginPath();
      pts.forEach(([x, py], i) => i ? ctx.lineTo(x, py) : ctx.moveTo(x, py));
      ctx.strokeStyle = 'rgba(48,42,36,.78)';
      ctx.lineWidth = 2.3;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // Small moss accents; kept subtle for mobile readability.
    const mossSets = [
      [[16,170,10,4],[47,388,8,3]],
      [[45,115,9,3],[17,344,12,4]],
      [[18,246,8,3],[45,515,10,4]],
      [[14,132,9,3],[42,326,11,4]]
    ];
    ctx.fillStyle = 'rgba(83,112,68,.28)';
    mossSets[variant].forEach(([x, py, w, h]) => ctx.fillRect(x, py, w, h));

    const capOverhang = [7, 9, 6, 8][variant];
    const capX = bodyX - capOverhang;
    const capW = bodyW + capOverhang * 2;
    const cap = ctx.createLinearGradient(capX, 0, capX + capW, 0);
    cap.addColorStop(0, '#766c5d');
    cap.addColorStop(.5, '#cfc1aa');
    cap.addColorStop(1, '#756b5d');
    ctx.fillStyle = cap;
    ctx.beginPath();
    const leftChip = variant === 0 || variant === 3 ? 7 : 2;
    const rightChip = variant === 1 || variant === 3 ? 8 : 2;
    ctx.moveTo(capX + leftChip, 2);
    ctx.lineTo(capX + capW - rightChip, 2);
    ctx.lineTo(capX + capW, variant === 2 ? 8 : 5);
    ctx.lineTo(capX + capW - 2, capH);
    ctx.lineTo(capX + 2, capH);
    ctx.lineTo(capX, variant === 1 ? 7 : 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(66,57,48,.32)';
    ctx.fillRect(capX + 2, capH - 4, capW - 4, 4);
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fillRect(capX + 7, 6, Math.max(8, capW - 14), 2);

    // Variant 2 has one missing stone notch; decorative only, collision unchanged.
    if (variant === 2) {
      ctx.fillStyle = 'rgba(79,70,60,.42)';
      ctx.fillRect(bodyX, 214, 8, 20);
    }

    return c;
  }

  function install() {
    const game = window.game;
    if (!game?.assets || typeof game.drawPillars !== 'function') return false;
    if (game.__ruinsPillarVariantsV4Installed) return true;

    const variants = Array.from({ length: VARIANTS }, (_, i) => buildVariantCanvas(i));
    if (variants.some(v => !v)) return false;
    game.assets.ruinsPillarVariants = variants;

    const originalDrawPillars = game.drawPillars.bind(game);
    game.drawPillars = function () {
      if (this.activeWorld !== 0 || !this.assets?.ruinsPillarVariants) {
        return originalDrawPillars();
      }

      const gap = CONFIG.GAP_SIZE;
      this.pillars.forEach((p) => {
        if (p.smashed) return;
        if (p.__ruinsVariant == null) p.__ruinsVariant = Math.floor(Math.random() * VARIANTS);

        const canvas = this.assets.ruinsPillarVariants[p.__ruinsVariant % VARIANTS];
        const botY = p.topHeight + gap;
        const botH = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - botY;
        const drawW = 80;
        const drawX = p.x - (drawW - p.width) / 2;

        this.ctx.save();
        this.ctx.translate(drawX, p.topHeight);
        this.ctx.scale(1, -1);
        this.ctx.drawImage(canvas, 0, 0, SPRITE_W, Math.min(SPRITE_H, p.topHeight), 0, 0, drawW, p.topHeight);
        this.ctx.restore();

        this.ctx.drawImage(canvas, 0, 0, SPRITE_W, Math.min(SPRITE_H, botH), drawX, botY, drawW, botH);
      });
    };

    // Keep the beige v3 base asset as fallback for any code path that reads pillarCanvas directly.
    game.assets.pillarCanvas = variants[0];
    game.__ruinsPillarVariantsV4Installed = true;
    console.log('[FF-LAB] ruins-pillar-variants-v4-installed');
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