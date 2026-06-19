# TTS and Collocation Card Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make device-native English speech deterministic and configurable, while adding concise bilingual collocation guidance beneath all 200 headwords.

**Architecture:** Keep the shipping artifact as one standalone `index.html`. Implement voice ranking as pure JavaScript helpers around Web Speech API, persist sanitized settings in the existing state record, and keep collocation glosses in the editable corpus fragments before regenerating `data/details.js` and the inlined mirror in `index.html`.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Web Speech API, localStorage, Node.js contract tests.

---

## File map

- Modify `index.html`: TTS defaults/ranking/playback/settings UI, collocation constellation, styling, and regenerated inline corpus.
- Modify `data/fragments/day01-02.json` through `data/fragments/day09-10.json`: add bilingual `collocationNotes` to all 200 records.
- Regenerate `data/details.js`: editable mirror of the merged fragments.
- Create `tests/verify-tts-collocations.mjs`: behavioral and corpus contract tests.
- Modify `tests/verify-ui-contract.mjs`: add new UI markers and standalone constraints.
- Modify `README.md`: document voice installation fallback and the four saved controls.

### Task 1: Define failing TTS and collocation contracts

**Files:**
- Create: `tests/verify-tts-collocations.mjs`
- Modify: `tests/verify-ui-contract.mjs`

- [ ] **Step 1: Write the failing test**

Create a Node test that loads `index.html` and `data/details.js`, then asserts:

```js
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const html = fs.readFileSync(new URL('index.html', root), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL('data/details.js', root), 'utf8'), sandbox);
const details = sandbox.window.ATLAS_DETAILS;

assert.equal(Object.keys(details).length, 200);
for (const [id, detail] of Object.entries(details)) {
  assert.equal(detail.collocationNotes?.length, detail.collocations.length, `${id}: collocationNotes`);
  assert.ok(detail.collocationNotes.every(note => note.en && note.cn), `${id}: bilingual notes`);
}

for (const marker of [
  "rate:.86", "pitch:1.02", "volume:1", "data-speech-pitch", "data-speech-volume",
  "Please install or enable an English system voice.", "Google US English",
  "Microsoft Aria", "Microsoft Jenny", "collocation-constellation"
]) assert.ok(html.includes(marker), `${marker}: missing`);

assert.ok(!html.includes('data-speech-kind="word"'), 'word speech must not apply a hidden rate multiplier');
assert.ok(!/<script\s+[^>]*src=/i.test(html), 'standalone index required');
console.log('PASS TTS settings and 200 bilingual collocation contracts');
```

Add `data-speech-pitch`, `data-speech-volume`, `collocation-constellation`, and the exact fallback message to the marker list in `tests/verify-ui-contract.mjs`.

- [ ] **Step 2: Run the tests to verify RED**

Run:

```bash
node tests/verify-tts-collocations.mjs
node tests/verify-ui-contract.mjs
```

Expected: FAIL because `collocationNotes`, Pitch, Volume, new defaults, and fallback copy do not yet exist.

- [ ] **Step 3: Commit the failing contracts**

```bash
git add tests/verify-tts-collocations.mjs tests/verify-ui-contract.mjs
git commit -m "test: define TTS and collocation contracts"
```

### Task 2: Implement deterministic device voice selection and saved controls

**Files:**
- Modify: `index.html` around `defaultState`, `sanitizeState`, `rankEnglishVoices`, `loadVoices`, `speakText`, `renderSpeechSettings`, and input/change handlers.
- Test: `tests/verify-tts-collocations.mjs`

- [ ] **Step 1: Replace speech defaults and sanitize migrated state**

Use this shape and numeric policy:

```js
speechSettings:{voiceURI:'',rate:.86,pitch:1.02,volume:1}

const finite=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;
const speechSettings={
  voiceURI:String(raw.speechSettings?.voiceURI||''),
  rate:Math.max(.7,Math.min(1.15,finite(raw.speechSettings?.rate,.86))),
  pitch:Math.max(.8,Math.min(1.2,finite(raw.speechSettings?.pitch,1.02))),
  volume:Math.max(0,Math.min(1,finite(raw.speechSettings?.volume,1)))
};
```

