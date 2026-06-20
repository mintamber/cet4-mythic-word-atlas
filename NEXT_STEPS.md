# NEXT STEPS

Updated: 2026-06-20

## Stable milestone

Task 3 art integration is complete on `feature/mythic-art-assets`. The synchronized deep-card/TTS application now renders the homepage atlas illustration, ten unique realm landscapes, and ten matching map badges using relative local paths that work from `file://`. Existing procedural SVG, fog, starlight, and Canvas layers remain as graceful fallbacks and motion overlays.

### Changed

- Extended every `SCENES` record with unique `background` and `badge` paths and added one homepage-art constant.
- Added the atlas hero to the recommended-quest panel with a dark readability veil and subtle reduced-motion-safe drift.
- Added lazy, dimensioned, decorative badge images to all map nodes.
- Applied each scene landscape to both its map node and learning banner while retaining CSS/SVG fallback art.
- Added `onerror` hiding for decorative `<img>` assets; a failed CSS background still falls back to gradients and procedural scene art.
- Extended the art verifier to require all shipping paths, exact day mappings, unique assets, accessible decorative markup, lazy badge loading, explicit dimensions, and no embedded Base64 raster duplicates.

### Files touched

- `index.html`
- `tests/verify-art-assets.mjs`
- `NEXT_STEPS.md`

### Checks run

- TDD RED: art verifier failed because `atlas-hero.webp` was not referenced.
- `node tests/verify-art-assets.mjs` — PASS.
- `node tests/verify-ui-contract.mjs` — PASS.
- `node tests/verify-tts-collocations.mjs` — PASS.
- `node tests/verify-runtime-contracts.mjs` — PASS.
- `git diff --check` — PASS.

### Broken or incomplete

- README still needs the adjacent `assets/` runtime-folder documentation.
- Final complete automated suite and one desktop/mobile browser pass remain.
- Branch is not yet merged back to `main`.

## Exact next task

Update README for the illustrated runtime, commit documentation, then run one final combined automated and browser verification at desktop and 390×844 mobile. Check homepage, map, all ten learning banners, broken-image fallback, console, and horizontal overflow. If green, merge this branch into `main` without changing the Samantha/Eddy voice allowlist.
