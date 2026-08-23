/**
 * Feather Hero - The Adventure Edition (Web & Android Prototype)
 */

const CONFIG = {
  CANVAS_WIDTH: 360, CANVAS_HEIGHT: 640,
  GRAVITY: 0.26, JUMP_FORCE: -5.8, MAX_VELOCITY: 8.0,
  SPEED_NORMAL: 2.0, SPEED_FEVER: 6.0,
  SPAWN_NORMAL: 125, SPAWN_FEVER: 45,
  GAP_SIZE: 154, PILLAR_MIN_HEIGHT: 60,
  GROUND_HEIGHT: 95, BIRD_RADIUS: 14,
  FEVER_MAX: 100, FEVER_PER_COIN: 25, FEVER_DURATION: 300,
  STAGE1_END: 15, STAGE2_END: 35, BOSS_HP: 5,
  REVIVE_COST: 10,
  // World 2: Frostbite Peaks
  W2_BOSS_HP: 8, W2_GAP_SIZE: 146, W2_SPEED: 2.2,
  WIND_FORCE: 0.10, WIND_INTERVAL: 200,
  // World 3: Storm Peaks
  W3_BOSS_HP: 9, W3_GAP_SIZE: 142, W3_SPEED: 2.4,
  ICICLE_FALL_SPEED: 7, SNOWBALL_SPEED: 3.5
};

