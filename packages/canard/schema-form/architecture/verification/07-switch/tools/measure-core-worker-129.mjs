/*
 * 사용법(stage-07 루트, /opt/homebrew/bin/node --expose-gc):
 *   node --expose-gc <이 파일> --self-test
 *   node --expose-gc <이 파일> base AA if-then off --bundles=<디렉터리> [--warmup=20] [--samples=41] [--no-gc] [--base-revision=<sha>]
 * measure-core-pair-129.mjs가 블록마다 띄우는 측정 프로세스입니다. c-<이름>.cjs 하나만 올리고, 그 번들을 c-bundles.json의
 * SHA-256과 대조합니다. 현재 HEAD와는 비교하지 않고, --base-revision을 주면 매니페스트의 빌드 기준 리비전과 비교합니다.
 * 공식 표본은 95C-01 절차(시계 밖 강제 gc, gc 뒤 첫 빈 호출 쌍 버림, 짝 빈 호출 꼬리)를 따릅니다. --no-gc는 강제 gc 없는
 * 두 번째 전체 순서를 모든 열의 기록 열(<열>-nogc)로 더합니다. 공식 표본 뒤의 경계 회차는 공유 스케줄러와 전역
 * setImmediate·setTimeout·queueMicrotask 호출을 셉니다. --self-test는 no-op과 queueMicrotask 행이 (가)를 통과하고
 * 5 ms setImmediate 행이 시간·경계 양쪽에서 실패하기를 요구합니다. stdout은 JSON 한 줄입니다.
 */
// CLI worker spawned by measure-core-pair-129.mjs. The harness schedules only through the setImmediate captured at load,
// so the global wrappers installed for the boundary pass see engine calls alone.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { gaValidation129 } from './ga-validation-129.mjs';
import { rowSeed129 } from './row-seed-129.mjs';

