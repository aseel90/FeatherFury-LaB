(() => {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@5b83840d68ad65939b8efae336afd76c47b7bdc1/game.js';
  s.async = false;
  s.onerror = () => console.error('Failed to load stable LAB game runtime');
  document.head.appendChild(s);
})();
