# Workout PWA — Agent Handoff

## What This Is

A personal fitness PWA for iPhone/iPad. Four user profiles (Stone, Lightning, Ice, Genesis) each get their own multi-week workout program loaded from a JSON file. No login, no backend — everything is static files + localStorage.

**Live URL:** https://workout-pwa-indol.vercel.app  
**Repo:** https://github.com/slava626/workout-pwa (public)  
**Local:** `/Users/slavakovelman/Documents/GitHub/workout-pwa/`

---

## Users

| Handle | Real name | Profile |
|--------|-----------|---------|
| `stone` | Levi | Older/stronger — Push/Pull/Upper/Legs splits |
| `lightning` | Isaac | Younger/lighter — cardio-focused beginner workouts |
| `ice` | — | Same program as Lightning |
| `genesis` | — | Foundation & Movement |

Each profile loads from `/workouts/{user}/program.json` (static file served by Vercel).

---

## Stack

- **Next.js 16.2.4** — App Router, `output: 'export'` (fully static, no server)
- **TypeScript + Tailwind CSS v4** (uses `@import "tailwindcss"`, not `@tailwind` directives)
- **Manual PWA** — `public/manifest.json` + `public/sw.js` (no next-pwa)
- **Vercel Hobby** — auto-deploys on push to `main` via GitHub integration

> ⚠️ Read `AGENTS.md` before touching any Next.js code. This version has breaking changes from older Next.js.

---

## Key Files

```
app/
  layout.tsx          # PWA meta tags, SW registration, safe-area viewport
  page.tsx            # Profile selector home screen (Stone / Lightning / Ice)
  [user]/page.tsx     # Dynamic route — renders WorkoutPage for each user
  globals.css         # Safe-area insets + @keyframes celebrate / confetti-fall

components/
  WorkoutPage.tsx     # Top-level state: checks, notes, results, timer, isEnded
  WorkoutView.tsx     # Shows date header, Start button, section blocks
  SectionBlock.tsx    # Renders one section; supports grouped sets, rounds, EMOM, and HIIT intervals
  MovementRow.tsx     # Single checkable row (checkbox, thumbnail, name, details, notes, result)
  MovementMedia.tsx   # Per-movement image/gif thumbnail + upload/view/replace/delete modal
  HiitCoach.tsx       # In-section prep/work/rest coach timer for HIIT sections
  TimerBar.tsx        # Big 7xl timer + Pause / Restart Timer / End Workout
  ProgressBar.tsx     # Completed / total animated green bar
  WorkoutRecap.tsx    # Shown on workout complete or End Workout
  WeekCalendar.tsx    # Week navigation, hidden once timer starts
  CelebrationToast.tsx # Quick motivational toast on each check

hooks/
  useTimer.ts         # elapsed(ms), running, started + start/pause/resume/restart

lib/
  movementMedia.ts    # IndexedDB helpers (get/put/delete blob) keyed by {user}:{lowercased movement name}
  sectionTiming.ts    # Shared EMOM / HIIT interval math for view, progress, and recap

types/
  workout.ts          # All TypeScript interfaces (Program, Week, WorkoutDay, Section, Movement)

public/
  manifest.json       # PWA manifest
  sw.js               # Service worker (cache-first; currently CACHE = 'workout-v5')
  media/
    movements/        # Normalized local exercise thumbnails used by program.json
    movement/Work out / # Raw source screenshots dropped locally by user
  workouts/
    stone/program.json
    lightning/program.json
    ice/program.json
    genesis/program.json

specs/
  workout-format.md   # Agent reference for writing program.json files
  future-enhancements.md # Possible next-phase ideas (movement catalog, persistence, product features)
```

---

## Data Model (program.json)

