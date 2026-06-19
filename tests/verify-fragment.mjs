import fs from 'node:fs';
import assert from 'node:assert/strict';

const [file, daysArg] = process.argv.slice(2);
assert.ok(file && daysArg, 'usage: node tests/verify-fragment.mjs <fragment.json> <days-comma-list>');
const days = new Set(daysArg.split(',').map(Number));
const details = JSON.parse(fs.readFileSync(file, 'utf8'));
const expected = days.size * 20;
assert.equal(Object.keys(details).length, expected, `${file}: expected ${expected} records`);
const requiredTypes = new Set(['cet4', 'literature', 'world']);
const allExampleTexts = new Set();

for (const [id, detail] of Object.entries(details)) {
  const match = id.match(/^d(\d{2})-/);
  assert.ok(match && days.has(Number(match[1])), `${id}: outside assigned days`);
  assert.ok(Array.isArray(detail.senses) && detail.senses.length >= 1, `${id}: senses`);
  assert.ok(detail.senses.every(s => s.pos && s.phonetic && s.meaningCN && s.meaningEN), `${id}: incomplete sense`);
  assert.ok(Array.isArray(detail.collocations) && detail.collocations.length >= 2, `${id}: collocations`);
  for (const key of ['wordFamily','synonyms','antonyms']) assert.ok(Array.isArray(detail[key]), `${id}: ${key}`);
  assert.ok(detail.usageNote && detail.speechText, `${id}: usageNote/speechText`);
  assert.equal(detail.examples?.length, 3, `${id}: exactly three examples`);
  assert.deepEqual(new Set(detail.examples.map(e => e.type)), requiredTypes, `${id}: example categories`);
  for (const example of detail.examples) {
    assert.ok(example.label && example.text && example.translationCN && example.attributionType && example.speakText, `${id}: incomplete ${example.type} example`);
    assert.ok(!allExampleTexts.has(example.text), `${id}: duplicate example text`);
    allExampleTexts.add(example.text);
    if (example.type === 'cet4') assert.equal(example.attributionType, 'original', `${id}: CET-4 attribution`);
    if (example.type === 'literature') assert.ok(['literary-adaptation','public-domain-quote'].includes(example.attributionType), `${id}: literature attribution`);
    if (example.type === 'world') assert.equal(example.attributionType, 'current-context', `${id}: world attribution`);
    if (example.attributionType === 'public-domain-quote') assert.ok(example.sourceTitle && example.sourceAuthor && example.sourceUrl, `${id}: quote source metadata`);
  }
}

console.log(`PASS ${file}: ${expected} deep entries / ${expected * 3} examples`);
