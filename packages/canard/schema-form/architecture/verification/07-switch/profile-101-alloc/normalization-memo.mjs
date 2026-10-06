// CLI-only adapter of the committed allocation tool and 95C-01 sentinel regime.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { performance, PerformanceObserver } from 'node:perf_hooks';

const script = fileURLToPath(import.meta.url);
const artifacts = path.dirname(script);
const directory = path.dirname(artifacts);
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const head = 'e39503af55963026769bc3d49ca4dec79feb8090';
const require = createRequire(path.join(repo, 'package.json'));
const started = Date.now();
const env = { ...process.env, NODE_ENV: 'production', GIT_OPTIONAL_LOCKS: '0', NODE_PATH: path.join(repo, 'node_modules') };

/** Replace a unique committed adapter anchor before any measurement. */
function once(source, before, after) {
  assert.equal(source.split(before).length, 2, before.slice(0, 120));
  return source.replace(before, after);
}

/** Save only bounded measurement files within the requested directory. */
function save(name, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000, name);
  fs.writeFileSync(path.join(artifacts, 'normalization-memo-' + name + '.json'), text);
}

let source = fs.readFileSync(path.join(artifacts, 'measure.mjs'), 'utf8');
source = source.slice(0, source.lastIndexOf('const [command, ...args] = process.argv.slice(2);'));
source = once(source, '\nconst script = fileURLToPath(import.meta.url);', `\nconst script = ${JSON.stringify(path.join(artifacts, 'measure.mjs'))};`);
source = once(source, "const head = '619798ddc6d6c70f27e1a7058421b94a4a6713b1';", `const head = ${JSON.stringify(head)};`);
source = once(source, "const bundles = path.join(artifacts, 'bundles');", `const bundles = ${JSON.stringify(bundles)};`);
source = once(source, 'allocationFolding: true, includeCollected: true, objects, bytes, blueprintObjects, blueprintBytes, unknown,',
  'allocationFolding: true, includeCollected: true, objects, bytes, blueprintObjects, blueprintBytes, unknown, nodes: sample.root.runtime.blueprint.nodes.length, execArgv: process.execArgv,');
source += '\nexport { api, allocation };\n';
globalThis.__allocTransform = (file, content, variant) => variant === 'working' ? content :
  execFileSync('git', ['--no-optional-locks', 'show', head + ':' + path.relative(repo, file)], { cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000 });
const { api, allocation } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

