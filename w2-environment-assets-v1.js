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
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#15384d"/><stop offset="1" stop-color="#0c2636"/></linearGradient></defs>
    <path fill="#17384b" opacity=".72" d="M0 320v-54l66-42 64 33 86-69 88 76 70-49 91 58 72-67 83 55 85-61 92 73 79-50 128 69v48z"/>
    <g fill="url(#g)" stroke="#214b61" stroke-width="2">
      <g transform="translate(20 55)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/><path fill="#bcdce9" opacity=".5" d="M24 0L10 35h27zM17 55L5 77h38z"/></g>
      <g transform="translate(90 92) scale(.82)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(152 31) scale(1.08)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/><path fill="#d9eef5" opacity=".48" d="M24 0L11 34h26zM17 56L6 77h37z"/></g>
      <g transform="translate(235 70) scale(.92)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(305 42) scale(1.13)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/><path fill="#d9eef5" opacity=".5" d="M24 0L11 34h26z"/></g>
      <g transform="translate(397 63)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(471 35) scale(1.12)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/><path fill="#d9eef5" opacity=".48" d="M24 0L11 34h26z"/></g>
      <g transform="translate(562 74) scale(.9)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(631 40) scale(1.07)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(721 64)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(798 30) scale(1.15)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/><path fill="#d9eef5" opacity=".5" d="M24 0L11 34h26z"/></g>
      <g transform="translate(901 72) scale(.92)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
      <g transform="translate(970 48) scale(1.02)"><path d="M24 0L0 61h13L0 88h15L0 121h48L33 88h15L34 61h14z"/></g>
    </g>
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
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="128" viewBox="0 0 512 128">
    <defs><linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1c3448"/><stop offset="1" stop-color="#101e2c"/></linearGradient><linearGradient id="i" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bceafa"/><stop offset="1" stop-color="#69b9da"/></linearGradient></defs>
    <rect width="512" height="128" fill="url(#r)"/><path fill="url(#i)" d="M0 10l32-2 32 4 32-5 32 7 32-4 32 2 32-3 32 4 32-2 32 2 32-4 32 6 32-8 32 7 32-4v43H0z"/>
    <path fill="#f0f9fd" d="M0 0h512v11l-32-1-32 4-32-7-32 8-32-6-32 4-32-2-32 2-32-4-32 3-32-2-32 4-32-7-32 5-32-4-32 2z"/>
    <path stroke="#2f7ca2" stroke-width="2" fill="none" opacity=".85" d="M80 43l12 14-7 15 18 14M181 43l14 13-9 15 19 17M315 43l13 14-8 15 17 15M431 43l14 13-8 16 18 15"/>
    <g fill="#263d50"><ellipse cx="55" cy="104" rx="9" ry="4"/><ellipse cx="152" cy="92" rx="6" ry="3"/><ellipse cx="269" cy="109" rx="12" ry="5"/><ellipse cx="378" cy="95" rx="8" ry="4"/><ellipse cx="486" cy="112" rx="10" ry="4"/></g>
    <g fill="#8ce5fa"><path d="M35 46l5-13 5 13z"/><path d="M144 48l5-16 6 16z"/><path d="M260 46l5-14 5 14z"/><path d="M381 48l5-17 6 17z"/><path d="M494 46l5-14 5 14z"/></g>
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