- [ ] **Step 2: Implement explicit voice scoring and selection**

Use pure helpers with named voice priority before locale and quality signals:

```js
const PREFERRED_VOICE_NAMES=[
  'Samantha','Ava','Susan','Daniel','Karen','Serena',
  'Google US English','Microsoft Aria','Microsoft Jenny'
];
function voiceScore(voice){
  const name=(voice.name||'').toLowerCase();
  const lang=(voice.lang||'').toLowerCase();
  const named=PREFERRED_VOICE_NAMES.findIndex(item=>name.includes(item.toLowerCase()));
  return (named>=0?1000-named*25:0)
    +(lang==='en-us'?180:lang==='en-gb'?160:/^en[-_]/.test(lang)?80:-1000)
    +(voice.localService?35:0)
    +(/natural|premium|enhanced/.test(name)?30:0);
}
function rankEnglishVoices(voices){
  return voices.filter(v=>/^en([-_]|$)/i.test(v.lang||''))
    .sort((a,b)=>voiceScore(b)-voiceScore(a)||(a.name||'').localeCompare(b.name||''));
}
```

`loadVoices()` must call `speechSynthesis.getVoices()`, restore the saved URI only when present in the ranked list, otherwise choose and save `speechVoices[0]`. It must not use a non-English or implicit browser default.

- [ ] **Step 3: Make playback explicit and non-queued**

Update `speakText` so it returns early with the exact fallback message when no ranked voice exists, always cancels before speaking, and applies settings without a word-only rate multiplier:

```js
function speakText(text,{button=null}={}){
  if(!('speechSynthesis' in window)){showToast(NO_ENGLISH_VOICE);return}
  if(!speechVoices.length)loadVoices();
  const voice=selectedVoice();
  if(!voice){showToast(NO_ENGLISH_VOICE);return}
  stopSpeech();
  const utterance=new SpeechSynthesisUtterance(String(text||''));
  utterance.voice=voice;
  utterance.lang=voice.lang;
  utterance.rate=state.speechSettings.rate;
  utterance.pitch=state.speechSettings.pitch;
  utterance.volume=state.speechSettings.volume;
  if(button){
    button.classList.add('speak-active');
    utterance.onend=utterance.onerror=()=>button.classList.remove('speak-active');
  }
  speechSynthesis.speak(utterance);
}
```

The headword button payload must be `w.word`, not `w.speechText`; example payloads remain `e.speakText || e.text`. No navigation or render function may call `speakText`.

- [ ] **Step 4: Add Voice, Rate, Pitch, and Volume controls**

Render only ranked English voices in the selector. Add ranges:

```html
<input type="range" min="0.70" max="1.15" step="0.01" data-speech-rate>
<input type="range" min="0.80" max="1.20" step="0.01" data-speech-pitch>
<input type="range" min="0" max="1" step="0.05" data-speech-volume>
```

When the voice list is empty, render `Please install or enable an English system voice.` and disable Preview. Extend the input handler to update the matching numeric property, save state immediately, and refresh its visible value. Keep voice selection and Preview user-triggered.

- [ ] **Step 5: Run the focused test**

```bash
node tests/verify-tts-collocations.mjs
node tests/verify-ui-contract.mjs
```

Expected: TTS markers pass; corpus assertions still fail until Task 3.

- [ ] **Step 6: Commit TTS implementation**

```bash
git add index.html tests/verify-ui-contract.mjs
git commit -m "feat: improve device-native TTS controls"
```

### Task 3: Author and render 200 bilingual collocation constellations

**Files:**
- Modify: `data/fragments/day01-02.json`
- Modify: `data/fragments/day03-04.json`
- Modify: `data/fragments/day05-06.json`
- Modify: `data/fragments/day07-08.json`
- Modify: `data/fragments/day09-10.json`
- Regenerate: `data/details.js`
- Modify: `index.html`
- Test: `tests/verify-tts-collocations.mjs`

- [ ] **Step 1: Add aligned bilingual notes to every record**

For each existing `collocations` item, add one aligned object in `collocationNotes`. Preserve the English phrase exactly and write a concise contextual Chinese gloss:

