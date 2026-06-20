# NEXT STEPS

Updated: 2026-06-20

## Stable milestone

Task 2C has a third stable partial milestone on branch `feature/mythic-art-assets`: the Day 8 Mermaid Harbor scene/badge set and Day 9 Labyrinth of Echoes landscape are complete as full-resolution PNG masters and optimized shipping WebP assets. The reference-image endpoint remained unreliable, so the accepted Day 8 badge was generated from the same strict written art system without a reference attachment. Two subsequent Day 9 badge calls ended in temporary generation-service network errors.

### Changed

- Added the Day 8 Mermaid Harbor landscape: a moonlit collector-grade harbor framed by elegant sails, shell lamps, pearl-like stonework, teal tides, and sea mist.
- Kept the detailed ships and ornament in the outer thirds and preserved a calm dark center-lower landing area for learning-card UI.
- Preserved the selected 1672x941 PNG master at its exact manifest source path and exported the scene at 1672x941 WebP quality 90.
- Added the Day 9 Labyrinth of Echoes landscape: a monumental overhead stone maze, layered echo-wave rings,幽蓝 blue braziers, carved gold detail, and a calm dark center-lower landing.
- Preserved the selected Day 9 1672x941 PNG master at its exact manifest source path and exported the scene at 1672x941 WebP quality 90.
- Added the matching Day 8 shell-lantern/wave/sail circular medallion; retained its 1254x1254 PNG master and exported a 768x768 quality-88 WebP.
- Attempted the Day 9 maze/echo-ring/blue-flame badge twice; both generation calls ended in a temporary service network error, so no unreviewed placeholder was added.

### Files touched

- `assets/images/source/day08-mermaid-harbor.png`
- `assets/images/scenes/day08-mermaid-harbor.webp`
- `assets/images/source/day08-mermaid-harbor-badge.png`
- `assets/images/badges/day08-mermaid-harbor-badge.webp`
- `assets/images/source/day09-labyrinth-of-echoes.png`
- `assets/images/scenes/day09-labyrinth-of-echoes.webp`
- `NEXT_STEPS.md`

### Checks run

- Used `view_image` at original detail for the selected Day 8 and Day 9 PNG masters; checked scene identity, mature Art Nouveau RPG consistency, center-lower UI negative space, coherent materials, and absence of text/logos/watermarks.
- Pillow fully decoded both 1672x941 PNG masters and their quality-90 1672x941 WebP exports.
- `node tests/verify-art-assets.mjs` — every present source/shipping scene pair through Day 9 decodes and meets the manifest dimension/aspect contract; expected RED advances to `assets/images/source/day10-starry-academy.png: missing` because manifest ordering checks scenes before badges.
- `git diff --stat` and `git status --short` reviewed before commit; no `index.html` or TTS/collocation files were touched.

### Broken or incomplete

- The Day 9 Labyrinth of Echoes badge is still missing after two temporary generation-service network failures.
- Both Day 10 Starry Academy assets are still missing.
- No artwork is integrated into `index.html` yet; this branch intentionally remains isolated from active TTS/collocation implementation.
- The complete 21-asset verifier remains RED until the Day 9 badge and Day 10 pair are generated and optimized.

## Exact next task

Resume Task 2C with the Day 9 maze-spiral/echo-ring/blue-flame circular badge once the image service is responsive; then generate the Day 10 Starry Academy scene/badge pair. Save masters to exact manifest paths, export the scene at quality 90 and badges at 768x768 quality 88, then run one final `node tests/verify-art-assets.mjs` and make the full 21-asset verifier pass.
