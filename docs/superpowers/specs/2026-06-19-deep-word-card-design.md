# CET-4 Mythic Word Atlas — Deep Word Card Design

## Goal

Upgrade all 200 vocabulary cards from lightweight flashcards into bilingual micro-dictionary entries with visible parts of speech, structured senses, richer usage guidance, three kinds of examples, and natural device-based speech without any backend or third-party API.

## Constraints

- The application remains a static frontend deployable to GitHub Pages.
- No database, server function, runtime API key, external image, font CDN, or speech API is used.
- The existing 200-word, ten-Day structure and mastery/progress storage remain intact.
- Speech quality depends on voices installed on the learner's device; the app improves selection and controls but cannot guarantee the same voice on every platform.
- Literary and current-affairs material supports learning rather than acting as a scholarly quotation database.

## Verified Current State

- Each word already contains `pos`, but it is rendered as a small italic string beside the phonetic transcription and lacks visual prominence.
- Each word has one Chinese definition, one short English definition, one original example, and one memory cue.
- Speech currently calls `SpeechSynthesisUtterance` with only `lang='en-US'`; it does not select a quality voice, expose speed, distinguish heteronyms, or read definitions and examples.
- The current `index.html` is approximately 83 KB before content expansion.

## Deep Word Data Model

Every runtime word object retains its current fields and adds:

- `senses`: one or more sense objects.
- `collocations`: three to five common collocations.
- `wordFamily`: two to five useful derivatives when they exist.
- `synonyms`: zero to four close alternatives with concise distinction where needed.
- `antonyms`: zero to three opposites where useful.
- `usageNote`: one concise bilingual warning, register note, grammar pattern, or reading trap.
- `examples`: exactly three categorized example objects.
- `speechText`: optional disambiguated pronunciation text for heteronyms.

Each sense object contains:

- `pos`
- `phonetic`
- `meaningCN`
- `meaningEN`
- optional `pattern`

Each example object contains:

- `type`: `cet4`, `literature`, or `world`
- `label`
- `text`
- `translationCN`
- `attributionType`: `original`, `public-domain-quote`, `literary-adaptation`, or `current-context`
- optional `sourceTitle`
- optional `sourceAuthor`
- optional `sourceUrl`
- optional `sourceDate`
- `speakText`

## Example Corpus Policy

Every word has exactly three examples.

### CET-4 Context

An original, short, natural sentence that demonstrates the target sense and a plausible CET-4 reading, writing, or campus context. It carries no external attribution.

### Literature

Use a short, verified public-domain quotation only when the target word occurs naturally and the excerpt is pedagogically useful. Otherwise use an original sentence grounded in a recognizable literary situation and mark it `literary-adaptation`; it must not be displayed with quotation marks or presented as the author's words.

Literary sources prioritize Project Gutenberg, Standard Ebooks, Wikisource, and authoritative public-domain editions. Source titles and authors are shown when applicable.

### World Now

Use an original learning sentence inspired by broadly documented recent or contemporary developments across technology, politics, climate, international affairs, culture, entertainment, business, science, and sport. It is marked `current-context`, not presented as a direct news quotation, and may include a short topic/source label when verified.

The corpus does not claim continuous real-time updates. A visible `Current context edition` date communicates when the material was curated.

## Source Integrity Rules

- Never fabricate a quotation, title, author, publication, date, or URL.
- Direct literary quotations require verification against a public-domain primary text.
- News-derived sentences are paraphrased learning examples rather than copied article prose.
- Exact quotation excerpts remain short and local to the target word.
- If source verification is incomplete, downgrade the entry to clearly labeled adaptation/context instead of inventing attribution.
- Political and international examples use neutral factual language and avoid unsupported predictions or partisan framing.

## Learning Card Layout

The word-card header contains:

- word,
- primary phonetic transcription,
- one or more prominent part-of-speech pills,
- favorite action,
- word pronunciation action.

