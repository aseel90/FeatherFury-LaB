(()=>{
'use strict';
const VERSION='w3-voltbat-png-v1';
const FRAME=128;
const INDEX={idle:0,attack:1,dash:2,phase2:3};
const PARTS=[
  'assets/world3/voltbat/png-sheet-v2.part1.b64?v=1',
  'assets/world3/voltbat/png-sheet-v2.part2.b64?v=1',
  'assets/world3/voltbat/png-sheet-v2.part3.b64?v=1'
];
const sheet=new Image();
sheet.decoding='async';
let installed=false,settled=false,resolveReady;
window.__FF_W3_VOLTBAT_PNG_V1_READY__=new Promise(r=>{resolveReady=r;});
function settle(ok){if(settled)return;settled=true;resolveReady(ok);}
function ready(){return !!(sheet.complete&&sheet.naturalWidth===FRAME*4&&sheet.naturalHeight===FRAME);}
function install(){
  const g=window.game;
  if(!g||typeof g.drawThunderbirdBossSprite!=='function')return false;
  if(g.__w3VoltbatPngV1Installed){installed=true;return true;}
  g.drawThunderbirdBossSprite=function(ctx,x,y,frame,enraged,shield){
    if(!ready())return;
    const b=this.boss||{};
    const state=String(b.state||'IDLE');
    const phase2=!!(enraged||b.__w3Phase2||state==='W3_RAGE');
    const dash=/DASHING|RETURNING/.test(state);
    const attack=/W3_ARC_PREP|W3_ARC_RECOVER|W3_SWARM_PREP|W3_SWARM_RECOVER|DASH_PREP|SONIC|SHIELD_BREAK/.test(state);
    const key=phase2?'phase2':dash?'dash':attack?'attack':'idle';
    const size=132;
    const sx=INDEX[key]*FRAME;
    const f=Number(frame)||0;
    ctx.save();
    ctx.translate(x,y);
    if(Number(shield)>0){
      const pulse=1+Math.sin(f*.18)*.05;
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle=`rgba(74,200,255,${.62+.12*Math.sin(f*.25)})`;
      ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(0,0,60*pulse,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='rgba(192,132,252,.55)';
      ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(0,0,55*pulse,0,Math.PI*2);ctx.stroke();
      const count=Math.max(1,Math.min(3,Math.round(Number(shield)||1)));
      for(let i=0;i<count;i++){
        const a=f*.07+i*Math.PI*2/count;
        const px=Math.cos(a)*59*pulse,py=Math.sin(a)*59*pulse;
        ctx.fillStyle=i%2?'#c084fc':'#7dd3fc';
        ctx.beginPath();ctx.arc(px,py,3.2,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }
    if(phase2){
      const pulse=.82+.18*Math.sin(f*.14);
      ctx.shadowColor=`rgba(168,85,247,${.75*pulse})`;
      ctx.shadowBlur=16+7*pulse;
    }
    ctx.drawImage(sheet,sx,0,FRAME,FRAME,-size/2,-size/2,size,size);
    ctx.restore();
  };
  g.__w3VoltbatPngV1Installed=true;
  window.__FF_W3_VOLTBAT_PNG_V1__={
    version:VERSION,assetType:'png-sprite-sheet-v2',imageBased:true,canvasConstructed:false,
    sourceFrame:[FRAME,FRAME],fixedDrawSize:132,poses:['idle','attack','dash','phase2'],
    shieldRuntimeFx:true,phase2RuntimeGlow:true,bakedEffects:false,runtimeChanged:false,hitboxesChanged:false
  };
  installed=true;
  console.log('[FF] Lord Voltbat PNG sprite set V1 installed');
  return true;
}
Promise.all(PARTS.map(url=>fetch(url,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(`${r.status} ${url}`);return r.text();})))
  .then(parts=>new Promise((resolve,reject)=>{sheet.onload=resolve;sheet.onerror=reject;sheet.src='data:image/png;base64,'+parts.join('');}))
  .then(()=>{if(install())settle(true);else{let n=0,t=setInterval(()=>{if(install()){clearInterval(t);settle(true);}else if(++n>180){clearInterval(t);settle(false);}},50);}})
  .catch(err=>{console.error('[FF] Lord Voltbat PNG sprite load failed',err);settle(false);});
let tries=0,timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer);},50);
setTimeout(install,800);
})();