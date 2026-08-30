# Feather Fury — Future Roadmap & Retention Architecture

> **Status:** PLANNING CONTRACT — documentation only. This file does not authorize changing the current working runtime by itself.
>
> **Primary rule:** Feather Fury already works as a complete game. Future systems must be added around the approved game, not by replacing or rewriting working worlds, bosses, physics, HUD, store, save logic, or navigation ownership.

## 1. Product vision

Feather Fury must not depend forever on this loop alone:

`World -> obstacles -> boss -> next world -> repeat`

That loop remains the **Campaign / Adventure core**, but long-term retention will come from reusable layers built around the same approved worlds, bosses, heroes, economy, and skill systems.

Target long-term structure:

- **Adventure / Campaign** = story progression and world completion.
- **Fury Run** = replayable endless / run-based mode using unlocked worlds.
- **Boss Rush** = skill-focused replay of unlocked bosses.
- **Daily Flight / Challenges** = lightweight reasons to return without forced grind.
- **Hero Mastery** = long-term attachment to every hero, not only the strongest/economic hero.
- **Coins + Consumables + Revives** = recurring economy sinks after permanent characters are unlocked.
- **Cosmetics** = late-game coin sink without pay-to-win power creep.
- **Rewarded Ads** = optional value exchange, never required to play the game.

The game must continue to feel fast to enter and easy to understand.

---

## 2. Non-regression expansion contract — HARD RULE

All future feature work follows these rules:

1. **Do not rewrite a working system to add a new mode.**
2. New modes live in new isolated modules first and consume approved APIs/state from the current runtime.
3. Current Adventure/Campaign behavior must remain byte-for-byte or behaviorally unchanged unless the task explicitly requires a bug fix.
4. New mode UI must be feature-gated. If incomplete, it stays hidden or visibly locked and cannot interfere with normal gameplay.
5. Save data for new modes uses new keys; never repurpose existing `fh_*` keys without migration.
6. New mode navigation must route through the canonical UI navigation owner rather than directly toggling random screens.
7. Every new mode must be removable/disableable without breaking Adventure.
8. A feature is not merged as active until Chromium + WebKit + Android RC checks still pass for the existing game.
9. Build one system at a time. Do not implement Fury Run, Missions, Mastery, Ads, and Consumables in one patch series.
10. Existing worlds/bosses remain authoritative content owners; replay modes reference them rather than cloning or forking their logic.

**Development philosophy:** extend around the stable core, never destabilize the stable core to reach a future feature faster.

---

## 3. Main navigation concept — left-side Mode Rail

### Approved direction

Keep the existing world cards / world carousel as the main visual focus.

Add a future **Mode Rail** on the **left side** of the World Select screen:

- visually related to the existing world cards;
- smaller vertical/hanging cards so they do not compete with the selected world;
- feels attached to the world-select scene rather than opening a completely different launcher;
- locked modes remain visible as goals when appropriate;
- current Adventure view remains the default and requires no extra tap for a new player.

Conceptual layout:

```text
+----------------------------------------------------+
| [ ADVENTURE ] |                                    |
|               |        CURRENT WORLD CARD          |
| [ FURY RUN ]🔒|                                    |
|               |          <  WORLD 2  >             |
| [ BOSS RUSH ]🔒                                    |
|               |            [ PLAY ]                |
| [ DAILY ]  🔒 |                                    |
+----------------------------------------------------+
```

On narrow devices the rail may collapse to compact icons/tabs, but it must not push the current world card, PLAY button, HUD/menu controls, or safe areas outside the viewport.

### Mode states

Each mode card has exactly one of these states:

- **ACTIVE** — currently selected mode.
- **AVAILABLE** — unlocked and selectable.
- **LOCKED** — visible but unavailable; shows the exact unlock requirement.
- **HIDDEN** — feature not shipped yet; do not tease unfinished systems unless intentionally planned.

Locked example:

`FURY RUN`
`Complete World 2 to unlock`

The lock should feel like a future goal, not a monetization wall.

---

## 4. Proposed unlock gates — TUNABLE, NOT FINAL BALANCE

These are initial product gates and may be changed after playtesting without changing the architecture.

| Mode | Initial gate | Reason |
|---|---|---|
| Adventure | Available from first launch | This is the existing game and must remain frictionless. |
| Fury Run | Complete World 2 | Gives replay value before the player exhausts all current campaign content. |
| Boss Rush | Complete World 3 | The player should first meet the three bosses normally. |
| Daily Flight | Complete World 1 | Avoids overwhelming a brand-new player while introducing return goals early. |
| Weekly / Leaderboard | Later release gate | Only after the underlying run/challenge mode is stable and measurable. |

Important: unlocking a mode is progression-based, **never ad-gated and never coin-gated**.

---

## 5. Adventure / Campaign — PRESERVE

