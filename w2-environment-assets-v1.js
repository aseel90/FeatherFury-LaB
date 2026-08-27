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
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="160" viewBox="0 0 1024 160">
    <defs>
      <linearGradient id="base" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2c6f8d"/><stop offset=".58" stop-color="#245d78"/><stop offset="1" stop-color="#19465f"/></linearGradient>
      <linearGradient id="ice" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d7f7fd"/><stop offset=".42" stop-color="#91dced"/><stop offset="1" stop-color="#4aa4c3"/></linearGradient>
      <linearGradient id="under" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4da7c2" stop-opacity=".62"/><stop offset="1" stop-color="#2b6f8d" stop-opacity=".34"/></linearGradient>
    </defs>
    <rect width="1024" height="160" fill="url(#base)"/>
    <path fill="url(#ice)" d="M0 31L42 28 86 31 128 24 172 30 217 26 260 32 307 25 350 30 397 26 442 32 488 24 532 30 578 27 624 32 669 25 714 30 760 26 806 31 852 24 898 30 943 27 982 31 1024 31V101L982 98 943 103 898 97 852 104 806 98 760 102 714 97 669 104 624 98 578 102 532 97 488 103 442 98 397 102 350 97 307 104 260 98 217 103 172 97 128 104 86 98 42 102 0 101Z"/>
    <path fill="#f7fdff" d="M0 11L42 8 86 12 128 6 172 13 217 9 260 14 307 7 350 12 397 8 442 13 488 6 532 12 578 9 624 14 669 7 714 12 760 8 806 13 852 6 898 12 943 9 982 13 1024 11V32L982 30 943 33 898 28 852 34 806 29 760 33 714 28 669 34 624 29 578 33 532 28 488 34 442 29 397 33 350 28 307 34 260 29 217 33 172 28 128 34 86 29 42 32 0 31Z"/>
    <path fill="#d8f3f9" opacity=".82" d="M0 34L46 32 91 37 136 30 181 36 226 32 272 38 318 31 364 36 410 32 456 38 503 30 549 36 596 33 642 38 688 31 734 36 780 32 826 37 872 30 918 36 964 32 1024 35V55L964 52 918 57 872 51 826 58 780 52 734 56 688 51 642 58 596 52 549 56 503 51 456 57 410 52 364 56 318 51 272 58 226 52 181 57 136 51 91 58 46 52 0 55Z"/>
    <path fill="url(#under)" d="M0 82L58 76 112 84 169 75 224 83 280 77 336 85 393 76 449 83 505 77 562 85 619 75 675 83 731 77 788 84 844 75 900 83 957 77 1024 83V119L957 113 900 120 844 112 788 119 731 113 675 120 619 112 562 119 505 113 449 120 393 112 336 119 280 113 224 120 169 112 112 119 58 113 0 119Z"/>
    <g stroke="#2a7897" stroke-width="2.2" fill="none" opacity=".68">
      <path d="M88 57l16 14-8 16 17 18"/><path d="M243 55l14 15-9 15 19 19"/><path d="M401 59l16 13-10 18 18 16"/><path d="M566 54l14 16-9 16 18 18"/><path d="M731 58l16 14-9 17 17 17"/><path d="M893 55l15 15-9 16 18 18"/>
    </g>
    <g stroke="#9ee4f3" stroke-width="1.15" fill="none" opacity=".34">
      <path d="M154 43l11 8 14-6"/><path d="M325 45l12 7 14-6"/><path d="M493 42l12 8 15-5"/><path d="M657 45l12 7 14-6"/><path d="M823 42l12 8 14-5"/>
    </g>
    <g fill="#2b6179" opacity=".72"><ellipse cx="64" cy="136" rx="12" ry="4"/><ellipse cx="203" cy="124" rx="8" ry="3.5"/><ellipse cx="360" cy="140" rx="14" ry="5"/><ellipse cx="524" cy="126" rx="10" ry="4"/><ellipse cx="691" cy="139" rx="13" ry="5"/><ellipse cx="858" cy="125" rx="9" ry="4"/><ellipse cx="982" cy="140" rx="12" ry="4.5"/></g>
    <g fill="#79d8ed" opacity=".58"><path d="M36 109l6-14 6 14z"/><path d="M186 106l6-17 7 17z"/><path d="M348 110l6-14 6 14z"/><path d="M512 106l6-16 7 16z"/><path d="M678 110l6-15 6 15z"/><path d="M842 106l7-17 7 17z"/><path d="M994 110l6-14 6 14z"/></g>
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