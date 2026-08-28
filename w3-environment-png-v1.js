(()=>{'use strict';
const VERSION='w3-environment-art-v2';
const W3=2;
const ready=(async()=>{
  let tries=0;while(!window.game&&tries++<200)await new Promise(r=>setTimeout(r,40));
  const g=window.game;if(!g)throw new Error(`${VERSION} game unavailable`);
  const C=(typeof CONFIG!=='undefined'&&CONFIG)?CONFIG:{};
  const W=()=>Number(C.CANVAS_WIDTH||360),H=()=>Number(C.CANVAS_HEIGHT||640),GY=()=>H()-Number(C.GROUND_HEIGHT||95);
  const oldBg=typeof g.drawWorld3Background==='function'?g.drawWorld3Background.bind(g):null;
  const oldGround=typeof g.drawWorld3Ground==='function'?g.drawWorld3Ground.bind(g):null;
  const stageOf=x=>x.boss?.active?3:(Number(x.score||0)>=Number(C.STAGE1_END||15)?2:1);
  function tower(ctx,x,base,h,w,cyan,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#100c25';ctx.beginPath();ctx.moveTo(x-w*.52,base);ctx.lineTo(x-w*.33,base-h*.73);ctx.lineTo(x-w*.15,base-h*.92);ctx.lineTo(x,base-h);ctx.lineTo(x+w*.15,base-h*.92);ctx.lineTo(x+w*.33,base-h*.73);ctx.lineTo(x+w*.52,base);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(88,65,140,.35)';ctx.lineWidth=1;ctx.stroke();ctx.shadowColor=cyan;ctx.shadowBlur=8;ctx.fillStyle=cyan;ctx.fillRect(x-1.2,base-h*.83,2.4,h*.58);if(w>26){ctx.globalAlpha=alpha*.65;ctx.fillRect(x-w*.17,base-h*.54,2.2,h*.18);ctx.fillRect(x+w*.14,base-h*.66,2.2,h*.14);}ctx.restore();}
  function cloudBand(ctx,frame,y,a,color,speed,scale){const w=W(),shift=(frame*speed)%(190*scale);ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;for(let i=-2;i<5;i++){const x=i*120*scale-shift;ctx.beginPath();ctx.ellipse(x+30*scale,y,36*scale,18*scale,0,0,Math.PI*2);ctx.ellipse(x+68*scale,y-8*scale,42*scale,22*scale,0,0,Math.PI*2);ctx.ellipse(x+112*scale,y,52*scale,20*scale,0,0,Math.PI*2);ctx.ellipse(x+82*scale,y+10*scale,60*scale,16*scale,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
  g.drawWorld3Background=function(ctx,frame=this.frame){if(this.activeWorld!==W3)return oldBg?.(ctx,frame);const w=W(),h=H(),gy=GY(),stage=stageOf(this),charged=stage>=2;ctx.save();const gr=ctx.createLinearGradient(0,0,0,h);gr.addColorStop(0,charged?'#070519':'#090821');gr.addColorStop(.36,charged?'#17103d':'#18143d');gr.addColorStop(.72,charged?'#28134d':'#241643');gr.addColorStop(1,'#130d27');ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);
    const glow=ctx.createRadialGradient(w*.25,165,10,w*.25,165,165);glow.addColorStop(0,charged?'rgba(185,118,255,.31)':'rgba(148,105,255,.23)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,gy*.62);
    cloudBand(ctx,frame,68,.46,'#100b29',.20,1.28);cloudBand(ctx,frame,122,.32,charged?'#241247':'#201c46',.13,1.08);cloudBand(ctx,frame,180,.22,charged?'#34145f':'#2a2153',.08,.95);
    const cyan=charged?'#43bdf8':'#379ff4',violet='#8b5cf6';tower(ctx,34,gy-8,152,27,cyan,.88);tower(ctx,98,gy+7,110,20,violet,.48);tower(ctx,143,gy-13,174,25,cyan,.70);tower(ctx,205,gy+12,96,19,violet,.42);tower(ctx,250,gy-23,132,23,violet,.59);tower(ctx,296,gy-22,248,40,cyan,.96);tower(ctx,342,gy-7,181,28,violet,.73);
    ctx.save();ctx.globalAlpha=.17;ctx.fillStyle='#7c3aed';for(let i=0;i<5;i++){const x=20+i*82+Math.sin(frame*.02+i)*5;ctx.beginPath();ctx.ellipse(x,gy-34-(i%2)*8,47,14,0,0,Math.PI*2);ctx.fill();}ctx.restore();
    ctx.strokeStyle=charged?'rgba(202,158,255,.42)':'rgba(170,142,255,.31)';ctx.lineWidth=1.2;for(let i=0;i<18;i++){const x=(i*37+frame*2.0)%(w+40)-20,y=(i*53+frame*4.35)%Math.max(1,gy-24);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+15);ctx.stroke();}
    if(Math.sin(frame*.067)>.993){ctx.save();ctx.strokeStyle='rgba(225,202,255,.92)';ctx.shadowColor='#d9b3ff';ctx.shadowBlur=12;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(w*.25,118);ctx.lineTo(w*.22,143);ctx.lineTo(w*.26,163);ctx.lineTo(w*.23,186);ctx.lineTo(w*.28,218);ctx.stroke();ctx.fillStyle='rgba(211,178,255,.055)';ctx.fillRect(0,0,w,gy);ctx.restore();}
    ctx.restore();};
  g.drawWorld3Ground=function(ctx,frame=this.frame){if(this.activeWorld!==W3)return oldGround?.(ctx,frame);const w=W(),h=H(),gy=GY(),gh=h-gy,p=.5+.5*Math.sin(frame*.11);ctx.save();const gr=ctx.createLinearGradient(0,gy,0,h);gr.addColorStop(0,'#121326');gr.addColorStop(.45,'#0b0e1c');gr.addColorStop(1,'#06070e');ctx.fillStyle=gr;ctx.fillRect(0,gy,w,gh);
    ctx.fillStyle='#2b2349';ctx.fillRect(0,gy,w,22);ctx.fillStyle='#7050d7';ctx.fillRect(0,gy,w,3);
    for(let x=0;x<w;x+=38){ctx.fillStyle='#39305d';ctx.fillRect(x+1,gy+2,34,18);ctx.strokeStyle='#7768aa';ctx.lineWidth=1;ctx.strokeRect(x+1,gy+2,34,18);ctx.fillStyle='rgba(126,92,255,.15)';ctx.fillRect(x+3,gy+4,30,4);}for(let x=12;x<w;x+=64){ctx.save();ctx.shadowColor='#38bdf8';ctx.shadowBlur=9+p*5;ctx.fillStyle='#38bdf8';ctx.fillRect(x,gy+12,18,3);ctx.restore();}
    for(let x=0;x<w;x+=52){ctx.fillStyle='#15172a';ctx.fillRect(x,gy+22,50,36);ctx.strokeStyle='#252a47';ctx.strokeRect(x,gy+22,50,36);ctx.save();ctx.shadowColor=(x/52)%2===0?'#8b5cf6':'#38bdf8';ctx.shadowBlur=8;ctx.fillStyle=(x/52)%2===0?'#8b5cf6':'#38bdf8';if((x/52)%2===0){ctx.beginPath();ctx.arc(x+25,gy+40,4.5,0,Math.PI*2);ctx.fill();}else ctx.fillRect(x+16,gy+38,18,3);ctx.restore();}
    ctx.fillStyle='#0d0f1d';for(let x=8;x<w;x+=54){ctx.beginPath();ctx.moveTo(x,h);ctx.lineTo(x+8,gy+58);ctx.lineTo(x+26,gy+58);ctx.lineTo(x+34,h);ctx.closePath();ctx.fill();}
    ctx.strokeStyle='rgba(56,189,248,.34)';ctx.lineWidth=1.6;for(let x=22;x<w;x+=66){ctx.beginPath();ctx.moveTo(x,h);ctx.lineTo(x+5,gy+92);ctx.lineTo(x+2,gy+78);ctx.lineTo(x+8,gy+66);ctx.stroke();}
    ctx.restore();};
  g.__w3EnvironmentArtOwner=VERSION;window.__FF_W3_ENVIRONMENT_PNG_V1__={version:VERSION,procedural:true,legacyStripes:false};console.log('[FF-LAB] w3-environment-art-v2-installed');return true;
})();
window.__FF_W3_ENVIRONMENT_PNG_V1_READY__=ready;ready.catch(e=>console.error('[FF-LAB] w3 environment art failed',e));
})();
