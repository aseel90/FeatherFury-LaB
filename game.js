(()=>{
  const load=src=>new Promise((ok,bad)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=bad;document.head.appendChild(s)});
  const install=async()=>{try{await load('w2-emperor-crow-style-v4.js?v=4')}catch(e){console.warn('[FF] Ice Emperor V4 load failed',e)}};
  if(document.readyState==='complete')setTimeout(install,100);else addEventListener('load',()=>setTimeout(install,100),{once:true});
})();