Below the header, a sense deck renders each meaning as a numbered block with its own part of speech, phonetic form, Chinese meaning, plain-English explanation, and optional pattern.

The usage section is organized into compact, collapsible panels:

- Common Collocations
- Word Family
- Synonyms & Antonyms
- Usage Note / Reading Trap

The examples section renders three visually distinct cards:

- CET-4 Context — moon-white paper.
- Literature — parchment and rose-gold edge.
- World Now — cool glass with an edition/date marker.

Each example shows English first, Chinese translation second, an attribution label, and an independent listen button. Source links appear only when present and open in a new tab.

## Speech System Without APIs

The app builds a voice preference layer over the Web Speech API.

### Voice Discovery

- Load voices from `speechSynthesis.getVoices()` and listen for `voiceschanged`.
- Filter to English voices.
- Rank local voices first and prefer high-quality names when available: Ava, Samantha, Daniel, Karen, Moira, Zoe, Serena, or voices containing `Natural` or `Premium`.
- Fall back to the browser's default English voice.
- Disable controls with a clear message when speech synthesis is unavailable.

### Controls

A speech settings popover provides:

- voice selector,
- preview button,
- rate selector or slider from 0.7 to 1.15,
- stop button.

Settings persist inside the existing localStorage state under `speechSettings`.

### Reading Actions

- Word button reads `speechText` or the bare word at a slower default rate.
- Each sense may read a disambiguated phrase for heteronyms, such as `to conduct` versus `conduct, the noun`.
- English definition button reads only the English explanation.
- Example buttons read the English sentence without labels, attribution, or Chinese translation.
- Starting a new utterance cancels the previous utterance.

The interface states that pronunciation uses an AI/device-generated or synthesized voice where appropriate and that available voices vary by device.

## Heteronym Handling

Day 10 and other multi-pronunciation items receive explicit speech forms. Examples include:

- `object`: `an object` / `to object`
- `subject`: `the subject` / `subject to change`
- `conduct`: `professional conduct` / `to conduct research`
- `present`: `the present situation` / `to present a report`
- `content`: `the content` / `content and satisfied`
- `record`-like behavior is supported by the model even if the word is not in the MVP corpus.

## Responsive Behavior

- Desktop uses a two-column card: definition/sense deck on the left, examples and usage on the right where space permits.
- Mobile remains a single readable column with sticky word controls and 44-pixel minimum tap targets.
- Long content uses progressive disclosure rather than forcing the learner through an excessively tall card.
- Collapsible panels preserve keyboard accessibility and expose state with `aria-expanded`.

## Migration Strategy

- Keep the compact base vocabulary corpus unchanged for IDs, Day mapping, and backward-compatible fields.
- Add a `DETAILS` map keyed by word ID or normalized Day/word key.
- Hydrate base words with details at startup.
- Runtime validation rejects missing details, missing example categories, duplicate categories, invalid URLs, or unverified quote labels without source metadata.
- Existing localStorage state remains compatible because IDs do not change.

## Verification

Automated checks verify:

- all 200 words have at least one sense,
- all displayed parts of speech are non-empty,
- every word has exactly three examples with unique required categories,
- every example has English and Chinese text,
- every public-domain quotation has title, author, and source URL,
- literary adaptations are never rendered as direct quotations,
- speech settings clamp to supported rates and survive persistence,
- heteronym speech text exists for identified multi-pronunciation words,
- no runtime API or secret is introduced,
- all previous mastery, practice, review, search, and progress tests remain valid.

Browser verification checks voice discovery, voice preview, word/definition/example playback controls, collapsible content, desktop/mobile layout, refresh persistence, and graceful unsupported-speech behavior.

## Scope Boundary

This revision covers all 200 MVP words. It does not expand to the full CET-4 lexicon, add a backend, guarantee a particular system voice, continuously ingest live news, or create downloadable audio assets.
