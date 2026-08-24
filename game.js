(() => {
  'use strict';

  let legacyStarted = false;

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
                          ux.src = 'core-gameplay-ux-v1.js?v=2';
                          ux.async = false;
                          ux.onerror = () => console.error('Failed to load core gameplay UX patch');
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
      'patch-manifest.js?v=4',
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