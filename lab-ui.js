(() => {
    const DEBUG_KEY = 'ff_lab_debug_log_v1';
    const debugEntries = [];

    function debugLog(event, data = {}) {
        const entry = { t: new Date().toISOString(), event, data };
        debugEntries.push(entry);
        if (debugEntries.length > 120) debugEntries.shift();
        try { localStorage.setItem(DEBUG_KEY, JSON.stringify(debugEntries)); } catch (_) {}
        console.log('[FF-LAB]', event, data);
        updateDebugPanel();
    }

    function loadSavedDebug() {
        try {
            const saved = JSON.parse(localStorage.getItem(DEBUG_KEY) || '[]');
            if (Array.isArray(saved)) debugEntries.push(...saved.slice(-80));
        } catch (_) {}
    }

    function setupDebugLogger() {
        if (window.__ffLabDebugReady) return;
        window.__ffLabDebugReady = true;
        loadSavedDebug();
        window.addEventListener('error', e => debugLog('js-error', { message: e.message, file: e.filename, line: e.lineno, col: e.colno }));
        window.addEventListener('unhandledrejection', e => debugLog('unhandled-rejection', { reason: String(e.reason) }));
        document.addEventListener('click', e => {
            const target = e.target?.closest?.('button, [role="button"]');
            if (!target) return;
            debugLog('click', { id: target.id || null, text: (target.textContent || '').trim().slice(0, 50), screen: getActiveScreenId() });
            setTimeout(() => debugLog('screen-after-click', { screen: getActiveScreenId() }), 0);
        }, true);

        window.FF_DEBUG = {
            logs: () => [...debugEntries],
            clear: () => { debugEntries.length = 0; try { localStorage.removeItem(DEBUG_KEY); } catch (_) {} updateDebugPanel(); },
            copy: async () => { const text = JSON.stringify(debugEntries, null, 2); try { await navigator.clipboard.writeText(text); } catch (_) {} return text; }
        };

        if (new URLSearchParams(location.search).get('debug') === '1') createDebugPanel();
        debugLog('debug-ready', { screen: getActiveScreenId() });
    }

    function getActiveScreenId() {
        const active = [...document.querySelectorAll('.overlay-screen')].find(el => el.classList.contains('active') || !el.classList.contains('hidden'));
        return active?.id || null;
    }

    function createDebugPanel() {
        if (document.getElementById('ffDebugPanel')) return;
        const panel = document.createElement('details');
        panel.id = 'ffDebugPanel';
        panel.style.cssText = 'position:fixed;z-index:100000;left:8px;right:8px;bottom:8px;max-height:42vh;overflow:auto;background:rgba(3,11,18,.94);color:#d8f6ff;border:1px solid #22d3ee;border-radius:10px;padding:8px;font:11px/1.35 monospace;white-space:pre-wrap;text-align:left;direction:ltr';
        panel.innerHTML = '<summary style="cursor:pointer;color:#67e8f9;font-weight:bold">FF DEBUG</summary><pre id="ffDebugBody" style="margin:7px 0 0;white-space:pre-wrap"></pre>';
        document.body.appendChild(panel);
        updateDebugPanel();
    }

    function updateDebugPanel() {
        const body = document.getElementById('ffDebugBody');
        if (!body) return;
        body.textContent = debugEntries.slice(-35).map(x => `${x.t.slice(11,19)} ${x.event} ${JSON.stringify(x.data)}`).join('\n');
    }

    const bgByWorld = ['ruins', 'ice', 'storm', 'volcano'];
    const buttonIds = ['startStoryBtn', 'endlessBtn', 'shopBtnStart', 'settingsBtn', 'leaderboardBtn', 'prevWorldBtn', 'nextWorldBtn'];

    function stopZoom() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) event.preventDefault();
            lastTouchEnd = now;
        }, { passive: false });
    }

    function currentGame() { return window.game || null; }

    function setupInstantMenuAudio(game) {
        if (!game?.sound) return;
        document.addEventListener('pointerdown', () => game.sound.init(), { capture: true, passive: true });
        const play = name => { const fn = game.sound?.[name]; if (typeof fn === 'function') fn.call(game.sound); };
        ['shopBtnStart', 'shopBtnGameOver', 'leaderboardBtn'].forEach(id => document.getElementById(id)?.addEventListener('click', () => play('playUIOpen')));
        ['closeShopBtn', 'closeLeaderboardBtn'].forEach(id => document.getElementById(id)?.addEventListener('click', () => play('playUIClose')));
        document.getElementById('startStoryBtn')?.addEventListener('click', () => {
            const i = Number(game.currentWorldIndex || 0);
            const locked = (i === 1 && !game.w1Completed) || (i === 2 && !game.w2Completed) || i === 3;
            if (!locked) play('playUIStart');
        });
    }

    function applyMenuWorld(game) {
        const start = document.getElementById('startScreen');
        if (!start || !game) return;
        let index = Number(game.currentWorldIndex);
        if (!Number.isFinite(index)) index = 0;
        index = Math.max(0, Math.min(bgByWorld.length - 1, index));
        start.dataset.labWorld = bgByWorld[index];
        const card = document.getElementById('worldCard');
        if (card) card.dataset.labWorld = bgByWorld[index];
        debugLog('world-sync', { currentWorldIndex: game.currentWorldIndex, appliedIndex: index, background: bgByWorld[index] });
        const prev = document.getElementById('prevWorldBtn');
        const next = document.getElementById('nextWorldBtn');
        if (prev) prev.disabled = index <= 0;
        if (next) next.disabled = index >= bgByWorld.length - 1;
        const status = document.getElementById('worldStatus');
        if (status && game.worlds?.[index]) {
            if (game.worlds[index].unlocked === false) status.textContent = game.lang === 'ar' ? 'عالم مقفل' : 'Locked World';
            else if (/locked|مقفل/i.test(status.textContent || '')) status.textContent = game.lang === 'ar' ? 'جاهز للعب!' : 'Ready to play!';
        }
    }

    function addPanelClasses() {
        document.getElementById('settingsScreen')?.classList.add('lab-game-panel', 'lab-settings-panel');
        document.getElementById('leaderboardScreen')?.classList.add('lab-game-panel', 'lab-leaderboard-panel');
        document.getElementById('shopScreen')?.classList.add('lab-game-panel', 'lab-shop-panel');
    }

    function decorateSettings() {
        const screen = document.getElementById('settingsScreen');
        if (!screen) return;
        screen.querySelector('h2, .settings-title')?.classList.add('lab-panel-title');
        document.getElementById('settingsReturnBtn')?.classList.add('lab-return-btn');
        screen.querySelectorAll('.settings-row, .setting-row').forEach(row => row.classList.add('lab-setting-row'));
        screen.querySelectorAll('button:not(#settingsReturnBtn), select').forEach(el => el.classList.add('lab-setting-control'));
    }

    function setupShop(game) {
        const shopButtons = [document.getElementById('shopBtnStart'), document.getElementById('shopBtnGameOver')].filter(Boolean);
        const screen = document.getElementById('shopScreen');
        const back = document.getElementById('closeShopBtn');
        const grid = document.getElementById('skinsGrid');
        if (!shopButtons.length || !screen || !back || !grid) {
            debugLog('shop-bind-failed', { buttons: shopButtons.length, screen: !!screen, back: !!back, grid: !!grid });
            return;
        }
        screen.querySelector('h2, .shop-title')?.classList.add('lab-panel-title');
        back.classList.add('lab-return-btn');
        grid.classList.add('lab-shop-grid');
        shopButtons.forEach(btn => {
            btn.classList.add('lab-game-button');
            btn.addEventListener('click', () => {
                debugLog('shop-open', { source: btn.id, world: game.currentWorldIndex });
                requestAnimationFrame(() => { screen.classList.add('lab-shop-panel'); grid.classList.add('lab-shop-grid'); decorateExistingShop(grid); });
            });
        });
        back.addEventListener('click', () => debugLog('shop-close', { world: game.currentWorldIndex }));
    }

    function decorateExistingShop(grid) {
        const cards = [...grid.children];
        cards.forEach(card => { card.classList.add('lab-shop-card'); const button = card.querySelector('button'); if (button) button.classList.add('lab-shop-action'); });
        debugLog('shop-rendered', { cards: cards.length });
    }

    function rebuildLeaderboard(game) {
        const list = document.getElementById('leaderboardList');
        if (!list) return;
        const names = ['SkyRider', 'FeatherAce', 'StormWing', 'Birddy', 'NoobMaster', 'Falcon', 'Ghost', 'Glider', 'Faker'];
        const scoreTiers = [511, 438, 372, 309, 254];
        const usedNames = new Set();
        const players = scoreTiers.map((baseScore) => {
            let baseName;
            do { baseName = names[Math.floor(Math.random() * names.length)]; } while (usedNames.has(baseName));
            usedNames.add(baseName);
            return { name: baseName + Math.floor(Math.random() * 99), score: baseScore - Math.floor(Math.random() * 18) };
        });
        const you = (typeof I18N !== 'undefined' && I18N[game.lang]?.you) ? I18N[game.lang].you : (game.lang === 'ar' ? 'أنت' : 'You');
        players.push({ name: you, score: Number(game.highScore || 0), you: true });
        players.sort((a, b) => b.score - a.score);
        list.innerHTML = '';
        players.forEach((p, index) => {
            const row = document.createElement('li');
            row.className = `leaderboard-row rank-${index + 1}${p.you ? ' is-you' : ''}`;
            const player = document.createElement('div'); player.className = 'leaderboard-player';
            const rank = document.createElement('span'); rank.className = 'leaderboard-rank'; rank.textContent = `#${index + 1}`;
            const name = document.createElement('span'); name.className = 'leaderboard-name'; name.textContent = p.name;
            player.append(rank, name);
            const score = document.createElement('span'); score.className = 'leaderboard-score'; score.textContent = p.score;
            row.append(player, score); list.appendChild(row);
        });
    }

    function setupLeaderboard(game) {
        const open = document.getElementById('leaderboardBtn');
        const close = document.getElementById('closeLeaderboardBtn');
        const screen = document.getElementById('leaderboardScreen');
        if (!open || !close || !screen) return;
        screen.querySelector('h2, .leaderboard-title')?.classList.add('lab-panel-title');
        close.classList.add('lab-close-btn');
        open.onclick = () => { rebuildLeaderboard(game); screen.classList.remove('hidden'); screen.classList.add('active'); requestAnimationFrame(() => close.focus({ preventScroll: true })); };
        close.onclick = () => { screen.classList.remove('active'); screen.classList.add('hidden'); open.focus({ preventScroll: true }); };
    }

    function setupSettings(game) {
        const open = document.getElementById('settingsBtn');
        const screen = document.getElementById('settingsScreen');
        const back = document.getElementById('settingsReturnBtn');
        if (!open || !screen || !back) return;
        open.addEventListener('click', () => requestAnimationFrame(() => { decorateSettings(); back.focus({ preventScroll: true }); }));
    }

    function hookCarousel(game) {
        if (!game || game.__labCarouselHooked || typeof game.updateCarousel !== 'function') return;
        const original = game.updateCarousel.bind(game);
        game.updateCarousel = function (...args) { const result = original(...args); applyMenuWorld(game); return result; };
        game.__labCarouselHooked = true;
    }

    function installRuinsPillarArt(game) {
        if (!game?.assets || game.__labRuinsPillarArtV2) return;
        const c = document.createElement('canvas');
        c.width = 76;
        c.height = 640;
        const ctx = c.getContext('2d');
        if (!ctx) return;

        const bodyX = 11;
        const bodyW = 54;
        const capH = 20;

        const stone = ctx.createLinearGradient(bodyX, 0, bodyX + bodyW, 0);
        stone.addColorStop(0, '#6f6a5e');
        stone.addColorStop(.18, '#918979');
        stone.addColorStop(.5, '#aaa18e');
        stone.addColorStop(.82, '#81796b');
        stone.addColorStop(1, '#5f5a51');
        ctx.fillStyle = stone;
        ctx.fillRect(bodyX, 0, bodyW, c.height);

        // Uneven ancient stone blocks: readable on small phone screens without visual noise.
        ctx.strokeStyle = 'rgba(57,52,46,.45)';
        ctx.lineWidth = 1.2;
        let blockTop = capH + 6;
        let row = 0;
        while (blockTop < c.height) {
            const h = row % 3 === 0 ? 46 : (row % 3 === 1 ? 56 : 50);
            ctx.beginPath();
            ctx.moveTo(bodyX + 2, blockTop);
            ctx.lineTo(bodyX + bodyW - 2, blockTop);
            ctx.stroke();
            const jointX = row % 2 ? bodyX + 19 : bodyX + 35;
            ctx.beginPath();
            ctx.moveTo(jointX, blockTop);
            ctx.lineTo(jointX, Math.min(c.height, blockTop + h));
            ctx.stroke();
            blockTop += h;
            row++;
        }

        // Multiple short cracks instead of one long glowing pipe-like seam.
        const cracks = [
            [[31,82],[37,94],[33,108]],
            [[50,154],[44,167],[48,181],[41,194]],
            [[25,245],[31,257],[27,271]],
            [[45,326],[39,339],[43,354]],
            [[29,420],[35,433],[31,447]],
            [[49,510],[43,523],[46,538]],
            [[24,575],[30,588],[27,602]]
        ];
        cracks.forEach((pts, i) => {
            ctx.beginPath();
            pts.forEach(([x,y], n) => n ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
            ctx.strokeStyle = 'rgba(42,38,34,.9)';
            ctx.lineWidth = 2.4;
            ctx.lineCap = 'round';
            ctx.stroke();
            if (i % 2 === 0) {
                ctx.beginPath();
                pts.forEach(([x,y], n) => n ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
                ctx.strokeStyle = 'rgba(207,169,91,.28)';
                ctx.lineWidth = .8;
                ctx.stroke();
            }
        });

        // Subtle moss marks to sell the ruins theme.
        ctx.fillStyle = 'rgba(78,101,67,.42)';
        [[15,120,10,5],[48,286,12,5],[18,392,9,4],[43,552,13,5]].forEach(([x,y,w,h]) => {
            ctx.fillRect(x,y,w,h);
        });

        // Smaller broken stone cap. Keeps the collision box visually honest on phones.
        const cap = ctx.createLinearGradient(0, 0, c.width, 0);
        cap.addColorStop(0, '#5e594f');
        cap.addColorStop(.5, '#a49b88');
        cap.addColorStop(1, '#625d53');
        ctx.fillStyle = cap;
        ctx.beginPath();
        ctx.moveTo(5, 4);
        ctx.lineTo(21, 1);
        ctx.lineTo(36, 3);
        ctx.lineTo(51, 0);
        ctx.lineTo(71, 4);
        ctx.lineTo(69, capH);
        ctx.lineTo(7, capH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(51,47,42,.38)';
        ctx.fillRect(8, capH - 4, 60, 4);
        ctx.strokeStyle = 'rgba(255,255,255,.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(11, 7); ctx.lineTo(30, 5); ctx.lineTo(47, 7); ctx.lineTo(65, 5); ctx.stroke();

        game.assets.pillarCanvas = c;
        game.__labRuinsPillarArt = true;
        game.__labRuinsPillarArtV2 = true;
        debugLog('ruins-pillar-art-v2-installed', { canvasWidth: c.width, bodyWidth: bodyW, collisionWidth: 60 });
    }

    function polishStaticButtons() {
        buttonIds.forEach(id => { const btn = document.getElementById(id); if (btn) btn.classList.add('lab-game-button'); });
    }

    function init(game) {
        setupDebugLogger();
        debugLog('lab-init', { world: game.currentWorldIndex, screen: getActiveScreenId() });
        setupInstantMenuAudio(game);
        installRuinsPillarArt(game);
        stopZoom();
        addPanelClasses();
        polishStaticButtons();
        decorateSettings();
        setupSettings(game);
        setupShop(game);
        setupLeaderboard(game);
        hookCarousel(game);
        applyMenuWorld(game);
    }

    function boot() {
        let tries = 0;
        const timer = setInterval(() => {
            const game = currentGame();
            if (game) { clearInterval(timer); init(game); }
            else if (++tries > 100) { console.error('[FF-LAB] Game boot timeout'); clearInterval(timer); }
        }, 100);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
})();