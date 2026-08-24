(() => {
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
      w.src = 'cursed-woods-v1.js?v=1';
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
})();
