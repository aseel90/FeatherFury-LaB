(() => {
  function install(){
    const game=window.game;
    if(!game||game.__w1FinalStoryV1Installed) return !!game;

    if(typeof game.drawCage==='function') game.drawCage=function(){
      const ctx=this.ctx;
      ctx.save(); ctx.translate(this.bird.x,this.bird.y); ctx.translate(Math.sin(this.frame*.035)*1.2,0);
      const glow=ctx.createRadialGradient(0,0,4,0,0,58);
      glow.addColorStop(0,'rgba(148,163,184,.14)'); glow.addColorStop(1,'rgba(15,23,42,0)');
      ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(0,0,58,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#394557'; ctx.lineWidth=5; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(0,-42); ctx.lineTo(0,-this.bird.y-12); ctx.stroke();
      ctx.strokeStyle='#64748b'; ctx.lineWidth=1.4;
      for(let y=-50;y>-this.bird.y-8;y-=10){ ctx.beginPath(); ctx.ellipse(0,y,4,6,0,0,Math.PI*2); ctx.stroke(); }
      ctx.strokeStyle='#293548'; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(0,-10,31,Math.PI,0); ctx.lineTo(31,30); ctx.lineTo(-31,30); ctx.lineTo(-31,-10); ctx.stroke();
      ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2.6;
      for(let bx=-24;bx<=24;bx+=12){ ctx.beginPath(); ctx.moveTo(bx,-28+Math.abs(bx)*.18); ctx.lineTo(bx,28); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-29,-10); ctx.lineTo(29,-10); ctx.moveTo(-29,22); ctx.lineTo(29,22); ctx.stroke();
      ctx.strokeStyle='rgba(226,232,240,.34)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-24,-25); ctx.lineTo(-24,24); ctx.stroke();
      ctx.restore();
    };

    if(typeof game.launchDash==='function'){
      const prior=game.launchDash.bind(game);
      game.launchDash=function(){
        if(this.activeWorld!==0||!this.sound) return prior();
        const old=this.sound.playSmash; this.sound.playSmash=()=>{};
        let r; try{r=prior();}finally{this.sound.playSmash=old;}
        this.sound.playCageBreak?.(); return r;
      };
    }

    game.drawOwl=function(ctx,x,y,frame){
      ctx.save(); ctx.translate(x,y);
      const wing=Math.sin(frame*.16)*.28,breathe=1+Math.sin(frame*.07)*.015; ctx.scale(breathe,breathe);
      const halo=ctx.createRadialGradient(0,0,8,0,0,62);
      halo.addColorStop(0,'rgba(250,204,21,.18)'); halo.addColorStop(.55,'rgba(245,158,11,.08)'); halo.addColorStop(1,'rgba(15,23,42,0)');
      ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(0,0,62,0,Math.PI*2); ctx.fill();

      ctx.save(); ctx.translate(7,3); ctx.rotate(-.34-wing); ctx.fillStyle='#6b4423'; ctx.beginPath(); ctx.ellipse(7,12,11,25,.15,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#8b5a2b'; for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(8+i*2,12+i*6,7,13,.12,0,Math.PI*2);ctx.fill();} ctx.restore();

      const body=ctx.createLinearGradient(-18,-22,20,28); body.addColorStop(0,'#e7e5e4'); body.addColorStop(.55,'#cbd5e1'); body.addColorStop(1,'#94a3b8');
      ctx.fillStyle=body; ctx.beginPath(); ctx.ellipse(0,8,22,28,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#f1f5f9'; ctx.beginPath(); ctx.ellipse(-1,11,14,19,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(100,116,139,.32)'; ctx.lineWidth=1;
      for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-4+i*6,5);ctx.quadraticCurveTo(-1+i*6,13,-3+i*6,22);ctx.stroke();}

      ctx.fillStyle='#d6d3d1'; ctx.beginPath(); ctx.arc(-1,-13,21,0,Math.PI*2); ctx.fill();
      ctx.beginPath();ctx.moveTo(-18,-25);ctx.lineTo(-14,-39);ctx.lineTo(-7,-29);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(14,-27);ctx.lineTo(18,-40);ctx.lineTo(5,-29);ctx.closePath();ctx.fill();
      ctx.fillStyle='#f8fafc';ctx.beginPath();ctx.arc(-9,-14,9,0,Math.PI*2);ctx.arc(8,-14,9,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(-9,-14,5.5,0,Math.PI*2);ctx.arc(8,-14,5.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(-9,-14,2.5,0,Math.PI*2);ctx.arc(8,-14,2.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-10,-15,.8,0,Math.PI*2);ctx.arc(7,-15,.8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#d97706';ctx.beginPath();ctx.moveTo(-4,-8);ctx.lineTo(3,-8);ctx.lineTo(-1,0);ctx.closePath();ctx.fill();

      ctx.save();ctx.translate(5,5);ctx.rotate(.24+wing);ctx.fillStyle='#7c4a25';ctx.beginPath();ctx.ellipse(4,12,12,24,-.1,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(245,222,179,.28)';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-1,5+i*6);ctx.lineTo(11,10+i*6);ctx.stroke();}ctx.restore();
      ctx.fillStyle='rgba(250,204,21,.62)';for(let i=0;i<5;i++){const a=frame*.025+i*1.25;ctx.beginPath();ctx.arc(Math.cos(a)*(34+i%2*6),Math.sin(a*1.2)*26,1.2,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    };

    game.__w1FinalStoryV1Installed=true;
    console.log('[FF-LAB] w1-final-story-v1-installed');
    return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>90)clearInterval(timer);},100);
  setTimeout(install,1400);setTimeout(install,2600);
})();