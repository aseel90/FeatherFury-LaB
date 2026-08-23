import re

with open('game.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace boss state logic
content = re.sub(
    r"if \(this\.boss\.type === 'penguin'\) \{\s*this\.startDialogue\(\[I18N\[this\.lang\]\.w2_bossL1, I18N\[this\.lang\]\.w2_bossL2\]\);\s*\} else \{",
    "if (this.boss.type === 'thunderbird') { this.startDialogue([I18N[this.lang].w3_bossL1, I18N[this.lang].w3_bossL2]); } else if (this.boss.type === 'penguin') { this.startDialogue([I18N[this.lang].w2_bossL1, I18N[this.lang].w2_bossL2]); } else {",
    content
)

content = re.sub(
    r"\} else if \(this\.activeWorld === 1\) \{\s*if \(!this\.w2Completed\) \{\s*this\.w2Completed = true;\s*localStorage\.setItem\('fh_w2_completed', 'true'\);\s*\}\s*document\.getElementById\('bossDefeatedMessage'\)\.textContent = I18N\[this\.lang\]\.w2_winText;\s*\} ",
    "} else if (this.activeWorld === 1) { if (!this.w2Completed) { this.w2Completed = true; localStorage.setItem('fh_w2_completed', 'true'); } document.getElementById('bossDefeatedMessage').textContent = I18N[this.lang].w2_winText; } else if (this.activeWorld === 2) { if (!this.w3Completed) { this.w3Completed = true; localStorage.setItem('fh_w3_completed', 'true'); } document.getElementById('bossDefeatedMessage').textContent = I18N[this.lang].w3_winText; } ",
    content
)

content = re.sub(
    r"if \(this\.boss\.type === 'penguin'\) \{\s*this\.startDialogue\(\[I18N\[this\.lang\]\.w2_owlL1, I18N\[this\.lang\]\.w2_owlL2\]\);\s*\} else \{",
    "if (this.boss.type === 'thunderbird') { this.startDialogue([I18N[this.lang].w3_owlL1, I18N[this.lang].w3_owlL2]); } else if (this.boss.type === 'penguin') { this.startDialogue([I18N[this.lang].w2_owlL1, I18N[this.lang].w2_owlL2]); } else {",
    content
)

thunderbird_logic = '''
  updateThunderbirdBoss() {
    this.boss.timer++;
    const cx = this.boss.x; const cy = this.boss.y;
    
    if (this.boss.state === 'INTRO_FLY') {
      this.boss.x -= 2;
      this.boss.y += Math.sin(this.boss.timer * 0.1) * 2;
      if (this.boss.x <= CONFIG.CANVAS_WIDTH - 80) {
        this.boss.x = CONFIG.CANVAS_WIDTH - 80;
        this.boss.state = 'IDLE';
        this.boss.timer = 0;
      }
      return;
    }
    
    if (this.boss.hp <= 0 && this.boss.state !== 'EXPLODING') {
      this.boss.state = 'EXPLODING';
      this.boss.timer = 0;
      this.sound.playLaser();
      this.score += 500;
      this.screenShake = 30;
      this.lightning = 1;
      return;
    }
    
    if (this.boss.state === 'EXPLODING') {
      this.boss.y += 2;
      for (let i = 0; i < 5; i++) {
        this.particles.push({ x: cx + (Math.random()-0.5)*100, y: cy + (Math.random()-0.5)*100, vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8, size: Math.random()*8+4, color: '#fde047', life: 1 });
      }
      if (this.boss.y > CONFIG.CANVAS_HEIGHT + 100) {
         this.boss.active = false;
         this.state = 'BOSS_OUTRO';
      }
      return;
    }

    if (this.boss.state === 'IDLE') {
      this.boss.y += Math.sin(this.boss.timer * 0.05) * 1.5;
      this.boss.y = Math.max(50, Math.min(CONFIG.CANVAS_HEIGHT - 100, this.boss.y));

      if (this.boss.timer > 120) {
        this.boss.timer = 0;
        this.boss.state = Math.random() < 0.4 ? 'SUMMON_GATES' : 'STRIKE_PREP';
      }
    } else if (this.boss.state === 'SUMMON_GATES') {
      if (this.boss.timer === 30) {
        this.gravityGates.push({ x: CONFIG.CANVAS_WIDTH + 50, y: 150, radius: 25 });
        this.gravityGates.push({ x: CONFIG.CANVAS_WIDTH + 50, y: 400, radius: 25 });
        this.sound.playThunder();
        this.lightning = 1;
      }
      if (this.boss.timer > 80) {
        this.boss.state = 'IDLE';
        this.boss.timer = 0;
      }
    } else if (this.boss.state === 'STRIKE_PREP') {
      this.boss.y -= 1;
      this.boss.y = Math.max(50, this.boss.y);

      if (this.boss.timer > 60) {
        this.boss.state = 'STRIKING';
        this.boss.timer = 0;
        for (let i = 0; i < 3; i++) {
          this.electricBats.push({ x: cx, y: cy - 30 + i * 30, timer: 0 });
        }
        this.sound.playThunder();
      }
    } else if (this.boss.state === 'STRIKING') {
      if (this.boss.timer > 40) {
        this.boss.state = 'IDLE';
        this.boss.timer = 0;
      }
    }

    if (this.boss.shield <= 0 && !this.boss.enraged) {
      this.boss.enraged = true;
      this.lightning = 1;
      this.sound.playThunder();
      this.screenShake = 10;
    }
  }
'''

content = content.replace('  updateBoss() {', thunderbird_logic + '\n  updateBoss() {\n    if (this.boss.type === \'thunderbird\') return this.updateThunderbirdBoss();')

with open('game.js', 'w', encoding='utf-8') as f:
    f.write(content)
