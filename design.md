---
version: "1.0"
name: "OpenCode Terminal Mono"
description: "Terminal-native design system adapted for a mobile-first PWA workout tracker."
colors:
  primary: "#201d1d"
  secondary: "#fdfcfc"
  tertiary: "#9a9898"
  neutral: "#007aff"
  destructive: "#ff3b30"
  accent: "#30d158"
  warning: "#ff9f0a"
typography:
  fontFamily: "Berkeley Mono, JetBrains Mono, Geist Mono, monospace"
  scale:
    hero: "clamp(2rem, 5vw, 2.5rem)"
    h1: "1.5rem"
    h2: "1.25rem"
    body: "1rem"
    small: "0.875rem"
    tiny: "0.625rem"
rounded:
  sm: "4px"
  md: "4px"
  lg: "4px"
---

# OpenCode Terminal Mono

Design tokens and guidelines for Terminal Gym Log.

## Principles

1. **Monospace typography.** Every element uses Berkeley Mono or fallback monospace. Numbers enforce `tabular-nums` so weights, reps, and timers align vertically without jitter.
2. **Warm dark palette.** Primary background uses `#201d1d` with off-white text (`#fdfcfc`) and Apple HIG semantic accents. Never pure black or pure white.
3. **Ergonomic mobile layout.** Strict single-column shell (`max-w-md`) with 44px minimum touch targets and safe area padding.
4. **Bottom drawers only.** Modals, pickers, and confirmations anchor to the bottom of the viewport for thumb reachability.
5. **No decorative fluff.** Flat semantic surfaces, 4px corners, and icons from `lucide-react` instead of emojis or gradients.

## Colors

| Token | Hex / Value | Role |
| :--- | :--- | :--- |
| Canvas | `#201d1d` | Primary warm dark background |
| Surface | `#272323` | Cards, popovers, and bottom drawers |
| Secondary | `#2e2a2a` | Inactive tabs, input backgrounds |
| Text Primary | `#fdfcfc` | High-contrast body text and headers |
| Text Muted | `#9a9898` | Labels, units, secondary metadata |
| Border | `rgba(253, 252, 252, 0.14)` | Structural 1px dividers |
| Accent Blue | `#007aff` | Primary actions, links, focus outlines |
| Accent Green | `#30d158` | Completed sets, PR badges, online sync |
| Accent Orange | `#ff9f0a` | Active timer, offline queue indicators |
| Destructive Red | `#ff3b30` | Deletion and destructive confirmations |

## Typography

- **Stack:** `'Berkeley Mono', 'JetBrains Mono', 'Geist Mono', ui-monospace, SFMono-Regular, monospace`
- **Tabular figures:** Global `font-variant-numeric: tabular-nums`
- **Scale:**
  - Hero: clamp(2rem, 5vw, 2.5rem), weight 700
  - H1: 1.5rem, weight 700
  - H2: 1.25rem, weight 600
  - Body: 1rem (16px minimum for mobile inputs), weight 400
  - Small: 0.875rem, weight 500
  - Micro: 0.625rem–0.75rem for status badges and uppercase labels

## Mobile Layout

- **Shell:** `min-h-[100dvh] max-w-md mx-auto flex flex-col`
- **Safe areas:** `pt-[env(safe-area-inset-top)]` on top bar, `pb-[env(safe-area-inset-bottom)]` on bottom dock
- **Touch targets:** Minimum `44x44px` on interactive controls
- **Drawers:** All overlays use bottom drawers with sliding entrance from the bottom edge

## Prohibitions

- No emojis in UI copy. Use `lucide-react` icons.
- No centered modal dialogs.
- No decorative gradients.
- No pure black (`#000000`) or pure white (`#ffffff`).
- No shadows exceeding `0 2px 8px rgba(0, 0, 0, 0.08)`.
- No marketing buzzwords or throat-clearing copy.
