(() => {
  'use strict';
  if (window.__FF_W2_ENV_ASSET_DATA_V1__) return;
  const svg = source => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source.replace(/\n\s*/g,''));

  const mountains = svg(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="360" viewBox="0 0 1024 360">
    <defs>
      <linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0c2038"/><stop offset="1" stop-color="#173b59"/></linearGradient>
      <linearGradient id="h" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#355f7d"/><stop offset="1" stop-color="#16324d"/></linearGradient>
      <linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8fc2d8" stop-opacity="0"/><stop offset="1" stop-color="#8fc2d8" stop-opacity=".38"/></linearGradient>
    </defs>
    <path fill="url(#m)" d="M0 360V276L55 219l70 47 97-116 98 106 93-75 108 78 119-125 121 107 105-72 158 112v79z"/>
    <path fill="url(#h)" opacity=".65" d="M0 360V309l72-55 66 37 78-83 106 104 98-76 93 74 134-117 119 112 94-64 164 92v27z"/>
    <g fill="#dceff7" opacity=".82">
      <path d="M38 237l17-18 18 20-13-7-6 8-7-8z"/><path d="M185 189l37-39 38 42-26-17-13 16-15-14z"/>
      <path d="M386 207l27-26 28 28-20-11-9 12-12-10z"/><path d="M599 177l41-43 43 47-29-17-14 18-17-15z"/>
      <path d="M835 191l31-22 34 28-22-9-11 11-15-9z"/>
    </g>
    <rect y="278" width="1024" height="82" fill="url(#f)"/>
  </svg>`);

  const pines = svg(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="320" viewBox="0 0 1024 320">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#173b50"/><stop offset="1" stop-color="#0a2534"/></linearGradient>
      <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d9eef5" stop-opacity=".68"/><stop offset="1" stop-color="#5f8fa4" stop-opacity=".26"/></linearGradient>
    </defs>
    <path fill="#17384b" opacity=".58" d="M0 320v-44l66-33 64 24 86-55 88 60 70-39 91 47 72-52 83 44 85-48 92 57 79-39 128 54v44z"/>
    <g fill="url(#g)" stroke="#214b61" stroke-width="2" transform="translate(0 70)">
      <g transform="translate(20 55)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/><path fill="#cbe6ef" opacity=".52" d="M24 0L10 35h27zM17 55L5 77h38z"/></g>
      <g transform="translate(90 92) scale(.82)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(152 31) scale(1.08)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/><path fill="#e0f1f6" opacity=".5" d="M24 0L11 34h26zM17 56L6 77h37z"/></g>
      <g transform="translate(235 70) scale(.92)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(305 42) scale(1.13)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/><path fill="#e0f1f6" opacity=".52" d="M24 0L11 34h26z"/></g>
      <g transform="translate(397 63)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(471 35) scale(1.12)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/><path fill="#e0f1f6" opacity=".5" d="M24 0L11 34h26z"/></g>
      <g transform="translate(562 74) scale(.9)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(631 40) scale(1.07)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(721 64)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(798 30) scale(1.15)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/><path fill="#e0f1f6" opacity=".52" d="M24 0L11 34h26z"/></g>
      <g transform="translate(901 72) scale(.92)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(970 48) scale(1.02)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
    </g>
    <path fill="#31586b" opacity=".72" d="M0 320v-42l70-13 61 9 64-16 70 13 82-18 74 14 71-9 81 14 78-17 73 14 84-12 73 16 83-14 60 11v50z"/>
    <path fill="url(#ridge)" d="M0 285l69-12 63 8 64-15 70 13 81-17 75 13 70-10 81 15 78-18 74 14 84-12 73 16 82-13 60 10v43H0z"/>
    <path fill="#eef8fb" opacity=".74" d="M0 284l69-11 63 8 64-14 70 12 81-16 75 12 70-9 81 14 78-17 74 13 84-11 73 15 82-12 60 9v8l-61-6-81 13-72-14-85 12-74-12-78 16-80-13-71 8-75-11-80 15-70-11-64 13-63-7-69 10z"/>
  </svg>`);

  const avalanche = svg(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="260" viewBox="0 0 1024 260">
    <path fill="#b8d9e7" opacity=".66" d="M0 260v-54l73-28 61 20 65-35 81 45 82-29 73 36 88-61 86 59 68-31 86 43 92-48 72 29 98-34v88z"/>
    <g fill="#294b5e" opacity=".8">
      <ellipse cx="73" cy="222" rx="48" ry="13"/><ellipse cx="188" cy="213" rx="37" ry="10"/><ellipse cx="337" cy="231" rx="61" ry="15"/>
      <ellipse cx="514" cy="215" rx="45" ry="12"/><ellipse cx="688" cy="232" rx="58" ry="15"/><ellipse cx="879" cy="216" rx="43" ry="11"/>
    </g>
    <g stroke="#173849" stroke-width="7" stroke-linecap="round" opacity=".85">
      <path d="M110 232l-35-74m15 34l-31-20m43 4l25-30"/><path d="M295 238l43-88m-17 39l-35-25m50 1l31-27"/>
      <path d="M568 240l-22-92m13 44l-32-19m37-7l29-34"/><path d="M815 235l41-83m-18 35l-31-22m48 3l28-29"/>
    </g>
    <g fill="#edf8fc" opacity=".42"><path d="M0 195l73-17 61 20 65-35 81 45-82-26-73 18-54-13z"/><path d="M514 200l88-46 86 59-71-31-57 23z"/></g>
  </svg>`);

  const ground = svg(`
  <svg xmlns="http://www.w3.org/2000/svg" width="768" height="160" viewBox="0 0 768 160">
    <defs>
      <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#183247"/><stop offset="1" stop-color="#081826"/></linearGradient>
      <linearGradient id="ice" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bfeefa"/><stop offset=".46" stop-color="#72c6df"/><stop offset="1" stop-color="#347fa2"/></linearGradient>
      <linearGradient id="deep" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2c6e8e" stop-opacity=".72"/><stop offset="1" stop-color="#183e58" stop-opacity=".18"/></linearGradient>
    </defs>
    <rect width="768" height="160" fill="url(#rock)"/>
    <path fill="url(#ice)" d="M0 23l38-4 35 3 45-7 39 7 46-4 42 5 44-6 48 6 42-4 46 5 44-8 42 7 49-4 43 5 45-7 43 6 47-5 40 4v72H0z"/>
    <path fill="#f6fcfe" d="M0 8l38-3 35 4 45-6 39 7 46-4 42 5 44-6 48 6 42-4 46 5 44-7 42 7 49-4 43 5 45-7 43 6 47-5 40 4v18l-40-4-47 5-43-6-45 7-43-5-49 4-42-7-44 7-46-5-42 4-48-6-44 6-42-5-46 4-39-7-45 6-35-4-38 3z"/>
    <path fill="#d8f2f9" opacity=".82" d="M0 26l45-2 32 5 43-7 39 6 49-4 37 6 47-7 45 6 43-4 46 6 43-8 43 7 51-5 40 6 48-7 40 6 49-5 38 4v20H0z"/>
    <path fill="url(#deep)" d="M0 74l52-7 46 8 58-10 50 8 61-6 58 8 55-9 54 9 61-7 51 8 60-10 55 8 58-7 49 7 52-8 50 7v26H0z"/>
    <g stroke="#257493" stroke-width="2.4" fill="none" opacity=".78">
      <path d="M75 55l17 15-9 16 17 17"/><path d="M203 52l14 14-8 16 19 18"/><path d="M353 57l16 13-10 17 18 16"/><path d="M506 52l13 16-8 15 18 19"/><path d="M654 55l17 14-9 16 16 16"/>
    </g>
    <g stroke="#8fdcf0" stroke-width="1.2" fill="none" opacity=".42">
      <path d="M129 39l10 8 14-6"/><path d="M280 42l12 7 13-6"/><path d="M430 39l11 8 15-5"/><path d="M594 42l12 7 14-6"/>
    </g>
    <g fill="#20394d" opacity=".94"><ellipse cx="57" cy="128" rx="13" ry="5"/><ellipse cx="166" cy="116" rx="8" ry="4"/><ellipse cx="285" cy="137" rx="15" ry="6"/><ellipse cx="407" cy="120" rx="10" ry="4"/><ellipse cx="542" cy="136" rx="14" ry="5"/><ellipse cx="686" cy="118" rx="9" ry="4"/></g>
    <g fill="#75d8ef" opacity=".72"><path d="M30 98l6-15 6 15z"/><path d="M146 94l6-18 7 18z"/><path d="M267 99l6-15 6 15z"/><path d="M391 95l6-17 7 17z"/><path d="M514 98l6-16 6 16z"/><path d="M635 95l7-18 7 18z"/><path d="M746 98l6-15 6 15z"/></g>
  </svg>`);

  const obstacleTop = svg(`
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="760" viewBox="0 0 220 760">
    <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#102c40"/><stop offset=".48" stop-color="#387fa4"/><stop offset=".68" stop-color="#1f5a7a"/><stop offset="1" stop-color="#0e293b"/></linearGradient></defs>
    <path fill="url(#b)" stroke="#173f58" stroke-width="5" d="M39 0h143l-6 86 7 88-12 82 9 91-15 86 10 95-15 86 8 64-19 16H64l-18-17 8-72-13-83 12-91-13-89 11-85-10-90 8-86z"/>
    <path fill="#7fcce7" opacity=".2" d="M83 0h40l12 610-28 72-27-70z"/>
    <g stroke="#b6ecfb" stroke-width="3" fill="none" opacity=".7"><path d="M104 82l14 36-17 42 19 39-22 46"/><path d="M83 291l-15 28 17 37-20 36"/><path d="M128 435l19 28-17 38 16 36"/></g>
    <g fill="#dff7ff"><path d="M41 654l22-12 18 9 20-17 22 18 24-20 22 16 15-8-6 42H47z"/></g>
    <g fill="#9de2f6" stroke="#e9fbff" stroke-width="2"><path d="M52 670h17l-6 70-8-22z"/><path d="M81 669h14l-4 48-8-18z"/><path d="M103 666h19l-7 89-9-25z"/><path d="M134 669h16l-6 58-8-18z"/><path d="M160 668h15l-5 72-8-24z"/></g>
    <g fill="#d8f4fb" opacity=".58"><ellipse cx="51" cy="132" rx="25" ry="8"/><ellipse cx="171" cy="258" rx="22" ry="7"/><ellipse cx="48" cy="470" rx="24" ry="8"/></g>
  </svg>`);

  const obstacleBottom = svg(`
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="760" viewBox="0 0 220 760">
    <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#102c40"/><stop offset=".48" stop-color="#387fa4"/><stop offset=".68" stop-color="#1f5a7a"/><stop offset="1" stop-color="#0e293b"/></linearGradient></defs>
    <path fill="url(#b)" stroke="#173f58" stroke-width="5" d="M48 74l15-16h95l17 17-8 75 13 86-12 91 13 88-11 91 10 84-12 92 9 78H43l8-82-12-86 12-88-13-89 13-89-12-87 11-88z"/>
    <path fill="#7fcce7" opacity=".2" d="M82 84h42l10 593-27 63-28-62z"/>
    <g fill="#dff7ff"><path d="M39 77l18-19 20 9 18-28 20 28 25-31 17 29 21-13 7 46H37z"/></g>
    <g fill="#9de2f6" stroke="#e9fbff" stroke-width="2"><path d="M49 73l11-56 10 56z"/><path d="M77 72L87 30l9 42z"/><path d="M101 70L113 2l12 68z"/><path d="M134 72l10-50 10 50z"/><path d="M160 73l10-60 10 60z"/></g>
    <g stroke="#b6ecfb" stroke-width="3" fill="none" opacity=".7"><path d="M106 154l14 37-17 39 19 44-20 42"/><path d="M82 365l-16 31 18 35-20 40"/><path d="M129 510l18 29-17 39 16 35"/></g>
    <g fill="#d8f4fb" opacity=".58"><ellipse cx="48" cy="214" rx="24" ry="8"/><ellipse cx="172" cy="400" rx="23" ry="7"/><ellipse cx="49" cy="590" rx="25" ry="8"/></g>
  </svg>`);

  window.__FF_W2_ENV_ASSET_DATA_V1__ = { mountains, pines, avalanche, ground, obstacleTop, obstacleBottom };
  window.__FF_W2_ENV_ASSETS_V1_READY__ = true;
})();