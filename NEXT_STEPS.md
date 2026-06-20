# NEXT STEPS

Updated: 2026-06-20

## Completed milestone

The MVP implementation is complete: 200 deep bilingual words, 600 examples, fixed 20-word non-repeating practice passes, review/wordbook/progress persistence, exact Samantha `en-US` and Eddy `en-GB` TTS, bilingual collocations, and the full 21-asset illustrated mythic atlas are integrated.

### Final verification

- All five fragment checks: PASS (200 records / 600 examples).
- Details, UI, TTS/collocation, runtime, and 21-art-asset contracts: PASS.
- `node --check data/details.js`: PASS.
- `git diff --check`: PASS.
- Browser automation was attempted once, but both the in-app browser test container and local headless Chrome failed before requesting the page. No application browser error was observed; the local server received no request. Automated runtime tests cover mobile source contracts, rendering, speech, corpus parity, asset paths, dimensions, decoding, and fallbacks.

### Files delivered

- `index.html`
- `assets/images/` (21 optimized WebPs plus PNG masters and manifest)
- `data/`, `tests/`, `README.md`, and design/implementation documentation

## Optional manual check

Open `index.html` once in Safari or Chrome and visually browse Home, Atlas, and any Day at desktop and phone width. No implementation work remains unless that manual inspection reveals a browser-specific visual issue.
