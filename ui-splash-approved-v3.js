(()=>{'use strict';
if(window.__FF_SPLASH_APPROVED_SCREEN_V3__)return;
const B=window.__FF_SPLASHC_PARTS__;
if(!B||!B.bg){
  console.warn('[FeatherFury] approved loading background missing');
  return;
}

const BG='data:image/jpeg;base64,'+B.bg;
const HEROES='assets/ui/loading-hq/feather-fury-heroes.png?v=20260828';
const LOGO='assets/ui/loading-hq/feather-fury-logo.png?v=20260828';
const started=performance.now();
const root=document.documentElement;
root.classList.add('ff-approved-splash-active');

const splash=document.createElement('div');
splash.id='ffApprovedBootSplash';
splash.className='ff-approved-splash';
splash.setAttribute('role','status');
splash.setAttribute('aria-live','polite');
splash.setAttribute('dir','ltr');
splash.innerHTML=`
  <img class="ff-approved-bg" src="${BG}" alt="" draggable="false" decoding="async">
  <div class="ff-approved-vignette" aria-hidden="true"></div>
  <div class="ff-approved-stage" aria-hidden="true">
    <img class="ff-approved-logo" src="${LOGO}" alt="" draggable="false" decoding="async" fetchpriority="high">
    <img class="ff-approved-heroes" src="${HEROES}" alt="" draggable="false" decoding="async" fetchpriority="high">
  </div>
  <div class="ff-approved-loader" dir="ltr">
    <div class="ff-approved-status" dir="ltr">Preparing the Skies...</div>
    <div class="ff-approved-track" dir="ltr" role="progressbar" aria-label="Loading Feather Fury" aria-valuemin="0" aria-valuemax="100" aria-valuenow="6">
      <div class="ff-approved-fill"></div>
      <span class="ff-approved-marker"></span>
    </div>
    <div class="ff-approved-percent" dir="ltr">6%</div>
  </div>`;
(document.body||document.documentElement).appendChild(splash);

const status=splash.querySelector('.ff-approved-status');
const percent=splash.querySelector('.ff-approved-percent');
const track=splash.querySelector('.ff-approved-track');
const logo=splash.querySelector('.ff-approved-logo');
const heroes=splash.querySelector('.ff-approved-heroes');
let progress=.06;
let target=.08;
let finished=false;
let artLoaded=0;
const reached=new Set();

function setTarget(value,label){
  target=Math.max(target,Math.min(.985,value));
  if(label)status.textContent=label;
}
function mark(key){
  if(reached.has(key))return;
  reached.add(key);
  if(key==='assets') setTarget(.22,'Preparing the Skies...');
  else if(key==='foundation') setTarget(.38,'Waking the Flock...');
  else if(key==='game') setTarget(.57,'Building the Adventure...');
  else if(key==='roster') setTarget(.75,'Calling the Heroes...');
  else if(key==='worlds') setTarget(.89,'Opening the Worlds...');
  else if(key==='ready') setTarget(.985,'Ready to Fly!');
}
function artReady(){
  artLoaded+=1;
  if(artLoaded>=2)mark('assets');
}
[logo,heroes].forEach((img)=>{
  if(img.complete)artReady();
  else{
    img.addEventListener('load',artReady,{once:true});
    img.addEventListener('error',()=>{
      img.style.display='none';
      artReady();
    },{once:true});
  }
});
setTimeout(()=>mark('assets'),900);

function isReady(){
  return !!(
    document.getElementById('startScreen') &&
    document.getElementById('previewBirdCanvas') &&
    window.__FF_CHARACTER_ROSTER_V1__ &&
    window.game
  );
}
function paint(){
  const value=Math.max(0,Math.min(100,Math.round(progress*100)));
  splash.style.setProperty('--ff-load',value+'%');
  percent.textContent=value+'%';
  track.setAttribute('aria-valuenow',String(value));
}
paint();

const timer=setInterval(()=>{
  if(finished)return;
  if(window.__FF_UI_FOUNDATION_V1_READY__)mark('foundation');
  if(window.game)mark('game');
  if(window.__FF_CHARACTER_ROSTER_V1__)mark('roster');
  if(window.__FF_W3_ENVIRONMENT_PNG_V1_READY__||window.__FF_W2_ENV_ASSETS_V1__||document.getElementById('worldCard'))mark('worlds');
  const ready=isReady();
  if(ready)mark('ready');

  progress+=(target-progress)*.16;
  if(Math.abs(target-progress)<.001)progress=target;
  paint();

  const elapsed=performance.now()-started;
  if((ready&&elapsed>=1450)||elapsed>=8500)finish();
},72);

function finish(){
  if(finished)return;
  finished=true;
  progress=1;
  target=1;
  status.textContent='Ready to Fly!';
  paint();
  clearInterval(timer);
  setTimeout(()=>{
    splash.classList.add('ff-approved-leaving');
    root.classList.remove('ff-approved-splash-active');
    setTimeout(()=>splash.remove(),380);
  },220);
}
window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
window.__FF_SPLASH_APPROVED_SCREEN_V3__={version:'3.0.0',direction:'ltr',finish,mark,get progress(){return progress;}};
})();
