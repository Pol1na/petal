const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const backendSource = fs.readFileSync(path.join(__dirname, 'google-mail.gs'), 'utf8').replace('https://YOUR-GITHUB-NAME.github.io', 'https://example.github.io');
const mailSource = fs.readFileSync(path.join(__dirname, 'mail.js'), 'utf8');

function backend() {
  const messages = [], cache = new Map(), props = new Map();
  const sandbox = {
    console, MailApp: { getRemainingDailyQuota: () => 100, sendEmail: (data) => messages.push(data) },
    LockService: { getScriptLock: () => ({ waitLock() {}, hasLock: () => true, releaseLock() {} }) },
    CacheService: { getScriptCache: () => ({ get: (k) => cache.get(k), put: (k, v) => cache.set(k, v) }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props.get(k), setProperties: (o) => Object.entries(o).forEach(([k, v]) => props.set(k, v)) }) },
    Utilities: { formatDate: () => '2026-10-29' },
    HtmlService: { XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' }, createHtmlOutput: (html) => ({ html, setXFrameOptionsMode() { return this; } }) }
  };
  vm.createContext(sandbox); vm.runInContext(backendSource, sandbox);
  const submit = (overrides = {}, payload = {}) => sandbox.doPost({ parameter: { nonce: 'nonce-12345678', replyOrigin: 'https://example.github.io', payload: JSON.stringify({ _subject: 'Тест', 'Любимые цветы': 'Пионы, тюльпаны', 'Номер анкеты': 'submission-12345678', ...payload }), ...overrides } });
  return { sandbox, submit, messages, props };
}

test('Google sends the complete Russian answers to the fixed owner address', () => {
  const b = backend(); const result = b.submit({}, { to: 'someone-else@example.com' });
  assert.equal(b.messages.length, 1);
  assert.equal(b.messages[0].to, 'l1napochtipol1na@gmail.com');
  assert.match(b.messages[0].body, /Пионы, тюльпаны/);
  assert.match(result.html, /"success":true/);
});
test('retrying the same submission does not send a second email', () => {
  const b = backend(); b.submit(); const result = b.submit();
  assert.equal(b.messages.length, 1); assert.match(result.html, /"success":true/);
});
test('requests from another origin never send mail', () => {
  const b = backend(); const result = b.submit({ replyOrigin: 'https://other.example' });
  assert.equal(b.messages.length, 0); assert.match(result.html, /"success":false/);
});
test('malformed and excessively long payloads are rejected', () => {
  const b = backend(); b.submit({ payload: 'not json' }); b.submit({ payload: 'x'.repeat(26000) });
  assert.equal(b.messages.length, 0);
});
test('daily mail limit prevents further sends', () => {
  const b = backend(); b.props.set('mailDay', '2026-10-29'); b.props.set('mailCount', '20');
  const result = b.submit(); assert.equal(b.messages.length, 0); assert.match(result.html, /"success":false/);
});
test('mail failure returns failure and does not mark the submission sent', () => {
  const b = backend(); b.sandbox.MailApp.sendEmail = () => { throw new Error('Quota exceeded'); };
  assert.match(b.submit().html, /"success":false/);
  b.sandbox.MailApp.sendEmail = (data) => b.messages.push(data);
  assert.match(b.submit().html, /"success":true/); assert.equal(b.messages.length, 1);
});
test('untrusted answers are not reflected into executable response HTML', () => {
  const b = backend(); const result = b.submit({}, { 'Любимые цветы': '</script><script>alert(1)</script>' });
  assert.ok(!result.html.includes('alert(1)')); assert.equal(b.messages.length, 1);
});

function client(fetchResult, useGoogle = false) {
  const listeners = {}, elements = [], timers = [];
  const sandbox = { window: { PETAL_CONFIG: { recipient: 'owner@example.com', googleScriptUrl: useGoogle ? 'https://script.google.com/macros/s/test-script/exec' : '' }, addEventListener: (k, fn) => { listeners[k] = fn; }, removeEventListener: (k) => { delete listeners[k]; } },
    fetch: async () => { if (fetchResult instanceof Error) throw fetchResult; return fetchResult; },
    AbortController, URL, crypto: { randomUUID: () => 'nonce-12345678' }, location: { origin: 'https://example.github.io' },
    setTimeout: (fn) => { timers.push(fn); return timers.length - 1; }, clearTimeout() {},
    document: { body: { appendChild: (el) => elements.push(el) }, createElement: (tag) => ({ tag, children: [], appendChild(el) { this.children.push(el); }, submit() {}, remove() {} }) }
  };
  vm.createContext(sandbox); vm.runInContext(mailSource, sandbox);
  return { send: sandbox.window.PETAL_MAIL.send, listeners, elements, timers };
}
test('FormSubmit acceptance requires both HTTP success and explicit success', async () => {
  for (const response of [{ ok: false, json: async () => ({ success: true }) }, { ok: true, json: async () => ({ success: false }) }, { ok: true, json: async () => { throw new Error('HTML instead of JSON'); } }]) {
    await assert.rejects(client(response).send({ 'Цветы': 'Пионы' }));
  }
  assert.equal((await client({ ok: true, json: async () => ({ success: 'true' }) }).send({})).success, true);
});
test('activation responses are not reported as sent', async () => {
  const result = await client({ ok: true, json: async () => ({ success: true, message: 'Please activate your form' }) }).send({});
  assert.equal(result.activationRequired, true); assert.equal(result.success, false);
});
test('network failure is propagated instead of reporting success', async () => {
  await assert.rejects(client(new Error('Network down')).send({}));
});
test('Google bridge ignores forged origins and wrong nonces', async () => {
  const c = client(null, true); let resolved = false;
  const pending = c.send({ 'Цветы': 'Пионы' }).then((r) => { resolved = true; return r; });
  c.listeners.message({ origin: 'https://attacker.example', data: { type: 'petal-mail-result', nonce: 'nonce-12345678', success: true } });
  c.listeners.message({ origin: 'https://n-xyz-script.googleusercontent.com', data: { type: 'petal-mail-result', nonce: 'wrong', success: true } });
  await Promise.resolve(); assert.equal(resolved, false);
  c.listeners.message({ origin: 'https://n-xyz-script.googleusercontent.com', data: { type: 'petal-mail-result', nonce: 'nonce-12345678', success: true } });
  assert.equal((await pending).success, true);
});
test('Google timeout never reports success', async () => {
  const c = client(null, true); const pending = c.send({}); c.timers[0](); await assert.rejects(pending);
});
