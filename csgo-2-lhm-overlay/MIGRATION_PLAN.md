# CS2 Overlay Migration Plan (Logic + Elements + Style)

This plan upgrades the default `csgo-2-lhm-overlay` into a fully custom broadcast overlay inspired by your LoL theme approach.  
Scope includes **logic changes**, **element/layout changes**, and **full styling pass**.

---

## Phase 1 - Foundation and data correctness

### `src/App.tsx`
- [ ] Extract match polling + assignment into `useMatchData` hook.
- [ ] Extract GSI subscription into `useGSIState` hook.
- [ ] Add `normalizeGameState(game, match)` before rendering `Layout`.
- [ ] Remove inline side-reverse/match-veto logic from render path.
- [ ] Add fallback handling for missing `bomb`, `round`, `player`, `map`.

**Acceptance**
- App still renders with live GSI.
- No crash when bomb/player fields are missing.

### `src/API/socket.ts`
- [ ] Split event handlers into named functions.
- [ ] Ensure listeners are not duplicated on reconnect.
- [ ] Gate logs behind a debug flag.
- [ ] Keep `refreshHUD` behavior unchanged.

**Acceptance**
- No duplicate action/config execution after reconnect.
- Update and action events still work.

### `src/API/HUD/index.ts`
- [ ] Fix avatar loader fallback (`result.custom || result.steam`).
- [ ] Separate player extension fetch from direct global mutation.
- [ ] Add safe guard for unresolved/failing extension calls.

**Acceptance**
- Avatar enrichment still works.
- No stale unresolved player loaders.

### `src/API/index.ts`
- [ ] Add request timeout + typed error handling.
- [ ] Keep API shape identical for callers.
- [ ] Convert loose `any` responses to typed returns where possible.

**Acceptance**
- Existing API calls still compile and run.
- Network failure paths are handled gracefully.

### `src/API/types.ts`
- [ ] Add explicit nullable fields that appear in live payloads.
- [ ] Add normalized UI-facing types (separate from raw API types).

**Acceptance**
- Type safety improves without changing runtime behavior.

---

## Phase 2 - Actions, settings, and control surface

### `src/API/contexts/actions.tsx`
- [ ] Stabilize dependency handling in `useAction`, `onGSI`, `useOnConfigChange`.
- [ ] Avoid unintended re-registering of callbacks.
- [ ] Keep external hook signatures unchanged.

**Acceptance**
- Actions fire exactly once per event.

### `src/API/contexts/managers.ts`
- [ ] Add handler dedup.
- [ ] Add optional manager `clear()` for teardown/testing.
- [ ] Add changed-section diffing for config notifications.

**Acceptance**
- Config changes notify only when relevant data changes.

### `src/API/contexts/settings.ts`
- [ ] Extend action/input typing for new controls.
- [ ] Add optional schema version field support.

**Acceptance**
- `useConfig` and `useAction` remain strongly typed.

### `public/panel.json`
- [ ] Add `theme_settings` section (preset, opacity, border softness, animation profile).
- [ ] Add `layout_settings` section (compact mode, radar mode, feed density).
- [ ] Add `timer_settings` section (urgent thresholds, pulse behavior).
- [ ] Keep existing sections backward-compatible.

**Acceptance**
- New controls appear in LHM panel.
- Old controls still work.

### `public/keybinds.json`
- [ ] Add bindings for layout cycle, compact observed toggle, radar detail toggle.
- [ ] Keep existing Alt+C / Alt+V / Alt+B behavior unless intentionally changed.

**Acceptance**
- New keybind actions are received by HUD action bus.

---

## Phase 3 - Layout and component orchestration

### `src/HUD/Layout/Layout.tsx`
- [ ] Introduce explicit zones (top, center, side, bottom, overlay-layer).
- [ ] Create a phase-driven visibility model:
  - freezetime: economy + utility emphasis
  - live: players + observed + radar emphasis
  - bomb: timer urgency emphasis
- [ ] Add `cleanFeed` mode toggle.

**Acceptance**
- All major widgets still render.
- Visibility changes correctly with game phases.

---

## Phase 4 - Matchbar and timer system rebuild

### `src/HUD/MatchBar/MatchBar.tsx`
- [ ] Use normalized timer model from shared selector.
- [ ] Improve round/OT label formatting.
- [ ] Add bomb-site label in planted phase.
- [ ] Support compact and default matchbar variants.

### `src/HUD/Timers/Countdown.ts`
- [ ] Rework interpolation and stale tick handling.
- [ ] Use clear source priority (`bomb.countdown` then fallback).
- [ ] Keep smooth decrement behavior.

### `src/HUD/Timers/BombTimer.tsx`
- [ ] Add urgency classes (`normal`, `warn`, `critical`).
- [ ] Add optional pulse below threshold.

### `src/HUD/Timers/PlantDefuse.tsx`
- [ ] Harden missing player cases.
- [ ] Improve animation timing and side-color tracks.

### `src/HUD/MatchBar/TeamScore.tsx`
- [ ] Rework win announcement timing and cancellation on round transition.

### `src/HUD/MatchBar/SeriesBox.tsx`, `WinIndicator.tsx`, `TeamLogo.tsx`
- [ ] Unify panel shell style usage.
- [ ] Add robust fallback logo rendering.

**Acceptance**
- Timer/plant/defuse visuals are stable and phase-correct.
- Win banner behaves consistently.

---

## Phase 5 - Player panels and observed block

### `src/HUD/Players/TeamBox.tsx`
- [ ] Enforce deterministic player order (observer slot).

### `src/HUD/Players/Player.tsx`
- [ ] Refactor weapon parsing into helpers.
- [ ] Improve grenade keying/render consistency.
- [ ] Add compact row variant support.

