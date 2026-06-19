# NEXT STEPS

Updated: 2026-06-20

## Stable milestone

The illustrated-asset direction and implementation plan are complete on branch `feature/mythic-art-assets`.

### Changed

- Approved direction B: collector-edition Art Nouveau mythic storybook.
- Defined a 21-asset set: one homepage illustration, ten realm backgrounds, ten badges.
- Defined shared palette, material, composition, badge, performance, fallback, and motion rules.
- Defined an isolated generation → optimization → integration workflow so the active TTS/collocation branch is not overwritten.
- Generated Day 1 Greek Oracle Temple background and badge as style anchors in the built-in ImageGen output directory; they are not yet copied into this branch.

### Files touched

- `docs/superpowers/specs/2026-06-20-mythic-art-assets-design.md`
- `docs/superpowers/plans/2026-06-20-mythic-art-assets-implementation.md`
- `NEXT_STEPS.md`

### Checks run

- Placeholder scan for `TBD`, `TODO`, and `FIXME` on the design.
- `git diff --check` before the design commit.

### Broken or incomplete

- `assets/images/manifest.json` and `tests/verify-art-assets.mjs` do not exist yet.
- Day 1 generated anchors remain under `/Users/indigo/.codex/generated_images/019edf08-3356-7840-8932-aa2f11df02a6/`.
- Homepage illustration and Days 2–10 assets have not been generated.
- No artwork is integrated into `index.html` yet.
- TTS/collocation work is progressing independently in `.worktrees/tts-collocations`; do not edit its files from this branch.

## Exact next task

Implement Task 1 from `docs/superpowers/plans/2026-06-20-mythic-art-assets-implementation.md`: create the 21-entry asset manifest and failing `tests/verify-art-assets.mjs`, confirm the test fails on missing assets, commit the contract, then update this file.
