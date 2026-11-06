// Run with: node tests/gemini.test.js (no API key or network required)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const section = (start, end) => {
  const a = html.indexOf(start), b = html.indexOf(end, a);
  assert(a >= 0 && b > a, `Cannot find ${start}`);
  return html.slice(a, b);
};
const source = [
  section('const KEY_PREFIXES =', '/** Модели, которые заведомо'),
  section('function modelIsUsable(name)', '/** Список моделей у OpenAI.'),
  section('async function listGeminiModels(key, signal)', '/** Выбрать лучшую модель'),
  section('async function probeGeminiModel(key, preferred, list)', '/** Запрос к OpenAI.'),
  section('const GEMINI_FALLBACKS =', '/* Приведение ответа модели'),
].join('\n');
const response = (status, body) => ({
  status, ok: status >= 200 && status < 300,
  text: async () => JSON.stringify(body), json: async () => body,
});
const ok = () => response(200, {candidates: [{content: {parts: [{text: '{"title":"ok"}'}]}}]});
function sandbox(fetch) {
  const state = {selected: null};
  const context = vm.createContext({
    fetch, console, encodeURIComponent, Set,
    setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms, 5)), clearTimeout,
    t: (key) => key,
    setAiModel: (model) => { state.selected = model; },
    aiLog: () => {},
  });
  vm.runInContext(source, context);
  return {context, state};
}
function modelFrom(url) { return decodeURIComponent(url).match(/models\/([^:]+):generateContent/)[1]; }

(async () => {
  {
    const {context} = sandbox(async () => ok());
    assert.equal(context.providerFromKey('AIzaShort'), 'gemini');
    assert.equal(context.providerFromKey('AQ.custom'), 'gemini');
    assert.equal(context.providerFromKey('custom-format'), null);
  }
  {
    const calls = [];
    const {context, state} = sandbox(async url => {
      const model = modelFrom(url); calls.push(model);
      return model === 'gemini-2.5-flash-lite'
        ? response(404, {error: {message: 'This model models/gemini-2.5-flash-lite is no longer available to new users.'}}) : ok();
    });
    assert.equal(await context.callGemini({apiKey: 'test', model: 'gemini-2.5-flash-lite'}, 'prompt'), '{"title":"ok"}');
    assert.deepEqual(calls, ['gemini-2.5-flash-lite', 'gemini-2.5-flash']);
    assert.equal(state.selected, 'gemini-2.5-flash');
  }
  {
    const calls = [];
    const {context} = sandbox(async url => {
      const model = modelFrom(url); calls.push(model);
      return calls.length === 1 ? response(400, {error: {message: 'model is not supported for generateContent'}}) : ok();
    });
    await context.callGemini({apiKey: 'test', model: 'obsolete'}, 'prompt');
    assert.equal(calls.length, 2);
  }
  {
    const calls = [];
    const {context, state} = sandbox(async url => {
      if (url.includes('/models?')) {
        calls.push('list');
        return url.includes('pageToken=next')
          ? response(200, {models: [{name: 'models/new-model', supportedGenerationMethods: ['generateContent']}]})
          : response(200, {models: [{name: 'models/embed-only', supportedGenerationMethods: ['embedContent']}], nextPageToken: 'next'});
      }
      const model = modelFrom(url); calls.push(model);
      return model === 'new-model' ? ok() : response(404, {error: {message: 'not found'}});
    });
    await context.callGemini({apiKey: 'test', model: 'obsolete'}, 'prompt');
    assert.deepEqual(calls.slice(-3), ['list', 'list', 'new-model']);
    assert.equal(state.selected, 'new-model');
  }
  for (const [status, message, expected] of [[429, 'quota', 'ai.errQuota'], [403, 'permission denied', 'ai.errKey'], [400, 'bad prompt', 'Gemini 400']]) {
    let calls = 0;
    const {context} = sandbox(async () => { calls++; return response(status, {error: {message}}); });
    await assert.rejects(context.callGemini({apiKey: 'test', model: 'model'}, 'prompt'), e => e.message.includes(expected));
    assert.equal(calls, 1);
  }
  {
    const {context} = sandbox(async () => response(429, {error: {message: 'quota'}}));
    await assert.rejects(context.probeGeminiModel('test', 'model', []), e => e.aiHint === 'ai.errQuota');
  }
  for (const [status, expected] of [[403, 'ai.errKey'], [401, 'ai.errKey'], [503, 'ai.errBusy'], [500, 'ai.errProbe']]) {
    const {context} = sandbox(async () => response(status, {}));
    await assert.rejects(context.probeGeminiModel('test', 'model', []), e => e.aiHint === expected);
  }
  {
    const {context} = sandbox(async () => { throw new TypeError('Failed to fetch'); });
    await assert.rejects(context.probeGeminiModel('test', 'model', []), e => e.aiHint === 'ai.errNetwork');
  }
  {
    const calls = [];
    const {context} = sandbox(async url => { const model=modelFrom(url); calls.push(model); return model === 'available' ? ok() : response(404, {}); });
    assert.equal(await context.probeGeminiModel('test', 'old', ['available']), 'available');
    assert.deepEqual(calls, ['old', 'available']);
  }
  {
    const {context} = sandbox(async () => response(400, {error:{message:'API key not valid'}}));
    await assert.rejects(context.probeGeminiModel('test', 'model', []), e => e.aiHint === 'ai.errKey');
  }
  {
    const controller = new AbortController();
    const {context} = sandbox(async url => {
      if (url.includes('/models?')) { controller.abort(); throw Object.assign(new Error('aborted'), {name:'AbortError'}); }
      return response(404, {});
    });
    await assert.rejects(context.callGemini({apiKey:'test', model:'obsolete'}, 'prompt', controller.signal), e => e.name === 'AbortError');
  }
  {
    const calls = [];
    const {context, state} = sandbox(async url => {
      calls.push(modelFrom(url));
      return calls.length <= 3 ? response(503, {error:{message:'high demand'}}) : ok();
    });
    await context.callGemini({apiKey:'test', model:'busy-model'}, 'prompt');
    assert.deepEqual(calls, ['busy-model','busy-model','busy-model','gemini-2.5-flash']);
    assert.equal(state.selected, 'gemini-2.5-flash');
  }
  {
    let calls = 0;
    const {context} = sandbox(async () => { calls++; return response(503, {error:{message:'high demand'}}); });
    await assert.rejects(context.callGemini({apiKey:'test', model:'busy-model'}, 'prompt'), e => e.message === 'ai.errBusy');
    assert.equal(calls, 8); // one preferred + five fallbacks + two retries
  }
  {
    const controller = new AbortController();
    const {context} = sandbox(async () => { setTimeout(() => controller.abort(), 0); return response(503, {}); });
    await assert.rejects(context.callGemini({apiKey:'test', model:'busy-model'}, 'prompt', controller.signal), e => e.name === 'AbortError');
  }
  console.log('Gemini fallback, discovery, errors, probe and cancellation: OK');
})().catch(error => { console.error(error); process.exitCode = 1; });