const tool = fileURLToPath(import.meta.url);
const output = path.resolve(path.dirname(tool), '..');
const pkg = path.resolve(output, '../../..');
const repo = path.resolve(pkg, '../../..');
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
const immediate = globalThis.setImmediate;
const clock = () => performance.now();
const flag = (name, fallback) => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const warmup = Number(flag('warmup', 20)), sampleCount = Number(flag('samples', 41));
assert(Number.isInteger(warmup) && warmup >= 0 && Number.isInteger(sampleCount) && sampleCount > 0);
const deadline = clock() + 420_000;
const positional = process.argv.slice(2).filter(value => !value.startsWith('--'));
// Validation's deferred error events schedule one further check-queue generation.
const sentinelPasses = positional[3] === 'on' ? 2 : 1;
const hash = value => createHash('sha256').update(value).digest('hex');
const round = value => Number(value.toFixed(6));
const canonical = value => JSON.stringify(value, (_key, item) => item && !Array.isArray(item) && typeof item === 'object'
  ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
const metric = values => {
  const sorted = values.toSorted((a, b) => a - b);
  return { median: sorted[Math.ceil(sorted.length * .5) - 1], p99: sorted[Math.ceil(sorted.length * .99) - 1], samples: sorted.length };
};
/** Boundary counters per observed call; gaValidation129 requires the macrotask ones to stay zero. */
const BOUNDARY_KEYS = ['scheduled', 'executed', 'cancelled', 'pendingAtMicrotasks', 'pendingAtSentinel', 'tailScheduled', 'tailExecuted',
  'globalImmediate', 'globalTimeout', 'schedulerMacrotask', 'microtasksQueued', 'microtasksPendingAtMicrotasks'];

/** Drain microtask generations produced by a call. */
async function flushMicrotasks(turns = 64) {
  for (let turn = 0; turn < turns; turn++) await Promise.resolve();
}

/** Time a call through the same-queue sentinel, recording the earlier microtask boundary too. */
async function measureCall(operation) {
  assert(clock() < deadline, 'Worker reached its self-ending seven-minute bound');
  const start = clock();
  const result = operation();
  await flushMicrotasks();
  const micro = clock() - start;
  let end;
  for (let pass = 0; pass < sentinelPasses; pass++) {
    end = await new Promise(resolve => immediate(() => resolve(clock())));
    if (pass + 1 < sentinelPasses) await flushMicrotasks();
  }
  return { result, timing: [round(micro), round(end - start)] };
}

/** Pair each operation with an immediately preceding empty call using identical sentinels. */
async function measure(operation) {
  const empty = await measureCall(() => {});
  const observed = await measureCall(operation);
  observed.timing.push(round(empty.timing[1] - empty.timing[0]));
  return observed;
}

/** Discard one empty pair after forced GC/check anchor, outside the next sample's clocks. */
async function discardPostGcPair() {
  await measure(() => {});
}

/**
 * Install counting wrappers on the shared scheduler module and on global setImmediate, setTimeout and queueMicrotask,
 * and return an observer shaped like `measure` that attributes every call made inside one operation's window.
 * Calls outside any window pass through and are only tallied in `observe.outside`.
 * @param req - Package-scoped require that the bundles also use, for `@winglet/common-utils/scheduler`
 * @returns Observer `(operation) => Promise<{ result, record }>` with `restore()`, which reinstates every original and
 *   throws when a counted macrotask is still pending
 */
function boundaryObserver(req) {
  const scheduler = req('@winglet/common-utils/scheduler');
  const originals = { setImmediate: globalThis.setImmediate, setTimeout: globalThis.setTimeout, clearImmediate: globalThis.clearImmediate,
    clearTimeout: globalThis.clearTimeout, queueMicrotask: globalThis.queueMicrotask,
    schedule: scheduler.scheduleMacrotaskSafe, cancel: scheduler.cancelMacrotaskSafe };
  const pending = new Map(), outside = { macrotasks: 0, microtasks: 0 };
  let scope = null;
  const macrotask = (counter, original) => (callback, ...args) => {
    const active = scope;
    if (!active) { outside.macrotasks++; return original(callback, ...args); }
    active.record.scheduled++; active.record[counter]++;
    const handle = original((...values) => {
      active.record.executed++;
      pending.delete(handle);
      return callback(...values);
    }, ...args);
    pending.set(handle, active);
    return handle;
  };
  const cancel = original => handle => {
    const active = pending.get(handle);
    if (active) { active.record.cancelled++; pending.delete(handle); }
    return original(handle);
  };
  globalThis.setImmediate = macrotask('globalImmediate', originals.setImmediate);
  globalThis.setTimeout = macrotask('globalTimeout', originals.setTimeout);
  globalThis.clearImmediate = cancel(originals.clearImmediate);
  globalThis.clearTimeout = cancel(originals.clearTimeout);
  scheduler.scheduleMacrotaskSafe = macrotask('schedulerMacrotask', originals.schedule);
  scheduler.cancelMacrotaskSafe = cancel(originals.cancel);
  globalThis.queueMicrotask = callback => {
    const active = scope;
    if (!active) { outside.microtasks++; return originals.queueMicrotask(callback); }
    active.record.microtasksQueued++; active.liveMicrotasks++;
    return originals.queueMicrotask(() => { active.liveMicrotasks--; callback(); });
  };
  const observe = async operation => {
    const active = { record: Object.fromEntries(BOUNDARY_KEYS.map(key => [key, 0])), liveMicrotasks: 0 };
    const { record } = active;
    scope = active;
    const result = operation();
    await flushMicrotasks();
    record.pendingAtMicrotasks = pending.size;
    record.microtasksPendingAtMicrotasks = active.liveMicrotasks;
    for (let pass = 0; pass < sentinelPasses; pass++) {
      await new Promise(resolve => immediate(resolve));
      if (pass + 1 < sentinelPasses) await flushMicrotasks();
    }
    record.pendingAtSentinel = pending.size;
    const scheduled = record.scheduled, executed = record.executed;
    await flushMicrotasks(128);
    await new Promise(resolve => immediate(resolve));
    record.tailScheduled = record.scheduled - scheduled;
    record.tailExecuted = record.executed - executed;
    scope = null;
    return { result, record };
  };
  observe.outside = outside;
  observe.restore = () => {
    Object.assign(globalThis, { setImmediate: originals.setImmediate, setTimeout: originals.setTimeout,
      clearImmediate: originals.clearImmediate, clearTimeout: originals.clearTimeout, queueMicrotask: originals.queueMicrotask });
    scheduler.scheduleMacrotaskSafe = originals.schedule;
    scheduler.cancelMacrotaskSafe = originals.cancel;
    assert.equal(pending.size, 0, 'Boundary pass left an engine macrotask pending');
  };
  return observe;
}

/** Summarize boundary rows per mode as `{ key: { median, p99, samples } }`. */
const boundarySummary = rows => Object.fromEntries(Object.entries(rows).map(([mode, list]) =>
  [mode, Object.fromEntries(BOUNDARY_KEYS.map(key => [key, metric(list.map(row => row[key]))]))]));

/**
 * Resolve a stage to its two bundle names; AA is c-head against its trailing-comment copy c-headx.
 * @param stage - `AA` or `<base>:<candidate>` bundle names
 * @returns Base and candidate names, in that order
 */
const pairNames = stage => {
  if (stage === 'AA') return ['head', 'headx'];
  const names = stage.split(':');
  assert(names.length === 2 && names.every(name => /^[0-9A-Za-z]+$/.test(name)) && names[0] !== names[1], `Pair stage: ${stage}`);
  return names;
};

/**
 * Apply a benchmark interaction through the node API used by the public handle.
 * @param root - Mounted engine root
 * @param interaction - set, push or remove interaction from the fixture
 * @returns Nothing; the engine settles synchronously and schedules its own callbacks
 */
const apply = (root, interaction) => {
  const node = root.find(interaction.path);
  assert(node, interaction.path);
  if (interaction.kind === 'remove') node.remove(interaction.index);
  else if (interaction.kind === 'push') node.push(interaction.value);
  else node.setValue(interaction.value);
};

/**
 * Derive the canonical later-update input, retaining authored branch reversals (measure-pair-121's rule).
 * @param fixture - Fixture whose first interaction is repeated
 * @returns The later interaction
 */
const later = fixture => {
  const interaction = fixture.interactions[0];
  if (/oneOf|if-then/.test(fixture.name) || (interaction.kind && interaction.kind !== 'set')) return { ...interaction };
  if (Array.isArray(interaction.value)) return { ...interaction,
    value: interaction.value.map((item, index) => index === 0 ? { ...item, name: `${item.name}-later` } : item) };
  return { ...interaction, value: typeof interaction.value === 'string' ? `${interaction.value}-later`
    : typeof interaction.value === 'number' ? interaction.value + 1 : !interaction.value };
};

/**
 * Build the uninstrumented AJV adapter used by the canonical diagnosis harness.
 * @param req - Package-scoped require
 * @returns Validator services for validation ON rows
 */
const validatorServices = req => {
  const Ajv = req('ajv/dist/2020').default;
  const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
  const errors = validate => data => validate(data) ? null
    : validate.errors.map(error => ({ ...error, dataPath: error.instancePath }));
  const validator = {
    compile(schema) { return errors(ajv.compile(schema)); },
    compileGuard(schema, pointer) {
      if (!ajv.getSchema('diagnostic-root')) ajv.addSchema(schema, 'diagnostic-root');
      const validate = ajv.compile({ $ref: `diagnostic-root${pointer.startsWith('#') ? pointer : '#' + pointer}` });
      return data => validate(data);
    },
  };
  return { validator, validatorFactory: validator.compile };
};

/**
 * Run the (ga) self-test: official-shaped samples without wrappers, then a boundary pass with them, per probe row.
 * @returns Rows `{ row, expectedPass, ...gaResult, boundary }`; throws when a probe does not behave as expected
 */
async function selfTest() {
  const busy = () => { const end = clock() + 5; while (clock() < end) { /* Five milliseconds of check-queue work. */ } };
  const probes = [['no-op', () => {}, true], ['queueMicrotask', () => queueMicrotask(() => {}), true],
    ['setImmediate-5ms', () => setImmediate(busy), false]];
  const req = createRequire(path.join(pkg, 'package.json'));
  const rows = [];
  for (const [label, operation, expectedPass] of probes) {
    const timings = [], controls = [], boundary = [];
    for (let index = -2; index < 5; index++) {
      globalThis.gc();
      await new Promise(resolve => immediate(resolve));
      await discardPostGcPair();
      const control = await measure(() => {}), sample = await measure(operation);
      if (index >= 0) { controls.push(control.timing); timings.push(sample.timing); }
    }
    const observe = boundaryObserver(req);
    for (let index = 0; index < 5; index++) boundary.push((await observe(operation)).record);
    observe.restore();
    const ordering = boundarySummary({ probe: boundary });
    const worker = { summary: { verdictColumns: ['probe'], interactionCount: 1 }, timings: { probe: timings },
      empty: { before: controls, after: [] }, ordering };
    const ga = gaValidation129(worker, rowSeed129(`self-test/${label}`)).probe;
    assert.equal(ga.passed, expectedPass, `${label}: (ga) ${expectedPass ? 'must pass' : 'must fail'}`);
    if (!expectedPass) {
      assert.equal(ga.withinNoise, false, `${label}: timing half must detect five milliseconds`);
      assert.equal(ga.zeroEngineMacrotasks, false, `${label}: boundary half must count the global setImmediate`);
      assert.equal(ordering.probe.globalImmediate.p99, 1);
    }
    if (label === 'queueMicrotask') assert.equal(ordering.probe.microtasksQueued.p99, 1, 'queueMicrotask must be counted');
    rows.push({ row: label, expectedPass, ...ga, boundary: Object.fromEntries(Object.entries(ordering.probe).map(([key, value]) => [key, value.p99])) });
  }
  return rows;
}

/**
 * Measure one bundle of one fixture: empty controls, the forced-GC pass, the optional no-GC pass, empty controls again,
 * then the boundary pass under the counting wrappers.
 * @param side - `base` or `candidate`
 * @param stage - `AA` or `<base>:<candidate>`
 * @param fixtureName - Equivalent fixture name or `if-then`
 * @param validation - `off` or `on`
 * @returns Worker report: timings per column, empty controls, boundary summary per verdict mode, value digests, summary
 */
async function measureOne(side, stage, fixtureName, validation) {
  assert(['base', 'candidate'].includes(side), `Side: ${side}`);
  assert(/^(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20|40)|if-then)$/.test(fixtureName));
  assert(['off', 'on'].includes(validation));
  const bundles = flag('bundles');
  assert(bundles, '--bundles=<directory> is required');
  const name = pairNames(stage)[side === 'base' ? 0 : 1];
  const manifestText = fs.readFileSync(path.join(bundles, 'c-bundles.json'), 'utf8'), manifest = JSON.parse(manifestText);
  const entry = (Array.isArray(manifest) ? manifest : manifest.bundles).find(item => item.variant === name);
  const file = path.join(bundles, `c-${name}.cjs`), text = fs.readFileSync(file, 'utf8');
  assert(entry && entry.sha256 === hash(text), `c-${name}.cjs does not match the SHA-256 in its build manifest`);
  if (flag('base-revision')) assert.equal(entry.revision, flag('base-revision'), `c-${name}.cjs was built from another base revision`);
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
  const req = createRequire(path.join(pkg, 'package.json'));
  const module = { exports: {} };
  new Function('require', 'module', 'exports', text)(req, module, module.exports);
  const engine = module.exports;
  let fixture = engine.equivalentFixtures.find(item => item.name === fixtureName);
  if (!fixture && fixtureName === 'if-then') {
    const definition = JSON.parse(fs.readFileSync(path.join(output, 'profile-119-session/if-then.json'), 'utf8'));
    fixture = { name: fixtureName, workspace: definition.schema, interactions: definition.interactions };
  }
  assert(fixture, fixtureName);
  const axis = /^oneOf-/.test(fixtureName) && validation === 'off';
  const modes = ['mount', 'update', 'update-first', 'update-later', ...(axis ? ['axis-update', 'axis-first', 'axis-later'] : [])];
  const noGc = process.argv.includes('--no-gc');
  const recordModes = noGc ? modes.map(mode => `${mode}-nogc`) : [];
  const timings = Object.fromEntries([...modes, ...recordModes].map(mode => [mode, []]));
  const checks = {}, empty = { before: [], after: [] }, ordering = Object.fromEntries(modes.map(mode => [mode, []]));
  const noop = () => {};
  const laterInput = later(fixture);
  const props = () => ({ jsonSchema: structuredClone(fixture.workspace), validationMode: validation === 'on' ? 1 : 0,
    onChange: noop, ...(validation === 'on' ? validatorServices(req) : {}) });
  const sum = records => records.reduce((total, record) => total.map((value, index) => round(value + record.timing[index])), [0, 0, 0]);
  let observe = measure;
  const save = (column, records, root, index) => {
    if (index < 0) return;
    if (observe !== measure) {
      ordering[column].push(Object.fromEntries(BOUNDARY_KEYS.map(key => [key, records.reduce((total, item) => total + item.record[key], 0)])));
      return;
    }
    timings[column].push(sum(records));
    const digest = hash(canonical(typeof root.getValue === 'function' ? root.getValue() : root.value));
    checks[column] ??= {};
    checks[column][digest] = (checks[column][digest] ?? 0) + 1;
  };
  /** One authored history and the fixed branch axis; `gc` false writes every column to its `-nogc` record column. */
  const sequence = async (index, gc) => {
    if (gc) globalThis.gc();
    const prepared = props();
    await new Promise(resolve => immediate(resolve));
    if (gc) await discardPostGcPair();
    const record = (mode, records, root) => save(gc ? mode : `${mode}-nogc`, records, root, index);
    assert(clock() < deadline, 'Worker reached its self-ending seven-minute bound');
    const mounted = await observe(() => engine.nodeFromJSONSchema(prepared));
    const root = mounted.result;
    record('mount', [mounted], root);
    const updates = [];
    for (const interaction of fixture.interactions) {
      const observed = await observe(() => apply(root, interaction));
      updates.push(observed);
      if (updates.length === 1) record('update-first', [observed], root);
    }
    record('update', updates, root);
    record('update-later', [await observe(() => apply(root, laterInput))], root);
    if (!axis) return;
    const preparedAxis = props();
    const axisRoot = (await observe(() => engine.nodeFromJSONSchema(preparedAxis))).result;
    const first = await observe(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_4' }));
    record('axis-first', [first], axisRoot);
    const second = await observe(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_0' }));
    record('axis-update', [first, second], axisRoot);
    record('axis-later', [await observe(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_4' }))], axisRoot);
  };
  const controls = async label => {
    for (let index = -warmup; index < sampleCount; index++) {
      globalThis.gc();
      await new Promise(resolve => immediate(resolve));
      await discardPostGcPair();
      const observed = await measure(noop);
      if (index >= 0) empty[label].push(observed.timing);
    }
  };
  const started = new Date().toISOString();
  await controls('before');
  for (const gc of noGc ? [true, false] : [true])
    for (let index = -warmup; index < sampleCount; index++) await sequence(index, gc);
  await controls('after');
  observe = boundaryObserver(req);
  for (let index = -warmup; index < sampleCount; index++) await sequence(index, true);
  observe.restore();
  assert.equal(process.getActiveResourcesInfo().filter(item => ['Timeout', 'Immediate', 'MessagePort', 'PROCESSWRAP'].includes(item)).length, 0);
  const summary = { format: 'core-worker-129', side, name, stage, fixture: fixtureName, validation, interactionCount: fixture.interactions.length,
    warmup, sampleCount, sentinelPasses, explicitGc: true, postGcDiscardedPairs: 1, onChange: 'noop', bundlesLoaded: 1,
    bundle: { file, sha256: hash(text), bytes: Buffer.byteLength(text), revision: entry.revision, manifestSha256: hash(manifestText) },
    verdictColumns: modes, recordColumns: recordModes,
    recordColumnMethod: noGc ? 'second full pass after the forced-GC pass: same sequence, no forced gc or post-GC discard; every column kept' : null,
    timingColumns: ['microtaskMs', 'sentinelEndToEndMs', 'pairedEmptyTailMs'],
    boundaryAudit: 'forced-GC pass after the official samples under wrappers of @winglet/common-utils/scheduler and global setImmediate, setTimeout and queueMicrotask',
    boundaryOutsideWindow: observe.outside, schedulerImport: text.includes('@winglet/common-utils/scheduler'),
    environment: { head, node: process.version, v8: process.versions.v8, cpu: os.cpus()[0].model, platform: process.platform,
      arch: process.arch, started, ended: new Date().toISOString(), pid: process.pid },
    toolSha256: hash(fs.readFileSync(tool)), negativeClipping: false };
  return { timings, empty, ordering: boundarySummary(ordering), checks, summary };
}

assert.equal(typeof globalThis.gc, 'function', '--expose-gc is required');
if (process.argv.includes('--self-test')) {
  const rows = await selfTest();
  console.log(JSON.stringify({ selfTest: rows, samplesPerRow: 5 }));
  console.log('SELF_TEST_129_OK: no-op PASS; queueMicrotask PASS (counted); setImmediate-5ms FAIL (timing and global boundary)');
} else {
  const [side, stage, fixtureName, validation] = positional;
  console.log(JSON.stringify(await measureOne(side, stage, fixtureName, validation)));
}
