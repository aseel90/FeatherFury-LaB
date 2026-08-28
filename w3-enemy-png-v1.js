(()=>{
'use strict';
const VERSION='w3-enemy-png-v1';
const FRAME=112;
const BASIC=[0,1,2];
const CHARGED=[3,4,5];
const TOTEM=6;
const PARTS=[
  'assets/world3/enemies/png-sheet-v1.part1.b64?v=1',
  'assets/world3/enemies/png-sheet-v1.part2.b64?v=1',
  'assets/world3/enemies/png-sheet-v1.part3.b64?v=1'
];
const sheet=new Image();
sheet.decoding='async';
let settled=false,resolveReady;
window.__FF_W3_ENEMY_PNG_V1_READY__=new Promise(r=>{resolveReady=r;});
function settle(ok){if(settled)return;settled=true;resolveReady(ok);}
function ready(){return !!(sheet.complete&&sheet.naturalWidth===FRAME*7&&sheet.naturalHeight===FRAME);}
function nearestTesla(g,x,y){
  let best=null,dist=1e9;
  for(const m of (g.miniTeslas||[])){
    if(!m)continue;
    const d=Math.abs((+m.x||0)-x)+Math.abs((+m.y||0)-y);
    if(d<dist){dist=d;best=m;}
  }
  return dist<14?best:null;
}
function install(){
  const g=window.game;
  if(!g||typeof g.drawElectricBatSprite!=='function'||typeof g.drawMiniTeslaSprite!=='function')return false;
  if(g.__w3EnemyPngV1Installed)return true;

  g.drawElectricBatSprite=function(ctx,x,y,frame){
    if(!ready())return;
    const f=Number(frame)||0;
    const bossActive=!!this.boss?.active;
    const charged=bossActive ? !!(this.boss.enraged||this.boss.__w3Phase2) : Number(this.score||0)>=Number((typeof CONFIG!=='undefined'&&CONFIG.STAGE1_END)||15);
    const list=charged?CHARGED:BASIC;
    const anim=(Math.floor((f + Math.abs(Number(x)||0)*.17)/6)%list.length+list.length)%list.length;
    const sx=list[anim]*FRAME;
    const bob=Math.sin((f+(Number(x)||0)*.13)*.12)*1.1;
    const dw=62,dh=50;
    ctx.save();
    ctx.translate(x,y+bob);
    // Assets are tightly alpha-cropped: no baked shadow/halo is drawn here.
    ctx.drawImage(sheet,sx,0,FRAME,FRAME,-dw/2,-dh/2,dw,dh);
    ctx.restore();
  };

  g.drawMiniTeslaSprite=function(ctx,x,y,frame){
    if(!ready())return;
    const m=nearestTesla(this,x,y);
    const state=String(m?.__zap||'idle');
    const f=Number(frame)||0;
    let pulse=1;
    if(state==='charge')pulse=1+Math.sin(f*.32)*.025;
    else if(state==='fire')pulse=1.035;
    const sx=TOTEM*FRAME;
    const dw=48*pulse,dh=68*pulse;
    ctx.save();
    ctx.translate(x,y);
    ctx.drawImage(sheet,sx,0,FRAME,FRAME,-dw/2,-dh+9,dw,dh);
    ctx.restore();
  };

  g.__w3EnemyPngV1Installed=true;
  window.__FF_W3_ENEMY_PNG_V1__={
    version:VERSION,
    assetType:'png-sprite-sheet-v1',
    imageBased:true,
    canvasConstructed:false,
    sourceFrame:[FRAME,FRAME],
    basicBatFrames:BASIC.length,
    chargedBatFrames:CHARGED.length,
    miniVoltTotem:true,
    tightAlphaCrop:true,
    bakedShadow:false,
    bakedGlow:false,
    runtimeChanged:false,
    hitboxesChanged:false
  };
  console.log('[FF] World 3 enemy PNG sprites V1 installed');
  return true;
}
Promise.all(PARTS.map(url=>fetch(url,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(`${r.status} ${url}`);return r.text();})))
  .then(parts=>new Promise((resolve,reject)=>{sheet.onload=resolve;sheet.onerror=reject;sheet.src='data:image/png;base64,'+parts.join('');}))
  .then(()=>{if(install())settle(true);else{let n=0,t=setInterval(()=>{if(install()){clearInterval(t);settle(true);}else if(++n>180){clearInterval(t);settle(false);}},50);}})
  .catch(err=>{console.error('[FF] World 3 enemy PNG load failed',err);settle(false);});
let tries=0,timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer);},50);
setTimeout(install,800);
})();