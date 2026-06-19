# Deep Bilingual Word Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich all 200 vocabulary entries with structured bilingual senses, usage guidance, three example types, and controllable high-quality device speech while retaining a static GitHub Pages architecture.

**Architecture:** Keep `index.html` as the application shell and extract the large enrichment corpus into a local `data/details.js` script that assigns `window.ATLAS_DETAILS`. Hydrate existing base records by stable word IDs, validate the corpus with a Node harness, and add a voice-selection layer around the Web Speech API. No runtime network request, secret, database, or backend is introduced.

**Tech Stack:** HTML/CSS/Vanilla JavaScript, local JavaScript data module, Web Speech API, localStorage, Node.js validation, GitHub Pages.

---

## File Map

- Modify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/index.html` — app rendering, speech controls, hydration, and responsive presentation.
- Create: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/data/details.js` — all 200 deep word records.
- Create: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/tests/verify-details.mjs` — permanent corpus and contract tests.
- Create: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/sources.md` — source policy, public-domain corpus, current-context source pool, and curation date.
- Create: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/README.md` — project use, local opening, GitHub Pages deployment, speech limitations, and source policy.

### Task 1: Preserve and commit the current MVP baseline

**Files:**
- Add: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/index.html`

- [ ] **Step 1: Verify the current script parses**

Run:

```bash
node --check <(perl -0777 -ne 'while(/<script>(.*?)<\/script>/sg){print $1,"\n"}' index.html)
```

Expected: exit 0.

- [ ] **Step 2: Confirm no unrelated files enter the baseline commit**

Run: `git status --short`

Expected: `index.html` is untracked; the committed design document is clean.

- [ ] **Step 3: Commit the existing MVP**

Run:

```bash
git add index.html
git commit -m "feat: add CET-4 Mythic Word Atlas MVP"
```

Expected: a commit containing only `index.html`.

### Task 2: Define the deep-entry schema with a failing validation suite

**Files:**
- Create: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/tests/verify-details.mjs`
- Create: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/data/details.js`

- [ ] **Step 1: Write the failing validator**

The test evaluates `details.js` in a VM sandbox and validates exactly 200 keys, known base IDs, required sense fields, three unique example types, attribution metadata, heteronym speech forms, and absence of remote/runtime API calls.

```js
const requiredTypes = new Set(['cet4', 'literature', 'world']);
assert.equal(Object.keys(details).length, 200);
for (const [id, detail] of Object.entries(details)) {
  assert.ok(detail.senses.length >= 1, `${id}: senses`);
  assert.ok(detail.senses.every(s => s.pos && s.phonetic && s.meaningCN && s.meaningEN));
  assert.equal(detail.examples.length, 3, `${id}: examples`);
  assert.deepEqual(new Set(detail.examples.map(e => e.type)), requiredTypes);
  assert.ok(detail.examples.every(e => e.text && e.translationCN && e.speakText));
  for (const example of detail.examples) {
    if (example.attributionType === 'public-domain-quote') {
      assert.ok(example.sourceTitle && example.sourceAuthor && example.sourceUrl);
    }
  }
}
```

- [ ] **Step 2: Run the validator and verify RED**

Run: `node tests/verify-details.mjs`

Expected: FAIL because the corpus is empty or incomplete.

- [ ] **Step 3: Add the global data contract and one representative entry**

Use this exact public interface:

