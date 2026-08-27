(()=>{
'use strict';
const VERSION='w2-outro-active-hero-v1';
let installed=false;
function install(){
  const g=window.game;
  if(!g||typeof window.drawBirdSkin!=='function'||typeof g.drawEagle!=='function')return false;
  if(g.__w2OutroActiveHeroV1Installed){installed=true;return true;}

  const drawActiveHero=window.drawBirdSkin;
  const drawLegacyEagle=g.drawEagle;
  const isSnowOutro=game=>!!(game&&game.activeWorld===1&&(game.state==='BOSS_OUTRO'||game.state==='FLY_AWAY'));

  // During the Frostbite outro, the active playable hero is the entrant.
  // Suppress the duplicate gameplay-position copy and keep one visible hero only.
  window.drawBirdSkin=function(ctx,skinKey,x,y,rotation,wingCycle,scale,inFever){
    const game=window.game;
    if(isSnowOutro(game)&&game.bird&&Math.abs(Number(x)-Number(game.bird.x))<.25&&Math.abs(Number(y)-Number(game.bird.y))<.25){
      return;
    }
    return drawActiveHero.apply(this,arguments);
  };

  // Reuse the existing outro entrant path/animation, but render the currently equipped hero skin.
  g.drawEagle=function(ctx,x,y,frame){
    if(!isSnowOutro(this))return drawLegacyEagle.call(this,ctx,x,y,frame);
    const f=Number(frame)||0;
    const wing=Math.sin(f*.5);
    const bob=Math.sin(f*.1)*.8;
    drawActiveHero(ctx,this.activeSkin||'classic',x,y+bob,-.04,wing,1,false);
  };

  g.__w2OutroActiveHeroV1Installed=true;
  window.__FF_W2_OUTRO_ACTIVE_HERO_V1__={version:VERSION,world:2,usesActiveSkin:true,duplicateHeroHidden:true};
  installed=true;
  console.log('[FF] Frostbite outro now uses the active playable hero');
  return true;
}
let tries=0,timer=setInterval(()=>{if(install()||++tries>160)clearInterval(timer);},50);
setTimeout(install,600);
})();
