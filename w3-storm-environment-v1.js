(()=>{'use strict';
function install(){
 const g=window.game;if(!g?.ctx)return false;if(g.__w3StormEnvironmentV2Installed)return true;
 const C=(typeof CONFIG!=='undefined'&&CONFIG)?CONFIG:{},W3=2;
 const W=()=>Number(C.CANVAS_WIDTH||360),H=()=>Number(C.CANVAS_HEIGHT||640),GY=()=>H()-Number(C.GROUND_HEIGHT||95);
 const isW3=x=>x?.activeWorld===W3;
 const bossFight=x=>isW3(x)&&x?.boss?.active&&x.boss.type==='thunderbird';
 function cloud(ctx,x,y,s,a,color){ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x-34*s,y+2*s,43*s,19*s,0,0,Math.PI*2);ctx.ellipse(x,y-9*s,54*s,27*s,0,0,Math.PI*2);ctx.ellipse(x+45*s,y+1*s,55*s,21*s,0,0,Math.PI*2);ctx.ellipse(x+5*s,y+12*s,77*s,18*s,0,0,Math.PI*2);ctx.fill();ctx.restore();}
 function spire(ctx,x,base,h,w,alpha,glow){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#080817';ctx.strokeStyle='rgba(80,54,130,.34)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-w*.55,base);ctx.lineTo(x-w*.42,base-h*.48);ctx.lineTo(x-w*.25,base-h*.83);ctx.lineTo(x-w*.10,base-h*.96);ctx.lineTo(x,base-h);ctx.lineTo(x+w*.10,base-h*.96);ctx.lineTo(x+w*.25,base-h*.83);ctx.lineTo(x+w*.42,base-h*.48);ctx.lineTo(x+w*.55,base);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowColor=glow;ctx.shadowBlur=8;ctx.fillStyle=glow;ctx.fillRect(x-1.3,base-h*.78,2.6,h*.54);ctx.shadowBlur=0;ctx.restore();}
 function bolt(ctx,x,y,len,seed,a){ctx.save();ctx.globalAlpha=a;ctx.strokeStyle='#e9d5ff';ctx.shadowColor='#c084fc';ctx.shadowBlur=12;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x,y);let yy=y,xx=x;for(let i=0;i<7;i++){yy+=len/7;xx+=Math.sin(seed+i*2.31)*9;ctx.lineTo(xx,yy);}ctx.stroke();ctx.restore();}
 function background(ctx,frame=0){
  const xg=g,boss=bossFight(xg),stage=isW3(xg)?(boss?3:(Number(xg.score||0)>=Number(C.STAGE1_END||15)?2:1)):0,w=W(),h=H(),gy=GY();
  ctx.save();
  const sky=ctx.createLinearGradient(0,0,0,gy);sky.addColorStop(0,boss?'#02020a':'#07051a');sky.addColorStop(.33,boss?'#0b041b':'#10092c');sky.addColorStop(.72,boss?'#190628':'#241044');sky.addColorStop(1,boss?'#23082e':'#2d1450');ctx.fillStyle=sky;ctx.fillRect(0,0,w,gy);
  const storm=ctx.createRadialGradient(w*.27,150,10,w*.27,150,175);storm.addColorStop(0,boss?'rgba(153,27,255,.34)':'rgba(139,92,246,.24)');storm.addColorStop(.45,boss?'rgba(88,28,135,.13)':'rgba(76,29,149,.10)');storm.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=storm;ctx.fillRect(0,0,w,340);
  if(boss){
   const mx=w*.82,my=91;ctx.save();ctx.shadowColor='#7e22ce';ctx.shadowBlur=18;ctx.fillStyle='#301047';ctx.beginPath();ctx.arc(mx,my,30,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#05040a';ctx.beginPath();ctx.arc(mx-5,my-3,27,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(216,180,254,.38)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mx,my,31,0,Math.PI*2);ctx.stroke();ctx.restore();
  }else{
   const mx=w*.82,my=91;ctx.save();ctx.globalAlpha=.68;ctx.fillStyle='#9b7bc9';ctx.beginPath();ctx.arc(mx,my,25,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(28,15,52,.7)';ctx.beginPath();ctx.arc(mx-8,my-5,23,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  const sh1=(frame*.055)%170,sh2=(frame*.032)%205;
  for(let i=-1;i<4;i++)cloud(ctx,i*170-sh1+48,66,1.25,boss?.72:.52,boss?'#080714':'#100b27');
  for(let i=-1;i<4;i++)cloud(ctx,i*205-sh2+72,132,1.05,boss?.50:.38,boss?'#160b25':'#21113f');
  for(let i=-1;i<5;i++)cloud(ctx,i*145+((frame*.018)%145)-34,206,.76,boss?.26:.20,boss?'#2a0d3c':'#351653');
  ctx.fillStyle=boss?'rgba(5,5,15,.68)':'rgba(9,8,25,.54)';ctx.fillRect(0,gy-150,w,150);
  const far=gy+14;spire(ctx,24,far,118,20,.35,'#6d28d9');spire(ctx,76,far,84,15,.27,'#2563eb');spire(ctx,123,far,142,24,.38,'#7c3aed');spire(ctx,171,far,91,16,.28,'#4f46e5');spire(ctx,222,far,126,20,.38,'#9333ea');spire(ctx,276,far,205,32,boss?.78:.62,boss?'#c026d3':'#2563eb');spire(ctx,326,far,155,25,.48,'#7c3aed');spire(ctx,352,far,98,16,.30,'#2563eb');
  const near=gy+8;spire(ctx,48,near,92,27,.58,boss?'#7e22ce':'#4338ca');spire(ctx,151,near,72,25,.52,'#6d28d9');spire(ctx,238,near,104,29,.62,boss?'#a21caf':'#4f46e5');spire(ctx,334,near,82,24,.50,'#6d28d9');
  const fog=ctx.createLinearGradient(0,gy-120,0,gy);fog.addColorStop(0,'rgba(76,29,149,0)');fog.addColorStop(1,boss?'rgba(76,5,110,.28)':'rgba(76,29,149,.20)');ctx.fillStyle=fog;ctx.fillRect(0,gy-120,w,120);
  const flash=Math.sin(frame*.071)+Math.sin(frame*.019+1.7);if(flash>1.78){bolt(ctx,w*.23,18,188,frame*.13,.92);ctx.fillStyle='rgba(168,85,247,.055)';ctx.fillRect(0,0,w,gy);xg.screenShake=Math.max(Number(xg.screenShake||0),boss?3.2:1.6);}else if(boss&&flash<-1.80){bolt(ctx,w*.68,0,152,frame*.17,.64);xg.screenShake=Math.max(Number(xg.screenShake||0),2.2);}
  ctx.strokeStyle=boss?'rgba(192,132,252,.42)':'rgba(167,139,250,.30)';ctx.lineWidth=1.25;for(let i=0;i<15;i++){const rx=(i*47+frame*2.1)%(w+35)-18,ry=(i*73+frame*4.2)%(gy-15);ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-5,ry+15);ctx.stroke();}
  if(boss){const vig=ctx.createRadialGradient(w*.5,gy*.46,95,w*.5,gy*.46,w*.72);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(.72,'rgba(0,0,0,.10)');vig.addColorStop(1,'rgba(0,0,0,.48)');ctx.fillStyle=vig;ctx.fillRect(0,0,w,gy);}
  ctx.restore();
 }
 function ground(ctx,frame=0){
  const w=W(),h=H(),gy=GY(),gh=h-gy;
  const boss=bossFight(g),phase2=!!(boss&&(g.boss?.enraged||g.boss?.__w3Phase2||Number(g.boss?.hp||99)<=5));
  const speed=boss?.42:Math.max(1.8,Number(C.W3_SPEED||2.78));
  const p=.5+.5*Math.sin(frame*(phase2?.19:.12));
  const surge=phase2?(.72+.28*Math.sin(frame*.26)):1;
  const tile=45,midTile=60,supportTile=72;
  const off=(frame*speed)%tile,midOff=(frame*(boss?.22:speed*.62))%midTile,deepOff=(frame*(boss?.11:speed*.28))%supportTile;
  ctx.save();
  const base=ctx.createLinearGradient(0,gy,0,h);base.addColorStop(0,phase2?'#1d0d31':'#171226');base.addColorStop(.42,'#0d0d19');base.addColorStop(1,'#05060b');ctx.fillStyle=base;ctx.fillRect(0,gy,w,gh);

  ctx.save();ctx.shadowColor=phase2?'#d946ef':'#8b5cf6';ctx.shadowBlur=(phase2?14:8)+p*6;ctx.fillStyle=phase2?`rgba(217,70,239,${.74+p*.2})`:'#7750cf';ctx.fillRect(0,gy,w,3);ctx.restore();
  ctx.fillStyle='#30264a';ctx.fillRect(0,gy+3,w,17);

  let plateIndex=0;
  for(let x=-tile-off;x<w+tile;x+=tile,plateIndex++){
    ctx.fillStyle=(plateIndex&1)?'#28213d':'#33284a';ctx.fillRect(x+1,gy+4,tile-3,15);
    ctx.strokeStyle=phase2?'rgba(216,180,254,.58)':'rgba(148,119,194,.46)';ctx.lineWidth=1;ctx.strokeRect(x+1.5,gy+4.5,tile-4,14);
    ctx.fillStyle=`rgba(196,181,253,${.11+p*.08})`;ctx.fillRect(x+5,gy+6,tile-11,2);
  }

  ctx.fillStyle='#111321';ctx.fillRect(0,gy+20,w,gh-20);
  ctx.strokeStyle='rgba(72,64,105,.46)';ctx.lineWidth=1.2;

  let blockIndex=0;
  for(let x=-midTile-midOff;x<w+midTile;x+=midTile,blockIndex++){
    ctx.fillStyle=(blockIndex&1)?'#121423':'#0e101c';ctx.fillRect(x+1,gy+22,57,34);ctx.strokeRect(x+1.5,gy+22.5,56,33);
    ctx.beginPath();ctx.moveTo(x+8,gy+57);ctx.lineTo(x+16,gy+69);ctx.lineTo(x+44,gy+69);ctx.lineTo(x+52,gy+57);ctx.stroke();
    const cyan=(blockIndex&1)===1;
    ctx.save();ctx.shadowColor=phase2?(cyan?'#67e8f9':'#e879f9'):(cyan?'#38bdf8':'#a855f7');ctx.shadowBlur=(phase2?12:8)+p*5;
    ctx.fillStyle=ctx.shadowColor;ctx.globalAlpha=phase2?.78*surge:.72;ctx.fillRect(x+18,gy+35,22,2.5);ctx.restore();
  }

  ctx.fillStyle='#080a12';
  for(let x=-supportTile-deepOff;x<w+supportTile;x+=supportTile){
    ctx.beginPath();ctx.moveTo(x,gy+57);ctx.lineTo(x+10,h);ctx.lineTo(x+28,h);ctx.lineTo(x+38,gy+57);ctx.closePath();ctx.fill();
  }

  ctx.save();ctx.lineWidth=1.6;
  for(let x=-90+((frame*(boss?.16:.44))%90);x<w+90;x+=90){
    const fp=.42+.36*Math.sin(frame*.18+x*.025);
    ctx.shadowBlur=phase2?9:4;ctx.shadowColor='#38bdf8';ctx.strokeStyle=`rgba(56,189,248,${Math.max(.18,fp)})`;
    ctx.beginPath();ctx.moveTo(x+25,h);ctx.lineTo(x+28,gy+78);ctx.lineTo(x+23,gy+69);ctx.lineTo(x+30,gy+58);ctx.stroke();
    ctx.shadowColor='#a855f7';ctx.strokeStyle=`rgba(168,85,247,${Math.max(.15,fp*.82)})`;
    ctx.beginPath();ctx.moveTo(x+68,h);ctx.lineTo(x+64,gy+82);ctx.lineTo(x+70,gy+72);ctx.lineTo(x+65,gy+58);ctx.stroke();
  }
  ctx.restore();

  const packetSpeed=phase2?4.4:3.0;
  for(let i=0;i<6;i++){
    const sx=w-((frame*packetSpeed+i*71)%(w+90))+25;
    const sy=gy+11+(i%2)*25;
    const a=.38+.28*Math.sin(frame*.23+i*1.7);
    ctx.save();ctx.globalAlpha=Math.max(.18,a);ctx.shadowBlur=phase2?13:8;ctx.shadowColor=(i&1)?'#c084fc':'#67e8f9';ctx.fillStyle=ctx.shadowColor;
    ctx.fillRect(sx,sy,phase2?8:6,2.2);ctx.restore();
  }

  const wave=w-((frame*(phase2?5.1:2.45))%(w+150))+50;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowColor=phase2?'#d946ef':'#38bdf8';ctx.shadowBlur=phase2?18:11;
  const wg=ctx.createLinearGradient(wave-42,0,wave+42,0);wg.addColorStop(0,'rgba(0,0,0,0)');wg.addColorStop(.5,phase2?'rgba(232,121,249,.42)':'rgba(103,232,249,.26)');wg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=wg;ctx.fillRect(wave-42,gy+1,84,phase2?20:15);ctx.restore();

  if(phase2&&Math.sin(frame*.31)>.93){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(192,132,252,.10)';ctx.fillRect(0,gy,w,gh);ctx.restore();}
  ctx.restore();
 }

 function drawTotemSparks(ctx,frame=0){
  if(!Array.isArray(g.miniTeslas)||!g.miniTeslas.length)return;
  const phase2=!!(bossFight(g)&&(g.boss?.enraged||Number(g.boss?.hp||99)<=5));
  for(let ti=0;ti<g.miniTeslas.length;ti++){
    const t=g.miniTeslas[ti];if(!t||Number(t.x)<-45||Number(t.x)>W()+45)continue;
    const x=Number(t.x||0),y=Number(t.y||0);
    for(let i=0;i<(phase2?3:2);i++){
      const a=frame*.16+ti*1.7+i*2.25;
      const r=15+((frame*.7+i*11+ti*5)%12);
      const sx=x+Math.cos(a)*r,sy=y-30+Math.sin(a*1.31)*9;
      ctx.save();ctx.globalAlpha=.32+.22*Math.sin(a*1.8);ctx.shadowColor=(i&1)?'#d8b4fe':'#67e8f9';ctx.shadowBlur=6;ctx.fillStyle=ctx.shadowColor;
      ctx.beginPath();ctx.arc(sx,sy,phase2?1.8:1.35,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }
 }
 const oldDraw=typeof g.draw==='function'?g.draw.bind(g):null;if(!oldDraw)return false;
 g.draw=function(){
  if(!isW3(this))return oldDraw();
  const keys=['drawBackground','drawWorld3Background','drawStormBackground','drawW3Background','drawGround','drawWorld3Ground','drawStormGround','drawW3Ground'];const saved={};for(const k of keys)saved[k]=this[k];
  this.drawBackground=(c)=>background(c,this.frame);this.drawWorld3Background=this.drawBackground;this.drawStormBackground=this.drawBackground;this.drawW3Background=this.drawBackground;
  this.drawGround=(c)=>ground(c,this.frame);this.drawWorld3Ground=this.drawGround;this.drawStormGround=this.drawGround;this.drawW3Ground=this.drawGround;
  let r;try{r=oldDraw();}finally{for(const k of keys)this[k]=saved[k];}
  if(this.activeWorld===W3&&this.ctx&&this.state==='PLAYING'){ground(this.ctx,this.frame);drawTotemSparks(this.ctx,this.frame);}
  return r;
 };
 g.__w3StormEnvironmentV2Installed=true;g.__w3StormEnvironmentV1Installed=true;window.__FF_W3_STORM_ENV_V2__={version:'2.1',finalOwner:true,forcedGround:true,bossScaryMode:true,movingGround:true,groundParallax:true,phase2GroundSurge:true,totemSparks:true,lightningShake:true};console.log('[FF-LAB] w3-storm-environment-v2.1-installed');return true;
}
let n=0;const t=setInterval(()=>{if(install()||++n>240)clearInterval(t);},60);setTimeout(install,900);
})();