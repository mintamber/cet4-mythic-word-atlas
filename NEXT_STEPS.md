# NEXT STEPS

Updated: 2026-06-20

## Stable milestone

Task 2 is complete on `feature/mythic-art-assets`: all 21 approved mythic assets now exist at their manifest paths — one homepage illustration, ten realm landscapes, and ten matching circular badges. Full-resolution PNG masters are retained; shipping payloads are optimized WebP files.

### Changed

- Added the Day 9 Labyrinth of Echoes badge with a maze spiral, echo rings, and central blue flame.
- Added the Day 10 Starry Academy badge with an academy arch, armillary sphere, and celestial chart.
- Exported both badges at 768×768 WebP quality 88.
- Preserved the shared mature navy/antique-gold Art Nouveau medallion system and small-size silhouette.

### Files touched

- `assets/images/source/day09-echo-labyrinth-badge.png`
- `assets/images/badges/day09-echo-labyrinth-badge.webp`
- `assets/images/source/day10-academy-badge.png`
- `assets/images/badges/day10-academy-badge.webp`
- `NEXT_STEPS.md`

### Checks run

- Built-in ImageGen output inspection for both badges: complete rims, clear scene symbols, no readable text/logos/watermarks.
- `node tests/verify-art-assets.mjs` — PASS for all 21 source and shipping assets.
- Shipping badges decode at 768×768; source masters decode at 1254×1254.

### Broken or incomplete

- Artwork is not yet integrated into `index.html`.
- The art branch still needs latest `main`, which contains the completed two-voice TTS/collocation work.

## Exact next task

Merge latest `main` into this worktree, resolve `NEXT_STEPS.md` by retaining both verified voice status and this completed asset status, then implement Task 3: map scene/background/badge paths, render the homepage art and realm badges, apply scene backgrounds with readability veils and graceful image fallbacks, and extend the integration verifier.
