(()=>{'use strict';
const VERSION='w3-environment-png-v1';
const W3=2;
const BG_PARTS=[
  'assets/world3/environment/w3-storm-bg-v1.part1.b64?v=1',
  'assets/world3/environment/w3-storm-bg-v1.part2.b64?v=1'
];
const GROUND_PARTS=['assets/world3/environment/w3-storm-ground-v1.part1.b64?v=1'];
const read=async files=>(await Promise.all(files.map(async u=>{const r=await fetch(u,{cache:'force-cache'});if(!r.ok)throw new Error(`${VERSION} asset ${r.status}`);return (await r.text()).trim();}))).join('');
const imageFrom=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});
const ready=(async()=>{
  const [bg64,ground64]=await Promise.all([read(BG_PARTS),read(GROUND_PARTS)]);
  const [bg,ground]=await Promise.all([imageFrom('data:image/webp;base64,'+bg64),imageFrom('data:image/webp;base64,'+ground64)]);
  let tries=0;
  while(!window.game && tries++<200) await new Promise(r=>setTimeout(r,40));
  const g=window.game;if(!g)throw new Error(`${VERSION} game unavailable`);
  const C=(typeof CONFIG!=='undefined'&&CONFIG)?CONFIG:{};
  const W=()=>Number(C.CANVAS_WIDTH||360),H=()=>Number(C.CANVAS_HEIGHT||640),GY=()=>H()-Number(C.GROUND_HEIGHT||95);
  const oldBg=typeof g.drawWorld3Background==='function'?g.drawWorld3Background.bind(g):null;
  const oldGround=typeof g.drawWorld3Ground==='function'?g.drawWorld3Ground.bind(g):null;
  g.drawWorld3Background=function(ctx,frame=this.frame){
    if(this.activeWorld!==W3){return oldBg?.(ctx,frame);}
    const w=W(),gy=GY();
    ctx.save();
    ctx.drawImage(bg,0,0,bg.width,bg.height,0,0,w,gy);
    const stage=this.boss?.active?3:(Number(this.score||0)>=Number(C.STAGE1_END||15)?2:1);
    if(stage>=2){
      const pulse=.5+.5*Math.sin(frame*.035);
      const tint=ctx.createLinearGradient(0,0,0,gy);
      tint.addColorStop(0,`rgba(79,30,160,${.055+pulse*.025})`);
      tint.addColorStop(1,'rgba(125,35,180,.025)');
      ctx.fillStyle=tint;ctx.fillRect(0,0,w,gy);
    }
    // subtle live rain over the approved background art
    ctx.strokeStyle=stage>=2?'rgba(196,153,255,.34)':'rgba(164,139,255,.24)';ctx.lineWidth=1.15;
    for(let i=0;i<15;i++){
      const x=(i*47+frame*1.7)%(w+36)-18;
      const y=(i*73+frame*3.6)%Math.max(1,gy-18);
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+13);ctx.stroke();
    }
    if(Math.sin(frame*.071)>.995){ctx.fillStyle='rgba(214,185,255,.065)';ctx.fillRect(0,0,w,gy);}
    ctx.restore();
  };
  g.drawWorld3Ground=function(ctx,frame=this.frame){
    if(this.activeWorld!==W3){return oldGround?.(ctx,frame);}
    const w=W(),h=H(),gy=GY(),gh=h-gy,p=.5+.5*Math.sin(frame*.11);
    ctx.save();
    ctx.drawImage(ground,0,0,ground.width,ground.height,0,gy,w,gh);
    // animated energy line only; no striped legacy floor
    ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=`rgba(76,189,255,${.10+p*.08})`;ctx.fillRect(0,gy+10,w,1.4);
    ctx.fillStyle=`rgba(155,92,255,${.08+p*.07})`;ctx.fillRect(0,gy+2,w,1.2);
    ctx.restore();
  };
  g.__w3EnvironmentArtOwner=VERSION;
  window.__FF_W3_ENVIRONMENT_PNG_V1__={version:VERSION,background:'approved-webp',ground:'approved-webp',legacyStripes:false};
  console.log('[FF-LAB] w3-environment-png-v1-installed');
  return true;
})();
window.__FF_W3_ENVIRONMENT_PNG_V1_READY__=ready;
ready.catch(e=>console.error('[FF-LAB] w3 environment PNG failed',e));
})();
