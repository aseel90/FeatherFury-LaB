class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.sfxEnabled = true;
    this.ambientNodes = null;
    this.birdChirpTimer = null;
  }

  init() {
    if (!this.ctx) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (A) this.ctx = new A();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopAmbiance();
    return this.muted;
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    if (!this.sfxEnabled) this.stopAmbiance();
    return this.sfxEnabled;
  }

  _play(type, fn) {
    if (this.muted || !this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      fn(osc, gain, now);
    } catch(e) {}
  }

  // --- Procedural Nature & Ambient Audio for World 1: Ruins ---
  startRuinsAmbiance() {
    if (this.muted || !this.sfxEnabled || !this.ctx || this.ambientNodes) return;
    try {
      // 1. Forest Breeze & Gentle Wind (Brown noise with gentle modulation)
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      // Slow LFO for natural wind breathing
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(160, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const mainGain = this.ctx.createGain();
      mainGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      mainGain.gain.exponentialRampToValueAtTime(0.14, this.ctx.currentTime + 1.8);

      noise.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(this.ctx.destination);

      noise.start();
      lfo.start();

      this.ambientNodes = { noise, filter, lfo, mainGain };

      // 2. Schedule Procedural Forest Bird Calls
      this._scheduleForestBirds();
    } catch(e) {}
  }

  _scheduleForestBirds() {
    if (this.birdChirpTimer) clearTimeout(this.birdChirpTimer);
    const delay = 3500 + Math.random() * 4500;
    this.birdChirpTimer = setTimeout(() => {
      if (this.ambientNodes && !this.muted && this.sfxEnabled) {
        this.playForestBird();
        this._scheduleForestBirds();
      }
    }, delay);
  }

  playForestBird() {
    if (this.muted || !this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const type = Math.random();

      if (type < 0.5) {
        // Double sweet chirp
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2600, now);
        osc.frequency.exponentialRampToValueAtTime(3800, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(3100, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(4200, now + 0.22);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else {
        // High warble
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3200, now);
        osc.frequency.linearRampToValueAtTime(3600, now + 0.05);
        osc.frequency.linearRampToValueAtTime(3000, now + 0.1);
        osc.frequency.linearRampToValueAtTime(3500, now + 0.15);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
    } catch(e) {}
  }

  playHeartbeat() {
    if (this.muted || !this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Lub-dub deep pulse
      [0, 0.12].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 65 : 55, now + offset);
        osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.09);
        gain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.11);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.11);
      });
    } catch(e) {}
  }

  stopAmbiance() {
    if (this.birdChirpTimer) {
      clearTimeout(this.birdChirpTimer);
      this.birdChirpTimer = null;
    }
    if (this.ambientNodes) {
      try {
        const now = this.ctx.currentTime;
        this.ambientNodes.mainGain.gain.setValueAtTime(this.ambientNodes.mainGain.gain.value, now);
        this.ambientNodes.mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        const nodes = this.ambientNodes;
        this.ambientNodes = null;
        setTimeout(() => {
          try {
            nodes.noise.stop();
            nodes.lfo.stop();
          } catch(e) {}
        }, 450);
      } catch(e) {
        this.ambientNodes = null;
      }
    }
  }

  playFlap() { this._play('sine', (o, g, n) => { o.type='sine'; o.frequency.setValueAtTime(420,n); o.frequency.exponentialRampToValueAtTime(820,n+0.09); g.gain.setValueAtTime(0.3,n); g.gain.exponentialRampToValueAtTime(0.01,n+0.09); o.start(n); o.stop(n+0.09); }); }
  playScore() { this._play('triangle', (o, g, n) => { o.type='triangle'; o.frequency.setValueAtTime(523,n); o.frequency.setValueAtTime(783,n+0.1); g.gain.setValueAtTime(0.2,n); g.gain.exponentialRampToValueAtTime(0.01,n+0.2); o.start(n); o.stop(n+0.2); }); }
  playLaunch() { this._play('sawtooth', (o, g, n) => { o.type='sawtooth'; o.frequency.setValueAtTime(100,n); o.frequency.exponentialRampToValueAtTime(800,n+0.4); g.gain.setValueAtTime(0.5,n); g.gain.exponentialRampToValueAtTime(0.01,n+0.6); o.start(n); o.stop(n+0.6); }); }
  playThunder() { 
    if (this.muted || !this.sfxEnabled || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(800, this.ctx.currentTime); filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1.5);
      const gain = this.ctx.createGain(); gain.gain.setValueAtTime(1.5, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.8);
      noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination); noise.start();
    } catch(e) {}
  }
  playHit() { this._play('square', (o, g, n) => { o.type='square'; o.frequency.setValueAtTime(200,n); o.frequency.exponentialRampToValueAtTime(30,n+0.2); g.gain.setValueAtTime(0.4,n); g.gain.exponentialRampToValueAtTime(0.01,n+0.2); o.start(n); o.stop(n+0.2); }); }
  playCoin() { this._play('sine', (o, g, n) => { o.type='sine'; o.frequency.setValueAtTime(987,n); o.frequency.setValueAtTime(1318,n+0.1); g.gain.setValueAtTime(0.3,n); g.gain.exponentialRampToValueAtTime(0.01,n+0.2); o.start(n); o.stop(n+0.2); }); }
  playTick() { this._play('square', (o, g, n) => { o.type='square'; o.frequency.setValueAtTime(800,n); g.gain.setValueAtTime(0.1,n); g.gain.exponentialRampToValueAtTime(0.01,n+0.05); o.start(n); o.stop(n+0.05); }); }
  playSmash() { this._play('sawtooth', (o, g, n) => { o.type='sawtooth'; o.frequency.setValueAtTime(150,n); o.frequency.exponentialRampToValueAtTime(20,n+0.3); g.gain.setValueAtTime(0.6,n); g.gain.exponentialRampToValueAtTime(0.01,n+0.3); o.start(n); o.stop(n+0.3); }); }
  playLaser() { this._play('sine', (o, g, n) => { o.type='sine'; o.frequency.setValueAtTime(1200,n); o.frequency.exponentialRampToValueAtTime(300,n+0.2); g.gain.setValueAtTime(0.3,n); g.gain.exponentialRampToValueAtTime(0.01,n+0.2); o.start(n); o.stop(n+0.2); }); }
}

