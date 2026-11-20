# // FEATURES // Terminal Gym Log (PWA)

Comprehensive functional documentation and technical capabilities overview of **Terminal Gym Log** — a minimalist, offline-first progressive web application (PWA) designed for developers and serious lifters.

---

## Table of Contents

1. [Architectural Overview & Core Philosophy](#1-architectural-overview--core-philosophy)
2. [User Experience & Design System](#2-user-experience--design-system)
3. [Offline-First Architecture & Data Persistence](#3-offline-first-architecture--data-persistence)
4. [Authentication & Account Management](#4-authentication--account-management)
5. [Active Workout Engine](#5-active-workout-engine)
6. [Set Tracking, Logging & Smart Prefill](#6-set-tracking-logging--smart-prefill)
7. [Intelligent Rest Timer](#7-intelligent-rest-timer)
8. [Hybrid Exercise Database & Picker](#8-hybrid-exercise-database--picker)
9. [Exercise Progression & 1RM Telemetry](#9-exercise-progression--1rm-telemetry)
10. [Routines & Workout Blueprints](#10-routines--workout-blueprints)
11. [Session History & Workout Replay](#11-session-history--workout-replay)
12. [Device & Hardware Integrations](#12-device--hardware-integrations)
13. [Telemetry Dashboard & Lifetime Metrics](#13-telemetry-dashboard--lifetime-metrics)
14. [Feature Summary Matrix](#14-feature-summary-matrix)

---

## 1. Architectural Overview & Core Philosophy

Terminal Gym Log is built around three uncompromising tenets:
- **Zero Bloat & Peak Monospace Aesthetics:** No animations for the sake of animation, zero emoji icons, terminal typography (`font-mono`), dense data display, and 100% thumb-driven interaction.
- **Deterministic 0ms Offline Speed:** Workouts are tracked in environments with poor connectivity (gym basements, metal structures). Every UI interaction resolves in `0ms` via local caching, optimistic updates, and background synchronization.
- **One-Handed Mobile Ergonomics:** Engineered specifically for single-handed smartphone usage on the gym floor (`max-w-md` shell, `375px–430px` portrait viewport, safe area handling).

```
┌────────────────────────────────────────────────────────┐
│                   TopStatusBar                         │
│  [ > TERMINAL_GYM ]  [ SYNCED / OFFLINE ]  [ USER_ID ] │
├────────────────────────────────────────────────────────┤
│                                                        │
│                  Main View Router                      │
│                                                        │
│  ┌─────────────────┐ ┌───────────────┐ ┌────────────┐  │
│  │ WORKOUT         │ │ HISTORY       │ │ ROUTINES   │  │
│  │ (Active session │ │ (Past logs,   │ │ (Schede,   │  │
│  │ or launcher)    │ │ search, stats)│ │ templates) │  │
│  └─────────────────┘ └───────────────┘ └────────────┘  │
│                                                        │
├────────────────────────────────────────────────────────┤
│                   BottomDock                           │
│     [▸] ALLENAMENTO   [⏱] CRONOLOGIA   [☰] SCHEDE      │
└────────────────────────────────────────────────────────┘
```

---

## 2. User Experience & Design System

### OpenCode Terminal Mono Design
- **Typography:** 100% monospace typography using system mono / GT America Mono stacks for all UI chrome, telemetry, inputs, and metrics.
- **Color Palette:**
  - Background: Warm dark canvas (`#0e1115` / `#201d1d`).
  - Card & Surface: Deep slate surfaces (`#161b22`) separated by crisp 1px borders (`#30363d`).
  - Semantic Accents: Apple HIG / Terminal phosphor accents:
    - Primary Accent: Neon Green (`#22c55e` / phosphor green) for active workout states and sync OK.
    - System Cyan / Blue (`#38bdf8`) for secondary elements, sets, and blueprints.
    - Warning Amber (`#f59e0b` / `#eab308`) for rest timers and countdowns.
    - Destructive Red (`#ef4444`) for deletes and discards.
- **Tight Geometry:** Radii capped at `4px` (`rounded` or `rounded-sm`) for a sharp, mechanical industrial aesthetic.
- **Zero Centered Dialogs (Strict Bottom Drawer Policy):**
  - All modals, pickers, routine editors, and confirmation dialogs render as swipeable **Bottom Drawers** (`Drawer`) anchored to the bottom of the viewport with iOS/Android safe area bottom padding (`env(safe-area-inset-bottom)`).
- **Iconography:** Pure SVG line icons via `lucide-react` paired with ASCII visual markers (`[▸]`, `[X]`, `//`, `>`). Strictly zero emojis.

---

## 3. Offline-First Architecture & Data Persistence

### Deterministic Firestore Local Cache
- Uses Firebase Cloud Firestore with `persistentLocalCache({ tabManager: persistentMultipleTabManager() })`.
- All read and write operations hit the browser's persistent IndexedDB storage first.
- The app functions with full capability even in complete airplane mode or without internet access.

### 1-Read / 1-Write Session Documents
- An entire workout session (including all exercises, notes, sets, weights, reps, and completion timestamps) is modeled as a **single atomic document**:
  `users/{uid}/workouts/{workoutId}`
- Minimizes Firestore quota consumption and ensures document consistency: starting, updating, or finishing a session is a single atomic write.

### Real-Time Network Sync Engine (`useNetworkSync`)
- Listens to browser network status (`online` / `offline`) and Firestore snapshot sync states (`onSnapshotsInSync`).
- Dynamic status indicator in the top header:
  - `SYNCED`: Device is online and all writes are synchronized with the cloud.
  - `SYNCING [n]`: Device is online with $n$ local mutations queued for upload.
  - `OFFLINE [n QUEUED]`: Device has no connection; operations are cached in IndexedDB and queued.
  - `LOCAL [INDEXEDDB]`: Demo mode or unauthenticated guest session.
- Real-time Firestore subscription (`onSnapshot`) keeps the active workout synced across multiple devices or tabs seamlessly.

---

## 4. Authentication & Account Management

### Flexible Authentication Modes (`useAuth`)
1. **GitHub OAuth (`signInWithGithub`):** Developer-focused single-click authentication.
2. **Google OAuth (`signInWithGoogle`):** Standard consumer authentication.
3. **Anonymous / Guest Mode (`signInAnonymously`):** Immediate workout tracking without creating an account; converts to persistent local storage.
4. **Local Demo Fallback:** If Firebase credentials are not supplied in `.env`, the app automatically falls back to an offline demo mode with zero setup required.

### Account & Telemetry Modal (`AuthModal`)
- Accessible anytime by tapping the user profile badge in the top status bar.
- Displays:
  - Active User ID / Display Name.
  - Provider information (GitHub / Google / Anonymous).
  - Cloud connection status.
  - Single-tap Logout button.

---

## 5. Active Workout Engine

When a session is started, the app transitions into the **Active Workout Engine** (`ActiveWorkout`), replacing the launcher with an intense, distraction-free logging interface:

### Live Session Features
- **Real-Time Duration Clock:** Live elapsed timer updating every second (`MM:SS` format).
- **Inline Title Renaming:** Tap the session title to rename it on the fly (e.g., from `2026-11-20_SESSION` to `CHEST_HYPERTROPHY_DAY`).
- **Dynamic Exercise Ordering:** Reorder exercises up or down within the workout session using intuitive chevron controls.
- **Per-Exercise Technique Notes:** Expandable notes field for recording seat positions, pin heights, or coaching cues.
- **Per-Exercise Rest Intervals:** Set custom rest targets per exercise (e.g., 180s on Heavy Squats, 60s on Lateral Raises).
- **Save Active Workout as Routine:** Turn the current live session into a reusable blueprint at any moment with one click.
- **Safe Session Completion:**
  - Finishing opens a bottom drawer showing session telemetry (total duration, completed sets, total volume in kg/tonnes).
  - Checkbox option to simultaneously save the session as a new routine template.
- **Accidental Cancellation Guard:** Discarding an active workout prompts a confirmation drawer to avoid accidental loss of workout data.

---

## 6. Set Tracking, Logging & Smart Prefill

Each exercise card contains a rapid-entry set matrix designed for fast thumb entry during intense training:

```
[SET]  [TIPO]   [PESO (KG)]   [REPS]   [STATUS]
 01    [NORM]      100          8        [✓]
 02    [NORM]      100          8        [✓]
 03    [NORM]      102.5        6        [ ]
```

### Key Capabilities
- **Warmup Set Support:** Toggle any set between Normal (`NORM`) and Warmup (`WARM` / `W`). Warmup sets are tagged distinctly and excluded from PR volume metrics.
- **Instant Stepper Controls:**
  - Weight adjustment: Incremental steppers (+0.5kg, +2.5kg, -0.5kg, -2.5kg) or direct numeric keyboard entry.
  - Reps adjustment: Direct keypad input or single-increment step buttons.
- **0ms Set Completion Toggle:** Tap the status icon to mark a set complete. Instantly marks the set completed, stores the timestamp, auto-starts the rest timer, and evaluates PR records.
- **Smart Previous Performance Prefill (Ghost Values):**
  - When adding an exercise or adding a new set, the app inspects the user's historical sessions for that exact exercise.
  - Automatically prefills the weight and reps from the matching set of the previous workout (or falls back to the all-time PR).
- **Automatic PR (Personal Record) Detection:**
  - Upon completing a set that exceeds the previous best weight for that exercise, the system updates `userExercises` and displays a highlighted PR trophy badge (`[PR]`).

---

## 7. Intelligent Rest Timer

A rest timer designed specifically for noisy gym floors (`RestTimer` & `useRestTimer`):

```
REST_TIMER // COUNTDOWN              [RUNNING]
[████████████████████░░░░░░░░░░░] 01:14 (62%)
[ -15s ]  [ +30s ]  [ PAUSA ]  [ AZZERA ]
```

### Capabilities
- **Automatic Triggering:** Triggered automatically upon checking off any completed set.
- **Full-Width Dynamic ASCII Track:** Calculates container dimensions dynamically and renders a retro ASCII character progress bar (`█` and `░`) with real-time percentage badge.
- **Presets & Custom Overrides:**
  - Quick interval triggers: `45s`, `60s`, `90s`, `120s`, `150s`, `180s`.
  - In-flight adjustment: One-tap `+30s` and `-15s` buttons to adapt on the fly without restarting the timer.
  - Play, pause, resume, and dismiss actions.
- **Web Audio API Synthesizer (Zero External Audio Files):**
  - Synthesizes electronic alert tones directly in JavaScript via the Web Audio API (`AudioContext`).
  - Generates a distinctive three-tone beep (`880Hz -> 880Hz -> 1320Hz`) upon timer expiry.
  - Guaranteed to work offline with zero external network audio asset downloads.
- **Vibration API (Haptic Feedback):**
  - Triggers a rhythmic vibration pattern (`[150ms, 80ms, 150ms, 80ms, 300ms]`) on mobile devices so lifters wearing headphones still feel when their rest period is over.

---

## 8. Hybrid Exercise Database & Picker

Terminal Gym Log rejects bloated multi-megabyte external exercise databases in favor of a fast hybrid architecture (`ExerciseCombobox`):

```
┌────────────────────────────────────────────────────────┐
│ > CERCA_ESERCIZIO...                                   │
├────────────────────────────────────────────────────────┤
│ [TUTTI] [PETTO] [DORSO] [GAMBE] [SPALLE] [BRACCIA]     │
├────────────────────────────────────────────────────────┤
│ FREQUENTI:                                             │
│  ▸ Barbell Bench Press            [PETTO]  PR: 110kg   │
│  ▸ Incline Dumbbell Press         [PETTO]  PR: 38kg    │
│  ▸ Barbell Squat                  [GAMBE]  PR: 140kg   │
│ ALFABETICO:                                            │
│  ▸ Barbell Deadlift               [DORSO]  PR: 180kg   │
├────────────────────────────────────────────────────────┤
│ [ + CREA NUOVO ESERCIZIO PERSONALIZZATO ]              │
└────────────────────────────────────────────────────────┘
```

### Architecture & Features
1. **Curated Static Seed (`src/data/default-exercises.ts`):** Fast, zero-overhead dataset of ~70 foundational barbell, dumbbell, cable, and bodyweight movements.
2. **Frequency-Weighted Bubble Sort:** Exercises frequently logged by the user automatically bubble to the top of the picker for instant 1-tap selection.
3. **Muscle Group Filtering:** Quick chips to isolate exercises by anatomy:
   - `CHEST` (Petto)
   - `BACK` (Dorso)
   - `LEGS` (Gambe)
   - `SHOULDERS` (Spalle)
   - `ARMS` (Braccia)
   - `CORE` (Addome)
   - `CONDITIONING` (Cardio / Condizionamento)
   - `OTHER` (Altro)
4. **Instant Inline Exercise Creation:** If an exercise is not in the library, lifters can create a custom movement right inside the search box with a single tap, assigning it to a muscle group.
5. **Inline PR Visibility:** Each search result item displays the user's cached all-time best weight directly in the list.

---

## 9. Exercise Progression & 1RM Telemetry

Lifters can tap the telemetry button on any exercise card or history item to open the **Exercise Progression Drawer** (`ExerciseHistoryDrawer`):

```
┌────────────────────────────────────────────────────────┐
│ BARBELL BENCH PRESS                            [CHEST] │
│ > PROGRESSION_TELEMETRY & SESSION_LOGS                 │
├────────────────────────────────────────────────────────┤
│ [ PR ]        [ EST. 1RM ]    [ SESSIONI ]   [ VOLUME ]│
│ 110.0kg         128.3kg           24          18.4t    │
├────────────────────────────────────────────────────────┤
│ CRONOLOGIA SESSIONI:                                   │
│  ▸ 2026-11-18 - UPPER_HEAVY                            │
│    Set 1: 100kg x 8                                    │
│    Set 2: 105kg x 6                                    │
│    Set 3: 110kg x 5 [BEST]                             │
│    Vol: 2,680kg | Est. 1RM: 128.3kg                    │
└────────────────────────────────────────────────────────┘
```

### Telemetry Breakdown
- **Personal Record (PR):** Absolute heaviest completed weight for this exercise.
- **Estimated 1-Rep Max (1RM):** Calculated on each set using the standardized **Epley Formula**:
  $$\text{1RM} = \text{weight} \times \left(1 + \frac{\text{reps}}{30}\right)$$
  Calculates maximum estimated force output and displays the all-time peak estimated 1RM.
- **Lifetime Sessions:** Total number of training sessions that included this movement.
- **Lifetime Volume:** Total cumulative tonnage moved on this exercise ($kg \times reps$).
- **Historical Session Logs:** Reverse-chronological inspection of all past performances, showing sets, weights, reps, volume, and date.

---

## 10. Routines & Workout Blueprints

The **Routines** tab (`RoutinesView`) enables structured workout programming and templates:

### Blueprint Capabilities
- **Routine Editor (`RoutineEditorModal`):**
  - Create and edit custom routine templates (e.g., `PUSH_A`, `PULL_HEAVY`, `LEGS_VOLUME`).
  - Set default rest duration for the entire routine.
  - Add exercises from the hybrid picker.
  - Configure target sets, target reps, and target weights per exercise.
  - Reorder exercises inside the routine with up/down arrows.
- **One-Tap Routine Launch:**
  - Launching a routine instantly clones the template into an active workout session.
  - Automatically loads the target exercises and populates starting weights with the lifter's latest PRs.
- **One-Click Routine Duplication:** Clone existing routines (e.g., duplicate `UPPER_A` into `UPPER_A_COPY` to modify variations).
- **Quick-Launch Carousel on Home Screen:** The 4 most recent routines are pinned directly to the home screen for zero-friction launch.
- **Full-Text Filter:** Instant search across routine titles, notes, and exercises.

---

## 11. Session History & Workout Replay

The **History / Logs** tab (`HistoryView`) acts as a developer-grade workout journal:

### Features
- **Session Log Cards:**
  - Workout title and formatted date/time.
  - Total workout duration (`HH:MM` or `MM:SS`).
  - Total exercises count and completed sets tally.
  - Total cumulative session volume (formatted in `kg` or metric tonnes `t`).
- **Expandable Sets Inspection:** Tap any past workout to expand and view the exact sets, weights, reps, and warmup flags for each exercise.
- **Direct Telemetry Access:** Tap any exercise in past history to open the exercise progression drawer.
- **Instant Workout Replay ("RIPETI"):**
  - Tap the **RIPETI** button on any past workout card to instantly clone its entire exercise selection into a fresh active workout for today.
- **Search & Filtering:** Real-time search bar to filter history by date, workout title, or included exercise names.
- **Session Deletion:** Clean swipe/tap deletion with confirmation to remove erroneous logs.

---

## 12. Device & Hardware Integrations

Terminal Gym Log interacts directly with native device APIs for seamless gym-floor operation:

| API | Implementation | Benefit |
|---|---|---|
| **Screen Wake Lock API** | `useWakeLock` hook | Prevents phone screen from dimming/sleeping while a workout is active. Automatically releases when session ends or tab is minimized. |
| **Web Audio API** | `playTone`, `playRestCompleteAlarm` | Generates procedural synth chimes for rest timer expiration without requiring audio file loading. |
| **Vibration API** | `navigator.vibrate` | Delivers multi-pulse tactile feedback through the phone chassis when rest interval completes. |
| **Service Worker & Cache** | `vite-plugin-pwa` + Workbox | Precaches all HTML, JS, CSS, fonts, and SVG assets for 100% offline startup. |
| **PWA Manifest** | `display: standalone` | Fullscreen standalone application experience without browser URL bars, complete with iOS maskable app icons. |

---

## 13. Telemetry Dashboard & Lifetime Metrics

When not inside an active workout, the Home view displays system telemetry:

```
> TELEMETRY // TODAY                    VENERDÌ, 20 NOV 2026
┌────────────────────────────────────────────────────────┐
│ ↗ LIFETIME_TELEMETRY                            SYS_OK │
│ ┌─────────────────────────┐  ┌───────────────────────┐ │
│ │ SESSIONI_TOTALI         │  │ VOLUME_ACCUMULATO     │ │
│ │ 42                      │  │ 128.4t                │ │
│ └─────────────────────────┘  └───────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

- **Live Date Telemetry:** Shows current day, month, and year in terminal header format.
- **Total Sessions Counter:** Real-time aggregate count of all completed workouts in history.
- **Cumulative Lifetime Volume:** Dynamically calculated sum of all completed weight $\times$ reps across the user's entire history, formatted in kilograms or tonnes ($t$).
- **Last Completed Session Snapshot:** Summary card of the most recent workout with rapid repeat button and exercise preview chips.

---

## 14. Feature Summary Matrix

| Domain | Feature | Status | Implementation Details |
|---|---|---|---|
| **PWA / Mobile** | Standalone PWA Installation | Ready | `vite-plugin-pwa`, `manifest.json`, iOS touch icons |
| **PWA / Mobile** | Offline Asset Caching | Ready | Workbox offline precache for all assets & scripts |
| **PWA / Mobile** | Mobile App Shell | Ready | `MobileAppShell.tsx`, `100dvh`, Safe Area insets |
| **PWA / Mobile** | Bottom Drawer Architecture | Ready | `Drawer` primitive for all dialogs and modals |
| **Database** | Persistent Local Cache | Ready | Cloud Firestore + IndexedDB multi-tab cache |
| **Database** | Single Doc Session Model | Ready | Atomic `users/{uid}/workouts/{workoutId}` writes |
| **Database** | Sync Telemetry Status | Ready | Real-time `SYNCED`, `OFFLINE`, `SYNCING` badges |
| **Auth** | Multi-Provider Authentication | Ready | GitHub OAuth, Google OAuth, Anonymous, Demo mode |
| **Workout Engine**| Active Session Tracking | Ready | Elapsed timer, dynamic title, exercise reordering |
| **Workout Engine**| Exercise Notes | Ready | Per-exercise collapsible technical notes |
| **Workout Engine**| Save Session as Routine | Ready | Create reusable routine from active workout |
| **Workout Engine**| Workout Replay ("Ripeti") | Ready | Clone past sessions into today's active workout |
| **Set Logging** | Stepper & Numeric Input | Ready | +0.5/+2.5kg steppers, reps keyboard input |
| **Set Logging** | Warmup Set Flagging | Ready | Warmup toggle (`W`), excluded from PR/volume metrics |
| **Set Logging** | Ghost Values / Prefill | Ready | Auto-prefills weights/reps from prior session |
| **Set Logging** | Automatic PR Record | Ready | Real-time PR detection on set checkoff |
| **Rest Timer** | Auto-Countdown on Set Done | Ready | Starts automatically on set completion |
| **Rest Timer** | Dynamic ASCII Bar | Ready | Full-width `████░░░░` progress visualization |
| **Rest Timer** | Web Audio Synth Alarm | Ready | Procedural 880Hz / 1320Hz audio chime |
| **Rest Timer** | Haptic Vibration Feedback | Ready | Device vibration pattern on timer completion |
| **Hardware** | Screen Wake Lock | Ready | Keeps phone screen awake during active workout |
| **Exercises** | Curated Static Seed | Ready | ~70 core compound and isolation movements |
| **Exercises** | Custom Exercise Creation | Ready | Add custom exercises inline with muscle group tags |
| **Exercises** | Frequency Weighting | Ready | Frequently used exercises bubble up in picker |
| **Analytics** | Epley 1RM Calculation | Ready | Automatic formula: $w \times (1 + r/30)$ |
| **Analytics** | Exercise History Drawer | Ready | PR, 1RM, total sessions, cumulative volume |
| **Analytics** | Lifetime Telemetry | Ready | Total completed workouts and lifetime tonnage |
| **Routines** | Blueprint Creation & Edit | Ready | Custom routines with default rest and set targets |
| **Routines** | Routine Duplication | Ready | Clone any routine with a single tap |
| **History** | Chronological Logs | Ready | Filterable list with expandable exercise breakdown |
| **History** | Session Search Engine | Ready | Instant search by date, routine, or exercise name |
