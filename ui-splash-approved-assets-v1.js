(()=>{'use strict';
const B=window.__FF_SPLASHC_PARTS__;
const O=window.__FF_SPLASH_OVERLAY_PARTS__;
if(!B||!B.bg||!O||!O.overlay){
  console.warn('[FeatherFury] approved splash chunks missing');
  return;
}
window.__FF_SPLASH_APPROVED_V1__={
  background:'data:image/jpeg;base64,'+B.bg,
  overlay:'data:image/png;base64,'+O.overlay
};
window.__FF_SPLASH_APPROVED_V1_READY__=true;
})();
