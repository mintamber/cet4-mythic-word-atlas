# Two-Voice TTS Handoff

## Automated status

- Branch: `feature/voice-two-options`
- Speech voice eligibility is limited to installed Samantha `en-US` and Eddy `en-GB` voices, in that order, using exact case-sensitive locale strings.
- Automated coverage is green; interactive browser QA is still pending, so this milestone is not yet fully verified.
- The art work remains on a separate branch and must be reviewed only after voice browser QA.

## What changed

- Replaced the broad English-voice ranking with an exact two-pair allowlist while retaining case-insensitive substring name matching for localized system suffixes.
- Rejected locale case variants and underscore variants; only literal `en-US` and `en-GB` values qualify.
- Excluded Samantha in non-US locales, Eddy in non-UK locales, and all other English voices.
- Preserved explicit voice assignment, the existing unavailable-voice prompt, no autoplay, and unchanged Rate/Pitch/Volume and word/example payload behavior.
- Invalid saved voice URIs are replaced and persisted with the first installed eligible voice; valid eligible URIs remain usable.
- Added direct coverage for an initially empty `getVoices()` result followed by `voiceschanged`: eligible selection, persistence, rerender, ordering, and no autoplay.
- Replaced the dead preferred-name marker with the canonical ordered allowlist used by runtime eligibility and ranking.

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
- `node tests/verify-runtime-contracts.mjs`: PASS, including exact-locale rejection, Samantha-only, Eddy-only, saved Eddy, all-ineligible fallback/selector, asynchronous `voiceschanged`, and corpus parity.
- `node --check data/details.js`: PASS.
- Both inline scripts parse: PASS.
- `git diff --check`: PASS.

## Exact next task

Complete interactive browser QA before merging: open Voice Atelier and confirm the selector contains only installed Samantha `en-US` and Eddy `en-GB` entries in that order; verify Voice/Rate/Pitch/Volume persistence after reload; observe the initially empty voice-list state transitioning correctly after asynchronous voice loading where the browser exposes it; confirm Close and Escape behavior, no console warnings/errors, and no clipped controls, horizontal overflow, or word-tool coverage at 320, 375, and 390 px widths. If clean, merge the voice branch, then review and integrate the separate art branch without broadening this voice contract.
