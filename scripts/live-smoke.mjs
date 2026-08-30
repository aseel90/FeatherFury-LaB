import { chromium, webkit } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.FF_LIVE_URL || 'https://aseel90.github.io/FeatherFury-LaB/';
const SHA = process.env.FF_VERIFY_SHA || 'manual';
const ENGINE = (process.env.FF_BROWSER || 'chromium').toLowerCase();
const OUT = process.env.FF_SMOKE_OUT || `artifacts/live-smoke/${ENGINE}`;
fs.mkdirSync(OUT, { recursive: true });

const url = new URL(BASE);
url.searchParams.set('ui', 'world-v1');
url.searchParams.set('ffverify', `${SHA}-${Date.now()}`);

const browserType = ENGINE === 'webkit' ? webkit : chromium;
const browser = await browserType.launch(ENGINE === 'chromium' ? { headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : { headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: ENGINE === 'webkit'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    : undefined
});
const page = await context.newPage();
const events = [];
page.on('console', msg => events.push({ type:`console:${msg.type()}`, text:msg.text() }));
page.on('pageerror', err => events.push({ type:'pageerror', text:err?.stack || String(err) }));
page.on('requestfailed', req => events.push({ type:'requestfailed', text:`${req.method()} ${req.url()} ${req.failure()?.errorText || ''}` }));

const readState = () => page.evaluate(() => {
  const visible = el => {
    if (!el || el.classList.contains('hidden')) return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) <= 0.01) return false;
    const r = el.getBoundingClientRect();
    const vv = window.visualViewport;
    const left = vv?.offsetLeft || 0;
    const top = vv?.offsetTop || 0;
    const right = left + (vv?.width || innerWidth);
    const bottom = top + (vv?.height || innerHeight);
    return r.width > 1 && r.height > 1 && r.left >= left - 2 && r.top >= top - 2 && r.right <= right + 2 && r.bottom <= bottom + 2;
  };
  const rect = el => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
  };
  const preview = document.getElementById('previewBirdCanvas');
  let previewInk = false;
  try {
    const ctx = preview?.getContext('2d');
    if (ctx) {
      const data = ctx.getImageData(0,0,preview.width,preview.height).data;
      previewInk = data.some((v,i) => (i % 4) === 3 && v > 0);
    }
  } catch (_) { previewInk = !!preview; }
  const thumb = document.querySelector('#worldCard .ff-world-thumb');
  return {
    engine: navigator.userAgent,
    viewport: {innerWidth, innerHeight, visualWidth: visualViewport?.width || null, visualHeight: visualViewport?.height || null},
    runtimeReady: window.__FF_RUNTIME_APPROVED_STACK__ === true,
    menuReady: window.__FF_MENU_UI_READY__ === true,
    runtimeBooting: window.__FF_PATCH_BOOTING__,
    runtimeMap: window.__FF_RUNTIME_MAP__ || null,
    menuError: window.__FF_MENU_UI_ERROR__ ? String(window.__FF_MENU_UI_ERROR__) : null,
    startVisible: visible(document.getElementById('startScreen')),
    startActive: document.getElementById('startScreen')?.classList.contains('active') || false,
    logoVisible: visible(document.querySelector('#startScreen .ff-main-logo')),
    worldCardVisible: visible(document.getElementById('worldCard')),
    playVisible: visible(document.getElementById('startStoryBtn')),
    menuRects: {logo: rect(document.querySelector('#startScreen .ff-main-logo')), card: rect(document.getElementById('worldCard')), play: rect(document.getElementById('startStoryBtn'))},
    playDisabled: document.getElementById('startStoryBtn')?.disabled ?? null,
    worldThumb: thumb ? getComputedStyle(thumb).backgroundImage : null,
    worldKicker: document.querySelector('#worldCard .ff-world-kicker')?.textContent || null,
    coinIcon: !!document.querySelector('#startScreen .ff-coin-icon'),
    birdButton: !!document.querySelector('#startScreen .ff-bird-avatar-btn'),
    previewInk,
    pauseVisible: document.getElementById('ffPauseOverlay')?.classList.contains('show') || false,
    pauseButtonVisible: visible(document.getElementById('ffPauseBtn')),
    hudLayout: (() => {
      const rectSel = idOrEl => {
        const el = typeof idOrEl === 'string' ? document.querySelector(idOrEl) : idOrEl;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height };
      };
      return {
        coin: rectSel('#gameHud .hud-coin-badge'),
        score: rectSel('#gameHud .score-container'),
        pause: rectSel('#ffPauseBtn'),
        ability: rectSel('#ffAbilityHud'),
        fever: rectSel('#gameHud .fever-bar-container')
      };
    })(),
    hudValues: {
      coins: document.getElementById('runCoins')?.textContent?.trim() || '',
      score: document.getElementById('scoreValue')?.textContent?.trim() || '',
      stage: document.getElementById('stageName')?.textContent?.trim() || '',
      feverWidth: document.getElementById('feverFill')?.getBoundingClientRect()?.width || 0,
      feverVisible: visible(document.querySelector('#gameHud .fever-bar-container'))
    },
    storeBalanceStyle: (() => {
      const el = document.querySelector('#shopScreen .ff-store-balance');
      if (!el) return null;
      const st = getComputedStyle(el);
      return { display: st.display, fontFamily: st.fontFamily, borderRadius: st.borderRadius };
    })(),
    gameState: window.game?.state || null,
    currentWorld: window.game?.currentWorldIndex ?? null,
    splashPresent: !!document.getElementById('ffApprovedBootSplash'),
    toast: document.getElementById('gameToast')?.textContent || ''
  };
});

