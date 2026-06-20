# TTS and Collocation Card Enhancement Design

## Goal

Improve the existing offline Web Speech experience without adding an API, server, CDN, or runtime dependency. Place useful bilingual collocation guidance directly beneath each headword without duplicating the existing usage panel.

## Voice Selection

The app obtains voices exclusively through `speechSynthesis.getVoices()` and never relies on the implicit browser default. Its allowlist contains exactly two name-and-locale pairs: a name containing `Samantha` with locale `en-US`, followed by a name containing `Eddy` with locale `en-GB`. Name matching is case-insensitive and permits localized suffixes; locale matching is an exact, case-sensitive string comparison. Underscore variants, case variants, Samantha with another locale, Eddy with another locale, and every other English voice are ineligible.

Voice loading handles the asynchronous `voiceschanged` event used by Safari and Chrome. A saved voice URI is restored only when it still belongs to one of the two eligible voices. Otherwise it is discarded, the first installed eligible voice becomes selected, and that URI is saved. The app never silently speaks with an unsuitable default voice.

If neither eligible voice is available, speech controls are disabled and the interface displays exactly: `Please install or enable an English system voice.`

## Speech Settings and Playback

`speechSettings` contains:

- `voiceURI`, selected from the ranked eligible voices
- `rate`, default `0.86`, clamped to `0.70–1.15`
- `pitch`, default `1.02`, clamped to `0.80–1.20`
- `volume`, default `1`, clamped to `0–1`

All settings are sanitized and persisted inside the existing `cet4_mythic_word_atlas_progress` localStorage record. Existing users whose state contains only `voiceURI` and `rate` are migrated by applying the new pitch and volume defaults without losing progress.

Every utterance receives the selected `voice`, `lang`, `rate`, `pitch`, and `volume`. Starting an utterance cancels the previous one. There is no queue, automatic continuation, or automatic speech on navigation. The word button speaks only the bare headword. Each example keeps its own small independent listen button and speaks only that example. Voice preview is the only settings action that reads a fixed preview sentence.

## Settings UI

Voice Atelier contains four controls: Voice, Rate, Pitch, and Volume. Each range shows its current numeric value and updates localStorage immediately. The voice selector lists only installed eligible voices, with Samantha first and Eddy UK second. Preview and Stop remain explicit buttons.

The panel remains usable on mobile and preserves the existing mythic glass visual language. The unavailable-voice message appears inside the panel and near disabled speech controls where necessary.

## Collocation Guidance

Each of the 200 records gains `collocationNotes`, aligned with its existing `collocations` array. Each note contains the English collocation and a concise Chinese gloss, for example `readily available · 随时可获得的`.

The learning card renders a compact `Collocation constellation · 搭配星图` immediately below the headword, phonetic spelling, and POS pills. It shows two or three bilingual items with strong English text and quieter Chinese explanation. The generic Collocations panel is removed from the right-hand usage grid to prevent duplication; word family, synonyms, antonyms, and usage guidance remain.

The layout wraps cleanly on narrow screens and does not push speech/favorite controls off the card.

## Failure Handling

- Missing Web Speech API: disable speech and show the English installation/enablement message.
- Empty or temporarily unloaded voices: wait for `voiceschanged`; do not speak through an implicit default.
- Saved voice no longer installed: select and save the best currently available eligible voice.
- Invalid persisted numeric settings: clamp or restore defaults.
- Missing collocation notes in legacy data: fall back to the English collocation rather than hiding the section or throwing.

## Verification

Automated contract tests cover the two-voice name-and-exact-locale allowlist and ordering, rejection of underscore and case-variant locales, Samantha-only and Eddy-only availability, valid saved Eddy restoration, stale saved-URI replacement, the nonempty all-ineligible fallback and selector, exact defaults, pitch and volume controls, unavailable-voice copy, absence of automatic playback, word-only speech payloads, example speech controls, collocation-note coverage for all 200 records, and the standalone/no-external-script constraint.

Browser verification covers Voice Atelier interaction, word and example buttons, settings persistence after reload, no console errors, and desktop/mobile overflow checks.
