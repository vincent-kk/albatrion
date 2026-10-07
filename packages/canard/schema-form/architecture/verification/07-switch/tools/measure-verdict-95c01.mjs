// CLI worker: one fixture/version/run; clocks and Node scheduling belong to this harness.
// Official samples precede all scheduler wrapping; engine source is bundled unchanged in memory.
import assert from 'node:assert/strict';
import childProcess, { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const { endpointDifference95c01 } = await import(pathToFileURL(path.join(directory, 'endpointDifference95c01.mjs')));
const output = path.resolve(directory, '..');
const pkg = path.resolve(output, '../../..');
const repo = path.resolve(pkg, '../../..');
const expectedHead = '4d2e54533dc8feaccb4742be9dd322e46d20be58';
const measurementHead = process.argv.find(value => value.startsWith('--head='))?.slice(7) ?? expectedHead;
assert.match(measurementHead, /^[a-f0-9]{40}$/);
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
const immediate = globalThis.setImmediate;
const clock = () => performance.now();
const warmup = 12, sampleCount = 101;
const measurementWarmup = Number(process.argv.find(value => value.startsWith('--warmup='))?.slice(9) ?? warmup);
assert(Number.isInteger(measurementWarmup) && measurementWarmup >= 10);
// Validation's deferred error events schedule one further check-queue generation.
const sentinelPasses = process.argv[3] === 'on' || process.argv.includes('--nested-callback') ? 2 : 1;
const hash = value => createHash('sha256').update(value).digest('hex');
const round = value => Number(value.toFixed(6));
const metric = values => {
  const sorted = values.toSorted((a, b) => a - b);
  assert(sorted.length && sorted.every(Number.isFinite));
  return { median: sorted[Math.ceil(sorted.length * .5) - 1],
    p99: sorted[Math.ceil(sorted.length * .99) - 1], samples: sorted.length };
};

/** Drain generations produced by a call; the scheduling diagnostic checks the chosen bound. */
async function flushMicrotasks(turns = 64) {
  for (let turn = 0; turn < turns; turn++) await Promise.resolve();
}

/** Time a call through the same-queue sentinel, recording the earlier microtask boundary too. */
async function measure(operation, earlySentinel = false) {
  const start = clock();
  const result = operation();
  const early = earlySentinel ? new Promise(resolve => immediate(() => resolve(clock()))) : null;
  await flushMicrotasks();
  const micro = clock() - start;
  let end;
  for (let pass = 0; pass < (earlySentinel ? 1 : sentinelPasses); pass++) {
    end = await (early ?? new Promise(resolve => immediate(() => resolve(clock()))));
    if (pass + 1 < sentinelPasses) await flushMicrotasks();
  }
  return { result, timing: [round(micro), round(end - start)] };
}

if (process.argv.includes('--self-check')) {
  const early = process.argv.includes('--early-sentinel');
  const nested = process.argv.includes('--nested-callback');
  for (const mode of ['mount', 'update']) {
    const events = [], pending = [];
    await measure(() => {
      queueMicrotask(() => {
        events.push('microtask');
        pending.push(new Promise(resolve => immediate(() => {
          events.push('batch-reset');
          queueMicrotask(() => { events.push('callback-microtask'); resolve(); });
        })));
        pending.push(new Promise(resolve => immediate(() => {
          events.push('onChange');
          if (nested) queueMicrotask(() => immediate(() => { events.push('validation-reset'); resolve(); }));
          else resolve();
        })));
      });
    }, early);
    const atSentinel = [...events];
    await Promise.all(pending);
    assert.deepEqual(atSentinel, ['microtask', 'batch-reset', 'callback-microtask', 'onChange',
      ...(nested ? ['validation-reset'] : [])], `${mode} FIFO`);
  }
  console.log('END_TO_END_95C01_OK');
} else {
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), measurementHead);
  const [fixtureName, validation, runText, version] = process.argv.slice(2);
  assert(/^(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20|40)|if-then)$/.test(fixtureName));
  assert(['off', 'on'].includes(validation) && ['old', 'new'].includes(version));
  const run = Number(runText);
  assert([1, 2, 3].includes(run));
  assert.equal(typeof globalThis.gc, 'function');
  assert(!Object.keys(process.env).some(key => /^PHASE_(SOURCE_REF|CANDIDATES)$/.test(key)), 'Source overrides forbidden');
  const originalPath = path.join(pkg, 'bench/branchless-phase-diagnosis.mjs');
  const original = fs.readFileSync(originalPath, 'utf8');
  const replaceOnce = (source, before, after) => {
    assert.equal(source.split(before).length, 2, `Adapter anchor: ${before}`);
    return source.replace(before, after);
  };
  let source = replaceOnce(original, "import { writeMeasurement } from './measurement-output.mjs';",
    `import { writeMeasurement } from ${JSON.stringify(pathToFileURL(path.join(pkg, 'bench/measurement-output.mjs')).href)};`);
  source = replaceOnce(source, "const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');", `const pkg = ${JSON.stringify(pkg)};`);
  source = replaceOnce(source, "const engines = { old: await bundle('old'), new: await bundle('new') };",
    `const engines = { ${version}: await bundle(${JSON.stringify(version)}) };`);
  source = replaceOnce(source, 'engines.new.equivalentFixtures.filter', `engines.${version}.equivalentFixtures.filter`);
  source = replaceOnce(source, "'src/__legacy__/core/nodeFromJSONSchema.ts'", "'release-core'");
  source = replaceOnce(source, "return relative.startsWith('core') && fs.existsSync(local) ? { path: local } : { path: found, namespace: 'release-binding' };",
    "return { path: found, namespace: 'release-binding' };");
  source = replaceOnce(source, "builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));",
    "builder.onResolve({ filter: /\\/release-core$/ }, () => oldResolve('core/nodeFromJSONSchema'));\n      builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));");
  source = replaceOnce(source, '(flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20))',
    '(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20|40))');
  source = replaceOnce(source, "builder.onLoad({ filter: /\\/schema-form\\/src\\/.*\\.tsx?$/ }, args => {",
    "builder.onLoad({ filter: /\\/benchmark-form\\/fixtures\\/equivalent\\/branches\\.ts$/ }, args => ({ contents: fs.readFileSync(args.path, 'utf8').replace('[5, 10, 20].map', '[5, 10, 20, 40].map'), loader: 'ts' }));\n      builder.onLoad({ filter: /\\/schema-form\\/src\\/.*\\.tsx?$/ }, args => {");
  source = replaceOnce(source, 'const module = { exports: {} };',
    `assertBundle(result.outputFiles[0].text); const module = { exports: {} };`);
  source = `import assert from 'node:assert/strict';\n${source}`;
  source = replaceOnce(source, 'async function bundle(version) {',
    `const bundleEvidence = []; function assertBundle(text) { assert(!/__phaseEnter|__phaseExit/.test(text)); bundleEvidence.push({ sha256: (${hash.toString()})(text), bytes: Buffer.byteLength(text), phaseHooks: 0 }); }\nasync function bundle(version) {`);
  // createHash is injected into the adapter; the hash-only addition never changes bundled engine code.
  source = `import { createHash } from 'node:crypto';\n${source}`;
  source = replaceOnce(source, 'export { engines, fixtures, begin, finish, drain, React, flushSync, createRoot };',
    'export { engines, fixtures, valueOf, assertValue, validatorServices, req, bfReq, hooks, bundleEvidence, virtualSources };');
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
  const serviceExits = [];
  for (const service of services) {
    service.ref();
    const ended = service.exitCode === null ? once(service, 'exit') : Promise.resolve([service.exitCode, null]);
    service.stdin.end();
    const [code, signal] = await ended;
    assert.equal(code, 0, `esbuild natural exit: ${signal}`);
    serviceExits.push({ code, signal, mechanism: 'stdin EOF' });
  }
  assert.equal(api.fixtures.length, 1);
  assert.equal(api.hooks.length, 0);
  const fixture = api.fixtures[0], engine = api.engines[version];
  const axis = /^oneOf-/.test(fixtureName) && validation === 'off';
  const modes = ['mount', 'update', 'update-first', 'update-later', ...(axis ? ['axis-update', 'axis-first', 'axis-later'] : [])];
  const timings = Object.fromEntries(modes.map(mode => [mode, []]));
  timings['empty-before'] = []; timings['empty-after'] = [];
  const callbackTimings = Object.fromEntries(modes.map(mode => [mode, []]));
  const ordering = Object.fromEntries(modes.map(mode => [mode, []]));
  const checks = Object.fromEntries(modes.map(mode => [mode, {}]));
  const started = new Date().toISOString();
  const noop = () => {};
  const canonical = value => JSON.stringify(value, (_key, item) => item && !Array.isArray(item) && typeof item === 'object'
    ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
  const capture = (mode, root) => {
    const digest = hash(canonical(api.valueOf(root)));
    checks[mode][digest] = (checks[mode][digest] ?? 0) + 1;
  };
  const later = interaction => /oneOf|if-then/.test(fixtureName) ? { ...interaction } :
    { ...interaction, value: typeof interaction.value === 'string' ? `${interaction.value}-later` :
      typeof interaction.value === 'number' ? interaction.value + 1 : !interaction.value };
  const createProps = () => ({ jsonSchema: structuredClone(version === 'old' ? fixture.legacy : fixture.workspace),
    validationMode: validation === 'on' ? 1 : 0, onChange: noop,
    ...(validation === 'on' ? api.validatorServices() : {}) });
  const write = (root, interaction) => {
    const node = root.find(interaction.path);
    assert(node, `Missing ${fixtureName} ${interaction.path}`);
    node.setValue(interaction.value);
  };
  const addTimes = records => records.reduce((total, record) => total.map((value, index) => round(value + record.timing[index])), [0, 0]);
  const controls = async name => {
    for (let index = -measurementWarmup; index < sampleCount; index++) {
      globalThis.gc();
      await new Promise(resolve => immediate(resolve));
      const observed = await measure(noop);
      if (index >= 0) timings[name].push(observed.timing);
    }
  };
  await new Promise(resolve => immediate(resolve));
  await controls('empty-before');
  for (let index = -measurementWarmup; index < sampleCount; index++) {
    globalThis.gc();
    const props = createProps();
    await new Promise(resolve => immediate(resolve));
    const mounted = await measure(() => engine.nodeFromJSONSchema(props));
    const root = mounted.result;
    if (index >= 0) { timings.mount.push(mounted.timing); capture('mount', root); }
    const updates = [];
    for (const interaction of fixture.interactions) {
      const observed = await measure(() => write(root, interaction));
      updates.push(observed);
      if (index >= 0 && updates.length === 1) { timings['update-first'].push(observed.timing); capture('update-first', root); }
    }
    api.assertValue(root, fixture);
    if (index >= 0) { timings.update.push(addTimes(updates)); capture('update', root); }
    const repeated = await measure(() => write(root, later(fixture.interactions[0])));
    if (index >= 0) { timings['update-later'].push(repeated.timing); capture('update-later', root); }
    if (axis) {
      const axisRoot = (await measure(() => engine.nodeFromJSONSchema(createProps()))).result;
      const first = await measure(() => write(axisRoot, { path: '/kind', value: 'kind_4' }));
      if (index >= 0) { timings['axis-first'].push(first.timing); capture('axis-first', axisRoot); }
      const second = await measure(() => write(axisRoot, { path: '/kind', value: 'kind_0' }));
      if (index >= 0) { timings['axis-update'].push(addTimes([first, second])); capture('axis-update', axisRoot); }
      const last = await measure(() => write(axisRoot, { path: '/kind', value: 'kind_4' }));
      if (index >= 0) { timings['axis-later'].push(last.timing); capture('axis-later', axisRoot); }
    }
  }
  await controls('empty-after');
  const officialEnded = new Date().toISOString();

  // CJS consumers retain this shared exports object, so the single boundary is wrapped after official runs.
  const scheduler = api.req('@winglet/common-utils/scheduler');
  const originalSchedule = scheduler.scheduleMacrotaskSafe, originalCancel = scheduler.cancelMacrotaskSafe;
  let scope = null;
  const pending = new Map();
  scheduler.scheduleMacrotaskSafe = (callback, ...args) => {
    const owner = scope;
    assert(owner, 'Engine scheduled outside the active operation');
    owner.scheduled++;
    const token = originalSchedule(function (...values) {
      owner.executed++;
      const start = clock();
      try { return callback.apply(this, values); }
      finally { owner.executionMs += clock() - start; pending.delete(token); }
    }, ...args);
    pending.set(token, owner);
    return token;
  };
  scheduler.cancelMacrotaskSafe = token => {
    const owner = pending.get(token);
    if (owner) { owner.cancelled++; pending.delete(token); }
    return originalCancel(token);
  };
  const observeBoundary = async operation => {
    const record = { scheduled: 0, executed: 0, cancelled: 0, executionMs: 0,
      pendingAtMicrotasks: 0, pendingAtFirstSentinel: 0, pendingAtSentinel: 0, tailScheduled: 0, tailExecuted: 0 };
    scope = record;
    const result = operation();
    await flushMicrotasks();
    record.pendingAtMicrotasks = pending.size;
    for (let pass = 0; pass < sentinelPasses; pass++) {
      await new Promise(resolve => immediate(resolve));
      if (pass === 0) record.pendingAtFirstSentinel = pending.size;
      if (pass + 1 < sentinelPasses) await flushMicrotasks();
    }
    record.pendingAtSentinel = pending.size;
    assert.equal(pending.size, 0, 'Sentinel preceded an engine callback');
    const scheduled = record.scheduled, executed = record.executed;
    await flushMicrotasks(128);
    await new Promise(resolve => immediate(resolve));
    record.tailScheduled = record.scheduled - scheduled;
    record.tailExecuted = record.executed - executed;
    scope = null;
    assert.equal(record.tailScheduled + record.tailExecuted, 0, '64-checkpoint bound insufficient');
    assert.equal(record.scheduled, record.executed + record.cancelled);
    if (version === 'old') assert(record.executed > 0 && record.pendingAtMicrotasks > 0);
    else assert.equal(record.scheduled, 0, 'New engine scheduled setImmediate');
    return { result, record };
  };
  const saveBoundary = (mode, records, index) => {
    if (index < 0) return;
    callbackTimings[mode].push(round(records.reduce((sum, record) => sum + record.executionMs, 0)));
    ordering[mode].push(Object.fromEntries(['scheduled', 'executed', 'cancelled', 'pendingAtMicrotasks',
      'pendingAtFirstSentinel', 'pendingAtSentinel', 'tailScheduled', 'tailExecuted'].map(key => [key, records.reduce((sum, record) => sum + record[key], 0)])));
  };
  for (let index = -measurementWarmup; index < sampleCount; index++) {
    globalThis.gc();
    const props = createProps();
    await new Promise(resolve => immediate(resolve));
    const mounted = await observeBoundary(() => engine.nodeFromJSONSchema(props));
    const root = mounted.result;
    saveBoundary('mount', [mounted.record], index);
    const updates = [];
    for (const interaction of fixture.interactions) {
      const observed = await observeBoundary(() => write(root, interaction));
      updates.push(observed.record);
      if (updates.length === 1) saveBoundary('update-first', updates, index);
    }
    api.assertValue(root, fixture);
    saveBoundary('update', updates, index);
    const repeated = await observeBoundary(() => write(root, later(fixture.interactions[0])));
    saveBoundary('update-later', [repeated.record], index);
    if (axis) {
      const axisRoot = (await observeBoundary(() => engine.nodeFromJSONSchema(createProps()))).result;
      const first = await observeBoundary(() => write(axisRoot, { path: '/kind', value: 'kind_4' }));
      const second = await observeBoundary(() => write(axisRoot, { path: '/kind', value: 'kind_0' }));
      const last = await observeBoundary(() => write(axisRoot, { path: '/kind', value: 'kind_4' }));
      saveBoundary('axis-first', [first.record], index);
      saveBoundary('axis-update', [first.record, second.record], index);
      saveBoundary('axis-later', [last.record], index);
    }
  }
  scheduler.scheduleMacrotaskSafe = originalSchedule;
  scheduler.cancelMacrotaskSafe = originalCancel;
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), measurementHead, 'HEAD changed during measurement');
  assert.equal(pending.size, 0);
  assert.equal(process.getActiveResourcesInfo().filter(name => ['Timeout', 'Immediate', 'MessagePort', 'PROCESSWRAP'].includes(name)).length, 0);
  const summary = { fixture: fixtureName, validation, run, version, interactionCount: fixture.interactions.length,
    environment: { head: measurementHead, node: process.version, v8: process.versions.v8, cpu: os.cpus()[0].model,
      platform: process.platform, arch: process.arch, ajv: api.req('ajv/package.json').version,
      started, officialEnded, ended: new Date().toISOString(), pid: process.pid },
    warmup: measurementWarmup, sampleCount, sentinelPasses, explicitGc: true, externalSubscribers: 0, onChange: 'noop',
    endpointTailStatistic: 'median of same-call sentinelEndToEndMs - microtaskMs; before C/M correction',
    endpointTailMs: Object.fromEntries(Object.entries(timings).map(([mode, rows]) => [mode,
      endpointDifference95c01(rows.map(row => row[1]), rows.map(row => row[0]))])),
    officialEngineInstrumentation: false, boundaryWrapperInstalledAfterOfficialSamples: true,
    boundary: '@winglet/common-utils/scheduler CJS scheduleMacrotaskSafe (cancel bookkeeping at same boundary)',
    schedulerModule: path.relative(repo, api.req.resolve('@winglet/common-utils/scheduler')),
    sourceSha256: hash(original), adaptedSourceSha256: hash(source), toolSha256: hash(fs.readFileSync(fileURLToPath(import.meta.url))),
    bundleEvidence: api.bundleEvidence, releaseSources: Object.fromEntries([...api.virtualSources].map(([name, text]) => [name, hash(text)])),
    serviceExits, checks, ordering: Object.fromEntries(Object.entries(ordering).map(([mode, rows]) => [mode,
      Object.fromEntries(Object.keys(rows[0]).map(key => [key, metric(rows.map(row => row[key]))]))])),
    timingColumns: ['microtaskMs', 'sentinelEndToEndMs'], emptyColumns: ['microtaskMs', 'sentinelEndToEndMs'],
    callbackColumns: 'executionMs; separate diagnostic stage; harness callbacks bypass wrapper',
    negativeClipping: false };
  const stem = `verdict-95c01-${fixtureName}-${validation}-r${run}-${version}`;
  console.log(JSON.stringify({ stem, timings: { ...timings,
    ...Object.fromEntries(Object.entries(callbackTimings).map(([mode, values]) => [`${mode}-callback`, values])) }, summary }));
}
