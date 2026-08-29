(() => {
  'use strict';
  const A='assets/ui/icons/';
  const iconMap={
    langLabel:'language.svg', sfxLabel:'sound.svg', gfxLabel:'particles.svg', resetLabel:'reset.svg'
  };
  const txt = el => (el?.textContent || '').trim();

  function decorateSettings(){
    const s=document.getElementById('settingsScreen'); if(!s)return;
    s.classList.add('ff-settings-screen'); s.removeAttribute('style');
    const h=s.querySelector('h2'); if(h){h.classList.add('ff-screen-heading');h.removeAttribute('style')}
    s.querySelectorAll('.setting-row').forEach(row=>{
      row.removeAttribute('style'); const label=row.querySelector('[data-i18n]'); if(!label)return;
      const key=label.getAttribute('data-i18n'); label.classList.add('ff-setting-label'); label.removeAttribute('style');
      if(!label.querySelector('.ff-setting-icon')){const i=document.createElement('img');i.className='ff-setting-icon';i.src=A+(iconMap[key]||'settings.svg');i.alt='';label.prepend(i)}
    });
    const reset=document.getElementById('resetDataBtn'); if(reset) reset.removeAttribute('style');
    s.querySelector('.version-info')?.removeAttribute('style'); s.querySelector('.version-info>div')?.removeAttribute('style'); s.querySelector('.version-info [data-i18n="devLabel"]')?.removeAttribute('style');
    const close=document.getElementById('closeSettingsBtn'); if(close){close.removeAttribute('style');ensureButtonIcon(close,'back.svg')}
    decorateLanguageButton();
  }
  function ensureButtonIcon(btn,file){
    if(!btn)return; if(btn.querySelector(`img.ff-btn-icon[src$="${file}"]`))return; const label=[...btn.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim()||btn.textContent.trim();
    btn.innerHTML='';const im=document.createElement('img');im.className='ff-btn-icon';im.src=A+file;im.alt='';const sp=document.createElement('span');sp.textContent=label;btn.append(im,sp);
  }
  function decorateLanguageButton(){
    const b=document.getElementById('langToggleBtn'); if(!b)return; if(b.querySelector('img.ff-btn-icon[src$="language.svg"]') && b.querySelector('span') && !b.querySelector('svg'))return; const label=txt(b).replace(/^\s+/,'') || 'Language';
    b.removeAttribute('style');b.innerHTML='';const im=document.createElement('img');im.className='ff-btn-icon';im.src=A+'language.svg';im.alt='';const sp=document.createElement('span');sp.textContent=label;b.append(im,sp);
  }

  function decorateLeaderboardShell(){
    const s=document.getElementById('leaderboardScreen'); if(!s)return;
    s.classList.add('ff-leaderboard-screen');s.removeAttribute('style');
    const h=s.querySelector('.shop-header h2');if(h)h.classList.add('ff-screen-heading');
    const c=document.getElementById('closeLeaderboardBtn');if(c){c.removeAttribute('style');if(!c.querySelector('img'))c.innerHTML=`<img src="${A}back.svg" alt="">`}
    const content=s.querySelector('.leaderboard-content');if(content)content.removeAttribute('style');
    s.querySelector('[data-i18n="leaderboardSubtitle"]')?.removeAttribute('style');
    const list=document.getElementById('leaderboardList');if(list)list.removeAttribute('style');
    decorateRows();
  }
  function decorateRows(){
    const list=document.getElementById('leaderboardList');if(!list)return;
    [...list.children].forEach((li,index)=>{
      if(li.classList.contains('ff-leader-row') && li.querySelector('.ff-rank-badge') && li.querySelector('.ff-score img'))return;
      const raw=li.textContent.replace(/⭐/g,'').trim();
      const spans=li.querySelectorAll(':scope > span');
      let left=spans[0]?.textContent.trim()||''; let score=(spans[1]?.textContent.match(/\d+/)||raw.match(/\d+(?=\s*$)/)||['0'])[0];
      left=left.replace(/^#\d+\s*/,'').trim();
      li.removeAttribute('style');li.className='ff-leader-row';li.dataset.rank=String(index+1);
      const isYou=/^(أنت|You)$/i.test(left) || /\b(أنت|You)\b/i.test(left); if(isYou)li.classList.add('ff-you');
      li.innerHTML='';
      const nameWrap=document.createElement('span');nameWrap.className='ff-rank-name';
      const rank=document.createElement('span');rank.className='ff-rank-badge';rank.textContent='#'+(index+1);
      const name=document.createElement('span');name.className='ff-player-name';name.textContent=left;
      const val=document.createElement('span');val.className='ff-score';val.innerHTML=`<span>${score}</span><img src="${A}star-filled.svg" alt="">`;
      nameWrap.append(rank,name);li.append(nameWrap,val);
    });
  }

  function hookLanguageRefresh(){
    const b=document.getElementById('langToggleBtn');if(!b||b.__ffDecorated)return;b.__ffDecorated=true;
    const mo=new MutationObserver(()=>queueMicrotask(decorateLanguageButton));mo.observe(b,{childList:true,subtree:true,characterData:true});
  }
  function hookLeaderboard(){
    const list=document.getElementById('leaderboardList');if(!list||list.__ffDecorated)return;list.__ffDecorated=true;
    const mo=new MutationObserver(()=>queueMicrotask(decorateRows));mo.observe(list,{childList:true,subtree:true});
  }
  function boot(){decorateSettings();decorateLeaderboardShell();hookLanguageRefresh();hookLeaderboard();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  let tries=0;const t=setInterval(()=>{boot();if(++tries>120)clearInterval(t)},100);
})();
