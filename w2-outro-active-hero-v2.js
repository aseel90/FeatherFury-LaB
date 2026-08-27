(()=>{
'use strict';
const VERSION='w2-outro-active-hero-v2';
function install(){
  const g=window.game;
  if(!g||typeof window.drawBirdSkin!=='function'||typeof g.drawEagle!=='function')return false;
  if(g.__w2OutroActiveHeroV2Installed)return true;

  const legacyEntrant=g.drawEagle;
  const drawActiveHero=window.drawBirdSkin;
  const isFrostbiteOutro=game=>!!(game&&game.activeWorld===1&&(game.state==='BOSS_OUTRO'||game.state==='FLY_AWAY'));

  // Keep the player's normal on-screen character visible.
  // Only replace the separate Mountain Eagle entrant with a second copy
  // of the currently equipped playable hero. The existing owl.x/owl.y
  // outro path provides the visible entrance from the right side.
  g.drawEagle=function(ctx,x,y,frame){
    if(!isFrostbiteOutro(this))return legacyEntrant.call(this,ctx,x,y,frame);
    const f=Number(frame)||0;
    const wing=Math.sin(f*.5);
    const bob=Math.sin(f*.1)*.8;
    drawActiveHero(ctx,this.activeSkin||'classic',x,y+bob,-.04,wing,1,false);
  };

  g.__w2OutroActiveHeroV2Installed=true;
  window.__FF_W2_OUTRO_ACTIVE_HERO_V2__={
    version:VERSION,
    world:2,
    usesActiveSkin:true,
    playerRemainsVisible:true,
    separateEntrant:true,
    entrantUsesExistingOutroPath:true
  };
  console.log('[FF] Frostbite outro: active hero now enters as a separate second character');
  return true;
}
let tries=0;
const timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer);},50);
setTimeout(install,650);
})();
