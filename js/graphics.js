function drawBirdSkin(ctx, skinKey, x, y, rotation, wingCycle, scale = 1, inFever = false) {
  const skin = SKINS[skinKey] || SKINS.classic;
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.rotate(rotation);
  if (inFever) { ctx.shadowColor = '#f39c12'; ctx.shadowBlur = 20; }
  
  // Ghost Aura
  if (skin.acc === 'aura') { ctx.fillStyle = 'rgba(199, 210, 254, 0.5)'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI*2); ctx.fill(); }
  
  // Body Type logic (balanced for fair visual hitbox)
  let bodyW = 14, bodyH = 11;
  if (skin.bodyType === 'fat') { bodyW = 15, bodyH = 12; }
  else if (skin.bodyType === 'muscle') { bodyW = 15, bodyH = 12; }
  else if (skin.bodyType === 'slim') { bodyW = 13, bodyH = 10; }
  
  ctx.fillStyle = skin.body; ctx.strokeStyle = '#000'; ctx.lineWidth = 2.2;
  ctx.beginPath(); 
  if (skin.bodyType === 'muscle') {
     if (ctx.roundRect) ctx.roundRect(-bodyW, -bodyH, bodyW*2, bodyH*2, 6);
     else ctx.rect(-bodyW, -bodyH, bodyW*2, bodyH*2);
  } else {
     ctx.ellipse(0, 0, bodyW, bodyH, 0, 0, Math.PI * 2); 
  }
  ctx.fill(); ctx.stroke();
  if (inFever) ctx.shadowBlur = 0;

  // Belly
  ctx.fillStyle = skin.belly; ctx.beginPath(); 
  if (skin.bodyType === 'muscle') {
     ctx.ellipse(-2, 4, 10, 5, 0, 0, Math.PI); 
  } else {
     ctx.ellipse(-2, 3, bodyW-5, bodyH-6, 0, 0, Math.PI); 
  }
  ctx.fill();
  
  // Wing (articulated)
  ctx.save();
  ctx.translate(-2, 0); // Wing Pivot
  ctx.rotate(wingCycle * 0.8);
  ctx.fillStyle = skin.wing; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.ellipse(-3, 0, 8, 4.5, -0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.restore();
  
  // Mask/Face color
  ctx.fillStyle = skin.maskColor; ctx.beginPath(); ctx.ellipse(4, -3, 7, 3.5, -0.1, 0, Math.PI*2); ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6, -3, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(7, -3, 1, 0, Math.PI * 2); ctx.fill();
  
  // Cyber Visor over eye
  if (skin.acc === 'visor') { ctx.fillStyle = '#ef4444'; ctx.fillRect(3, -5, 7, 3.5); }
  
  // Beak
  ctx.fillStyle = skin.beak; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(bodyW-4, -1); ctx.lineTo(bodyW+3, 2); ctx.lineTo(bodyW-4, 5); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Accessories
  if (skin.acc === 'ninja') { ctx.fillStyle = '#ef4444'; ctx.fillRect(-3, -bodyH+2, 8, 3); ctx.beginPath(); ctx.moveTo(-3, -bodyH+2); ctx.lineTo(-12, -bodyH); ctx.lineTo(-3, -bodyH+5); ctx.fill(); }
  if (skin.acc === 'crown') { ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.moveTo(-4, -bodyH); ctx.lineTo(-7, -bodyH-5); ctx.lineTo(0, -bodyH-2); ctx.lineTo(7, -bodyH-5); ctx.lineTo(4, -bodyH); ctx.fill(); }
  if (skin.acc === 'flame') { ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(-10, -18); ctx.lineTo(-3, -11); ctx.lineTo(3, -18); ctx.lineTo(0, -8); ctx.fill(); }

  ctx.restore();
}

