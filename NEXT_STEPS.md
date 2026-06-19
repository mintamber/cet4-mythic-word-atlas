# TTS + Collocation Handoff

## Stable state

- Branch: `feature/tts-collocations`
- Implementation commit: `65589fd2e9a2379e7cd61416259b25c196e77ba4`
- Known broken behavior: none in automated coverage.
- Pending manual verification: real-browser pixel and speech checks at 320, 375, and 390 px widths.

## What changed

- Added shrink-safe headword layout rules so long words wrap without pushing the speech, settings, or favorite controls off-screen.
- At widths up to 420 px, the word header stacks and the controls remain a horizontal, wrapping row.
- Added VM/runtime coverage for voice filtering and ranking, saved-setting migration and clamps (including volume `0`), cancel-before-speak, explicit utterance properties, no-voice fallback, and no autoplay.
- Added exact fragment → `data/details.js` → inline-corpus parity checks.
- Added escaped collocation rendering, legacy fallback, duplicate-panel prevention, and responsive source contracts.

## Files changed

- `index.html`
- `tests/verify-runtime-contracts.mjs`
- `NEXT_STEPS.md`

## Checks run

- All five `tests/verify-fragment.mjs` invocations: PASS.
- `node tests/verify-details.mjs`: PASS.
- `node tests/verify-ui-contract.mjs`: PASS.
- `node tests/verify-tts-collocations.mjs`: PASS.
- `node tests/verify-runtime-contracts.mjs`: PASS.
- Both inline scripts parse and the three corpus mirrors match exactly: PASS.
- `node --check data/details.js`: PASS.
- `git diff --check`: PASS.

## Exact next task

Complete Task 4 from `docs/superpowers/plans/2026-06-19-tts-collocation-implementation.md`: document local voice behavior in `README.md`, then browser-test the standalone `index.html` at 320 × 568, 375 × 667, and 390 × 844. Confirm zero horizontal overflow; all three headword controls remain visible for the longest words; the constellation is directly below the headword with no duplicate panel; ranked English voice selection and Voice/Rate/Pitch/Volume survive reload; word and example buttons speak only their own text; no autoplay occurs; and the console has no warnings or errors. Re-run the complete automated suite including `tests/verify-runtime-contracts.mjs`, then commit the Task 4 documentation/final-regression state.
