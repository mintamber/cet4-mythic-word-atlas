import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const html = fs.readFileSync(new URL('index.html', root), 'utf8');
const dataFile = new URL('data/details.js', root);
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(dataFile, 'utf8'), sandbox);
const details = sandbox.window.ATLAS_DETAILS;

assert.equal(Object.keys(details).length, 200, 'data/details.js must contain 200 records');
for (const [id, detail] of Object.entries(details)) {
  assert.ok(Array.isArray(detail.collocationNotes), `${id}: collocationNotes must be an array`);
  assert.equal(detail.collocationNotes.length, detail.collocations?.length, `${id}: one note per collocation`);
  for (const [index, note] of detail.collocationNotes.entries()) {
    assert.equal(typeof note?.en, 'string', `${id}: collocation note ${index} en must be a string`);
    assert.ok(note.en.trim(), `${id}: collocation note ${index} en must not be blank`);
    assert.equal(note.en, detail.collocations[index], `${id}: collocation note ${index} en must match its collocation`);
    assert.equal(typeof note?.cn, 'string', `${id}: collocation note ${index} cn must be a string`);
    assert.ok(note.cn.trim(), `${id}: collocation note ${index} cn must not be blank`);
  }
}

for (const marker of [
  'rate:.86', 'pitch:1.02', 'volume:1', 'data-speech-pitch', 'data-speech-volume',
  'Please install or enable an English system voice.', 'Samantha', 'Eddy',
  'collocation-constellation'
]) assert.ok(html.includes(marker), `${marker}: missing`);

for (const removedVoice of ['Google US English', 'Microsoft Aria', 'Microsoft Jenny']) {
  assert.ok(!html.includes(removedVoice), `${removedVoice}: broad voice allowlist marker must be removed`);
}
assert.ok(html.includes("const ELIGIBLE_VOICES=[{name:'samantha',lang:'en-US'},{name:'eddy',lang:'en-GB'}]"), 'canonical two-pair allowlist must be declared');
assert.ok(html.includes('ELIGIBLE_VOICES.findIndex'), 'voice ranking must use the canonical allowlist');
assert.ok(!html.includes('PREFERRED_VOICE_NAMES'), 'dead preferred-name marker must be removed');

assert.ok(!html.includes('data-speech-kind="word"'), 'word button must use the bare headword without hidden word-rate behavior');
assert.ok(!/<script\s+[^>]*src=/i.test(html), 'index.html must not depend on external scripts');

console.log('PASS TTS defaults, voice fallback, and bilingual collocation contracts');
