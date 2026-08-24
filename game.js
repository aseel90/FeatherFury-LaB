(() => {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@5b83840d68ad65939b8efae336afd76c47b7bdc1/game.js';
  s.async = false;
  s.onload = () => {
    const p = document.createElement('script');
    p.src = 'ruins-pillars-v3.js?v=1';
    p.async = false;
    p.onerror = () => console.error('Failed to load Ruins pillar art override');
    document.head.appendChild(p);
  };
  s.onerror = () => console.error('Failed to load stable LAB game runtime');
  document.head.appendChild(s);
})();