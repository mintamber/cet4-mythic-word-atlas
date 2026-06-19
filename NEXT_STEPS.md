# NEXT STEPS

Updated: 2026-06-20

## Stable milestone

The illustrated-asset contract is defined on branch `feature/mythic-art-assets` at commit `bd9c67f`.

### Changed

- Approved direction B: collector-edition Art Nouveau mythic storybook.
- Defined a 21-asset set: one homepage illustration, ten realm backgrounds, ten badges.
- Defined shared palette, material, composition, badge, performance, fallback, and motion rules.
- Defined an isolated generation → optimization → integration workflow so the active TTS/collocation branch is not overwritten.
- Generated Day 1 Greek Oracle Temple background and badge as style anchors in the built-in ImageGen output directory; they are not yet copied into this branch.
- Added a 21-entry manifest covering the homepage, ten scenes, and ten corresponding badges with stable paths, scene/day metadata, and expected aspect/dimension metadata.
- Added a verifier for manifest uniqueness, role/day coverage, scene-to-badge correspondence, source/shipping extensions, file existence and size, and image dimensions through `sips` with a built-in PNG/WebP fallback.

### Files touched

- `docs/superpowers/specs/2026-06-20-mythic-art-assets-design.md`
- `docs/superpowers/plans/2026-06-20-mythic-art-assets-implementation.md`
- `assets/images/manifest.json`
- `tests/verify-art-assets.mjs`
- `NEXT_STEPS.md`

### Checks run

- Placeholder scan for `TBD`, `TODO`, and `FIXME` on the design.
- `git diff --check` before the design commit.
- `node tests/verify-art-assets.mjs` — expected RED at the first missing file: `assets/images/source/atlas-hero.png`.
- `node --check tests/verify-art-assets.mjs` — passed.
- `git diff --check` — passed before the contract commit.

### Broken or incomplete

- Day 1 generated anchors remain under `/Users/indigo/.codex/generated_images/019edf08-3356-7840-8932-aa2f11df02a6/`.
- All 21 source PNGs and all 21 shipping WebPs declared by the manifest are still absent from this branch.
- The homepage illustration and Days 2–10 scene and badge artwork have not been generated; the Day 1 source anchors have not been copied or converted.
- No artwork is integrated into `index.html` yet.
- TTS/collocation work is progressing independently in `.worktrees/tts-collocations`; do not edit its files from this branch.

## Exact next task

Copy the approved Day 1 background and badge anchors into their manifest source paths without deleting the originals, generate the homepage illustration plus Days 2–10 scene backgrounds and badges from those anchors, convert all selected PNG masters to the manifest WebP shipping paths, then run `node tests/verify-art-assets.mjs` to GREEN.
