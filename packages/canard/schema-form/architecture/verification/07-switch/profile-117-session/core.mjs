// CLI worker: one fresh fixture/run pair, with separate scheduler-boundary and work-count lanes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PerformanceObserver } from 'node:perf_hooks';
import { directory, pkg, scratch, HEAD, req, bfReq, hash, git, median, canonical, emit, clocks, apply, later, validatorServices } from './runtime.mjs';
import { instrumentWork } from './count-work.mjs';

const [stage, name, validation, runText] = process.argv.slice(2);
assert(['A', 'B', 'C', 'D'].includes(stage));
assert(['off', 'on'].includes(validation));
const run = Number(runText);
assert(run >= 1 && run <= (/[AB]/.test(stage) ? 3 : 9));
assert(globalThis.gc);
const started = new Date().toISOString(), start = performance.now();
const versions = /[AB]/.test(stage) ? ['HEAD', '0.16.0'] : ['head', 'working'];
const files = Object.fromEntries(versions.map(version => [version, path.join(scratch,
  version === '0.16.0' ? 'split-old.cjs' : stage === 'D' && version === 'working' ? 'branch1-working.cjs' : 'branch1-head.cjs')]));
const texts = Object.fromEntries(versions.map(version => [version, fs.readFileSync(files[version], 'utf8')]));
const load = text => { const module = { exports: {} }; new Function('require', 'module', 'exports', text)(bfReq, module, module.exports); return module.exports; };
const engines = Object.fromEntries(versions.map(version => [version, load(texts[version])]));
let fixture = engines[versions[0]].equivalentFixtures.find(item => item.name === name);
if (!fixture && name === 'if-then') {
  const definition = JSON.parse(fs.readFileSync(path.join(directory, 'if-then.json'), 'utf8'));
  fixture = { name, legacy: definition.schema, workspace: structuredClone(definition.schema), interactions: definition.interactions };
}
assert(fixture, name);
const axis = /^oneOf-/.test(name) && validation === 'off';
const modes = ['mount', 'update', 'update-first', 'update-later', ...(axis ? ['axis-update', 'axis-first', 'axis-later'] : [])];
const passes = validation === 'on' ? 2 : 1;
const { measure, flushMicrotasks } = clocks(passes);
const noop = () => {};
const data = Object.fromEntries(versions.map(version => [version, Object.fromEntries(modes.map(mode => [mode, []]))]));
const checks = Object.fromEntries(versions.map(version => [version, Object.fromEntries(modes.map(mode => [mode, {}]))]));
const empty = { before: [], after: [] }, windows = [], gc = [];
const counts = {}, boundary = {}, callbacks = {};
const observer = new PerformanceObserver(list => { for (const event of list.getEntries()) gc.push({ start: event.startTime, ms: event.duration, kind: event.detail.kind }); });
observer.observe({ entryTypes: ['gc'] });
const checkpoint = () => assert(performance.now() - start < 400000, 'Split this fixture before eight minutes');
const props = version => ({ jsonSchema: structuredClone(version === '0.16.0' ? fixture.legacy : fixture.workspace),
  validationMode: validation === 'on' ? 1 : 0, onChange: noop, ...(validation === 'on' ? validatorServices() : {}) });
const sum = rows => rows.reduce((total, row) => total.map((value, i) => Number((value + row.timing[i]).toFixed(6))), [0, 0, 0]);
const valueOf = root => typeof root.getValue === 'function' ? root.getValue() : root.value;
const capture = (version, mode, root, index) => {
  if (index < 0) return;
  const digest = hash(canonical(valueOf(root)));
  checks[version][mode][digest] = (checks[version][mode][digest] ?? 0) + 1;
};
const save = (version, mode, observed, root, index) => {
  if (index >= 0) { data[version][mode].push(observed.timing); capture(version, mode, root, index); }
};
const laterInput = fixture.interactions[0].kind !== 'set' ? { ...fixture.interactions[0] } : later(fixture);

