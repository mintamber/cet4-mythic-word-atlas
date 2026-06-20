# Two-Voice TTS Handoff

## Verified status

- Branch: `feature/voice-two-options`
- Speech voice eligibility is limited to installed Samantha `en-US` and Eddy `en-GB` voices, in that order, using exact case-sensitive locale strings.
- Automated coverage and interactive browser QA are green.
- The art work remains on a separate branch and is intentionally outside this verified voice milestone.

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
- Fresh browser QA on port `8767`: Voice Atelier listed only `Samantha · en-US` followed by `Eddy (英语（英国）) · en-GB`.
- Selected Eddy and changed Rate to `0.89`, Pitch to `1.04`, and Volume to `0.85`; all four settings persisted after reload.
- At 320, 375, and 390 px, every probe reported `scrollWidth == clientWidth`, `toolsVisible == true`, and popover overlap `false`; Close remained visible and removed the panel.
- Escape dismissal changed the open speech-panel count from `1` to `0`.
- The word speech control appeared once with payload `available`; clicking it set `icon-btn speak-active`.
- All three independent example speech controls appeared. The first encoded payload decoded exactly to `Reliable health information is now available through many university websites.`; clicking it removed the word button's active state and set the example to `listen-mini speak-active`, demonstrating cancellation and independent playback state.
- The Stop control appeared once and its click handler was invoked.
- App development warning and error logs were empty. A Statsig network warning came from the browser QA tool itself, not the app.
- The initially empty voice-list → asynchronous `voiceschanged` path is covered by the automated runtime test. Browser QA verifies control and payload behavior only; it makes no audible-quality claim.

## Exact next task

Perform the final merge of `feature/voice-two-options`, then review and integrate the separate art branch without broadening this voice contract.