```json
{
  "user": "stone",
  "weeks": [
    {
      "week": 1,
      "days": [
        {
          "day": "Monday",
          "date": "2026-04-21",
          "sections": [
            {
              "type": "warmup",
              "label": "Warm-Up",
              "rounds": 2,
              "movements": [
                { "id": "wu-1", "name": "Air Squats", "reps": 10 }
              ]
            },
            {
              "type": "wod",
              "label": "WOD",
              "sets": 4,
              "movements": [
                { "id": "wod-1", "name": "Back Squat", "media": "/media/movements/back-squat.jpg", "reps": 5, "weight": "185 lbs", "trackResult": true, "unit": "lbs" }
              ]
            },
            {
              "type": "cashout",
              "label": "Cash-Out",
              "style": "emom",
              "duration": "8 min",
              "movements": [
                { "id": "co-1", "name": "Row", "reps": 12, "note": "12 cal, odd minutes" },
                { "id": "co-2", "name": "Ball Slams", "reps": 12, "note": "even minutes" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Section types:** `warmup` | `wod` | `cashout`  
**Cashout styles:** `emom` | `e2mom` | `e3mom` | `hiit` | `amrap` | `tabata` | `stretch` | `other`  
**Result units:** `reps` | `calories` | `time` | `lbs` | `kg` | `meters`

Full format reference: `specs/workout-format.md`

**Movement media:** each movement may include optional `media`, which can point at a local asset under `public/media/movements/` or an external public image URL.

---

## How Rows Work

The app expands sections into individually checkable rows:

- **`rounds: N`** on a section → repeats all movements N times (Round 1, Round 2…)
- **`sets: N`** on a section → repeats the whole movement list as grouped sets (Set 1 = all movements, Set 2 = all movements…)
- **`sets: N`** on a movement → total set count for that movement; in a grouped-set section it appears in each set up to N
- **`rounds` + `sets` together** → nested groups (Round 1 → Set 1/2/3…, then Round 2 → Set 1/2/3…)
- **EMOM** (`style: "emom"`, `duration: "8 min"`) → 8 individual rows (Minute 1…Minute 8), cycling through movements
- **E2MOM** → `0:00–2:00`, `2:00–4:00`… etc.
- **HIIT** (`style: "hiit"`, `countdown`, `work`, `rest`) → in-section prep/work/rest coach timer + one checkable row per work interval, repeated across the movement list and `rounds`

Row IDs in localStorage:
- Normal: `{movement.id}-r{round}` (e.g. `wod-1-r1`)
- Grouped sets: `{movement.id}-r{round}-s{set}` (e.g. `wod-1-r1-s3`)
- EMOM: `{movement.id}-m{intervalNum}` (e.g. `co-1-m4`)
- HIIT: `{movement.id}-h{intervalNum}` (e.g. `co-1-h4`)

Session stored in localStorage: `session:{user}:{date}` → `{ checks, notes, results }`

Exercise images/gifs stored in IndexedDB (`workout-media` db, `movement-media` store), keyed by `{user}:{lowercased movement name}`. Uploading a gif for "Back Squat" shows it wherever that movement appears across the whole program.

Current media behavior:
- Thumbnail button is shown inline on each movement row.
- Tapping opens a larger modal preview.
- Fallback order is uploaded override in IndexedDB → `movement.media` in JSON → placeholder icon.

---

## UI Flow

1. **Home** → pick Stone / Lightning / Ice
2. **Workout page** (before start):
   - Week calendar at top
   - Date + "Start Workout" full-width green button
   - Full workout listed below (sections, movements) — read only
3. **After Start Workout:**
   - Calendar hides
   - Big timer bar appears (~1/3 screen) with **Pause** / **Restart Timer** / **End Workout**
   - Progress bar (completed / total)
   - Each row now checkable; check = green circle + opacity fade + celebration toast
   - Notes icon per row (yellow when has note); preset tags + free text
   - Result input shown when `trackResult: true`
4. **Workout complete** (all rows checked) OR **End Workout** clicked → recap screen:
   - Trophy, total time, sets completed count
   - Per-section breakdown with any logged notes/results

---

## Current Workout Data

Stone covers **Apr 19–29 2026**:
- Week 1: Sun Apr 19 (Power Cleans/WOD), Mon Apr 21 (Push), Tue Apr 22 (Pull), Wed Apr 23 (Upper A), Thu Apr 24 (Legs), Fri Apr 25 (Upper B), Sat Apr 26 (Cardio/Core)
- Week 2: Mon Apr 28, Tue Apr 29 (repeat Mon/Tue)

Lightning + Ice cover **Apr 21–29 2026**:
- Week 1: Mon–Sat (cardio warm-ups, beginner WODs, stretch cool-downs)
- Week 2: Mon Apr 28, Tue Apr 29 (repeat)

Source: `Bigger Leaner Stronger 2026.xlsx` (Levi sheet → Stone, Isaac sheet → Lightning/Ice)

---

## Current Media State

- All workout rows currently have a `media` value in `program.json`.
- Coverage is `345` movement rows / `111` unique movement names / `0` rows missing media.
- Local normalized assets live in `public/media/movements/`.
- Additional raw screenshots from the user live in `public/media/movement/Work out /`.
- Some of those raw screenshots were HEIF images saved with `.PNG` extensions. Do not trust the extension alone when processing that folder.
- Many movements use external public URLs (mostly Wger, some Wikimedia Commons) because exact local assets were not available for every exercise.
- Several movements use "closest category" images instead of exact exercise matches. Treat the current mapping as good enough for now, not final curation.

---

## Adding New Workouts

1. Read `specs/workout-format.md` for the schema
2. Read the existing `program.json` for the user as style reference
3. Parse the source (Excel, notes, etc.) and write the new `program.json`
4. `git add`, `git commit`, `git push` → Vercel auto-deploys in ~30 sec

To add new dates: update `program.json` in place (add weeks/days). The calendar auto-discovers all dates in the file.

### Interval authoring rules

- EMOM / E2MOM / E3MOM: write `style` plus `duration`, and list the movements in the order they should cycle.
- HIIT: write `style: "hiit"` plus `countdown`, `work`, `rest`, and optional `rounds`.
- HIIT rows are generated from work intervals only; rest phases are guided by the coach timer and are not checkable rows.
- The HIIT coach is section-local: the user starts the main workout first, then starts the HIIT timer when they reach that section.

---

## Future Direction

- Future feature ideas now live in `specs/future-enhancements.md`.
- The preferred path for persistent movement/image data is:
  1. keep workout delivery static
  2. add a shared movement catalog (`movements.json` or similar)
  3. only later consider a hosted DB if the app truly needs editing workflows, cloud media, or cross-device sync
- This keeps the app lightweight longer and avoids accidentally turning a static PWA into a much heavier product platform too early.

---

## Service Worker Cache

Every time JS/CSS changes aren't showing for the user, bump the cache version in `public/sw.js`:

```js
const CACHE = 'workout-v5';  // ← increment this
```

Then commit + push (or `npx vercel --prod` for a manual deploy).

---

## Deployment

- **Auto-deploy:** push to `main` → Vercel builds and promotes to production automatically
- **Manual deploy:** `npx vercel --prod` from the project root
- **Build check:** `npm run build` (must pass before pushing)
- Project linked: `.vercel/project.json` exists with `projectId` + `orgId`

---

## Known Patterns & Gotchas

- **Two WOD sections on same day** — WorkoutView keys SectionBlocks by `${type}-${index}`, not just `type`. Don't revert to `key={section.type}` or React will collide.
- **`reps` is a number** — put non-numeric quantities (time, distance, calories) in the `note` field.
- **Tailwind v4** — uses `@import "tailwindcss"` in globals.css, NOT `@tailwind base/components/utilities`.
- **Static export** — no server-side code allowed. All data fetched client-side via `fetch('/workouts/...')`.
- **Wake lock** — acquired when timer starts, released on pause, re-acquired on `visibilitychange` (iOS backgrounding).
- **Ice's "Me" sheet** was empty in the Excel — Ice was set to the same program as Lightning.
- **Media quality caveat** — some `movement.media` links are exact matches, others are category proxies. Review before presenting the app as fully curated.
- **External dependency caveat** — many `movement.media` links are third-party public URLs. If remote availability, caching, or offline behavior matters, replace them with local assets under `public/media/movements/`.
- **Raw image ingestion caveat** — `public/media/movement/Work out /` contains two HEIF files mislabeled as `.PNG`, which can break simple image tooling.
- **Set-model caveat** — the app now supports grouped section sets via `section.sets`. Older JSON that only uses repeated `movement.sets` is still supported, but authoring new workouts should prefer `section.sets` when the whole movement list repeats together.
- **Lint status** — full `npm run lint` still reports pre-existing `react-hooks/set-state-in-effect` errors in `components/CelebrationToast.tsx`, `components/WeekCalendar.tsx`, and `components/WorkoutPage.tsx`.
