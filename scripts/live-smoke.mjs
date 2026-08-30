import { chromium, webkit } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.FF_LIVE_URL || process.env.FF_URL || 'https://aseel90.github.io/FeatherFury-LaB/';
const ENGINE = (process.env.FF_BROWSER || 'chromium').toLowerCase();
const OUT = process.env.FF_SMOKE_OUT || process.env.FF_ARTIFACT_DIR || `artifacts/live-smoke-${ENGINE}`;
fs.mkdirSync(OUT,{recursive:true});
const launcher = ENGINE === 'webkit' ? webkit : chromium;
const browser = await launcher.launch({headless:true});
const context = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:ENGINE==='webkit'?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1':undefined});
const page = await context.newPage();
const events=[];
page.on('console',msg=>{ const type=msg.type(); if (['error','warning'].includes(type)) events.push({type:`console:${type}`,text:msg.text()}); });
page.on('pageerror',err=>events.push({type:'pageerror',text:String(err)}));
page.on('requestfailed',req=>events.push({type:'requestfailed',text:`${req.url()} :: ${req.failure()?.errorText || 'failed'}`}));

const readState = () => page.evaluate(() => {
  const vis = el => {
    if (!el) return false;
    const s=getComputedStyle(el), r=el.getBoundingClientRect();
    return !el.classList.contains('hidden') && s.display!=='none' && s.visibility!=='hidden' && Number(s.opacity||1)>.01 && r.width>1 && r.height>1;
  };
  const rect = el => {
    if (!el) return null;
    const s=getComputedStyle(el), r=el.getBoundingClientRect();
    if (el.classList.contains('hidden') || s.display==='none' || s.visibility==='hidden' || Number(s.opacity||1)<=.01 || r.width<=1 || r.height<=1) return null;
    return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height };
  };
  const start = document.getElementById('startScreen');
  const logo = document.querySelector('#startScreen .ff-main-logo');
  const card = document.getElementById('worldCard');
  const play = document.getElementById('startStoryBtn');
  const thumb = document.querySelector('#worldCard .ff-world-thumb');
  const preview = document.getElementById('previewBirdCanvas');
  const worldStars = document.getElementById('worldStars');
  const starIcons = [...(worldStars?.querySelectorAll('.ff-star-icon') || [])];
  let previewInk = false;
  if (preview?.width && preview?.height) {
    try {
      const ctx = preview.getContext('2d', { willReadFrequently:true });
      const data = ctx.getImageData(0,0,preview.width,preview.height).data;
      for(let i=3;i<data.length;i+=4){ if(data[i]>8){ previewInk=true; break; } }
    } catch (_) { previewInk=true; }
  }
  const runtime = window.__FF_RUNTIME_MAP__;
  const coin = document.querySelector('#gameHud .hud-coin-badge');
  const score = document.querySelector('#gameHud .score-container');
  const pause = document.getElementById('ffPauseBtn');
  const ability = document.getElementById('ffAbilityHud');
  const fever = document.querySelector('#gameHud .fever-bar-container');
  const storeBalance = document.querySelector('#shopScreen .ff-store-balance, #shopScreen .shop-balance');
  return {
    engine:navigator.userAgent,
    viewport:{ innerWidth, innerHeight, visualWidth:visualViewport?.width || null, visualHeight:visualViewport?.height || null },
    runtimeReady:window.__FF_RUNTIME_APPROVED_STACK__ === true,
    menuReady:window.__FF_MENU_UI_READY__ === true,
    runtimeBooting:!!window.__FF_RUNTIME_BOOTING__,
    runtimeMap:runtime?.version || runtime || null,
    menuError:window.__FF_MENU_UI_ERROR__ || null,
    storedHighScore: localStorage.getItem('fh_highscore'),
    storedW1Completed: localStorage.getItem('fh_w1_completed'),
    storedW2Completed: localStorage.getItem('fh_w2_completed'),
    storedW3Completed: localStorage.getItem('fh_w3_completed'),
    startVisible:vis(start),
    startActive:!!start?.classList.contains('active'),
    logoVisible:vis(logo),
    worldCardVisible:vis(card),
    playVisible:vis(play),
    menuRects:{logo:rect(logo),card:rect(card),play:rect(play)},
    playDisabled:!!play?.disabled,
    worldThumb:thumb ? getComputedStyle(thumb).backgroundImage : null,
    worldKicker:document.querySelector('#worldCard .ff-world-kicker')?.textContent?.trim() || null,
    worldStars:{
      total:starIcons.length,
      filled:starIcons.filter(img => /star-filled\.svg(?:\?|$)/.test(img.getAttribute('src') || '')).length,
      empty:starIcons.filter(img => /star-empty\.svg(?:\?|$)/.test(img.getAttribute('src') || '')).length
    },
    coinIcon:!!document.querySelector('#startScreen .ff-coin-icon'),
    birdButton:!!document.querySelector('#startScreen .ff-bird-avatar-btn'),
    previewInk,
    pauseVisible:!!document.getElementById('ffPauseOverlay')?.classList.contains('show'),
    pauseButtonVisible:vis(pause),
    hudLayout:{ coin:rect(coin), score:rect(score), pause:rect(pause), ability:rect(ability), fever:rect(fever) },
    hudValues:{
      coins:document.getElementById('runCoins')?.textContent?.trim() || '0',
      score:document.getElementById('scoreValue')?.textContent?.trim() || '0',
      stage:document.getElementById('stageName')?.textContent?.trim() || null,
      feverWidth:document.getElementById('feverFill')?.getBoundingClientRect()?.width || 0,
      feverVisible:vis(fever)
    },
    storeBalanceStyle:storeBalance ? (()=>{ const s=getComputedStyle(storeBalance); return {display:s.display,fontFamily:s.fontFamily,borderRadius:s.borderRadius}; })() : null,
    gameState:window.game?.state || null,
    currentWorld:window.game?.activeWorld ?? null,
    splashPresent:!!document.getElementById('ffApprovedBootSplash'),
    toast:document.getElementById('gameToast')?.textContent?.trim() || ''
  };
});

