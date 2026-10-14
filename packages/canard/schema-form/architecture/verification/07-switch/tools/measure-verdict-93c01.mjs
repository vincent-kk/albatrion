// Loaded by run-verdict-93c01.mjs; one process measures one fixture, version, lane and run.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import childProcess from 'node:child_process';
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
const [lane, fixtureName, validation, runText, version] = process.argv.slice(2);
assert(['core', 'react', 'react-phases', 'core-axis'].includes(lane));
assert(['old', 'new'].includes(version));
assert(['off', 'on'].includes(validation));
const run = Number(runText), warmup = 12, sampleCount = 101;
assert([1, 2, 3].includes(run));
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(),
  'ccfecf1b43ce1c648246722e2174db81ec17487f');
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(typeof globalThis.gc, 'function');
const render = lane.startsWith('react');
const traced = lane !== 'react';
const originalPath = path.join(pkg, 'bench/branchless-phase-diagnosis.mjs');
const original = fs.readFileSync(originalPath, 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');

/** Apply checked substitutions to the in-memory diagnostic, retaining its span classification. */
function replaceOnce(source, before, after) {
  assert.equal(source.split(before).length, 2, `Diagnostic adapter anchor: ${before}`);
  return source.replace(before, after);
}
let source = replaceOnce(original, "import { writeMeasurement } from './measurement-output.mjs';",
  `import { writeMeasurement } from ${JSON.stringify(pathToFileURL(path.join(pkg, 'bench/measurement-output.mjs')).href)};`);
source = replaceOnce(source, "const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');",
  `const pkg = ${JSON.stringify(pkg)};`);
source = replaceOnce(source, "const engines = { old: await bundle('old'), new: await bundle('new') };",
  `const engines = { ${version}: await bundle(${JSON.stringify(version)}) };`);
source = replaceOnce(source, 'engines.new.equivalentFixtures.filter', `engines.${version}.equivalentFixtures.filter`);
source = replaceOnce(source, "'src/__legacy__/core/nodeFromJSONSchema.ts'", "'release-core'");
source = replaceOnce(source,
  "return relative.startsWith('core') && fs.existsSync(local) ? { path: local } : { path: found, namespace: 'release-binding' };",
  "return { path: found, namespace: 'release-binding' };");
source = replaceOnce(source, "builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));",
  `builder.onResolve({ filter: /\\/release-core$/ }, () => oldResolve('core/nodeFromJSONSchema'));
      builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));`);
source = replaceOnce(source, 'instrument(args.path, virtualSources.get(args.path), trace)',
  "instrument(path.join(pkg, 'src/__legacy__', args.path.slice('packages/canard/schema-form/src/'.length)), virtualSources.get(args.path), trace)");
source = replaceOnce(source, '(flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20))',
  '(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20|40))');
source = replaceOnce(source, "builder.onLoad({ filter: /\\/schema-form\\/src\\/.*\\.tsx?$/ }, args => {",
  `builder.onLoad({ filter: /\\/benchmark-form\\/fixtures\\/equivalent\\/branches\\.ts$/ }, args => ({
    contents: fs.readFileSync(args.path, 'utf8').replace('[5, 10, 20].map', '[5, 10, 20, 40].map'), loader: 'ts'
  }));\n      builder.onLoad({ filter: /\\/schema-form\\/src\\/.*\\.tsx?$/ }, args => {`);
source = replaceOnce(source, 'collecting = trace; return performance.now();',
  'collecting = arguments[0] === true || trace; return performance.now();');
source = replaceOnce(source, 'export { engines, fixtures, begin, finish, drain, React, flushSync, createRoot };',
  `function snapshot(start) {
    const elapsed = performance.now() - start;
    const active = Object.values(totals).reduce((a, b) => a + b, 0);
    return {elapsed, active, phases:{...totals,wait:elapsed-active},calls:{...calls},details:structuredClone(details)};
  }
  export { engines, fixtures, begin, finish, snapshot, drain, React, flushSync, createRoot,
    validatorServices, timed, valueOf, assertValue, bfReq, req, hooks, phases };`);
process.argv.push('--probe-import');
if (!traced) process.argv.push('--plain');
if (render) process.argv.push('--render', '--production');
process.env.PHASE_FIXTURES = fixtureName;
const services = [];
const originalSpawn = childProcess.spawn;
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
  assert.equal(code, 0, `esbuild must exit naturally: ${signal}`);
}
assert.equal(api.fixtures.length, 1);
const fixture = api.fixtures[0];
if (lane === 'core-axis') {
  assert(/^oneOf-(5|10|20|40)$/.test(fixtureName));
  fixture.interactions[0].value = 'kind_4';
}
const modes = ['mount', 'update', 'update-first', 'update-later'];
const samples = Object.fromEntries(modes.map(mode => [mode, []]));
const checks = Object.fromEntries(modes.map(mode => [mode, {}]));
const started = new Date().toISOString();
const metric = values => {
  const ordered = values.toSorted((a, b) => a - b);
  return { median: ordered[Math.ceil(ordered.length * .5) - 1] ?? 0,
    p99: ordered[Math.ceil(ordered.length * .99) - 1] ?? 0, samples: values.length };
};
const frequency = values => {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
};
const canonical = value => JSON.stringify(value, (_key, item) => item && !Array.isArray(item) && typeof item === 'object'
  ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);

