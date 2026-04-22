<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Notes

- Movement media is now part of the workout schema via `Movement.media` in `types/workout.ts`.
- Section-level grouped sets are now part of the workout schema via `Section.sets` in `types/workout.ts`.
- UI fallback order is: uploaded IndexedDB override -> `movement.media` from JSON -> placeholder icon.
- Preferred local asset location is `public/media/movements/`.
- There is also a raw source drop folder at `public/media/movement/Work out /` containing original screenshots, including two HEIF files mislabeled as `.PNG`.
- All current workout rows have a `media` value, but many of those values are external public URLs. If reliability/offline support matters, move those to local assets in `public/media/movements/` and update the JSON.
- Some movements currently use "closest category" images rather than exact exercise matches where a strong public match was not available. Review before treating the media set as final.
- Grouped-set behavior: use `section.sets` when the whole movement list repeats together (Set 1 = all movements, then Set 2 = all movements, etc.). `movement.sets` still works and now means the total number of set groups that movement should appear in. If a section has both `rounds` and `sets`, the UI nests sets inside each round.
