(()=>{'use strict';
function install(){
  const g=window.game;
  if(!g?.__w2BossOrbV7Installed)return false;
  if(g.__w2V7CompatV1Installed)return true;
  // W2 Combat V6 shares the same __w2OrbBossV6 state object; expose the old
  // install marker so the combat polish can attach after Orb V7.
  g.__w2BossOrbV6Installed=true;
  g.__w2V7CompatV1Installed=true;
  console.log('[FF-LAB] w2-v7-compat-v1-installed');
  return true;
}
let n=0;const t=setInterval(()=>{if(install()||++n>120)clearInterval(t);},80);setTimeout(install,1200);
})();
