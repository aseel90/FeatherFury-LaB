import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit } from 'playwright';

const BASE = process.env.FF_URL || 'https://aseel90.github.io/FeatherFury-LaB/';
const ENGINE = (process.env.FF_BROWSER || 'chromium').toLowerCase();
const SHA = process.env.FF_VERIFY_SHA || process.env.GITHUB_SHA || 'manual';
const OUT = path.resolve(process.env.FF_ARTIFACT_DIR || `artifacts/worlds-${ENGINE}`);
fs.mkdirSync(OUT, { recursive: true });

const browserType = ENGINE === 'webkit' ? webkit : chromium;
const browser = await browserType.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  userAgent: ENGINE === 'webkit'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    : undefined
});
const page = await context.newPage();
const events = [];
page.on('pageerror', err => events.push({ type: 'pageerror', text: String(err) }));
page.on('requestfailed', req => events.push({ type: 'requestfailed', text: `${req.url()} :: ${req.failure()?.errorText || 'failed'}` }));
page.on('console', msg => { if (msg.type() === 'error') events.push({ type: 'console:error', text: msg.text() }); });

const specs = [
  { world: 0, name: 'World 1', boss: 'crow', marker: '__bossFightCoreV1Installed' },
  { world: 1, name: 'World 2', boss: 'penguin', marker: '__w2BossRuntimeV10Installed' },
  { world: 2, name: 'World 3', boss: 'thunderbird', marker: '__w3BossV1Installed' }
];

const url = new URL(BASE);
url.searchParams.set('ui', 'world-v1');
url.searchParams.set('ffverify', `${SHA}-worlds-${ENGINE}-${Date.now()}`);
const results = [];

try {
  await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForFunction(() => window.__FF_RUNTIME_APPROVED_STACK__ === true && window.__FF_MENU_UI_READY__ === true, null, { timeout: 70_000 });
  await page.waitForFunction(() => !document.getElementById('ffApprovedBootSplash'), null, { timeout: 12_000 });

  for (const spec of specs) {
    await page.evaluate(world => {
      const g = window.game;
      if (!g || !window.__FF_UI_NAV__) throw new Error('Navigation/runtime unavailable');
      g.w1Completed = true;
      g.w2Completed = true;
      window.__FF_UI_NAV__.goMain(world);
      g.currentWorldIndex = world;
      g.updateCarousel?.();
      window.__FF_WORLD_SELECT_V1__?.apply?.();
    }, spec.world);

    await page.waitForFunction(world => {
      const start = document.getElementById('startStoryBtn');
      return window.game?.state === 'MENU' && window.game?.currentWorldIndex === world && !!start && !start.disabled;
    }, spec.world, { timeout: 8_000 });

    const menu = await page.evaluate(spec => ({
      index: window.game?.currentWorldIndex,
      kicker: document.querySelector('#worldCard .ff-world-kicker')?.textContent?.trim() || '',
      marker: !!window.game?.[spec.marker],
      startDisabled: !!document.getElementById('startStoryBtn')?.disabled
    }), spec);
    if (menu.index !== spec.world || menu.startDisabled || !menu.marker) {
      throw new Error(`${spec.name} menu/runtime contract failed: ${JSON.stringify(menu)}`);
    }

    await page.evaluate(() => document.getElementById('startStoryBtn')?.click());
    await page.waitForFunction(() => ['STORY', 'LAUNCH', 'PLAYING'].includes(window.game?.state), null, { timeout: 8_000 });

    const canvas = page.locator('#gameCanvas');
    for (let i = 0; i < 8 && await page.evaluate(() => window.game?.state !== 'PLAYING'); i++) {
      if (await page.evaluate(() => window.game?.state === 'STORY')) {
        await canvas.click({ position: { x: 220, y: 320 }, timeout: 5_000 });
      }
      await page.waitForTimeout(180);
    }

    await page.waitForFunction(world => window.game?.state === 'PLAYING' && window.game?.activeWorld === world, spec.world, { timeout: 14_000 });
    await page.waitForFunction(() => {
      const pause = document.getElementById('ffPauseBtn');
      const hud = document.getElementById('gameHud');
      return !!pause && pause.classList.contains('show') && !!hud && !hud.classList.contains('hidden');
    }, null, { timeout: 6_000 });

    const playing = await page.evaluate(spec => ({
      state: window.game?.state,
      activeWorld: window.game?.activeWorld,
      marker: !!window.game?.[spec.marker],
      pause: document.getElementById('ffPauseBtn')?.classList.contains('show') || false,
      stage: document.getElementById('stageName')?.textContent?.trim() || document.getElementById('stageDisplay')?.textContent?.trim() || ''
    }), spec);
    if (playing.state !== 'PLAYING' || playing.activeWorld !== spec.world || !playing.marker || !playing.pause || !playing.stage) {
      throw new Error(`${spec.name} PLAY contract failed: ${JSON.stringify(playing)}`);
    }

    const boss = await page.evaluate(spec => {
      const g = window.game;
      g.invincibleTimer = 9999;
      let error = null;
      try { g.activateBoss?.(); } catch (e) { error = String(e); }
      return {
        error,
        type: g.boss?.type || null,
        active: !!g.boss?.active,
        hp: Number(g.boss?.hp || 0),
        state: g.state,
        marker: !!g?.[spec.marker]
      };
    }, spec);
    if (boss.error || !boss.active || boss.type !== spec.boss || !(boss.hp > 0) || !boss.marker) {
      throw new Error(`${spec.name} boss contract failed: ${JSON.stringify(boss)}`);
    }

    results.push({ spec, menu, playing, boss });
    await page.evaluate(() => window.__FF_UI_NAV__?.goMain?.(0));
    await page.waitForFunction(() => window.game?.state === 'MENU', null, { timeout: 6_000 });
  }

  const critical = events.filter(e => e.type === 'pageerror' || e.type === 'requestfailed' || /approved runtime boot failed|clean stable runtime failed|post-runtime UI boot failed/i.test(e.text));
  if (critical.length) throw new Error(`Critical browser events: ${JSON.stringify(critical.slice(-12))}`);

  const report = { ok: true, browser: ENGINE, sha: SHA, url: url.href, results, events };
  fs.writeFileSync(path.join(OUT, 'state.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const report = { ok: false, browser: ENGINE, sha: SHA, url: url.href, error: error?.stack || String(error), results, events };
  await page.screenshot({ path: path.join(OUT, 'failure.png'), fullPage: true }).catch(() => {});
  fs.writeFileSync(path.join(OUT, 'state.json'), JSON.stringify(report, null, 2));
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
