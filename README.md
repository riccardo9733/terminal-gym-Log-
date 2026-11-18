# // GYM_LOG

Minimalist, offline-first **mobile-first PWA** workout logger built for developers.

## Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons
- **Design System:** OpenCode Terminal Mono (100% monospace, `#201d1d` warm dark, Apple HIG semantic accents, `4px` radius)
- **PWA:** `vite-plugin-pwa`, Workbox offline precaching, Screen Wake Lock API, Web Audio rest timer
- **Backend:** Firebase Auth (GitHub & Google), Cloud Firestore (`persistentLocalCache`), Firebase Hosting

## Quickstart

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase environment
Create a `.env.local` file in the project root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run locally (with LAN access for mobile testing)
```bash
npm run dev -- --host
```

### 4. Build & Deploy
```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

## AI IDE Context (Google Antigravity)
This repository includes native context files for Google Antigravity:
- `AGENTS.md` — Always-on project architecture, invariants, and commands.
- `.agents/rules/design-pwa-mobile.md` — Scoped UI, typography, and mobile-first PWA rules.
- `.agents/rules/firebase-data-exercises.md` — Scoped Firestore offline persistence and hybrid exercise picker rules.