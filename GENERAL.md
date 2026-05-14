# 2026-general — theme tokens (`2026-v1`)

Source: `league-of-legends-bb-overlay/.../themes/2026-v1/2026-v1.scss` (`.ingame-overlay-container.theme-2026-v1`).

## Overlay chrome

| Token | Value |
| --- | --- |
| `--overlayBackground` | `rgba(0, 0, 0, 0.94)` |
| `--overlayBorderRadius` | `10px` |
| `--overlayBorder` | `rgba(255, 255, 255, 0.15)` |
| `--transitionDuration` | `0.55s` |

## Team colors (use for blue / red side)

| Token | Value |
| --- | --- |
| `--blueSide` | `#318CE7` |
| `--redSide` | `#d90718` |

## Objectives — dragons & Baron

| Token | Value |
| --- | --- |
| `--dragonAir` | `#bcd0d1` |
| `--dragonFire` | `#ff0000` |
| `--dragonWater` | `#1da37b` |
| `--dragonEarth` | `#a35a1d` |
| `--dragonHextech` | `#03ecfc` |
| `--dragonChemtech` | `#a0ff00` |
| `--dragonElder` | `#13edc2` |
| `--baron` | `#c542f5` |

---

## How components are styled in 2026-v1 (ingame)

**Shell.** The ingame theme mounts everything under one root: `ingame-overlay-container theme-2026-v1` (`Ingame2026V1.jsx`). Custom properties above are declared on that element in `ingame/.../2026-v1.scss`, so descendant SCSS can use `var(--overlayBackground)` and friends without redefining them.

**Scoped overrides.** Most blocks (timer, sidebar, scoreboard, bottom bar, etc.) assume those variables are inherited from the parent. A few files wrap rules in `.ingame-overlay-container.theme-2026-v1 { ... }` when the selectors need to stay theme-specific (for example the unified event feed).

**“Default” skin on the same tree.** When the app also uses `ingame-root-theme-2026-v1` with the inner `default` container, `2026-v1.scss` redefines `--blueSide`, `--redSide`, `--overlayBackground`, graph tokens, etc., so the palette matches the pick/ban “LAN” look (`#38bdf8` / `#fb7185`, softer panel background). Base tokens in the tables at the top are the **standalone** 2026-v1 ingame values; the wrapper is the **broadcast-matched** variant.

---

## Similarities across 2026-v1 ingame pieces

These patterns show up again and again; new panels should usually follow them for consistency.

1. **Panel chrome** — Floating UI uses the same trio: `background: var(--overlayBackground)`, `border: 1px solid var(--overlayBorder)`, `border-radius: var(--overlayBorderRadius)` (sidebar, dragon/baron timers, smite reaction card; event-feed rows fake the same look with `::before` + rounded corners).

2. **Motion** — Large show/hide and layout shifts use `var(--transitionDuration)` with `ease` or `ease-in-out` (sidebar slide, scoreboard vertical hide, gold graph slide, bottom champion strip, teamfight strip). Shorter `0.2s`–`0.35s` easings are used for small UI (timer width, feed row fade/slide).

3. **Typography** — Primary copy is white or near-white; emphasis with `font-weight: 700` / `bolder`; labels often use uppercase and slight `letter-spacing`. Muted secondary text uses opacity or `#ccc`-style grays.

4. **Team color** — Blue/red are applied via `var(--blueSide)` / `var(--redSide)`: series “won” dots, gold-diff text and bars, scoreboard header gradient, sidebar XP bars, event-feed row tint, cooldown handle color (`--cooldownHandleColor`), minimap and sponsor **L-frame** accents. Layout mirrors per side (`.blue` vs `.red` classes) rather than duplicating hex values.

5. **Objectives** — Dragon timers map dragon type → `--timerBarColor` from the dragon tokens; Baron/herald/grubs use `--baron`. Champion portraits use `--baron` / `--dragonElder` for buff edge glows.

6. **Corner frames** — Minimap (bottom-right) and sponsor (bottom-left) share the same idea: thin `2px` **L-shaped** bars, blue on one corner pair and red on the opposite pair, black inner mat.

7. **Depth** — Dark panels plus light borders; optional `linear-gradient` overlays (top or left-to-right) for readability or team wash; `text-shadow` on hero type over busy art.

8. **Icon treatment** — Small squares get `1px solid var(--overlayBorder)` and modest `border-radius` (often `5px`), consistent with item slots and feed portraits.

---

## Pick/ban 2026-v1 vs ingame

Pick/ban uses a **different root**: `.pickban-root-theme-2026-v1 .pick-and-ban-container` in `pick_ban/.../2026-v1.scss`. It intentionally **reuses the same chrome variable names** (`--overlayBorderRadius`, `--overlayBorder`, `--overlayBackground`) but sets **different team colors** (`#38bdf8` / `#fb7185`) and adds `--primary`, `--generalBackground`, `--timerStroke`, and `*-graph-*` tokens for timer bars—so pick/ban and ingame feel like one family even when hex values differ.

When building new UI, prefer **tokens** (`--blueSide`, `--overlayBorder`, …) over hard-coded colors so both ingame roots (standalone vs `default` wrapper) and pick/ban can stay aligned.