const I18N = {
  ar: {
    subtitle: 'غضب الريش: الانتقام', shopBtn: 'المتجر', playBtn: 'بدء المهمة',
    endlessBtn: 'الطور اللانهائي', reviveBtn: 'استمرار (محاولة ثانية)',
    storyL1: 'تحالف الأشرار سلب ريشات الحماية وسجنك..', storyL2: 'حطم القفص وانطلق في مهمتك لإنقاذ الغابة!',
    tapToLaunch: 'انقر للتحطيم!', tapToContinue: 'انقر للمتابعة',
    bossL1: 'أخيراً تحررت أيها الطائر الصغير؟', bossL2: 'سأوقفك هنا قبل أن تصل إلى بقية الحلفاء!',
    owlL1: 'أحسنت صنعاً! تم تحرير الحارس الأول..', owlL2: 'إمبراطور الجليد في قمم الصقيع علم بهزيمتي وينتظرك!',
    bossWarning: 'تحذير: الزعيم يقترب! اجمع كرات الطاقة الزرقاء للهجوم!',
    scoreLabel: 'النقاط', bestScoreLabel: 'أعلى نتيجة', collectedLabel: 'جمعت',
    restartBtn: 'إعادة اللعب', returnBtn: 'العودة', shopTitle: 'متجر الأبطال',
    stage1: 'الأطلال', stage2: 'الغابة الملعونة', bossStage: 'قتال الزعيم!',
    winTitle: 'انتصار!', winText: 'لقد أكملت مرحلة الأطلال بنجاح!', gameOverTitle: 'انتهت اللعبة',
    feverLabel: 'الحمى', langLabel: 'اللغة',
    settingsTitle: 'الإعدادات', sfxLabel: 'المؤثرات الصوتية', gfxLabel: 'تأثيرات الجسيمات',
    resetLabel: 'حذف البيانات (تصفير)', nextWorldBtn: 'العالم التالي', mainMenuBtn: 'الرئيسية',
    sfxOn: 'مفعل', sfxOff: 'معطل', gfxHigh: 'مرتفع', gfxLow: 'منخفض', resetConfirm: 'تأكيد الحذف',
    resetConfirmMsg: 'هل أنت متأكد من حذف جميع بيانات اللعبة؟',
    leaderboardTitle: 'أفضل اللاعبين', leaderboardSubtitle: 'النتائج المباشرة',
    you: 'أنت', dodgeText: 'مراوغة!', perfectPass: 'مثالي +2',
    versionLabel: 'الإصدار 2.2.6', devLabel: 'تطوير',
    hints: [
      'تلميح: اجمع العملات لملء شريط الحمى!',
      'تلميح: عندما يمتلئ شريط الحمى يمكنك تحطيم الأعمدة!',
      'تلميح: المرور في منتصف الفجوة يعطيك نقطتين (Perfect Pass)!',
      'تلميح: لا تلمس الأعداء قبل أن تفعل وضع الحمى!',
      'تلميح: في قتال الزعيم، اجمع كرات الطاقة الزرقاء لضربه!',
      'تلميح: يمكنك اختيار وتغيير مظهر طائرك من المتجر!'
    ],
    // World 2
    w2_storyL1: 'رياح الصقيع تهب من قمم الجبال الباردة..', w2_storyL2: 'إمبراطور الجليد استعد بعد هزيمة ملك الغربان!',
    w2_bossL1: 'سمعت أنك هزمت ملك الغربان..', w2_bossL2: 'لكن صقيع الجبال سيوقف تقدمك هنا!',
    w2_owlL1: 'أحسنت! تم تحرير نسر الجبال..', w2_owlL2: 'بقي زعيمهم لورد خفافيش الرعد في قمة البرج!',
    w2_stage1: 'قمم الصقيع', w2_stage2: 'وادي الانهيار', w2_bossStage: 'إمبراطور الجليد!',
    w2_winText: 'لقد أكملت مرحلة قمم الصقيع بنجاح!',
    // World 3
    w3_storyL1: 'العاصفة تشتد حول برج الرعد...', w3_storyL2: 'لورد الخفافيش يستعد للمواجهة الحاسمة!',
    w3_bossL1: 'تجرؤ على مواجهتي بعد هزيمة حلفائي؟', w3_bossL2: 'صواعق البرق ستنهي محاولتك هنا!',
    w3_owlL1: 'تهانينا! استعدنا ريشات الحماية وأحبطت خطة لورد الخفافيش!', w3_owlL2: 'لكن حمم البراكين البعيدة بدأت تثور.. استعد للمغامرات القادمة!',
    w3_winText: 'لقد أكملت مرحلة برج العاصفة بنجاح!',
    w3_stage1: 'برج العاصفة', w3_stage2: 'السحاب المشحون', w3_bossStage: 'لورد الخفافيش!'
  },
  en: {
    subtitle: 'FeatherFury: Vengeance', shopBtn: 'Shop', playBtn: 'Start Mission',
    endlessBtn: 'Endless Mode', reviveBtn: 'Continue (Revive)',
    storyL1: 'The dark alliance stole the guardian feathers and caged you..', storyL2: 'Smash the cage and start your quest to save the forest!',
    tapToLaunch: 'TAP TO SMASH!', tapToContinue: 'TAP TO CONTINUE',
    bossL1: 'You finally broke free, little bird?', bossL2: 'I will stop you before you reach my allies!',
    owlL1: 'Well done! The first guardian is free..', owlL2: 'The Ice Emperor at Frostbite Peaks awaits you!',
    bossWarning: 'WARNING: Boss incoming! Collect energy orbs to attack!',
    scoreLabel: 'Score', bestScoreLabel: 'Best Score', collectedLabel: 'Collected',
    restartBtn: 'Play Again', returnBtn: 'Return', shopTitle: 'Heroes Shop',
    stage1: 'Ruins', stage2: 'Cursed Woods', bossStage: 'Boss Fight!',
    winTitle: 'VICTORY!', winText: 'You completed Ruins!', gameOverTitle: 'GAME OVER',
    feverLabel: 'FEVER', langLabel: 'Language',
    settingsTitle: 'Settings', sfxLabel: 'Sound Effects', gfxLabel: 'Particle Effects',
    resetLabel: 'Delete Data (Reset)', nextWorldBtn: 'Next World', mainMenuBtn: 'Main Menu',
    sfxOn: 'Enabled', sfxOff: 'Disabled', gfxHigh: 'High', gfxLow: 'Low', resetConfirm: 'Confirm',
    resetConfirmMsg: 'Are you sure you want to delete all game data?',
    leaderboardTitle: 'Leaderboard', leaderboardSubtitle: 'Live Global Rankings',
    you: 'You', dodgeText: 'DODGE!', perfectPass: 'PERFECT +2',
    versionLabel: 'Version 2.2.6', devLabel: 'Developed by',
    hints: [
      'HINT: Collect coins to fill the Fever bar!',
      'HINT: Smash pillars when Fever Mode is active!',
      'HINT: Pass exactly through the center for a Perfect Pass (+2)!',
      'HINT: Avoid enemies until Fever Mode is active!',
      'HINT: Collect blue Energy Orbs to attack the Boss!',
      'HINT: Unlock new skins in the Shop!'
    ],
    // World 2
    w2_storyL1: 'Freezing winds blow from the mountain peaks..', w2_storyL2: 'The Ice Emperor prepared his defenses after the Crow King fell!',
    w2_bossL1: 'I heard you defeated the Crow King..', w2_bossL2: 'The freezing cold will stop you here!',
    w2_owlL1: 'Well done! The Mountain Eagle is saved..', w2_owlL2: 'Only Lord Voltbat remains at the Storm Spire!',
    w2_stage1: 'Frostbite Peaks', w2_stage2: 'Avalanche Valley', w2_bossStage: 'Ice Emperor!',
    w2_winText: 'You completed Frostbite Peaks!',
    // World 3
    w3_storyL1: 'The storm rages around the Thunder Spire...', w3_storyL2: 'Lord Voltbat prepares for the final showdown!',
    w3_bossL1: 'You dare challenge me after defeating my allies?', w3_bossL2: 'My thunderbolts will stop your journey!',
    w3_owlL1: 'Congratulations! The guardian feathers are safe and the bat lord is defeated!', w3_owlL2: 'Yet magma stirs in the distant volcanic valley.. Prepare for upcoming worlds!',
    w3_winText: 'You completed Storm Spire!',
    w3_stage1: 'Storm Spire', w3_stage2: 'Charged Clouds', w3_bossStage: 'Lord Voltbat!'
  }
};
const STAGE_COLORS = {
  storm: ['#0f172a', '#1e293b'],
  1: { top: [52, 152, 219], bot: [133, 193, 233] }, // Day
  2: { top: [192, 57, 43], bot: [230, 126, 34] },   // Sunset
  3: { top: [15, 23, 42], bot: [51, 65, 85] },      // Night
  STORY: { top: [17, 24, 39], bot: [31, 41, 55] },  // Dark Cage
  BOSS: { top: [30, 0, 0], bot: [10, 0, 0] },       // Bloody Red
  // World 2: Ice
  'w2_1': { top: [30, 58, 138], bot: [59, 130, 246] },   // Frozen Night
  'w2_2': { top: [71, 85, 105], bot: [148, 163, 184] },  // Storm Grey
  'w2_BOSS': { top: [15, 23, 42], bot: [30, 64, 175] },  // Dark Aurora
  'w2_STORY': { top: [20, 30, 60], bot: [40, 60, 100] }, // Frozen Dark
  // World 3: Storm
  'w3_1': { top: [15, 23, 42], bot: [30, 58, 138] },      // Charged Night
  'w3_2': { top: [30, 27, 75], bot: [76, 29, 149] },      // Purple Storm
  'w3_BOSS': { top: [10, 10, 30], bot: [30, 10, 60] },    // Thunder Spire
  'w3_STORY': { top: [15, 23, 42], bot: [59, 130, 246] }  // Electric Horizon
};

