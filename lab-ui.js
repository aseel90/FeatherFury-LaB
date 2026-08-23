/* LAB UI / UX enhancement layer - isolated from core game logic */
(function () {
    'use strict';

    const bgByWorld = ['ruins', 'ice', 'storm', 'volcano'];
    const buttonIds = ['startBtn', 'endlessBtn', 'shopBtn', 'leaderboardBtn', 'settingsBtn', 'prevWorldBtn', 'nextWorldBtn'];
    let lastTouchEnd = 0;

    const DEBUG_KEY = 'ff_lab_debug_log_v1';
    const debugEntries = [];

    function debugLog(event, data = {}) {
        const entry = {
            t: new Date().toISOString(),
            event,
            data
        };
        debugEntries.push(entry);
        if (debugEntries.length > 120) debugEntries.shift();
        try {
            localStorage.setItem(DEBUG_KEY, JSON.stringify(debugEntries));
        } catch (_) {}
        console.log('[FF-LAB]', event, data);
        updateDebugPanel();
    }

    function getActiveScreenId() {
        return document.querySelector('.overlay-screen.active:not(.hidden)')?.id || 'none';
    }

    function setupDebugLogger() {
        try {
            const saved = JSON.parse(localStorage.getItem(DEBUG_KEY) || '[]');
            if (Array.isArray(saved)) debugEntries.push(...saved.slice(-80));
        } catch (_) {}

        window.addEventListener('error', e => {
            debugLog('js-error', {
                message: e.message,
                file: e.filename,
                line: e.lineno,
                col: e.colno
            });
        });
        window.addEventListener('unhandledrejection', e => {
            debugLog('unhandled-rejection', { reason: String(e.reason) });
        });
        document.addEventListener('click', e => {
            const target = e.target?.closest?.('button, [role="button"]');
            if (!target) return;
            debugLog('click', {
                id: target.id || null,
                text: (target.textContent || '').trim().slice(0, 50),
                screen: getActiveScreenId()
            });
            setTimeout(() => debugLog('screen-after-click', { screen: getActiveScreenId() }), 0);
        }, true);

        window.FF_DEBUG = {
            logs: () => [...debugEntries],
            clear: () => {
                debugEntries.length = 0;
                try { localStorage.removeItem(DEBUG_KEY); } catch (_) {}
                updateDebugPanel();
            },
            copy: async () => {
                const text = JSON.stringify(debugEntries, null, 2);
                try { await navigator.clipboard.writeText(text); } catch (_) {}
                return text;
            }
        };

        if (new URLSearchParams(location.search).get('debug') === '1') createDebugPanel();
        debugLog('debug-ready', { screen: getActiveScreenId() });
    }

    function createDebugPanel() {
        if (document.getElementById('ffDebugPanel')) return;
        const panel = document.createElement('details');
        panel.id = 'ffDebugPanel';
        panel.style.cssText = 'position:fixed;z-index:99999;left:8px;bottom:8px;width:min(92vw,430px);max-height:42vh;overflow:auto;background:#05080dcc;color:#d7f7ff;border:1px solid #36c8ff;border-radius:10px;padding:7px;font:11px/1.35 monospace;text-align:left;direction:ltr;';
        const summary = document.createElement('summary');
        summary.textContent = 'FF DEBUG';
        summary.style.cssText = 'cursor:pointer;font-weight:700;color:#61dcff';
        const pre = document.createElement('pre');
        pre.id = 'ffDebugText';
        pre.style.cssText = 'white-space:pre-wrap;margin:7px 0 0;';
        panel.append(summary, pre);
        document.body.appendChild(panel);
        updateDebugPanel();
    }

    function updateDebugPanel() {
        const pre = document.getElementById('ffDebugText');
        if (!pre) return;
        pre.textContent = debugEntries.slice(-18).map(x => `${x.t.slice(11,19)} ${x.event} ${JSON.stringify(x.data)}`).join('\n');
    }

    function stopZoom() {
        document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
        document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
        document.addEventListener('touchend', e => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) e.preventDefault();
            lastTouchEnd = now;
        }, { passive: false });
    }

    function currentGame() {
        return window.game || null;
    }

    function setupInstantMenuAudio(game) {
        if (!game?.sound) return;
        document.addEventListener('pointerdown', () => game.sound.init(), { capture: true, passive: true });
        const play = name => {
            const fn = game.sound?.[name];
            if (typeof fn === 'function') fn.call(game.sound);
        };
        ['shopBtnStart', 'shopBtnGameOver', 'leaderboardBtn'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => play('playUIOpen'));
        });
        ['closeShopBtn', 'closeLeaderboardBtn'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => play('playUIClose'));
        });
        document.getElementById('startStoryBtn')?.addEventListener('click', () => {
            const i = Number(game.currentWorldIndex || 0);
            const locked = (i === 1 && !game.w1Completed) || (i === 2 && !game.w2Completed) || i === 3;
            if (!locked) play('playUIStart');
        });
    }

    function applyMenuWorld(game) {
        const start = document.getElementById('startScreen');
        if (!start || !game) return;
        start.classList.remove('world-bg-ruins', 'world-bg-ice', 'world-bg-storm', 'world-bg-volcano');
        const rawWorldIndex = game.currentWorldIndex;
        const numericWorldIndex = Number.isFinite(Number(rawWorldIndex)) ? Number(rawWorldIndex) : 0;
        const index = Math.max(0, Math.min(bgByWorld.length - 1, numericWorldIndex));
        start.classList.add(`world-bg-${bgByWorld[index]}`);
        debugLog('world-sync', { currentWorldIndex: rawWorldIndex, appliedIndex: index, background: bgByWorld[index] });
        const prev = document.getElementById('prevWorldBtn');
        const next = document.getElementById('nextWorldBtn');
        if (prev) prev.disabled = index <= 0;
        if (next) next.disabled = index >= bgByWorld.length - 1;
        const status = document.getElementById('worldStatus');
        if (status && game.worlds?.[index]) {
            if (game.worlds[index].unlocked === false) {
                status.textContent = game.lang === 'ar' ? 'عالم مقفل' : 'Locked World';
            } else if (/locked|مقفل/i.test(status.textContent || '')) {
                status.textContent = game.lang === 'ar' ? 'جاهز للعب!' : 'Ready to play!';
            }
        }
    }

    function keyboardNav(game) {
        document.addEventListener('keydown', e => {
            const active = document.querySelector('.overlay-screen.active:not(.hidden)');
            if (!active) return;
            if (active.id === 'startScreen') {
                if (e.key === 'ArrowLeft') document.getElementById('prevWorldBtn')?.click();
                if (e.key === 'ArrowRight') document.getElementById('nextWorldBtn')?.click();
            }
            if (e.key === 'Escape' || e.key === 'Backspace') {
                if (active.id === 'settingsScreen') document.getElementById('settingsReturnBtn')?.click();
                if (active.id === 'shopScreen') document.getElementById('closeShopBtn')?.click();
                if (active.id === 'leaderboardScreen') document.getElementById('closeLeaderboardBtn')?.click();
            }
        });
    }

    function addPanelClasses() {
        const settings = document.getElementById('settingsScreen');
        const leaderboard = document.getElementById('leaderboardScreen');
        const shop = document.getElementById('shopScreen');
        settings?.classList.add('lab-game-panel', 'lab-settings-panel');
        leaderboard?.classList.add('lab-game-panel', 'lab-leaderboard-panel');
        shop?.classList.add('lab-game-panel', 'lab-shop-panel');
    }

    function decorateSettings() {
        const screen = document.getElementById('settingsScreen');
        if (!screen) return;
        const heading = screen.querySelector('h2, .settings-title');
        if (heading) heading.classList.add('lab-panel-title');
        const returnBtn = document.getElementById('settingsReturnBtn');
        returnBtn?.classList.add('lab-return-btn');
        const rows = screen.querySelectorAll('.settings-row, .setting-row');
        rows.forEach(row => row.classList.add('lab-setting-row'));
        const controls = screen.querySelectorAll('button:not(#settingsReturnBtn), select');
        controls.forEach(el => el.classList.add('lab-setting-control'));
    }

    function drawSkinPreview(game, canvas, skinId) {
        if (!canvas || !game) return;
        try {
            if (typeof game.drawBirdPreview === 'function') {
                game.drawBirdPreview(canvas, skinId);
                return;
            }
        } catch (_) {}
    }

    function createCoinMark() {
        const mark = document.createElement('span');
        mark.className = 'lab-coin-mark';
        return mark;
    }

    function rebuildShop(game) {
        const grid = document.getElementById('shopGrid');
        if (!grid || !game?.skins) return;
        grid.classList.add('lab-shop-grid');
        grid.innerHTML = '';
        const owned = Array.isArray(game.ownedSkins) ? game.ownedSkins : [];
        const active = game.activeSkin;
        const coins = Number(game.coins || 0);

        game.skins.forEach((skin, index) => {
            const id = skin.id || `skin-${index}`;
            const isOwned = index === 0 || owned.includes(id);
            const isEquipped = active === id;
            const price = Number(skin.price || 0);

            const card = document.createElement('article');
            card.className = 'lab-shop-card';
            if (isEquipped) card.classList.add('is-equipped');

            const preview = document.createElement('div');
            preview.className = 'lab-shop-preview';
            const canvas = document.createElement('canvas');
            canvas.width = 72;
            canvas.height = 72;
            preview.appendChild(canvas);
            drawSkinPreview(game, canvas, id);

            const name = document.createElement('div');
            name.className = 'lab-shop-name';
            name.textContent = skin.name || id;

            const meta = document.createElement('div');
            meta.className = 'lab-shop-meta';
            if (isEquipped) {
                meta.textContent = 'ACTIVE HERO';
                meta.classList.add('is-active');
            } else if (isOwned) {
                meta.textContent = 'OWNED';
            } else {
                const amount = document.createElement('span');
                amount.textContent = price;
                meta.append(amount, createCoinMark());
            }

            const action = document.createElement('button');
            action.type = 'button';
            action.className = 'lab-shop-action';
            if (isEquipped) {
                action.textContent = 'Equipped';
                action.disabled = true;
                action.classList.add('equipped');
            } else if (isOwned) {
                action.textContent = 'Equip';
                action.classList.add('equip');
                action.onclick = () => {
                    if (typeof game.selectSkin === 'function') game.selectSkin(id);
                    else {
                        game.activeSkin = id;
                        try { localStorage.setItem('ff_active_skin', id); } catch (_) {}
                    }
                    rebuildShop(game);
                };
            } else {
                action.textContent = 'Buy';
                const canAfford = coins >= price;
                action.disabled = !canAfford;
                if (!canAfford) action.classList.add('cant-afford');
                action.onclick = () => {
                    if (action.disabled) return;
                    if (typeof game.buySkin === 'function') game.buySkin(id);
                    rebuildShop(game);
                };
            }

            card.append(preview, name, meta, action);
            grid.appendChild(card);
        });
    }

    function setupShop(game) {
        const shopButtons = [
            document.getElementById('shopBtnStart'),
            document.getElementById('shopBtnGameOver')
        ].filter(Boolean);
        const screen = document.getElementById('shopScreen');
        const back = document.getElementById('closeShopBtn');
        const grid = document.getElementById('skinsGrid');
        if (!shopButtons.length || !screen || !back || !grid) {
            debugLog('shop-bind-failed', {
                buttons: shopButtons.length,
                screen: !!screen,
                back: !!back,
                grid: !!grid
            });
            return;
        }

        const heading = screen.querySelector('h2, .shop-title');
        heading?.classList.add('lab-panel-title');
        back.classList.add('lab-return-btn');
        grid.classList.add('lab-shop-grid');

        shopButtons.forEach(btn => {
            btn.classList.add('lab-game-button');
            btn.addEventListener('click', () => {
                debugLog('shop-open', { source: btn.id, world: game.currentWorldIndex });
                requestAnimationFrame(() => {
                    screen.classList.add('lab-shop-panel');
                    grid.classList.add('lab-shop-grid');
                    decorateExistingShop(grid);
                });
            });
        });

        back.addEventListener('click', () => {
            debugLog('shop-close', { world: game.currentWorldIndex });
        });
    }

    function decorateExistingShop(grid) {
        const cards = [...grid.children];
        cards.forEach(card => {
            card.classList.add('lab-shop-card');
            const button = card.querySelector('button');
            if (button) button.classList.add('lab-shop-action');
        });
        debugLog('shop-rendered', { cards: cards.length });
    }

    function rebuildLeaderboard(game) {
        const list = document.getElementById('leaderboardList');
        if (!list) return;
        const names = ['SkyWalker', 'Birdy', 'Faker', 'ProGamer', 'NoobMaster', 'IceKing', 'Feather', 'Glider', 'Ninja', 'Ghost'];
        const scoreTiers = [511, 438, 372, 309, 254];
        const usedNames = new Set();
        const players = scoreTiers.map((baseScore) => {
            let baseName;
            do {
                baseName = names[Math.floor(Math.random() * names.length)];
            } while (usedNames.has(baseName));
            usedNames.add(baseName);
            return {
                name: baseName + Math.floor(Math.random() * 99),
                score: baseScore - Math.floor(Math.random() * 18)
            };
        });
        const you = (typeof I18N !== 'undefined' && I18N[game.lang]?.you)
            ? I18N[game.lang].you
            : (game.lang === 'ar' ? 'أنت' : 'You');
        players.push({ name: you, score: Number(game.highScore || 0), you: true });
        players.sort((a, b) => b.score - a.score);

        list.innerHTML = '';
        players.forEach((p, index) => {
            const row = document.createElement('li');
            row.className = `leaderboard-row rank-${index + 1}${p.you ? ' is-you' : ''}`;

            const player = document.createElement('div');
            player.className = 'leaderboard-player';
            const rank = document.createElement('span');
            rank.className = 'leaderboard-rank';
            rank.textContent = `#${index + 1}`;
            const name = document.createElement('span');
            name.className = 'leaderboard-name';
            name.textContent = p.name;
            player.append(rank, name);

            const score = document.createElement('span');
            score.className = 'leaderboard-score';
            score.textContent = p.score;
            row.append(player, score);
            list.appendChild(row);
        });
    }

    function setupLeaderboard(game) {
        const open = document.getElementById('leaderboardBtn');
        const close = document.getElementById('closeLeaderboardBtn');
        const screen = document.getElementById('leaderboardScreen');
        if (!open || !close || !screen) return;
        const heading = screen.querySelector('h2, .leaderboard-title');
        heading?.classList.add('lab-panel-title');
        close.classList.add('lab-close-btn');
        open.onclick = () => {
            rebuildLeaderboard(game);
            screen.classList.remove('hidden');
            screen.classList.add('active');
            requestAnimationFrame(() => close.focus({ preventScroll: true }));
        };
        close.onclick = () => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
            open.focus({ preventScroll: true });
        };
    }

    function setupSettings(game) {
        const open = document.getElementById('settingsBtn');
        const screen = document.getElementById('settingsScreen');
        const back = document.getElementById('settingsReturnBtn');
        if (!open || !screen || !back) return;
        open.addEventListener('click', () => requestAnimationFrame(() => {
            decorateSettings();
            back.focus({ preventScroll: true });
        }));
    }

    function hookCarousel(game) {
        if (!game || game.__labCarouselHooked || typeof game.updateCarousel !== 'function') return;
        const original = game.updateCarousel.bind(game);
        game.updateCarousel = function (...args) {
            const result = original(...args);
            applyMenuWorld(game);
            return result;
        };
        game.__labCarouselHooked = true;
    }

    function polishStaticButtons() {
        buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.add('lab-game-button');
        });
    }

    function init(game) {
        setupDebugLogger();
        debugLog('lab-init', { world: game.currentWorldIndex, screen: getActiveScreenId() });
        setupInstantMenuAudio(game);
        stopZoom();
        addPanelClasses();
        polishStaticButtons();
        decorateSettings();
        setupSettings(game);
        setupShop(game);
        setupLeaderboard(game);
        hookCarousel(game);
        applyMenuWorld(game);
        keyboardNav(game);
    }

    function boot() {
        let tries = 0;
        const timer = setInterval(() => {
            const game = currentGame();
            if (game) {
                clearInterval(timer);
                init(game);
            } else if (++tries > 100) {
                console.error('[FF-LAB] Game boot timeout');
                clearInterval(timer);
            }
        }, 100);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
})();
