import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const marker of [
  'data/details.js','sense-deck','pos-pill','usage-panels','example-card','data-speak-text',
  'loadVoices','rankEnglishVoices','speakText','stopSpeech','speechSettings','voiceschanged',
  'data-speech-settings','data-voice-preview','data-voice-select','data-speech-rate',
  'rate:.86','pitch:1.02','volume:1','data-speech-pitch','data-speech-volume',
  'Please install or enable an English system voice.','Google US English','Microsoft Aria',
  'Microsoft Jenny','collocation-constellation'
]) assert.ok(html.includes(marker), `${marker}: missing`);
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|OPENAI_API_KEY|api\.openai\.com/.test(html), 'runtime API or secret detected');
assert.ok(!html.includes('data-speech-kind="word"'), 'word button must use the bare headword without hidden word-rate behavior');
assert.ok(!/<script\s+[^>]*src=/i.test(html), 'index.html must not depend on external scripts');
assert.ok(html.includes('window.ATLAS_DETAILS = {'), 'deep corpus must be inlined for single-file use');
console.log('PASS deep-card and no-API speech UI contracts');