/** Run one fresh, sequential child that ends naturally and records its exit. */
function child(args) {
  const begin = Date.now();
  const result = spawnSync(process.execPath, args, { cwd: repo, env, encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert(Date.now() - begin < 480_000);
  console.log(result.stdout.trim());
}

/** Capture the end clock inside the check sentinel after 64 Promise checkpoints. */
async function measured(operation) {
  const begin = performance.now();
  const root = operation();
  for (let index = 0; index < 64; index++) await Promise.resolve();
  const end = await new Promise(resolve => setImmediate(() => resolve(performance.now())));
  return { root, begin, end, ms: end - begin };
}

/** Median uses the official nearest-rank convention. */
function median(values) {
  return values.toSorted((left, right) => left - right)[Math.ceil(values.length / 2) - 1];
}

/** Prepare later writes outside all clocks using the fixture's authored history. */
async function prepare(engine, fixture, variant) {
  const root = api.create(engine, fixture, variant);
  await measured(() => {});
  for (const interaction of fixture.interactions) {
    root.find(interaction.path).setValue(interaction.value);
    await measured(() => {});
  }
  return root;
}

/** Measure actual mounts or later writes with alternating engine order in a fresh process. */
async function paired(variant, name, mode, run, regime) {
  const engines = { head: require(path.join(bundles, 'head.cjs')), variant: require(path.join(bundles, variant + '.cjs')) };
  const fixture = api.fixtureFor(engines.head, name);
  const roots = mode === 'later' ? { head: await prepare(engines.head, fixture, 'head'),
    variant: await prepare(engines.variant, fixture, variant) } : {};
  const input = fixture.interactions[0].value;
  const values = typeof input === 'string' ? [input + '-later', input + '-again'] :
    typeof input === 'number' ? [input + 1, input] : [!input, input];
  const targets = mode === 'later' ? { head: roots.head.find(fixture.interactions[0].path),
    variant: roots.variant.find(fixture.interactions[0].path) } : {};
  const timings = { head: [], variant: [] }, deltas = [], last = {}, calls = { head: 0, variant: 0 };
  const before = [], after = [], windows = [], gc = [];
  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) gc.push({ start: entry.startTime, ms: entry.duration, kind: entry.detail.kind });
  });
  observer.observe({ entryTypes: ['gc'] });
  for (let index = 0; index < 101; index++) before.push((await measured(() => {})).ms);
  for (let index = -20; index < 101; index++) {
    assert(Date.now() - started < 420_000, 'Split before eight minutes');
    const order = (index + run - 1) % 2 === 0 ? ['head', 'variant'] : ['variant', 'head'];
    const pair = {};
    for (const version of order) {
      const schema = mode === 'mount' ? structuredClone(fixture.workspace) : undefined;
      if (regime === 'forced') { globalThis.gc(); await new Promise(resolve => setImmediate(resolve)); }
      const sample = await measured(() => mode === 'mount' ?
        api.create(engines[version], fixture, version === 'head' ? 'head' : variant, schema) :
        targets[version].setValue(values[(index + 20) % 2]));
      calls[version]++;
      last[version] = mode === 'mount' ? sample.root : roots[version];
      pair[version] = sample.ms;
      if (index >= 0) { timings[version].push(sample.ms); windows.push({ version, index, begin: sample.begin, end: sample.end }); }
    }
    if (index >= 0) deltas.push(pair.head - pair.variant);
  }
  for (let index = 0; index < 101; index++) after.push((await measured(() => {})).ms);
  await new Promise(resolve => setImmediate(resolve));
  observer.disconnect();
  assert.equal(calls.head, 121); assert.equal(calls.variant, 121);
  const observation = { head: api.observe(last.head), variant: api.observe(last.variant) };
  assert.deepEqual(observation.head, observation.variant);
  for (const root of Object.values(last)) assert.equal(root.value, root.value);
  const empty = median([...before, ...after]);
  const headMs = median(timings.head) - empty, workingMs = median(timings.variant) - empty;
  const row = { head, variant, name, mode, run, regime, warmup: 20, samples: 101, calls,
    headMs, workingMs, gainMs: headMs - workingMs, pairedMedianMs: median(deltas), empty,
    timingsMs: timings, pairedDeltasMs: deltas, emptyTimingsMs: { before, after }, windows, gc,
    observation, environment: api.environment(), elapsedMs: Date.now() - started };
  save(`${variant}-${name}-${mode}-${regime}-r${run}`, row);
  console.log(JSON.stringify({ variant, name, mode, run, regime, headMs, workingMs,
    gainMs: row.gainMs, pairedMedianMs: row.pairedMedianMs, seconds: row.elapsedMs / 1000 }));
}

/** Ordinary deterministic bootstrap describes median variability, without an independence claim. */
function medianError(values) {
  let state = 101;
  const medians = [];
  for (let trial = 0; trial < 1999; trial++) {
    const sample = [];
    for (let index = 0; index < values.length; index++) {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      sample.push(values[(state >>> 0) % values.length]);
    }
    medians.push(median(sample));
  }
  medians.sort((left, right) => left - right);
  const center = median(values);
  return Math.max(Math.abs(medians[9] - center), Math.abs(medians[1989] - center));
}

