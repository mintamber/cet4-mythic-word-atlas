# CET-4 Mythic Word Atlas

An offline-first, single-page vocabulary game for 200 high-value CET-4 words. It includes ten mythic learning realms, four optional practice modes, spaced review, a wordbook, local progress, deep bilingual word cards, and device-native English speech.

## Run

Double-click `index.html`, or open it with Safari, Chrome, or Edge. No install, build command, account, API key, CDN, or local server is required.

For the best pronunciation, open **Voice Atelier** from the gear button on a word card and choose one of the natural English voices installed on your Mac. The selected voice and speed are saved locally.

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
node tests/verify-details.mjs
node tests/verify-ui-contract.mjs
```

Progress is browser-local. Clearing site data or changing browsers starts a fresh atlas.
