(()=>{'use strict';
  if(window.__FF_SPLASH_V1__) return;
  const started=performance.now();
  const doc=document.documentElement;
  doc.classList.add('ff-splash-active');

  const splash=document.createElement('div');
  splash.id='ffBootSplash';
  splash.setAttribute('role','status');
  splash.setAttribute('aria-live','polite');
  splash.innerHTML=`
    <div class="ff-splash__grain"></div>
    <div class="ff-splash__realm ff-splash__realm--forest"></div>
    <div class="ff-splash__realm ff-splash__realm--ice"></div>
    <div class="ff-splash__realm ff-splash__realm--storm"></div>
    <div class="ff-splash__spire" aria-hidden="true"></div>
    <svg class="ff-splash__owl" viewBox="0 0 400 265" aria-hidden="true">
      <defs><radialGradient id="ffOwlGlow"><stop offset="0" stop-color="#a45cff" stop-opacity=".9"/><stop offset="1" stop-color="#5122a8" stop-opacity="0"/></radialGradient></defs>
      <path d="M47 98 82 24l62 45c17-10 35-15 56-15s39 5 56 15l62-45 35 74-27 13c9 22 11 45 6 69-7 35-29 62-63 80l-29-36-40 23-40-23-29 36c-34-18-56-45-63-80-5-24-3-47 6-69z" fill="#030711" opacity=".92"/>
      <path d="M73 105c30-34 73-47 127-39 54-8 97 5 127 39-14 57-55 95-127 114-72-19-113-57-127-114z" fill="#091226" opacity=".82"/>
      <ellipse cx="135" cy="133" rx="61" ry="44" fill="url(#ffOwlGlow)" opacity=".34"/><ellipse cx="265" cy="133" rx="61" ry="44" fill="url(#ffOwlGlow)" opacity=".34"/>
      <path class="eye" d="M91 124c25-17 54-20 87-8-9 28-30 42-62 41-15-7-23-18-25-33z" fill="#9f63ff"/><path class="eye" d="M309 124c-25-17-54-20-87-8 9 28 30 42 62 41 15-7 23-18 25-33z" fill="#9f63ff"/>
      <path d="M184 145 200 178l16-33-16-14z" fill="#060914" stroke="#3c2a68" stroke-width="4"/>
    </svg>
    <div class="ff-splash__logo" aria-label="Feather Fury">
      <div class="ff-splash__logo-mark"></div>
      <span class="ff-splash__logo-line ff-splash__logo-feather">FEATHER</span>
      <span class="ff-splash__logo-line ff-splash__logo-fury">FURY</span>
    </div>
    <div class="ff-splash__ledge" aria-hidden="true"></div>
    <div class="ff-splash__characters"><canvas id="ffSplashCharacters"></canvas></div>
    <div class="ff-splash__loader">
      <div class="ff-splash__status">Preparing the Skies...</div>
      <div class="ff-splash__track"><div class="ff-splash__fill"></div><i class="ff-splash__feather"></i></div>
      <div class="ff-splash__percent">8%</div>
    </div>`;
  (document.body||document.documentElement).appendChild(splash);

  const canvas=splash.querySelector('#ffSplashCharacters');
  const ctx=canvas.getContext('2d');
  let raf=0,lastW=0,lastH=0;
  const outline='#05070d';
  const poly=(c,p)=>{c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath();};
  const body=(c,fill,belly,rx=22,ry=18)=>{c.fillStyle=fill;c.strokeStyle=outline;c.lineWidth=3;c.beginPath();c.ellipse(0,2,rx,ry,-.03,0,Math.PI*2);c.fill();c.stroke();c.fillStyle=belly;c.beginPath();c.ellipse(5,8,rx*.58,ry*.48,.08,0,Math.PI*2);c.fill();};
  const angryEye=(c,x,y,flip=1)=>{c.save();c.translate(x,y);c.scale(flip,1);c.fillStyle='#fff';c.strokeStyle=outline;c.lineWidth=2.3;c.beginPath();c.moveTo(-5,-4);c.quadraticCurveTo(3,-7,8,-1);c.quadraticCurveTo(4,6,-4,3);c.closePath();c.fill();c.stroke();c.fillStyle='#111827';c.beginPath();c.arc(2,0,2.1,0,Math.PI*2);c.fill();c.strokeStyle=outline;c.lineWidth=2.8;c.beginPath();c.moveTo(-6,-6);c.lineTo(7,-2);c.stroke();c.restore();};
  const beak=(c,x,y,color='#fbbf24')=>{c.fillStyle=color;c.strokeStyle=outline;c.lineWidth=2.2;poly(c,[[x,y-3],[x+11,y],[x,y+4]]);c.fill();c.stroke();};
  const band=(c,color='#11194d')=>{c.fillStyle=color;c.strokeStyle=outline;c.lineWidth=2.3;c.beginPath();c.moveTo(-19,-10);c.quadraticCurveTo(2,-14,20,-9);c.lineTo(20,-3);c.quadraticCurveTo(1,-7,-19,-4);c.closePath();c.fill();c.stroke();c.fillStyle=color;poly(c,[[-18,-7],[-30,-11],[-27,-4],[-19,-1]]);c.fill();c.stroke();};

  function drawKing(c,t){c.save();c.rotate(-.04);c.fillStyle='#d89c0b';c.strokeStyle=outline;c.lineWidth=2.8;poly(c,[[-18,7],[-34,7],[-28,13],[-37,18],[-18,17],[-10,10]]);c.fill();c.stroke();body(c,'#f5ba17','#ffe39a',26,20);c.fillStyle='#efb315';poly(c,[[-15,-14],[-12,-23],[-5,-20],[-1,-28],[5,-21],[11,-26],[12,-16],[20,-18],[15,-10]]);c.fill();c.stroke();band(c,'#11194d');c.fillStyle='#fbbf24';poly(c,[[-1,-17],[1,-31],[7,-23],[14,-32],[17,-21],[25,-27],[22,-14]]);c.fill();c.stroke();c.fillStyle='#fff3a6';for(const p of [[1,-31],[14,-32],[25,-27]]){c.beginPath();c.arc(p[0],p[1],1.6,0,Math.PI*2);c.fill();c.stroke();}angryEye(c,9,-7,1);beak(c,21,-3,'#f7b518');c.save();c.globalAlpha=.28+.12*Math.sin(t*.004);c.strokeStyle='#ffc533';c.lineWidth=2;c.beginPath();c.arc(1,2,34,-.4,2.2);c.stroke();c.restore();c.restore();}
  function drawEagle(c,t){c.save();c.rotate(.055);c.fillStyle='#40281d';c.strokeStyle=outline;c.lineWidth=2.8;poly(c,[[-16,7],[-34,4],[-29,11],[-37,16],[-20,18],[-10,10]]);c.fill();c.stroke();body(c,'#65402b','#ead8b6',25,20);c.fillStyle='#755039';poly(c,[[-15,-14],[-20,-25],[-12,-21],[-8,-31],[-1,-22],[6,-29],[9,-19],[18,-23],[14,-12]]);c.fill();c.stroke();c.fillStyle='#ede4d4';poly(c,[[-13,-15],[-16,-23],[-8,-20],[-5,-27],[1,-20],[7,-25],[9,-16],[15,-19],[13,-10]]);c.fill();c.stroke();band(c,'#343d28');angryEye(c,9,-7,1);beak(c,20,-3,'#f2b31d');c.save();c.globalAlpha=.3+.12*Math.sin(t*.004+1.4);c.strokeStyle='#75e8ff';c.lineWidth=2;c.beginPath();c.moveTo(-34,19);c.quadraticCurveTo(-50,9,-54,-4);c.stroke();c.restore();c.restore();}
  function drawPhoenix(c,t){c.save();c.rotate(-.055);c.fillStyle='#db2b16';c.strokeStyle=outline;c.lineWidth=2.8;poly(c,[[-18,6],[-34,-1],[-29,8],[-39,12],[-27,16],[-34,23],[-17,18],[-9,10]]);c.fill();c.stroke();c.fillStyle='#ff9d20';poly(c,[[-18,9],[-32,7],[-27,12],[-34,16],[-19,16],[-10,10]]);c.fill();c.stroke();body(c,'#ef3219','#ffd28a',25,20);c.fillStyle='#ef4a16';poly(c,[[-16,-14],[-15,-27],[-8,-22],[-4,-34],[2,-23],[8,-34],[11,-21],[20,-27],[16,-12]]);c.fill();c.stroke();c.fillStyle='#ffc333';poly(c,[[-10,-16],[-8,-25],[-3,-20],[1,-29],[5,-20],[10,-25],[10,-14]]);c.fill();c.stroke();band(c,'#651515');angryEye(c,9,-7,1);beak(c,20,-3,'#ffc533');c.save();c.globalAlpha=.45+.18*Math.sin(t*.006);c.fillStyle='#ff7a1a';for(let i=0;i<4;i++){const a=t*.0015+i*1.5;const x=-29-i*5+Math.sin(a)*3,y=-8-i*6;c.beginPath();c.ellipse(x,y,2.2,5,.2,0,Math.PI*2);c.fill();}c.restore();c.restore();}

  function resize(){const r=canvas.getBoundingClientRect();const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(w!==lastW||h!==lastH){lastW=w;lastH=h;canvas.width=w;canvas.height=h;}return {w:r.width,h:r.height,dpr};}
  function draw(now){const s=resize();ctx.setTransform(s.dpr,0,0,s.dpr,0,0);ctx.clearRect(0,0,s.w,s.h);const base=Math.min(s.w/360,s.h/178);const y=s.h*.59;const bob=Math.sin(now*.003)*2.2;
    ctx.save();ctx.translate(s.w*.22,y+5+bob*.55);ctx.scale(base*.83,base*.83);drawEagle(ctx,now);ctx.restore();
    ctx.save();ctx.translate(s.w*.78,y+4-bob*.45);ctx.scale(base*.86,base*.86);drawPhoenix(ctx,now);ctx.restore();
    ctx.save();ctx.translate(s.w*.50,y-5+bob);ctx.scale(base*1.10,base*1.10);drawKing(ctx,now);ctx.restore();
    raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);

  const status=splash.querySelector('.ff-splash__status');
  const percent=splash.querySelector('.ff-splash__percent');
  let progress=.08,target=.08,done=false;
  const labels=[['foundation','Tuning the Feathers...'],['game','Waking the Flock...'],['roster','Calling the Heroes...'],['worlds','Opening the Skies...'],['ready','Ready to Fly!']];
  const stage=new Set();
  const setTarget=(v,label)=>{target=Math.max(target,Math.min(.98,v));if(label) status.textContent=label;};
  const mark=(key)=>{if(stage.has(key))return;stage.add(key);const hit=labels.find(x=>x[0]===key);if(key==='foundation')setTarget(.26,hit?.[1]);else if(key==='game')setTarget(.45,hit?.[1]);else if(key==='roster')setTarget(.67,hit?.[1]);else if(key==='worlds')setTarget(.84,hit?.[1]);else if(key==='ready')setTarget(.96,hit?.[1]);};
  const updateUI=()=>{progress+=(target-progress)*.16;if(target-progress<.002)progress=target;const p=Math.round(progress*100);splash.style.setProperty('--ff-splash-progress',`${p}%`);percent.textContent=`${p}%`;};
  const timer=setInterval(()=>{
    if(done)return;
    if(window.__FF_UI_FOUNDATION_V1_READY__) mark('foundation');
    if(window.game) mark('game');
    if(window.__FF_CHARACTER_ROSTER_V1__) mark('roster');
    if(window.__FF_W3_ENVIRONMENT_PNG_V1_READY__||window.__FF_W2_ENV_ASSETS_V1__||document.getElementById('worldCard')) mark('worlds');
    const start=document.getElementById('startScreen');
    const preview=document.getElementById('previewBirdCanvas');
    const menuReady=!!(start&&preview&&window.__FF_CHARACTER_ROSTER_V1__&&window.game);
    if(menuReady) mark('ready');
    updateUI();
    const elapsed=performance.now()-started;
    if((menuReady&&elapsed>1250)||elapsed>7200) finish();
  },80);

  function finish(){if(done)return;done=true;target=1;progress=1;status.textContent='Ready to Fly!';splash.style.setProperty('--ff-splash-progress','100%');percent.textContent='100%';clearInterval(timer);setTimeout(()=>{splash.classList.add('ff-splash--leaving');doc.classList.remove('ff-splash-active');setTimeout(()=>{cancelAnimationFrame(raf);splash.remove();},430);},220);}
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);clearInterval(timer);},{once:true});
  window.__FF_SPLASH_V1__={version:'1.0.0',mark,finish,get progress(){return progress;}};
})();
