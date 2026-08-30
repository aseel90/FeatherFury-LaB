(() => {
  'use strict';
  if (window.__FF_ECONOMY_V1__) return;

  const HEROES = Object.freeze({
    classic: Object.freeze({ price: 0, purchasable: false, unlock: 'starter' }),
    pigeon: Object.freeze({ price: 30, purchasable: true, unlock: 'coins' }),
    falcon: Object.freeze({ price: 55, purchasable: true, unlock: 'coins' }),
    cyber: Object.freeze({ price: 90, purchasable: true, unlock: 'coins' }),
    ghost: Object.freeze({ price: 120, purchasable: true, unlock: 'coins' }),
    king: Object.freeze({ price: 180, purchasable: true, unlock: 'coins', bonusEvery: 3 }),
    eagle: Object.freeze({ price: null, purchasable: false, unlock: 'world2' }),
    phoenix: Object.freeze({ price: null, purchasable: false, unlock: 'world3' })
  });

  const REVIVE = Object.freeze({
    coinCosts: Object.freeze([8, 18]),
    maxPerRun: 2,
    rewardedAdEnabled: false,
    consumableEnabled: false
  });

  const FEATURES = Object.freeze({
    consumablesEnabled: false,
    rewardedReviveEnabled: false
  });

  const api = Object.freeze({
    version: 'economy-v1.0',
    heroes: HEROES,
    revive: REVIVE,
    features: FEATURES,
    heroPrice(key) {
      const entry = HEROES[key];
      return entry && Number.isFinite(entry.price) ? entry.price : null;
    },
    canPurchaseHero(key) {
      return HEROES[key]?.purchasable === true;
    },
    reviveCost(index = 0) {
      const i = Math.max(0, Number(index) || 0);
      return Number.isFinite(REVIVE.coinCosts[i]) ? REVIVE.coinCosts[i] : null;
    }
  });

  // Apply economy values to the legacy runtime data without replacing its objects.
  // This keeps the current stable game/core behavior intact while making pricing centrally owned.
  try {
    if (typeof SKINS !== 'undefined') {
      for (const [key, entry] of Object.entries(HEROES)) {
        if (!SKINS[key]) continue;
        SKINS[key].ffPurchasable = entry.purchasable;
        SKINS[key].ffUnlock = entry.unlock;
        if (Number.isFinite(entry.price)) SKINS[key].price = entry.price;
      }
    }
  } catch (_) {}

  try {
    if (typeof CONFIG !== 'undefined') CONFIG.REVIVE_COST = REVIVE.coinCosts[0];
  } catch (_) {}

  window.FFEconomy = api;
  window.__FF_ECONOMY_V1__ = true;
  console.log('[FeatherFury] economy-v1.0-ready');
})();
