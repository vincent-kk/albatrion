// Invoked per BF fixture; diagnostic wrappers observe release scheduling, never official timings.
import assert from 'node:assert/strict';
import { createHook } from 'node:async_hooks';
import childProcess, { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(directory, '..');
const pkg = path.resolve(output, '../../..');
const repo = path.resolve(pkg, '../../..');
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
assert.equal(head, '9383abcdaf22c7dd19dd6d6ddb7e66b4a9616dd4');
const fixtureName = process.argv[2];
const selfCheck = fixtureName === '--self-check';
assert(selfCheck || /^(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20|40)|if-then)$/.test(fixtureName));
const hash = value => createHash('sha256').update(value).digest('hex');
const metric = values => {
  const ordered = values.toSorted((a, b) => a - b);
  assert(ordered.length && ordered.every(Number.isFinite));
  return { median: ordered[Math.ceil(ordered.length * .5) - 1],
    p99: ordered[Math.ceil(ordered.length * .99) - 1], samples: ordered.length };
};
const primitives = ['queueMicrotask', 'Promise', 'setTimeout', 'setImmediate', 'requestAnimationFrame', 'MessageChannel', 'process.nextTick'];
const originals = Object.fromEntries(['queueMicrotask', 'setTimeout', 'clearTimeout', 'setImmediate',
  'clearImmediate', 'requestAnimationFrame', 'MessageChannel'].map(name => [name, globalThis[name]]));
let scope = null;
const pending = new Map();
const resources = new Map();
const promiseFrames = [];
const hook = createHook({
  init(id, type) {
    if (scope && ['PROMISE', 'TickObject'].includes(type)) {
      resources.set(id, { scope, type });
      scope.record.counts[type === 'PROMISE' ? 'Promise' : 'process.nextTick'].scheduled++;
    }
  },
  before(id) {
    const resource = resources.get(id);
    if (!resource) return;
    promiseFrames.push({ id, previous: scope, start: performance.now(), resource });
    scope = resource.scope;
    scope.record.counts[resource.type === 'PROMISE' ? 'Promise' : 'process.nextTick'].executed++;
  },
  after(id) {
    if (promiseFrames.at(-1)?.id !== id) return;
    const frame = promiseFrames.pop();
    const key = frame.resource.scope.timerAncestor ? 'timerDescendantMicrotaskMs' : 'promiseCallbackMs';
    frame.resource.scope.record[key] += performance.now() - frame.start;
    scope = frame.previous;
  },
  destroy(id) { resources.delete(id); },
});

/** Attribute callbacks to the operation that scheduled them, including timer descendants. */
function callbackFor(kind, callback, owner, token, scheduledAt) {
  const source = String(callback);
  const category = /__idle__|__count__/.test(source) ? 'event-batch-reset' :
    /macrotaskId|handler\(\)/.test(source) ? 'onChange-delivery' : 'other-timer';
  return function (...args) {
    const previous = scope;
    const timer = ['setTimeout', 'setImmediate', 'requestAnimationFrame', 'MessageChannel'].includes(kind);
    scope = { record: owner.record, timerAncestor: owner.timerAncestor || timer };
    owner.record.counts[kind].executed++;
    const start = performance.now();
    if (timer) owner.record.timerStartDelayMs = Math.max(owner.record.timerStartDelayMs, start - scheduledAt);
    try { return callback.apply(this, args); }
    finally {
      const elapsed = performance.now() - start;
      owner.record[timer ? 'timerCallbackMs' : owner.timerAncestor ? 'timerDescendantMicrotaskMs' : 'microtaskCallbackMs'] += elapsed;
      if (timer) {
        owner.record.timerSites[category].executed++;
        owner.record.timerSites[category].ms += elapsed;
      }
      if (timer) pending.delete(token.value);
      scope = previous;
    }
  };
}