/** Compare all recorded columns with their same-fixture no-op controls before adoption. */
function summarize() {
  const operations = [['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'],
    ['sample-0', 'mount'], ['sample-0', 'later'], ['nested-d5-f4', 'later']];
  const rows = [];
  for (const [name, mode] of operations) for (const regime of ['forced', 'steady']) {
    const read = (variant, run) => JSON.parse(fs.readFileSync(path.join(artifacts,
      `normalization-memo-${variant}-${name}-${mode}-${regime}-r${run}.json`), 'utf8'));
    const controls = [1, 2, 3].map(run => read('control', run));
    const working = [1, 2, 3].map(run => read('working', run));
    const noOpNoiseMs = Math.max(...controls.flatMap(row => [Math.abs(row.gainMs), Math.abs(row.pairedMedianMs)]));
    const measurements = [...controls, ...working].map(row => {
      assert.equal(row.head, head); assert.equal(row.warmup, 20); assert.equal(row.samples, 101);
      assert.deepEqual(row.observation.head, row.observation.variant);
      assert.equal(row.calls.head, 121); assert.equal(row.calls.variant, 121);
      const residuals = [...row.emptyTimingsMs.before, ...row.emptyTimingsMs.after]
        .map(value => Math.abs(value - row.empty)).toSorted((a, b) => a - b);
      const error = medianError(row.timingsMs.head) + medianError(row.timingsMs.variant);
      const noiseMs = Math.max(.001, noOpNoiseMs, residuals[Math.ceil(residuals.length * .95) - 1] + error);
      const deltas = row.pairedDeltasMs.toSorted((a, b) => a - b);
      const gcInside = row.gc.filter(event => row.windows.some(window =>
        event.start >= window.begin && event.start < window.end));
      if (regime === 'forced') assert.equal(gcInside.length, 0, 'Forced GC must remain outside clocks');
      return { variant: row.variant, run: row.run, headMs: row.headMs, workingMs: row.workingMs,
        gainMs: row.gainMs, pairedMedianMs: row.pairedMedianMs, noiseMs, medianErrorMs: error,
        pairedMedianInterval: [deltas[40], deltas[60]], gcInside: gcInside.length };
    });
    const candidates = measurements.filter(row => row.variant === 'working');
    const aboveNoise = candidates.every(row => row.gainMs > row.noiseMs && row.pairedMedianInterval[0] > 0);
    const regressionAboveNoise = candidates.every(row => row.gainMs < -row.noiseMs && row.pairedMedianInterval[1] < 0);
    rows.push({ name, mode, regime, headMs: median(working.map(row => row.headMs)),
      workingMs: median(working.map(row => row.workingMs)), gainMs: median(working.map(row => row.gainMs)),
      pairedMedianMs: median(working.map(row => row.pairedMedianMs)), noOpNoiseMs,
      maxNoiseMs: Math.max(...candidates.map(row => row.noiseMs)), aboveNoise, regressionAboveNoise,
      singleRunRegressions: candidates.filter(row => row.gainMs < -row.noiseMs).map(row => row.run), measurements });
  }
  const allocations = [];
  for (const run of [1, 2]) for (const variant of ['head', 'working']) {
    const row = JSON.parse(fs.readFileSync(path.join(artifacts, `allocation-${variant}-nested-d5-f4-r${run}.json`), 'utf8'));
    const effective = row.rows.filter(item => item.owner?.file.includes('/blueprint/utils/effectiveSchema/'));
    const objects = effective.reduce((sum, item) => sum + item.objects, 0);
    allocations.push({ variant, run, noInlining: run === 2, nodes: row.nodes, bundleObjects: objects,
      bundleObjectsPerNode: objects / row.nodes, bundleBytes: effective.reduce((sum, item) => sum + item.bytes, 0),
      allObjects: row.objects, blueprintObjects: row.blueprintObjects, blueprintObjectsPerNode: row.blueprintObjects / row.nodes });
  }
  const adopted = rows.some(row => row.mode === 'mount' && row.aboveNoise) && rows.every(row => !row.regressionAboveNoise);
  const result = { head, adopted, method: '95C-01 sentinel; 20 warmups + 101 alternating pairs x 3 fresh sequential processes per column',
    noiseRule: 'max(0.001ms, same fixture/regime no-op abs median bound or paired median, empty residual p95 + ordinary bootstrap 99% median error sum); improvement/regression requires all 3 runs and signed paired median intervals',
    rows, allocations, sources: ['src/core/blueprint/utils/analyze/buildNodes.ts',
      'src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts'].map(file => ({ file,
      sha256: createHash('sha256').update(fs.readFileSync(path.join(pkg, file))).digest('hex') })) };
  save('verdict', result);
  console.log(JSON.stringify({ adopted, rows: rows.map(({ measurements, ...row }) => row), allocations }));
}

const [command, ...args] = process.argv.slice(2);
if (command === '--build') {
  for (const variant of args) child([script, '--build-worker', variant]);
} else if (command === '--build-worker') {
  assert(['head', 'control', 'working'].includes(args[0]));
  const record = await api.buildAsync(args[0]);
  save('build-' + args[0], { ...record, head, bundles });
  console.log(JSON.stringify(record));
} else if (command === '--objects' || command === '--objects-noinline') {
  child(['--expose-gc', '--sampling-heap-profiler-suppress-randomness',
    ...(command === '--objects-noinline' ? ['--no-turbo-inlining'] : []),
    script, '--objects-worker', args[0], args[1] ?? '1']);
} else if (command === '--objects-worker') {
  await allocation(args[0], 'nested-d5-f4', Number(args[1]));
} else if (command === '--paired-worker') {
  await paired(args[0], args[1], args[2], Number(args[3]), args[4]);
} else if (command === '--pairs') {
  const [variant, name, mode, regime] = args;
  for (let run = 1; run <= 3; run++) child(['--expose-gc', script, '--paired-worker', variant, name, mode, String(run), regime]);
} else if (command === '--summarize') {
  summarize();
} else throw new Error('Use --build, --objects, --pairs or their workers');
assert(Date.now() - started < 480_000);
save('process-' + [command, ...args].join('_'), { args: process.argv.slice(2), execArgv: process.execArgv, elapsedMs: Date.now() - started,
  status: 0, signal: null, naturalExit: true, driverSha256: createHash('sha256').update(fs.readFileSync(script)).digest('hex') });
