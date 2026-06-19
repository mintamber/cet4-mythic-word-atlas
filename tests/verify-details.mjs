import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const html = fs.readFileSync(new URL('index.html', root), 'utf8');
const dataFile = new URL('data/details.js', root);
assert.ok(fs.existsSync(dataFile), 'data/details.js must exist');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(dataFile, 'utf8'), sandbox);
const details = sandbox.window.ATLAS_DETAILS;
assert.ok(details && typeof details === 'object');
assert.equal(Object.keys(details).length, 200, 'full corpus must contain 200 records');

const requiredTypes = new Set(['cet4', 'literature', 'world']);
const texts = new Set();
for (const [id, detail] of Object.entries(details)) {
  assert.ok(/^d\d{2}-/.test(id), `${id}: invalid ID`);
  assert.ok(detail.senses?.length >= 1 && detail.senses.every(s => s.pos && s.phonetic && s.meaningCN && s.meaningEN), `${id}: senses`);
  assert.ok(detail.collocations?.length >= 2, `${id}: collocations`);
  assert.ok(detail.usageNote && detail.speechText, `${id}: guidance`);
  assert.equal(detail.examples?.length, 3, `${id}: examples`);
  assert.deepEqual(new Set(detail.examples.map(e => e.type)), requiredTypes, `${id}: categories`);
  for (const e of detail.examples) {
    assert.ok(e.text && e.translationCN && e.speakText && e.attributionType, `${id}: example fields`);
    assert.ok(!texts.has(e.text), `${id}: duplicate example`);
    texts.add(e.text);
    if (e.attributionType === 'public-domain-quote') assert.ok(e.sourceTitle && e.sourceAuthor && e.sourceUrl, `${id}: quote metadata`);
  }
}

for (const id of ['d10-object','d10-subject','d10-conduct','d10-present','d10-content']) {
  assert.ok(details[id]?.senses?.length >= 2, `${id}: heteronym senses`);
}

for (const marker of ['data/details.js','sense-deck','pos-pill','usage-panels','example-card','data-speak-text','loadVoices','rankEnglishVoices','speakText','stopSpeech','speechSettings','voiceschanged','data-speech-settings','data-voice-preview']) {
  assert.ok(html.includes(marker), `${marker}: integration marker missing`);
}
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|OPENAI_API_KEY|api\.openai\.com/.test(html + fs.readFileSync(dataFile,'utf8')), 'runtime API or secret detected');

console.log('PASS 200/200 deep entries; 600/600 bilingual examples; UI and speech contracts present');