for (const kind of ['queueMicrotask', 'setTimeout', 'setImmediate', 'requestAnimationFrame']) {
  if (typeof originals[kind] !== 'function') continue;
  globalThis[kind] = function (callback, ...args) {
    if (!scope) return originals[kind](callback, ...args);
    const owner = scope, token = {};
    owner.record.counts[kind].scheduled++;
    if (kind !== 'queueMicrotask') {
      const source = String(callback);
      const category = /__idle__|__count__/.test(source) ? 'event-batch-reset' :
        /macrotaskId|handler\(\)/.test(source) ? 'onChange-delivery' : 'other-timer';
      const site = owner.record.timerSites[category] ??= { scheduled: 0, executed: 0, ms: 0, source: source.slice(0, 900),
        stack: new Error().stack.split('\n').slice(2, 7).map(line => line.replace(/data:text\/javascript;base64,[A-Za-z0-9+/=]+/g, 'release-memory-bundle')) };
      site.scheduled++;
    }
    const wrapped = callbackFor(kind, callback, owner, token, performance.now());
    token.value = originals[kind](wrapped, ...args);
    if (kind !== 'queueMicrotask') pending.set(token.value, { kind, owner });
    return token.value;
  };
}
for (const [cancel, kind] of [['clearTimeout', 'setTimeout'], ['clearImmediate', 'setImmediate']]) {
  globalThis[cancel] = function (token) {
    const task = pending.get(token);
    if (task) { task.owner.record.counts[kind].cancelled++; pending.delete(token); }
    return originals[cancel](token);
  };
}
if (typeof originals.MessageChannel === 'function') {
  globalThis.MessageChannel = class extends originals.MessageChannel {
    constructor(...args) {
      super(...args);
      for (const port of [this.port1, this.port2]) {
        const post = port.postMessage.bind(port);
        port.postMessage = (...values) => {
          if (scope) scope.record.counts.MessageChannel.scheduled++;
          return post(...values);
        };
      }
    }
  };
}

/** Harness waits bypass the wrappers, so their timers never count as engine scheduling. */
async function flush(record) {
  for (let tick = 0; tick < 64; tick++) await Promise.resolve();
  record.pendingAfterMicrotasks = [...pending.values()].filter(task => task.owner.record === record).length;
  record.onChangeAtMicrotaskBoundary = record.onChangeCalls;
  while (pending.size) {
    await new Promise(resolve => originals.setTimeout(resolve, 0));
    for (let tick = 0; tick < 64; tick++) await Promise.resolve();
  }
}

function newRecord() {
  return { counts: Object.fromEntries(primitives.map(name => [name, { scheduled: 0, executed: 0, cancelled: 0 }])),
    synchronousMs: 0, microtaskCallbackMs: 0, promiseCallbackMs: 0, timerCallbackMs: 0,
    timerDescendantMicrotaskMs: 0, timerStartDelayMs: 0, timerSites: {}, onChangeCalls: 0,
    pendingAfterMicrotasks: 0, onChangeAtMicrotaskBoundary: 0 };
}
async function observe(operation) {
  const record = newRecord();
  scope = { record, timerAncestor: false };
  const start = performance.now();
  let result;
  try { result = operation(); }
  finally { record.synchronousMs = performance.now() - start; scope = null; }
  await flush(record);
  return { record, result };
}

