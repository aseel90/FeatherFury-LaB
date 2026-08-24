(()=>{'use strict';
function install(){
const g=window.game;if(!g?.__w3FinalBalanceV4Installed)return false;if(g.__w3CriticalFixV5Installed)return true;
const C=(typeof CONFIG!=='undefined'&&CONFIG)?CONFIG:{},W3=2,W=()=>+C.CANVAS_WIDTH||360,H=()=>+C.CANVAS_HEIGHT||640,G=()=>H()-(+C.GROUND_HEIGHT||95),cl=(v,a,b)=>Math.max(a,Math.min(b,v));

function fixTeslas(x){
 if(x.activeWorld!==W3||x.boss?.active)return;
 const gap=+C.W3_GAP_SIZE||130,arr=x.miniTeslas||[],used=new Set(arr.filter(m=>m?.pillar&&!m.pillar.smashed).map(m=>m.pillar)),keep=[];
 for(const m of arr){
  if(!m?.__w3Director){keep.push(m);continue;}
  if(m.pillar?.smashed)continue;
  if(!m.pillar){
   const candidates=(x.pillars||[]).filter(p=>p&&!p.smashed&&p.x>x.bird.x+85&&p.x<W()+95&&!used.has(p));
   if(!candidates.length)continue;
   candidates.sort((a,b)=>a.x-b.x);
   m.pillar=candidates[0];used.add(m.pillar);m.vx=0;m.__w3AnchoredV5=true;m.__zap=null;m.__zt=0;m.__zy=undefined;m.__w3V4ZapResolved=false;
  }
  m.x=m.pillar.x+30;m.y=m.pillar.topHeight+gap+1;m.vx=0;keep.push(m);
 }
 x.miniTeslas=keep;
}

function beginSonic(x){
 if(x.__w3SonicV5?.active||!x.boss?.active)return;
 const top=66,bottom=G()-24,mid=(top+bottom)/2,serial=+x.__w3SonicSerialV5||0;
 x.__w3SonicSerialV5=serial+1;
 let mode=x.bird.y<=mid?'top':'bottom';
 if(serial%3===2)mode=mode==='top'?'bottom':'top';
 x.__w3SonicV5={active:true,phase:'warn',timer:0,mode,top,bottom,mid,waves:[]};
}
function captureLegacy(x){if(x.activeWorld===W3&&x.__w3SonicV4?.active){beginSonic(x);x.__w3SonicV4=null;}}
function fireSonic(x,s){s.phase='fire';s.timer=0;const sp=x.boss?.enraged?3.8:3.4,delay=x.boss?.enraged?34:42;s.waves=[0,1,2].map((_,i)=>({x:x.boss.x-30,delay:i*delay,speed:sp+i*.05,passed:false,dead:false}));x.sound?.playVoltSonic?.();x.screenShake=Math.max(+x.screenShake||0,3);}
function updateSonic(x){
 const s=x.__w3SonicV5;if(!s?.active)return;
 if(x.activeWorld!==W3||!x.boss?.active||x.state!=='PLAYING'){x.__w3SonicV5=null;return;}
 s.timer++;if(s.phase==='warn'){if(s.timer>=(x.boss.enraged?34:42))fireSonic(x,s);return;}
 let alive=0;
 for(const w of s.waves){if(w.dead)continue;if(w.delay>0){w.delay--;alive++;continue;}w.x-=w.speed;
  if(!w.passed&&w.x-24<=x.bird.x&&w.x+18>=x.bird.x){w.passed=true;if(x.invincibleTimer<=0&&!x.feverActive){const hit=s.mode==='top'?x.bird.y<=s.mid-10:x.bird.y>=s.mid+10;if(hit){x.gameOver(false);return;}}}
  if(w.x<x.bird.x-32)w.passed=true;if(w.x<-80)w.dead=true;else alive++;
 }
 if(!alive)x.__w3SonicV5=null;
}
function crescent(c,x,s,a){const top=s.top,bottom=s.bottom,mid=s.mid,up=s.mode==='top',y1=up?top:mid+16,y2=up?mid-16:bottom,ym=(y1+y2)/2;c.beginPath();c.moveTo(x+10,y1);c.quadraticCurveTo(x-25,ym,x+10,y2);c.quadraticCurveTo(x-9,ym,x+18,y1);c.closePath();c.fillStyle=`rgba(167,139,250,${.10+a*.14})`;c.fill();c.strokeStyle=`rgba(238,242,255,${.58+a*.34})`;c.lineWidth=3.5;c.stroke();c.beginPath();c.moveTo(x+22,y1+5);c.quadraticCurveTo(x-16,ym,x+22,y2-5);c.strokeStyle=`rgba(125,211,252,${.35+a*.35})`;c.lineWidth=1.7;c.stroke();}
function drawSonic(x,c){
 const s=x.__w3SonicV5;if(!s?.active||x.state!=='PLAYING')return;c.save();c.lineCap='round';c.lineJoin='round';
 if(s.phase==='warn'){const p=.5+.5*Math.sin(x.frame*.38),up=s.mode==='top',y1=up?s.top:s.mid+16,y2=up?s.mid-16:s.bottom;c.fillStyle=`rgba(${up?'139,92,246':'56,189,248'},${.035+p*.035})`;c.fillRect(0,y1,W(),Math.max(1,y2-y1));for(let i=0;i<3;i++)crescent(c,x.boss.x-24-i*10,s,.42+p*.25);const sy=up?s.mid+66:s.mid-66,ax=x.bird.x+38;c.strokeStyle=`rgba(125,211,252,${.58+p*.35})`;c.lineWidth=4;c.beginPath();if(up){c.moveTo(ax,sy-12);c.lineTo(ax,sy+10);c.lineTo(ax-9,sy+1);c.moveTo(ax,sy+10);c.lineTo(ax+9,sy+1);}else{c.moveTo(ax,sy+12);c.lineTo(ax,sy-10);c.lineTo(ax-9,sy-1);c.moveTo(ax,sy-10);c.lineTo(ax+9,sy-1);}c.stroke();}
 else for(const w of s.waves){if(w.dead||w.delay>0)continue;const a=cl(1-Math.abs(x.bird.x-w.x)/(W()+80),.34,.95);c.shadowColor='#c4b5fd';c.shadowBlur=8;crescent(c,w.x,s,a);c.shadowBlur=0;}
 c.restore();
}
const oldReset=g.reset?.bind(g);if(oldReset)g.reset=function(...a){this.__w3SonicV5=null;this.__w3SonicSerialV5=0;return oldReset(...a);};
const oldUpdate=g.update?.bind(g);if(oldUpdate)g.update=function(){if(this.activeWorld===W3){fixTeslas(this);captureLegacy(this);if(this.__w3SonicV5?.active)for(const p of(this.heroProjectiles||[]))if(p?.active)p.__w3V4DodgeChecked=true;}const r=oldUpdate();if(this.activeWorld===W3){captureLegacy(this);fixTeslas(this);updateSonic(this);}return r;};
const oldDraw=g.draw?.bind(g);if(oldDraw)g.draw=function(){if(this.activeWorld===W3)this.__w3SonicV4=null;const r=oldDraw();if(this.activeWorld===W3&&this.ctx)drawSonic(this,this.ctx);return r;};
g.__w3CriticalFixV5Installed=true;console.log('[FF-LAB] w3-critical-fix-v5-installed');return true;
}
let n=0;const t=setInterval(()=>{if(install()||++n>160)clearInterval(t);},80);setTimeout(install,1600);
})();
