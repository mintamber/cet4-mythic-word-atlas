# NEXT STEPS

Updated: 2026-06-20

## Stable milestone

Latest `main` is merged into `feature/mythic-art-assets`. The verified deep bilingual cards, 200 collocation sets, and exact two-voice TTS contract are preserved: only installed Samantha `en-US` and Eddy `en-GB` qualify. Task 2 art generation is also complete: all 21 manifest assets exist as PNG masters and optimized WebP payloads.

### What is verified

- Voice selection, persistence, word/example playback separation, no autoplay, and responsive Voice Atelier passed automated and browser QA on `main`.
- All 21 art assets pass `node tests/verify-art-assets.mjs`: one home illustration, ten landscapes, and ten circular badges.
- Art paths remain relative and no application integration has been attempted yet.

### Files touched by synchronization

- `index.html`
- `README.md`
- `tests/verify-runtime-contracts.mjs`
- `tests/verify-ui-contract.mjs`
- `tests/verify-tts-collocations.mjs`
- `NEXT_STEPS.md`

### Broken or incomplete

- The generated artwork is not yet rendered by `index.html`.
- README does not yet describe the required adjacent `assets/` runtime folder.
- Integration assertions and final desktop/mobile browser verification remain.

## Exact next task

Implement Task 3 against the synchronized application: add scene background/badge paths, render the homepage illustration and map badges, apply realm backgrounds with dark readability veils and graceful image fallbacks, extend `tests/verify-art-assets.mjs`, then commit the stable integration milestone. Do not broaden the Samantha `en-US` / Eddy `en-GB` allowlist.
