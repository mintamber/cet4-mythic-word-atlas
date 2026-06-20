# NEXT STEPS

Updated: 2026-06-20

## Stable milestone

Task 2C has a stable partial milestone on branch `feature/mythic-art-assets`: the Day 8 Mermaid Harbor landscape is generated, visually accepted, archived as a full-resolution PNG master, and optimized as a shipping WebP asset. Two attempts to generate its matching badge reached the image service but ended in a temporary network error; no substitute or lower-quality badge was accepted.

### Changed

- Added the Day 8 Mermaid Harbor landscape: a moonlit collector-grade harbor framed by elegant sails, shell lamps, pearl-like stonework, teal tides, and sea mist.
- Kept the detailed ships and ornament in the outer thirds and preserved a calm dark center-lower landing area for learning-card UI.
- Preserved the selected 1672x941 PNG master at its exact manifest source path and exported the scene at 1672x941 WebP quality 90.
- Attempted the matching shell-lantern/wave/sail badge twice. Both calls failed with a temporary image-service network error, so no unreviewed placeholder was added.

### Files touched

- `assets/images/source/day08-mermaid-harbor.png`
- `assets/images/scenes/day08-mermaid-harbor.webp`
- `NEXT_STEPS.md`

### Checks run

- Used `view_image` at original detail for the selected Day 8 PNG master; checked scene identity, mature Art Nouveau RPG consistency, center-lower UI negative space, coherent materials, and absence of text/logos/watermarks.
- Pillow fully decoded the Day 8 1672x941 PNG master and exported its 1672x941 WebP at quality 90.
- `node tests/verify-art-assets.mjs` — every present source/shipping pair through the Day 8 scene decodes and meets the manifest dimension/aspect contract; expected RED advances to `assets/images/source/day09-labyrinth-of-echoes.png: missing` because manifest ordering checks scenes before badges.
- `git diff --stat` and `git status --short` reviewed before commit; no `index.html` or TTS/collocation files were touched.

### Broken or incomplete

- The Day 8 Mermaid Harbor badge is still missing after two temporary image-service network failures.
- Day 9 Labyrinth of Echoes and Day 10 Starry Academy source and shipping assets are still missing.
- No artwork is integrated into `index.html` yet; this branch intentionally remains isolated from active TTS/collocation implementation.
- The complete 21-asset verifier remains RED until the Day 8 badge and Days 9–10 are generated and optimized.

## Exact next task

Resume Task 2C with the Day 8 shell-lantern/wave/sail circular badge once the image service is responsive; then generate and visually inspect the Day 9 Labyrinth of Echoes and Day 10 Starry Academy scene/badge pairs using the Day 1 anchors as strict system references. Save masters to exact manifest paths, export scenes at quality 90 and badges at 768x768 quality 88, then run `node tests/verify-art-assets.mjs` and make the full 21-asset verifier pass.
