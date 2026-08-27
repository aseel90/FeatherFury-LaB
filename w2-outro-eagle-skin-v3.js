(()=>{
'use strict';
const VERSION='w2-outro-eagle-skin-v3';
function install(){
  const g=window.game;
  if(!g||typeof window.drawBirdSkin!=='function'||typeof g.drawEagle!=='function')return false;
  if(g.__w2OutroEagleSkinV3Installed)return true;

  const legacyEntrant=g.drawEagle;
  const isFrostbiteOutro=game=>!!(game&&game.activeWorld===1&&(game.state==='BOSS_OUTRO'||game.state==='FLY_AWAY'));

  // Keep the player's normal character visible.
  // Replace only the old primitive Mountain Eagle outro drawing with
  // the actual playable Eagle skin from the character roster.
  g.drawEagle=function(ctx,x,y,frame){
    if(!isFrostbiteOutro(this))return legacyEntrant.call(this,ctx,x,y,frame);
    const f=Number(frame)||0;
    const wing=Math.sin(f*.5);
    const bob=Math.sin(f*.1)*.8;
    return window.drawBirdSkin(ctx,'eagle',x,y+bob,-.04,wing,1,false);
  };

  g.__w2OutroEagleSkinV3Installed=true;
  window.__FF_W2_OUTRO_EAGLE_SKIN_V3__={
    version:VERSION,
    world:2,
    entrantSkin:'eagle',
    playerRemainsVisible:true,
    usesPlayableEagleRenderer:true,
    entrantUsesExistingOutroPath:true
  };
  console.log('[FF] Frostbite outro: playable Eagle skin is the entering character');
  return true;
}
let tries=0;
const timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer);},50);
setTimeout(install,650);
})();