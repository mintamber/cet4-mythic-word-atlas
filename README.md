# CET-4 Mythic Word Atlas

An offline-first, single-page vocabulary game for 200 high-value CET-4 words. It includes ten mythic learning realms, four optional practice modes, spaced review, a wordbook, local progress, deep bilingual word cards, and device-native English speech.

## Run

Double-click `index.html`, or open it with Safari, Chrome, or Edge. No install, build command, account, API key, CDN, or local server is required.

For pronunciation, the app explicitly selects from the English voices installed and enabled on your device; it never falls back to an implicit browser voice. Open **Voice Atelier** from the gear button on a word card to choose the voice and adjust Rate, Pitch, and Volume. Voice, Rate, Pitch, and Volume are saved locally. Their defaults are Rate `0.86`, Pitch `1.02`, and Volume `1`.

Speech never auto-plays. The headword speaker reads only the word, and each of the three example speakers reads only its own sentence. If the browser exposes no eligible English voice, speech controls are disabled and the app shows exactly: `Please install or enable an English system voice.`

Each word card places a bilingual collocation constellation directly below the headword, pairing every English collocation with a concise Chinese gloss.

## Learning model

- Each Day contains exactly 20 words.
- Choose any one practice mode for a 20-question, no-repeat pass; the other modes remain optional.
- Every target word appears once in a pass.
- “Know it,” “Vague,” “Don’t know,” and practice results update mastery from 0–5.
- Mistakes, vague words, favorites, streaks, and progress are stored in `localStorage` under `cet4_mythic_word_atlas_progress`.

## Content structure

- `index.html` is the complete standalone app, including all 200 deep bilingual records and 600 examples.
- `data/details.js` is an editable source mirror; the running app does not depend on it.
- `data/fragments/` keeps editable source fragments grouped by Days.
- `sources.md` documents the literary and recent-world example policy.
- `tests/` contains corpus and UI contract checks.

The source fragments are kept for maintainability, but `index.html` remains fully self-contained. It makes no network or API request.

## Verify

```sh
node tests/verify-fragment.mjs data/fragments/day01-02.json 1,2
node tests/verify-fragment.mjs data/fragments/day03-04.json 3,4
node tests/verify-fragment.mjs data/fragments/day05-06.json 5,6
node tests/verify-fragment.mjs data/fragments/day07-08.json 7,8
node tests/verify-fragment.mjs data/fragments/day09-10.json 9,10
node tests/verify-details.mjs
node tests/verify-ui-contract.mjs
node tests/verify-tts-collocations.mjs
node tests/verify-runtime-contracts.mjs
```

Progress is browser-local. Clearing site data or changing browsers starts a fresh atlas.
