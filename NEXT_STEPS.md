# NEXT STEPS

Updated: 2026-06-20

## Stable milestone

The first production art tranche is complete on branch `feature/mythic-art-assets`: the homepage, Day 1 anchor set, and Days 2–4 scene/badge sets are copied into the repository and optimized for shipping.

### Changed

- Preserved the approved Day 1 Greek Oracle Temple background and badge as the visual-system anchors.
- Generated a homepage celestial atlas hero with ten pictorial realm medallions and a large dark left-side title area.
- Regenerated the homepage once to remove tiny printed marks from an open book; the selected version uses a blank indigo cushion instead.
- Generated and visually inspected Day 2 Moonlit Library, Day 3 Nordic Snow Gate, and Day 4 Dragon Trial landscape scenes.
- Generated and visually inspected the matching Day 2–4 circular badges.
- Copied all selected PNG masters into their exact manifest source paths without deleting the built-in ImageGen originals.
- Converted nine source PNGs into nine manifest WebP assets at quality 90 for scenes/home and quality 92 for badges, preserving original dimensions.

### Files touched

- `assets/images/source/atlas-hero.png`
- `assets/images/source/day01-oracle-temple.png`
- `assets/images/source/day01-oracle-badge.png`
- `assets/images/source/day02-moonlit-library.png`
- `assets/images/source/day02-library-badge.png`
- `assets/images/source/day03-nordic-snow-gate.png`
- `assets/images/source/day03-snow-gate-badge.png`
- `assets/images/source/day04-dragon-trial.png`
- `assets/images/source/day04-dragon-badge.png`
- `assets/images/home/atlas-hero.webp`
- `assets/images/scenes/day01-oracle-temple.webp`
- `assets/images/scenes/day02-moonlit-library.webp`
- `assets/images/scenes/day03-nordic-snow-gate.webp`
- `assets/images/scenes/day04-dragon-trial.webp`
- `assets/images/badges/day01-oracle-badge.webp`
- `assets/images/badges/day02-library-badge.webp`
- `assets/images/badges/day03-snow-gate-badge.webp`
- `assets/images/badges/day04-dragon-badge.webp`
- `NEXT_STEPS.md`

### Checks run

- Used `view_image` at original detail for both approved Day 1 anchors and every newly generated selected asset.
- Checked for scene identity, style consistency, usable UI negative space, badge silhouette, and forbidden text/logos/watermarks.
- Pillow decoded and converted every selected source to WebP successfully.
- `node tests/verify-art-assets.mjs` — all nine present source/shipping pairs decode and meet the manifest dimension/aspect contract; expected RED now advances to `assets/images/source/day05-mirror-castle.png: missing`.

### Broken or incomplete

- Day 5 Mirror Castle through Day 10 Starry Academy source and shipping assets are still missing.
- No artwork is integrated into `index.html` yet; this branch intentionally does not touch the active TTS/collocation worktree.
- The complete 21-asset verifier remains RED until Days 5–10 are generated and optimized.

## Exact next task

Task 2B: generate, inspect, and archive the Day 5 Mirror Castle, Day 6 Arabian Night Market, and Day 7 Glass Mountain landscape scenes and matching circular badges, using the Day 1 anchors as strict system references; convert the six selected PNG masters to their exact manifest WebP paths; rerun `node tests/verify-art-assets.mjs` and confirm the expected RED advances to Day 8.