const base = new URL(BASE);
base.searchParams.set('ui','world-v1');
base.searchParams.set('ffverify', `${process.env.FF_VERIFY_SHA || process.env.GITHUB_SHA || Date.now()}-${Date.now()}`);

try {
  await page.goto(base.href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.__FF_RUNTIME_APPROVED_STACK__===true && window.__FF_MENU_UI_READY__===true,null,{timeout:70000});
  await page.waitForFunction(()=>!document.getElementById('ffApprovedBootSplash'),null,{timeout:10000});
  await page.waitForFunction(()=>{
    const v=el=>{ if(!el||el.classList.contains('hidden'))return false; const s=getComputedStyle(el),r=el.getBoundingClientRect(); return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>.01&&r.width>1&&r.height>1; };
    return v(document.getElementById('startScreen'))&&v(document.querySelector('#startScreen .ff-main-logo'))&&v(document.getElementById('worldCard'))&&v(document.getElementById('startStoryBtn'));
  },null,{timeout:5000});

  const menu = await readState();
  const badMenu = !menu.startVisible || !menu.startActive || !menu.logoVisible || !menu.worldCardVisible || !menu.playVisible || menu.playDisabled || !menu.worldThumb?.includes('world-1.webp') || !menu.worldKicker || !menu.coinIcon || !menu.birdButton || !menu.previewInk || menu.pauseVisible;
  if (badMenu) throw new Error(`Main menu contract failed: ${JSON.stringify(menu)}`);
  if (menu.worldStars?.total !== 3 || menu.worldStars?.filled !== 0 || menu.worldStars?.empty !== 3) throw new Error(`Fresh-profile world stars must start empty: ${JSON.stringify(menu.worldStars)}`);
  const worldPlayGap=(menu.menuRects?.play?.top??0)-(menu.menuRects?.card?.bottom??0);
  if (worldPlayGap<10) throw new Error(`World/PLAY spacing collapsed (${worldPlayGap}px): ${JSON.stringify(menu.menuRects)}`);
  if (menu.storeBalanceStyle?.display!=='flex' || !/Press Start 2P/i.test(menu.storeBalanceStyle?.fontFamily||'')) throw new Error(`Store coin balance identity is incomplete: ${JSON.stringify(menu.storeBalanceStyle)}`);

  await page.evaluate(()=>document.getElementById('startStoryBtn')?.click());
  await page.waitForFunction(()=>['STORY','LAUNCH','PLAYING'].includes(window.game?.state),null,{timeout:10000});
  if (await page.evaluate(()=>window.game?.state==='STORY')) {
    const canvas=page.locator('#gameCanvas');
    await canvas.click({position:{x:220,y:320},timeout:5000}); await page.waitForTimeout(120); await canvas.click({position:{x:220,y:320},timeout:5000});
  }
  await page.waitForFunction(()=>window.game?.state==='PLAYING',null,{timeout:12000});
  await page.waitForFunction(()=>{ const btn=document.getElementById('ffPauseBtn'),hud=document.getElementById('gameHud'); return !!btn&&!!hud&&!hud.classList.contains('hidden')&&btn.classList.contains('show')&&getComputedStyle(btn).display!=='none'; },null,{timeout:8000});

  await page.evaluate(()=>{document.documentElement.dir='rtl';});
  await page.waitForTimeout(120);
  const afterPlay=await readState();
  if (afterPlay.startActive || afterPlay.gameState==='MENU') throw new Error(`PLAY did not leave menu: ${JSON.stringify(afterPlay)}`);
  if (!afterPlay.pauseButtonVisible) throw new Error(`Pause button is missing after PLAY: ${JSON.stringify(afterPlay)}`);
  if (!afterPlay.hudValues?.feverVisible) throw new Error(`Fever bar is missing during gameplay: ${JSON.stringify(afterPlay.hudValues)}`);
  const {coin,score,pause,ability,fever}=afterPlay.hudLayout||{};
  if (!coin||!score||!pause) throw new Error(`HUD row is incomplete: ${JSON.stringify(afterPlay.hudLayout)}`);
  const topDelta=Math.max(coin.top,score.top,pause.top)-Math.min(coin.top,score.top,pause.top);
  if (!(coin.right<score.left&&score.right<pause.left)||topDelta>16) throw new Error(`HUD row alignment failed: ${JSON.stringify(afterPlay.hudLayout)}`);
  if (ability && ability.top<Math.max(coin.bottom,score.bottom,pause.bottom)-2) throw new Error(`Ability chip overlaps top HUD: ${JSON.stringify(afterPlay.hudLayout)}`);
  if (!fever || fever.top<Math.max(coin.bottom,score.bottom,pause.bottom)+6) throw new Error(`Fever bar overlaps or is missing below top HUD: ${JSON.stringify(afterPlay.hudLayout)}`);

  await page.locator('#ffPauseBtn').click({timeout:5000});
  await page.waitForFunction(()=>document.getElementById('ffPauseOverlay')?.classList.contains('show'),null,{timeout:5000});
  const paused=await readState();
  if (!paused.pauseVisible) throw new Error(`Pause overlay did not open: ${JSON.stringify(paused)}`);
  const frozenBefore=await page.evaluate(()=>({y:Number(window.game?.bird?.y??NaN),velocity:Number(window.game?.bird?.velocity??NaN),score:Number(window.game?.score??NaN),frame:Number(window.game?.frame??NaN)}));
  await page.waitForTimeout(650);
  const frozenAfter=await page.evaluate(()=>({y:Number(window.game?.bird?.y??NaN),velocity:Number(window.game?.bird?.velocity??NaN),score:Number(window.game?.score??NaN),frame:Number(window.game?.frame??NaN)}));
  const finiteMotion=Number.isFinite(frozenBefore.y)&&Number.isFinite(frozenAfter.y)&&Number.isFinite(frozenBefore.velocity)&&Number.isFinite(frozenAfter.velocity);
  if (!finiteMotion||Math.abs(frozenAfter.y-frozenBefore.y)>.01||Math.abs(frozenAfter.velocity-frozenBefore.velocity)>.01||frozenAfter.score!==frozenBefore.score) throw new Error(`Pause did not freeze simulation: ${JSON.stringify({frozenBefore,frozenAfter})}`);

  await page.locator('#ffPauseOverlay [data-action="settings"]').click({timeout:5000});
  await page.waitForFunction(()=>{const settings=document.getElementById('settingsScreen');return settings?.classList.contains('active')&&!settings.classList.contains('hidden')&&window.game?.__ffPaused===true;},null,{timeout:5000});
  const settingsState=await page.evaluate(()=>({state:window.game?.state,paused:window.game?.__ffPaused,pauseVisible:document.getElementById('ffPauseOverlay')?.classList.contains('show')}));
  if (!settingsState.paused||settingsState.pauseVisible) throw new Error(`Pause -> Settings contract failed: ${JSON.stringify(settingsState)}`);
  await page.locator('#closeSettingsBtn').click({timeout:5000});
  await page.waitForFunction(()=>document.getElementById('ffPauseOverlay')?.classList.contains('show')&&window.game?.__ffPaused===true,null,{timeout:5000});
  const backToPause=await page.evaluate(()=>({state:window.game?.state,paused:window.game?.__ffPaused,settingsActive:document.getElementById('settingsScreen')?.classList.contains('active')}));
  if (!backToPause.paused||backToPause.settingsActive||backToPause.state!==settingsState.state) throw new Error(`Settings -> Pause return contract failed: ${JSON.stringify({settingsState,backToPause})}`);

  const savedHudState=await page.evaluate(()=>({score:window.game?.score,sessionCoins:window.game?.sessionCoins,fever:window.game?.fever,feverActive:window.game?.feverActive,feverTimer:window.game?.feverTimer}));
  await page.evaluate(()=>{window.game.score=7;window.game.sessionCoins=3;window.game.feverActive=false;window.game.feverTimer=0;window.game.fever=50;});
  await page.waitForFunction(()=>{const coins=document.getElementById('runCoins')?.textContent?.trim(),score=document.getElementById('scoreValue')?.textContent?.trim(),fever=document.getElementById('feverFill')?.getBoundingClientRect()?.width||0;return coins==='3'&&score==='7'&&fever>2;},null,{timeout:3000});
  const bridged=await readState();
  if (bridged.hudValues?.coins!=='3'||bridged.hudValues?.score!=='7'||!bridged.hudValues?.feverVisible||bridged.hudValues?.feverWidth<=2) throw new Error(`Visible HUD data bridge failed: ${JSON.stringify(bridged.hudValues)}`);
  await page.evaluate(saved=>Object.assign(window.game,saved),savedHudState);

  const resume=page.locator('#ffPauseOverlay [data-action="resume"]');
  if (await resume.count()) { await resume.click({timeout:5000}); await page.waitForFunction(()=>!document.getElementById('ffPauseOverlay')?.classList.contains('show')&&window.game?.__ffPaused===false,null,{timeout:5000}); }
  await page.locator('#ffPauseBtn').click({timeout:5000});
  await page.waitForFunction(()=>document.getElementById('ffPauseOverlay')?.classList.contains('show'),null,{timeout:5000});
  await page.locator('#ffPauseOverlay [data-action="menu"]').click({timeout:5000});
  await page.waitForFunction(()=>{const start=document.getElementById('startScreen');return window.game?.state==='MENU'&&window.game?.__ffPaused===false&&start?.classList.contains('active')&&!start.classList.contains('hidden');},null,{timeout:5000});

  await page.evaluate(()=>{const start=document.getElementById('startScreen'),end=document.getElementById('gameOverScreen');start?.classList.remove('active');start?.classList.add('hidden');end?.classList.remove('hidden');end?.classList.add('active','ff-defeat');window.game.state='GAMEOVER';window.game.__ffPaused=false;});
  await page.locator('#shopBtnGameOver').click({timeout:5000});
  await page.waitForFunction(()=>document.getElementById('shopScreen')?.classList.contains('active')&&!document.getElementById('gameOverScreen')?.classList.contains('active'),null,{timeout:5000});
  await page.locator('#closeShopBtn').click({timeout:5000});
  await page.waitForFunction(()=>document.getElementById('gameOverScreen')?.classList.contains('active')&&window.game?.state==='GAMEOVER',null,{timeout:5000});

  const nextWorldMap=await page.evaluate(()=>{const nav=window.__FF_UI_NAV__,out=[];for(const world of [0,1,2]){window.game.activeWorld=world;window.game.state='GAMEOVER';nav.nextWorld();out.push(window.game.currentWorldIndex);}return out;});
  if (JSON.stringify(nextWorldMap)!==JSON.stringify([1,2,3])) throw new Error(`Next World map failed: ${JSON.stringify(nextWorldMap)}`);

  const w3Progress=await page.evaluate(()=>{
    const g=window.game;
    if(!g?.__w3FinalPolishV1Installed||typeof g.gameOver!=='function')return{installed:false};
    const keys=['fh_highscore','fh_highscore_w3','fh_w3_completed','fh_unlocked_skins'];
    const stored=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
    const snapshot={activeWorld:g.activeWorld,currentWorldIndex:g.currentWorldIndex,state:g.state,score:g.score,sessionCoins:g.sessionCoins,highScore:g.highScore,highScoreW3:g.highScoreW3,w3Completed:g.w3Completed,totalCoins:g.totalCoins,unlockedSkins:[...(g.unlockedSkins||[])]};
    const restoreStorage=()=>{for(const [key,value] of Object.entries(stored)){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}};
    try{
      g.activeWorld=2;g.currentWorldIndex=2;g.highScore=11;g.highScoreW3=0;g.w3Completed=false;g.score=22;g.sessionCoins=0;g.state='PLAYING';
      localStorage.setItem('fh_highscore','11');localStorage.setItem('fh_highscore_w3','0');localStorage.setItem('fh_w3_completed','false');
      g.gameOver(false);
      const defeat={w1:Number(g.highScore),w3:Number(g.highScoreW3),complete:!!g.w3Completed,storedW1:localStorage.getItem('fh_highscore'),storedW3:localStorage.getItem('fh_highscore_w3'),storedComplete:localStorage.getItem('fh_w3_completed')};
      g.activeWorld=2;g.currentWorldIndex=2;g.score=44;g.sessionCoins=0;g.state='PLAYING';g.gameOver(true);
      const victory={w1:Number(g.highScore),w3:Number(g.highScoreW3),complete:!!g.w3Completed,storedW1:localStorage.getItem('fh_highscore'),storedW3:localStorage.getItem('fh_highscore_w3'),storedComplete:localStorage.getItem('fh_w3_completed')};
      return{installed:true,defeat,victory};
    }finally{
      Object.assign(g,{activeWorld:snapshot.activeWorld,currentWorldIndex:snapshot.currentWorldIndex,state:snapshot.state,score:snapshot.score,sessionCoins:snapshot.sessionCoins,highScore:snapshot.highScore,highScoreW3:snapshot.highScoreW3,w3Completed:snapshot.w3Completed,totalCoins:snapshot.totalCoins});
      g.unlockedSkins=new Set(snapshot.unlockedSkins);restoreStorage();
    }
  });
  if(!w3Progress.installed)throw new Error(`World 3 progress bridge is not installed: ${JSON.stringify(w3Progress)}`);
  if(w3Progress.defeat.w1!==11||w3Progress.defeat.w3!==22||w3Progress.defeat.complete||w3Progress.defeat.storedW1!=='11'||w3Progress.defeat.storedW3!=='22'||w3Progress.defeat.storedComplete!=='false')throw new Error(`World 3 defeat progress isolation failed: ${JSON.stringify(w3Progress.defeat)}`);
  if(w3Progress.victory.w1!==11||w3Progress.victory.w3!==44||!w3Progress.victory.complete||w3Progress.victory.storedW1!=='11'||w3Progress.victory.storedW3!=='44'||w3Progress.victory.storedComplete!=='true')throw new Error(`World 3 victory progress persistence failed: ${JSON.stringify(w3Progress.victory)}`);

  const criticalEvents=events.filter(e=>e.type==='pageerror'||e.type==='requestfailed'||/approved runtime boot failed|clean stable runtime failed|post-runtime UI boot failed/i.test(e.text));
  if(criticalEvents.length)throw new Error(`Critical browser events: ${JSON.stringify(criticalEvents.slice(-20))}`);
  const report={ok:true,browser:ENGINE,url:base.href,menu,afterPlay,events};
  fs.writeFileSync(path.join(OUT,'state.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}catch(error){
  const state=await readState().catch(()=>null);
  await page.screenshot({path:path.join(OUT,'failure.png'),fullPage:true}).catch(()=>{});
  const report={ok:false,browser:ENGINE,url:base.href,error:error?.stack||String(error),state,events};
  fs.writeFileSync(path.join(OUT,'state.json'),JSON.stringify(report,null,2));
  console.error(JSON.stringify(report,null,2));
  process.exitCode=1;
}finally{
  await browser.close();
}
