(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game?.__w2VisualsV1Installed || typeof game.drawPenguinBossSprite !== 'function') return false;
    if (game.__w2EmperorArtV1Installed) return true;

    const shard = (ctx, pts, hot=false, alpha=1) => {
      const ys = pts.map(p => p[1]);
      const g = ctx.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys) || 1);
      g.addColorStop(0, hot ? `rgba(254,226,226,${alpha})` : `rgba(236,254,255,${alpha})`);
      g.addColorStop(.42, hot ? `rgba(125,211,252,${alpha})` : `rgba(103,232,249,${alpha})`);
      g.addColorStop(1, hot ? `rgba(37,99,235,${alpha})` : `rgba(29,78,216,${alpha})`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(...pts[0]);
      for (let i=1;i<pts.length;i++) ctx.lineTo(...pts[i]);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = hot ? `rgba(254,202,202,${.62*alpha})` : `rgba(186,230,253,${.68*alpha})`;
      ctx.lineWidth = 1.1; ctx.stroke();
    };

    function cape(ctx, phase2, pose) {
      const sweep = pose === 'air' ? 11 : pose === 'attack' ? 6 : 0;
      const g = ctx.createLinearGradient(0,-60,0,10);
      g.addColorStop(0,'#173b69'); g.addColorStop(1,'#061426');
      ctx.fillStyle=g; ctx.beginPath();
      ctx.moveTo(-25,-56); ctx.quadraticCurveTo(-49,-35,-47+sweep,8);
      ctx.lineTo(-31,2); ctx.lineTo(-23,13); ctx.lineTo(0,2);
      ctx.lineTo(23,13); ctx.lineTo(31,2); ctx.lineTo(47-sweep,8);
      ctx.quadraticCurveTo(49,-35,25,-56); ctx.closePath(); ctx.fill();
      ctx.strokeStyle=phase2?'rgba(103,232,249,.62)':'rgba(125,211,252,.26)'; ctx.lineWidth=1.3; ctx.stroke();
    }

    function crown(ctx, frame, phase2) {
      ctx.save(); ctx.translate(0,-82);
      ctx.shadowBlur=phase2?16:9; ctx.shadowColor='#38bdf8';
      shard(ctx,[[-18,7],[-15,-10],[-8,0],[-3,-22],[2,-2],[9,-15],[12,0],[18,-9],[19,7]],false,1);
      ctx.shadowBlur=0; ctx.globalAlpha=.5+.3*Math.sin(frame*.12);
      ctx.strokeStyle='#f0fdff'; ctx.lineWidth=1.2; ctx.beginPath();
      ctx.moveTo(-3,-18);ctx.lineTo(0,-2);ctx.moveTo(-13,-6);ctx.lineTo(-10,3);ctx.moveTo(9,-11);ctx.lineTo(12,2);ctx.stroke();
      ctx.restore();
    }

    function shoulder(ctx, side, phase2) {
      ctx.save(); ctx.scale(side,1);
      shard(ctx,[[20,-51],[35,-59],[31,-45],[45,-48],[34,-35],[20,-38]],false,1);
      if(phase2){ shard(ctx,[[30,-54],[40,-71],[40,-50]],false,.95); shard(ctx,[[37,-43],[52,-53],[45,-36]],false,.8); }
      ctx.restore();
    }

    function wing(ctx, side, pose, phase2) {
      const air=pose==='air', attack=pose==='attack', slide=pose==='slide';
      ctx.save(); ctx.scale(side,1); ctx.translate(24,-38); ctx.rotate(air?-.63:slide?-.34:attack?-.18:-.08);
      const g=ctx.createLinearGradient(0,-8,34,25); g.addColorStop(0,'#1e3a5f');g.addColorStop(1,'#071426');
      ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(-2,-6);ctx.quadraticCurveTo(22,-4,34+(air?8:0),15);ctx.quadraticCurveTo(21,29,4,18);ctx.quadraticCurveTo(-2,9,-2,-6);ctx.fill();
      ctx.strokeStyle=phase2?'rgba(103,232,249,.55)':'rgba(125,211,252,.25)';ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
    }

    function face(ctx, phase2, attack) {
      ctx.save(); ctx.translate(0,-64);
      ctx.fillStyle='#071426';ctx.beginPath();ctx.ellipse(0,2,22,19,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f8fafc';ctx.beginPath();ctx.ellipse(-8,1,7,6,-.14,0,Math.PI*2);ctx.ellipse(8,1,7,6,.14,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#07111f';ctx.beginPath();ctx.ellipse(-7.3,1,3.4,3.8,0,0,Math.PI*2);ctx.ellipse(7.3,1,3.4,3.8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=phase2?'#e0f2fe':'#38bdf8';ctx.beginPath();ctx.arc(-7.1,1,1.6,0,Math.PI*2);ctx.arc(7.1,1,1.6,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#bae6fd';ctx.lineWidth=phase2?3.5:3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-16,-8);ctx.lineTo(-4,-4);ctx.moveTo(16,-8);ctx.lineTo(4,-4);ctx.stroke();
      const b=ctx.createLinearGradient(0,8,0,19);b.addColorStop(0,'#fbbf24');b.addColorStop(1,'#d97706');ctx.fillStyle=b;ctx.beginPath();
      if(attack){ctx.moveTo(-8,8);ctx.lineTo(0,20);ctx.lineTo(9,8);ctx.lineTo(0,12);}else{ctx.moveTo(-8,8);ctx.lineTo(0,16);ctx.lineTo(9,8);ctx.lineTo(0,11);}ctx.closePath();ctx.fill();
      ctx.restore();
    }

    function chest(ctx, frame, phase2) {
      ctx.save();ctx.translate(0,-29);ctx.shadowBlur=phase2?15:8;ctx.shadowColor='#38bdf8';
      shard(ctx,[[0,-14],[9,-3],[6,10],[0,16],[-6,10],[-9,-3]],false,1);ctx.shadowBlur=0;
      ctx.globalAlpha=.45+.25*Math.sin(frame*.15);ctx.strokeStyle='#fff';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-2,-10);ctx.lineTo(2,10);ctx.stroke();ctx.restore();
    }

    function scepter(ctx, frame, pose, phase2) {
      const attack=pose==='attack';ctx.save();ctx.translate(39,-37);ctx.rotate(attack?-.25:.035);
      ctx.strokeStyle='#071426';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(0,40);ctx.stroke();
      ctx.strokeStyle='#7dd3fc';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(0,40);ctx.stroke();ctx.translate(0,-34);
      ctx.shadowBlur=attack||phase2?18:10;ctx.shadowColor='#38bdf8';shard(ctx,[[-8,8],[-13,-4],[-5,-18],[0,-30],[6,-17],[14,-4],[8,8],[0,14]],false,1);ctx.shadowBlur=0;
      if(attack){ctx.globalAlpha=.55+.2*Math.sin(frame*.2);ctx.strokeStyle='#a5f3fc';ctx.lineWidth=1.3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,-6,18+i*7,-.6,.72);ctx.stroke();}}
      ctx.restore();
    }

    function attackShards(ctx, frame, pose, phase2) {
      if(pose!=='attack')return;ctx.save();ctx.globalAlpha=.9;const dx=55+4*Math.sin(frame*.18);const count=phase2?5:3;
      for(let i=0;i<count;i++){const y=-58+i*(phase2?12:18);ctx.save();ctx.translate(-dx-i*13,y);ctx.rotate(-Math.PI/2);shard(ctx,[[-4,8],[0,-14],[4,8],[0,4]],false,.95);ctx.restore();}ctx.restore();
    }

    function phaseAura(ctx, frame) {
      const pulse=.26+.08*Math.sin(frame*.14);ctx.save();ctx.globalAlpha=pulse;ctx.strokeStyle='#67e8f9';ctx.lineWidth=1.7;
      ctx.beginPath();ctx.ellipse(0,-34,43,50,0,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<4;i++){const a=frame*.025+i*Math.PI/2;const x=Math.cos(a)*48,y=-34+Math.sin(a)*38;ctx.save();ctx.translate(x,y);ctx.rotate(a);shard(ctx,[[-3,5],[0,-8],[3,5],[0,2]],false,.65);ctx.restore();}ctx.restore();
    }

    game.drawPenguinBossSprite = function(ctx,x,y,frame,enraged){
      const boss=this.boss,state=boss?.state||'IDLE';
      const phase2=!!(enraged||boss?.__w2V6Phase2Started);
      const slide=state==='SLIDE_PREP'||state==='SLIDING';
      const air=state==='JUMP_PREP'||state==='JUMPING'||state==='LANDING';
      const attack=state==='IDLE'&&Number(boss?.__w2V8FireCooldown)<16;
      const pose=slide?'slide':air?'air':attack?'attack':'idle';
      const f=frame||0,breathe=Math.sin(f*.09),crouch=state==='JUMP_PREP'?4:state==='SLIDE_PREP'?3:state==='LANDING'?2:0;
      const lean=slide?-.09:state==='RETURNING'?.025:0;

      ctx.save();ctx.translate(x,y+crouch+(state==='IDLE'?breathe*.7:0));ctx.rotate(lean);
      ctx.fillStyle='rgba(2,6,23,.32)';ctx.beginPath();ctx.ellipse(0,5,43,9,0,0,Math.PI*2);ctx.fill();
      if(phase2)phaseAura(ctx,f);
      cape(ctx,phase2,pose);

      ctx.fillStyle='#102b46';ctx.beginPath();ctx.moveTo(-27,-55);ctx.lineTo(-37,-20);ctx.lineTo(-29,-1);ctx.lineTo(-15,-13);ctx.lineTo(0,-4);ctx.lineTo(15,-13);ctx.lineTo(29,-1);ctx.lineTo(37,-20);ctx.lineTo(27,-55);ctx.closePath();ctx.fill();
      shoulder(ctx,-1,phase2);shoulder(ctx,1,phase2);wing(ctx,-1,pose,phase2);wing(ctx,1,pose,phase2);

      const body=ctx.createLinearGradient(0,-66,0,6);body.addColorStop(0,'#17283d');body.addColorStop(.58,'#0d1b2d');body.addColorStop(1,'#06101e');ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,-30,34,41,0,0,Math.PI*2);ctx.fill();
      const belly=ctx.createLinearGradient(0,-52,0,6);belly.addColorStop(0,'#fff');belly.addColorStop(.58,'#e2eef3');belly.addColorStop(1,'#9fc4d2');ctx.fillStyle=belly;ctx.beginPath();ctx.ellipse(0,-23,21,31,0,0,Math.PI*2);ctx.fill();

      ctx.fillStyle='#23628b';ctx.beginPath();ctx.moveTo(-19,-53);ctx.lineTo(-10,-45);ctx.lineTo(0,-50);ctx.lineTo(10,-45);ctx.lineTo(19,-53);ctx.lineTo(14,-39);ctx.lineTo(0,-35);ctx.lineTo(-14,-39);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(186,230,253,.55)';ctx.lineWidth=1;ctx.stroke();
      chest(ctx,f,phase2);face(ctx,phase2,attack);crown(ctx,f,phase2);scepter(ctx,f,pose,phase2);attackShards(ctx,f,pose,phase2);

      ctx.fillStyle='#e69a1f';ctx.beginPath();ctx.ellipse(-16,3,10,3.4,-.06,0,Math.PI*2);ctx.ellipse(16,3,10,3.4,.06,0,Math.PI*2);ctx.fill();
      ctx.restore();
    };

    game.__w2EmperorArtV1Installed=true;
    window.__FF_W2_EMPEROR_ART_V1__={version:'w2-emperor-art-v2',canvas2d:true,gameplayGeometryChanged:false,hitboxesChanged:false,runtimeChanged:false,statePoses:['idle','attack','air','slide','phase2'],motifs:['crystal-crown','royal-cape','ice-scepter','chest-crystal','armored-shoulders']};
    console.log('[FF-LAB] w2-emperor-art-v2-installed');return true;
  }

  let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>120)clearInterval(timer);},80);setTimeout(install,1200);
})();