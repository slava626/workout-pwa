# Workout Program JSON Format

Reference for agents writing `public/workouts/{user}/program.json`.

Schema source of truth: `types/workout.ts`.

## File location

```
public/workouts/stone/program.json
public/workouts/lightning/program.json
public/workouts/ice/program.json
public/workouts/genesis/program.json
```

## Top-level structure

```json
{
  "user": "stone",
  "weeks": [ ...Week ]
}
```

`user` must be one of: `"stone"` | `"lightning"` | `"ice"` | `"genesis"`

---

## Week

```json
{
  "week": 1,
  "days": [ ...WorkoutDay ]
}
```

---

## WorkoutDay

```json
{
  "day": "Monday",
  "date": "2026-04-21",
  "sections": [ ...Section ]
}
```

- `day`: `"Monday"` | `"Tuesday"` | `"Wednesday"` | `"Thursday"` | `"Friday"` | `"Saturday"` | `"Sunday"`
- `date`: ISO date string `YYYY-MM-DD`

---

## Section

```json
{
  "type": "cashout",
  "label": "HIIT Finisher",
  "rounds": 3,
  "style": "hiit",
  "countdown": 10,
  "work": 40,
  "rest": 20,
  "movements": [ ...Movement ]
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"warmup"` \| `"wod"` \| `"cashout"` |
| `label` | yes | Display name, e.g. `"Warm-Up"`, `"WOD"`, `"Cash-Out"`, `"Cool-Down"` |
| `sets` | no | Integer ≥ 2 to repeat the whole movement list as grouped sets. |
| `rounds` | no | Integer ≥ 2 to repeat the movement list. Omit (or use 1) for single pass. |
| `style` | no | Only on cashout sections: `"emom"` \| `"e2mom"` \| `"e3mom"` \| `"hiit"` \| `"amrap"` \| `"tabata"` \| `"stretch"` \| `"other"` |
| `duration` | no | Free string shown in the UI, e.g. `"8 min"`, `"10 min AMRAP"` |
| `countdown` | no | HIIT only. Prep countdown in seconds before the first work interval starts. |
| `work` | no | HIIT only. Work interval length in seconds. |
| `rest` | no | HIIT only. Rest interval length in seconds between work intervals. |

**How `rounds` works in the app:** the app expands the movement list × rounds and creates a separate checkable row for each. E.g. `rounds: 3` with 4 movements = 12 checkable rows labeled Round 1 / Round 2 / Round 3.

**How `sets` works in the app:** the app groups movements by set, so `sets: 3` with 4 movements renders as Set 1 (all 4 movements), Set 2 (all 4 movements), Set 3 (all 4 movements).

Use `rounds` when the whole section repeats as rounds. Use `sets` at the **section level** when the whole movement list repeats as grouped sets. Use `sets` at the **movement level** when individual movements need different total set counts inside that grouped-set layout.

If a section has both `rounds` and `sets`, the UI renders nested groups: Round 1 → Set 1 / Set 2 / …, then Round 2 → Set 1 / Set 2 / …

**EMOM archetype:** use `style: "emom"` / `"e2mom"` / `"e3mom"` with `duration`. The app expands the section into timed checkable rows and cycles through the listed movements across intervals.

**HIIT archetype:** use `style: "hiit"` with `countdown`, `work`, `rest`, and a movement list. The app renders a coach timer with prep countdown, live work/rest phases, and one checkable row per work interval. `rounds` repeats the movement list.

---

## Movement

```json
{
  "id": "wod-1",
  "name": "Barbell Bench Press",
  "media": "/media/movements/barbell-bench-press.webp",
  "sets": 4,
  "reps": 15,
  "weight": "55 lbs",
  "note": "controlled descent",
  "trackResult": true,
  "unit": "lbs"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Unique within the day. Convention: `wu-1`, `wod-2`, `co-3` |
| `name` | string | yes | Movement name as displayed |
| `media` | string | no | Image/gif URL for thumbnail + modal preview. Prefer static files in `public/media/movements/` (example: `"/media/movements/back-squat.webp"`). |
| `sets` | number | no | Total number of sets for this movement. In grouped-set sections, it controls which set groups the movement appears in. |
| `reps` | number | no | Number of reps (shown as "× N"). Must be a number — put non-numeric quantities in `note` |
| `weight` | string | no | Load, e.g. `"135 lbs"`, `"35 lbs bar"`, `"bodyweight"` |
| `note` | string | no | Extra detail shown in smaller italic text, e.g. `"odd minutes"`, `"1 min each side"`, `"30 cal"` |
| `trackResult` | boolean | no | Shows a numeric input field so the athlete can log their result |
| `unit` | string | no | Label next to the result input: `"reps"` \| `"calories"` \| `"time"` \| `"lbs"` \| `"kg"` \| `"meters"` |

**Grouped-set example:** if a section has 3 movements and `section.sets: 4`, the UI renders:

- Set 1: movement 1, movement 2, movement 3
- Set 2: movement 1, movement 2, movement 3
- Set 3: movement 1, movement 2, movement 3
- Set 4: movement 1, movement 2, movement 3

If one movement has `movement.sets: 5` while the others are 3, the later set groups only show the movement(s) whose total set count reaches that set number.

**Media fallback order in app:** uploaded media override (IndexedDB) → `movement.media` URL from JSON → placeholder icon.

**Non-numeric reps** (time, distance, calories): put the quantity in `note`, omit `reps`. Examples:
```json
{ "id": "wu-1", "name": "Assault AirBike", "note": "3 min, med pace" }
{ "id": "co-1", "name": "Row", "reps": 12, "note": "12 cal, odd minutes" }
{ "id": "wod-4", "name": "Lying Leg Hold", "note": "2 minutes" }
```

---

## ID convention

IDs must be unique **within the day** (not globally). Suggested prefixes:

| Section | Prefix |
|---------|--------|
| Warm-Up | `wu-` |
| WOD | `wod-` |
| Cash-Out / Cool-Down | `co-` |

When a day repeats across weeks (e.g. same Monday workout in week 2), only the `date` field changes — IDs stay the same.

---

## Full minimal example

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
                { "id": "wu-1", "name": "Air Squats", "reps": 10 },
                { "id": "wu-2", "name": "PVC Pass-Throughs", "reps": 10 }
              ]
            },
            {
              "type": "wod",
              "label": "WOD",
              "sets": 4,
              "movements": [
                { "id": "wod-1", "name": "Back Squat", "reps": 5, "weight": "185 lbs", "trackResult": true, "unit": "lbs" },
                { "id": "wod-2", "name": "Strict Pull-Ups", "reps": 8 }
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
            },
            {
              "type": "cashout",
              "label": "HIIT Finisher",
              "style": "hiit",
              "rounds": 3,
              "countdown": 10,
              "work": 40,
              "rest": 20,
              "movements": [
                { "id": "co-3", "name": "Air Squats", "trackResult": true, "unit": "reps" },
                { "id": "co-4", "name": "Push-Ups", "trackResult": true, "unit": "reps" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Agent workflow

1. Read this file to understand the schema.
2. Read an existing `program.json` for the target user as a style reference.
3. Parse the source workout plan (Excel, text, etc.).
4. Write the new `program.json` to `public/workouts/{user}/program.json`.
5. Commit and push — Vercel auto-deploys in ~30 seconds.
