(()=>{'use strict';

    const DEBUG_KEY = 'ff_lab_debug_log';
    const debugEntries = [];
    const bgByWorld = ['ruins', 'ice', 'storm', 'volcano'];
    const buttonIds = [
        'startStoryBtn', 'startEndlessBtn', 'shopBtnStart', 'settingsBtn',
        'leaderboardBtn', 'shopBtnGameOver', 'retryBtn', 'homeBtn'
    ];

    function debugLog(type, payload = {}) {
        const entry = { time: new Date().toISOString(), type, ...payload };
        debugEntries.push(entry);
        if (debugEntries.length > 80) debugEntries.shift();
        try {
            localStorage.setItem(DEBUG_KEY, JSON.stringify(debugEntries));
        } catch (_) {}
        console.log('[FF-LAB]', type, payload);
    }

    function setupDebugLogger() {
        try {
            const saved = JSON.parse(localStorage.getItem(DEBUG_KEY) || '[]');
            if (Array.isArray(saved)) debugEntries.push(...saved.slice(-30));
        } catch (_) {}
        window.__FF_LAB_DEBUG__ = {
            dump() { return [...debugEntries]; },
            clear() {
                debugEntries.length = 0;
                try { localStorage.removeItem(DEBUG_KEY); } catch (_) {}
            }
        };
    }

    function getActiveScreenId() {
        return document.querySelector('.overlay-screen.active:not(.hidden)')?.id || 'none';
    }

    function stopZoom() {
        let lastTouchEnd = 0;
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
                else if (active.id === 'shopScreen') document.getElementById('closeShopBtn')?.click();
                else if (active.id === 'leaderboardScreen') document.getElementById('closeLeaderboardBtn')?.click();
            }
        });
    }

    function addPanelClasses() {
        ['shopScreen', 'settingsScreen', 'leaderboardScreen', 'pauseScreen'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('lab-panel-screen');
        });
    }

    function decorateSettings() {
        const screen = document.getElementById('settingsScreen');
        if (!screen) return;
        const title = screen.querySelector('h2');
        title?.classList.add('lab-panel-title');
        screen.querySelectorAll('button').forEach(b => b.classList.add('lab-game-button'));
        document.getElementById('settingsReturnBtn')?.classList.add('lab-close-btn');
    }

    function renderShop(game) {
        const grid = document.getElementById('shopGrid');
        if (!grid || !game) return;
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

    function setupShop(game) {
        const openButtons = [document.getElementById('shopBtnStart'), document.getElementById('shopBtnGameOver')].filter(Boolean);
        const close = document.getElementById('closeShopBtn');
        const screen = document.getElementById('shopScreen');
        if (!screen || !close) return;
        openButtons.forEach(btn => btn.addEventListener('click', () => {
            renderShop(game);
            debugLog('shop-open', { source: btn.id, world: game.currentWorldIndex });
        }));
        close.addEventListener('click', () => debugLog('shop-close', { world: game.currentWorldIndex }));
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

    function installRuinsPillarArt(game) {
        if (!game?.assets || game.__labRuinsPillarArt) return;
        const c = document.createElement('canvas');
        c.width = 84;
        c.height = 640;
        const ctx = c.getContext('2d');
        if (!ctx) return;

        const bodyX = 12;
        const bodyW = 60;
        const capH = 28;
        const stone = ctx.createLinearGradient(bodyX, 0, bodyX + bodyW, 0);
        stone.addColorStop(0, '#222b35');
        stone.addColorStop(0.18, '#3b4652');
        stone.addColorStop(0.52, '#56616c');
        stone.addColorStop(0.82, '#343f4a');
        stone.addColorStop(1, '#1c242c');
        ctx.fillStyle = stone;
        ctx.fillRect(bodyX, 0, bodyW, c.height);

        ctx.strokeStyle = 'rgba(9,14,20,.48)';
        ctx.lineWidth = 1.5;
        for (let y = 52; y < c.height; y += 58) {
            ctx.beginPath();
            ctx.moveTo(bodyX + 3, y);
            ctx.lineTo(bodyX + bodyW - 3, y);
            ctx.stroke();
            const joint = ((y / 58) % 2) ? bodyX + 23 : bodyX + 42;
            ctx.beginPath();
            ctx.moveTo(joint, y - 58);
            ctx.lineTo(joint, y);
            ctx.stroke();
        }

        ctx.lineCap = 'round';
        const cracks = [
            [[43,38],[35,76],[44,108],[31,145],[39,183]],
            [[49,218],[38,252],[46,287],[34,325]],
            [[38,374],[48,410],[36,452],[43,493],[31,532]],
            [[45,548],[37,580],[47,615]]
        ];
        cracks.forEach((pts, i) => {
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
            ctx.strokeStyle = i % 2 ? 'rgba(12,17,23,.9)' : 'rgba(18,24,30,.88)';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pts[0][0] + 1, pts[0][1]);
            pts.slice(1).forEach(p => ctx.lineTo(p[0] + 1, p[1]));
            ctx.strokeStyle = 'rgba(255,186,91,.52)';
            ctx.lineWidth = 1.3;
            ctx.stroke();
        });

        ctx.fillStyle = '#29333d';
        ctx.fillRect(2, 0, 80, capH);
        ctx.fillStyle = '#182029';
        ctx.fillRect(2, capH - 6, 80, 6);
        ctx.fillStyle = 'rgba(255,255,255,.10)';
        ctx.fillRect(7, 5, 70, 2);

        ctx.fillStyle = '#0f161e';
        ctx.beginPath();
        ctx.moveTo(2, 0); ctx.lineTo(13, 0); ctx.lineTo(2, 9); ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(82, 0); ctx.lineTo(72, 0); ctx.lineTo(82, 7); ctx.closePath(); ctx.fill();

        game.assets.pillarCanvas = c;
        game.__labRuinsPillarArt = true;
        debugLog('ruins-pillar-art-installed', { canvasWidth: c.width, bodyWidth: bodyW, collisionWidth: 60 });
    }

    function polishStaticButtons() {
        buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.add('lab-game-button');
        });
    }

    function init(game) {
        setupDebugLogger();
        // LAB TEST MODE: unlock all currently playable worlds without persisting fake progress.
        game.w1Completed = true;
        game.w2Completed = true;
        if (Array.isArray(game.worlds)) {
            game.worlds.forEach((world, index) => {
                if (world && index <= 2) world.unlocked = true;
            });
        }
        debugLog('lab-test-worlds-unlocked', { w1Completed: game.w1Completed, w2Completed: game.w2Completed });
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
        keyboardNav(game);
    }

    function boot() {
        let tries = 0;
        const timer = setInterval(() => {
            const game = currentGame();
            if (game) {
                clearInterval(timer);
                init(game);
            } else if (++tries > 150) {
                clearInterval(timer);
                console.warn('[FF-LAB] lab-ui init timeout');
            }
        }, 80);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
})();