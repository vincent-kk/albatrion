// Loaded by measure-verdict-121.mjs --pair; clocks, GC anchors and the post-GC discard come from that worker.
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
 * @param options - Stage, fixture, validation, run, bundle directory, sample counts and the caller's clocks
 * @returns Stem, per-version timings `[microtaskMs, sentinelEndToEndMs, pairedEmptyTailMs]` and a summary
 */
export async function measurePair121(options) {
  const { stage, fixtureName, validation, run, bundles, warmup, sampleCount, noGcFirst, repo, pkg, output, clocks, toolSha256 } = options;
  const { measure, discardPostGcPair, deadline, clock } = clocks;
  assert(/^(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20|40)|if-then)$/.test(fixtureName));
  assert(['off', 'on'].includes(validation) && Number.isInteger(run) && run >= 1 && run <= 9);
  assert.equal(typeof globalThis.gc, 'function');
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
  const names = pairNames(stage);
  const manifest = JSON.parse(fs.readFileSync(path.join(bundles, 'c-bundles.json'), 'utf8'));
  const texts = names.map(name => fs.readFileSync(path.join(bundles, `c-${name}.cjs`), 'utf8'));
  for (let index = 0; index < 2; index++) {
    const entry = manifest.find(item => item.variant === names[index]);
    assert(entry && entry.revision === head && entry.sha256 === hash(texts[index]), `c-${names[index]} is not the built HEAD bundle`);
  }
  if (stage === 'AA') {
    const suffix = texts[1].slice(texts[0].length);
    assert(texts[1].startsWith(texts[0]) && /^\/\/[^\n]*\n$/.test(suffix), 'A/A copy must differ only by one trailing comment line');
  }
  const versions = ['base', 'candidate'];
  const req = createRequire(path.join(pkg, 'package.json'));
  const load = text => { const module = { exports: {} }; new Function('require', 'module', 'exports', text)(req, module, module.exports); return module.exports; };
  const engines = { base: load(texts[0]), candidate: load(texts[1]) };
  let fixture = engines.base.equivalentFixtures.find(item => item.name === fixtureName);
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
  const save = (version, mode, records, root, index) => {
    if (index < 0) return;
    timings[version][mode].push(sum(records));
    const digest = hash(canonical(typeof root.getValue === 'function' ? root.getValue() : root.value));
    checks[version][mode] ??= {};
    checks[version][mode][digest] = (checks[version][mode][digest] ?? 0) + 1;
  };

  /** One authored history and the fixed branch axis; `gc` false records only the first-write columns. */
  const sequence = async (version, index, gc) => {
    if (gc) globalThis.gc();
    const prepared = props();
    await new Promise(resolve => setImmediate(resolve));
    if (gc) await discardPostGcPair();
    const keep = mode => gc ? mode : FIRST_WRITE_MODES.includes(mode) ? `${mode}-nogc` : null;
    const record = (mode, records, root) => { const column = keep(mode); if (column) save(version, column, records, root, index); };
    assert(clock() < deadline, 'Worker reached its self-ending seven-minute bound');
    const mounted = await measure(() => engines[version].nodeFromJSONSchema(prepared));
    const root = mounted.result;
    record('mount', [mounted], root);
    const updates = [];
    for (const interaction of fixture.interactions) {
      const observed = await measure(() => apply(root, interaction));
      updates.push(observed);
      if (updates.length === 1) record('update-first', [observed], root);
    }
    record('update', updates, root);
    record('update-later', [await measure(() => apply(root, laterInput))], root);
    if (!axis) return;
    const preparedAxis = props();
    const axisRoot = (await measure(() => engines[version].nodeFromJSONSchema(preparedAxis))).result;
    const first = await measure(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_4' }));
    record('axis-first', [first], axisRoot);
    const second = await measure(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_0' }));
    record('axis-update', [first, second], axisRoot);
    record('axis-later', [await measure(() => apply(axisRoot, { kind: 'set', path: '/kind', value: 'kind_4' }))], axisRoot);
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
  for (const mode of Object.keys(checks.base))
    assert.deepEqual(checks.candidate[mode], checks.base[mode], `${fixtureName}/${mode} value mismatch`);
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), head, 'HEAD changed during measurement');
  assert.equal(process.getActiveResourcesInfo().filter(name => ['Timeout', 'Immediate', 'MessagePort', 'PROCESSWRAP'].includes(name)).length, 0);
  const summary = { stage, names, fixture: fixtureName, validation, run, interactionCount: fixture.interactions.length,
    environment: { head, node: process.version, v8: process.versions.v8, cpu: os.cpus()[0].model,
      platform: process.platform, arch: process.arch, started, ended: new Date().toISOString(), pid: process.pid },
    warmup, sampleCount, explicitGc: true, postGcDiscardedPairs: 1, onChange: 'noop',
    sampleOrder: 'alternates per sample: (sampleIndex + run - 1) even => base first',
    bundleSha256: { base: hash(texts[0]), candidate: hash(texts[1]) }, sameCompiledSource: texts[0] === texts[1],
    verdictColumns: modes, recordColumns: recordModes,
    recordColumnMethod: recordModes.length ? 'second full pass after the GC pass: same sequence and pairing, no forced gc or post-GC discard; only first writes after mount are kept' : null,
    timingColumns: ['microtaskMs', 'sentinelEndToEndMs', 'pairedEmptyTailMs'], toolSha256,
    boundaryAudit: 'not repeated in pair mode; the single-version workers own the (ga) boundary check', negativeClipping: false };
  return { stem: `pair-121-${stage.replace(':', '-')}-${fixtureName}-${validation}-r${run}`, timings, empty, summary };
}