Adventure is the current Feather Fury experience:

`World obstacles -> progression -> boss -> story/outro -> next world`

Rules:

- Preserve current world identity, physics, scoring, bosses, story and rewards.
- New worlds continue to expand Adventure.
- World completion unlocks content in other modes.
- Adventure must never require Consumables, ads or a specific paid/unlocked hero to complete.

Adventure is the onboarding and narrative backbone of the game.

---

## 6. Fury Run — highest-priority future replay mode

### Goal

Turn every completed world into reusable content instead of one-time campaign content.

### Core concept

A single run chains unlocked world themes together:

`Cursed Woods -> Frozen Realm -> Storm World -> future worlds -> harder cycle -> bosses -> continue until death`

The exact order may be deterministic, rotating, or seeded later.

### Run upgrades

After defined milestones or bosses, offer a small choice of temporary run-only modifiers, for example:

- +Perfect Pass window;
- temporary shield;
- stronger short Magnet;
- faster Fever charge;
- smaller hitbox for the next section;
- coin-risk/reward modifier.

Rules:

- upgrades reset when the run ends;
- no giant RPG tree at launch;
- choices should create different runs without replacing hero identity;
- no upgrade can permanently modify Adventure physics or save-state balance.

### Why Fury Run comes before World 4 as a retention feature

Every future world then produces two kinds of value:

1. new Adventure content;
2. new Fury Run content.

This improves content efficiency and creates a long-term score/challenge loop.

---

## 7. Boss Rush

Unlock only after the player has legitimately encountered the required bosses in Adventure.

Initial loop:

`Crow King -> Ice Emperor -> Lord Voltbat -> future bosses`

Possible future variants:

- fastest clear;
- one-life Boss Rush;
- weekly enraged modifiers;
- fixed-hero challenge;
- no-Consumable challenge.

Boss Rush must reuse the authoritative boss runtime; do not maintain separate boss implementations for this mode.

---

## 8. Daily Flight and missions

### Daily Flight

One concise daily rule set, not a long checklist.

Examples:

- reach a target score in Cursed Woods;
- use Falcon and get a Perfect Pass target;
- survive Storm World with no Revive;
- defeat a specified boss under a modifier.

### Missions

Keep the surface small:

- up to 3 lightweight daily objectives;
- a small weekly set later.

Goals should encourage another run, different heroes, Perfect Passes, coins or bosses — not chores unrelated to the core game.

Do not punish missed days with a harsh streak reset.

---

## 9. Hero Mastery

Permanent characters should remain meaningful after purchase.

Each hero may eventually have a separate Mastery track earned by actually playing that hero.

Preferred rewards:

- profile badge;
- portrait/frame;
- trail;
- alternate color/style;
- victory/death effect;
- minor prestige rewards.

Avoid large permanent stat upgrades that make one mastered hero invalidate the rest of the roster.

### Hero role principle

There should be no universal "best hero".

Long-term identity targets:

- Golden King = economy/farming specialist.
- Cyber = survival specialist.
- Falcon = Fever specialist.
- Pigeon = precision/Perfect Pass specialist.
- other heroes = distinctive situational goals.

The best hero should depend on the player's objective or mode.

---

## 10. Economy v1 — design direction

The coin must retain value **after the player buys Golden King and other permanent characters**.

Therefore the economy must have both:

### Permanent sinks

- hero unlocks;
- future cosmetics / prestige collection.

### Recurring sinks

- Revive;
- limited-use Consumables;
- optional run preparation.

Do not rely on continuously increasing hero prices as the retention mechanism.

Retention should come from wanting another run, not from artificial grind.

---

## 11. Consumables — future v1 candidates

Start with only a few clear items.

### Magnet Charm

- temporary Magnet for a fixed number of seconds;
- intended for coin-focused runs;
- if Golden King uses it, upgrade his existing Magnet temporarily instead of making his permanent ability meaningless;
- no direct x2 coin multiplier in v1.

### Tailwind / Launch Boost

Preferred design:

- makes the opening section easier or smoother for a short period;
- does **not** skip score/world progression;
- example direction: temporary obstacle-speed relief or safer first segment.

### Revive Feather

- inventory item that can replace a coin/ad Revive option;
- quantity capped to prevent hoarding from removing all run risk.

Do not launch a large inventory system until these three prove useful.

---

## 12. Revive architecture

The death screen should eventually offer player choice rather than forcing one currency path.

Target options may include:

- use a Revive Feather;
- pay Coins;
- watch an optional Rewarded Ad;
- end the run.

Initial design target:

- limited number of Revives per run;
- escalating coin cost across Revives in the same run;
- Rewarded Ad available only at selected Revive opportunities, not indefinitely;
- Adventure must remain finishable without viewing ads.

