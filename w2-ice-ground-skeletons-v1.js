(() => {
  'use strict';

  function groundSvgData() {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="160" viewBox="0 0 1024 160">
      <defs>
        <linearGradient id="ice" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#9be2f1"/>
          <stop offset=".48" stop-color="#5ab2ce"/>
          <stop offset="1" stop-color="#2f7897"/>
        </linearGradient>
        <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#398ba8"/>
          <stop offset=".58" stop-color="#2d718d"/>
          <stop offset="1" stop-color="#245d78"/>
        </linearGradient>
        <linearGradient id="under" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#3e91ae" stop-opacity=".52"/>
          <stop offset="1" stop-color="#286983" stop-opacity=".24"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="160" fill="url(#deep)"/>
      <path fill="url(#ice)" d="M0 6L42 4 86 8 128 3 172 9 217 5 260 10 307 4 350 8 397 5 442 10 488 3 532 8 578 5 624 10 669 4 714 8 760 5 806 9 852 3 898 8 943 5 982 9 1024 6V101L982 98 943 103 898 97 852 104 806 98 760 102 714 97 669 104 624 98 578 102 532 97 488 103 442 98 397 102 350 97 307 104 260 98 217 103 172 97 128 104 86 98 42 102 0 101Z"/>
      <path fill="url(#under)" d="M0 78L58 73 112 81 169 72 224 80 280 74 336 82 393 73 449 80 505 74 562 82 619 72 675 80 731 74 788 81 844 72 900 80 957 74 1024 80V122L957 116 900 123 844 115 788 122 731 116 675 123 619 115 562 122 505 116 449 123 393 115 336 122 280 116 224 123 169 115 112 122 58 116 0 122Z"/>
      <g stroke="#256f8c" stroke-width="2" fill="none" opacity=".5">
        <path d="M88 48l16 14-8 16 17 18"/><path d="M243 46l14 15-9 15 19 19"/><path d="M401 50l16 13-10 18 18 16"/><path d="M566 45l14 16-9 16 18 18"/><path d="M731 49l16 14-9 17 17 17"/><path d="M893 46l15 15-9 16 18 18"/>
      </g>
      <g stroke="#8ed5e7" stroke-width="1.05" fill="none" opacity=".18">
        <path d="M154 33l11 8 14-6"/><path d="M325 35l12 7 14-6"/><path d="M493 32l12 8 15-5"/><path d="M657 35l12 7 14-6"/><path d="M823 32l12 8 14-5"/>
      </g>
      <g fill="#2b6882" opacity=".38"><ellipse cx="64" cy="137" rx="12" ry="4"/><ellipse cx="203" cy="126" rx="8" ry="3.5"/><ellipse cx="360" cy="141" rx="14" ry="5"/><ellipse cx="524" cy="128" rx="10" ry="4"/><ellipse cx="691" cy="140" rx="13" ry="5"/><ellipse cx="858" cy="127" rx="9" ry="4"/><ellipse cx="982" cy="141" rx="12" ry="4.5"/></g>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function seed(n, salt) {
    const v = Math.sin((n + 1) * (12.9898 + salt * 7.13)) * 43758.5453;
    return v - Math.floor(v);
  }

  function drawSkeleton(ctx, variant, x, y, scale, alpha, phase) {
    ctx.save();
    ctx.translate(x, y + Math.sin(phase) * .55);
    ctx.rotate(Math.sin(phase * .63) * .015);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#d9f4fb';
    ctx.fillStyle = 'rgba(217,244,251,.32)';
    ctx.lineWidth = 1.55;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (variant === 0) {
      ctx.beginPath(); ctx.moveTo(-18,0); ctx.lineTo(15,0); ctx.stroke();
      for (let i=-12;i<=10;i+=5) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-4,-6); ctx.moveTo(i,0); ctx.lineTo(i-3,6); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(15,0); ctx.lineTo(24,-8); ctx.lineTo(24,8); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-20,0,4.5,0,Math.PI*2); ctx.stroke();
    } else if (variant === 1) {
      ctx.beginPath(); ctx.moveTo(0,-15); ctx.lineTo(0,15); ctx.stroke();
      for (let i=-10;i<=10;i+=5) {
        const r = 10 - Math.abs(i)*.22;
        ctx.beginPath(); ctx.moveTo(0,i); ctx.quadraticCurveTo(-r,i+1,-r-3,i+6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.quadraticCurveTo(r,i+1,r+3,i+6); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0,-20,5.5,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(-2,-21,1.05,0,Math.PI*2); ctx.arc(2,-21,1.05,0,Math.PI*2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0,-7,7,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(-2.5,-8,1.15,0,Math.PI*2); ctx.arc(2.5,-8,1.15,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-8,5); ctx.lineTo(8,18); ctx.moveTo(8,5); ctx.lineTo(-8,18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-10,3); ctx.lineTo(-6,7); ctx.moveTo(10,3); ctx.lineTo(6,7); ctx.moveTo(-10,20); ctx.lineTo(-6,16); ctx.moveTo(10,20); ctx.lineTo(6,16); ctx.stroke();
    }
    ctx.restore();
  }

  function install() {
    const game = window.game;
    const images = window.__FF_W2_ENV_IMAGES_V1__;
    const config = window.CONFIG || {};
    if (!game || !game.__w2VisualsV1Installed || !images?.ground) return false;
    if (game.__w2GroundStripFinalV2Installed) return true;

    const groundImage = images.ground;
    let replacementReady = false;
    const oldOnload = groundImage.onload;
    groundImage.onload = function(...args) {
      replacementReady = true;
      if (typeof oldOnload === 'function') oldOnload.apply(this, args);
    };
    groundImage.src = groundSvgData();

    const priorDraw = typeof game.draw === 'function' ? game.draw.bind(game) : null;
    if (!priorDraw) return false;

    game.draw = function(...args) {
      const result = priorDraw(...args);
      if (this.activeWorld !== 1 || ['STORY','BOSS_INTRO','BOSS_OUTRO'].includes(this.state)) return result;
      const ctx = this.ctx;
      if (!ctx) return result;

      const W = Number(config.CANVAS_WIDTH) || 360;
      const H = Number(config.CANVAS_HEIGHT) || 640;
      const gh = Number(config.GROUND_HEIGHT) || 70;
      const gy = H - gh;
      const speed = this.feverActive ? (Number(config.SPEED_FEVER) || 4.5) : (Number(config.W2_SPEED) || 2.2);
      this.__w2SkeletonTravel = Number(this.__w2SkeletonTravel) || 0;
      if (!this.__ffPaused) this.__w2SkeletonTravel += speed;

      const travel = this.__w2SkeletonTravel * .96;
      const spacing = 860;
      const first = Math.floor((travel - 360) / spacing) - 1;
      const last = Math.ceil((travel + W + 360) / spacing) + 1;

      // Final World 2 ground pass: cover the segmented legacy strip with a static ice lip.
      // This deliberately has no scrolling micro-pattern, so the top edge cannot stutter independently.
      ctx.save();
      const lip = ctx.createLinearGradient(0, gy - 13, 0, gy + 8);
      lip.addColorStop(0, '#bfeef7');
      lip.addColorStop(.45, '#8fd8e8');
      lip.addColorStop(1, '#63b6cf');
      ctx.fillStyle = lip;
      ctx.fillRect(0, gy - 13, W, 21);
      ctx.globalAlpha = .16;
      ctx.fillStyle = '#e5f8fc';
      ctx.fillRect(0, gy - 12, W, 2);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, gy + 8, W, Math.max(1, gh - 12));
      ctx.clip();
      for (let cell = first; cell <= last; cell++) {
        const a = seed(cell,1), b = seed(cell,2), c = seed(cell,3);
        const worldX = cell * spacing + 180 + a * 360;
        const x = worldX - travel;
        if (x < -52 || x > W + 52) continue;
        const y = gy + 28 + b * Math.max(12, gh - 48);
        drawSkeleton(ctx, Math.abs(cell) % 3, x, y, .84 + c * .18, .17 + a * .055, (this.frame || 0) * .016 + cell * 1.7);
      }
      ctx.globalAlpha = .018;
      ctx.fillStyle = '#64b8d0';
      ctx.fillRect(0, gy + 8, W, Math.max(1, gh - 12));
      ctx.restore();
      return result;
    };

    const markReady = () => {
      if (!replacementReady && !groundImage.complete) return false;
      game.__w2IceGroundSkeletonsV1Installed = true;
      game.__w2GroundStripFinalV2Installed = true;
      window.__FF_W2_ICE_GROUND_SKELETONS_V1__ = {
        version: 'w2-ice-only-ground-sparse-skeletons-v1.1-strip-fix',
        whiteSnowCapRemoved: true,
        groundAssetReplacedBeforeGameplay: true,
        sparseSkeletons: true,
        skeletonSpacing: 860,
        legacySegmentedStripCovered: true,
        skeletonVisibilityBoosted: true,
        finalWorld2GroundPass: true,
        gameplayGeometryChanged: false,
        groundHeightChanged: false,
        hitboxesChanged: false
      };
      return true;
    };

    if (markReady()) return true;
    const readyTimer = setInterval(() => {
      if (markReady()) clearInterval(readyTimer);
    }, 25);
    setTimeout(() => { replacementReady = true; markReady(); clearInterval(readyTimer); }, 1800);
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