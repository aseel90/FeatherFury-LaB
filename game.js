function safeGet(key, defaultVal) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}
function safeSet(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (e) {}
}

class FeatherHeroGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = CONFIG.CANVAS_WIDTH; this.canvas.height = CONFIG.CANVAS_HEIGHT;

    const systemLang = (navigator.language || navigator.userLanguage || 'ar').toLowerCase().startsWith('ar') ? 'ar' : 'en';
    this.lang = safeGet('fh_lang', systemLang);
    this.sound = new SoundManager();
    this.gfxEnabled = true;
    this.highScore = parseInt(safeGet('fh_highscore', '0'), 10);
    this.highScoreW2 = parseInt(safeGet('fh_highscore_w2', '0'), 10);
    this.totalCoins = parseInt(safeGet('fh_total_coins', '0'), 10);
    let unlocked = ['classic'];
    try {
      unlocked = JSON.parse(safeGet('fh_unlocked_skins', '["classic"]'));
    } catch(e) {}
    this.unlockedSkins = new Set(unlocked);
    this.activeSkin = safeGet('fh_active_skin', 'classic');
    this.w1Completed = safeGet('fh_w1_completed', 'false') === 'true';
    this.w2Completed = safeGet('fh_w2_completed', 'false') === 'true';
    this.w3Completed = safeGet('fh_w3_completed', 'false') === 'true';
    this.highScoreW3 = parseInt(safeGet('fh_highscore_w3', '0'), 10);
    this.invincibleTimer = 0;
    this.activeWorld = 0; // 0 = Ruins, 1 = Frostbite, 2 = Storm

    this.applyLanguage();
    this.bindEvents();
    this.reset();
    this.updateCoinDisplays();
    this.updatePreview();
    
    this.state = 'MENU'; 
    // Load Assets
    this.assets = {};
    this.generateLavaPillar();
    this.generateIcePillar();
    this.generateStormPillar();

    // Game loop
    this.loop();
  }

  generateLavaPillar() {
    const c = document.createElement('canvas');
    c.width = 80; c.height = 600; // Large enough for any pillar
    const ctx = c.getContext('2d');
    
    // Background stone
    const grad = ctx.createLinearGradient(0, 0, 80, 0);
    grad.addColorStop(0, '#111827'); grad.addColorStop(0.5, '#374151'); grad.addColorStop(1, '#111827');
    ctx.fillStyle = grad;
    ctx.fillRect(10, 0, 60, 600);
    
    // Stone texture / dark cracks
    ctx.fillStyle = '#030712';
    for(let i=0; i<30; i++) {
       ctx.fillRect(10 + Math.random()*50, Math.random()*600, Math.random()*15+5, 2);
       ctx.fillRect(10 + Math.random()*50, Math.random()*600, 2, Math.random()*15+5);
    }

    // Glowing Lava Cracks (Procedural)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444';
    ctx.lineWidth = 3;
    
    // Main vertical crack
    ctx.beginPath();
    ctx.moveTo(40, 0);
    for(let y=0; y<=600; y+=30) {
       let x = 40 + (Math.random()-0.5)*30;
       ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#f97316'; ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#fde047'; ctx.stroke(); // Hot inner core

    // Branches
    for(let i=0; i<8; i++) {
       let startY = 50 + Math.random()*500;
       ctx.beginPath(); ctx.moveTo(40, startY);
       ctx.lineTo(40 + (Math.random()>0.5?20:-20), startY + (Math.random()-0.5)*40);
       ctx.lineWidth = 2; ctx.strokeStyle = '#f97316'; ctx.stroke();
    }

    // Pillar Cap (Top side in the drawing, we will flip it when needed)
    ctx.shadowBlur = 0;
    const capGrad = ctx.createLinearGradient(0, 0, 80, 0);
    capGrad.addColorStop(0, '#1f2937'); capGrad.addColorStop(0.5, '#4b5563'); capGrad.addColorStop(1, '#1f2937');
    ctx.fillStyle = capGrad;
    ctx.fillRect(0, 0, 80, 30);
    
    // Cap details
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 25, 80, 5); // dark shadow under cap edge
    ctx.fillRect(5, 5, 70, 2); 
    
    // Mini lava drops on cap
    ctx.shadowBlur = 10; ctx.shadowColor = '#ef4444';
    ctx.fillStyle = '#f97316';
    ctx.fillRect(20, 20, 5, 10);
    ctx.fillRect(50, 15, 3, 15);
    
    this.assets.pillarCanvas = c;
  }

  generateIcePillar() {
    const c = document.createElement('canvas');
    c.width = 80; c.height = 600;
    const ctx = c.getContext('2d');
    
    // Background ice gradient
    const grad = ctx.createLinearGradient(0, 0, 80, 0);
    grad.addColorStop(0, '#1e3a5f'); grad.addColorStop(0.3, '#2563eb'); grad.addColorStop(0.5, '#93c5fd'); grad.addColorStop(0.7, '#2563eb'); grad.addColorStop(1, '#1e3a5f');
    ctx.fillStyle = grad;
    ctx.fillRect(10, 0, 60, 600);
    
    // Translucent ice sheen
    ctx.fillStyle = 'rgba(147, 197, 253, 0.15)';
    ctx.fillRect(25, 0, 15, 600);
    
    // Frost crystal cracks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    for(let i = 0; i < 12; i++) {
      const y = Math.random() * 600;
      const x = 15 + Math.random() * 50;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random()-0.5)*25, y + (Math.random()-0.5)*30);
      ctx.stroke();
      // Branch
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random()-0.5)*15, y + (Math.random()-0.5)*20);
      ctx.stroke();
    }

    // Ice Cap (jagged icicle shape)
    ctx.fillStyle = '#93c5fd';
    ctx.shadowBlur = 8; ctx.shadowColor = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(0, 25); ctx.lineTo(5, 0); ctx.lineTo(15, 20);
    ctx.lineTo(25, -5); ctx.lineTo(35, 18); ctx.lineTo(40, -8);
    ctx.lineTo(45, 15); ctx.lineTo(55, -3); ctx.lineTo(65, 22);
    ctx.lineTo(75, 5); ctx.lineTo(80, 25);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    
    // Cap edge frost line
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(5, 20, 70, 3);
    
    this.assets.icePillarCanvas = c;
  }

  generateStormPillar() {
    const c = document.createElement('canvas');
    c.width = 80; c.height = 600;
    const ctx = c.getContext('2d');
    
    // Dark Metallic Cyber-Obsidian Body
    const grad = ctx.createLinearGradient(0, 0, 80, 0);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.25, '#1e1b4b');
    grad.addColorStop(0.5, '#312e81');
    grad.addColorStop(0.75, '#1e1b4b');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(10, 0, 60, 600);
    
    // Tech Plate Panel Ridges
    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 1.5;
    for(let y = 30; y < 600; y += 45) {
      ctx.strokeRect(14, y, 52, 38);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(16, y + 2, 3, 3);
      ctx.fillRect(61, y + 2, 3, 3);
    }
    
    // Central High-Voltage Neon Lightning Conduit
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#38bdf8';
    
    // Pulsing Outer Cyan Conduit
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(40, 0);
    for(let y = 0; y <= 600; y += 25) {
      const x = 40 + (Math.random() - 0.5) * 16;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Bright Core Lightning Beam
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    
    // Tesla Arc Branches
    ctx.shadowColor = '#c084fc';
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    for(let i = 0; i < 10; i++) {
      const y = 40 + Math.random() * 520;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(40 + (Math.random() > 0.5 ? 22 : -22), y + (Math.random() - 0.5) * 30);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    
    // Tesla Spire Cap (Top/Bottom Terminal)
    const capGrad = ctx.createLinearGradient(0, 0, 80, 0);
    capGrad.addColorStop(0, '#1e1b4b');
    capGrad.addColorStop(0.5, '#4338ca');
    capGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = capGrad;
    ctx.fillRect(2, 0, 76, 26);
    
    // Cap Tesla Rings
    ctx.fillStyle = '#38bdf8';
    ctx.shadowBlur = 12; ctx.shadowColor = '#38bdf8';
    ctx.fillRect(8, 22, 64, 4);
    ctx.fillStyle = '#c084fc';
    ctx.shadowColor = '#c084fc';
    ctx.fillRect(16, 12, 48, 3);
    ctx.shadowBlur = 0;
    
    // Metallic Rim & Bolts
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(4, 2, 72, 3);
    for(let bx = 12; bx <= 68; bx += 14) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(bx, 6, 4, 4);
    }
    
    this.assets.stormPillarCanvas = c;
  }

  applyLanguage() {
    document.getElementById('htmlTag').dir = this.lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (I18N[this.lang][key]) el.textContent = I18N[this.lang][key];
    });
    
    // Update dynamic buttons
    document.getElementById('sfxToggleBtn').textContent = this.sound.sfxEnabled ? I18N[this.lang].sfxOn : I18N[this.lang].sfxOff;
    document.getElementById('gfxToggleBtn').textContent = this.gfxEnabled ? I18N[this.lang].gfxHigh : I18N[this.lang].gfxLow;
    // Show the language that clicking will switch TO
    document.getElementById('langToggleBtn').innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><use href="#lang-svg"></use></svg> ${this.lang === 'ar' ? 'English' : 'عربى'}`;
    
    // Trigger carousel update to refresh world name translation
    if (this.updateCarousel) this.updateCarousel();
    
    this.updatePreview(); this.renderShop(); this.updateCoinDisplays();
  }

  toggleLanguage() {
    this.lang = this.lang === 'ar' ? 'en' : 'ar';
    safeSet('fh_lang', this.lang);
    this.applyLanguage();
  }

  updateCoinDisplays() {
    document.getElementById('startTotalCoins').textContent = this.totalCoins;
    document.getElementById('shopTotalCoins').textContent = this.totalCoins;
    safeSet('fh_total_coins', this.totalCoins.toString());
    const reviveBtn = document.getElementById('reviveBtn');
    if (reviveBtn) {
      const cost = CONFIG.REVIVE_COST || 10;
      const canAfford = this.totalCoins >= cost;
      reviveBtn.innerHTML = `${I18N[this.lang].reviveBtn} <span class="revive-price" style="display:inline-flex; align-items:center; gap:4px; font-size:0.85em; background:rgba(0,0,0,0.35); padding:2px 8px; border-radius:12px; margin-inline-start:6px;"><svg width="14" height="14" viewBox="0 0 24 24"><use href="#coin-svg"></use></svg> ${cost}</span>`;
      reviveBtn.disabled = !canAfford;
      reviveBtn.style.opacity = canAfford ? '1' : '0.45';
      reviveBtn.style.cursor = canAfford ? 'pointer' : 'not-allowed';
    }
  }

  updatePreview() {
    const c = document.getElementById('previewBirdCanvas');
    if(c) {
      const pctx = c.getContext('2d');
      pctx.clearRect(0, 0, c.width, c.height);
      drawBirdSkin(pctx, this.activeSkin, c.width / 2, c.height / 2, 0, 0, 1.25);
      const nameEl = document.getElementById('activeSkinName');
      if (nameEl && SKINS[this.activeSkin]) {
        nameEl.textContent = SKINS[this.activeSkin]['name_' + this.lang] || '';
      }
    }
  }

  renderShop() {
    const grid = document.getElementById('skinsGrid'); grid.innerHTML = '';
    Object.keys(SKINS).forEach(key => {
      const skin = SKINS[key];
      const isUnlocked = this.unlockedSkins.has(key), isEquipped = this.activeSkin === key;
      const card = document.createElement('div'); card.className = `skin-card ${isEquipped ? 'active-skin' : ''}`;
      
      const canvasWrap = document.createElement('div'); canvasWrap.className = 'skin-card-canvas-wrap';
      const canvas = document.createElement('canvas'); canvas.width = 60; canvas.height = 50;
      drawBirdSkin(canvas.getContext('2d'), key, 30, 25, 0, 0, 1.15); canvasWrap.appendChild(canvas);
      
      const title = document.createElement('div'); title.className = 'skin-card-title'; title.textContent = skin['name_'+this.lang];
      const cost = document.createElement('div'); cost.className = 'skin-card-cost';
      cost.innerHTML = isUnlocked ? `<span>${this.lang==='ar'?'مملوك ✓':'Owned ✓'}</span>` : `<span>${skin.price}</span> <svg width="12" height="12" viewBox="0 0 24 24"><use href="#coin-svg"></use></svg>`;
      
      const btn = document.createElement('button'); btn.className = 'skin-action-btn';
      if (isEquipped) { btn.classList.add('equipped-badge'); btn.textContent = this.lang==='ar'?'مفعّل ✅':'Equipped'; }
      else if (isUnlocked) {
        btn.classList.add('equip-btn'); btn.textContent = this.lang==='ar'?'اختيار ⚡':'Equip';
        btn.onclick = () => { this.activeSkin = key; safeSet('fh_active_skin', key); this.sound.playScore(); this.updatePreview(); this.renderShop(); };
      } else {
        btn.classList.add('buy-btn'); btn.textContent = this.lang==='ar'?'شراء 🛒':'Buy';
        if (this.totalCoins < skin.price) btn.disabled = true;
        btn.onclick = () => {
          if (this.totalCoins >= skin.price) {
            this.totalCoins -= skin.price; this.unlockedSkins.add(key); this.activeSkin = key;
            safeSet('fh_unlocked_skins', JSON.stringify([...this.unlockedSkins])); safeSet('fh_active_skin', key);
            this.updateCoinDisplays(); this.updatePreview(); this.renderShop();
          }
        };
      }
      card.append(canvasWrap, title, cost, btn); grid.appendChild(card);
    });
  }

  bindEvents() {
    
    // Settings Events
    document.getElementById('settingsBtn').onclick = () => {
      this.sound.playTick();
      document.getElementById('startScreen').classList.remove('active');
      document.getElementById('startScreen').classList.add('hidden');
      document.getElementById('settingsScreen').classList.remove('hidden');
      document.getElementById('settingsScreen').classList.add('active');
    };
    document.getElementById('closeSettingsBtn').onclick = () => {
      this.sound.playTick();
      document.getElementById('settingsScreen').classList.remove('active');
      document.getElementById('settingsScreen').classList.add('hidden');
      document.getElementById('startScreen').classList.remove('hidden');
      document.getElementById('startScreen').classList.add('active');
    };
    document.getElementById('langToggleBtn').onclick = (e) => {
      this.sound.playTick();
      this.toggleLanguage();
    };
    document.getElementById('sfxToggleBtn').onclick = (e) => {
      const enabled = this.sound.toggleSFX();
      this.sound.playTick();
      e.target.textContent = enabled ? I18N[this.lang].sfxOn : I18N[this.lang].sfxOff;
    };
    document.getElementById('gfxToggleBtn').onclick = (e) => {
      this.sound.playTick();
      this.gfxEnabled = !this.gfxEnabled;
      e.target.textContent = this.gfxEnabled ? I18N[this.lang].gfxHigh : I18N[this.lang].gfxLow;
    };
    document.getElementById('resetDataBtn').onclick = () => {
      this.sound.playTick();
      if(confirm(I18N[this.lang].resetConfirmMsg)) {
        localStorage.clear();
        location.reload();
      }
    };

    // Carousel Events
    this.currentWorldIndex = 0;
    this.updateCarousel = () => {
      const title = document.getElementById('worldTitle');
      const status = document.getElementById('worldStatus');
      const card = document.getElementById('worldCard');
      const stars = document.getElementById('worldStars');
      const startBtn = document.getElementById('startStoryBtn');
      
      // Remove all theme classes
      card.classList.remove('theme-ruins', 'theme-ice', 'theme-storm', 'theme-volcano', 'locked');

      if (this.currentWorldIndex === 0) {
         // WORLD 1: RUINS
         title.textContent = this.lang === 'ar' ? 'الأطلال' : 'Ruins';
         card.classList.add('theme-ruins');
         if (startBtn) {
           startBtn.disabled = false;
           startBtn.classList.remove('locked-btn');
           startBtn.textContent = I18N[this.lang].playBtn;
         }
         
         let starCount = 0;
         if (this.highScore >= CONFIG.STAGE1_END) starCount = 1;
         if (this.highScore >= CONFIG.STAGE2_END) starCount = 2;
         if (this.w1Completed) starCount = 3; 
         
         const sizes = ['1.7rem', '2.2rem', '1.7rem'];
         stars.innerHTML = '';
         for (let i = 0; i < 3; i++) {
           stars.innerHTML += `<span class="star ${i<starCount?'':'empty'}" style="font-size: ${sizes[i]}; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>`;
         }
      } else if (this.currentWorldIndex === 1) {
         title.textContent = this.lang === 'ar' ? 'قمم الصقيع' : 'Frostbite Peaks';
         card.classList.add('theme-ice');
         
         if (this.w1Completed) {
           if (startBtn) {
             startBtn.disabled = false;
             startBtn.classList.remove('locked-btn');
             startBtn.textContent = I18N[this.lang].playBtn;
           }
           
           let starCount = 0;
           if (this.highScoreW2 >= CONFIG.STAGE1_END) starCount = 1;
           if (this.highScoreW2 >= CONFIG.STAGE2_END) starCount = 2;
           if (this.w2Completed) starCount = 3;
           
           const sizes = ['1.7rem', '2.2rem', '1.7rem'];
           stars.innerHTML = '';
           for (let i = 0; i < 3; i++) {
             stars.innerHTML += `<span class="star ${i<starCount?'':'empty'}" style="font-size: ${sizes[i]}; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>`;
           }
         } else {
           status.textContent = this.lang === 'ar' ? 'أكمل مرحلة الأطلال أولاً' : 'Complete Ruins first';
           card.classList.add('locked');
           if (startBtn) {
             startBtn.textContent = this.lang === 'ar' ? 'مغلق' : 'Locked';
           }
           stars.innerHTML = `
             <span class="star empty" style="font-size: 1.75rem; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>
             <span class="star empty" style="font-size: 1.3rem; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>`;
         }
      } else if (this.currentWorldIndex === 2) {
         title.textContent = this.lang === 'ar' ? 'برج العاصفة' : 'Storm Spire';
         card.classList.add('theme-storm');
         
         if (this.w2Completed) {
           status.textContent = this.lang === 'ar' ? 'جاهز للعب!' : 'Ready to play!';
           if (startBtn) {
             startBtn.disabled = false;
             startBtn.classList.remove('locked-btn');
             startBtn.textContent = I18N[this.lang].playBtn;
           }
           
           let starCount = 0;
           if (this.highScoreW3 >= CONFIG.STAGE1_END) starCount = 1;
           if (this.highScoreW3 >= CONFIG.STAGE2_END) starCount = 2;
           if (this.w3Completed) starCount = 3;
           
           const sizes = ['1.7rem', '2.2rem', '1.7rem'];
           stars.innerHTML = '';
           for(let i=0; i<3; i++) {
             stars.innerHTML += `<span class="star ${i<starCount?'':'empty'}" style="font-size: ${sizes[i]}; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>`;
           }
         } else {
           status.textContent = this.lang === 'ar' ? 'أكمل مرحلة قمم الصقيع أولاً' : 'Complete Frostbite first';
           card.classList.add('locked');
           if (startBtn) {
             startBtn.classList.add('locked-btn');
             startBtn.textContent = this.lang === 'ar' ? 'مغلق' : 'Locked';
           }
           stars.innerHTML = `
             <span class="star empty" style="font-size: 1.3rem; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>
             <span class="star empty" style="font-size: 1.75rem; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>
             <span class="star empty" style="font-size: 1.3rem; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>`;
         }
      } else if (this.currentWorldIndex === 3) {
         // WORLD 4: VOLCANIC VALLEY (COMING SOON)
         title.textContent = this.lang === 'ar' ? 'وادي البراكين' : 'Volcanic Valley';
         card.classList.add('theme-volcano', 'locked');
         if (startBtn) {
           startBtn.classList.add('locked-btn');
           startBtn.textContent = this.lang === 'ar' ? 'قريباً' : 'Coming Soon';
         }
         stars.innerHTML = `
           <span class="star empty" style="font-size: 1.3rem; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>
           <span class="star empty" style="font-size: 1.75rem; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>
           <span class="star empty" style="font-size: 1.3rem; margin: 0 3px;"><svg width="1.1em" height="1.1em" viewBox="0 0 24 24" style="vertical-align: middle;"><use href="#star-svg"></use></svg></span>`;
      }
    };
    
    // Call once to initialize stars
    setTimeout(() => this.updateCarousel(), 100);

    // Carousel navigation arrows
    document.getElementById('prevWorldBtn').onclick = () => {
      if (this.currentWorldIndex > 0) {
        this.currentWorldIndex--;
        this.sound.playTick();
        this.updateCarousel();
      }
    };
    document.getElementById('nextWorldBtn').onclick = () => {
      if (this.currentWorldIndex < 3) {
        this.currentWorldIndex++;
        this.sound.playTick();
        this.updateCarousel();
      }
    };

    const handleLockedWorldClick = () => {
      const card = document.getElementById('worldCard');
      if (this.currentWorldIndex === 1 && !this.w1Completed) {
        this.sound.playHit();
        card.classList.remove('shake-locked'); void card.offsetWidth; card.classList.add('shake-locked');
        this.showToast(this.lang === 'ar' ? 'يجب إنهاء مرحلة الأطلال أولاً لفتح قمم الصقيع!' : 'Complete Ruins first to unlock Frostbite Peaks!');
        return true;
      }
      if (this.currentWorldIndex === 2 && !this.w2Completed) {
        this.sound.playHit();
        card.classList.remove('shake-locked'); void card.offsetWidth; card.classList.add('shake-locked');
        this.showToast(this.lang === 'ar' ? 'يجب إنهاء مرحلة قمم الصقيع أولاً لفتح برج العاصفة!' : 'Complete Frostbite Peaks first to unlock Storm Spire!');
        return true;
      }
      if (this.currentWorldIndex === 3) {
        this.sound.playHit();
        card.classList.remove('shake-locked'); void card.offsetWidth; card.classList.add('shake-locked');
        this.showToast(this.lang === 'ar' ? 'وادي البراكين قادم قريباً في التحديث القادم!' : 'Volcanic Valley is coming soon in the next update!');
        return true;
      }
      return false;
    };

    document.getElementById('worldCard').onclick = () => {
      handleLockedWorldClick();
    };

    document.getElementById('startStoryBtn').onclick = () => {
      if (handleLockedWorldClick()) return;
      this.activeWorld = this.currentWorldIndex;
      this.enterStoryState();
    };

    const endlessBtn = document.getElementById('startEndlessBtn'); 
    if(endlessBtn) endlessBtn.onclick = () => { 
      this.sound.playTick(); 
      this.activeWorld = 'ENDLESS'; 
      document.getElementById('startScreen').classList.remove('active'); 
      document.getElementById('startScreen').classList.add('hidden'); 
      this.state = 'PLAYING'; 
    };
    
    document.getElementById('restartBtn').onclick = () => { 
      document.getElementById('gameOverScreen').classList.remove('active');
      document.getElementById('gameOverScreen').classList.add('hidden'); 
      if (this.activeWorld === 'ENDLESS') {
          this.reset();
          this.state = 'LAUNCH';
          this.birdJump();
      } else {
          this.enterStoryState(); 
      }
    };
    
    const endlessGameOver = document.getElementById('startEndlessBtnGameOver');
    if (endlessGameOver) {
      endlessGameOver.onclick = () => {
        document.getElementById('gameOverScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.currentWorldIndex = 'ENDLESS';
        this.reset();
        this.state = 'LAUNCH';
        this.birdJump();
      };
    }

    document.getElementById('mainMenuBtn').onclick = () => {
      document.getElementById('gameOverScreen').classList.remove('active');
      document.getElementById('gameOverScreen').classList.add('hidden'); 
      document.getElementById('startScreen').classList.remove('hidden');
      document.getElementById('startScreen').classList.add('active');
      this.sound.stopAmbiance();
      this.state = 'MENU';
      this.reset();
      this.updateCarousel();
    };

    document.getElementById('nextWorldActionBtn').onclick = () => {
      document.getElementById('mainMenuBtn').click();
      this.currentWorldIndex = 1;
      this.updateCarousel();
    };

    document.getElementById('reviveBtn').onclick = () => {
      const cost = CONFIG.REVIVE_COST || 10;
      if (this.totalCoins < cost) {
        this.sound.playHit();
        return;
      }
      this.totalCoins -= cost;
      this.updateCoinDisplays();
      this.sound.playCoin();

      document.getElementById('gameOverScreen').classList.remove('active');
      document.getElementById('gameOverScreen').classList.add('hidden');
      this.state = 'PLAYING';
      this.bird.y = CONFIG.CANVAS_HEIGHT / 2 - 50;
      this.bird.velocity = -4; 
      this.invincibleTimer = 180; // 3 seconds of invulnerability
      this.pillars = []; this.coins = []; this.minions = [];
      this.snowballs = []; this.icicles = []; this.penguinMinions = [];
      this.miniTeslas = []; this.electricBats = []; this.gravityGates = [];
      this.bossFeathers = []; this.powerOrbs = []; this.heroProjectiles = []; this.rain = [];
      this.spawnTimer = 60; 
      this.screenShake = 0;
      if(this.boss.active && this.boss.state === 'EXPLODING') {
         this.boss.active = false;
         this.score = 0; 
      }
      document.getElementById('gameHud').classList.remove('hidden');
      this.birdJump();
    };
    
    const dummyNames = ['SkyWalker', 'Birdy', 'Faker', 'ProGamer', 'NoobMaster', 'IceKing', 'Feather', 'Glider', 'Ninja', 'Ghost'];
    document.getElementById('leaderboardBtn').onclick = () => {
      const list = document.getElementById('leaderboardList');
      list.innerHTML = '';
      // Generate 5 fake scores
      const players = [];
      for(let i=0; i<5; i++) {
        players.push({
          name: dummyNames[Math.floor(Math.random() * dummyNames.length)] + Math.floor(Math.random()*99),
          score: Math.floor(Math.random() * 80) + 20
        });
      }
      // Add current player 
      players.push({ name: I18N[this.lang].you, score: this.highScore });
      players.sort((a,b) => b.score - a.score);
      
      const colors = ['#f1c40f', '#bdc3c7', '#cd7f32', '#34495e', '#34495e', '#34495e'];
      players.forEach((p, index) => {
        const isYou = p.name === 'أنت';
        list.innerHTML += `<li style="display: flex; justify-content: space-between; padding: 10px; background: ${isYou ? 'rgba(52, 152, 219, 0.2)' : 'rgba(0,0,0,0.2)'}; border-radius: 5px; font-weight: ${isYou ? 'bold' : 'normal'}; border: ${isYou ? '1px solid #3498db' : 'none'}">
          <span><span style="color: ${colors[index]}; width: 20px; display: inline-block;">#${index+1}</span> ${p.name}</span>
          <span style="color: #f1c40f;">${p.score} ⭐</span>
        </li>`;
      });
      document.getElementById('leaderboardScreen').classList.remove('hidden');
      document.getElementById('leaderboardScreen').classList.add('active');
    };

    document.getElementById('closeLeaderboardBtn').onclick = () => {
      document.getElementById('leaderboardScreen').classList.remove('active');
      document.getElementById('leaderboardScreen').classList.add('hidden');
    };

    document.getElementById('shopBtnStart').onclick = () => { 
      document.getElementById('startScreen').classList.remove('active');
      document.getElementById('startScreen').classList.add('hidden'); 
      document.getElementById('shopScreen').classList.remove('hidden'); 
      document.getElementById('shopScreen').classList.add('active');
      this.renderShop(); 
    };
    
    document.getElementById('shopBtnGameOver').onclick = () => { 
      document.getElementById('gameOverScreen').classList.remove('active');
      document.getElementById('gameOverScreen').classList.add('hidden'); 
      document.getElementById('shopScreen').classList.remove('hidden'); 
      document.getElementById('shopScreen').classList.add('active');
      this.renderShop(); 
    };
    
    document.getElementById('closeShopBtn').onclick = () => { 
      document.getElementById('shopScreen').classList.remove('active');
      document.getElementById('shopScreen').classList.add('hidden'); 
      document.getElementById('startScreen').classList.remove('hidden'); 
      document.getElementById('startScreen').classList.add('active');
    };
    
    document.getElementById('soundToggleBtn').onclick = (e) => { 
      e.stopPropagation(); 
      const isMuted = this.sound.toggleMute();
      document.getElementById('soundToggleBtn').innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"><use href="#${isMuted ? 'sound-off-svg' : 'sound-on-svg'}"></use></svg>`; 
    };

    const handleInput = (e) => {
      if (this.state === 'MENU') return;
      if (e.target && (e.target.tagName === 'BUTTON' || (e.target.closest && e.target.closest('button')))) return;
      if (e.preventDefault && typeof e.preventDefault === 'function') e.preventDefault();
      this.sound.init();

      if (this.state === 'STORY' || this.state === 'BOSS_INTRO' || this.state === 'BOSS_OUTRO') {
        if (!this.storyCompleted) {
          this.storyText1 = this.storyLines[0];
          this.storyText2 = this.storyLines[1];
          this.storyCompleted = true;
          this.sound.playTick();
        } else {
          if (this.state === 'STORY') this.launchDash();
          else if (this.state === 'BOSS_INTRO') {
            this.state = 'PLAYING';
            this.boss.state = 'IDLE';
            this.boss.timer = -60;
            this.bird.velocity = -4; 
            this.sound.playThunder();
            this.screenShake = 10;
            this.lightning = 1;
            document.getElementById('bossWarning').classList.add('hidden');
            document.getElementById('gameHud').classList.remove('hidden');
          } else if (this.state === 'BOSS_OUTRO') {
            // After boss outro dialogue, show victory / next world
            this.gameOver(true);
          }
        }
      } 
      else if (this.state === 'PLAYING') {
        this.birdJump();
      }
    };

    window.addEventListener('pointerdown', handleInput, { passive: false });
    window.addEventListener('keydown', (e) => { if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) handleInput(e); });
  }

  reset() {
    this.score = 0; this.sessionCoins = 0; this.fever = 0; this.feverActive = false; this.feverTimer = 0;
    this.frame = 0; this.pillars = []; this.coins = []; this.particles = []; this.floatingText = [];
    this.minions = []; this.bossFeathers = []; this.powerOrbs = []; this.heroProjectiles = []; this.rain = [];
    this.penguinMinions = []; this.icicles = []; this.snowballs = [];
    this.miniTeslas = []; this.electricBats = []; this.gravityGates = [];
    this.screenShake = 0; this.groundOffset = 0; this.lightning = 0;
    this.spawnTimer = 0;
    this.boss = { active: false, state: 'IDLE', hp: CONFIG.BOSS_HP, x: CONFIG.CANVAS_WIDTH + 100, y: CONFIG.CANVAS_HEIGHT/2, timer: 0, enraged: false, type: 'crow' };
    this.bird = { x: 80, y: CONFIG.CANVAS_HEIGHT / 2 - 40, velocity: 0, rotation: 0, wingCycle: 0 };
    this.owl = { x: CONFIG.CANVAS_WIDTH + 100, y: CONFIG.CANVAS_HEIGHT/2 };
    
    // Character Perks Initialization
    this.cyberShieldUsed = false;
    this.invincibleTimer = 0;
    if (this.activeSkin === 'phoenix') {
      this.fever = 25; // Phoenix starts with 25% precharged fever!
    }
    
    // World 2 specific
    this.snowballs = []; this.icicles = []; this.penguinMinions = [];
    this.windForce = 0; this.windTimer = 0;
    
    // Set initial colors based on world
    if (this.activeWorld === 2) {
      this.currentTopColor = [...STAGE_COLORS['w3_1'].top];
      this.currentBotColor = [...STAGE_COLORS['w3_1'].bot];
    } else if (this.activeWorld === 1) {
      this.currentTopColor = [...STAGE_COLORS['w2_1'].top];
      this.currentBotColor = [...STAGE_COLORS['w2_1'].bot];
    } else {
      this.currentTopColor = [52, 152, 219];
      this.currentBotColor = [133, 193, 233];
    }
    
    document.getElementById('currentScoreDisplay').textContent = '0';
    document.getElementById('sessionCoinDisplay').textContent = '0';
    const maxFever = this.activeWorld === 2 ? 150 : (this.activeWorld === 1 ? 120 : CONFIG.FEVER_MAX);
    document.getElementById('feverBarFill').style.width = `${Math.min(100, (this.fever / maxFever) * 100)}%`;
    document.getElementById('stageDisplay').textContent = this.activeWorld === 2 ? I18N[this.lang].w3_stage1 : (this.activeWorld === 1 ? I18N[this.lang].w2_stage1 : I18N[this.lang].stage1);
  }

  showToast(message) {
    const toast = document.getElementById('gameToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    void toast.offsetWidth;
    toast.classList.add('show');
    
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 250);
    }, 2400);
  }

  drawWrappedDialogueText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return y;
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + (line ? ' ' : '') + words[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    }
    return currentY;
  }

  startDialogue(linesArray) {
    this.storyLines = linesArray;
    this.storyCurrentLine = 0; this.storyCharIndex = 0;
    this.storyText1 = ''; this.storyText2 = '';
    this.storyCompleted = false;
  }

  enterStoryState() {
    this.reset();
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('startScreen').classList.add('hidden');
    this.state = 'STORY';
    if (this.activeWorld === 0) {
      this.sound.startRuinsAmbiance();
    } else {
      this.sound.stopAmbiance();
    }
    if (this.activeWorld === 2) {
      // World 3: Dives down through storm clouds with lightning
      this.bird.x = -40;
      this.bird.y = 70;
      this.bird.rotation = 0.3;
      this.sound.playThunder();
      this.lightning = 0.8;
      this.startDialogue([I18N[this.lang].w3_storyL1, I18N[this.lang].w3_storyL2]);
    } else if (this.activeWorld === 1) {
      // World 2: Enters through blizzard
      this.bird.x = -50;
      this.bird.y = CONFIG.CANVAS_HEIGHT / 2 - 20;
      this.bird.rotation = 0.1;
      this.startDialogue([I18N[this.lang].w2_storyL1, I18N[this.lang].w2_storyL2]);
    } else {
      // World 1: Trapped in iron cage
      this.bird.x = 80;
      this.bird.y = CONFIG.CANVAS_HEIGHT / 2 - 20;
      this.bird.rotation = 0;
      this.startDialogue([I18N[this.lang].storyL1, I18N[this.lang].storyL2]);
    }
  }

  launchDash() {
    this.state = 'LAUNCH';
    this.sound.playSmash();
    this.screenShake = 25;
    
    const hintEl = document.getElementById('gameHint');
    const hints = I18N[this.lang].hints;
    if (hints && hints.length > 0) {
        hintEl.textContent = hints[Math.floor(Math.random() * hints.length)];
        hintEl.classList.remove('hidden');
        setTimeout(() => { hintEl.classList.add('hidden'); }, 6000);
    }
    
    if (this.activeWorld === 0) {
        // Break cage bars with metal sparks
        for (let i = 0; i < 20; i++) {
          this.particles.push({
            x: this.bird.x + (Math.random()-0.5)*50, y: this.bird.y + (Math.random()-0.5)*50,
            vx: (Math.random()-0.5)*15, vy: (Math.random()-0.5)*15 - 5,
            size: Math.random()*2 + 1, color: '#7f8c8d', life: 1, isBar: true, 
            rot: Math.random()*Math.PI, vrot: (Math.random()-0.5)*0.5
          });
          this.particles.push({
            x: this.bird.x + (Math.random()-0.5)*30, y: this.bird.y + (Math.random()-0.5)*30,
            vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20,
            size: Math.random()*4 + 2, color: '#f39c12', life: 0.8
          });
        }
    } else if (this.activeWorld === 1) {
        // Frost crystal burst
        for (let i = 0; i < 25; i++) {
          this.particles.push({
            x: this.bird.x + (Math.random()-0.5)*40, y: this.bird.y + (Math.random()-0.5)*40,
            vx: (Math.random()-0.5)*16, vy: (Math.random()-0.5)*16,
            size: Math.random()*4 + 2, color: '#93c5fd', life: 1
          });
        }
    } else if (this.activeWorld === 2) {
        // Lightning Sonic Boom
        this.sound.playThunder();
        this.lightning = 1;
        for (let i = 0; i < 30; i++) {
          this.particles.push({
            x: this.bird.x + (Math.random()-0.5)*40, y: this.bird.y + (Math.random()-0.5)*40,
            vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20,
            size: Math.random()*5 + 2, color: '#38bdf8', life: 1.2
          });
        }
    }

    let dashFrames = 0;
    const trailColor = this.activeWorld === 2 ? '#38bdf8' : (this.activeWorld === 1 ? '#93c5fd' : '#fff');
    const dashAnim = setInterval(() => {
      dashFrames++;
      this.bird.x += 1; this.bird.y -= 0.5; this.bird.rotation = -0.4;
      this.particles.push({ x: this.bird.x, y: this.bird.y, vx: -12, vy: (Math.random()-0.5)*5, size: Math.random()*4+2, color: trailColor, life: 1 });
      
      if(dashFrames > 20) { 
        clearInterval(dashAnim);
        this.bird.x = 80;
        this.state = 'PLAYING';
        this.spawnTimer = 60; 
        document.getElementById('gameHud').classList.remove('hidden');
        this.birdJump();
      }
    }, 16);
  }

  birdJump() {
    const jumpPower = (this.activeSkin === 'pigeon') ? CONFIG.JUMP_FORCE * 1.05 : CONFIG.JUMP_FORCE;
    this.bird.velocity = this.gravityFlipped ? -jumpPower : jumpPower; this.sound.playFlap();
    for (let i = 0; i < 4; i++) this.particles.push({ x: this.bird.x - 10, y: this.bird.y + 4, vx: -3 - Math.random()*2, vy: (Math.random()-0.5)*3, size: Math.random()*3+2, color: SKINS[this.activeSkin].maskColor, life: 0.8 });
  }

  gameOver(isVictory = false) {
    if (this.state === 'GAMEOVER') return;

    // Ghost Bird Passive Perk: 15% chance to dodge fatal hit
    if (!isVictory && this.activeSkin === 'ghost' && Math.random() < 0.15) {
      this.sound.playLaser();
      this.invincibleTimer = 60;
      const dodgeMsg = (I18N[this.lang] && I18N[this.lang].dodgeText) || 'DODGE! 💨';
      this.floatingText.push({ text: dodgeMsg, x: this.bird.x, y: this.bird.y - 25, life: 1.2, color: '#818cf8' });
      for (let k=0; k<15; k++) this.particles.push({ x: this.bird.x, y: this.bird.y, vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8, size: 3, color: '#c7d2fe', life: 0.8 });
      return;
    }

    this.state = 'GAMEOVER'; this.screenShake = 20;
    this.sound.stopAmbiance();
    
    // sessionCoins is recorded before resetting
    const earned = this.sessionCoins;
    this.totalCoins += this.sessionCoins; 
    this.sessionCoins = 0; 
    this.updateCoinDisplays();
    document.getElementById('gameHud').classList.add('hidden');

    const isNewHighScore = this.activeWorld === 1 ? (this.score > this.highScoreW2) : (this.score > this.highScore);
    if (isNewHighScore) {
      if (this.activeWorld === 1) {
        this.highScoreW2 = this.score; safeSet('fh_highscore_w2', this.highScoreW2.toString());
      } else {
        this.highScore = this.score; safeSet('fh_highscore', this.highScore.toString());
      }
    }

    let starCount = 0;
    if (this.score >= CONFIG.STAGE1_END) starCount = 1;
    if (this.score >= CONFIG.STAGE2_END) starCount = 2;
    if (isVictory) starCount = 3;

    if (isVictory) {
      if (this.activeWorld === 2) {
        document.getElementById('endGameTitle').textContent = I18N[this.lang].w3_winText;
        this.unlockedSkins.add('eagle');
        safeSet('fh_unlocked_skins', JSON.stringify([...this.unlockedSkins]));
      } else if (this.activeWorld === 1) {
        document.getElementById('endGameTitle').textContent = I18N[this.lang].w2_winText;
        this.w2Completed = true; safeSet('fh_w2_completed', 'true');
        this.unlockedSkins.add('eagle');
        safeSet('fh_unlocked_skins', JSON.stringify([...this.unlockedSkins]));
      } else {
        document.getElementById('endGameTitle').textContent = I18N[this.lang].winText;
        this.w1Completed = true; safeSet('fh_w1_completed', 'true');
      }
      document.getElementById('endGameTitle').style.color = '#f1c40f';
      this.sound.playScore(); this.sound.playScore();
      document.getElementById('nextWorldActionBtn').classList.remove('hidden');
    } else {
      document.getElementById('endGameTitle').textContent = I18N[this.lang].gameOverTitle;
      document.getElementById('endGameTitle').style.color = '#e74c3c';
      this.sound.playHit();
      for (let i = 0; i < 30; i++) this.particles.push({ x: this.bird.x, y: this.bird.y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, size: Math.random()*5+3, color: SKINS[this.activeSkin].body, life: 1 });
      document.getElementById('nextWorldActionBtn').classList.add('hidden');
    }
    
    const sizes = ['1.5rem', '2rem', '1.5rem'];
    let starsHtml = '';
    for(let i=0; i<3; i++) {
       const isGlow = isNewHighScore && i < starCount ? 'glow' : '';
       const isEmpty = i < starCount ? '' : 'empty';
       starsHtml += `<span class="star ${isEmpty} ${isGlow}" style="font-size: ${sizes[i]};"><svg width="1em" height="1em" viewBox="0 0 24 24" style="vertical-align: text-bottom;"><use href="#star-svg"></use></svg></span>`;
    }
    document.getElementById('runStarsContainer').innerHTML = starsHtml;

    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('highScore').textContent = this.highScore;
    document.getElementById('earnedCoins').textContent = earned; 
    
    setTimeout(() => { 
      document.getElementById('gameOverScreen').classList.remove('hidden');
      document.getElementById('gameOverScreen').classList.add('active'); 
    }, 1000);
  }

  update() {
    this.frame++;
    this.particles.forEach(p => { 
      p.x += p.vx; p.y += p.vy; 
      if(!p.isLine && !p.isBar) p.vy += 0.15;
      if(p.isBar) { p.vy += 0.3; p.rot += p.vrot; }
      p.life -= 0.02; 
    });
    this.particles = this.particles.filter(p => p.life > 0);
    this.floatingText.forEach(f => { f.y -= 1; f.life -= 0.02; });
    this.floatingText = this.floatingText.filter(f => f.life > 0);
    if (this.screenShake > 0) { this.screenShake *= 0.85; if(this.screenShake < 0.5) this.screenShake = 0; }
    if (this.lightning > 0) { this.lightning -= 0.05; }

    let prefix = this.activeWorld === 2 ? 'w3_' : (this.activeWorld === 1 ? 'w2_' : '');
    let stageKey = (this.state === 'STORY' || this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY') ? prefix + 'STORY'
                 : (this.boss.active || this.state === 'BOSS_INTRO') ? prefix + 'BOSS'
                 : (this.score >= CONFIG.STAGE1_END) ? prefix + '2'
                 : (prefix ? prefix + '1' : 1);
    const targetColors = STAGE_COLORS[stageKey] || STAGE_COLORS[1];

    for (let i = 0; i < 3; i++) {
      this.currentTopColor[i] += (targetColors.top[i] - this.currentTopColor[i]) * 0.03;
      this.currentBotColor[i] += (targetColors.bot[i] - this.currentBotColor[i]) * 0.03;
    }

    if (this.boss.active || this.state === 'BOSS_INTRO') {
       if(Math.random() < 0.3 && this.gfxEnabled !== false) this.rain.push({ x: Math.random() * CONFIG.CANVAS_WIDTH, y: -10, vy: 15 + Math.random()*10 });
    }
    this.rain.forEach(r => r.y += r.vy);
    this.rain = this.rain.filter(r => r.y < CONFIG.CANVAS_HEIGHT);

    if (this.state === 'MENU') {
      this.bird.wingCycle = 0; this.bird.rotation = 0; return;
    }

    if (this.gfxEnabled !== false && this.frame % 3 === 0) {
      if (SKINS[this.activeSkin].acc === 'flame') {
        this.particles.push({ x: this.bird.x - 10, y: this.bird.y + (Math.random()-0.5)*10, vx: -3 - Math.random()*2, vy: (Math.random()-0.5)*3, size: Math.random()*3+1, color: '#f97316', life: 0.8 });
      } else if (SKINS[this.activeSkin].acc === 'aura') {
        this.particles.push({ x: this.bird.x, y: this.bird.y + (Math.random()-0.5)*15, vx: -1 - Math.random(), vy: (Math.random()-0.5)*2, size: Math.random()*4+2, color: '#818cf8', life: 0.6 });
      }
    }

    if (this.state === 'FLY_AWAY') {
      this.bird.wingCycle = Math.sin(this.frame * 0.8);
      this.bird.rotation = -0.2;
      this.bird.x += 4;
      this.bird.y -= 1;
      
      this.owl.x += 4;
      this.owl.y -= 1;
      
      if (this.bird.x > CONFIG.CANVAS_WIDTH + 50) {
         this.gameOver(true);
      }
      return;
    }

    if (this.state === 'STORY' || this.state === 'BOSS_INTRO' || this.state === 'BOSS_OUTRO' || this.state === 'BOSS_WARNING') {
      this.bird.wingCycle = 0; this.bird.rotation = 0;
      
      if (this.state === 'STORY') {
        if (this.activeWorld === 2) {
          // World 3: Dives in from top-left storm sky
          if (this.bird.x < 80) {
            this.bird.x += 2.5;
            this.bird.y += ((CONFIG.CANVAS_HEIGHT / 2 - 20) - this.bird.y) * 0.08;
            this.bird.rotation = 0.2;
            if (this.frame % 2 === 0) {
              this.particles.push({ x: this.bird.x, y: this.bird.y, vx: -3 - Math.random()*2, vy: (Math.random()-0.5)*3, size: 2, color: '#38bdf8', life: 0.5 });
            }
          } else {
            this.bird.x = 80;
            this.bird.y = (CONFIG.CANVAS_HEIGHT / 2 - 20) + Math.sin(this.frame * 0.1) * 4;
            this.bird.rotation = 0;
          }
          this.bird.wingCycle = Math.sin(this.frame * 0.5);
        } else if (this.activeWorld === 1) {
          // World 2: Fly in through blizzard
          if (this.bird.x < 80) {
            this.bird.x += 1.8;
            this.bird.rotation = 0.2;
          } else {
            this.bird.x = 80;
            this.bird.rotation = 0;
          }
          this.bird.y = (CONFIG.CANVAS_HEIGHT / 2 - 20) + Math.sin(this.frame * 0.1) * 5;
          this.bird.wingCycle = Math.sin(this.frame * 0.5); 
        } else {
          // World 1: In cage
          this.bird.x = 80;
          this.bird.y = (CONFIG.CANVAS_HEIGHT / 2 - 20) + Math.sin(this.frame * 0.08) * 3;
          this.bird.wingCycle = Math.sin(this.frame * 0.3);
        }
      }
      
      if (this.state === 'BOSS_OUTRO') {
        if (this.owl.x > CONFIG.CANVAS_WIDTH / 2 + 50) this.owl.x -= 3;
        this.owl.y += Math.sin(this.frame * 0.1) * 0.5;
        
        if (this.bird.x < CONFIG.CANVAS_WIDTH / 2 - 50) this.bird.x += 2;
      }

      if (!this.storyCompleted && this.frame % 3 === 0) {
        if (this.storyCurrentLine === 0) {
          if (this.storyCharIndex < this.storyLines[0].length) {
            this.storyText1 += this.storyLines[0][this.storyCharIndex];
            this.storyCharIndex++; this.sound.playTick();
          } else { this.storyCurrentLine = 1; this.storyCharIndex = 0; }
        } else if (this.storyCurrentLine === 1) {
          if (this.storyCharIndex < this.storyLines[1].length) {
            this.storyText2 += this.storyLines[1][this.storyCharIndex];
            this.storyCharIndex++; this.sound.playTick();
          } else { this.storyCompleted = true; }
        }
      }
      if (this.state === 'STORY') return; 
    }

    if (this.state === 'LAUNCH') return;

    let currentSpeed = this.feverActive ? CONFIG.SPEED_FEVER : CONFIG.SPEED_NORMAL;
    if (this.activeWorld === 1) currentSpeed = this.feverActive ? CONFIG.SPEED_FEVER : CONFIG.W2_SPEED;
    if (this.state !== 'GAMEOVER') this.groundOffset = (this.groundOffset + currentSpeed) % 24;

    // Wind Gusts Mechanic (World 2) - Removed due to user feedback
    /*
    if (this.activeWorld === 1 && this.state === 'PLAYING') {
      this.windTimer++;
      if (this.windTimer > CONFIG.WIND_INTERVAL) {
        if (this.windTimer === CONFIG.WIND_INTERVAL + 1) this.sound.playLaunch(); // Wind sound effect
        this.windForce = -2.5; // Push back
        if (this.windTimer > CONFIG.WIND_INTERVAL + 60) {
          this.windForce = 0;
          this.windTimer = 0;
        }
        // Wind particles
        if (this.frame % 2 === 0) {
           this.particles.push({ x: CONFIG.CANVAS_WIDTH, y: Math.random() * CONFIG.CANVAS_HEIGHT, vx: -15, vy: 0, size: 2, color: 'rgba(255,255,255,0.6)', life: 0.8, isLine: true });
        }
      } else {
        this.windForce *= 0.9; // Decay
      }
      if (!this.feverActive) this.bird.x = Math.max(20, Math.min(150, this.bird.x + this.windForce));
    }
    */

    if (this.feverActive) {
      this.feverTimer--;
      document.getElementById('feverBarFill').style.width = `${(this.feverTimer/CONFIG.FEVER_DURATION)*100}%`;
      if(this.frame%2===0) this.particles.push({ x: CONFIG.CANVAS_WIDTH, y: Math.random()*CONFIG.CANVAS_HEIGHT, vx: -20, vy: 0, size: Math.random()*3+1, color: '#fff', life: 0.5, isLine: true });
      if (this.feverTimer <= 0) { this.feverActive = false; this.fever = 0; document.getElementById('feverBarFill').style.width = '0%'; document.getElementById('feverBarFill').classList.remove('max'); }
      // Return bird to normal X if wind pushed it
      if (this.bird.x < 80) this.bird.x += (80 - this.bird.x) * 0.1;
    }

    if (this.invincibleTimer > 0) this.invincibleTimer--;

    this.heroProjectiles.forEach(p => {
      // Homing logic: If it's the Penguin boss and he's on the ground, aim downward directly at the boss
      if (this.boss.active && this.boss.type === 'penguin' && this.boss.state !== 'EXPLODING') {
         const targetY = this.boss.y - 25;
         const angle = Math.atan2(targetY - p.y, this.boss.x - p.x);
         p.x += Math.cos(angle) * 22;
         p.y += Math.sin(angle) * 22;
      } else {
         p.x += 24;
      }
      
      this.particles.push({ x: p.x, y: p.y, vx: Math.random()*-2, vy: (Math.random()-0.5)*2, size: 2, color: '#38bdf8', life: 0.5 });
      
      // Ground hit for missed shots
      if (p.y >= CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT) {
        p.active = false;
        for (let i=0; i<6; i++) this.particles.push({ x: p.x, y: CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT, vx: (Math.random()-0.5)*8, vy: -Math.random()*4, size: 2, color: '#38bdf8', life: 0.4 });
      }

      if (this.boss.active && this.boss.state !== 'EXPLODING' && this.boss.state !== 'DODGING' && Math.hypot(p.x - this.boss.x, p.y - (this.boss.type === 'penguin' ? this.boss.y - 25 : this.boss.y)) < (this.boss.type === 'penguin' ? 45 : 50)) {
        p.active = false;
        if (this.boss.type === 'thunderbird' && this.boss.shield > 0) {
          this.boss.shield--;
          this.sound.playThunder();
          this.lightning = 0.8;
          this.screenShake = 12;
          for (let i = 0; i < 15; i++) {
            this.particles.push({ x: this.boss.x + (Math.random()-0.5)*30, y: this.boss.y + (Math.random()-0.5)*30, vx: (Math.random()-0.5)*15, vy: (Math.random()-0.5)*15, size: 4, color: '#38bdf8', life: 0.8 });
          }
        } else {
          this.boss.hp--;
          this.sound.playHit();
          this.screenShake = 15;
          for (let i=0; i<10; i++) this.particles.push({x: this.boss.x, y: this.boss.y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, size: Math.random()*4+2, color: '#f1c40f', life: 0.8});
          if (this.boss.hp <= 0) {
            this.boss.state = 'EXPLODING';
            this.boss.timer = 0;
            this.sound.playLaunch();
          }
        }
      }
    });
    this.heroProjectiles = this.heroProjectiles.filter(p => p.active && p.x < CONFIG.CANVAS_WIDTH + 50);

    // BIRD GRAVITY AND MOVEMENT
    const isExploding = this.boss.active && this.boss.state === 'EXPLODING';
    if ((this.state === 'PLAYING' && !isExploding) || this.state === 'GAMEOVER') {
      this.bird.velocity += this.gravityFlipped ? -CONFIG.GRAVITY : CONFIG.GRAVITY;
      if (this.bird.velocity > CONFIG.MAX_VELOCITY) this.bird.velocity = CONFIG.MAX_VELOCITY;
      this.bird.y += this.bird.velocity;
      if (this.bird.velocity < 0) this.bird.rotation = -0.3; else { this.bird.rotation += 0.05; if(this.bird.rotation>1.2) this.bird.rotation = 1.2; }
      
      const floorY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - CONFIG.BIRD_RADIUS;
      if (this.bird.y >= floorY) { 
        this.bird.y = floorY; 
        if (this.state === 'PLAYING' && (!this.boss.active || !this.feverActive)) {
          if (this.invincibleTimer <= 0) {
            if (this.activeSkin === 'cyber' && !this.cyberShieldUsed) {
              this.cyberShieldUsed = true;
              this.bird.velocity = -6;
              this.sound.playLaser();
              this.invincibleTimer = 40;
              this.floatingText.push({ text: 'SHIELD! 🛡️', x: this.bird.x, y: this.bird.y - 20, life: 1.2, color: '#06b6d4' });
              for (let k=0; k<15; k++) this.particles.push({ x: this.bird.x, y: floorY, vx: (Math.random()-0.5)*8, vy: -Math.random()*6, size: 3, color: '#06b6d4', life: 0.8 });
            } else {
              this.gameOver();
            }
          } else {
            this.bird.velocity = -4; // Safe bounce during invincibility
          }
        }
      }
      if (this.bird.y < 0) { this.bird.y = 0; this.bird.velocity = 0; }
    } else if (this.state === 'BOSS_INTRO' || this.state === 'BOSS_OUTRO' || this.state === 'BOSS_WARNING' || isExploding) {
      this.bird.velocity = 0;
      this.bird.rotation = 0;
      // Fly towards center gently if exploding or outro
      if (isExploding || this.state === 'BOSS_OUTRO') {
        this.bird.y += ((CONFIG.CANVAS_HEIGHT / 2 - 40) - this.bird.y) * 0.05;
      }
      this.bird.y += Math.sin(this.frame * 0.1) * 0.5;
    }

    this.bird.wingCycle = (this.bird.velocity < 0 || this.feverActive || this.state === 'BOSS_OUTRO' || this.state === 'BOSS_INTRO' || this.state === 'BOSS_WARNING' || isExploding) ? Math.sin(this.frame * 0.5) : 0;

    if (this.state === 'PLAYING' || this.state === 'BOSS_WARNING') {
      if (this.state === 'PLAYING') {
        if (this.score === CONFIG.STAGE1_END && !this.boss.active) {
          document.getElementById('stageDisplay').textContent = this.activeWorld === 2 ? I18N[this.lang].w3_stage2 : (this.activeWorld === 1 ? I18N[this.lang].w2_stage2 : I18N[this.lang].stage2);
        }
        if (this.score >= CONFIG.STAGE2_END && !this.boss.active) this.activateBoss();
      }
      
      if (this.boss.active) {
        this.updateBoss();
      } else if (this.state === 'PLAYING') {
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
          this.spawnTimer = this.feverActive ? CONFIG.SPAWN_FEVER : CONFIG.SPAWN_NORMAL;
          
          let gap = this.activeWorld === 2 ? CONFIG.W3_GAP_SIZE : this.activeWorld === 1 ? CONFIG.W2_GAP_SIZE : CONFIG.GAP_SIZE;
          const topH = CONFIG.PILLAR_MIN_HEIGHT + Math.random() * (CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - gap - CONFIG.PILLAR_MIN_HEIGHT*2);
          
          let vy = 0; 
          if (this.score >= CONFIG.STAGE1_END && (this.activeWorld === 0 || this.activeWorld === 1) && Math.random() > 0.5) {
             vy = (Math.random()>0.5?1:-1) * (0.5 + Math.random());
          }
          
          const newPillar = { x: CONFIG.CANVAS_WIDTH, topHeight: topH, width: 60, scored: false, vy: vy, gapY: topH + gap/2, smashed: false };
          this.pillars.push(newPillar);
          if (Math.random() < 0.8) this.coins.push({ x: CONFIG.CANVAS_WIDTH + 30, y: topH + gap/2, radius: 12, collected: false });
          
          // World 3 Mini Teslas and Gravity Gates
          if (this.activeWorld === 2 && Math.random() < 0.4) { this.miniTeslas.push({ x: CONFIG.CANVAS_WIDTH + 30, y: topH + gap, timer: 0, vx: -currentSpeed, pillar: newPillar }); }
          if (this.activeWorld === 2 && this.score >= CONFIG.STAGE1_END && Math.random() < 0.3) { this.gravityGates.push({ x: CONFIG.CANVAS_WIDTH + 30, y: topH + gap/2, radius: 25 }); }
          if (this.activeWorld === 1 && Math.random() < 0.4) {
             this.penguinMinions.push({ 
               x: CONFIG.CANVAS_WIDTH + 30, 
               y: topH + gap, 
               timer: 0, 
               pillar: newPillar
             });
          }
        }

        // Minions (Crow for W1, Icicles for W2, Electric Bats for W3)
        if (this.score >= CONFIG.STAGE1_END && Math.random() < 0.03) {
           if (this.activeWorld === 2 && this.electricBats.length < 3) {
              this.electricBats.push({ 
                x: CONFIG.CANVAS_WIDTH + 20, 
                y: 60 + Math.random() * (CONFIG.CANVAS_HEIGHT - 220), 
                vx: -4 - Math.random() * 2, 
                timer: 0 
              });
           } else if (this.activeWorld === 1 && this.icicles.length < 3) {
              this.icicles.push({ 
                x: CONFIG.CANVAS_WIDTH + 20 + Math.random() * 80, 
                y: -30, 
                state: 'HANG', 
                dropX: 40 + Math.random() * (CONFIG.CANVAS_WIDTH - 80), 
                timer: 0 
              });
           } else if (this.activeWorld === 0 && this.minions.length < 2) {
              this.minions.push({ x: CONFIG.CANVAS_WIDTH + 20, y: 50 + Math.random() * (CONFIG.CANVAS_HEIGHT - 200), vx: -3 - Math.random() * 2 });
           }
        }
        
        // Update W1 Minions
        this.minions.forEach(m => {
          m.x += m.vx; m.y += Math.sin(this.frame * 0.1) * 2;
          if (Math.hypot(this.bird.x - m.x, this.bird.y - m.y) < CONFIG.BIRD_RADIUS + 8) {
            if (this.feverActive) { m.x = -100; this.sound.playHit(); for(let k=0; k<10; k++) this.particles.push({ x: m.x, y: m.y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, size: 2, color: '#1e293b', life: 1 }); } 
            else if (this.invincibleTimer <= 0) this.gameOver();
          }
        });
        this.minions = this.minions.filter(m => m.x > -20);
        
        // Update W2 Penguin Minions (they ride the pillars and throw snowballs forward)
        this.penguinMinions.forEach(p => {
          if (p.pillar) {
            p.x = p.pillar.x + 30;
            let gap = this.activeWorld === 1 ? CONFIG.W2_GAP_SIZE : CONFIG.GAP_SIZE;
            p.y = p.pillar.topHeight + gap;
            if (p.pillar.smashed || p.pillar.x + p.pillar.width < -20) {
              p.x = -100;
              return;
            }
          } else {
            p.x -= currentSpeed;
          }
          p.timer++;
          // Only throw snowballs if in front of the bird
          if (p.timer % 90 === 0 && p.x < CONFIG.CANVAS_WIDTH && p.x > this.bird.x + 30) {
             const speedVx = -4 - Math.random() * 3;
             const angleVy = (Math.random() - 0.5) * 2;
             this.snowballs.push({ x: p.x - 10, y: p.y - 10, vx: speedVx, vy: angleVy });
             this.sound.playFlap();
          }
        });
        this.penguinMinions = this.penguinMinions.filter(p => p.x > -40);

        // Update W2 Snowballs in normal stage play
        this.snowballs.forEach(s => {
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.04;
          if (this.invincibleTimer <= 0 && Math.hypot(this.bird.x - s.x, this.bird.y - s.y) < CONFIG.BIRD_RADIUS + 8) {
            if (this.feverActive || (this.boss.active && this.boss.state === 'EXPLODING') || this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY') {
              s.x = -200;
            } else {
              this.gameOver(false);
            }
          }
        });
        this.snowballs = this.snowballs.filter(s => s.x > -50 && s.x < CONFIG.CANVAS_WIDTH + 50 && s.y < CONFIG.CANVAS_HEIGHT);

        // Update W2 Icicles (random falling hazards)
        this.icicles.forEach(ice => {
           ice.x -= currentSpeed;
           if (ice.state === 'HANG') {
              if (ice.x <= ice.dropX) {
                 ice.state = 'FALL';
                 this.sound.playLaunch();
              }
           } else if (ice.state === 'FALL') {
              ice.y += CONFIG.ICICLE_FALL_SPEED;
              // Collision
              if (this.invincibleTimer <= 0 && ice.x > this.bird.x - 20 && ice.x < this.bird.x + 20 && ice.y > this.bird.y - 20 && ice.y < this.bird.y + 20) {
                 if (this.feverActive) ice.y = 1000; else this.gameOver();
              }
              // Shatter on ground
              if (ice.y > CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT) {
                 ice.y = 1000;
                 for (let k=0; k<8; k++) this.particles.push({ x: ice.x, y: CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT, vx: (Math.random()-0.5)*8, vy: -Math.random()*5, size: 2, color: '#93c5fd', life: 0.5 });
              }
           }
        });
        this.icicles = this.icicles.filter(ice => ice.y < CONFIG.CANVAS_HEIGHT);

        // Update W3 Mini Teslas (fixed to pillars, despawns when pillar is smashed)
        this.miniTeslas.forEach(m => {
          if (m.pillar) {
            m.x = m.pillar.x + 30;
            let gap = this.activeWorld === 2 ? CONFIG.W3_GAP_SIZE : CONFIG.GAP_SIZE;
            m.y = m.pillar.topHeight + gap;
            if (m.pillar.smashed || m.pillar.x + m.pillar.width < -30) {
              m.x = -100;
              return;
            }
          } else {
            m.x -= currentSpeed;
          }
          m.timer++;
          if (this.invincibleTimer <= 0 && Math.hypot(this.bird.x - m.x, this.bird.y - m.y) < CONFIG.BIRD_RADIUS + 12) {
            if (this.feverActive) {
              m.x = -100;
              this.sound.playHit();
              for(let k=0; k<10; k++) this.particles.push({ x: m.x, y: m.y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, size: 2, color: '#38bdf8', life: 0.8 });
            } else {
              this.gameOver();
            }
          }
        });
        this.miniTeslas = this.miniTeslas.filter(m => m.x > -50);

        for (let i = 0; i < this.pillars.length; i++) {
          const p = this.pillars[i]; p.x -= currentSpeed;
          let gap = this.activeWorld === 2 ? CONFIG.W3_GAP_SIZE : this.activeWorld === 1 ? CONFIG.W2_GAP_SIZE : CONFIG.GAP_SIZE;
          if (p.vy) { p.topHeight += p.vy; p.gapY += p.vy; if (p.topHeight < CONFIG.PILLAR_MIN_HEIGHT || p.topHeight > CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - gap - CONFIG.PILLAR_MIN_HEIGHT) p.vy *= -1; }
          if (!p.smashed) {
            if (!p.scored && p.x + p.width < this.bird.x) {
              p.scored = true;
              const perfectTxt = (I18N[this.lang] && I18N[this.lang].perfectPass) || 'PERFECT +2';
              if (Math.abs(this.bird.y - p.gapY) < 20) { this.score += 2; this.sound.playScore(); this.floatingText.push({ text: perfectTxt, x: this.bird.x, y: this.bird.y-20, life: 1, color: '#f39c12' }); }
              else { this.score += 1; this.sound.playScore(); }
              document.getElementById('currentScoreDisplay').textContent = this.score;
            }
            const hitTop = (this.bird.x+10 > p.x && this.bird.x-10 < p.x+p.width && this.bird.y-10 < p.topHeight);
            const hitBot = (this.bird.x+10 > p.x && this.bird.x-10 < p.x+p.width && this.bird.y+10 > p.topHeight+gap);
            if (hitTop || hitBot) {
              if (this.feverActive) { p.smashed = true; this.screenShake = 10; this.sound.playHit(); for(let k=0; k<15; k++) this.particles.push({ x: p.x, y: this.bird.y+(Math.random()-0.5)*40, vx: Math.random()*5, vy: (Math.random()-0.5)*10, size: Math.random()*6+3, color: '#7f8c8d', life: 1 }); } 
              else if (this.invincibleTimer <= 0) { this.gameOver(); break; }
            }
          }
        }
        this.pillars = this.pillars.filter(p => p.x + p.width > -20);
      }

      // Update W3 Electric Bats (Both normal stage and Boss fight)
      this.electricBats.forEach(b => {
        const speed = b.vx !== undefined ? b.vx : -(currentSpeed + 3.5);
        b.x += speed;
        b.timer = (b.timer || 0) + 1;
        b.y += Math.sin((this.frame + (b.timer * 3)) * 0.1) * 2;
        if (this.invincibleTimer <= 0 && Math.hypot(this.bird.x - b.x, this.bird.y - b.y) < CONFIG.BIRD_RADIUS + 10) {
          if (this.feverActive || (this.boss.active && this.boss.state === 'EXPLODING') || this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY') {
            b.x = -100;
            this.sound.playHit();
            for(let k=0; k<10; k++) this.particles.push({ x: b.x, y: b.y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, size: 2, color: '#8b5cf6', life: 0.8 });
          } else {
            this.gameOver(false);
          }
        }
      });
      this.electricBats = this.electricBats.filter(b => b.x > -50 && b.x < CONFIG.CANVAS_WIDTH + 100);

      // Update Gravity Gates (Both normal stage and Boss fight)
      this.gravityGates.forEach(g => {
        g.x -= currentSpeed;
        const myPil = this.pillars.find(pil => Math.abs(pil.x + 30 - g.x) < 5);
        if(myPil && myPil.smashed) { g.x = -100; return; }
        if (Math.hypot(this.bird.x - g.x, this.bird.y - g.y) < g.radius + CONFIG.BIRD_RADIUS) {
          g.x = -100;
          this.gravityFlipped = !this.gravityFlipped;
          this.sound.playLaser();
          this.screenShake = 10;
        }
      });
      this.gravityGates = this.gravityGates.filter(g => g.x > -50);

      this.powerOrbs.forEach(orb => {
        orb.x -= currentSpeed;
        if (this.invincibleTimer <= 0 && !orb.collected && Math.hypot(this.bird.x - orb.x, this.bird.y - orb.y) < CONFIG.BIRD_RADIUS + 15) {
          orb.collected = true;
          this.sound.playLaser();
          this.heroProjectiles.push({ x: this.bird.x, y: this.bird.y, active: true });
          for(let k=0; k<8; k++) this.particles.push({ x: orb.x, y: orb.y, vx: (Math.random()-0.5)*6, vy: (Math.random()-0.5)*6, size: 3, color: '#38bdf8', life: 1 });
        }
      });
      this.powerOrbs = this.powerOrbs.filter(orb => !orb.collected && orb.x > -20);

      this.coins.forEach(c => {
        c.x -= currentSpeed;
        if (!c.collected) {
          // King Magnet Perk
          const magnetRadius = (this.activeSkin === 'king') ? (this.feverActive ? 240 : 160) : (this.feverActive ? 120 : 0);
          if (magnetRadius > 0 && Math.hypot(this.bird.x - c.x, this.bird.y - c.y) < magnetRadius) {
            c.x += (this.bird.x - c.x) * 0.18;
            c.y += (this.bird.y - c.y) * 0.18;
          }
          if (Math.hypot(this.bird.x - c.x, this.bird.y - c.y) < CONFIG.BIRD_RADIUS + c.radius) {
            c.collected = true;
            const coinVal = (this.activeSkin === 'king') ? 2 : 1;
            this.sessionCoins += coinVal;
            document.getElementById('sessionCoinDisplay').textContent = this.sessionCoins;
            this.sound.playCoin();
            if (!this.feverActive) {
              const maxFever = this.activeWorld === 2 ? 150 : (this.activeWorld === 1 ? 120 : CONFIG.FEVER_MAX);
              this.fever += CONFIG.FEVER_PER_COIN;
              document.getElementById('feverBarFill').style.width = `${Math.min(100, (this.fever/maxFever)*100)}%`;
              if (this.fever >= maxFever) {
                this.feverActive = true;
                // Falcon Perk: 25% longer fever
                this.feverTimer = (this.activeSkin === 'falcon') ? Math.round(CONFIG.FEVER_DURATION * 1.25) : CONFIG.FEVER_DURATION;
                document.getElementById('feverBarFill').classList.add('max');
                this.sound.playLaunch();
                this.screenShake = 8;
              }
            }
            for(let k=0; k<5; k++) this.particles.push({ x: c.x, y: c.y, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4, size: 3, color: '#f1c40f', life: 0.8 });
          }
        }
      });
      this.coins = this.coins.filter(c => !c.collected && c.x > -20);
    }
  }

  drawRuinsBackground() {
    this.ctx.save();
    const gY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;
    
    // Layer 1: Distant Ancient Temple Pediments & Broken Monoliths (Far Parallax)
    this.ctx.fillStyle = 'rgba(51, 65, 85, 0.4)';
    const farOffset = (this.frame * 0.15) % 360;
    for (let x = -360; x < CONFIG.CANVAS_WIDTH + 360; x += 180) {
      const rx = x - farOffset;
      // Distant Acropolis Temple Arch
      this.ctx.beginPath();
      this.ctx.rect(rx + 20, gY - 140, 140, 12);
      this.ctx.moveTo(rx + 10, gY - 140);
      this.ctx.lineTo(rx + 90, gY - 175);
      this.ctx.lineTo(rx + 170, gY - 140);
      this.ctx.fill();
      // Distant Columns
      for (let c = 0; c < 5; c++) {
        this.ctx.fillRect(rx + 30 + c * 26, gY - 128, 8, 128);
      }
    }

    // Layer 2: Mid-ground Mossy Stone Pillars & Crumbling Arches (Mid Parallax)
    this.ctx.fillStyle = '#292524';
    const midOffset = (this.frame * 0.4) % 240;
    for (let x = -240; x < CONFIG.CANVAS_WIDTH + 240; x += 120) {
      const mx = x - midOffset;
      const seed = Math.sin(x * 37) * 1000;
      const rand = seed - Math.floor(seed);
      const colH = 90 + rand * 60;
      const colW = 18;
      
      // Broken Roman/Greek Column
      this.ctx.beginPath();
      this.ctx.fillRect(mx, gY - 10, colW + 8, 10);
      this.ctx.fillRect(mx + 4, gY - colH, colW, colH - 10);
      this.ctx.moveTo(mx + 4, gY - colH);
      this.ctx.lineTo(mx + 12, gY - colH - 8);
      this.ctx.lineTo(mx + colW + 4, gY - colH + 4);
      this.ctx.fill();

      // Green Moss on Stone Base
      this.ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
      this.ctx.fillRect(mx + 2, gY - 14, colW + 10, 5);
      this.ctx.fillStyle = '#292524';
    }

    // Layer 3: Ancient Gnarled Forest Trees with Leaf Clusters (Near Parallax)
    const treeSpacing = 110;
    const nearOffset = (this.frame * 0.7) % treeSpacing;
    for (let x = -treeSpacing * 2; x < CONFIG.CANVAS_WIDTH + treeSpacing * 2; x += treeSpacing) {
      const tx = x - nearOffset;
      const treeIdx = Math.floor((x + this.frame * 0.7) / treeSpacing);
      const tSeed = Math.sin(treeIdx * 73) * 1000;
      const tRand = tSeed - Math.floor(tSeed);
      const th = 110 + tRand * 40;
      const topY = gY - th;

      // Tree Trunk
      this.ctx.fillStyle = '#1c1917';
      this.ctx.beginPath();
      this.ctx.moveTo(tx + 12, gY);
      this.ctx.quadraticCurveTo(tx + 15, gY - th * 0.5, tx + 18, topY + 30);
      this.ctx.lineTo(tx + 24, topY + 30);
      this.ctx.quadraticCurveTo(tx + 21, gY - th * 0.5, tx + 28, gY);
      this.ctx.fill();

      // Lush Leaf Canopy (Deep Ancient Greens)
      this.ctx.fillStyle = '#14532d';
      this.ctx.beginPath();
      this.ctx.arc(tx + 20, topY + 25, 24, 0, Math.PI * 2);
      this.ctx.arc(tx + 5, topY + 35, 18, 0, Math.PI * 2);
      this.ctx.arc(tx + 35, topY + 35, 18, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#166534';
      this.ctx.beginPath();
      this.ctx.arc(tx + 20, topY + 20, 18, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Layer 4: Golden Sunlight Rays (Volumetric Light Beams)
    this.ctx.fillStyle = 'rgba(253, 224, 71, 0.05)';
    this.ctx.beginPath();
    this.ctx.moveTo(CONFIG.CANVAS_WIDTH - 60, 80);
    this.ctx.lineTo(CONFIG.CANVAS_WIDTH - 240, CONFIG.CANVAS_HEIGHT);
    this.ctx.lineTo(CONFIG.CANVAS_WIDTH - 140, CONFIG.CANVAS_HEIGHT);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(CONFIG.CANVAS_WIDTH - 60, 80);
    this.ctx.lineTo(CONFIG.CANVAS_WIDTH - 90, CONFIG.CANVAS_HEIGHT);
    this.ctx.lineTo(0, CONFIG.CANVAS_HEIGHT);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawDarkForest() {
    this.ctx.save();
    const gY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;
    
    // Layer 1: Distant Mountain Mist Silhouettes
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.moveTo(0, gY);
    const offsetBack = (this.frame * 0.15) % 180;
    for (let x = -180; x < CONFIG.CANVAS_WIDTH + 180; x += 60) {
      const rx = x - offsetBack;
      const h = 150 + Math.sin(x * 0.05) * 40;
      this.ctx.lineTo(rx + 30, gY - h);
      this.ctx.lineTo(rx + 60, gY);
    }
    this.ctx.lineTo(CONFIG.CANVAS_WIDTH, gY);
    this.ctx.fill();

    // Layer 2: Deep Dark Pine Trees (Smooth Continuous Parallax)
    this.ctx.fillStyle = '#090d16';
    const spacing = 36;
    const offsetFront = (this.frame * 0.45) % spacing;
    for (let x = -spacing * 2; x < CONFIG.CANVAS_WIDTH + spacing * 2; x += spacing) {
      const tx = x - offsetFront;
      const treeIndex = Math.floor((x + this.frame * 0.45) / spacing);
      const seed = Math.sin(treeIndex * 99) * 10000;
      const rand = seed - Math.floor(seed);
      const th = 85 + (rand * 45);
      const topY = gY - th;
      
      this.ctx.beginPath();
      this.ctx.fillRect(tx + 12, gY - 14, 4, 14); // trunk
      this.ctx.moveTo(tx + 14, topY);
      this.ctx.lineTo(tx + 22, topY + 22); this.ctx.lineTo(tx + 18, topY + 22);
      this.ctx.lineTo(tx + 25, topY + 46); this.ctx.lineTo(tx + 20, topY + 46);
      this.ctx.lineTo(tx + 28, topY + 70); this.ctx.lineTo(tx + 22, topY + 70);
      this.ctx.lineTo(tx + 30, gY);
      this.ctx.lineTo(tx - 2, gY);
      this.ctx.lineTo(tx + 6, topY + 70); this.ctx.lineTo(tx + 0, topY + 70);
      this.ctx.lineTo(tx + 8, topY + 46); this.ctx.lineTo(tx + 3, topY + 46);
      this.ctx.lineTo(tx + 10, topY + 22); this.ctx.lineTo(tx + 6, topY + 22);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    // Layer 3: Rolling Ground Mist
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    this.ctx.fillRect(0, gY - 55, CONFIG.CANVAS_WIDTH, 55);
    this.ctx.restore();
  }

  drawCage() {
    this.ctx.save();
    this.ctx.translate(this.bird.x, this.bird.y);
    this.ctx.strokeStyle = '#7f8c8d'; this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    for (let bx = -25; bx <= 25; bx += 12.5) { this.ctx.moveTo(bx, -35); this.ctx.lineTo(bx, 35); }
    this.ctx.moveTo(-25, -25); this.ctx.lineTo(25, -25);
    this.ctx.moveTo(-25, 25); this.ctx.lineTo(25, 25);
    this.ctx.stroke();
    this.ctx.beginPath(); this.ctx.moveTo(0, -35); this.ctx.lineTo(0, -this.bird.y); this.ctx.lineWidth = 4; this.ctx.strokeStyle = '#34495e'; this.ctx.stroke();
    this.ctx.restore();
  }

  drawBlizzardIntro() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    // Draw heavy fast moving blizzard lines
    for(let i=0; i<40; i++) {
       const x = ((this.frame * 25) + i * 30) % (CONFIG.CANVAS_WIDTH + 100) - 50;
       const y = ((this.frame * 12) + Math.sin(i)*200 + i*15) % CONFIG.CANVAS_HEIGHT;
       this.ctx.fillRect(CONFIG.CANVAS_WIDTH - x, y, 30 + Math.random()*20, 2);
    }
    this.ctx.restore();
  }

  draw() {
    let topC = `rgb(${Math.round(this.currentTopColor[0])}, ${Math.round(this.currentTopColor[1])}, ${Math.round(this.currentTopColor[2])})`;
    let botC = `rgb(${Math.round(this.currentBotColor[0])}, ${Math.round(this.currentBotColor[1])}, ${Math.round(this.currentBotColor[2])})`;

    const grad = this.ctx.createLinearGradient(0,0,0,CONFIG.CANVAS_HEIGHT);
    grad.addColorStop(0, topC); grad.addColorStop(1, botC);
    this.ctx.fillStyle = grad; this.ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    
    if (this.lightning > 0) {
      this.ctx.fillStyle = `rgba(255,255,255,${this.lightning * 0.5})`;
      this.ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    }

    this.ctx.fillStyle = this.boss.active || this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY' ? '#f1c40f' : '#fdfd96';
    this.ctx.beginPath(); this.ctx.arc(CONFIG.CANVAS_WIDTH - 60, 80, 30, 0, Math.PI*2); this.ctx.fill();

    this.ctx.save();
    if(this.screenShake > 0) this.ctx.translate((Math.random()-0.5)*this.screenShake, (Math.random()-0.5)*this.screenShake);

    if (this.activeWorld === 0 || this.currentWorldIndex === 0) {
        this.drawRuinsBackground();
    } else if (this.currentWorldIndex === 2 || this.currentWorldIndex === 'ENDLESS') {
        this.drawDarkForest();
    }

    this.drawPillars();
    
    this.minions.forEach(m => drawMinionCrow(this.ctx, m.x, m.y, this.frame));
    this.penguinMinions.forEach(p => drawPenguinMinion(this.ctx, p.x, p.y, this.frame));
    this.electricBats.forEach(b => drawElectricBat(this.ctx, b.x, b.y, this.frame));
    this.miniTeslas.forEach(m => drawMiniTesla(this.ctx, m.x, m.y, this.frame));
    this.gravityGates.forEach(g => drawGravityGate(this.ctx, g.x, g.y, this.frame, g.radius));
    
    this.coins.forEach(c => {
      this.ctx.fillStyle = '#f1c40f'; this.ctx.beginPath(); this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI*2); this.ctx.fill();
      this.ctx.fillStyle = '#f39c12'; this.ctx.beginPath(); this.ctx.arc(c.x, c.y, c.radius-4, 0, Math.PI*2); this.ctx.fill();
    });

    this.powerOrbs.forEach(orb => {
      this.ctx.fillStyle = '#38bdf8'; this.ctx.beginPath(); this.ctx.arc(orb.x, orb.y, 10, 0, Math.PI*2); this.ctx.fill();
      this.ctx.fillStyle = '#bae6fd'; this.ctx.beginPath(); this.ctx.arc(orb.x, orb.y, 5, 0, Math.PI*2); this.ctx.fill();
    });

    this.heroProjectiles.forEach(p => {
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillRect(p.x, p.y - 2, 20, 4);
    });

    if (this.boss.active) {
      if (this.boss.state === 'DASH_PREP' || this.boss.state === 'SLIDE_PREP') {
        this.ctx.fillStyle = (this.frame % 4 < 2) ? '#ef4444' : '#fff';
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillRect(0, this.boss.y - 30, CONFIG.CANVAS_WIDTH, 60);
        this.ctx.globalAlpha = 1;
      }
      
      if (this.boss.state === 'EXPLODING' && this.frame % 4 < 2) {
         // flash white
      } else {
         if (this.boss.type === 'penguin') {
           this.drawPenguinBossSprite(this.ctx, this.boss.x, this.boss.y, this.frame, this.boss.enraged);
         } else if (this.boss.type === 'thunderbird') {
           this.drawThunderbirdBossSprite(this.ctx, this.boss.x, this.boss.y, this.frame, this.boss.enraged, this.boss.shield);
         } else {
           this.drawCrowBoss(this.ctx, this.boss.x, this.boss.y, this.frame, this.boss.enraged);
         }
      }
      
      if (this.boss.state !== 'EXPLODING' && this.state !== 'BOSS_INTRO') {
        const hpMax = this.boss.type === 'thunderbird' ? CONFIG.W3_BOSS_HP : (this.boss.type === 'penguin' ? CONFIG.W2_BOSS_HP : CONFIG.BOSS_HP);
        const headY = this.boss.type === 'penguin' ? this.boss.y - 100 : this.boss.y - 65;
        this.ctx.fillStyle = '#000'; this.ctx.fillRect(this.boss.x - 30, headY, 60, 6);
        this.ctx.fillStyle = '#ef4444'; this.ctx.fillRect(this.boss.x - 30, headY, 60 * (this.boss.hp / hpMax), 6);
      }
      
      this.bossFeathers.forEach(p => {
        if (this.boss.type === 'thunderbird') {
          this.ctx.save();
          this.ctx.fillStyle = '#38bdf8';
          this.ctx.shadowBlur = 12; this.ctx.shadowColor = '#38bdf8';
          this.ctx.beginPath(); this.ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); this.ctx.fill();
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath(); this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); this.ctx.fill();
          this.ctx.restore();
        } else {
          this.drawCrowFeather(this.ctx, p.x, p.y, p.vx, p.vy);
        }
      });
    }

    this.snowballs.forEach(s => {
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath(); this.ctx.arc(s.x, s.y, 6, 0, Math.PI*2); this.ctx.fill();
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.beginPath(); this.ctx.arc(s.x - 2, s.y - 2, 2, 0, Math.PI*2); this.ctx.fill();
    });

    this.icicles.forEach(ice => {
      this.ctx.fillStyle = '#93c5fd';
      this.ctx.beginPath();
      this.ctx.moveTo(ice.x - 10, ice.y - 20);
      this.ctx.lineTo(ice.x + 10, ice.y - 20);
      this.ctx.lineTo(ice.x, ice.y + 15);
      this.ctx.closePath(); this.ctx.fill();
      this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
      this.ctx.beginPath(); this.ctx.moveTo(ice.x - 5, ice.y - 15); this.ctx.lineTo(ice.x, ice.y + 5); this.ctx.stroke();
    });

    // World 3 Hazards Drawing
    this.miniTeslas.forEach(m => this.drawMiniTeslaSprite(this.ctx, m.x, m.y, this.frame));
    this.electricBats.forEach(b => this.drawElectricBatSprite(this.ctx, b.x, b.y, this.frame));
    this.gravityGates.forEach(g => this.drawGravityGateSprite(this.ctx, g.x, g.y, this.frame, g.radius));

    if (this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY') {
      if (this.activeWorld === 2) this.drawPhoenix(this.ctx, this.owl.x, this.owl.y, this.frame);
      else if (this.activeWorld === 1) this.drawEagle(this.ctx, this.owl.x, this.owl.y, this.frame);
      else this.drawOwl(this.ctx, this.owl.x, this.owl.y, this.frame);
    }

    // Weather: Rain, Snow, or Thunderstorm
    if (this.activeWorld === 1) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
      this.rain.forEach(r => {
        this.ctx.beginPath(); this.ctx.arc(r.x, r.y, 2.5, 0, Math.PI*2); this.ctx.fill();
      });
    } else if (this.activeWorld === 2) {
      // Storm Peaks: Intense lightning streaks
      this.ctx.strokeStyle = (this.frame % 8 < 4) ? 'rgba(56, 189, 248, 0.7)' : 'rgba(192, 132, 252, 0.5)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.rain.forEach(r => { this.ctx.moveTo(r.x, r.y); this.ctx.lineTo(r.x - 6, r.y + 16); });
      this.ctx.stroke();
    } else {
      this.ctx.strokeStyle = 'rgba(255,255,255,0.4)'; this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.rain.forEach(r => { this.ctx.moveTo(r.x, r.y); this.ctx.lineTo(r.x - 2, r.y + 10); });
      this.ctx.stroke();
    }

    const gY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;
    
    // Ground Colors
    let gBase = '#3d2b1f', gTop = '#5c4033', gLines = '#8b5a2b';
    if (this.activeWorld === 2) {
      gBase = '#090d16'; gTop = '#1e1b4b'; gLines = '#38bdf8'; // Storm Cyber Ground
    } else if (this.activeWorld === 1) {
      gBase = '#94a3b8'; gTop = '#e2e8f0'; gLines = '#cbd5e1'; // Snow Ground
    } else if (this.boss.active || this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY') {
      gBase = '#1e293b'; gTop = '#334155'; gLines = '#475569'; // Boss W1 Ground
    }

    this.ctx.fillStyle = gBase; this.ctx.fillRect(0, gY, CONFIG.CANVAS_WIDTH, CONFIG.GROUND_HEIGHT);
    this.ctx.fillStyle = gTop; this.ctx.fillRect(0, gY, CONFIG.CANVAS_WIDTH, 10);
    this.ctx.fillStyle = gLines;
    this.ctx.beginPath();
    for (let x = -this.groundOffset; x < CONFIG.CANVAS_WIDTH + 40; x += 30) {
      this.ctx.moveTo(x, gY+10); this.ctx.lineTo(x+15, gY+10); this.ctx.lineTo(x-5, CONFIG.CANVAS_HEIGHT); this.ctx.lineTo(x-20, CONFIG.CANVAS_HEIGHT);
    }
    this.ctx.fill();

    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life; 
      this.ctx.fillStyle = p.color;
      if (p.isBar) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.fillRect(-2, -15, 4, 30);
        this.ctx.restore();
      } else if (p.isLine) {
        this.ctx.fillRect(p.x, p.y, p.size*10, p.size);
      } else { 
        this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); this.ctx.fill(); 
      }
      this.ctx.globalAlpha = 1;
    });

    this.floatingText.forEach(f => {
      this.ctx.globalAlpha = f.life; this.ctx.font = 'bold 16px "Press Start 2P"';
      this.ctx.fillStyle = f.color; this.ctx.strokeStyle = '#000'; this.ctx.lineWidth = 3;
      this.ctx.strokeText(f.text, f.x, f.y); this.ctx.fillText(f.text, f.x, f.y);
      this.ctx.globalAlpha = 1;
    });

    if (this.state !== 'MENU') {
      if (this.invincibleTimer > 0) {
        this.ctx.globalAlpha = Math.floor(this.invincibleTimer / 6) % 2 === 0 ? 0.3 : 0.85;
      }
      drawBirdSkin(this.ctx, this.activeSkin, this.bird.x, this.bird.y, this.bird.rotation, this.bird.wingCycle, 1, this.feverActive);
      this.ctx.globalAlpha = 1;
      
      if (this.state === 'STORY' || this.state === 'BOSS_INTRO' || this.state === 'BOSS_OUTRO') {
        if (this.state === 'STORY') {
          if (this.activeWorld === 0) this.drawCage();
          else this.drawBlizzardIntro();
        }

        // Modern Rounded Dialogue Box
        const boxW = CONFIG.CANVAS_WIDTH - 24;
        const boxH = 145;
        const boxX = 12;
        const boxY = CONFIG.CANVAS_HEIGHT - boxH - 15;
        const r = 14;

        this.ctx.save();
        // Background
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
          this.ctx.roundRect(boxX, boxY, boxW, boxH, r);
        } else {
          this.ctx.rect(boxX, boxY, boxW, boxH);
        }
        this.ctx.fill();
        this.ctx.stroke();

        // Inner subtle border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
          this.ctx.roundRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8, r - 3);
        } else {
          this.ctx.rect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);
        }
        this.ctx.stroke();

        // Text rendering with word wrap
        this.ctx.font = 'bold 13.5px "Tajawal", "Changa", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        
        let curY = boxY + 28;
        if (this.storyText1) {
          curY = this.drawWrappedDialogueText(this.ctx, this.storyText1, CONFIG.CANVAS_WIDTH / 2, curY, boxW - 20, 20);
        }
        if (this.storyText2) {
          curY += 4;
          curY = this.drawWrappedDialogueText(this.ctx, this.storyText2, CONFIG.CANVAS_WIDTH / 2, curY, boxW - 20, 20);
        }

        // Tap to continue action
        if (this.storyCompleted) {
          this.ctx.font = 'bold 12.5px "Tajawal", "Changa", sans-serif';
          this.ctx.fillStyle = '#f1c40f';
          let actionText = (this.state === 'STORY') ? I18N[this.lang].tapToLaunch : I18N[this.lang].tapToContinue;
          if (Math.sin(this.frame * 0.1) > 0) {
            this.ctx.fillText(actionText, CONFIG.CANVAS_WIDTH / 2, boxY + boxH - 12);
          }
        }
        this.ctx.restore();
      }
    }

    this.ctx.restore();
  }

  drawPillars() {
    const pCanvas = this.activeWorld === 2 ? this.assets.stormPillarCanvas : (this.activeWorld === 1 ? this.assets.icePillarCanvas : this.assets.pillarCanvas);
    
    this.pillars.forEach(p => {
      if (p.smashed) return;

      if (pCanvas) {
        let gap = this.activeWorld === 2 ? CONFIG.W3_GAP_SIZE : this.activeWorld === 1 ? CONFIG.W2_GAP_SIZE : CONFIG.GAP_SIZE;
        const botY = p.topHeight + gap;
        const botH = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - botY;
        
        // We draw the pillar slightly wider than the collision box so the cap overhangs nicely
        const drawW = 80;
        const drawX = p.x - (drawW - p.width) / 2; // centered
        
        // --- TOP PILLAR ---
        // Cap is at the gap. We flip the canvas vertically.
        this.ctx.save();
        this.ctx.translate(drawX, p.topHeight); // Move to gap
        this.ctx.scale(1, -1);
        // Draw starting from 0, going up (which goes down visually due to scale)
        this.ctx.drawImage(pCanvas, 0, 0, 80, Math.min(600, p.topHeight), 0, 0, drawW, p.topHeight);
        this.ctx.restore();

        // --- BOTTOM PILLAR ---
        // Cap is at the gap. No flip needed.
        this.ctx.drawImage(pCanvas, 0, 0, 80, Math.min(600, botH), drawX, botY, drawW, botH);
      }
    });
  }

  loop(timestamp = 0) {
    if (!this.lastTime) this.lastTime = timestamp;
    const elapsed = timestamp - this.lastTime;
    
    if (elapsed > 1000) {
      this.lastTime = timestamp;
      this.accumulator = 0;
    } else {
      const step = 1000 / 60;
      this.accumulator = (this.accumulator || 0) + elapsed;
      this.lastTime = timestamp;

      let updates = 0;
      while (this.accumulator >= step && updates < 3) {
        this.update();
        this.accumulator -= step;
        updates++;
      }
      if (updates >= 3) this.accumulator = 0;
    }

    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }
}

// Assign world-specific boss methods to the game prototype
if (window.World1) Object.assign(FeatherHeroGame.prototype, window.World1);
if (window.World2) Object.assign(FeatherHeroGame.prototype, window.World2);
if (window.World3) Object.assign(FeatherHeroGame.prototype, window.World3);

// Also expose activateBoss from World1 (it's the shared boss activation entry point)
// activateBoss is already in World1, updateBoss is in World1, 
// updatePenguinBoss is in World2, updateThunderbirdBoss is in World3

function initFeatherFury() {
  if (!window.game) {
    window.game = new FeatherHeroGame();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initFeatherFury);
} else {
  initFeatherFury();
}