Exact prices and counts are Economy v1 tuning, not locked by this roadmap.

---

## 13. Ads philosophy — HARD PRODUCT RULE

Feather Fury should monetize without making the player feel punished for playing.

### Preferred

- optional Rewarded Revive;
- optional Rewarded Booster / daily item later;
- clear reward before the player chooses the ad.

### Avoid at initial launch

- forced ad at game start;
- forced ad before the first run;
- ad during active gameplay;
- ad after every death;
- ad immediately after another rewarded ad;
- large repeated coin-ad rewards that inflate the economy and reduce Golden King's value.

Ads are a **choice of resource**: the player can spend time, Coins or an inventory item.

---

## 14. Golden King economic role

Golden King must not be the point where Coins stop mattering.

His long-term role:

`better coin collection -> funds more optional Consumables / Revives / cosmetics -> supports high-score push runs`

Rules:

- preserve his economy identity;
- do not stack unlimited multipliers with ad rewards and Consumables;
- Magnet Consumables should synergize with him rather than duplicate/erase his ability;
- never make Golden King simultaneously the best survival hero, best score hero and best economy hero.

---

## 15. Cosmetics — late-game economy sink

After core retention systems are stable, optional cosmetic sinks can absorb excess coins without creating pay-to-win pressure.

Candidates:

- trails;
- victory effects;
- death effects;
- alternate hero colors;
- profile frames;
- boss badges;
- mastery cosmetics.

High-cost cosmetics are a better late-game coin sink than endlessly inflating functional item prices.

---

## 16. Recommended implementation order

Do not skip ahead unless a concrete product reason is documented.

### Phase 0 — Preserve release baseline

- Keep current Adventure fully working.
- No new runtime feature yet.
- Maintain existing automated QA gates.

### Phase 1 — Economy v1 design + telemetry plan

- final hero prices;
- coin earn-rate targets;
- Revive escalation rules;
- 2–3 Consumables;
- define measurements needed for playtest tuning.

### Phase 2 — Economy v1 implementation

- add Consumable data/inventory in isolated modules;
- update Store without changing current Adventure gameplay unless an item is explicitly activated;
- add Revive choice architecture behind a safe feature flag first.

### Phase 3 — Mode Rail shell

- add the left-side mode-card UI only;
- Adventure remains selected by default;
- future modes are LOCKED/HIDDEN;
- no Fury Run gameplay yet;
- prove responsive behavior and navigation without changing current World Select ownership.

### Phase 4 — Fury Run v1

- isolated mode controller;
- reuse unlocked worlds;
- one temporary-upgrade choice system;
- independent score/run save keys;
- no global Adventure side effects.

### Phase 5 — Hero Mastery

- per-hero progression;
- mostly cosmetic/prestige rewards.

### Phase 6 — Boss Rush

- reuse authoritative boss implementations;
- separate run result/leaderboard data.

### Phase 7 — Daily Flight / lightweight missions

- content rotation built from existing worlds/rules;
- no mandatory login streak.

### Phase 8 — Rewarded Ads

- Revive first;
- optional booster later;
- frequency and value measured against coin economy.

### Phase 9 — Cosmetics / events / leaderboards

Only after the replay loop proves that players return.

---

## 17. Release discipline for every future phase

Before activating any future phase:

1. capture the current green baseline SHA;
2. implement in new isolated files where practical;
3. preserve Adventure entry/play/end flow;
4. preserve existing save compatibility;
5. add specific regression tests for the new feature;
6. rerun Live Verify on Chromium + WebKit;
7. rerun playable-world/boss QA when relevant;
8. rerun Store QA when economy/store changes;
9. rebuild Android RC for any production JS/CSS/assets change;
10. if a regression appears, revert/disable the new feature rather than patching around it by changing unrelated approved systems.

A future feature is successful only when **the old game still works exactly as expected plus the new feature works**.

---

## 18. Open design questions — decide later with playtest data

Do not hard-code these decisions in advance:

- exact Fury Run unlock world (initial proposal: after World 2);
- Fury Run world sequence/rotation;
- final hero Coin prices;
- final Revive costs and maximum count;
- Consumable prices/durations;
- Daily challenge reward size;
- whether Leaderboards are global, weekly, friends-only, or mixed;
- whether any second currency is ever necessary.

Current direction is **one soft currency (Coins)** until the game proves it needs additional complexity.

---

## 19. Definition of long-term success

Feather Fury should eventually give a player several valid reasons to press PLAY:

- continue the Adventure;
- beat a personal Fury Run record;
- finish a daily challenge;
- master a favorite hero;
- fight bosses efficiently;
- farm Coins with Golden King;
- spend Coins on a push run or cosmetics.

The target feeling is:

**"One more run because I want to try something."**

Not:

**"One more run because the game is forcing me to grind or watch an ad."**
