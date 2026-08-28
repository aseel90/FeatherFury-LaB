(()=>{'use strict';
const VERSION='w3-environment-art-v3';
const W3=2;
const ready=(async()=>{
  let tries=0;while(!window.game&&tries++<200)await new Promise(r=>setTimeout(r,40));
  const g=window.game;if(!g)throw new Error(`${VERSION} game unavailable`);
  const C=(typeof CONFIG!=='undefined'&&CONFIG)?CONFIG:{};
  const W=()=>Number(C.CANVAS_WIDTH||360),H=()=>Number(C.CANVAS_HEIGHT||640),GY=()=>H()-Number(C.GROUND_HEIGHT||95);
  const isW3=x=>x?.activeWorld===W3;
  const bossFight=x=>isW3(x)&&x?.boss?.active&&x.boss.type==='thunderbird';
  const phase2=x=>bossFight(x)&&!!(x.boss.enraged||x.boss.__w3Phase2||x.boss.__w3V6Phase2Started);

  function cloud(ctx,x,y,s,a,color){ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x-34*s,y+2*s,43*s,19*s,0,0,Math.PI*2);ctx.ellipse(x,y-9*s,54*s,27*s,0,0,Math.PI*2);ctx.ellipse(x+45*s,y+1*s,55*s,21*s,0,0,Math.PI*2);ctx.ellipse(x+5*s,y+12*s,77*s,18*s,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  function spire(ctx,x,base,h,w,alpha,glow){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#080817';ctx.strokeStyle='rgba(80,54,130,.34)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-w*.55,base);ctx.lineTo(x-w*.42,base-h*.48);ctx.lineTo(x-w*.25,base-h*.73);ctx.lineTo(x-w*.13,base-h*.91);ctx.lineTo(x,base-h);ctx.lineTo(x+w*.13,base-h*.91);ctx.lineTo(x+w*.25,base-h*.73);ctx.lineTo(x+w*.42,base-h*.48);ctx.lineTo(x+w*.55,base);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowColor=glow;ctx.shadowBlur=8;ctx.fillStyle=glow;ctx.fillRect(x-1.3,base-h*.82,2.6,h*.55);ctx.restore();}
  function bolt(ctx,x,y,len,seed,alpha){ctx.save();ctx.strokeStyle=`rgba(216,180,254,${alpha})`;ctx.shadowColor='#c084fc';ctx.shadowBlur=11;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x,y);for(let i=1;i<=7;i++){const yy=y+len*i/7;const xx=x+Math.sin(seed+i*2.31)*10+(i%2?5:-4);ctx.lineTo(xx,yy);}ctx.stroke();ctx.restore();}

  function background(ctx,frame=0){
    if(!isW3(g))return;
    const boss=bossFight(g),p2=phase2(g),w=W(),h=H(),gy=GY();
    ctx.save();
    const sky=ctx.createLinearGradient(0,0,0,gy);sky.addColorStop(0,boss?'#020208':'#07051a');sky.addColorStop(.33,boss?'#090318':'#10092c');sky.addColorStop(.72,boss?(p2?'#23052f':'#170624'):'#241044');sky.addColorStop(1,boss?(p2?'#32053e':'#24082f'):'#2d1450');ctx.fillStyle=sky;ctx.fillRect(0,0,w,gy);
    const storm=ctx.createRadialGradient(w*.27,150,10,w*.27,150,175);storm.addColorStop(0,boss?(p2?'rgba(217,70,239,.42)':'rgba(153,27,255,.34)'):'rgba(139,92,246,.24)');storm.addColorStop(.45,boss?'rgba(88,28,135,.15)':'rgba(76,29,149,.10)');storm.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=storm;ctx.fillRect(0,0,w,340);
    if(boss){const mx=w*.82,my=91;ctx.save();ctx.shadowColor=p2?'#d946ef':'#7e22ce';ctx.shadowBlur=p2?25:18;ctx.fillStyle=p2?'#4a0c55':'#301047';ctx.beginPath();ctx.arc(mx,my,30,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#030307';ctx.beginPath();ctx.arc(mx-5,my-3,27,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(216,180,254,${p2?.58:.38})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mx,my,31,0,Math.PI*2);ctx.stroke();ctx.restore();}
    else{const mx=w*.82,my=91;ctx.save();ctx.globalAlpha=.68;ctx.fillStyle='#9b7bc9';ctx.beginPath();ctx.arc(mx,my,25,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(28,15,52,.7)';ctx.beginPath();ctx.arc(mx-8,my-5,23,0,Math.PI*2);ctx.fill();ctx.restore();}
    const sh1=(frame*(boss?.075:.055))%170,sh2=(frame*(boss?.045:.032))%205;
    for(let i=-1;i<4;i++)cloud(ctx,i*170-sh1+48,66,1.25,boss?.74:.52,boss?'#070611':'#100b27');
    for(let i=-1;i<4;i++)cloud(ctx,i*205-sh2+72,132,1.05,boss?.53:.38,boss?(p2?'#210829':'#160b25'):'#21113f');
    for(let i=-1;i<5;i++)cloud(ctx,i*145+((frame*.018)%145)-34,206,.76,boss?.29:.20,boss?'#2a0d3c':'#351653');
    ctx.fillStyle=boss?'rgba(4,4,13,.70)':'rgba(9,8,25,.54)';ctx.fillRect(0,gy-150,w,150);
    const far=gy+14;spire(ctx,24,far,118,20,.35,'#6d28d9');spire(ctx,76,far,84,15,.27,'#2563eb');spire(ctx,123,far,142,24,.38,'#7c3aed');spire(ctx,171,far,91,16,.28,'#4f46e5');spire(ctx,222,far,126,20,.38,'#9333ea');spire(ctx,276,far,boss?224:205,boss?35:32,boss?.82:.62,boss?(p2?'#e879f9':'#c026d3'):'#2563eb');spire(ctx,326,far,155,25,.48,'#7c3aed');spire(ctx,352,far,98,16,.30,'#2563eb');
    const near=gy+8;spire(ctx,48,near,92,27,.58,boss?'#7e22ce':'#4338ca');spire(ctx,151,near,72,25,.52,'#6d28d9');spire(ctx,238,near,104,29,.62,boss?(p2?'#d946ef':'#a21caf'):'#4f46e5');spire(ctx,334,near,82,24,.50,'#6d28d9');
    const fog=ctx.createLinearGradient(0,gy-120,0,gy);fog.addColorStop(0,'rgba(76,29,149,0)');fog.addColorStop(1,boss?(p2?'rgba(126,5,150,.36)':'rgba(76,5,110,.28)'):'rgba(76,29,149,.20)');ctx.fillStyle=fog;ctx.fillRect(0,gy-120,w,120);
    const flash=Math.sin(frame*.071)+Math.sin(frame*.019+1.7);if(flash>1.78){bolt(ctx,w*.23,18,188,frame*.13,p2?1:.92);ctx.fillStyle=p2?'rgba(232,121,249,.08)':'rgba(168,85,247,.055)';ctx.fillRect(0,0,w,gy);}else if(boss&&flash<-1.80){bolt(ctx,w*.68,0,152,frame*.17,p2?.88:.64);}
    ctx.strokeStyle=boss?(p2?'rgba(232,121,249,.56)':'rgba(192,132,252,.42)'):'rgba(167,139,250,.30)';ctx.lineWidth=1.25;for(let i=0;i<15;i++){const rx=(i*47+frame*(boss?2.6:2.1))%(w+35)-18,ry=(i*73+frame*(boss?4.8:4.2))%(gy-15);ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-5,ry+15);ctx.stroke();}
    if(boss){const vig=ctx.createRadialGradient(w*.5,gy*.46,90,w*.5,gy*.46,w*.72);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(.70,p2?'rgba(25,0,30,.08)':'rgba(0,0,0,.10)');vig.addColorStop(1,p2?'rgba(5,0,10,.58)':'rgba(0,0,0,.48)');ctx.fillStyle=vig;ctx.fillRect(0,0,w,gy);}
    ctx.restore();
  }

  function ground(ctx,frame=0){
    if(!isW3(g))return;
    const w=W(),h=H(),gy=GY(),gh=h-gy,boss=bossFight(g),p2=phase2(g);
    const speed=Math.max(1.8,Number(C.W3_SPEED||2.78));
    const structuralSpeed=boss?.28:speed*.92;
    const topOff=(frame*structuralSpeed)%45;
    const midOff=(frame*structuralSpeed*.58)%60;
    const deepOff=(frame*structuralSpeed*.30)%72;
    const energySpeed=(p2?3.6:(boss?2.25:2.8));
    const energyOff=(frame*energySpeed)%90;
    const p=.5+.5*Math.sin(frame*(p2?.20:.12));
    const lightning=Math.max(0,Math.min(1,Number(g.lightning||0)));
    const jitter=lightning>0.12?Math.sin(frame*2.45)*lightning*1.25:0;
    ctx.save();ctx.translate(jitter,0);
    const base=ctx.createLinearGradient(0,gy,0,h);base.addColorStop(0,p2?'#21102d':'#171226');base.addColorStop(.42,'#0d0d19');base.addColorStop(1,'#05060b');ctx.fillStyle=base;ctx.fillRect(-3,gy,w+6,gh);
    ctx.shadowColor=p2?'#d946ef':'#8b5cf6';ctx.shadowBlur=8+(p2?8*p:0);ctx.fillStyle=p2?'#a83fca':'#7750cf';ctx.fillRect(-3,gy,w+6,3);ctx.shadowBlur=0;ctx.fillStyle=p2?'#3c2049':'#30264a';ctx.fillRect(-3,gy+3,w+6,17);
    const tile=45;for(let x=-tile-topOff;x<w+tile;x+=tile){const n=Math.floor((x+topOff)/tile);ctx.fillStyle=n%2?'#28213d':'#33284a';ctx.fillRect(x+1,gy+4,tile-3,15);ctx.strokeStyle=p2?'rgba(232,121,249,.54)':'rgba(148,119,194,.46)';ctx.lineWidth=1;ctx.strokeRect(x+1.5,gy+4.5,tile-4,14);ctx.fillStyle=p2?'rgba(232,121,249,.18)':'rgba(196,181,253,.16)';ctx.fillRect(x+5,gy+6,tile-11,2);}
    ctx.fillStyle='#111321';ctx.fillRect(-3,gy+20,w+6,gh-20);ctx.strokeStyle='rgba(72,64,105,.46)';ctx.lineWidth=1.2;
    for(let x=-60-midOff;x<w+60;x+=60){const n=Math.floor((x+midOff)/60);ctx.fillStyle=n%2?'#121423':'#0e101c';ctx.fillRect(x+1,gy+22,57,34);ctx.strokeRect(x+1.5,gy+22.5,56,33);ctx.beginPath();ctx.moveTo(x+8,gy+57);ctx.lineTo(x+16,gy+69);ctx.lineTo(x+44,gy+69);ctx.lineTo(x+52,gy+57);ctx.stroke();ctx.save();const cyan=n%2===0;ctx.shadowColor=cyan?'#38bdf8':(p2?'#e879f9':'#a855f7');ctx.shadowBlur=8+p*(p2?9:4);ctx.fillStyle=cyan?'#38bdf8':(p2?'#e879f9':'#a855f7');ctx.globalAlpha=.62+.38*p;ctx.fillRect(x+18,gy+35,22,2.5);ctx.restore();}
    ctx.fillStyle='#080a12';for(let x=-72-deepOff;x<w+72;x+=72){ctx.beginPath();ctx.moveTo(x,gy+57);ctx.lineTo(x+10,h);ctx.lineTo(x+28,h);ctx.lineTo(x+38,gy+57);ctx.closePath();ctx.fill();}
    ctx.save();ctx.lineWidth=p2?2.1:1.6;for(let x=-90-energyOff;x<w+90;x+=90){ctx.shadowColor='#38bdf8';ctx.shadowBlur=5+p*7;ctx.strokeStyle=`rgba(56,189,248,${.25+.28*p})`;ctx.beginPath();ctx.moveTo(x+25,h);ctx.lineTo(x+28,gy+78);ctx.lineTo(x+23,gy+69);ctx.lineTo(x+30,gy+58);ctx.stroke();ctx.shadowColor=p2?'#e879f9':'#a855f7';ctx.strokeStyle=`rgba(${p2?'232,121,249':'168,85,247'},${.22+(p2?.36:.22)*p})`;ctx.beginPath();ctx.moveTo(x+68,h);ctx.lineTo(x+64,gy+82);ctx.lineTo(x+70,gy+72);ctx.lineTo(x+65,gy+58);ctx.stroke();}
    ctx.restore();
    for(let i=0;i<(p2?8:5);i++){const sx=w-((frame*(p2?3.7:2.35)+i*71)%(w+28));const sy=gy+9+(i%3)*12;const a=.28+.38*(.5+.5*Math.sin(frame*.19+i));ctx.save();ctx.globalAlpha=a;ctx.shadowColor=i%2?'#38bdf8':(p2?'#f0abfc':'#c084fc');ctx.shadowBlur=6+(p2?5:2);ctx.fillStyle=ctx.shadowColor;ctx.fillRect(sx,sy,3+(i%2),2);ctx.restore();}
    if(lightning>.08){ctx.save();ctx.globalAlpha=lightning*(p2?.25:.15);ctx.fillStyle=p2?'#f0abfc':'#bae6fd';ctx.fillRect(-3,gy,w+6,gh);ctx.restore();}
    ctx.restore();
  }

  g.drawWorld3Background=background;
  g.drawWorld3Ground=ground;
  g.__w3EnvironmentArtOwner=VERSION;g.__w3StormEnvironmentV2Installed=true;
  window.__FF_W3_ENVIRONMENT_PNG_V1__={version:VERSION,procedural:true,animatedGround:true,parallaxGround:true,bossReactive:true,phase2Reactive:true,legacyStripes:false,legacyBackground:false,finalOwner:true,drawWrapper:false};
  console.log('[FF-LAB] w3-environment-art-v3-installed');return true;
})();
window.__FF_W3_ENVIRONMENT_PNG_V1_READY__=ready;ready.catch(e=>console.error('[FF-LAB] w3 environment art failed',e));
})();