```js
window.ATLAS_DETAILS = {
  'd01-available': {
    senses: [{ pos:'adj.', phonetic:'/əˈveɪləbl/', meaningCN:'可获得的；可利用的', meaningEN:'able to be obtained, used, or reached', pattern:'be available to/for' }],
    collocations:['readily available','available resources','be available to the public'],
    wordFamily:['availability n.','unavailable adj.'],
    synonyms:['accessible — 强调容易接近或取得'],
    antonyms:['unavailable'],
    usageNote:'available 通常放在名词后或 be 动词后；不要说 an available to everyone service。',
    speechText:'available',
    examples:[
      {type:'cet4',label:'CET-4 Context',text:'The full report is available in the university library.',translationCN:'完整报告可在大学图书馆查阅。',attributionType:'original',speakText:'The full report is available in the university library.'},
      {type:'literature',label:'Literature',text:'Elizabeth waited until a suitable carriage was available for the journey.',translationCN:'伊丽莎白等到有合适的马车可供出行。',attributionType:'literary-adaptation',sourceTitle:'Pride and Prejudice',sourceAuthor:'Jane Austen',speakText:'Elizabeth waited until a suitable carriage was available for the journey.'},
      {type:'world',label:'World Now',text:'More open-source AI tools are becoming available to small businesses.',translationCN:'越来越多开源人工智能工具正向小企业开放。',attributionType:'current-context',sourceDate:'2026-06',speakText:'More open-source AI tools are becoming available to small businesses.'}
    ]
  }
};
```

- [ ] **Step 4: Run the validator and confirm the expected incomplete-corpus failure**

Run: `node tests/verify-details.mjs`

Expected: FAIL with `1 !== 200`, proving the schema is executable and the corpus gate remains active.

- [ ] **Step 5: Commit the validator and schema seed**

Run:

```bash
git add tests/verify-details.mjs data/details.js
git commit -m "test: define deep vocabulary corpus contract"
```

### Task 3: Curate source policy and source pools

**Files:**
- Create: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/sources.md`

- [ ] **Step 1: Document inclusion and exclusion rules before corpus writing**

Record:

- public-domain primary text sources: Project Gutenberg, Standard Ebooks, Wikisource;
- current-context authoritative source pool: official institutions and primary company/organization releases first, reputable reporting second;
- curation edition: June 2026;
- direct quote maximum: one short sentence that naturally contains the target word;
- adaptations must use `literary-adaptation`, never quotation marks;
- current examples must use `current-context`, neutral paraphrase, and no claim of verbatim news wording;
- politically contested or rapidly changing facts must be omitted or phrased generically unless verified.

- [ ] **Step 2: Add a verified public-domain source table**

Include stable primary-text links for a compact reusable corpus such as *Pride and Prejudice*, *Jane Eyre*, *A Tale of Two Cities*, *The Adventures of Sherlock Holmes*, *The Picture of Dorian Gray*, *The Time Machine*, *The Wonderful Wizard of Oz*, and selected public-domain essays.

- [ ] **Step 3: Add a current-context topic matrix**

Map the ten Days across technology/AI, climate/science, public policy, international cooperation, culture/entertainment, business/economy, education, sport, and China/global exchange so no single topic dominates.

- [ ] **Step 4: Commit the curation protocol**

Run:

```bash
git add sources.md
git commit -m "docs: add vocabulary source and attribution policy"
```

### Task 4: Complete deep data for Days 1–2

**Files:**
- Modify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/data/details.js`

- [ ] **Step 1: Add 40 complete records**

For each ID from `d01-*` and `d02-*`, add senses, 3–5 collocations, word family, distinctions, usage note, speech text, and exactly three bilingual examples. Prefer natural syntax over forcing exact literary quotations.

- [ ] **Step 2: Run scoped validation**

Run: `node tests/verify-details.mjs --days 1,2`

Expected: `PASS 40 deep entries; full corpus 40/200` while the default full run still fails.

- [ ] **Step 3: Manually scan for attribution markers**

Run:

```bash
rg -n "public-domain-quote|literary-adaptation|current-context" data/details.js
```

Expected: each of the 40 entries has one literary and one current-context marker; any exact quotation includes source metadata.

- [ ] **Step 4: Commit**

Run: `git add data/details.js && git commit -m "content: enrich vocabulary Days 1 and 2"`

### Task 5: Complete deep data for Days 3–4

