import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const html = fs.readFileSync(new URL('index.html', root), 'utf8');
const detailsSource = fs.readFileSync(new URL('data/details.js', root), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
assert.equal(scripts.length, 2, 'standalone page must contain exactly two inline scripts');

function makeRuntime({ voices = [], savedState = {} } = {}) {
  const events = [];
  const toast = { textContent: '', classList: { add() {}, remove() {} } };
  const view = { innerHTML: '' };
  const document = {
    body: { className: '', append() {} },
    querySelector(selector) {
      if (selector === '#view') return view;
      if (selector === '#starfield') return { getContext: () => null };
      if (selector === '#toast') return toast;
      return null;
    },
    querySelectorAll() { return []; },
    addEventListener() {},
    createElement() { return { className: '', innerHTML: '', remove() {} }; }
  };
  const localStorage = {
    value: JSON.stringify(savedState),
    getItem() { return this.value; },
    setItem(_key, value) { this.value = value; }
  };
  class Utterance {
    constructor(text) { this.text = text; }
  }
  const speechSynthesis = {
    getVoices: () => voices,
    cancel: () => events.push({ type: 'cancel' }),
    speak: utterance => events.push({ type: 'speak', utterance }),
    addEventListener() {}
  };
  const sandbox = {
    window: null,
    document,
    localStorage,
    speechSynthesis,
    SpeechSynthesisUtterance: Utterance,
    console,
    Date,
    Math,
    Set,
    Map,
    URL,
    encodeURIComponent,
    decodeURIComponent,
    setTimeout: () => 1,
    clearTimeout() {},
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    addEventListener() {},
    scrollTo() {},
    matchMedia: () => ({ matches: true }),
    innerWidth: 1280,
    innerHeight: 720,
    devicePixelRatio: 1,
    performance: { now: () => 0 }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(detailsSource, sandbox, { filename: 'details.js' });
  vm.runInContext(scripts[1], sandbox, { filename: 'atlas-app.js' });
  return { api: sandbox.__ATLAS_TEST__, events, toast, localStorage };
}

const preferred = { name: 'Google US English', lang: 'en-US', voiceURI: 'google-us', localService: false };
const generic = { name: 'Enhanced English Voice', lang: 'en-US', voiceURI: 'enhanced-us', localService: true };
const british = { name: 'Plain British', lang: 'en-GB', voiceURI: 'plain-gb', localService: true };
const nonEnglish = { name: 'Samantha French', lang: 'fr-FR', voiceURI: 'fr', localService: true };
const runtime = makeRuntime({
  voices: [generic, nonEnglish, british, preferred],
  savedState: { speechSettings: { voiceURI: 'google-us', rate: .91, pitch: 1.08, volume: 0 } }
});

assert.equal(runtime.events.filter(event => event.type === 'speak').length, 0, 'initialization must never autoplay');
assert.deepEqual(
  Array.from(runtime.api.rankEnglishVoices([generic, nonEnglish, british, preferred]), voice => voice.voiceURI),
  ['google-us', 'enhanced-us', 'plain-gb'],
  'ranking must filter non-English voices and honor named, locale, and quality priorities'
);

const clamped = runtime.api.sanitizeState({ speechSettings: { voiceURI: 42, rate: 9, pitch: .1, volume: 0 } });
assert.equal(clamped.speechSettings.voiceURI, '42');
assert.equal(clamped.speechSettings.rate, 1.15, 'migrated rate must clamp high');
assert.equal(clamped.speechSettings.pitch, .8, 'migrated pitch must clamp low');
assert.equal(clamped.speechSettings.volume, 0, 'zero volume must survive migration');
const defaults = runtime.api.sanitizeState({ speechSettings: { rate: '', pitch: undefined, volume: 'not-a-number' } });
assert.deepEqual(JSON.parse(JSON.stringify(defaults.speechSettings)), { voiceURI: '', rate: .86, pitch: 1.02, volume: 1 });

runtime.api.speakText('available');
assert.deepEqual(runtime.events.map(event => event.type), ['cancel', 'speak'], 'speech must cancel before speaking');
const spoken = runtime.events[1].utterance;
assert.equal(spoken.text, 'available');
assert.equal(spoken.voice, preferred, 'utterance must use the selected voice explicitly');
assert.equal(spoken.lang, 'en-US');
assert.equal(spoken.rate, .91);
assert.equal(spoken.pitch, 1.08);
assert.equal(spoken.volume, 0);

const silentRuntime = makeRuntime({ voices: [] });
assert.equal(silentRuntime.events.length, 0, 'missing voices must not trigger speech during initialization');
silentRuntime.api.speakText('available');
assert.equal(silentRuntime.events.length, 0, 'missing voices must not call cancel or speak');
assert.equal(silentRuntime.toast.textContent, 'Please install or enable an English system voice.');

assert.equal(typeof runtime.api.renderCollocationConstellation, 'function', 'collocation renderer must be testable');
assert.equal(typeof runtime.api.renderUsagePanels, 'function', 'usage renderer must be testable');
const escaped = runtime.api.renderCollocationConstellation({ collocationNotes: [{ en: '<b>&', cn: '中文<script>' }] });
assert.ok(escaped.includes('&lt;b&gt;&amp;'));
assert.ok(escaped.includes('中文&lt;script&gt;'));
assert.ok(!escaped.includes('<b>&'));
const legacy = runtime.api.renderCollocationConstellation({ collocations: ['legacy phrase'] });
assert.ok(legacy.includes('<strong>legacy phrase</strong>'));
assert.ok(legacy.includes('<span>常用搭配</span>'));
const usage = runtime.api.renderUsagePanels({ collocations: ['duplicate'], wordFamily: [], synonyms: [], antonyms: [], usageNote: 'safe' });
assert.ok(!usage.includes('Collocations · 常用搭配'), 'usage panels must not duplicate the constellation');

const mergedBox = { window: {} };
vm.createContext(mergedBox);
vm.runInContext(detailsSource, mergedBox);
const fragmentNames = ['day01-02', 'day03-04', 'day05-06', 'day07-08', 'day09-10'];
const fragments = Object.assign({}, ...fragmentNames.map(name => JSON.parse(fs.readFileSync(new URL(`data/fragments/${name}.json`, root), 'utf8'))));
assert.equal(JSON.stringify(mergedBox.window.ATLAS_DETAILS), JSON.stringify(fragments), 'fragments and data/details.js must match exactly');
const inlineBox = { window: {} };
vm.createContext(inlineBox);
vm.runInContext(scripts[0], inlineBox);
assert.equal(JSON.stringify(inlineBox.window.ATLAS_DETAILS), JSON.stringify(fragments), 'inline corpus and fragments must match exactly');

assert.match(html, /\.word-top>div:first-child\{[^}]*min-width:0/, 'headword text area must be allowed to shrink');
assert.match(html, /\.word\{[^}]*overflow-wrap:anywhere/, 'long headwords must wrap safely');
assert.match(html, /@media\(max-width:420px\)\{[^}]*\.word-top\{[^}]*flex-direction:column/s, 'narrow screens must stack the headword and controls');
assert.match(html, /@media\(max-width:420px\)[\s\S]*?\.word-tools\{[^}]*flex-direction:row[^}]*flex-wrap:wrap/, 'narrow controls must remain horizontal and wrap safely');
console.log('PASS runtime TTS, exact corpus parity, escaped renderers, and mobile source contracts');
