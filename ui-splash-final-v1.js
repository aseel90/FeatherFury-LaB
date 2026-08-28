(()=>{'use strict';
if(window.__FF_SPLASH_FINAL_SCREEN_V1__)return;
const A=window.__FF_SPLASH_FINAL_V1__;
if(!A||!A.background||!A.logo||!A.heroes){console.warn('[FeatherFury] final splash assets missing');return;}

const started=performance.now();
const root=document.documentElement;
root.classList.add('ff-final-splash-active');

const splash=document.createElement('div');
splash.id='ffFinalBootSplash';
splash.className='ff-final-splash';
splash.setAttribute('role','status');
splash.setAttribute('aria-live','polite');
splash.innerHTML=`
  <img class="ff-final-bg" src="${A.background}" alt="" draggable="false">
  <div class="ff-final-shade" aria-hidden="true"></div>
  <img class="ff-final-logo" src="${A.logo}" alt="Feather Fury" draggable="false">
  <img class="ff-final-heroes" src="${A.heroes}" alt="" draggable="false">
  <div class="ff-final-loader">
    <div class="ff-final-status">Preparing the Skies...</div>
    <div class="ff-final-track" aria-hidden="true">
      <div class="ff-final-fill"></div>
      <span class="ff-final-marker"></span>
    </div>
    <div class="ff-final-percent">8%</div>
  </div>`;
(document.body||document.documentElement).appendChild(splash);

const status=splash.querySelector('.ff-final-status');
const percent=splash.querySelector('.ff-final-percent');
let progress=.08,target=.08,done=false;
const seen=new Set();

function setTarget(v,label){
  target=Math.max(target,Math.min(.98,v));
  if(label)status.textContent=label;
}
function mark(key){
  if(seen.has(key))return;
  seen.add(key);
  if(key==='foundation')setTarget(.24,'Preparing the Skies...');
  else if(key==='game')setTarget(.43,'Waking the Flock...');
  else if(key==='roster')setTarget(.67,'Calling the Heroes...');
  else if(key==='worlds')setTarget(.84,'Opening the Worlds...');
  else if(key==='ready')setTarget(.97,'Ready to Fly!');
}
function isReady(){
  const start=document.getElementById('startScreen');
  const preview=document.getElementById('previewBirdCanvas');
  return !!(start&&preview&&window.__FF_CHARACTER_ROSTER_V1__&&window.game);
}
const tick=setInterval(()=>{
  if(done)return;
  if(window.__FF_UI_FOUNDATION_V1_READY__)mark('foundation');
  if(window.game)mark('game');
  if(window.__FF_CHARACTER_ROSTER_V1__)mark('roster');
  if(window.__FF_W3_ENVIRONMENT_PNG_V1_READY__||window.__FF_W2_ENV_ASSETS_V1__||document.getElementById('worldCard'))mark('worlds');
  const ready=isReady();
  if(ready)mark('ready');
  progress+=(target-progress)*.18;
  if(Math.abs(target-progress)<.0015)progress=target;
  const p=Math.round(progress*100);
  splash.style.setProperty('--ff-load',p+'%');
  percent.textContent=p+'%';
  const elapsed=performance.now()-started;
  if((ready&&elapsed>1550)||elapsed>8000)finish();
},80);

function finish(){
  if(done)return;
  done=true;
  progress=1;
  splash.style.setProperty('--ff-load','100%');
  status.textContent='Ready to Fly!';
  percent.textContent='100%';
  clearInterval(tick);
  setTimeout(()=>{
    splash.classList.add('ff-final-leaving');
    root.classList.remove('ff-final-splash-active');
    setTimeout(()=>splash.remove(),420);
  },260);
}
window.addEventListener('pagehide',()=>clearInterval(tick),{once:true});
window.__FF_SPLASH_FINAL_SCREEN_V1__={version:'1.0.0',finish,mark,get progress(){return progress;}};
})();