**Files:**
- Modify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/data/details.js`

- [ ] **Step 1: Add the 40 Day 3–4 records using the approved schema**

Focus usage notes on abstract nouns, countability, prepositions, and academic reading collocations.

- [ ] **Step 2: Run scoped and cumulative validation**

Run: `node tests/verify-details.mjs --days 1,2,3,4`

Expected: `PASS 80 deep entries; full corpus 80/200`.

- [ ] **Step 3: Commit**

Run: `git add data/details.js && git commit -m "content: enrich vocabulary Days 3 and 4"`

### Task 6: Complete deep data for Days 5–6

**Files:**
- Modify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/data/details.js`

- [ ] **Step 1: Add the 40 Day 5–6 records**

Preserve and expand the existing contrast pairs. Each Day 6 usage note explicitly distinguishes its paired word and uses different examples for each member.

- [ ] **Step 2: Run scoped and cumulative validation**

Run: `node tests/verify-details.mjs --days 1,2,3,4,5,6`

Expected: `PASS 120 deep entries; full corpus 120/200`.

- [ ] **Step 3: Commit**

Run: `git add data/details.js && git commit -m "content: enrich vocabulary Days 5 and 6"`

### Task 7: Complete deep data for Days 7–8

**Files:**
- Modify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/data/details.js`

- [ ] **Step 1: Add the 40 Day 7–8 records**

Expose morphology in `wordFamily`, reuse derived forms deliberately, and cover balanced economic, social, scientific, and technology contexts.

- [ ] **Step 2: Run scoped and cumulative validation**

Run: `node tests/verify-details.mjs --days 1,2,3,4,5,6,7,8`

Expected: `PASS 160 deep entries; full corpus 160/200`.

- [ ] **Step 3: Commit**

Run: `git add data/details.js && git commit -m "content: enrich vocabulary Days 7 and 8"`

### Task 8: Complete deep data for Days 9–10

**Files:**
- Modify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/data/details.js`

- [ ] **Step 1: Add the final 40 records**

Day 10 senses must cover the reading traps requested in the original MVP. Add disambiguated `speechText` or sense-level speech forms for object, subject, conduct, present, and content.

- [ ] **Step 2: Run the full corpus gate**

Run: `node tests/verify-details.mjs`

Expected: `PASS 200/200 deep entries; 600/600 bilingual examples`.

- [ ] **Step 3: Run a duplicate and language-quality scan**

The validator rejects duplicate example text, missing Chinese translation, identical CET-4/literature/world sentences, and example sentences that omit the target word or an approved inflected form.

- [ ] **Step 4: Commit**

Run: `git add data/details.js && git commit -m "content: complete 200-word deep vocabulary corpus"`

### Task 9: Hydrate the corpus and render deep cards

**Files:**
- Modify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/index.html`
- Modify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/tests/verify-details.mjs`

- [ ] **Step 1: Add failing integration assertions**

```js
for (const marker of ['data/details.js','sense-deck','pos-pill','usage-panels','example-card','data-speak-text'])
  assert.ok(html.includes(marker), `${marker} missing`);
```

- [ ] **Step 2: Run and verify RED**

Run: `node tests/verify-details.mjs`

Expected: FAIL on missing deep-card integration markers.

- [ ] **Step 3: Load and hydrate details**

Add `<script src="./data/details.js"></script>` before the app script and merge details without changing IDs:

```js
const WORDS = RAW.flatMap(/* existing mapping */).map(word => ({
  ...word,
  ...(window.ATLAS_DETAILS?.[word.id] || {})
}));
```

If any details record is absent, show the compatible base card rather than crashing; the permanent validator still blocks release.

- [ ] **Step 4: Render the new sections**

Create pure helpers `renderSenseDeck(word)`, `renderUsagePanels(word)`, and `renderExamples(word)`. Use native `<details>` for accessible progressive disclosure and explicit part-of-speech pills in the card header.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `node tests/verify-details.mjs`

