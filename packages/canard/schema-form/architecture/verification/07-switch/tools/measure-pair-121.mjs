// Loaded by measure-verdict-121.mjs --pair (and --single for measure-core-pair-126.mjs); clocks, GC anchors and the
// post-GC discard come from that worker.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const hash = value => createHash('sha256').update(value).digest('hex');
const round = value => Number(value.toFixed(6));
const canonical = value => JSON.stringify(value, (_key, item) => item && !Array.isArray(item) && typeof item === 'object'
  ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
/** Rows that start with a mount's first write; the optional no-GC lane re-records exactly these. */
const FIRST_WRITE_MODES = ['update-first', 'axis-first'];
/** Scheduler-boundary counters that (ga) requires to stay zero for the current engine. */
const BOUNDARY_KEYS = ['scheduled', 'executed', 'cancelled', 'pendingAtMicrotasks', 'pendingAtSentinel', 'tailScheduled', 'tailExecuted'];

/**
 * Wrap the engine's one macrotask boundary and return an observer shaped like `measure` that counts its use.
 * The CJS bundles keep `@winglet/common-utils/scheduler` external, so wrapping the shared exports reaches them.
 * @param req - Package-scoped require that the bundles also use
 * @param clocks - The caller's microtask flush, sentinel pass count and setImmediate
 * @returns Observer `(operation) => { result, record }` with `restore()` that unwraps the scheduler
 */
const boundaryObserver = (req, { flushMicrotasks, sentinelPasses, immediate }) => {
  const scheduler = req('@winglet/common-utils/scheduler');
  const originalSchedule = scheduler.scheduleMacrotaskSafe, originalCancel = scheduler.cancelMacrotaskSafe;
  const pending = new Map();
  let scope = null;
  scheduler.scheduleMacrotaskSafe = (callback, ...args) => {
    const owner = scope;
    assert(owner, 'Engine scheduled outside the active operation');
    owner.scheduled++;
    const token = originalSchedule(function (...values) {
      owner.executed++;
      try { return callback.apply(this, values); } finally { pending.delete(token); }
    }, ...args);
    pending.set(token, owner);
    return token;
  };
  scheduler.cancelMacrotaskSafe = token => {
    const owner = pending.get(token);
    if (owner) { owner.cancelled++; pending.delete(token); }
    return originalCancel(token);
  };
  const observe = async operation => {
    const record = Object.fromEntries(BOUNDARY_KEYS.map(key => [key, 0]));
    scope = record;
    const result = operation();
    await flushMicrotasks();
    record.pendingAtMicrotasks = pending.size;
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
  observe.restore = () => {
    scheduler.scheduleMacrotaskSafe = originalSchedule;
    scheduler.cancelMacrotaskSafe = originalCancel;
    assert.equal(pending.size, 0, 'Boundary pass left an engine callback pending');
  };
  return observe;
};

/**
 * Resolve a stage to its two bundle names; AA is HEAD against its trailing-comment copy.
 * @param stage - `AA` or `<base>:<candidate>` bundle names under the scratch bundle directory
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
 * Derive the canonical later-update input, retaining authored branch reversals.
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
 * Measure two bundles of one fixture in one process, alternating which goes first per sample.
 * Per-sample forced GC governs every verdict column; the optional no-GC lane only adds record columns.
 * With `single`, the process loads only that side's bundle and, after the official samples, repeats the
 * forced-GC sequence once under a scheduler-boundary wrapper so the caller can check (ga) per process.
 * @param options - Stage, fixture, validation, run, bundle directory, sample counts, the caller's clocks and the
 *   optional `single` side (`base` or `candidate`)
 * @returns Stem, per-version timings `[microtaskMs, sentinelEndToEndMs, pairedEmptyTailMs]`, empty controls,
 *   boundary ordering per verdict mode and value-digest counts per mode (single mode only) and a summary
 */
export async function measurePair121(options) {
  const { stage, fixtureName, validation, run, bundles, warmup, sampleCount, noGcFirst, repo, pkg, output, clocks, toolSha256, single } = options;
  const { measure, discardPostGcPair, deadline, clock } = clocks;
  assert(single === undefined || ['base', 'candidate'].includes(single), `Single side: ${single}`);
  assert(/^(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20|40)|if-then)$/.test(fixtureName));
  assert(['off', 'on'].includes(validation) && Number.isInteger(run) && run >= 1 && run <= 9);
  assert.equal(typeof globalThis.gc, 'function');
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
  const names = pairNames(stage);
  const manifest = JSON.parse(fs.readFileSync(path.join(bundles, 'c-bundles.json'), 'utf8'));
  const roles = ['base', 'candidate'];
  const versions = single ? [single] : roles;
  const texts = names.map((name, index) => versions.includes(roles[index]) ? fs.readFileSync(path.join(bundles, `c-${name}.cjs`), 'utf8') : null);
  for (let index = 0; index < 2; index++) {
    if (texts[index] === null) continue;
    const entry = manifest.find(item => item.variant === names[index]);
    assert(entry && entry.revision === head && entry.sha256 === hash(texts[index]), `c-${names[index]} is not the built HEAD bundle`);
  }
  if (stage === 'AA' && !single) {
    const suffix = texts[1].slice(texts[0].length);
    assert(texts[1].startsWith(texts[0]) && /^\/\/[^\n]*\n$/.test(suffix), 'A/A copy must differ only by one trailing comment line');
  }
  const req = createRequire(path.join(pkg, 'package.json'));
  const load = text => { const module = { exports: {} }; new Function('require', 'module', 'exports', text)(req, module, module.exports); return module.exports; };
  const engines = Object.fromEntries(versions.map(version => [version, load(texts[roles.indexOf(version)])]));
  let fixture = engines[versions[0]].equivalentFixtures.find(item => item.name === fixtureName);
  if (!fixture && fixtureName === 'if-then') {
    const definition = JSON.parse(fs.readFileSync(path.join(output, 'profile-119-session/if-then.json'), 'utf8'));
    fixture = { name: fixtureName, workspace: definition.schema, interactions: definition.interactions };
  }
  assert(fixture, fixtureName);
  const axis = /^oneOf-/.test(fixtureName) && validation === 'off';
  const modes = ['mount', 'update', 'update-first', 'update-later', ...(axis ? ['axis-update', 'axis-first', 'axis-later'] : [])];
  const recordModes = noGcFirst ? FIRST_WRITE_MODES.filter(mode => modes.includes(mode)).map(mode => `${mode}-nogc`) : [];
  const timings = Object.fromEntries(versions.map(version => [version,
    Object.fromEntries([...modes, ...recordModes].map(mode => [mode, []]))]));
  const checks = Object.fromEntries(versions.map(version => [version, {}]));
  const empty = { before: [], after: [] };
  const noop = () => {};
  const laterInput = later(fixture);
  const props = () => ({ jsonSchema: structuredClone(fixture.workspace), validationMode: validation === 'on' ? 1 : 0,
    onChange: noop, ...(validation === 'on' ? validatorServices(req) : {}) });
  const sum = records => records.reduce((total, record) => total.map((value, index) => round(value + record.timing[index])), [0, 0, 0]);
  const ordering = Object.fromEntries(versions.map(version => [version, Object.fromEntries(modes.map(mode => [mode, []]))]));
  const save = (version, mode, records, root, index) => {
    if (index < 0) return;
    if (observe !== measure) {
      ordering[version][mode].push(Object.fromEntries(BOUNDARY_KEYS.map(key => [key, records.reduce((total, record) => total + record.record[key], 0)])));
      return;
    }
    timings[version][mode].push(sum(records));
    const digest = hash(canonical(typeof root.getValue === 'function' ? root.getValue() : root.value));
    checks[version][mode] ??= {};
    checks[version][mode][digest] = (checks[version][mode][digest] ?? 0) + 1;
  };

  let observe = measure;
  /** One authored history and the fixed branch axis; `gc` false records only the first-write columns. */
  const sequence = async (version, index, gc) => {
    if (gc) globalThis.gc();
    const prepared = props();
    await new Promise(resolve => setImmediate(resolve));
    if (gc) await discardPostGcPair();
    const keep = mode => gc ? mode : FIRST_WRITE_MODES.includes(mode) ? `${mode}-nogc` : null;
    const record = (mode, records, root) => { const column = keep(mode); if (column) save(version, column, records, root, index); };
    assert(clock() < deadline, 'Worker reached its self-ending seven-minute bound');
    const mounted = await observe(() => engines[version].nodeFromJSONSchema(prepared));
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
    const axisRoot = (await observe(() => engines[version].nodeFromJSONSchema(preparedAxis))).result;
    const first = await observe(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_4' }));
    record('axis-first', [first], axisRoot);
    const second = await observe(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_0' }));
    record('axis-update', [first, second], axisRoot);
    record('axis-later', [await observe(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_4' }))], axisRoot);
  };
  const controls = async label => {
    for (let index = -warmup; index < sampleCount; index++) {
      globalThis.gc();
      await new Promise(resolve => setImmediate(resolve));
      await discardPostGcPair();
      const observed = await measure(noop);
      if (index >= 0) empty[label].push(observed.timing);
    }
  };
  const started = new Date().toISOString();
  await controls('before');
  for (const gc of noGcFirst ? [true, false] : [true]) {
    for (let index = -warmup; index < sampleCount; index++) {
      const order = (index + run - 1) % 2 === 0 ? versions : versions.toReversed();
      for (const version of order) await sequence(version, index, gc);
    }
  }
  await controls('after');
  if (single) {
    observe = boundaryObserver(req, clocks);
    for (let index = -warmup; index < sampleCount; index++) await sequence(single, index, true);
    observe.restore();
  } else for (const mode of Object.keys(checks.base))
    assert.deepEqual(checks.candidate[mode], checks.base[mode], `${fixtureName}/${mode} value mismatch`);
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), head, 'HEAD changed during measurement');
  assert.equal(process.getActiveResourcesInfo().filter(name => ['Timeout', 'Immediate', 'MessagePort', 'PROCESSWRAP'].includes(name)).length, 0);
  const summary = { stage, names, fixture: fixtureName, validation, run, interactionCount: fixture.interactions.length,
    environment: { head, node: process.version, v8: process.versions.v8, cpu: os.cpus()[0].model,
      platform: process.platform, arch: process.arch, started, ended: new Date().toISOString(), pid: process.pid },
    warmup, sampleCount, explicitGc: true, postGcDiscardedPairs: 1, onChange: 'noop',
    sampleOrder: 'alternates per sample: (sampleIndex + run - 1) even => base first',
    bundleSha256: Object.fromEntries(versions.map(version => [version, hash(texts[roles.indexOf(version)])])),
    sameCompiledSource: single ? null : texts[0] === texts[1], single: single ?? null, bundlesLoaded: versions.length,
    verdictColumns: modes, recordColumns: recordModes,
    recordColumnMethod: recordModes.length ? 'second full pass after the GC pass: same sequence and pairing, no forced gc or post-GC discard; only first writes after mount are kept' : null,
    timingColumns: ['microtaskMs', 'sentinelEndToEndMs', 'pairedEmptyTailMs'], toolSha256,
    boundaryAudit: single ? 'second forced-GC pass after the official samples under the @winglet/common-utils/scheduler wrapper; ordering per verdict mode'
      : 'not repeated in pair mode; the single-version workers own the (ga) boundary check', negativeClipping: false };
  const boundary = single ? Object.fromEntries(modes.map(mode => [mode, Object.fromEntries(BOUNDARY_KEYS.map(key => {
    const sorted = ordering[single][mode].map(row => row[key]).toSorted((a, b) => a - b);
    return [key, { median: sorted[Math.ceil(sorted.length * .5) - 1], p99: sorted[Math.ceil(sorted.length * .99) - 1], samples: sorted.length }];
  }))])) : undefined;
  return { stem: `pair-121-${stage.replace(':', '-')}-${fixtureName}-${validation}-r${run}${single ? '-' + single : ''}`, timings, empty, ordering: boundary,
    checks: single ? checks[single] : undefined, summary };
}