/** Record exactly the canonical authored history and the independent fixed branch axis. */
async function sequence(version, index, invoke, record) {
  const prepared = props(version);
  await new Promise(resolve => setImmediate(resolve));
  const mounted = await invoke(() => engines[version].nodeFromJSONSchema(prepared));
  const root = mounted.result;
  record('mount', [mounted], root, index);
  const updates = [];
  for (const interaction of fixture.interactions) {
    const observed = await invoke(() => apply(root, interaction));
    updates.push(observed);
    if (updates.length === 1) record('update-first', [observed], root, index);
  }
  record('update', updates, root, index);
  const repeated = await invoke(() => apply(root, laterInput));
  record('update-later', [repeated], root, index);
  if (axis) {
    const preparedAxis = props(version);
    const axisRoot = (await invoke(() => engines[version].nodeFromJSONSchema(preparedAxis))).result;
    const first = await invoke(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_4' }));
    record('axis-first', [first], axisRoot, index);
    const second = await invoke(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_0' }));
    record('axis-update', [first, second], axisRoot, index);
    const last = await invoke(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_4' }));
    record('axis-later', [last], axisRoot, index);
  }
}

/** Keep schema cloning, validation-service construction and explicit GC outside the clock. */
async function officialSequence(version, index) {
  globalThis.gc();
  let firstCall = true;
  await sequence(version, index, async operation => {
      const begin = performance.now();
      const observed = await measure(operation);
      const end = performance.now();
      if (index >= 0) windows.push({ version, index, begin, end, firstCall });
      firstCall = false;
      return observed;
  }, (mode, rows, root, i) => save(version, mode, { timing: sum(rows) }, root, i));
}

for (const label of ['before', 'after']) {
  if (label === 'after') break;
  for (let index = -20; index < 101; index++) {
    checkpoint(); globalThis.gc(); await new Promise(resolve => setImmediate(resolve));
    const observed = await measure(noop);
    if (index >= 0) empty[label].push(observed.timing);
  }
}
for (let index = -20; index < 101; index++) {
  checkpoint();
  const order = (index + run - 1) % 2 === 0 ? versions : versions.toReversed();
  for (const version of order) await officialSequence(version, index);
  if (index === -1 || index >= 0 && (index + 1) % 20 === 0 || index === 100)
    console.log(`${stage} ${name} ${validation} ${run}회차의 ${index < 0 ? '예열' : index + 1 + '/101 표본'} 측정이 끝났습니다 (${((performance.now() - start) / 1000).toFixed(1)}초).`);
}
for (let index = -20; index < 101; index++) {
  checkpoint(); globalThis.gc(); await new Promise(resolve => setImmediate(resolve));
  const observed = await measure(noop);
  if (index >= 0) empty.after.push(observed.timing);
}
await new Promise(resolve => setImmediate(resolve));
observer.disconnect();
const officialEnded = new Date().toISOString();

const scheduler = req('@winglet/common-utils/scheduler');
const nativeSchedule = scheduler.scheduleMacrotaskSafe, nativeCancel = scheduler.cancelMacrotaskSafe;
const pending = new Map();
let scope;
scheduler.scheduleMacrotaskSafe = (callback, ...args) => {
  const owner = scope; assert(owner);
  owner.scheduled++;
  const token = nativeSchedule(function (...values) {
    owner.executed++; const begin = performance.now();
    try { return callback.apply(this, values); }
    finally { owner.executionMs += performance.now() - begin; pending.delete(token); }
  }, ...args);
  pending.set(token, owner); return token;
};
scheduler.cancelMacrotaskSafe = token => { const owner = pending.get(token); if (owner) { owner.cancelled++; pending.delete(token); } return nativeCancel(token); };

/** Audit the actual scheduler boundary after all official timing samples. */
async function observe(operation) {
  const record = { scheduled: 0, executed: 0, cancelled: 0, executionMs: 0, pendingAtMicrotasks: 0,
    pendingAtFirstSentinel: 0, pendingAtSentinel: 0, tailScheduled: 0, tailExecuted: 0 };
  scope = record;
  const result = operation();
  await flushMicrotasks(); record.pendingAtMicrotasks = pending.size;
  for (let pass = 0; pass < passes; pass++) {
    await new Promise(resolve => setImmediate(resolve));
    if (pass === 0) record.pendingAtFirstSentinel = pending.size;
    if (pass + 1 < passes) await flushMicrotasks();
  }
  record.pendingAtSentinel = pending.size;
  assert.equal(pending.size, 0);
  const scheduled = record.scheduled, executed = record.executed;
  await flushMicrotasks(128); await new Promise(resolve => setImmediate(resolve));
  record.tailScheduled = record.scheduled - scheduled; record.tailExecuted = record.executed - executed;
  scope = undefined;
  assert.equal(record.tailScheduled + record.tailExecuted, 0);
  assert.equal(record.scheduled, record.executed + record.cancelled);
  return { result, record };
}
try {
  for (const version of versions) {
    callbacks[version] = Object.fromEntries(modes.map(mode => [mode, []]));
    boundary[version] = Object.fromEntries(modes.map(mode => [mode, []]));
    for (let index = -20; index < 101; index++) {
      checkpoint(); globalThis.gc(); await new Promise(resolve => setImmediate(resolve));
      await sequence(version, index, observe, (mode, rows, _root, i) => {
        if (i < 0) return;
        callbacks[version][mode].push(rows.reduce((sum, row) => sum + row.record.executionMs, 0));
        boundary[version][mode].push(Object.fromEntries(Object.keys(rows[0].record).filter(key => key !== 'executionMs')
          .map(key => [key, rows.reduce((sum, row) => sum + row.record[key], 0)])));
      });
    }
    const orders = Object.values(boundary[version]).flat();
    if (version !== '0.16.0') assert(orders.every(row => row.scheduled === 0));
    else assert(orders.every(row => row.executed > 0 && row.pendingAtMicrotasks > 0));
  }
} finally { scheduler.scheduleMacrotaskSafe = nativeSchedule; scheduler.cancelMacrotaskSafe = nativeCancel; }

if (/[AB]/.test(stage)) {
  const ts = req('typescript');
  globalThis.__work117 = key => { if (globalThis.__counting117) globalThis.__counts117[key] = (globalThis.__counts117[key] ?? 0) + 1; };
  for (const version of versions) {
    const counted = load(instrumentWork(texts[version], files[version], ts));
    counts[version] = [];
    for (let sample = 0; sample < 3; sample++) {
      const root = counted.nodeFromJSONSchema(props(version));
      await measure(noop);
      globalThis.__counts117 = { renders: 0, commits: 0, listenerDeliveries: 0, settlePasses: 0 };
      globalThis.__counting117 = true;
      for (const interaction of fixture.interactions) await measure(() => apply(root, interaction));
      globalThis.__counting117 = false;
      counts[version].push({ ...globalThis.__counts117 });
    }
  }
}
for (const mode of modes) assert.deepEqual(checks[versions[0]][mode], checks[versions[1]][mode], `${name}/${mode} value mismatch`);
assert.equal(git(['rev-parse', 'HEAD']).trim(), HEAD);
assert.equal(process.getActiveResourcesInfo().filter(name => ['Timeout', 'Immediate', 'MessagePort', 'PROCESSWRAP'].includes(name)).length, 0);
const boundarySummary = Object.fromEntries(versions.map(version => [version, Object.fromEntries(modes.map(mode => [mode,
  Object.fromEntries(Object.keys(boundary[version][mode][0]).map(key => [key, {
    median: median(boundary[version][mode].map(row => row[key])), max: Math.max(...boundary[version][mode].map(row => row[key])) }]))]))]));
emit(`${stage}-core-${name}-${validation}-r${run}.json`, { HEAD, stage, fixture: name, validation, run, versions,
  environment: { node: process.version, v8: process.versions.v8, cpu: os.cpus()[0].model, platform: process.platform, arch: process.arch },
  started, officialEnded, ended: new Date().toISOString(), seconds: (performance.now() - start) / 1000,
  warmup: 20, samples: 101, sentinelPasses: passes, interactionCount: fixture.interactions.length,
  sampleOrder: 'alternates within each run: (sampleIndex + run - 1) even => first listed version first',
  forcedGCOutsideClock: true, schemaCloneOutsideClock: true, validationServicesOutsideClock: true,
  officialEngineInstrumentation: false, freshProcess: true,
  bundleSha256: Object.fromEntries(versions.map(version => [version, hash(texts[version])])),
  canonicalClockSha256: hash(fs.readFileSync(path.join(directory, '../tools/measure-verdict-95c01.mjs'))),
  pairedEmptyPosition: 'immediately before every call; same checkpoints and sentinel passes',
  timingColumns: ['microtaskMs', 'sentinelEndToEndMs', 'pairedEmptyTailMs'], timing: data, empty, callbacks,
  boundaryWrapperInstalledAfterOfficialSamples: true, boundary: boundarySummary, counts, checks,
  gcInside: gc.filter(event => windows.some(window => event.start >= window.begin && event.start < window.end)),
  negativeClipping: false });
console.log(`${stage} ${name} ${validation} ${run}회차가 자연 종료합니다.`);
