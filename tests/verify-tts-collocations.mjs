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
  assert.equal(detail.collocationNotes?.length, detail.collocations?.length, `${id}: one note per collocation`);
  assert.ok(detail.collocationNotes.every(note => note.en && note.cn), `${id}: every collocation note needs en/cn`);
}

for (const marker of [
  'rate:.86', 'pitch:1.02', 'volume:1', 'data-speech-pitch', 'data-speech-volume',
  'Please install or enable an English system voice.', 'Google US English', 'Microsoft Aria',
  'Microsoft Jenny', 'collocation-constellation'
]) assert.ok(html.includes(marker), `${marker}: missing`);

assert.ok(!html.includes('data-speech-kind="word"'), 'word buttons must speak their full learning payload');
assert.ok(!/<script\s+[^>]*src=/i.test(html), 'index.html must not depend on external scripts');

console.log('PASS TTS defaults, voice fallback, and bilingual collocation contracts');
