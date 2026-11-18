# AGENTS.md — Terminal Gym Log (PWA)

## Project Overview
A minimalist, offline-first **mobile-first PWA** workout tracker built by developers for developers.
- **Core Philosophy:** Zero bloat, keyboard/thumb-driven speed, terminal-native aesthetics, deterministic offline sync.
- **Target Experience:** One-handed smartphone usage on the gym floor (`max-w-md` single-column shell), installable as a standalone PWA on iOS and Android.
- **Language Policy:** All code, TypeScript types, comments, git commits, and documentation must be written in English.

## Tech Stack
- **Framework:** React 19 + TypeScript (strict mode) + Vite
- **Styling & UI:** Tailwind CSS + `shadcn/ui` + `lucide-react` (no emojis anywhere in UI)
- **PWA & Device APIs:** `vite-plugin-pwa` (Workbox precaching, `autoUpdate`), Screen Wake Lock API, Web Audio API + Vibration API (rest timer)
- **Backend & Hosting:** Firebase Authentication (GitHub & Google OAuth), Cloud Firestore (with persistent IndexedDB cache), Firebase Hosting

## Repository Structure
```text
├── .agents/
│   └── rules/
│       ├── design-pwa-mobile.md        # OpenCode Terminal Mono + PWA mobile constraints
│       └── firebase-data-exercises.md  # Firestore schema, offline sync, hybrid exercise picker
├── public/
│   └── icons/                          # PWA manifest icons (192x192, 512x512, maskable)
├── src/
│   ├── components/
│   │   ├── ui/                         # shadcn/ui primitives (customized to 4px radius)
│   │   ├── layout/                     # MobileAppShell, TopStatusBar, BottomDock
│   │   └── workout/                    # ActiveWorkout, ExerciseCard, SetRow, ExerciseCombobox, RestTimer
│   ├── data/
│   │   └── default-exercises.ts        # Curated static seed (~70 core movements)
│   ├── hooks/                          # useWakeLock, useRestTimer, useNetworkSync, useOptimisticSets
│   ├── lib/
│   │   └── firebase.ts                 # Firebase app, Auth, Firestore persistentLocalCache init
│   ├── services/                       # Workout & user exercise repository functions
│   ├── types/
│   │   └── workout.ts                  # Strict domain interfaces
│   ├── App.tsx
│   ├── index.css                       # Semantic CSS variables & font stack
│   └── main.tsx
├── AGENTS.md
├── firestore.rules
├── vite.config.ts
└── package.json
```

## Core Engineering Invariants
1. **Mobile-First PWA Shell:** Always design for a `375px–430px` portrait viewport first (`max-w-md mx-auto min-h-[100dvh]`). Never use `100vh` or `h-screen`; always use `100dvh` with `env(safe-area-inset-*)`.
2. **Offline-First by Default:** Never block UI interactions on Firestore network writes. Use Firestore's `persistentLocalCache()` combined with React 19 `useOptimistic` so every set toggle, weight edit, and timer start resolves in `0ms`.
3. **1-Read / 1-Write Workout Documents:** Store an entire workout session (including nested exercises and sets) as a single document under `users/{uid}/workouts/{workoutId}`.
4. **Hybrid Exercise Selection:** Never import massive external JSON exercise datasets. Combine the lightweight static seed (`src/data/default-exercises.ts`), user history (`users/{uid}/meta/exercises`), and inline creation via a shadcn `Command` combobox.
5. **React 19 Idioms:** Prefer React 19 hooks (`useOptimistic`, `useActionState`, `use()`) and clean functional components without legacy boilerplate (`forwardRef` is unnecessary in React 19).

## Commands
- `npm run dev` — Start Vite dev server (expose via `--host` when testing on mobile devices on LAN)
- `npm run build` — Type-check (`tsc -b`) and build production PWA bundle + service worker
- `npm run preview` — Preview production PWA build locally
- `firebase deploy --only hosting,firestore:rules` — Deploy app and security rules