/** Capture semantic output outside timed spans; cross-version comparison lives in the runner. */
function capture(mode, root) {
  const result = { value: api.valueOf(root) };
  if (render) result.paths = [...document.querySelectorAll('[data-path]:not([data-deferred])')]
    .map(element => element.getAttribute('data-path')).sort();
  const digest = hash(canonical(result));
  checks[mode][digest] = (checks[mode][digest] ?? 0) + 1;
}

/** Complete a write with the original microtask and timer drain, retaining asynchronous spans. */
async function write(root, interaction) {
  const start = performance.now();
  api.timed('other', 'harness:find-and-write', () => {
    const node = root.find(interaction.path);
    assert(node, `Missing ${fixtureName} ${interaction.path}`);
    if (render) api.flushSync(() => node.setValue(interaction.value));
    else node.setValue(interaction.value);
  });
  const synchronous = performance.now() - start;
  await api.drain();
  await new Promise(resolve => setTimeout(resolve, 0));
  return synchronous;
}

/** Repeat the first write with an actual value change while keeping branch transitions identical. */
function laterInteraction(interaction) {
  if (/oneOf|if-then/.test(fixtureName)) return { ...interaction };
  const value = typeof interaction.value === 'string' ? `${interaction.value}-later` :
    typeof interaction.value === 'number' ? interaction.value + 1 : !interaction.value;
  return { ...interaction, value };
}

