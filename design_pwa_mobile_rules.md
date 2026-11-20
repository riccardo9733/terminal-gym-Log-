---
trigger: glob
globs: "**/*.tsx, **/*.css, index.html, vite.config.ts"
description: OpenCode Terminal Mono design tokens and mobile-first PWA ergonomics
---

# Design System & Mobile-First PWA Rules

## Aesthetic Direction: OpenCode Terminal Mono (Mobile PWA Adaptation)
Translate terminal-native brutalism into an ergonomic, one-handed mobile gym interface. Every element must prioritize tabular legibility, high contrast under bright gym lighting, and thumb-zone reachability.

## Color Tokens (`src/index.css`)
Use warm dark surfaces and Apple HIG semantic accents. Never use pure black (`#000000`) or pure white (`#ffffff`).
- `--background`: `#201d1d` (Primary warm dark canvas)
- `--foreground`: `#fdfcfc` (Primary warm off-white text)
- `--card` / `--popover`: `#272323` (Elevated surface for workout cards and sheets)
- `--secondary` / `--muted`: `#2e2a2a` (Subtle surface for inactive pills/inputs)
- `--muted-foreground`: `#9a9898` (Labels, units, secondary metadata)
- `--border`: `rgba(253, 252, 252, 0.14)` (1px crisp structural dividers)
- `--input`: `rgba(253, 252, 252, 0.18)` (Input field borders)
- `--primary`: `#007aff` (Apple HIG Blue: primary actions, focus rings, active states)
- `--accent`: `#30d158` (Apple HIG Green: completed sets, PR badges, `SYNCED` status)
- `--warning`: `#ff9f0a` (Apple HIG Orange: active rest timer, `OFFLINE` queue indicator)
- `--destructive`: `#ff3b30` (Apple HIG Red: destructive actions, validation errors)

## Typography & Geometry
- **Font Family (100% Monospace):** `'Berkeley Mono', 'JetBrains Mono', 'Geist Mono', ui-monospace, SFMono-Regular, monospace`. Never mix sans-serif or serif fonts.
- **Tabular Numbers:** Enforce `font-variant-numeric: tabular-nums` globally so weights, reps, set indices, and rest countdowns align vertically without layout jitter.
- **Border Radius:** Strict `4px` (`--radius: 0.25rem`) across all cards, buttons, inputs, badges, and modals.

## Mobile-First Touch & Input Ergonomics
1. **Viewport & Safe Areas:**
   - Root container must use `min-h-[100dvh] max-w-md mx-auto flex flex-col`.
   - Apply `pt-[env(safe-area-inset-top)]` to the sticky top status bar and `pb-[env(safe-area-inset-bottom)]` to the bottom action dock.
   - Set `overscroll-behavior-y: none` in CSS to prevent accidental pull-to-refresh during fast scrolling.
2. **Touch Targets:** Every interactive control (set completion checkbox, `+`/`-` increment buttons, exercise menu, timer controls) must have a minimum hit area of `44x44px`.
3. **Mobile Keyboards & Anti-Zoom:**
   - All `<input>` elements MUST have a minimum font size of `16px` (`text-base`) to prevent iOS Safari from auto-zooming on focus.
   - Weight inputs must use `inputMode="decimal"` and `enterKeyHint="next"`.
   - Reps and RPE inputs must use `inputMode="numeric"` and `enterKeyHint="done"`.
4. **Screen Wake Lock:** Request `navigator.wakeLock.request('screen')` while an active workout session is running so the display stays awake between sets.

## Strict UI Prohibitions & Drawer Policy
- **ALWAYS use bottom drawers / sheets (`Drawer`), NEVER centered dialogs or modals (`Dialog`).** Centered modals require stretching the thumb to the center/top of phone screens and break mobile ergonomics. All creation forms, selections, pickers, and confirmations must open as bottom sheets (`fixed inset-x-0 bottom-0 max-w-md mx-auto rounded-t-lg border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom`).
- **NO emojis** anywhere in the UI or copy; use `lucide-react` icons (`strokeWidth={1.75}`).
- **NO decorative gradients**; use flat semantic surfaces only.
- **NO heavy shadows**; maximum shadow is `0 2px 8px rgba(0, 0, 0, 0.08)`.
- **NO desktop multi-column marketing grids**; keep the app shell strictly single-column (`max-w-md`).
- **Links:** Apply `underline` only to inline text links, never on navigation items or buttons.

## PWA Manifest Requirements (`vite.config.ts`)
- `display: "standalone"`, `orientation: "portrait"`
- `background_color: "#201d1d"`, `theme_color: "#201d1d"`
- Configure `registerType: "autoUpdate"` so updates apply cleanly between sessions.