Expected: all corpus and integration assertions pass.

- [ ] **Step 6: Commit**

Run: `git add index.html tests/verify-details.mjs && git commit -m "feat: render deep bilingual word cards"`

### Task 10: Add the no-API voice preference system

**Files:**
- Modify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/index.html`
- Modify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/tests/verify-details.mjs`

- [ ] **Step 1: Add failing speech contract tests**

```js
for (const name of ['loadVoices','rankEnglishVoices','speakText','stopSpeech','speechSettings'])
  assert.ok(html.includes(name), `${name} missing`);
assert.ok(html.includes('voiceschanged'));
assert.ok(html.includes('data-speech-settings'));
assert.ok(html.includes('data-voice-preview'));
```

- [ ] **Step 2: Run and verify RED**

Run: `node tests/verify-details.mjs`

Expected: FAIL on missing speech functions and controls.

- [ ] **Step 3: Implement deterministic voice ranking**

Filter `lang` values beginning with `en`, prefer `localService`, then score preferred names (`Ava`, `Samantha`, `Daniel`, `Karen`, `Moira`, `Zoe`, `Serena`, `Natural`, `Premium`). Preserve the selected `voiceURI`; clamp rate to 0.7–1.15.

- [ ] **Step 4: Implement settings and reading actions**

Add a glass popover with voice select, rate slider, preview, and stop. Word buttons call slower speech; definition/example buttons use the selected sentence rate. Cancel the current utterance before starting another.

- [ ] **Step 5: Persist settings and handle unsupported browsers**

Merge `speechSettings` into the existing state schema. Disable speech controls and show a non-blocking explanation when `speechSynthesis` is absent.

- [ ] **Step 6: Run tests and verify GREEN**

Run: `node tests/verify-details.mjs`

Expected: speech contracts and all prior tests pass.

- [ ] **Step 7: Commit**

Run: `git add index.html tests/verify-details.mjs && git commit -m "feat: add configurable device speech"`

### Task 11: Document, verify, and publish-ready cleanup

**Files:**
- Create: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/README.md`
- Verify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/index.html`
- Verify: `/Users/indigo/Downloads/xanna/cet4-mythic-word-atlas/data/details.js`

- [ ] **Step 1: Write README usage and limitations**

Document local opening, GitHub Pages deployment, browser speech variability, synthesized-voice disclosure, current-context edition date, corpus attribution policy, and how to add future words.

- [ ] **Step 2: Run the full automated suite**

Run:

```bash
node tests/verify-details.mjs
node --check data/details.js
node --check <(perl -0777 -ne 'while(/<script>(.*?)<\/script>/sg){print $1,"\n"}' index.html)
```

Expected: zero failures, `200/200`, and `600/600`.

- [ ] **Step 3: Run browser QA**

Verify Home → Atlas → Day 1 → all deep sections → three example reads → voice settings → Day 6 contrast → Day 10 heteronym → practice → review → wordbook → progress. Test desktop and 390×844 mobile layouts, console output, refresh persistence, and speech-unavailable fallback.

- [ ] **Step 4: Review source integrity**

Audit every `public-domain-quote` for title/author/URL and downgrade anything not directly verified to `literary-adaptation`. Confirm current-context prose is original and neutral.

- [ ] **Step 5: Commit documentation and final verification state**

Run:

```bash
git add README.md sources.md tests/verify-details.mjs index.html data/details.js
git commit -m "docs: document deep vocabulary learning experience"
git status --short
```

Expected: clean working tree.

## Self-Review

- The plan covers all 200 words and all 600 required bilingual examples.
- Corpus creation is divided into five independently validated 40-word batches.
- Source labels distinguish quotation, adaptation, original CET-4 prose, and current context.
- Speech uses only the Web Speech API and local voices; no API secret or audio asset is required.
- Stable IDs preserve all existing local progress.
- The large content corpus lives outside `index.html` for maintainability while remaining static-host compatible.