for (let index = -warmup; index < sampleCount; index++) {
  globalThis.gc();
  const schema = structuredClone(version === 'old' ? fixture.legacy : fixture.workspace);
  const services = validation === 'on' ? api.validatorServices() : {};
  const props = { jsonSchema: schema, validationMode: validation === 'on' ? 1 : 0, onChange() {}, ...services };
  if (render && version === 'new') props.validatorFactory = services.validator;
  let root, cleanup = () => {}, commits = [];
  let start, synchronous;
  if (render) {
    const ref = api.React.createRef();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const reactRoot = api.createRoot(container);
    start = api.begin();
    api.flushSync(() => reactRoot.render(api.React.createElement(api.React.Profiler, {
      id: fixtureName, onRender: (_id, _phase, duration) => commits.push(duration),
    }, api.React.createElement(api.engines[version].Form, { ...props, ref }))));
    synchronous = performance.now() - start;
    for (let tick = 0; tick < 12 && !ref.current?.findNode(''); tick++) await new Promise(resolve => setTimeout(resolve, 0));
    await new Promise(resolve => setTimeout(resolve, 0));
    root = ref.current?.findNode('');
    assert(root, 'React handle never became ready');
    cleanup = () => { api.flushSync(() => reactRoot.unmount()); container.remove(); };
  } else {
    start = api.begin();
    root = api.engines[version].nodeFromJSONSchema(props);
    synchronous = performance.now() - start;
    await api.drain();
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  const mount = api.finish(start);
  Object.assign(mount, { synchronous, profiler: commits.reduce((a, b) => a + b, 0), commits: commits.length });
  if (index >= 0) { samples.mount.push(mount); capture('mount', root); }
  commits = [];
  start = api.begin();
  synchronous = 0;
  for (let action = 0; action < fixture.interactions.length; action++) {
    synchronous += await write(root, fixture.interactions[action]);
    if (action === 0 && index >= 0) {
      const first = api.snapshot(start);
      Object.assign(first, { synchronous, profiler: commits.reduce((a, b) => a + b, 0), commits: commits.length });
      samples['update-first'].push(first);
      capture('update-first', root);
    }
  }
  if (render) await new Promise(resolve => setTimeout(resolve, 0));
  const update = api.finish(start);
  Object.assign(update, { synchronous, profiler: commits.reduce((a, b) => a + b, 0), commits: commits.length });
  api.assertValue(root, fixture);
  if (index >= 0) { samples.update.push(update); capture('update', root); }
  commits = [];
  start = api.begin();
  synchronous = await write(root, laterInteraction(fixture.interactions[0]));
  if (render) await new Promise(resolve => setTimeout(resolve, 0));
  const later = api.finish(start);
  Object.assign(later, { synchronous, profiler: commits.reduce((a, b) => a + b, 0), commits: commits.length });
  if (index >= 0) { samples['update-later'].push(later); capture('update-later', root); }
  cleanup();
  if (index >= 0 && (index + 1) % 25 === 0)
    console.log(`${lane} ${fixtureName} ${validation} r${run} ${version}: ${index + 1}/${sampleCount}`);
}
if (render) window.close();

/** Calibrate empty spans with the measured site's frequency under one enclosing span. */
function emptySpanCost(raw) {
  const representative = raw[Math.floor(raw.length / 2)];
  let schedule = Object.entries(representative.details).flatMap(([site, detail]) => {
    const phase = api.hooks.find(hook => hook.site === site)?.phase ??
      (site.startsWith('AJV:compile') ? 'validation-registration' : site.startsWith('AJV:') ? 'validation-run' : 'other');
    return Array.from({ length: detail.calls }, () => [phase, site]);
  });
  if (!schedule.length) schedule = [['other', 'calibration:empty']];
  const repeat = Math.max(1, Math.ceil(2000 / schedule.length));
  const number = schedule.length * repeat;
  const values = [], activeValues = [], baselineValues = [];
  const noop = () => {};
  function block(instrumented) {
    const start = api.begin(true);
    const frame = globalThis.__phaseEnter('other', 'calibration:outer');
    for (let cycle = 0; cycle < repeat; cycle++) for (const [phase, site] of schedule) {
      if (instrumented) {
        const child = globalThis.__phaseEnter(phase, site);
        try { noop(); } finally { globalThis.__phaseExit(child); }
      } else noop();
    }
    globalThis.__phaseExit(frame);
    return api.finish(start);
  }
  for (let index = -warmup; index < sampleCount; index++) {
    const instrumentedFirst = index % 2 === 0;
    const first = block(instrumentedFirst), second = block(!instrumentedFirst);
    const tracedBlock = instrumentedFirst ? first : second;
    const bareBlock = instrumentedFirst ? second : first;
    if (index >= 0) {
      values.push((tracedBlock.active - bareBlock.active) / number);
      activeValues.push(tracedBlock.active / number);
      baselineValues.push(bareBlock.active / number);
    }
  }
  return { perCallMs: metric(values), emptyActivePerCallMs: metric(activeValues),
    baselinePerCallMs: metric(baselineValues), callsPerBlock: number,
    siteKinds: schedule.length, model: '빈 함수 + 동일 빈 span 훅, 실제 site 빈도, 외곽 span 안의 총 계측 비용 차이',
    timingSamples: values };
}

const rows = [], timings = {};
for (const mode of modes) {
  const raw = samples[mode];
  const calibration = emptySpanCost(raw);
  const calls = sample => Object.values(sample.calls).reduce((a, b) => a + b, 0);
  const renderCommit = sample => (sample.phases['react-render'] ?? 0) + (sample.phases['react-commit'] ?? 0);
  const ajv = sample => Object.entries(sample.details).reduce((sum, [site, detail]) =>
    sum + (site.startsWith('AJV:') ? detail.ms : 0), 0);
  const timeRows = raw.map(sample => ({ elapsed: sample.elapsed, active: sample.active,
    synchronous: sample.synchronous, profiler: sample.profiler,
    phases: Object.fromEntries(api.phases.map(phase => [phase, sample.phases[phase] ?? 0])),
    ajv: ajv(sample), renderCommit: renderCommit(sample),
    correctedActive: sample.active - calls(sample) * Math.max(0, calibration.perCallMs.median),
    correctedRenderCommit: renderCommit(sample) - calls(sample) * Math.max(0, calibration.perCallMs.median),
  }));
  timings[mode] = timeRows;
  timings[`${mode}-empty-span`] = calibration.timingSamples;
  delete calibration.timingSamples;
  const siteNames = [...new Set(raw.flatMap(sample => Object.keys(sample.details)))];
  rows.push({ mode, sampleCount, calibration,
    calls: metric(raw.map(calls)), callFrequency: frequency(raw.map(calls)),
    commits: metric(raw.map(sample => sample.commits)), commitFrequency: frequency(raw.map(sample => sample.commits)),
    phases: Object.fromEntries(api.phases.map(phase => [phase, {
      time: metric(raw.map(sample => sample.phases[phase] ?? 0)),
      calls: metric(raw.map(sample => sample.calls[phase] ?? 0)),
      callFrequency: frequency(raw.map(sample => sample.calls[phase] ?? 0)),
    }])),
    sites: Object.fromEntries(siteNames.map(site => [site, {
      time: metric(raw.map(sample => sample.details[site]?.ms ?? 0)),
      calls: metric(raw.map(sample => sample.details[site]?.calls ?? 0)),
    }])),
    metrics: Object.fromEntries(['elapsed', 'active', 'synchronous', 'profiler', 'ajv',
      'renderCommit', 'correctedActive', 'correctedRenderCommit'].map(key => [key, metric(timeRows.map(sample => sample[key]))])),
  });
}
const summary = { environment: { started, ended: new Date().toISOString(), node: process.version,
  v8: process.versions.v8, cpu: os.cpus()[0].model, platform: process.platform, arch: process.arch,
  react: api.bfReq('react/package.json').version, ajv: api.req('ajv/package.json').version,
  head: 'ccfecf1b43ce1c648246722e2174db81ec17487f', old: '@canard/schema-form@0.16.0',
  warmup, samples: sampleCount, lane, fixture: fixtureName, validation, run, version,
  productionProfiling: render, extraPhaseSpans: traced, explicitGc: true,
  originalDiagnosticSha256: hash(original), adaptedDiagnosticSha256: hash(source),
  oldSource: '0.16.0 태그의 코어와 바인딩 전체; 변경된 로컬 __legacy__를 사용하지 않음',
  interactionCount: fixture.interactions.length, axisFixedTransition: lane === 'core-axis' ? 'kind_0→kind_4→kind_0' : null,
}, checks, hooks: api.hooks, rows };
const stem = `verdict-93c01-${lane}-${fixtureName}-${validation}-r${run}-${version}`;
for (const [suffix, data] of [['timings', timings], ['summary', summary]]) {
  const text = JSON.stringify(data) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000, `Oversize ${stem}-${suffix}`);
  fs.writeFileSync(path.join(output, `${stem}-${suffix}.json`), text, { flag: 'wx' });
}
console.log(`완료 ${stem}`);
