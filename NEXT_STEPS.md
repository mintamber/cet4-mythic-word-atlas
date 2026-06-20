# NEXT STEPS

Updated: 2026-06-20

## Stable milestone

Task 2B is complete on branch `feature/mythic-art-assets`: the Day 5 Mirror Castle, Day 6 Arabian Night Market, and Day 7 Glass Mountain scene/badge sets are generated, visually accepted, archived as full-resolution PNG masters, and optimized as shipping WebP assets.

### Changed

- Added the Day 5 Mirror Castle scene with a dark UI-safe mirrored floor and its hand-mirror, rose, and silver-candle badge.
- Added the Day 6 Arabian Night Market scene with a calm central stone path and its hanging-lamp, pointed-arch, crescent, and empty-carpet badge.
- Rejected the first Day 6 badge because its carpet had a tiny rider; regenerated it with an explicitly empty carpet and accepted the corrected output.
- Added the Day 7 Glass Mountain scene with monumental translucent dawn-lit peaks and its crystal-mountain/dawn-ray badge.
- Preserved all six selected masters at their exact manifest source paths and exported the three scenes at 1672x941 WebP quality 90.
- Applied the approved badge optimization to Days 1–7: all shipping badges are now 768x768 WebP quality 88, while all 1254x1254 PNG masters remain unchanged.
- Badge shipping files are 112–162 KiB, below the 250 KiB target without visible small-display degradation.

### Files touched

- `assets/images/source/day05-mirror-castle.png`
- `assets/images/source/day05-mirror-badge.png`
- `assets/images/source/day06-arabian-night-market.png`
- `assets/images/source/day06-night-market-badge.png`
- `assets/images/source/day07-glass-mountain.png`
- `assets/images/source/day07-glass-mountain-badge.png`
- `assets/images/scenes/day05-mirror-castle.webp`
- `assets/images/scenes/day06-arabian-night-market.webp`
- `assets/images/scenes/day07-glass-mountain.webp`
- `assets/images/badges/day01-oracle-badge.webp`
- `assets/images/badges/day02-library-badge.webp`
- `assets/images/badges/day03-snow-gate-badge.webp`
- `assets/images/badges/day04-dragon-badge.webp`
- `assets/images/badges/day05-mirror-badge.webp`
- `assets/images/badges/day06-night-market-badge.webp`
- `assets/images/badges/day07-glass-mountain-badge.webp`
- `NEXT_STEPS.md`

### Checks run

- Used `view_image` at original detail for all six selected Day 5–7 PNG masters; checked scene identity, mature Art Nouveau RPG consistency, center-lower UI negative space, badge silhouettes, coherent materials, and absence of text/logos/watermarks.
- Pillow fully decoded every present PNG and WebP asset. Day 5–7 sources are 1672x941 scenes or 1254x1254 badges; shipping scenes retain 1672x941 and shipping badges are exactly 768x768.
- `node tests/verify-art-assets.mjs` — every present source/shipping pair through Day 7 decodes and meets the manifest dimension/aspect contract; expected RED advances to `assets/images/source/day08-mermaid-harbor.png: missing`.
- `git diff --stat` and `git status --short` reviewed before commit; no `index.html` or TTS/collocation files were touched.

### Broken or incomplete

- Day 8 Mermaid Harbor through Day 10 Starry Academy source and shipping assets are still missing.
- No artwork is integrated into `index.html` yet; this branch intentionally remains isolated from active TTS/collocation implementation.
- The complete 21-asset verifier remains RED until Days 8–10 are generated and optimized.

## Exact next task

Task 2C: generate and visually inspect the Day 8 Mermaid Harbor, Day 9 Labyrinth of Echoes, and Day 10 Starry Academy landscape scenes and matching circular badges using the Day 1 anchors as strict system references; save the six PNG masters to their exact manifest source paths; export scenes at quality 90 and badges at 768x768 quality 88; run `node tests/verify-art-assets.mjs` and make the full 21-asset verifier pass.