```json
"collocations": ["readily available", "available resources"],
"collocationNotes": [
  {"en": "readily available", "cn": "随时可获得的"},
  {"en": "available resources", "cn": "可利用的资源"}
]
```

Requirements: all 200 records covered; two or three notes per word; no blank gloss; English values match `collocations` by index; Day 6 pairs use glosses that reinforce the distinction.

- [ ] **Step 2: Regenerate the editable merged mirror**

```bash
node - <<'NODE'
const fs=require('fs');
const names=['day01-02','day03-04','day05-06','day07-08','day09-10'];
const merged=Object.assign({},...names.map(n=>JSON.parse(fs.readFileSync(`data/fragments/${n}.json`,'utf8'))));
fs.writeFileSync('data/details.js',`window.ATLAS_DETAILS = ${JSON.stringify(merged,null,2)};\n`);
NODE
```

- [ ] **Step 3: Render the headword constellation and remove duplicate panel**

Add a focused renderer:

```js
function renderCollocationConstellation(w){
  const notes=w.collocationNotes?.length?w.collocationNotes:
    (w.collocations||[]).map(en=>({en,cn:'常用搭配'}));
  return `<section class="collocation-constellation">
    <div class="eyebrow">Collocation constellation · 搭配星图</div>
    <div class="collocation-notes">${notes.map(note=>`
      <div class="collocation-note"><strong>${escapeHTML(note.en)}</strong>
      <span>${escapeHTML(note.cn)}</span></div>`).join('')}</div>
  </section>`;
}
```

Call it directly beneath phonetic/POS information in `renderLearn`. Remove `['Collocations · 常用搭配', w.collocations]` from `renderUsagePanels`. Add responsive CSS for `.collocation-constellation`, `.collocation-notes`, and `.collocation-note` using the existing gold/ice palette.

- [ ] **Step 4: Re-inline the regenerated corpus**

Replace only the first inline `window.ATLAS_DETAILS = {...};` block with the current contents of `data/details.js`, retaining the `Editable source mirror` comment and leaving the application script unchanged.

- [ ] **Step 5: Run focused and corpus tests**

```bash
node tests/verify-tts-collocations.mjs
node tests/verify-details.mjs
node tests/verify-ui-contract.mjs
```

Expected: all pass, reporting 200 bilingual collocation records and 600 bilingual examples.

- [ ] **Step 6: Commit collocation content and UI**

```bash
git add index.html data/details.js data/fragments tests/verify-tts-collocations.mjs
git commit -m "feat: add bilingual collocation constellations"
```

### Task 4: Documentation, browser verification, and final regression

**Files:**
- Modify: `README.md`
- Verify: `index.html`, `tests/*.mjs`

- [ ] **Step 1: Document the local voice behavior**

Explain that the app selects an installed English voice explicitly, saves Voice/Rate/Pitch/Volume locally, never auto-plays, and shows the installation prompt when no eligible voice exists.

- [ ] **Step 2: Run the complete automated suite**

```bash
node tests/verify-fragment.mjs data/fragments/day01-02.json 1,2
node tests/verify-fragment.mjs data/fragments/day03-04.json 3,4
node tests/verify-fragment.mjs data/fragments/day05-06.json 5,6
node tests/verify-fragment.mjs data/fragments/day07-08.json 7,8
node tests/verify-fragment.mjs data/fragments/day09-10.json 9,10
node tests/verify-details.mjs
node tests/verify-ui-contract.mjs
node tests/verify-tts-collocations.mjs
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 3: Verify the final file in a browser**

Open `index.html`, enter a learning card, and verify:

- selected voice belongs to the ranked English list;
- word button reads only the bare headword;
- each of three example buttons reads only its own sentence;
- Rate, Pitch, Volume, and Voice survive reload;
- no speech begins without a click;
- collocation constellation appears under the headword and the old duplicate panel is absent;
- 390 × 844 layout has no horizontal overflow;
- console contains no warnings or errors.

- [ ] **Step 4: Commit documentation**

```bash
git add README.md
git commit -m "docs: explain voice and collocation settings"
```