hook.enable();
if (selfCheck) {
  const { record } = await observe(() => {
    queueMicrotask(() => Promise.resolve().then(() => setTimeout(() => queueMicrotask(() => {}), 0)));
  });
  assert.equal(record.counts.queueMicrotask.executed, 2);
  assert.equal(record.counts.setTimeout.executed, 1);
  assert(record.counts.Promise.scheduled > 0 && record.timerDescendantMicrotaskMs > 0);
  hook.disable();
  for (const [name, value] of Object.entries(originals)) if (value !== undefined) globalThis[name] = value;
  console.log('SCHEDULER_PROBE_OK');
} else {
  const originalPath = path.join(pkg, 'bench/branchless-phase-diagnosis.mjs');
  const original = fs.readFileSync(originalPath, 'utf8');
  function replaceOnce(source, before, after) {
    assert.equal(source.split(before).length, 2, `Diagnostic adapter anchor: ${before}`);
    return source.replace(before, after);
  }
  let source = replaceOnce(original, "import { writeMeasurement } from './measurement-output.mjs';",
    `import { writeMeasurement } from ${JSON.stringify(pathToFileURL(path.join(pkg, 'bench/measurement-output.mjs')).href)};`);
  source = replaceOnce(source, "const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');", `const pkg = ${JSON.stringify(pkg)};`);
  source = replaceOnce(source, "const engines = { old: await bundle('old'), new: await bundle('new') };", "const engines = { old: await bundle('old') };");
  source = replaceOnce(source, 'engines.new.equivalentFixtures.filter', 'engines.old.equivalentFixtures.filter');
  source = replaceOnce(source, "'src/__legacy__/core/nodeFromJSONSchema.ts'", "'release-core'");
  source = replaceOnce(source, "return relative.startsWith('core') && fs.existsSync(local) ? { path: local } : { path: found, namespace: 'release-binding' };", "return { path: found, namespace: 'release-binding' };");
  source = replaceOnce(source, "builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));",
    "builder.onResolve({ filter: /\\/release-core$/ }, () => oldResolve('core/nodeFromJSONSchema'));\n      builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));");
  source = replaceOnce(source, '(flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20))',
    '(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20|40))');
  source = replaceOnce(source, "builder.onLoad({ filter: /\\/schema-form\\/src\\/.*\\.tsx?$/ }, args => {",
    `builder.onLoad({ filter: /\\/benchmark-form\\/fixtures\\/equivalent\\/branches\\.ts$/ }, args => ({
      contents: fs.readFileSync(args.path, 'utf8').replace('[5, 10, 20].map', '[5, 10, 20, 40].map'), loader: 'ts'
    }));\n      builder.onLoad({ filter: /\\/schema-form\\/src\\/.*\\.tsx?$/ }, args => {`);
  source = replaceOnce(source, 'export { engines, fixtures, begin, finish, drain, React, flushSync, createRoot };',
    'export { engines, fixtures, valueOf, assertValue };');
  process.argv.push('--probe-import', '--plain');
  process.env.PHASE_FIXTURES = fixtureName;
  const services = [], originalSpawn = childProcess.spawn;
  childProcess.spawn = function (file, args, options) {
    const child = originalSpawn(file, args, options);
    if (String(file).includes('esbuild')) services.push(child);
    return child;
  };
  const api = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  childProcess.spawn = originalSpawn;
  for (const service of services) {
    service.ref();
    const ended = service.exitCode === null ? once(service, 'exit') : Promise.resolve([service.exitCode]);
    service.stdin.end();
    const [code, signal] = await ended;
    assert.equal(code, 0, `esbuild natural exit: ${signal}`);
  }
  assert.equal(api.fixtures.length, 1);
  const fixture = api.fixtures[0];
  const warmup = 12, samples = 101;
  const rows = Object.fromEntries(['mount', 'update', 'update-first', 'update-later'].map(name => [name, []]));
  const checks = [];
  const started = new Date().toISOString();
  function laterInteraction(interaction) {
    if (/oneOf|if-then/.test(fixtureName)) return { ...interaction };
    return { ...interaction, value: typeof interaction.value === 'string' ? `${interaction.value}-later` :
      typeof interaction.value === 'number' ? interaction.value + 1 : !interaction.value };
  }
  for (let index = -warmup; index < samples; index++) {
    globalThis.gc();
    const mounted = await observe(() => api.engines.old.nodeFromJSONSchema({
      jsonSchema: structuredClone(fixture.legacy), validationMode: 0,
      onChange() { if (scope) scope.record.onChangeCalls++; },
    }));
    const root = mounted.result;
    const updates = [];
    for (const interaction of fixture.interactions) {
      const observed = await observe(() => {
        const node = root.find(interaction.path);
        assert(node, `Missing ${fixtureName} ${interaction.path}`);
        node.setValue(interaction.value);
      });
      updates.push(observed.record);
    }
    api.assertValue(root, fixture);
    const settledValue = hash(JSON.stringify(api.valueOf(root)));
    const interaction = laterInteraction(fixture.interactions[0]);
    const later = await observe(() => root.find(interaction.path).setValue(interaction.value));
    if (index >= 0) {
      rows.mount.push(mounted.record);
      rows['update-first'].push(updates[0]);
      rows['update-later'].push(later.record);
      const combined = newRecord();
      for (const record of updates) {
        for (const name of primitives) for (const key of ['scheduled', 'executed', 'cancelled']) combined.counts[name][key] += record.counts[name][key];
        for (const key of ['synchronousMs', 'microtaskCallbackMs', 'promiseCallbackMs', 'timerCallbackMs', 'timerDescendantMicrotaskMs', 'onChangeCalls', 'pendingAfterMicrotasks', 'onChangeAtMicrotaskBoundary']) combined[key] += record[key];
        combined.timerStartDelayMs = Math.max(combined.timerStartDelayMs, record.timerStartDelayMs);
        for (const [key, site] of Object.entries(record.timerSites)) {
          combined.timerSites[key] ??= { ...site, scheduled: 0, executed: 0, ms: 0 };
          for (const field of ['scheduled', 'executed', 'ms']) combined.timerSites[key][field] += site[field];
        }
      }
      rows.update.push(combined);
      checks.push(settledValue);
    }
  }
  hook.disable();
  for (const [name, value] of Object.entries(originals)) if (value !== undefined) globalThis[name] = value;
  const timingKeys = ['synchronousMs', 'microtaskCallbackMs', 'promiseCallbackMs', 'timerCallbackMs',
    'timerDescendantMicrotaskMs', 'timerStartDelayMs'];
  const timings = Object.fromEntries(Object.entries(rows).map(([name, values]) => [name,
    values.map(record => Object.fromEntries(timingKeys.map(key => [key, record[key]])))]));
  const summary = { environment: { head, node: process.version, v8: process.versions.v8, cpu: os.cpus()[0].model,
    fixture: fixtureName, validation: 'off', externalSubscribers: 0, onChange: 'noop required by legacy core',
    old: '@canard/schema-form@0.16.0 tag source', warmup, samples, explicitGc: true,
    sequential: true, naturalExit: true, started, ended: new Date().toISOString() },
    sourceSha256: hash(original), toolSha256: hash(fs.readFileSync(fileURLToPath(import.meta.url))),
    method: 'global scheduling wrappers + async_hooks Promise ancestry; harness scheduling excluded; diagnostic only',
    primitiveAvailability: Object.fromEntries(Object.entries(originals).filter(([key]) => !key.startsWith('clear')).map(([key, value]) => [key, typeof value !== 'undefined'])),
    valueChecks: { samples: checks.length, distinctHashes: [...new Set(checks)], assertion: 'BF final interaction values match' },
    rows: Object.entries(rows).map(([mode, records]) => ({ mode, sampleCount: records.length,
      timings: Object.fromEntries(timingKeys.map(key => [key, metric(records.map(record => record[key]))])),
      timerShare: metric(records.map(record => (record.timerCallbackMs + record.timerDescendantMicrotaskMs) /
        (record.synchronousMs + record.microtaskCallbackMs + record.promiseCallbackMs + record.timerCallbackMs + record.timerDescendantMicrotaskMs))),
      onChangeCalls: metric(records.map(record => record.onChangeCalls)),
      pendingAfterMicrotasks: metric(records.map(record => record.pendingAfterMicrotasks)),
      onChangeAtMicrotaskBoundary: metric(records.map(record => record.onChangeAtMicrotaskBoundary)),
      primitiveCounts: Object.fromEntries(primitives.map(name => [name,
        Object.fromEntries(['scheduled', 'executed', 'cancelled'].map(key => [key, metric(records.map(record => record.counts[name][key]))]))])),
      timerSites: Object.fromEntries([...new Set(records.flatMap(record => Object.keys(record.timerSites)))].map(key => [key, {
        source: records.find(record => record.timerSites[key]).timerSites[key].source,
        stack: records.find(record => record.timerSites[key]).timerSites[key].stack,
        ...Object.fromEntries(['scheduled', 'executed', 'ms'].map(field => [field,
          metric(records.map(record => record.timerSites[key]?.[field] ?? 0))])),
      }])),
    })) };
  const artifacts = { [`verdict-94c01-scheduling-${fixtureName}-timings.json`]: timings,
    [`verdict-94c01-scheduling-${fixtureName}-summary.json`]: summary };
  const patches = Object.entries(artifacts).map(([name, value]) => {
    const text = JSON.stringify(value);
    assert(Buffer.byteLength(text) <= 5_000_000);
    return `*** Begin Patch\n*** Add File: ${path.join(output, name)}\n+${text}\n*** End Patch`;
  });
  console.log(JSON.stringify({ patches, fixture: fixtureName,
    timers: summary.rows.map(row => ({ mode: row.mode, ms: row.timings.timerCallbackMs.median,
      count: row.primitiveCounts.setTimeout.executed.median + row.primitiveCounts.setImmediate.executed.median,
      share: row.timerShare.median, pendingAfterMicrotasks: row.pendingAfterMicrotasks.median })) }));
}
