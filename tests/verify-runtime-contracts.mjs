import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const html = fs.readFileSync(new URL('index.html', root), 'utf8');
const detailsSource = fs.readFileSync(new URL('data/details.js', root), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
assert.equal(scripts.length, 2, 'standalone page must contain exactly two inline scripts');

function makeRuntime({ voices = [], savedState = {} } = {}) {
  let availableVoices = voices;
  const events = [];
  const handlers = {};
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
    addEventListener(type, handler) { handlers[type] = handler; },
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
    getVoices: () => availableVoices,
    cancel: () => events.push({ type: 'cancel' }),
    speak: utterance => events.push({ type: 'speak', utterance }),
    addEventListener(type, handler) { handlers[`speech:${type}`] = handler; }
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
  return {
    api: sandbox.__ATLAS_TEST__, events, handlers, toast, localStorage, view,
    setVoices(nextVoices) { availableVoices = nextVoices; }
  };
}

const samantha = { name: 'Samantha（增强）', lang: 'en-US', voiceURI: 'samantha-us', localService: true };
const eddy = { name: 'Eddy (UK)', lang: 'en-GB', voiceURI: 'eddy-gb', localService: true };
const samanthaWrongLocale = { name: 'Samantha French', lang: 'fr-FR', voiceURI: 'samantha-fr', localService: true };
const eddyWrongLocale = { name: 'Eddy (US)', lang: 'en-US', voiceURI: 'eddy-us', localService: true };
const samanthaUnderscore = { name: 'SAMANTHA (underscore)', lang: 'en_US', voiceURI: 'samantha-underscore', localService: true };
const samanthaWrongCase = { name: 'samantha (case)', lang: 'en-us', voiceURI: 'samantha-case', localService: true };
const eddyUnderscore = { name: 'EDDY (underscore)', lang: 'en_GB', voiceURI: 'eddy-underscore', localService: true };
const eddyWrongCase = { name: 'eddy (case)', lang: 'en-gb', voiceURI: 'eddy-case', localService: true };
const extraEnglish = { name: 'Google US English', lang: 'en-US', voiceURI: 'google-us', localService: false };
const runtime = makeRuntime({
  voices: [eddyWrongLocale, extraEnglish, eddy, samanthaWrongLocale, samantha],
  savedState: { speechSettings: { voiceURI: 'google-us', rate: .91, pitch: 1.08, volume: 0 } }
});

assert.equal(runtime.events.filter(event => event.type === 'speak').length, 0, 'initialization must never autoplay');

runtime.api.getUI().speechOpen = true;
runtime.handlers.click({ target: { closest: () => ({ dataset: {}, hasAttribute: name => name === 'data-close-speech-settings' }) } });
assert.equal(runtime.api.getUI().speechOpen, false, 'close control must dismiss speech settings');
runtime.api.getUI().speechOpen = true;
runtime.handlers.keydown({ key: 'Escape', target: { matches: () => false } });
assert.equal(runtime.api.getUI().speechOpen, false, 'Escape must dismiss speech settings');
assert.deepEqual(
  Array.from(runtime.api.rankEnglishVoices([
    eddyWrongLocale, extraEnglish, eddyUnderscore, samanthaUnderscore,
    eddyWrongCase, samanthaWrongCase, eddy, samanthaWrongLocale, samantha
  ]), voice => voice.voiceURI),
  ['samantha-us', 'eddy-gb'],
  'eligible voices must use exact case-sensitive en-US/en-GB locales, with localized name suffixes allowed'
);
assert.equal(JSON.parse(runtime.localStorage.value).speechSettings.voiceURI, 'samantha-us', 'the replacement voice URI must be saved');

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
assert.equal(spoken.voice, samantha, 'utterance must use the selected voice explicitly');
assert.equal(spoken.lang, 'en-US');
assert.equal(spoken.rate, .91);
assert.equal(spoken.pitch, 1.08);
assert.equal(spoken.volume, 0);

const samanthaOnlyRuntime = makeRuntime({ voices: [samantha] });
samanthaOnlyRuntime.api.speakText('Samantha only');
assert.equal(samanthaOnlyRuntime.events.at(-1).utterance.voice, samantha, 'Samantha en-US must work when it is the only eligible voice');

const eddyOnlyRuntime = makeRuntime({ voices: [eddy] });
eddyOnlyRuntime.api.speakText('Eddy only');
assert.equal(eddyOnlyRuntime.events.at(-1).utterance.voice, eddy, 'Eddy en-GB must work when it is the only eligible voice');

const savedEddyRuntime = makeRuntime({
  voices: [samantha, eddy],
  savedState: { speechSettings: { voiceURI: 'eddy-gb' } }
});
savedEddyRuntime.api.speakText('saved Eddy');
assert.equal(savedEddyRuntime.events.at(-1).utterance.voice, eddy, 'a valid saved Eddy URI must remain selected');
assert.equal(JSON.parse(savedEddyRuntime.localStorage.value).speechSettings.voiceURI, 'eddy-gb');

const ineligibleRuntime = makeRuntime({
  voices: [extraEnglish, samanthaUnderscore, samanthaWrongCase, eddyUnderscore, eddyWrongCase]
});
assert.equal(ineligibleRuntime.events.length, 0, 'ineligible voices must not trigger speech during initialization');
ineligibleRuntime.api.speakText('unavailable');
assert.equal(ineligibleRuntime.events.length, 0, 'ineligible voices must not call cancel or speak');
assert.equal(ineligibleRuntime.toast.textContent, 'Please install or enable an English system voice.');
ineligibleRuntime.api.getUI().view = 'learn';
ineligibleRuntime.handlers.click({ target: { closest: () => ({ dataset: {}, hasAttribute: name => name === 'data-speech-settings' }) } });
assert.match(ineligibleRuntime.view.innerHTML, /data-voice-select disabled/);
assert.ok(ineligibleRuntime.view.innerHTML.includes('Please install or enable an English system voice.'));
for (const voice of [extraEnglish, samanthaUnderscore, samanthaWrongCase, eddyUnderscore, eddyWrongCase]) {
  assert.ok(!ineligibleRuntime.view.innerHTML.includes(voice.voiceURI), `${voice.voiceURI}: ineligible voice must not appear in selector`);
}

const asyncRuntime = makeRuntime({
  voices: [],
  savedState: { speechSettings: { voiceURI: 'removed-voice' } }
});
assert.equal(asyncRuntime.events.length, 0, 'an initially empty voice list must not autoplay');
assert.equal(typeof asyncRuntime.handlers['speech:voiceschanged'], 'function', 'voiceschanged listener must be registered');
asyncRuntime.api.getUI().view = 'learn';
asyncRuntime.handlers.click({ target: { closest: () => ({ dataset: {}, hasAttribute: name => name === 'data-speech-settings' }) } });
assert.match(asyncRuntime.view.innerHTML, /data-voice-select disabled/, 'empty initial list must render the disabled selector');
asyncRuntime.setVoices([eddy, extraEnglish, samantha]);
asyncRuntime.handlers['speech:voiceschanged']();
assert.equal(asyncRuntime.events.length, 0, 'loading voices asynchronously must not autoplay');
assert.equal(JSON.parse(asyncRuntime.localStorage.value).speechSettings.voiceURI, 'samantha-us', 'async loading must select and save the top eligible voice');
assert.ok(!asyncRuntime.view.innerHTML.includes('data-voice-select disabled'), 'voiceschanged must rerender the enabled selector');
assert.ok(asyncRuntime.view.innerHTML.indexOf('samantha-us') < asyncRuntime.view.innerHTML.indexOf('eddy-gb'), 'rerendered selector must order Samantha before Eddy GB');
assert.ok(!asyncRuntime.view.innerHTML.includes('google-us'), 'rerendered selector must omit ineligible voices');

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
