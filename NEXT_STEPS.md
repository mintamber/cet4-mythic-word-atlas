# TTS + Collocation Handoff

## Stable state

- Branch: `feature/tts-collocations`
- Implementation commit: `65589fd2e9a2379e7cd61416259b25c196e77ba4`
- Documentation commit: `907db3b`
- Known broken behavior: none in automated coverage.
- Limitation: interactive browser QA is still pending. The in-app browser timed out while loading the temporary localhost server, and direct `file://` navigation was blocked by its URL policy. Audible capture is not required; the runtime suite verifies utterance payloads, settings, cancellation, and no autoplay.

## What changed

- Documented that the app explicitly selects an installed/enabled English voice and never uses an implicit browser default.
- Documented saved Voice, Rate, Pitch, and Volume settings and defaults of Rate `0.86`, Pitch `1.02`, and Volume `1`.
- Documented no autoplay, word-only pronunciation, per-example sentence controls, the exact no-English-voice prompt, and the bilingual collocation constellation.
- Expanded the README verification block to include all five fragment validators and every TTS/runtime contract suite.

## Files changed in Task 4

- `README.md`
- `NEXT_STEPS.md`

## Checks run

- All five `tests/verify-fragment.mjs` invocations with their expected Day arguments: PASS.
- `node tests/verify-details.mjs`: PASS (200 records / 600 bilingual examples).
- `node tests/verify-ui-contract.mjs`: PASS.
- `node tests/verify-tts-collocations.mjs`: PASS.
- `node tests/verify-runtime-contracts.mjs`: PASS.
- `node --check data/details.js`: PASS.
- Both inline scripts parse: PASS.
- All 200 records match exactly across fragments, `data/details.js`, and the inline corpus: PASS.
- `git diff --check`: PASS.

## Exact next task

Perform final review and merge. Before merging, complete the remaining interactive browser smoke test from an environment that can load the local standalone page: home → learn; English-only selected voice list where the platform exposes voices; bare-word payload; three independent example-sentence payloads; Voice/Rate/Pitch/Volume persistence after reload; no autoplay; constellation directly below the headword with no old duplicate panel; no console warnings/errors; and no horizontal overflow, clipped controls, or longest-word breakage on desktop and 320, 375, and 390 px widths (including 390 × 844). Then merge `feature/tts-collocations` if that smoke test is clean.