try {
  await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForFunction(() => window.__FF_RUNTIME_APPROVED_STACK__ === true && window.__FF_MENU_UI_READY__ === true, null, { timeout: 70_000 });
  await page.waitForFunction(() => !document.getElementById('ffApprovedBootSplash'), null, { timeout: 10_000 });
  await page.waitForFunction(() => {
    const visible = el => {
      if (!el || el.classList.contains('hidden')) return false;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) <= 0.01) return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    return visible(document.getElementById('startScreen')) &&
      visible(document.querySelector('#startScreen .ff-main-logo')) &&
      visible(document.getElementById('worldCard')) &&
      visible(document.getElementById('startStoryBtn'));
  }, null, { timeout: 5_000 });

  const menu = await readState();
  const badMenu = !menu.startVisible || !menu.startActive || !menu.logoVisible || !menu.worldCardVisible || !menu.playVisible || menu.playDisabled ||
    !menu.worldThumb?.includes('world-1.webp') || !menu.worldKicker || !menu.coinIcon || !menu.birdButton || !menu.previewInk || menu.pauseVisible;
  if (badMenu) throw new Error(`Main menu contract failed: ${JSON.stringify(menu)}`);
  const worldPlayGap = (menu.menuRects?.play?.top ?? 0) - (menu.menuRects?.card?.bottom ?? 0);
  if (worldPlayGap < 10) throw new Error(`World/PLAY spacing collapsed (${worldPlayGap}px): ${JSON.stringify(menu.menuRects)}`);
  if (menu.storeBalanceStyle?.display !== 'flex' || !/Press Start 2P/i.test(menu.storeBalanceStyle?.fontFamily || '')) {
    throw new Error(`Store coin balance identity is incomplete: ${JSON.stringify(menu.storeBalanceStyle)}`);
  }

  await page.locator('#startStoryBtn').click({ timeout: 5_000 });
  await page.waitForFunction(() => ['STORY','LAUNCH','PLAYING'].includes(window.game?.state), null, { timeout: 10_000 });

  if (await page.evaluate(() => window.game?.state === 'STORY')) {
    const canvas = page.locator('#gameCanvas');
    await canvas.click({ position: { x: 220, y: 320 }, timeout: 5_000 });
    await page.waitForTimeout(120);
    await canvas.click({ position: { x: 220, y: 320 }, timeout: 5_000 });
  }

  await page.waitForFunction(() => window.game?.state === 'PLAYING', null, { timeout: 12_000 });
  await page.waitForFunction(() => {
    const btn = document.getElementById('ffPauseBtn');
    const hud = document.getElementById('gameHud');
    return !!btn && !!hud && !hud.classList.contains('hidden') && btn.classList.contains('show') && getComputedStyle(btn).display !== 'none';
  }, null, { timeout: 8_000 });

  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  await page.waitForTimeout(120);
  const afterPlay = await readState();
  if (afterPlay.startActive || afterPlay.gameState === 'MENU') throw new Error(`PLAY did not leave menu: ${JSON.stringify(afterPlay)}`);
  if (!afterPlay.pauseButtonVisible) throw new Error(`Pause button is missing after PLAY: ${JSON.stringify(afterPlay)}`);
  if (!afterPlay.hudValues?.feverVisible) throw new Error(`Fever bar is missing during gameplay: ${JSON.stringify(afterPlay.hudValues)}`);

  const { coin, score, pause, ability, fever } = afterPlay.hudLayout || {};
  if (!coin || !score || !pause) throw new Error(`HUD row is incomplete: ${JSON.stringify(afterPlay.hudLayout)}`);
  const topDelta = Math.max(coin.top, score.top, pause.top) - Math.min(coin.top, score.top, pause.top);
  if (!(coin.right < score.left && score.right < pause.left) || topDelta > 16) {
    throw new Error(`HUD row alignment failed: ${JSON.stringify(afterPlay.hudLayout)}`);
  }
  if (ability && ability.top < Math.max(coin.bottom, score.bottom, pause.bottom) - 2) {
    throw new Error(`Ability chip overlaps top HUD: ${JSON.stringify(afterPlay.hudLayout)}`);
  }
  if (!fever || fever.top < Math.max(coin.bottom, score.bottom, pause.bottom) + 12) {
    throw new Error(`Fever bar overlaps or is missing below top HUD: ${JSON.stringify(afterPlay.hudLayout)}`);
  }

  const savedSkin = await page.evaluate(() => window.game?.activeSkin);
  await page.evaluate(() => { window.game.activeSkin = 'king'; });
  await page.waitForFunction(() => {
    const ability = document.getElementById('ffAbilityHud');
    return !!ability && !ability.classList.contains('ff-hidden') && getComputedStyle(ability).display !== 'none';
  }, null, { timeout: 3_000 });
  const royalLayout = await readState();
  const royalAbility = royalLayout.hudLayout?.ability;
  const royalFever = royalLayout.hudLayout?.fever;
  if (!royalAbility || !royalFever || royalAbility.top < royalFever.bottom + 5) {
    throw new Error(`Approved Fever/Royal Fortune order failed: ${JSON.stringify(royalLayout.hudLayout)}`);
  }
  await page.evaluate(skin => { window.game.activeSkin = skin; }, savedSkin);

  await page.locator('#ffPauseBtn').click({ timeout: 5_000 });
  await page.waitForFunction(() => document.getElementById('ffPauseOverlay')?.classList.contains('show'), null, { timeout: 5_000 });
  const paused = await readState();
  if (!paused.pauseVisible) throw new Error(`Pause overlay did not open: ${JSON.stringify(paused)}`);

  const frozenBefore = await page.evaluate(() => ({
    y: Number(window.game?.bird?.y ?? NaN),
    velocity: Number(window.game?.bird?.velocity ?? NaN),
    score: Number(window.game?.score ?? NaN),
    frame: Number(window.game?.frame ?? NaN)
  }));
  await page.waitForTimeout(650);
  const frozenAfter = await page.evaluate(() => ({
    y: Number(window.game?.bird?.y ?? NaN),
    velocity: Number(window.game?.bird?.velocity ?? NaN),
    score: Number(window.game?.score ?? NaN),
    frame: Number(window.game?.frame ?? NaN)
  }));
  const finiteMotion = Number.isFinite(frozenBefore.y) && Number.isFinite(frozenAfter.y) && Number.isFinite(frozenBefore.velocity) && Number.isFinite(frozenAfter.velocity);
  if (!finiteMotion || Math.abs(frozenAfter.y - frozenBefore.y) > 0.01 || Math.abs(frozenAfter.velocity - frozenBefore.velocity) > 0.01 || frozenAfter.score !== frozenBefore.score) {
    throw new Error(`Pause did not freeze simulation: ${JSON.stringify({ frozenBefore, frozenAfter })}`);
  }

  const savedHudState = await page.evaluate(() => ({
    score: window.game?.score, sessionCoins: window.game?.sessionCoins, fever: window.game?.fever, feverActive: window.game?.feverActive, feverTimer: window.game?.feverTimer
  }));
  await page.evaluate(() => {
    window.game.score = 7;
    window.game.sessionCoins = 3;
    window.game.feverActive = false;
    window.game.feverTimer = 0;
    window.game.fever = 50;
  });
  await page.waitForFunction(() => {
    const coins = document.getElementById('runCoins')?.textContent?.trim();
    const score = document.getElementById('scoreValue')?.textContent?.trim();
    const fever = document.getElementById('feverFill')?.getBoundingClientRect()?.width || 0;
    return coins === '3' && score === '7' && fever > 2;
  }, null, { timeout: 3_000 });
  const bridged = await readState();
  if (bridged.hudValues?.coins !== '3' || bridged.hudValues?.score !== '7' || !bridged.hudValues?.feverVisible || bridged.hudValues?.feverWidth <= 2) {
    throw new Error(`Visible HUD data bridge failed: ${JSON.stringify(bridged.hudValues)}`);
  }
  await page.evaluate(saved => Object.assign(window.game, saved), savedHudState);

  const resume = page.locator('#ffPauseOverlay [data-action="resume"]');
  if (await resume.count()) {
    await resume.click({ timeout: 5_000 });
    await page.waitForFunction(() => !document.getElementById('ffPauseOverlay')?.classList.contains('show'), null, { timeout: 5_000 });
  }

  const criticalEvents = events.filter(e => e.type === 'pageerror' || e.type === 'requestfailed' || /approved runtime boot failed|clean stable runtime failed|post-runtime UI boot failed/i.test(e.text));
  if (criticalEvents.length) throw new Error(`Critical browser events: ${JSON.stringify(criticalEvents.slice(-20))}`);

  const report = { ok: true, browser: ENGINE, url: url.href, menu, afterPlay, events };
  fs.writeFileSync(path.join(OUT, 'state.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const state = await readState().catch(() => null);
  await page.screenshot({ path: path.join(OUT, 'failure.png'), fullPage: true }).catch(() => {});
  const report = { ok: false, browser: ENGINE, url: url.href, error: error?.stack || String(error), state, events };
  fs.writeFileSync(path.join(OUT, 'state.json'), JSON.stringify(report, null, 2));
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
}

await context.close().catch(() => {});
await browser.close().catch(() => {});