### `src/HUD/Players/Observed.tsx`
- [ ] Decouple trivia/cam toggles.
- [ ] Add compact/expanded observed card modes.
- [ ] Improve ammo fallback for non-gun states.

### `src/HUD/Players/Avatar.tsx`
- [ ] Standardize fallback chain: team logo -> player avatar -> placeholder.
- [ ] Keep camera behavior explicit and predictable.

### `src/HUD/Indicators/Armor.tsx`, `Bomb.tsx`, `Defuse.tsx`
- [ ] Standardize indicator sizing and visibility policy.

**Acceptance**
- Observed and team rows are visually coherent.
- No flicker or broken icons with changing loadout/state.

---

## Phase 6 - Radar logic and rendering pass

### `src/HUD/Radar/RadarMaps.tsx`
- [ ] Add size clamps and mode presets (`mini`, `default`, `focus`).
- [ ] Keep map pick strip optional by config.

### `src/HUD/Radar/Radar.tsx`
- [ ] Convert into pure render adapter with normalized props.

### `src/HUD/Radar/LexoRadar/LexoRadarContainer.tsx`
- [ ] Isolate zoom and transform math.
- [ ] Add reduced-detail mode for performance.

### `src/HUD/Radar/LexoRadar/utils.ts`
- [ ] Refactor smoothing/direction/shooting utilities into pure functions.
- [ ] Reduce implicit global mutable state where feasible.

### `src/HUD/Radar/LexoRadar/LexoRadar.tsx`
- [ ] Split player/grenade/bomb render layers.
- [ ] Improve visibility logic readability for multilayer maps.

### `src/HUD/Radar/LexoRadar/maps/index.ts`
- [ ] Harden map metadata fallback behavior.

**Acceptance**
- Radar remains smooth and correct on supported maps.
- No exceptions on missing map config.

---

## Phase 7 - Event feed and secondary widgets

### `src/HUD/Killfeed/Killfeed.tsx`
- [ ] Actually enqueue bomb plant/defuse events (typed already).
- [ ] Add max queue size + expiry policy.

### `src/HUD/Killfeed/Kill.tsx`
- [ ] Add grouped multi-kill visual states.

### `src/HUD/Overview/Overview.tsx`
- [ ] Split player preview and match preview logic into dedicated selectors/hooks.

### `src/HUD/PlayerOverview/PlayerOverview.tsx`
- [ ] Fix HS metric assignment bug.
- [ ] Improve sparse-round fallback math.

### `src/HUD/MatchOverview/MatchOverview.tsx`
- [ ] Add richer metadata line (BO, status/map if available).

### `src/HUD/MapSeries/MapSeries.tsx`
- [ ] Improve handling of missing winner/score data.

### `src/HUD/Tournament/Tournament.tsx`, `Ladder.tsx`
- [ ] Lazy-load data when visible.
- [ ] Improve bracket resilience for malformed parent links.

### `src/HUD/Trivia/Trivia.tsx`
- [ ] Remove dependency on `toggleCams`.
- [ ] Add independent show/hide behavior with optional timeout.

### `src/HUD/SideBoxes/SideBox.tsx`
- [ ] Fix image id bug (`image_left` hardcoded).
- [ ] Add compact variant.

### `src/HUD/SideBoxes/Money.tsx`, `UtilityLevel.tsx`
- [ ] Rebalance thresholds/labels and visual emphasis for readability.

### `src/HUD/PauseTimeout/Pause.tsx`, `Timeout.tsx`
- [ ] Improve timeout/pause cards and countdown clarity.

### `src/HUD/Scout/index.tsx`
- [ ] Either wire to real signal or hide by default until data exists.

**Acceptance**
- Secondary widgets behave deterministically and no longer interfere with each other.

---

## Phase 8 - Unified style system (LoL-inspired custom skin)

### `src/App.css`
- [ ] Promote to canonical token system.
- [ ] Define semantic tokens for:
  - team colors, panel shells, text hierarchy, alert states, motion timings
- [ ] Add theme root classes (e.g. `.overlay-theme-2026`).

### `src/index.css`
- [ ] Ensure global base styles remain minimal and safe for overlays.

### All `src/HUD/**/*.scss`
- [ ] Replace hardcoded colors with semantic tokens.
- [ ] Standardize panel shell mixin pattern (background/border/radius).
- [ ] Standardize typography scale and spacing grid.
- [ ] Add compact variant classes where needed.

**Acceptance**
- Overlay has coherent visual language across all widgets.
- Theme can be changed centrally by token updates.

---

## Phase 9 - Packaging and metadata

### `public/hud.json`
- [ ] Update name/version/author metadata for your custom build.
- [ ] Review capability flags (`radar`, `killfeed`) for intended behavior.

### `vite.config.ts`
- [ ] Improve panel/keybind JSON error diagnostics.
- [ ] Keep generated type sync reliable.

### `sign.js`
- [ ] Leave behavior unchanged unless signing pipeline needs metadata updates.

**Acceptance**
- `npm run build` and `npm run pack` succeed.
- HUD imports cleanly in LHM.

---

## Execution order (recommended)

1. Phase 1 (foundation + bug fixes)  
2. Phase 2 (controls + typing)  
3. Phase 3 (layout orchestration)  
4. Phase 4-5 (matchbar/timers + players)  
5. Phase 6 (radar)  
6. Phase 7 (widgets)  
7. Phase 8 (global styling pass)  
8. Phase 9 (package + ship)

---

## Definition of done

- [ ] No runtime errors with live GSI stream.
- [ ] All phase transitions (`freezetime`, `live`, `bomb`, `timeout`, `paused`) render correctly.
- [ ] New panel/keybind controls function reliably.
- [ ] Theme is tokenized and centrally maintainable.
- [ ] Build + pack flow succeeds.

