(()=>{
'use strict';
const VERSION='w2-outro-active-hero-v2-eagle-hotfix';
function install(){
  const g=window.game;
  if(!g||typeof window.drawBirdSkin!=='function'||typeof g.drawEagle!=='function')return false;
  if(g.__w2OutroEagleHotfixInstalled)return true;

  const legacyEntrant=g.drawEagle;
  const isFrostbiteOutro=game=>!!(game&&game.activeWorld===1&&(game.state==='BOSS_OUTRO'||game.state==='FLY_AWAY'));

  // Keep the player visible and render the separate entrant as the actual
  // playable Mountain Eagle skin, not as the player's equipped skin.
  g.drawEagle=function(ctx,x,y,frame){
    if(!isFrostbiteOutro(this))return legacyEntrant.call(this,ctx,x,y,frame);
    const f=Number(frame)||0;
    const wing=Math.sin(f*.5);
    const bob=Math.sin(f*.1)*.8;
    return window.drawBirdSkin(ctx,'eagle',x,y+bob,-.04,wing,1,false);
  };

  g.__w2OutroEagleHotfixInstalled=true;
  window.__FF_W2_OUTRO_ACTIVE_HERO_V2__={version:VERSION,world:2,entrantSkin:'eagle',playerRemainsVisible:true};
  console.log('[FF] Frostbite outro hotfix: Mountain Eagle playable skin enters');
  return true;
}
let tries=0;
const timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer);},50);
setTimeout(install,650);
})();