const SKINS = {
  classic: { id: 'classic', name_ar: 'العصفور الكلاسيكي', name_en: 'Classic Hero', price: 0, body: '#f1c40f', wing: '#ffffff', belly: '#e67e22', beak: '#e74c3c', maskColor: '#e74c3c', acc: 'none', bodyType: 'normal' },
  pigeon: { id: 'pigeon', name_ar: 'الحمامة النينجا', name_en: 'Ninja Pigeon', price: 15, body: '#f8fafc', wing: '#cbd5e1', belly: '#94a3b8', beak: '#f59e0b', maskColor: '#000000', acc: 'ninja', bodyType: 'fat' },
  falcon: { id: 'falcon', name_ar: 'الصقر الجارح', name_en: 'Fierce Falcon', price: 35, body: '#78350f', wing: '#451a03', belly: '#d6d3d1', beak: '#fbbf24', maskColor: '#2563eb', acc: 'scar', bodyType: 'muscle' },
  phoenix: { id: 'phoenix', name_ar: 'فينيق اللهب', name_en: 'Flame Phoenix', price: 60, body: '#ef4444', wing: '#f59e0b', belly: '#f97316', beak: '#1e293b', maskColor: '#10b981', acc: 'flame', bodyType: 'normal' },
  cyber: { id: 'cyber', name_ar: 'مقاتل السايبورغ', name_en: 'Cyber Fighter', price: 100, body: '#334155', wing: '#06b6d4', belly: '#1e293b', beak: '#3b82f6', maskColor: '#f43f5e', acc: 'visor', bodyType: 'muscle' },
  ghost: { id: 'ghost', name_ar: 'طائر الشبح', name_en: 'Ghost Bird', price: 150, body: '#e0e7ff', wing: '#c7d2fe', belly: '#a5b4fc', beak: '#818cf8', maskColor: '#4f46e5', acc: 'aura', bodyType: 'slim' },
  king: { id: 'king', name_ar: 'الملك الذهبي', name_en: 'Golden King', price: 300, body: '#fbbf24', wing: '#f59e0b', belly: '#d97706', beak: '#b45309', maskColor: '#78350f', acc: 'crown', bodyType: 'fat' },
  eagle: { id: 'eagle', name_ar: 'نسر الجبال', name_en: 'Mountain Eagle', price: 9999, body: '#451a03', wing: '#78350f', belly: '#fef3c7', beak: '#f59e0b', maskColor: '#451a03', acc: 'aura', bodyType: 'muscle' }
};

