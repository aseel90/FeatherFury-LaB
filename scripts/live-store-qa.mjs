import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit } from 'playwright';

const BASE = process.env.FF_URL || 'https://aseel90.github.io/FeatherFury-LaB/';
const ENGINE = (process.env.FF_BROWSER || 'chromium').toLowerCase();
const SHA = process.env.FF_VERIFY_SHA || process.env.GITHUB_SHA || 'manual';
const OUT = path.resolve(process.env.FF_ARTIFACT_DIR || `artifacts/store-${ENGINE}`);
const VIEWPORTS = [
  { width: 360, height: 800, name: '360x800' },
  { width: 390, height: 844, name: '390x844' },
  { width: 412, height: 915, name: '412x915' }
];
fs.mkdirSync(OUT, { recursive: true });

const browserType = ENGINE === 'webkit' ? webkit : chromium;
const browser = await browserType.launch({ headless: true });
const results = [];

const rect = el => {
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity || 1) <= 0.01 || r.width <= 1 || r.height <= 1) return null;
  return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height };
};

try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: true,
      hasTouch: true,
      userAgent: ENGINE === 'webkit'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
        : undefined
    });
    await context.addInitScript(() => {
      try {
        if (sessionStorage.getItem('__ff_store_qa_seeded') !== '1') {
          localStorage.setItem('fh_lang', 'en');
          localStorage.setItem('fh_total_coins', '99999');
          localStorage.setItem('fh_unlocked_skins', '["classic"]');
          localStorage.setItem('fh_active_skin', 'classic');
          sessionStorage.setItem('__ff_store_qa_seeded', '1');
        }
      } catch (_) {}
    });
    const page = await context.newPage();
    const events = [];
    page.on('pageerror', err => events.push({ type:'pageerror', text:String(err) }));
    page.on('requestfailed', req => events.push({ type:'requestfailed', text:`${req.url()} :: ${req.failure()?.errorText || 'failed'}` }));
    page.on('console', msg => { if (msg.type() === 'error') events.push({ type:'console:error', text:msg.text() }); });

    const url = new URL(BASE);
    url.searchParams.set('ui', 'world-v1');
    url.searchParams.set('ffverify', `${SHA}-store-${ENGINE}-${vp.name}-${Date.now()}`);

    try {
      await page.goto(url.href, { waitUntil:'domcontentloaded', timeout:30_000 });
      await page.waitForFunction(() => window.__FF_RUNTIME_APPROVED_STACK__ === true && window.__FF_MENU_UI_READY__ === true, null, { timeout:70_000 });
      await page.waitForFunction(() => !document.getElementById('ffApprovedBootSplash'), null, { timeout:12_000 });
      await page.waitForFunction(() => !!window.FFStoreUI && !!window.game, null, { timeout:8_000 });

      await page.evaluate(() => window.FFStoreUI.open('shop'));
      await page.waitForFunction(() => {
        const s = document.getElementById('shopScreen');
        const p = document.querySelector('.ff-shop-panel');
        return !!s && s.classList.contains('active') && !s.classList.contains('hidden') && !!p && p.classList.contains('is-active');
      }, null, { timeout:8_000 });

      const layout = await page.evaluate(rectFn => {
        const rect = new Function('el', `return (${rectFn})(el)`);
        const screen = document.getElementById('shopScreen');
        const shell = screen?.querySelector('.ff-store-shell');
        const items = screen?.querySelector('.ff-store-items');
        const cards = [...(screen?.querySelectorAll('.ff-store-item-card') || [])].map(card => ({
          card: rect(card),
          button: rect(card.querySelector('.ff-store-buy')),
          disabled: !!card.querySelector('.ff-store-buy')?.disabled,
          price: card.querySelector('.ff-store-item-price span')?.textContent?.trim() || '',
          name: card.querySelector('h4')?.textContent?.trim() || ''
        }));
        return {
          viewport: { width: innerWidth, height: innerHeight },
          screen: rect(screen), shell: rect(shell), items: rect(items), cards,
          scroll: items ? { scrollHeight:items.scrollHeight, clientHeight:items.clientHeight, overflowY:getComputedStyle(items).overflowY } : null
        };
      }, rect.toString());

      if (!layout.screen || !layout.shell || !layout.items || !layout.cards.length) throw new Error(`Store structure missing: ${JSON.stringify(layout)}`);
      if (layout.shell.left < -1 || layout.shell.right > vp.width + 1 || layout.shell.top < -1 || layout.shell.bottom > vp.height + 1) {
        throw new Error(`Store shell escapes viewport ${vp.name}: ${JSON.stringify(layout.shell)}`);
      }
      for (const [i, entry] of layout.cards.entries()) {
        if (!entry.card || !entry.button) throw new Error(`Card/button hidden at ${vp.name} index ${i}: ${JSON.stringify(entry)}`);
        const c = entry.card, b = entry.button, eps = 1.25;
        if (b.left < c.left - eps || b.right > c.right + eps || b.top < c.top - eps || b.bottom > c.bottom + eps) {
          throw new Error(`Purchase button escapes card at ${vp.name} index ${i}: ${JSON.stringify(entry)}`);
        }
        if (b.height < 40 || b.width < 60) throw new Error(`Purchase button touch target too small at ${vp.name}: ${JSON.stringify(entry)}`);
        if (entry.disabled) throw new Error(`Seeded rich profile still has disabled purchase at ${vp.name}: ${JSON.stringify(entry)}`);
      }
      if (!['auto','scroll'].includes(layout.scroll?.overflowY)) throw new Error(`Store items do not preserve overflow behavior at ${vp.name}: ${JSON.stringify(layout.scroll)}`);

      const economyContract = await page.evaluate(() => ({
        version: window.FFEconomy?.version || null,
        prices: ['pigeon','falcon','cyber','ghost','king'].map(key => [key, window.FFEconomy?.heroPrice?.(key)]),
        rewards: ['eagle','phoenix'].map(key => [key, window.FFEconomy?.canPurchaseHero?.(key)]),
        reviveCosts: [...(window.FFEconomy?.revive?.coinCosts || [])],
        reviveMax: window.FFEconomy?.revive?.maxPerRun ?? null,
        kingBonusEvery: window.__FF_CHARACTER_ABILITIES_V2__?.constants?.kingBonusEvery ?? null
      }));
      const expectedPrices = [30,55,90,120,180];
      const visiblePrices = layout.cards.map(entry => Number(entry.price));
      if (economyContract.version !== 'economy-v1.0' || JSON.stringify(visiblePrices) !== JSON.stringify(expectedPrices)) {
        throw new Error(`Launch hero prices mismatch at ${vp.name}: ${JSON.stringify({economyContract,visiblePrices})}`);
      }
      if (layout.cards.some(entry => /Phoenix|Eagle/i.test(entry.name)) || economyContract.rewards.some(([,purchasable]) => purchasable !== false)) {
        throw new Error(`World reward heroes became coin-purchasable at ${vp.name}: ${JSON.stringify({economyContract,cards:layout.cards})}`);
      }
      if (JSON.stringify(economyContract.reviveCosts) !== JSON.stringify([8,18]) || economyContract.reviveMax !== 2 || economyContract.kingBonusEvery !== 3) {
        throw new Error(`Launch economy ability/revive contract mismatch at ${vp.name}: ${JSON.stringify(economyContract)}`);
      }

      const before = await page.evaluate(() => ({
        coins: window.game.totalCoins,
        active: window.game.activeSkin,
        unlocked: [...window.game.unlockedSkins]
      }));
      await page.locator('.ff-store-item-card .ff-store-buy').first().click({ timeout:5_000 });
      await page.waitForFunction(n => window.game?.unlockedSkins?.size > n, before.unlocked.length, { timeout:5_000 });

      const purchased = await page.evaluate(before => {
        const now = [...window.game.unlockedSkins];
        const key = now.find(k => !before.unlocked.includes(k));
        return {
          key,
          price: key && typeof SKINS !== 'undefined' ? Number(SKINS[key]?.price || 0) : 0,
          coins: window.game.totalCoins,
          active: window.game.activeSkin,
          unlocked: now,
          storedCoins: localStorage.getItem('fh_total_coins'),
          storedActive: localStorage.getItem('fh_active_skin'),
          storedUnlocked: localStorage.getItem('fh_unlocked_skins'),
          characterPanel: document.querySelector('.ff-characters-panel')?.classList.contains('is-active') || false
        };
      }, before);
      if (!purchased.key || !(purchased.price > 0)) throw new Error(`Purchase did not identify new skin at ${vp.name}: ${JSON.stringify(purchased)}`);
      if (purchased.coins !== before.coins - purchased.price || Number(purchased.storedCoins) !== purchased.coins) throw new Error(`Coin persistence failed at ${vp.name}: ${JSON.stringify({before,purchased})}`);
      if (purchased.active !== purchased.key || purchased.storedActive !== purchased.key || !purchased.characterPanel) throw new Error(`Purchased skin activation failed at ${vp.name}: ${JSON.stringify(purchased)}`);
      let parsedUnlocked = [];
      try { parsedUnlocked = JSON.parse(purchased.storedUnlocked || '[]'); } catch (_) {}
      if (!parsedUnlocked.includes(purchased.key)) throw new Error(`Unlocked skin not persisted at ${vp.name}: ${JSON.stringify(purchased)}`);

      await page.reload({ waitUntil:'domcontentloaded', timeout:30_000 });
      await page.waitForFunction(() => window.__FF_RUNTIME_APPROVED_STACK__ === true && window.__FF_MENU_UI_READY__ === true && !!window.game, null, { timeout:70_000 });
      const afterReload = await page.evaluate(() => ({
        coins: window.game.totalCoins,
        active: window.game.activeSkin,
        unlocked: [...window.game.unlockedSkins],
        storedCoins: localStorage.getItem('fh_total_coins'),
        storedActive: localStorage.getItem('fh_active_skin')
      }));
      if (afterReload.coins !== purchased.coins || afterReload.active !== purchased.key || !afterReload.unlocked.includes(purchased.key)) {
        throw new Error(`Purchase state lost after reload at ${vp.name}: ${JSON.stringify({purchased,afterReload})}`);
      }

      await page.evaluate(() => window.FFStoreUI.open('characters'));
      await page.waitForFunction(() => document.querySelector('.ff-characters-panel')?.classList.contains('is-active'), null, { timeout:6_000 });
      const activeCard = await page.evaluate(() => ({
        actionDisabled: !!document.querySelector('.ff-character-action')?.disabled,
        selectedBadge: document.querySelector('.ff-character-selected-badge')?.classList.contains('is-visible') || false
      }));
      if (!activeCard.actionDisabled || !activeCard.selectedBadge) throw new Error(`Character carousel did not reopen on active skin at ${vp.name}: ${JSON.stringify(activeCard)}`);
      await page.locator('.ff-character-prev').click({ timeout:5_000 });
      const selectReady = await page.evaluate(() => ({ disabled:!!document.querySelector('.ff-character-action')?.disabled, label:document.querySelector('.ff-character-action')?.textContent?.trim() || '' }));
      if (selectReady.disabled) throw new Error(`Cannot select alternate owned character at ${vp.name}: ${JSON.stringify(selectReady)}`);
      await page.locator('.ff-character-action').click({ timeout:5_000 });
      const selected = await page.evaluate(() => ({ active:window.game.activeSkin, stored:localStorage.getItem('fh_active_skin') }));
      if (!selected.active || selected.active === purchased.key || selected.stored !== selected.active) throw new Error(`Owned character selection did not persist at ${vp.name}: ${JSON.stringify(selected)}`);

      await page.reload({ waitUntil:'domcontentloaded', timeout:30_000 });
      await page.waitForFunction(() => window.__FF_RUNTIME_APPROVED_STACK__ === true && window.__FF_MENU_UI_READY__ === true && !!window.game, null, { timeout:70_000 });
      const selectedReload = await page.evaluate(() => ({ active:window.game.activeSkin, stored:localStorage.getItem('fh_active_skin'), coins:window.game.totalCoins }));
      if (selectedReload.active !== selected.active || selectedReload.stored !== selected.active || selectedReload.coins !== purchased.coins) {
        throw new Error(`Selected character or coins lost after second reload at ${vp.name}: ${JSON.stringify({selected,selectedReload})}`);
      }

      const reviveStart = await page.evaluate(() => {
        const g = window.game;
        g.totalCoins = 100;
        g.__ffReviveCount = 0;
        g.state = 'GAMEOVER';
        g.updateCoinDisplays?.();
        const btn = document.getElementById('reviveBtn');
        return {
          coins:g.totalCoins, count:g.__ffReviveCount, disabled:!!btn?.disabled,
          price:document.querySelector('#reviveBtn .revive-price')?.textContent?.trim() || '',
          configCost:window.CONFIG?.REVIVE_COST
        };
      });
      if (reviveStart.coins !== 100 || reviveStart.count !== 0 || reviveStart.disabled || reviveStart.configCost !== 8 || !/8/.test(reviveStart.price)) {
        throw new Error(`First revive contract failed at ${vp.name}: ${JSON.stringify(reviveStart)}`);
      }
      await page.evaluate(() => document.getElementById('reviveBtn')?.click());
      await page.waitForTimeout(460);
      const reviveSecond = await page.evaluate(() => {
        const g = window.game;
        g.state = 'GAMEOVER';
        g.updateCoinDisplays?.();
        const btn = document.getElementById('reviveBtn');
        return {
          coins:g.totalCoins, count:g.__ffReviveCount, disabled:!!btn?.disabled,
          price:document.querySelector('#reviveBtn .revive-price')?.textContent?.trim() || '',
          configCost:window.CONFIG?.REVIVE_COST
        };
      });
      if (reviveSecond.coins !== 92 || reviveSecond.count !== 1 || reviveSecond.disabled || reviveSecond.configCost !== 18 || !/18/.test(reviveSecond.price)) {
        throw new Error(`Second revive contract failed at ${vp.name}: ${JSON.stringify(reviveSecond)}`);
      }
      await page.evaluate(() => document.getElementById('reviveBtn')?.click());
      await page.waitForTimeout(460);
      const reviveMax = await page.evaluate(() => {
        const g = window.game;
        g.state = 'GAMEOVER';
        g.updateCoinDisplays?.();
        const btn = document.getElementById('reviveBtn');
        return {
          coins:g.totalCoins, count:g.__ffReviveCount, disabled:!!btn?.disabled,
          price:document.querySelector('#reviveBtn .revive-price')?.textContent?.trim() || '',
          configCost:window.CONFIG?.REVIVE_COST
        };
      });
      if (reviveMax.coins !== 74 || reviveMax.count !== 2 || !reviveMax.disabled || !/MAX/i.test(reviveMax.price)) {
        throw new Error(`Revive cap failed at ${vp.name}: ${JSON.stringify(reviveMax)}`);
      }
      const reviveReset = await page.evaluate(() => {
        const g = window.game;
        g.reset?.();
        g.updateCoinDisplays?.();
        return { count:g.__ffReviveCount, configCost:window.CONFIG?.REVIVE_COST };
      });
      if (reviveReset.count !== 0 || reviveReset.configCost !== 8) {
        throw new Error(`Revive reset failed at ${vp.name}: ${JSON.stringify(reviveReset)}`);
      }

      const critical = events.filter(e => e.type === 'pageerror' || e.type === 'requestfailed' || /approved runtime boot failed|clean stable runtime failed|post-runtime UI boot failed/i.test(e.text));
      if (critical.length) throw new Error(`Critical browser events at ${vp.name}: ${JSON.stringify(critical.slice(-12))}`);

      const report = { ok:true, viewport:vp, url:url.href, layout, economyContract, before, purchased, afterReload, selected, selectedReload, reviveStart, reviveSecond, reviveMax, reviveReset, events };
      results.push(report);
      fs.writeFileSync(path.join(OUT, `${vp.name}.json`), JSON.stringify(report, null, 2));
    } catch (error) {
      const report = { ok:false, viewport:vp, url:url.href, error:error?.stack || String(error), events };
      await page.screenshot({ path:path.join(OUT, `${vp.name}-failure.png`), fullPage:true }).catch(() => {});
      fs.writeFileSync(path.join(OUT, `${vp.name}.json`), JSON.stringify(report, null, 2));
      results.push(report);
      throw error;
    } finally {
      await context.close();
    }
  }

  const report = { ok:true, browser:ENGINE, sha:SHA, viewports:results };
  fs.writeFileSync(path.join(OUT, 'state.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const report = { ok:false, browser:ENGINE, sha:SHA, error:error?.stack || String(error), viewports:results };
  fs.writeFileSync(path.join(OUT, 'state.json'), JSON.stringify(report, null, 2));
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
