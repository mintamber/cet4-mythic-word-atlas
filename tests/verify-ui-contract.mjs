import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const marker of [
  'data/details.js','sense-deck','pos-pill','usage-panels','example-card','data-speak-text',
  'loadVoices','rankEnglishVoices','speakText','stopSpeech','speechSettings','voiceschanged',
  'data-speech-settings','data-voice-preview','data-voice-select','data-speech-rate',
  'data-close-speech-settings','aria-label="关闭朗读设置"','speech-popover-head',
  'rate:.86','pitch:1.02','volume:1','data-speech-pitch','data-speech-volume',
  'Please install or enable an English system voice.','collocation-constellation'
]) assert.ok(html.includes(marker), `${marker}: missing`);
for (const removedVoice of ['Google US English','Microsoft Aria','Microsoft Jenny']) {
  assert.ok(!html.includes(removedVoice), `${removedVoice}: broad voice allowlist marker must be removed`);
}
assert.ok(html.includes("const ELIGIBLE_VOICES=[{name:'samantha',lang:'en-US'},{name:'eddy',lang:'en-GB'}]"), 'canonical two-pair allowlist must be declared');
assert.ok(html.includes('ELIGIBLE_VOICES.findIndex'), 'voice ranking must use the canonical allowlist');
assert.ok(!html.includes('PREFERRED_VOICE_NAMES'), 'dead preferred-name marker must be removed');
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|OPENAI_API_KEY|api\.openai\.com/.test(html), 'runtime API or secret detected');
assert.ok(!html.includes('data-speech-kind="word"'), 'word button must use the bare headword without hidden word-rate behavior');
assert.match(html, /hasAttribute\('data-close-speech-settings'\)[\s\S]*?ui\.speechOpen=false;render\(\)/, 'close button must dismiss and rerender speech settings');
assert.match(html, /e\.key==='Escape'&&ui\.speechOpen[\s\S]*?ui\.speechOpen=false;render\(\)/, 'Escape must dismiss and rerender speech settings');
assert.match(html, /@media\(max-width:420px\)[\s\S]*?\.speech-popover\{[^}]*position:relative[^}]*top:auto/, 'narrow speech settings must return to document flow');
assert.ok(!/<script\s+[^>]*src=/i.test(html), 'index.html must not depend on external scripts');
assert.ok(html.includes('window.ATLAS_DETAILS = {'), 'deep corpus must be inlined for single-file use');
console.log('PASS deep-card and no-API speech UI contracts');
