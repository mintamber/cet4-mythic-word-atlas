# Two-Voice TTS Handoff

## Stable state

- Branch: `feature/voice-two-options`
- Speech voice eligibility is limited to installed Samantha `en-US` and Eddy `en-GB` voices, in that order.
- Remaining issue: the art work remains on a separate branch and is intentionally outside this voice milestone.

## What changed

- Replaced the broad English-voice ranking with an exact two-pair allowlist while retaining case-insensitive substring name matching for localized system suffixes.
- Excluded Samantha in non-US locales, Eddy in non-UK locales, and all other English voices.
- Preserved explicit voice assignment, the existing unavailable-voice prompt, no autoplay, and unchanged Rate/Pitch/Volume and word/example payload behavior.
- Invalid saved voice URIs are replaced and persisted with the first installed eligible voice; valid eligible URIs remain usable.

## Files changed

- `index.html`
- `tests/verify-runtime-contracts.mjs`
- `tests/verify-ui-contract.mjs`
- `tests/verify-tts-collocations.mjs`
- `README.md`
- `docs/superpowers/specs/2026-06-19-tts-collocation-design.md`
- `NEXT_STEPS.md`

## Checks run

- All five `tests/verify-fragment.mjs` day-pair checks: PASS (200 records / 600 examples total).
- `node tests/verify-details.mjs`: PASS.
- `node tests/verify-ui-contract.mjs`: PASS.
- `node tests/verify-tts-collocations.mjs`: PASS.
- `node tests/verify-runtime-contracts.mjs`: PASS, including corpus parity.
- `node --check data/details.js`: PASS.
- Both inline scripts parse: PASS.
- `git diff --check`: PASS.

## Exact next task

Review the separate art branch, verify that it does not broaden or alter this two-voice TTS contract, and integrate the art work independently.
