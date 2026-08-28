(()=>{'use strict';
if(window.__FF_SPLASH_V2__)return;
const A=window.__FF_SPLASH_PNG_V2__; if(!A||!A.logo||!A.owl||!A.eagle||!A.king||!A.phoenix||!A.platform){console.warn('[FeatherFury] splash PNG assets missing');return;}
const started=performance.now(),doc=document.documentElement;doc.classList.add('ff-splash-active');
const s=document.createElement('div');s.id='ffBootSplash';s.className='ff2-splash';s.setAttribute('role','status');s.setAttribute('aria-live','polite');
s.innerHTML=`
  <div class="ff2-bg" aria-hidden="true"><i class="ff2-realm ff2-forest"></i><i class="ff2-realm ff2-ice"></i><i class="ff2-realm ff2-storm"></i></div>
  <div class="ff2-vignette"></div>
  <img class="ff2-owl" src="${A.owl}" alt="" draggable="false">
  <img class="ff2-logo" src="${A.logo}" alt="Feather Fury" draggable="false">
  <div class="ff2-heroes" aria-hidden="true">
    <img class="ff2-hero ff2-eagle" src="${A.eagle}" alt="" draggable="false">
    <img class="ff2-hero ff2-king" src="${A.king}" alt="" draggable="false">
    <img class="ff2-hero ff2-phoenix" src="${A.phoenix}" alt="" draggable="false">
  </div>
  <img class="ff2-platform" src="${A.platform}" alt="" draggable="false">
  <div class="ff2-loader">
    <div class="ff2-status">Preparing the Skies...</div>
    <div class="ff2-track"><div class="ff2-fill"></div><span class="ff2-feather">◆</span></div>
    <div class="ff2-percent">8%</div>
  </div>`;
(document.body||document.documentElement).appendChild(s);
const status=s.querySelector('.ff2-status'),percent=s.querySelector('.ff2-percent');let progress=.08,target=.08,done=false;
const setTarget=(v,label)=>{target=Math.max(target,Math.min(.98,v));if(label)status.textContent=label;};
const seen=new Set();const mark=(k)=>{if(seen.has(k))return;seen.add(k);if(k==='foundation')setTarget(.25,'Tuning the Feathers...');else if(k==='game')setTarget(.44,'Waking the Flock...');else if(k==='roster')setTarget(.67,'Calling the Heroes...');else if(k==='worlds')setTarget(.84,'Opening the Skies...');else if(k==='ready')setTarget(.96,'Ready to Fly!');};
const tick=setInterval(()=>{if(done)return;if(window.__FF_UI_FOUNDATION_V1_READY__)mark('foundation');if(window.game)mark('game');if(window.__FF_CHARACTER_ROSTER_V1__)mark('roster');if(window.__FF_W3_ENVIRONMENT_PNG_V1_READY__||window.__FF_W2_ENV_ASSETS_V1__||document.getElementById('worldCard'))mark('worlds');const start=document.getElementById('startScreen'),preview=document.getElementById('previewBirdCanvas');const ready=!!(start&&preview&&window.__FF_CHARACTER_ROSTER_V1__&&window.game);if(ready)mark('ready');progress+=(target-progress)*.17;if(target-progress<.002)progress=target;const p=Math.round(progress*100);s.style.setProperty('--ff2-progress',p+'%');percent.textContent=p+'%';const elapsed=performance.now()-started;if((ready&&elapsed>1300)||elapsed>7600)finish();},80);
function finish(){if(done)return;done=true;progress=1;status.textContent='Ready to Fly!';s.style.setProperty('--ff2-progress','100%');percent.textContent='100%';clearInterval(tick);setTimeout(()=>{s.classList.add('ff2-leaving');doc.classList.remove('ff-splash-active');setTimeout(()=>s.remove(),430);},230);}
window.addEventListener('pagehide',()=>clearInterval(tick),{once:true});window.__FF_SPLASH_V2__={version:'2.1.0-png',mark,finish,get progress(){return progress;}};
})();
