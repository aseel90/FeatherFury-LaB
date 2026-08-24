(() => {
  'use strict';

  let legacyStarted = false;

  // Restore the language icon path exactly; protects against accidental SVG path drift in the shell.
  const langIconPath = document.querySelector('#lang-svg path');
  if (langIconPath) langIconPath.setAttribute('d', 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34-.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z');

  // If Patch Runner is unavailable, load the same post-W2 chain used by the current manifest.
  // This path is emergency-only and does not affect normal boot.
  function loadLegacyTail() {
    const sources = [
      'w2-boss-orb-v6.js?v=1',
      'w2-boss-combat-v6.js?v=1',
      'victory-screen-fix-v1.js?v=1',
      'w3-foundation-v1.js?v=1',
      'w3-world-polish-v1.js?v=1',
      'w3-boss-v1.js?v=1',
      'w3-final-polish-v1.js?v=1',
      'w3-balance-visual-v2.js?v=1',
      'w3-challenge-audio-v3.js?v=1',
      'w3-final-balance-v4.js?v=1',
      'w3-critical-fix-v6.js?v=1'
    ];
    let index = 0;
    const next = () => {
      if (index >= sources.length) return;
      const src = sources[index++];
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = next;
      script.onerror = () => {
        console.error(`[FeatherFury] Legacy fallback failed to load ${src}`);
        next();
      };
      document.head.appendChild(script);
    };
    next();
  }

  window.__FF_START_LEGACY_PATCH_CHAIN__ = function() {
    if (legacyStarted) return;
    legacyStarted = true;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@5b83840d68ad65939b8efae336afd76c47b7bdc1/game.js';
    s.async = false;
    s.onload = () => {
      const p = document.createElement('script');
      p.src = 'ruins-pillars-v3.js?v=1';
      p.async = false;
      p.onerror = () => console.error('Failed to load Ruins pillar art override');
      p.onload = () => {
        const w = document.createElement('script');
        w.src = 'cursed-woods-v1.js?v=2';
        w.async = false;
        w.onerror = () => console.error('Failed to load Cursed Woods atmosphere override');
        w.onload = () => {
          const c = document.createElement('script');
          c.src = 'cursed-crows-v1.js?v=1';
          c.async = false;
          c.onerror = () => console.error('Failed to load Cursed Woods crow art override');
          c.onload = () => {
            const b = document.createElement('script');
            b.src = 'boss-crowking-v1.js?v=1';
            b.async = false;
            b.onerror = () => console.error('Failed to load Crow King boss visual override');
            b.onload = () => {
              const f = document.createElement('script');
              f.src = 'boss-fight-core-v1.js?v=1';
              f.async = false;
              f.onerror = () => console.error('Failed to load Crow King boss fight core override');
              f.onload = () => {
                const x = document.createElement('script');
                x.src = 'w1-fixes-batch-v1.js?v=1';
                x.async = false;
                x.onerror = () => console.error('Failed to load World 1 fixes batch');
                x.onload = () => {
                  const a = document.createElement('script');
                  a.src = 'boss-audio-fix-v2.js?v=2';
                  a.async = false;
                  a.onerror = () => console.error('Failed to load dedicated boss audio fixes');
                  a.onload = () => {
                    const fa = document.createElement('script');
                    fa.src = 'w1-final-audio-v1.js?v=1';
                    fa.async = false;
                    fa.onerror = () => console.error('Failed to load World 1 final audio');
                    fa.onload = () => {
                      const fg = document.createElement('script');
                      fg.src = 'w1-final-gameplay-v1.js?v=1';
                      fg.async = false;
                      fg.onerror = () => console.error('Failed to load World 1 final gameplay');
                      fg.onload = () => {
                        const fs = document.createElement('script');
                        fs.src = 'w1-final-story-v1.js?v=1';
                        fs.async = false;
                        fs.onerror = () => console.error('Failed to load World 1 final story');
                        fs.onload = () => {
                          const ux = document.createElement('script');
                          ux.src = 'core-gameplay-ux-v1.js?v=3';
                          ux.async = false;
                          ux.onerror = () => console.error('Failed to load core gameplay UX patch');
                          ux.onload = () => {
                            const polish = document.createElement('script');
                            polish.src = 'pause-hud-polish-v2.js?v=1';
                            polish.async = false;
                            polish.onerror = () => console.error('Failed to load pause/HUD polish patch');
                            polish.onload = () => {
                              const finalPolish = document.createElement('script');
                              finalPolish.src = 'world1-final-polish-v1.js?v=1';
                              finalPolish.async = false;
                              finalPolish.onerror = () => console.error('Failed to load World 1 final polish');
                              finalPolish.onload = () => {
                                const w2a = document.createElement('script');
                                w2a.src = 'w2-audio-v1.js?v=1';
                                w2a.async = false;
                                w2a.onerror = () => console.error('Failed to load World 2 audio');
                                w2a.onload = () => {
                                  const w2v = document.createElement('script');
                                  w2v.src = 'w2-visuals-v1.js?v=1';
                                  w2v.async = false;
                                  w2v.onerror = () => console.error('Failed to load World 2 visuals');
                                  w2v.onload = () => {
                                    const w2g = document.createElement('script');
                                    w2g.src = 'w2-gameplay-v1.js?v=1';
                                    w2g.async = false;
                                    w2g.onerror = () => console.error('Failed to load World 2 gameplay');
                                    w2g.onload = () => {
                                      const revive = document.createElement('script');
                                      revive.src = 'revive-core-fix-v1.js?v=2';
                                      revive.async = false;
                                      revive.onerror = () => console.error('Failed to load revive core fix');
                                      revive.onload = () => {
                                        const w2BossPolish = document.createElement('script');
                                        w2BossPolish.src = 'w2-boss-polish-v2.js?v=1';
                                        w2BossPolish.async = false;
                                        w2BossPolish.onerror = () => { console.error('Failed to load World 2 boss polish v2'); loadLegacyTail(); };
                                        w2BossPolish.onload = loadLegacyTail;
                                        document.head.appendChild(w2BossPolish);
                                      };
                                      document.head.appendChild(revive);
                                    };
                                    document.head.appendChild(w2g);
                                  };
                                  document.head.appendChild(w2v);
                                };
                                document.head.appendChild(w2a);
                              };
                              document.head.appendChild(finalPolish);
                            };
                            document.head.appendChild(polish);
                          };
                          document.head.appendChild(ux);
                        };
                        document.head.appendChild(fs);
                      };
                      document.head.appendChild(fg);
                    };
                    document.head.appendChild(fa);
                  };
                  document.head.appendChild(a);
                };
                document.head.appendChild(x);
              };
              document.head.appendChild(f);
            };
            document.head.appendChild(b);
          };
          document.head.appendChild(c);
        };
        document.head.appendChild(w);
      };
      document.head.appendChild(p);
    };
    s.onerror = () => console.error('Failed to load stable LAB game runtime');
    document.head.appendChild(s);
  };

  function loadBootstrapScript(src, onload, onerror) {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = onload;
    script.onerror = onerror;
    document.head.appendChild(script);
  }

  const params = new URLSearchParams(window.location.search || '');
  if (params.get('legacyPatches') === '1') {
    window.__FF_START_LEGACY_PATCH_CHAIN__();
    return;
  }

  loadBootstrapScript(
    'patch-runner.js?v=3',
    () => loadBootstrapScript(
      'patch-manifest.js?v=12',
      () => {},
      () => {
        console.error('[FeatherFury] Failed to load patch manifest; using legacy loader.');
        window.__FF_START_LEGACY_PATCH_CHAIN__();
      }
    ),
    () => {
      console.error('[FeatherFury] Failed to load Patch Runner; using legacy loader.');
      window.__FF_START_LEGACY_PATCH_CHAIN__();
    }
  );
})();
