import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.FF_LIVE_URL || 'https://aseel90.github.io/FeatherFury-LaB/';
const SHA = process.env.FF_VERIFY_SHA || 'manual';
const OUT = process.env.FF_SMOKE_OUT || 'artifacts/live-smoke';
fs.mkdirSync(OUT, { recursive: true });

const url = new URL(BASE);
url.searchParams.set('ui', 'world-v1');
url.searchParams.set('ffverify', `${SHA}-${Date.now()}`);

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  extraHTTPHeaders: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
});
const page = await context.newPage();
const events = [];
const origin = new URL(BASE).origin;

page.on('console', msg => {
  if (msg.type() === 'error' || msg.type() === 'warning') events.push({ type: `console:${msg.type()}`, text: msg.text() });
});
page.on('pageerror', err => events.push({ type: 'pageerror', text: err?.stack || String(err) }));
page.on('requestfailed', req => {
  if (req.url().startsWith(origin)) events.push({ type: 'requestfailed', text: `${req.url()} :: ${req.failure()?.errorText || 'unknown'}` });
});

const readState = () => page.evaluate(() => {
  const visible = el => !!el && !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
  const preview = document.getElementById('previewBirdCanvas');
  let previewInk = false;
  try {
    const ctx = preview?.getContext('2d', { willReadFrequently: true });
    const data = ctx?.getImageData(0, 0, preview.width, preview.height)?.data || [];
    for (let i = 3; i < data.length; i += 4) { if (data[i] > 8) { previewInk = true; break; } }
  } catch (_) { previewInk = !!preview; }
  const thumb = document.querySelector('#worldCard .ff-world-thumb');
  return {
    runtimeReady: window.__FF_RUNTIME_APPROVED_STACK__ === true,
    menuReady: window.__FF_MENU_UI_READY__ === true,
    runtimeBooting: window.__FF_PATCH_BOOTING__,
    runtimeMap: window.__FF_RUNTIME_MAP__?.version || null,
    menuError: window.__FF_MENU_UI_ERROR__ || null,
    startVisible: visible(document.getElementById('startScreen')),
    startActive: document.getElementById('startScreen')?.classList.contains('active') || false,
    playVisible: visible(document.getElementById('startStoryBtn')),
    playDisabled: document.getElementById('startStoryBtn')?.disabled ?? null,
    worldThumb: thumb ? getComputedStyle(thumb).backgroundImage : null,
    worldKicker: document.querySelector('#worldCard .ff-world-kicker')?.textContent || null,
    coinIcon: !!document.querySelector('#startScreen .ff-coin-icon'),
    birdButton: !!document.querySelector('#startScreen .ff-bird-avatar-btn'),
    previewInk,
    pauseVisible: document.getElementById('ffPauseOverlay')?.classList.contains('show') || false,
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

  const menu = await readState();
  const badMenu = !menu.startVisible || !menu.startActive || !menu.playVisible || menu.playDisabled ||
    !menu.worldThumb?.includes('world-1.webp') || !menu.worldKicker || !menu.coinIcon || !menu.birdButton || !menu.previewInk || menu.pauseVisible;
  if (badMenu) throw new Error(`Main menu contract failed: ${JSON.stringify(menu)}`);

  await page.locator('#startStoryBtn').click({ timeout: 5_000 });
  await page.waitForFunction(() => ['STORY','PLAYING'].includes(window.game?.state), null, { timeout: 10_000 });
  const afterPlay = await readState();
  if (afterPlay.startActive || afterPlay.gameState === 'MENU') throw new Error(`PLAY did not leave menu: ${JSON.stringify(afterPlay)}`);

  const criticalEvents = events.filter(e => e.type === 'pageerror' || e.type === 'requestfailed' || /approved runtime boot failed|clean stable runtime failed|post-runtime UI boot failed/i.test(e.text));
  if (criticalEvents.length) throw new Error(`Critical browser events: ${JSON.stringify(criticalEvents.slice(-20))}`);

  const report = { ok: true, url: url.href, menu, afterPlay, events };
  fs.writeFileSync(path.join(OUT, 'state.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const state = await readState().catch(() => null);
  await page.screenshot({ path: path.join(OUT, 'failure.png'), fullPage: true }).catch(() => {});
  const report = { ok: false, url: url.href, error: error?.stack || String(error), state, events };
  fs.writeFileSync(path.join(OUT, 'state.json'), JSON.stringify(report, null, 2));
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
