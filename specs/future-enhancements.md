# Future Enhancements

Ideas that have come up during development but are intentionally not part of the current implementation yet.

## 1. Canonical Movement Catalog

Recommended next step if the app needs a cleaner source of truth for exercise names and images.

### Why

- Today each workout row carries its own `name` and optional `media`.
- That keeps the app thin, but it duplicates movement metadata across `program.json` files.
- A catalog would make image reuse, cleanup, and naming consistency much easier.

### Thin version first

Preferred progression:

1. Add a shared `movements.json` or similar catalog file.
2. Give each movement a stable ID / slug.
3. Reference that ID from workout rows.
4. Resolve the display name + default image from the shared catalog.

Example shape:

```json
{
  "id": "back-squat",
  "name": "Back Squat",
  "mediaUrl": "/media/movements/back-squat.jpg",
  "aliases": ["Barbell Back Squat"]
}
```

Then workouts could reference:

```json
{
  "movementId": "back-squat",
  "reps": 5,
  "weight": "185 lbs"
}
```

### When a real DB makes sense

A hosted database is reasonable if the project eventually needs one or more of these:

- an editable movement library UI
- cloud-managed images instead of static files
- multiple editors updating movements
- versioning or approval flow for movement metadata
- cross-device sync for user-specific movement overrides

### Keep it thin

Recommended architecture order:

1. `program.json` + local files in `public/`
2. shared `movements.json` catalog
3. only then a small hosted DB if editing/sync requirements justify it

The DB itself does not automatically make the app heavy. The app gets heavy when it also takes on auth, admin tools, uploads, cloud storage, permissions, and sync complexity.

---

## 2. Suggested Product Enhancements

Features that could improve the app without changing its core minimalist feel too much.

### High-value / low-complexity

- **Movement catalog cleanup**
  Standardize names, aliases, and images so workouts stay consistent.

- **Personal records / history**
  Show last logged weight, reps, or time for the same movement on the next workout.

- **Notes memory**
  Surface the last note for a movement, like "left shoulder tight" or "95 lbs felt easy."

- **Better recap**
  Add simple totals like volume lifted, completed sections, and PR highlights.

- **Rest timer shortcuts**
  Quick 60s / 90s / 2m rest buttons from each movement row.

- **Pinned technique cues**
  Let each movement carry one short coaching cue or safety tip.

### Medium complexity

- **Cross-device sync**
  Sync workout state, notes, and results across phone/tablet.

- **Cloud movement media**
  Move user media overrides out of IndexedDB and into a shared store.

- **Simple admin content flow**
  A tiny editor for workouts, movements, and images instead of manual JSON edits.

- **Search/filter movement library**
  Useful once the movement catalog becomes canonical.

- **Template-driven programming**
  Build workouts from reusable blocks instead of repeating similar JSON by hand.

### Bigger feature ideas

- **Progress dashboards**
  Weekly streaks, adherence, volume trends, and exercise progress charts.

- **Exercise substitution system**
  Replace movements with preferred alternatives while preserving program structure.

- **Coach mode / shared plans**
  Let one curator manage workouts for multiple profiles from a single source of truth.

- **Offline-first sync engine**
  Preserve the current PWA feel while syncing to a backend when available.

---

## Recommendation

If the app stays mostly single-curator and static:

- do **not** jump straight to a full database
- add a shared movement catalog first
- keep workout delivery static
- keep user-specific overrides local until there is a real cross-device need

That path preserves the minimalist architecture while still giving the project room to grow.
