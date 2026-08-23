/* LAB UI / UX enhancement layer - isolated from core game logic */
(function () {
    'use strict';

    const bgByWorld = ['ruins', 'ice', 'storm', 'volcano'];
    const buttonIds = ['startBtn', 'endlessBtn', 'shopBtn', 'leaderboardBtn', 'settingsBtn', 'prevWorldBtn', 'nextWorldBtn'];
    let lastTouchEnd = 0;

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

    function applyMenuWorld(game) {
        const start = document.getElementById('startScreen');
        if (!start || !game) return;
        start.classList.remove('world-bg-ruins', 'world-bg-ice', 'world-bg-storm', 'world-bg-volcano');
        const index = Math.max(0, Math.min(bgByWorld.length - 1, Number(game.currentWorld || 0)));
        start.classList.add(`world-bg-${bgByWorld[index]}`);
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
                if (active.id === 'shopScreen') document.getElementById('shopReturnBtn')?.click();
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
        const shopBtn = document.getElementById('shopBtn');
        const screen = document.getElementById('shopScreen');
        const back = document.getElementById('shopReturnBtn');
        if (!shopBtn || !screen || !back) return;
        const heading = screen.querySelector('h2, .shop-title');
        heading?.classList.add('lab-panel-title');
        back.classList.add('lab-return-btn');

        shopBtn.addEventListener('click', () => {
            rebuildShop(game);
            requestAnimationFrame(() => back.focus({ preventScroll: true }));
        });
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
                clearInterval(timer);
            }
        }, 100);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
})();
