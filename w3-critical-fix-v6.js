(()=>{'use strict';
function install(){
const g=window.game;if(!g?.__w3FinalBalanceV4Installed)return false;if(g.__w3CriticalFixV6Installed)return true;
const C=(typeof CONFIG!=='undefined'&&CONFIG)?CONFIG:{},W3=2,W=()=>+C.CANVAS_WIDTH||360,H=()=>+C.CANVAS_HEIGHT||640,G=()=>H()-(+C.GROUND_HEIGHT||95),cl=(v,a,b)=>Math.max(a,Math.min(b,v));

// Keep Teslas physically attached to their carrier pillar. Pillar-less pressure Teslas are
// allowed to mount ONLY while the carrier pillar is still off-screen, so they never pop in.
function fixTeslas(x){
 if(x.activeWorld!==W3||x.boss?.active)return;
 const gap=+C.W3_GAP_SIZE||130,arr=x.miniTeslas||[],used=new Set(arr.filter(m=>m?.pillar&&!m.pillar.smashed).map(m=>m.pillar)),keep=[];
 for(const m of arr){
  if(!m?.__w3Director){keep.push(m);continue;}
  if(m.pillar?.smashed)continue;
  if(!m.pillar){
   const candidates=(x.pillars||[]).filter(p=>p&&!p.smashed&&p.x>W()+8&&!used.has(p));
   if(!candidates.length){
    // Keep the pending Tesla completely off-screen until a NEW pillar is available.
    m.x=Math.max(+m.x||0,W()+150);m.y=-120;m.vx=0;m.__w3AwaitCarrierV6=true;keep.push(m);continue;
   }
   candidates.sort((a,b)=>a.x-b.x);m.pillar=candidates[0];used.add(m.pillar);m.vx=0;m.__w3AwaitCarrierV6=false;m.__w3AnchoredV6=true;m.__zap=null;m.__zt=0;m.__zy=undefined;m.__w3V4ZapResolved=false;
  }
  m.x=m.pillar.x+(+m.pillar.width||60)/2;m.y=(+m.pillar.topHeight||0)+gap+1;m.vx=0;keep.push(m);
 }
 x.miniTeslas=keep;
}

function beginSonic(x){if(x.__w3SonicV6?.active||!x.boss?.active)return;const top=66,bottom=G()-24,mid=(top+bottom)/2,serial=+x.__w3SonicSerialV6||0;x.__w3SonicSerialV6=serial+1;let mode=x.bird.y<=mid?'top':'bottom';if(serial%3===2)mode=mode==='top'?'bottom':'top';x.__w3SonicV6={active:true,phase:'warn',timer:0,mode,top,bottom,mid,waves:[]};}
function captureLegacy(x){if(x.activeWorld===W3&&x.__w3SonicV4?.active){beginSonic(x);x.__w3SonicV4=null;}if(x.activeWorld===W3&&x.__w3SonicV5?.active){if(!x.__w3SonicV6?.active){const s=x.__w3SonicV5;beginSonic(x);if(x.__w3SonicV6)x.__w3SonicV6.mode=s.mode||x.__w3SonicV6.mode;}x.__w3SonicV5=null;}}
function fireSonic(x,s){s.phase='fire';s.timer=0;const sp=x.boss?.enraged?3.8:3.4,delay=x.boss?.enraged?34:42;s.waves=[0,1,2].map((_,i)=>({x:x.boss.x-30,delay:i*delay,speed:sp+i*.05,passed:false,dead:false}));x.sound?.playVoltSonic?.();x.screenShake=Math.max(+x.screenShake||0,3);}
function updateSonic(x){const s=x.__w3SonicV6;if(!s?.active)return;if(x.activeWorld!==W3||!x.boss?.active||x.state!=='PLAYING'){x.__w3SonicV6=null;return;}s.timer++;if(s.phase==='warn'){if(s.timer>=(x.boss.enraged?34:42))fireSonic(x,s);return;}let alive=0;for(const w of s.waves){if(w.dead)continue;if(w.delay>0){w.delay--;alive++;continue;}w.x-=w.speed;if(!w.passed&&w.x-24<=x.bird.x&&w.x+18>=x.bird.x){w.passed=true;if(x.invincibleTimer<=0&&!x.feverActive){const hit=s.mode==='top'?x.bird.y<=s.mid-10:x.bird.y>=s.mid+10;if(hit){x.gameOver(false);return;}}}if(w.x<x.bird.x-32)w.passed=true;if(w.x<-80)w.dead=true;else alive++;}if(!alive)x.__w3SonicV6=null;}

// Visual-only redesign: three clean neon sonic arcs. Gameplay/hit logic above is unchanged.
function sonicArc(c,x,s,a,offset=0){
 const up=s.mode==='top',y1=up?s.top:s.mid+16,y2=up?s.mid-16:s.bottom,cy=(y1+y2)/2,ry=Math.max(34,(y2-y1)/2-7),rx=31+offset*8;
 c.save();
 const grad=c.createLinearGradient(x-rx,cy,x+rx,cy);grad.addColorStop(0,`rgba(125,211,252,${.22+a*.34})`);grad.addColorStop(.55,`rgba(196,181,253,${.46+a*.38})`);grad.addColorStop(1,`rgba(238,242,255,${.68+a*.28})`);
 c.strokeStyle=grad;c.lineWidth=Math.max(1.5,4.6-offset*.75);c.shadowColor=offset===0?'#c4b5fd':'#7dd3fc';c.shadowBlur=offset===0?11:6;c.beginPath();
 // Left-facing half ellipse: reads as a travelling pressure-wave front rather than a wall.
 c.ellipse(x+18+offset*7,cy,rx,ry,0,Math.PI/2,Math.PI*1.5,false);c.stroke();
 c.shadowBlur=0;c.strokeStyle=`rgba(255,255,255,${.16+a*.20})`;c.lineWidth=1;c.beginPath();c.ellipse(x+20+offset*7,cy,Math.max(8,rx-4),Math.max(18,ry-7),0,Math.PI/2,Math.PI*1.5,false);c.stroke();
 c.restore();
}
function drawSonic(x,c){const s=x.__w3SonicV6;if(!s?.active||x.state!=='PLAYING')return;c.save();c.lineCap='round';c.lineJoin='round';const up=s.mode==='top',y1=up?s.top:s.mid+16,y2=up?s.mid-16:s.bottom;if(s.phase==='warn'){const p=.5+.5*Math.sin(x.frame*.38);const band=c.createLinearGradient(0,y1,0,y2);band.addColorStop(0,`rgba(139,92,246,${.018+p*.018})`);band.addColorStop(.6,`rgba(56,189,248,${.025+p*.022})`);band.addColorStop(1,'rgba(56,189,248,0)');c.fillStyle=band;c.fillRect(0,y1,W(),Math.max(1,y2-y1));for(let i=0;i<3;i++)sonicArc(c,x.boss.x-22-i*5,s,.38+p*.22,i);const sy=up?s.mid+66:s.mid-66,ax=x.bird.x+38;c.strokeStyle=`rgba(125,211,252,${.58+p*.35})`;c.lineWidth=4;c.beginPath();if(up){c.moveTo(ax,sy-12);c.lineTo(ax,sy+10);c.lineTo(ax-9,sy+1);c.moveTo(ax,sy+10);c.lineTo(ax+9,sy+1);}else{c.moveTo(ax,sy+12);c.lineTo(ax,sy-10);c.lineTo(ax-9,sy-1);c.moveTo(ax,sy-10);c.lineTo(ax+9,sy-1);}c.stroke();}else for(const w of s.waves){if(w.dead||w.delay>0)continue;const a=cl(1-Math.abs(x.bird.x-w.x)/(W()+80),.34,.95);for(let i=0;i<3;i++)sonicArc(c,w.x-i*3,s,a,i);}c.restore();}

const oldReset=g.reset?.bind(g);if(oldReset)g.reset=function(...a){this.__w3SonicV6=null;this.__w3SonicSerialV6=0;return oldReset(...a);};
const oldUpdate=g.update?.bind(g);if(oldUpdate)g.update=function(){if(this.activeWorld===W3){fixTeslas(this);captureLegacy(this);if(this.__w3SonicV6?.active)for(const p of(this.heroProjectiles||[]))if(p?.active)p.__w3V4DodgeChecked=true;}const r=oldUpdate();if(this.activeWorld===W3){captureLegacy(this);fixTeslas(this);updateSonic(this);}return r;};
const oldDraw=g.draw?.bind(g);if(oldDraw)g.draw=function(){if(this.activeWorld===W3){this.__w3SonicV4=null;this.__w3SonicV5=null;}const r=oldDraw();if(this.activeWorld===W3&&this.ctx)drawSonic(this,this.ctx);return r;};
g.__w3CriticalFixV6Installed=true;console.log('[FF-LAB] w3-critical-fix-v6-installed');return true;}
let n=0;const t=setInterval(()=>{if(install()||++n>160)clearInterval(t);},80);setTimeout(install,1600);
})();