function drawMinionCrow(ctx, x, y, frame) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(-6, -3, 2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-18, 3); ctx.lineTo(-12, 6); ctx.fill();
  const wingY = Math.sin(frame * 0.4) * 10;
  ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.ellipse(2, wingY/2, 8, Math.abs(wingY)+2, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawBoss(ctx, x, y, frame, isEnraged) {
  ctx.save(); ctx.translate(x, y);
  const wingY = Math.sin(frame * 0.4) * 20;
  
  ctx.fillStyle = '#020617';
  ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(30, -50 + wingY); ctx.lineTo(20, 0); ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(60, -5); ctx.lineTo(65, 15); ctx.lineTo(20, 15); ctx.fill();

  ctx.fillStyle = isEnraged ? '#7f1d1d' : '#0f172a';
  ctx.beginPath(); ctx.ellipse(5, 5, 30, 20, Math.PI/8, 0, Math.PI*2); ctx.fill();
  
  ctx.beginPath(); ctx.arc(-20, -5, 16, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, -15); ctx.lineTo(-10, -35); ctx.lineTo(-5, -15); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(0, -30); ctx.lineTo(5, -15); ctx.fill();

  ctx.fillStyle = isEnraged ? '#fde047' : '#ef4444';
  ctx.beginPath(); ctx.moveTo(-25, -10); ctx.lineTo(-32, -4); ctx.lineTo(-22, -6); ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.moveTo(-30, -5); ctx.quadraticCurveTo(-50, -5, -60, 5); ctx.quadraticCurveTo(-45, 10, -30, 5); ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(40, -60 + wingY); ctx.lineTo(25, 10); ctx.fill();

  ctx.restore();
}

function drawOwl(ctx, x, y, frame) {
  ctx.save(); ctx.translate(x, y);
  const wingAngle = Math.sin(frame * 0.2) * 0.5;
  
  // Back Wing
  ctx.save();
  ctx.translate(5, -5);
  ctx.rotate(-wingAngle + 0.5);
  ctx.fillStyle = '#78350f';
  ctx.beginPath(); ctx.ellipse(0, 8, 7, 14, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // Body
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath(); ctx.ellipse(0, 5, 20, 25, 0, 0, Math.PI*2); ctx.fill();
  
  // Belly
  ctx.fillStyle = '#e4e4e7';
  ctx.beginPath(); ctx.ellipse(-5, 10, 12, 15, 0, 0, Math.PI*2); ctx.fill();

  // Eyes
  ctx.fillStyle = '#fef08a';
  ctx.beginPath(); ctx.arc(-10, -5, 7, 0, Math.PI*2); ctx.arc(6, -5, 7, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(-10, -5, 3, 0, Math.PI*2); ctx.arc(6, -5, 3, 0, Math.PI*2); ctx.fill();
  
  // Beak
  ctx.fillStyle = '#d97706';
  ctx.beginPath(); ctx.moveTo(-5, 1); ctx.lineTo(1, 1); ctx.lineTo(-4, 8); ctx.fill();

  // Ears
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath(); ctx.ellipse(-15, -15, 5, 10, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10, -15, 5, 10, 0.3, 0, Math.PI*2); ctx.fill();
  
  // Front Wing
  ctx.save();
  ctx.translate(2, 5);
  ctx.rotate(wingAngle - 0.3);
  ctx.fillStyle = '#92400e';
  ctx.beginPath(); ctx.ellipse(0, 10, 10, 18, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  
  ctx.restore();
}

// ===== WORLD 2: ICE DRAWING FUNCTIONS =====

function drawPenguinMinion(ctx, x, y, frame) {
  ctx.save(); ctx.translate(x, y);
  // Body (black)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.ellipse(0, 0, 10, 14, 0, 0, Math.PI*2); ctx.fill();
  // Belly (white)
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath(); ctx.ellipse(0, 3, 6, 9, 0, 0, Math.PI*2); ctx.fill();
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-4, -6, 3, 0, Math.PI*2); ctx.arc(4, -6, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(-4, -6, 1.5, 0, Math.PI*2); ctx.arc(4, -6, 1.5, 0, Math.PI*2); ctx.fill();
  // Beak
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(0, 3); ctx.lineTo(3, -2); ctx.closePath(); ctx.fill();
  // Feet
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-8, 12, 5, 3); ctx.fillRect(3, 12, 5, 3);
  // Wobble animation
  const wobble = Math.sin(frame * 0.15) * 2;
  ctx.translate(wobble, 0);
  ctx.restore();
}

function drawPenguinBoss(ctx, x, y, frame, isEnraged) {
  ctx.save(); ctx.translate(x, y);
  
  if (isEnraged) {
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ef4444';
  }
  
  // Shadow on ground
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 5, 35, 8, 0, 0, Math.PI*2); ctx.fill();
  
  // Body (dark blue-black)
  ctx.fillStyle = isEnraged ? '#450a0a' : '#0f172a';
  ctx.beginPath(); ctx.ellipse(0, -25, 28, 35, 0, 0, Math.PI*2); ctx.fill();
  
  // Belly (white/cream)
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath(); ctx.ellipse(0, -15, 18, 25, 0, 0, Math.PI*2); ctx.fill();
  
  // Gold belly patch (emperor feature)
  const bGrad = ctx.createRadialGradient(0, -25, 2, 0, -25, 15);
  bGrad.addColorStop(0, '#fbbf24'); bGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = bGrad;
  ctx.beginPath(); ctx.ellipse(0, -30, 10, 8, 0, 0, Math.PI*2); ctx.fill();
  
  // Head
  ctx.fillStyle = isEnraged ? '#450a0a' : '#0f172a';
  ctx.beginPath(); ctx.arc(0, -55, 18, 0, Math.PI*2); ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-8, -58, 5, 0, Math.PI*2); ctx.arc(8, -58, 5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = isEnraged ? '#ef4444' : '#1e293b';
  ctx.beginPath(); ctx.arc(-8, -58, 2.5, 0, Math.PI*2); ctx.arc(8, -58, 2.5, 0, Math.PI*2); ctx.fill();
  
  // Beak
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.moveTo(-5, -50); ctx.lineTo(0, -42); ctx.lineTo(5, -50); ctx.closePath(); ctx.fill();
  
  // Ice Crown
  ctx.fillStyle = '#93c5fd';
  ctx.shadowBlur = 10; ctx.shadowColor = '#60a5fa';
  ctx.beginPath();
  ctx.moveTo(-12, -70); ctx.lineTo(-8, -82); ctx.lineTo(-4, -72);
  ctx.lineTo(0, -85); ctx.lineTo(4, -72);
  ctx.lineTo(8, -82); ctx.lineTo(12, -70);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  
  // Flippers (animated)
  const flapAngle = Math.sin(frame * 0.2) * 0.3;
  ctx.save(); ctx.translate(-25, -30); ctx.rotate(-0.5 + flapAngle);
  ctx.fillStyle = isEnraged ? '#450a0a' : '#0f172a';
  ctx.beginPath(); ctx.ellipse(0, 0, 8, 20, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.translate(25, -30); ctx.rotate(0.5 - flapAngle);
  ctx.fillStyle = isEnraged ? '#450a0a' : '#0f172a';
  ctx.beginPath(); ctx.ellipse(0, 0, 8, 20, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  
  // Feet
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-18, 0, 12, 5); ctx.fillRect(6, 0, 12, 5);
  
  ctx.restore();
}

function drawEagle(ctx, x, y, frame) {
  ctx.save(); ctx.translate(x, y);
  const wingAngle = Math.sin(frame * 0.25) * 0.6;
  
  // Wings
  ctx.save(); ctx.translate(-5, -5); ctx.rotate(-wingAngle + 0.4);
  ctx.fillStyle = '#78350f';
  ctx.beginPath(); ctx.ellipse(-5, 8, 10, 22, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  
  // Body
  ctx.fillStyle = '#451a03';
  ctx.beginPath(); ctx.ellipse(0, 5, 18, 22, 0, 0, Math.PI*2); ctx.fill();
  
  // Head
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath(); ctx.arc(0, -15, 12, 0, Math.PI*2); ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#78350f';
  ctx.beginPath(); ctx.arc(-5, -17, 3, 0, Math.PI*2); ctx.arc(5, -17, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(-5, -17, 1.5, 0, Math.PI*2); ctx.arc(5, -17, 1.5, 0, Math.PI*2); ctx.fill();
  
  // Beak (hooked)
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.moveTo(-3, -10); ctx.lineTo(0, -4); ctx.lineTo(3, -10); ctx.closePath(); ctx.fill();
  
  // Front Wing
  ctx.save(); ctx.translate(5, 0); ctx.rotate(wingAngle - 0.3);
  ctx.fillStyle = '#92400e';
  ctx.beginPath(); ctx.ellipse(5, 10, 12, 20, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  
  ctx.restore();
}

function drawFeather(ctx, x, y, vx, vy) {
  const angle = Math.atan2(vy, vx);
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  ctx.fillStyle = '#ef4444'; ctx.beginPath();
  ctx.moveTo(-10, 0); ctx.quadraticCurveTo(0, -5, 10, 0); ctx.quadraticCurveTo(0, 5, -10, 0); ctx.fill();
  ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
  ctx.restore();
}


function drawThunderbirdBoss(ctx, x, y, frame, isEnraged, shield) { ctx.save(); ctx.translate(x, y); const flap = Math.sin(frame * 0.4) * 0.5; ctx.save(); ctx.translate(-15, -20); ctx.rotate(-flap); ctx.fillStyle = '#6d28d9'; ctx.beginPath(); ctx.ellipse(-10, 5, 12, 25, -0.5, 0, Math.PI*2); ctx.fill(); ctx.restore(); ctx.save(); ctx.translate(15, -20); ctx.rotate(flap); ctx.fillStyle = '#6d28d9'; ctx.beginPath(); ctx.ellipse(10, 5, 12, 25, 0.5, 0, Math.PI*2); ctx.fill(); ctx.restore(); ctx.fillStyle = '#4c1d95'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 25, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#c4b5fd'; ctx.beginPath(); ctx.moveTo(-10, -5); ctx.lineTo(10, -5); ctx.lineTo(0, 15); ctx.fill(); if (shield > 0) { ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI*2); ctx.stroke(); } ctx.restore(); }
function drawElectricBat(ctx, x, y, frame) { ctx.save(); ctx.translate(x, y); const flap = Math.sin(frame * 0.6) * 15; ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-20, flap); ctx.lineTo(-10, 5); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(20, flap); ctx.lineTo(10, 5); ctx.fill(); ctx.fillStyle = '#38bdf8'; ctx.fillRect(-3, -4, 2, 2); ctx.fillRect(1, -4, 2, 2); ctx.restore(); }
function drawMiniTesla(ctx, x, y, frame) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#475569'; ctx.fillRect(-10, -5, 20, 15); ctx.fillStyle = '#6d28d9'; ctx.beginPath(); ctx.arc(0, -5, 12, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(0, -15); ctx.lineTo(5, -5); ctx.stroke(); ctx.restore(); }
function drawGravityGate(ctx, x, y, frame, radius) { ctx.save(); ctx.translate(x, y); ctx.rotate(frame * 0.05); ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([10, 10]); ctx.strokeStyle = '#ddd6fe'; ctx.beginPath(); ctx.arc(0, 0, radius - 5, 0, Math.PI*2); ctx.stroke(); ctx.restore(); }
