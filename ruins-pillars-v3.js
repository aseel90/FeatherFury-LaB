(() => {
  function buildRuinsPillarCanvas() {
    const c = document.createElement('canvas');
    c.width = 76;
    c.height = 640;
    const ctx = c.getContext('2d');
    if (!ctx) return null;

    const bodyX = 11;
    const bodyW = 54;
    const capH = 20;

    const stone = ctx.createLinearGradient(bodyX, 0, bodyX + bodyW, 0);
    stone.addColorStop(0, '#655f54');
    stone.addColorStop(.18, '#8b8374');
    stone.addColorStop(.5, '#aaa18e');
    stone.addColorStop(.82, '#81796b');
    stone.addColorStop(1, '#5d584f');
    ctx.fillStyle = stone;
    ctx.fillRect(bodyX, 0, bodyW, c.height);

    ctx.strokeStyle = 'rgba(54,49,43,.42)';
    ctx.lineWidth = 1.15;
    let y = capH + 8;
    let row = 0;
    while (y < c.height) {
      const h = row % 3 === 0 ? 47 : (row % 3 === 1 ? 55 : 50);
      ctx.beginPath();
      ctx.moveTo(bodyX + 2, y);
      ctx.lineTo(bodyX + bodyW - 2, y);
      ctx.stroke();
      const jointX = row % 2 ? bodyX + 20 : bodyX + 36;
      ctx.beginPath();
      ctx.moveTo(jointX, y);
      ctx.lineTo(jointX, Math.min(c.height, y + h));
      ctx.stroke();
      y += h;
      row++;
    }

    const cracks = [
      [[30,78],[36,91],[32,105]],
      [[49,151],[43,164],[47,178],[40,192]],
      [[24,239],[30,252],[26,267]],
      [[44,320],[38,334],[42,348]],
      [[28,414],[34,427],[30,443]],
      [[48,506],[42,520],[45,535]],
      [[23,572],[29,586],[26,601]]
    ];
    cracks.forEach((pts, i) => {
      ctx.beginPath();
      pts.forEach(([x, py], n) => n ? ctx.lineTo(x, py) : ctx.moveTo(x, py));
      ctx.strokeStyle = 'rgba(39,35,31,.92)';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.stroke();
      if (i % 2 === 0) {
        ctx.beginPath();
        pts.forEach(([x, py], n) => n ? ctx.lineTo(x, py) : ctx.moveTo(x, py));
        ctx.strokeStyle = 'rgba(211,177,104,.22)';
        ctx.lineWidth = .7;
        ctx.stroke();
      }
    });

    ctx.fillStyle = 'rgba(73,96,64,.38)';
    [[15,118,10,5],[47,282,11,5],[18,389,9,4],[43,548,12,5]].forEach(([x, py, w, h]) => ctx.fillRect(x, py, w, h));

    const cap = ctx.createLinearGradient(0, 0, c.width, 0);
    cap.addColorStop(0, '#5e594f');
    cap.addColorStop(.5, '#a49b88');
    cap.addColorStop(1, '#625d53');
    ctx.fillStyle = cap;
    ctx.beginPath();
    ctx.moveTo(6, 5);
    ctx.lineTo(19, 2);
    ctx.lineTo(34, 4);
    ctx.lineTo(50, 1);
    ctx.lineTo(70, 5);
    ctx.lineTo(68, capH);
    ctx.lineTo(8, capH);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(49,45,40,.36)';
    ctx.fillRect(9, capH - 4, 58, 4);
    ctx.strokeStyle = 'rgba(255,255,255,.09)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, 7); ctx.lineTo(29, 5); ctx.lineTo(46, 7); ctx.lineTo(64, 5); ctx.stroke();

    return c;
  }

  function install() {
    const game = window.game;
    if (!game?.assets) return false;
    const canvas = buildRuinsPillarCanvas();
    if (!canvas) return false;
    game.assets.pillarCanvas = canvas;
    game.__ruinsPillarV3Installed = true;
    if (window.FF_DEBUG?.logs) console.log('[FF-LAB] ruins-pillar-v3-installed');
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 40) clearInterval(timer);
  }, 100);

  setTimeout(() => install(), 600);
  setTimeout(() => install(), 1400);
})();